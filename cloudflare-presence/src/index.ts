import { DurableObject } from 'cloudflare:workers';

export interface Env {
  PRESENCE_DO: DurableObjectNamespace<StaffPresenceDO>;
}

interface PresenceRecord {
  user_id: number;
  user_name: string;
  user_role: 'admin' | 'staff';
  last_seen: number;
  explicit_offline?: boolean;
}

const ONLINE_TTL_MS = 45_000;

export class StaffPresenceDO extends DurableObject<Env> {
  private presenceMap = new Map<number, PresenceRecord>();
  private loaded = false;

  private async ensureLoaded() {
    if (this.loaded) return;
    const stored = await this.ctx.storage.list<PresenceRecord>({ prefix: 'user:' });
    for (const [, record] of stored) {
      this.presenceMap.set(record.user_id, record);
    }
    this.loaded = true;
  }

  async fetch(request: Request): Promise<Response> {
    await this.ensureLoaded();
    const url = new URL(request.url);
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === '/heartbeat' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Partial<PresenceRecord>;
      const userId = Number(body.user_id);
      if (!userId) {
        return new Response(JSON.stringify({ success: false, error: 'user_id required' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const record: PresenceRecord = {
        user_id: userId,
        user_name: String(body.user_name || ''),
        user_role: body.user_role === 'admin' ? 'admin' : 'staff',
        last_seen: Date.now(),
        explicit_offline: false,
      };
      this.presenceMap.set(userId, record);
      await this.ctx.storage.put(`user:${userId}`, record);
      this.broadcastPresence();

      return new Response(JSON.stringify({ success: true, data: { ...record, is_online: true } }), {
        headers: corsHeaders,
      });
    }

    if (url.pathname === '/offline' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as { user_id?: number };
      const userId = Number(body.user_id);
      if (userId) {
        const existing = this.presenceMap.get(userId);
        const record: PresenceRecord = {
          user_id: userId,
          user_name: existing?.user_name || '',
          user_role: existing?.user_role || 'staff',
          last_seen: 0,
          explicit_offline: true,
        };
        this.presenceMap.set(userId, record);
        await this.ctx.storage.put(`user:${userId}`, record);
        this.broadcastPresence();
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (url.pathname === '/ws' && request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      server.send(JSON.stringify({ type: 'presence', presence: this.buildPresenceSnapshot() }));
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname === '/status' && request.method === 'GET') {
      return new Response(
        JSON.stringify({ success: true, source: 'cloudflare-durable-object', presence: this.buildPresenceSnapshot() }),
        { headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  private buildPresenceSnapshot() {
    const now = Date.now();
    const entries: Record<number, { is_online: boolean; last_seen: string | null }> = {};
    for (const [uid, rec] of this.presenceMap.entries()) {
      const isOnline = !rec.explicit_offline && rec.last_seen > 0 && now - rec.last_seen <= ONLINE_TTL_MS;
      entries[uid] = {
        is_online: isOnline,
        last_seen: rec.last_seen > 0 ? new Date(rec.last_seen).toISOString() : null,
      };
    }
    return entries;
  }

  private broadcastPresence() {
    const payload = JSON.stringify({ type: 'presence', presence: this.buildPresenceSnapshot() });
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {}
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.PRESENCE_DO.idFromName('burgundy-global-presence');
    const stub = env.PRESENCE_DO.get(id);
    return stub.fetch(request);
  },
};

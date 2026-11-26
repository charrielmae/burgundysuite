import { EventEmitter } from 'events';

interface PresenceEntry {
  user_id: number;
  user_name: string;
  user_role: 'admin' | 'staff';
  last_seen: number;
  explicit_offline?: boolean;
}

const ONLINE_TTL_MS = 30_000;
const localPresenceStore = new Map<number, PresenceEntry>();
export const presenceEvents = new EventEmitter();
presenceEvents.setMaxListeners(100);

function getDoBaseUrl(): string | null {
  const url = process.env.CLOUDFLARE_PRESENCE_DO_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

export async function recordHeartbeat(payload: {
  user_id: number;
  user_name?: string;
  user_role?: 'admin' | 'staff';
}): Promise<{ source: string; is_online: boolean }> {
  const userId = Number(payload.user_id);
  const doUrl = getDoBaseUrl();

  if (doUrl) {
    try {
      const res = await fetch(`${doUrl}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return { source: 'cloudflare-durable-object', is_online: true };
      }
    } catch {}
  }

  localPresenceStore.set(userId, {
    user_id: userId,
    user_name: String(payload.user_name || ''),
    user_role: payload.user_role === 'admin' ? 'admin' : 'staff',
    last_seen: Date.now(),
    explicit_offline: false,
  });

  presenceEvents.emit('change');
  return { source: 'cloudflare-durable-object-local', is_online: true };
}

export async function recordOffline(userId: number): Promise<void> {
  const doUrl = getDoBaseUrl();
  if (doUrl) {
    try {
      await fetch(`${doUrl}/offline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      presenceEvents.emit('change');
      return;
    } catch {}
  }

  const existing = localPresenceStore.get(userId);
  localPresenceStore.set(userId, {
    user_id: userId,
    user_name: existing?.user_name || '',
    user_role: existing?.user_role || 'staff',
    last_seen: 0,
    explicit_offline: true,
  });
  presenceEvents.emit('change');
}

export async function getPresenceStatus(): Promise<{
  source: string;
  presence: Record<number, { is_online: boolean; last_seen: string | null }>;
}> {
  const doUrl = getDoBaseUrl();
  if (doUrl) {
    try {
      const res = await fetch(`${doUrl}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.presence) {
          return { source: 'cloudflare-durable-object', presence: data.presence };
        }
      }
    } catch {}
  }

  const now = Date.now();
  const presence: Record<number, { is_online: boolean; last_seen: string | null }> = {};
  for (const [uid, rec] of localPresenceStore.entries()) {
    const isOnline = !rec.explicit_offline && rec.last_seen > 0 && now - rec.last_seen <= ONLINE_TTL_MS;
    presence[uid] = {
      is_online: isOnline,
      last_seen: rec.last_seen > 0 ? new Date(rec.last_seen).toISOString() : null,
    };
  }
  return { source: 'cloudflare-durable-object-local', presence };
}

export function usePresence() {
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let activeUserId: number | null = null;
  let unloadHandler: (() => void) | null = null;
  let visibilityHandler: (() => void) | null = null;

  const sendHeartbeat = async (user: { user_id: number; user_name: string; user_role: 'admin' | 'staff' }) => {
    if (!user?.user_id) return;
    try {
      await fetch('/api/presence/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          user_name: user.user_name,
          user_role: user.user_role,
        }),
      });
    } catch {}
  };

  const sendOffline = async (userId?: number | null) => {
    const id = userId ?? activeUserId;
    if (!id) return;
    try {
      await fetch('/api/presence/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id }),
      });
    } catch {}
  };

  const startPresence = async (user: { user_id: number; user_name: string; user_role: 'admin' | 'staff' }) => {
    if (!user?.user_id || typeof window === 'undefined') return;
    stopPresence(false);
    activeUserId = user.user_id;

    await sendHeartbeat(user);
    heartbeatTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat(user);
      }
    }, 10000);

    visibilityHandler = () => {
      if (document.visibilityState === 'visible' && activeUserId === user.user_id) {
        sendHeartbeat(user);
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    unloadHandler = () => {
      if (activeUserId && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ user_id: activeUserId })], {
          type: 'application/json',
        });
        navigator.sendBeacon('/api/presence/offline', blob);
      }
    };
    window.addEventListener('beforeunload', unloadHandler);
  };

  const stopPresence = (markOffline = true) => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    if (typeof document !== 'undefined' && visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }
    if (typeof window !== 'undefined' && unloadHandler) {
      window.removeEventListener('beforeunload', unloadHandler);
      unloadHandler = null;
    }
    if (markOffline && activeUserId) {
      sendOffline(activeUserId);
    }
    activeUserId = null;
  };

  return {
    startPresence,
    stopPresence,
    sendHeartbeat,
    sendOffline,
  };
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPendingSyncQueue, dbDelete } from '../services/db';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const checkPendingQueue = async () => {
    try {
      const queue = await getPendingSyncQueue();
      setPendingCount(queue.length);
    } catch (err) {
      console.warn('Queue check error:', err);
    }
  };

  useEffect(() => {
    checkPendingQueue();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkPendingQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      const queue = await getPendingSyncQueue();
      if (queue.length > 0) {
        // Process queued items (simulated or sent to backend /api/sync)
        for (const item of queue) {
          try {
            await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            }).catch(() => null);
            await dbDelete('sync_queue', item.id);
          } catch (e) {
            console.error('Sync item failed', e);
          }
        }
      }
      await checkPendingQueue();
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        setIsOnline, // allowed for manual dev simulation toggle
        pendingCount,
        isSyncing,
        lastSyncTime,
        triggerSync,
        refreshQueueCount: checkPendingQueue
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => useContext(NetworkContext);

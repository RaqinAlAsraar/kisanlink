import React from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { useLanguage } from '../../context/LanguageContext';

export default function NetworkBanner() {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useNetwork();
  const { t } = useLanguage();

  if (!isOnline) {
    return (
      <button
        onClick={triggerSync}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-sm transition-all hover:bg-amber-100"
        title="Operating Offline. Changes saved locally."
      >
        <CloudOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
        <span>{t('offlineSyncBanner')}</span>
        {pendingCount > 0 && (
          <span className="bg-amber-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {pendingCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={triggerSync}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-lime-light text-[#2d4000] border border-[#9fd70080] shadow-sm transition-all hover:bg-[#e4fab0]"
      title="Connected to network. Click to verify sync."
    >
      {isSyncing ? (
        <RefreshCw className="w-3.5 h-3.5 text-[#446158] animate-spin" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#3d5500]" />
      )}
      <span>{isSyncing ? "Syncing..." : t('syncedBanner')}</span>
      {pendingCount > 0 && (
        <span className="bg-[#446158] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
          {pendingCount}
        </span>
      )}
    </button>
  );
}

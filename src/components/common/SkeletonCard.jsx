import React from 'react';

/**
 * MandiCardSkeleton - Shimmer placeholder for mandi commodity price cards
 */
export function MandiCardSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx}
          className="bg-white border border-[#44615815] rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden"
        >
          {/* Top Row: Crop Icon & Delta Badge */}
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl skeleton-shimmer" />
            <div className="w-16 h-6 rounded-full skeleton-shimmer" />
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <div className="w-3/4 h-5 rounded-lg skeleton-shimmer" />
            <div className="w-1/2 h-3.5 rounded-lg skeleton-shimmer" />
          </div>

          {/* Price Bar */}
          <div className="pt-2 border-t border-[#44615810] flex items-end justify-between">
            <div className="space-y-1">
              <div className="w-16 h-3 rounded skeleton-shimmer" />
              <div className="w-24 h-7 rounded-lg skeleton-shimmer" />
            </div>
            <div className="w-9 h-9 rounded-full skeleton-shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * MarketplaceSkeleton - Shimmer placeholder for verified marketplace listings
 */
export function MarketplaceSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx}
          className="bg-white border border-[#44615818] rounded-3xl p-5 sm:p-6 shadow-soft space-y-4 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Seller & Crop Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl skeleton-shimmer shrink-0" />
              <div className="space-y-2">
                <div className="w-48 h-5 rounded-lg skeleton-shimmer" />
                <div className="w-32 h-3.5 rounded-lg skeleton-shimmer" />
              </div>
            </div>
            {/* Price Badge */}
            <div className="w-28 h-9 rounded-2xl skeleton-shimmer" />
          </div>

          {/* Metadata pill & Verified Hash placeholder */}
          <div className="flex items-center gap-2 pt-1">
            <div className="w-20 h-6 rounded-lg skeleton-shimmer" />
            <div className="w-24 h-6 rounded-lg skeleton-shimmer" />
            <div className="w-40 h-6 rounded-lg skeleton-shimmer hidden sm:block" />
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-[#44615810] flex items-center justify-between gap-3">
            <div className="w-36 h-4 rounded-lg skeleton-shimmer" />
            <div className="flex items-center gap-2">
              <div className="w-24 h-9 rounded-xl skeleton-shimmer" />
              <div className="w-28 h-9 rounded-xl skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * WeatherWidgetSkeleton - Shimmer placeholder for live agricultural weather
 */
export function WeatherWidgetSkeleton() {
  return (
    <div className="bg-[#272c1a] rounded-3xl p-6 text-white shadow-elevated relative overflow-hidden space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg skeleton-dark" />
          <div className="w-44 h-4 rounded-lg skeleton-dark" />
        </div>
        <div className="w-24 h-6 rounded-full skeleton-dark" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <div className="w-16 h-3 rounded skeleton-dark" />
            <div className="w-20 h-6 rounded-lg skeleton-dark" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * StorageCardSkeleton - Shimmer placeholder for cold storage cards
 */
export function StorageCardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx}
          className="bg-white border border-[#44615815] rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="w-full h-36 rounded-2xl skeleton-shimmer" />
          <div className="space-y-2">
            <div className="w-3/4 h-5 rounded-lg skeleton-shimmer" />
            <div className="w-1/2 h-3.5 rounded-lg skeleton-shimmer" />
          </div>
          <div className="pt-2 border-t border-[#44615810] flex justify-between items-center">
            <div className="w-20 h-6 rounded-lg skeleton-shimmer" />
            <div className="w-24 h-9 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

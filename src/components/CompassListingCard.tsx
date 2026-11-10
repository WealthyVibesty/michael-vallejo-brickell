import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar
} from 'lucide-react';
import { CuratedResidence, IntentOption } from '../data/brickellData';
import { ResilientImage } from './ResilientImage';

interface CompassListingCardProps {
  residence: CuratedResidence;
  intent: IntentOption;
  isSaved: boolean;
  isHighlighted?: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetail: (residence: CuratedResidence) => void;
  onHover?: (id: string | null) => void;
}

export const CompassListingCard: React.FC<CompassListingCardProps> = ({
  residence,
  intent,
  isSaved,
  isHighlighted = false,
  onToggleSave,
  onOpenDetail,
  onHover
}) => {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = residence.images;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(residence.id);
  };

  const primaryPrice =
    intent === 'Buy' ? residence.purchasePrice : residence.monthlyRent;
  const secondaryPrice =
    intent === 'Buy'
      ? `${residence.pricePerSf} · Or Lease ${residence.monthlyRent}`
      : `Buy for ${residence.purchasePrice} · ${residence.hoaTurnaround}`;

  return (
    <article
      onMouseEnter={() => onHover?.(residence.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onOpenDetail(residence)}
      className={`group bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between ${
        isHighlighted
          ? 'border-black ring-2 ring-black/10 shadow-xl'
          : 'border-neutral-200 hover:border-neutral-400 hover:shadow-lg'
      }`}
    >
      <div>
        {/* 4:3 Photo Carousel */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <ResilientImage
            src={photos[photoIdx]}
            alt={`${residence.address} — ${residence.towerName}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {/* Top Left Compass-Style Status Label */}
          <div className="absolute top-3.5 left-3.5 bg-black/85 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md">
            {residence.statusTag}
          </div>

          {/* Top Right Save Heart Button */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? 'Remove from saved listings' : 'Save listing'}
            className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Heart
              className={`w-5 h-5 ${
                isSaved ? 'fill-rose-600 text-rose-600' : 'text-black'
              }`}
            />
          </button>

          {/* Prev / Next Carousel Controls */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Photo Indicator Dots + Count Pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs">
            {photos.map((_, idx) => (
              <span
                key={idx}
                className={`block rounded-full transition-all ${
                  photoIdx === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-white text-[11px] font-semibold font-mono">
            {photoIdx + 1}/{photos.length}
          </div>
        </div>

        {/* Bold, Scannable Compass Card Info */}
        <div className="p-4 sm:p-5">
          {/* Price + Walk Time Row */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <h3 className="text-2xl font-bold text-black font-mono tabular-nums tracking-tight whitespace-nowrap">
              {primaryPrice}
            </h3>
            <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
              {residence.walkTo830Brickell}
            </span>
          </div>

          {/* Single-Line Specs Row (Never wraps vertically) */}
          <div className="mt-2.5 flex items-center gap-2 text-sm sm:text-[15px] font-semibold text-neutral-900 whitespace-nowrap overflow-hidden">
            <span className="whitespace-nowrap">
              <strong className="font-mono">{residence.beds}</strong>{' '}
              {residence.beds === 1 ? 'Bed' : 'Beds'}
            </span>
            <span aria-hidden="true" className="text-neutral-300">
              |
            </span>
            <span className="whitespace-nowrap">
              <strong className="font-mono">{residence.baths}</strong>{' '}
              {residence.baths === 1 ? 'Bath' : 'Baths'}
            </span>
            <span aria-hidden="true" className="text-neutral-300">
              |
            </span>
            <span className="whitespace-nowrap">
              <strong className="font-mono">
                {residence.squareFeet.toLocaleString()}
              </strong>{' '}
              Sq. Ft.
            </span>
          </div>

          {/* Street Address & Building Name */}
          <div className="mt-2.5 text-sm sm:text-base font-bold text-neutral-900 truncate">
            {residence.address}
          </div>
          <div className="text-xs sm:text-sm font-medium text-neutral-500 mt-0.5 line-clamp-2">
            {residence.towerName} · {secondaryPrice}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar — Clean Full-Width CTA Button */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(residence);
          }}
          className="w-full min-h-[44px] py-2.5 px-4 bg-black text-white font-bold text-sm rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Inquire / Schedule Tour</span>
        </button>
      </div>
    </article>
  );
};

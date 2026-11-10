import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CuratedResidence, IntentOption } from '../data/brickellData';
import {
  Navigation,
  ArrowUpRight,
  Plus,
  Minus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Move
} from 'lucide-react';
import { ResilientImage } from './ResilientImage';

interface BrickellInteractiveMapProps {
  residences: CuratedResidence[];
  intent: IntentOption;
  activeResidenceId: string | null;
  onSelectResidence: (res: CuratedResidence) => void;
  onOpenListingModal: (res: CuratedResidence) => void;
}

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 920;

export const BrickellInteractiveMap: React.FC<BrickellInteractiveMapProps> = ({
  residences,
  intent,
  activeResidenceId,
  onSelectResidence,
  onOpenListingModal
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSmoothTransition, setIsSmoothTransition] = useState<boolean>(true);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const activeRes =
    residences.find((r) => r.id === activeResidenceId) || residences[0] || null;
  const activeIdx = activeRes
    ? residences.findIndex((r) => r.id === activeRes.id)
    : 0;

  // Center map on a specific percentage coordinate (0-100) within the canvas
  const centerOnPosition = useCallback(
    (posXPercent: number, posYPercent: number, targetZoom = zoom) => {
      if (!viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const vw = rect.width;
      const vh = rect.height;

      const pinX = (posXPercent / 100) * CANVAS_WIDTH * targetZoom;
      const pinY = (posYPercent / 100) * CANVAS_HEIGHT * targetZoom;

      // Offset slightly upward so the bottom preview card doesn't cover the centered pin
      const desiredCenterX = vw / 2;
      const desiredCenterY = Math.max(vh * 0.42, (vh - 120) / 2);

      const rawX = desiredCenterX - pinX;
      const rawY = desiredCenterY - pinY;

      const minX = Math.min(40, vw - CANVAS_WIDTH * targetZoom - 40);
      const maxX = 40;
      const minY = Math.min(40, vh - CANVAS_HEIGHT * targetZoom - 80);
      const maxY = 40;

      setIsSmoothTransition(true);
      setPan({
        x: Math.max(minX, Math.min(maxX, rawX)),
        y: Math.max(minY, Math.min(maxY, rawY))
      });
    },
    [zoom]
  );

  // Initialize centered on active residence (or heart of Brickell) on mount & resize
  useEffect(() => {
    const pos = activeRes ? activeRes.mapPosition : { x: 46, y: 46 };
    centerOnPosition(pos.x, pos.y, zoom);
  }, [activeRes, centerOnPosition, zoom]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore drags starting on interactive buttons
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setIsSmoothTransition(false);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !viewportRef.current) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    const rect = viewportRef.current.getBoundingClientRect();
    const minX = Math.min(60, rect.width - CANVAS_WIDTH * zoom - 60);
    const maxX = 60;
    const minY = Math.min(60, rect.height - CANVAS_HEIGHT * zoom - 100);
    const maxY = 60;

    setPan({
      x: Math.max(minX, Math.min(maxX, dragStartRef.current.startPanX + dx)),
      y: Math.max(minY, Math.min(maxY, dragStartRef.current.startPanY + dy))
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if not captured
      }
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  const handleZoom = (delta: number) => {
    const nextZoom = Math.max(0.75, Math.min(1.65, Number((zoom + delta).toFixed(2))));
    setZoom(nextZoom);
    const pos = activeRes ? activeRes.mapPosition : { x: 46, y: 46 };
    centerOnPosition(pos.x, pos.y, nextZoom);
  };

  const handleResetMap = () => {
    setZoom(1);
    const pos = activeRes ? activeRes.mapPosition : { x: 46, y: 46 };
    centerOnPosition(pos.x, pos.y, 1);
  };

  const handleStepListing = (dir: -1 | 1) => {
    if (residences.length === 0) return;
    const nextIndex = (activeIdx + dir + residences.length) % residences.length;
    const nextRes = residences[nextIndex];
    onSelectResidence(nextRes);
    centerOnPosition(nextRes.mapPosition.x, nextRes.mapPosition.y, zoom);
  };

  return (
    <div
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full min-h-[520px] bg-[#CBE3F0] rounded-2xl overflow-hidden border border-neutral-300 select-none touch-none flex flex-col justify-between ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Movable & Zoomable Map Plane */}
      <div
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isSmoothTransition ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        className="absolute top-0 left-0 will-change-transform"
      >
        {/* Detailed Architectural Vector Map of Downtown Brickell */}
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="w-full h-full block pointer-events-none"
          aria-label="Interactive Movable Map of Downtown Brickell Miami"
        >
          {/* Mainland Brickell Land Mass */}
          <rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#F4F3EF" />

          {/* Biscayne Bay Waterfront (East / Right) */}
          <path
            d="M 600 0 C 615 190, 585 370, 610 560 C 625 720, 575 820, 555 920 L 860 920 L 860 0 Z"
            fill="#CBE3F0"
          />
          {/* Miami River (North / Top) */}
          <path d="M 0 60 Q 300 92, 610 44 L 610 0 L 0 0 Z" fill="#CBE3F0" />

          {/* Brickell Key Island */}
          <path
            d="M 680 250 Q 780 240, 800 355 Q 805 480, 710 500 Q 655 470, 660 355 Z"
            fill="#EFECE6"
            stroke="#D5D0C5"
            strokeWidth="2.5"
          />
          {/* Brickell Key Causeway Bridge */}
          <line x1="598" y1="375" x2="665" y2="375" stroke="#FFFFFF" strokeWidth="10" />

          {/* Brickell Parks & Green Corridors */}
          <rect x="520" y="435" width="72" height="105" rx="10" fill="#DCEAD6" />
          <rect x="195" y="610" width="95" height="145" rx="12" fill="#DCEAD6" />
          <rect x="315" y="135" width="110" height="50" rx="8" fill="#E3EFE0" />

          {/* Secondary Brickell Street Grid */}
          <g stroke="#E2DFD7" strokeWidth="3.5">
            {/* Horizontal Streets (SE 5th St to SE 15th Rd) */}
            <line x1="0" y1="145" x2="605" y2="145" />
            <line x1="0" y1="230" x2="600" y2="230" />
            <line x1="0" y1="325" x2="595" y2="325" />
            <line x1="0" y1="420" x2="600" y2="420" />
            <line x1="0" y1="515" x2="605" y2="515" />
            <line x1="0" y1="610" x2="610" y2="610" />
            <line x1="0" y1="705" x2="595" y2="705" />
            <line x1="0" y1="800" x2="575" y2="800" />
            {/* Vertical Avenues */}
            <line x1="120" y1="60" x2="120" y2="920" />
            <line x1="215" y1="60" x2="215" y2="920" />
            <line x1="390" y1="60" x2="390" y2="920" />
          </g>

          {/* Major Arteries: S Miami Ave, Brickell Plaza, Brickell Ave, SE 8th St */}
          <g stroke="#FFFFFF" strokeWidth="12">
            {/* S Miami Ave */}
            <line x1="295" y1="60" x2="295" y2="920" />
            {/* Brickell Plaza / SE 1st Ave */}
            <line x1="435" y1="60" x2="435" y2="920" />
            {/* Brickell Avenue */}
            <line x1="530" y1="50" x2="510" y2="920" />
            {/* SE 8th Street (Coral Way) */}
            <line x1="0" y1="420" x2="600" y2="420" />
            {/* SE 6th Street (Brickell City Centre Corridor) */}
            <line x1="0" y1="230" x2="600" y2="230" />
          </g>

          {/* Street & Landmark Typography */}
          <g
            fill="#6E6B64"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontSize="13"
            fontWeight="700"
            letterSpacing="0.09em"
          >
            <text x="502" y="165" transform="rotate(88 502 165)">
              BRICKELL AVE
            </text>
            <text x="415" y="165" transform="rotate(90 415 165)">
              BRICKELL PLAZA
            </text>
            <text x="275" y="655" transform="rotate(90 275 655)">
              S MIAMI AVE
            </text>
            <text x="70" y="408">SE 8TH ST · CORAL WAY</text>
            <text x="70" y="218">SE 6TH ST · CITY CENTRE</text>
            <text x="70" y="700">SE 14TH ST · FINANCIAL DISTRICT</text>
            <text x="688" y="380" fontSize="13" fill="#526071">
              BRICKELL KEY
            </text>
            <text
              x="675"
              y="660"
              fontSize="15"
              fill="#2563EB"
              fontWeight="800"
              letterSpacing="0.16em"
            >
              BISCAYNE BAY
            </text>
          </g>

          {/* Landmark Anchor: Brickell City Centre Footprint */}
          <g transform="translate(310, 155)">
            <rect
              x="0"
              y="0"
              width="175"
              height="62"
              rx="10"
              fill="#E7E5DE"
              stroke="#C9C5B8"
              strokeWidth="2"
            />
            <text
              x="87"
              y="35"
              textAnchor="middle"
              fill="#57534E"
              fontSize="11"
              fontWeight="700"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              BRICKELL CITY CENTRE
            </text>
          </g>

          {/* Landmark Anchor: 830 Brickell Office Tower */}
          <g transform="translate(345, 345)">
            <rect x="0" y="0" width="135" height="34" rx="8" fill="#1E293B" />
            <text
              x="67"
              y="21"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="700"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              830 BRICKELL HUB
            </text>
          </g>
        </svg>

        {/* Interactive Price Markers Positioned Across the Movable Map Plane */}
        {residences.map((res) => {
          const isSelected = activeRes?.id === res.id;
          const displayPrice =
            intent === 'Buy' ? res.purchasePrice : res.monthlyRent;

          return (
            <button
              key={res.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectResidence(res);
                centerOnPosition(res.mapPosition.x, res.mapPosition.y, zoom);
              }}
              style={{
                left: `${res.mapPosition.x}%`,
                top: `${res.mapPosition.y}%`
              }}
              className={`-translate-x-1/2 -translate-y-1/2 absolute px-4 py-2 rounded-full font-mono text-sm font-bold shadow-xl transition-transform cursor-pointer whitespace-nowrap tabular-nums flex flex-col items-center ${
                isSelected
                  ? 'bg-black text-white scale-115 z-30 ring-4 ring-black/25'
                  : 'bg-white text-black border-2 border-neutral-800/80 hover:scale-105 hover:border-black z-20'
              }`}
            >
              <span>{displayPrice}</span>
              {isSelected && (
                <span className="text-[10px] font-sans font-semibold text-neutral-300 tracking-wide mt-0.5">
                  {res.towerName}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Top Overlay Header + Drag Hint + Zoom Controls */}
      <div className="relative z-30 p-3.5 sm:p-4 flex items-start justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-neutral-200 px-3.5 py-2 rounded-xl shadow-md pointer-events-auto flex items-center gap-2">
          <Navigation className="w-4 h-4 text-black shrink-0" />
          <div>
            <div className="text-xs sm:text-sm font-bold text-black leading-tight">
              Brickell Map · {residences.length} Listings
            </div>
            <div className="text-[11px] font-medium text-neutral-500 flex items-center gap-1">
              <Move className="w-3 h-3" />
              <span>Drag to pan · Tap pin for details</span>
            </div>
          </div>
        </div>

        {/* Floating Zoom & Recenter Controls */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => handleZoom(0.2)}
            aria-label="Zoom in map"
            className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-black border border-neutral-200 shadow-md flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.2)}
            aria-label="Zoom out map"
            className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-black border border-neutral-200 shadow-md flex items-center justify-center transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetMap}
            aria-label="Recenter map"
            title="Recenter Brickell Map"
            className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-black border border-neutral-200 shadow-md flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Selected Listing Preview Card + Prev/Next Pin Stepper */}
      {activeRes && (
        <div className="relative z-30 p-3 sm:p-4 pointer-events-none">
          <div className="bg-white/98 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-neutral-200 pointer-events-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-20 h-18 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
                  <ResilientImage
                    src={activeRes.images[0]}
                    alt={activeRes.towerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 truncate">
                    {activeRes.towerName} · {activeRes.walkTo830Brickell}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-black font-mono tabular-nums mt-0.5">
                    {intent === 'Buy' ? activeRes.purchasePrice : activeRes.monthlyRent}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-neutral-700 truncate">
                    {activeRes.beds} Beds · {activeRes.baths} Baths ·{' '}
                    {activeRes.squareFeet.toLocaleString()} SF
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenListingModal(activeRes)}
                className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-black text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-neutral-800 transition-colors shrink-0 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Open</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pin Stepper Bar for Easy Mobile Navigation */}
            {residences.length > 1 && (
              <div className="mt-2.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-600">
                <button
                  type="button"
                  onClick={() => handleStepListing(-1)}
                  className="inline-flex items-center gap-1 text-black hover:underline cursor-pointer py-0.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev Pin</span>
                </button>
                <span className="font-mono text-neutral-500">
                  Pin {activeIdx + 1} of {residences.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleStepListing(1)}
                  className="inline-flex items-center gap-1 text-black hover:underline cursor-pointer py-0.5"
                >
                  <span>Next Pin</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

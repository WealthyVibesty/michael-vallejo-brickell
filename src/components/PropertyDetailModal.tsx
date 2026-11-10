import React, { useState } from 'react';
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Calendar,
  Phone
} from 'lucide-react';
import {
  CuratedResidence,
  IntentOption,
  TimelineOption,
  BudgetOption,
  VISUAL_ASSETS
} from '../data/brickellData';
import { ResilientImage } from './ResilientImage';

interface PropertyDetailModalProps {
  residence: CuratedResidence | null;
  intent: IntentOption;
  onClose: () => void;
  onSubmitTourRequest: (payload: {
    source: string;
    fullName: string;
    contact: string;
    companyOrAffiliation: string;
    persona: string;
    intent: IntentOption;
    timeline: TimelineOption;
    budget: BudgetOption;
    targetTower?: string;
    unitDetails?: string;
    preferredCallWindow?: string;
    notes?: string;
  }) => Promise<{ id: string; crmExternalId: string; personalizedAdvisoryNote: string } | null>;
}

const TOUR_DAYS = ['Today', 'Tomorrow', 'This Weekend', 'Next Week'];

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  residence,
  intent,
  onClose,
  onSubmitTourRequest
}) => {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tourType, setTourType] = useState<'In-Person Private Showing' | 'Live FaceTime / Video Tour'>(
    'In-Person Private Showing'
  );
  const [selectedDay, setSelectedDay] = useState('Tomorrow');
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmed, setConfirmed] = useState<{
    id: string;
    crmExternalId: string;
  } | null>(null);

  if (!residence) return null;

  const photos = residence.images;

  const handleNextPhoto = () => {
    setPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim() || contact.trim().length < 6) {
      setErrorMsg('Please enter your mobile number or email address.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    const res = await onSubmitTourRequest({
      source: 'Off-Market Dossier Request',
      fullName: fullName.trim() || 'Private Showing Client',
      contact: contact.trim(),
      companyOrAffiliation: `${tourType} (${selectedDay})`,
      persona: 'Direct Property Tour',
      intent,
      timeline: 'Immediate / 30 Days',
      budget: residence.budgetBucket[0] || '$10,000+/mo or Purchase',
      targetTower: residence.towerName,
      unitDetails: `${residence.address} (${residence.beds}BD/${residence.baths}BA)`,
      preferredCallWindow: `${selectedDay} · ${tourType}`,
      notes: `Requested ${tourType} for ${residence.address} on ${selectedDay}`
    });

    setSubmitting(false);
    if (res) {
      setConfirmed({ id: res.id, crmExternalId: res.crmExternalId });
    } else {
      setErrorMsg('Could not schedule tour right now. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-detail-title"
    >
      <div className="bg-white text-black w-full max-w-5xl rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {residence.statusTag}
            </span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="text-sm font-semibold text-black">{residence.towerName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-black transition-colors cursor-pointer"
            aria-label="Close listing"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: Photo Gallery + Specs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Interactive Photo Carousel */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-neutral-100">
              <ResilientImage
                src={photos[photoIdx]}
                alt={`${residence.address} photo ${photoIdx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-md cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 right-3 bg-black/75 text-white text-xs font-mono px-3 py-1.5 rounded-full">
                {photoIdx + 1} / {photos.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-3 gap-3">
              {photos.map((imgUrl, i) => (
                <button
                  key={imgUrl}
                  type="button"
                  onClick={() => setPhotoIdx(i)}
                  className={`aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    photoIdx === i ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <ResilientImage src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Big Price & Specs Block */}
            <div className="pt-2 border-t border-neutral-200">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <h2
                    id="property-detail-title"
                    className="text-3xl md:text-4xl font-bold text-black font-mono tabular-nums"
                  >
                    {intent === 'Buy' ? residence.purchasePrice : residence.monthlyRent}
                  </h2>
                  <p className="text-base text-neutral-600 mt-1 font-medium">
                    {intent === 'Buy'
                      ? `Also available for lease at ${residence.monthlyRent}`
                      : `Acquisition price: ${residence.purchasePrice} (${residence.pricePerSf})`}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-lg font-semibold text-black">
                  <div>
                    <span className="font-mono">{residence.beds}</span>{' '}
                    <span className="text-neutral-500 font-normal text-base">Beds</span>
                  </div>
                  <div>
                    <span className="font-mono">{residence.baths}</span>{' '}
                    <span className="text-neutral-500 font-normal text-base">Baths</span>
                  </div>
                  <div>
                    <span className="font-mono">{residence.squareFeet.toLocaleString()}</span>{' '}
                    <span className="text-neutral-500 font-normal text-base">Sq. Ft.</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-base text-neutral-700 font-medium">
                <MapPin className="w-4 h-4 text-black shrink-0" />
                <span>{residence.address}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-semibold">{residence.hoaTurnaround}</span>
                <span aria-hidden="true">·</span>
                <span>{residence.walkTo830Brickell}</span>
              </div>

              {/* Michael Vallejo's Take */}
              <div className="mt-6 p-5 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-start gap-4">
                <img
                  src={VISUAL_ASSETS.michaelPortrait}
                  alt="Michael Vallejo"
                  className="w-14 h-14 rounded-full object-cover object-top shrink-0 border border-neutral-300"
                />
                <div>
                  <div className="text-sm font-bold text-black">
                    Michael Vallejo&rsquo;s Advisory Note
                  </div>
                  <p className="text-base text-neutral-700 mt-1 leading-relaxed">
                    &ldquo;{residence.michaelTake}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Compass-Style Instant Tour & CRM Booking Box */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 sticky top-4">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <h3 className="text-xl font-bold text-black">Schedule a Private Showing</h3>
                  <p className="text-sm text-neutral-600 mt-0.5">
                    Tour directly with Michael Vallejo
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-black" />
              </div>

              {confirmed ? (
                <div className="py-6 space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                      <Check className="w-5 h-5" />
                      <span>Showing Request Confirmed</span>
                    </div>
                    <p className="text-sm text-emerald-900 mt-1.5">
                      Michael Vallejo has received your request for {residence.address} and will
                      confirm your {selectedDay} window shortly.
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/13058904410?text=${encodeURIComponent(
                      `Hi Michael, I just requested a ${tourType} for ${residence.address} (${selectedDay}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-black text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Message Michael on WhatsApp</span>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleTourSubmit} className="mt-5 space-y-4">
                  {/* Tour Format Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-200/70 rounded-xl">
                    {(
                      [
                        'In-Person Private Showing',
                        'Live FaceTime / Video Tour'
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTourType(mode)}
                        className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          tourType === mode
                            ? 'bg-white text-black shadow-sm'
                            : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        {mode === 'In-Person Private Showing' ? 'In-Person Tour' : 'Live Video Tour'}
                      </button>
                    ))}
                  </div>

                  {/* Preferred Day Pills */}
                  <div>
                    <label className="block text-sm font-bold text-neutral-800 mb-2">
                      Select Day
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TOUR_DAYS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDay(day)}
                          className={`py-2.5 px-3 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
                            selectedDay === day
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                      Mobile Number or Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="(305) 555-0199 or email"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-sm text-rose-600 font-semibold" role="alert">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-5 bg-black text-white font-bold text-base rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Sending Request...' : 'Request This Showing →'}
                  </button>

                  <div className="pt-2 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Direct to Michael Vallejo · Zero Spam Guarantee</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

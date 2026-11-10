/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Map,
  LayoutGrid,
  Phone,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  VISUAL_ASSETS,
  BRICKELL_TOWERS,
  CURATED_RESIDENCES,
  IntentOption,
  TimelineOption,
  BudgetOption,
  BrickellTower,
  CuratedResidence
} from './data/brickellData';
import { ResilientImage } from './components/ResilientImage';
import { CompassListingCard } from './components/CompassListingCard';
import { BrickellInteractiveMap } from './components/BrickellInteractiveMap';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { InquiryModal, InquiryModalContext } from './components/InquiryModal';

const INTENT_OPTIONS: IntentOption[] = ['Rent', 'Buy', 'Lease Out My Unit'];
const TIMELINE_OPTIONS: TimelineOption[] = ['Immediate / 30 Days', '30–90 Days', 'Exploring'];
const BUDGET_OPTIONS: BudgetOption[] = [
  '$3,500 – $5,500/mo',
  '$5,500 – $10,000/mo',
  '$10,000+/mo or Purchase'
];

export default function App() {
  // Compass Marketplace Search & Filter State
  const [intent, setIntent] = useState<IntentOption>('Rent');
  const [selectedTowerFilter, setSelectedTowerFilter] = useState<string>('all');
  const [minBedsFilter, setMinBedsFilter] = useState<number>(0);
  const [budgetFilter, setBudgetFilter] = useState<'all' | BudgetOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(['RES-BF-5101']);
  const [hoveredResidenceId, setHoveredResidenceId] = useState<string | null>('RES-BF-5101');
  const [selectedResidenceModal, setSelectedResidenceModal] =
    useState<CuratedResidence | null>(null);

  // Building Slider Ref
  const towerSliderRef = useRef<HTMLDivElement | null>(null);

  // Interactive Lead Selector State
  const [leadTimeline, setLeadTimeline] = useState<TimelineOption>('Immediate / 30 Days');
  const [leadBudget, setLeadBudget] = useState<BudgetOption>('$10,000+/mo or Purchase');
  const [leadName, setLeadName] = useState('');
  const [leadContact, setLeadContact] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [heroSubmitting, setHeroSubmitting] = useState(false);
  const [heroError, setHeroError] = useState('');
  const [heroConfirmation, setHeroConfirmation] = useState<{
    personalizedAdvisoryNote: string;
  } | null>(null);

  // Landlord Valuation State
  const [landlordTower, setLandlordTower] = useState('Brickell Flatiron (1000 Brickell Plaza)');
  const [landlordUnit, setLandlordUnit] = useState('');
  const [landlordBedrooms, setLandlordBedrooms] = useState<'1 Bed' | '2 Bed' | '3 Bed / Penthouse'>(
    '2 Bed'
  );
  const [landlordName, setLandlordName] = useState('');
  const [landlordContact, setLandlordContact] = useState('');
  const [landlordSubmitting, setLandlordSubmitting] = useState(false);
  const [landlordError, setLandlordError] = useState('');
  const [landlordResult, setLandlordResult] = useState<{
    estimatedRange: string;
    annualizedYield: string;
  } | null>(null);

  // Inquiry Modal State
  const [inquiryContext, setInquiryContext] = useState<InquiryModalContext | null>(null);

  // Dynamic Canonical & OG URL Resolution for SEO
  useEffect(() => {
    const canonicalHref = window.location.origin + window.location.pathname;
    let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalHref);
  }, []);

  // Filtered Residences for Marketplace
  const filteredResidences = useMemo(() => {
    return CURATED_RESIDENCES.filter((res) => {
      if (selectedTowerFilter !== 'all' && res.towerId !== selectedTowerFilter) {
        return false;
      }
      if (minBedsFilter > 0 && res.beds < minBedsFilter) {
        return false;
      }
      if (budgetFilter !== 'all' && !res.budgetBucket.includes(budgetFilter)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          res.towerName.toLowerCase().includes(q) ||
          res.address.toLowerCase().includes(q) ||
          res.michaelTake.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedTowerFilter, minBedsFilter, budgetFilter, searchQuery]);

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const [activeTowerSlide, setActiveTowerSlide] = useState(0);

  const handleTowerScroll = () => {
    if (!towerSliderRef.current) return;
    const container = towerSliderRef.current;
    const firstCard = container.children[0] as HTMLElement | undefined;
    if (!firstCard) return;
    const cardStep = firstCard.offsetWidth + 16;
    const idx = Math.round(container.scrollLeft / cardStep);
    setActiveTowerSlide(Math.max(0, Math.min(BRICKELL_TOWERS.length - 1, idx)));
  };

  const scrollTowerSlider = (direction: 'left' | 'right') => {
    if (!towerSliderRef.current) return;
    const firstCard = towerSliderRef.current.children[0] as HTMLElement | undefined;
    const amount = firstCard ? firstCard.offsetWidth + 20 : 360;
    towerSliderRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
  };

  // Seamless Backend CRM Lead Submission
  const submitLeadToBackend = async (payload: {
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
  }) => {
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.lead as {
        id: string;
        crmExternalId: string;
        personalizedAdvisoryNote: string;
      };
    } catch {
      return null;
    }
  };

  const validateContactField = (val: string) => {
    const trimmed = val.trim();
    return (
      trimmed.length >= 6 &&
      (trimmed.includes('@') || /\d{7,}/.test(trimmed.replace(/\D/g, '')))
    );
  };

  // Hero / Concierge Match Form Submit
  const handleHeroLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContactField(leadContact)) {
      setHeroError('Please enter a valid mobile number or email address.');
      return;
    }
    setHeroError('');
    setHeroSubmitting(true);

    const created = await submitLeadToBackend({
      source: 'Hero Lead Selector',
      fullName: leadName.trim() || 'Executive Client',
      contact: leadContact.trim(),
      companyOrAffiliation: leadCompany.trim() || 'Private Relocation Client',
      persona: leadCompany.trim() || 'Executive Relocation',
      intent,
      timeline: leadTimeline,
      budget: leadBudget
    });

    setHeroSubmitting(false);
    if (created) {
      setHeroConfirmation({
        personalizedAdvisoryNote: created.personalizedAdvisoryNote
      });
      setBudgetFilter(leadBudget);
      setLeadContact('');
    } else {
      setHeroError('Unable to send request right now. Please try again.');
    }
  };

  // Landlord Lease Rate Assessment Handler
  const handleLandlordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContactField(landlordContact)) {
      setLandlordError('Please enter a valid email or mobile number.');
      return;
    }
    setLandlordError('');
    setLandlordSubmitting(true);

    let minEstimate = 5800;
    let maxEstimate = 7900;
    if (landlordTower.includes('Echo')) {
      minEstimate = landlordBedrooms === '1 Bed' ? 5200 : landlordBedrooms === '2 Bed' ? 8800 : 14500;
      maxEstimate = landlordBedrooms === '1 Bed' ? 6800 : landlordBedrooms === '2 Bed' ? 11800 : 18500;
    } else if (landlordTower.includes('Flatiron')) {
      minEstimate = landlordBedrooms === '1 Bed' ? 4600 : landlordBedrooms === '2 Bed' ? 7200 : 11500;
      maxEstimate = landlordBedrooms === '1 Bed' ? 5900 : landlordBedrooms === '2 Bed' ? 9400 : 14800;
    } else if (landlordTower.includes('Reach')) {
      minEstimate = landlordBedrooms === '1 Bed' ? 4200 : landlordBedrooms === '2 Bed' ? 6400 : 9200;
      maxEstimate = landlordBedrooms === '1 Bed' ? 5400 : landlordBedrooms === '2 Bed' ? 8200 : 11500;
    } else {
      minEstimate = landlordBedrooms === '1 Bed' ? 3800 : landlordBedrooms === '2 Bed' ? 5600 : 7800;
      maxEstimate = landlordBedrooms === '1 Bed' ? 4900 : landlordBedrooms === '2 Bed' ? 7200 : 9800;
    }

    const avgAnnual = Math.round(((minEstimate + maxEstimate) / 2) * 12);
    const created = await submitLeadToBackend({
      source: 'Landlord Lease Assessment',
      fullName: landlordName.trim() || 'Brickell Condo Owner',
      contact: landlordContact.trim(),
      companyOrAffiliation: `Owner · ${landlordTower}`,
      persona: 'Brickell Unit Owner / Landlord',
      intent: 'Lease Out My Unit',
      timeline: 'Immediate / 30 Days',
      budget: maxEstimate >= 10000 ? '$10,000+/mo or Purchase' : '$5,500 – $10,000/mo',
      targetTower: landlordTower.split(' (')[0],
      unitDetails: `${landlordTower} · Unit ${landlordUnit || 'TBD'} · ${landlordBedrooms}`,
      notes: `Estimated Lease Rate: $${minEstimate.toLocaleString()}–$${maxEstimate.toLocaleString()}/mo`
    });

    setLandlordSubmitting(false);
    if (created) {
      setLandlordResult({
        estimatedRange: `$${minEstimate.toLocaleString()} – $${maxEstimate.toLocaleString()}/mo`,
        annualizedYield: `$${avgAnnual.toLocaleString()}/yr gross`
      });
    } else {
      setLandlordError('Unable to complete valuation right now.');
    }
  };

  const openRelocationCallModal = () => {
    setInquiryContext({
      mode: 'relocation-call',
      title: 'Book a 15-Minute Relocation Call',
      subtitle: 'Direct private briefing with Michael Vallejo · Downtown Brickell Specialist',
      defaultIntent: intent,
      defaultTimeline: leadTimeline,
      defaultBudget: leadBudget,
      personaLabel: 'Executive Relocation Client'
    });
  };

  const openTowerVacancyModal = (tower: BrickellTower) => {
    setInquiryContext({
      mode: 'tower-vacancy',
      title: `Inquire on Current Vacancies — ${tower.name}`,
      subtitle: `${tower.address} · ${tower.avgRentDisplay} · ${tower.hoaTimeline}`,
      targetTower: tower.name,
      defaultIntent: intent,
      defaultTimeline: leadTimeline,
      defaultBudget: leadBudget,
      personaLabel: 'Building Inquiry'
    });
  };

  const whatsappDirectUrl = useMemo(() => {
    const msg = `Hi Michael, I'm browsing your Brickell listings (${intent}). Can you send me current availability?`;
    return `https://wa.me/13058904410?text=${encodeURIComponent(msg)}`;
  }, [intent]);

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col overflow-x-hidden">
      {/* 1. COMPASS-STYLE STICKY TOP NAVIGATION (Strict 3-Zone Contract, Balanced Width) */}
      <header className="sticky top-0 z-40 h-16 md:h-20 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-[1440px] mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Single Clean Brand Wordmark */}
          <a
            href="#top"
            className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-black whitespace-nowrap shrink-0"
          >
            MICHAEL VALLEJO
          </a>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-8 text-base font-semibold text-neutral-700"
          >
            <a
              href="#listings"
              className="hover:text-black hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Properties
            </a>
            <a
              href="#towers"
              className="hover:text-black hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Condo Guide
            </a>
            <a
              href="#landlords"
              className="hover:text-black hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Landlords
            </a>
            <a
              href="#match-selector"
              className="hover:text-black hover:underline underline-offset-8 transition-colors whitespace-nowrap shrink-0"
            >
              Private Consultation
            </a>
          </nav>

          {/* Zone 3: 1 Sleek Primary Action Button (Sized properly for mobile & desktop) */}
          <div className="flex items-center shrink-0">
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 sm:h-11 px-3.5 sm:px-5 bg-black text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-neutral-800 transition-colors inline-flex items-center justify-center whitespace-nowrap shrink-0"
            >
              (305) 890-4410
            </a>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* 2. PERSONALIZED MICHAEL VALLEJO + COHESIVE COMPASS FILTER BAR */}
        <section className="bg-white border-b border-neutral-200 pt-5 pb-5 px-4 md:px-8">
          <div className="max-w-[1440px] mx-auto space-y-5">
            {/* Michael Vallejo Personal Brand Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-5">
                <img
                  src={VISUAL_ASSETS.michaelPortrait}
                  alt="Michael Vallejo"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover object-center border-2 border-black shrink-0 shadow-sm"
                />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Downtown Brickell Residential Specialist
                  </div>
                  <h1
                    className="text-xl sm:text-3xl md:text-4xl font-bold text-black tracking-tight mt-0.5"
                    style={{ textWrap: 'balance' }}
                  >
                    Brickell Condos for {intent === 'Buy' ? 'Sale' : 'Rent'} &amp; Off-Market
                    Exclusives
                  </h1>
                  <p className="text-sm sm:text-base text-neutral-600 font-medium mt-0.5">
                    Curated by Michael Vallejo · Serving Citadel, Kirkland &amp; Ellis, and
                    Microsoft relocations.
                  </p>
                </div>
              </div>

              {/* Single Clean Primary Call Button */}
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={openRelocationCallModal}
                  className="w-full sm:w-auto h-12 px-5 bg-black text-white font-bold text-sm sm:text-base rounded-xl hover:bg-neutral-800 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book 15-Min Call</span>
                </button>
              </div>
            </div>

            {/* Unified, Cohesive Compass Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
              {/* 1. For Rent / For Sale Segmented Control */}
              <div className="lg:col-span-3 h-12 p-1 bg-neutral-100 rounded-xl border border-neutral-300 grid grid-cols-2">
                {(['Rent', 'Buy'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setIntent(mode)}
                    className={`h-full text-sm sm:text-base font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      intent === mode
                        ? 'bg-black text-white shadow-xs'
                        : 'text-neutral-700 hover:text-black'
                    }`}
                  >
                    {mode === 'Rent' ? 'For Rent' : 'For Sale'}
                  </button>
                ))}
              </div>

              {/* 2. Search Input */}
              <div className="lg:col-span-5 relative h-12">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Address, tower, or view..."
                  className="w-full h-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl pl-10 pr-4 text-sm sm:text-base font-medium text-black placeholder-neutral-500 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* 3. Cohesive Price Filter */}
              <div className="lg:col-span-2 h-12">
                <select
                  aria-label="Filter by Budget"
                  value={budgetFilter}
                  onChange={(e) =>
                    setBudgetFilter(e.target.value as 'all' | BudgetOption)
                  }
                  className="w-full h-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-xl px-3.5 text-sm sm:text-base font-bold text-black focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="all">Any Price</option>
                  <option value="$3,500 – $5,500/mo">$3,500 – $5,500/mo</option>
                  <option value="$5,500 – $10,000/mo">$5,500 – $10,000/mo</option>
                  <option value="$10,000+/mo or Purchase">$10,000+/mo or $1M+</option>
                </select>
              </div>

              {/* 4. Cohesive Beds Filter */}
              <div className="lg:col-span-2 h-12">
                <select
                  aria-label="Filter by Minimum Bedrooms"
                  value={minBedsFilter}
                  onChange={(e) => setMinBedsFilter(Number(e.target.value))}
                  className="w-full h-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-xl px-3.5 text-sm sm:text-base font-bold text-black focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value={0}>Any Beds</option>
                  <option value={1}>1+ Beds</option>
                  <option value={2}>2+ Beds</option>
                  <option value={3}>3+ Beds</option>
                </select>
              </div>
            </div>

            {/* Mobile-Friendly Horizontal Building Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setSelectedTowerFilter('all')}
                className={`h-10 px-4 rounded-xl text-sm font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedTowerFilter === 'all'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                }`}
              >
                All Brickell ({CURATED_RESIDENCES.length})
              </button>
              {BRICKELL_TOWERS.map((tower) => (
                <button
                  key={tower.id}
                  type="button"
                  onClick={() => setSelectedTowerFilter(tower.id)}
                  className={`h-10 px-4 rounded-xl text-sm font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedTowerFilter === tower.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                  }`}
                >
                  {tower.shortName}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. COMPASS MARKETPLACE: SPLIT INTERACTIVE MAP + PHOTO-FIRST LISTING GRID */}
        <section id="listings" className="max-w-[1440px] mx-auto px-4 md:px-8 py-5 md:py-8">
          {/* Mobile Top List / Interactive Map Segmented Toggle */}
          <div className="flex lg:hidden items-center justify-between gap-3 mb-4">
            <div className="text-base font-bold text-black">
              {filteredResidences.length}{' '}
              {filteredResidences.length === 1 ? 'Residence' : 'Residences'}
            </div>
            <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-300">
              <button
                type="button"
                onClick={() => setMobileMapOpen(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  !mobileMapOpen ? 'bg-black text-white' : 'text-neutral-700'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Photo List</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMapOpen(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  mobileMapOpen ? 'bg-black text-white' : 'text-neutral-700'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Interactive Map</span>
              </button>
            </div>
          </div>

          {/* Mobile Map View Toggle Result */}
          {mobileMapOpen ? (
            <div className="lg:hidden h-[75vh] min-h-[540px] mb-6">
              <BrickellInteractiveMap
                residences={filteredResidences}
                intent={intent}
                activeResidenceId={hoveredResidenceId}
                onSelectResidence={(res) => setHoveredResidenceId(res.id)}
                onOpenListingModal={(res) => setSelectedResidenceModal(res)}
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Listing Cards Column */}
            <div className={`lg:col-span-7 ${mobileMapOpen ? 'hidden lg:block' : 'block'}`}>
              <div className="flex items-center justify-between mb-5">
                <div className="text-base md:text-lg font-bold text-black">
                  {filteredResidences.length}{' '}
                  {filteredResidences.length === 1 ? 'Residence' : 'Residences'} Available
                </div>
                {(selectedTowerFilter !== 'all' ||
                  minBedsFilter > 0 ||
                  budgetFilter !== 'all' ||
                  searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTowerFilter('all');
                      setMinBedsFilter(0);
                      setBudgetFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-sm font-bold text-black underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {filteredResidences.length === 0 ? (
                <div className="p-12 text-center bg-neutral-50 border border-neutral-200 rounded-2xl">
                  <p className="text-xl font-bold text-black">
                    No public listings match that filter.
                  </p>
                  <p className="text-base text-neutral-600 mt-2">
                    Michael Vallejo holds private pocket listings across all 4 Brickell towers.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTowerFilter('all');
                      setMinBedsFilter(0);
                      setBudgetFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-5 px-6 py-3 bg-black text-white font-bold text-base rounded-xl cursor-pointer"
                  >
                    Show All Brickell Listings
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredResidences.map((residence) => (
                    <CompassListingCard
                      key={residence.id}
                      residence={residence}
                      intent={intent}
                      isSaved={savedIds.includes(residence.id)}
                      isHighlighted={hoveredResidenceId === residence.id}
                      onToggleSave={handleToggleSave}
                      onOpenDetail={(res) => setSelectedResidenceModal(res)}
                      onHover={(id) => {
                        if (id) setHoveredResidenceId(id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Interactive Brickell Map Column (Locked Split Map View) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-24 h-[calc(100vh-120px)]">
              <BrickellInteractiveMap
                residences={filteredResidences}
                intent={intent}
                activeResidenceId={hoveredResidenceId}
                onSelectResidence={(res) => setHoveredResidenceId(res.id)}
                onOpenListingModal={(res) => setSelectedResidenceModal(res)}
              />
            </div>
          </div>
        </section>

        {/* 4. PREMIER HIGH-RISE PORTFOLIO (MOBILE-OPTIMIZED SWIPE DECK & DESKTOP SLIDER) */}
        <section
          id="towers"
          className="py-12 md:py-24 px-4 md:px-8 max-w-[1440px] mx-auto border-t border-neutral-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 md:mb-8">
            <div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">
                Downtown Brickell Condo Guide
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mt-1">
                Premier High-Rise Portfolio
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-neutral-600 font-medium mt-1">
                Swipe or tap a building below to view rates, HOA timelines, and current vacancies.
              </p>
            </div>

            {/* Desktop Slider Prev / Next Controls */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => scrollTowerSlider('left')}
                aria-label="Slide buildings left"
                className="w-11 h-11 rounded-full border border-neutral-300 hover:border-black bg-white text-black flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollTowerSlider('right')}
                aria-label="Slide buildings right"
                className="w-11 h-11 rounded-full border border-neutral-300 hover:border-black bg-white text-black flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Quick-Jump Tower Pills */}
          <div className="flex sm:hidden items-center gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
            {BRICKELL_TOWERS.map((tower, idx) => (
              <button
                key={tower.id}
                type="button"
                onClick={() => {
                  setActiveTowerSlide(idx);
                  const container = towerSliderRef.current;
                  const cardEl = container?.children[idx] as HTMLElement | undefined;
                  if (cardEl && container) {
                    container.scrollTo({
                      left: cardEl.offsetLeft - 16,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`h-9 px-3.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  activeTowerSlide === idx
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                0{idx + 1}. {tower.shortName}
              </button>
            ))}
          </div>

          {/* Responsive Swipeable Building Slider */}
          <div
            ref={towerSliderRef}
            onScroll={handleTowerScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {BRICKELL_TOWERS.map((tower, idx) => (
              <article
                key={tower.id}
                className="w-[88vw] max-w-[380px] sm:max-w-none sm:w-[460px] lg:w-[520px] snap-center sm:snap-start bg-white border border-neutral-200 rounded-3xl overflow-hidden hover:border-black transition-all flex flex-col justify-between shadow-sm hover:shadow-xl shrink-0"
              >
                <div>
                  {/* Tall 4:3 Mobile / 16:10 Desktop Architectural Image */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-neutral-100 overflow-hidden">
                    <ResilientImage
                      src={tower.image}
                      alt={`${tower.name} luxury condominium tower`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Concise Single-Line Top Badge */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span className="bg-white/95 backdrop-blur-xs text-black text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
                        {tower.hoaTimeline}
                      </span>
                      <span className="bg-black/75 backdrop-blur-xs text-white text-xs font-mono font-semibold px-2.5 py-1 rounded-lg">
                        0{idx + 1} / 0{BRICKELL_TOWERS.length}
                      </span>
                    </div>

                    {/* Bottom Title Overlay */}
                    <div className="absolute bottom-3.5 left-4 right-4 text-white">
                      <div className="text-xs font-semibold text-white/85 truncate">
                        {tower.address} · {tower.stories}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-0.5 leading-tight">
                        {tower.name}
                      </h3>
                    </div>
                  </div>

                  {/* Mobile-Optimized Card Body */}
                  <div className="p-5 sm:p-6">
                    <p className="text-sm sm:text-base text-neutral-700 font-medium leading-snug">
                      {tower.tagline}
                    </p>

                    {/* Clean Full-Width Rows on Mobile (Zero Cramped Wrapping), 2-Col on Desktop */}
                    <div className="mt-4 pt-3 border-t border-neutral-200 space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:pt-4">
                      <div className="flex items-center justify-between sm:block py-1 sm:py-0 border-b border-neutral-100 sm:border-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Avg Monthly Lease
                        </span>
                        <span className="text-base sm:text-xl font-mono font-bold text-black tabular-nums sm:mt-0.5 sm:block whitespace-nowrap">
                          {tower.avgRentDisplay}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:block py-1 sm:py-0 border-b border-neutral-100 sm:border-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Purchase Range
                        </span>
                        <span className="text-base sm:text-xl font-mono font-bold text-neutral-800 tabular-nums sm:mt-0.5 sm:block whitespace-nowrap">
                          {tower.purchaseRange}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:hidden py-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Office Walk Time
                        </span>
                        <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                          {tower.walkTo830Brickell}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                  <button
                    type="button"
                    onClick={() => openTowerVacancyModal(tower)}
                    className="w-full min-h-[50px] py-3.5 px-5 bg-black text-white font-bold text-sm sm:text-base rounded-2xl hover:bg-neutral-800 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Inquire on Current Vacancies →
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile Swipe Hint & Controls */}
          <div className="flex sm:hidden items-center justify-between mt-2 px-1 text-xs font-semibold text-neutral-500">
            <span>Swipe left for more towers</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTowerSlider('left')}
                aria-label="Previous tower"
                className="w-9 h-9 rounded-full border border-neutral-300 bg-white text-black flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTowerSlider('right')}
                aria-label="Next tower"
                className="w-9 h-9 rounded-full border border-neutral-300 bg-white text-black flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE OFF-MARKET LEAD SELECTOR */}
        <section
          id="match-selector"
          className="py-16 md:py-24 px-4 md:px-8 bg-neutral-950 text-white"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <div className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                Downtown Brickell Residential Specialist
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Precision Real Estate in Downtown Brickell.
              </h2>
              <p className="text-lg md:text-xl text-neutral-300 mt-4 leading-relaxed">
                Curated rentals, acquisitions, and prime residential investments. Direct access to
                premier high-rises with corporate-level discretion and zero wasted time.
              </p>
            </div>

            <form
              onSubmit={handleHeroLeadSubmit}
              className="mt-10 bg-white text-black rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-7"
            >
              {/* 1. I want to */}
              <div>
                <label className="block text-base md:text-lg font-bold text-black mb-3">
                  1. I want to:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {INTENT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setIntent(option)}
                      className={`min-h-[52px] py-3.5 px-5 text-base font-bold rounded-xl border-2 transition-all cursor-pointer ${
                        intent === option
                          ? 'bg-black text-white border-black'
                          : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-black'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Timeline */}
              <div>
                <label className="block text-base md:text-lg font-bold text-black mb-3">
                  2. Timeline:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TIMELINE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLeadTimeline(option)}
                      className={`min-h-[52px] py-3.5 px-5 text-base font-bold rounded-xl border-2 transition-all cursor-pointer ${
                        leadTimeline === option
                          ? 'bg-black text-white border-black'
                          : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-black'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Budget */}
              <div>
                <label className="block text-base md:text-lg font-bold text-black mb-3">
                  3. Budget:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BUDGET_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLeadBudget(option)}
                      className={`min-h-[52px] py-3.5 px-4 text-base font-bold font-mono rounded-xl border-2 transition-all cursor-pointer tabular-nums ${
                        leadBudget === option
                          ? 'bg-black text-white border-black'
                          : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-black'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full min-h-[50px] bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                    Firm or City (Optional)
                  </label>
                  <input
                    type="text"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="Citadel, Kirkland, NYC..."
                    className="w-full min-h-[50px] bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                    Mobile or Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadContact}
                    onChange={(e) => setLeadContact(e.target.value)}
                    placeholder="(305) 555-0199 or email"
                    className="w-full min-h-[50px] bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {heroError && (
                <p className="text-base text-rose-600 font-bold" role="alert">
                  {heroError}
                </p>
              )}

              <button
                type="submit"
                disabled={heroSubmitting}
                className="w-full min-h-[56px] py-4 px-6 bg-black text-white font-bold text-lg rounded-2xl hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {heroSubmitting
                  ? 'Finding Matched Residences...'
                  : 'View Available & Off-Market Residences →'}
              </button>

              {heroConfirmation && (
                <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
                    <Check className="w-5 h-5 text-emerald-700" />
                    <span>Request Received — Michael Vallejo Will Reach Out Shortly</span>
                  </div>
                  <p className="text-sm text-emerald-800 mt-1">
                    {heroConfirmation.personalizedAdvisoryNote}
                  </p>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* 6. FOR LANDLORDS & UNIT OWNERS + ABOUT MICHAEL VALLEJO */}
        <section
          id="landlords"
          className="py-16 md:py-24 px-4 md:px-8 bg-neutral-50 border-t border-neutral-200"
        >
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Landlord Metrics + About Michael Vallejo */}
            <div className="lg:col-span-7 space-y-10">
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                  For Landlords &amp; Unit Owners
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-black mt-2 leading-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Vacant Days Cost Money. We Place Vetted Corporate Tenants Fast.
                </h2>
                <p className="text-lg text-neutral-700 mt-4 leading-relaxed">
                  Specialized marketing for Brickell condo owners. We handle credit/background
                  vetting, strict condo association application packages, and move-in compliance.
                </p>

                {/* Big 3 Metrics */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="text-3xl md:text-4xl font-bold text-black font-mono tabular-nums">
                      14 Days
                    </div>
                    <div className="text-base font-semibold text-neutral-600 mt-1">
                      Average Tenant Placement
                    </div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="text-3xl md:text-4xl font-bold text-black font-mono tabular-nums">
                      100%
                    </div>
                    <div className="text-base font-semibold text-neutral-600 mt-1">
                      HOA Approval Track Record
                    </div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="text-3xl md:text-4xl font-bold text-black">Top Tier</div>
                    <div className="text-base font-semibold text-neutral-600 mt-1">
                      Credit &amp; Income Enforced
                    </div>
                  </div>
                </div>
              </div>

              {/* About Michael Vallejo Card */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={VISUAL_ASSETS.michaelPortrait}
                  alt="Michael Vallejo"
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover object-center shrink-0 border border-neutral-200 shadow-sm"
                />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Michael Vallejo · Principal Advisor
                  </div>
                  <h3 className="text-2xl font-bold text-black mt-1">
                    A Wall Street Approach to South Florida Real Estate.
                  </h3>
                  <p className="text-base text-neutral-700 mt-2 leading-relaxed">
                    Brickell moves faster than traditional residential markets. I work exclusively
                    in the Downtown Brickell high-rise corridor, helping busy corporate executives,
                    relocations, and private investors secure premier properties without friction.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Complimentary Lease Rate Assessment Form */}
            <div className="lg:col-span-5">
              <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-black">
                  Request a Complimentary Lease Rate Assessment
                </h3>
                <p className="text-base text-neutral-600 mt-1">
                  Instant building-specific rental valuation from Michael Vallejo&rsquo;s
                  relocation desk.
                </p>

                <form onSubmit={handleLandlordSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                      Building / Tower
                    </label>
                    <select
                      value={landlordTower}
                      onChange={(e) => setLandlordTower(e.target.value)}
                      className="w-full min-h-[48px] bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-base font-medium text-black focus:outline-none focus:border-black"
                    >
                      <option>Brickell Flatiron (1000 Brickell Plaza)</option>
                      <option>Echo Brickell (1451 Brickell Ave)</option>
                      <option>Reach &amp; Rise at Brickell City Centre</option>
                      <option>SLS Lux &amp; Brickell Heights</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                        Unit #
                      </label>
                      <input
                        type="text"
                        value={landlordUnit}
                        onChange={(e) => setLandlordUnit(e.target.value)}
                        placeholder="e.g. 4408"
                        className="w-full min-h-[48px] bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                        Layout
                      </label>
                      <select
                        value={landlordBedrooms}
                        onChange={(e) =>
                          setLandlordBedrooms(
                            e.target.value as '1 Bed' | '2 Bed' | '3 Bed / Penthouse'
                          )
                        }
                        className="w-full min-h-[48px] bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-3 text-base font-medium text-black focus:outline-none focus:border-black"
                      >
                        <option value="1 Bed">1 Bedroom</option>
                        <option value="2 Bed">2 Bedroom</option>
                        <option value="3 Bed / Penthouse">3 Bed / PH</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={landlordName}
                      onChange={(e) => setLandlordName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full min-h-[48px] bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                      Owner Email or Mobile *
                    </label>
                    <input
                      type="text"
                      required
                      value={landlordContact}
                      onChange={(e) => setLandlordContact(e.target.value)}
                      placeholder="owner@email.com or (305) 555-0199"
                      className="w-full min-h-[48px] bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                    />
                  </div>

                  {landlordError && (
                    <p className="text-sm text-rose-600 font-bold" role="alert">
                      {landlordError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={landlordSubmitting}
                    className="w-full min-h-[52px] py-4 px-5 bg-black text-white font-bold text-base rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {landlordSubmitting
                      ? 'Calculating Yield...'
                      : 'Request a Complimentary Lease Rate Assessment'}
                  </button>
                </form>

                {landlordResult && (
                  <div className="mt-5 p-4 bg-emerald-50 border border-emerald-300 rounded-xl">
                    <div className="text-sm font-bold text-emerald-900">
                      Estimated Corporate Lease Rate
                    </div>
                    <div className="text-2xl font-bold text-black font-mono mt-1 tabular-nums">
                      {landlordResult.estimatedRange}
                    </div>
                    <div className="text-sm font-medium text-emerald-800 mt-0.5">
                      Projected Gross: {landlordResult.annualizedYield} · Michael Vallejo will
                      contact you shortly.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FLOATING MOBILE MAP / LIST SWITCHER (COMPASS APP VIBE) */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 shadow-2xl rounded-full bg-black text-white p-1.5 border border-white/15">
        <button
          type="button"
          onClick={() => {
            setMobileMapOpen(!mobileMapOpen);
            document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          {mobileMapOpen ? (
            <>
              <LayoutGrid className="w-4 h-4" />
              <span>List View</span>
            </>
          ) : (
            <>
              <Map className="w-4 h-4" />
              <span>Map View</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={openRelocationCallModal}
          className="px-4 py-2.5 rounded-full text-white font-bold text-sm inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Phone className="w-4 h-4" />
          <span>Ask Michael</span>
        </button>
      </div>

      {/* CLEAN FOOTER */}
      <footer className="bg-white border-t border-neutral-200 py-12 px-4 md:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-xl font-bold text-black">
              MICHAEL VALLEJO | RESIDENTIAL ADVISORY
            </div>
            <p className="text-sm text-neutral-600 mt-1">
              Downtown Brickell Residential Specialist · 1000 Brickell Plaza, Miami, FL 33131 ·
              (305) 890-4410
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-neutral-700">
            <a href="#listings" className="hover:text-black transition-colors">
              Properties
            </a>
            <a href="#towers" className="hover:text-black transition-colors">
              Condo Guide
            </a>
            <a href="#landlords" className="hover:text-black transition-colors">
              Landlords
            </a>
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              WhatsApp Direct
            </a>
          </div>
        </div>
      </footer>

      {/* Compass Property Detail & Tour Drawer */}
      <PropertyDetailModal
        residence={selectedResidenceModal}
        intent={intent}
        onClose={() => setSelectedResidenceModal(null)}
        onSubmitTourRequest={submitLeadToBackend}
      />

      {/* Direct Relocation Call / Building Vacancy Modal */}
      <InquiryModal
        context={inquiryContext}
        onClose={() => setInquiryContext(null)}
        onSubmitLead={submitLeadToBackend}
      />
    </div>
  );
}

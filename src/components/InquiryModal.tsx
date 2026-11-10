import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, Calendar, Building2 } from 'lucide-react';
import {
  BudgetOption,
  IntentOption,
  TimelineOption
} from '../data/brickellData';

export interface InquiryModalContext {
  mode: 'relocation-call' | 'tower-vacancy' | 'off-market-unit';
  title: string;
  subtitle: string;
  targetTower?: string;
  unitDetails?: string;
  defaultIntent?: IntentOption;
  defaultTimeline?: TimelineOption;
  defaultBudget?: BudgetOption;
  personaLabel?: string;
}

interface InquiryModalProps {
  context: InquiryModalContext | null;
  onClose: () => void;
  onSubmitLead: (payload: {
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

export const InquiryModal: React.FC<InquiryModalProps> = ({
  context,
  onClose,
  onSubmitLead
}) => {
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [company, setCompany] = useState('');
  const [intent, setIntent] = useState<IntentOption>('Rent');
  const [timeline, setTimeline] = useState<TimelineOption>('Immediate / 30 Days');
  const [budget, setBudget] = useState<BudgetOption>('$5,500 – $10,000/mo');
  const [callWindow, setCallWindow] = useState('Today · 4:00 PM – 6:00 PM EST');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmation, setConfirmation] = useState<{
    personalizedAdvisoryNote: string;
  } | null>(null);

  useEffect(() => {
    if (context) {
      setIntent(context.defaultIntent || 'Rent');
      setTimeline(context.defaultTimeline || 'Immediate / 30 Days');
      setBudget(context.defaultBudget || '$5,500 – $10,000/mo');
      setConfirmation(null);
      setErrorMsg('');
    }
  }, [context]);

  if (!context) return null;

  const validateContact = (value: string) => {
    const trimmed = value.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const isPhone = /^[+\d()\-\s.]{7,20}$/.test(trimmed);
    return isEmail || isPhone || trimmed.includes('@') || /\d{7,}/.test(trimmed.replace(/\D/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!validateContact(contact)) {
      setErrorMsg('Please enter a valid mobile number or email address.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    const sourceLabel =
      context.mode === 'relocation-call'
        ? '15-Min Relocation Call'
        : context.mode === 'off-market-unit'
        ? 'Off-Market Dossier Request'
        : 'Tower Vacancy Inquiry';

    const result = await onSubmitLead({
      source: sourceLabel,
      fullName: fullName.trim(),
      contact: contact.trim(),
      companyOrAffiliation: company.trim() || context.personaLabel || 'Private Client',
      persona: context.personaLabel || 'Relocating Executive',
      intent,
      timeline,
      budget,
      targetTower: context.targetTower,
      unitDetails: context.unitDetails,
      preferredCallWindow: context.mode === 'relocation-call' ? callWindow : undefined,
      notes: notes.trim() || undefined
    });

    setSubmitting(false);
    if (result) {
      setConfirmation({
        personalizedAdvisoryNote: result.personalizedAdvisoryNote
      });
    } else {
      setErrorMsg('Unable to send inquiry right now. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div className="bg-white text-black rounded-t-3xl sm:rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-neutral-200 flex items-start justify-between gap-4 bg-white">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
              {context.mode === 'relocation-call' ? (
                <Calendar className="w-3.5 h-3.5 text-black" />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-black" />
              )}
              <span>Michael Vallejo · Direct Advisory</span>
            </div>
            <h3 id="inquiry-modal-title" className="text-2xl font-bold text-black mt-1">
              {context.title}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">{context.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-black rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmation ? (
          <div className="p-6 space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
                <Check className="w-5 h-5" />
                <span>Request Received</span>
              </div>
              <h4 className="text-xl font-bold text-black mt-2">
                Michael Vallejo Will Reach Out Shortly
              </h4>
              <p className="text-sm text-neutral-700 mt-2 leading-relaxed">
                {confirmation.personalizedAdvisoryNote}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              <a
                href={`https://wa.me/13058904410?text=${encodeURIComponent(
                  `Hi Michael, I just inquired about ${
                    context.targetTower || intent
                  } in Brickell. Looking forward to connecting.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Message Michael on WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 text-sm font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {context.targetTower && (
              <div className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm flex items-center justify-between">
                <span className="text-neutral-600 font-medium">Building:</span>
                <span className="text-black font-bold">
                  {context.targetTower}
                  {context.unitDetails ? ` · ${context.unitDetails}` : ''}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full min-h-[46px] bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                  Mobile or Email *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="(305) 555-0199 or email"
                  className="w-full min-h-[46px] bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                  Firm or City (Optional)
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Citadel, Kirkland, NYC..."
                  className="w-full min-h-[46px] bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                />
              </div>
              {context.mode === 'relocation-call' ? (
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                    Preferred Call Window
                  </label>
                  <select
                    value={callWindow}
                    onChange={(e) => setCallWindow(e.target.value)}
                    className="w-full min-h-[46px] bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-base font-medium text-black focus:outline-none focus:border-black"
                  >
                    <option>Today · 4:00 PM – 6:00 PM EST</option>
                    <option>Tomorrow · 9:00 AM – 11:30 AM EST</option>
                    <option>Tomorrow · 2:00 PM – 5:00 PM EST</option>
                    <option>This Weekend · Private Briefing</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                    Move-In Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value as TimelineOption)}
                    className="w-full min-h-[46px] bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-base font-medium text-black focus:outline-none focus:border-black"
                  >
                    <option value="Immediate / 30 Days">Immediate / 30 Days</option>
                    <option value="30–90 Days">30–90 Days</option>
                    <option value="Exploring">Exploring</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                  Looking To
                </label>
                <select
                  value={intent}
                  onChange={(e) => setIntent(e.target.value as IntentOption)}
                  className="w-full min-h-[46px] bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-base font-medium text-black focus:outline-none focus:border-black"
                >
                  <option value="Rent">Rent a Residence</option>
                  <option value="Buy">Buy a Condo</option>
                  <option value="Lease Out My Unit">Lease Out My Unit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-1.5">Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value as BudgetOption)}
                  className="w-full min-h-[46px] bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-base font-medium text-black focus:outline-none focus:border-black"
                >
                  <option value="$3,500 – $5,500/mo">$3,500 – $5,500/mo</option>
                  <option value="$5,500 – $10,000/mo">$5,500 – $10,000/mo</option>
                  <option value="$10,000+/mo or Purchase">$10,000+/mo or Purchase</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-800 mb-1.5">
                Notes or Floorplan Preferences (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. High floor bay view, 2BR + Den, private elevator"
                className="w-full min-h-[46px] bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black"
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-rose-600 font-bold" role="alert">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 text-sm font-bold text-neutral-600 hover:text-black transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-sm rounded-xl hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {submitting
                    ? 'Sending...'
                    : context.mode === 'relocation-call'
                    ? 'Confirm 15-Minute Call →'
                    : 'Inquire on Current Vacancies →'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

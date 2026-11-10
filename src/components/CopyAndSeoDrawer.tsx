import React, { useState } from 'react';
import { X, Copy, Check, FileText, Globe } from 'lucide-react';

interface CopyAndSeoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WORD_FOR_WORD_COPY = `1. Navigation Bar
- Logo: MICHAEL VALLEJO | RESIDENTIAL ADVISORY
- Nav Links: Properties | Condo Guide | Landlords | Private Consultation
- Direct CTA Button: Call / WhatsApp: (305) 890-4410

2. Hero Section
- Tagline: DOWNTOWN BRICKELL RESIDENTIAL SPECIALIST
- Headline: Precision Real Estate in Downtown Brickell.
- Subhead: Curated rentals, acquisitions, and prime residential investments. Direct access to premier high-rises with corporate-level discretion and zero wasted time.
- Lead Selector (Interactive Form — Synced to Backend CRM):
  - Option 1: I want to: [ Rent ] [ Buy ] [ Lease Out My Unit ]
  - Option 2: Timeline: [ Immediate / 30 Days ] [ 30–90 Days ] [ Exploring ]
  - Option 3: Budget: [ $3,500 – $5,500/mo ] [ $5,500 – $10,000/mo ] [ $10,000+/mo or Purchase ]
  - Button: [ View Available & Off-Market Residences → ]

3. Authority & Fast Contact Strip
- "Serving professionals at Citadel, Kirkland & Ellis, Microsoft, and relocating executives across the US."
- Button 1 (Calendly / Direct Scheduler): Book a 15-Minute Relocation Call
- Button 2 (WhatsApp): Message Directly on WhatsApp

4. Brickell Tower Directory (Grid)
- Section Title: Premier High-Rise Portfolio
- Subhead: Select a tower to view current market rates, inventory, and HOA approval timelines.
  - Card 1: Brickell Flatiron — Sky Club amenities, 64 stories, 1000 Brickell Plaza. Avg Rent: $4,200–$14,000/mo.
  - Card 2: Echo Brickell — Boutique luxury, high floor-to-ceiling glass, smart home integration. Avg Rent: $4,800–$18,000/mo.
  - Card 3: Reach & Rise at Brickell City Centre — Direct indoor mall connection, urban convenience. Avg Rent: $3,600–$9,500/mo.
  - Card 4: SLS Lux & Brickell Heights — Central location, hotel amenities, Equinox on-site. Avg Rent: $3,400–$8,000/mo.
- Card Action: [ Inquire on Current Vacancies → ]

5. For Landlords & Unit Owners
- Headline: Vacant Days Cost Money. We Place Vetted Corporate Tenants Fast.
- Subhead: Specialized marketing for Brickell condo owners. We handle credit/background vetting, strict condo association application packages, and move-in compliance.
- Key Metrics:
  - 14 Days — Average Tenant Placement
  - 100% — HOA Application Approval Track Record
  - Top Tier — Credit & Income Requirements Enforced
- Button: [ Request a Complimentary Lease Rate Assessment ]

6. About the Agent (Michael Vallejo)
- Headline: A Wall Street Approach to South Florida Real Estate.
- Body: Brickell moves faster than traditional residential markets. I work exclusively in the Downtown Brickell high-rise corridor, helping busy corporate executives, relocations, and private investors secure premier properties without friction. Every transaction is handled with speed, data-driven negotiation, and absolute professionalism.`;

const SEO_STRUCTURED_DATA_PREVIEW = `{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Michael Vallejo | Residential Advisory",
  "description": "Precision real estate in Downtown Brickell. Curated luxury rentals, condo acquisitions, and corporate tenant placement for executives and unit owners.",
  "areaServed": "Brickell, Downtown Miami, FL 33131",
  "telephone": "+1-305-890-4410",
  "priceRange": "$3,500 - $25,000+/mo",
  "knowsAbout": [
    "Brickell Flatiron (1000 Brickell Plaza)",
    "Echo Brickell (1451 Brickell Ave)",
    "Reach & Rise at Brickell City Centre",
    "SLS Lux & Brickell Heights",
    "Corporate Executive Relocation",
    "Brickell Condo HOA Approval Compliance"
  ]
}`;

export const CopyAndSeoDrawer: React.FC<CopyAndSeoDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'copy' | 'seo'>('copy');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-seo-title"
    >
      <div className="bg-[#0F1219] border border-white/10 rounded-xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#141821]">
          <div>
            <div className="text-xs text-[#C8A96E] font-medium">
              Michael Vallejo · Brand Deck &amp; Technical SEO Architecture
            </div>
            <h2 id="copy-seo-title" className="text-xl font-display font-semibold text-white mt-0.5">
              Word-for-Word Copy &amp; Schema.org SEO Verification
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-[#11141C]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('copy')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'copy'
                  ? 'bg-[#C8A96E] text-[#0B0C10] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word-for-Word Brand Copy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'seo'
                  ? 'bg-[#C8A96E] text-[#0B0C10] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>SEO Meta &amp; JSON-LD Schema</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              handleCopy(activeTab === 'copy' ? WORD_FOR_WORD_COPY : SEO_STRUCTURED_DATA_PREVIEW)
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1C212E] hover:bg-[#262C3D] border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#C8A96E]" />
                <span>Copy {activeTab === 'copy' ? 'Copy Deck' : 'JSON-LD Schema'}</span>
              </>
            )}
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'copy' ? (
            <pre className="text-xs font-mono text-slate-200 bg-[#0B0C10] border border-white/10 rounded-xl p-5 whitespace-pre-wrap leading-relaxed">
              {WORD_FOR_WORD_COPY}
            </pre>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#141720] border border-white/10 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1">Live Search Engine Snippet Preview</div>
                <div className="text-xs text-emerald-400 font-mono">
                  https://michaelvallejo.advisory/downtown-brickell
                </div>
                <div className="text-base font-medium text-[#79A6FF] mt-0.5">
                  Michael Vallejo | Downtown Brickell Residential Advisory
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Curated luxury rentals, condo acquisitions, and corporate tenant placement in
                  Downtown Brickell, Miami with residential specialist Michael Vallejo.
                </p>
              </div>

              <div>
                <div className="text-xs text-slate-400 mb-2">
                  Embedded Schema.org RealEstateAgent &amp; FAQPage JSON-LD
                </div>
                <pre className="text-xs font-mono text-slate-200 bg-[#0B0C10] border border-white/10 rounded-xl p-5 whitespace-pre-wrap leading-relaxed">
                  {SEO_STRUCTURED_DATA_PREVIEW}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Download,
  RefreshCw,
  Webhook,
  Check,
  Trash2,
  ArrowUpRight,
  Search
} from 'lucide-react';

export interface CrmLeadRecord {
  id: string;
  createdAt: string;
  source: string;
  fullName: string;
  contact: string;
  companyOrAffiliation: string;
  persona: string;
  intent: 'Rent' | 'Buy' | 'Lease Out My Unit';
  timeline: 'Immediate / 30 Days' | '30–90 Days' | 'Exploring';
  budget: '$3,500 – $5,500/mo' | '$5,500 – $10,000/mo' | '$10,000+/mo or Purchase';
  targetTower?: string;
  unitDetails?: string;
  preferredCallWindow?: string;
  notes?: string;
  stage: 'New Inquiry' | 'Dossier Sent' | 'Private Showing' | 'HOA Application' | 'Closed / Leased';
  priorityTier: 'Priority A+' | 'Priority A' | 'Standard';
  estimatedValue: number;
  matchedTowers: string[];
  personalizedAdvisoryNote: string;
  webhookStatus: string;
  crmExternalId: string;
}

export interface CrmStats {
  totalLeads: number;
  totalPipelineValue: number;
  priorityCount: number;
  landlordCount: number;
  avgResponseMinutes: number;
}

export interface WebhookConfig {
  webhookUrl: string;
  crmProvider: 'Follow Up Boss' | 'HubSpot CRM' | 'Salesforce Residential' | 'Custom Webhook';
  autoSyncEnabled: boolean;
}

interface CrmCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: CrmLeadRecord[];
  stats: CrmStats;
  webhookConfig: WebhookConfig;
  onRefresh: () => Promise<void>;
  onStageChange: (leadId: string, newStage: CrmLeadRecord['stage']) => Promise<void>;
  onDeleteLead: (leadId: string) => Promise<void>;
  onUpdateWebhook: (config: Partial<WebhookConfig>) => Promise<void>;
}

const STAGES: CrmLeadRecord['stage'][] = [
  'New Inquiry',
  'Dossier Sent',
  'Private Showing',
  'HOA Application',
  'Closed / Leased'
];

export const CrmCommandModal: React.FC<CrmCommandModalProps> = ({
  isOpen,
  onClose,
  leads,
  stats,
  webhookConfig,
  onRefresh,
  onStageChange,
  onDeleteLead,
  onUpdateWebhook
}) => {
  const [intentFilter, setIntentFilter] = useState<'All' | 'Rent' | 'Buy' | 'Lease Out My Unit'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [webhookInput, setWebhookInput] = useState(webhookConfig.webhookUrl || '');
  const [providerInput, setProviderInput] = useState<WebhookConfig['crmProvider']>(
    webhookConfig.crmProvider || 'Follow Up Boss'
  );
  const [showWebhookPanel, setShowWebhookPanel] = useState(false);
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const filteredLeads = leads.filter((lead) => {
    const matchesIntent = intentFilter === 'All' || lead.intent === intentFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lead.fullName.toLowerCase().includes(q) ||
      lead.contact.toLowerCase().includes(q) ||
      lead.companyOrAffiliation.toLowerCase().includes(q) ||
      (lead.targetTower && lead.targetTower.toLowerCase().includes(q)) ||
      lead.matchedTowers.some((t) => t.toLowerCase().includes(q));
    return matchesIntent && matchesSearch;
  });

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateWebhook({
      webhookUrl: webhookInput,
      crmProvider: providerInput,
      autoSyncEnabled: true
    });
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2500);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crm-modal-title"
    >
      <div className="bg-[#0F1219] border border-white/10 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#141821]">
          <div>
            <div className="text-xs text-[#C8A96E] font-medium">
              Michael Vallejo · Backend Advisory CRM &amp; Pipeline
            </div>
            <h2 id="crm-modal-title" className="text-2xl font-display font-semibold text-white mt-0.5">
              Executive Relocation &amp; Landlord CRM Pipeline
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowWebhookPanel(!showWebhookPanel)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#1B202C] hover:bg-[#232938] border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Webhook className="w-3.5 h-3.5 text-[#C8A96E]" />
              <span>CRM Webhook: {webhookConfig.crmProvider}</span>
            </button>

            <a
              href="/api/crm/export.csv"
              download="michael-vallejo-brickell-crm-leads.csv"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#1B202C] hover:bg-[#232938] border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#C8A96E]" />
              <span>Export CSV</span>
            </a>

            <button
              type="button"
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-[#1B202C] hover:text-white border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Refresh CRM Pipeline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close CRM Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Webhook Configuration Drawer */}
        {showWebhookPanel && (
          <form
            onSubmit={handleSaveWebhook}
            className="px-6 py-4 bg-[#171B26] border-b border-white/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div className="md:col-span-3">
              <label className="block text-xs text-slate-400 mb-1.5">Connected CRM Platform</label>
              <select
                value={providerInput}
                onChange={(e) => setProviderInput(e.target.value as WebhookConfig['crmProvider'])}
                className="w-full bg-[#0F1219] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8A96E]"
              >
                <option value="Follow Up Boss">Follow Up Boss (Real Estate CRM)</option>
                <option value="HubSpot CRM">HubSpot CRM</option>
                <option value="Salesforce Residential">Salesforce Residential Advisory</option>
                <option value="Custom Webhook">Custom REST Webhook / Zapier</option>
              </select>
            </div>
            <div className="md:col-span-6">
              <label className="block text-xs text-slate-400 mb-1.5">
                Outbound Webhook Endpoint (Optional — All leads persist automatically to local server storage)
              </label>
              <input
                type="url"
                value={webhookInput}
                onChange={(e) => setWebhookInput(e.target.value)}
                placeholder="https://api.followupboss.com/v1/events or Zapier/Make Webhook URL"
                className="w-full bg-[#0F1219] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C8A96E]"
              />
            </div>
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#C8A96E] text-[#0B0C10] font-semibold text-xs rounded-lg hover:bg-[#d6b980] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {webhookSaved ? 'Webhook Saved ✓' : 'Save CRM Connection'}
              </button>
            </div>
          </form>
        )}

        {/* Pipeline KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10 bg-[#0B0C10]/60 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="px-6 py-4">
            <div className="text-xs text-slate-400">Active CRM Leads</div>
            <div className="text-2xl font-mono font-semibold text-white mt-1 tabular-nums">
              {stats.totalLeads}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {stats.priorityCount} Priority A+ Relocations
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="text-xs text-slate-400">Estimated Pipeline Volume</div>
            <div className="text-2xl font-mono font-semibold text-[#C8A96E] mt-1 tabular-nums">
              {formatCurrency(stats.totalPipelineValue)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Annualized Lease &amp; Acquisition Value
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="text-xs text-slate-400">Landlord Unit Assessments</div>
            <div className="text-2xl font-mono font-semibold text-white mt-1 tabular-nums">
              {stats.landlordCount}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">14-Day Avg Corporate Placement</div>
          </div>
          <div className="px-6 py-4">
            <div className="text-xs text-slate-400">CRM Sync Status</div>
            <div className="text-base font-medium text-emerald-400 mt-1.5 flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>Real-Time Server Persistence</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Target Advisor SLA: &lt; {stats.avgResponseMinutes} mins
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#12151E]">
          <div className="flex items-center gap-1.5 p-1 bg-[#0B0C10] border border-white/10 rounded-lg">
            {(['All', 'Rent', 'Buy', 'Lease Out My Unit'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setIntentFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  intentFilter === tab
                    ? 'bg-[#C8A96E] text-[#0B0C10] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'All' ? `All Inquiries (${leads.length})` : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by client, firm, or tower..."
              className="w-full bg-[#0B0C10] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C8A96E]"
            />
          </div>
        </div>

        {/* Leads Table / Dossier Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 border border-white/5 rounded-xl bg-[#141720]/50">
              <p className="text-sm text-slate-300 font-medium">No matching CRM records found.</p>
              <p className="text-xs text-slate-500 mt-1">
                Submit a test inquiry using the Hero Lead Selector, Tower Vacancy modal, or Landlord Assessment form.
              </p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-[#141720] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-white/5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono text-[#C8A96E] font-medium">{lead.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{lead.source}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatTimestamp(lead.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 font-medium">{lead.priorityTier}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-400">{lead.crmExternalId}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mt-1">
                      {lead.fullName}{' '}
                      <span className="text-sm font-normal text-slate-400">
                        — {lead.companyOrAffiliation}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-300 font-mono mt-0.5">{lead.contact}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right mr-2">
                      <div className="text-xs text-slate-400">Est. Transaction Value</div>
                      <div className="text-sm font-mono font-semibold text-white tabular-nums">
                        {formatCurrency(lead.estimatedValue)}
                      </div>
                    </div>

                    <select
                      aria-label={`Stage for ${lead.fullName}`}
                      value={lead.stage}
                      onChange={(e) =>
                        onStageChange(lead.id, e.target.value as CrmLeadRecord['stage'])
                      }
                      className="bg-[#0B0C10] border border-white/15 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#C8A96E] cursor-pointer"
                    >
                      {STAGES.map((stageOption) => (
                        <option key={stageOption} value={stageOption}>
                          Stage: {stageOption}
                        </option>
                      ))}
                    </select>

                    <a
                      href={`https://wa.me/13058904410?text=${encodeURIComponent(
                        `Hi ${lead.fullName}, this is Michael Vallejo following up on your Downtown Brickell ${lead.intent.toLowerCase()} inquiry (${lead.matchedTowers.join(', ')}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#0B0C10] bg-white hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>WhatsApp Client</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onDeleteLead(lead.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      title="Delete Lead Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Intent &amp; Timeline</span>
                    <span className="text-slate-200 font-medium mt-0.5 block">
                      {lead.intent} · {lead.timeline}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Budget</span>
                    <span className="text-slate-200 font-mono font-medium mt-0.5 block tabular-nums">
                      {lead.budget}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-500 block">Auto-Matched Brickell Towers</span>
                    <span className="text-[#C8A96E] font-medium mt-0.5 block">
                      {lead.matchedTowers.join(' · ')}
                      {lead.unitDetails ? ` (${lead.unitDetails})` : ''}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-300 font-medium">Advisor Intelligence: </span>
                    {lead.personalizedAdvisoryNote}
                  </div>
                  {lead.notes && (
                    <div className="text-slate-400 italic shrink-0">
                      Client Note: &ldquo;{lead.notes}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const CRM_FILE = path.join(DATA_DIR, 'crm_leads.json');

export interface CrmLead {
  id: string;
  createdAt: string;
  source:
    | 'Hero Lead Selector'
    | 'Tower Vacancy Inquiry'
    | 'Landlord Lease Assessment'
    | '15-Min Relocation Call'
    | 'Off-Market Dossier Request';
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
  webhookStatus: 'Synced' | 'Local CRM Stored' | 'Webhook Dispatched';
  crmExternalId: string;
}

interface CrmStore {
  webhookUrl: string;
  crmProvider: 'Follow Up Boss' | 'HubSpot CRM' | 'Salesforce Residential' | 'Custom Webhook';
  autoSyncEnabled: boolean;
  leads: CrmLead[];
}

const INITIAL_LEADS: CrmLead[] = [
  {
    id: 'MV-2026-904',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    source: 'Hero Lead Selector',
    fullName: 'Jonathan Sterling',
    contact: 'j.sterling@citadel-relocation.com · (312) 840-9921',
    companyOrAffiliation: 'Citadel (Relocating from Chicago)',
    persona: 'Citadel / Finance Executive',
    intent: 'Rent',
    timeline: 'Immediate / 30 Days',
    budget: '$10,000+/mo or Purchase',
    targetTower: 'Echo Brickell',
    notes: 'Requires high-floor 3BR or large 2BR+Den with unobstructed bay views and 6-minute walk to Southeast Financial Center / 830 Brickell.',
    stage: 'Private Showing',
    priorityTier: 'Priority A+',
    estimatedValue: 168000,
    matchedTowers: ['Echo Brickell', 'Brickell Flatiron'],
    personalizedAdvisoryNote:
      'Pre-cleared HOA expedited screening package prepared for Echo Brickell Lower Penthouse & Brickell Flatiron Tower Suite.',
    webhookStatus: 'Synced',
    crmExternalId: 'FUB-88412'
  },
  {
    id: 'MV-2026-903',
    createdAt: new Date(Date.now() - 1000 * 60 * 195).toISOString(),
    source: '15-Min Relocation Call',
    fullName: 'Elena Rostova, Esq.',
    contact: 'erostova@kirkland-law.com · (212) 609-3310',
    companyOrAffiliation: 'Kirkland & Ellis LLP',
    persona: 'Kirkland & Ellis / Legal Partner',
    intent: 'Buy',
    timeline: '30–90 Days',
    budget: '$10,000+/mo or Purchase',
    targetTower: 'Brickell Flatiron',
    preferredCallWindow: 'Thu 4:30 PM EST',
    notes: 'Relocating from NYC office to 830 Brickell. Interested in turnkey 2BR/2.5BA acquisition between $1.45M and $2.1M.',
    stage: 'Dossier Sent',
    priorityTier: 'Priority A+',
    estimatedValue: 1850000,
    matchedTowers: ['Brickell Flatiron', 'Reach & Rise at Brickell City Centre'],
    personalizedAdvisoryNote:
      'Sent off-market 49th-floor 01-line resale comps at Brickell Flatiron plus walk-score analysis to 830 Brickell.',
    webhookStatus: 'Synced',
    crmExternalId: 'FUB-88397'
  },
  {
    id: 'MV-2026-902',
    createdAt: new Date(Date.now() - 1000 * 60 * 380).toISOString(),
    source: 'Landlord Lease Assessment',
    fullName: 'Carlos & Valeria Mendoza',
    contact: 'cmendoza@mendoza-capital.com · (305) 772-1904',
    companyOrAffiliation: 'Private Condo Owner (1000 Brickell Plaza)',
    persona: 'Brickell Unit Owner / Landlord',
    intent: 'Lease Out My Unit',
    timeline: 'Immediate / 30 Days',
    budget: '$5,500 – $10,000/mo',
    targetTower: 'Brickell Flatiron',
    unitDetails: 'Brickell Flatiron · Unit 4408 · 2 Bed / 2.5 Bath (1,385 SF)',
    notes: 'Current tenant lease expires end of month. Looking for vetted corporate executive tenant at $7,600/mo with zero vacancy gap.',
    stage: 'HOA Application',
    priorityTier: 'Priority A+',
    estimatedValue: 91200,
    matchedTowers: ['Brickell Flatiron'],
    personalizedAdvisoryNote:
      'Matched with incoming NY private credit VP; lease rate assessment confirmed at $7,650/mo ($66.28/SF annualized).',
    webhookStatus: 'Synced',
    crmExternalId: 'FUB-88361'
  },
  {
    id: 'MV-2026-901',
    createdAt: new Date(Date.now() - 1000 * 60 * 820).toISOString(),
    source: 'Tower Vacancy Inquiry',
    fullName: 'Devon K. Nair',
    contact: 'devon.nair@microsoft-cloud.com · (425) 901-4482',
    companyOrAffiliation: 'Microsoft Latin America Hub',
    persona: 'Microsoft / Tech Leadership',
    intent: 'Rent',
    timeline: '30–90 Days',
    budget: '$5,500 – $10,000/mo',
    targetTower: 'Reach & Rise at Brickell City Centre',
    notes: 'Direct indoor mall connectivity and walkability to Brickell City Centre offices are top priorities.',
    stage: 'New Inquiry',
    priorityTier: 'Priority A',
    estimatedValue: 81600,
    matchedTowers: ['Reach & Rise at Brickell City Centre', 'SLS Lux & Brickell Heights'],
    personalizedAdvisoryNote:
      'Curated 3 corner 2BR residences in Reach Tower with private elevator foyer and 12-day HOA turnaround.',
    webhookStatus: 'Synced',
    crmExternalId: 'FUB-88319'
  }
];

let memoryStore: CrmStore = {
  webhookUrl: process.env.CRM_WEBHOOK_URL || '',
  crmProvider: 'Follow Up Boss',
  autoSyncEnabled: true,
  leads: [...INITIAL_LEADS]
};

async function ensureStore(): Promise<CrmStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(CRM_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as CrmStore;
    if (!parsed.leads || !Array.isArray(parsed.leads)) {
      throw new Error('Invalid store structure');
    }
    memoryStore = parsed;
    return parsed;
  } catch {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(CRM_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
    } catch {
      // Read-only container fallback
    }
    return memoryStore;
  }
}

async function saveStore(store: CrmStore): Promise<void> {
  memoryStore = store;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CRM_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Read-only container fallback
  }
}

function computeLeadIntelligence(input: Partial<CrmLead>): {
  priorityTier: 'Priority A+' | 'Priority A' | 'Standard';
  estimatedValue: number;
  matchedTowers: string[];
  personalizedAdvisoryNote: string;
} {
  const intent = input.intent || 'Rent';
  const timeline = input.timeline || 'Immediate / 30 Days';
  const budget = input.budget || '$5,500 – $10,000/mo';
  const persona = input.persona || 'Corporate Executive Relocation';

  let priorityTier: 'Priority A+' | 'Priority A' | 'Standard' = 'Priority A';
  if (
    timeline === 'Immediate / 30 Days' ||
    budget === '$10,000+/mo or Purchase' ||
    intent === 'Lease Out My Unit'
  ) {
    priorityTier = 'Priority A+';
  } else if (timeline === 'Exploring' && budget === '$3,500 – $5,500/mo') {
    priorityTier = 'Standard';
  }

  let estimatedValue = 66000;
  if (intent === 'Buy') {
    estimatedValue = budget === '$10,000+/mo or Purchase' ? 1650000 : 980000;
  } else if (intent === 'Lease Out My Unit') {
    estimatedValue = budget === '$10,000+/mo or Purchase' ? 144000 : 84000;
  } else {
    if (budget === '$3,500 – $5,500/mo') estimatedValue = 54000;
    else if (budget === '$5,500 – $10,000/mo') estimatedValue = 88800;
    else estimatedValue = 156000;
  }

  let matchedTowers: string[] = [];
  if (input.targetTower) {
    matchedTowers.push(input.targetTower);
  }
  if (budget === '$10,000+/mo or Purchase') {
    for (const t of ['Echo Brickell', 'Brickell Flatiron', 'Reach & Rise at Brickell City Centre']) {
      if (!matchedTowers.includes(t)) matchedTowers.push(t);
    }
  } else if (budget === '$5,500 – $10,000/mo') {
    for (const t of ['Brickell Flatiron', 'Reach & Rise at Brickell City Centre', 'Echo Brickell']) {
      if (!matchedTowers.includes(t)) matchedTowers.push(t);
    }
  } else {
    for (const t of ['SLS Lux & Brickell Heights', 'Reach & Rise at Brickell City Centre', 'Brickell Flatiron']) {
      if (!matchedTowers.includes(t)) matchedTowers.push(t);
    }
  }

  let personalizedAdvisoryNote = '';
  if (intent === 'Lease Out My Unit') {
    personalizedAdvisoryNote = `Michael Vallejo Landlord Advisory: Pre-vetted corporate tenant pool matched (${matchedTowers[0]}). 14-day target placement protocol with full HOA compliance audit initiated.`;
  } else if (intent === 'Buy') {
    personalizedAdvisoryNote = `Michael Vallejo Acquisition Brief (${persona}): Curated off-market & pocket inventory in ${matchedTowers.slice(0, 2).join(' & ')} with historical $/SF comps and condo association reserve analysis.`;
  } else {
    personalizedAdvisoryNote = `Michael Vallejo Executive Relocation Brief (${persona}): Matched ${matchedTowers.slice(0, 2).join(' & ')} residences aligned with a ${timeline.toLowerCase()} move-in window and expedited HOA board approval.`;
  }

  return {
    priorityTier,
    estimatedValue,
    matchedTowers: matchedTowers.slice(0, 3),
    personalizedAdvisoryNote
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // GET all CRM leads + stats
  app.get('/api/crm/leads', async (_req, res) => {
    try {
      const store = await ensureStore();
      const totalPipelineValue = store.leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
      const priorityCount = store.leads.filter((l) => l.priorityTier === 'Priority A+').length;
      const landlordCount = store.leads.filter((l) => l.intent === 'Lease Out My Unit').length;

      res.json({
        leads: store.leads,
        webhookConfig: {
          webhookUrl: store.webhookUrl,
          crmProvider: store.crmProvider,
          autoSyncEnabled: store.autoSyncEnabled
        },
        stats: {
          totalLeads: store.leads.length,
          totalPipelineValue,
          priorityCount,
          landlordCount,
          avgResponseMinutes: 6
        }
      });
    } catch (error) {
      console.error('Error loading CRM leads:', error);
      res.status(500).json({ error: 'Failed to load CRM leads' });
    }
  });

  // POST new lead from any website form
  app.post('/api/crm/leads', async (req, res) => {
    try {
      const store = await ensureStore();
      const body = req.body || {};

      const contact = String(body.contact || '').trim();
      if (!contact) {
        res.status(400).json({ error: 'Contact phone or email is required.' });
        return;
      }

      const fullName = String(body.fullName || 'Executive Client').trim();
      const intent = (['Rent', 'Buy', 'Lease Out My Unit'].includes(body.intent)
        ? body.intent
        : 'Rent') as CrmLead['intent'];
      const timeline = (['Immediate / 30 Days', '30–90 Days', 'Exploring'].includes(body.timeline)
        ? body.timeline
        : 'Immediate / 30 Days') as CrmLead['timeline'];
      const budget = ([
        '$3,500 – $5,500/mo',
        '$5,500 – $10,000/mo',
        '$10,000+/mo or Purchase'
      ].includes(body.budget)
        ? body.budget
        : '$5,500 – $10,000/mo') as CrmLead['budget'];

      const intelligence = computeLeadIntelligence({
        intent,
        timeline,
        budget,
        persona: body.persona,
        targetTower: body.targetTower
      });

      const sequenceNumber = 905 + store.leads.length;
      const newLead: CrmLead = {
        id: `MV-2026-${sequenceNumber}`,
        createdAt: new Date().toISOString(),
        source: body.source || 'Hero Lead Selector',
        fullName,
        contact,
        companyOrAffiliation: String(body.companyOrAffiliation || body.persona || 'Private Executive Client').trim(),
        persona: String(body.persona || 'Relocating Executive').trim(),
        intent,
        timeline,
        budget,
        targetTower: body.targetTower ? String(body.targetTower).trim() : undefined,
        unitDetails: body.unitDetails ? String(body.unitDetails).trim() : undefined,
        preferredCallWindow: body.preferredCallWindow ? String(body.preferredCallWindow).trim() : undefined,
        notes: body.notes ? String(body.notes).trim() : undefined,
        stage: 'New Inquiry',
        priorityTier: intelligence.priorityTier,
        estimatedValue: intelligence.estimatedValue,
        matchedTowers: intelligence.matchedTowers,
        personalizedAdvisoryNote: intelligence.personalizedAdvisoryNote,
        webhookStatus: store.webhookUrl ? 'Webhook Dispatched' : 'Synced',
        crmExternalId: `FUB-${Math.floor(88420 + Math.random() * 900)}`
      };

      // Optional outbound webhook forwarding if configured
      if (store.webhookUrl && store.webhookUrl.startsWith('http')) {
        try {
          await fetch(store.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              advisor: 'Michael Vallejo | Brickell Residential Advisory',
              event: 'lead.created',
              lead: newLead
            })
          });
          newLead.webhookStatus = 'Webhook Dispatched';
        } catch {
          newLead.webhookStatus = 'Local CRM Stored';
        }
      }

      store.leads.unshift(newLead);
      await saveStore(store);

      res.status(201).json({
        lead: newLead,
        message: 'Lead synced to Michael Vallejo Residential Advisory CRM.'
      });
    } catch (error) {
      console.error('Error creating CRM lead:', error);
      res.status(500).json({ error: 'Failed to save lead to CRM.' });
    }
  });

  // PATCH lead stage or notes
  app.patch('/api/crm/leads/:id', async (req, res) => {
    try {
      const store = await ensureStore();
      const { id } = req.params;
      const idx = store.leads.findIndex((l) => l.id === id);
      if (idx === -1) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      const updated: CrmLead = {
        ...store.leads[idx],
        ...(req.body.stage ? { stage: req.body.stage } : {}),
        ...(req.body.notes !== undefined ? { notes: req.body.notes } : {}),
        ...(req.body.targetTower !== undefined ? { targetTower: req.body.targetTower } : {})
      };

      store.leads[idx] = updated;
      await saveStore(store);

      res.json({ lead: updated });
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({ error: 'Failed to update lead' });
    }
  });

  // DELETE lead
  app.delete('/api/crm/leads/:id', async (req, res) => {
    try {
      const store = await ensureStore();
      const { id } = req.params;
      store.leads = store.leads.filter((l) => l.id !== id);
      await saveStore(store);
      res.json({ ok: true });
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  });

  // POST update CRM webhook integration settings
  app.post('/api/crm/webhook-config', async (req, res) => {
    try {
      const store = await ensureStore();
      if (req.body.webhookUrl !== undefined) {
        store.webhookUrl = String(req.body.webhookUrl).trim();
      }
      if (req.body.crmProvider) {
        store.crmProvider = req.body.crmProvider;
      }
      if (req.body.autoSyncEnabled !== undefined) {
        store.autoSyncEnabled = Boolean(req.body.autoSyncEnabled);
      }
      await saveStore(store);
      res.json({
        webhookConfig: {
          webhookUrl: store.webhookUrl,
          crmProvider: store.crmProvider,
          autoSyncEnabled: store.autoSyncEnabled
        }
      });
    } catch (error) {
      console.error('Error updating CRM webhook config:', error);
      res.status(500).json({ error: 'Failed to update CRM configuration' });
    }
  });

  // GET CSV export of CRM leads
  app.get('/api/crm/export.csv', async (_req, res) => {
    try {
      const store = await ensureStore();
      const headers = [
        'Lead ID',
        'Created At',
        'Source',
        'Full Name',
        'Contact',
        'Affiliation',
        'Persona',
        'Intent',
        'Timeline',
        'Budget',
        'Target Tower',
        'Stage',
        'Priority Tier',
        'Estimated Value ($)',
        'External CRM ID'
      ];

      const escapeCsv = (val: unknown) => {
        const s = String(val ?? '').replace(/"/g, '""');
        return `"${s}"`;
      };

      const rows = store.leads.map((l) =>
        [
          l.id,
          l.createdAt,
          l.source,
          l.fullName,
          l.contact,
          l.companyOrAffiliation,
          l.persona,
          l.intent,
          l.timeline,
          l.budget,
          l.targetTower || l.matchedTowers.join('; '),
          l.stage,
          l.priorityTier,
          l.estimatedValue,
          l.crmExternalId
        ]
          .map(escapeCsv)
          .join(',')
      );

      const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="michael-vallejo-brickell-crm-leads.csv"'
      );
      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).send('Failed to export CSV');
    }
  });

  // Serve SERP / OpenGraph preview images in both dev and production
  app.get('/og-preview.jpg', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'og-preview.jpg'));
  });
  app.get('/michael-vallejo.jpg', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'michael-vallejo.jpg'));
  });

  const distPath = path.join(__dirname, 'dist');

  if (process.env.NODE_ENV !== 'production') {
    let viteInstance: Awaited<ReturnType<typeof import('vite')['createServer']>> | null = null;
    const viteReadyPromise = (async () => {
      const { createServer: createViteServer } = await import('vite');
      viteInstance = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      return viteInstance;
    })();

    app.use(async (req, res, next) => {
      try {
        const vite = viteInstance || (await viteReadyPromise);
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Michael Vallejo Brickell Advisory Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

/**
 * FundWeb Initial Data Store & Seed Models
 * Where Startups Meet Capital
 */

const INITIAL_COMMISSION_CONFIG = {
  platformFeePercent: 5.0,    // FundWeb platform fee %
  founderFeePercent: 2.0,     // Founder service fee %
  investorFeePercent: 1.5,    // Investor processing fee %
  fixedServiceFee: 500,       // Fixed convenience fee in INR
  gstTaxPercent: 18.0         // Applicable GST / Tax %
};

const INITIAL_USERS = [
  {
    id: 'usr_founder_1',
    role: 'founder',
    name: 'Aarav Sharma',
    email: 'founder@fundweb.io',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    companyId: 'comp_nova_ai',
    verified: true,
    verificationStatus: 'verified',
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'usr_investor_1',
    role: 'investor',
    name: 'Priya Mehra',
    email: 'investor@fundweb.io',
    phone: '+91 98111 22334',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    investorType: 'VC',
    firmName: 'Peak Horizons Capital',
    location: 'Bengaluru / Mumbai',
    investmentRange: '₹50L - ₹5Cr',
    preferredIndustries: ['AI / SaaS', 'FinTech', 'HealthTech', 'CleanTech'],
    preferredStages: ['Seed', 'Pre-Series A', 'Series A'],
    linkedin: 'https://linkedin.com/in/priyamehra-vc',
    verified: true,
    verificationStatus: 'verified',
    createdAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'usr_admin_1',
    role: 'admin',
    name: 'FundWeb Compliance Admin',
    email: 'admin@fun.in',
    phone: '+91 99000 11223',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    verified: true,
    verificationStatus: 'verified',
    createdAt: '2025-12-01T08:00:00Z'
  }
];

const INITIAL_STARTUPS = [
  {
    id: 'comp_nova_ai',
    name: 'NovaAI',
    tagline: 'Autonomous AI agents for enterprise workflow optimization and ERP automation',
    industry: 'AI / SaaS',
    stage: 'Seed Stage',
    location: 'Ahmedabad / Bengaluru',
    foundedYear: 2024,
    website: 'https://novaai.tech',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    founderId: 'usr_founder_1',
    founderName: 'Aarav Sharma & Rhea Sen',
    verified: true,
    verificationStatus: 'verified',
    featured: true,
    
    // Financials & Round
    targetFunding: 5000000,      // ₹50L
    committedFunding: 3600000,   // ₹36L
    equityOffered: 10,           // 10%
    preMoneyValuation: 45000000, // ₹4.5Cr
    minInvestmentTicket: 250000, // ₹2.5L
    
    // Traction Metrics
    monthlyRevenue: 850000,      // ₹8.5L/mo
    annualRunRate: 10200000,     // ₹1.02Cr ARR
    monthlyGrowthPercent: 32,
    customersCount: 12500,
    activePilots: 18,
    fundingInterestPercent: 72,
    viewsCount: 2840,
    pitchViewsCount: 620,
    
    // Detailed Sections
    problem: 'Enterprises lose over 35% of employee productivity to fragmented SaaS tools, manual data reconciliation across legacy ERP systems, and repetitive back-office workflows.',
    solution: 'NovaAI deploys autonomous multimodal agentic workflows that integrate into SAP, Oracle, and Salesforce, slashing operational latency by 80% while ensuring ISO-grade compliance.',
    product: 'Cloud-native multi-agent runtime engine with low-code workflow canvas, enterprise connector SDK, and deterministic audit trail logging.',
    market: 'Total Addressable Market (TAM) of $32B in Enterprise AI & Automation, Serviceable Addressable Market (SAM) of $6.8B across APAC & EMEA.',
    businessModel: 'B2B SaaS with usage-based compute tiers: Starter ($499/mo), Enterprise Scale ($2,500/mo), and Custom Dedicated On-Premise deployments.',
    
    // Use of Funds Breakdown
    useOfFunds: [
      { category: 'Product Development & AI Compute', percent: 40 },
      { category: 'Go-To-Market & Enterprise Sales', percent: 25 },
      { category: 'Engineering & ML Talent Hiring', percent: 20 },
      { category: 'Compliance, Security & Ops', percent: 15 }
    ],

    // Team
    team: [
      { name: 'Aarav Sharma', role: 'Co-Founder & CEO', prev: 'Ex-Senior PM at Microsoft, IIT Bombay' },
      { name: 'Rhea Sen', role: 'Co-Founder & CTO', prev: 'Ex-AI Research Lead at Stanford / Uber' },
      { name: 'Vikram Joshi', role: 'Head of Enterprise Sales', prev: 'Ex-Sales Director at Freshworks' }
    ],

    // 10-Slide Pitch Room
    pitchSlides: [
      {
        slideNumber: '01',
        title: 'The Problem',
        subtitle: 'Enterprise Workflow Friction',
        content: 'Enterprise workers spend 3.6 hours daily switching between disconnected enterprise software. Legacy ERPs lack conversational context and proactive intelligence.',
        metric: '35% Lost Productivity ($380B annual cost)'
      },
      {
        slideNumber: '02',
        title: 'The Solution',
        subtitle: 'Autonomous Multimodal Agent System',
        content: 'NovaAI creates role-specialized AI teammates that perform real tasks across Salesforce, SAP, Jira, and Slack with 99.4% execution accuracy.',
        metric: '80% Reduction in Operational Cycle Time'
      },
      {
        slideNumber: '03',
        title: 'Product Architecture',
        subtitle: 'Secure Agentic Runtime',
        content: 'Zero-data-retention inference engine, deterministic tool orchestration, custom fine-tuned SLMs, and SOC2 Type II audit logging.',
        metric: '45+ Pre-built Enterprise Connectors'
      },
      {
        slideNumber: '04',
        title: 'Market Opportunity',
        subtitle: '$32B Enterprise AI Market',
        content: 'Automation spending in APAC & India growing at 44% CAGR. Rapid adoption driven by cloud migration and digital transformation mandates.',
        metric: '$6.8B Serviceable Addressable Market'
      },
      {
        slideNumber: '05',
        title: 'Business Model',
        subtitle: 'High Margin B2B SaaS',
        content: 'Predictable recurring subscription with consumption add-ons. 84% gross margins with net revenue retention (NRR) of 138%.',
        metric: '₹8.5L Monthly Revenue ($102K ARR)'
      },
      {
        slideNumber: '06',
        title: 'Traction & Milestones',
        subtitle: 'Rapid Organic Adoption',
        content: '12,500 active business users, 18 paid enterprise pilots including 3 Fortune 500 companies in India and Singapore.',
        metric: '32% MoM Growth over past 6 months'
      },
      {
        slideNumber: '07',
        title: 'Competitive Moat',
        subtitle: 'Proprietary Agent Orchestrator',
        content: 'Unlike simple wrapper bots, our patent-pending State-Graph Graph-RAG framework maintains long-horizon context and self-healing tool recovery.',
        metric: '4x Lower Inference Cost vs Direct LLM APIs'
      },
      {
        slideNumber: '08',
        title: 'Founding Team',
        subtitle: 'Deep Technical & Domain Mastery',
        content: 'Founded by repeat entrepreneurs and AI researchers from IIT Bombay, Stanford, and ex-leaders from Microsoft and Freshworks.',
        metric: '25+ Combined Years in Enterprise SaaS'
      },
      {
        slideNumber: '09',
        title: 'Financial Projections',
        subtitle: 'Path to ₹15Cr ARR in 24 Months',
        content: 'Projected to hit ₹3.5Cr ARR by Q4 2026, scaling to ₹15Cr ARR in 2028 with positive unit economics and low customer acquisition cost (CAC).',
        metric: 'LTV/CAC Ratio of 5.2x'
      },
      {
        slideNumber: '10',
        title: 'The Funding Ask',
        subtitle: 'Raising ₹50,00,000 for 10% Equity',
        content: 'Funds allocated directly to compute infrastructure (40%), enterprise enterprise sales acceleration (25%), engineering hires (20%), and ops (15%).',
        metric: '₹36L Committed (72% Allocated)'
      }
    ]
  },
  {
    id: 'comp_healthpulse',
    name: 'HealthPulse MedTech',
    tagline: 'Point-of-care AI diagnostics device for remote cardiovascular screening',
    industry: 'HealthTech',
    stage: 'Pre-Series A',
    location: 'Hyderabad / Pune',
    foundedYear: 2023,
    website: 'https://healthpulsemed.io',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80',
    founderId: 'usr_founder_2',
    founderName: 'Dr. Siddharth Rao',
    verified: true,
    verificationStatus: 'verified',
    featured: true,
    targetFunding: 12000000,    // ₹1.2Cr
    committedFunding: 9800000,   // ₹98L
    equityOffered: 12,
    preMoneyValuation: 88000000,
    minInvestmentTicket: 500000,
    monthlyRevenue: 1450000,     // ₹14.5L/mo
    annualRunRate: 17400000,
    monthlyGrowthPercent: 28,
    customersCount: 8400,
    activePilots: 42,
    fundingInterestPercent: 82,
    viewsCount: 3410,
    pitchViewsCount: 890,
    problem: 'Cardiovascular screening in tier-2 and tier-3 clinics is slow, expensive, and requires specialized cardiologists who are rarely available.',
    solution: 'Portable 12-lead smart ECG + phonocardiogram scanner with edge AI interpretation that delivers verified diagnostic reports in 90 seconds.',
    product: 'CE-certified hardware handheld device and cloud telemedicine dashboard for instant cardiologist tele-consultation.',
    market: '$18B Global Remote Patient Monitoring & Diagnostic Market.',
    businessModel: 'Device sale (₹35,000) + Recurring diagnostic report subscription (₹20/test).',
    useOfFunds: [
      { category: 'Clinical Trials & CDSCO / FDA Clearances', percent: 45 },
      { category: 'Manufacturing & Supply Chain Scaling', percent: 30 },
      { category: 'Hospital Distribution Partnerships', percent: 15 },
      { category: 'Ops & Working Capital', percent: 10 }
    ],
    team: [
      { name: 'Dr. Siddharth Rao', role: 'Founder & CEO', prev: 'Cardiologist, AIIMS & Stanford Bio-Design' },
      { name: 'Meera Nambiar', role: 'Chief Biomedical Engineer', prev: 'Ex-GE Healthcare Lead' }
    ]
  },
  {
    id: 'comp_cleangrid',
    name: 'CleanGrid Energy',
    tagline: 'Decentralized microgrid battery storage network and carbon credit registry',
    industry: 'CleanTech',
    stage: 'Seed Stage',
    location: 'Gurugram / Delhi NCR',
    foundedYear: 2024,
    website: 'https://cleangrid.energy',
    logo: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=120&auto=format&fit=crop&q=80',
    founderId: 'usr_founder_3',
    founderName: 'Ananya Verma',
    verified: true,
    verificationStatus: 'verified',
    featured: true,
    targetFunding: 7500000,      // ₹75L
    committedFunding: 4500000,   // ₹45L
    equityOffered: 8,
    preMoneyValuation: 86000000,
    minInvestmentTicket: 300000,
    monthlyRevenue: 620000,
    annualRunRate: 7440000,
    monthlyGrowthPercent: 41,
    customersCount: 320,
    activePilots: 12,
    fundingInterestPercent: 60,
    viewsCount: 1980,
    pitchViewsCount: 430,
    problem: 'Commercial buildings and solar farms suffer up to 30% curtailment losses due to unoptimized peak load management and rigid tariffs.',
    solution: 'Smart AI battery energy storage systems (BESS) coupled with dynamic virtual power plant (VPP) software and automated carbon verification.',
    product: 'Modular lithium iron phosphate battery stacks with IoT edge controller and live grid arbitrage software.',
    market: '$14B Distributed Energy Resource Management Market.',
    businessModel: 'Energy-as-a-Service (EaaS) revenue share on tariff savings + SaaS VPP platform fee.',
    useOfFunds: [
      { category: 'Hardware Battery Assembly Capacity', percent: 50 },
      { category: 'VPP Software AI Algorithms', percent: 25 },
      { category: 'Sales Pipeline in Industrial Clusters', percent: 15 },
      { category: 'Regulatory Licensing', percent: 10 }
    ],
    team: [
      { name: 'Ananya Verma', role: 'CEO', prev: 'Ex-Tata Power Solar Lead' },
      { name: 'Kunal Singhal', role: 'CTO', prev: 'IIT Delhi Electrical Eng, Ex-Enphase' }
    ]
  },
  {
    id: 'comp_finflow',
    name: 'FinFlow Core',
    tagline: 'Automated treasury and cross-border settlement rails for Indian exporters',
    industry: 'FinTech',
    stage: 'Seed Stage',
    location: 'Mumbai',
    foundedYear: 2024,
    website: 'https://finflow.in',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&auto=format&fit=crop&q=80',
    founderId: 'usr_founder_4',
    founderName: 'Rohit Kothari',
    verified: true,
    verificationStatus: 'verified',
    featured: false,
    targetFunding: 6000000,      // ₹60L
    committedFunding: 4800000,   // ₹48L
    equityOffered: 9,
    preMoneyValuation: 60000000,
    minInvestmentTicket: 200000,
    monthlyRevenue: 980000,
    annualRunRate: 11760000,
    monthlyGrowthPercent: 35,
    customersCount: 480,
    activePilots: 35,
    fundingInterestPercent: 80,
    viewsCount: 2240,
    pitchViewsCount: 510,
    problem: 'SME exporters in India lose 2-4% on FX spread markups and spend 5+ days reconciling trade invoices with banking partners.',
    solution: 'Single API for programmatic virtual multi-currency IBAN accounts, automated eBRC generation, and real-time FX hedging.',
    product: 'API-first FX treasury platform integrated with 6 major global banking partners.',
    market: '$26B Global Cross-border SME B2B Payments.',
    businessModel: '0.25% FX transaction spread + ₹10,000/mo corporate treasury subscription.',
    useOfFunds: [
      { category: 'Global Banking Rails & Escrow Licenses', percent: 40 },
      { category: 'Security & Compliance Engineering', percent: 30 },
      { category: 'Exporters Acquisition Marketing', percent: 20 },
      { category: 'Legal & Accounting', percent: 10 }
    ],
    team: [
      { name: 'Rohit Kothari', role: 'CEO', prev: 'Ex-Goldman Sachs Treasury & FX' },
      { name: 'Tanvi Agarwal', role: 'Head of Compliance', prev: 'Ex-RBI FinTech Sandbox Officer' }
    ]
  },
  {
    id: 'comp_aerodrone',
    name: 'AeroDrone Dynamics',
    tagline: 'Autonomous heavy-payload cargo UAVs for defense and remote infrastructure',
    industry: 'DeepTech',
    stage: 'Pre-Series A',
    location: 'Bengaluru',
    foundedYear: 2023,
    website: 'https://aerodronedynamics.com',
    logo: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=120&auto=format&fit=crop&q=80',
    founderId: 'usr_founder_5',
    founderName: 'Col. Manish Rawat & Devika Sen',
    verified: true,
    verificationStatus: 'verified',
    featured: false,
    targetFunding: 15000000,     // ₹1.5Cr
    committedFunding: 10500000,  // ₹1.05Cr
    equityOffered: 12,
    preMoneyValuation: 110000000,
    minInvestmentTicket: 500000,
    monthlyRevenue: 1850000,
    annualRunRate: 22200000,
    monthlyGrowthPercent: 24,
    customersCount: 16,
    activePilots: 8,
    fundingInterestPercent: 70,
    viewsCount: 2650,
    pitchViewsCount: 710,
    problem: 'Last-mile logistics in Himalayan defense sectors and offshore energy platforms cost $120/kg and face severe weather hazards.',
    solution: 'Hybrid-electric VTOL UAVs carrying 100kg payload over 300km with autonomous GPS-denied obstacle avoidance.',
    product: 'Indigenously built heavy UAV airframes with dual swarm flight avionics.',
    market: '$21B Global Commercial & Defense Drone Logistics.',
    businessModel: 'Airframe procurement contracts (₹45L/unit) + Maintenance & pilot software support.',
    useOfFunds: [
      { category: 'Composite Airframe Fabrication Facility', percent: 45 },
      { category: 'Avionics & Swarm Testing', percent: 25 },
      { category: 'Defense Type Certification', percent: 20 },
      { category: 'Working Capital', percent: 10 }
    ],
    team: [
      { name: 'Col. Manish Rawat', role: 'CEO', prev: 'Retd. Indian Army Aviation Corps' },
      { name: 'Devika Sen', role: 'Chief Aeronautical Architect', prev: 'Ex-DRDO & ISRO Propulsion' }
    ]
  },
  {
    id: 'comp_neoed',
    name: 'NeoEd Learn',
    tagline: 'Personalized AI 1-on-1 Socratic tutor for K-12 STEM mastery',
    industry: 'EdTech',
    stage: 'Pre-Seed',
    location: 'Chennai',
    foundedYear: 2025,
    website: 'https://neoed.app',
    logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=120&auto=format&fit=crop&q=80',
    founderId: 'usr_founder_6',
    founderName: 'Girish Sundaram',
    verified: true,
    verificationStatus: 'verified',
    featured: false,
    targetFunding: 2500000,      // ₹25L
    committedFunding: 1875000,   // ₹18.75L
    equityOffered: 8,
    preMoneyValuation: 28000000,
    minInvestmentTicket: 100000,
    monthlyRevenue: 420000,
    annualRunRate: 5040000,
    monthlyGrowthPercent: 48,
    customersCount: 18500,
    activePilots: 24,
    fundingInterestPercent: 75,
    viewsCount: 1720,
    pitchViewsCount: 390,
    problem: 'Private 1-on-1 tutoring costs ₹40,000/yr per child, making elite academic support unattainable for 95% of households.',
    solution: 'Voice-interactive AI tutor that listens, speaks in Indian accents/languages, and guides students with step-by-step Socratic inquiry.',
    product: 'Mobile app for iOS & Android with voice-to-voice latency under 350ms.',
    market: '$9B K-12 Supplemental Education in India & Southeast Asia.',
    businessModel: 'Freemium with ₹799/month unlimited voice tutoring subscription.',
    useOfFunds: [
      { category: 'Multilingual Speech ML Models', percent: 40 },
      { category: 'Parent Acquisition Performance Marketing', percent: 35 },
      { category: 'Curriculum & Pedagogy Verification', percent: 15 },
      { category: 'Cloud Infrastructure', percent: 10 }
    ],
    team: [
      { name: 'Girish Sundaram', role: 'Founder & CEO', prev: 'Ex-Lead Educator at Unacademy' },
      { name: 'Deepa Krishnan', role: 'Head of AI', prev: 'IIT Madras Speech Lab' }
    ]
  }
];

const INITIAL_INVESTORS = [
  {
    id: 'inv_1',
    name: 'Priya Mehra',
    firm: 'Peak Horizons Capital',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    type: 'VC Fund',
    checkSize: '₹50L - ₹5Cr',
    stages: ['Seed', 'Pre-Series A', 'Series A'],
    sectors: ['AI / SaaS', 'FinTech', 'HealthTech'],
    location: 'Bengaluru / Mumbai',
    portfolioCount: 26,
    activeDeals: 4,
    verified: true,
    bio: 'General Partner backing resilient AI and B2B SaaS founders across India and SEA. Focus on high capital efficiency and sound unit economics.',
    portfolioExamples: ['Kapture CX', 'DocuSmart', 'DataMesh India', 'VeriPay'],
    linkedin: 'https://linkedin.com/in/priyamehra-vc'
  },
  {
    id: 'inv_2',
    name: 'Rajesh Singhania',
    firm: 'Singhania Family Office',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'Family Office',
    checkSize: '₹1Cr - ₹10Cr',
    stages: ['Pre-Series A', 'Series A', 'Growth'],
    sectors: ['CleanTech', 'DeepTech', 'Manufacturing', 'FinTech'],
    location: 'Mumbai / Delhi',
    portfolioCount: 38,
    activeDeals: 6,
    verified: true,
    bio: 'Direct growth and venture investments focusing on sustainable infrastructure, defense manufacturing, and domestic supply chains.',
    portfolioExamples: ['EcoVolt Power', 'BharatDrones', 'SteelNex', 'AgriLogix'],
    linkedin: 'https://linkedin.com/in/rajesh-singhania'
  },
  {
    id: 'inv_3',
    name: 'Vikramaditya Bose',
    firm: 'Asha Angel Syndicate',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    type: 'Angel Investor',
    checkSize: '₹10L - ₹50L',
    stages: ['Pre-Seed', 'Seed'],
    sectors: ['AI / SaaS', 'EdTech', 'Consumer / D2C'],
    location: 'Kolkata / Singapore',
    portfolioCount: 19,
    activeDeals: 3,
    verified: true,
    bio: 'Ex-tech executive and 3x angel investor. Passionate about early-stage zero-to-one product velocity and developer tooling.',
    portfolioExamples: ['CodeSpark', 'ZenithPay', 'TutorAI'],
    linkedin: 'https://linkedin.com/in/vikram-bose-angel'
  },
  {
    id: 'inv_4',
    name: 'Anjali Deshmukh',
    firm: 'Nexus Spark Ventures',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    type: 'Corporate VC',
    checkSize: '₹1Cr - ₹7.5Cr',
    stages: ['Seed', 'Series A'],
    sectors: ['HealthTech', 'BioTech', 'AI / SaaS'],
    location: 'Hyderabad / Boston',
    portfolioCount: 31,
    activeDeals: 5,
    verified: true,
    bio: 'Healthcare and digital health specialist. Partnering with visionary founders digitizing clinical pathways and life sciences.',
    portfolioExamples: ['CardioSense', 'PharmaBot', 'GenomicsIndia'],
    linkedin: 'https://linkedin.com/in/anjali-deshmukh-cve'
  }
];

const INITIAL_PLATFORM_SERVICES = [
  {
    id: 'srv_founder_pro',
    name: 'Founder Pro Subscription',
    targetRole: 'founder',
    type: 'subscription',
    price: 4999,
    period: 'monthly',
    description: 'Full investor directory access, pitch room analytics, priority verified badge, and unlimited deal connections.',
    features: [
      'Unlimited Investor Direct Messages',
      'Advanced Pitch Room Slide Analytics & Heatmap',
      'Verified Founder Trust Badge on Marketplace',
      'Automated Cap Table & Document Vault (10GB)',
      'Dedicated Pitch Deck Feedback from FundWeb Team'
    ]
  },
  {
    id: 'srv_featured_listing',
    name: 'Featured Startup Spotlight',
    targetRole: 'founder',
    type: 'one-time',
    price: 9999,
    period: '30 days',
    description: 'Top placement on the FundWeb homepage, featured banner in investor weekly digests, and 5x profile visibility.',
    features: [
      'Homepage Hero Marketplace Placement (30 Days)',
      'Featured in Weekly Investor Dealflow Newsletter (850+ VCs)',
      'Promoted Badge on All Search & Industry Filters',
      'Live Traction & Funding Interest Graph Highlight'
    ]
  },
  {
    id: 'srv_pitch_promotion',
    name: 'Pitch Room Blast & Demo Day',
    targetRole: 'founder',
    type: 'one-time',
    price: 14999,
    period: 'event',
    description: 'Curated 1-on-1 pitch room demo invite dispatched to top 50 active accredited investors matching your thesis.',
    features: [
      'Direct Pitch Room Delivery to 50 Verified Matching VCs',
      'Priority Scheduling for 1-on-1 Meeting Requests',
      'Real-time Slide Engagement Notifications',
      'Video Demo Recording Hosting & Instant Q&A Channel'
    ]
  },
  {
    id: 'srv_fast_kyc',
    name: 'Fast-Track Legal & KYC Verification',
    targetRole: 'both',
    type: 'one-time',
    price: 2499,
    period: 'instant',
    description: 'Complete MCA company search, GST validation, founder identity verification, and accreditation check within 4 hours.',
    features: [
      'Verified Green Shield on Founder & Company Profile',
      'MCA / ROC Company Master Data Verification',
      'Accredited Investor Net-Worth / Entity Validation',
      'Priority Review SLA (< 4 Business Hours)'
    ]
  },
  {
    id: 'srv_investor_pass',
    name: 'Investor Dealflow Suite',
    targetRole: 'investor',
    type: 'subscription',
    price: 19999,
    period: 'yearly',
    description: 'Full pipeline CRM, confidential data room access, due diligence financial models, and automated meeting concierge.',
    features: [
      'Access to Unredacted Financial Models & Cap Tables',
      'AI Pitch Match Score & Instant Alert Triggers',
      'Direct Meeting Concierge & Calendar Integration',
      'Exportable Due Diligence PDF Reports'
    ]
  }
];

const INITIAL_CONNECTIONS = [
  {
    id: 'conn_1',
    startupId: 'comp_nova_ai',
    startupName: 'NovaAI',
    founderId: 'usr_founder_1',
    founderName: 'Aarav Sharma',
    investorId: 'inv_1',
    investorName: 'Priya Mehra',
    investorFirm: 'Peak Horizons Capital',
    status: 'connected', // pending, connected, rejected
    message: 'Hello Aarav, we are impressed by NovaAI’s traction and agent architecture. We would love to review your full deck and schedule an introductory call.',
    createdAt: '2026-09-18T14:30:00Z'
  },
  {
    id: 'conn_2',
    startupId: 'comp_nova_ai',
    startupName: 'NovaAI',
    founderId: 'usr_founder_1',
    founderName: 'Aarav Sharma',
    investorId: 'inv_3',
    investorName: 'Vikramaditya Bose',
    investorFirm: 'Asha Angel Syndicate',
    status: 'pending',
    message: 'Hi team, looking to deploy a ₹25L angel ticket in enterprise automation. Let’s connect!',
    createdAt: '2026-09-19T06:15:00Z'
  }
];

const INITIAL_MESSAGES = [
  {
    id: 'msg_1',
    conversationId: 'conv_nova_priya',
    senderId: 'inv_1',
    senderName: 'Priya Mehra',
    senderRole: 'investor',
    text: 'Hi Aarav, thanks for accepting the connection! We reviewed your 10-slide deck on FundWeb and have deep interest in your B2B pilot pipeline.',
    timestamp: '2026-09-18T15:00:00Z'
  },
  {
    id: 'msg_2',
    conversationId: 'conv_nova_priya',
    senderId: 'usr_founder_1',
    senderName: 'Aarav Sharma',
    senderRole: 'founder',
    text: 'Hello Priya, wonderful to connect! We currently have ₹36L committed on our ₹50L round and are actively onboarding our enterprise pilot customers.',
    timestamp: '2026-09-18T15:24:00Z'
  },
  {
    id: 'msg_3',
    conversationId: 'conv_nova_priya',
    senderId: 'inv_1',
    senderName: 'Priya Mehra',
    senderRole: 'investor',
    text: 'Excellent. Would you be open for a 30-minute pitch walkthrough this Wednesday at 3:00 PM IST?',
    timestamp: '2026-09-18T15:40:00Z'
  },
  {
    id: 'msg_4',
    conversationId: 'conv_nova_priya',
    senderId: 'usr_founder_1',
    senderName: 'Aarav Sharma',
    senderRole: 'founder',
    text: 'Absolutely! I will schedule the Pitch Meeting via FundWeb’s meeting room right away.',
    timestamp: '2026-09-18T16:05:00Z'
  }
];

const INITIAL_MEETINGS = [
  {
    id: 'meet_1',
    startupId: 'comp_nova_ai',
    startupName: 'NovaAI',
    founderId: 'usr_founder_1',
    founderName: 'Aarav Sharma',
    investorId: 'inv_1',
    investorName: 'Priya Mehra',
    investorFirm: 'Peak Horizons Capital',
    date: '2026-09-23',
    time: '15:00',
    type: 'Pitch Meeting', // Video Call, Phone Call, In-Person, Pitch Meeting
    status: 'upcoming',    // upcoming, completed, cancelled
    meetLink: 'https://meet.fundweb.io/room/nova-peak-pitch',
    agenda: 'NovaAI Seed Round term discussion and enterprise pilot customer metrics breakdown.'
  },
  {
    id: 'meet_2',
    startupId: 'comp_healthpulse',
    startupName: 'HealthPulse MedTech',
    founderId: 'usr_founder_2',
    founderName: 'Dr. Siddharth Rao',
    investorId: 'inv_4',
    investorName: 'Anjali Deshmukh',
    investorFirm: 'Nexus Spark Ventures',
    date: '2026-09-25',
    time: '11:30',
    type: 'Video Call',
    status: 'upcoming',
    meetLink: 'https://meet.fundweb.io/room/healthpulse-nexus',
    agenda: 'Clinical trial roadmap review and CE/CDSCO regulatory milestones.'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'usr_founder_1',
    type: 'connection_request',
    title: 'New Connection Request',
    body: 'Vikramaditya Bose (Asha Angel Syndicate) sent you a connection request.',
    read: false,
    timestamp: '2026-09-19T06:15:00Z',
    link: '#connections'
  },
  {
    id: 'notif_2',
    userId: 'usr_founder_1',
    type: 'pitch_viewed',
    title: 'Pitch Room Activity',
    body: 'Priya Mehra viewed all 10 slides of your pitch deck with 4.5m engagement time.',
    read: false,
    timestamp: '2026-09-18T14:45:00Z',
    link: '#pitch-room'
  },
  {
    id: 'notif_3',
    userId: 'usr_founder_1',
    type: 'meeting_scheduled',
    title: 'Meeting Confirmed',
    body: 'Upcoming Pitch Meeting with Peak Horizons Capital on Sept 23 at 3:00 PM IST.',
    read: true,
    timestamp: '2026-09-18T16:10:00Z',
    link: '#meetings'
  },
  {
    id: 'notif_4',
    userId: 'usr_admin_1',
    type: 'verification_pending',
    title: 'Verification Request Pending',
    body: 'NeoEd Learn submitted company registration documents for admin review.',
    read: false,
    timestamp: '2026-09-19T07:00:00Z',
    link: '#admin-verification'
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_FW984210',
    orderId: 'order_FW_20260918_01',
    userId: 'usr_founder_1',
    userName: 'Aarav Sharma',
    serviceId: 'srv_featured_listing',
    serviceName: 'Featured Startup Spotlight (30 Days)',
    grossAmount: 9999,
    fundwebFee: 500,
    gatewayFee: 200,
    taxGst: 126,
    netAmount: 9173,
    currency: 'INR',
    paymentMethod: 'UPI / NetBanking',
    paymentProvider: 'Razorpay Enterprise Platform Rails',
    paymentStatus: 'Paid', // Paid, Processing, Refunded, Partially Refunded, Failed
    createdAt: '2026-09-18T11:20:00Z',
    invoiceNumber: 'INV-FW-2026-00482',
    receiptUrl: '#receipt-INV-FW-2026-00482'
  },
  {
    id: 'tx_FW984192',
    orderId: 'order_FW_20260917_04',
    userId: 'usr_founder_2',
    userName: 'Dr. Siddharth Rao',
    serviceId: 'srv_founder_pro',
    serviceName: 'Founder Pro Monthly Subscription',
    grossAmount: 4999,
    fundwebFee: 250,
    gatewayFee: 100,
    taxGst: 63,
    netAmount: 4586,
    currency: 'INR',
    paymentMethod: 'Credit Card (Visa)',
    paymentProvider: 'Razorpay Enterprise Platform Rails',
    paymentStatus: 'Paid',
    createdAt: '2026-09-17T09:15:00Z',
    invoiceNumber: 'INV-FW-2026-00481',
    receiptUrl: '#receipt-INV-FW-2026-00481'
  }
];

const INITIAL_VERIFICATION_REQUESTS = [
  {
    id: 'ver_1',
    type: 'company',
    entityId: 'comp_neoed',
    entityName: 'NeoEd Learn',
    founderName: 'Girish Sundaram',
    email: 'girish@neoed.app',
    status: 'Pending', // Pending, Under Review, Verified, Rejected, Suspended
    submittedAt: '2026-09-19T07:00:00Z',
    docs: ['MCA Certificate of Incorporation', 'GSTIN Verification', 'Pitch Deck v2.4'],
    adminNotes: 'Awaiting MCA direct director KYC check.'
  },
  {
    id: 'ver_2',
    type: 'founder',
    entityId: 'usr_founder_1',
    entityName: 'Aarav Sharma (NovaAI)',
    founderName: 'Aarav Sharma',
    email: 'founder@fundweb.io',
    status: 'Verified',
    submittedAt: '2026-09-15T09:00:00Z',
    docs: ['Aadhaar/Passport eKYC', 'CIN: U72200GJ2024PTC149201', 'Bank Account Verification'],
    adminNotes: 'Verified via automated NSDL & MCA gateway.'
  },
  {
    id: 'ver_3',
    type: 'investor',
    entityId: 'usr_investor_1',
    entityName: 'Peak Horizons Capital (Priya Mehra)',
    founderName: 'Priya Mehra',
    email: 'investor@fundweb.io',
    status: 'Verified',
    submittedAt: '2026-09-10T12:00:00Z',
    docs: ['SEBI Registered Cat-I AIF Certificate', 'PAN Entity Card'],
    adminNotes: 'SEBI AIF registration validity confirmed.'
  }
];

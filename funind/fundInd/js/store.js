/**
 * FundWeb Store & State Management Layer
 * Features LocalStorage persistence with an in-memory event bus
 */

class FundWebStore {
  constructor() {
    this.storageKey = 'fundweb_state_v1';
    this.listeners = new Map();
    this.init();
  }

  init() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state, resetting to seed data', e);
        this.resetToSeed();
      }
    } else {
      this.resetToSeed();
    }
  }

  resetToSeed() {
    this.state = {
      currentUser: null, // Default logged out, demo switchers available
      users: [...INITIAL_USERS],
      startups: [...INITIAL_STARTUPS],
      investors: [...INITIAL_INVESTORS],
      services: [...INITIAL_PLATFORM_SERVICES],
      connections: [...INITIAL_CONNECTIONS],
      messages: [...INITIAL_MESSAGES],
      meetings: [...INITIAL_MEETINGS],
      notifications: [...INITIAL_NOTIFICATIONS],
      transactions: [...INITIAL_TRANSACTIONS],
      verificationRequests: [...INITIAL_VERIFICATION_REQUESTS],
      commissionConfig: { ...INITIAL_COMMISSION_CONFIG },
      savedStartupIds: ['comp_nova_ai', 'comp_cleangrid']
    };
    this.persist();
  }

  persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  emit(event, data) {
    this.persist();
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data, this.state);
        } catch (err) {
          console.error(`Error in subscriber for ${event}:`, err);
        }
      }
    }
  }

  // --- Auth APIs ---
  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Check for admin@fun.in special credentials
    if (cleanEmail === 'admin@fun.in' || cleanEmail === 'admin@fundweb.io') {
      let adminUser = this.state.users.find(u => u.role === 'admin');
      if (!adminUser) {
        adminUser = {
          id: 'usr_admin_1',
          role: 'admin',
          name: 'FundWeb Compliance Admin',
          email: 'admin@fun.in',
          phone: '+91 99000 11223',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          verified: true,
          verificationStatus: 'verified',
          createdAt: '2025-12-01T08:00:00Z'
        };
        this.state.users.push(adminUser);
      } else {
        adminUser.email = 'admin@fun.in';
      }
      this.state.currentUser = adminUser;
      this.emit('auth_changed', adminUser);
      return { success: true, user: adminUser };
    }

    const user = this.state.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      this.state.currentUser = user;
      this.emit('auth_changed', user);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials. For Admin, use admin@fun.in / 123456.' };
  }

  investInStartup({ startupId, amount, investorName, investorId, notes }) {
    const startup = this.getStartupById(startupId);
    if (!startup) return { success: false, error: 'Startup not found' };

    const commitAmt = parseFloat(amount) || startup.minInvestmentTicket || 250000;
    startup.committedFunding = Math.min(startup.targetFunding, startup.committedFunding + commitAmt);
    startup.fundingInterestPercent = Math.min(100, Math.round((startup.committedFunding / startup.targetFunding) * 100));

    const invRecord = {
      id: 'inv_deal_' + Date.now(),
      startupId,
      startupName: startup.name,
      investorId: investorId || (this.state.currentUser ? this.state.currentUser.id : 'inv_guest'),
      investorName: investorName || (this.state.currentUser ? this.state.currentUser.name : 'Priya Mehra (Peak Horizons)'),
      amount: commitAmt,
      equityPercent: ((commitAmt / startup.preMoneyValuation) * 100).toFixed(2),
      status: 'Term Sheet Issued (Escrow Pending)',
      committedAt: new Date().toISOString()
    };

    if (!this.state.investments) this.state.investments = [];
    this.state.investments.unshift(invRecord);

    // Notify founder
    this.addNotification({
      userId: startup.founderId,
      type: 'investment_commit',
      title: '🎉 New Capital Commitment Received!',
      body: `${invRecord.investorName} committed ₹${(commitAmt/100000).toFixed(1)}L towards ${startup.name}'s round. Term sheet generated.`,
      link: '#mystartup'
    });

    // Notify investor
    this.addNotification({
      userId: invRecord.investorId,
      type: 'investment_commit',
      title: 'Investment Intent Confirmed',
      body: `You committed ₹${(commitAmt/100000).toFixed(1)}L in ${startup.name}. Escrow documentation is in progress.`,
      link: '#portfolio'
    });

    this.emit('startups_updated', this.state.startups);
    return { success: true, investment: invRecord, startup };
  }

  logout() {
    this.state.currentUser = null;
    this.emit('auth_changed', null);
  }

  registerFounder(formData) {
    const userId = 'usr_f_' + Date.now();
    const companyId = 'comp_' + (formData.companyName || 'startup').toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
    
    const newUser = {
      id: userId,
      role: 'founder',
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone || '+91 90000 00000',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      companyId: companyId,
      verified: false,
      verificationStatus: 'Pending',
      createdAt: new Date().toISOString()
    };

    const target = parseFloat(formData.fundingRequired) || 5000000;
    const equity = parseFloat(formData.equityOffered) || 10;
    const rev = parseFloat(formData.monthlyRevenue) || 0;

    const newStartup = {
      id: companyId,
      name: formData.companyName || 'My Startup',
      tagline: formData.solution ? formData.solution.slice(0, 100) + '...' : 'Innovating next-generation solutions',
      industry: formData.industry || 'AI / SaaS',
      stage: formData.stage || 'Seed Stage',
      location: formData.location || 'Bengaluru, India',
      foundedYear: new Date().getFullYear(),
      website: formData.website || 'https://example.com',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      founderId: userId,
      founderName: formData.fullName,
      verified: false,
      verificationStatus: 'Pending',
      featured: false,
      targetFunding: target,
      committedFunding: 0,
      equityOffered: equity,
      preMoneyValuation: target * (100 / (equity || 10)),
      minInvestmentTicket: Math.max(100000, target * 0.05),
      monthlyRevenue: rev,
      annualRunRate: rev * 12,
      monthlyGrowthPercent: parseFloat(formData.monthlyGrowth) || 15,
      customersCount: parseInt(formData.customers) || 100,
      activePilots: 2,
      fundingInterestPercent: 10,
      viewsCount: 1,
      pitchViewsCount: 0,
      problem: formData.problem || 'Standard problem statement in current industry.',
      solution: formData.solution || 'Novel tech-driven solution providing high efficiency.',
      product: 'Next-generation proprietary platform.',
      market: '$10B Global Addressable Market.',
      businessModel: formData.businessModel || 'B2B SaaS / Transactional Revenue.',
      useOfFunds: [
        { category: 'Product Development & Engineering', percent: 45 },
        { category: 'Sales & Marketing', percent: 30 },
        { category: 'Hiring Key Talent', percent: 15 },
        { category: 'Working Capital & Legal', percent: 10 }
      ],
      team: [
        { name: formData.fullName, role: 'Founder & CEO', prev: 'Domain Specialist' }
      ],
      pitchSlides: [
        { slideNumber: '01', title: 'The Problem', subtitle: 'Market Inefficiency', content: formData.problem || 'Core customer pain points.', metric: 'High friction' },
        { slideNumber: '02', title: 'The Solution', subtitle: 'Proprietary Innovation', content: formData.solution || 'Streamlined platform approach.', metric: '10x Speed' },
        { slideNumber: '03', title: 'Business Model', subtitle: 'Monetization Strategy', content: formData.businessModel || 'Subscription and usage based.', metric: 'Predictable MRR' },
        { slideNumber: '04', title: 'The Funding Ask', subtitle: `Raising ₹${(target/100000).toFixed(0)}L`, content: `Allocated to engineering and expansion.`, metric: `${equity}% Equity Offered` }
      ]
    };

    const verReq = {
      id: 'ver_' + Date.now(),
      type: 'company',
      entityId: companyId,
      entityName: newStartup.name,
      founderName: newUser.name,
      email: newUser.email,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      docs: ['Identity Verification', 'Initial Startup Registration'],
      adminNotes: 'Automated signup submission.'
    };

    this.state.users.push(newUser);
    this.state.startups.unshift(newStartup);
    this.state.verificationRequests.unshift(verReq);
    this.state.currentUser = newUser;

    this.addNotification({
      userId: 'usr_admin_1',
      type: 'verification_pending',
      title: 'New Founder Registration',
      body: `${newUser.name} created ${newStartup.name} and requested verification.`
    });

    this.emit('auth_changed', newUser);
    this.emit('startups_updated', this.state.startups);
    return { success: true, user: newUser, startup: newStartup };
  }

  registerInvestor(formData) {
    const userId = 'usr_inv_' + Date.now();
    const invId = 'inv_' + Date.now().toString().slice(-4);

    const newUser = {
      id: userId,
      role: 'investor',
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone || '+91 90000 00000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      investorType: formData.investorType || 'Angel Investor',
      firmName: formData.firmName || 'Independent Syndicate',
      location: formData.location || 'India',
      investmentRange: formData.investmentRange || '₹25L - ₹1Cr',
      preferredIndustries: formData.preferredIndustries ? formData.preferredIndustries.split(',').map(s=>s.trim()) : ['AI / SaaS', 'FinTech'],
      preferredStages: formData.preferredStages ? formData.preferredStages.split(',').map(s=>s.trim()) : ['Seed', 'Pre-Series A'],
      linkedin: formData.linkedin || '',
      verified: false,
      verificationStatus: 'Pending',
      createdAt: new Date().toISOString()
    };

    const newInvestor = {
      id: invId,
      userId: userId,
      name: formData.fullName,
      firm: formData.firmName || `${formData.fullName} Family Syndicate`,
      avatar: newUser.avatar,
      type: formData.investorType || 'Angel Investor',
      checkSize: formData.investmentRange || '₹25L - ₹1Cr',
      stages: newUser.preferredStages,
      sectors: newUser.preferredIndustries,
      location: formData.location || 'India',
      portfolioCount: 0,
      activeDeals: 1,
      verified: false,
      bio: `Accredited investor focused on early stage growth.`,
      portfolioExamples: [],
      linkedin: formData.linkedin || ''
    };

    const verReq = {
      id: 'ver_' + Date.now(),
      type: 'investor',
      entityId: userId,
      entityName: `${newUser.name} (${newInvestor.firm})`,
      founderName: newUser.name,
      email: newUser.email,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      docs: ['Accreditation Declaration', 'PAN/ID Check'],
      adminNotes: 'Investor onboarding request.'
    };

    this.state.users.push(newUser);
    this.state.investors.unshift(newInvestor);
    this.state.verificationRequests.unshift(verReq);
    this.state.currentUser = newUser;

    this.addNotification({
      userId: 'usr_admin_1',
      type: 'verification_pending',
      title: 'New Investor Registration',
      body: `${newUser.name} registered as ${newUser.investorType}.`
    });

    this.emit('auth_changed', newUser);
    this.emit('investors_updated', this.state.investors);
    return { success: true, user: newUser, investor: newInvestor };
  }

  // --- Startup & Marketplace APIs ---
  getStartups(filters = {}) {
    let list = [...this.state.startups];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q) || s.industry.toLowerCase().includes(q) || s.location.toLowerCase().includes(q));
    }
    if (filters.industry && filters.industry !== 'all') {
      list = list.filter(s => s.industry.toLowerCase().includes(filters.industry.toLowerCase()));
    }
    if (filters.stage && filters.stage !== 'all') {
      list = list.filter(s => s.stage.toLowerCase().includes(filters.stage.toLowerCase()));
    }
    if (filters.minRevenue) {
      list = list.filter(s => s.monthlyRevenue >= filters.minRevenue);
    }
    if (filters.maxTarget) {
      list = list.filter(s => s.targetFunding <= filters.maxTarget);
    }
    if (filters.sortBy) {
      if (filters.sortBy === 'interest') list.sort((a, b) => b.fundingInterestPercent - a.fundingInterestPercent);
      else if (filters.sortBy === 'revenue') list.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
      else if (filters.sortBy === 'growth') list.sort((a, b) => b.monthlyGrowthPercent - a.monthlyGrowthPercent);
      else if (filters.sortBy === 'target') list.sort((a, b) => b.targetFunding - a.targetFunding);
    }
    return list;
  }

  getStartupById(id) {
    return this.state.startups.find(s => s.id === id);
  }

  toggleSaveStartup(startupId) {
    const idx = this.state.savedStartupIds.indexOf(startupId);
    if (idx >= 0) {
      this.state.savedStartupIds.splice(idx, 1);
    } else {
      this.state.savedStartupIds.push(startupId);
    }
    this.emit('saved_startups_changed', this.state.savedStartupIds);
    return this.state.savedStartupIds.includes(startupId);
  }

  isStartupSaved(startupId) {
    return this.state.savedStartupIds.includes(startupId);
  }

  // --- Connection APIs ---
  sendConnectionRequest({ startupId, investorId, message, senderName, senderEmail }) {
    const startup = this.getStartupById(startupId);
    const conn = {
      id: 'conn_' + Date.now(),
      startupId,
      startupName: startup ? startup.name : 'Startup',
      founderId: startup ? startup.founderId : '',
      founderName: startup ? startup.founderName : 'Founder',
      investorId: investorId || (this.state.currentUser ? this.state.currentUser.id : 'inv_guest'),
      investorName: senderName || (this.state.currentUser ? this.state.currentUser.name : 'Investor'),
      investorFirm: 'Accredited Investor Network',
      status: 'pending',
      message: message || 'Would like to connect regarding your current funding round.',
      createdAt: new Date().toISOString()
    };
    this.state.connections.unshift(conn);
    
    // Trigger notification to founder
    if (startup && startup.founderId) {
      this.addNotification({
        userId: startup.founderId,
        type: 'connection_request',
        title: 'New Connection Request',
        body: `${conn.investorName} wants to connect with ${startup.name}.`,
        link: '#connections'
      });
    }

    this.emit('connections_updated', this.state.connections);
    return conn;
  }

  updateConnectionStatus(connId, status) {
    const conn = this.state.connections.find(c => c.id === connId);
    if (conn) {
      conn.status = status;
      this.emit('connections_updated', this.state.connections);
      return conn;
    }
    return null;
  }

  // --- Messaging APIs ---
  sendMessage({ conversationId, senderId, senderName, senderRole, text }) {
    const msg = {
      id: 'msg_' + Date.now(),
      conversationId: conversationId || 'conv_default',
      senderId: senderId || (this.state.currentUser ? this.state.currentUser.id : 'usr_anon'),
      senderName: senderName || (this.state.currentUser ? this.state.currentUser.name : 'Anonymous'),
      senderRole: senderRole || (this.state.currentUser ? this.state.currentUser.role : 'investor'),
      text,
      timestamp: new Date().toISOString()
    };
    this.state.messages.push(msg);
    this.emit('messages_updated', this.state.messages);
    return msg;
  }

  getMessages(conversationId) {
    if (!conversationId) return this.state.messages;
    return this.state.messages.filter(m => m.conversationId === conversationId);
  }

  // --- Meeting APIs ---
  scheduleMeeting(meetingData) {
    const meet = {
      id: 'meet_' + Date.now(),
      startupId: meetingData.startupId,
      startupName: meetingData.startupName,
      founderId: meetingData.founderId,
      founderName: meetingData.founderName,
      investorId: meetingData.investorId,
      investorName: meetingData.investorName,
      investorFirm: meetingData.investorFirm || 'Investor Partner',
      date: meetingData.date,
      time: meetingData.time,
      type: meetingData.type || 'Pitch Meeting',
      status: 'upcoming',
      meetLink: `https://meet.fundweb.io/room/fw-${Date.now().toString().slice(-6)}`,
      agenda: meetingData.agenda || 'Discussion on startup milestones and financing round.'
    };
    this.state.meetings.unshift(meet);

    this.addNotification({
      userId: meet.founderId,
      type: 'meeting_scheduled',
      title: 'Meeting Confirmed',
      body: `New ${meet.type} scheduled with ${meet.investorName} on ${meet.date} at ${meet.time}.`,
      link: '#meetings'
    });

    this.emit('meetings_updated', this.state.meetings);
    return meet;
  }

  // --- Notification APIs ---
  addNotification({ userId, type, title, body, link }) {
    const notif = {
      id: 'notif_' + Date.now() + Math.random().toString().slice(2, 5),
      userId: userId || 'usr_founder_1',
      type: type || 'general',
      title,
      body,
      read: false,
      timestamp: new Date().toISOString(),
      link: link || '#'
    };
    this.state.notifications.unshift(notif);
    this.emit('notifications_updated', this.state.notifications);
    return notif;
  }

  markNotificationRead(id) {
    const n = this.state.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.emit('notifications_updated', this.state.notifications);
    }
  }

  markAllNotificationsRead(userId) {
    this.state.notifications.forEach(n => {
      if (!userId || n.userId === userId) n.read = true;
    });
    this.emit('notifications_updated', this.state.notifications);
  }

  getUnreadNotificationCount(userId) {
    return this.state.notifications.filter(n => (!userId || n.userId === userId) && !n.read).length;
  }

  // --- Payment & Commission Engine APIs ---
  calculateServiceCommission(grossAmount) {
    const cfg = this.state.commissionConfig;
    const fundwebFee = (grossAmount * (cfg.platformFeePercent / 100));
    const gatewayFee = (grossAmount * 0.02) + 10; // Simulated Razorpay 2% + ₹10 standard
    const taxableBase = fundwebFee + cfg.fixedServiceFee;
    const taxGst = taxableBase * (cfg.gstTaxPercent / 100);
    const netAmount = grossAmount - fundwebFee - gatewayFee - taxGst;

    return {
      grossAmount,
      platformFeePercent: cfg.platformFeePercent,
      fundwebFee: Math.round(fundwebFee),
      fixedServiceFee: cfg.fixedServiceFee,
      gatewayFee: Math.round(gatewayFee),
      taxGst: Math.round(taxGst),
      netAmount: Math.round(netAmount)
    };
  }

  createPlatformPayment({ serviceId, paymentMethod, userDetails }) {
    const service = this.state.services.find(s => s.id === serviceId) || {
      id: 'srv_custom',
      name: 'FundWeb Platform Service',
      price: 4999
    };

    const breakdown = this.calculateServiceCommission(service.price);
    const txId = 'tx_FW' + Math.floor(100000 + Math.random() * 900000);
    const orderId = 'order_FW_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '_' + Math.floor(10 + Math.random() * 90);
    const invoiceNum = 'INV-FW-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const tx = {
      id: txId,
      orderId: orderId,
      userId: userDetails ? userDetails.id : (this.state.currentUser ? this.state.currentUser.id : 'usr_founder_1'),
      userName: userDetails ? userDetails.name : (this.state.currentUser ? this.state.currentUser.name : 'Founder'),
      serviceId: service.id,
      serviceName: service.name,
      grossAmount: breakdown.grossAmount,
      fundwebFee: breakdown.fundwebFee,
      gatewayFee: breakdown.gatewayFee,
      taxGst: breakdown.taxGst,
      netAmount: breakdown.netAmount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'UPI / NetBanking',
      paymentProvider: 'Razorpay Enterprise Platform Rails',
      paymentStatus: 'Paid',
      createdAt: new Date().toISOString(),
      invoiceNumber: invoiceNum,
      receiptUrl: `#receipt-${invoiceNum}`
    };

    this.state.transactions.unshift(tx);

    this.addNotification({
      userId: tx.userId,
      type: 'payment_success',
      title: 'Payment Confirmed & Verified',
      body: `Your payment of ₹${tx.grossAmount.toLocaleString('en-IN')} for ${tx.serviceName} was verified successfully. Invoice: ${invoiceNum}.`,
      link: '#invoices'
    });

    this.emit('transactions_updated', this.state.transactions);
    return tx;
  }

  processRefund(txId, reason = 'Admin initiated service refund') {
    const tx = this.state.transactions.find(t => t.id === txId);
    if (tx && tx.paymentStatus !== 'Refunded') {
      tx.paymentStatus = 'Refunded';
      tx.refundReason = reason;
      tx.refundedAt = new Date().toISOString();

      this.addNotification({
        userId: tx.userId,
        type: 'payment_refunded',
        title: 'Payment Refund Processed',
        body: `Refund of ₹${tx.grossAmount.toLocaleString('en-IN')} for ${tx.serviceName} has been processed back to source account.`,
        link: '#invoices'
      });

      this.emit('transactions_updated', this.state.transactions);
      return { success: true, tx };
    }
    return { success: false, error: 'Transaction not eligible for refund' };
  }

  // --- Admin Verification APIs ---
  updateVerificationStatus(reqId, newStatus, notes = '') {
    const req = this.state.verificationRequests.find(r => r.id === reqId);
    if (req) {
      req.status = newStatus;
      req.adminNotes = notes || req.adminNotes;
      req.updatedAt = new Date().toISOString();

      // If approved, update entity verification status
      if (req.type === 'company') {
        const startup = this.getStartupById(req.entityId);
        if (startup) {
          startup.verified = (newStatus === 'Verified');
          startup.verificationStatus = newStatus;
        }
      } else if (req.type === 'founder' || req.type === 'investor') {
        const usr = this.state.users.find(u => u.id === req.entityId);
        if (usr) {
          usr.verified = (newStatus === 'Verified');
          usr.verificationStatus = newStatus;
        }
      }

      this.emit('verification_updated', this.state.verificationRequests);
      this.emit('startups_updated', this.state.startups);
      this.emit('users_updated', this.state.users);
      return req;
    }
    return null;
  }

  updateCommissionConfig(newConfig) {
    this.state.commissionConfig = { ...this.state.commissionConfig, ...newConfig };
    this.emit('commission_config_updated', this.state.commissionConfig);
    return this.state.commissionConfig;
  }
}

// Instantiate global store
window.fundwebStore = new FundWebStore();

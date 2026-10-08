/**
 * FundWeb Main Application Controller
 * Handles Loading lifecycle, ThreeUI initialization, Role Dashboards,
 * Marketplace, Pitch Room, Meetings, Messaging, and Razorpay Payments.
 */

// Global State
let currentPitchSlideIdx = 0;
let modalPitchSlideIdx = 0;
let activeStartupForPitch = null;
let currentActiveView = 'home'; // 'home' | 'founder' | 'investor' | 'admin'

document.addEventListener('DOMContentLoaded', () => {
  initLoadingSequence();
  initStoreSubscribers();
  renderHeaderAuth();
  renderMarketplace();
  renderInvestors();
  renderPricing();
  renderPitchRoomPreview('comp_nova_ai');
  renderNotifications();
});

/* ==========================================================================
   1. LOADING SEQUENCE (0% -> 100% with sequential status updates)
   ========================================================================== */
function initLoadingSequence() {
  const preloader = document.getElementById('preloader');
  const barFill = document.getElementById('loaderBarFill');
  const percentText = document.getElementById('loaderPercent');
  const msgText = document.getElementById('loaderMsg');

  const steps = [
    { percent: 0, msg: 'Initializing FundWeb...' },
    { percent: 25, msg: 'Loading startup marketplace...' },
    { percent: 50, msg: 'Loading investor network...' },
    { percent: 75, msg: 'Preparing pitch rooms...' },
    { percent: 90, msg: 'Initializing secure platform...' },
    { percent: 100, msg: 'FundWeb Ready' }
  ];

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      const { percent, msg } = steps[currentStep];
      if (barFill) barFill.style.width = percent + '%';
      if (percentText) percentText.textContent = percent + '%';
      if (msgText) msgText.textContent = msg;
      currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        if (preloader) preloader.classList.add('loaded');
        // Initialize ThreeUI sketchbook
        if (typeof window.initSketchbookExperience === 'function') {
          window.initSketchbookExperience();
        }

        // When user starts the page, if not logged in, show login / signup gateway
        const user = window.fundwebStore.state.currentUser;
        if (!user) {
          setTimeout(() => {
            openWelcomeGatewayModal();
          }, 450);
        } else {
          navigateTo(user.role);
        }
      }, 350);
    }
  }, 280);
}

/* ==========================================================================
   STORE SUBSCRIBERS
   ========================================================================== */
function initStoreSubscribers() {
  const store = window.fundwebStore;

  store.subscribe('auth_changed', (user) => {
    renderHeaderAuth();
    if (user) {
      if (user.role === 'founder') navigateTo('founder');
      else if (user.role === 'investor') navigateTo('investor');
      else if (user.role === 'admin') navigateTo('admin');
    } else {
      navigateTo('home');
    }
  });

  store.subscribe('startups_updated', () => {
    renderMarketplace();
    renderAdminTables();
  });

  store.subscribe('saved_startups_changed', () => {
    renderMarketplace();
    renderInvestorSavedList();
  });

  store.subscribe('connections_updated', () => {
    renderFounderConnections();
    renderInvestorConnections();
  });

  store.subscribe('messages_updated', () => {
    renderChatMessages('founder');
    renderChatMessages('investor');
  });

  store.subscribe('meetings_updated', () => {
    renderFounderMeetings();
    renderInvestorMeetings();
  });

  store.subscribe('notifications_updated', () => {
    renderNotifications();
  });

  store.subscribe('transactions_updated', () => {
    renderFounderInvoices();
    renderAdminTransactions();
  });

  store.subscribe('verification_updated', () => {
    renderAdminVerifications();
  });
}

/* ==========================================================================
   VIEW NAVIGATION & ROUTING
   ========================================================================== */
function navigateTo(viewName) {
  currentActiveView = viewName;

  const landing = document.getElementById('landingView');
  const fDash = document.getElementById('founderDashboard');
  const iDash = document.getElementById('investorDashboard');
  const aDash = document.getElementById('adminDashboard');

  if (landing) landing.classList.remove('active');
  if (fDash) fDash.classList.remove('active');
  if (iDash) iDash.classList.remove('active');
  if (aDash) aDash.classList.remove('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'admin') {
    // Show ONLY Admin Dashboard
    if (aDash) aDash.classList.add('active');
    renderAdminDashboard();
  } else if (viewName === 'founder') {
    if (fDash) fDash.classList.add('active');
    renderFounderDashboard();
  } else if (viewName === 'investor') {
    if (iDash) iDash.classList.add('active');
    renderInvestorDashboard();
  } else {
    if (landing) landing.classList.add('active');
  }

  renderHeaderAuth();
}

function handleBrandClick() {
  const user = window.fundwebStore.state.currentUser;
  if (user && user.role === 'admin') {
    navigateTo('admin');
  } else if (user && user.role === 'founder') {
    navigateTo('founder');
  } else if (user && user.role === 'investor') {
    navigateTo('investor');
  } else {
    navigateTo('home');
  }
}

function scrollToSection(sectionId) {
  const user = window.fundwebStore.state.currentUser;
  if (user && user.role === 'admin') {
    navigateTo('admin');
    return;
  }
  navigateTo('home');
  setTimeout(() => {
    const elem = document.getElementById(sectionId);
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/* ==========================================================================
   HEADER AUTH & NOTIFICATIONS
   ========================================================================== */
function renderHeaderAuth() {
  const store = window.fundwebStore;
  const user = store.state.currentUser;
  const container = document.getElementById('headerAuthArea');
  const navContainer = document.querySelector('.fw-nav');
  const brandBadge = document.querySelector('.brand-badge');
  if (!container) return;

  const unreadCount = store.getUnreadNotificationCount(user ? user.id : null);

  // If Admin, customize top navigation specifically for Admin Governance
  if (user && user.role === 'admin') {
    if (brandBadge) brandBadge.textContent = 'Admin Console';
    if (navContainer) {
      navContainer.innerHTML = `
        <a href="javascript:void(0)" class="active" onclick="switchAdminTab('overview')">📊 Analytics</a>
        <a href="javascript:void(0)" onclick="switchAdminTab('verification')">🛡️ Verification Queue</a>
        <a href="javascript:void(0)" onclick="switchAdminTab('users')">👥 Users</a>
        <a href="javascript:void(0)" onclick="switchAdminTab('startups')">🚀 Startups</a>
        <a href="javascript:void(0)" onclick="switchAdminTab('payments')">💳 Transactions</a>
        <a href="javascript:void(0)" onclick="switchAdminTab('commission')">⚙️ Fee Engine</a>
      `;
    }
  } else {
    if (brandBadge) brandBadge.textContent = 'Ecosystem';
    if (navContainer) {
      navContainer.innerHTML = `
        <a href="#marketplace" onclick="navigateTo('home')">Discover Startups</a>
        <a href="#investors" onclick="navigateTo('home')">Investors</a>
        <a href="#pitch-room" onclick="navigateTo('home')">Pitch Room</a>
        <a href="#how-it-works" onclick="navigateTo('home')">How It Works</a>
        <a href="#pricing" onclick="navigateTo('home')">Platform Services</a>
        <a href="#plates" onclick="navigateTo('home')">Sketchbook</a>
      `;
    }
  }

  let html = '';
  // Notification Bell
  html += `
    <button class="icon-btn-round" onclick="toggleNotificationDrawer()" aria-label="Notifications">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
    </button>
  `;

  if (user) {
    const roleBadgeClass = user.role;
    html += `
      <div class="user-avatar-btn" onclick="navigateTo('${user.role}')">
        <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" class="user-avatar-img" alt="">
        <span style="font-size: 13px; font-weight: 600;">${user.name.split(' ')[0]}</span>
        <span class="user-role-badge ${roleBadgeClass}">${user.role}</span>
      </div>
      <button class="btn-pill btn-outline btn-sm" onclick="handleLogout()">Sign Out</button>
    `;
  } else {
    html += `
      <div style="display: flex; gap: 8px;">
        <button class="btn-pill btn-outline btn-sm" onclick="openAuthModal('login')">Sign In</button>
        <button class="btn-pill btn-primary btn-sm" onclick="openAuthModal('signup')">Sign Up</button>
      </div>
    `;
  }

  container.innerHTML = html;
}

function toggleNotificationDrawer() {
  const drawer = document.getElementById('notifDrawer');
  if (drawer) drawer.classList.toggle('active');
}

function renderNotifications() {
  const store = window.fundwebStore;
  const user = store.state.currentUser;
  const list = document.getElementById('notifList');
  if (!list) return;

  const notifs = store.state.notifications;
  if (!notifs.length) {
    list.innerHTML = `<div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 13px;">No notifications yet.</div>`;
    return;
  }

  list.innerHTML = notifs.map(n => `
    <div class="notif-d-item ${n.read ? '' : 'unread'}" onclick="handleNotifClick('${n.id}')">
      <div class="notif-d-title">${n.title}</div>
      <div class="notif-d-body">${n.body}</div>
      <div class="notif-d-time">${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  `).join('');
}

function handleNotifClick(id) {
  window.fundwebStore.markNotificationRead(id);
  const notif = window.fundwebStore.state.notifications.find(n => n.id === id);
  if (notif && notif.link) {
    toggleNotificationDrawer();
    const user = window.fundwebStore.state.currentUser;
    if (user) navigateTo(user.role);
  }
}

function markAllNotificationsRead() {
  window.fundwebStore.markAllNotificationsRead();
}

/* ==========================================================================
   STARTUP MARKETPLACE & FILTERING
   ========================================================================== */
function handleMarketFilterChange() {
  renderMarketplace();
}

function renderMarketplace() {
  const store = window.fundwebStore;
  const searchInput = document.getElementById('marketSearchInput');
  const industrySelect = document.getElementById('industryFilter');
  const stageSelect = document.getElementById('stageFilter');
  const sortSelect = document.getElementById('sortFilter');

  const filters = {
    search: searchInput ? searchInput.value : '',
    industry: industrySelect ? industrySelect.value : 'all',
    stage: stageSelect ? stageSelect.value : 'all',
    sortBy: sortSelect ? sortSelect.value : 'interest'
  };

  const startups = store.getStartups(filters);
  const grid = document.getElementById('startupsGrid');
  const invDiscoverGrid = document.getElementById('invDiscoverGrid');

  if (!grid && !invDiscoverGrid) return;

  const html = startups.map(s => {
    const isSaved = store.isStartupSaved(s.id);
    const progress = Math.min(100, Math.round((s.committedFunding / s.targetFunding) * 100));

    return `
      <div class="startup-card ${s.featured ? 'featured-card' : ''}">
        <div>
          <div class="sc-header">
            <img src="${s.logo}" alt="${s.name}" class="sc-logo">
            <div class="sc-title-wrap">
              <div class="sc-name">
                ${s.name}
                ${s.verified ? `<span class="verified-badge-icon" title="Verified by MCA & FundWeb">✓</span>` : ''}
              </div>
              <div class="sc-tags">
                <span class="tag-badge">${s.industry}</span>
                <span class="tag-badge stage">${s.stage}</span>
                <span class="tag-badge location">📍 ${s.location.split('/')[0].trim()}</span>
              </div>
            </div>
          </div>

          <p class="sc-tagline">${s.tagline}</p>

          <div class="sc-metrics-grid">
            <div class="sc-metric-item">
              <div class="sc-m-lbl">Raising</div>
              <div class="sc-m-val">₹${(s.targetFunding / 100000).toFixed(0)}L</div>
            </div>
            <div class="sc-metric-item">
              <div class="sc-m-lbl">Equity</div>
              <div class="sc-m-val">${s.equityOffered}%</div>
            </div>
            <div class="sc-metric-item">
              <div class="sc-m-lbl">Monthly Rev</div>
              <div class="sc-m-val">₹${(s.monthlyRevenue / 100000).toFixed(1)}L</div>
            </div>
          </div>

          <div class="sc-funding-progress">
            <div class="sc-fp-header">
              <span>Funding Interest</span>
              <span>${progress}% (₹${(s.committedFunding / 100000).toFixed(0)}L)</span>
            </div>
            <div class="sc-fp-bar">
              <div class="sc-fp-fill" style="width: ${progress}%;"></div>
            </div>
          </div>
        </div>

        <div class="sc-actions">
          <button class="btn-pill btn-primary btn-sm" onclick="openStartupModal('${s.id}')">View Details</button>
          <button class="btn-pill btn-outline btn-sm" onclick="toggleSaveStartup('${s.id}')" title="Save to Watchlist">
            ${isSaved ? '★ Saved' : '☆ Save'}
          </button>
          <button class="btn-pill btn-gold btn-sm" onclick="openInvestModal('${s.id}')">💰 Invest</button>
          <button class="btn-pill btn-outline btn-sm" onclick="openConnectModal('${s.id}')">Connect</button>
        </div>
      </div>
    `;
  }).join('');

  if (grid) grid.innerHTML = html || `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--ink-soft);">No startups matching current filters.</div>`;
  if (invDiscoverGrid) invDiscoverGrid.innerHTML = html;
}

function toggleSaveStartup(startupId) {
  const saved = window.fundwebStore.toggleSaveStartup(startupId);
  showToast(saved ? 'Startup added to saved watchlist' : 'Startup removed from saved watchlist');
}

/* ==========================================================================
   INVEST / CAPITAL COMMITMENT WORKFLOW (INVESTOR ACTION)
   ========================================================================== */
function openInvestModal(startupId) {
  const store = window.fundwebStore;
  const s = store.getStartupById(startupId) || store.state.startups[0];
  if (!s) return;

  const titleElem = document.getElementById('investModalTitle');
  const bodyElem = document.getElementById('investModalBody');
  const user = store.state.currentUser;

  if (titleElem) titleElem.textContent = `Invest in ${s.name}`;

  const remaining = s.targetFunding - s.committedFunding;
  const defaultTicket = s.minInvestmentTicket || 250000;

  if (bodyElem) {
    bodyElem.innerHTML = `
      <form id="investForm" onsubmit="handleCommitInvestment(event, '${s.id}')">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Target Round Ask</div>
              <div style="font-family: var(--mono); font-size: 20px; font-weight: 700; color: #0f172a;">₹${(s.targetFunding/100000).toFixed(0)}L</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Remaining Allocation</div>
              <div style="font-family: var(--mono); font-size: 20px; font-weight: 700; color: #059669;">₹${(remaining/100000).toFixed(0)}L</div>
            </div>
          </div>
          <div style="font-size: 12px; color: #64748b;">
            <strong>Valuation:</strong> ₹${(s.preMoneyValuation/10000000).toFixed(2)}Cr Pre-Money · <strong>Round Equity:</strong> ${s.equityOffered}%
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Select Ticket Size (INR)</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
            <button type="button" class="btn-pill btn-outline btn-sm" onclick="setInvestTicket(${defaultTicket})">₹${(defaultTicket/100000).toFixed(1)}L (Min)</button>
            <button type="button" class="btn-pill btn-outline btn-sm" onclick="setInvestTicket(500000)">₹5.0L</button>
            <button type="button" class="btn-pill btn-outline btn-sm" onclick="setInvestTicket(1000000)">₹10.0L</button>
          </div>
          <input type="number" class="form-control" id="investAmountInput" value="${defaultTicket}" min="${defaultTicket}" step="50000" oninput="updateInvestEquityCalc('${s.id}')" required>
        </div>

        <div id="investEquityPreview" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 12px 16px; margin-bottom: 18px; font-size: 13px; color: #065f46;">
          Estimated Equity Stake: <strong id="investEqPct">${((defaultTicket / s.preMoneyValuation) * 100).toFixed(2)}%</strong> in ${s.name} Series Seed CCPS
        </div>

        <div class="form-group">
          <label class="form-label">Investor / Syndicate Name</label>
          <input type="text" class="form-control" id="investorNameInput" value="${user ? user.name : 'Priya Mehra (Peak Horizons Capital)'}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Deal Intent Notes</label>
          <textarea class="form-control" rows="2" id="investNotesInput" placeholder="Lead investor syndicate commitment under SEBI AIF / Angel Network guidelines."></textarea>
        </div>

        <div style="background: rgba(0,0,0,0.04); border-radius: 6px; padding: 10px 14px; font-size: 11.5px; color: #64748b; margin-bottom: 20px; line-height: 1.5;">
          🛡️ <strong>Regulatory Note:</strong> Submitting investment intent generates a standardized legal term sheet and opens the escrow closing workflow.
        </div>

        <button type="submit" class="btn-pill btn-gold" style="width: 100%; justify-content: center; padding: 12px; font-size: 14px;">
          ✓ Confirm Capital Commitment
        </button>
      </form>
    `;
  }

  openModal('investModal');
}

function setInvestTicket(amt) {
  const input = document.getElementById('investAmountInput');
  if (input) {
    input.value = amt;
    input.dispatchEvent(new Event('input'));
  }
}

function updateInvestEquityCalc(startupId) {
  const store = window.fundwebStore;
  const s = store.getStartupById(startupId);
  const input = document.getElementById('investAmountInput');
  const eqElem = document.getElementById('investEqPct');
  if (s && input && eqElem) {
    const val = parseFloat(input.value) || 0;
    const pct = ((val / s.preMoneyValuation) * 100).toFixed(2);
    eqElem.textContent = `${pct}%`;
  }
}

function handleCommitInvestment(e, startupId) {
  e.preventDefault();
  const amt = parseFloat(document.getElementById('investAmountInput').value);
  const name = document.getElementById('investorNameInput').value;
  const notes = document.getElementById('investNotesInput').value;

  const res = window.fundwebStore.investInStartup({
    startupId,
    amount: amt,
    investorName: name,
    notes
  });

  closeModal('investModal');
  if (res.success) {
    showToast(`🎉 ₹${(amt/100000).toFixed(1)}L Capital Commitment Registered! Term sheet issued.`);
  } else {
    showToast(res.error);
  }
}

/* ==========================================================================
   STARTUP DETAILS MODAL
   ========================================================================== */
function openStartupModal(startupId) {
  const store = window.fundwebStore;
  const s = store.getStartupById(startupId);
  if (!s) return;

  const titleElem = document.getElementById('sdTitle');
  const bodyElem = document.getElementById('sdBody');
  const footerElem = document.getElementById('sdFooter');

  if (titleElem) titleElem.textContent = s.name;

  const progress = Math.min(100, Math.round((s.committedFunding / s.targetFunding) * 100));
  const remaining = s.targetFunding - s.committedFunding;
  const isSaved = store.isStartupSaved(s.id);

  if (bodyElem) {
    bodyElem.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
        <img src="${s.logo}" style="width: 72px; height: 72px; border-radius: 14px; object-fit: cover;" alt="">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h2 style="font-family: var(--display); font-size: 28px;">${s.name}</h2>
            ${s.verified ? `<span class="status-badge verified">✓ MCA Verified</span>` : ''}
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">${s.tagline}</p>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <span class="tag-badge">${s.industry}</span>
            <span class="tag-badge stage">${s.stage}</span>
            <span class="tag-badge location">📍 ${s.location}</span>
          </div>
        </div>
      </div>

      <!-- Funding & Valuation Strip -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 14px;">Round & Valuation Overview</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; text-align: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Target Ask</div>
            <div style="font-family: var(--mono); font-size: 18px; font-weight: 700;">₹${(s.targetFunding/100000).toFixed(0)}L</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Committed</div>
            <div style="font-family: var(--mono); font-size: 18px; font-weight: 700; color: #059669;">₹${(s.committedFunding/100000).toFixed(0)}L</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Remaining</div>
            <div style="font-family: var(--mono); font-size: 18px; font-weight: 700; color: #d97706;">₹${(remaining/100000).toFixed(0)}L</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Equity Offered</div>
            <div style="font-family: var(--mono); font-size: 18px; font-weight: 700;">${s.equityOffered}%</div>
          </div>
        </div>
        <div class="sc-funding-progress">
          <div class="sc-fp-header">
            <span>Syndicate Interest Progress</span>
            <span>${progress}%</span>
          </div>
          <div class="sc-fp-bar">
            <div class="sc-fp-fill" style="width: ${progress}%;"></div>
          </div>
        </div>
      </div>

      <!-- Traction Metrics -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px;">
        <div class="stat-card" style="padding: 16px;">
          <div style="font-size: 11px; color: #64748b;">Customers / Users</div>
          <div style="font-family: var(--mono); font-size: 20px; font-weight: 700;">${s.customersCount.toLocaleString()}</div>
        </div>
        <div class="stat-card" style="padding: 16px;">
          <div style="font-size: 11px; color: #64748b;">Monthly Revenue</div>
          <div style="font-family: var(--mono); font-size: 20px; font-weight: 700; color: #059669;">₹${(s.monthlyRevenue/100000).toFixed(1)}L</div>
        </div>
        <div class="stat-card" style="padding: 16px;">
          <div style="font-size: 11px; color: #64748b;">MoM Growth</div>
          <div style="font-family: var(--mono); font-size: 20px; font-weight: 700; color: #2563eb;">+${s.monthlyGrowthPercent}%</div>
        </div>
        <div class="stat-card" style="padding: 16px;">
          <div style="font-size: 11px; color: #64748b;">Annual Run Rate</div>
          <div style="font-family: var(--mono); font-size: 20px; font-weight: 700;">₹${(s.annualRunRate/10000000).toFixed(2)}Cr</div>
        </div>
      </div>

      <!-- Problem & Solution -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">The Problem</h3>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px;">${s.problem}</p>
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">The Solution & Product</h3>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">${s.solution}</p>
      </div>

      <!-- Use of Funds -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Use of Funds Allocation</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          ${(s.useOfFunds || []).map(u => `
            <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
              <span style="font-size: 13px; color: #334155;">${u.category}</span>
              <strong style="font-family: var(--mono); color: #0f172a;">${u.percent}%</strong>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Team -->
      <div>
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Founding Team</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${(s.team || []).map(t => `
            <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 14px;">${t.name}</strong>
                <div style="font-size: 12px; color: #64748b;">${t.role}</div>
              </div>
              <span style="font-size: 12px; color: #94a3b8;">${t.prev}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (footerElem) {
    footerElem.innerHTML = `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; width: 100%; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 8px;">
          <button class="btn-pill btn-outline btn-sm" onclick="downloadPitchDeckPDF('${s.name}')">📥 Deck Summary</button>
          <button class="btn-pill btn-outline btn-sm" onclick="downloadCapTableCSV('${s.name}')">📊 Cap Table (.csv)</button>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-pill btn-outline btn-sm" onclick="toggleSaveStartup('${s.id}')">${isSaved ? '★ Saved' : '☆ Save'}</button>
          <button class="btn-pill btn-outline btn-sm" onclick="openPitchRoomModal('${s.id}')">10-Slide Pitch</button>
          <button class="btn-pill btn-gold btn-sm" onclick="closeModal('startupModal'); openInvestModal('${s.id}')">💰 Invest Capital</button>
          <button class="btn-pill btn-outline btn-sm" onclick="openMeetingModal('${s.id}')">Schedule Meeting</button>
          <button class="btn-pill btn-primary btn-sm" onclick="openConnectModal('${s.id}')">Connect With Founder</button>
        </div>
      </div>
    `;
  }

  openModal('startupModal');
}

/* ==========================================================================
   INVESTORS DIRECTORY & PROFILE MODAL
   ========================================================================== */
function renderInvestors() {
  const store = window.fundwebStore;
  const grid = document.getElementById('investorsGrid');
  if (!grid) return;

  grid.innerHTML = store.state.investors.map(inv => `
    <div class="investor-card">
      <div class="inv-header">
        <img src="${inv.avatar}" class="inv-avatar" alt="${inv.name}">
        <div>
          <div class="inv-name">${inv.name}</div>
          <div class="inv-firm">${inv.firm} · ${inv.type}</div>
        </div>
      </div>
      <p class="inv-bio">${inv.bio}</p>
      <div class="inv-metrics-list">
        <div class="inv-m-row"><span>Check Size:</span> <span class="inv-m-val">${inv.checkSize}</span></div>
        <div class="inv-m-row"><span>Preferred Stages:</span> <span class="inv-m-val">${(inv.stages || []).join(', ')}</span></div>
        <div class="inv-m-row"><span>Focus Sectors:</span> <span class="inv-m-val">${(inv.sectors || []).join(', ')}</span></div>
        <div class="inv-m-row"><span>Portfolio Companies:</span> <span class="inv-m-val">${inv.portfolioCount} investments</span></div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: auto;">
        <button class="btn-pill btn-primary btn-sm" style="flex: 1;" onclick="openInvestorModal('${inv.id}')">View Profile</button>
        <button class="btn-pill btn-gold btn-sm" style="flex: 1;" onclick="openConnectModal('comp_nova_ai', '${inv.id}')">Connect</button>
      </div>
    </div>
  `).join('');
}

function openInvestorModal(invId) {
  const store = window.fundwebStore;
  const inv = store.state.investors.find(i => i.id === invId);
  if (!inv) return;

  const titleElem = document.getElementById('invModalTitle');
  const bodyElem = document.getElementById('invModalBody');

  if (titleElem) titleElem.textContent = `${inv.name} (${inv.firm})`;
  if (bodyElem) {
    bodyElem.innerHTML = `
      <div style="display: flex; gap: 18px; align-items: center; margin-bottom: 20px;">
        <img src="${inv.avatar}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover;" alt="">
        <div>
          <h3 style="font-family: var(--display); font-size: 24px;">${inv.name}</h3>
          <div style="color: var(--earth); font-weight: 600; font-size: 14px;">${inv.firm} · ${inv.type}</div>
          <div style="color: #64748b; font-size: 12px; margin-top: 2px;">📍 ${inv.location}</div>
        </div>
      </div>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px;">${inv.bio}</p>
      <div class="stat-card" style="margin-bottom: 20px;">
        <div class="inv-m-row" style="margin-bottom: 6px;"><span>Check Size:</span> <strong>${inv.checkSize}</strong></div>
        <div class="inv-m-row" style="margin-bottom: 6px;"><span>Target Stages:</span> <strong>${(inv.stages || []).join(', ')}</strong></div>
        <div class="inv-m-row"><span>Sectors:</span> <strong>${(inv.sectors || []).join(', ')}</strong></div>
      </div>
      <h4 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Notable Portfolio Deals</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
        ${(inv.portfolioExamples || ['Kapture CX', 'DocuSmart', 'DataMesh India']).map(p => `<span class="tag-badge">${p}</span>`).join('')}
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn-pill btn-primary btn-sm" style="flex: 1;" onclick="closeModal('investorModal'); openConnectModal('comp_nova_ai', '${inv.id}')">Send Pitch Connection</button>
        <button class="btn-pill btn-gold btn-sm" style="flex: 1;" onclick="closeModal('investorModal'); openMeetingModal('comp_nova_ai', '${inv.id}')">Request Meeting</button>
      </div>
    `;
  }

  openModal('investorModal');
}

/* ==========================================================================
   PITCH ROOM SLIDER ENGINE (10 SLIDES)
   ========================================================================== */
function renderPitchRoomPreview(startupId) {
  const store = window.fundwebStore;
  const s = store.getStartupById(startupId) || store.state.startups[0];
  if (!s || !s.pitchSlides) return;

  activeStartupForPitch = s;
  const slide = s.pitchSlides[currentPitchSlideIdx];
  if (!slide) return;

  const titleElem = document.getElementById('prStartupTitle');
  const metaElem = document.getElementById('prStartupMeta');
  const sNumElem = document.getElementById('prSlideNum');
  const sTitleElem = document.getElementById('prSlideTitle');
  const sSubElem = document.getElementById('prSlideSub');
  const sBodyElem = document.getElementById('prSlideBody');
  const sHighElem = document.getElementById('prSlideHighlight');
  const thumbsNav = document.getElementById('pitchThumbsNav');

  if (titleElem) titleElem.textContent = s.name;
  if (metaElem) metaElem.textContent = `${s.tagline} · Seeking ₹${(s.targetFunding/100000).toFixed(0)}L for ${s.equityOffered}% Equity`;
  if (sNumElem) sNumElem.textContent = `${slide.slideNumber} · ${slide.title}`;
  if (sTitleElem) sTitleElem.textContent = slide.subtitle;
  if (sSubElem) sSubElem.textContent = slide.title;
  if (sBodyElem) sBodyElem.textContent = slide.content;
  if (sHighElem) sHighElem.textContent = `⚡ ${slide.metric}`;

  if (thumbsNav) {
    thumbsNav.innerHTML = s.pitchSlides.map((sl, idx) => `
      <div class="pitch-thumb-dot ${idx === currentPitchSlideIdx ? 'active' : ''}" onclick="goToPitchSlide(${idx})">${sl.slideNumber}</div>
    `).join('');
  }
}

function prevPitchSlide() {
  if (!activeStartupForPitch) return;
  currentPitchSlideIdx = (currentPitchSlideIdx - 1 + activeStartupForPitch.pitchSlides.length) % activeStartupForPitch.pitchSlides.length;
  renderPitchRoomPreview(activeStartupForPitch.id);
}

function nextPitchSlide() {
  if (!activeStartupForPitch) return;
  currentPitchSlideIdx = (currentPitchSlideIdx + 1) % activeStartupForPitch.pitchSlides.length;
  renderPitchRoomPreview(activeStartupForPitch.id);
}

function goToPitchSlide(idx) {
  currentPitchSlideIdx = idx;
  if (activeStartupForPitch) renderPitchRoomPreview(activeStartupForPitch.id);
}

/* Fullscreen Pitch Room Modal */
function openPitchRoomModal(startupId) {
  const store = window.fundwebStore;
  const s = store.getStartupById(startupId) || store.state.startups[0];
  if (!s) return;

  activeStartupForPitch = s;
  modalPitchSlideIdx = 0;
  renderModalPitchSlide();
  openModal('pitchRoomModal');
}

function renderModalPitchSlide() {
  if (!activeStartupForPitch || !activeStartupForPitch.pitchSlides) return;
  const s = activeStartupForPitch;
  const slide = s.pitchSlides[modalPitchSlideIdx];
  if (!slide) return;

  const titleElem = document.getElementById('modalPrTitle');
  const metaElem = document.getElementById('modalPrMeta');
  const contentElem = document.getElementById('modalPrSlideContent');
  const thumbsElem = document.getElementById('modalPrThumbs');

  if (titleElem) titleElem.textContent = `${s.name} — Pitch Presentation`;
  if (metaElem) metaElem.textContent = `Slide ${modalPitchSlideIdx + 1} of ${s.pitchSlides.length}`;

  if (contentElem) {
    contentElem.innerHTML = `
      <div>
        <div class="pitch-slide-num" style="color: #38bdf8;">${slide.slideNumber} · ${slide.title}</div>
        <h2 class="pitch-slide-title" style="font-size: 38px;">${slide.subtitle}</h2>
        <p class="pitch-slide-body" style="font-size: 17px; max-width: 70ch; margin: 16px 0 24px;">${slide.content}</p>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="pitch-slide-highlight">
          ⚡ Key Metric: ${slide.metric}
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn-pill btn-gold btn-sm" onclick="closeModal('pitchRoomModal'); openConnectModal('${s.id}')">Connect With Founder</button>
          <button class="btn-pill btn-outline btn-sm" style="color: #fff; border-color: rgba(255,255,255,0.3);" onclick="closeModal('pitchRoomModal'); openMeetingModal('${s.id}')">Book Pitch Call</button>
        </div>
      </div>
    `;
  }

  if (thumbsElem) {
    thumbsElem.innerHTML = s.pitchSlides.map((sl, idx) => `
      <div class="pitch-thumb-dot ${idx === modalPitchSlideIdx ? 'active' : ''}" onclick="modalPitchSlideIdx = ${idx}; renderModalPitchSlide();">${sl.slideNumber}</div>
    `).join('');
  }
}

function prevModalPitchSlide() {
  if (!activeStartupForPitch) return;
  modalPitchSlideIdx = (modalPitchSlideIdx - 1 + activeStartupForPitch.pitchSlides.length) % activeStartupForPitch.pitchSlides.length;
  renderModalPitchSlide();
}

function nextModalPitchSlide() {
  if (!activeStartupForPitch) return;
  modalPitchSlideIdx = (modalPitchSlideIdx + 1) % activeStartupForPitch.pitchSlides.length;
  renderModalPitchSlide();
}

/* ==========================================================================
   PLATFORM SERVICES & PRICING
   ========================================================================== */
function renderPricing() {
  const store = window.fundwebStore;
  const grid = document.getElementById('pricingGrid');
  if (!grid) return;

  grid.innerHTML = store.state.services.map(srv => `
    <div class="pricing-card ${srv.id === 'srv_featured_listing' ? 'featured' : ''}">
      ${srv.id === 'srv_featured_listing' ? `<div class="pricing-badge">Most Popular</div>` : ''}
      <div>
        <h3 class="pricing-name">${srv.name}</h3>
        <p style="font-size: 13px; color: var(--ink-soft);">${srv.description}</p>
        <div class="pricing-price">₹${srv.price.toLocaleString('en-IN')}</div>
        <div class="pricing-period">Billed ${srv.period} via Razorpay Rails</div>
        <ul class="pricing-features">
          ${srv.features.map(f => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${f}</li>`).join('')}
        </ul>
      </div>
      <button class="btn-pill btn-primary btn-sm" style="width: 100%;" onclick="openCheckoutModal('${srv.id}')">Select Service</button>
    </div>
  `).join('');
}

/* ==========================================================================
   RAZORPAY PLATFORM PAYMENT ARCHITECTURE & REAL-WORLD CHECKOUT
   ========================================================================== */
const PLATFORM_UPI_ID = '99998106880@fam';
let paymentTimerInterval = null;

function openCheckoutModal(serviceId) {
  const store = window.fundwebStore;
  const srv = store.state.services.find(s => s.id === serviceId) || store.state.services[0];
  const user = store.state.currentUser;

  const breakdown = store.calculateServiceCommission(srv.price);
  const container = document.getElementById('checkoutModalBody');
  if (!container) return;

  const upiUri = `upi://pay?pa=${encodeURIComponent(PLATFORM_UPI_ID)}&pn=FundWeb%20Platform&am=${breakdown.grossAmount}&cu=INR&tn=FundWeb_${srv.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUri)}`;

  container.innerHTML = `
    <div class="razorpay-sim-box">
      <div class="rzp-header">
        <div>
          <div class="rzp-logo">⚡ RAZORPAY PLATFORM RAILS</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">FundWeb Secured Gateway · GST Invoiced</div>
        </div>
        <div style="text-align: right;">
          <div class="rzp-amt">₹${breakdown.grossAmount.toLocaleString('en-IN')}</div>
          <div style="font-size: 10.5px; color: #94a3b8; font-family: var(--mono);">Expires in <span id="rzpCountdown" style="color: #fbbf24; font-weight: 700;">05:00</span></div>
        </div>
      </div>

      <div class="rzp-payment-tabs">
        <div class="rzp-tab-btn active" id="tabUPI" onclick="setCheckoutTab('upi', '${srv.id}', ${breakdown.grossAmount})">UPI QR & Apps</div>
        <div class="rzp-tab-btn" id="tabCard" onclick="setCheckoutTab('card', '${srv.id}', ${breakdown.grossAmount})">Cards (Visa/Mastercard)</div>
        <div class="rzp-tab-btn" id="tabNet" onclick="setCheckoutTab('net', '${srv.id}', ${breakdown.grossAmount})">NetBanking</div>
      </div>

      <div id="rzpTabContent">
        <!-- Default UPI QR Content -->
        <div style="background: #ffffff; color: #0f172a; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
          <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Scan with any UPI App (GPay / PhonePe / Paytm / CRED)</div>
          
          <div style="display: inline-block; padding: 10px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px;">
            <img src="${qrUrl}" alt="UPI QR Code" style="width: 190px; height: 190px; display: block; border-radius: 6px;" onerror="this.onerror=null; this.src='https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(upiUri)}';">
          </div>

          <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px;">
            <div style="text-align: left;">
              <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">FundWeb Official UPI ID</div>
              <div style="font-family: var(--mono); font-size: 14px; font-weight: 700; color: #0f172a;">${PLATFORM_UPI_ID}</div>
            </div>
            <button class="btn-pill btn-outline btn-sm" style="background: #fff; padding: 5px 12px; font-size: 11.5px;" onclick="copyUpiId('${PLATFORM_UPI_ID}')">📋 Copy ID</button>
          </div>

          <div style="display: flex; gap: 6px; justify-content: center; align-items: center; font-size: 11px; color: #64748b; margin-top: 6px;">
            <span style="font-weight: 600;">Supported:</span>
            <span class="tag-badge">GPay</span>
            <span class="tag-badge">PhonePe</span>
            <span class="tag-badge">Paytm</span>
            <span class="tag-badge">BHIM UPI</span>
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="font-size: 11.5px; color: #94a3b8; display: block; margin-bottom: 4px;">Optional: 12-Digit UPI Reference / UTR Number</label>
          <input type="text" class="form-control" id="rzpUtrInput" placeholder="e.g. 426109845214" maxlength="12" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff; font-family: var(--mono); font-size: 13px;">
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.3); padding: 12px 14px; border-radius: 8px; font-size: 12px; color: #cbd5e1; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.08);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Service: ${srv.name}</span> <span style="font-weight: 600;">₹${breakdown.grossAmount.toLocaleString('en-IN')}</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #94a3b8;"><span>FundWeb Platform Fee (${breakdown.platformFeePercent}%):</span> <span>₹${breakdown.fundwebFee}</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #94a3b8;"><span>Payment Processing Rails:</span> <span>₹${breakdown.gatewayFee}</span></div>
        <div style="display: flex; justify-content: space-between; color: #94a3b8;"><span>GST / Applicable Tax (18%):</span> <span>₹${breakdown.taxGst}</span></div>
      </div>

      <button id="rzpPayBtn" class="btn-pill btn-gold" style="width: 100%; justify-content: center; padding: 13px; font-size: 14px;" onclick="executeSimulatedPayment('${srv.id}')">
        ✓ I Have Paid ₹${breakdown.grossAmount.toLocaleString('en-IN')} — Verify Payment
      </button>
    </div>
  `;

  startPaymentCountdown(300);
  openModal('checkoutModal');
}

function copyUpiId(id) {
  navigator.clipboard.writeText(id).then(() => {
    showToast(`✓ UPI ID ${id} copied to clipboard!`);
  }).catch(() => {
    showToast(`UPI ID: ${id}`);
  });
}

function startPaymentCountdown(seconds) {
  if (paymentTimerInterval) clearInterval(paymentTimerInterval);
  let remaining = seconds;
  const elem = document.getElementById('rzpCountdown');
  
  paymentTimerInterval = setInterval(() => {
    remaining--;
    if (elem) {
      const m = Math.floor(remaining / 60).toString().padStart(2, '0');
      const s = (remaining % 60).toString().padStart(2, '0');
      elem.textContent = `${m}:${s}`;
    }
    if (remaining <= 0) {
      clearInterval(paymentTimerInterval);
    }
  }, 1000);
}

function setCheckoutTab(tabName, serviceId, grossAmount) {
  document.querySelectorAll('.rzp-tab-btn').forEach(b => b.classList.remove('active'));
  const content = document.getElementById('rzpTabContent');
  if (!content) return;

  if (tabName === 'upi') {
    document.getElementById('tabUPI').classList.add('active');
    const upiUri = `upi://pay?pa=${encodeURIComponent(PLATFORM_UPI_ID)}&pn=FundWeb%20Platform&am=${grossAmount}&cu=INR&tn=FundWeb_${serviceId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUri)}`;

    content.innerHTML = `
      <div style="background: #ffffff; color: #0f172a; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
        <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Scan with any UPI App</div>
        <div style="display: inline-block; padding: 10px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px;">
          <img src="${qrUrl}" alt="UPI QR Code" style="width: 190px; height: 190px; display: block; border-radius: 6px;">
        </div>
        <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px;">
          <div style="text-align: left;">
            <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">FundWeb Official UPI ID</div>
            <div style="font-family: var(--mono); font-size: 14px; font-weight: 700; color: #0f172a;">${PLATFORM_UPI_ID}</div>
          </div>
          <button class="btn-pill btn-outline btn-sm" style="background: #fff; padding: 5px 12px; font-size: 11.5px;" onclick="copyUpiId('${PLATFORM_UPI_ID}')">📋 Copy ID</button>
        </div>
      </div>
      <div style="margin-bottom: 14px;">
        <label style="font-size: 11.5px; color: #94a3b8; display: block; margin-bottom: 4px;">Optional: 12-Digit UPI Reference / UTR Number</label>
        <input type="text" class="form-control" id="rzpUtrInput" placeholder="e.g. 426109845214" maxlength="12" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff; font-family: var(--mono); font-size: 13px;">
      </div>
    `;
  } else if (tabName === 'card') {
    document.getElementById('tabCard').classList.add('active');
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <div>
          <label style="font-size: 11.5px; color: #94a3b8; display: block; margin-bottom: 4px;">Card Number</label>
          <input type="text" class="form-control" placeholder="4111 •••• •••• 4821" value="4111 2894 3820 4821" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff; font-family: var(--mono);">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 11.5px; color: #94a3b8; display: block; margin-bottom: 4px;">Valid Thru</label>
            <input type="text" class="form-control" placeholder="MM/YY" value="08/29" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff; font-family: var(--mono);">
          </div>
          <div>
            <label style="font-size: 11.5px; color: #94a3b8; display: block; margin-bottom: 4px;">CVV / CVC</label>
            <input type="password" class="form-control" placeholder="•••" value="842" maxlength="4" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff; font-family: var(--mono);">
          </div>
        </div>
      </div>
    `;
  } else {
    document.getElementById('tabNet').classList.add('active');
    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <label style="font-size: 11.5px; color: #94a3b8; display: block; margin-bottom: 6px;">Select Indian Commercial Bank</label>
        <select class="form-control" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff;">
          <option style="color: #000;">HDFC Bank Corporate NetBanking</option>
          <option style="color: #000;">ICICI Bank Commercial Banking</option>
          <option style="color: #000;">State Bank of India (SBI)</option>
          <option style="color: #000;">Axis Bank Retail & Corporate</option>
          <option style="color: #000;">Kotak Mahindra Bank</option>
        </select>
      </div>
    `;
  }
}

function executeSimulatedPayment(serviceId) {
  const store = window.fundwebStore;
  const user = store.state.currentUser;
  const btn = document.getElementById('rzpPayBtn');
  const utrInput = document.getElementById('rzpUtrInput');
  const utr = utrInput && utrInput.value.trim() ? utrInput.value.trim() : ('UTR' + Math.floor(100000000000 + Math.random() * 900000000000));

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `⏳ Verifying with NPCI / Banking Switch (${PLATFORM_UPI_ID})...`;
  }

  setTimeout(() => {
    if (btn) btn.innerHTML = `🔒 Validating UTR ${utr} & Cryptographic Signature...`;

    setTimeout(() => {
      if (paymentTimerInterval) clearInterval(paymentTimerInterval);
      
      const tx = store.createPlatformPayment({
        serviceId,
        paymentMethod: `UPI Rails (${PLATFORM_UPI_ID}) · Ref: ${utr}`,
        userDetails: user || { id: 'usr_founder_1', name: 'Aarav Sharma' }
      });

      closeModal('checkoutModal');
      showToast(`✓ Payment of ₹${tx.grossAmount.toLocaleString('en-IN')} verified on UPI Rails!`);
      openInvoiceModal(tx.id);
    }, 1200);
  }, 1000);
}

function openInvoiceModal(txId) {
  const store = window.fundwebStore;
  const tx = store.state.transactions.find(t => t.id === txId) || store.state.transactions[0];
  if (!tx) return;

  const container = document.getElementById('invoiceModalBody');
  if (!container) return;

  container.innerHTML = `
    <div class="invoice-sheet">
      <div class="invoice-top-row">
        <div>
          <div style="font-family: var(--display); font-size: 26px; font-weight: 700;">FundWeb Technologies</div>
          <div style="font-size: 11.5px; color: #64748b;">GSTIN: 24AABCF1924L1Z2 · Tax Invoice</div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--mono); font-weight: 700; font-size: 15px;">${tx.invoiceNumber}</div>
          <div style="font-size: 12px; color: #64748b;">Date: ${new Date(tx.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px;">
        <div>
          <strong>Billed To:</strong><br>
          ${tx.userName}<br>
          Verified Platform Member
        </div>
        <div style="text-align: right;">
          <strong>Order ID:</strong> ${tx.orderId}<br>
          <strong>Status:</strong> <span class="status-badge paid">Paid</span>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Provider Rails</th>
            <th style="text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${tx.serviceName}</strong><br><span style="font-size: 11px; color: #64748b;">Platform service fee & marketplace feature</span></td>
            <td>${tx.paymentProvider}</td>
            <td style="text-align: right; font-family: var(--mono);">₹${tx.grossAmount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-left: auto; width: 240px; font-size: 13px; line-height: 1.8;">
        <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span> <span>₹${tx.grossAmount}</span></div>
        <div style="display: flex; justify-content: space-between; color: #64748b;"><span>FundWeb Fee:</span> <span>₹${tx.fundwebFee}</span></div>
        <div style="display: flex; justify-content: space-between; color: #64748b;"><span>Gateway & Tax:</span> <span>₹${tx.gatewayFee + tx.taxGst}</span></div>
        <div style="display: flex; justify-content: space-between; border-top: 2px solid #0f172a; font-weight: 700; font-size: 15px; margin-top: 6px;">
          <span>Total Paid:</span> <span style="color: #059669;">₹${tx.grossAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  `;

  openModal('invoiceModal');
}

/* ==========================================================================
   AUTHENTICATION & ONBOARDING GATEWAY
   ========================================================================== */
function openWelcomeGatewayModal() {
  const title = document.getElementById('authModalTitle');
  const body = document.getElementById('authModalBody');
  if (!body) return;

  title.textContent = 'Welcome to FundWeb';
  body.innerHTML = `
    <div style="text-align: center; margin-bottom: 22px;">
      <div style="font-size: 13px; font-weight: 700; color: var(--earth); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;">
        Where Startups Meet Capital
      </div>
      <p style="color: #64748b; font-size: 14.5px; line-height: 1.5; margin: 0 auto; max-width: 440px;">
        Join our curated venture ecosystem to pitch startups, deploy capital, or govern platform operations.
      </p>
    </div>

    <div class="account-choice-grid" style="margin-bottom: 20px;">
      <div class="choice-card" onclick="openAuthModal('login')" style="padding: 20px 16px;">
        <div class="choice-card-icon">🔑</div>
        <div class="choice-card-title" style="font-size: 18px;">Sign In</div>
        <div class="choice-card-desc">Access your Founder, Investor, or Admin portal</div>
      </div>
      <div class="choice-card" onclick="openAuthModal('signup')" style="padding: 20px 16px;">
        <div class="choice-card-icon">✨</div>
        <div class="choice-card-title" style="font-size: 18px;">Create Account</div>
        <div class="choice-card-desc">Register as a Founder or Accredited Investor</div>
      </div>
    </div>

    <!-- Quick 1-Click Access Pill Bar -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; text-align: center; margin-bottom: 10px;">
        ⚡ Instant Quick Demo Portals
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
        <button class="btn-pill btn-outline btn-sm" onclick="quickDemoLogin('admin')">🔒 Admin (admin@fun.in)</button>
        <button class="btn-pill btn-outline btn-sm" onclick="quickDemoLogin('founder')">🚀 Founder (Aarav)</button>
        <button class="btn-pill btn-outline btn-sm" onclick="quickDemoLogin('investor')">💼 Investor (Priya)</button>
      </div>
      <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 8px; font-family: var(--mono);">
        Admin Credentials: <strong>admin@fun.in</strong> · Pass: <strong>123456</strong>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 14px;">
      <span style="font-size: 13px; color: #64748b;">Just exploring?</span>
      <button class="btn-pill btn-primary btn-sm" onclick="closeModal('authModal')">🌐 Explore Marketplace as Guest</button>
    </div>
  `;

  openModal('authModal');
}

function openAuthModal(mode) {
  const title = document.getElementById('authModalTitle');
  const body = document.getElementById('authModalBody');
  if (!body) return;

  if (mode === 'signup') {
    title.textContent = 'Choose Your Account Type';
    body.innerHTML = `
      <p style="color: #64748b; font-size: 14px; text-align: center;">Select your profile to join FundWeb’s curated startup ecosystem.</p>
      <div class="account-choice-grid">
        <div class="choice-card" onclick="openAuthModal('founder_signup')">
          <div class="choice-card-icon">🚀</div>
          <div class="choice-card-title">Founder / Company</div>
          <div class="choice-card-desc">Build, pitch, & raise venture capital</div>
        </div>
        <div class="choice-card" onclick="openAuthModal('investor_signup')">
          <div class="choice-card-icon">💼</div>
          <div class="choice-card-title">Investor</div>
          <div class="choice-card-desc">Discover deals, review decks, & deploy capital</div>
        </div>
      </div>
      <p style="text-align: center; font-size: 13px; color: #64748b;">Already have an account? <a href="javascript:void(0)" onclick="openAuthModal('login')" style="color: var(--earth); font-weight: 600;">Sign In</a></p>
    `;
  } else if (mode === 'founder_signup') {
    title.textContent = 'Founder / Company Registration';
    body.innerHTML = `
      <form onsubmit="handleFounderRegister(event)">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" id="fRegName" required placeholder="Aarav Sharma">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" id="fRegEmail" required placeholder="founder@startup.io">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Company Name</label>
            <input type="text" class="form-control" id="fRegCompany" required placeholder="NovaAI Tech">
          </div>
          <div class="form-group">
            <label class="form-label">Industry</label>
            <select class="form-control" id="fRegIndustry">
              <option value="AI / SaaS">AI / SaaS</option>
              <option value="FinTech">FinTech</option>
              <option value="HealthTech">HealthTech</option>
              <option value="CleanTech">CleanTech</option>
              <option value="DeepTech">DeepTech</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Funding Required (₹)</label>
            <input type="number" class="form-control" id="fRegTarget" required placeholder="5000000">
          </div>
          <div class="form-group">
            <label class="form-label">Equity Offered (%)</label>
            <input type="number" class="form-control" id="fRegEquity" required placeholder="10">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Problem & Solution Summary</label>
          <textarea class="form-control" rows="3" id="fRegSolution" required placeholder="Describe what you are building and why customers love it..."></textarea>
        </div>
        <button type="submit" class="btn-pill btn-primary" style="width: 100%;">Create Founder Profile</button>
      </form>
    `;
  } else if (mode === 'investor_signup') {
    title.textContent = 'Accredited Investor Registration';
    body.innerHTML = `
      <form onsubmit="handleInvestorRegister(event)">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" id="invRegName" required placeholder="Priya Mehra">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" id="invRegEmail" required placeholder="priya@fund.com">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Investor Type</label>
            <select class="form-control" id="invRegType">
              <option value="VC">Venture Capital (VC)</option>
              <option value="Angel Investor">Angel Investor</option>
              <option value="Family Office">Family Office</option>
              <option value="Corporate Investor">Corporate VC</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Investment Range</label>
            <input type="text" class="form-control" id="invRegRange" required placeholder="₹25L - ₹2Cr">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">LinkedIn / Entity URL</label>
          <input type="url" class="form-control" id="invRegLinkedin" placeholder="https://linkedin.com/in/investor">
        </div>
        <button type="submit" class="btn-pill btn-gold" style="width: 100%;">Complete Investor Onboarding</button>
      </form>
    `;
  } else {
    // Mode: Login
    title.textContent = 'Welcome Back to FundWeb';
    body.innerHTML = `
      <form onsubmit="handleLoginSubmit(event)">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-control" id="loginEmail" required placeholder="founder@fundweb.io or admin@fun.in">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div style="position: relative;">
            <input type="password" class="form-control" id="loginPassword" required value="123456">
            <button type="button" onclick="togglePasswordVisibility()" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #64748b;">Show</button>
          </div>
        </div>
        <button type="submit" class="btn-pill btn-primary" style="width: 100%; margin-top: 8px;">Login</button>
      </form>

      <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center;">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Quick Demo Logins</div>
        <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 10px;">
          <button class="btn-pill btn-outline btn-sm" onclick="quickDemoLogin('founder')">🚀 Founder</button>
          <button class="btn-pill btn-outline btn-sm" onclick="quickDemoLogin('investor')">💼 Investor</button>
          <button class="btn-pill btn-outline btn-sm" onclick="quickDemoLogin('admin')">🔒 Admin (admin@fun.in)</button>
        </div>
        <div style="font-size: 11px; color: #94a3b8; font-family: var(--mono);">Admin Login: admin@fun.in · Pass: 123456</div>
      </div>
    `;
  }

  openModal('authModal');
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPassword').value;
  const res = window.fundwebStore.login(email, pass);
  if (res.success) {
    closeModal('authModal');
    showToast(`Welcome back, ${res.user.name}!`);
  } else {
    showToast(res.error || 'Login failed');
  }
}

function quickDemoLogin(role) {
  let email = 'founder@fundweb.io';
  let pass = '123456';
  if (role === 'investor') email = 'investor@fundweb.io';
  if (role === 'admin') email = 'admin@fun.in';

  const res = window.fundwebStore.login(email, pass);
  if (res.success) {
    closeModal('authModal');
    showToast(`Logged in as ${role.toUpperCase()} (${email})`);
  }
}

function handleFounderRegister(e) {
  e.preventDefault();
  const data = {
    fullName: document.getElementById('fRegName').value,
    email: document.getElementById('fRegEmail').value,
    companyName: document.getElementById('fRegCompany').value,
    industry: document.getElementById('fRegIndustry').value,
    fundingRequired: document.getElementById('fRegTarget').value,
    equityOffered: document.getElementById('fRegEquity').value,
    solution: document.getElementById('fRegSolution').value
  };

  const res = window.fundwebStore.registerFounder(data);
  if (res.success) {
    closeModal('authModal');
    showToast('Founder profile created and registered!');
    navigateTo('founder');
  }
}

function handleInvestorRegister(e) {
  e.preventDefault();
  const data = {
    fullName: document.getElementById('invRegName').value,
    email: document.getElementById('invRegEmail').value,
    investorType: document.getElementById('invRegType').value,
    investmentRange: document.getElementById('invRegRange').value,
    linkedin: document.getElementById('invRegLinkedin').value
  };

  const res = window.fundwebStore.registerInvestor(data);
  if (res.success) {
    closeModal('authModal');
    showToast('Investor onboarding completed!');
    navigateTo('investor');
  }
}

function handleLogout() {
  window.fundwebStore.logout();
  showToast('Logged out successfully');
  navigateTo('home');
}

function togglePasswordVisibility() {
  const p = document.getElementById('loginPassword');
  if (p) p.type = p.type === 'password' ? 'text' : 'password';
}

/* ==========================================================================
   CONNECTION & MEETING WORKFLOWS
   ========================================================================== */
function openConnectModal(startupId, investorId = null) {
  const startupInput = document.getElementById('connectStartupId');
  if (startupInput) startupInput.value = startupId;
  openModal('connectModal');
}

function handleSendConnectRequest(e) {
  e.preventDefault();
  const startupId = document.getElementById('connectStartupId').value;
  const name = document.getElementById('connSenderName').value;
  const email = document.getElementById('connSenderEmail').value;
  const msg = document.getElementById('connMessage').value;

  window.fundwebStore.sendConnectionRequest({
    startupId,
    senderName: name,
    senderEmail: email,
    message: msg
  });

  closeModal('connectModal');
  showToast('✓ Connection Request Sent Successfully!');
}

function openMeetingModal(startupId, investorId = null) {
  const store = window.fundwebStore;
  const s = store.getStartupById(startupId) || store.state.startups[0];
  const startupInput = document.getElementById('meetStartupId');
  const dateInput = document.getElementById('meetDate');

  if (startupInput) startupInput.value = s.id;
  if (dateInput) {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    dateInput.value = d.toISOString().slice(0, 10);
  }

  openModal('meetingModal');
}

function handleScheduleMeeting(e) {
  e.preventDefault();
  const store = window.fundwebStore;
  const startupId = document.getElementById('meetStartupId').value;
  const s = store.getStartupById(startupId) || store.state.startups[0];

  const date = document.getElementById('meetDate').value;
  const time = document.getElementById('meetTime').value;
  const type = document.getElementById('meetType').value;
  const agenda = document.getElementById('meetAgenda').value;

  store.scheduleMeeting({
    startupId: s.id,
    startupName: s.name,
    founderId: s.founderId,
    founderName: s.founderName,
    investorId: 'inv_1',
    investorName: 'Priya Mehra (Peak Horizons)',
    date,
    time,
    type,
    agenda
  });

  closeModal('meetingModal');
  showToast(`✓ Meeting Scheduled for ${date} at ${time}!`);
}

/* ==========================================================================
   FOUNDER DASHBOARD LOGIC & TABS
   ========================================================================== */
function switchFounderTab(tabId) {
  document.querySelectorAll('#founderDashboard .dash-tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#founderDashboard .dash-nav-btn').forEach(b => b.classList.remove('active'));

  const pane = document.getElementById(`fTab_${tabId}`);
  if (pane) pane.classList.add('active');

  const btn = Array.from(document.querySelectorAll('#founderDashboard .dash-nav-btn')).find(b => b.textContent.toLowerCase().includes(tabId));
  if (btn) btn.classList.add('active');
}

function renderFounderDashboard() {
  const store = window.fundwebStore;
  const user = store.state.currentUser;
  const startup = store.state.startups[0]; // Active founder startup

  const nameElem = document.getElementById('founderSidebarName');
  const compElem = document.getElementById('founderSidebarComp');
  const targetElem = document.getElementById('kpiFundingTarget');

  if (nameElem && user) nameElem.textContent = user.name;
  if (compElem && startup) compElem.textContent = `${startup.name} · ${startup.stage}`;
  if (targetElem && startup) targetElem.textContent = `₹${(startup.targetFunding / 100000).toFixed(0)},00,000`;

  renderFounderConnections();
  renderChatMessages('founder');
  renderFounderMeetings();
  renderFounderInvoices();
}

function renderFounderConnections() {
  const store = window.fundwebStore;
  const conns = store.state.connections;
  const quickBody = document.getElementById('founderConnTableBody');
  const fullBody = document.getElementById('founderFullConnBody');
  const badge = document.getElementById('founderConnBadge');

  if (badge) badge.textContent = conns.length;

  const html = conns.map(c => `
    <tr>
      <td><strong>${c.investorName}</strong></td>
      <td>${c.investorFirm}</td>
      <td style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.message}</td>
      <td><span class="status-badge ${c.status}">${c.status}</span></td>
      <td>${new Date(c.createdAt).toLocaleDateString()}</td>
      <td>
        ${c.status === 'pending' ? `
          <button class="btn-pill btn-primary btn-sm" onclick="handleAcceptConn('${c.id}')">Accept</button>
        ` : `
          <button class="btn-pill btn-outline btn-sm" onclick="switchFounderTab('messages')">Chat</button>
        `}
      </td>
    </tr>
  `).join('');

  if (quickBody) quickBody.innerHTML = html;
  if (fullBody) fullBody.innerHTML = html;
}

function handleAcceptConn(connId) {
  window.fundwebStore.updateConnectionStatus(connId, 'connected');
  showToast('Connection accepted! You can now message the investor.');
}

function renderFounderMeetings() {
  const store = window.fundwebStore;
  const meets = store.state.meetings;
  const body = document.getElementById('founderMeetingsBody');
  const badge = document.getElementById('founderMeetBadge');
  if (badge) badge.textContent = meets.length;
  if (!body) return;

  body.innerHTML = meets.map(m => `
    <tr>
      <td><strong>${m.investorName}</strong></td>
      <td>${m.date} at ${m.time}</td>
      <td><span class="tag-badge stage">${m.type}</span></td>
      <td><a href="${m.meetLink}" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: underline;">🎥 Join Room</a></td>
      <td><span class="status-badge ${m.status}">${m.status}</span></td>
      <td>
        <button class="btn-pill btn-outline btn-sm" onclick="downloadCalendarEvent('${m.type} with ${m.investorName}', '${m.date}', '${m.time}')">🗓️ Export .ics</button>
      </td>
    </tr>
  `).join('');
}

function renderFounderInvoices() {
  const store = window.fundwebStore;
  const txs = store.state.transactions;
  const body = document.getElementById('founderInvoicesBody');
  if (!body) return;

  body.innerHTML = txs.map(t => `
    <tr>
      <td><strong>${t.invoiceNumber}</strong></td>
      <td>${t.serviceName}</td>
      <td style="font-family: var(--mono); font-weight: 700;">₹${t.grossAmount.toLocaleString('en-IN')}</td>
      <td>${t.paymentMethod}</td>
      <td><span class="status-badge ${t.paymentStatus.toLowerCase()}">${t.paymentStatus}</span></td>
      <td><button class="btn-pill btn-outline btn-sm" onclick="openInvoiceModal('${t.id}')">View Invoice</button></td>
    </tr>
  `).join('');
}

function handleSaveStartupProfile(e) {
  e.preventDefault();
  showToast('✓ Startup profile changes saved successfully!');
}

/* ==========================================================================
   INVESTOR DASHBOARD LOGIC & TABS
   ========================================================================== */
function switchInvestorTab(tabId) {
  document.querySelectorAll('#investorDashboard .dash-tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#investorDashboard .dash-nav-btn').forEach(b => b.classList.remove('active'));

  const pane = document.getElementById(`invTab_${tabId}`);
  if (pane) pane.classList.add('active');

  const btn = Array.from(document.querySelectorAll('#investorDashboard .dash-nav-btn')).find(b => b.textContent.toLowerCase().includes(tabId));
  if (btn) btn.classList.add('active');
}

function renderInvestorDashboard() {
  renderInvestorSavedList();
  renderInvestorDealflow();
  renderInvestorConnections();
  renderInvestorMeetings();
  renderChatMessages('investor');
}

function renderInvestorSavedList() {
  const store = window.fundwebStore;
  const savedIds = store.state.savedStartupIds;
  const savedList = store.state.startups.filter(s => savedIds.includes(s.id));
  const grid = document.getElementById('invSavedGrid');
  const badge = document.getElementById('invSavedBadge');
  const kpi = document.getElementById('kpiInvSaved');

  if (badge) badge.textContent = savedList.length;
  if (kpi) kpi.textContent = savedList.length;
  if (!grid) return;

  grid.innerHTML = savedList.map(s => `
    <div class="startup-card">
      <div class="sc-header">
        <img src="${s.logo}" class="sc-logo" alt="">
        <div>
          <div class="sc-name">${s.name}</div>
          <div class="sc-tags"><span class="tag-badge">${s.industry}</span></div>
        </div>
      </div>
      <p class="sc-tagline">${s.tagline}</p>
      <div class="sc-actions">
        <button class="btn-pill btn-primary btn-sm" onclick="openStartupModal('${s.id}')">View Deck</button>
        <button class="btn-pill btn-gold btn-sm" onclick="openMeetingModal('${s.id}')">Pitch Call</button>
      </div>
    </div>
  `).join('');
}

function renderInvestorDealflow() {
  const store = window.fundwebStore;
  const body = document.getElementById('investorDealflowBody');
  if (!body) return;

  body.innerHTML = store.state.startups.map((s, idx) => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.industry}</td>
      <td><span class="tag-badge stage">${s.stage}</span></td>
      <td style="font-family: var(--mono);">₹${(s.monthlyRevenue/100000).toFixed(1)}L/mo</td>
      <td style="font-family: var(--mono); font-weight: 700;">₹${(s.targetFunding/100000).toFixed(0)}L</td>
      <td><span class="status-badge verified">${98 - idx * 4}% Match</span></td>
      <td><button class="btn-pill btn-primary btn-sm" onclick="openStartupModal('${s.id}')">Review</button></td>
    </tr>
  `).join('');
}

function renderInvestorConnections() {
  const store = window.fundwebStore;
  const conns = store.state.connections;
  const body = document.getElementById('invConnectionsBody');
  if (!body) return;

  body.innerHTML = conns.map(c => `
    <tr>
      <td><strong>${c.startupName}</strong></td>
      <td>${c.founderName}</td>
      <td><span class="status-badge ${c.status}">${c.status}</span></td>
      <td>${new Date(c.createdAt).toLocaleDateString()}</td>
      <td><button class="btn-pill btn-primary btn-sm" onclick="switchInvestorTab('messages')">Message</button></td>
    </tr>
  `).join('');
}

function renderInvestorMeetings() {
  const store = window.fundwebStore;
  const meets = store.state.meetings;
  const body = document.getElementById('invMeetingsBody');
  if (!body) return;

  body.innerHTML = meets.map(m => `
    <tr>
      <td><strong>${m.startupName}</strong></td>
      <td>${m.founderName}</td>
      <td>${m.date} at ${m.time}</td>
      <td><span class="tag-badge">${m.type}</span></td>
      <td><a href="${m.meetLink}" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: underline;">🎥 Join Room</a></td>
      <td>
        <button class="btn-pill btn-outline btn-sm" onclick="downloadCalendarEvent('${m.type} with ${m.founderName}', '${m.date}', '${m.time}')">🗓️ Export .ics</button>
      </td>
    </tr>
  `).join('');
}

/* ==========================================================================
   ADMIN DASHBOARD & GOVERNANCE
   ========================================================================== */
function switchAdminTab(tabId) {
  document.querySelectorAll('#adminDashboard .dash-tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#adminDashboard .dash-nav-btn').forEach(b => b.classList.remove('active'));

  const pane = document.getElementById(`admTab_${tabId}`);
  if (pane) pane.classList.add('active');

  const btn = Array.from(document.querySelectorAll('#adminDashboard .dash-nav-btn')).find(b => b.textContent.toLowerCase().includes(tabId));
  if (btn) btn.classList.add('active');
}

function renderAdminDashboard() {
  renderAdminVerifications();
  renderAdminTables();
  renderAdminTransactions();
}

function renderAdminVerifications() {
  const store = window.fundwebStore;
  const reqs = store.state.verificationRequests;
  const quickBody = document.getElementById('adminQuickVerBody');
  const fullBody = document.getElementById('adminFullVerBody');
  const badge = document.getElementById('adminVerBadge');

  const pendingCount = reqs.filter(r => r.status === 'Pending').length;
  if (badge) badge.textContent = pendingCount;

  const html = reqs.map(r => `
    <tr>
      <td><strong>${r.entityName}</strong></td>
      <td><span class="tag-badge">${r.type}</span></td>
      <td>${r.founderName} (${r.email})</td>
      <td>${(r.docs || []).join(', ')}</td>
      <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn-pill btn-primary btn-sm" onclick="handleAdminVerify('${r.id}', 'Verified')">Approve</button>
          <button class="btn-pill btn-outline btn-sm" onclick="handleAdminVerify('${r.id}', 'Rejected')">Reject</button>
        </div>
      </td>
    </tr>
  `).join('');

  if (quickBody) quickBody.innerHTML = html;
  if (fullBody) fullBody.innerHTML = html;
}

function handleAdminVerify(reqId, newStatus) {
  window.fundwebStore.updateVerificationStatus(reqId, newStatus, `Processed by Compliance Admin`);
  showToast(`Verification status updated to ${newStatus}`);
}

function renderAdminTables() {
  const store = window.fundwebStore;
  const usersBody = document.getElementById('adminUsersBody');
  const startupsBody = document.getElementById('adminStartupsBody');

  if (usersBody) {
    usersBody.innerHTML = store.state.users.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td><span class="user-role-badge ${u.role}">${u.role}</span></td>
        <td><span class="status-badge ${u.verified ? 'verified' : 'pending'}">${u.verified ? 'Verified' : 'Pending'}</span></td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  if (startupsBody) {
    startupsBody.innerHTML = store.state.startups.map(s => `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.industry}</td>
        <td>${s.stage}</td>
        <td style="font-family: var(--mono);">₹${(s.targetFunding/100000).toFixed(0)}L</td>
        <td style="font-family: var(--mono); color: #059669;">₹${(s.committedFunding/100000).toFixed(0)}L</td>
        <td><span class="status-badge ${s.verified ? 'verified' : 'pending'}">${s.verificationStatus}</span></td>
      </tr>
    `).join('');
  }
}

function renderAdminTransactions() {
  const store = window.fundwebStore;
  const txs = store.state.transactions;
  const body = document.getElementById('adminTxBody');
  if (!body) return;

  body.innerHTML = txs.map(t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td>${t.userName}</td>
      <td>${t.serviceName}</td>
      <td style="font-family: var(--mono); font-weight: 700;">₹${t.grossAmount.toLocaleString('en-IN')}</td>
      <td style="font-family: var(--mono); color: #059669;">₹${t.fundwebFee}</td>
      <td style="font-family: var(--mono);">₹${t.taxGst}</td>
      <td><span class="status-badge ${t.paymentStatus.toLowerCase()}">${t.paymentStatus}</span></td>
      <td>
        ${t.paymentStatus === 'Paid' ? `
          <button class="btn-pill btn-outline btn-sm" onclick="handleAdminRefund('${t.id}')">Refund</button>
        ` : `<span style="font-size: 11px; color: #94a3b8;">Closed</span>`}
      </td>
    </tr>
  `).join('');
}

function handleAdminRefund(txId) {
  const res = window.fundwebStore.processRefund(txId);
  if (res.success) {
    showToast('Payment refunded back to user source rails.');
  } else {
    showToast(res.error);
  }
}

function handleSaveCommissionConfig(e) {
  e.preventDefault();
  const platformFee = parseFloat(document.getElementById('cfgPlatformFee').value) || 5.0;
  const serviceFee = parseFloat(document.getElementById('cfgServiceFee').value) || 500;
  const gstTax = parseFloat(document.getElementById('cfgGstTax').value) || 18.0;

  window.fundwebStore.updateCommissionConfig({
    platformFeePercent: platformFee,
    fixedServiceFee: serviceFee,
    gstTaxPercent: gstTax
  });

  showToast('✓ Platform fee configuration updated successfully!');
}

/* ==========================================================================
   REAL-TIME MESSAGING ENGINE & LIVE SIMULATED REPLIES
   ========================================================================== */
function renderChatMessages(role) {
  const store = window.fundwebStore;
  const msgs = store.getMessages();
  const fContainer = document.getElementById('founderChatMessages');
  const iContainer = document.getElementById('investorChatMessages');

  const container = (role === 'founder') ? fContainer : iContainer;
  if (!container) return;

  container.innerHTML = msgs.map(m => {
    const isSent = (role === 'founder' && m.senderRole === 'founder') || (role === 'investor' && m.senderRole === 'investor');
    return `
      <div class="chat-bubble ${isSent ? 'sent' : 'received'}">
        <div style="font-size: 11px; font-weight: 700; margin-bottom: 2px; opacity: 0.8;">${m.senderName}</div>
        <div>${m.text}</div>
        <div class="chat-bubble-time">${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function handleSendChatMessage(e, role) {
  e.preventDefault();
  const inputId = (role === 'founder') ? 'founderChatInput' : 'investorChatInput';
  const input = document.getElementById(inputId);
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = '';

  const user = window.fundwebStore.state.currentUser;
  const senderName = user ? user.name : (role === 'founder' ? 'Aarav Sharma (Founder)' : 'Priya Mehra (Investor)');

  window.fundwebStore.sendMessage({
    conversationId: 'conv_nova_priya',
    senderName,
    senderRole: role,
    text
  });

  // Real-world simulated intelligent auto-reply after 2.5s
  setTimeout(() => {
    const isSenderFounder = (role === 'founder');
    const autoReplyText = isSenderFounder
      ? "Thanks for the details Aarav! We are reviewing the updated pilot cohort metrics and term allocation. Looking forward to our scheduled pitch room call."
      : "Thank you Priya! Our cap table and data room access has been granted for your investment committee diligence.";
    
    window.fundwebStore.sendMessage({
      conversationId: 'conv_nova_priya',
      senderName: isSenderFounder ? 'Priya Mehra (Peak Horizons VC)' : 'Aarav Sharma (NovaAI Founder)',
      senderRole: isSenderFounder ? 'investor' : 'founder',
      text: autoReplyText
    });
  }, 2200);
}

/* ==========================================================================
   REAL-WORLD DOCUMENT VAULT & CALENDAR INTEGRATION
   ========================================================================== */
function downloadPitchDeckPDF(startupName = 'NovaAI') {
  showToast(`Generating ${startupName}_Pitch_Deck_v2.4.pdf...`);
  setTimeout(() => {
    const blob = new Blob([
      `FUNDWEB CONFIDENTIAL PITCH DECK\nCompany: ${startupName}\nStage: Seed Round (₹50,00,000 for 10% Equity)\nVerified by MCA & SEBI AIF Institutional Rails\n\n1. Problem Statement: Enterprise SaaS Fragmentation\n2. Solution: Autonomous Multi-agent Workflows\n3. Traction: ₹8.5L/mo MRR · 32% MoM Growth · 12,500 Users\n4. Founders: Aarav Sharma (Ex-Microsoft) & Rhea Sen (Ex-Stanford)\n\nGenerated via FundWeb Data Room.`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${startupName}_FundWeb_Pitch_Deck.txt`;
    a.click();
    showToast(`✓ ${startupName} Pitch Deck downloaded!`);
  }, 800);
}

function downloadCapTableCSV(startupName = 'NovaAI') {
  showToast(`Exporting ${startupName}_Cap_Table.csv...`);
  setTimeout(() => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Shareholder,Share Class,Equity Percentage,Invested Capital (INR),Status\n"
      + "Aarav Sharma (Founder),Common Equity,45.00%,₹0,Active Founder\n"
      + "Rhea Sen (Co-Founder),Common Equity,35.00%,₹0,Active Founder\n"
      + "ESOP Pool,Options Pool,10.00%,₹0,Reserved\n"
      + "Current Seed Round,CCPS Series Seed,10.00%,₹5000000,Syndicated\n";
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `${startupName}_Cap_Table.csv`;
    a.click();
    showToast(`✓ ${startupName} Cap Table CSV exported!`);
  }, 800);
}

function downloadCalendarEvent(title, date, time) {
  const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//FundWeb//Meeting//EN\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:FundWeb Pitch & Due Diligence Meeting\\nRoom: https://meet.fundweb.io/room/nova-pitch\nDTSTART:${date.replace(/-/g, '')}T${time.replace(/:/g, '')}00Z\nDURATION:PT30M\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FundWeb_${title.replace(/\s+/g, '_')}.ics`;
  a.click();
  showToast(`✓ Calendar event (.ics) downloaded!`);
}

/* ==========================================================================
   MODAL UTILITIES & TOASTS
   ========================================================================== */
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('active');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('active');
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const t = document.createElement('div');
  t.className = 'toast-msg';
  t.innerHTML = `<span>⚡</span> <span>${message}</span>`;
  container.appendChild(t);

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

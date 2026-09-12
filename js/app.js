/**
 * Cafe Menu Application Logic
 * Renders interactive menu, handles category filtering, search,
 * and prepares AR button hooks for future 3D model integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const menuContainer = document.getElementById('menu-container');
  const categoryNav = document.getElementById('category-nav');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const itemsCountEl = document.getElementById('items-count');
  const arToast = document.getElementById('ar-toast');
  const arToastMsg = document.getElementById('ar-toast-msg');

  let activeCategory = 'all';
  let searchQuery = '';
  let toastTimeout = null;

  // Initialize
  renderCategoryTabs();
  renderMenuItems();
  setupEventListeners();

  /**
   * Render Category Navigation Tabs
   */
  function renderCategoryTabs() {
    if (!categoryNav || !window.MENU_CATEGORIES) return;

    categoryNav.innerHTML = window.MENU_CATEGORIES.map(cat => {
      const count = cat.id === 'all' 
        ? window.MENU_ITEMS.length 
        : window.MENU_ITEMS.filter(item => item.categorySlug === cat.id).length;

      return `
        <button 
          class="category-tab ${cat.id === activeCategory ? 'active' : ''}" 
          data-category="${cat.id}"
          role="tab"
          aria-selected="${cat.id === activeCategory}"
          id="tab-${cat.id}"
        >
          <span class="category-icon" aria-hidden="true">${cat.icon}</span>
          <span class="category-label">${cat.label}</span>
          <span class="category-count">${count}</span>
        </button>
      `;
    }).join('');
  }

  /**
   * Filter and Render Menu Cards
   */
  function renderMenuItems() {
    if (!menuContainer || !window.MENU_ITEMS) return;

    // Filter items based on active category and search query
    const filteredItems = window.MENU_ITEMS.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.categorySlug === activeCategory;
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery);

      return matchesCategory && matchesSearch;
    });

    // Update count indicator
    if (itemsCountEl) {
      itemsCountEl.textContent = `Showing ${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}`;
    }

    // Empty state
    if (filteredItems.length === 0) {
      menuContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">☕</div>
          <h3>No coffee found</h3>
          <p>We couldn't find any drinks matching "${escapeHtml(searchQuery)}".</p>
          <button class="reset-search-btn" id="reset-search-btn">View All Drinks</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-search-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchQuery = '';
          activeCategory = 'all';
          updateActiveTab();
          renderMenuItems();
        });
      }
      return;
    }

    // Group by category if "All" is active, or render current category
    let html = '';
    
    if (activeCategory === 'all' && searchQuery === '') {
      const groups = [
        { id: 'hot-coffee', title: 'HOT COFFEE', quote: 'Drink It. Do Stupid Things Faster With More Energy' },
        { id: 'cold-coffee', title: 'COLD COFFEE', quote: "That's How I Like It! Freeze Cold" },
        { id: 'frapelicious', title: 'FRAPELICIOUS', quote: 'Ice Blended Perfection' },
        { id: 'add-ons', title: 'ADD-ONS', quote: 'Pair with your favorite beverage' }
      ];

      groups.forEach(group => {
        const groupItems = filteredItems.filter(i => i.categorySlug === group.id);
        if (groupItems.length > 0) {
          html += `
            <div class="menu-section" id="section-${group.id}">
              <div class="section-header">
                <div class="section-title-wrap">
                  <h2 class="section-title">${group.title}</h2>
                  <span class="section-badge">${groupItems.length} drinks</span>
                </div>
                <div class="coffee-quote-pill">
                  <span class="quote-ring"></span>
                  <p class="quote-text">"${group.quote}"</p>
                </div>
              </div>
              <div class="drinks-grid">
                ${groupItems.map(item => createCardHTML(item)).join('')}
              </div>
            </div>
          `;
        }
      });
    } else {
      html = `
        <div class="drinks-grid">
          ${filteredItems.map(item => createCardHTML(item)).join('')}
        </div>
      `;
    }

    menuContainer.innerHTML = html;
    initARButtons();
  }

  /**
   * Build HTML for an individual Drink Card
   */
  function createCardHTML(item) {
    const badgeHTML = item.badge 
      ? `<span class="item-badge ${item.isNonCoffee ? 'badge-non-coffee' : ''}">${escapeHtml(item.badge)}</span>` 
      : '';

    return `
      <article 
        class="drink-card" 
        data-id="${item.id}" 
        data-category="${item.categorySlug}"
        data-model="${item.model}"
      >
        <div class="card-media">
          <img 
            src="${item.image}" 
            alt="${escapeHtml(item.name)}" 
            class="drink-image"
            loading="lazy"
            onerror="this.onerror=null; this.src='images/cappuccino.webp';"
          />
          <div class="card-media-overlay"></div>
          ${badgeHTML}
          <div class="price-tag">
            <span class="currency">₹</span>
            <span class="amount">${item.price}</span>
          </div>
        </div>

        <div class="card-content">
          <div class="card-header-row">
            <h3 class="drink-name">${escapeHtml(item.name)}</h3>
          </div>

          ${item.description ? `<p class="drink-description">${escapeHtml(item.description)}</p>` : ''}

          <div class="card-footer">
            <button 
              type="button" 
              class="ar-button" 
              data-model="${item.model}" 
              data-name="${escapeHtml(item.name)}"
              aria-label="View ${escapeHtml(item.name)} in AR (Coming Soon)"
              title="3D Model: ${item.model}"
            >
              <svg class="ar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <span class="ar-button-text">View in AR</span>
              <span class="ar-status-dot" title="Ready for 3D GLB"></span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Category Tabs click
    if (categoryNav) {
      categoryNav.addEventListener('click', (e) => {
        const tab = e.target.closest('.category-tab');
        if (!tab) return;
        activeCategory = tab.dataset.category;
        updateActiveTab();
        renderMenuItems();
      });
    }

    // Search Input with debounce
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (clearSearchBtn) {
          clearSearchBtn.classList.toggle('visible', searchQuery.length > 0);
        }
        renderMenuItems();
      });
    }

    // Clear Search Button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchQuery = '';
        clearSearchBtn.classList.remove('visible');
        renderMenuItems();
      });
    }

    // Modal Close Controls
    const closeBtn = document.getElementById('ar-modal-close');
    const backdrop = document.getElementById('ar-modal-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', closeARModal);
    if (backdrop) backdrop.addEventListener('click', closeARModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeARModal();
    });

    // Setup Model Viewer load and error event listeners
    setupARViewerListeners();
  }

  /**
   * Update Active Category Tab State
   */
  function updateActiveTab() {
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
      const isActive = tab.dataset.category === activeCategory;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /**
   * Initialize AR Buttons
   * First phase: AR preview modal is enabled for Cappuccino item.
   * Other items retain status toast until 3D models are connected in future phase.
   */
  function initARButtons() {
    const arButtons = document.querySelectorAll('.ar-button');
    arButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.drink-card');
        const itemId = card ? card.dataset.id : null;
        
        if (itemId === 'cappuccino') {
          window.openAR('cappuccino');
        } else {
          const modelPath = btn.dataset.model;
          const itemName = btn.dataset.name;
          showARToast(itemName, modelPath);
        }
      });
    });
  }

  /**
   * Setup Model Viewer Listeners (Load success, 404 Error fallback, AR status)
   */
  /**
   * Setup Model Viewer Listeners (Load success, 404 Error fallback, AR status, console logs)
   */
  function setupARViewerListeners() {
    const modelViewer = document.getElementById('ar-model-viewer');
    const errorState = document.getElementById('ar-error-state');
    const errorTitle = document.getElementById('ar-error-title');
    const arPlaceBtn = document.getElementById('ar-place-btn');
    const statusText = document.getElementById('ar-status-text');
    const deviceStatusBox = document.getElementById('ar-device-status');

    if (!modelViewer) return;

    // Ensure AR button is initially hidden until model loads successfully (Req 10)
    if (arPlaceBtn) {
      arPlaceBtn.classList.add('hidden');
      arPlaceBtn.style.display = 'none';
    }

    // Handle model loading error (Req 9 & Req 11)
    modelViewer.addEventListener('error', (event) => {
      console.error('model loading error', event);
      if (errorTitle) {
        errorTitle.textContent = '3D model failed to load.';
      }
      if (errorState) {
        errorState.classList.remove('hidden');
      }
      modelViewer.style.display = 'none';
      
      // Do not allow AR button to appear on failure (Req 10)
      if (arPlaceBtn) {
        arPlaceBtn.classList.add('hidden');
        arPlaceBtn.style.display = 'none';
      }
    });

    // Handle model load success (Req 9 & Req 10)
    modelViewer.addEventListener('load', (event) => {
      console.log('model loaded successfully', event);
      if (errorState) {
        errorState.classList.add('hidden');
      }
      modelViewer.style.display = 'block';

      // Show AR button ONLY after model has loaded successfully (Req 10)
      if (arPlaceBtn) {
        arPlaceBtn.classList.remove('hidden');
        arPlaceBtn.style.display = 'inline-flex';
      }
    });

    // Listen for AR status changes (Req 9)
    modelViewer.addEventListener('ar-status', (event) => {
      const status = event.detail ? event.detail.status : null;
      console.log('AR status', status);

      if (status === 'session-started') {
        console.log('AR session start');
      } else if (status === 'failed') {
        console.error('AR session error', event);
        if (statusText) statusText.textContent = 'AR is not supported on this device.';
        if (deviceStatusBox) deviceStatusBox.className = 'ar-device-status unsupported';
      }
    });

    // Directly trigger device AR camera session when "Place on Table" is tapped
    if (arPlaceBtn) {
      arPlaceBtn.addEventListener('click', (e) => {
        if (modelViewer) {
          if (modelViewer.canActivateAR) {
            console.log('AR session start - Launching AR camera');
            try {
              modelViewer.activateAR();
            } catch (err) {
              console.error('AR session error', err);
            }
          } else {
            console.error('AR session error', { reason: 'AR not supported on this device' });
            if (statusText) statusText.textContent = 'AR is not supported on this browser/desktop. Open on a mobile device!';
            if (deviceStatusBox) deviceStatusBox.className = 'ar-device-status unsupported';
          }
        }
      });
    }
  }

  /**
   * Close AR Modal Dialog
   */
  function closeARModal() {
    const modalOverlay = document.getElementById('ar-modal-overlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  /**
   * Display toast notification indicating AR preparation status for non-connected drinks
   */
  function showARToast(name, model) {
    if (!arToast || !arToastMsg) return;

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    arToastMsg.innerHTML = `
      <strong>${escapeHtml(name)}</strong><br>
      <span class="toast-sub">Prepared for 3D AR Model: <code>${escapeHtml(model)}</code></span>
    `;

    arToast.classList.add('visible');

    toastTimeout = setTimeout(() => {
      arToast.classList.remove('visible');
    }, 3800);
  }

  /**
   * Utility to escape HTML and prevent XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Global Reusable AR Opener Component
   * Supports: openAR("cappuccino"), openAR("models/cappuccino.glb"), openAR(itemObject)
   */
  window.openAR = function(drinkParam) {
    let item = null;
    if (typeof drinkParam === 'object' && drinkParam !== null) {
      item = drinkParam;
    } else if (typeof drinkParam === 'string') {
      const paramClean = drinkParam.trim().toLowerCase();
      item = window.MENU_ITEMS ? window.MENU_ITEMS.find(i => 
        i.id.toLowerCase() === paramClean || 
        i.model.toLowerCase().endsWith(paramClean) ||
        i.name.toLowerCase() === paramClean
      ) : null;

      if (!item) {
        const displayName = drinkParam
          .split('/')
          .pop()
          .replace(/\.(glb|gltf)$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        item = {
          name: displayName || 'Coffee Drink',
          price: 108,
          model: drinkParam.includes('/') ? drinkParam : `models/${drinkParam}`
        };
      }
    }

    if (!item) return;

    const modalOverlay = document.getElementById('ar-modal-overlay');
    const titleEl = document.getElementById('ar-modal-title');
    const priceEl = document.getElementById('ar-modal-price');
    const modelViewer = document.getElementById('ar-model-viewer');
    const errorState = document.getElementById('ar-error-state');
    const statusText = document.getElementById('ar-status-text');
    const deviceStatusBox = document.getElementById('ar-device-status');

    if (!modalOverlay || !modelViewer) return;

    // Populate modal title and price
    if (titleEl) titleEl.textContent = item.name;
    if (priceEl) priceEl.textContent = `₹${item.price}`;

    // Reset error state, AR place button, and viewer visibility before loading new src
    if (errorState) errorState.classList.add('hidden');
    const arPlaceBtn = document.getElementById('ar-place-btn');
    if (arPlaceBtn) {
      arPlaceBtn.classList.add('hidden');
      arPlaceBtn.style.display = 'none';
    }
    modelViewer.style.display = 'block';

    const modelSrc = item.model.startsWith('/') ? item.model.slice(1) : item.model;
    modelViewer.setAttribute('src', modelSrc);
    modelViewer.setAttribute('alt', `${item.name} 3D Model`);

    // Activate Modal Overlay
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Update AR Support Indicator
    if (statusText && deviceStatusBox) {
      if (modelViewer.canActivateAR) {
        statusText.textContent = 'AR Ready — Tap "Place on Table"';
        deviceStatusBox.className = 'ar-device-status supported';
      } else {
        statusText.textContent = 'AR is not supported on this device.';
        deviceStatusBox.className = 'ar-device-status unsupported';
      }
    }
  };
});


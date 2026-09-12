/**
 * Cafe Menu Application Logic
 * Renders interactive menu, handles category filtering, search,
 * live camera stream AR background, device orientation tracking, and 3D model interaction.
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

  let activeVideoStream = null;
  let isCameraActive = false;

  // Phone Gyroscope / Orientation Tracking State
  let isTableAnchored = false;
  let initialAlpha = null;
  let initialBeta = null;
  let baseOrbitYaw = 0;
  let baseOrbitPitch = 75;
  let baseOrbitRadius = 105;

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

    const filteredItems = window.MENU_ITEMS.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.categorySlug === activeCategory;
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery);

      return matchesCategory && matchesSearch;
    });

    if (itemsCountEl) {
      itemsCountEl.textContent = `Showing ${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}`;
    }

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
              aria-label="View ${escapeHtml(item.name)} in AR"
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
   * Start Live Mobile Rear Camera Feed Stream for AR
   */
  async function startCameraStream() {
    const videoEl = document.getElementById('ar-camera-video');
    const cameraBadge = document.getElementById('ar-camera-badge');
    const cameraBadgeText = document.getElementById('ar-camera-badge-text');
    const camToggleText = document.getElementById('cam-toggle-text');
    const modelViewer = document.getElementById('ar-model-viewer');

    if (!videoEl) return false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Camera API not available in current environment');
      if (cameraBadgeText) cameraBadgeText.textContent = '☕ 3D Studio Mode';
      if (camToggleText) camToggleText.textContent = '3D Mode';
      return false;
    }

    try {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      } catch (e1) {
        console.log('Environment camera constraint fallback to video:true', e1);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      activeVideoStream = stream;
      videoEl.srcObject = stream;
      await videoEl.play();

      videoEl.classList.add('active');
      isCameraActive = true;

      if (cameraBadge) cameraBadge.classList.add('active');
      if (cameraBadgeText) cameraBadgeText.textContent = '📷 Live Camera AR';
      if (camToggleText) camToggleText.textContent = 'Cam Active';

      if (modelViewer) {
        modelViewer.classList.add('camera-active');
      }
      return true;
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      stopCameraStream();
      if (cameraBadge) cameraBadge.classList.remove('active');
      if (cameraBadgeText) cameraBadgeText.textContent = '☕ 3D Studio Mode';
      if (camToggleText) camToggleText.textContent = 'Enable Cam';
      return false;
    }
  }

  /**
   * Stop Live Camera Feed Stream and release media tracks
   */
  function stopCameraStream() {
    const videoEl = document.getElementById('ar-camera-video');
    const cameraBadge = document.getElementById('ar-camera-badge');
    const modelViewer = document.getElementById('ar-model-viewer');

    if (activeVideoStream) {
      activeVideoStream.getTracks().forEach(track => track.stop());
      activeVideoStream = null;
    }

    if (videoEl) {
      videoEl.pause();
      videoEl.srcObject = null;
      videoEl.classList.remove('active');
    }

    isCameraActive = false;
    if (cameraBadge) cameraBadge.classList.remove('active');
    if (modelViewer) modelViewer.classList.remove('camera-active');
  }

  /**
   * Toggle camera stream manually
   */
  function toggleCameraStream() {
    if (isCameraActive) {
      stopCameraStream();
      const cameraBadgeText = document.getElementById('ar-camera-badge-text');
      const camToggleText = document.getElementById('cam-toggle-text');
      if (cameraBadgeText) cameraBadgeText.textContent = '☕ 3D Studio Mode';
      if (camToggleText) camToggleText.textContent = 'Enable Cam';
    } else {
      startCameraStream();
    }
  }

  /**
   * Request Device Orientation permission (iOS 13+ requirement) & attach gyro listener
   */
  async function enablePhoneOrientationTracking() {
    isTableAnchored = true;
    initialAlpha = null;
    initialBeta = null;

    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const response = await DeviceOrientationEvent.requestPermission();
          if (response === 'granted') {
            attachOrientationListener();
          } else {
            console.warn('Device orientation permission denied');
            attachOrientationListener();
          }
        } catch (e) {
          console.warn('Device orientation permission request error:', e);
          attachOrientationListener();
        }
      } else {
        attachOrientationListener();
      }
    }
  }

  function attachOrientationListener() {
    window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
  }

  function detachOrientationListener() {
    window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
    isTableAnchored = false;
    initialAlpha = null;
    initialBeta = null;

    const recenterBtn = document.getElementById('ar-recenter-btn');
    if (recenterBtn) {
      recenterBtn.classList.add('hidden');
    }
  }

  /**
   * Device Orientation Event Handler
   * Dynamically tracks phone movement to keep product anchored in world direction
   */
  function handleDeviceOrientation(event) {
    if (!isTableAnchored) return;

    const alpha = event.alpha; // 0 to 360 degrees heading
    const beta = event.beta;   // -180 to 180 degrees front-to-back tilt

    if (alpha === null || alpha === undefined) return;

    if (initialAlpha === null) {
      initialAlpha = alpha;
      initialBeta = beta;
      return;
    }

    // Calculate phone rotation deltas
    let deltaYaw = alpha - initialAlpha;
    if (deltaYaw > 180) deltaYaw -= 360;
    if (deltaYaw < -180) deltaYaw += 360;

    let deltaPitch = (beta - initialBeta);

    const modelViewer = document.getElementById('ar-model-viewer');
    if (!modelViewer) return;

    let targetYaw = baseOrbitYaw + deltaYaw;
    let targetPitch = baseOrbitPitch - deltaPitch;

    // Clamp pitch between 15° and 88°
    targetPitch = Math.max(15, Math.min(88, targetPitch));

    modelViewer.cameraOrbit = `${targetYaw.toFixed(1)}deg ${targetPitch.toFixed(1)}deg ${baseOrbitRadius}%`;
  }

  /**
   * Reset / Recenter Table Placement Anchor
   */
  function recenterTablePosition() {
    initialAlpha = null;
    initialBeta = null;
    baseOrbitYaw = 0;
    baseOrbitPitch = 75;
    const modelViewer = document.getElementById('ar-model-viewer');
    if (modelViewer) {
      modelViewer.cameraOrbit = `${baseOrbitYaw}deg ${baseOrbitPitch}deg ${baseOrbitRadius}%`;
    }
    showARToast('Position Re-centered', 'Product locked in front of camera 📍');
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    if (categoryNav) {
      categoryNav.addEventListener('click', (e) => {
        const tab = e.target.closest('.category-tab');
        if (!tab) return;
        activeCategory = tab.dataset.category;
        updateActiveTab();
        renderMenuItems();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (clearSearchBtn) {
          clearSearchBtn.classList.toggle('visible', searchQuery.length > 0);
        }
        renderMenuItems();
      });
    }

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

    const camToggleBtn = document.getElementById('ar-cam-toggle-btn');
    if (camToggleBtn) {
      camToggleBtn.addEventListener('click', toggleCameraStream);
    }

    const closeBtn = document.getElementById('ar-modal-close');
    const backdrop = document.getElementById('ar-modal-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', closeARModal);
    if (backdrop) backdrop.addEventListener('click', closeARModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeARModal();
    });

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
   * Initialize AR Buttons and Drink Card Clicks
   */
  function initARButtons() {
    const arButtons = document.querySelectorAll('.ar-button');
    const drinkCards = document.querySelectorAll('.drink-card');

    arButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = btn.closest('.drink-card');
        const itemId = card ? card.dataset.id : 'cappuccino';
        window.openAR(itemId);
      });
    });

    drinkCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.ar-button')) return;
        const itemId = card.dataset.id || 'cappuccino';
        window.openAR(itemId);
      });
    });
  }

  /**
   * Setup Model Viewer Listeners (Load success, fallback, AR status)
   */
  function setupARViewerListeners() {
    const modelViewer = document.getElementById('ar-model-viewer');
    const errorState = document.getElementById('ar-error-state');
    const errorTitle = document.getElementById('ar-error-title');
    const arPlaceBtn = document.getElementById('ar-place-btn');
    const recenterBtn = document.getElementById('ar-recenter-btn');
    const statusText = document.getElementById('ar-status-text');
    const deviceStatusBox = document.getElementById('ar-device-status');
    const titleEl = document.getElementById('ar-modal-title');

    if (!modelViewer) return;

    modelViewer.addEventListener('error', (event) => {
      console.warn('3D model load error, checking fallback', event);
      const currentSrc = modelViewer.getAttribute('src');
      if (currentSrc !== 'models/cappuccino.glb') {
        modelViewer.setAttribute('src', 'models/cappuccino.glb');
        modelViewer.setAttribute('ios-src', 'models/cappuccino.usdz');
        if (errorState) errorState.classList.add('hidden');
        modelViewer.style.display = 'block';
      } else {
        if (errorTitle) errorTitle.textContent = '3D model failed to load.';
        if (errorState) errorState.classList.remove('hidden');
        modelViewer.style.display = 'none';
      }
    });

    modelViewer.addEventListener('load', () => {
      if (errorState) errorState.classList.add('hidden');
      modelViewer.style.display = 'block';
      if (arPlaceBtn) {
        arPlaceBtn.classList.remove('hidden');
        arPlaceBtn.style.display = 'inline-flex';
      }
    });

    modelViewer.addEventListener('ar-status', (event) => {
      const status = event.detail ? event.detail.status : null;
      if (status === 'session-started') {
        console.log('Native WebXR AR session started');
        if (statusText) statusText.textContent = 'Native AR session active on mobile device';
      } else if (status === 'failed') {
        if (statusText) statusText.textContent = 'WebXR AR failed. Live Camera stream active in browser.';
        if (deviceStatusBox) deviceStatusBox.className = 'ar-device-status supported';
      }
    });

    if (arPlaceBtn) {
      arPlaceBtn.addEventListener('click', () => {
        startCameraStream();
        enablePhoneOrientationTracking();

        if (recenterBtn) {
          recenterBtn.classList.remove('hidden');
        }

        const reticle = document.getElementById('ar-placement-reticle');
        if (reticle) {
          reticle.classList.remove('hidden');
          setTimeout(() => reticle.classList.add('hidden'), 2500);
        }

        if (modelViewer) {
          modelViewer.removeAttribute('auto-rotate');
          modelViewer.setAttribute('camera-orbit', '0deg 75deg 105%');
          modelViewer.setAttribute('shadow-intensity', '2');
        }

        const itemName = titleEl ? titleEl.textContent : 'Coffee';
        showARToast(`${itemName} Placed on Table 📍`, 'Phone direction tracking active! Move phone to view. ☕');
      });
    }

    if (recenterBtn) {
      recenterBtn.addEventListener('click', recenterTablePosition);
    }
  }

  /**
   * Close AR Modal Dialog & stop camera stream
   */
  function closeARModal() {
    stopCameraStream();
    detachOrientationListener();
    const modalOverlay = document.getElementById('ar-modal-overlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  /**
   * Display toast notification
   */
  function showARToast(name, model) {
    if (!arToast || !arToastMsg) return;

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    arToastMsg.innerHTML = `
      <strong>${escapeHtml(name)}</strong><br>
      <span class="toast-sub">${escapeHtml(model)}</span>
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

    if (titleEl) titleEl.textContent = item.name;
    if (priceEl) priceEl.textContent = `₹${item.price}`;

    if (errorState) errorState.classList.add('hidden');
    modelViewer.setAttribute('auto-rotate', '');
    modelViewer.setAttribute('shadow-intensity', '1.2');
    modelViewer.style.display = 'block';

    const modelSrc = item.model.startsWith('/') ? item.model.slice(1) : item.model;
    const usdzSrc = modelSrc.replace(/\.(glb|gltf)$/i, '.usdz');
    modelViewer.setAttribute('src', modelSrc);
    modelViewer.setAttribute('ios-src', usdzSrc);
    modelViewer.setAttribute('alt', `${item.name} 3D Model`);

    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    startCameraStream();

    if (statusText && deviceStatusBox) {
      if (modelViewer.canActivateAR) {
        statusText.textContent = 'Native WebXR AR Ready — Tap "Place on Table"';
        deviceStatusBox.className = 'ar-device-status supported';
      } else {
        statusText.textContent = 'Camera AR Active — Tap "Place on Table"';
        deviceStatusBox.className = 'ar-device-status supported';
      }
    }
  };
});

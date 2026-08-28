/* ============================================
   Jacky's Library — script.js v9.0
   ============================================ */

const LIBRARY_VERSION = '9.0';

// --- 1. CONFIGURATION & ADMIN CHECK ---
const urlParams = new URLSearchParams(window.location.search);
const isOwner = urlParams.get('admin') === 'jacky';

// --- 2. THE DATA lives in officialGames inside index.html ---
let games = JSON.parse(JSON.stringify(officialGames));
// Keep a copy of the original order for "default" sorting
const originalGames = JSON.parse(JSON.stringify(officialGames));

let editIndex = null;
let ownerHasUnsavedEdits = false;
let currentFilter = 'all';
let currentSort = 'default';
let currentSearch = '';
let favorites = JSON.parse(localStorage.getItem('jacky_favorites') || '[]');

// ============================================================
// ADMIN PANEL SETUP (preserved intact)
// ============================================================
if (isOwner) {
    document.getElementById('adminBtn').classList.remove('hidden');
    const exportBtn = document.createElement('button');
    exportBtn.innerText = '💾 Export officialGames';
    exportBtn.className = 'btn-create btn-export';
    exportBtn.onclick = exportData;
    document.querySelector('.header-right').prepend(exportBtn);
}

// ============================================================
// GALAXY STARFIELD (with mouse parallax)
// ============================================================
function initGalaxyBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'galaxyCanvas';
    canvas.className = 'galaxy-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let stars = [];
    let animationId = null;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const STAR_COUNT = Math.min(200, Math.floor((window.innerWidth * window.innerHeight) / 7000));
    const LAYERS = [
        { speed: 0.12, size: 0.7, alpha: 0.3,  parallax: 0.008 },
        { speed: 0.3,  size: 1.1, alpha: 0.52, parallax: 0.018 },
        { speed: 0.55, size: 1.7, alpha: 0.82, parallax: 0.03  }
    ];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
    }

    function buildStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            const layer = LAYERS[i % LAYERS.length];
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                layer,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.002 + Math.random() * 0.004,
                baseX: Math.random() * width
            });
        }
    }

    function draw(time) {
        // Smooth mouse interpolation
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        ctx.clearRect(0, 0, width, height);
        for (const star of stars) {
            star.y += star.layer.speed;
            if (star.y > height) {
                star.y = 0;
                star.x = Math.random() * width;
                star.baseX = star.x;
            }

            // Mouse parallax offset
            const offsetX = (mouseX - width * 0.5) * star.layer.parallax;
            const offsetY = (mouseY - height * 0.5) * star.layer.parallax;
            const drawX = star.x + offsetX;
            const drawY = star.y + offsetY;

            const twinkle = 0.65 + 0.35 * Math.sin(time * star.twinkleSpeed + star.twinkle);
            const alpha = star.layer.alpha * twinkle;

            ctx.beginPath();
            ctx.arc(drawX, drawY, star.layer.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
            ctx.fill();

            if (star.layer.size > 1.4 && twinkle > 0.9) {
                ctx.beginPath();
                ctx.arc(drawX, drawY, star.layer.size * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.15})`;
                ctx.fill();
            }
        }
        animationId = requestAnimationFrame(draw);
    }

    function onVisibilityChange() {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
            animationId = null;
        } else if (!animationId) {
            animationId = requestAnimationFrame(draw);
        }
    }

    // Mouse move handler for parallax
    document.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });

    resize();
    animationId = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);
}

// ============================================================
// UTILITY: HTML ESCAPE
// ============================================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================================
// UTILITY: TOAST NOTIFICATIONS (replaces alert for copy events)
// ============================================================
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: 'fa-check-circle',
        error:   'fa-exclamation-circle',
        info:    'fa-rocket',
        warn:    'fa-wifi-slash'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info} toast-icon"></i><span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ============================================================
// STATUS BADGE DETECTOR
// ============================================================
function getStatusBadge(title) {
    const t = title.toLowerCase();
    let badges = '';

    // Online / multiplayer working
    if (t.includes('online works') || t.includes('onlinefixed') || t.includes('online fixed') && !t.includes('not online')) {
        badges += '<span class="badge badge-online">✓ Online</span>';
    }
    // Not fixed yet
    if (t.includes('not online fixed yet') || t.includes('not fixed yet') || t.includes('not online')) {
        badges += '<span class="badge badge-offline">⏳ Fix Pending</span>';
    }
    // Tool / utility
    if (t.includes('tool') || t.includes('fix') || t.includes('cmd') || t.includes('batch') ||
        t.includes('7z') || t.includes('steamcmd') || t.includes('steamtools') || t.includes('gwtool') ||
        t.includes('.dll') || t.includes('xbox batch') || t.includes('m centers')) {
        badges += '<span class="badge badge-tool">🔧 Tool</span>';
    }

    return badges ? `<div class="card-badges">${badges}</div>` : '';
}

// ============================================================
// CATEGORY FILTER LOGIC
// ============================================================
function getGameCategory(game) {
    if (game.category && game.category !== 'auto') {
        return game.category;
    }
    const t = (game.title || '').toLowerCase();
    // Tools & Fixes
    if (t.includes('fix') || t.includes('tool') || t.includes('steamcmd') || t.includes('steamtools') ||
        t.includes('gwtool') || t.includes('7z') || t.includes('.dll') || t.includes('batch') ||
        t.includes('m centers') || t.includes('online.fix')) {
        return 'tools';
    }
    // Multiplayer / Online
    if (t.includes('online works') || t.includes('onlinefixed') || t.includes('multiplayer') ||
        (t.includes('online fix') && !t.includes('not'))) {
        return 'online';
    }
    // Default: singleplayer
    return 'singleplayer';
}

function setFilter(filter) {
    currentFilter = filter;
    // Update active button
    document.querySelectorAll('.filter-tag').forEach(btn => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    applyFiltersAndRender();
}

// ============================================================
// SORTING
// ============================================================
function applySorting() {
    currentSort = document.getElementById('sortSelect').value;
    applyFiltersAndRender();
}

function getSortedGames(list) {
    const arr = [...list];
    if (currentSort === 'az') {
        return arr.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
    }
    if (currentSort === 'za') {
        return arr.sort((a, b) => b.title.toLowerCase().localeCompare(a.title.toLowerCase()));
    }
    if (currentSort === 'recent') {
        return [...arr].reverse();
    }
    return arr; // default
}

// ============================================================
// SEARCH (with highlighting)
// ============================================================
function searchGames() {
    currentSearch = document.getElementById('searchInput').value.trim();
    applyFiltersAndRender();
}

function highlightMatch(title, term) {
    if (!term) return escapeHtml(title);
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return escapeHtml(title).replace(regex, '<span class="search-hl">$1</span>');
}

// ============================================================
// CORE: APPLY FILTERS → RE-RENDER
// ============================================================
function applyFiltersAndRender() {
    const container = document.getElementById('linksContainer');
    container.innerHTML = '';

    if (isOwner && ownerHasUnsavedEdits) {
        const banner = document.createElement('div');
        banner.className = 'admin-banner';
        banner.innerHTML = '<i class="fas fa-info-circle"></i> Preview only — click <strong>Export officialGames</strong> and paste into <strong>index.html</strong> on GitHub so everyone sees your changes.';
        container.appendChild(banner);
    }

    // Step 1: Sort
    let filtered = getSortedGames(games);

    // Step 2: Favorites first
    const favSet = new Set(favorites);
    filtered.sort((a, b) => {
        const aFav = favSet.has(a.url) ? -1 : 0;
        const bFav = favSet.has(b.url) ? -1 : 0;
        return aFav - bFav;
    });

    // Step 3: Category filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(g => getGameCategory(g) === currentFilter);
    }

    // Step 4: Search filter
    const term = currentSearch.toLowerCase();
    if (term) {
        filtered = filtered.filter(g => g.title.toLowerCase().includes(term));
    }

    // Update count badge
    const countBadge = document.getElementById('filterCountBadge');
    if (countBadge) {
        countBadge.textContent = `Showing ${filtered.length} / ${games.length}`;
    }

    // Step 5: Render
    if (filtered.length === 0) {
        container.innerHTML += `
            <div class="library-empty">
                <i class="fas fa-rocket"></i>
                <p>No results found.${isOwner ? ' Use <strong>+ New Link</strong>, then Export.' : ''}</p>
            </div>`;
        updateSiteMeta();
        return;
    }

    filtered.forEach((game, displayIndex) => {
        // Find real index in games[] for admin operations
        const realIndex = games.indexOf(game);
        buildCard(container, game, realIndex, displayIndex);
    });

    updateSiteMeta();
}

// Keep legacy render() alias for admin operations
function render() {
    applyFiltersAndRender();
}

// ============================================================
// CARD BUILDER
// ============================================================
function buildCard(container, game, realIndex, displayIndex) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = realIndex;
    if (favorites.includes(game.url)) card.classList.add('is-fav');

    // Fallback placeholder SVG (branded)
    const fallbackImg = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"><rect width="400" height="220" fill="#0a0f1e"/><rect x="30" y="80" width="340" height="60" rx="8" fill="rgba(0,229,255,0.06)" stroke="rgba(0,229,255,0.2)" stroke-width="1"/><text x="200" y="108" font-family="Inter,sans-serif" font-size="14" font-weight="700" fill="rgba(0,229,255,0.7)" text-anchor="middle">JACKY\'S LIBRARY</text><text x="200" y="128" font-family="Inter,sans-serif" font-size="10" fill="rgba(139,156,184,0.6)" text-anchor="middle">No preview available</text></svg>')}`;

    const imgSrc = escapeHtml(game.img || '');
    const isFav = favorites.includes(game.url);
    const animDelay = Math.min(displayIndex * 0.05, 0.6);

    card.style.animationDelay = `${animDelay}s`;

    card.innerHTML = `
        <div class="card-thumb-wrap" onclick="openLightbox('${imgSrc || fallbackImg}')">
            ${getStatusBadge(game.title)}
            <button type="button" class="btn-fav ${isFav ? 'active' : ''}"
                onclick="event.stopPropagation(); toggleFavorite(${realIndex})"
                title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <div class="skeleton-shimmer" style="width:100%;height:110px;position:absolute;inset:0;z-index:1;"></div>
            <img class="card-img loading"
                src="${imgSrc || fallbackImg}"
                alt="${escapeHtml(game.title)}"
                loading="lazy"
                onerror="this.src='${fallbackImg}'"
                onload="this.classList.remove('loading'); this.previousElementSibling && this.previousElementSibling.remove();">
            <div class="thumb-zoom-hint" aria-hidden="true"><i class="fas fa-search-plus"></i></div>
        </div>
        <div class="card-body">
            <h3 class="card-title">${highlightMatch(game.title, currentSearch)}</h3>
            ${buildTutorialRow(game)}
            <div class="actions">${buildActions(game, realIndex)}</div>
        </div>
    `;
    container.appendChild(card);
}

// ============================================================
// TUTORIAL ROW (opens YT embed modal instead of new tab)
// ============================================================
function buildTutorialRow(game) {
    const yt = (game.yt || '').trim();
    if (!yt) {
        return `
            <div class="tutorial-row tutorial-row--empty" title="No preview available">
                <span class="tutorial-icon"><i class="fab fa-youtube"></i></span>
                <span class="tutorial-text">
                    <span class="tutorial-label">Tutorial / Preview</span>
                    <span class="tutorial-hint">Not available yet</span>
                </span>
            </div>`;
    }
    return `
        <div class="tutorial-row" role="button" tabindex="0" title="Watch tutorial" onclick="openYtModal('${escapeHtml(yt)}')" onkeydown="if(event.key==='Enter') openYtModal('${escapeHtml(yt)}')">
            <span class="tutorial-icon"><i class="fab fa-youtube"></i></span>
            <span class="tutorial-text">
                <span class="tutorial-label">Tutorial / Preview</span>
                <span class="tutorial-hint">Click to watch in-site</span>
            </span>
            <i class="fas fa-play tutorial-arrow"></i>
        </div>`;
}

// ============================================================
// ACTION BUTTONS (admin + public)
// ============================================================
function buildActions(game, index) {
    const reportUrl = `https://github.com/search?q=jacky+library+broken+link&type=issues`;
    if (isOwner) {
        return `
            <button type="button" class="btn-action btn-edit" onclick="openEditModal(${index})"><i class="fas fa-edit"></i> Edit</button>
            <button type="button" class="btn-action btn-delete" onclick="deleteGame(${index})"><i class="fas fa-trash"></i> Delete</button>
            <button type="button" class="btn-action btn-view" onclick="openGameByIndex(${index})"><i class="fas fa-download"></i> View</button>`;
    }
    return `
        <button type="button" class="btn-action btn-copy" onclick="copyLinkByIndex(${index})"><i class="fas fa-copy"></i> Copy</button>
        <button type="button" class="btn-action btn-view" onclick="openGameByIndex(${index})"><i class="fas fa-external-link-alt"></i> Download</button>
        <button type="button" class="btn-action btn-report" onclick="reportBroken(${index})" title="Report broken link"><i class="fas fa-flag"></i></button>`;
}

// ============================================================
// FAVORITES SYSTEM
// ============================================================
function toggleFavorite(index) {
    const game = games[index];
    if (!game) return;

    const url = game.url;
    const pos = favorites.indexOf(url);
    if (pos === -1) {
        favorites.push(url);
        showToast('❤️ Added to favorites!', 'success');
    } else {
        favorites.splice(pos, 1);
        showToast('💔 Removed from favorites', 'info');
    }
    localStorage.setItem('jacky_favorites', JSON.stringify(favorites));
    applyFiltersAndRender();
}

// ============================================================
// YOUTUBE EMBED MODAL
// ============================================================
function getYtEmbedUrl(url) {
    if (!url) return '';
    // Handle youtu.be short links
    let match = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    // Handle standard watch links
    match = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    // Handle /embed/ links
    match = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    return url;
}

function openYtModal(url) {
    const modal = document.getElementById('ytModal');
    const iframe = document.getElementById('ytIframe');
    if (!modal || !iframe) return;

    const embedUrl = getYtEmbedUrl(url);
    iframe.src = embedUrl;
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closeYtModal() {
    const modal = document.getElementById('ytModal');
    const iframe = document.getElementById('ytIframe');
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(() => {
        if (!modal.classList.contains('open')) {
            modal.style.display = 'none';
            if (iframe) iframe.src = ''; // Stop video
        }
    }, 320);
}

// ============================================================
// IMAGE LIGHTBOX
// ============================================================
function openLightbox(src) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    if (!modal || !img || !src) return;
    img.src = src;
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(() => {
        if (!modal.classList.contains('open')) modal.style.display = 'none';
    }, 320);
}

// ============================================================
// REPORT BROKEN LINK
// ============================================================
function reportBroken(index) {
    const game = games[index];
    if (!game) return;
    const issueTitle = encodeURIComponent(`Broken Link: ${game.title}`);
    const issueBody = encodeURIComponent(`The download link for **${game.title}** appears to be broken.\n\nURL: ${game.url}\n\n_Reported via Jacky's Library_`);
    window.open(`https://github.com/issues/new?title=${issueTitle}&body=${issueBody}`, '_blank', 'noopener');
}

// ============================================================
// CHANGELOG MODAL
// ============================================================
function openChangelog() {
    const modal = document.getElementById('changelogModal');
    if (!modal) return;
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closeChangelog() {
    const modal = document.getElementById('changelogModal');
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(() => {
        if (!modal.classList.contains('open')) modal.style.display = 'none';
    }, 320);
}

// ============================================================
// TOS MODAL
// ============================================================
function initTosModal() {
    if (localStorage.getItem('jacky_tos_accepted')) {
        // Already accepted — stay hidden
        return;
    }
    const overlay = document.getElementById('tosModal');
    if (!overlay) return;
    // Remove hidden state, then fade in
    overlay.classList.remove('hidden-tos');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('visible'));
    });
    // Block body scroll while TOS is shown
    document.body.style.overflow = 'hidden';
}

function hideTos() {
    const overlay = document.getElementById('tosModal');
    if (!overlay) return;
    overlay.classList.remove('visible');
    setTimeout(() => {
        overlay.classList.add('hidden-tos');
        document.body.style.overflow = '';
    }, 400);
}

function acceptTos() {
    localStorage.setItem('jacky_tos_accepted', '1');
    hideTos();
    showToast('Welcome to Jacky\'s Library! 🔥', 'success', 4000);
}

function declineTos() {
    const meme = document.getElementById('memeOverlay');
    if (meme) {
        meme.classList.add('active');
    }
    // Redirect after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'https://www.wikihow.com/Teach-Yourself-to-Read';
    }, 1500);
}

// ============================================================
// OLED MODE TOGGLE
// ============================================================
function initOledToggle() {
    if (localStorage.getItem('jacky_oled') === '1') {
        document.body.classList.add('oled-mode');
    }
}

function toggleOled() {
    document.body.classList.toggle('oled-mode');
    const isOled = document.body.classList.contains('oled-mode');
    localStorage.setItem('jacky_oled', isOled ? '1' : '0');
    showToast(isOled ? '⚫ OLED Black Mode ON' : '🌌 Space Mode ON', 'info');
}

// ============================================================
// BACK TO TOP
// ============================================================
function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.remove('hidden-off');
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
            btn.classList.add('hidden-off');
        }
    }, { passive: true });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// STICKY HEADER SCROLL SHADOW
// ============================================================
function initHeaderScrollShadow() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
}

// ============================================================
// COMMENT DRAWER
// ============================================================
function toggleCommentDrawer() {
    const drawer = document.getElementById('commentDrawer');
    if (!drawer) return;
    const isOpen = drawer.classList.toggle('open');
    drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
}

// ============================================================
// OFFLINE / NETWORK ALERT
// ============================================================
function initOfflineAlert() {
    window.addEventListener('offline', () => {
        showToast('📡 You\'re offline! Some content may not load.', 'warn', 5000);
    });
    window.addEventListener('online', () => {
        showToast('✅ Back online!', 'success', 3000);
    });
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const tag = document.activeElement.tagName;
        const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

        // / → focus search
        if (e.key === '/' && !isInput) {
            e.preventDefault();
            const search = document.getElementById('searchInput');
            if (search) {
                search.focus();
                search.select();
            }
            return;
        }

        // ESC → close any open modal
        if (e.key === 'Escape') {
            closeYtModal();
            closeLightbox();
            closeChangelog();
            toggleModal(false);
            const drawer = document.getElementById('commentDrawer');
            if (drawer && drawer.classList.contains('open')) {
                toggleCommentDrawer();
            }
        }
    });
}

// ============================================================
// COPY LINK (with toast instead of alert)
// ============================================================
function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('🚀 Link Copied!', 'success');
    }).catch(() => {
        showToast('❌ Copy failed — try manually', 'error');
    });
}

function copyLinkByIndex(index) {
    if (games[index]) copyLink(games[index].url);
}

// ============================================================
// OPEN GAME
// ============================================================
function openGameByIndex(index) {
    if (games[index] && games[index].url) window.open(games[index].url, '_blank', 'noopener');
}

// ============================================================
// ADMIN: EDIT MODAL
// ============================================================
function openEditModal(index = null) {
    editIndex = index;
    const modalTitle = document.getElementById('modalTitle');
    const publishBtn = document.getElementById('publishBtn');
    const catSelect = document.getElementById('newCategory');

    if (index !== null) {
        const game = games[index];
        document.getElementById('newTitle').value = game.title;
        document.getElementById('newFileUrl').value = game.url;
        document.getElementById('newYtUrl').value = game.yt || '';
        document.getElementById('newImgUrl').value = game.img || '';
        if (catSelect) catSelect.value = game.category || 'auto';
        modalTitle.innerText = 'Edit Game Info';
        publishBtn.innerText = 'Save Changes';
    } else {
        document.getElementById('newTitle').value = '';
        document.getElementById('newFileUrl').value = '';
        document.getElementById('newYtUrl').value = '';
        document.getElementById('newImgUrl').value = '';
        if (catSelect) catSelect.value = 'auto';
        modalTitle.innerText = 'Publish New Game';
        publishBtn.innerText = 'Publish';
    }
    toggleModal(true);
}

// ============================================================
// ADMIN: PUBLISH / SAVE GAME
// ============================================================
function publishGame() {
    const title = document.getElementById('newTitle').value;
    const url = document.getElementById('newFileUrl').value;
    const yt = document.getElementById('newYtUrl').value;
    const img = document.getElementById('newImgUrl').value.trim();
    const catSelect = document.getElementById('newCategory');
    const category = catSelect ? catSelect.value : 'auto';

    if (!title || !url) {
        showToast('⚠️ Name and Link are required!', 'warn');
        return;
    }

    const gameData = { title, url, yt, img };
    if (category !== 'auto') {
        gameData.category = category;
    }

    if (editIndex !== null) { games[editIndex] = gameData; }
    else { games.push(gameData); }

    ownerHasUnsavedEdits = true;
    applyFiltersAndRender();
    toggleModal(false);

    if (isOwner) {
        showToast('✅ Saved (preview only) — Export to push live!', 'success', 5000);
    }
}

// ============================================================
// ADMIN: DELETE GAME
// ============================================================
function deleteGame(index) {
    if (confirm('Delete this game?')) {
        games.splice(index, 1);
        ownerHasUnsavedEdits = true;
        applyFiltersAndRender();
    }
}

// ============================================================
// ADMIN: EXPORT DATA (formatted for index.html)
// ============================================================
function formatOfficialGamesExport(gameList) {
    const lines = ['        const officialGames = ['];
    gameList.forEach((game, i) => {
        lines.push('            {');
        lines.push(`                "title": ${JSON.stringify(game.title)},`);
        lines.push(`                "url": ${JSON.stringify(game.url)},`);
        lines.push(`                "yt": ${JSON.stringify(game.yt || '')},`);
        lines.push(`                "img": ${JSON.stringify(game.img || '')}` + (game.category && game.category !== 'auto' ? ',' : ''));
        if (game.category && game.category !== 'auto') {
            lines.push(`                "category": ${JSON.stringify(game.category)}`);
        }
        lines.push('            }' + (i < gameList.length - 1 ? ',' : ''));
    });
    lines.push('        ];');
    return lines.join('\n');
}

function exportData() {
    const exportText = formatOfficialGamesExport(games);
    navigator.clipboard.writeText(exportText).then(() => {
        showToast('📋 Copied! Paste into index.html on GitHub.', 'success', 6000);
        alert(
            'COPIED — ready to paste into index.html on GitHub!\n\n' +
            '1. GitHub → your repo → index.html → Edit\n' +
            '2. Select from const officialGames = [ down to ]; (the whole block)\n' +
            '3. Delete → Paste (Ctrl+V)\n' +
            '4. Commit / Save\n' +
            '5. Wait 30 sec → refresh site with Ctrl+Shift+R\n\n' +
            'Spacing is included — paste exactly as copied.'
        );
    });
}

// ============================================================
// MODAL TOGGLE (generic, used by admin edit modal)
// ============================================================
function toggleModal(show) {
    const modal = document.getElementById('linkModal');
    if (show) {
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('open'));
    } else {
        modal.classList.remove('open');
        setTimeout(() => {
            if (!modal.classList.contains('open')) modal.style.display = 'none';
        }, 280);
    }
}

// ============================================================
// SITE META / FOOTER (clean format)
// ============================================================
function updateSiteMeta() {
    let footer = document.getElementById('siteMeta');
    if (!footer) {
        footer = document.createElement('footer');
        footer.id = 'siteMeta';
        footer.className = 'site-meta';
        document.body.appendChild(footer);
    }
    const unsaved = isOwner && ownerHasUnsavedEdits ? ' · ⚠ unsaved preview' : '';
    footer.textContent = `${games.length} Games Loaded · v${LIBRARY_VERSION} · Jacky's Library${unsaved}`;

    // Update stat counter in header
    const statNum = document.getElementById('statGamesNum');
    if (statNum) statNum.textContent = games.length;
}

// ============================================================
// CLOSE MODALS ON BACKDROP CLICK
// ============================================================
function initModalBackdropClose() {
    document.getElementById('ytModal').addEventListener('click', function(e) {
        if (e.target === this) closeYtModal();
    });
    document.getElementById('changelogModal').addEventListener('click', function(e) {
        if (e.target === this) closeChangelog();
    });
    document.getElementById('linkModal').addEventListener('click', function(e) {
        if (e.target === this) toggleModal(false);
    });
}

// ============================================================
// INIT
// ============================================================
function init() {
    initTosModal();
    initOledToggle();
    initGalaxyBackground();
    applyFiltersAndRender();
    initBackToTop();
    initHeaderScrollShadow();
    initOfflineAlert();
    initKeyboardShortcuts();
    initModalBackdropClose();
}

init();

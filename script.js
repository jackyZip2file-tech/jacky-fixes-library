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
// ADVANCED NATIVE COMMENT SYSTEM & MODERATION ENGINE
// ============================================================

let currentCommentUser = {
    username: 'Guest_' + Math.floor(1000 + Math.random() * 9000),
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + Math.random(),
    isOwner: false
};

let currentCommentSort = 'top';
let replyingToId = null;
let activeBanTarget = null;

// Persistent Storage Keys
const STORAGE_COMMENTS = 'jacky_comments_v2';
const STORAGE_USER = 'jacky_comment_user_v2';
const STORAGE_VOTES = 'jacky_comment_votes_v2';
const STORAGE_BANS = 'jacky_bans_v2';

// 1. IDENTITY & OWNER DETECTION
function initCommentIdentity() {
    const saved = localStorage.getItem(STORAGE_USER);
    if (saved) {
        try { currentCommentUser = JSON.parse(saved); } catch (e) {}
    }

    // Auto-detect GitHub Owner mode if admin URL param OR username is jackyZip2file-tech
    if (isOwner || currentCommentUser.username.toLowerCase() === 'jackyzip2file-tech') {
        currentCommentUser.username = 'jackyZip2file-tech';
        currentCommentUser.isOwner = true;
        currentCommentUser.avatar = 'https://github.com/jackyZip2file-tech.png';
    }

    renderIdentityBar();
}

function renderIdentityBar() {
    const bar = document.getElementById('commentIdentityBar');
    const tabBanBtn = document.getElementById('tabBanManagerBtn');
    if (!bar) return;

    const ownerBadge = currentCommentUser.isOwner ? '<span class="badge-owner"><i class="fas fa-crown"></i> OWNER</span>' : '';
    bar.innerHTML = `
        <div class="identity-user-info">
            <img class="identity-avatar" src="${escapeHtml(currentCommentUser.avatar)}" alt="${escapeHtml(currentCommentUser.username)}" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=user'">
            <span class="identity-username">${escapeHtml(currentCommentUser.username)}</span>
            ${ownerBadge}
        </div>
        <button class="btn-identity-edit" onclick="changeCommentIdentity()"><i class="fas fa-user-edit"></i> Change Name</button>
    `;

    if (tabBanBtn) {
        tabBanBtn.classList.toggle('hidden', !currentCommentUser.isOwner);
    }
}

function changeCommentIdentity() {
    const name = prompt('Enter your display name / GitHub username:', currentCommentUser.username);
    if (!name || !name.trim()) return;

    const cleanName = name.trim();
    const isOwnerAccount = cleanName.toLowerCase() === 'jackyzip2file-tech' || isOwner;

    currentCommentUser = {
        username: isOwnerAccount ? 'jackyZip2file-tech' : cleanName,
        avatar: isOwnerAccount ? 'https://github.com/jackyZip2file-tech.png' : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
        isOwner: isOwnerAccount
    };

    localStorage.setItem(STORAGE_USER, JSON.stringify(currentCommentUser));
    renderIdentityBar();
    applyCommentPermissions();
    renderCommentsFeed();
    showToast(isOwnerAccount ? '👑 Welcome back, Owner!' : `Logged in as ${cleanName}`, 'success');
}

// 2. BAN ENGINE (Temporary & Permanent Bans)
function getBans() {
    try { return JSON.parse(localStorage.getItem(STORAGE_BANS) || '{}'); }
    catch (e) { return {}; }
}

function saveBans(bans) {
    localStorage.setItem(STORAGE_BANS, JSON.stringify(bans));
}

function checkBanStatus(username) {
    if (!username) return { isBanned: false };
    const bans = getBans();
    const ban = bans[username.toLowerCase()];
    if (!ban) return { isBanned: false };

    if (ban.expiry === 'permanent') {
        return { isBanned: true, isPermanent: true, reason: ban.reason || 'Violation of community rules' };
    }

    const now = Date.now();
    if (now > ban.expiry) {
        // Ban expired — lift automatically
        delete bans[username.toLowerCase()];
        saveBans(bans);
        return { isBanned: false };
    }

    const remainingMs = ban.expiry - now;
    return {
        isBanned: true,
        isPermanent: false,
        remainingMs,
        formattedRemaining: formatBanCountdown(remainingMs),
        reason: ban.reason || 'Violation of community rules'
    };
}

function formatBanCountdown(ms) {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function applyCommentPermissions() {
    const banStatus = checkBanStatus(currentCommentUser.username);
    const banner = document.getElementById('banAlertBanner');
    const textarea = document.getElementById('commentTextarea');
    const postBtn = document.getElementById('postCommentBtn');

    if (banStatus.isBanned) {
        if (banner) {
            banner.classList.remove('hidden');
            const timeText = banStatus.isPermanent ? 'PERMANENT BAN 💀' : `Time remaining: ${banStatus.formattedRemaining}`;
            banner.innerHTML = `<i class="fas fa-ban"></i> <div><strong>You are banned from commenting!</strong><br><small>${timeText} (Reason: ${escapeHtml(banStatus.reason)})</small></div>`;
        }
        if (textarea) { textarea.disabled = true; textarea.placeholder = 'You are banned from posting comments.'; }
        if (postBtn) { postBtn.disabled = true; }
    } else {
        if (banner) banner.classList.add('hidden');
        if (textarea) { textarea.disabled = false; textarea.placeholder = 'Write a comment or share a fix... (Markdown supported: **bold**, `code`)'; }
        if (postBtn) { postBtn.disabled = false; }
    }
}

function openBanModal(username) {
    if (!currentCommentUser.isOwner) return showToast('⚠️ Only the site Owner can ban users!', 'warn');
    activeBanTarget = username;
    const modal = document.getElementById('banUserModal');
    const targetText = document.getElementById('banModalTargetText');
    if (!modal) return;

    if (targetText) targetText.textContent = `Target user: "${username}"`;
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('open'));
}

function closeBanModal() {
    const modal = document.getElementById('banUserModal');
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(() => { if (!modal.classList.contains('open')) modal.style.display = 'none'; }, 280);
}

function confirmUserBan() {
    if (!activeBanTarget) return;

    const select = document.getElementById('banDurationSelect');
    const reasonInput = document.getElementById('banReasonInput');
    const duration = select ? select.value : '86400';
    const reason = reasonInput ? reasonInput.value.trim() : 'Rule violation';

    const bans = getBans();
    let expiry = 'permanent';

    if (duration !== 'permanent') {
        expiry = Date.now() + (parseInt(duration, 10) * 1000);
    }

    bans[activeBanTarget.toLowerCase()] = {
        username: activeBanTarget,
        bannedAt: Date.now(),
        expiry,
        reason
    };

    saveBans(bans);
    closeBanModal();
    showToast(`🔨 Banned ${activeBanTarget}!`, 'error');

    if (reasonInput) reasonInput.value = '';
    applyCommentPermissions();
    renderBanManagerList();
    renderCommentsFeed();
}

function unbanUser(username) {
    if (!currentCommentUser.isOwner) return;
    const bans = getBans();
    delete bans[username.toLowerCase()];
    saveBans(bans);
    showToast(`✅ Unbanned ${username}`, 'success');
    renderBanManagerList();
    applyCommentPermissions();
    renderCommentsFeed();
}

function renderBanManagerList() {
    const list = document.getElementById('banManagerList');
    if (!list) return;

    const bans = getBans();
    const keys = Object.keys(bans);

    if (keys.length === 0) {
        list.innerHTML = '<p class="comment-placeholder-text"><i class="fas fa-user-check"></i><br>No active bans. Community is clean!</p>';
        return;
    }

    list.innerHTML = keys.map(k => {
        const item = bans[k];
        const timeText = item.expiry === 'permanent' ? 'Permanent' : formatBanCountdown(item.expiry - Date.now());
        return `
            <div class="ban-item">
                <div class="ban-item-info">
                    <span class="ban-item-username"><i class="fas fa-ban"></i> ${escapeHtml(item.username)}</span>
                    <span class="ban-item-time">Expires: ${timeText} · Reason: ${escapeHtml(item.reason)}</span>
                </div>
                <button class="btn-unban" onclick="unbanUser('${escapeHtml(item.username)}')"><i class="fas fa-undo"></i> Unban</button>
            </div>
        `;
    }).join('');
}

// 3. COMMENTS DATA STORE & SEED DATA
function getCommentsData() {
    try {
        const stored = localStorage.getItem(STORAGE_COMMENTS);
        if (stored) return JSON.parse(stored);
    } catch (e) {}

    // Seed default comments if empty
    const seed = [
        {
            id: 'c_seed_1',
            parentId: null,
            author: 'jackyZip2file-tech',
            avatar: 'https://github.com/jackyZip2file-tech.png',
            isOwner: true,
            text: 'Welcome to **Jacky\'s Library v9.0**! 🚀 Share your fixes, report broken links, or drop game requests below. Markdown supported (`code`, **bold**)!',
            timestamp: Date.now() - 86400000,
            isPinned: true,
            isEdited: false,
            upvotes: 42,
            downvotes: 0,
            reactions: { '🔥': ['jackyZip2file-tech', 'Alex'], '🚀': ['jackyZip2file-tech'], '👍': ['Mes3odi'] }
        },
        {
            id: 'c_seed_2',
            parentId: null,
            author: 'Mes3odi',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mes3odi',
            isOwner: false,
            text: 'Lethal Company online fix works smoothly! Make sure to copy the `.dll` files into the main directory.',
            timestamp: Date.now() - 36000000,
            isPinned: false,
            isEdited: false,
            upvotes: 18,
            downvotes: 1,
            reactions: { '👍': ['jackyZip2file-tech', 'Sam'], '🔥': ['Mes3odi'] }
        },
        {
            id: 'c_seed_3',
            parentId: 'c_seed_2',
            author: 'jackyZip2file-tech',
            avatar: 'https://github.com/jackyZip2file-tech.png',
            isOwner: true,
            text: 'Glad it helped dawg! Enjoy tinkering! 🌿',
            timestamp: Date.now() - 18000000,
            isPinned: false,
            isEdited: false,
            upvotes: 8,
            downvotes: 0,
            reactions: { '❤️': ['Mes3odi'] }
        }
    ];

    localStorage.setItem(STORAGE_COMMENTS, JSON.stringify(seed));
    return seed;
}

function saveCommentsData(list) {
    localStorage.setItem(STORAGE_COMMENTS, JSON.stringify(list));
}

// 4. MARKDOWN & TIME PARSER
function parseCommentMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // Code blocks ```code```
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // URLs
    html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
}

function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Just now';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

// 5. VOTING & REACTIONS
function getVotes() {
    try { return JSON.parse(localStorage.getItem(STORAGE_VOTES) || '{}'); }
    catch (e) { return {}; }
}

function voteComment(commentId, direction) {
    const banStatus = checkBanStatus(currentCommentUser.username);
    if (banStatus.isBanned) return showToast('⚠️ You are banned from voting.', 'warn');

    const votes = getVotes();
    const currentVote = votes[commentId];
    const comments = getCommentsData();
    const comment = comments.find(c => c.id === commentId);

    if (!comment) return;

    if (currentVote === direction) {
        // Toggle off
        delete votes[commentId];
        if (direction === 'up') comment.upvotes = Math.max(0, (comment.upvotes || 1) - 1);
        else comment.downvotes = Math.max(0, (comment.downvotes || 1) - 1);
    } else {
        if (currentVote === 'up') comment.upvotes = Math.max(0, (comment.upvotes || 1) - 1);
        if (currentVote === 'down') comment.downvotes = Math.max(0, (comment.downvotes || 1) - 1);

        votes[commentId] = direction;
        if (direction === 'up') comment.upvotes = (comment.upvotes || 0) + 1;
        else comment.downvotes = (comment.downvotes || 0) + 1;
    }

    localStorage.setItem(STORAGE_VOTES, JSON.stringify(votes));
    saveCommentsData(comments);
    renderCommentsFeed();
}

// Balanced Reaction Pairs (👍/👎, 🔥/💩, ❤️/💔, 🚀/💀, 👀/🤡)
const REACTION_PAIRS = ['👍', '👎', '🔥', '💩', '❤️', '💔', '🚀', '💀', '👀', '🤡'];

function reactComment(commentId, emoji) {
    const banStatus = checkBanStatus(currentCommentUser.username);
    if (banStatus.isBanned) return showToast('⚠️ You are banned from reacting.', 'warn');

    const comments = getCommentsData();
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (!comment.reactions) comment.reactions = {};
    if (!comment.reactions[emoji]) comment.reactions[emoji] = [];

    const user = currentCommentUser.username;
    const idx = comment.reactions[emoji].indexOf(user);

    if (idx !== -1) {
        comment.reactions[emoji].splice(idx, 1);
        if (comment.reactions[emoji].length === 0) delete comment.reactions[emoji];
    } else {
        comment.reactions[emoji].push(user);
    }

    saveCommentsData(comments);
    renderCommentsFeed();
}

// 6. RENDER COMMENTS FEED & TREE
function setCommentSort(mode) {
    currentCommentSort = mode;
    document.querySelectorAll('.sort-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.sort === mode);
    });
    renderCommentsFeed();
}

function renderCommentsFeed() {
    const container = document.getElementById('commentsFeed');
    const totalBadge = document.getElementById('totalCommentsCount');
    if (!container) return;

    const allComments = getCommentsData();
    if (totalBadge) totalBadge.textContent = `${allComments.length} comment${allComments.length === 1 ? '' : 's'}`;

    if (allComments.length === 0) {
        container.innerHTML = '<p class="comment-placeholder-text"><i class="fas fa-comment-dots"></i><br>No comments yet. Be the first to start the discussion!</p>';
        return;
    }

    // Separate top-level comments and replies
    const topComments = allComments.filter(c => !c.parentId);

    // Sorting algorithm
    topComments.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1; // Pinned first

        if (currentCommentSort === 'top') {
            const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
            const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
            return scoreB - scoreA;
        }
        if (currentCommentSort === 'newest') return b.timestamp - a.timestamp;
        if (currentCommentSort === 'oldest') return a.timestamp - b.timestamp;
        return 0;
    });

    container.innerHTML = topComments.map(c => buildCommentNode(c, allComments)).join('');
}

function buildCommentNode(comment, allComments) {
    const replies = allComments.filter(r => r.parentId === comment.id);
    replies.sort((a, b) => a.timestamp - b.timestamp);

    const repliesHtml = replies.length > 0 ? `
        <div class="comment-replies-list">
            ${replies.map(r => buildCommentNode(r, allComments)).join('')}
        </div>
    ` : '';

    return buildCommentCardHtml(comment, Boolean(comment.parentId)) + repliesHtml;
}

function buildCommentCardHtml(comment, isReply = false) {
    const votes = getVotes();
    const userVote = votes[comment.id];
    const netScore = (comment.upvotes || 0) - (comment.downvotes || 0);
    const formattedScore = netScore > 0 ? `+${netScore}` : `${netScore}`;

    const isOwnerComment = comment.isOwner || comment.author.toLowerCase() === 'jackyzip2file-tech';
    const isCurrentAuthor = currentCommentUser.username.toLowerCase() === comment.author.toLowerCase();
    const canModerate = currentCommentUser.isOwner;

    // Badges
    const ownerBadgeHtml = isOwnerComment ? '<span class="badge-owner"><i class="fas fa-crown"></i> OWNER</span>' : '';
    const pinBadgeHtml = comment.isPinned ? '<span class="pin-badge"><i class="fas fa-thumbtack"></i> PINNED</span>' : '';
    const editedHtml = comment.isEdited ? '<span class="badge-edited">(edited)</span>' : '';

    // Reaction pills & Discord Tooltips
    const reactions = comment.reactions || {};
    const reactionPillsHtml = Object.keys(reactions).map(emoji => {
        const users = reactions[emoji] || [];
        if (users.length === 0) return '';
        const userHasReacted = users.includes(currentCommentUser.username);
        const tooltipText = `Reacted by: ${users.slice(0, 5).join(', ')}${users.length > 5 ? ` +${users.length - 5} more` : ''}`;

        return `
            <button class="reaction-pill ${userHasReacted ? 'user-reacted' : ''}" onclick="reactComment('${comment.id}', '${emoji}')">
                <span>${emoji}</span>
                <span>${users.length}</span>
                <span class="reaction-tooltip">${escapeHtml(tooltipText)}</span>
            </button>
        `;
    }).join('');

    // Inline reply box toggle state
    const isReplyingThis = replyingToId === comment.id;
    const inlineReplyHtml = isReplyingThis ? `
        <div class="inline-reply-box">
            <textarea id="replyTextarea_${comment.id}" placeholder="Replying to @${escapeHtml(comment.author)}..." maxlength="500"></textarea>
            <div class="inline-reply-actions">
                <button class="btn-comment-action" onclick="toggleInlineReply(null)">Cancel</button>
                <button class="btn-post-comment" onclick="submitInlineReply('${comment.id}')"><i class="fas fa-reply"></i> Reply</button>
            </div>
        </div>
    ` : '';

    // Mod Action Buttons
    let modButtons = '';
    if (canModerate) {
        modButtons += `
            <button class="btn-comment-action" onclick="togglePinComment('${comment.id}')" title="Pin / Unpin"><i class="fas fa-thumbtack"></i> ${comment.isPinned ? 'Unpin' : 'Pin'}</button>
        `;
        if (!isOwnerComment) {
            modButtons += `
                <button class="btn-comment-action btn-ban-action" onclick="openBanModal('${escapeHtml(comment.author)}')" title="Ban user"><i class="fas fa-gavel"></i> Ban</button>
            `;
        }
    }
    if (isCurrentAuthor || canModerate) {
        modButtons += `
            <button class="btn-comment-action" onclick="editComment('${comment.id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn-comment-action" onclick="deleteComment('${comment.id}')" style="color:var(--del-red);"><i class="fas fa-trash"></i> Delete</button>
        `;
    }

    return `
        <div class="comment-card ${isReply ? 'is-reply' : ''} ${comment.isPinned ? 'is-pinned' : ''} ${isOwnerComment ? 'is-owner-card' : ''}" id="comment_${comment.id}">
            <div class="comment-header">
                <div class="comment-author-info">
                    <img class="author-avatar" src="${escapeHtml(comment.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user')}" alt="${escapeHtml(comment.author)}" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=user'">
                    <span class="author-name">${escapeHtml(comment.author)}</span>
                    ${ownerBadgeHtml}
                    ${pinBadgeHtml}
                </div>
                <div class="comment-meta">
                    <span class="comment-time">${formatRelativeTime(comment.timestamp)}</span>
                    ${editedHtml}
                </div>
            </div>

            <div class="comment-body">
                ${isReply ? '<span class="reply-indicator">↳</span>' : ''}
                ${parseCommentMarkdown(comment.text)}
            </div>

            ${reactionPillsHtml ? `<div class="reaction-pills">${reactionPillsHtml}</div>` : ''}

            <div class="comment-footer-actions">
                <div class="vote-group">
                    <button class="vote-btn ${userVote === 'up' ? 'up-voted' : ''}" onclick="voteComment('${comment.id}', 'up')" title="Upvote"><i class="fas fa-arrow-up"></i></button>
                    <span class="vote-score">${formattedScore}</span>
                    <button class="vote-btn ${userVote === 'down' ? 'down-voted' : ''}" onclick="voteComment('${comment.id}', 'down')" title="Downvote"><i class="fas fa-arrow-down"></i></button>
                </div>

                <div class="action-buttons-group">
                    <button class="btn-comment-action" onclick="toggleInlineReply('${comment.id}')"><i class="fas fa-reply"></i> Reply</button>
                    ${modButtons}
                </div>
            </div>

            ${inlineReplyHtml}
        </div>
    `;
}

// 7. INPUT & EMOJI TOOLS
function updateCharCounter() {
    const textarea = document.getElementById('commentTextarea');
    const counter = document.getElementById('commentCharCounter');
    if (!textarea || !counter) return;

    const len = textarea.value.length;
    counter.textContent = `${len} / 500`;

    counter.classList.remove('warn', 'danger');
    if (len > 450) counter.classList.add('danger');
    else if (len > 400) counter.classList.add('warn');
}

function insertEmoji(emoji) {
    const textarea = document.getElementById('commentTextarea');
    if (!textarea) return;

    const start = textarea.selectionStart || textarea.value.length;
    const end = textarea.selectionEnd || textarea.value.length;
    const val = textarea.value;

    textarea.value = val.substring(0, start) + emoji + val.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    textarea.focus();
    updateCharCounter();
}

function submitNewComment() {
    const banStatus = checkBanStatus(currentCommentUser.username);
    if (banStatus.isBanned) return showToast('⚠️ You are banned from commenting.', 'warn');

    const textarea = document.getElementById('commentTextarea');
    if (!textarea) return;
    const text = textarea.value.trim();

    if (!text) return showToast('⚠️ Please write a comment before posting!', 'warn');

    const newComment = {
        id: 'c_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        parentId: null,
        author: currentCommentUser.username,
        avatar: currentCommentUser.avatar,
        isOwner: currentCommentUser.isOwner,
        text,
        timestamp: Date.now(),
        isPinned: false,
        isEdited: false,
        upvotes: 1,
        downvotes: 0,
        reactions: {}
    };

    const list = getCommentsData();
    list.unshift(newComment);
    saveCommentsData(list);

    textarea.value = '';
    updateCharCounter();
    renderCommentsFeed();
    showToast('🚀 Comment posted!', 'success');
}

function toggleInlineReply(commentId) {
    replyingToId = replyingToId === commentId ? null : commentId;
    renderCommentsFeed();
}

function submitInlineReply(parentId) {
    const banStatus = checkBanStatus(currentCommentUser.username);
    if (banStatus.isBanned) return showToast('⚠️ You are banned from replying.', 'warn');

    const textarea = document.getElementById(`replyTextarea_${parentId}`);
    if (!textarea) return;

    const text = textarea.value.trim();
    if (!text) return showToast('⚠️ Please write a reply!', 'warn');

    const newReply = {
        id: 'c_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        parentId,
        author: currentCommentUser.username,
        avatar: currentCommentUser.avatar,
        isOwner: currentCommentUser.isOwner,
        text,
        timestamp: Date.now(),
        isPinned: false,
        isEdited: false,
        upvotes: 1,
        downvotes: 0,
        reactions: {}
    };

    const list = getCommentsData();
    list.push(newReply);
    saveCommentsData(list);

    replyingToId = null;
    renderCommentsFeed();
    showToast('↳ Reply posted!', 'success');
}

// 8. MODERATION: PIN, EDIT, DELETE, TAB SWITCH
function togglePinComment(commentId) {
    if (!currentCommentUser.isOwner) return;
    const list = getCommentsData();
    const c = list.find(item => item.id === commentId);
    if (!c) return;

    c.isPinned = !c.isPinned;
    saveCommentsData(list);
    renderCommentsFeed();
    showToast(c.isPinned ? '📌 Comment pinned!' : 'Comment unpinned', 'info');
}

function editComment(commentId) {
    const list = getCommentsData();
    const c = list.find(item => item.id === commentId);
    if (!c) return;

    const isCurrentAuthor = currentCommentUser.username.toLowerCase() === c.author.toLowerCase();
    if (!isCurrentAuthor && !currentCommentUser.isOwner) return;

    const updatedText = prompt('Edit your comment:', c.text);
    if (updatedText === null) return;
    const clean = updatedText.trim();
    if (!clean) return showToast('⚠️ Comment cannot be empty!', 'warn');

    c.text = clean;
    c.isEdited = true;
    saveCommentsData(list);
    renderCommentsFeed();
    showToast('✏️ Comment updated!', 'success');
}

function deleteComment(commentId) {
    const list = getCommentsData();
    const c = list.find(item => item.id === commentId);
    if (!c) return;

    const isCurrentAuthor = currentCommentUser.username.toLowerCase() === c.author.toLowerCase();
    if (!isCurrentAuthor && !currentCommentUser.isOwner) return;

    if (!confirm('Delete this comment and all its replies?')) return;

    // Delete comment and cascaded child replies
    const idsToDelete = new Set([commentId]);
    let added = true;
    while (added) {
        added = false;
        list.forEach(item => {
            if (item.parentId && idsToDelete.has(item.parentId) && !idsToDelete.has(item.id)) {
                idsToDelete.add(item.id);
                added = true;
            }
        });
    }

    const filtered = list.filter(item => !idsToDelete.has(item.id));
    saveCommentsData(filtered);
    renderCommentsFeed();
    showToast('🗑️ Comment deleted', 'info');
}

function switchCommentTab(tab) {
    const commentsTab = document.getElementById('commentsTabContent');
    const bansTab = document.getElementById('banManagerTabContent');
    const tabCommentsBtn = document.getElementById('tabCommentsBtn');
    const tabBanBtn = document.getElementById('tabBanManagerBtn');

    if (tab === 'bans') {
        if (commentsTab) commentsTab.classList.add('hidden');
        if (bansTab) bansTab.classList.remove('hidden');
        if (tabCommentsBtn) tabCommentsBtn.classList.remove('active');
        if (tabBanBtn) tabBanBtn.classList.add('active');
        renderBanManagerList();
    } else {
        if (bansTab) bansTab.classList.add('hidden');
        if (commentsTab) commentsTab.classList.remove('hidden');
        if (tabBanBtn) tabBanBtn.classList.remove('active');
        if (tabCommentsBtn) tabCommentsBtn.classList.add('active');
        renderCommentsFeed();
    }
}

// Backdrop close for ban modal
function initBanModalBackdrop() {
    const modal = document.getElementById('banUserModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeBanModal();
        });
    }
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
    
    // Native Comment Engine Initialization
    initCommentIdentity();
    applyCommentPermissions();
    renderCommentsFeed();
    initBanModalBackdrop();
}

init();

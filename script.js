const LIBRARY_VERSION = '9';

// --- 1. CONFIGURATION & ADMIN CHECK ---
const urlParams = new URLSearchParams(window.location.search);
const isOwner = urlParams.get('admin') === 'jacky';

// --- 2. THE DATA lives in officialGames inside index.html ---
let games = JSON.parse(JSON.stringify(officialGames));

let editIndex = null;
let ownerHasUnsavedEdits = false;

if (isOwner) {
    document.getElementById('adminBtn').classList.remove('hidden');
    const exportBtn = document.createElement('button');
    exportBtn.innerText = "💾 Export officialGames";
    exportBtn.className = "btn-create btn-export";
    exportBtn.onclick = exportData;
    document.querySelector('.header-right').prepend(exportBtn);
}

// --- GALAXY STARFIELD ---
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

    const STAR_COUNT = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 8000));
    const LAYERS = [
        { speed: 0.15, size: 0.8, alpha: 0.35 },
        { speed: 0.35, size: 1.2, alpha: 0.55 },
        { speed: 0.6, size: 1.8, alpha: 0.85 }
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
                twinkleSpeed: 0.002 + Math.random() * 0.004
            });
        }
    }

    function draw(time) {
        ctx.clearRect(0, 0, width, height);
        for (const star of stars) {
            star.y += star.layer.speed;
            if (star.y > height) {
                star.y = 0;
                star.x = Math.random() * width;
            }
            const twinkle = 0.65 + 0.35 * Math.sin(time * star.twinkleSpeed + star.twinkle);
            const alpha = star.layer.alpha * twinkle;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.layer.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
            ctx.fill();
            if (star.layer.size > 1.4 && twinkle > 0.9) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.layer.size * 2.5, 0, Math.PI * 2);
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

    resize();
    animationId = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
        <a href="${escapeHtml(yt)}" class="tutorial-row" target="_blank" rel="noopener noreferrer">
            <span class="tutorial-icon"><i class="fab fa-youtube"></i></span>
            <span class="tutorial-text">
                <span class="tutorial-label">Tutorial / Preview</span>
                <span class="tutorial-hint">Click to watch how to install</span>
            </span>
            <i class="fas fa-external-link-alt tutorial-arrow"></i>
        </a>`;
}

function buildActions(game, index) {
    if (isOwner) {
        return `
            <button type="button" class="btn-action btn-edit" onclick="openEditModal(${index})"><i class="fas fa-edit"></i> Edit</button>
            <button type="button" class="btn-action btn-delete" onclick="deleteGame(${index})"><i class="fas fa-trash"></i> Delete</button>
            <button type="button" class="btn-action btn-view" onclick="openGameByIndex(${index})"><i class="fas fa-download"></i> View</button>`;
    }
    return `
        <button type="button" class="btn-action btn-copy" onclick="copyLinkByIndex(${index})"><i class="fas fa-copy"></i> Copy</button>
        <button type="button" class="btn-action btn-view" onclick="openGameByIndex(${index})"><i class="fas fa-external-link-alt"></i> Download</button>`;
}

function render() {
    const container = document.getElementById('linksContainer');
    container.innerHTML = '';

    if (isOwner && ownerHasUnsavedEdits) {
        const banner = document.createElement('div');
        banner.className = 'admin-banner';
        banner.innerHTML = '<i class="fas fa-info-circle"></i> Preview only — click <strong>Export officialGames</strong> and paste into <strong>index.html</strong> on GitHub so everyone sees your changes.';
        container.appendChild(banner);
    }

    if (games.length === 0) {
        container.innerHTML += `
            <div class="library-empty">
                <i class="fas fa-rocket"></i>
                <p>No games yet.${isOwner ? ' Use <strong>+ New Link</strong>, then Export.' : ''}</p>
            </div>`;
        updateSiteMeta();
        return;
    }

    games.forEach((game, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;

        const imgSrc = escapeHtml(game.img || 'https://via.placeholder.com/400x220/0a0e1a/00e5ff?text=Jackys+Library');
        const title = escapeHtml(game.title);

        card.innerHTML = `
            <div class="card-thumb-wrap">
                <img class="card-img" src="${imgSrc}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x220/0a0e1a/00e5ff?text=Jackys+Library'">
            </div>
            <div class="card-body">
                <h3 class="card-title">${title}</h3>
                ${buildTutorialRow(game)}
                <div class="actions">${buildActions(game, index)}</div>
            </div>
        `;
        container.appendChild(card);
    });
    updateSiteMeta();
}

function updateSiteMeta() {
    let footer = document.getElementById('siteMeta');
    if (!footer) {
        footer = document.createElement('footer');
        footer.id = 'siteMeta';
        footer.className = 'site-meta';
        document.body.appendChild(footer);
    }
    const unsaved = isOwner && ownerHasUnsavedEdits ? ' · unsaved preview' : '';
    footer.textContent = `${games.length} games · index.html${unsaved} · v${LIBRARY_VERSION}`;
}

function openEditModal(index = null) {
    editIndex = index;
    const modalTitle = document.getElementById('modalTitle');
    const publishBtn = document.getElementById('publishBtn');

    if (index !== null) {
        const game = games[index];
        document.getElementById('newTitle').value = game.title;
        document.getElementById('newFileUrl').value = game.url;
        document.getElementById('newYtUrl').value = game.yt || '';
        const img = game.img || '';
        if (img.startsWith('data:image/')) {
            thumbDataUrl = img;
            thumbFromUpload = true;
            document.getElementById('newImgUrl').value = '';
            setThumbPreview(img);
        } else {
            thumbDataUrl = '';
            thumbFromUpload = false;
            document.getElementById('newImgUrl').value = img;
            setThumbPreview(img);
        }
        document.getElementById('thumbFileInput').value = '';
        modalTitle.innerText = "Edit Game Info";
        publishBtn.innerText = "Save Changes";
    } else {
        document.getElementById('newTitle').value = "";
        document.getElementById('newFileUrl').value = "";
        document.getElementById('newYtUrl').value = "";
        document.getElementById('newImgUrl').value = "";
        clearThumbUpload();
        modalTitle.innerText = "Publish New Game";
        publishBtn.innerText = "Publish";
    }
    toggleModal(true);
}

function publishGame() {
    const title = document.getElementById('newTitle').value;
    const url = document.getElementById('newFileUrl').value;
    const yt = document.getElementById('newYtUrl').value;
    const imgUrl = document.getElementById('newImgUrl').value.trim();
    const img = (thumbFromUpload && thumbDataUrl) ? thumbDataUrl : imgUrl;

    if (!title || !url) return alert("Name and Link are required!");

    const gameData = { title, url, yt, img };

    if (editIndex !== null) { games[editIndex] = gameData; }
    else { games.push(gameData); }

    ownerHasUnsavedEdits = true;
    render();
    toggleModal(false);

    if (isOwner) {
        alert(
            "Saved on YOUR screen only (preview).\n\n" +
            "Other people will NOT see this until you:\n" +
            "1. Click Export officialGames\n" +
            "2. On GitHub, open index.html → replace the officialGames array → Save\n" +
            "3. Refresh the live site (Ctrl+Shift+R)"
        );
    }
}

function deleteGame(index) {
    if (confirm("Delete this game?")) {
        games.splice(index, 1);
        ownerHasUnsavedEdits = true;
        render();
    }
}

function formatOfficialGamesExport(gameList) {
    const lines = ['        const officialGames = ['];
    gameList.forEach((game, i) => {
        lines.push('            {');
        lines.push(`                "title": ${JSON.stringify(game.title)},`);
        lines.push(`                "url": ${JSON.stringify(game.url)},`);
        lines.push(`                "yt": ${JSON.stringify(game.yt || '')},`);
        lines.push(`                "img": ${JSON.stringify(game.img || '')}`);
        lines.push('            }' + (i < gameList.length - 1 ? ',' : ''));
    });
    lines.push('        ];');
    return lines.join('\n');
}

function exportData() {
    const exportText = formatOfficialGamesExport(games);
    navigator.clipboard.writeText(exportText);
    alert(
        "COPIED — ready to paste into index.html on GitHub!\n\n" +
        "1. GitHub → your repo → index.html → Edit\n" +
        "2. Select from const officialGames = [ down to ]; (the whole block)\n" +
        "3. Delete → Paste (Ctrl+V)\n" +
        "4. Commit / Save\n" +
        "5. Wait 30 sec → refresh site with Ctrl+Shift+R\n\n" +
        "Spacing is included — paste exactly as copied."
    );
}

function searchGames() {
    const term = document.getElementById('searchInput').value.toLowerCase().trim();
    const cards = document.getElementsByClassName('card');
    Array.from(cards).forEach((card) => {
        const index = parseInt(card.dataset.index, 10);
        const title = (games[index] && games[index].title) ? games[index].title.toLowerCase() : '';
        card.classList.toggle('hidden', term !== '' && !title.includes(term));
    });
}

function toggleModal(show) {
    const modal = document.getElementById('linkModal');
    if (show) {
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('open'));
    } else {
        modal.classList.remove('open');
        setTimeout(() => {
            if (!modal.classList.contains('open')) {
                modal.style.display = 'none';
            }
        }, 280);
    }
}

// --- THUMBNAIL UPLOAD ---
let thumbFromUpload = false;
let thumbDataUrl = '';

function setThumbPreview(src) {
    const placeholder = document.getElementById('thumbUploadPlaceholder');
    const preview = document.getElementById('thumbUploadPreview');
    const previewImg = document.getElementById('thumbPreviewImg');

    if (src) {
        previewImg.src = src;
        placeholder.classList.add('hidden');
        preview.classList.remove('hidden');
        requestAnimationFrame(() => preview.classList.add('visible'));
    } else {
        preview.classList.remove('visible');
        placeholder.classList.remove('hidden');
        preview.classList.add('hidden');
        previewImg.removeAttribute('src');
    }
}

function clearThumbUpload() {
    const fileInput = document.getElementById('thumbFileInput');
    const zone = document.getElementById('thumbUploadZone');
    fileInput.value = '';
    zone.classList.remove('dragover');
    thumbFromUpload = false;
    thumbDataUrl = '';
    setThumbPreview('');
}

function handleThumbFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please choose a valid image file.');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large. Please use a file under 2 MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        thumbDataUrl = e.target.result;
        thumbFromUpload = true;
        document.getElementById('newImgUrl').value = '';
        setThumbPreview(thumbDataUrl);
    };
    reader.readAsDataURL(file);
}

function initThumbUpload() {
    const zone = document.getElementById('thumbUploadZone');
    const fileInput = document.getElementById('thumbFileInput');
    const removeBtn = document.getElementById('thumbRemoveBtn');
    const imgUrlInput = document.getElementById('newImgUrl');

    zone.addEventListener('click', (e) => {
        if (e.target === removeBtn || e.target.closest('.thumb-remove-btn')) return;
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleThumbFile(fileInput.files[0]);
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearThumbUpload();
    });

    imgUrlInput.addEventListener('input', () => {
        const val = imgUrlInput.value.trim();
        if (val) {
            thumbFromUpload = false;
            thumbDataUrl = '';
            fileInput.value = '';
            setThumbPreview(val);
        } else if (!thumbFromUpload) {
            setThumbPreview('');
            fileInput.value = '';
            zone.classList.remove('dragover');
        }
    });

    ['dragenter', 'dragover'].forEach((evt) => {
        zone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('dragover');
        });
    });

    zone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!zone.contains(e.relatedTarget)) {
            zone.classList.remove('dragover');
        }
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleThumbFile(file);
    });
}

function copyLink(url) {
    navigator.clipboard.writeText(url);
    alert("Link copied!");
}

function copyLinkByIndex(index) {
    if (games[index]) copyLink(games[index].url);
}

function openGameByIndex(index) {
    if (games[index] && games[index].url) window.open(games[index].url);
}

function init() {
    initGalaxyBackground();
    initThumbUpload();
    render();
}

init();

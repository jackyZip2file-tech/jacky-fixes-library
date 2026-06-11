// Bump when you publish link changes on GitHub (shows in footer so you know the new file loaded)
const LIBRARY_VERSION = '3';

// --- 1. CONFIGURATION & ADMIN CHECK ---
// Shortcut: To see your buttons, visit your site and add ?admin=jacky to the URL
const urlParams = new URLSearchParams(window.location.search);
const isOwner = urlParams.get('admin') === 'jacky';

// --- 2. THE DATA (edit this list on GitHub — everyone sees it) ---
// Workflow: ?admin=jacky → add/edit links → Export List → paste over "let officialGames = [...]" below → save on GitHub
let officialGames = [
  {
    "title": "rv there yet ",
    "url": "https://steamrip.com/rv-there-yet-free-download/",
    "yt": "https://www.youtube.com/watch?v=Br8vAUbdhFI&t=1s&pp=ygUNcnYgdGhlcmUgeWV0IA%3D%3D",
    "img": "https://gaming-cdn.com/images/products/20702/orig/rv-there-yet-pc-steam-cover.jpg?v=1761118646"
  },
  {
    "title": "Repo",
    "url": "https://steamrip.com/r-e-p-o-free-download/",
    "yt": "https://youtu.be/AqhamuepAeE?si=acE8ghNYzmylJsP8",
    "img": "https://i.ytimg.com/vi/IEhEymYkzRI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAAAfZjqO617nHrUEa_EW8HD_ZUfw"
  },
  {
    "title": "content warning ",
    "url": "https://steamrip.com/content-warning-free-download/",
    "yt": "https://www.youtube.com/watch?v=iyif6sL3rXs&pp=ygUWY29udGVudCB3YXJuaW5nIG1lbWVzIA%3D%3D",
    "img": "https://steamgg.net/wp-content/uploads/2024/04/Content-Warning-Free-Download-SteamGG-2-jpg.webp"
  },
  {
    "title": "GWtool",
    "url": "https://www.moddb.com/mods/garrys-mod/downloads/gwtool-file-made-by-zombieslayer103",
    "yt": "https://www.youtube.com/watch?v=K99P9xMrZ-4",
    "img": "https://media.moddb.com/images/downloads/1/179/178961/dcgp6gx-fc2b65c5-e07b-4371-b520-.png"
  },
  {
    "title": "7z",
    "url": "https://www.7-zip.org/",
    "yt": "https://www.youtube.com/watch?v=K99P9xMrZ-4",
    "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/7-Zip_Icon.svg/3840px-7-Zip_Icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"
  },
  {
    "title": "online fix Gmod download",
    "url": "https://freetp.org/getfile-15252",
    "yt": "https://www.youtube.com/watch?v=79ux5CZ0ros",
    "img": "https://content.any.run/tasks/09a8027c-7d58-4f48-905f-3d415f343e09/download/screens/1c7808a6-3645-46cf-9638-e7ce0d79638d/image.jpeg"
  },
  {
    "title": "SteamCMD workshop download",
    "url": "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip",
    "yt": "https://www.youtube.com/watch?v=K99P9xMrZ-4",
    "img": "https://steamworkshopdownloader.io/assets/img/screenshot4.png"
  },
  {
    "title": "steamtools ",
    "url": "https://steamtools.net/",
    "yt": "https://www.youtube.com/watch?v=9vNDVKn3gL0",
    "img": "https://repository-images.githubusercontent.com/1242710715/b2321855-74d5-47e3-b54f-4faf8fd30b31"
  },
  {
    "title": "lethal company ",
    "url": "https://steamrip.com/lethal-company-free-download-l1/",
    "yt": "https://www.youtube.com/watch?v=0C9KwlbDmk0&pp=ygUVbGV0aGFsIGNvbXBhbnkgZnVubnkg",
    "img": "https://imgs.search.brave.com/j8fuwU7S7JgqjrytSW2f-U_jQIDMv9MSJJkatyHJ0Is/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC93cDEzMzEz/MDU2LmpwZw"
  },
  {
    "title": "Human Fall Flat ",
    "url": "https://steamrip.com/human-fall-flat-free-download-o2/",
    "yt": "https://www.youtube.com/watch?v=go4iKrHleDo&pp=ygUQaHVtYW4gZmFsbCBmbGF0IA%3D%3D",
    "img": "https://imgs.search.brave.com/c25ZxA10S95VeyWzn9iZihgMBAUqrrTQA771d-DSqJ8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzU0LzEz/LzE3LzU0MTMxNzlh/OTllNmZlM2E1ZmJm/YTgwNDI2OTExOWQz/LmpwZw"
  },
  {
    "title": "Minecraft hack fix",
    "url": "https://drive.usercontent.google.com/download?id=1iUO21MlndfbXnAk186R8A32qP93z7qgD&export=download&authuser=0",
    "yt": "https://www.youtube.com/watch?v=QmDQLk5iyEY&pp=ygUqbWluZWNyYWZ0IGJlZHJvY2sgd2luZG93cyBmcmVlIGRvd25sb2FkIHBj",
    "img": "https://imgs.search.brave.com/7nTJqXsHq1I8deWFrBpYqpiQsea28xKZjHuCQLxc0MI/rs:fit:200:200:1:0/g:ce/aHR0cHM6Ly9pLnl0/aW1nLmNvbS92aS9t/VHVhNkF5Sms3TS9t/YXhyZXNkZWZhdWx0/LmpwZw"
  },
  {
    "title": "M centers (for older version bedrock luncher)",
    "url": "https://drive.google.com/drive/folders/1qDN1_LtpTO3sxozB08PLViPM2vFHrsIh",
    "yt": "",
    "img": "https://imgs.search.brave.com/RuzmYazFD6NECKGqY4S0HGONT0uvPdIuLLX3dIjZofM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wcmV2/aWV3LnJlZGQuaXQv/ajJtNDU1eDg5ZHhl/MS5wbmc_YXV0bz13/ZWJwJnM9OWIxNTg4/OGE0ZjQwNzUyZTZi/YTI4NzkzM2RhYjI3/ODc0Yzc3YjM3Nw"
  }
];

// Everyone (normal visitors) always sees officialGames from this file.
// Admin edits only live in memory until you Export and paste into GitHub.
let games = JSON.parse(JSON.stringify(officialGames));

// Remove old browser storage so it never hides your GitHub updates
localStorage.removeItem('jacky_games');

let editIndex = null;

// Show Admin Button if you used the secret link
if (isOwner) {
    document.getElementById('adminBtn').classList.remove('hidden');
    const exportBtn = document.createElement('button');
    exportBtn.innerText = "💾 Export List";
    exportBtn.className = "btn-create btn-export";
    exportBtn.onclick = exportData;
    document.querySelector('.header-right').prepend(exportBtn);
}

// --- GALAXY STARFIELD (Canvas, lightweight) ---
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

// Escape user strings for safe HTML attribute/text insertion
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
        <a href="${escapeHtml(yt)}" class="tutorial-row" target="_blank" rel="noopener noreferrer" title="Watch install guide or game preview">
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
            <button type="button" class="btn-action btn-edit" onclick="openEditModal(${index})" title="Edit game">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button type="button" class="btn-action btn-delete" onclick="deleteGame(${index})" title="Delete game">
                <i class="fas fa-trash"></i> Delete
            </button>
            <button type="button" class="btn-action btn-view" onclick="openGameByIndex(${index})" title="Open download link">
                <i class="fas fa-download"></i> View
            </button>`;
    }
    return `
        <button type="button" class="btn-action btn-copy" onclick="copyLinkByIndex(${index})" title="Copy download link">
            <i class="fas fa-copy"></i> Copy
        </button>
        <button type="button" class="btn-action btn-view" onclick="openGameByIndex(${index})" title="View or download">
            <i class="fas fa-external-link-alt"></i> Download
        </button>`;
}

// --- 3. RENDER FUNCTION ---
function render() {
    const container = document.getElementById('linksContainer');
    container.innerHTML = '';

    if (games.length === 0) {
        container.innerHTML = `
            <div class="library-empty">
                <i class="fas fa-rocket"></i>
                <p>No games in the library yet.${isOwner ? ' Use <strong>+ New Link</strong> to add one.' : ''}</p>
            </div>`;
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
                <div class="actions">
                    ${buildActions(game, index)}
                </div>
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
    footer.textContent = `${games.length} games loaded · v${LIBRARY_VERSION}`;
}

// --- 4. CORE LOGIC (Publish, Edit, Delete) ---
function openEditModal(index = null) {
    editIndex = index;
    const modalTitle = document.getElementById('modalTitle');
    const publishBtn = document.getElementById('publishBtn');

    if (index !== null) {
        const game = games[index];
        document.getElementById('newTitle').value = game.title;
        document.getElementById('newFileUrl').value = game.url;
        document.getElementById('newYtUrl').value = game.yt || '';
        document.getElementById('newImgUrl').value = game.img || '';
        modalTitle.innerText = "Edit Game Info";
        publishBtn.innerText = "Save Changes";
    } else {
        document.getElementById('newTitle').value = "";
        document.getElementById('newFileUrl').value = "";
        document.getElementById('newYtUrl').value = "";
        document.getElementById('newImgUrl').value = "";
        modalTitle.innerText = "Publish New Game";
        publishBtn.innerText = "Publish";
    }
    toggleModal(true);
}

function publishGame() {
    const title = document.getElementById('newTitle').value;
    const url = document.getElementById('newFileUrl').value;
    const yt = document.getElementById('newYtUrl').value;
    const img = document.getElementById('newImgUrl').value;

    if (!title || !url) return alert("Name and Link are required!");

    const gameData = { title, url, yt, img };

    if (editIndex !== null) { games[editIndex] = gameData; }
    else { games.push(gameData); }

    render();
    toggleModal(false);
}

function deleteGame(index) {
    if (confirm("Delete this game?")) {
        games.splice(index, 1);
        render();
    }
}

// --- 5. THE EXPORT TRICK (To update the site for everyone) ---
function exportData() {
    const dataString = JSON.stringify(games, null, 2);
    const codeBlock = `let officialGames = ${dataString};`;

    navigator.clipboard.writeText(codeBlock);
    alert(
        "COPIED TO CLIPBOARD!\n\n" +
        "Update the live site for everyone:\n" +
        "1. Open script.js on GitHub → Edit\n" +
        "2. Select from \"let officialGames = [\" down to the matching \"];\"\n" +
        "3. Paste (Ctrl+V) to replace that whole block\n" +
        "4. Commit / Save on GitHub\n" +
        "5. In index.html change: var cacheBust = '3' → '4' (next time use 5, 6…)\n" +
        "6. Commit index.html, wait ~1 min, hard refresh Ctrl+Shift+R\n\n" +
        "Bottom of site should show game count + v4. If still v3, cache or wrong file on GitHub."
    );
}

// --- 6. UTILITIES ---
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
    modal.style.display = show ? 'flex' : 'none';
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

// Init
initGalaxyBackground();
render();

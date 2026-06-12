// Global State Matrix
let gamesData = [];
let isAdmin = false;
let uploadedImageBase64 = "";

// Initial Setup Activation
document.addEventListener("DOMContentLoaded", () => {
    checkAdminPrivilege();
    loadLibraryData();
    setupInterfaceEvents();
    setupDragAndDrop();
});

// Step 1: Handle URL Detection (?jacky=admin)
function checkAdminPrivilege() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('jacky') === 'admin') {
        isAdmin = true;
        document.getElementById("addLinkBtn").classList.remove("hidden");
    }
}

// Step 2: Fetch Data Safely from LocalStorage or Fallback games.json
async function loadLibraryData() {
    const localData = localStorage.getItem("gamesData");
    if (localData) {
        gamesData = JSON.parse(localData);
        renderGames();
    } else {
        try {
            const response = await fetch("games.json");
            if (response.ok) {
                gamesData = await response.json();
                localStorage.setItem("gamesData", JSON.stringify(gamesData));
                renderGames();
            }
        } catch (error) {
            console.error("Error reading backend games directory config library:", error);
        }
    }
}

// Step 3: Render Interface Layout Cards Dynamically
function renderGames(filterText = "") {
    const grid = document.getElementById("gamesGrid");
    grid.innerHTML = "";

    const filteredGames = gamesData.filter(game => 
        game.name.toLowerCase().includes(filterText.toLowerCase())
    );

    filteredGames.forEach((game, index) => {
        const card = document.createElement("div");
        card.className = "card";

        // Admin actions overlay selector logic injection
        let actionButtons = "";
        if (isAdmin) {
            actionButtons = `
                <button class="action-btn btn-edit" onclick="editGame(${index})"><i class="fas fa-edit"></i> Edit</button>
                <button class="action-btn btn-delete" onclick="deleteGame(${index})"><i class="fas fa-trash"></i> Delete</button>
            `;
        } else {
            actionButtons = `
                <button class="action-btn btn-copy" onclick="copyToClipboard('${game.downloadUrl}')"><i class="fas fa-copy"></i> Copy</button>
                <a href="${game.downloadUrl}" target="_blank" class="action-btn btn-download" style="text-decoration:none;"><i class="fas fa-download"></i> Download</a>
            `;
        }

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${game.thumbnail || 'https://via.placeholder.com/150'}" class="card-img" alt="${game.name}">
            </div>
            <div class="card-body">
                <h3 class="card-title">${game.name}</h3>
                <a href="${game.tutorialUrl || '#'}" target="_blank" class="tutorial-btn">
                    <i class="fab fa-youtube"></i> TUTORIAL / PREVIEW <span style="margin-left:auto; font-size:11px; opacity:0.6;">Click to view</span>
                </a>
                <div class="card-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Step 4: UI Interactive Events & Click Connectors
function setupInterfaceEvents() {
    // Search Processing Engine
    document.getElementById("searchBar").addEventListener("input", (e) => {
        renderGames(e.target.value);
    });

    // Opening Modal
    document.getElementById("addLinkBtn").addEventListener("click", () => {
        resetModalState();
        document.getElementById("publishModal").classList.add("active");
    });

    // Closing Modal
    document.getElementById("closeModal").addEventListener("click", () => {
        document.getElementById("publishModal").classList.remove("active");
    });

    // Save Data Pipeline Trigger
    document.getElementById("submitPublish").addEventListener("click", saveGameHandler);

    // Backup List Exporter Setup
    document.getElementById("exportBtn").addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gamesData, null, 4));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "games.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
}

// Step 5: Advanced Drag-and-Drop Image Processor Mechanics
function setupDragAndDrop() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("newThumbnailFile");

    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            processLocalFile(fileInput.files[0]);
        }
    });

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach(type => {
        dropZone.addEventListener(type, () => dropZone.classList.remove("drop-zone--over"));
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            processLocalFile(e.dataTransfer.files[0]);
        }
        dropZone.classList.remove("drop-zone--over");
    });
}

function processLocalFile(file) {
    if (!file.type.startsWith("image/")) {
        alert("Please drop a valid image file configuration!");
        return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        uploadedImageBase64 = reader.result;
        const dropZone = document.getElementById("dropZone");
        dropZone.innerHTML = `<div class="drop-zone__thumb" style="background-image: url('${uploadedImageBase64}')"></div>`;
    };
}

// Step 6: Publish & Save Execution Block
function saveGameHandler() {
    const name = document.getElementById("newGameName").value.trim();
    const downloadLink = document.getElementById("newDownloadLink").value.trim();
    const youtubeLink = document.getElementById("newYoutubeLink").value.trim();
    const urlImage = document.getElementById("newThumbnailUrl").value.trim();

    if (!name || !downloadLink) {
        alert("Please provide a Title and structural Download link.");
        return;
    }

    const targetedThumbnail = uploadedImageBase64 || urlImage || "https://via.placeholder.com/150";

    const gamePayload = {
        name: name,
        downloadUrl: downloadLink,
        tutorialUrl: youtubeLink || "#",
        thumbnail: targetedThumbnail
    };

    // Determine context: edit replace override index update or new addition creation push
    const updateIndex = document.getElementById("submitPublish").getAttribute("data-edit-index");
    if (updateIndex !== null) {
        gamesData[parseInt(updateIndex)] = gamePayload;
    } else {
        gamesData.push(gamePayload);
    }

    localStorage.setItem("gamesData", JSON.stringify(gamesData));
    renderGames();
    document.getElementById("publishModal").classList.remove("active");
    resetModalState();
}

// Helper System Functions
function resetModalState() {
    document.getElementById("newGameName").value = "";
    document.getElementById("newDownloadLink").value = "";
    document.getElementById("newYoutubeLink").value = "";
    document.getElementById("newThumbnailUrl").value = "";
    document.getElementById("newThumbnailFile").value = "";
    uploadedImageBase64 = "";
    document.getElementById("dropZone").innerHTML = `
        <span class="drop-zone__prompt"><i class="fas fa-cloud-upload-alt" style="font-size: 20px; display: block; margin-bottom: 5px;"></i>Drag & drop thumbnail or click to browse</span>
    `;
    document.getElementById("submitPublish").textContent = "Publish";
    document.getElementById("submitPublish").removeAttribute("data-edit-index");
}

window.deleteGame = function(index) {
    if (confirm(`Are you absolutely sure you want to delete ${gamesData[index].name}?`)) {
        gamesData.splice(index, 1);
        localStorage.setItem("gamesData", JSON.stringify(gamesData));
        renderGames();
    }
};

window.editGame = function(index) {
    const game = gamesData[index];
    document.getElementById("newGameName").value = game.name;
    document.getElementById("newDownloadLink").value = game.downloadUrl;
    document.getElementById("newYoutubeLink").value = game.tutorialUrl === "#" ? "" : game.tutorialUrl;
    
    if (game.thumbnail.startsWith("data:image")) {
        uploadedImageBase64 = game.thumbnail;
        document.getElementById("dropZone").innerHTML = `<div class="drop-zone__thumb" style="background-image: url('${uploadedImageBase64}')"></div>`;
        document.getElementById("newThumbnailUrl").value = "";
    } else {
        uploadedImageBase64 = "";
        document.getElementById("newThumbnailUrl").value = game.thumbnail === "https://via.placeholder.com/150" ? "" : game.thumbnail;
        document.getElementById("dropZone").innerHTML = `
            <span class="drop-zone__prompt"><i class="fas fa-cloud-upload-alt" style="font-size: 20px; display: block; margin-bottom: 5px;"></i>Drag & drop thumbnail or click to browse</span>
        `;
    }

    document.getElementById("submitPublish").textContent = "Update Options";
    document.getElementById("submitPublish").setAttribute("data-edit-index", index);
    document.getElementById("publishModal").classList.add("active");
};

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Download Link copied cleanly to your clipboard configuration database matrix tracker!");
    }).catch(err => {
        console.error("Could not trace process context element logic array copy:", err);
    });
};

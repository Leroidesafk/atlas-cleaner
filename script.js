let selectedFile;
let cleanedBlob;

const uploadUI = document.getElementById("uploadUI");
const fileName = document.getElementById("fileName");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const downloadBtn = document.getElementById("downloadBtn");
const fileButton = document.getElementById("fileButton");
const extraButtons = document.getElementById("extraButtons");
const goAtlasBtn = document.getElementById("goAtlasBtn");
const convertAgainBtn = document.getElementById("convertAgainBtn");

// UPLOAD
fileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    handleFile(fileInput.files[0]);
});

// DRAG & DROP
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    handleFile(file);
});

// ZIP CLEANER
async function handleFile(file) {
    if (!file) return;

    selectedFile = file;
    downloadName = file.name.replace(/\.zip$/i, "")
    fileName.textContent = file.name;
    uploadUI.classList.add("hidden");
    downloadBtn.classList.remove("hidden");
    downloadBtn.textContent = "Processing...";

    const zip = await JSZip.loadAsync(file);
    const newZip = new JSZip();
    const foldersToDelete = [
        "advancements/",
        "playerdata/",
        "players/",
        "stats/"
    ];
    const foldersToClean = [
        "entities/",
        "poi/",
        "region/",
        "dimensions/minecraft/overworld/entities/",
        "dimensions/minecraft/overworld/poi/",
        "dimensions/overworld/region/"
    ];

    for (const path in zip.files) {
        const entry = zip.files[path];
        if (foldersToDelete.some(f => path.startsWith(f))) continue;
        if (entry.dir) continue;
        const content = await entry.async("uint8array");
        const isInCleanFolder = foldersToClean.some(f => path.includes(f));
        if (isInCleanFolder && content.length === 0) continue;
        newZip.file(path, content);
    }

    cleanedBlob = await newZip.generateAsync({ type: "blob" });
    downloadBtn.textContent = "Download";
    convertAgainBtn.classList.remove("hidden");
}

// DOWNLOAD
downloadBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!cleanedBlob) {
        alert("Le fichier n'est pas encore prêt !");
        return;
    }

    const url = URL.createObjectURL(cleanedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${downloadName}-cleaned.zip`;
    a.click();
    URL.revokeObjectURL(url);
});

goAtlasBtn.addEventListener("click", () => {
    window.open("https://atlas.minecraft.net/", "_blank");
});

convertAgainBtn.addEventListener("click", () => {
    // reset file
    selectedFile = null;
    cleanedBlob = null;
    // reset UI
    fileInput.value = "";

    fileName.textContent = "";
    uploadUI.classList.remove("hidden");
    downloadBtn.classList.add("hidden");
    convertAgainBtn.classList.add("hidden");
    downloadBtn.textContent = "Download";
});
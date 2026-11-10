const DB_NAME = "todo-app";
const THEME_KEY = "todo-theme";
const DB_VERSION = 1;
const STORE = "todos";
const LEGACY_KEY = "todo-app-items";
const MAX_IMAGE_WIDTH = 1024;
const REMINDER_CHECK_MS = 15000;

// DOM Elements
const list = document.getElementById("todo-list");
const empty = document.getElementById("empty-message");
const form = document.getElementById("todo-form");
const text = document.getElementById("todo-input");
const textError = document.getElementById("todo-error");
const remind = document.getElementById("remind-input");
const remindError = document.getElementById("remind-error");
const cameraBtn = document.getElementById("camera-btn");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");
const imageError = document.getElementById("image-error");
const previewBox = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");
const alt = document.getElementById("alt-input");
const removeImage = document.getElementById("remove-image-btn");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const notifStatus = document.getElementById("notif-status");
const notifBtn = document.getElementById("notif-btn");
const dialog = document.getElementById("camera-dialog");
const video = document.getElementById("camera-video");
const captureBtn = document.getElementById("capture-btn");
const closeCamera = document.getElementById("camera-close-btn");
const canvas = document.getElementById("capture-canvas");
const todoStatus = document.getElementById("status");
const themeToggle = document.getElementById("theme-toogle");

// SVG Icons
const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" aria-hidden="true"><path d="M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z"/></svg>`;
const TRASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960" width="24px" aria-hidden="true"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;

// State
let todos = loadTodos();
let editingId = null;
let imageBlob = null;
let previewUrl = null;
let cameraStream = null;
let announceTimer;

// Announce screen reader messages
function announce(message) {
    todoStatus.textContent = "";
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
        todoStatus.textContent = message;
    }, 50);
}

// IndexedDB setup
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(STORE)) {
                request.result.createObjectStore(STORE, { keyPath: "id" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

const dbPromise = openDB();
dbPromise.catch(() => { });

async function withStore(mode, action) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = action(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(request ? request.result : undefined);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

const dbGetAll = () => withStore("readonly", (s) => s.getAll());
const dbPut = (todo) => withStore("readwrite", (s) => s.put(todo));
const dbDelete = (id) => withStore("readwrite", (s) => s.delete(id));

// Generate unique ID
function newId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `{Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Migrate legacy todos
async function migrateLegacyTodos() {
    let legacy;
    try {
        legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
    } catch {
        return;
    }
    if (!Array.isArray(legacy) || legacy.length === 0) return;
    for (const item of legacy) {
        await dbPut({
            id: item.id || newId(),
            text: String(item.text || ""),
            done: Boolean(item.done),
            remindAt: null,
            notified: false,
            image: null,
            imageAlt: "",
            createdAt: Date.now(),
        });
    }
    try {
        localStorage.removeItem(LEGACY_KEY);
    } catch { }
}

// Theme handling
function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    themeToggle.addEventListener("click", () => {
        const next =
            document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
            localStorage.setItem(THEME_KEY, next);
        } catch { }
        announce(`${next === "dark" ? "Dark" : "Light"} mode on`);
    });
}

function formatTime(iso) {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function toLocalInputValue(iso) {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

function srText(text) {
    const span = document.createElement("span");
    span.className = "sr-only";
    span.textContent = text;
    return span;
}

// Build todo item
function buildItem(todo) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

    const main = document.createElement("div");
    main.className = "todo-main";

    const label = document.createElement("label");
    label.className = "todo-check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `todo-${todo.id}`;
    checkbox.checked = todo.done;

    const box = document.createElement("label");
    box.className = "custom-checkbox";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = CHECK_SVG;

    const textSpan = document.createElement("span");
    textSpan.className = "todo-text";
    textSpan.textContent = todo.text;

    label.append(checkbox, box, textSpan);

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "edit-button";
    edit.textContent = "Edit";
    edit.append(srText(` todo: ${todo.text}`));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-button";
    del.setAttribute("aria-label", "Delete todo item");
    del.innerHTML = TRASH_SVG;
    del.append(srText(`Delete todo: ${todo.text}`));

    if (todo.remindAt) {
        const meta = document.createElement("p");
        meta.className = "todo-meta";
        const time = document.createElement("time");
        time.setAttribute("datetime", todo.remindAt);
        time.textContent = formatTime(todo.remindAt);
        meta.append(time);
        li.append(meta);
    }

    li.append(main, edit, del);
    return li;
}

// Load todos from storage
function loadTodos() {
    try {
        return JSON.parse(localStorage.getItem(STORE)) || [];
    } catch {
        return [];
    }
}

// Save todos to storage
function saveTodos() {
    localStorage.setItem(STORE, JSON.stringify(todos));
}

// Render todo list
function render() {
    list.innerHTML = "";
    empty.hidden = todos.length > 0;

    todos.forEach((todo) => {
        const li = buildItem(todo);
        list.append(li);
    });
}

// Reset editor form
function resetEditor() {
    editingId = null;
    text.value = "";
    text.disabled = true;
    submitBtn.disabled = true;
    textError.textContent = "";
    previewBox.hidden = true;
    imageError.textContent = "";
}

// Form submission
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const textValue = text.value.trim();
    if (!textValue) {
        textError.textContent = "Todo text is required";
        text.focus();
        return;
    }
    textError.textContent = "";

    // Validate reminder
    const remindValue = remind.value;
    if (remindValue) {
        const remindDate = new Date(remindValue);
        if (isNaN(remindDate.getTime())) {
            remindError.textContent = "Invalid date/time";
            remind.focus();
            return;
        }
    } else {
        remindError.textContent = "";
    }

    // Create todo object
    const todo = {
        id: editingId || newId(),
        text: textValue,
        done: false,
        remindAt: remind.value || null,
        notified: false,
        image: imageBlob || null,
        imageAlt: alt.value.trim(),
        createdAt: editingId
            ? todos.find((t) => t.id === editingId)?.createdAt
            : Date.now(),
    };

    // Check for duplicate
    if (!editingId && todos.find((t) => t.text === textValue)) {
        textError.textContent = "A todo with this text already exists";
        text.focus();
        return;
    }

    // Update todos
    if (editingId) {
        const index = todos.findIndex((t) => t.id === editingId);
        todos[index] = todo;
    } else {
        todos.push(todo);
    }

    saveTodos();
    render();
    resetEditor();

    // Add notification
    if (todo.remindAt) {
        notifStatus.textContent = `Reminder set for ${formatTime(todo.remindAt)}`;
        notifBtn.hidden = false;
    }
});

// Cancel button
cancelBtn.addEventListener("click", () => {
    resetEditor();
});

// Image upload button
uploadBtn.addEventListener("click", () => {
    fileInput.hidden = false;
    fileInput.value = "";
    fileInput.focus();
});

// File input change
fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    imageError.textContent = "";

    try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer]);

        // Resize if needed
        if (file.width > MAX_IMAGE_WIDTH) {
            const resized = await resizeImage(file, MAX_IMAGE_WIDTH);
            imageBlob = resized;
        } else {
            imageBlob = blob;
        }

        previewUrl = URL.createObjectURL(imageBlob);
        previewImg.src = previewUrl;
        previewBox.hidden = false;
        previewImg.alt = alt.value.trim() || "Uploaded image";
    } catch (err) {
        imageError.textContent = "Failed to load image";
    }
});

// Remove image
removeImage.addEventListener("click", () => {
    imageBlob = null;
    previewUrl = null;
    previewBox.hidden = true;
    imageError.textContent = "";
});

// Camera button
cameraBtn.addEventListener("click", async () => {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
        });
        video.srcObject = cameraStream;
        dialog.showModal();
    } catch (err) {
        alert("Could not access camera");
    }
});

// Close camera
closeCamera.addEventListener("click", () => {
    dialog.close();
    stopCamera();
});

// Capture photo
captureBtn.addEventListener("click", async () => {
    if (!video.srcObject) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capture = canvas.toDataURL("image/png");
    const blob = await fetch(capture).then((r) => r.blob());

    // Resize if needed
    if (canvas.width > MAX_IMAGE_WIDTH) {
        const resized = await resizeImage(blob, MAX_IMAGE_WIDTH);
        imageBlob = resized;
    } else {
        imageBlob = blob;
    }

    previewUrl = URL.createObjectURL(imageBlob);
    previewImg.src = previewUrl;
    previewBox.hidden = false;
    previewImg.alt = alt.value.trim() || "Captured photo";

    dialog.close();
    stopCamera();
});

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
    }
}

// Resize image function
function resizeImage(file, maxWidth) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toBlob(resolve, "image/png"));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// Checkbox change
list.addEventListener("change", (e) => {
    if (e.target.type !== "checkbox") return;
    const id = e.target.closest(".todo-item").dataset.id;
    const todo = todos.find((t) => t.id === id);
    todo.done = e.target.checked;
    saveTodos();
});

// Click handlers for edit/delete
list.addEventListener("click", (e) => {
    const item = e.target.closest(".todo-item");
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.closest(".delete-button")) {
        todos = todos.filter((t) => t.id !== id);
        saveTodos();
        render();
        if (editingId === id) resetEditor();
    } else if (e.target.closest(".edit-button")) {
        const todo = todos.find((t) => t.id === id);
        editingId = id;
        text.disabled = false;
        submitBtn.disabled = false;
        text.value = todo.text;
        text.focus();
    }
});

notifBtn.addEventListener("click", () => {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
});

migrateLegacyTodos();
applyTheme(localStorage.getItem(THEME_KEY) || "light");
render();

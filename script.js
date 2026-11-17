const $ = (id) => document.getElementById(id);
const el = (t, p, ...k) => {
    const e = Object.assign(document.createElement(t), p);
    e.append(...k);
    return e;
};
const say = (m) => {
    $("status").textContent = "";
    setTimeout(() => ($("status").textContent = m), 50);
};
const fmt = (s) =>
    new Date(s).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });

let todos = [],
    editId = null,
    img = null,
    imgUrl = null,
    urls = [],
    stream = null,
    sw = null;

// ---- IndexedDB (todo data) ----
const db = new Promise((ok, no) => {
    const r = indexedDB.open("todo-app", 1);
    r.onupgradeneeded = () =>
        r.result.createObjectStore("todos", { keyPath: "id" });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
});
const run = async (mode, fn) => {
    const t = (await db).transaction("todos", mode),
        r = fn(t.objectStore("todos"));
    return new Promise((ok, no) => {
        t.oncomplete = () => ok(r.result);
        t.onerror = () => no(t.error);
    });
};
const save = (t) =>
    run("readwrite", (s) => s.put(t)).catch(() => say("Could not save"));

// ---- Theme (localStorage preference) ----
const setTheme = (t) => {
    document.documentElement.dataset.theme = t;
    $("theme-toggle").setAttribute("aria-pressed", t === "dark");
};
$("theme-toggle").onclick = () => {
    const t =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(t);
    try {
        localStorage.setItem("todo-theme", t);
    } catch { }
    say(`${t} mode on`);
};

// ---- Render ----
function item(t) {
    const cb = el("input", {
        type: "checkbox",
        id: "c-" + t.id,
        checked: t.done,
    });
    cb.onchange = () => {
        t.done = cb.checked;
        save(t);
    };
    const edit = el(
        "button",
        {
            type: "button",
            className: "btn btn-secondary",
            ariaLabel: "Edit " + t.text,
            onclick: () => startEdit(t),
        },
        "Edit",
    );
    const del = el(
        "button",
        {
            type: "button",
            className: "btn btn-secondary",
            ariaLabel: "Delete " + t.text,
        },
        "Delete",
    );
    del.onclick = async () => {
        await run("readwrite", (s) => s.delete(t.id));
        todos = todos.filter((x) => x !== t);
        if (editId === t.id) reset();
        render();
        say("Todo deleted");
    };
    const li = el(
        "li",
        { className: "todo-item" },
        cb,
        el("label", { htmlFor: cb.id }, t.text),
        edit,
        del,
    );
    if (t.remindAt)
        li.append(
            el(
                "time",
                { className: "meta", dateTime: t.remindAt },
                "Reminder: " + fmt(t.remindAt),
            ),
        );
    if (t.image) {
        const u = URL.createObjectURL(t.image);
        urls.push(u);
        li.append(el("img", { src: u, alt: t.alt }));
    }
    return li;
}
function render() {
    urls.forEach((u) => URL.revokeObjectURL(u));
    urls = [];
    $("todo-list").replaceChildren(...todos.map(item));
    $("empty-message").hidden = todos.length > 0;
}

// ---- Form ----
function reset() {
    $("todo-form").reset();
    clearImg();
    editId = null;
    $("todo-error").textContent = $("remind-error").textContent = "";
    $("form-heading").textContent = "Add todo";
    $("submit-btn").textContent = "Add todo";
    $("cancel-btn").hidden = true;
}
function startEdit(t) {
    reset();
    editId = t.id;
    $("todo-input").value = t.text;
    $("remind-input").value = t.remindAt || "";
    if (t.image) {
        setImg(t.image);
        $("alt-input").value = t.alt;
    }
    $("form-heading").textContent = "Edit todo";
    $("submit-btn").textContent = "Save todo";
    $("cancel-btn").hidden = false;
    $("todo-input").focus();
}
$("cancel-btn").onclick = reset;
$("todo-form").onsubmit = async (e) => {
    e.preventDefault();
    const text = $("todo-input").value.trim(),
        when = $("remind-input").value;
    $("todo-error").textContent = text ? "" : "Todo text is required";
    $("remind-error").textContent =
        when && new Date(when) < Date.now() ? "Pick a future time" : "";
    if (!text) return $("todo-input").focus();
    if ($("remind-error").textContent) return $("remind-input").focus();
    const old = todos.find((x) => x.id === editId);
    const t = {
        id: editId || crypto.randomUUID(),
        text,
        done: old?.done || false,
        remindAt: when || null,
        notified: false,
        image: img,
        alt: $("alt-input").value.trim(),
        createdAt: old?.createdAt || Date.now(),
    };
    await save(t);
    todos = old ? todos.map((x) => (x === old ? t : x)) : [...todos, t];
    reset();
    render();
    say(old ? "Todo updated" : "Todo added");
    $("todo-input").focus();
};

// ---- Image: upload + Media Capture API ----
async function shrink(src) {
    // File/Blob/video -> JPEG blob, max 1024px wide
    const b = await createImageBitmap(src),
        s = Math.min(1, 1024 / b.width),
        c = $("capture-canvas");
    c.width = b.width * s;
    c.height = b.height * s;
    c.getContext("2d").drawImage(b, 0, 0, c.width, c.height);
    return new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.85));
}
function setImg(b) {
    clearImg();
    img = b;
    imgUrl = URL.createObjectURL(b);
    $("preview-img").src = imgUrl;
    $("image-preview").hidden = false;
}
function clearImg() {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    img = imgUrl = null;
    $("image-preview").hidden = true;
    $("file-input").value = "";
    $("image-error").textContent = "";
}
$("remove-image-btn").onclick = () => {
    clearImg();
    $("alt-input").value = "";
    say("Image removed");
    $("upload-btn").focus();
};
$("upload-btn").onclick = () => $("file-input").click();
$("file-input").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
        setImg(await shrink(f));
        $("alt-input").focus();
    } catch {
        $("image-error").textContent = "Could not load image";
    }
};
$("camera-btn").onclick = async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        $("camera-video").srcObject = stream;
        $("camera-dialog").showModal();
    } catch {
        $("image-error").textContent = "Could not access camera";
    }
};
$("camera-dialog").onclose = () => {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    $("camera-btn").focus();
};
$("camera-close-btn").onclick = () => $("camera-dialog").close();
$("capture-btn").onclick = async () => {
    setImg(await shrink($("camera-video")));
    $("camera-dialog").close();
    $("alt-input").focus();
};

// ---- Notifications + reminders (Service Worker) ----
function notifUI() {
    const p = "Notification" in window ? Notification.permission : "none";
    $("notif-btn").hidden = p !== "default";
    $("notif-status").textContent = {
        granted: "Notifications are on.",
        denied: "Notifications are blocked. Allow them in browser settings.",
        default: "Enable notifications to get reminders.",
        none: "Notifications are not supported in this browser.",
    }[p];
}
$("notif-btn").onclick = async () => {
    await Notification.requestPermission();
    notifUI();
};
setInterval(async () => {
    for (const t of todos) {
        if (
            !t.remindAt ||
            t.notified ||
            t.done ||
            new Date(t.remindAt) > Date.now()
        )
            continue;
        t.notified = true;
        await save(t);
        say("Reminder: " + t.text);
        if ("Notification" in window && Notification.permission === "granted") {
            const o = { body: t.text, tag: t.id };
            sw?.active
                ? sw.showNotification("Todo reminder", o)
                : new Notification("Todo reminder", o);
        }
    }
}, 15000);

// ---- Init ----
(async () => {
    setTheme(document.documentElement.dataset.theme);
    notifUI();
    if ("serviceWorker" in navigator)
        sw = await navigator.serviceWorker.register("sw.js").catch(() => null);
    try {
        todos = (await run("readonly", (s) => s.getAll())).sort(
            (a, b) => a.createdAt - b.createdAt,
        );
    } catch {
        $("todo-error").textContent = "Storage is unavailable";
    }
    render();
})();

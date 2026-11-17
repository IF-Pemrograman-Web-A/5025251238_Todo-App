const $ = (s) => document.querySelector(s);
const say = (m) => {
    const s = $("#status");
    s.textContent = "";
    setTimeout(() => (s.textContent = m), 50);
};
const root = document.documentElement;

const tb = $("#theme-toggle");
tb.setAttribute("aria-pressed", root.dataset.theme === "dark");
tb.onclick = () => {
    const t = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = t;
    tb.setAttribute("aria-pressed", t === "dark");
    try {
        localStorage.setItem("todo-theme", t);
    } catch { }
    say(`${t} mode on`);
};

const swp =
    "serviceWorker" in navigator
        ? navigator.serviceWorker.register("sw.js").catch(() => null)
        : Promise.resolve(null);
const nb = $("#notif-btn");
if (!("Notification" in window) || Notification.permission !== "default")
    nb.hidden = true;
nb.onclick = async () => {
    await Notification.requestPermission();
    nb.hidden = true;
};

setInterval(async () => {
    for (const li of document.querySelectorAll("li[data-remind]")) {
        const key = `n-${li.dataset.id}-${li.dataset.remind}`;
        let seen;
        try {
            seen = localStorage.getItem(key);
        } catch { }
        if (seen || new Date(li.dataset.remind) > Date.now()) continue;
        try {
            localStorage.setItem(key, "1");
        } catch { }
        say("Reminder: " + li.dataset.text);
        if ("Notification" in window && Notification.permission === "granted") {
            const reg = await swp,
                o = { body: li.dataset.text, tag: key };
            reg?.active
                ? reg.showNotification("Todo reminder", o)
                : new Notification("Todo reminder", o);
        }
    }
}, 15000);

// install button (PWA)
let ip;
const ib = $("#install-btn");
addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    ip = e;
    ib.hidden = false;
});
ib.onclick = async () => {
    ip.prompt();
    await ip.userChoice;
    ip = null;
    ib.hidden = true;
};
addEventListener("appinstalled", () => {
    ib.hidden = true;
    say("App installed");
});

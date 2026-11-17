const C = "todo-v4",
    SHELL = [
        "offline.html",
        "style.css",
        "script.js",
        "manifest.json",
        "icons/icon-192.png",
        "icons/icon-512.png",
    ];

self.oninstall = (e) => {
    e.waitUntil(caches.open(C).then((c) => c.addAll(SHELL)));
    self.skipWaiting();
};

self.onactivate = (e) =>
    e.waitUntil(
        caches
            .keys()
            .then((k) =>
                Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x))),
            )
            .then(() => clients.claim()),
    );

const save = (req, res) => {
    if (res.ok) caches.open(C).then((c) => c.put(req, res.clone()));
    return res;
};

self.onfetch = (e) => {
    const r = e.request,
        u = new URL(r.url);
    if (r.method !== "GET" || u.origin !== location.origin) return;

    if (r.mode === "navigate")
        e.respondWith(
            fetch(r)
                .then((res) => save(r, res))
                .catch(() =>
                    caches.match(r).then((m) => m || caches.match("offline.html")),
                ),
        );
    else if (u.pathname.includes("/uploads/"))
        e.respondWith(
            caches.match(r).then((m) => m || fetch(r).then((res) => save(r, res))),
        );
    else if (SHELL.some((a) => u.pathname.endsWith(a)))
        e.respondWith(
            caches.match(r).then((m) => {
                const n = fetch(r)
                    .then((res) => save(r, res))
                    .catch(() => m);
                return m || n;
            }),
        );
};

self.onnotificationclick = (e) => {
    e.notification.close();
    e.waitUntil(
        clients
            .matchAll({ type: "window" })
            .then((l) => (l[0] ? l[0].focus() : clients.openWindow("./"))),
    );
};

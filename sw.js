const C = "todo-v3",
    A = ["style.css", "script.js"];

self.oninstall = (e) => {
    e.waitUntil(
        caches.open(C).then((c) => Promise.allSettled(A.map((u) => c.add(u)))),
    );
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

self.onfetch = (e) => {
    const p = new URL(e.request.url).pathname;
    if (e.request.method === "GET" && A.some((a) => p.endsWith(a)))
        e.respondWith(
            fetch(e.request)
                .then((r) => {
                    caches.open(C).then((c) => c.put(e.request, r.clone()));
                    return r;
                })
                .catch(() => caches.match(e.request)),
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

const C = "todo-v2",
    A = ["./", "index.html", "style.css", "script.js"];

self.oninstall = (e) => {
    e.waitUntil(caches.open(C).then((c) => c.addAll(A)));
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
    if (e.request.method === "GET")
        e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
};

self.onnotificationclick = (e) => {
    e.notification.close();
    e.waitUntil(
        clients
            .matchAll({ type: "window" })
            .then((l) => (l[0] ? l[0].focus() : clients.openWindow("./"))),
    );
};

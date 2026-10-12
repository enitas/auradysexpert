/*! coi-serviceworker v0.1.7 - Guido Zuidhof, MIT License */
let coi = {
    shouldRegister: () => true,
    shouldDeregister: () => false,
    coepCredentialless: () => false,
    doCoep: () => true,
    quiet: false,
    ...window.coi
};

if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("fetch", (event) => {
        const request = event.request;
        if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;

        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.status === 0) return response;

                    const newHeaders = new Headers(response.headers);
                    newHeaders.set("Cross-Origin-Embedder-Policy", coi.coepCredentialless() ? "credentialless" : "require-corp");
                    if (coi.doCoep()) {
                        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                    }

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    });
                })
                .catch((e) => console.error(e))
        );
    });
} else {
    (() => {
        const n = window.navigator;
        if (n.serviceWorker && coi.shouldRegister()) {
            n.serviceWorker.register(window.document.currentScript.src).then((registration) => {
                !coi.quiet && console.log("coi-serviceworker: Service Worker enregistré.");

                registration.addEventListener("updatefound", () => {
                    !coi.quiet && console.log("coi-serviceworker: Rechargement pour activer la Cross-Origin Isolation...");
                    window.location.reload();
                });
            }, (e) => {
                !coi.quiet && console.error("coi-serviceworker: Échec d'enregistrement :", e);
            });

            if (coi.shouldDeregister()) {
                n.serviceWorker.getRegistrations().then((registrations) => {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                });
            }
        }
    })();
}

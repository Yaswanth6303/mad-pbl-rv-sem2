// Register service worker. Path resolves the SW at site root so it controls
// every page under the scope.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swPath = window.location.pathname.includes("/html/")
      ? "../service-worker.js"
      : "service-worker.js";
    const swScope = window.location.pathname.includes("/html/") ? "../" : "./";
    navigator.serviceWorker.register(swPath, { scope: swScope })
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.warn("SW registration failed:", err));
  });
}

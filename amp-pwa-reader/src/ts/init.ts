////import { ShadowReader } from "./classes";

    // Create app singleton as global
    window.shadowReader = new ShadowReader();

// Initialize fully when DOM is ready
window.document.addEventListener('DOMContentLoaded', function () {


    // initialize the entire app
    window.shadowReader.init();

    // install the Service Worker
    if ('serviceWorker' in navigator) {
        window.navigator.serviceWorker.register('/sw.js');
    }
});
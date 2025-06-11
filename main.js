import { fetchContent } from './contentLoader.js';
import { initializeDesktop } from './desktop.js';

// This is the entry point of the entire application
document.addEventListener('DOMContentLoaded', () => {
    // 1. First, fetch the site content from the JSON file.
    fetchContent().then(() => {
        // 2. Once the content is loaded, initialize the entire desktop environment.
        initializeDesktop();
    });
});
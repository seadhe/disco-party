/* =========================================================================
   Entry Point: Imports CSS, sets up centralized coordinated state,
   orchestrates animation loops, and boots independent modules.
   ========================================================================= */

// Import Vite Compiled Stylesheets
import './css/base.css';
import './css/glass.css';
import './css/layouts.css';
import './css/modal.css';

// Import JS Engine Modules
import { initWebGL, selectPreset, updateWebGL } from './js/webglEngine.js';
import { initParallax, updateUIParallax } from './js/parallax.js';
import { initBudget } from './js/budgetCalc.js';
import { initUI } from './js/uiControls.js';
import { initLoader } from './js/loader.js';

// Central Coordinated Shared State Object
export const state = {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    targetMouseX: window.innerWidth / 2,
    targetMouseY: window.innerHeight / 2,
    scrollY: 0,
    targetScrollY: 0,
    uiParallaxX: 0,
    uiParallaxY: 0,
    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2,
    targetCursorX: window.innerWidth / 2,
    targetCursorY: window.innerHeight / 2,
};

// Global Mouse Movement Tracking Coordinates
window.addEventListener('mousemove', (e) => {
    state.targetCursorX = e.clientX;
    state.targetCursorY = e.clientY;
    state.targetMouseX = e.clientX;
    state.targetMouseY = window.innerHeight - e.clientY; // Invert Y for WebGL
});

// Global Scroll Tracking Positions
window.addEventListener('scroll', () => {
    state.targetScrollY = window.scrollY;
});

// Custom Interactive Cursor Loop
const cursor = document.getElementById('custom-cursor');
function updateCursor() {
    state.cursorX += (state.targetCursorX - state.cursorX) * 0.15;
    state.cursorY += (state.targetCursorY - state.cursorY) * 0.15;
    if (cursor) {
        cursor.style.left = `${state.cursorX}px`;
        cursor.style.top = `${state.cursorY}px`;
    }
    requestAnimationFrame(updateCursor);
}

// Master Rendering draw animation cycle
const startTime = performance.now();
function draw(timestamp) {
    // Interpolate positions to keep coordinate moves smoothed
    state.mouseX += (state.targetMouseX - state.mouseX) * 0.08;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.08;
    state.scrollY += (state.targetScrollY - state.scrollY) * 0.1;

    // Smooth Spatial UI Parallax Layers percentage calculations
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Global percent offset from viewport center (-1.0 to 1.0)
    const percentX = (state.targetCursorX - centerX) / centerX;
    const percentY = (state.targetCursorY - centerY) / centerY; 

    state.uiParallaxX += (percentX - state.uiParallaxX) * 0.08;
    state.uiParallaxY += (percentY - state.uiParallaxY) * 0.08;

    // Apply layered spatial translate in the opposite direction of cursor coordinates
    updateUIParallax(state.uiParallaxX, state.uiParallaxY);

    // Call WebGL Engine draw calls
    const timeSeconds = (timestamp - startTime) * 0.001;
    updateWebGL(timeSeconds, state.mouseX, state.mouseY, state.scrollY, window.innerWidth, window.innerHeight);

    requestAnimationFrame(draw);
}

// Boot up all modular subsystems upon DOM Readiness
window.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('glcanvas');
    if (canvasElement) {
        initWebGL(canvasElement);
    }
    
    // Boot modules
    initParallax();
    initBudget();
    initUI((presetName) => {
        selectPreset(presetName);
    });

    // Start coordinate calculations cycles
    updateCursor();
    requestAnimationFrame(draw);
    
    // Reveal custom cursor and fade in unstyled elements after loading is complete (delegated to loader)
    initLoader(() => {
        console.log('Antigravity // Disco Elysium party modular system successfully initialized.');
    });
});

/* =========================================================================
   Parallax Module: Handles technical corner ticks injections,
   3D tilt interactive sways, and widescreen multi-depth layered mouse parallax.
   ========================================================================= */

import { state } from '../main.js';

// Helper function to set up interactive 3D Tilt Card & Mouse sway effects
function setupTilt(el, isLogo = false) {
    let rotX = 0, rotY = 0;
    let targetRotX = 0, targetRotY = 0;

    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);

        const width = rect.width;
        const height = rect.height;

        // Max angle limit
        let maxAngle = 9;
        if (isLogo) {
            maxAngle = 7; // slightly gentler sway for the main logo
        } else if (el.classList.contains('dossier-box')) {
            maxAngle = 4;
        }

        targetRotX = -((y - height / 2) / height) * maxAngle;
        targetRotY = ((x - width / 2) / width) * maxAngle;
    });

    el.addEventListener('mouseleave', () => {
        targetRotX = 0;
        targetRotY = 0;
        el.style.setProperty('--mouse-x', '0px');
        el.style.setProperty('--mouse-y', '0px');
    });

    function animateTilt() {
        rotX += (targetRotX - rotX) * 0.12;
        rotY += (targetRotY - rotY) * 0.12;

        // Multi-depth opposite floating coordinate parallax
        let depth = 22;
        if (isLogo) {
            depth = 8; // gentle depth for the logo, keeping it stable since hero-title also shifts
        } else if (el.classList.contains('arch')) {
            depth = 28;
        } else if (el.classList.contains('tcard')) {
            depth = 32;
        } else if (el.classList.contains('tix')) {
            depth = 36;
        }

        // Slow organic drift using offset sine waves
        const time = performance.now() * 0.001;
        const phaseX = time * 0.8 + el.offsetTop * 0.002;
        const phaseY = time * 0.7 + el.offsetLeft * 0.002;
        
        const driftOffsetX = Math.sin(phaseX) * 6;
        const driftOffsetY = Math.cos(phaseY) * 6;

        // Volumetric organic wobble rotation to feel like floating slabs of glass
        const wobbleRotX = Math.sin(phaseX * 0.5) * 0.35;
        const wobbleRotY = Math.cos(phaseY * 0.5) * 0.35;
        const wobbleRotZ = Math.sin(phaseX * 0.3) * 0.25;

        // Extract uiParallax coordinates from shared entry state
        const driftX = -state.uiParallaxX * depth + driftOffsetX;
        const driftY = -state.uiParallaxY * depth + driftOffsetY;

        el.style.transform = `translate3d(${driftX}px, ${driftY}px, 0) perspective(1000px) rotateX(${rotX + wobbleRotX}deg) rotateY(${rotY + wobbleRotY}deg) rotateZ(${wobbleRotZ}deg)`;
        requestAnimationFrame(animateTilt);
    }
    animateTilt();
}

// Auto-inject technical constructivist corner markers dynamically into floating consoles
export function initParallax() {
    const tiltElements = document.querySelectorAll('.arch, .tcard, .tix, .dossier-box, .prog-stat');

    tiltElements.forEach(el => {
        el.classList.add('tech-frame');
        ['tl', 'tr', 'bl', 'br'].forEach(corner => {
            const marker = document.createElement('div');
            marker.className = `tech-corner ${corner}`;
            el.appendChild(marker);
        });

        // Set up standard 3D Tilt Card sway
        setupTilt(el, false);
    });

    // Set up 3D Tilt Card sway for the borderless & backgroundless Hero logo
    const logoTiltElement = document.querySelector('.hero-logo-tilt');
    if (logoTiltElement) {
        setupTilt(logoTiltElement, true);
    }
}

// Layered Spatial Parallax in the opposite direction of the cursor coordinates
export function updateUIParallax(uiParallaxX, uiParallaxY) {
    // 1. Section Titles (deepest layer)
    document.querySelectorAll('.section-title').forEach(el => {
        const shiftX = -uiParallaxX * 12;
        const shiftY = -uiParallaxY * 12;
        el.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
    });

    // 2. Section Eyebrows & Leads (middle layer)
    document.querySelectorAll('.section-eyebrow, .section-lead').forEach(el => {
        const shiftX = -uiParallaxX * 20;
        const shiftY = -uiParallaxY * 20;
        el.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
    });

    // 3. Dossier text blocks (close layer)
    document.querySelectorAll('.body-mono').forEach(el => {
        const shiftX = -uiParallaxX * 24;
        const shiftY = -uiParallaxY * 24;
        el.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
    });

    // 4. Hero elements layered parallax
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.transform = `translate3d(${-uiParallaxX * 15}px, ${-uiParallaxY * 15}px, 0)`;
    }
    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
        heroSub.style.transform = `translate3d(${-uiParallaxX * 22}px, ${-uiParallaxY * 22}px, 0)`;
    }
    const heroMeta = document.querySelector('.hero-meta');
    if (heroMeta) {
        heroMeta.style.transform = `translate3d(${-uiParallaxX * 26}px, ${-uiParallaxY * 26}px, 0)`;
    }
    const heroCta = document.querySelector('.hero-cta');
    if (heroCta) {
        heroCta.style.transform = `translate3d(${-uiParallaxX * 30}px, ${-uiParallaxY * 30}px, 0)`;
    }
    const discoStageEl = document.querySelector('.discoball-stage');
    if (discoStageEl) {
        discoStageEl.style.transform = `translate3d(${-uiParallaxX * 12}px, ${-uiParallaxY * 12}px, 0)`;
    }
}

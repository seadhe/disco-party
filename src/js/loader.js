/* =========================================================================
   Intro Loader Module: Coordinates typewriter log printing, double-six dice
   rolling animation, full-screen flash transition, and content reveal.
   ========================================================================= */

export function initLoader(onComplete) {
    const loader = document.getElementById('loader');
    const ltxt = document.getElementById('l-text');
    const flash = document.getElementById('flash');
    const appContainer = document.getElementById('app-container');
    const cursor = document.getElementById('custom-cursor');

    if (!loader || !ltxt || !flash) {
        console.warn('Loader elements not found. Skipping intro loader.');
        if (appContainer) appContainer.style.opacity = '1';
        if (cursor) cursor.style.display = 'flex';
        if (onComplete) onComplete();
        return;
    }

    // Disable scrolling during intro load
    document.body.style.overflow = 'hidden';

    const lines = [
        '> ПРОВЕРКА: ВНУТРЕННЯЯ ИМПЕРИЯ. КРИТИЧЕСКИЙ УСПЕХ.',
        '> ПОДКЛЮЧЕНИЕ К РЕВАШОЛЮ...'
    ];

    // Typewriter effect
    function type(lines, cb) {
        let li = 0; // line index
        let ci = 0; // char index
        let buf = '';

        function tick() {
            if (li >= lines.length) {
                cb();
                return;
            }
            if (ci < lines[li].length) {
                buf += lines[li][ci++];
                ltxt.textContent = buf;
                // Add minor random speed variance for organic typewriter feel
                setTimeout(tick, 22 + Math.random() * 20);
            } else {
                buf += '\n';
                ltxt.style.whiteSpace = 'pre-wrap';
                li++;
                ci = 0;
                setTimeout(tick, 380);
            }
        }
        tick();
    }

    // Loader dismissal sequence
    function dismiss() {
        // 1. Flash screen
        flash.style.opacity = '1';

        setTimeout(() => {
            // 2. Fade out flash
            flash.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            flash.style.opacity = '0';

            // 3. Fade out loader background
            loader.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            loader.style.opacity = '0';

            // 4. Reveal app container and custom cursor
            if (appContainer) {
                appContainer.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                appContainer.style.opacity = '1';
            }
            if (cursor) {
                cursor.style.display = 'flex';
            }

            setTimeout(() => {
                // Remove elements from layout flow, restore scroll
                loader.style.display = 'none';
                flash.style.display = 'none';
                document.body.style.overflow = '';

                // Trigger callback
                if (onComplete) onComplete();
            }, 420);
        }, 200);
    }

    // Start typewriter sequence after initial delay to let dice roll play
    setTimeout(() => {
        type(lines, () => {
            setTimeout(dismiss, 280);
        });
    }, 1200);
}

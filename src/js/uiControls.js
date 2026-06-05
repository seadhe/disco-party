/* =========================================================================
   UI Controls Module: Orchestrates Lenis scrolling, custom typewriter
   observers, checkout modal triggers, custom cursors, and skill dialogue toasts.
   ========================================================================= */

// Centralized speech dialogues database
export const skillVoices = {
    'concept': {
        skill: 'ЭНЦИКЛОПЕДИЯ',
        text: 'Это Мартинез. Гниющий портовый тупик Ревашоля, застрявший где-то между эхом диско-эпохи и холодом Бледности.',
        color: '#4a9aff'
    },
    'thoughts': {
        skill: 'ВНУТРЕННЯЯ ИМПЕРИЯ',
        text: 'Голоса шепчут о неизбежном. Это не бред. Это просто твоё подсознание раскрашивает серость в неоновые тона.',
        color: '#9b3cff'
    },
    'dress': {
        skill: 'СУМРАК',
        text: 'Вектор костюма задан. Кожаная куртка пахнет сигаретным дымом. Ты готов совершить свой первый нелепый жест.',
        color: '#ffb02e'
    },
    'bar': {
        skill: 'ЭЛЕКТРОХИМИЯ',
        text: 'Жидкий резерв ждёт. Налей ещё один шот «Серости». И сигарету. Две сигареты. Давай повеселимся, коп!',
        color: '#ff1f8f'
    },
    'budget': {
        skill: 'ЛОГИКА',
        text: 'Цифры сходятся. Впервые в твоей практике. Вклад организаторов покрывает треть. Это хорошая детективная сделка.',
        color: '#4a9aff'
    },
    'progress': {
        skill: 'ЭСПРИ ДЕ КОРПС',
        text: 'Детективы уже сдают векселя. Твоё плечо должно быть рядом с ними на этой вечеринке. Не отставай.',
        color: '#4a9aff'
    },
    'teasers': {
        skill: 'ВИЗУАЛЬНЫЙ РАСЧЁТ',
        text: 'На сукне казино — следы костей, в воздухе — запах азарта. Следы ведут в Церковь. Вероятность успеха высока.',
        color: '#4a9aff'
    },
    'tickets': {
        skill: 'ДРАМА',
        text: 'Сир, этот пропуск — не бумажка. Это билет в первый ряд величайшего фарса этой ночи! Берите его без сомнений!',
        color: '#9b3cff'
    },
    'brief': {
        skill: 'ЭНЦИКЛОПЕДИЯ',
        text: 'Введение для гражданских. Мартинез суров, но базовые протоколы помогут выжить на улицах Ревашоля. Читай внимательно.',
        color: '#4a9aff'
    },
    'reals': {
        skill: 'ЛОГИКА',
        text: 'Настоящие рубли превращаются в реалы. Простая математическая трансляция ценности. Трать с умом.',
        color: '#4a9aff'
    },
    'faq': {
        skill: 'СИЛА ВОЛИ',
        text: 'Вопросы заданы, протоколы заполнены. Полная ясность укрепляет твою решимость идти до конца.',
        color: '#9b3cff'
    },
    'crew': {
        skill: 'ЭСПРИ ДЕ КОРПС',
        text: 'Они стоят за этим делом. Твои напарники по оперативной группе RCM-2026. Доверяй им.',
        color: '#4a9aff'
    }
};

let toasterContainer = null;

export function initUI(onPresetChange) {
    // 1. Initialize Lenis Smooth Scroll via global CDN namespace
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        console.log('Lenis smooth scroll engine initialized successfully.');
    } else {
        console.warn('Lenis scroll library not found. Smooth scrolling fallback applied.');
    }

    // 2. Telemetry Typewriter for Hero Eyebrow on document load
    const heroEyebrow = document.querySelector('.hero-eyebrow');
    if (heroEyebrow) {
        const text = heroEyebrow.textContent;
        heroEyebrow.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                heroEyebrow.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, 50);
    }

    // 3. One-Time Scroll Reveal Typewriter Observer for Eyebrows
    const eyebrowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const eyebrow = entry.target.querySelector('.section-eyebrow');
                if (eyebrow && !eyebrow.dataset.typed) {
                    eyebrow.dataset.typed = "true";
                    const text = eyebrow.textContent;
                    eyebrow.textContent = '';
                    eyebrow.style.visibility = 'visible';
                    let i = 0;
                    const timer = setInterval(() => {
                        if (i < text.length) {
                            eyebrow.textContent += text.charAt(i);
                            i++;
                        } else {
                            clearInterval(timer);
                        }
                    }, 24);
                }
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });

    document.querySelectorAll('.section-card').forEach(card => {
        const eyebrow = card.querySelector('.section-eyebrow');
        if (eyebrow) {
            eyebrow.style.visibility = 'hidden';
            eyebrowObserver.observe(card);
        }
    });

    // 4. One-Time Typewriter scroll reveal observer for Cards (.arch, .tcard)
    const cardTypewriterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                
                const descEl = card.querySelector('.arch-desc');
                if (descEl && !descEl.dataset.typed) {
                    descEl.dataset.typed = "true";
                    const text = card.dataset.desc || descEl.textContent;
                    descEl.innerHTML = '';
                    descEl.style.visibility = 'visible';
                    descEl.classList.add('typing');
                    let i = 0;
                    const timer = setInterval(() => {
                        if (i < text.length) {
                            descEl.innerHTML += text.charAt(i);
                            i++;
                        } else {
                            clearInterval(timer);
                            descEl.classList.remove('typing');
                        }
                    }, 24);
                }

                const subEl = card.querySelector('.tsub');
                if (subEl && !subEl.dataset.typed) {
                    subEl.dataset.typed = "true";
                    const text = card.dataset.sub || subEl.textContent;
                    subEl.innerHTML = '';
                    subEl.style.visibility = 'visible';
                    subEl.classList.add('typing');
                    let i = 0;
                    const timer = setInterval(() => {
                        if (i < text.length) {
                            subEl.innerHTML += text.charAt(i);
                            i++;
                        } else {
                            clearInterval(timer);
                            subEl.classList.remove('typing');
                        }
                    }, 30);
                }

                cardTypewriterObserver.unobserve(card);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -10px 0px" });

    document.querySelectorAll('.arch').forEach(card => {
        const descEl = card.querySelector('.arch-desc');
        if (descEl) {
            card.dataset.desc = descEl.textContent;
            descEl.style.visibility = 'hidden';
            cardTypewriterObserver.observe(card);
        }
    });

    // Evidence Card mobile tap / keyboard reveal toggle
    document.querySelectorAll('.evidence-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.evidence-card').forEach(c => {
                if (c !== card) c.classList.remove('open');
            });
            card.classList.toggle('open');
        });
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.querySelectorAll('.evidence-card').forEach(c => {
                    if (c !== card) c.classList.remove('open');
                });
                card.classList.toggle('open');
            }
        });
    });

    // 5. Custom Cursor hover expand swell events attachment
    const hoverTriggers = document.querySelectorAll('.hover-trigger, .arch, .evidence-card, .tix, .dossier-box, .prog-stat, button, a, input, textarea');
    hoverTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        trigger.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // 6. Dialogue Toaster (Disabled by request)
    // 7. Scroll Presets Transitions Observers
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                
                // Invoke callback to transition WebGL shader background preset
                if (id === 'hero-section') {
                    onPresetChange('disco');
                } else if (id === 'concept' || id === 'thoughts' || id === 'brief') {
                    onPresetChange('cyberpunk');
                } else if (id === 'manifesto') {
                    onPresetChange('obsidian');
                } else if (id === 'dress' || id === 'bar' || id === 'reals') {
                    onPresetChange('obsidian');
                } else if (id === 'budget' || id === 'progress') {
                    onPresetChange('gold');
                } else if (id === 'teasers' || id === 'tickets' || id === 'faq' || id === 'crew') {
                    onPresetChange('disco');
                }


            }
        });
    }, {
        threshold: 0.16,
        rootMargin: "-10% 0px -10% 0px"
    });

    document.querySelectorAll('.section-card').forEach(card => {
        scrollObserver.observe(card);
    });

    // 8. Hanging glass disco ball mouse shine coordinate calculations
    const discoStage = document.querySelector('.discoball-stage');
    if (discoStage) {
        let discoTicking = false;
        discoStage.addEventListener('mousemove', (e) => {
            if (!discoTicking) {
                requestAnimationFrame(() => {
                    const rect = discoStage.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    document.querySelector('.discoball').style.setProperty('--ball-mouse-x', `${x}%`);
                    document.querySelector('.discoball').style.setProperty('--ball-mouse-y', `${y}%`);
                    discoTicking = false;
                });
                discoTicking = true;
            }
        });
        discoStage.addEventListener('mouseleave', () => {
            document.querySelector('.discoball').style.setProperty('--ball-mouse-x', `30%`);
            document.querySelector('.discoball').style.setProperty('--ball-mouse-y', `25%`);
        });
    }

    // Rays builder
    const raysContainer = document.getElementById('rays');
    if (raysContainer) {
        const rayColors = ['#ff1f8f', '#1fe6e6', '#ffb02e', '#9b3cff'];
        for (let i = 0; i < 12; i++) {
            const ray = document.createElement('div');
            ray.className = 'ray';
            const angle = i * 30;
            const col = rayColors[i % rayColors.length];
            ray.style.transform = `rotate(${angle}deg)`;
            ray.style.background = `linear-gradient(90deg, ${col}, transparent)`;
            raysContainer.appendChild(ray);
        }
    }

    // 9. Checkout Popup overlays handlers
    const modal = document.getElementById('tixModal');
    const modalSub = document.getElementById('modalSub');

    function openTix(name, price) {
        if (!modal || !modalSub) return;
        modalSub.textContent = `Тип: ${name} · Цена: ${price}`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeTix() {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Bind checkout popups to buttons (removing inline onclick attributes)
    // Disabled: tix-btn are now direct Telegram contact links.
    // document.querySelectorAll('.tix-btn').forEach(btn => {
    //     btn.addEventListener('click', () => {
    //         const name = btn.dataset.name;
    //         const price = btn.dataset.price;
    //         openTix(name, price);
    //     });
    // });

    // Close button click
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTix);
    }

    // Click outside closing overlay
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target.id === 'tixModal') closeTix();
        });
    }

    // Form submit interception
    const modalForm = document.querySelector('.modal form');
    if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Заявка [тестовая] отправлена. В рабочей версии — улетит в Telegram-бот.');
            closeTix();
        });
    }

    // Bind alert dialogue alerts to footer links (removing inline alerts)
    document.querySelectorAll('.footer-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const alertText = link.dataset.alert;
            if (alertText) alert(alertText);
        });
    });

    // 10. Scroll reveals Observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                if (e.target.id === 'progress') {
                    // Start fill animation
                    const fill = document.getElementById('pFill');
                    if (fill) fill.style.width = fill.style.width || '46%';
                }
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Boot the specialized scroll-triggered cards stack for the Thought Cabinet
    initThoughtStack();

    // Boot the manifesto scroll-triggered reveal
    initManifesto();
}

// 11. Specialized scroll-reveal list-dossier observer for Thought Cabinet
function initThoughtStack() {
    const listContainer = document.querySelector('.thought-list');
    const voices = document.querySelectorAll('.thought-list .voice');
    if (!listContainer || !voices.length) return;

    // Check prefers-reduced-motion first
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Fallback: immediately show all voices statically
        voices.forEach(voice => voice.classList.add('is-visible'));
    } else {
        // Synchronously activate JS reveal styles by adding .js-on class immediately
        listContainer.classList.add('js-on');

        const observerOptions = {
            root: null, // Viewport
            rootMargin: '0px 0px -10% 0px', // Trigger slightly before the bottom of screen
            threshold: 0.25 // Row must be 25% visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // One-shot animation: unobserve to prevent repeated transitions
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        voices.forEach(voice => observer.observe(voice));
    }
}

// 12. Specialized particle drift engine for the Manifesto card
function initManifesto() {
    const canvas = document.getElementById('manifesto-card-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const card = canvas.closest('.manifesto-card');
    if (!card) return;

    // Check prefers-reduced-motion
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Listen to media query changes dynamically
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', (e) => {
            prefersReducedMotion = e.matches;
            if (prefersReducedMotion) {
                draw();
            } else {
                tick();
            }
        });
    }

    const particles = [];
    const particleCount = 95; // Deep volumetric layer of 95 sparks drifting over the aurora

    const colors = [
        'rgba(31, 230, 230, ',   // cyan
        'rgba(155, 60, 255, ',  // violet
        'rgba(255, 31, 143, ',  // magenta
        'rgba(244, 236, 220, '   // paper
    ];

    // Pre-render glowing particle textures to offscreen canvases for extreme performance
    const particleTextures = colors.map(colorPrefix => {
        const pCanvas = document.createElement('canvas');
        const pCtx = pCanvas.getContext('2d');
        const size = 32; // 32x32 texture for smooth glow
        pCanvas.width = size;
        pCanvas.height = size;
        
        const center = size / 2;
        const grad = pCtx.createRadialGradient(center, center, 0, center, center, center);
        grad.addColorStop(0, colorPrefix + '1.0)');   // solid core
        grad.addColorStop(0.15, colorPrefix + '0.8)'); // bright inner glow
        grad.addColorStop(0.4, colorPrefix + '0.3)');  // soft outer glow
        grad.addColorStop(1, colorPrefix + '0.0)');    // transparent edge
        
        pCtx.fillStyle = grad;
        pCtx.fillRect(0, 0, size, size);
        return pCanvas;
    });

    function resizeCanvas() {
        canvas.width = card.clientWidth;
        canvas.height = card.clientHeight;

        // Re-distribute particles if they are out of the new bounds
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.x > canvas.width) p.x = Math.random() * canvas.width;
            if (p.y > canvas.height) p.y = Math.random() * canvas.height;
        }

        if (prefersReducedMotion) {
            draw();
        }
    }

    // Initialize particles
    function initParticles() {
        particles.length = 0;
        const width = card.clientWidth || 800;
        const height = card.clientHeight || 400;
        
        for (let i = 0; i < particleCount; i++) {
            const z = Math.random(); // 0 (near, fast, bright) to 1 (far, slow, dim)
            const tex = particleTextures[Math.floor(Math.random() * particleTextures.length)];
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z: z,
                r: (1 - z) * 1.5 + 0.5, // radius from 0.5px to 2.0px
                texture: tex,
                opacity: (1 - z) * 0.32 + 0.08, // opacities from 0.08 to 0.40
                vx: (Math.random() - 0.5) * 0.08,
                vy: -0.12 * (1 - z) - 0.04 // moves slowly upwards
            });
        }
    }

    function resetParticle(p) {
        p.x = Math.random() * canvas.width;
        p.y = canvas.height + 5;
        p.z = Math.random();
        p.r = (1 - p.z) * 1.5 + 0.5;
        p.opacity = (1 - p.z) * 0.32 + 0.08;
        p.vx = (Math.random() - 0.5) * 0.08;
        p.vy = -0.12 * (1 - p.z) - 0.04;
        p.texture = particleTextures[Math.floor(Math.random() * particleTextures.length)];
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.globalAlpha = p.opacity;
            
            // Draw pre-rendered glow texture (scaled by particle size)
            const renderSize = p.r * 6; // glow is 6x larger than the core radius
            ctx.drawImage(p.texture, p.x - renderSize / 2, p.y - renderSize / 2, renderSize, renderSize);
        }
        ctx.globalAlpha = 1.0;
    }

    let animationId = null;
    function tick() {
        if (prefersReducedMotion) {
            draw();
            return;
        }

        // Update particle positions
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            // If it goes off-screen
            if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
                resetParticle(p);
            }
        }

        draw();
        animationId = requestAnimationFrame(tick);
    }

    // Bind resize event and initialize
    window.addEventListener('resize', resizeCanvas);
    initParticles();
    resizeCanvas();
    
    if (!prefersReducedMotion) {
        tick();
    } else {
        draw();
    }
}


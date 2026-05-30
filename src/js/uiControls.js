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

    document.querySelectorAll('.tcard').forEach(card => {
        const subEl = card.querySelector('.tsub');
        if (subEl) {
            card.dataset.sub = subEl.textContent;
            subEl.style.visibility = 'hidden';
            cardTypewriterObserver.observe(card);
        }
    });

    // 5. Custom Cursor hover expand swell events attachment
    const hoverTriggers = document.querySelectorAll('.hover-trigger, .arch, .tcard, .tix, .dossier-box, .prog-stat, button, a, input, textarea');
    hoverTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        trigger.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // 6. Dialogue Toaster programmatically built container setup
    toasterContainer = document.createElement('div');
    toasterContainer.id = 'dialogue-toaster';
    document.body.appendChild(toasterContainer);

    function showSkillToast(voice) {
        if (!toasterContainer) return;

        const toast = document.createElement('div');
        toast.className = 'skill-toast';
        toast.style.borderLeft = `3px solid ${voice.color}`;
        
        const header = document.createElement('div');
        header.className = 'skill-toast-header';
        header.style.color = voice.color;
        header.textContent = `◆ ${voice.skill} [Низкое]`;
        
        const textEl = document.createElement('div');
        textEl.className = 'skill-toast-text';
        
        toast.appendChild(header);
        toast.appendChild(textEl);
        toasterContainer.appendChild(toast);

        // Force reflow
        toast.getBoundingClientRect();
        toast.classList.add('show');

        let text = voice.text;
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                textEl.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, 18);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 6500);
    }

    // 7. Scroll Presets Transitions & Intrusive Skill Toasts Observers
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                
                // Invoke callback to transition WebGL shader background preset
                if (id === 'hero-section') {
                    onPresetChange('disco');
                } else if (id === 'concept' || id === 'thoughts' || id === 'brief') {
                    onPresetChange('cyberpunk');
                } else if (id === 'dress' || id === 'bar' || id === 'reals') {
                    onPresetChange('obsidian');
                } else if (id === 'budget' || id === 'progress') {
                    onPresetChange('gold');
                } else if (id === 'teasers' || id === 'tickets' || id === 'faq' || id === 'crew') {
                    onPresetChange('disco');
                }

                // Show right aligned Intrusive dialogue alerts
                if (skillVoices[id] && !e.target.dataset.voiceTriggered) {
                    e.target.dataset.voiceTriggered = "true";
                    showSkillToast(skillVoices[id]);
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
        discoStage.addEventListener('mousemove', (e) => {
            const rect = discoStage.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            document.querySelector('.discoball').style.setProperty('--ball-mouse-x', `${x}%`);
            document.querySelector('.discoball').style.setProperty('--ball-mouse-y', `${y}%`);
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
    document.querySelectorAll('.tix-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = btn.dataset.price;
            openTix(name, price);
        });
    });

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
}

// 11. Specialized scroll-triggered cascade stack observer for Thought Cabinet cards
function initThoughtStack() {
    const cards = document.querySelectorAll('.thought-grid .arch');
    if (!cards.length) return;

    // Centralized prefers-reduced-motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        cards.forEach(card => {
            card.classList.add('active');
            card.style.opacity = '1';
            card.style.transform = 'none';
            card.style.filter = 'none';
        });
        return;
    }

    const observerOptions = {
        root: null, // viewport
        rootMargin: '-5% 0px -30% 0px', // focal zone bounds
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0]
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target;
            const rect = entry.boundingClientRect;
            const viewHeight = window.innerHeight;
            
            if (entry.isIntersecting) {
                const cardCenter = rect.top + rect.height / 2;
                const focalCenter = viewHeight * 0.45; // focal zone center point

                if (cardCenter < focalCenter - 60) {
                    // Went up beyond focal zone -> passed (fades slightly & gets blurred)
                    card.classList.remove('active');
                    card.classList.add('passed');
                } else {
                    // Active central focal zone -> full color/focus
                    card.classList.add('active');
                    card.classList.remove('passed');
                }
            } else {
                if (rect.top < 0) {
                    // Offscreen above -> passed
                    card.classList.remove('active');
                    card.classList.add('passed');
                } else {
                    // Offscreen below -> reset to upcoming
                    card.classList.remove('active');
                    card.classList.remove('passed');
                }
            }
        });
    }, observerOptions);

    cards.forEach(card => observer.observe(card));
}

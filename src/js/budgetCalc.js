/* =========================================================================
   Budget Module: Manages funding telemetry, Grade 1/Grade 2 database switches,
   live data.json AJAX loading, countdown computations, and timeline positioning.
   ========================================================================= */

import { skillVoices } from './uiControls.js';

// Starting Reals Config (agreed value levels)
export const STARTING_REALS = {
    "Бродяга": 600,
    "Детектив": 1000,
    "Суперзвезда": 2500
};

export const PRICES = {
    drink: 150,      // Средняя цена напитка
    bet: 50,         // Минимальная ставка
    phone15m: 200,   // Телефон 15 мин
    phone1h: 800,    // Телефон 1 час
    extra: 250       // Поставить трек / Блайнд-бокс
};

export function initRealsCalculator() {
    let selectedTier = "Детектив";

    const tierPills = document.querySelectorAll('#calcTierSwitch .grade-pill');
    
    function recalculate() {
        const starting = STARTING_REALS[selectedTier];
        
        // Get slider values
        const drinksInput = document.getElementById('calc-drinks');
        const betsInput = document.getElementById('calc-bets');
        const phoneInput = document.getElementById('calc-phone');
        const extrasInput = document.getElementById('calc-extras');
        
        const drinks = drinksInput ? parseInt(drinksInput.value) : 0;
        const bets = betsInput ? parseInt(betsInput.value) : 0;
        const phoneVal = phoneInput ? parseInt(phoneInput.value) : 0;
        const extras = extrasInput ? parseInt(extrasInput.value) : 0;
        
        // Map sliders to their labels
        if (document.getElementById('val-drinks')) document.getElementById('val-drinks').textContent = `${drinks} шт.`;
        if (document.getElementById('val-bets')) document.getElementById('val-bets').textContent = `${bets} шт.`;
        
        let phoneText = 'Нет';
        let phoneCost = 0;
        if (phoneVal === 1) {
            phoneText = '15 мин.';
            phoneCost = PRICES.phone15m;
        } else if (phoneVal === 2) {
            phoneText = '1 час';
            phoneCost = PRICES.phone1h;
        }
        if (document.getElementById('val-phone')) document.getElementById('val-phone').textContent = phoneText;
        if (document.getElementById('val-extras')) document.getElementById('val-extras').textContent = `${extras} шт.`;
        
        const totalCost = (drinks * PRICES.drink) + (bets * PRICES.bet) + phoneCost + (extras * PRICES.extra);
        const leftover = starting - totalCost;
        
        // Update leftover display
        const balanceVal = document.getElementById('calcLeftover');
        if (balanceVal) {
            balanceVal.innerHTML = leftover.toLocaleString('ru-RU') + '<span class="cur"> ℜ</span>';
            balanceVal.classList.toggle('neg', leftover < 0);
        }
        
        // Render dynamic breakdown list
        const listEl = document.getElementById('calcBreakdown');
        if (listEl) {
            listEl.innerHTML = '';
            if (drinks > 0) {
                listEl.innerHTML += `<li><span class="item">${drinks} × Напитки в баре</span><span class="cost">-${drinks * PRICES.drink} ℜ</span></li>`;
            }
            if (bets > 0) {
                listEl.innerHTML += `<li><span class="item">${bets} × Ставки в казино</span><span class="cost">-${bets * PRICES.bet} ℜ</span></li>`;
            }
            if (phoneCost > 0) {
                listEl.innerHTML += `<li><span class="item">Аренда телефона (${phoneText})</span><span class="cost">-${phoneCost} ℜ</span></li>`;
            }
            if (extras > 0) {
                listEl.innerHTML += `<li><span class="item">${extras} × Музыка и подарки</span><span class="cost">-${extras * PRICES.extra} ℜ</span></li>`;
            }
            if (totalCost === 0) {
                listEl.innerHTML = `<li><span class="item">Все ползунки на нуле. Скромный следователь.</span><span class="cost">0 ℜ</span></li>`;
            }
        }
    }

    tierPills.forEach(pill => {
        pill.addEventListener('click', () => {
            selectedTier = pill.dataset.tier;
            tierPills.forEach(p => p.classList.toggle('active', p.dataset.tier === selectedTier));
            recalculate();
        });
    });

    const sliders = document.querySelectorAll('.calc-slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', recalculate);
    });

    // Run baseline calculation
    recalculate();
}


const BUDGET = {
    1: {
        total: '127 500', 
        sub: 'СТОИМОСТЬ ВСЕЙ НОЧИ',
        contrib: '',
        included: [
            'Внутренняя валюта реалы',
            'Самодельный бар (бармен-доброволец из своих)',
            'Декорации: распечатки, постеры, дискошар',
            'Простое казино (кости, карты)',
            'Блайнд-боксы и ачивки',
            'Возможность ставить свои треки за реалы',
            'Тематические этикетки на алкоголь и сигареты',
            'Гайд по дресс-коду и лору',
            'Пункт обмена валюты',
            'Лотерея и кнопка «гойского гоя»',
            'Газета Ревашоля на входе',
            'Костёр для ритуального сожжения реалов',
            'Аукцион с молотка: 3 эксклюзивных лота',
            'Аренда номера на ночь',
            'Похмельный стафф утром'
        ]
    },
    2: {
        total: '238 400', 
        sub: 'СТОИМОСТЬ ВСЕЙ НОЧИ',
        contrib: '',
        included: [
            'Наёмный бармен',
            'Расширенный пул квестов с наградами',
            'Расширенная акустика и свет',
            'Расширенное меню еды',
            'Мерч для верхних тиров'
        ]
    }
};

export function setGrade(g) {
    const d = BUDGET[g];
    if (!d) return;

    // Apply color accents locally to the budget section
    const budgetSec = document.getElementById('budget');
    if (budgetSec) {
        if (g === 1) {
            budgetSec.style.setProperty('--accent', 'var(--amber)');
            budgetSec.style.setProperty('--accent2', 'var(--magenta)');
        } else if (g === 2) {
            budgetSec.style.setProperty('--accent', 'var(--cyan)');
            budgetSec.style.setProperty('--accent2', 'var(--violet)');
        }
    }

    // Slide indicator background by updating toggle switcher class
    const toggle = document.getElementById('budgetToggle');
    if (toggle) {
        toggle.classList.toggle('g2', g === 2);
    }

    const priceNum = document.getElementById('bTotal');
    const subEl = document.getElementById('bSub');
    const includedCard = document.getElementById('budgetCard');
    const includedEl = document.getElementById('bWhatIncluded');

    const updateContent = () => {
        if (priceNum) {
            priceNum.innerHTML = d.total + '<span class="cur"> ₽</span>';
        }
        if (subEl) {
            subEl.textContent = d.sub;
        }
        if (includedEl) {
            if (g === 1) {
                includedEl.innerHTML = `
                    <ul class="what-included-list">
                        ${d.included.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                `;
            } else if (g === 2) {
                includedEl.innerHTML = `
                    <div class="what-included-plus-header">ВСЁ ИЗ ГРЕЙДА 1, ПЛЮС:</div>
                    <ul class="what-included-list">
                        ${d.included.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                `;
            }
        }
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        updateContent();
    } else {
        if (priceNum) priceNum.classList.add('fade-out');
        if (includedCard) includedCard.classList.add('fade-out');

        setTimeout(() => {
            updateContent();
            if (priceNum) priceNum.classList.remove('fade-out');
            if (includedCard) includedCard.classList.remove('fade-out');
        }, 200);
    }
}

function formatRussianDate(dateStr, isUpperCase = false) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const months = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];
    
    const month = months[monthIndex] || '';
    const formatted = `${day} ${month}`;
    return isUpperCase ? formatted.toUpperCase() : formatted;
}

function getDaysLeft(deadlineStr) {
    if (!deadlineStr) return 0;
    const parts = deadlineStr.split('-');
    if (parts.length !== 3) return 0;
    
    const deadlineDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

function animateProgressFill(targetPercent, collectedVal) {
    const fillEl = document.getElementById('pFill');
    const circleFg = document.getElementById('pCircleFg');
    const fillLabel = document.getElementById('pFillLabel');
    if (!fillEl) return;

    if (fillLabel) {
        fillLabel.textContent = Number(collectedVal).toLocaleString('ru-RU') + ' ₽';
    }

    const circumference = 150.8;
    const strokeOffset = circumference - (circumference * targetPercent / 100);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        fillEl.style.transition = 'none';
        fillEl.style.width = targetPercent + '%';
        if (circleFg) {
            circleFg.style.transition = 'none';
            circleFg.style.strokeDashoffset = strokeOffset;
        }
        return;
    }

    // Reset to 0 initially so animation can fire on scroll
    fillEl.style.width = '0%';
    if (circleFg) {
        circleFg.style.strokeDashoffset = circumference;
    }

    const observerOptions = {
        root: null,
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger transition animation
                fillEl.style.width = targetPercent + '%';
                if (circleFg) {
                    circleFg.style.strokeDashoffset = strokeOffset;
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const progressSection = document.getElementById('progress');
    if (progressSection) {
        observer.observe(progressSection);
    } else {
        fillEl.style.width = targetPercent + '%';
        if (circleFg) {
            circleFg.style.strokeDashoffset = strokeOffset;
        }
    }
}

export function initBudget() {
    const fallbackData = {
        "collected": 84554,
        "buyers": 5,
        "deadline": "2026-07-15",
        "updated": "2026-06-21",
        "goalG1": 127500,
        "goalG2": 238400,
        "orgStart": 60000
    };

    function updateUI(data) {
        const collectedEl = document.getElementById('pCollected');
        if (collectedEl) {
            collectedEl.innerHTML = Number(data.collected).toLocaleString('ru-RU') + '<span class="cur"> ₽</span>';
        }

        const formattedGoalG1 = Number(data.goalG1).toLocaleString('ru-RU');
        const formattedGoalG2 = Number(data.goalG2).toLocaleString('ru-RU');
        const formattedUpdated = formatRussianDate(data.updated, true);
        
        const goalG1Text = document.getElementById('pGoalG1Text');
        if (goalG1Text) {
            goalG1Text.textContent = `ГРЕЙД 1 — ${formattedGoalG1} ₽`;
        }
        const goalG2Text = document.getElementById('pGoalG2Text');
        if (goalG2Text) {
            goalG2Text.textContent = `ГРЕЙД 2 — ${formattedGoalG2} ₽`;
        }
        const updateStamp = document.getElementById('pUpdateStamp');
        if (updateStamp) {
            updateStamp.textContent = `ОБНОВЛЯЕТСЯ КАЖДУЮ НЕДЕЛЮ · ОБНОВЛЕНО · ${formattedUpdated}`;
        }

        const pBuyers = document.getElementById('pBuyers');
        if (pBuyers) {
            pBuyers.textContent = data.buyers;
        }

        const daysLeft = getDaysLeft(data.deadline);
        const pDaysLeft = document.getElementById('pDaysLeft');
        if (pDaysLeft) {
            pDaysLeft.textContent = daysLeft;
        }
        
        const formattedDeadline = formatRussianDate(data.deadline, false);
        const pDeadlineText = document.getElementById('pDeadlineText');
        if (pDeadlineText) {
            pDeadlineText.innerHTML = `дней до<br>решения<br><small style="font-size: 0.65rem; opacity: 0.8; font-family: 'JetBrains Mono', monospace; font-weight: normal; text-transform: uppercase; margin-top: 4px; display: block; color: var(--amber);">дедлайн ${formattedDeadline}</small>`;
        }

        const percentage = (data.collected / data.goalG2) * 100;
        const pPercent = document.getElementById('pPercent');
        if (pPercent) {
            pPercent.innerHTML = Math.round(percentage) + '<span class="pct">%</span>';
        }

        const pMarkOrg = document.getElementById('pMarkOrg');
        if (pMarkOrg) {
            const pos = (data.orgStart / data.goalG2) * 100;
            pMarkOrg.style.left = pos.toFixed(2) + '%';
            pMarkOrg.querySelector('.amt').textContent = (data.orgStart / 1000).toFixed(0) + 'к';
        }

        const pMarkG1 = document.getElementById('pMarkG1');
        if (pMarkG1) {
            const pos = (data.goalG1 / data.goalG2) * 100;
            pMarkG1.style.left = pos.toFixed(2) + '%';
            pMarkG1.querySelector('.amt').textContent = (data.goalG1 / 1000).toLocaleString('ru-RU', {maximumFractionDigits: 1}) + 'к';
        }

        const pMarkG2 = document.getElementById('pMarkG2');
        if (pMarkG2) {
            pMarkG2.style.left = '100%';
            pMarkG2.querySelector('.amt').textContent = (data.goalG2 / 1000).toLocaleString('ru-RU', {maximumFractionDigits: 1}) + 'к';
        }

        // Trigger animation
        animateProgressFill(percentage, data.collected);

        if (skillVoices['progress']) {
            skillVoices['progress'].text = `${data.buyers} детективов уже сдавали векселя. Твоё плечо должно быть рядом с ними на этой вечеринке. Не отставай.`;
        }
    }

    // Attach switcher listener
    const toggle = document.getElementById('budgetToggle');
    if (toggle) {
        toggle.querySelectorAll('.grade-toggle-half').forEach(h => {
            h.addEventListener('click', () => {
                const g = parseInt(h.dataset.g);
                setGrade(g);
            });
        });
    }

    setGrade(1);
    initRealsCalculator();

    // Fetch dynamic telemetry
    fetch('./data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network status failed');
            return response.json();
        })
        .then(data => {
            if (!data || typeof data.collected === 'undefined') {
                throw new Error('Invalid JSON structure');
            }
            console.log('Live metrics loaded from data.json:', data);
            updateUI(data);
        })
        .catch(err => {
            console.warn('Fallback to local telemetry (CORS or Invalid Data):', err);
            updateUI(fallbackData);
        });
}

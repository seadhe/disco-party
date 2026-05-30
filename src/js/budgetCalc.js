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
        sub: '20 ЧЕЛОВЕК · 1 НОЧЬ',
        contrib: '67 500 ₽ — примерно 3 375 ₽ с человека',
        cats: [
            { name: 'Аренда дома', val: '45 000 ₽', pct: 35 },
            { name: 'Бар и напитки', val: '39 000 ₽', pct: 31 },
            { name: 'Еда и закуски', val: '20 000 ₽', pct: 16 },
            { name: 'Печать, декор, расходники', val: '23 500 ₽', pct: 18 }
        ]
    },
    2: {
        total: '238 400', 
        sub: '30 ЧЕЛОВЕК · 1 НОЧЬ',
        contrib: '178 400 ₽ — примерно 5 950 ₽ с человека',
        cats: [
            { name: 'Аренда коттеджа', val: '55 000 ₽', pct: 23 },
            { name: 'Бар и напитки', val: '63 100 ₽', pct: 26 },
            { name: 'Еда + шашлык', val: '39 800 ₽', pct: 17 },
            { name: 'Бармен, акустика, свет', val: '13 000 ₽', pct: 5 },
            { name: 'Печать, мерч, лоты, реквизит', val: '67 500 ₽', pct: 29 }
        ]
    }
};

export function setGrade(g) {
    const d = BUDGET[g];
    if (!d) return;

    document.getElementById('bTotal').innerHTML = d.total + '<span class="cur"> ₽</span>';
    document.getElementById('bSub').textContent = d.sub;
    document.getElementById('bContrib').textContent = d.contrib;
    
    // Toggle active classes on G1/G2 pills
    document.querySelectorAll('.grade-pill').forEach(p => {
        p.classList.toggle('active', parseInt(p.dataset.grade) === g);
    });

    const cats = document.getElementById('bCats');
    cats.innerHTML = d.cats.map(c => `
        <div class="bcat">
            <div class="bcat-row">
                <span class="bcat-name">${c.name}</span>
                <span class="bcat-val">${c.val} · ${c.pct}%</span>
            </div>
            <div class="bcat-bar"><div class="bcat-fill" data-t="${c.pct}"></div></div>
        </div>
    `).join('');
    
    requestAnimationFrame(() => {
        cats.querySelectorAll('.bcat-fill').forEach((b, i) => {
            setTimeout(() => b.style.width = b.dataset.t + '%', i * 60);
        });
    });
}

export function initBudget() {
    const fallbackData = {
        "collected": 82100,
        "target_g1": 67500,
        "target_g2": 178400,
        "tickets_sold": 14,
        "decision_date": "2026-06-06",
        "last_updated": "27 мая"
    };

    function updateUI(data) {
        // Calculate percentage collected relative to G2 goal
        const percentage = (data.collected / data.target_g2) * 100;
        
        // Calculate days left relative to decision_date
        const targetDate = new Date(data.decision_date);
        const currentDate = new Date();
        const diffTime = targetDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysLeft = diffDays > 0 ? diffDays : 0;

        // Update main telemetry metrics
        const collectedEl = document.getElementById('pCollected');
        if (collectedEl) {
            collectedEl.innerHTML = Number(data.collected).toLocaleString('ru-RU') + '<span class="cur"> ₽</span>';
        }

        const progOfEl = document.querySelector('.prog-of');
        if (progOfEl) {
            progOfEl.textContent = `из ${Number(data.target_g2).toLocaleString('ru-RU')} ₽ на полный Грейд 2 · обновлено ${data.last_updated}`;
        }

        // Update progress statistics cards (sold, days left, percentage)
        const statCards = document.querySelectorAll('.prog-stat .n');
        if (statCards.length >= 3) {
            statCards[0].textContent = data.tickets_sold; 
            statCards[1].textContent = daysLeft; 
            statCards[2].innerHTML = Math.round(percentage) + '<span class="pct">%</span>'; 
        }

        // Update progress timeline fill track
        const fillEl = document.getElementById('pFill');
        if (fillEl) {
            fillEl.style.width = Math.min(percentage, 100) + '%';
        }

        // Dynamically shift visual G1/G2 markers based on actual data
        const marks = document.querySelectorAll('.prog-mark');
        if (marks.length >= 2) {
            const g1Pos = (data.target_g1 / data.target_g2) * 100;
            marks[0].style.left = Math.round(g1Pos) + '%';
            marks[0].querySelector('.amt').textContent = (data.target_g1 / 1000).toFixed(1) + 'к';
            
            marks[1].style.left = '95%'; // Beautiful padding buffer
            marks[1].querySelector('.amt').textContent = (data.target_g2 / 1000).toFixed(1) + 'к';
        }

        // Update dynamic Esprit de Corps speech bubble text
        if (skillVoices['progress']) {
            skillVoices['progress'].text = `${data.tickets_sold} детективов уже сдавали векселя. Твоё плечо должно быть рядом с ними на этой вечеринке. Не отставай.`;
        }
    }

    // Attach grade G1/G2 switches event listeners dynamically
    document.querySelectorAll('.grade-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const g = parseInt(pill.dataset.grade);
            setGrade(g);
        });
    });

    // Run baseline initial render for Grade 1
    setGrade(1);
    
    // Boot interactive reals calculator
    initRealsCalculator();

    // Fetch telemetry database values
    fetch('./data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network status failed');
            return response.json();
        })
        .then(data => {
            console.log('Live metrics loaded from data.json:', data);
            updateUI(data);
        })
        .catch(err => {
            console.warn('CORS or file:// load fallback to local telemetry:', err);
            updateUI(fallbackData);
        });
}

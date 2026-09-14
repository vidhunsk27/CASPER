// ==============================================================================
// 1. SYSTEM INITIALIZATION & PLUGINS
// ==============================================================================
let iconTimeout;
function renderIcons() {
    clearTimeout(iconTimeout);
    iconTimeout = setTimeout(() => {
        try {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch(e) {}
    }, 50);
}

try { 
    renderIcons(); 
    if (typeof ChartDataLabels !== 'undefined' && typeof Chart !== 'undefined') {
        Chart.register(ChartDataLabels); 
        Chart.defaults.plugins.datalabels.display = false; 
    }
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#9ca3af'; 
        Chart.defaults.font.family = 'Fredoka'; 
        Chart.defaults.borderColor = 'rgba(255,255,255,0.05)'; 
    }
} catch(e) {
    console.warn("Chart Plugins initializing safely.");
}

// Safely handles both localhost server booting and direct file:// double-click testing
const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') || window.location.protocol === 'file:';
const API_BASE = isLocal ? 'http://localhost:3000/api' : '/api';
const apiHeaders = { 'Content-Type': 'application/json' };

// Safe JSON Parser to prevent fatal cache crashes
function safeGetJSON(key, fallback) {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
    } catch(e) {
        return fallback;
    }
}

// ==============================================================================
// 2. RAW DATA SEED & ZERO-CREDIT MIGRATION
// ==============================================================================
const rawData = '[{"i":"1786233600000","t":"e","a":460.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1786233600000},{"i":"1786147200001","t":"e","a":418.75,"ac":"UPI","c":"Groceries","n":"","ts":1786147200000},{"i":"1786147200002","t":"e","a":95.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1786147200000},{"i":"1786147200003","t":"e","a":719.0,"ac":"UPI","c":"Subscriptions","n":"","ts":1786147200000},{"i":"1786147200004","t":"e","a":55.0,"ac":"UPI","c":"Groceries","n":"","ts":1786147200000},{"i":"1786147200005","t":"e","a":65.0,"ac":"UPI","c":"Transport","n":"","ts":1786147200000},{"i":"1786060800006","t":"e","a":163.0,"ac":"UPI","c":"Groceries","n":"","ts":1786060800000},{"i":"1785974400007","t":"e","a":130.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1785974400000},{"i":"1785801600008","t":"e","a":240.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1785801600000},{"i":"1785715200009","t":"i","a":39.84,"ac":"UPI","c":"Other","n":"","ts":1785715200000},{"i":"1785715200010","t":"e","a":115.0,"ac":"UPI","c":"Groceries","n":"","ts":1785715200000},{"i":"1785715200011","t":"e","a":161.72,"ac":"UPI","c":"Food & Dining","n":"","ts":1785715200000},{"i":"1785628800012","t":"e","a":64.0,"ac":"UPI","c":"Transport","n":"","ts":1785628800000},{"i":"1785628800013","t":"e","a":32.0,"ac":"UPI","c":"Transport","n":"","ts":1785628800000},{"i":"1785628800014","t":"e","a":16.0,"ac":"UPI","c":"Transport","n":"","ts":1785628800000},{"i":"1785628800015","t":"i","a":35.0,"ac":"UPI","c":"Other","n":"","ts":1785628800000},{"i":"1785628800016","t":"e","a":125.0,"ac":"UPI","c":"Groceries","n":"","ts":1785628800000},{"i":"1785628800017","t":"e","a":13.0,"ac":"UPI","c":"Transport","n":"","ts":1785628800000},{"i":"1785628800018","t":"e","a":35.0,"ac":"UPI","c":"Transport","n":"","ts":1785628800000},{"i":"1785628800019","t":"e","a":23.0,"ac":"UPI","c":"Transport","n":"","ts":1785628800000},{"i":"1785628800020","t":"e","a":27.0,"ac":"UPI","c":"Transport","n":"","ts":1785628800000},{"i":"1785542400021","t":"e","a":9750.0,"ac":"UPI","c":"Rent","n":"","ts":1785542400000},{"i":"1785542400022","t":"e","a":131.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1785542400000},{"i":"1785542400023","t":"e","a":20000.0,"ac":"UPI","c":"Other","n":"","ts":1785542400000},{"i":"1785542400024","t":"i","a":50080.0,"ac":"UPI","c":"Salary","n":"","ts":1785542400000},{"i":"1785369600025","t":"e","a":165.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1785369600000},{"i":"1785369600026","t":"e","a":167.72,"ac":"UPI","c":"Food & Dining","n":"","ts":1785369600000},{"i":"1785283200027","t":"e","a":198.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1785283200000},{"i":"1785283200028","t":"e","a":153.0,"ac":"Credit Card","c":"Shopping","n":"Amazon India","ts":1785283200000},{"i":"1785196800029","t":"e","a":50.0,"ac":"UPI","c":"Groceries","n":"","ts":1785196800000},{"i":"1785110400030","t":"e","a":120.0,"ac":"UPI","c":"Groceries","n":"","ts":1785110400000},{"i":"1785110400031","t":"e","a":511.97,"ac":"Credit Card","c":"Entertainment","n":"","ts":1785110400000},{"i":"1785024000032","t":"e","a":421.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1785024000000},{"i":"1785024000033","t":"e","a":35.0,"ac":"UPI","c":"Groceries","n":"","ts":1785024000000},{"i":"1785024000034","t":"e","a":164.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1785024000000},{"i":"1784937600035","t":"e","a":60.0,"ac":"UPI","c":"Groceries","n":"","ts":1784937600000},{"i":"1784937600036","t":"e","a":127.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1784937600000},{"i":"1784764800037","t":"e","a":80.0,"ac":"UPI","c":"Groceries","n":"","ts":1784764800000},{"i":"1784678400038","t":"e","a":120.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1784678400000},{"i":"1784678400039","t":"e","a":60.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1784678400000},{"i":"1784592000040","t":"e","a":144.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1784592000000},{"i":"1784592000041","t":"i","a":2800.0,"ac":"UPI","c":"Refund","n":"","ts":1784592000000},{"i":"1784592000042","t":"e","a":30.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1784592000000},{"i":"1784505600043","t":"e","a":15.0,"ac":"UPI","c":"Groceries","n":"","ts":1784505600000},{"i":"1784505600044","t":"e","a":45.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1784505600000},{"i":"1784419200045","t":"e","a":289.0,"ac":"UPI","c":"Groceries","n":"","ts":1784419200000},{"i":"1784419200046","t":"e","a":167.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1784419200000},{"i":"1784419200047","t":"e","a":60.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1784419200000},{"i":"1784332800048","t":"e","a":665.0,"ac":"Debit Card","c":"Electricity charges","n":"","ts":1784332800000},{"i":"1784332800049","t":"e","a":60.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1784332800000},{"i":"1784332800050","t":"e","a":35.0,"ac":"UPI","c":"Groceries","n":"THANGAM FRUITS AND VEGETABLES","ts":1784332800000},{"i":"1784332800051","t":"e","a":40.0,"ac":"UPI","c":"Transport","n":"METROPOLITAN TRANSPORT","ts":1784332800000},{"i":"1784332800052","t":"e","a":23.0,"ac":"UPI","c":"Other","n":"Cumta info","ts":1784332800000},{"i":"1784332800053","t":"i","a":62.0,"ac":"UPI","c":"Other","n":"SHIVAYOGESHJ","ts":1784332800000},{"i":"1784332800054","t":"e","a":32.0,"ac":"UPI","c":"Transport","n":"Rapido","ts":1784332800000},{"i":"1784332800055","t":"e","a":32.0,"ac":"UPI","c":"Transport","n":"Rapido","ts":1784332800000},{"i":"1784332800056","t":"e","a":206.0,"ac":"UPI","c":"Entertainment","n":"MOHAMED IMRAN FAREET","ts":1784332800000},{"i":"1784332800057","t":"e","a":681.17,"ac":"Credit Card","c":"Food & Dining","n":"Dominos Pizza","ts":1784332800000},{"i":"1784332800058","t":"e","a":10.0,"ac":"UPI","c":"Transport","n":"Indian Railway","ts":1784332800000},{"i":"1784332800059","t":"e","a":20.0,"ac":"UPI","c":"Other","n":"SHIVAYOGESH J","ts":1784332800000},{"i":"1784332800060","t":"e","a":13.0,"ac":"UPI","c":"Transport","n":"","ts":1784332800000},{"i":"1784332800061","t":"e","a":33.0,"ac":"UPI","c":"Transport","n":"","ts":1784332800000},{"i":"1784332800062","t":"e","a":5.0,"ac":"UPI","c":"Transport","n":"","ts":1784332800000},{"i":"1784246400063","t":"e","a":1654.0,"ac":"Credit Card","c":"Shopping","n":"Amazon India","ts":1784246400000},{"i":"1784246400064","t":"e","a":60.0,"ac":"UPI","c":"Groceries","n":"","ts":1784246400000},{"i":"1783987200065","t":"e","a":105.0,"ac":"UPI","c":"Food & Dining","n":"SWIGGY","ts":1783987200000},{"i":"1783900800066","t":"e","a":60.0,"ac":"UPI","c":"Groceries","n":"","ts":1783900800000},{"i":"1783814400067","t":"e","a":150.0,"ac":"UPI","c":"Other","n":"Haircut","ts":1783814400000},{"i":"1783728000068","t":"e","a":20000.0,"ac":"Debit Card","c":"Other","n":"","ts":1783728000000},{"i":"1783555200069","t":"e","a":211.0,"ac":"UPI","c":"Food & Dining","n":"Swiggy Ltd","ts":1783555200000},{"i":"1783468800070","t":"e","a":992.25,"ac":"Credit Card","c":"Transport","n":"AbhiBus","ts":1783468800000},{"i":"1783468800071","t":"e","a":894.0,"ac":"Credit Card","c":"Transport","n":"ABHIBUS COM","ts":1783468800000},{"i":"1783382400072","t":"e","a":30.0,"ac":"UPI","c":"Food & Dining","n":"THANGAM FRUITS AND VEGETABLES","ts":1783382400000},{"i":"1783382400073","t":"e","a":115.0,"ac":"UPI","c":"Food & Dining","n":"Swiggy Ltd","ts":1783382400000},{"i":"1783382400074","t":"e","a":11.0,"ac":"UPI","c":"Other","n":"","ts":1783382400000},{"i":"1783382400075","t":"e","a":10.0,"ac":"UPI","c":"Other","n":"","ts":1783382400000},{"i":"1783382400076","t":"e","a":35.0,"ac":"UPI","c":"Groceries","n":"THANGAM FRUITS AND VEGETABLES","ts":1783382400000},{"i":"1783209600077","t":"e","a":128.0,"ac":"UPI","c":"Food & Dining","n":"SWIGGY","ts":1783209600000},{"i":"1783209600078","t":"e","a":595.0,"ac":"UPI","c":"Food & Dining","n":"SWIGGY","ts":1783209600000},{"i":"1783209600079","t":"e","a":147.0,"ac":"UPI","c":"Groceries","n":"","ts":1783209600000},{"i":"1783123200080","t":"e","a":3250.0,"ac":"UPI","c":"Rent","n":"","ts":1783123200000},{"i":"1783123200081","t":"e","a":110.0,"ac":"UPI","c":"Groceries","n":"","ts":1783123200000},{"i":"1783036800082","t":"e","a":255.0,"ac":"UPI","c":"Food & Dining","n":"","ts":1783036800000},{"i":"1782950400083","t":"e","a":134.0,"ac":"UPI","c":"Other","n":"","ts":1782950400000},{"i":"1782950400084","t":"e","a":20.0,"ac":"UPI","c":"Groceries","n":"","ts":1782950400000},{"i":"1782864000085","t":"i","a":51091.0,"ac":"UPI","c":"Salary","n":"","ts":1782864000000},{"i":"1782864000086","t":"e","a":40.0,"ac":"UPI","c":"Groceries","n":"","ts":1782864000000},{"i":"1782864000087","t":"e","a":122.0,"ac":"UPI","c":"Food & Dining","n":"SWIGGY","ts":1782864000000}]';

let seedTransactions = [];
try {
    seedTransactions = JSON.parse(rawData).map(t => {
        let acct = t.ac || 'UPI';
        if (acct === 'Credit Card' || acct === 'Debit Card') acct = 'UPI';
        return { 
            id: String(t.i), 
            type: t.t === 'e' ? 'expense' : 'income', 
            amount: Number(t.a) || 0, 
            account: acct, 
            category: t.c || 'Other', 
            note: t.n || '', 
            timestamp: Number(t.ts) || Date.now(), 
            isRecurring: false 
        };
    });
} catch(e) {}

// ==============================================================================
// 3. GLOBAL STATE VARIABLES
// ==============================================================================
const LOCAL_TX_KEY = 'walletTransactionsBackupV2';
let transactions = []; 
let wishlistItems = []; 
let mediaItems = []; 
let deletedQueue = []; 
let growthItems = []; 
let customHabits = [];
let habitHistory = {};

let monthlyBudgets = { 'default': 25000 }; 
let ccLimit = 50000; 
let monthlyWishlistSavings = 0; 
let autoEmergencyFundAmt = 0;
let stagedCSVTransactions = [];

let currentType = 'expense'; 
let selectedMonth = 'all'; 
let searchQuery = ''; 
let currentFilter = 'all'; 
let currentChartIdx = 0; 
let statsChartIdx = 0;

let donutChart, lineChart, radarChart, cashflowChart, weeklyRhythmChart, allMonthsChart, monthlyTrendChart, accountChart, savingsTrendChartObj, burnChartObj, polarChartObj;
let expandedChartObj = null, allTimeChartObj = null, reportCharts = {};

let wishScrapeController = null;
let mediaScrapeController = null;
let aiTypingTimer = null; 
let mediaViewMode = 'grid';

let wbHistory = []; 
let currentTool = 'pen'; 
let penColor = '#ffffff'; 
let penWidth = 2; 
let isTextMode = false; 
let isDrawing = false; 
let startX, startY, savedImageData;

// ==============================================================================
// 4. CORE INITIALIZATION
// ==============================================================================
function init() {
    try { forceCleanSystemState(); } catch(e) {}
    try { populateCategories(); } catch(e) {}
    
    try {
        const dateInput = document.getElementById('date');
        if (dateInput) dateInput.valueAsDate = new Date();
    } catch(e) {}
    
    try { initCharts(); } catch(e) { console.error("Chart Init Failed", e); }
    try { checkAutoEmergencyFund(); } catch(e) {}
    try { updateUI(); } catch(e) { console.error("Update UI Failed", e); }
    try { updateChartStack(); } catch(e) {}
    try { updateStatsStack(); } catch(e) {}
    try { updateUndoBtn(); } catch(e) {}
    
    try {
        const savedTimetable = localStorage.getItem('walletGrowthTimetable');
        if (savedTimetable && document.getElementById('growthTimetable')) {
            document.getElementById('growthTimetable').value = savedTimetable;
        }
    } catch(e) {}
    
    try { renderGrowthList(); } catch(e) {}
    try { renderWishlist(); } catch(e) {}
    try { renderMedia(); } catch(e) {}
    try { loadHabits(); } catch(e) {}
    
    try { syncDataFromServer(); } catch(e) {}
    try { loadWorkspace(); } catch(e) {}
    try { setupEventListeners(); } catch(e) {}
    
    setTimeout(() => { try { initWhiteboard(); } catch(e) {} }, 200);
}

// ==============================================================================
// 5. GLOBAL EVENT DELEGATED TOOLTIP ENGINE (Fixing capitalization bug)
// ==============================================================================
function showTooltipForIcon(icon) {
    const infoText = icon.getAttribute('data-info');
    if (!infoText) return;
    
    let tooltipEl = document.getElementById('globalTooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'globalTooltip';
        document.body.appendChild(tooltipEl);
    }
    
    // Explicitly enforce normal text case rendering
    tooltipEl.innerHTML = infoText;
    tooltipEl.style.display = 'block';
    tooltipEl.style.visibility = 'hidden';
    tooltipEl.style.textTransform = 'none'; // Overriding CSS if needed
    
    void tooltipEl.offsetWidth;
    
    const iconRect = icon.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    
    let left = iconRect.left + (iconRect.width / 2);
    const halfWidth = tooltipRect.width / 2;
    
    if (left - halfWidth < 12) left = halfWidth + 12;
    else if (left + halfWidth > window.innerWidth - 12) left = window.innerWidth - 12 - halfWidth;
    
    let top, transform;
    if (iconRect.top - tooltipRect.height - 15 < 10) {
        top = iconRect.bottom + 10;
        transform = 'translate(-50%, 0)';
    } else {
        top = iconRect.top - 10;
        transform = 'translate(-50%, -100%)';
    }
    
    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.transform = transform;
    tooltipEl.style.visibility = 'visible';
    tooltipEl.style.opacity = '1';
    tooltipEl.style.zIndex = '2147483647';
}

function hideTooltip() {
    const tooltipEl = document.getElementById('globalTooltip');
    if (tooltipEl) {
        tooltipEl.style.opacity = '0';
        tooltipEl.style.visibility = 'hidden';
    }
}

document.addEventListener('mouseover', function(e) {
    const icon = e.target.closest('.info-icon');
    if (icon) showTooltipForIcon(icon);
});

document.addEventListener('mouseout', function(e) {
    const icon = e.target.closest('.info-icon');
    if (icon) hideTooltip();
});

// ==============================================================================
// 6. EVENT LISTENERS
// ==============================================================================
function setupEventListeners() {
    const txForm = document.getElementById('transactionForm');
    if (txForm) {
        txForm.addEventListener('submit', async (e) => { 
            e.preventDefault(); 
            const amt = parseFloat(document.getElementById('amount').value); 
            if (!amt) return; 
            
            const d = new Date(document.getElementById('date').value); 
            d.setHours(new Date().getHours()); 
            const isRecurringCheck = document.getElementById('isRecurring');
            
            const newTx = { 
                id: String(Date.now()), 
                type: currentType, 
                amount: amt, 
                account: document.getElementById('account').value, 
                category: document.getElementById('category').value, 
                note: document.getElementById('note').value, 
                timestamp: d.getTime(), 
                isRecurring: isRecurringCheck ? isRecurringCheck.checked : false
            }; 
            
            transactions.push(newTx); 
            saveTransactionsLocally(); 
            
            document.getElementById('amount').value = ''; 
            document.getElementById('note').value = ''; 
            if (isRecurringCheck) isRecurringCheck.checked = false; 
            
            updateUI(); 
            try { 
                await fetch(`${API_BASE}/add-transaction`, { 
                    method: 'POST', headers: apiHeaders, body: JSON.stringify(newTx) 
                }); 
            } catch(err) {} 
        });
    }

    const wForm = document.getElementById('wishlistForm');
    if (wForm) {
        wForm.addEventListener('submit', async (e) => { 
            e.preventDefault(); 
            const btn = e.target.querySelector('button[type="submit"]'); 
            const orig = btn.innerText; 
            btn.innerText = "Saving..."; 
            btn.disabled = true; 
            
            const linkVal = document.getElementById('wishLink').value;
            let fallbackCategory = 'MANUAL';
            try {
                if (linkVal) fallbackCategory = new URL(linkVal).hostname.replace('www.', '').split('.')[0].toUpperCase();
            } catch(err) {}

            const newItem = { 
                id: String(Date.now()), 
                title: document.getElementById('wishName').value, 
                price: parseFloat(document.getElementById('wishPrice').value) || 0, 
                link: linkVal, 
                imageUrl: document.getElementById('wishImage').value, 
                category: fallbackCategory, 
                wishCategory: document.getElementById('wishCategory').value, 
                timestamp: Date.now() 
            }; 
            
            wishlistItems.push(newItem); 
            saveWishlistLocally(); 
            e.target.reset(); 
            renderWishlist(); 
            
            try { 
                await fetch(`${API_BASE}/add-wishlist`, { 
                    method: 'POST', headers: apiHeaders, body: JSON.stringify(newItem) 
                }); 
            } catch (err) {} 
            finally { btn.innerText = orig; btn.disabled = false; } 
        });
    }

    const mForm = document.getElementById('mediaForm');
    if (mForm) {
        mForm.addEventListener('submit', async (e) => { 
            e.preventDefault(); 
            const btn = e.target.querySelector('button[type="submit"]'); 
            const orig = btn.innerText; 
            btn.innerText = "SAVING..."; 
            btn.disabled = true; 
            
            const statusVal = document.getElementById('mediaStatus').value;
            const ratingVal = statusVal === 'Completed' ? document.getElementById('mediaRating').value : 'Unrated';
            
            const newItem = { 
                id: String(Date.now()), 
                title: document.getElementById('mediaName').value, 
                price: parseFloat(document.getElementById('mediaPrice').value) || 0, 
                link: document.getElementById('mediaLink').value, 
                imageUrl: document.getElementById('mediaImage').value, 
                category: 'MEDIA NODE', 
                wishCategory: document.getElementById('mediaType').value, 
                mediaGenre: document.getElementById('mediaGenre').value, 
                mediaStatus: statusVal, 
                mediaRating: ratingVal, 
                mediaDetails: document.getElementById('mediaDetails').value || '', 
                isMedia: true, 
                timestamp: Date.now() 
            }; 
            
            mediaItems.push(newItem); 
            saveMediaLocally(); 
            e.target.reset(); 
            
            if (document.getElementById('ratingContainer')) document.getElementById('ratingContainer').style.display = 'none'; 
            renderMedia(); 
            
            try { 
                await fetch(`${API_BASE}/add-wishlist`, { 
                    method: 'POST', headers: apiHeaders, body: JSON.stringify(newItem) 
                }); 
            } catch (err) {} 
            finally { btn.innerText = orig; btn.disabled = false; } 
        });
    }
    
    document.addEventListener('click', (e) => { 
        const icon = e.target.closest('.info-icon'); 
        if (icon) { 
            e.stopPropagation(); 
            const tooltipEl = document.getElementById('globalTooltip'); 
            if (tooltipEl && tooltipEl.style.opacity === '1') hideTooltip(); 
            else showTooltipForIcon(icon); 
        } else { 
            hideTooltip(); 
        }
    });
    
    document.addEventListener('selectionchange', () => { 
        if (document.activeElement && document.activeElement.id === 'workspaceNotes') { 
            ['bold', 'italic', 'underline'].forEach(cmd => { 
                const btn = document.getElementById('btn-' + cmd); 
                if (btn) { 
                    if (document.queryCommandState(cmd)) btn.classList.add('editor-active-btn'); 
                    else btn.classList.remove('editor-active-btn'); 
                } 
            }); 
        } 
    });
    
    const wishLinkInput = document.getElementById('wishLink'); 
    if (wishLinkInput) {
        wishLinkInput.addEventListener('input', async () => { 
            setTimeout(async () => { 
                const url = wishLinkInput.value.trim(); 
                if (!url || !url.startsWith('http')) return; 
                
                if (wishScrapeController) wishScrapeController.abort(); 
                wishScrapeController = new AbortController(); 
                
                const lsi = document.getElementById('linkStatusIcon'); 
                if (lsi) { lsi.setAttribute('data-lucide', 'loader-2'); lsi.classList.add('animate-spin'); } 
                const cwb = document.getElementById('cancelWishScrapeBtn'); 
                if (cwb) cwb.classList.remove('hidden'); 
                renderIcons(); 
                
                try { 
                    const res = await fetch(`${API_BASE}/scrape-price`, { 
                        method: 'POST', headers: apiHeaders, body: JSON.stringify({url}), signal: wishScrapeController.signal 
                    }); 
                    const r = await res.json(); 
                    if (r.title && r.title !== 'Saved Product' && document.getElementById('wishName')) document.getElementById('wishName').value = r.title; 
                    if (r.price && document.getElementById('wishPrice')) document.getElementById('wishPrice').value = r.price; 
                    if (r.imageUrl && document.getElementById('wishImage')) document.getElementById('wishImage').value = r.imageUrl; 
                } catch(e) {} 
                finally { 
                    const lsi2 = document.getElementById('linkStatusIcon'); 
                    if (lsi2) { lsi2.setAttribute('data-lucide', 'link'); lsi2.classList.remove('animate-spin'); } 
                    const cwb2 = document.getElementById('cancelWishScrapeBtn'); 
                    if (cwb2) cwb2.classList.add('hidden'); 
                    renderIcons(); 
                } 
            }, 100); 
        });
    }

    const mediaLinkInput = document.getElementById('mediaLink'); 
    if (mediaLinkInput) {
        mediaLinkInput.addEventListener('input', async () => { 
            setTimeout(async () => { 
                const url = mediaLinkInput.value.trim(); 
                if (!url || !url.startsWith('http')) return; 
                
                if (mediaScrapeController) mediaScrapeController.abort(); 
                mediaScrapeController = new AbortController(); 
                
                const mlsi = document.getElementById('mediaLinkStatusIcon'); 
                if (mlsi) { mlsi.setAttribute('data-lucide', 'loader-2'); mlsi.classList.add('animate-spin'); } 
                const cmb = document.getElementById('cancelMediaScrapeBtn'); 
                if (cmb) cmb.classList.remove('hidden'); 
                renderIcons(); 
                
                try { 
                    const res = await fetch(`${API_BASE}/scrape-media`, { 
                        method: 'POST', headers: apiHeaders, body: JSON.stringify({url}), signal: mediaScrapeController.signal 
                    }); 
                    const r = await res.json(); 
                    if (r.title && document.getElementById('mediaName')) document.getElementById('mediaName').value = r.title; 
                    if (r.imageUrl && document.getElementById('mediaImage')) document.getElementById('mediaImage').value = r.imageUrl; 
                    if (r.mediaType && document.getElementById('mediaType')) document.getElementById('mediaType').value = r.mediaType; 
                    if (r.details && document.getElementById('mediaDetails')) document.getElementById('mediaDetails').value = r.details; 
                    if (r.price && document.getElementById('mediaPrice')) document.getElementById('mediaPrice').value = r.price; 
                    if (r.genre) { 
                        const sel = document.getElementById('mediaGenre'); 
                        if (sel) { 
                            for (let i = 0; i < sel.options.length; i++) { 
                                if (sel.options[i].value.toLowerCase() === r.genre.toLowerCase() || r.genre.toLowerCase().includes(sel.options[i].value.toLowerCase())) { 
                                    sel.selectedIndex = i; break; 
                                } 
                            } 
                        } 
                    } 
                } catch(e) {} 
                finally { 
                    const mlsi2 = document.getElementById('mediaLinkStatusIcon'); 
                    if (mlsi2) { mlsi2.setAttribute('data-lucide', 'link'); mlsi2.classList.remove('animate-spin'); } 
                    const cmb2 = document.getElementById('cancelMediaScrapeBtn'); 
                    if (cmb2) cmb2.classList.add('hidden'); 
                    renderIcons(); 
                } 
            }, 100); 
        });
    }
}

// ==============================================================================
// 7. SYSTEM STATE MANAGEMENT
// ==============================================================================
function normalizeTransaction(t) { 
    return { 
        id: String(t.id ?? t.i ?? Date.now()), 
        type: t.type ?? (t.t === 'e' ? 'expense' : 'income'), 
        amount: Number(t.amount ?? t.a) || 0, 
        account: t.account ?? t.ac ?? 'UPI', 
        category: t.category ?? t.c ?? 'Other', 
        note: t.note ?? t.n ?? '', 
        timestamp: Number(t.timestamp ?? t.ts) || Date.now(), 
        isRecurring: !!t.isRecurring 
    }; 
}

function forceCleanSystemState() { 
    try { 
        let txData = safeGetJSON(LOCAL_TX_KEY, []); 
        if (Array.isArray(txData) && txData.length > 0) {
            transactions = txData.map(normalizeTransaction).map(t => {
               if (t.account === 'Credit Card' || t.account === 'Debit Card') t.account = 'UPI';
               return t;
            });
        } else { 
            transactions = [...seedTransactions]; 
            localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(transactions)); 
        } 
    } catch(e) { transactions = [...seedTransactions]; } 
    
    ccLimit = parseFloat(localStorage.getItem('walletCCLimit')) || 50000;
    mediaItems = safeGetJSON('walletMediaBackup', []);
    wishlistItems = safeGetJSON('walletWishlistBackup', []);
    growthItems = safeGetJSON('walletGrowthBackup', []);
    monthlyBudgets = safeGetJSON('walletBudgets', { 'default': 25000 });
}

function saveTransactionsLocally() { localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(transactions)); }
function saveMediaLocally() { localStorage.setItem('walletMediaBackup', JSON.stringify(mediaItems)); }
function saveWishlistLocally() { localStorage.setItem('walletWishlistBackup', JSON.stringify(wishlistItems)); }

// ==============================================================================
// 8. CATEGORY SETTINGS & UI COLORS
// ==============================================================================
const EXPENSE_CATEGORIES = ['Food & Dining', 'Groceries', 'Transport', 'Utilities', 'Electricity charges', 'Mobile Recharge', 'Rent', 'Education', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Subscriptions', 'Investments', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Refund', 'Cashback', 'Other'];
const CAT_COLORS = { 'Food & Dining': '#ef4444', 'Groceries': '#f97316', 'Transport': '#0ea5e9', 'Utilities': '#fbbf24', 'Shopping': '#a855f7', 'Salary': '#10b981', 'Other': '#6b7280' };

function getColor(cat) { 
    if (CAT_COLORS[cat]) return CAT_COLORS[cat]; 
    let hash = 0; 
    for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash); 
    return `hsl(${Math.abs(hash % 360)}, 70%, 55%)`; 
}

// ==============================================================================
// 9. VIEW SWITCHING & FILTERS
// ==============================================================================
function switchMainView(viewName) { 
    const views = ['dashboard', 'investments', 'wishlist', 'media', 'workspace', 'growth']; 
    if (!views.includes(viewName)) return; 
    
    views.forEach(v => { 
        const btn = document.getElementById('nav' + v.charAt(0).toUpperCase() + v.slice(1)); 
        const el = document.getElementById('view' + v.charAt(0).toUpperCase() + v.slice(1)); 
        if (!btn || !el) return;
        
        if (v === viewName) { 
            if(viewName === 'growth') {
                btn.className = 'nav-btn active flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-bold text-sm text-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] uppercase tracking-widest'; 
            } else {
                btn.className = 'nav-btn active flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-bold text-sm text-white shadow-lg uppercase tracking-widest border border-white/20 bg-white/10'; 
            }
            el.classList.add('active'); 
            el.classList.remove('prev', 'next'); 
        } else { 
            if(v === 'growth') {
                btn.className = 'nav-btn flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-bold text-sm text-[#00e5ff] hover:text-white uppercase tracking-widest bg-[#00e5ff]/10 border border-[#00e5ff]/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]';
            } else {
                btn.className = 'nav-btn flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-bold text-sm text-gray-500 hover:text-white uppercase tracking-widest border border-transparent'; 
            }
            el.classList.remove('active'); 
            el.classList.add('next'); 
        } 
    }); 
    
    if (viewName === 'workspace') setTimeout(initWhiteboard, 200); 
    if (viewName === 'dashboard') { updateUI(); updateChartStack(); updateStatsStack(); } 
    renderIcons(); 
}

function switchTab(type) { 
    currentType = type; 
    const tabExpense = document.getElementById('tabExpense');
    const tabIncome = document.getElementById('tabIncome');
    const currencySymbol = document.getElementById('currencySymbol');
    const submitBtn = document.getElementById('submitBtn');
    
    if (tabExpense) tabExpense.className = `flex-1 py-2 text-[10px] font-bold rounded uppercase tracking-widest ${type === 'expense' ? 'bg-white/10 text-[#ef4444] border border-[#ef4444]/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'text-gray-500 hover:text-white border border-transparent'}`; 
    if (tabIncome) tabIncome.className = `flex-1 py-2 text-[10px] font-bold rounded uppercase tracking-widest ${type === 'income' ? 'bg-white/10 text-[#10b981] border border-[#10b981]/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-gray-500 hover:text-white border border-transparent'}`; 
    if (currencySymbol) currencySymbol.className = `pl-4 text-2xl font-black drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] flex-shrink-0 ${type === 'expense' ? 'text-[#ef4444]' : 'text-[#10b981]'}`; 
    if (submitBtn) submitBtn.className = `w-full mt-2 text-white font-black py-4 rounded shadow-[0_0_15px_rgba(0,0,0,0.3)] uppercase tracking-widest text-sm transition-all ${type === 'expense' ? 'bg-gradient-to-r from-[#ef4444] to-[#b91c1c] border border-[#ef4444]/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]' : 'bg-gradient-to-r from-[#10b981] to-[#047857] border border-[#10b981]/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]'}`; 
    populateCategories(); 
}

function populateCategories() { 
    const sel = document.getElementById('category'); 
    if (!sel) return; 
    sel.innerHTML = ''; 
    const categoriesArray = currentType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    categoriesArray.forEach(c => { sel.innerHTML += `<option value="${c}">${c}</option>`; }); 
}

function applyUniversalFilter(val) { 
    selectedMonth = val; 
    document.querySelectorAll('.universal-month-filter').forEach(el => { if (el.value !== val) el.value = val; }); 
    updateUI(); 
}

function updateSearch(val) { searchQuery = val; updateUI(); }
function addAmount(val) { const el = document.getElementById('amount'); if (el) el.value = (parseFloat(el.value) || 0) + val; }
function applyFilter(f) { currentFilter = f; updateUI(); }

function setCCLimit() { 
    const g = prompt(`Set Master Credit Card Limit (₹):`, ccLimit); 
    if (g && !isNaN(g)) { ccLimit = parseFloat(g); localStorage.setItem('walletCCLimit', ccLimit); updateUI(); } 
}

function setGoal() { 
    const g = prompt(`Set Fallback Budget Target for ${selectedMonth} (₹):`, monthlyBudgets[selectedMonth] || monthlyBudgets['default'] || 25000); 
    if (g && !isNaN(g)) { monthlyBudgets[selectedMonth] = parseFloat(g); localStorage.setItem('walletBudgets', JSON.stringify(monthlyBudgets)); updateUI(); } 
}

function setManualAllocationIncome() { 
    const amt = prompt("Set a manual Income override for the Allocation Matrix:\n(Enter 0 to revert to auto-calculated actuals)", localStorage.getItem('manualAllocIncome') || 0); 
    if (amt !== null && !isNaN(amt)) { localStorage.setItem('manualAllocIncome', parseFloat(amt)); updateUI(); } 
}

// ==============================================================================
// 10. EMERGENCY FUND & CREDIT CARD LOGIC
// ==============================================================================
function checkAutoEmergencyFund() { 
    autoEmergencyFundAmt = parseFloat(localStorage.getItem('walletAutoEmergency')) || 0; 
    if (autoEmergencyFundAmt <= 0) return; 
    const now = new Date(); 
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; 
    const hasTransfer = transactions.some(t => t.account === 'Emergency' && t.note === 'Auto-Pilot Deposit' && `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}` === currentMonthKey); 
    
    if (!hasTransfer) { 
        const d = new Date(); d.setDate(1); d.setHours(12); 
        const newTx = { id: String(Date.now()), type: 'income', amount: autoEmergencyFundAmt, account: 'Emergency', category: 'Other', note: 'Auto-Pilot Deposit', timestamp: d.getTime(), isRecurring: true }; 
        transactions.push(newTx); saveTransactionsLocally(); 
    } 
}

function setEmergencyAutoPilot() { 
    autoEmergencyFundAmt = parseFloat(localStorage.getItem('walletAutoEmergency')) || 0; 
    const amt = prompt("Set Auto-Pilot Monthly Deposit for Emergency Fund (₹):\n\n(System will auto-inject this on the 1st of every active month)", autoEmergencyFundAmt); 
    if (amt && !isNaN(amt)) { localStorage.setItem('walletAutoEmergency', parseFloat(amt)); checkAutoEmergencyFund(); updateUI(); } 
}

function editEmergencyFund() { 
    let currentTotal = 0; 
    transactions.forEach(t => { if (t.account === 'Emergency') t.type === 'income' ? currentTotal += t.amount : currentTotal -= t.amount; }); 
    const amt = prompt(`Current Emergency Fund Calculated: ₹${currentTotal}\n\nEnter absolute exact balance to override & sync:`, currentTotal); 
    if (amt !== null && !isNaN(amt)) { 
        const diff = parseFloat(amt) - currentTotal; 
        if (diff !== 0) { 
            const newTx = { id: String(Date.now()), type: diff > 0 ? 'income' : 'expense', amount: Math.abs(diff), account: 'Emergency', category: 'Other', note: 'Balance Override Adjustment', timestamp: Date.now(), isRecurring: false }; 
            transactions.push(newTx); saveTransactionsLocally(); updateUI(); 
        } 
    } 
}

function addEmergencyFund() { 
    const amt = prompt("Inject Manual Capital to Emergency Fund (₹):"); 
    if (amt && !isNaN(amt)) { 
        const newTx = { id: String(Date.now()), type: 'income', amount: parseFloat(amt), account: 'Emergency', category: 'Other', note: 'Manual Addition', timestamp: Date.now(), isRecurring: false }; 
        transactions.push(newTx); saveTransactionsLocally(); updateUI(); 
    } 
}

function editCCBalance() { 
    let currentSpent = 0; 
    transactions.forEach(t => { 
        if (t.account === 'Credit Card' && (selectedMonth === 'all' || `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}` === selectedMonth)) { 
            if (t.type === 'expense') currentSpent += t.amount; else currentSpent -= t.amount; 
        } 
    }); 
    const amt = prompt(`Current CC Spent Calculated for Period: ₹${currentSpent}\n\nEnter absolute exact spent balance to override & sync:`, currentSpent); 
    if (amt !== null && !isNaN(amt)) { 
        const diff = parseFloat(amt) - currentSpent; 
        if (diff !== 0) { 
            const newTx = { id: String(Date.now()), type: diff > 0 ? 'expense' : 'income', amount: Math.abs(diff), account: 'Credit Card', category: 'Other', note: 'Balance Override Adjustment', timestamp: Date.now(), isRecurring: false }; 
            transactions.push(newTx); saveTransactionsLocally(); updateUI(); 
        } 
    } 
}

function payCCBill() { 
    const amt = prompt("Log a Credit Card Bill Payment (₹):"); 
    if (amt && !isNaN(amt)) { 
        const newTx = { id: String(Date.now()), type: 'income', amount: parseFloat(amt), account: 'Credit Card', category: 'Other', note: 'CC Bill Payment', timestamp: Date.now(), isRecurring: false }; 
        transactions.push(newTx); saveTransactionsLocally(); updateUI(); alert(`Logged ₹${amt} payment to Credit Card.`); 
    } 
}

// ==============================================================================
// 11. UTILITY & LEDGER CONTROLS
// ==============================================================================
function exportBackupJSON() { 
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions)); 
    const a = document.createElement('a'); a.setAttribute("href", dataStr); a.setAttribute("download", "Wally_Backup.json"); a.click(); 
}

function deleteTx(id) { 
    if (confirm("Delete entry?")) { 
        const idx = transactions.findIndex(t => t.id === id); 
        if (idx > -1) { 
            deletedQueue.push(transactions[idx]); transactions.splice(idx, 1); saveTransactionsLocally(); updateUI(); updateUndoBtn(); 
            try { fetch(`${API_BASE}/delete-transaction/${id}`, { method: 'DELETE' }); } catch(e) {} 
        } 
    } 
}

function duplicateTx(id) { 
    const tx = transactions.find(t => t.id === id); 
    if (!tx) return; 
    const newTx = { ...tx, id: String(Date.now()), timestamp: Date.now() }; 
    transactions.push(newTx); saveTransactionsLocally(); updateUI(); 
}

function toggleLedgerDetails(id) { 
    const details = document.getElementById(`details-${id}`); 
    const icon = document.getElementById(`chevron-${id}`); 
    if (details.classList.contains('open')) { details.classList.remove('open'); if (icon) icon.style.transform = 'rotate(0deg)'; } 
    else { details.classList.add('open'); if (icon) icon.style.transform = 'rotate(180deg)'; } 
}

function nukeLedger() { 
    if (confirm("DANGER: Are you sure you want to completely wipe all transactions?")) { 
        deletedQueue.push(...transactions); transactions = []; saveTransactionsLocally(); updateUI(); updateUndoBtn(); 
    } 
}

function undoLastDelete() { 
    if (deletedQueue.length > 0) { 
        const restored = deletedQueue.pop(); transactions.push(restored); saveTransactionsLocally(); updateUI(); updateUndoBtn(); 
    } 
}

function updateUndoBtn() { 
    const btn = document.getElementById('undoBtn'); 
    if (!btn) return; 
    if (deletedQueue.length > 0) { 
        btn.classList.remove('opacity-50', 'cursor-not-allowed'); btn.classList.add('text-[#00e5ff]', 'bg-[#00e5ff]/10'); 
        btn.innerHTML = `<i data-lucide="undo-2" class="w-3 h-3 mr-1"></i> Undo (${deletedQueue.length})`; 
    } else { 
        btn.classList.add('opacity-50', 'cursor-not-allowed'); btn.classList.remove('text-[#00e5ff]', 'bg-[#00e5ff]/10'); 
        btn.innerHTML = `<i data-lucide="undo-2" class="w-3 h-3 mr-1"></i> Undo`; 
    } 
    renderIcons(); 
}

// ==============================================================================
// 12. DYNAMIC MATRIX MODAL UI
// ==============================================================================
function configureAllocation() {
    let existingModal = document.getElementById('dynamicAllocModal');
    if (existingModal) existingModal.remove();
    let needs = safeGetJSON('allocNeedsCats', ['Groceries', 'Transport', 'Utilities', 'Electricity charges', 'Mobile Recharge', 'Rent', 'Education', 'Health']);
    let wants = safeGetJSON('allocWantsCats', ['Food & Dining', 'Travel', 'Shopping', 'Entertainment', 'Subscriptions']);
    let wealth = safeGetJSON('allocWealthCats', ['Investments']);

    const modalHtml = `
        <div id="dynamicAllocModal" class="fixed inset-0 bg-black/95 backdrop-blur-xl z-[999999] flex items-center justify-center p-4 animate-slide-up">
            <div class="glass-panel rounded-xl w-full max-w-2xl border border-[#00e5ff]/30 flex flex-col overflow-hidden max-h-[85vh] shadow-[0_0_50px_rgba(0,229,255,0.15)]">
                <div class="flex justify-between items-center p-5 border-b border-[#00e5ff]/20 bg-[#0a0a0c] shrink-0">
                    <h3 class="text-white font-black uppercase tracking-widest text-sm flex items-center drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"><i data-lucide="settings-2" class="w-5 h-5 mr-2 text-[#00e5ff]"></i> Configure Matrix Classes</h3>
                    <button type="button" onclick="document.getElementById('dynamicAllocModal').remove()" class="text-gray-500 hover:text-white bg-white/10 p-2 rounded"><i data-lucide="x" class="w-4 h-4"></i></button>
                </div>
                <div class="p-6 overflow-y-auto ledger-scrollbar space-y-6 bg-black/40">
                    <div>
                        <h4 class="text-[#0ea5e9] font-bold uppercase tracking-widest text-xs mb-3 flex items-center"><i data-lucide="check-square" class="w-3 h-3 mr-1"></i> Core Map (50%)</h4>
                        <div class="flex flex-wrap gap-2">
                            ${EXPENSE_CATEGORIES.map(c => `<label class="flex items-center gap-2 bg-black/60 border border-white/10 rounded px-3 py-2 cursor-pointer hover:border-[#0ea5e9]/50 transition-colors"><input type="checkbox" value="${c}" ${needs.includes(c) ? 'checked' : ''} class="alloc-need form-check text-[#0ea5e9]"><span class="text-[10px] font-bold text-gray-300 uppercase">${c}</span></label>`).join('')}
                        </div>
                    </div>
                    <div>
                        <h4 class="text-[#a855f7] font-bold uppercase tracking-widest text-xs mb-3 flex items-center"><i data-lucide="check-square" class="w-3 h-3 mr-1"></i> Discretion Map (25%)</h4>
                        <div class="flex flex-wrap gap-2">
                            ${EXPENSE_CATEGORIES.map(c => `<label class="flex items-center gap-2 bg-black/60 border border-white/10 rounded px-3 py-2 cursor-pointer hover:border-[#a855f7]/50 transition-colors"><input type="checkbox" value="${c}" ${wants.includes(c) ? 'checked' : ''} class="alloc-want form-check text-[#a855f7]"><span class="text-[10px] font-bold text-gray-300 uppercase">${c}</span></label>`).join('')}
                        </div>
                    </div>
                    <div>
                        <h4 class="text-[#10b981] font-bold uppercase tracking-widest text-xs mb-3 flex items-center"><i data-lucide="check-square" class="w-3 h-3 mr-1"></i> Growth Map (20%)</h4>
                        <div class="flex flex-wrap gap-2">
                            ${EXPENSE_CATEGORIES.map(c => `<label class="flex items-center gap-2 bg-black/60 border border-white/10 rounded px-3 py-2 cursor-pointer hover:border-[#10b981]/50 transition-colors"><input type="checkbox" value="${c}" ${wealth.includes(c) ? 'checked' : ''} class="alloc-wealth form-check text-[#10b981]"><span class="text-[10px] font-bold text-gray-300 uppercase">${c}</span></label>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="p-5 border-t border-[#00e5ff]/20 bg-[#0a0a0c] flex justify-end gap-3 shrink-0">
                    <button onclick="document.getElementById('dynamicAllocModal').remove()" class="px-5 py-2.5 rounded bg-white/5 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 border border-white/10 shadow-sm">Abort</button>
                    <button onclick="saveDynamicAllocation()" class="px-5 py-2.5 rounded bg-[#00e5ff] hover:bg-[#0ea5e9] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.6)]"><i data-lucide="save" class="w-3 h-3 inline mr-1"></i> Lock Architecture</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    renderIcons();
}

function saveDynamicAllocation() {
    const getChecked = (cls) => Array.from(document.querySelectorAll('.' + cls + ':checked')).map(cb => cb.value);
    localStorage.setItem('allocNeedsCats', JSON.stringify(getChecked('alloc-need')));
    localStorage.setItem('allocWantsCats', JSON.stringify(getChecked('alloc-want')));
    localStorage.setItem('allocWealthCats', JSON.stringify(getChecked('alloc-wealth')));
    document.getElementById('dynamicAllocModal').remove();
    updateUI();
}

// ==============================================================================
// 13. CHARTS & STATS STACKS LOGIC
// ==============================================================================
function updateChartStack() { 
    const cards = document.querySelectorAll('.chart-stack-card'); 
    const total = cards.length; 
    if (total === 0) return; 
    cards.forEach((card, idx) => { 
        card.classList.remove('active', 'prev-card', 'next-card'); 
        if (idx === currentChartIdx) card.classList.add('active'); 
        else if (idx === (currentChartIdx - 1 + total) % total) card.classList.add('prev-card'); 
        else if (idx === (currentChartIdx + 1) % total) card.classList.add('next-card'); 
    }); 
    if (document.getElementById('deckIndicator')) document.getElementById('deckIndicator').innerText = `0${currentChartIdx + 1} / 0${total}`; 
    try {
        if (typeof Chart !== 'undefined') Object.values(Chart.instances).forEach(c => c.resize());
    } catch(e) {}
}

function nextChartStack() { 
    const total = document.querySelectorAll('.chart-stack-card').length; 
    currentChartIdx = (currentChartIdx + 1) % total; 
    updateChartStack(); 
}

function prevChartStack() { 
    const total = document.querySelectorAll('.chart-stack-card').length; 
    currentChartIdx = (currentChartIdx - 1 + total) % total; 
    updateChartStack(); 
}

function updateStatsStack() { 
    const cards = document.querySelectorAll('.stats-stack-card'); 
    const total = cards.length; 
    if (total === 0) return; 
    cards.forEach((card, idx) => { 
        card.classList.remove('active', 'prev-card', 'next-card'); 
        if (idx === statsChartIdx) card.classList.add('active'); 
        else if (idx === (statsChartIdx - 1 + total) % total) card.classList.add('prev-card'); 
        else if (idx === (statsChartIdx + 1) % total) card.classList.add('next-card'); 
    }); 
    if (document.getElementById('statsIndicator')) document.getElementById('statsIndicator').innerText = `0${statsChartIdx + 1} / 0${total}`; 
}

function nextStatsStack() { 
    const total = document.querySelectorAll('.stats-stack-card').length; 
    statsChartIdx = (statsChartIdx + 1) % total; 
    updateStatsStack(); 
}

function prevStatsStack() { 
    const total = document.querySelectorAll('.stats-stack-card').length; 
    statsChartIdx = (statsChartIdx - 1 + total) % total; 
    updateStatsStack(); 
}

function initCharts() {
    if (typeof Chart === 'undefined') return;
    
    const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    const elDonut = document.getElementById('walletChart'); 
    if (elDonut) donutChart = new Chart(elDonut, { type: 'doughnut', data: { labels:[], datasets:[{data:[], backgroundColor:[], borderWidth: 0 }] }, options: { ...opts, cutout: '75%' } });
    
    const elAccount = document.getElementById('accountChart'); 
    if (elAccount) accountChart = new Chart(elAccount, { type: 'doughnut', data: { labels:['UPI', 'Debit Card', 'Credit Card', 'Cash'], datasets:[{data:[0,0,0,0], backgroundColor:['#00e5ff', '#3b82f6', '#a855f7', '#10b981'], borderWidth: 0 }] }, options: { ...opts, cutout: '70%', plugins: { legend: { display: true, position: 'bottom', labels: {color: '#9ca3af', font:{family:'Fredoka', size:10}} } } } });
    
    const elTrend = document.getElementById('trendChart'); 
    if (elTrend) lineChart = new Chart(elTrend, { type: 'line', data: { labels:[], datasets:[] }, options: { ...opts, scales: { x: { display: false }, y: { display: false } }, elements: { point: { radius: 0 } } } });
    
    const elRadar = document.getElementById('radarChart'); 
    if (elRadar) radarChart = new Chart(elRadar, { type: 'radar', data: { labels: ['Dining', 'Transport', 'Shopping', 'Utilities', 'Subs'], datasets: [{ data: [0,0,0,0,0], backgroundColor: 'rgba(0, 229, 255, 0.4)', borderColor: '#00e5ff', borderWidth: 2 }] }, options: { ...opts, scales: { r: { angleLines: { color: 'rgba(0,229,255,0.2)' }, grid: { color: 'rgba(0,229,255,0.2)' }, pointLabels: { color: '#00e5ff', font: { family: 'Fredoka', size: 10 } }, ticks: { display: false } } } } });
    
    const elCashflow = document.getElementById('cashflowChart'); 
    if (elCashflow) cashflowChart = new Chart(elCashflow, { type: 'bar', data: { labels: [], datasets: [ { label: 'Income', data: [], backgroundColor: '#10b981', borderRadius:4 }, { label: 'Expense', data: [], backgroundColor: '#ef4444', borderRadius:4 } ] }, options: { ...opts, scales: { x: { display: false }, y: { display: false } } } });
    
    const elWeekly = document.getElementById('weeklyRhythmChart'); 
    if (elWeekly) weeklyRhythmChart = new Chart(elWeekly, { type: 'bar', data: { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], datasets: [{ data: [0,0,0,0,0,0,0], backgroundColor: '#6366f1', borderRadius: 4 }] }, options: { ...opts, scales: { x: { display: false }, y: { display: false } } } });
    
    const elMonthly = document.getElementById('monthlyTrendChart'); 
    if (elMonthly) monthlyTrendChart = new Chart(elMonthly, { type: 'bar', data: { labels: [], datasets: [ { label: 'Expenses', data: [], backgroundColor: '#f97316', borderRadius: 4 } ] }, options: { ...opts, scales: { x: { display: false }, y: { display: false } } } });
    
    const elBurn = document.getElementById('burnTrajectoryChart'); 
    if (elBurn) burnChartObj = new Chart(elBurn, { type: 'line', data: { labels: [], datasets: [{ label: 'Cumulative Spend', data: [], borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)', fill: true, tension: 0.4 }, { label: 'Budget Limit', data: [], borderColor: 'rgba(0,229,255,0.4)', borderDash: [5, 5], pointRadius: 0, fill: false }]}, options: { ...opts, scales: { x: { display: false }, y: { display: false } } } }); 
    
    const elSavings = document.getElementById('savingsTrendChart'); 
    if (elSavings) savingsTrendChartObj = new Chart(elSavings, { type: 'line', data: { labels: [], datasets: [{ label: 'Savings Rate %', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.2)', fill: true, tension: 0.4 }] }, options: { ...opts, scales: { x: { display: false }, y: { display: false } } } }); 

    const elPolar = document.getElementById('polarChart'); 
    if (elPolar) polarChartObj = new Chart(elPolar, { type: 'polarArea', data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] }, options: { ...opts, scales: { r: { display: false } } } }); 
}

function openChartModal(id, t) { 
    document.getElementById('expandModalTitle').innerHTML = `<i data-lucide="bar-chart-2" class="w-5 h-5 mr-2 text-[#00e5ff]"></i> ${t}`; 
    document.getElementById('expandedChartModal').classList.remove('hidden'); 
    renderIcons(); 
    
    if (expandedChartObj) expandedChartObj.destroy(); 
    const chartsMap = { walletChart: donutChart, accountChart: accountChart, radarChart: radarChart, trendChart: lineChart, weeklyRhythmChart: weeklyRhythmChart, cashflowChart: cashflowChart, monthlyTrendChart: monthlyTrendChart, burnTrajectoryChart: burnChartObj, savingsTrendChart: savingsTrendChartObj, polarChart: polarChartObj }; 
    const src = chartsMap[id]; 
    if (!src) return; 
    
    const cfg = { type: src.config.type, data: JSON.parse(JSON.stringify(src.data)), options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: id !== 'radarChart' && id !== 'monthlyTrendChart' && id !== 'polarChart', labels: {color:'#00e5ff', font: {family: 'Fredoka'}} } } } }; 
    if (id !== 'walletChart' && id !== 'radarChart' && id !== 'accountChart' && id !== 'burnTrajectoryChart' && id !== 'savingsTrendChart' && id !== 'polarChart') cfg.options.scales = { x: { grid: { display: false } }, y: { border: { display: false } } }; 
    if (id === 'radarChart') cfg.options.scales = { r: { angleLines: { color: 'rgba(0,229,255,0.2)' }, grid: { color: 'rgba(0,229,255,0.2)' }, pointLabels: { color: '#00e5ff', font: { family: 'Fredoka'} }, ticks: { display: false } } }; 
    if (id === 'burnTrajectoryChart' || id === 'savingsTrendChart') cfg.options.scales = { x: { grid: { color: 'rgba(0,229,255,0.2)' }, ticks: {color: '#00e5ff'} }, y: { grid: { color: 'rgba(0,229,255,0.2)' }, ticks: {color: '#00e5ff'} } }; 
    
    expandedChartObj = new Chart(document.getElementById('expandedChartCanvas'), cfg); 
}

function closeChartModal() { 
    document.getElementById('expandedChartModal').classList.add('hidden'); 
    if (expandedChartObj) expandedChartObj.destroy(); 
}

function openAllTimeChart() { 
    document.getElementById('allTimeModal').classList.remove('hidden'); 
    const sorted = [...transactions].sort((a,b)=>a.timestamp-b.timestamp); 
    const dataMap = {}; 
    const eDate = new Date(); eDate.setHours(23,59,59,999); 
    const sDate = sorted.length > 0 ? new Date(sorted[0].timestamp) : new Date(); sDate.setHours(0,0,0,0); 
    
    for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate()+1)) { 
        const key = d.getFullYear() + '-' + String(d.getMonth()).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); 
        dataMap[key] = { label: d.toLocaleDateString('en-GB',{day:'numeric',month:'short', year:'2-digit'}), i: 0, e: 0 }; 
    } 
    if (sorted.length) { 
        sorted.forEach(t => { 
            if (t.account === 'Emergency') return; 
            const d = new Date(t.timestamp); 
            if (d >= sDate && d <= eDate) { 
                const key = d.getFullYear() + '-' + String(d.getMonth()).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); 
                if (dataMap[key]) { if (t.type === 'income') dataMap[key].i += t.amount; else dataMap[key].e += t.amount; } 
            } 
        }); 
    } 
    const labels = Object.values(dataMap).map(d => d.label); 
    const incData = Object.values(dataMap).map(d => d.i); 
    const expData = Object.values(dataMap).map(d => d.e); 
    
    if (allTimeChartObj) allTimeChartObj.destroy(); 
    allTimeChartObj = new Chart(document.getElementById('allTimeChartCanvas'), { 
        type: 'line', data: { labels: labels, datasets: [ { label: 'Income', data: incData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 }, { label: 'Expense', data: expData, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 } ] }, 
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: {display: false, color: 'rgba(0,229,255,0.1)'}, ticks: {color: '#00e5ff', font: {family: 'Fredoka'}} }, y: { grid: {color: 'rgba(0,229,255,0.1)'}, ticks: {color: '#00e5ff'} } }, plugins: { legend: { display: true, position: 'top', labels: {color:'#fff', font:{family:'Fredoka', size: 12}} } } } 
    }); 
}

function closeAllTimeChart() { 
    document.getElementById('allTimeModal').classList.add('hidden'); 
}

function updatePieChart() { 
    if (!donutChart) return; 
    let ft = transactions.filter(t => t.type === 'expense' && t.account !== 'Emergency' && (selectedMonth === 'all' || `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}` === selectedMonth)); 
    const cat = {}; let tot = 0; 
    ft.forEach(e => { cat[e.category] = (cat[e.category] || 0) + e.amount; tot += e.amount; }); 
    const s = Object.entries(cat).sort((a,b) => b[1] - a[1]); 
    
    if (document.getElementById('chartCenterText')) document.getElementById('chartCenterText').innerText = `₹${tot.toLocaleString()}`; 
    donutChart.data = { labels: s.map(c=>c[0]), datasets: [{ data: s.map(c=>c[1]), backgroundColor: s.map(c=>getColor(c[0])), borderWidth: 0 }] }; 
    donutChart.update(); 
    
    if (document.getElementById('topInsights')) {
        document.getElementById('topInsights').innerHTML = s.length ? s.map(([c, v]) => { 
            const p = Math.round((v/tot)*100); 
            return `<div><div class="flex justify-between text-[10px] font-bold mb-1 min-w-0"><span class="text-[#00e5ff] truncate pr-2">${c}</span><span class="text-gray-400 flex-shrink-0">₹${v} (${p}%)</span></div><div class="w-full bg-black/60 rounded h-1.5 border border-white/5"><div class="h-1.5 rounded" style="width: ${p}%; background-color: ${getColor(c)}"></div></div></div>`; 
        }).join('') : `<div class="flex flex-col items-center justify-center py-10 opacity-70"><i data-lucide="pie-chart" class="w-10 h-10 mb-2 text-[#00e5ff]"></i><p class="text-[10px] text-[#00e5ff] font-bold uppercase tracking-widest mt-2">No data</p></div>`; 
    }
    renderIcons(); 
}

function updateHistoryChart() { 
    const m = {}; 
    transactions.forEach(t => { 
        if (t.account === 'Emergency') return; 
        const k = `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}`; 
        if (!m[k]) m[k] = { i: 0, e: 0 }; 
        t.type === 'income' ? m[k].i += t.amount : m[k].e += t.amount; 
    }); 
    const s = Object.keys(m).sort().filter(k => selectedMonth === 'all' || k === selectedMonth); 
    const l = s.map(k => new Date(k.split('-')[0], k.split('-')[1]-1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }).toUpperCase()); 
    
    if (allMonthsChart) { allMonthsChart.data.labels = l; allMonthsChart.data.datasets[0].data = s.map(k => m[k].i); allMonthsChart.data.datasets[1].data = s.map(k => m[k].e); allMonthsChart.update(); } 
    if (monthlyTrendChart) { monthlyTrendChart.data.labels = l; monthlyTrendChart.data.datasets[0].data = s.map(k => m[k].e); monthlyTrendChart.update(); } 
}

// ==============================================================================
// 14. MAIN UI UPDATE & MONTH TIMELINE BACKFILL ENGINE
// ==============================================================================
function updateUI() {
    let minTs = Date.now();
    if (transactions.length > 0) minTs = Math.min(...transactions.map(t => t.timestamp));
    const dStart = new Date(minTs); dStart.setDate(1);
    const dEnd = new Date(); dEnd.setDate(1);
    const allMonthsList = [];
    let curr = new Date(dStart);
    while (curr <= dEnd) { allMonthsList.push(`${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,'0')}`); curr.setMonth(curr.getMonth()+1); }
    transactions.forEach(t => { const d = new Date(t.timestamp); const mStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; if (!allMonthsList.includes(mStr)) allMonthsList.push(mStr); });
    const nowStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    if (!allMonthsList.includes(nowStr)) allMonthsList.push(nowStr);
    const sortedMonths = [...new Set(allMonthsList)].sort().reverse();
    
    let safeMonth = selectedMonth;
    if (safeMonth !== 'all' && !sortedMonths.includes(safeMonth)) {
        safeMonth = 'all';
        selectedMonth = 'all';
    }
    
    document.querySelectorAll('.universal-month-filter').forEach(sel => { 
        let html = '<option value="all">ALL TIME</option>'; 
        sortedMonths.forEach(m => { const text = new Date(m.split('-')[0], m.split('-')[1] - 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase(); html += `<option value="${m}">${text}</option>`; }); 
        sel.innerHTML = html; 
        sel.value = safeMonth; 
    });

    let aInc = 0, aExp = 0, totBal = 0, eFundTotal = 0;
    transactions.forEach(t => { 
        if (t.account === 'Emergency') { if (t.type === 'income') eFundTotal += t.amount; else eFundTotal -= t.amount; } 
        else { if (t.type === 'income') { aInc += t.amount; totBal += t.amount; } else { aExp += t.amount; totBal -= t.amount; } } 
    });
    if (document.getElementById('netBalance')) document.getElementById('netBalance').innerText = `₹${totBal.toLocaleString()}`; 
    if (document.getElementById('emergencyFundBalance')) document.getElementById('emergencyFundBalance').innerText = `₹${eFundTotal.toLocaleString()}`; 

    const ft = transactions.filter(t => t.account !== 'Emergency' && (selectedMonth === 'all' || `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}` === selectedMonth) && (currentFilter === 'all' || (currentFilter === 'income' && t.type === 'income') || (currentFilter === 'expense' && t.type === 'expense') || (currentFilter === 'High Impact' && t.amount > 10000)) && (!searchQuery || t.category.toLowerCase().includes(searchQuery.toLowerCase()) || (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()))) );
    
    let pInc = 0, pExp = 0, ccExp = 0, uUpi = 0, uDebit = 0, uCredit = 0, uCash = 0;
    let bNeeds = 0, bWants = 0, bWealth = 0, bCarefree = 0;
    let needsCats = safeGetJSON('allocNeedsCats', ['Groceries', 'Transport', 'Utilities', 'Electricity charges', 'Mobile Recharge', 'Rent', 'Education', 'Health']);
    let wantsCats = safeGetJSON('allocWantsCats', ['Food & Dining', 'Travel', 'Shopping', 'Entertainment', 'Subscriptions']);
    let wealthCats = safeGetJSON('allocWealthCats', ['Investments']);

    transactions.forEach(t => { 
        if (t.account === 'Emergency') return;
        if (t.type === 'income') { if (selectedMonth === 'all' || `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}` === selectedMonth) pInc += t.amount; } 
        else { 
            if (selectedMonth === 'all' || `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}` === selectedMonth) {
                pExp += t.amount; 
                if (t.account === 'Credit Card') { ccExp += t.amount; uCredit += t.amount; } 
                else if (t.account === 'Debit Card') { uDebit += t.amount; } 
                else if (t.account === 'UPI') { uUpi += t.amount; } 
                else { uCash += t.amount; }
                
                if (needsCats.includes(t.category)) bNeeds += t.amount; 
                else if (wantsCats.includes(t.category)) bWants += t.amount; 
                else if (wealthCats.includes(t.category)) bWealth += t.amount; 
                else bCarefree += t.amount;
            }
        } 
    });

    if (accountChart) { accountChart.data.datasets[0].data = [uUpi, uDebit, uCredit, uCash]; accountChart.update(); }
    if (document.getElementById('currMonthIncome')) document.getElementById('currMonthIncome').innerText = `₹${pInc.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; 
    if (document.getElementById('currMonthExpense')) document.getElementById('currMonthExpense').innerText = `₹${pExp.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
    
    const manualOverride = parseFloat(localStorage.getItem('manualAllocIncome')) || 0;
    if (document.getElementById('allocIncomeDisplay')) document.getElementById('allocIncomeDisplay').innerText = `Income: ₹${(manualOverride > 0 ? manualOverride : pInc).toLocaleString()} ${manualOverride > 0 ? '(Manual)' : ''}`;
    
    let pNet = pInc - pExp; 
    if (document.getElementById('currMonthNet')) { 
        document.getElementById('currMonthNet').innerText = pNet >= 0 ? `NET: + ₹${pNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAVED` : `NET: - ₹${Math.abs(pNet).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DEFICIT`; 
        document.getElementById('currMonthNet').className = pNet >= 0 ? 'text-xs font-black uppercase tracking-widest text-[#00e5ff] truncate' : 'text-xs font-black uppercase tracking-widest text-[#ef4444] truncate'; 
    }
    
    if (document.getElementById('ccSpent')) document.getElementById('ccSpent').innerText = `₹${ccExp.toLocaleString()}`;
    if (document.getElementById('ccLimitText')) document.getElementById('ccLimitText').innerText = `Limit: ₹${ccLimit.toLocaleString()}`;
    if (document.getElementById('ccProgress')) document.getElementById('ccProgress').style.width = `${Math.min((ccExp/ccLimit)*100, 100)}%`;

    const curDay = selectedMonth === 'all' ? Math.max(1, (new Date().getTime() - ([...transactions].sort((a,b)=>a.timestamp-b.timestamp)[0]?.timestamp || new Date().getTime())) / 86400000) : (selectedMonth === `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}` ? Math.max(1, new Date().getDate()) : new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1], 0).getDate());
    const br = pExp / curDay; 
    const cb = monthlyBudgets[selectedMonth] || monthlyBudgets['default'] || 25000;
    
    const baseCalc = manualOverride > 0 ? manualOverride : (pInc > 0 ? pInc : cb);
    const limitNeeds = baseCalc * 0.50; const limitWants = baseCalc * 0.25; const targetWealth = baseCalc * 0.20; const limitCarefree = baseCalc * 0.05;

    if (document.getElementById('allocNeeds')) {
        document.getElementById('allocNeeds').innerText = `₹${bNeeds.toLocaleString('en-IN')} / ₹${limitNeeds.toLocaleString('en-IN')}`; document.getElementById('progNeeds').style.width = `${Math.min((bNeeds/limitNeeds)*100 || 0, 100)}%`;
        document.getElementById('allocWants').innerText = `₹${bWants.toLocaleString('en-IN')} / ₹${limitWants.toLocaleString('en-IN')}`; document.getElementById('progWants').style.width = `${Math.min((bWants/limitWants)*100 || 0, 100)}%`;
        document.getElementById('allocWealth').innerText = `₹${bWealth.toLocaleString('en-IN')} / ₹${targetWealth.toLocaleString('en-IN')}`; document.getElementById('progWealth').style.width = `${Math.min((bWealth/targetWealth)*100 || 0, 100)}%`;
        document.getElementById('allocCarefree').innerText = `₹${bCarefree.toLocaleString('en-IN')} / ₹${limitCarefree.toLocaleString('en-IN')}`; document.getElementById('progCarefree').style.width = `${Math.min((bCarefree/limitCarefree)*100 || 0, 100)}%`;
    }
    
    if (document.getElementById('recordCount')) document.getElementById('recordCount').innerText = ft.length; 
    if (document.getElementById('statBurnRate')) document.getElementById('statBurnRate').innerText = `₹${Math.round(br).toLocaleString()}`;
    const sr = pInc > 0 ? ((pInc - pExp) / pInc) * 100 : 0; 
    if (document.getElementById('statSavingsRate')) document.getElementById('statSavingsRate').innerText = `${Math.max(0, sr).toFixed(1)}%`;
    let tl = 0; ft.forEach(t => { if (t.type === 'expense' && t.isRecurring) tl += t.amount; }); 
    if (document.getElementById('statLiabilities')) document.getElementById('statLiabilities').innerText = `₹${tl.toLocaleString()}`;
    const run = br > 0 ? totBal / br : 0; 
    if (document.getElementById('statRunway')) document.getElementById('statRunway').innerText = `${Math.round(run)} DAYS`;

    let savingsScore = Math.min(35, (sr / 30) * 35); let runwayScore = Math.min(35, (run / 180) * 35); let liabScore = Math.max(0, 15 - ((tl / pInc) * 15)); let budgetScore = Math.max(0, 15 - ((pExp / cb) * 15));
    let hs = Math.round(savingsScore + runwayScore + liabScore + budgetScore); hs = Math.min(100, Math.max(10, isNaN(hs) ? 50 : hs));

    if (document.getElementById('healthScore')) { 
        document.getElementById('healthScore').innerText = `${hs}/100`; 
        document.getElementById('healthScore').className = `text-5xl font-black truncate w-full uppercase bubbly-text drop-shadow-md ${hs >= 90 ? 'text-[#00e5ff]' : (hs >= 75 ? 'text-[#10b981]' : (hs >= 50 ? 'text-[#fbbf24]' : (hs >= 30 ? 'text-[#f97316]' : 'text-[#ef4444]')))}`; 
    }
    
    if (document.getElementById('weatherIcon') && document.getElementById('weatherText')) { 
        const wIcn = document.getElementById('weatherIcon'); const wTxt = document.getElementById('weatherText'); 
        if (hs >= 90) { wIcn.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4 text-cyan-400 mr-2"></i>`; wTxt.innerText = 'Elite'; wTxt.className = 'text-[10px] text-cyan-400 uppercase font-black tracking-widest ml-1'; } 
        else if (hs >= 75) { wIcn.innerHTML = `<i data-lucide="sun" class="w-4 h-4 text-emerald-400 mr-2"></i>`; wTxt.innerText = 'Excellent'; wTxt.className = 'text-[10px] text-emerald-400 uppercase font-black tracking-widest ml-1'; } 
        else if (hs >= 50) { wIcn.innerHTML = `<i data-lucide="cloud" class="w-4 h-4 text-yellow-400 mr-2"></i>`; wTxt.innerText = 'Stable'; wTxt.className = 'text-[10px] text-yellow-400 uppercase font-black tracking-widest ml-1'; } 
        else if (hs >= 30) { wIcn.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 text-orange-400 mr-2"></i>`; wTxt.innerText = 'At Risk'; wTxt.className = 'text-[10px] text-orange-400 uppercase font-black tracking-widest ml-1'; } 
        else { wIcn.innerHTML = `<i data-lucide="cloud-lightning" class="w-4 h-4 text-rose-500 mr-2 animate-pulse"></i>`; wTxt.innerText = 'Critical'; wTxt.className = 'text-[10px] text-rose-500 uppercase font-black tracking-widest ml-1'; } 
    }

    const cd = {}; ft.filter(t=>t.type==='expense').forEach(e => cd[e.category] = (cd[e.category]||0)+e.amount);
    const sc = Object.entries(cd).sort((a,b)=>b[1]-a[1]);
    if (document.getElementById('statTopExpenseName')) document.getElementById('statTopExpenseName').innerText = sc.length ? sc[0][0] + ' (₹' + sc[0][1].toLocaleString() + ')' : 'OTHER';

    updatePieChart();
    if (radarChart) { radarChart.data.datasets[0].data = ['Food & Dining', 'Transport', 'Shopping', 'Utilities', 'Subscriptions'].map(c => cd[c] || 0); radarChart.update(); }
  
    const dt = [0,0,0,0,0,0,0]; 
    ft.filter(t=>t.type==='expense').forEach(t => { let day = new Date(t.timestamp).getDay(); dt[day === 0 ? 6 : day - 1] += t.amount; });
    if (weeklyRhythmChart) { weeklyRhythmChart.data.datasets[0].data = dt; weeklyRhythmChart.update(); }

    const sf = [...ft].sort((a,b) => sortDirection === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);
    const nwLbl = [...transactions].sort((a,b)=>a.timestamp-b.timestamp).map(t=>new Date(t.timestamp).toLocaleDateString('en-GB',{day:'numeric',month:'short'}));
    
    let globRb = 0; 
    const nwData = [...transactions].sort((a,b)=>a.timestamp-b.timestamp).map(t=>{ if (t.type === 'income') { globRb += t.amount; } else { globRb -= t.amount; } return globRb; });
    
    if (lineChart) { lineChart.data = { labels: nwLbl, datasets: [{ label: 'Net Worth', data: nwData, borderColor: '#0ea5e9', fill: true, backgroundColor: 'rgba(14,165,233,0.1)', tension: 0.4 }] }; lineChart.update(); }

    const d7 = {}; 
    if ([...ft].length) { 
        const sft = [...ft].sort((a,b)=>a.timestamp-b.timestamp); 
        const e = new Date(sft[sft.length-1].timestamp); e.setHours(0,0,0,0); 
        const s = new Date(e); s.setDate(s.getDate()-6); 
        for (let d = new Date(s); d <= e; d.setDate(d.getDate()+1)) { d7[d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})]={i:0,e:0}; }
        sft.forEach(t=>{ 
            const ds = new Date(t.timestamp).toLocaleDateString('en-GB',{day:'numeric',month:'short'}); 
            if (d7[ds]) { if (t.type==='income') { d7[ds].i+=t.amount; } else { d7[ds].e+=t.amount; } }
        }); 
    }
    if (cashflowChart) { cashflowChart.data.labels = Object.keys(d7); cashflowChart.data.datasets[0].data = Object.values(d7).map(d=>d.i); cashflowChart.data.datasets[1].data = Object.values(d7).map(d=>d.e); cashflowChart.update(); }
  
    if (burnChartObj) {
        const mData = ft.filter(t => t.type === 'expense').sort((a,b)=>a.timestamp-b.timestamp);
        let cum = 0; 
        const burnData = mData.map(t => { cum += t.amount; return cum; });
        const burnLabels = mData.map(t => new Date(t.timestamp).getDate());
        const budgData = mData.map(() => cb); 
        burnChartObj.data.labels = burnLabels; burnChartObj.data.datasets[0].data = burnData; burnChartObj.data.datasets[1].data = budgData; burnChartObj.update();
    }

    if (savingsTrendChartObj) {
        const ms = {}; 
        transactions.forEach(t => { 
            if (t.account === 'Emergency') return; 
            const k = `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}`; 
            if (!ms[k]) ms[k] = { i: 0, e: 0 }; 
            if (t.type === 'income') { ms[k].i += t.amount; } else { ms[k].e += t.amount; }
        });
        const savKeys = Object.keys(ms).sort().slice(-6);
        const savLabels = savKeys.map(k => new Date(k.split('-')[0], k.split('-')[1]-1).toLocaleDateString('en-GB', { month: 'short' }));
        const savData = savKeys.map(k => ms[k].i > 0 ? Math.max(0, ((ms[k].i - ms[k].e) / ms[k].i) * 100).toFixed(1) : 0);
        savingsTrendChartObj.data.labels = savLabels; savingsTrendChartObj.data.datasets[0].data = savData; savingsTrendChartObj.update();
    }

    if (polarChartObj) {
        const pCats = {}; ft.filter(t=>t.type==='expense').forEach(e => { pCats[e.category] = (pCats[e.category] || 0) + e.amount; });
        const topPCats = Object.entries(pCats).sort((a,b)=>b[1]-a[1]).slice(0, 6);
        polarChartObj.data.labels = topPCats.map(c=>c[0]); polarChartObj.data.datasets[0].data = topPCats.map(c=>c[1]); polarChartObj.data.datasets[0].backgroundColor = topPCats.map(c=>getColor(c[0])); polarChartObj.update();
    }

    const recList = document.getElementById('recurringWidgetList');
    if (recList) {
        const recs = ft.filter(t => t.type === 'expense' && t.isRecurring); let recTot = 0;
        if (recs.length === 0) {
            recList.innerHTML = `<p class="text-[10px] text-gray-500 text-center mt-6 uppercase tracking-widest font-bold">No active bindings detected.</p>`;
        } else {
            recList.innerHTML = recs.map(t => {
                recTot += t.amount;
                return `<div class="flex justify-between items-center bg-black/60 p-2.5 rounded-xl border border-white/5"><div class="min-w-0 pr-2"><p class="text-[10px] font-bold text-yellow-400 uppercase truncate tracking-widest">${t.category}</p><p class="text-[9px] text-gray-400 truncate">${t.note || 'Subscription'}</p></div><span class="text-xs font-black text-rose-500 shrink-0 pl-2">₹${t.amount}</span></div>`;
            }).join('');
        }
        if (document.getElementById('recurringWidgetTotal')) document.getElementById('recurringWidgetTotal').innerText = `₹${recTot.toLocaleString()}`;
    }

    updateHistoryChart();

    const lst = document.getElementById('ledgerList');
    if (lst) { 
        lst.innerHTML = ft.length ? sf.map(t => `
            <div class="ledger-item flex flex-col p-4 mb-3 relative overflow-hidden bg-black/40 border-l-4 ${t.type==='income'?'border-l-[#10b981]':(t.account==='Emergency'?'border-l-[#0ea5e9]':'border-l-[#ef4444]')} shadow-sm cursor-pointer group" onclick="toggleLedgerDetails('${t.id}')">
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center space-x-4 min-w-0">
                        <div class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-gray-400 flex-shrink-0 shadow-inner">
                            <i data-lucide="${t.type==='income'?'arrow-down-left':(t.account==='Emergency'?'alert-triangle':'credit-card')}" class="w-4 h-4"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <p class="font-bold text-[#e2e8f0] text-sm truncate tracking-wide">${t.category}</p>
                                ${t.isRecurring ? '<span class="bg-yellow-400/20 text-yellow-400 text-[8px] px-1.5 py-0.5 rounded border border-yellow-400/30 shadow-sm flex-shrink-0 tracking-widest">AUTO</span>' : ''}
                            </div>
                            <p class="text-xs text-gray-500 mt-1 truncate tracking-wider">${new Date(t.timestamp).toLocaleDateString('en-GB',{day:'numeric',month:'short', year:'2-digit'})}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0 pl-2">
                        <p class="font-black text-base md:text-lg ${t.type==='income'?'text-[#10b981]':'text-[#ef4444]'}">${t.type==='income'?'+':'-'}₹${t.amount.toLocaleString()}</p>
                        <i id="chevron-${t.id}" data-lucide="chevron-down" class="w-4 h-4 text-blue-400 opacity-50 transition-transform duration-300"></i>
                    </div>
                </div>
                <div id="details-${t.id}" class="ledger-details" onclick="event.stopPropagation()">
                    <div class="flex flex-col gap-3">
                        <div class="grid grid-cols-2 gap-4 bg-black/80 p-3 rounded-xl border border-white/5">
                            <div><p class="text-[9px] text-blue-400 uppercase tracking-widest font-bold">Vector</p><p class="text-xs text-gray-300 font-medium mt-0.5">${t.account}</p></div>
                            <div><p class="text-[9px] text-blue-400 uppercase tracking-widest font-bold">Data String</p><p class="text-xs text-gray-300 font-medium mt-0.5 truncate">${t.note || 'No parameter data'}</p></div>
                        </div>
                        <div class="flex gap-2 justify-end mt-1">
                            <button onclick="duplicateTx('${t.id}')" class="flex items-center px-3 py-1.5 bg-white/5 text-gray-300 hover:bg-[#00e5ff]/20 hover:text-[#00e5ff] border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"><i data-lucide="copy" class="w-3 h-3 mr-1"></i> Clone</button>
                            <button onclick="openEditModal('${t.id}')" class="flex items-center px-3 py-1.5 bg-white/5 text-gray-300 hover:bg-[#0ea5e9]/20 hover:text-[#0ea5e9] border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"><i data-lucide="edit" class="w-3 h-3 mr-1"></i> Modify</button>
                            <button onclick="deleteTx('${t.id}')" class="flex items-center px-3 py-1.5 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 hover:bg-[#ef4444] hover:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"><i data-lucide="trash-2" class="w-3 h-3 mr-1"></i> Purge</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('') : `<div class="flex flex-col items-center justify-center py-16 opacity-40 w-full border border-dashed border-[#00e5ff]/30 rounded-2xl mt-4"><i data-lucide="database" class="w-10 h-10 mb-3 text-[#00e5ff]"></i><p class="text-[#00e5ff] text-[10px] font-bold uppercase tracking-widest">Data Matrix Empty.</p></div>`; 
    }
    renderIcons();
}

// ==============================================================================
// 15. MODAL & EDIT FUNCTIONS
// ==============================================================================
function openEditModal(id) { 
    const tx = transactions.find(t => t.id === id); 
    if (!tx) return; 
    document.getElementById('editId').value = tx.id; 
    document.getElementById('editAmount').value = tx.amount; 
    document.getElementById('editNote').value = tx.note; 
    const d = new Date(tx.timestamp); 
    document.getElementById('editDate').value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; 
    const selCat = document.getElementById('editCategory'); selCat.innerHTML = ''; 
    (tx.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).forEach(c => { selCat.innerHTML += `<option value="${c}">${c}</option>`; }); 
    selCat.value = tx.category; document.getElementById('editAccount').value = tx.account; 
    document.getElementById('editModal').classList.remove('hidden'); renderIcons(); 
}

function closeEditModal() { 
    document.getElementById('editModal').classList.add('hidden'); 
}

function saveEditTx() { 
    const id = document.getElementById('editId').value; 
    const tx = transactions.find(t => t.id === id); 
    if (!tx) return; 
    tx.amount = parseFloat(document.getElementById('editAmount').value) || 0; 
    tx.category = document.getElementById('editCategory').value; 
    tx.account = document.getElementById('editAccount').value; 
    tx.note = document.getElementById('editNote').value; 
    const dateInput = document.getElementById('editDate').value; 
    if (dateInput) { const d = new Date(dateInput); d.setHours(12); tx.timestamp = d.getTime(); } 
    saveTransactionsLocally(); updateUI(); closeEditModal(); 
}

function openEditWishlistModal(id, isMedia) { 
    const item = isMedia ? mediaItems.find(i => i.id === id) : wishlistItems.find(i => i.id === id); 
    if (!item) return; 
    document.getElementById('ewId').value = item.id; 
    document.getElementById('ewIsMedia').value = isMedia ? 'true' : 'false'; 
    document.getElementById('ewTitle').value = item.title || ''; 
    document.getElementById('ewPrice').value = item.price || 0; 
    document.getElementById('ewStore').value = isMedia ? (item.mediaGenre || '') : (item.category || ''); 
    document.getElementById('ewStoreLabel').innerText = isMedia ? 'Genre' : 'Store Name'; 
    document.getElementById('ewImage').value = item.imageUrl || ''; 
    const catSel = document.getElementById('ewCategory'); catSel.innerHTML = ''; 
    if (isMedia) { 
        ['Movie', 'Book', 'Series', 'Anime'].forEach(c => catSel.innerHTML += `<option value="${c}">${c}</option>`); 
        catSel.value = item.wishCategory; document.getElementById('ewMediaExtras').classList.remove('hidden'); 
        document.getElementById('ewStatus').value = item.mediaStatus || 'Planned'; 
        document.getElementById('ewRating').value = item.mediaRating || 'Unrated'; 
        if (item.mediaStatus === 'Completed') document.getElementById('ewRatingContainer').classList.remove('hidden'); 
        else document.getElementById('ewRatingContainer').classList.add('hidden'); 
        document.getElementById('ewStatus').onchange = (e) => { 
            if (e.target.value === 'Completed') document.getElementById('ewRatingContainer').classList.remove('hidden'); 
            else document.getElementById('ewRatingContainer').classList.add('hidden'); 
        }; 
    } else { 
        ['Gadgets', 'Apparel', 'Lifestyle', 'Books', 'Electronics', 'Gaming', 'Furniture', 'Travel', 'Vehicles', 'Health', 'Other'].forEach(c => catSel.innerHTML += `<option value="${c}">${c}</option>`); 
        catSel.value = item.wishCategory; document.getElementById('ewMediaExtras').classList.add('hidden'); 
    } 
    document.getElementById('editWishlistModal').classList.remove('hidden'); 
}

function closeEditWishlistModal() { 
    document.getElementById('editWishlistModal').classList.add('hidden'); 
}

function saveEditWishlist() { 
    const id = document.getElementById('ewId').value; 
    const isMedia = document.getElementById('ewIsMedia').value === 'true'; 
    const item = isMedia ? mediaItems.find(i => i.id === id) : wishlistItems.find(i => i.id === id); 
    if (!item) return; 
    item.title = document.getElementById('ewTitle').value; 
    item.price = parseFloat(document.getElementById('ewPrice').value) || 0; 
    if (isMedia) item.mediaGenre = document.getElementById('ewStore').value; else item.category = document.getElementById('ewStore').value; 
    item.wishCategory = document.getElementById('ewCategory').value; 
    item.imageUrl = document.getElementById('ewImage').value; 
    if (isMedia) { 
        item.mediaStatus = document.getElementById('ewStatus').value; 
        item.mediaRating = item.mediaStatus === 'Completed' ? document.getElementById('ewRating').value : 'Unrated'; 
        saveMediaLocally(); renderMedia(); 
    } else { 
        saveWishlistLocally(); renderWishlist(); 
    } 
    closeEditWishlistModal(); 
}

// ==============================================================================
// 16. WORKSPACE TEXT DRAFT ENGINE
// ==============================================================================
function saveTextDraft() { 
    const notesEl = document.getElementById('workspaceNotes'); 
    if (!notesEl || !notesEl.innerHTML.trim()) return; 
    let drafts = safeGetJSON('textDrafts', []); 
    drafts.unshift({ id: Date.now(), content: notesEl.innerHTML, date: new Date().toLocaleDateString('en-GB', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) }); 
    if (drafts.length > 10) drafts.pop(); 
    localStorage.setItem('textDrafts', JSON.stringify(drafts)); 
    notesEl.innerHTML = ''; renderTextDrafts(); 
}

function renderTextDrafts() { 
    let drafts = safeGetJSON('textDrafts', []); 
    const grid = document.getElementById('textDraftsGrid'); 
    if (!grid) return; 
    if (drafts.length === 0) { grid.innerHTML = '<p class="text-gray-500 text-[10px] uppercase font-bold tracking-widest py-4">No logical drafts saved in memory.</p>'; return; } 
    grid.innerHTML = drafts.map(d => `
        <div class="glass-panel p-3 rounded-xl min-w-[200px] max-w-[200px] flex-shrink-0 cursor-pointer hover:border-[#00e5ff]/50" onclick="restoreTextDraft(${d.id})">
            <div class="flex justify-between items-center mb-2">
                <span class="text-[9px] text-[#00e5ff] font-bold uppercase tracking-widest">${d.date}</span>
                <button onclick="event.stopPropagation(); deleteTextDraft(${d.id})" class="text-[#ef4444] hover:text-white bg-white/5 p-1 rounded transition-colors"><i data-lucide="x" class="w-3 h-3"></i></button>
            </div>
            <div class="text-xs text-gray-300 line-clamp-4 overflow-hidden">${d.content.replace(/<[^>]*>?/gm, ' ')}</div>
        </div>
    `).join(''); 
    renderIcons(); 
}

function restoreTextDraft(id) { 
    let drafts = safeGetJSON('textDrafts', []); 
    const d = drafts.find(x => x.id === id); 
    if (d) { if (confirm("Restore this draft? Current active editor content will be overwritten.")) document.getElementById('workspaceNotes').innerHTML = d.content; } 
}

function deleteTextDraft(id) { 
    if (!confirm("Purge this draft permanently?")) return; 
    let drafts = safeGetJSON('textDrafts', []); 
    drafts = drafts.filter(x => x.id !== id); 
    localStorage.setItem('textDrafts', JSON.stringify(drafts)); renderTextDrafts(); 
}

// ==============================================================================
// 17. BULK SMS & CSV STATEMENT PARSER
// ==============================================================================
function openBulkSMSModal() { document.getElementById('bulkSmsModal').classList.remove('hidden'); renderIcons(); }
function closeBulkSMSModal() { document.getElementById('bulkSmsModal').classList.add('hidden'); document.getElementById('bulkSmsInput').value = ''; }
function processBulkSMS() { 
    const text = document.getElementById('bulkSmsInput').value; if (!text.trim()) return; 
    parseCSVToStaging(text, true); closeBulkSMSModal(); 
}

function handleCSVUpload(e) { 
    const file = e.target.files[0]; if (!file) return; 
    const reader = new FileReader(); 
    reader.onload = function(evt) { const text = evt.target.result; parseCSVToStaging(text, false); }; 
    reader.readAsText(file); e.target.value = ''; 
}

function parseCSVToStaging(textData, isSms = false) { 
    const lines = textData.split('\n'); stagedCSVTransactions = []; 
    lines.forEach((line, i) => { 
        if (!line.trim()) return; 
        let d = Date.now(); let a = 0; let t = 'expense'; let n = line.substring(0, 60); 
        if (isSms) { 
            const amtMatch = line.match(/(?:rs\.?|inr)\s*([\d,]+\.?\d*)/i); 
            if (amtMatch) a = parseFloat(amtMatch[1].replace(/,/g, '')); 
            if (line.toLowerCase().includes('credited') || line.toLowerCase().includes('received')) t = 'income'; 
            const dateMatch = line.match(/(\d{2})[-/](\d{2})[-/](\d{2,4})/); 
            if (dateMatch) { let year = dateMatch[3].length === 2 ? '20'+dateMatch[3] : dateMatch[3]; d = new Date(`${year}-${dateMatch[2]}-${dateMatch[1]}`).getTime(); } 
        } else { 
            const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, '')); 
            if (cols.length < 3) return; 
            cols.forEach(c => { 
                const parsedDate = new Date(c); 
                if (!isNaN(parsedDate) && c.length > 5 && parsedDate.getFullYear() > 2000) d = parsedDate.getTime(); 
                const parsedAmt = parseFloat(c.replace(/[^0-9.-]+/g,"")); 
                if (!isNaN(parsedAmt) && parsedAmt > 0 && parsedAmt !== d && parsedAmt !== new Date().getFullYear()) a = Math.abs(parsedAmt); 
                if (c.toLowerCase().includes('credit') || c.toLowerCase().includes('cr')) t = 'income'; 
            }); 
        } 
        if (a === 0 || isNaN(a)) return; 
        const isDup = transactions.some(tx => Math.abs(tx.amount - a) < 0.01 && tx.type === t && Math.abs(tx.timestamp - d) < 172800000); 
        stagedCSVTransactions.push({ id: 'stage_' + i + '_' + Date.now(), date: new Date(d).toISOString().split('T')[0], amount: a, type: t, note: n, account: 'UPI', category: 'Other', isDuplicate: isDup }); 
    }); 
    if (stagedCSVTransactions.length === 0) { alert("System could not automatically extract exact amounts/dates from this format block."); return; } 
    renderCSVStaging(); document.getElementById('csvReviewModal').classList.remove('hidden'); 
}

function renderCSVStaging() { 
    const container = document.getElementById('csvStagingArea'); 
    container.innerHTML = stagedCSVTransactions.map(tx => `
        <div class="bg-black/60 p-4 rounded-xl border ${tx.isDuplicate ? 'border-orange-500/50' : 'border-[#10b981]/30'} mb-2 relative group transition-colors">
            ${tx.isDuplicate ? '<span class="absolute -top-2.5 -right-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)] uppercase tracking-wider">Warning: Duplicate Trace</span>' : ''}
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div><label class="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Timestamp</label><input type="date" id="csv_date_${tx.id}" value="${tx.date}" class="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-[#00e5ff]"></div>
                <div><label class="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Vector Type</label><select id="csv_type_${tx.id}" class="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white uppercase font-bold"><option value="expense" ${tx.type === 'expense' ? 'selected' : ''}>Outbound</option><option value="income" ${tx.type === 'income' ? 'selected' : ''}>Inbound</option></select></div>
                <div><label class="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Value</label><input type="number" id="csv_amt_${tx.id}" value="${tx.amount}" class="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-[#10b981] font-black"></div>
                <div><label class="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Class Array</label><select id="csv_cat_${tx.id}" class="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white">${EXPENSE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
                <div class="flex items-center gap-2"><div class="flex-grow"><label class="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Metadata</label><input type="text" id="csv_note_${tx.id}" value="${tx.note}" class="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-[10px] text-gray-300 truncate"></div><button onclick="removeStagedCSV('${tx.id}')" class="bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444] hover:text-black p-2 rounded transition-colors mt-3 border border-[#ef4444]/30"><i data-lucide="trash-2" class="w-3 h-3"></i></button></div>
            </div>
        </div>
    `).join(''); 
    renderIcons(); 
}

function removeStagedCSV(id) { 
    stagedCSVTransactions = stagedCSVTransactions.filter(tx => tx.id !== id); 
    renderCSVStaging(); 
    if (stagedCSVTransactions.length === 0) closeCSVModal(); 
}

function closeCSVModal() { 
    document.getElementById('csvReviewModal').classList.add('hidden'); 
    stagedCSVTransactions = []; 
}

function commitCSVImport() { 
    let addedCount = 0; 
    stagedCSVTransactions.forEach(tx => { 
        const dateVal = document.getElementById(`csv_date_${tx.id}`).value; 
        const amtVal = parseFloat(document.getElementById(`csv_amt_${tx.id}`).value); 
        if (isNaN(amtVal) || amtVal <= 0) return; 
        const d = new Date(dateVal); d.setHours(12); 
        const newTx = { id: String(Date.now() + Math.floor(Math.random() * 10000)), type: document.getElementById(`csv_type_${tx.id}`).value, amount: amtVal, category: document.getElementById(`csv_cat_${tx.id}`).value, account: 'UPI', note: document.getElementById(`csv_note_${tx.id}`).value, timestamp: d.getTime(), isRecurring: false }; 
        transactions.push(newTx); addedCount++; 
    }); 
    saveTransactionsLocally(); updateUI(); closeCSVModal(); alert(`System injected ${addedCount} transactions to Ledger.`); 
}

// ==============================================================================
// 18. API & SERVER SYNC FUNCTIONS
// ==============================================================================
async function syncDataFromServer() { 
    try { 
        updateUI(); 
        if (typeof renderWishlist === 'function') renderWishlist(); 
        if (typeof renderMedia === 'function') renderMedia(); 
        
        const [txRes, wRes] = await Promise.all([ 
            fetch(`${API_BASE}/get-transactions`, {cache:'no-store'}).catch(e => null), 
            fetch(`${API_BASE}/get-wishlist`, {cache:'no-store'}).catch(e => null) 
        ]); 
        
        if (txRes && txRes.ok) { 
            const dbTx = (await txRes.json() || []).map(normalizeTransaction); 
            const m = new Map(transactions.map(t => [String(t.id), normalizeTransaction(t)])); 
            dbTx.forEach(t => m.set(String(t.id), normalizeTransaction(t))); 
            transactions = Array.from(m.values()).filter(t => Number.isFinite(t.amount) && t.timestamp); 
            saveTransactionsLocally(); 
        } 
        
        if (wRes && wRes.ok) { 
            const allWish = await wRes.json(); 
            if (Array.isArray(allWish)) { 
                wishlistItems = allWish.filter(w => !w.isMedia); 
                mediaItems = allWish.filter(w => w.isMedia); 
                saveMediaLocally(); 
                saveWishlistLocally(); 
            } 
        } 
    } catch(e) {
        console.log("Notice: Offline storage state active.");
    } finally { 
        saveTransactionsLocally(); 
        updateUI(); 
        if (typeof renderWishlist === 'function') renderWishlist(); 
        if (typeof renderMedia === 'function') renderMedia(); 
    } 
}

async function loadPendingTransactions() { 
    try { 
        const res = await fetch(`${API_BASE}/pending`); 
        if (res.ok) renderPendingUI(await res.json()); 
    } catch (e) {} 
}

function renderPendingUI(pendingTxns) { 
    const container = document.getElementById('pendingContainer'); 
    const list = document.getElementById('pending-list'); 
    if (!pendingTxns || pendingTxns.length === 0) { if (container) container.classList.add('hidden'); return; } 
    if (container) container.classList.remove('hidden'); 
    if (list) list.innerHTML = ''; 
    pendingTxns.forEach(txn => { 
        const isI = txn.type === 'income'; 
        list.innerHTML += `<div class="bg-black/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 border border-white/10 shadow-inner"><div class="flex-1 min-w-0"><div class="flex justify-between md:block"><span class="text-sm font-bold text-gray-200 capitalize truncate">${txn.sender || txn.merchant || 'Bank SMS'}</span><span class="font-black text-base md:hidden ${isI ? 'text-emerald-400' : 'text-rose-400'}">${isI ? '+' : '-'}₹${txn.amount}</span></div><p class="text-[10px] text-[#00e5ff] uppercase tracking-widest font-bold mt-1 inline-flex items-center bg-[#00e5ff]/10 px-2 py-1 rounded border border-[#00e5ff]/20 shadow-sm flex-shrink-0"><i data-lucide="sparkles" class="w-3 h-3 mr-1"></i> C.A.S.P.E.R. Tag: <span class="capitalize tracking-normal ml-1 truncate max-w-[150px]">${txn.category || 'Other'}</span></p><p class="text-gray-400 text-xs mt-2 italic font-medium tracking-wide break-words line-clamp-2">"${txn.rawMessage}"</p></div><div class="flex items-center justify-between md:justify-end md:space-x-4"><span class="hidden md:inline font-black text-xl mr-2 ${isI ? 'text-emerald-400' : 'text-rose-500'}">${isI ? '+' : '-'}₹${txn.amount}</span><div class="flex space-x-2 w-full md:w-auto"><button onclick="handleDecision('${txn.id}', 'reject')" class="flex-1 md:flex-none px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold rounded-xl transition-all border border-rose-500/30 uppercase tracking-wider">Reject</button><button onclick="handleDecision('${txn.id}', 'approve')" class="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold rounded-xl transition-all border border-emerald-500/30 uppercase tracking-wider">Approve</button></div></div></div>`; 
    }); 
    renderIcons(); 
}

async function handleDecision(id, action) { 
    try { 
        const res = await fetch(`${API_BASE}/${action}`, { method: 'POST', headers: apiHeaders, body: JSON.stringify({ id: id }) }); 
        const result = await res.json(); 
        if (result.success) { 
            if (action === 'approve' && result.data) { 
                transactions.push(result.data); 
                saveTransactionsLocally(); 
                updateUI(); 
            } 
            loadPendingTransactions(); 
        } 
    } catch (error) {} 
}

// ==============================================================================
// 19. C.A.S.P.E.R. AI LOGIC
// ==============================================================================
async function getCASPERInsights() { 
    const term = document.getElementById('aiTerminal'); const btn = document.getElementById('aiButton'); 
    if (btn) btn.disabled = true; clearTimeout(aiTypingTimer); 
    if (term) { term.classList.remove('hidden'); term.innerHTML = '<div class="flex flex-col items-center justify-center h-full opacity-60"><i data-lucide="cpu" class="w-10 h-10 mb-3 text-[#00e5ff] animate-pulse"></i><p class="text-center font-bold text-[10px] uppercase tracking-widest text-[#00e5ff]">Processing vectors...</p></div>'; renderIcons(); } 
    try { 
        const res = await fetch(`${API_BASE}/jarvis-advice`, { method: 'POST', headers: apiHeaders, body: JSON.stringify({ transactions: transactions, monthlyBudget: monthlyBudgets[selectedMonth]||25000 }) }); 
        const data = await res.json(); 
        if (term) { 
            term.innerHTML = ''; let i = 0; const txt = data.advice; 
            function typeWriter() { 
                if (i < txt.length) { term.innerHTML += txt.charAt(i); i++; aiTypingTimer = setTimeout(typeWriter, 15); } 
                else { if (btn) btn.disabled = false; } 
            } 
            typeWriter(); 
        } 
    } catch (err) { 
        if (term) term.innerHTML = '<span class="text-red-400">Mainframe Offline.</span>'; 
        if (btn) btn.disabled = false; 
    } 
}

async function getCASPERForecast() { 
    const term = document.getElementById('aiTerminal'); const btn = document.getElementById('aiForecastBtn'); 
    if (btn) btn.disabled = true; clearTimeout(aiTypingTimer); 
    if (term) { term.classList.remove('hidden'); term.innerHTML = '<div class="flex flex-col items-center justify-center h-full opacity-60"><i data-lucide="cpu" class="w-10 h-10 mb-3 text-[#00e5ff] animate-pulse"></i><p class="text-center font-bold text-[10px] uppercase tracking-widest text-[#00e5ff]">Computing trajectory...</p></div>'; renderIcons(); } 
    try { 
        const now = new Date(); const currM = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; const prevM = `${now.getMonth()===0 ? now.getFullYear()-1 : now.getFullYear()}-${String(now.getMonth()===0 ? 12 : now.getMonth()).padStart(2,'0')}`; 
        const currData = transactions.filter(t => t.type==='expense' && `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}` === currM); 
        const prevData = transactions.filter(t => t.type==='expense' && `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}` === prevM); 
        const res = await fetch(`${API_BASE}/jarvis-predict`, { method: 'POST', headers: apiHeaders, body: JSON.stringify({ currentMonthData: currData, previousMonthData: prevData, currentBudget: monthlyBudgets[selectedMonth]||25000 }) }); 
        const data = await res.json(); 
        if (term) term.innerHTML = data.report; 
        if (btn) btn.disabled = false; 
    } catch (err) { 
        if (term) term.innerHTML = '<span class="text-red-400">Prediction Engine Offline.</span>'; 
        if (btn) btn.disabled = false; 
    } 
}

async function openAIReport() { 
    if (document.getElementById('aiReportModal')) document.getElementById('aiReportModal').classList.remove('hidden'); 
    if (document.getElementById('aiReportContent')) document.getElementById('aiReportContent').innerHTML = '<div class="flex flex-col items-center py-12 opacity-60"><i data-lucide="cpu" class="w-12 h-12 mb-4 text-[#00e5ff] animate-pulse"></i><p class="font-bold uppercase tracking-widest text-[#00e5ff] text-sm">C.A.S.P.E.R. is compiling...</p></div>'; 
    renderIcons(); 
    if (reportCharts) Object.values(reportCharts).forEach(c => c.destroy()); 
    reportCharts = {}; 
    const getCatData = (txs) => { const data = {}; txs.filter(t=>t.type==='expense').forEach(t => data[t.category] = (data[t.category]||0)+t.amount); return Object.entries(data).sort((a,b)=>b[1]-a[1]); }; 
    const getTimelineData = (txs) => { const dates = {}; [...txs].sort((a,b)=>a.timestamp-b.timestamp).forEach(t => { const d = new Date(t.timestamp); const m = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; if (!dates[m]) dates[m] = {i:0,e:0}; t.type === 'income' ? dates[m].i += t.amount : dates[m].e += t.amount; }); const labels = Object.keys(dates); return { labels, inc: labels.map(l=>dates[l].i), exp: labels.map(l=>dates[l].e) }; }; 
    const filtered = transactions.filter(t => selectedMonth === 'all' || `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth() + 1).padStart(2, '0')}` === selectedMonth); 
    const monthCats = getCatData(filtered), allCats = getCatData(transactions), monthTime = getTimelineData(filtered), allTime = getTimelineData(transactions); 
    const cOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }; 
    const pOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels:{color:'#9ca3af', font:{family:'Fredoka', size: 10}} } } }; 
    
    const elReportPieM = document.getElementById('reportPieMonth'); if (elReportPieM) reportCharts.pieMonth = new Chart(elReportPieM, { type: 'doughnut', data: { labels: monthCats.map(c=>c[0]), datasets: [{ data: monthCats.map(c=>c[1]), backgroundColor: monthCats.map(c=>getColor(c[0])), borderWidth: 0 }] }, options: pOpts }); 
    const elReportBarM = document.getElementById('reportBarMonth'); if (elReportBarM) reportCharts.barMonth = new Chart(elReportBarM, { type: 'bar', data: { labels: monthCats.slice(0,7).map(c=>c[0]), datasets: [{ label: 'Expenses', data: monthCats.slice(0,7).map(c=>c[1]), backgroundColor: '#ef4444', borderRadius:4 }] }, options: cOpts }); 
    const elReportPieA = document.getElementById('reportPieAll'); if (elReportPieA) reportCharts.pieAll = new Chart(elReportPieA, { type: 'doughnut', data: { labels: allCats.map(c=>c[0]), datasets: [{ data: allCats.map(c=>c[1]), backgroundColor: allCats.map(c=>getColor(c[0])), borderWidth: 0 }] }, options: pOpts }); 
    const elReportBarA = document.getElementById('reportBarAll'); if (elReportBarA) reportCharts.barAll = new Chart(elReportBarA, { type: 'bar', data: { labels: allTime.labels, datasets: [ { label:'Income', data:allTime.inc, backgroundColor:'#10b981', borderRadius:4 }, { label:'Expense', data:allTime.exp, backgroundColor:'#ef4444', borderRadius:4 } ] }, options: cOpts }); 
    const rCats = ['Food & Dining', 'Transport', 'Shopping', 'Utilities', 'Subscriptions']; 
    const elRadarM = document.getElementById('reportRadarMonth'); if (elRadarM) reportCharts.radarMonth = new Chart(elRadarM, { type: 'radar', data: { labels: rCats, datasets: [{ data: rCats.map(c => monthCats.find(m => m[0] === c)?.[1] || 0), backgroundColor: 'rgba(0, 229, 255, 0.4)', borderColor: '#00e5ff', borderWidth: 2 }] }, options: cOpts }); 
    const elRadarA = document.getElementById('reportRadarAll'); if (elRadarA) reportCharts.radarAll = new Chart(elRadarA, { type: 'radar', data: { labels: rCats, datasets: [{ data: rCats.map(c => allCats.find(m => m[0] === c)?.[1] || 0), backgroundColor: 'rgba(16, 185, 129, 0.4)', borderColor: '#10b981', borderWidth: 2 }] }, options: cOpts }); 
    const elTrendM = document.getElementById('reportTrendMonth'); if (elTrendM) reportCharts.trendMonth = new Chart(elTrendM, { type: 'line', data: { labels: monthTime.labels, datasets: [ { label:'Inc', data:monthTime.inc, borderColor:'#10b981' }, { label:'Exp', data:monthTime.exp, borderColor:'#ef4444' } ] }, options: cOpts }); 
    const elTrendA = document.getElementById('reportTrendAll'); if (elTrendA) reportCharts.trendAll = new Chart(elTrendA, { type: 'line', data: { labels: allTime.labels, datasets: [ { label:'Inc', data:allTime.inc, borderColor:'#10b981', fill:true, backgroundColor:'rgba(16, 185, 129, 0.2)' }, { label:'Exp', data:allTime.exp, borderColor:'#ef4444', fill:true, backgroundColor:'rgba(239, 68, 68, 0.2)' } ] }, options: cOpts }); 
    
    const mSums = {}; transactions.forEach(t => { const m = `${new Date(t.timestamp).getFullYear()}-${String(new Date(t.timestamp).getMonth()+1).padStart(2,'0')}`; if (!mSums[m]) mSums[m] = { inc:0, exp:0, cats:{} }; t.type === 'income' ? mSums[m].inc += t.amount : (mSums[m].exp += t.amount, mSums[m].cats[t.category] = (mSums[m].cats[t.category]||0)+t.amount); }); 
    try { 
        const res = await fetch(`${API_BASE}/jarvis-report`, { method: 'POST', headers: apiHeaders, body: JSON.stringify({ compiledMonths: mSums, monthlyBudget: monthlyBudgets[selectedMonth]||25000, selectedMonth: selectedMonth }) }); 
        if (document.getElementById('aiReportContent')) document.getElementById('aiReportContent').innerHTML = (await res.json()).report; 
    } catch(e) { 
        if (document.getElementById('aiReportContent')) document.getElementById('aiReportContent').innerHTML = '<span class="text-red-400">Process Failed. Offline Mode Active.</span>'; 
    } 
}

function closeAIReport() { 
    document.getElementById('aiReportModal').classList.add('hidden'); 
}

// ==============================================================================
// 20. PDF & EXCEL EXPORTS
// ==============================================================================
function exportReportPDF() { 
    const doc = new window.jspdf.jsPDF(); doc.setFontSize(16); doc.text("C.A.S.P.E.R. Report", 14, 15); doc.setFontSize(10); 
    if (document.getElementById('aiReportContent')) doc.text(doc.splitTextToSize(document.getElementById('aiReportContent').innerText, 180), 14, 25); 
    doc.save('CASPER_Report.pdf'); 
}

function exportReportExcel() { 
    const wb = XLSX.utils.book_new(); 
    if (document.getElementById('aiReportContent')) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(document.getElementById('aiReportContent').innerText.split('\n').filter(t=>t.trim()).map(t=>({"AI Insight":t}))), "Analysis"); 
    XLSX.writeFile(wb, "CASPER_Report.xlsx"); 
}

// ==============================================================================
// 21. WORKSPACE: WHITEBOARD & CANVAS LOGIC
// ==============================================================================
function loadWorkspace() {
    try { renderKeepNotes(); } catch(e) {}
    try { renderTextDrafts(); } catch(e) {}
    try { 
        fetch(`${API_BASE}/get-workspace`)
            .then(res => { if (res.ok) return res.json(); })
            .then(data => { 
                if (data && data.notes && document.getElementById('workspaceNotes')) document.getElementById('workspaceNotes').innerHTML = data.notes; 
                if (data && data.whiteboard && document.getElementById('whiteboardCanvas')) { 
                    const canvas = document.getElementById('whiteboardCanvas'); 
                    const img = new Image(); 
                    img.onload = () => canvas.getContext('2d').drawImage(img, 0, 0); 
                    img.src = data.whiteboard; 
                } 
            }).catch(e => null); 
    } catch(e) {} 
    try { renderRecentSaves(); } catch(e) {}
}

function exportWorkspacePDF() {
    const { jsPDF } = window.jspdf; const doc = new jsPDF(); doc.setFontSize(12);
    const wText = document.getElementById('workspaceNotes') ? document.getElementById('workspaceNotes').innerText : ''; 
    let notes = safeGetJSON('keepNotes', []); 
    let kText = notes.map(n => (n.title ? n.title.toUpperCase() + '\n' : '') + n.body + '\n---').join('\n\n');
    const fullText = "DEEP WORKSPACE NOTES\n\n" + wText + "\n\n\nMEMORY CARDS\n\n" + kText; 
    doc.text(doc.splitTextToSize(fullText, 180), 10, 10); 
    doc.save('CASPER_Workspace.pdf');
}

function deleteLastSync() { 
    if (confirm("Delete the most recent workspace canvas save?")) { 
        let history = safeGetJSON('workspaceHistory', []); 
        if (history.length > 0) { history.shift(); localStorage.setItem('workspaceHistory', JSON.stringify(history)); renderRecentSaves(); } 
    } 
}

function renderRecentSaves() { 
    const history = safeGetJSON('workspaceHistory', []); 
    const grid = document.getElementById('recentSavesGrid'); 
    if (!grid) return; 
    if (history.length === 0) { grid.innerHTML = `<p class="text-gray-500 text-[10px] uppercase font-bold tracking-widest py-4">No canvas drafts saved.</p>`; return; } 
    grid.innerHTML = history.map((h, i) => `<div onclick="restoreWorkspace(${i})" class="glass-panel p-3 rounded-xl min-w-[200px] max-w-[200px] flex-shrink-0 cursor-pointer hover:border-[#00e5ff]/50"><div class="flex justify-between items-center mb-2"><span class="text-[9px] text-[#00e5ff] font-bold uppercase tracking-widest">${h.date}</span></div>${h.whiteboard && h.whiteboard.length > 50 ? `<div class="h-20 w-full opacity-70 bg-center bg-cover bg-no-repeat rounded-lg border border-white/10" style="background-image: url('${h.whiteboard}')"></div>` : `<div class="h-20 w-full flex items-center justify-center text-[#00e5ff] border border-white/5 rounded-lg"><i data-lucide="pen-tool" class="w-6 h-6"></i></div>`}</div>`).join(''); 
    renderIcons(); 
}

function restoreWorkspace(index) { 
    if (confirm("Restore this canvas draft? Current whiteboard content will be overwritten.")) { 
        const history = safeGetJSON('workspaceHistory', []); 
        const data = history[index]; 
        if (data && data.whiteboard && document.getElementById('whiteboardCanvas')) { 
            const canvas = document.getElementById('whiteboardCanvas'); 
            const img = new Image(); 
            img.onload = () => { canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height); canvas.getContext('2d').drawImage(img, 0, 0); }; 
            img.src = data.whiteboard; 
        } 
    } 
}

function saveWbDraft() {
    let wbData = ''; 
    if (document.getElementById('whiteboardCanvas')) wbData = document.getElementById('whiteboardCanvas').toDataURL(); 
    if (!wbData || wbData.length < 50) return; 
    let history = safeGetJSON('workspaceHistory', []); 
    history.unshift({ id: Date.now(), date: new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}), whiteboard: wbData }); 
    if (history.length > 8) history.pop(); 
    localStorage.setItem('workspaceHistory', JSON.stringify(history)); 
    renderRecentSaves();
}

function toggleWhiteboardFullscreen() {
    const wbContainer = document.getElementById('whiteboardContainer'); 
    if (!wbContainer) return; 
    wbContainer.classList.toggle('fullscreen-wb');
    setTimeout(() => { 
        const canvas = document.getElementById('whiteboardCanvas'); 
        if (canvas) { 
            const ctx = canvas.getContext('2d'); 
            const rect = canvas.getBoundingClientRect(); 
            const temp = ctx.getImageData(0,0,canvas.width, canvas.height); 
            canvas.width = rect.width; 
            canvas.height = rect.height; 
            ctx.putImageData(temp, 0, 0); 
        } 
    }, 300);
}

function insertChecklist() { 
    const id = 'chk_' + Date.now(); 
    const html = `<div class="chk-item"><input type="checkbox" id="${id}"><label for="${id}" contenteditable="true">New Task</label></div>`; 
    document.execCommand('insertHTML', false, html); 
    saveWorkspace(); 
}

function applyFontSize(val) { 
    document.execCommand("fontSize", false, "7"); 
    const fontElements = document.getElementById('workspaceNotes').getElementsByTagName("font"); 
    for (let i = 0, len = fontElements.length; i < len; ++i) { 
        if (fontElements[i].size == "7") { fontElements[i].removeAttribute("size"); fontElements[i].style.fontSize = val + "px"; } 
    } 
}

function adjustFontSize(change) { 
    const input = document.getElementById('wsFontSizeInput'); 
    if (input) { 
        let val = parseInt(input.value) + change; 
        if (val >= 8 && val <= 72) { input.value = val; applyFontSize(val); } 
    } 
}

function applyFontColor(color) { 
    document.execCommand('styleWithCSS', false, true); 
    document.execCommand('foreColor', false, color); 
}

async function saveWorkspace() {
    const notesEl = document.getElementById('workspaceNotes'); 
    if (!notesEl) return;
    notesEl.querySelectorAll('input[type="checkbox"]').forEach(cb => { 
        if (cb.checked) cb.setAttribute('checked', 'checked'); 
        else cb.removeAttribute('checked'); 
    });
    const saveBtn = document.querySelector('button[onclick="saveWorkspace()"]'); 
    let origText = ''; 
    if (saveBtn) { origText = saveBtn.innerHTML; saveBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Syncing'; renderIcons(); }
    let wbData = ''; 
    if (document.getElementById('whiteboardCanvas')) wbData = document.getElementById('whiteboardCanvas').toDataURL();
    try { 
        await fetch(`${API_BASE}/save-workspace`, { method: 'POST', headers: apiHeaders, body: JSON.stringify({ notes: notesEl.innerHTML, whiteboard: wbData }) }); 
        if (saveBtn) saveBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4 mr-2"></i> Synced!'; 
    } catch(e) { 
        if (saveBtn) saveBtn.innerHTML = '<i data-lucide="x" class="w-4 h-4 mr-2"></i> Error'; 
    }
    renderIcons(); 
    setTimeout(() => { if (saveBtn) saveBtn.innerHTML = origText; renderIcons(); }, 2000);
}

function saveWbState() { 
    if (document.getElementById('whiteboardCanvas')) { 
        const canvas = document.getElementById('whiteboardCanvas'); 
        wbHistory.push(canvas.toDataURL()); 
        if (wbHistory.length > 20) wbHistory.shift(); 
    } 
}

function undoWhiteboard() { 
    if (wbHistory && wbHistory.length > 0 && document.getElementById('whiteboardCanvas')) { 
        wbHistory.pop(); 
        const canvas = document.getElementById('whiteboardCanvas'); 
        const ctx = canvas.getContext('2d'); 
        ctx.clearRect(0,0, canvas.width, canvas.height); 
        if (wbHistory.length > 0) { 
            const img = new Image(); 
            img.onload = () => ctx.drawImage(img, 0, 0); 
            img.src = wbHistory[wbHistory.length - 1]; 
        } 
    } 
}

// ==============================================================================
// 22. WHITEBOARD DRAWING PHYSICS
// ==============================================================================
function initWhiteboard() { 
    const canvas = document.getElementById('whiteboardCanvas'); 
    if (!canvas) return; 
    const ctx = canvas.getContext('2d'); 
    const rect = canvas.parentElement.getBoundingClientRect(); 
    if (canvas.width !== rect.width || canvas.height !== rect.height) { 
        canvas.width = rect.width; 
        canvas.height = rect.height; 
        if (wbHistory.length > 0) { 
            const img = new Image(); 
            img.onload = () => ctx.drawImage(img, 0, 0); 
            img.src = wbHistory[wbHistory.length - 1]; 
        } 
    } 
    if (wbHistory.length === 0) saveWbState(); 
    
    canvas.removeEventListener('mousedown', startPos); 
    canvas.removeEventListener('mousemove', draw); 
    canvas.removeEventListener('mouseup', endPos); 
    canvas.removeEventListener('mouseout', endPos); 
    
    canvas.addEventListener('mousedown', startPos); 
    canvas.addEventListener('mousemove', draw); 
    canvas.addEventListener('mouseup', endPos); 
    canvas.addEventListener('mouseout', endPos); 
    
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPos(e.touches[0]); }, {passive:false}); 
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); }, {passive:false}); 
    canvas.addEventListener('touchend', endPos); 

    function startPos(e) { 
        const bcr = canvas.getBoundingClientRect(); 
        const scaleX = canvas.width / bcr.width; 
        const scaleY = canvas.height / bcr.height; 
        const x = ((e.clientX ?? e.touches[0].clientX) - bcr.left) * scaleX; 
        const y = ((e.clientY ?? e.touches[0].clientY) - bcr.top) * scaleY; 

        if (isTextMode) { 
            const text = prompt("Enter Text Designation:"); 
            if (text) { 
                saveWbState(); 
                ctx.font = `${document.getElementById('wbFontSize')?document.getElementById('wbFontSize').value:24}px ${document.getElementById('wbFontFamily')?document.getElementById('wbFontFamily').value:'Fredoka'}`; 
                ctx.fillStyle = penColor; 
                ctx.fillText(text, x, y); 
            } 
            return; 
        } 
        
        isDrawing = true; 
        saveWbState(); 
        startX = x; 
        startY = y; 
        savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
        if (['pen', 'highlighter', 'eraser'].includes(currentTool)) { 
            ctx.beginPath(); 
            ctx.moveTo(startX, startY); 
            draw(e); 
        } 
    } 

    function draw(e) { 
        if (!isDrawing || isTextMode) return; 
        const bcr = canvas.getBoundingClientRect(); 
        const scaleX = canvas.width / bcr.width; 
        const scaleY = canvas.height / bcr.height; 
        const x = ((e.clientX ?? e.touches[0].clientX) - bcr.left) * scaleX; 
        const y = ((e.clientY ?? e.touches[0].clientY) - bcr.top) * scaleY; 
        
        ctx.lineWidth = penWidth; 
        ctx.lineCap = 'round'; 
        ctx.lineJoin = 'round'; 
        
        if (currentTool === 'eraser') { 
            ctx.globalCompositeOperation = 'destination-out'; 
            ctx.strokeStyle = 'rgba(0,0,0,1)'; 
        } else if (currentTool === 'highlighter') { 
            ctx.globalCompositeOperation = 'source-over'; 
            let c = /^#([A-Fa-f0-9]{3}){1,2}$/.test(penColor) ? penColor.substring(1).split('') : null; 
            if (c) { 
                if (c.length==3) c=[c[0],c[0],c[1],c[1],c[2],c[2]]; 
                c='0x'+c.join(''); 
                ctx.strokeStyle = `rgba(${(c>>16)&255}, ${(c>>8)&255}, ${c&255}, 0.4)`; 
            } else { 
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)'; 
            } 
        } else { 
            ctx.globalCompositeOperation = 'source-over'; 
            ctx.strokeStyle = penColor; 
        } 
        
        if (['pen', 'highlighter', 'eraser'].includes(currentTool)) { 
            ctx.lineTo(x, y); 
            ctx.stroke(); 
        } else { 
            ctx.putImageData(savedImageData, 0, 0); 
            ctx.beginPath(); 
            if (currentTool === 'line') { ctx.moveTo(startX, startY); ctx.lineTo(x, y); } 
            else if (currentTool === 'rect') { ctx.rect(startX, startY, x - startX, y - startY); } 
            else if (currentTool === 'circle') { ctx.arc(startX, startY, Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2)), 0, 2 * Math.PI); } 
            else if (currentTool === 'arrow') { 
                const angle = Math.atan2(y - startY, x - startX); 
                ctx.moveTo(startX, startY); ctx.lineTo(x, y); 
                ctx.lineTo(x - 15 * Math.cos(angle - Math.PI / 6), y - 15 * Math.sin(angle - Math.PI / 6)); 
                ctx.moveTo(x, y); ctx.lineTo(x - 15 * Math.cos(angle + Math.PI / 6), y - 15 * Math.sin(angle + Math.PI / 6)); 
            } 
            ctx.stroke(); 
        } 
    } 
    function endPos() { if (isDrawing) { isDrawing = false; ctx.beginPath(); } } 
}

function setTool(tool) { 
    currentTool = tool; 
    isTextMode = false; 
    if (tool === 'eraser') { if (document.getElementById('wbWidthSlider')) document.getElementById('wbWidthSlider').value = 20; penWidth = 20; } 
    else if (tool === 'highlighter') { if (document.getElementById('wbWidthSlider')) document.getElementById('wbWidthSlider').value = 15; penWidth = 15; } 
    else if (tool === 'pen') { if (document.getElementById('wbWidthSlider')) document.getElementById('wbWidthSlider').value = 2; penWidth = 2; } 
    
    document.querySelectorAll('.wb-tool').forEach(btn => btn.classList.remove('tool-active')); 
    const activeBtn = document.getElementById('tool-' + tool); 
    if (activeBtn) activeBtn.classList.add('tool-active'); 
}

function setTextMode() { 
    isTextMode = true; 
    currentTool = 'text'; 
    document.querySelectorAll('.wb-tool').forEach(btn => btn.classList.remove('tool-active')); 
    if (document.getElementById('tool-text')) document.getElementById('tool-text').classList.add('tool-active'); 
}

function setPenWidth(w) { penWidth = w; }

function setPenColor(c) { 
    penColor = c; 
    if (document.getElementById('wbColorPicker')) document.getElementById('wbColorPicker').value = c; 
    if (currentTool === 'eraser' || isTextMode) { isTextMode = false; setTool('pen'); } 
}

function clearWhiteboard() { 
    if (confirm("Clear entire whiteboard buffer?")) { 
        saveWbState(); 
        if (document.getElementById('whiteboardCanvas')) document.getElementById('whiteboardCanvas').getContext('2d').clearRect(0, 0, 10000, 10000); 
    } 
}

// ==============================================================================
// 23. C.A.S.P.E.R. CHAT SYSTEM
// ==============================================================================
function toggleCasper() { 
    const chatWindow = document.getElementById('casperChatWindow'); 
    if (chatWindow.classList.contains('hidden')) { chatWindow.classList.remove('hidden'); chatWindow.classList.add('flex', 'animate-slide-up'); } 
    else { chatWindow.classList.add('hidden'); chatWindow.classList.remove('flex', 'animate-slide-up'); } 
}

function sendCasperMessage() { 
    const input = document.getElementById('casperInput'); 
    const msg = input.value.trim(); 
    if (!msg) return; 
    
    const body = document.getElementById('casperChatBody'); 
    body.innerHTML += `<div class="bg-black/60 border border-[#00e5ff]/40 p-3 rounded-xl rounded-tr-none w-10/12 ml-auto text-white shadow-[0_0_10px_rgba(0,229,255,0.2)]">${msg}</div>`; 
    input.value = ''; 
    body.scrollTop = body.scrollHeight; 
    
    setTimeout(() => { 
        const loaderId = 'loader_' + Date.now(); 
        body.innerHTML += `<div id="${loaderId}" class="bg-[#00e5ff]/10 border border-[#00e5ff]/30 p-3 rounded-xl rounded-tl-none w-10/12 text-[#00e5ff] flex items-center gap-2"><i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Processing...</div>`; 
        renderIcons(); 
        body.scrollTop = body.scrollHeight; 
        
        setTimeout(() => { 
            document.getElementById(loaderId).remove(); 
            let responseText = "I have received your command. Logged: '" + msg + "'."; 
            const mLower = msg.toLowerCase(); 
            if (mLower.includes("explain") || mLower.includes("help") || mLower.includes("how to")) {
                responseText = "Welcome to Wally MK 2. <br><br><b>Dashboard:</b> Cashflow and telemetry analytics.<br><b>Investments:</b> Projections, debt clearance & FIRE metrics.<br><b>Wishlist:</b> Save target goals and savings speeds.<br><b>Vault:</b> Track media nodes.<br><b>Workspace:</b> Drafts and canvas focus space.<br><b>Growth:</b> Weakness analysis and automated countermeasures.<br><br>Use the 'Smart Entry' block on the Dashboard to paste SMS or CSV statements."; 
            }
            body.innerHTML += `<div class="bg-[#00e5ff]/10 border border-[#00e5ff]/30 p-3 rounded-xl rounded-tl-none w-10/12 text-[#00e5ff] shadow-[inset_0_0_10px_rgba(0,229,255,0.1)]">${responseText}</div>`; 
            body.scrollTop = body.scrollHeight; 
        }, 1500); 
    }, 400); 
}

// ==============================================================================
// 24. GROWTH & SELF-IMPROVEMENT LOGIC
// ==============================================================================
function addGrowthItem() { 
    const descInput = document.getElementById('growthDesc'); 
    const desc = descInput.value.trim(); 
    if (!desc) return; 

    const newItem = { id: 'growth_' + Date.now(), desc: desc, timestamp: Date.now() }; 
    growthItems.push(newItem); 
    localStorage.setItem('walletGrowthBackup', JSON.stringify(growthItems)); 
    descInput.value = ''; 
    renderGrowthList(); 
}

function renderGrowthList() { 
    const list = document.getElementById('growthList'); 
    if (!list) return; 
    if (growthItems.length === 0) { 
        list.innerHTML = `<p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold text-center py-4">No active targets defined.</p>`; 
        return; 
    } 
    list.innerHTML = growthItems.map(item => `
        <div class="bg-black/60 border border-white/5 p-4 rounded-xl flex justify-between items-center gap-4 transition-colors hover:border-[#10b981]/50">
            <div class="flex-1 min-w-0">
                <p class="text-xs text-white font-bold truncate">${item.desc}</p>
                <p class="text-[9px] text-gray-500 uppercase tracking-widest mt-1">${new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
            <div class="flex gap-2 shrink-0">
                <button onclick="generateCountermeasure('${item.id}')" class="bg-[#00e5ff]/10 text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_10px_rgba(0,229,255,0.2)]"><i data-lucide="cpu" class="w-3 h-3 inline mr-1"></i> Analyze</button>
                <button onclick="deleteGrowthItem('${item.id}')" class="bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444] hover:text-white p-1.5 rounded-lg transition-colors border border-[#ef4444]/30"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
            </div>
        </div>
    `).join(''); 
    renderIcons(); 
}

function deleteGrowthItem(id) { 
    growthItems = growthItems.filter(i => i.id !== id); 
    localStorage.setItem('walletGrowthBackup', JSON.stringify(growthItems)); 
    renderGrowthList(); 
}

function saveTimetable(val) { 
    localStorage.setItem('walletGrowthTimetable', val); 
}

function generateCountermeasure(id) { 
    const item = growthItems.find(i => i.id === id); 
    if (!item) return; 
    const term = document.getElementById('growthTerminal'); 
    if (!term) return; 

    term.innerHTML = '<div class="flex flex-col items-center justify-center h-full opacity-60"><i data-lucide="cpu" class="w-12 h-12 mb-3 text-[#00e5ff] animate-pulse"></i><p class="text-center font-bold text-xs uppercase tracking-widest text-[#00e5ff]">Synthesizing Countermeasures...</p></div>'; 
    renderIcons(); 

    setTimeout(() => { 
        let advice = ""; 
        const lowerDesc = item.desc.toLowerCase(); 

        if (lowerDesc.includes("bike") || lowerDesc.includes("riding")) { 
            advice = "<h3 class='text-white font-black uppercase tracking-widest border-b border-[#00e5ff]/30 pb-2 mb-3 drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]'>PROTOCOL: TWO-WHEEL MASTERY</h3><p class='mb-2'><b class='text-[#fbbf24]'>Phase 1:</b> Master balance without pedals. Lower the seat so feet touch the ground and stride forward.</p><p class='mb-2'><b class='text-[#fbbf24]'>Phase 2:</b> Practice visual targeting. Do not look at the front wheel; look exactly where you want to go.</p><p><b class='text-[#fbbf24]'>Phase 3:</b> Momentum is stability. Speed generates gyroscopic force.</p>"; 
        } else if (lowerDesc.includes("english") || lowerDesc.includes("converse")) { 
            advice = "<h3 class='text-white font-black uppercase tracking-widest border-b border-[#00e5ff]/30 pb-2 mb-3 drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]'>PROTOCOL: LINGUISTIC FLUENCY</h3><p class='mb-2'><b class='text-[#10b981]'>Phase 1:</b> Shadowing. Listen to English podcasts and repeat sentences out loud exactly as spoken to build muscle memory.</p><p class='mb-2'><b class='text-[#10b981]'>Phase 2:</b> Vocabulary blocks. Learn phrases, not individual words.</p><p><b class='text-[#10b981]'>Phase 3:</b> High-frequency exposure. Switch all device languages to English.</p>"; 
        } else if (lowerDesc.includes("inferiority") || lowerDesc.includes("complex")) { 
            advice = "<h3 class='text-white font-black uppercase tracking-widest border-b border-[#00e5ff]/30 pb-2 mb-3 drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]'>PROTOCOL: COGNITIVE RECALIBRATION</h3><p class='mb-2'><b class='text-[#ef4444]'>Phase 1:</b> Isolate the variable. Lacking a specific skill is a data point, not a measure of overall worth.</p><p class='mb-2'><b class='text-[#ef4444]'>Phase 2:</b> The 'Day 1' Acceptance. Everyone starts at Level 0. Grant yourself permission to be a beginner.</p><p><b class='text-[#ef4444]'>Phase 3:</b> Micro-wins. Set a daily goal so small it is impossible to fail.</p>"; 
        } else if (lowerDesc.includes("guitar")) { 
            advice = "<h3 class='text-white font-black uppercase tracking-widest border-b border-[#00e5ff]/30 pb-2 mb-3 drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]'>PROTOCOL: ACOUSTIC CONDITIONING</h3><p class='mb-2'><b class='text-[#a855f7]'>Phase 1:</b> Finger dexterity. Spend 10 minutes daily purely on pressing frets to build calluses.</p><p class='mb-2'><b class='text-[#a855f7]'>Phase 2:</b> The 4-Chord Axis. Learn G, C, D, and Em to unlock thousands of songs.</p><p><b class='text-[#a855f7]'>Phase 3:</b> Rhythm over accuracy. Play slowly and stay on beat.</p>"; 
        } else { 
            advice = `<h3 class='text-white font-black uppercase tracking-widest border-b border-[#00e5ff]/30 pb-2 mb-3 drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]'>PROTOCOL: GENERAL OPTIMIZATION</h3><p class='text-gray-400 italic mb-4'>Target Analyzed: "${item.desc}"</p><p class='mb-2'><b class='text-[#00e5ff]'>Phase 1:</b> Deconstruct the obstacle into 3 micro-tasks.</p><p class='mb-2'><b class='text-[#00e5ff]'>Phase 2:</b> Allocate exactly 15 minutes daily in your Active Schedule to execute Micro-Task 1.</p><p><b class='text-[#00e5ff]'>Phase 3:</b> Review progress weekly. Adjust vector as necessary.</p>`; 
        } 
        term.innerHTML = `<div class="space-y-2 animate-slide-up">${advice}</div>`; 
    }, 2000); 
}

// ==============================================================================
// 25. INVESTMENTS: FORECASTING LOGIC
// ==============================================================================
function forecastAsset() {
    const ticker = document.getElementById('stockTicker').value.trim().toUpperCase();
    if(!ticker) return;
    const term = document.getElementById('stockTerminal');
    term.innerHTML = '<div class="flex flex-col items-center justify-center h-full opacity-60"><i data-lucide="loader-2" class="w-8 h-8 mb-2 text-[#00e5ff] animate-spin"></i><p class="text-center font-bold uppercase tracking-widest text-[#00e5ff]">Connecting to Market API...</p></div>';
    renderIcons();

    setTimeout(() => {
        const forecasts = [
            `<h4 class="text-white font-black border-b border-[#00e5ff]/30 pb-1 mb-2">TARGET: ${ticker}</h4><p class="mb-2"><b>Short-Term Volatility:</b> HIGH. Recent market data indicates potential consolidation around current support levels.</p><p class="mb-2"><b>AI Confidence Score:</b> 72%. Technical indicators (RSI & MACD) show slightly oversold conditions.</p><p><b>Verdict:</b> Favorable for SIP accumulation. Wait for confirmation breakout before lump-sum injection.</p>`,
            `<h4 class="text-white font-black border-b border-[#00e5ff]/30 pb-1 mb-2">TARGET: ${ticker}</h4><p class="mb-2"><b>Short-Term Volatility:</b> LOW. Asset is currently tracking long-term moving averages tightly.</p><p class="mb-2"><b>AI Confidence Score:</b> 88%. Strong macroeconomic fundamentals supporting upward channel.</p><p><b>Verdict:</b> Hold or accumulate. Strong defensive asset for portfolio stability.</p>`,
            `<h4 class="text-white font-black border-b border-[#00e5ff]/30 pb-1 mb-2">TARGET: ${ticker}</h4><p class="mb-2"><b>Short-Term Volatility:</b> EXTREME. High speculative trading volume detected in the last 48 hours.</p><p class="mb-2"><b>AI Confidence Score:</b> 45%. Indicators are currently giving mixed signals.</p><p><b>Verdict:</b> High risk. Restrict exposure to Carefree (5%) matrix limits.</p>`
        ];
        const rand = forecasts[Math.floor(Math.random() * forecasts.length)];
        term.innerHTML = `<div class="animate-slide-up">${rand}</div>`;
    }, 1800);
}
// Attach to window so HTML can trigger it
window.forecastAsset = forecastAsset;

// ==============================================================================
// 26. MISC LISTENERS & GLOBAL BINDINGS
// ==============================================================================
let sortDirection = 'desc';
function toggleSort() { 
    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc'; 
    const label = document.getElementById('sortLabel'); 
    if (label) label.innerText = sortDirection === 'desc' ? 'Newest' : 'Oldest'; 
    updateUI(); 
}

window.addEventListener('resize', () => requestAnimationFrame(() => {
    try {
        if (typeof Chart !== 'undefined') {
            Object.values(Chart.instances).forEach(c => c.resize());
        }
    } catch(e) {}
    
    try {
        const canvas = document.getElementById('whiteboardCanvas');
        if (canvas && canvas.parentElement) {
            const ctx = canvas.getContext('2d');
            const rect = canvas.parentElement.getBoundingClientRect();
            const temp = ctx.getImageData(0,0,canvas.width, canvas.height);
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.putImageData(temp, 0, 0);
        }
    } catch(e) {}
}));

// ==============================================================================
// 27. DYNAMIC HABIT MATRIX LOGIC
// ==============================================================================
function loadHabits() {
    customHabits = safeGetJSON('walletCustomHabits', [
        {id: 'h1', text: 'Read 10 Pages'},
        {id: 'h2', text: 'LEVEL//UP Fitness Protocol'},
        {id: 'h3', text: '15 Mins Skill Practice'},
        {id: 'h4', text: 'Zero Zero-Days (Consistency)'}
    ]);
    habitHistory = safeGetJSON('walletHabitHistory', {});
    
    renderHabits();
    renderHabitHistory();
}

function renderHabits() {
    const container = document.getElementById('dynamicHabitList');
    if (!container) return;
    
    const today = new Date().toLocaleDateString('en-CA');
    const todayData = habitHistory[today] || [];

    container.innerHTML = customHabits.map(h => `
        <div class="chk-item flex justify-between items-center group mb-2 bg-black/60 p-2 rounded border border-white/5 hover:border-[#a855f7]/50 transition-colors">
            <div class="flex items-center flex-grow">
                <input type="checkbox" id="${h.id}" ${todayData.includes(h.id) ? 'checked' : ''} onchange="saveHabits()" class="mr-3 accent-[#a855f7] cursor-pointer">
                <label for="${h.id}" class="text-xs text-white font-medium cursor-pointer w-full">${h.text}</label>
            </div>
            <button onclick="deleteHabit('${h.id}')" class="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-rose-500/20 rounded"><i data-lucide="x" class="w-3 h-3"></i></button>
        </div>
    `).join('');
    renderIcons();
}

function addNewHabit() {
    const input = document.getElementById('newHabitInput');
    const val = input.value.trim();
    if (!val) return;
    
    customHabits.push({ id: 'h_' + Date.now(), text: val });
    localStorage.setItem('walletCustomHabits', JSON.stringify(customHabits));
    input.value = '';
    renderHabits();
    renderHabitHistory(); 
}

function deleteHabit(id) {
    if (confirm("Delete this habit tracker?")) {
        customHabits = customHabits.filter(h => h.id !== id);
        localStorage.setItem('walletCustomHabits', JSON.stringify(customHabits));
        renderHabits();
        renderHabitHistory(); 
    }
}

function saveHabits() {
    const today = new Date().toLocaleDateString('en-CA');
    const checkedIds = [];
    
    customHabits.forEach(h => {
        const el = document.getElementById(h.id);
        if (el && el.checked) checkedIds.push(h.id);
    });
    
    habitHistory[today] = checkedIds;
    localStorage.setItem('walletHabitHistory', JSON.stringify(habitHistory));
    renderHabitHistory();
}

function renderHabitHistory() {
    const logEl = document.getElementById('habitHistoryLog');
    if (!logEl) return;
    
    let html = '';
    const total = customHabits.length;
    
    for(let i=1; i<=3; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-CA');
        const completed = habitHistory[dateStr] ? habitHistory[dateStr].length : 0;
        
        let colorClass = 'text-gray-500';
        if (completed === total && total > 0) colorClass = 'text-[#10b981]';
        else if (completed > 0) colorClass = 'text-[#fbbf24]';
        
        html += `<div class="flex justify-between items-center border-b border-white/5 pb-1 mt-1">
            <span class="text-gray-400">${d.toLocaleDateString('en-GB', {weekday:'short', month:'short', day:'numeric'})}</span>
            <span class="${colorClass} font-bold">${completed} / ${total}</span>
        </div>`;
    }
    
    logEl.innerHTML = html || '<p>No history yet.</p>';
}

window.addNewHabit = addNewHabit;
window.deleteHabit = deleteHabit;
window.saveHabits = saveHabits;

// Start everything when the DOM loads
document.addEventListener('DOMContentLoaded', () => {
    init(); 
});
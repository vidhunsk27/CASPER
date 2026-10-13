const KEY = "levelup_home_v7";

const base = {
  profile: { name: "Vidhun", experience: "E-Rank (Beginner)", equipment: "Bodyweight Only (System Default)", duration: "15–20 min" },
  xp: 0, level: 1, streak: 0, bestStreak: 0, sessions: 0, checks: 0,
  weight: 72, height: 178,
  fatigue: 30, restoration: 85, dailyExertion: "sedentary",
  lastDate: null,
  quests: [], food: [], history: [], activity: [0, 0, 0, 0, 0, 0, 0],
  stats: { str: 10, vit: 10, agi: 10, int: 10, per: 10 }
};

const $ = id => document.getElementById(id);

let s;
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved) {
    if (!saved.stats) saved.stats = { str: 10, vit: 10, agi: 10, int: 10, per: 10 };
    s = Object.assign(structuredClone(base), saved);
  } else {
    s = structuredClone(base);
  }
} catch (e) {
  s = structuredClone(base);
}

// Chart Variables
let cRadar, cActivity, cFatigue, cXp, cCal, cPro, cQuest, cDungeon;

/* =========================================================
   1. TOOLTIPS & SYSTEM LORE
========================================================= */
function showTooltipForIcon(icon) {
    const infoText = icon.getAttribute('data-info');
    if (!infoText) return;
    
    let tooltipEl = document.getElementById('globalTooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'globalTooltip';
        document.body.appendChild(tooltipEl);
    }
    
    tooltipEl.innerHTML = infoText;
    tooltipEl.style.display = 'block';
    tooltipEl.style.visibility = 'hidden';
    tooltipEl.style.textTransform = 'none'; 
    
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

/* =========================================================
   2. DYNAMIC AURA (REMOVED AVATAR IMAGE)
========================================================= */
function applySystemAura() {
    const root = document.documentElement;
    const hero = document.querySelector('.hero');
    const avatar = document.getElementById('playerAvatar');

    let accent, accent2, glow, heroBg;

    if (s.level >= 40) {
        // S-Rank Monarch (Red/Black)
        accent = '#ef4444'; accent2 = '#b91c1c';
        glow = '0 0 30px rgba(239, 68, 68, 0.6)';
        heroBg = "url('https://i.pinimg.com/736x/e8/38/c2/e838c2db763e00cf42e7de1953ddba13.jpg')";
    } else if (s.level >= 20) {
        // A/B-Rank (Violet/Purple)
        accent = '#a855f7'; accent2 = '#7e22ce';
        glow = '0 0 25px rgba(168, 85, 247, 0.6)';
        heroBg = "url('https://i.pinimg.com/736x/f6/b0/46/f6b046db4215ab7a33fc290dcdaee1e7.jpg')";
    } else if (s.level >= 10) {
        // C-Rank (Deep Blue)
        accent = '#3b82f6'; accent2 = '#1d4ed8';
        glow = '0 0 25px rgba(59, 130, 246, 0.6)';
        heroBg = "url('https://i.pinimg.com/736x/43/40/8c/43408c5c365314e3ecb9f0ff4cc96c21.jpg')";
    } else {
        // E-Rank (Cyan Base)
        accent = '#00e5ff'; accent2 = '#0284c7';
        glow = '0 0 20px rgba(0, 229, 255, 0.4)';
        heroBg = "none";
    }

    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent2', accent2);
    root.style.setProperty('--glow', glow);

    if (hero) {
        hero.style.backgroundImage = `linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(3, 7, 18, 0.98)), ${heroBg}`;
        hero.style.backgroundSize = "cover";
        hero.style.backgroundPosition = "center top";
        hero.style.backgroundBlendMode = "overlay";
    }
    
    if (avatar) {
        // Ensuring avatar stays clean and glowing, no image override
        avatar.style.background = accent2;
        avatar.style.color = '#fff';
        avatar.style.boxShadow = glow;
        avatar.textContent = (s.profile.name && s.profile.name !== "Player") ? s.profile.name.charAt(0).toUpperCase() : "V";
    }
}

/* =========================================================
   3. EXERCISE DATABASE & TUTORIAL LINKS
========================================================= */
const EXERCISE_GUIDES = {
  "Push-ups": {
    target: "Chest, Anterior Deltoids, Triceps",
    desc: "The primary pushing staple of the System. Place palms shoulder-width apart, tighten the core, and descend until your chest touches the floor.",
    verification: ["Elbows tucked at a 45-degree angle", "Full vertical lockout at the peak of each rep", "Hips level without sagging"],
    videoQuery: "proper push up form guide"
  },
  "Squats": {
    target: "Quadriceps, Glutes, Hamstrings",
    desc: "Foundation lower body protocol. Hips push backward and downward while feet remain flat. Knees track over toes.",
    verification: ["Hip crease descends lower than knees", "Heels stay planted on the floor", "Chest stays elevated"],
    videoQuery: "how to do squats proper form tutorial"
  },
  "Plank": {
    target: "Transverse Abdominis, Core, Shoulders",
    desc: "Isometric core bracing. Drive elbows into the floor and squeeze glutes to build an unbreakable kinetic chain.",
    verification: ["Straight line from crown to heels", "No hyperextension of lumbar spine", "Steady nasal breathing maintained"],
    videoQuery: "plank form tutorial"
  },
  "Glute bridges": {
    target: "Gluteus Maximus, Posterior Chain",
    desc: "Lie flat on back with knees bent at 90 degrees. Drive through heels to elevate pelvis until hips hit full extension.",
    verification: ["Zero arching in lower back", "Glutes fully clenched at peak contraction", "Knees aligned with shoulders"],
    videoQuery: "how to do a glute bridge correctly"
  },
  "Incline push-up": {
    target: "Upper Chest, Core stability",
    desc: "Regulated push-up against an elevated platform. Decreases gravitational resistance while perfecting upper body lockout.",
    verification: ["Straight spine from neck to ankles", "Full depth down to the elevated edge", "Controlled 2-second negative descent"],
    videoQuery: "incline push up form demonstration"
  },
  "Pike hold": {
    target: "Shoulders, Trapezius, Core",
    desc: "Handstand regression. Hips hinged high in the air with head relaxed between arms, driving isometric force through the palms.",
    verification: ["Arms locked straight", "Hips pushed vertical over shoulders", "Head neutral between triceps"],
    videoQuery: "pike hold exercise demonstration"
  },
  "Reverse lunges": {
    target: "Quadriceps, Glutes, Calves, Balance",
    desc: "Step one leg backward and drop back knee until it hovers 1 inch off the floor. Front shin remains vertical.",
    verification: ["Front knee remains tracking inline with toes", "Torso stays upright without leaning forward", "Power drives through front heel"],
    videoQuery: "reverse lunge form guide"
  }
};

const workouts = [
  { cat: "full", tag: "DAILY RAID", title: "Daily Quest: Prepare", desc: "100/100/100/10km requirement adapted for indoor conditioning.", items: ["Squats — 3 × 15", "Push-ups — 3 × 10", "Glute bridges — 3 × 15", "Plank — 3 × 30 sec"], xp: 45, stat: "str" },
  { cat: "push", tag: "PUSH STAT", title: "Strength Awakening", desc: "Heavy pushing load to increase the STR attribute.", items: ["Push-ups — 3 × 10", "Incline push-up — 3 × 10", "Pike hold — 3 × 20 sec", "Plank — 2 × 30 sec"], xp: 30, stat: "str" },
  { cat: "legs", tag: "AGILITY STAT", title: "Legs of the Assassin", desc: "Explosive lower body conditioning to increase the AGI attribute.", items: ["Squats — 3 × 15", "Reverse lunges — 3 × 10/side", "Glute bridges — 3 × 15"], xp: 35, stat: "agi" },
  { cat: "core", tag: "VITALITY STAT", title: "Vitality Armor", desc: "Rigid trunk stabilization to reinforce the VIT attribute.", items: ["Plank — 3 × 35 sec", "Glute bridges — 3 × 12", "Incline push-up — 2 × 8"], xp: 30, stat: "vit" },
  { cat: "mobility", tag: "PERCEPTION STAT", title: "Sensory Tuning", desc: "Active decompression to drop fatigue and raise the PER attribute.", items: ["Glute bridges — 2 × 10", "Plank — 2 × 20 sec"], xp: 20, stat: "per" }
];

const qPool = [
  { t: "[Daily Quest] Physical Conditioning", d: "Survive 20 minutes of continuous training.", xp: 25 },
  { t: "[Daily Quest] Muscle Overload", d: "Complete 1 Dungeon combat training session.", xp: 30 },
  { t: "[Daily Quest] Mana Recovery", d: "Log your nutrition fuel intake to restore MP.", xp: 15 },
  { t: "[Daily Quest] System Calibration", d: "Submit daily condition scan update.", xp: 15 },
  { t: "[Emergency Quest] Zero-Day Defiance", d: "Never allow a zero-training day to pass.", xp: 25 }
];

function save() { localStorage.setItem(KEY, JSON.stringify(s)); }
function day() { return new Date().toISOString().slice(0, 10); }
function id(x) { return [...x].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 11).toString(16); }

function ensureDay() {
  if (s.lastDate !== day()) {
    s.lastDate = day();
    s.quests = qPool.slice().sort(() => Math.random() - 0.5).slice(0, 4).map(q => ({ ...q, id: id(q.t + day()), done: false }));
    s.food = [];
    save();
  }
}

function rank() {
  if (s.level >= 40) return "S-Rank";
  if (s.level >= 30) return "A-Rank";
  if (s.level >= 20) return "B-Rank";
  if (s.level >= 10) return "C-Rank";
  if (s.level >= 5) return "D-Rank";
  return "E-Rank";
}

function getTitle() {
  if (s.level >= 50) return "Shadow Monarch";
  if (s.level >= 35) return "Demon Slayer";
  if (s.level >= 20) return "Wolf Assassin";
  if (s.level >= 10) return "The Awakened";
  return "None";
}

/* =========================================================
   4. AI DYNAMIC EXERCISE REGULATION ENGINE
========================================================= */
function readiness() {
  const fatiguePenalty = (s.fatigue || 30) * 0.55;
  const restorationBonus = (s.restoration || 85) * 0.45;
  let score = Math.round(55 - fatiguePenalty + restorationBonus);

  if (s.dailyExertion === "heavy") score -= 15;
  if (s.dailyExertion === "moderate") score -= 5;
  
  return Math.max(10, Math.min(100, score));
}

function generateDynamicPlan(r) {
  let baseReps = 10 + Math.floor(s.stats.str / 5);
  let volMult = r > 80 ? 1.3 : (r < 40 ? 0.5 : 1.0);
  
  let pSquat = Math.round((baseReps + 5) * volMult);
  let pPush = Math.round(baseReps * volMult);
  let pHold = Math.round((30 + s.stats.vit) * volMult);

  if (r < 40) {
    return {
      title: "Penalty Recovery Protocol",
      sub: `AI Regulation: Heavy fatigue detected. System forced a ${Math.round((1-volMult)*100)}% volume deload.`,
      badge: "DELOAD REGULATED",
      items: [`Plank — 2 × ${pHold} sec`, `Glute bridges — 2 × ${pSquat}`, `Push-ups — 2 × ${pPush}`]
    };
  } else if (r < 75) {
    return {
      title: "Standard Dungeon Raid",
      sub: "AI Regulation: Biometric state balanced. Standard combat workload optimized.",
      badge: "BALANCED",
      items: [`Squats — 3 × ${pSquat}`, `Push-ups — 3 × ${pPush}`, `Glute bridges — 3 × ${pSquat}`, `Plank — 3 × ${pHold} sec`]
    };
  } else {
    return {
      title: "Monarch's Overdrive Raid",
      sub: `AI Regulation: Condition peak (90%+). Intensity and reps multiplied by x${volMult.toFixed(1)}.`,
      badge: "OVERDRIVE",
      items: [`Jump Squats — 3 × ${pSquat}`, `Explosive Push-ups — 3 × ${pPush}`, `Reverse lunges — 3 × ${pSquat-2}/side`, `Plank — 3 × ${pHold} sec`]
    };
  }
}

function toast(message, isDanger = false) {
  const element = $("toast");
  if (!element) return;
  element.textContent = message;
  element.style.background = isDanger ? "var(--danger)" : "var(--accent)";
  element.classList.add("show");
  setTimeout(() => { element.classList.remove("show"); }, 2500);
}

/* =========================================================
   5. MAIN RENDER SEQUENCE
========================================================= */
function render() {
  ensureDay();
  const r = readiness();
  applySystemAura();
  
  if (typeof lucide !== 'undefined') lucide.createIcons();

  if ($("today")) $("today").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }).toUpperCase();
  if ($("greeting")) $("greeting").textContent = `Arise, ${s.profile.name || "Vidhun"}.`;
  
  if ($("rank")) $("rank").textContent = rank();
  if ($("sideRank")) $("sideRank").textContent = rank();
  if ($("sideName")) $("sideName").textContent = (s.profile.name || "Vidhun").toUpperCase();
  
  if ($("playerTitle")) {
    $("playerTitle").textContent = getTitle();
    $("playerTitle").style.color = s.level >= 50 ? "var(--accent)" : (s.level >= 20 ? "var(--accent2)" : "#fff");
  }

  if ($("level")) $("level").textContent = String(s.level).padStart(2, "0");
  if ($("sideLevel")) $("sideLevel").textContent = String(s.level).padStart(2, "0");
  if ($("orbLevel")) $("orbLevel").textContent = s.level;

  if ($("xpLabel")) $("xpLabel").textContent = `${s.xp % 100} / 100`;
  if ($("xpbar")) $("xpbar").style.width = (s.xp % 100) + "%";
  
  if ($("streak")) $("streak").textContent = s.streak;
  if ($("readiness")) $("readiness").textContent = r;
  if ($("questDone")) $("questDone").textContent = `${s.quests.filter(q => q.done).length}/4`;
  if ($("weekMinutes")) $("weekMinutes").textContent = s.activity.reduce((a, b) => a + b, 0);

  // Status Attributes
  if ($("statStr")) $("statStr").textContent = s.stats.str;
  if ($("statVit")) $("statVit").textContent = s.stats.vit;
  if ($("statAgi")) $("statAgi").textContent = s.stats.agi;
  if ($("statInt")) $("statInt").textContent = s.stats.int;
  if ($("statPer")) $("statPer").textContent = s.stats.per;

  // HP / MP Calculation
  const maxHp = 100 + (s.stats.vit * 10);
  const currentHp = Math.round(maxHp * (r / 100));
  if ($("hpVal")) $("hpVal").textContent = `${currentHp}/${maxHp}`;
  if ($("hpBarFill")) $("hpBarFill").style.width = `${(currentHp/maxHp)*100}%`;

  const maxMp = 30 + (s.stats.int * 5);
  const currentMp = Math.min(maxMp, Math.round(s.food.length * 15 + ((s.restoration || 80) * 0.3)));
  if ($("mpVal")) $("mpVal").textContent = `${currentMp}/${maxMp}`;
  if ($("mpBarFill")) $("mpBarFill").style.width = `${(currentMp/maxMp)*100}%`;

  // Condition Inputs
  if ($("fatigue")) $("fatigue").value = s.fatigue || 30;
  if ($("fatigueOut")) $("fatigueOut").value = `${s.fatigue || 30}%`;
  if ($("restoration")) $("restoration").value = s.restoration || 85;
  if ($("restorationOut")) $("restorationOut").value = `${s.restoration || 85}%`;
  if ($("dailyExertion")) $("dailyExertion").value = s.dailyExertion || "sedentary";

  // Configuration Inputs
  if ($("name")) $("name").value = s.profile.name || "";
  if ($("baseWeight")) $("baseWeight").value = s.weight || "";
  if ($("baseHeight")) $("baseHeight").value = s.height || "";

  // Shadow Army Progression
  if ($("shadow1")) $("shadow1").style.opacity = s.level >= 10 ? 1 : 0.25;
  if ($("shadow2")) $("shadow2").style.opacity = s.level >= 20 ? 1 : 0.25;
  if ($("shadow3")) $("shadow3").style.opacity = s.level >= 30 ? 1 : 0.25;
  if ($("shadow4")) $("shadow4").style.opacity = s.level >= 40 ? 1 : 0.25;
  if ($("shadow5")) $("shadow5").style.opacity = s.level >= 50 ? 1 : 0.25;

  if ($("systemMessage")) {
    if (r < 30) {
      $("systemMessage").innerHTML = "<span style='color:var(--danger)'>[WARNING] FATIGUE EXTREMELY HIGH. PENALTY ZONE APPROACHING.</span> System mandates immediate recovery.";
    } else if (r < 75) {
      $("systemMessage").innerHTML = "Condition stable. Continue grinding to level up.";
    } else {
      $("systemMessage").innerHTML = "<span style='color:var(--accent)'>[SYSTEM ALERT] CONDITION PEAK.</span> Proceed to Boss Raid.";
    }
  }

  calculateVesselFuel();
  renderQuests();
  renderPlan(generateDynamicPlan(r));
  renderWorkouts("all");
  renderNutrition();
  renderProgress();
}

/* =========================================================
   6. TDEE & 4-MEAL TRACKING SYSTEM
========================================================= */
function calculateVesselFuel() {
  const w = parseFloat(s.weight) || 72;
  const h = parseFloat(s.height) || 178;
  const bmr = (10 * w) + (6.25 * h) - (5 * 22) + 5;
  const target = Math.round(bmr * 1.4); 
  
  if ($("targetCalories")) $("targetCalories").textContent = `${target.toLocaleString()} kcal`;
  
  const consumed = s.food.reduce((a, x) => a + x.cal, 0);
  if ($("calorieStatus")) {
    if (consumed === 0) {
      $("calorieStatus").textContent = "Fuel Reserves Depleted (0 kcal logged)";
      $("calorieStatus").style.color = "var(--danger)";
    } else if (consumed < target - 400) {
      $("calorieStatus").textContent = `Under-Fueled (${target - consumed} kcal needed to sustain stats)`;
      $("calorieStatus").style.color = "#00e5ff";
    } else if (consumed > target + 400) {
      $("calorieStatus").textContent = `Mass Gaining (+${consumed - target} kcal surplus)`;
      $("calorieStatus").style.color = "#fbbf24";
    } else {
      $("calorieStatus").textContent = "Optimal System Balance";
      $("calorieStatus").style.color = "#10b981";
    }
  }
}

function renderNutrition() {
  if (!$("calTotal")) return;
  const calories = s.food.reduce((a, x) => a + x.cal, 0);
  const protein = s.food.reduce((a, x) => a + x.pro, 0);
  
  $("calTotal").textContent = Math.round(calories);
  $("proteinTotal").textContent = Math.round(protein * 10) / 10;
  $("mealTotal").textContent = s.food.length;

  if (!s.food.length) {
    $("foodList").innerHTML = `<div class="muted" style="font-size:12px; padding:10px;">Inventory empty. No consumable items processed today.</div>`;
    return;
  }

  const grouped = { "Breakfast": [], "Lunch": [], "Evening Snacks": [], "Dinner": [] };
  s.food.forEach((f, index) => {
      const type = f.meal || "Evening Snacks";
      if(!grouped[type]) grouped[type] = [];
      grouped[type].push({...f, originalIndex: index});
  });

  let html = '';
  Object.keys(grouped).forEach(phase => {
      if(grouped[phase].length > 0) {
          html += `<div style="margin: 15px 0 5px; font-size: 10px; color: var(--accent); font-weight: 800; letter-spacing: 2px;">${phase.toUpperCase()}</div>`;
          grouped[phase].forEach(food => {
              html += `
              <div class="food-row" style="margin-bottom: 5px;">
                <span><b>${esc(food.name)}</b><br><span class="muted">${food.cal} kcal • ${food.pro}g protein</span></span>
                <button onclick="removeFood(${food.originalIndex})">×</button>
              </div>`;
          });
      }
  });
  $("foodList").innerHTML = html;
}

if ($("addFood")) {
  $("addFood").onclick = () => {
    const name = $("foodName").value.trim();
    const calories = +($("foodCal").value || 0);
    const protein = +($("foodPro").value || 0);
    const mealType = $("mealType") ? $("mealType").value : "Evening Snacks";

    if (!name) { toast("ENTER ITEM IDENTIFIER", true); return; }
    
    s.food.push({ name, cal: calories, pro: protein, meal: mealType });
    if (protein >= 25) s.stats.int += 1; 
    
    $("foodName").value = ""; $("foodCal").value = ""; $("foodPro").value = "";
    save(); render(); toast("ITEM CONSUMED • MP RESTORED");
  };
}

window.removeFood = function (index) { s.food.splice(index, 1); save(); render(); };
if ($("clearFood")) { $("clearFood").onclick = () => { s.food = []; save(); render(); }; }

/* =========================================================
   7. QUESTS & PROGRESSION
========================================================= */
function renderQuests() {
  if (!$("quests")) return;
  $("quests").innerHTML = s.quests.map(q => `
    <div class="quest ${q.done ? "done" : ""}">
      <button onclick="completeQuest('${q.id}')">${q.done ? "✓" : ""}</button>
      <div class="quest-main"><b>${q.t}</b><small>${q.d}</small></div>
      <span class="qxp">+${q.xp} EXP</span>
    </div>
  `).join("");
}

window.completeQuest = function (qid) {
  const q = s.quests.find(x => x.id === qid);
  if (!q || q.done) return;
  q.done = true; gain(q.xp);

  if (s.quests.every(x => x.done)) {
    gain(35); s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak);
    toast("ALL DAILY MISSIONS CLEARED • +35 BONUS EXP");
  } else {
    toast(`MISSION CLEAR • +${q.xp} EXP`);
  }
  save(); render();
};

if ($("refreshQuests")) { $("refreshQuests").onclick = () => { s.quests = qPool.slice().sort(() => Math.random() - 0.5).slice(0, 4).map(q => ({ ...q, id: id(q.t + Math.random()), done: false })); save(); renderQuests(); toast("[SYSTEM] DIRECTIVES RE-ROLLED"); }; }

function renderPlan(p) {
  if (!$("todayPlan")) return;
  if ($("planBadge")) $("planBadge").textContent = p.badge;

  $("todayPlan").innerHTML = `
    <div class="plan">
      <h4 class="plan-title">${p.title}</h4>
      <div class="plan-sub">${p.sub}</div>
      <div class="exercise-list">
        ${p.items.map((x, i) => {
          const name = x.split(" — ")[0].trim();
          return `
            <div class="exercise">
              <div>
                <b>${String(i + 1).padStart(2, "0")} · ${x}</b>
              </div>
              <button class="ghost" style="padding: 4px 10px; font-size: 10px;" onclick="openExerciseModal('${name}')">Form Check</button>
            </div>
          `;
        }).join("")}
      </div>
      <button class="primary" onclick="completeAdaptive()">CLEAR DUNGEON · +30 EXP</button>
    </div>
  `;
}

function renderWorkouts(filter) {
  if (!$("workouts")) return;
  const list = filter === "all" ? workouts : workouts.filter(w => w.cat === filter);
  
  $("workouts").innerHTML = list.map(w => `
    <article class="workout">
      <span class="tag">${w.tag}</span>
      <h3>${w.title}</h3>
      <p>${w.desc}</p>
      <ul>
        ${w.items.map(x => {
          const name = x.split(" — ")[0].trim();
          return `<li style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
            <span>${x}</span>
            <a href="javascript:void(0)" onclick="openExerciseModal('${name}')" style="color:var(--accent); font-size:10px; text-decoration:none;">[GUIDE]</a>
          </li>`;
        }).join("")}
      </ul>
      <button class="primary" onclick="startWorkout('${w.title}')">INITIATE DUNGEON · +${w.xp} EXP</button>
    </article>
  `).join("");
}

// Explicitly unbind and re-bind event listeners for filters
document.querySelectorAll(".filter button").forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll(".filter button").forEach(x => x.classList.remove("active"));
        button.classList.add("active");
        renderWorkouts(button.dataset.filter);
    });
});

window.startWorkout = function (title) {
  const workout = workouts.find(x => x.title === title);
  if (!workout) return;
  gain(workout.xp); s.sessions++; const d = new Date().getDay(); s.activity[d] = Math.min(180, s.activity[d] + 25);
  if (workout.stat && s.stats[workout.stat] !== undefined) s.stats[workout.stat] += 1;
  save(); toast(`[${workout.title.toUpperCase()}] RAID SUCCESS • +${workout.xp} EXP`); render();
};

/* =========================================================
   8. EXERCISE MODAL
========================================================= */
window.openExerciseModal = function(name) {
  const guide = EXERCISE_GUIDES[name] || {
    target: "Compound Kinetic Chain", desc: "Perform this movement under control. Keep core braced and joints aligned.",
    verification: ["Joints remain tracked correctly", "Full repetition lockout achieved"], videoQuery: `${name} exercise form tutorial`
  };
  $("modalTag").textContent = "COMBAT TECHNIQUE MANUAL"; $("modalTitle").textContent = name;
  $("modalTarget").textContent = `TARGET: ${guide.target.toUpperCase()}`; $("modalDesc").textContent = guide.desc;
  $("modalVerification").innerHTML = guide.verification.map(v => `<li>${v}</li>`).join("");
  $("modalVideoLink").href = `https://www.youtube.com/results?search_query=${encodeURIComponent(guide.videoQuery)}`;
  $("exerciseModal").classList.remove("hidden");
};
window.closeExerciseModal = function() { $("exerciseModal").classList.add("hidden"); };

/* =========================================================
   9. ADVANCED TELEMETRY CHARTS & PROGRESSION
========================================================= */
// Completely Crash-Proof Chart.js Initialization
function safeCreateChart(canvasId, config) {
    if (typeof Chart === 'undefined') return null;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    try {
        const existing = Chart.getChart(canvas);
        if (existing) existing.destroy();
        return new Chart(canvas, config);
    } catch(e) {
        console.error("Chart Error:", e);
        return null;
    }
}

function renderProgress() {
  if (!$("pXp")) return;
  $("pXp").textContent = s.xp; $("pSessions").textContent = s.sessions; $("pBest").textContent = s.bestStreak; $("pChecks").textContent = s.checks;
  
  if ($("history")) {
    $("history").innerHTML = s.history.length
      ? s.history.map(h => `<div class="history-row"><span>${h.date}</span><span>Exertion: ${h.exertion || "Standard"} • Fatigue: ${h.fatigue || "30%"}</span></div>`).join("")
      : `<div class="muted" style="padding:10px; font-size:12px;">No historical data scans stored.</div>`;
  }

  const features = [
      { icon: "⚡", title: "Adaptive AI Regulator", unlock: 1, desc: "Active" },
      { icon: "🛡️", title: "Shadow Infantry Extraction", unlock: 10, desc: s.level >= 10 ? "Unlocked" : "Unlocks at LVL 10" },
      { icon: "👁️", title: "Monarch's True Sight (Advanced Analytics)", unlock: 20, desc: s.level >= 20 ? "Unlocked" : "Unlocks at LVL 20" },
      { icon: "🏰", title: "Demon Castle Environment", unlock: 35, desc: s.level >= 35 ? "Unlocked" : "Unlocks at LVL 35" }
  ];

  if($("achievements")) {
      $("achievements").innerHTML = features.map(f => `
        <div class="achievement ${s.level >= f.unlock ? "" : "locked"}">
          <div class="medal">${f.icon}</div>
          <span>${f.title}</span>
          <b>${f.desc.toUpperCase()}</b>
        </div>
      `).join("");
  }

  // 8 Chart.js Instances for Telemetry Scanners
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = 'Space Grotesk, sans-serif';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

  const accentColor = s.level >= 40 ? '#ef4444' : (s.level >= 20 ? '#a855f7' : '#00e5ff');
  const accentColor2 = '#3b82f6';

  cRadar = safeCreateChart('cRadar', {
      type: 'radar',
      data: {
          labels: ['STR', 'VIT', 'AGI', 'INT', 'PER'],
          datasets: [{ data: [s.stats.str, s.stats.vit, s.stats.agi, s.stats.int, s.stats.per], backgroundColor: 'rgba(0, 229, 255, 0.2)', borderColor: accentColor, borderWidth: 2, pointBackgroundColor: accentColor }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { r: { angleLines: {color: 'rgba(255,255,255,0.1)'}, grid: {color: 'rgba(255,255,255,0.1)'}, pointLabels: {color: accentColor, font: {size: 11}}, ticks: {display: false} } }, plugins: { legend: {display: false} } }
  });

  cActivity = safeCreateChart('cActivity', {
      type: 'bar',
      data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ data: s.activity, backgroundColor: accentColor, borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: {legend: {display: false}}, scales: { x:{grid:{display:false}}, y:{display:false} } }
  });

  const fData = s.history.slice(0, 7).reverse().map(h => parseInt(h.fatigue) || 30);
  const rData = s.history.slice(0, 7).reverse().map(h => 100 - (parseInt(h.fatigue) || 30));
  while(fData.length < 7) { fData.unshift(30); rData.unshift(80); }

  cFatigue = safeCreateChart('cFatigue', {
      type: 'line',
      data: {
          labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yest', 'Today'],
          datasets: [
              { label: 'Fatigue', data: fData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 },
              { label: 'Recovery', data: rData, borderColor: '#10b981', borderDash: [5, 5], fill: false, tension: 0.4 }
          ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: {legend: {display: false}}, scales: { x:{grid:{display:false}}, y:{display:false} } }
  });

  const xpData = [Math.max(0, s.xp - 150), Math.max(0, s.xp - 120), Math.max(0, s.xp - 90), Math.max(0, s.xp - 60), Math.max(0, s.xp - 40), Math.max(0, s.xp - 15), s.xp];
  cXp = safeCreateChart('cXp', {
      type: 'line',
      data: { labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yest', 'Today'], datasets: [{ data: xpData, borderColor: accentColor2, backgroundColor: 'rgba(59, 130, 246, 0.2)', fill: true, tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: {legend: {display: false}}, scales: { x:{grid:{display:false}}, y:{display:false} }, elements: {point: {radius: 0}} }
  });

  const targetCal = Math.round(((10*(s.weight||72)+6.25*(s.height||178)-105)+5)*1.4);
  const todayCal = s.food.reduce((a, x) => a + x.cal, 0);
  const calData = [targetCal-200, targetCal+150, targetCal-50, targetCal, targetCal-300, targetCal+100, todayCal];
  cCal = safeCreateChart('cCal', {
      type: 'bar',
      data: { labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yest', 'Today'], datasets: [{ data: calData, backgroundColor: '#fbbf24', borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: {legend: {display: false}}, scales: { x:{grid:{display:false}}, y:{display:false} } }
  });

  const todayPro = s.food.reduce((a, x) => a + x.pro, 0);
  const proData = [110, 100, 130, 125, 140, 135, todayPro];
  cPro = safeCreateChart('cPro', {
      type: 'line',
      data: { labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yest', 'Today'], datasets: [{ data: proData, borderColor: '#10b981', tension: 0.3 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: {legend: {display: false}}, scales: { x:{grid:{display:false}}, y:{display:false} } }
  });

  const doneQ = s.quests.filter(q => q.done).length;
  cQuest = safeCreateChart('cQuest', {
      type: 'doughnut',
      data: { labels: ['Cleared', 'Pending'], datasets: [{ data: [doneQ, 4 - doneQ], backgroundColor: [accentColor, 'rgba(255,255,255,0.05)'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: {legend: {display: false}} }
  });

  const d1 = Math.max(1, Math.ceil(s.sessions * 0.4)); const d2 = Math.max(1, Math.ceil(s.sessions * 0.3)); const d3 = Math.max(1, Math.ceil(s.sessions * 0.2)); const d4 = Math.max(1, s.sessions - d1 - d2 - d3);
  cDungeon = safeCreateChart('cDungeon', {
      type: 'doughnut',
      data: { labels: ['Strength', 'Agility', 'Vitality', 'Perception'], datasets: [{ data: [d1, d2, d3, d4], backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#fbbf24'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: {legend: {display: false}} }
  });
}

/* =========================================================
   10. SETTINGS & AI CHAT
========================================================= */
if ($("fatigue")) $("fatigue").oninput = e => { $("fatigueOut").value = `${e.target.value}%`; s.fatigue = +e.target.value; };
if ($("restoration")) $("restoration").oninput = e => { $("restorationOut").value = `${e.target.value}%`; s.restoration = +e.target.value; };

if ($("saveCheck")) {
  $("saveCheck").onclick = () => {
    s.fatigue = +$("fatigue").value; s.restoration = +$("restoration").value; s.dailyExertion = $("dailyExertion").value; s.checks++;
    s.history.unshift({ date: day(), fatigue: `${s.fatigue}%`, exertion: s.dailyExertion });
    s.history = s.history.slice(0, 15); save(); render(); toast("[SYSTEM] BIOMETRIC TELEMETRY STORED");
  };
}

if ($("saveProfile")) {
  $("saveProfile").onclick = () => {
    s.profile = { name: $("name").value.trim() || "Vidhun", experience: $("experience").value, equipment: $("equipment").value, duration: $("duration").value };
    if ($("baseWeight").value) s.weight = parseFloat($("baseWeight").value);
    if ($("baseHeight").value) s.height = parseFloat($("baseHeight").value);
    save(); render(); toast("[SYSTEM] VESSEL DIMENSIONS LOGGED");
  };
}

function show(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  if ($(page)) $(page).classList.add("active");
  document.querySelectorAll(".nav").forEach(nav => {
    if (!nav.classList.contains('nav-exit')) nav.classList.toggle("active", nav.dataset.page === page);
  });
}

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-page]");
  if (btn) show(btn.dataset.page);
});

const answers = [
  { keywords: ["today", "train", "workout", "exercise"], answer: () => `[ARCHITECT DIRECTIVE]\nYour current readiness score is ${readiness()}/100. Based on your stats, today's protocol is '${generateDynamicPlan(readiness()).title}'. Consult the Dungeon Lab for your exercise execution parameters.` },
  { keywords: ["fatigue", "tired", "exhausted", "pain"], answer: () => `[BIOMETRIC WARNING]\nHigh fatigue reduces physical output and invites injury. The System recommends switching to the Recovery Protocol and prioritizing sleep.` },
  { keywords: ["status", "stats", "window", "attributes"], answer: () => `[STATUS REPORT]\nName: ${s.profile.name || "Vidhun"}\nClass: ${rank()} | Level: ${s.level}\nTitle: ${getTitle()}\n\nSTR: ${s.stats.str} | VIT: ${s.stats.vit}\nAGI: ${s.stats.agi} | INT: ${s.stats.int}\nPER: ${s.stats.per}` },
  { keywords: ["color", "monster", "name", "weak", "strong"], answer: () => `[SYSTEM LORE]\nIn battle, you can assess threat levels by reading the aura colors of monster names. A White name indicates a weak enemy. Orange designates a strong opponent, and Red implies a lethal, highly dangerous threat. Choose your battles wisely.` },
  { keywords: ["calorie", "food", "eat", "protein"], answer: () => `[NUTRITIONAL DIRECTIVE]\nBased on your height (${s.height || 178}cm) and weight (${s.weight || 72}kg), your maintenance requirement is roughly ${Math.round(((10*(s.weight||72)+6.25*(s.height||178)-105)+5)*1.4)} kcal. Maintain at least 1.6g of protein per kg of bodyweight to synthesize Mana.` }
];

function ai(question) {
  const text = question.toLowerCase(); const match = answers.find(item => item.keywords.some(keyword => text.includes(keyword)));
  if (match) return match.answer();
  return `[SYSTEM OVERRIDE]\nDirective unclear. Ask about your current training recommendation, status window, or calorie requirements.`;
}

function esc(text) { return text.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])); }

function ask(text) {
  if (!text.trim()) return; const chat = $("chat"); if (!chat) return;
  chat.insertAdjacentHTML("beforeend", `<div class="msg user"><p>${esc(text)}</p></div>`);
  setTimeout(() => {
    chat.insertAdjacentHTML("beforeend", `<div class="msg bot"><b>[THE ARCHITECT]</b><p>${esc(ai(text)).replace(/\n/g, '<br>')}</p></div>`);
    chat.scrollTop = chat.scrollHeight;
  }, 250);
}

if ($("ask")) { $("ask").onclick = () => { const question = $("question"); ask(question.value); question.value = ""; }; }
if ($("question")) { $("question").addEventListener("keydown", event => { if (event.key === "Enter") $("ask").click(); }); }
document.querySelectorAll(".quick button").forEach(button => { button.onclick = () => ask(button.textContent); });

if ($("export")) { $("export").onclick = () => { const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "solo-leveling-system-save.json"; link.click(); URL.revokeObjectURL(url); }; }
if ($("reset")) { $("reset").onclick = () => { if (!confirm("[WARNING] This will purge all hunter rank data and reset your vessel to Level 1. Confirm?")) return; localStorage.removeItem(KEY); location.reload(); }; }

document.addEventListener("DOMContentLoaded", () => { render(); });

/* =========================================================
   LEVEL//UP FITNESS — UPGRADE PACK (additive add-on)
   Save as fitness/fitness-upgrades.js and load AFTER app.js:
     <script src="fitness-upgrades.js"></script>
   Nothing in app.js is modified. Functions app.js already
   defines are left alone; missing ones are filled in.
========================================================= */
(function () {
  'use strict';

  const el = id => document.getElementById(id);
  const define = (name, fn) => { if (typeof window[name] !== 'function') window[name] = fn; };
  const WATER_GOAL = 8;

  /* ---------- small missing utility styles (classes used in index.html) ---------- */
  const css = document.createElement('style');
  css.textContent = `
    .muted{color:var(--muted)} .mb-6{margin-bottom:24px} .mt-6{margin-top:24px} .mt-1{margin-top:4px}
    .text-accent{color:var(--accent)} .text-danger{color:var(--danger)} .border-accent{border-color:var(--accent)}
    .medal{font-size:20px}
    .ux-water{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin:14px 0}
    .ux-water i{display:block;height:34px;border-radius:6px;border:1px solid var(--line);background:rgba(0,0,0,.4);transition:all .25s}
    .ux-water i.on{background:var(--accent2);border-color:var(--accent);box-shadow:var(--glow)}
    .ux-row{display:flex;gap:8px;flex-wrap:wrap}
    .ux-row button{width:auto;flex:1}
    .ux-timer{font:800 54px "Space Grotesk",sans-serif;text-align:center;color:var(--accent);text-shadow:var(--glow);margin:10px 0}
    .ux-timer.done{color:var(--danger)}
    .ux-pr{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)}
    .ux-pr:last-child{border:0}
    .ux-pr span{flex:1;font-size:12px;font-weight:700}
    .ux-pr b{font:800 20px "Space Grotesk",sans-serif;color:var(--accent);min-width:64px;text-align:right}
    .ux-pr input{width:80px;padding:8px}
    .ux-pr button{width:auto}
  `;
  document.head.appendChild(css);

  /* ---------- A. progression functions the UI calls but app.js lacked ---------- */
  define('gain', function (xp) {
    s.xp += xp;
    const lvl = Math.floor(s.xp / 100) + 1;
    if (lvl > s.level) {
      s.level = lvl;
      setTimeout(() => toast(`[SYSTEM] LEVEL UP • YOU ARE NOW LEVEL ${lvl}`), 2700);
    }
  });

  define('completeAdaptive', function () {
    gain(30);
    s.sessions++;
    const d = new Date().getDay();
    s.activity[d] = Math.min(180, s.activity[d] + 20);
    s.stats.str += 1;
    save(); toast('DUNGEON CLEARED • +30 EXP'); render();
  });

  /* ---------- extension state lives inside the same save object ---------- */
  function ext() {
    if (!s.ext) s.ext = {};
    const x = s.ext;
    if (!Array.isArray(x.weights)) x.weights = [];
    if (!x.prs) x.prs = {};
    if (typeof x.water !== 'number') x.water = 0;
    if (x.waterDate !== day()) { x.waterDate = day(); x.water = 0; x.waterBonus = false; }
    return x;
  }

  /* ---------- B. UI injection ---------- */
  function inject() {
    if (el('uxHydration')) return;

    // Hydration (Recovery Fuel tab)
    const nut = el('nutrition');
    if (nut) nut.insertAdjacentHTML('beforeend', `
      <article class="panel mt-6" id="uxHydration">
        <div class="panel-head">
          <div><span class="eyebrow">HYDRATION</span><h3>Mana Fluid Intake</h3></div>
          <span class="badge" id="uxWaterBadge">0 / ${WATER_GOAL}</span>
        </div>
        <p class="muted" style="font-size:12px;margin:0">Log each glass (~250 ml). Hitting ${WATER_GOAL} glasses grants +1 PER once per day. Resets daily.</p>
        <div class="ux-water" id="uxWaterBar"></div>
        <div class="ux-row">
          <button class="secondary" id="uxWaterMinus">− REMOVE</button>
          <button class="primary" id="uxWaterPlus">+ DRINK GLASS</button>
        </div>
      </article>`);

    // Rest timer (Dungeon Lab tab)
    const tr = el('training');
    if (tr) tr.insertAdjacentHTML('beforeend', `
      <article class="panel mt-6" id="uxTimerPanel">
        <div class="panel-head">
          <div><span class="eyebrow">COOLDOWN</span><h3>Rest Timer</h3></div>
          <button class="ghost" id="uxTimerStop">Stop</button>
        </div>
        <div class="ux-timer" id="uxTimer">00:00</div>
        <div class="ux-row">
          <button class="secondary" data-rest="30">30 SEC</button>
          <button class="secondary" data-rest="60">60 SEC</button>
          <button class="secondary" data-rest="90">90 SEC</button>
          <button class="secondary" data-rest="120">2 MIN</button>
        </div>
      </article>`);

    // Weight log + personal records (Hunter Log tab)
    const pr = el('progress');
    if (pr) pr.insertAdjacentHTML('beforeend', `
      <div class="two-col mt-6" id="uxProgressExtras">
        <article class="panel">
          <div class="panel-head">
            <div><span class="eyebrow">VESSEL MASS</span><h3>Weight Log</h3></div>
            <span class="badge" id="uxBmi">BMI —</span>
          </div>
          <div class="chart-container" style="height:200px"><canvas id="uxWeightChart"></canvas></div>
          <div class="ux-row" style="margin-top:14px">
            <input id="uxWeightInput" type="number" min="30" max="200" step="0.1" placeholder="Today's weight (kg)" style="flex:2">
            <button class="primary" id="uxWeightAdd">LOG</button>
          </div>
          <div id="uxWeightNote" class="muted" style="font-size:11px;margin-top:10px"></div>
        </article>
        <article class="panel">
          <div class="panel-head">
            <div><span class="eyebrow">LIMIT BREAK</span><h3>Personal Records</h3></div>
          </div>
          <p class="muted" style="font-size:12px;margin:0 0 8px">Beat a record to earn +10 EXP.</p>
          <div id="uxPrList"></div>
        </article>
      </div>`);

    // Import save (Player Config tab)
    const exp = el('export');
    if (exp && exp.parentElement) exp.insertAdjacentHTML('afterend', `
      <button class="secondary" id="uxImport">IMPORT SYSTEM JSON</button>
      <input type="file" id="uxImportFile" accept=".json,application/json" style="display:none">`);

    bind();
  }

  const PRS = [
    { key: 'pushups', label: 'Max Push-ups (one set)', unit: 'reps' },
    { key: 'squats', label: 'Max Squats (one set)', unit: 'reps' },
    { key: 'plank', label: 'Longest Plank', unit: 'sec' },
    { key: 'lunges', label: 'Max Reverse Lunges / side', unit: 'reps' }
  ];

  /* ---------- C. behaviour ---------- */
  let timerId = null, timerEnd = 0;

  function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
      const ctx = new Ctx(), o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.35); o.onended = () => ctx.close();
    } catch (e) {}
  }

  function tick() {
    const t = el('uxTimer'); if (!t) return;
    const left = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
    t.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
    if (left === 0) {
      clearInterval(timerId); timerId = null; t.classList.add('done');
      beep(); toast('[SYSTEM] COOLDOWN COMPLETE • RESUME COMBAT');
    }
  }
  function startTimer(sec) {
    clearInterval(timerId);
    el('uxTimer').classList.remove('done');
    timerEnd = Date.now() + sec * 1000; tick(); timerId = setInterval(tick, 250);
  }
  function stopTimer() {
    clearInterval(timerId); timerId = null;
    const t = el('uxTimer'); if (t) { t.classList.remove('done'); t.textContent = '00:00'; }
  }

  function bind() {
    if (el('uxWaterPlus')) el('uxWaterPlus').onclick = () => {
      const x = ext(); x.water = Math.min(20, x.water + 1);
      if (x.water >= WATER_GOAL && !x.waterBonus) { x.waterBonus = true; s.stats.per += 1; toast('HYDRATION GOAL CLEARED • +1 PER'); }
      else toast('FLUID CONSUMED');
      save(); render();
    };
    if (el('uxWaterMinus')) el('uxWaterMinus').onclick = () => { const x = ext(); x.water = Math.max(0, x.water - 1); save(); renderExt(); };

    document.querySelectorAll('#uxTimerPanel [data-rest]').forEach(b => { b.onclick = () => startTimer(Number(b.dataset.rest)); });
    if (el('uxTimerStop')) el('uxTimerStop').onclick = stopTimer;

    if (el('uxWeightAdd')) el('uxWeightAdd').onclick = () => {
      const v = parseFloat(el('uxWeightInput').value);
      if (!v || v < 30 || v > 200) { toast('ENTER A VALID WEIGHT (30–200 KG)', true); return; }
      const x = ext(); const today = day();
      const existing = x.weights.find(w => w.date === today);
      if (existing) existing.kg = v; else x.weights.push({ date: today, kg: v });
      x.weights = x.weights.slice(-60);
      s.weight = v;                       // keeps the maintenance-calorie target current
      el('uxWeightInput').value = '';
      save(); render(); toast('[SYSTEM] VESSEL MASS RECORDED');
    };

    if (el('uxImport')) el('uxImport').onclick = () => el('uxImportFile').click();
    if (el('uxImportFile')) el('uxImportFile').onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const data = JSON.parse(evt.target.result);
          if (!data || typeof data !== 'object' || !data.profile || !data.stats || typeof data.xp !== 'number') throw new Error('bad shape');
          if (!confirm('[WARNING] This replaces your current hunter data with the imported save. Continue?')) return;
          localStorage.setItem(KEY, JSON.stringify(data));
          location.reload();
        } catch (err) { toast('INVALID SAVE FILE', true); }
      };
      reader.readAsText(file); e.target.value = '';
    };
  }

  window.logPR = function (key) {
    const input = el('uxPr_' + key); if (!input) return;
    const v = parseInt(input.value, 10);
    if (!v || v <= 0) { toast('ENTER A VALUE', true); return; }
    const x = ext(); const best = x.prs[key] ? x.prs[key].value : 0;
    if (v <= best) { toast(`CURRENT RECORD STANDS AT ${best}`, true); return; }
    x.prs[key] = { value: v, date: day() };
    gain(10); save(); render(); toast('NEW RECORD • LIMIT BROKEN • +10 EXP');
  };

  /* ---------- D. render ---------- */
  function renderExt() {
    if (typeof s === 'undefined') return;
    inject();
    const x = ext();

    if (el('uxWaterBar')) {
      el('uxWaterBar').innerHTML = Array.from({ length: WATER_GOAL }, (_, i) => `<i class="${i < x.water ? 'on' : ''}"></i>`).join('');
      el('uxWaterBadge').textContent = `${x.water} / ${WATER_GOAL}`;
    }

    if (el('uxPrList')) {
      el('uxPrList').innerHTML = PRS.map(p => {
        const r = x.prs[p.key];
        return `<div class="ux-pr">
          <span>${p.label}<br><small class="muted" style="font-weight:500">${r ? 'Set ' + r.date : 'No record yet'}</small></span>
          <b>${r ? r.value : '—'} <small class="muted" style="font-size:10px">${p.unit}</small></b>
          <input id="uxPr_${p.key}" type="number" min="1" placeholder="${p.unit}">
          <button class="ghost" onclick="logPR('${p.key}')">Log</button>
        </div>`;
      }).join('');
    }

    const h = parseFloat(s.height) || 0;
    const latest = x.weights.length ? x.weights[x.weights.length - 1].kg : (parseFloat(s.weight) || 0);
    if (el('uxBmi')) el('uxBmi').textContent = (h && latest) ? `BMI ${(latest / Math.pow(h / 100, 2)).toFixed(1)}` : 'BMI —';

    if (el('uxWeightNote')) {
      if (x.weights.length >= 2) {
        const diff = x.weights[x.weights.length - 1].kg - x.weights[0].kg;
        el('uxWeightNote').textContent = `${diff >= 0 ? '+' : '−'}${Math.abs(diff).toFixed(1)} kg since ${x.weights[0].date} (${x.weights.length} entries)`;
      } else {
        el('uxWeightNote').textContent = x.weights.length ? 'Log again on another day to see your trend.' : 'No weight entries yet.';
      }
    }

    const canvas = el('uxWeightChart');
    if (canvas && typeof Chart !== 'undefined') {
      try {
        const old = Chart.getChart(canvas); if (old) old.destroy();
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00e5ff';
        new Chart(canvas, {
          type: 'line',
          data: {
            labels: x.weights.map(w => w.date.slice(5)),
            datasets: [{ data: x.weights.map(w => w.kg), borderColor: accent, backgroundColor: 'rgba(0,229,255,0.12)', fill: true, tension: 0.3, pointRadius: 3, pointBackgroundColor: accent }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { ticks: { callback: v => v + ' kg' } } } }
        });
      } catch (e) { console.error('Weight chart error', e); }
    }
  }

  /* ---------- E. hook into the existing render cycle ---------- */
  if (typeof window.render === 'function') {
    const origRender = window.render;
    window.render = function () {
      const r = origRender.apply(this, arguments);
      try { renderExt(); } catch (e) { console.error('Upgrade render failed', e); }
      return r;
    };
  }
  document.addEventListener('DOMContentLoaded', () => { try { renderExt(); } catch (e) {} });
})();


/* =========================================================
   LEVEL//UP FITNESS — EXPANSION PACK 2
   Mood-adaptive readiness, realistic progressive plans,
   guided sessions with animated form demos, honest history
   charts, body-data based nutrition targets.
   Additive: nothing above this block is modified.
========================================================= */
(function () {
  'use strict';
  const el = id => document.getElementById(id);
  const localDay = () => new Date().toLocaleDateString('en-CA');
  window.day = localDay;                       // fix: the day now rolls over at local midnight, not at UTC midnight

  function E() {
    if (!s.ext) s.ext = {};
    const x = s.ext;
    x.prog = x.prog || {}; x.days = x.days || {}; x.log = x.log || []; x.trained = x.trained || []; x.bio = x.bio || { age: 22, sex: 'male', goal: 'maintain' };
    return x;
  }

  /* ---------- theme: same type family as the main command centre ---------- */
  const font = document.createElement('link'); font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Exo+2:wght@500;600;700;800;900&family=Nunito:wght@400;600;700;800;900&display=swap';
  document.head.appendChild(font);
  const css = document.createElement('style');
  css.textContent = `
    body, button, input, select { font-family: 'Nunito', 'Inter', Arial, sans-serif; font-size: 15px; }
    .logo b, .topbar h1, .hero h2, .orb b, .stat-box b, .metric b, .section-title h3, .panel-head h3, .page-heading h2, .workout h3, .fuel b, .modal-header h3, .ux-timer, .plan-title, .player-mini strong { font-family: 'Exo 2', 'Space Grotesk', sans-serif !important; }
    .eyebrow { font-size: 11px; } .metric span, .stat-box span, .fuel span, .workout .tag { font-size: 10.5px; } .badge, .sync { font-size: 10.5px; }
    label { font-size: 12.5px; } .nav { font-size: 12.5px; } .primary, .secondary, .danger, .ghost { font-size: 12px; border-radius: 10px; }
    .workout p, .workout ul, .food-row, .history-row, .context-row { font-size: 13px; } .quest-main small { font-size: 13px; }
    .panel, .metric, .workout, .fuel { border-radius: 16px; }
    .fx-moods { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
    .fx-moods button { background: rgba(0,0,0,.4); border: 1px solid var(--line); border-radius: 12px; padding: 8px 2px; }
    .fx-moods button span { display: block; font-size: 22px; } .fx-moods button small { font-size: 9.5px; font-weight: 800; color: var(--muted); text-transform: uppercase; }
    .fx-moods button.on { border-color: var(--accent); background: rgba(0,229,255,.12); box-shadow: var(--glow); }
    .fx-note { font-size: 12px; color: var(--muted); margin-top: 8px; line-height: 1.5; }
    .fx-demo { background: rgba(0,0,0,.45); border: 1px solid var(--line); border-radius: 12px; margin: 12px 0; padding: 6px; }
    .fx-demo svg { width: 100%; height: 130px; display: block; }
    .fx-big { font: 800 44px 'Exo 2', sans-serif; color: var(--accent); text-shadow: var(--glow); text-align: center; margin: 6px 0; }
    .fx-steps { display: flex; gap: 4px; margin: 10px 0; } .fx-steps i { flex: 1; height: 6px; border-radius: 4px; background: var(--line); } .fx-steps i.d { background: var(--accent); } .fx-steps i.c { background: #fff; }
    .fx-row { display: flex; gap: 8px; align-items: center; } .fx-row > * { flex: 1; width: auto; }
    .fx-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
    .fx-tiles div { background: rgba(0,0,0,.4); border: 1px solid var(--line); border-radius: 10px; padding: 10px; text-align: center; }
    .fx-tiles span { display: block; font-size: 10px; font-weight: 800; letter-spacing: 1px; color: var(--muted); text-transform: uppercase; } .fx-tiles b { font: 800 18px 'Exo 2', sans-serif; }
    @media (max-width: 768px) { .fx-tiles { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(css);

  /* ---------- 1. MOOD ---------- */
  const MOODS = [['😵', 'Drained', -15], ['😕', 'Low', -7], ['😐', 'Neutral', 0], ['🙂', 'Good', 4], ['⚡', 'Charged', 8]];
  function mood() {
    const x = E(), today = localDay();
    if (x.mood && x.mood.date === today) return { v: x.mood.v, src: 'logged here' };
    try {                                       // shared with the Growth tab of the main app (same browser storage)
      const m = (JSON.parse(localStorage.getItem('walletMoodHistory') || '{}'))[today];
      if (m) {
        if (m.mood) return { v: Number(m.mood), src: 'synced from the Growth tab' };
        const avg = ((Number(m.energy) || 5) + (Number(m.focus) || 5)) / 2;
        return { v: Math.max(1, Math.min(5, Math.round(avg / 2))), src: 'estimated from Growth energy and focus' };
      }
    } catch (e) {}
    return { v: 3, src: null };
  }
  function streakDays() {                         // consecutive training days ending today or yesterday
    const set = new Set(E().trained); let n = 0; const d = new Date();
    if (!set.has(d.toLocaleDateString('en-CA'))) d.setDate(d.getDate() - 1);
    while (set.has(d.toLocaleDateString('en-CA'))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  const baseReadiness = window.readiness;
  window.readiness = function () {
    let r = baseReadiness();
    r += MOODS[mood().v - 1][2];
    const run = streakDays(); if (run >= 3) r -= (run - 2) * 6;      // accumulated fatigue from back-to-back days
    return Math.max(10, Math.min(100, Math.round(r)));
  };

  /* ---------- 2. REALISTIC, PROGRESSIVE PLAN ---------- */
  // base targets per benchmark: [E-Rank, C-Rank, A-Rank]
  const LIB = {
    'Push-ups': { b: [6, 15, 25], u: '', g: 'push', stat: 'str' },
    'Incline push-up': { b: [10, 16, 22], u: '', g: 'push', stat: 'str' },
    'Pike hold': { b: [15, 30, 45], u: ' sec', g: 'push', stat: 'str' },
    'Pull-ups': { b: [2, 6, 12], u: '', g: 'pull', stat: 'str', need: 'bar' },
    'Dead hang': { b: [15, 30, 50], u: ' sec', g: 'pull', stat: 'vit', need: 'bar' },
    'Squats': { b: [12, 20, 30], u: '', g: 'legs', stat: 'agi' },
    'Goblet squats': { b: [8, 12, 15], u: '', g: 'legs', stat: 'agi', need: 'weights' },
    'Reverse lunges': { b: [6, 10, 15], u: '/side', g: 'legs', stat: 'agi' },
    'Glute bridges': { b: [12, 18, 25], u: '', g: 'legs', stat: 'vit' },
    'Plank': { b: [25, 45, 75], u: ' sec', g: 'core', stat: 'vit' },
    'Cat-cow': { b: [10, 10, 10], u: '', g: 'mob', stat: 'per', fixed: true },
    'Child pose': { b: [40, 40, 40], u: ' sec', g: 'mob', stat: 'per', fixed: true },
    'Brisk walk': { b: [10, 12, 15], u: ' min', g: 'mob', stat: 'per', fixed: true }
  };
  const rankIdx = () => /A-Rank/.test(s.profile.experience || '') ? 2 : /C-Rank/.test(s.profile.experience || '') ? 1 : 0;
  const gear = () => /Weighted|Dumbbell/.test(s.profile.equipment || '') ? ['bar', 'weights'] : /Pull-up/.test(s.profile.equipment || '') ? ['bar'] : [];
  const target = name => { const L = LIB[name]; if (!L) return 10; const x = E(); return L.fixed ? L.b[rankIdx()] : (x.prog[name] || L.b[rankIdx()]); };
  const stepOf = name => / sec/.test(LIB[name].u) ? 5 : (target(name) >= 15 ? 2 : 1);

  window.generateDynamicPlan = function (r) {
    const x = E(), md = mood(), g = gear(), run = streakDays();
    const count = /45/.test(s.profile.duration || '') ? 5 : /30/.test(s.profile.duration || '') ? 4 : 3;
    const item = (name, sets, mult) => { const L = LIB[name], n = Math.max(L.u === ' min' ? 5 : 3, Math.round(target(name) * mult)); return `${name} — ${sets} × ${n}${L.u}`; };

    if (r < 40 || md.v === 1 || run >= 4) {
      const why = md.v === 1 ? 'You logged a drained mood' : run >= 4 ? `${run} training days in a row` : 'Readiness is low';
      return { mode: 'recovery', title: 'Active Recovery Protocol', badge: 'RECOVERY',
        sub: `${why}. Light movement only today, so tomorrow's session is a strong one.`,
        items: [item('Brisk walk', 1, 1), item('Cat-cow', 2, 1), item('Glute bridges', 2, 0.6), item('Child pose', 2, 1)] };
    }
    // rotate the focus so the same muscles are not hit every day
    const splits = [['push', 'core', 'legs'], ['legs', 'core', 'push'], ['legs', 'push', 'core']];
    const order = splits[s.sessions % 3];
    const pool = Object.keys(LIB).filter(n => LIB[n].g !== 'mob' && (!LIB[n].need || g.includes(LIB[n].need)));
    if (g.includes('bar')) order.splice(1, 0, 'pull');
    const picks = []; let round = 0;
    while (picks.length < count && round < 3) { order.forEach(grp => { const c = pool.filter(n => LIB[n].g === grp && !picks.includes(n)); if (c.length && picks.length < count) picks.push(c[(s.sessions + round) % c.length]); }); round++; }
    const names = { push: 'Upper Body', legs: 'Lower Body', pull: 'Pull' };
    if (r >= 75) {
      return { mode: 'overdrive', title: `Overdrive Raid — ${names[order[0]] || 'Full Body'} Focus`, badge: 'OVERDRIVE',
        sub: `Readiness ${r}/100${md.v >= 4 ? ' and a strong mood' : ''}. One extra set on the lead movements; hit every target to raise them next time.`,
        items: picks.map((n, i) => item(n, i < 2 ? 4 : 3, 1)) };
    }
    return { mode: 'standard', title: `Standard Raid — ${names[order[0]] || 'Full Body'} Focus`, badge: 'BALANCED',
      sub: `Readiness ${r}/100. Three working sets at your current targets. Leave one or two reps in reserve.`,
      items: picks.map(n => item(n, 3, r < 55 ? 0.85 : 1)) };
  };

  /* ---------- 3. ANIMATED FORM DEMOS (original vector animations) ---------- */
  const A = (vals, dur) => `<animate attributeName="d" dur="${dur || 2.4}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines=".4 0 .6 1;.4 0 .6 1" values="${vals}"/>`;
  const H = (ax, ay, bx, by, dur) => `<circle r="6" fill="var(--accent)"><animate attributeName="cx" dur="${dur || 2.4}s" repeatCount="indefinite" values="${ax};${bx};${ax}"/><animate attributeName="cy" dur="${dur || 2.4}s" repeatCount="indefinite" values="${ay};${by};${ay}"/></circle>`;
  const FIG = {
    pushup: `<path>${A('M30,70 L31,59 L32,48 L66,54 L100,68;M30,70 L43,60 L32,63 L66,65 L100,68;M30,70 L31,59 L32,48 L66,54 L100,68')}</path>${H(24, 43, 24, 59)}`,
    squat: `<path>${A('M60,70 L60,55 L60,40 L60,20;M60,70 L71,56 L52,52 L61,34;M60,70 L60,55 L60,40 L60,20')}</path><path>${A('M60,24 L63,40;M61,38 L81,37;M60,24 L63,40')}</path>${H(60, 13, 63, 26)}`,
    plank: `<path>${A('M20,70 L33,70 L33,55 L66,57 L100,68;M20,70 L33,70 L33,55 L66,60 L100,68;M20,70 L33,70 L33,55 L66,57 L100,68', 3.2)}</path>${H(25, 51, 25, 52, 3.2)}`,
    bridge: `<path>${A('M30,68 L55,66 L72,50 L78,70;M30,68 L55,50 L73,47 L78,70;M30,68 L55,66 L72,50 L78,70')}</path>${H(22, 65, 22, 65)}`,
    lunge: `<path>${A('M52,70 L52,55 L52,40 L52,20;M52,70 L52,54 L66,52 L66,32;M52,70 L52,55 L52,40 L52,20')}</path><path>${A('M52,40 L54,55 L55,70;M66,52 L82,66 L98,68;M52,40 L54,55 L55,70')}</path>${H(52, 13, 66, 25)}`,
    pike: `<path>${A('M32,70 L62,30 L92,70;M32,70 L62,26 L92,70;M32,70 L62,30 L92,70', 3.2)}</path>${H(40, 60, 40, 59, 3.2)}`,
    hang: `<path d="M35,8 L85,8" stroke-width="3"/><path>${A('M54,8 L56,24 L60,40 L60,58 L60,72;M54,8 L50,18 L60,26 L60,44 L60,58;M54,8 L56,24 L60,40 L60,58 L60,72')}</path><path>${A('M66,8 L64,24 L60,40;M66,8 L70,18 L60,26;M66,8 L64,24 L60,40')}</path>${H(60, 30, 60, 15)}`,
    walk: `<path>${A('M60,22 L60,44 L52,58 L48,70;M60,22 L60,44 L66,58 L72,70;M60,22 L60,44 L52,58 L48,70', 1.2)}</path><path>${A('M60,44 L66,58 L72,70;M60,44 L54,58 L48,70;M60,44 L66,58 L72,70', 1.2)}</path>${H(60, 14, 60, 15, 1.2)}`,
    catcow: `<path>${A('M30,70 L30,50 Q55,40 78,50 L78,70;M30,70 L30,50 Q55,60 78,50 L78,70;M30,70 L30,50 Q55,40 78,50 L78,70', 3)}</path>${H(22, 50, 22, 44, 3)}`,
    child: `<path>${A('M28,66 L50,56 L78,58 L92,68 L74,70;M28,66 L50,58 L78,60 L92,68 L74,70;M28,66 L50,56 L78,58 L92,68 L74,70', 3.6)}</path>${H(24, 62, 24, 63, 3.6)}`
  };
  function demo(name) {
    const n = name.toLowerCase();
    const k = /push/.test(n) ? 'pushup' : /lunge/.test(n) ? 'lunge' : /squat/.test(n) ? 'squat' : /plank/.test(n) ? 'plank' : /bridge/.test(n) ? 'bridge' : /pike/.test(n) ? 'pike' : /pull|hang/.test(n) ? 'hang' : /walk/.test(n) ? 'walk' : /cat/.test(n) ? 'catcow' : /child/.test(n) ? 'child' : 'squat';
    return `<div class="fx-demo"><svg viewBox="0 0 120 80" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${name} movement demonstration">
      <path d="M8,74 L112,74" stroke="var(--line)" stroke-width="2" stroke-dasharray="4 5"/>${FIG[k]}</svg></div>`;
  }
  const GUIDES_X = {
    'Pull-ups': ['Lats, Biceps, Grip', 'Hang with straight arms, pull until the chin clears the bar, lower under control.', ['Full hang at the bottom', 'No kicking or swinging', 'Chin over the bar']],
    'Dead hang': ['Grip, Shoulders, Spine decompression', 'Hang from the bar with active shoulders, ribs down, breathing steadily.', ['Shoulders pulled slightly away from ears', 'No swinging', 'Stop before grip fails completely']],
    'Goblet squats': ['Quadriceps, Glutes, Core', 'Hold one weight at the chest, sit between the heels and stand tall.', ['Elbows inside the knees at the bottom', 'Chest up', 'Heels stay down']],
    'Cat-cow': ['Spinal mobility', 'On hands and knees, slowly round then arch the spine, moving with the breath.', ['Slow, one breath per movement', 'Move the whole spine', 'No pain']],
    'Child pose': ['Lower back, Hips, Recovery', 'Sit back on the heels, arms long in front, forehead down, breathe slowly.', ['Long exhale', 'Hips heavy', 'Shoulders relaxed']],
    'Brisk walk': ['Heart, Recovery, Mood', 'Walk fast enough that talking takes a little effort. Outdoors if possible.', ['Steady pace', 'Nasal breathing if you can', 'Tall posture']]
  };
  const baseOpen = window.openExerciseModal;
  window.openExerciseModal = function (name) {
    if (GUIDES_X[name] && typeof EXERCISE_GUIDES !== 'undefined' && !EXERCISE_GUIDES[name]) { const g = GUIDES_X[name]; EXERCISE_GUIDES[name] = { target: g[0], desc: g[1], verification: g[2], videoQuery: name + ' proper form tutorial' }; }
    baseOpen.apply(this, arguments);
    const old = el('fxModalDemo'); if (old) old.remove();
    const d = el('modalDesc'); if (d) d.insertAdjacentHTML('beforebegin', `<div id="fxModalDemo">${demo(name)}</div>`);
  };

  /* ---------- 4. GUIDED SESSION ---------- */
  let ses = null, restId = null, holdId = null;
  const parse = it => { const m = it.match(/^(.+?) — (\d+) × (\d+)(.*)$/); return m ? { name: m[1].trim(), sets: +m[2], n: +m[3], u: m[4] || '' } : null; };

  function ensureModal() {
    if (el('fxSession')) return;
    document.body.insertAdjacentHTML('beforeend', `<div id="fxSession" class="modal-overlay hidden"><div class="modal-card" style="max-width:560px;max-height:92vh;overflow-y:auto"><div id="fxBody"></div></div></div>`);
  }
  function beep(f) { try { const C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = f || 880; g.gain.value = .15; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + .3); o.onended = () => c.close(); } catch (e) {} }

  function paint() {
    const b = el('fxBody'); if (!b || !ses) return;
    const st = ses.steps[ses.i], dots = ses.steps.map((x, i) => `<i class="${i < ses.i ? 'd' : i === ses.i ? 'c' : ''}"></i>`).join('');
    if (ses.phase === 'rest') {
      b.innerHTML = `<div class="modal-header"><div><span class="eyebrow">COOLDOWN</span><h3>Rest</h3></div><button class="round" onclick="FX.quit()">✕</button></div>
        <div class="fx-steps">${dots}</div><div class="fx-big" id="fxClock">${ses.rest}</div>
        <p class="fx-note" style="text-align:center">Next: <b style="color:#fff">${st.name}</b> — set ${st.set} of ${st.sets}, target ${st.n}${st.u}</p>
        <div class="fx-row" style="margin-top:14px"><button class="secondary" onclick="FX.addRest()">+15 SEC</button><button class="primary" onclick="FX.skipRest()">SKIP REST</button></div>`;
      return;
    }
    const isTime = / sec| min/.test(st.u), isMin = / min/.test(st.u);
    b.innerHTML = `<div class="modal-header"><div><span class="eyebrow">${ses.plan.badge} • ${ses.i + 1} / ${ses.steps.length}</span><h3>${st.name}</h3></div><button class="round" onclick="FX.quit()">✕</button></div>
      <div class="fx-steps">${dots}</div>${demo(st.name)}
      <p style="text-align:center;margin:0;font-weight:800;letter-spacing:1px;color:var(--muted);font-size:12px">SET ${st.set} OF ${st.sets} • TARGET</p>
      <div class="fx-big" id="fxClock">${st.n}${st.u}</div>
      ${isTime ? `<button class="secondary" id="fxHold" onclick="FX.hold()" style="margin-bottom:10px">▶ START ${isMin ? 'TIMER' : 'HOLD'}</button>` : ''}
      <label>${isTime ? (isMin ? 'Minutes completed' : 'Seconds held') : 'Reps completed'}<input id="fxDone" type="number" min="0" value="${st.n}" inputmode="numeric"></label>
      <div class="fx-row" style="margin-top:12px"><button class="ghost" onclick="openExerciseModal('${st.name.replace(/'/g, "\\'")}')">Form check</button><button class="primary" onclick="FX.log()">LOG SET</button></div>
      <p class="fx-note">Stop a set when form breaks down. Logging fewer reps than the target is fine: the System lowers the next target instead of risking injury.</p>`;
  }
  function startRest() {
    clearInterval(restId); ses.phase = 'rest'; ses.restEnd = Date.now() + ses.rest * 1000; paint();
    restId = setInterval(() => {
      const left = Math.max(0, Math.ceil((ses.restEnd - Date.now()) / 1000)), c = el('fxClock'); if (c) c.textContent = left;
      if (left === 0) { clearInterval(restId); beep(); ses.phase = 'work'; paint(); }
    }, 250);
  }
  function finish() {
    clearInterval(restId); clearInterval(holdId);
    const x = E(), done = ses.steps.filter(t => t.got != null);
    const completion = ses.steps.length ? ses.steps.reduce((a, t) => a + Math.min(1, (t.got || 0) / t.n), 0) / ses.steps.length : 0;
    const minutes = Math.max(1, Math.min(90, Math.round((Date.now() - ses.t0) / 60000)));
    const changes = [];
    // autoregulated progression per exercise
    const by = {}; done.forEach(t => { (by[t.name] = by[t.name] || []).push(t); });
    Object.keys(by).forEach(name => {
      const L = LIB[name]; if (!L || L.fixed || ses.plan.mode === 'recovery') return;
      const sets = by[name], cur = target(name), step = stepOf(name);
      if (sets.length === sets[0].sets && sets.every(t => t.got >= t.n) && sets[0].n >= cur) { x.prog[name] = cur + step; changes.push(`${name} ↑ ${cur + step}${L.u}`); }
      else if (sets.some(t => t.got < t.n * 0.7)) { const nv = Math.max(Math.round(L.b[0] * 0.6), cur - step); if (nv !== cur) { x.prog[name] = nv; changes.push(`${name} ↓ ${nv}${L.u}`); } }
    });
    const xp = ses.plan.mode === 'recovery' ? Math.round(15 * completion) : Math.round(15 + 30 * completion);
    if (done.length) {
      gain(xp); s.sessions++;
      const d = new Date().getDay(); s.activity[d] = Math.min(180, (s.activity[d] || 0) + minutes);
      const tally = {}; done.forEach(t => { const st = (LIB[t.name] || {}).stat || 'str'; tally[st] = (tally[st] || 0) + 1; });
      const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0]; if (completion >= 0.6 && s.stats[top] !== undefined) s.stats[top] += 1;
      if (!x.trained.includes(localDay())) x.trained.push(localDay()); x.trained = x.trained.slice(-120);
      x.log.unshift({ date: localDay(), title: ses.plan.title, pct: Math.round(completion * 100), min: minutes, xp, mode: ses.plan.mode, vol: Math.round(done.reduce((a, t) => a + (/ sec| min/.test(t.u) ? 0 : (t.got || 0) * (/side/.test(t.u) ? 2 : 1)), 0)), hold: Math.round(done.reduce((a, t) => a + (/ sec/.test(t.u) ? (t.got || 0) : 0), 0)) }); x.log = x.log.slice(0, 40);
      save();
    }
    el('fxBody').innerHTML = `<div class="modal-header"><div><span class="eyebrow">RAID REPORT</span><h3>${done.length ? 'Dungeon Cleared' : 'Session Abandoned'}</h3></div><button class="round" onclick="FX.close()">✕</button></div>
      <div class="fx-tiles"><div><span>Completion</span><b>${Math.round(completion * 100)}%</b></div><div><span>Time</span><b>${minutes} min</b></div><div><span>EXP earned</span><b style="color:var(--accent)">+${done.length ? xp : 0}</b></div></div>
      <p class="fx-note" style="margin-top:14px">${changes.length ? '<b style="color:#fff">Targets adjusted for next time:</b><br>' + changes.join('<br>') : (ses.plan.mode === 'recovery' ? 'Recovery sessions do not change your targets.' : 'Targets unchanged. Hit every set at the target to raise it.')}</p>
      <button class="primary" style="margin-top:14px" onclick="FX.close()">RETURN TO STATUS WINDOW</button>`;
    ses.finished = true;
  }

  window.FX = {
    start() {
      ensureModal();
      const plan = generateDynamicPlan(readiness()), steps = [];
      plan.items.map(parse).filter(Boolean).forEach(p => { for (let i = 1; i <= p.sets; i++) steps.push({ name: p.name, set: i, sets: p.sets, n: p.n, u: p.u, got: null }); });
      if (!steps.length) return toast('NO PLAN AVAILABLE', true);
      const r = readiness();
      ses = { plan, steps, i: 0, phase: 'work', t0: Date.now(), rest: plan.mode === 'recovery' ? 30 : r >= 75 ? 60 : r >= 55 ? 75 : 90 };
      el('fxSession').classList.remove('hidden'); paint();
    },
    hold() {
      const st = ses.steps[ses.i], total = / min/.test(st.u) ? st.n * 60 : st.n, t0 = Date.now(), btn = el('fxHold');
      clearInterval(holdId); if (btn) btn.textContent = 'RUNNING…';
      holdId = setInterval(() => {
        const e = Math.floor((Date.now() - t0) / 1000), left = Math.max(0, total - e), c = el('fxClock'), inp = el('fxDone');
        if (c) c.textContent = / min/.test(st.u) ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : left + ' sec';
        if (inp) inp.value = / min/.test(st.u) ? Math.min(st.n, Math.round(e / 60 * 10) / 10) : Math.min(total, e);
        if (left === 0) { clearInterval(holdId); beep(1040); if (btn) btn.textContent = 'TARGET REACHED'; }
      }, 250);
    },
    log() {
      clearInterval(holdId);
      const st = ses.steps[ses.i]; st.got = Math.max(0, parseFloat(el('fxDone').value) || 0);
      ses.i++;
      if (ses.i >= ses.steps.length) return finish();
      startRest();
    },
    skipRest() { clearInterval(restId); ses.phase = 'work'; paint(); },
    addRest() { ses.restEnd += 15000; },
    quit() { if (ses && !ses.finished && ses.steps.some(t => t.got != null)) { if (!confirm('End the session here? Completed sets will still count.')) return; return finish(); } this.close(); },
    close() { clearInterval(restId); clearInterval(holdId); el('fxSession').classList.add('hidden'); ses = null; render(); },
    setMood(v) { E().mood = { date: localDay(), v }; save(); render(); toast(`MOOD LOGGED: ${MOODS[v - 1][1].toUpperCase()} • PLAN RE-CALIBRATED`); },
    bio() { const x = E(); x.bio = { age: Math.max(12, Math.min(90, parseInt(el('fxAge').value, 10) || 22)), sex: el('fxSex').value, goal: el('fxGoal').value }; save(); render(); toast('[SYSTEM] BODY DATA UPDATED'); }
  };

  /* ---------- 5. HONEST NUTRITION TARGETS ---------- */
  function fuel() {
    const x = E(), w = parseFloat(s.weight) || 72, h = parseFloat(s.height) || 178, b = x.bio;
    const bmr = 10 * w + 6.25 * h - 5 * b.age + (b.sex === 'female' ? -161 : 5);
    const af = s.dailyExertion === 'heavy' ? 1.7 : s.dailyExertion === 'moderate' ? 1.5 : 1.35;
    const trainedToday = x.trained.includes(localDay());
    const tdee = Math.round(bmr * af + (trainedToday ? 150 : 0));
    const goalAdj = b.goal === 'cut' ? -400 : b.goal === 'bulk' ? 300 : 0;
    return { bmr: Math.round(bmr), tdee, target: tdee + goalAdj, pLow: Math.round(w * 1.6), pHigh: Math.round(w * 2.0), water: (w * 0.035 + (trainedToday ? 0.5 : 0)).toFixed(1), goal: b.goal };
  }

  /* ---------- 6. INJECTED UI ---------- */
  function inject() {
    const f = el('fatigue');
    if (f && !el('fxMood')) f.closest('.form').insertAdjacentHTML('afterbegin', `<div><label style="margin-bottom:6px">How do you feel right now?</label><div class="fx-moods" id="fxMood"></div><p class="fx-note" id="fxMoodNote"></p></div>`);
    const save1 = el('saveProfile');
    if (save1 && !el('fxAge')) save1.insertAdjacentHTML('beforebegin', `<div class="twice"><label>Age<input id="fxAge" type="number" min="12" max="90" onchange="FX.bio()"></label><label>Sex (for the energy formula)<select id="fxSex" onchange="FX.bio()"><option value="male">Male</option><option value="female">Female</option></select></label></div>
      <label>Body goal<select id="fxGoal" onchange="FX.bio()"><option value="cut">Lose fat (about 400 kcal below maintenance)</option><option value="maintain">Maintain</option><option value="bulk">Build muscle (about 300 kcal above maintenance)</option></select></label>`);
    const tc = el('targetCalories');
    if (tc && !el('fxFuel')) tc.closest('.panel').insertAdjacentHTML('beforeend', `<div class="fx-tiles" id="fxFuel"></div><p class="fx-note" id="fxFuelNote"></p>`);
    const pr = el('progress');
    if (pr && !el('fxLog')) pr.insertAdjacentHTML('beforeend', `<article class="panel mt-6"><div class="panel-head"><div><span class="eyebrow">RAID HISTORY</span><h3>Guided Sessions</h3></div><span class="badge" id="fxRun">0 DAY RUN</span></div><div id="fxLog"></div></article>`);
  }

  function rebuild(id, cfg) { if (typeof Chart === 'undefined') return; const c = el(id); if (!c) return; try { const o = Chart.getChart(c); if (o) o.destroy(); new Chart(c, cfg); } catch (e) {} }

  function after() {
    inject();
    const x = E(), md = mood(), r = readiness(), fu = fuel();

    // mood row
    if (el('fxMood')) {
      el('fxMood').innerHTML = MOODS.map((m, i) => `<button type="button" class="${md.src && md.v === i + 1 ? 'on' : ''}" onclick="FX.setMood(${i + 1})"><span>${m[0]}</span><small>${m[1]}</small></button>`).join('');
      const adj = MOODS[md.v - 1][2], run = streakDays();
      el('fxMoodNote').innerHTML = (md.src ? `Mood <b style="color:#fff">${MOODS[md.v - 1][1]}</b> (${md.src}): ${adj >= 0 ? '+' : ''}${adj} readiness.` : 'No mood logged today. Tap one, or set it on the Growth tab of the main app.') + (run >= 3 ? ` ${run} training days in a row: −${(run - 2) * 6} for accumulated fatigue.` : '') + ` Final readiness <b style="color:var(--accent)">${r}/100</b>.`;
    }
    // plan: guided-session button
    const tp = el('todayPlan');
    if (tp && !tp.querySelector('#fxStart')) tp.querySelector('.plan').insertAdjacentHTML('beforeend', `<button class="secondary" id="fxStart" style="margin-top:10px" onclick="FX.start()">▶ START GUIDED SESSION (TRACKED SETS, REST TIMER, FORM DEMOS)</button><p class="fx-note">Guided sessions log real time and adjust your targets. The quick button above just awards the EXP.</p>`);

    // body data fields
    if (el('fxAge') && document.activeElement !== el('fxAge')) { el('fxAge').value = x.bio.age; el('fxSex').value = x.bio.sex; el('fxGoal').value = x.bio.goal; }

    // nutrition target using age, sex, activity and goal
    const consumed = s.food.reduce((a, f) => a + f.cal, 0), protein = s.food.reduce((a, f) => a + f.pro, 0);
    if (el('targetCalories')) el('targetCalories').textContent = `${fu.target.toLocaleString()} kcal`;
    const cs = el('calorieStatus');
    if (cs) {
      const diff = consumed - fu.target;
      if (consumed === 0) { cs.textContent = 'Nothing logged yet today'; cs.style.color = 'var(--muted)'; }
      else if (diff < -300) { cs.textContent = `${-diff} kcal still to eat`; cs.style.color = '#00e5ff'; }
      else if (diff > 300) { cs.textContent = `${diff} kcal over target`; cs.style.color = '#fbbf24'; }
      else { cs.textContent = 'On target'; cs.style.color = '#10b981'; }
    }
    if (el('fxFuel')) {
      el('fxFuel').innerHTML = `<div><span>Protein today</span><b style="color:${protein >= fu.pLow ? '#10b981' : '#fff'}">${Math.round(protein)} / ${fu.pLow}–${fu.pHigh} g</b></div><div><span>Maintenance (TDEE)</span><b>${fu.tdee.toLocaleString()} kcal</b></div><div><span>Water target</span><b>${fu.water} L</b></div>`;
      el('fxFuelNote').textContent = `Mifflin-St Jeor estimate from ${s.weight || 72} kg, ${s.height || 178} cm, age ${x.bio.age}; activity from your Condition Scan; goal: ${fu.goal}. Estimates like this are typically within about 10%, so adjust by how your weight trends over 2–3 weeks.`;
    }

    // daily snapshot → real history
    const today = localDay();
    x.days[today] = { cal: Math.round(consumed), pro: Math.round(protein * 10) / 10, xp: s.xp, min: (x.log.filter(l => l.date === today).reduce((a, l) => a + l.min, 0)), q: s.quests.filter(q => q.done).length };
    const keys = Object.keys(x.days).sort(); if (keys.length > 120) keys.slice(0, keys.length - 120).forEach(k => delete x.days[k]);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}

    const last7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const lab = last7.map(d => d.toLocaleDateString('en-GB', { weekday: 'short' })), get = k => last7.map(d => { const v = x.days[d.toLocaleDateString('en-CA')]; return v ? v[k] : null; });
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00e5ff';
    const opt = extra => Object.assign({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { maxTicksLimit: 4 }, grid: { color: 'rgba(255,255,255,.05)' } } } }, extra || {});
    rebuild('cCal', { type: 'bar', data: { labels: lab, datasets: [{ label: 'kcal', data: get('cal'), backgroundColor: '#fbbf24', borderRadius: 4 }, { type: 'line', label: 'Target', data: lab.map(() => fu.target), borderColor: 'rgba(255,255,255,.5)', borderDash: [5, 5], pointRadius: 0, borderWidth: 1.5 }] }, options: opt() });
    rebuild('cPro', { type: 'line', data: { labels: lab, datasets: [{ label: 'Protein g', data: get('pro'), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.15)', fill: true, tension: .3, spanGaps: true }, { label: 'Minimum', data: lab.map(() => fu.pLow), borderColor: 'rgba(255,255,255,.5)', borderDash: [5, 5], pointRadius: 0, borderWidth: 1.5 }] }, options: opt() });
    let lastXp = null; const xpSeries = get('xp').map(v => { if (v != null) lastXp = v; return lastXp; });
    rebuild('cXp', { type: 'line', data: { labels: lab, datasets: [{ data: xpSeries, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.2)', fill: true, tension: .3, spanGaps: true }] }, options: opt() });
    rebuild('cActivity', { type: 'bar', data: { labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], datasets: [{ data: s.activity, backgroundColor: accent, borderRadius: 4 }] }, options: opt() });
    const modes = { standard: 0, overdrive: 0, recovery: 0 }; x.log.forEach(l => { modes[l.mode] = (modes[l.mode] || 0) + 1; });
    if (x.log.length) rebuild('cDungeon', { type: 'doughnut', data: { labels: ['Standard', 'Overdrive', 'Recovery'], datasets: [{ data: [modes.standard, modes.overdrive, modes.recovery], backgroundColor: ['#3b82f6', '#ef4444', '#10b981'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } } } });

    if (el('fxLog')) {
      el('fxRun').textContent = `${streakDays()} DAY RUN`;
      el('fxLog').innerHTML = x.log.length ? x.log.slice(0, 10).map(l => `<div class="history-row"><span><b>${l.title}</b><br><span class="muted">${l.date}</span></span><span>${l.pct}% • ${l.min} min • +${l.xp} EXP</span></div>`).join('') : `<div class="muted" style="font-size:13px;padding:10px">No guided sessions yet. Start one from Today's Dungeon Training.</div>`;
    }
    if (el('weekMinutes')) el('weekMinutes').textContent = s.activity.reduce((a, b) => a + b, 0);
  }

  /* ---------- 7. HOUSEKEEPING BEFORE EACH RENDER ---------- */
  function before() {
    const x = E(), now = new Date();
    const wk = new Date(now); wk.setDate(now.getDate() - now.getDay()); const weekKey = wk.toLocaleDateString('en-CA');
    if (x.weekKey !== weekKey) { if (x.weekKey) s.activity = [0, 0, 0, 0, 0, 0, 0]; x.weekKey = weekKey; }     // combat minutes are per week
    if (x.lastClear && s.streak > 0) {
      const gap = Math.round((new Date(localDay()) - new Date(x.lastClear)) / 86400000);
      if (gap > 1) { s.streak = 0; x.lastClear = null; setTimeout(() => toast('[PENALTY] STREAK RESET • A DAY WAS MISSED', true), 600); }
    }
  }
  const baseQuest = window.completeQuest;
  window.completeQuest = function (id) { baseQuest.apply(this, arguments); if (s.quests.length && s.quests.every(q => q.done)) { E().lastClear = localDay(); save(); } };

  const prevRender = window.render;
  window.render = function () {
    try { before(); } catch (e) { console.error(e); }
    const r = prevRender.apply(this, arguments);
    try { after(); } catch (e) { console.error('Expansion render failed', e); }
    return r;
  };

  /* ---------- 8. THE ARCHITECT learns the new systems ---------- */
  try {
    answers.unshift(
      { keywords: ['mood', 'feel', 'motivat', 'lazy'], answer: () => { const m = mood(); return `[MOOD ANALYSIS]\nCurrent mood: ${MOODS[m.v - 1][1]}${m.src ? ' (' + m.src + ')' : ' (not logged)'}. Readiness after adjustment: ${readiness()}/100.\n${m.v <= 2 ? 'Low days are for recovery sessions. Showing up for ten minutes keeps the habit alive.' : 'Conditions are good. Run the guided session and hit every target.'}`; } },
      { keywords: ['progress', 'target', 'stronger', 'overload', 'c-rank', 'rank'], answer: () => { const p = E().prog, k = Object.keys(p); return `[PROGRESSION REPORT]\n${k.length ? k.map(n => `${n}: ${p[n]}${LIB[n] ? LIB[n].u : ''}`).join('\n') : 'No targets adjusted yet.'}\n\nComplete every set of a guided session at the target and the System raises it. Miss badly and it lowers it. Rank rises with level: C-Rank at level 10.`; } },
      { keywords: ['rest', 'recover', 'sore', 'sleep'], answer: () => `[RECOVERY DIRECTIVE]\nTraining run: ${streakDays()} day(s) in a row. After three, readiness drops and a fourth day becomes active recovery. Sleep 7–9 hours, eat ${fuel().pLow}–${fuel().pHigh} g protein and drink about ${fuel().water} L of water.` },
      { keywords: ['plan', 'session', 'today', 'workout', 'train'], answer: () => { const p = generateDynamicPlan(readiness()); return `[TODAY'S PROTOCOL]\n${p.title}\n${p.items.join('\n')}\n\n${p.sub}`; } }
    );
  } catch (e) {}

  document.addEventListener('DOMContentLoaded', () => { try { render(); } catch (e) { console.error(e); } });
})();


/* =========================================================
   LEVEL//UP FITNESS — EXPANSION PACK 3
   Hunter-system theme (original artwork), level-up window,
   extended telemetry, live link to the C.A.S.P.E.R. app.
   Additive: nothing above this block is modified.
========================================================= */
(function () {
  'use strict';
  const el = id => document.getElementById(id);
  const today = () => new Date().toLocaleDateString('en-CA');
  const dk = d => d.toLocaleDateString('en-CA');
  const lastDays = n => [...Array(n)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return d; });
  const tip = t => `<span class="info-icon" data-info="${t.replace(/"/g, '&quot;')}"><i data-lucide="info"></i></span>`;
  const X = () => { s.ext = s.ext || {}; const x = s.ext; x.days = x.days || {}; x.log = x.log || []; x.trained = x.trained || []; x.prog = x.prog || {}; return x; };

  /* ---------- theme ---------- */
  const css = document.createElement('style');
  css.textContent = `
    body { background: radial-gradient(circle at 85% -10%, #1e1b4b 0, #0b1024 30%, #030712 60%); }
    .info-icon svg { width: 15px; height: 15px; }
    .panel, .metric, .status-window, .fuel, .workout { position: relative; background: linear-gradient(180deg, rgba(30,58,138,.20), rgba(8,14,32,.82) 46%), repeating-linear-gradient(0deg, rgba(96,165,250,.035) 0 1px, transparent 1px 4px); border-color: rgba(96,165,250,.38); box-shadow: 0 0 22px rgba(37,99,235,.14), inset 0 0 26px rgba(59,130,246,.05); }
    .panel::before, .status-window::after { content: ''; position: absolute; left: 14px; right: 14px; top: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: .8; pointer-events: none; }
    .quest { border-color: rgba(96,165,250,.35); background: linear-gradient(90deg, rgba(30,58,138,.25), rgba(0,0,0,.4)); }
    .quest.done { border-color: var(--accent); } .quest-main b { letter-spacing: .3px; }
    .hero { border-color: rgba(96,165,250,.5); }
    .orb { overflow: visible; }
    .fx-gate { position: absolute; inset: -46px; width: calc(100% + 92px); height: calc(100% + 92px); pointer-events: none; filter: drop-shadow(0 0 14px var(--accent)); }
    .fx-gate .a { transform-origin: 100px 100px; animation: fxSpin 14s linear infinite; } .fx-gate .b { transform-origin: 100px 100px; animation: fxSpin 9s linear infinite reverse; } .fx-gate .c { transform-origin: 100px 100px; animation: fxSpin 22s linear infinite; }
    @keyframes fxSpin { to { transform: rotate(360deg); } }
    .fx-emb { vertical-align: middle; margin-right: 8px; filter: drop-shadow(0 0 8px var(--rc)); }
    #fxParticles { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; } .app-shell { position: relative; z-index: 1; }
    #fxParticles i { position: absolute; bottom: -10px; width: 3px; height: 3px; border-radius: 50%; background: #60a5fa; box-shadow: 0 0 8px #60a5fa; opacity: 0; animation: fxRise linear infinite; }
    @keyframes fxRise { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: .75; } 100% { transform: translateY(-105vh) translateX(20px); opacity: 0; } }
    #fxLevel { position: fixed; inset: 0; z-index: 20000; display: grid; place-items: center; background: rgba(2,6,23,.82); backdrop-filter: blur(6px); }
    .fx-sys { position: relative; min-width: min(430px, 88vw); text-align: center; padding: 36px 26px 26px; border: 1px solid #60a5fa; border-radius: 14px; background: linear-gradient(180deg, rgba(30,58,138,.5), rgba(3,7,18,.96) 60%); box-shadow: 0 0 40px rgba(59,130,246,.5), inset 0 0 40px rgba(59,130,246,.12); animation: fxPop .5s cubic-bezier(.2,1.4,.4,1); }
    .fx-sys::before { content: 'SYSTEM'; position: absolute; top: 0; left: 50%; transform: translateX(-50%); font: 800 10px 'Exo 2', sans-serif; letter-spacing: .25em; color: #030712; background: #60a5fa; padding: 3px 14px; border-radius: 0 0 8px 8px; }
    .fx-sys h2 { font: 900 46px 'Exo 2', sans-serif; margin: 8px 0 2px; color: #fff; text-shadow: 0 0 26px #60a5fa; } .fx-sys p { color: #93c5fd; font-weight: 800; letter-spacing: 2px; font-size: 12px; margin: 0; text-transform: uppercase; }
    @keyframes fxPop { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .fx-shadow { display: block; margin: 0 auto 6px; width: 46px; height: 46px; color: #64748b; } .stat-box.fx-on .fx-shadow { color: #c084fc; filter: drop-shadow(0 0 10px #a855f7); animation: fxBreath 2.6s ease-in-out infinite; }
    @keyframes fxBreath { 50% { transform: translateY(-2px); filter: drop-shadow(0 0 16px #a855f7); } }
    .fx-link { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; } .fx-link > div, .fx-link > a { background: rgba(0,0,0,.45); border: 1px solid var(--line); border-radius: 10px; padding: 12px; text-decoration: none; color: inherit; }
    .fx-link span { display: block; font-size: 10.5px; font-weight: 800; letter-spacing: 1.5px; color: #93c5fd; text-transform: uppercase; } .fx-link b { font: 800 17px 'Exo 2', sans-serif; display: block; margin-top: 4px; } .fx-link small { color: var(--muted); font-size: 12px; }
    .fx-cal { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; max-width: 420px; margin: 0 auto; } .fx-cal i { aspect-ratio: 1; border-radius: 7px; border: 1px solid var(--line); display: grid; place-items: center; font-style: normal; font-size: 11px; font-weight: 800; color: var(--muted); }
    @media (max-width: 900px) { .fx-link { grid-template-columns: 1fr 1fr; } }
    @media (prefers-reduced-motion: reduce) { #fxParticles, .fx-gate .a, .fx-gate .b, .fx-gate .c { animation: none; display: none; } }
  `;
  document.head.appendChild(css);

  const RC = { 'E-Rank': '#94a3b8', 'D-Rank': '#34d399', 'C-Rank': '#3b82f6', 'B-Rank': '#a855f7', 'A-Rank': '#f97316', 'S-Rank': '#ef4444' };
  const emblem = (r, size) => `<svg class="fx-emb" style="--rc:${RC[r] || '#94a3b8'}" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,4 90,24 90,66 50,96 10,66 10,24" fill="rgba(3,7,18,.9)" stroke="${RC[r] || '#94a3b8'}" stroke-width="4"/><text x="50" y="66" text-anchor="middle" font-family="'Exo 2', sans-serif" font-weight="900" font-size="46" fill="${RC[r] || '#94a3b8'}">${r.charAt(0)}</text></svg>`;
  // original shadow-soldier glyph: a hooded helm with lit eyes
  const SHADOW = `<svg class="fx-shadow" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><path d="M24 3c-9 0-15 7-15 16v9l-4 10 9-3 4 9 6-6 6 6 4-9 9 3-4-10v-9c0-9-6-16-15-16zm-7 17 6 3v3l-7-2zm14 0 1 4-7 2v-3z"/></svg>`;
  const GATE = `<svg class="fx-gate" viewBox="0 0 200 200" fill="none" aria-hidden="true"><g class="a"><circle cx="100" cy="100" r="92" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="60 18 6 18" opacity=".7"/></g><g class="b"><circle cx="100" cy="100" r="82" stroke="#a855f7" stroke-width="3" stroke-dasharray="110 40 20 40" stroke-linecap="round" opacity=".75"/></g><g class="c"><path d="M100 12 L108 30 L100 24 L92 30 Z M188 100 L170 108 L176 100 L170 92 Z M100 188 L92 170 L100 176 L108 170 Z M12 100 L30 92 L24 100 L30 108 Z" fill="var(--accent)" opacity=".8"/></g></svg>`;

  /* ---------- level-up window ---------- */
  function sysWindow(big, small, extra) {
    const o = el('fxLevel'); if (o) o.remove();
    document.body.insertAdjacentHTML('beforeend', `<div id="fxLevel" onclick="this.remove()"><div class="fx-sys">${extra || ''}<p>${small}</p><h2>${big}</h2><p style="color:var(--muted);letter-spacing:1px;margin-top:10px">tap to continue</p></div></div>`);
    setTimeout(() => { const e = el('fxLevel'); if (e) e.remove(); }, 5500);
  }
  const prevGain = window.gain;
  window.gain = function (xp) {
    const l0 = s.level, r0 = rank();
    const r = prevGain.apply(this, arguments);
    if (s.level > l0) { const r1 = rank(); setTimeout(() => sysWindow('LEVEL ' + s.level, r1 !== r0 ? `Rank up • you are now ${r1}` : 'You have levelled up', emblem(r1, 96)), 400); }
    return r;
  };

  /* ---------- link to the main app (same browser storage) ---------- */
  const getJ = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } };
  function mainLink() {
    const m = getJ('walletMoodHistory', {})[today()], habits = getJ('walletCustomHabits', [{ id: 'h1', text: 'Read 10 Pages' }, { id: 'h2', text: 'LEVEL//UP Fitness Protocol' }, { id: 'h3', text: '15 Mins Skill Practice' }, { id: 'h4', text: 'Zero Zero-Days (Consistency)' }]);
    const hist = getJ('walletHabitHistory', {}), done = hist[today()] || [];
    let mode = null;
    if (m) { const sc = (Number(m.energy) || 5) * 0.3 + (Number(m.focus) || 5) * 0.3 + (Number(m.mood) || 3) * 2 * 0.4; mode = sc < 4 ? ['Recovery', '#f87171'] : sc < 6 ? ['Steady', '#fbbf24'] : sc < 8 ? ['Build', '#34d399'] : ['Overdrive', '#00e5ff']; }
    const fitHabits = habits.filter(h => /fitness|workout|level\/\/up|exercise|gym|train/i.test(h.text));
    return { m, mode, habits, hist, done, fitHabits, focus: getJ('walletFocusLog', {})[today()] || 0 };
  }
  function pushHabit() {                       // a finished session ticks the fitness habit in the main app
    const x = X(); if (!x.trained.includes(today())) return;
    const L = mainLink(); let ch = false;
    L.fitHabits.forEach(h => { if (!L.done.includes(h.id)) { L.done.push(h.id); ch = true; } });
    if (ch) { L.hist[today()] = L.done; try { localStorage.setItem('walletHabitHistory', JSON.stringify(L.hist)); } catch (e) {} }
  }

  /* ---------- injected UI ---------- */
  function inject() {
    if (!el('fxParticles')) { const p = document.createElement('div'); p.id = 'fxParticles'; p.innerHTML = [...Array(18)].map((_, i) => `<i style="left:${(i * 5.7 + 2) % 100}%;animation-duration:${8 + (i * 7) % 12}s;animation-delay:${(i * 1.1) % 9}s;${i % 3 === 0 ? 'background:#a855f7;box-shadow:0 0 8px #a855f7' : ''}"></i>`).join(''); document.body.prepend(p); }
    const orb = document.querySelector('.orb'); if (orb && !orb.querySelector('.fx-gate')) orb.insertAdjacentHTML('afterbegin', GATE);
    for (let i = 1; i <= 5; i++) { const b = el('shadow' + i); if (b && !b.querySelector('.fx-shadow')) b.insertAdjacentHTML('afterbegin', SHADOW); }
    const sw = document.querySelector('#command .status-window');
    if (sw && !el('fxLinkPanel')) sw.insertAdjacentHTML('afterend', `<article class="panel" id="fxLinkPanel" style="margin-bottom:25px"><div class="panel-head"><div><span class="eyebrow">C.A.S.P.E.R. LINK ${tip('This module shares data with the main app in the same browser. Your mood and energy from the Growth tab set today’s training load here, and finishing a guided session ticks your fitness habit and adds EXP over there.')}</span><h3>Connected Systems</h3></div><a class="ghost" href="../index.html" style="text-decoration:none">Open command centre</a></div><div class="fx-link" id="fxLink"></div></article>`);
    const grid = document.querySelector('#progress .chart-grid-8');
    if (grid && !el('fxMore')) grid.insertAdjacentHTML('afterend', `
      <div class="section-title"><div><span class="eyebrow">DEEP SCAN</span><h3 style="display:flex;align-items:center">Extended Telemetry ${tip('Eight more views built only from what you have actually logged: readiness, guided sessions, hydration and stat changes. Days without data are left empty.')}</h3></div></div>
      <div class="chart-grid-8" id="fxMore">
        ${[['fxcReady', 'READINESS', 'Readiness & Mood Trend', 'Daily readiness score (0 to 100) with your mood (scaled to 100). Shows how sleep, fatigue and mood move your training load.'],
          ['fxcDone', 'EXECUTION', 'Session Completion', 'How much of each guided session you completed, most recent on the right. Colour shows the session type.'],
          ['fxcVol', 'WORKLOAD', 'Training Volume', 'Total reps (bars) and total seconds held (line) per guided session. Rising volume over weeks is progressive overload.'],
          ['fxcStats', 'ATTRIBUTES', 'Stat Growth', 'Your five attributes over the last 14 days.'],
          ['fxcWater', 'HYDRATION', 'Water Intake', 'Glasses logged per day against the 8 glass goal.'],
          ['fxcXpDay', 'PROGRESSION', 'EXP Earned Per Day', 'EXP gained each day, from quests, workouts, sessions and records.'],
          ['fxcMin', 'TIME UNDER LOAD', 'Guided Minutes Per Day', 'Real minutes spent in guided sessions each day.'],
          ['fxcBal', 'ENERGY BALANCE', 'Calories vs Target', 'Each day’s calories minus your target. Bars above zero are a surplus, below zero a deficit. Days with nothing logged are skipped.']
        ].map(c => `<article class="panel"><div class="panel-head"><div><span class="eyebrow">${c[1]} ${tip(c[3])}</span><h3>${c[2]}</h3></div></div><div class="chart-container"><canvas id="${c[0]}"></canvas></div></article>`).join('')}
      </div>
      <article class="panel" style="margin-bottom:30px"><div class="panel-head"><div><span class="eyebrow">CONSISTENCY ${tip('The last 28 days. Bright squares are days with a guided session; the outline marks days all daily quests were cleared.')}</span><h3>Training Calendar</h3></div><span class="badge" id="fxCalBadge"></span></div><div class="fx-cal" id="fxCal"></div></article>`);
    // info buttons for panels added by the earlier packs
    [['uxHydration', 'Each glass is about 250 ml. Reaching 8 gives +1 PER once per day. The count resets at midnight.'], ['uxTimerPanel', 'A stand-alone rest timer. Guided sessions run their own rest timer automatically.'], ['uxProgressExtras', 'Log your weight to see the trend and BMI; it also updates the calorie target. Beat a personal record for +10 EXP.'], ['fxMood', 'Mood changes readiness: Drained −15, Low −7, Good +4, Charged +8. A drained mood always gives a recovery session. If you have not logged one here, the mood from the main app’s Growth tab is used.']]
      .forEach(([id, t]) => { const n = el(id); const eb = n && (n.matches('.panel') ? n : n.closest('.panel') || n).querySelector('.eyebrow, label'); if (eb && !eb.querySelector('.info-icon')) eb.insertAdjacentHTML('beforeend', ' ' + tip(t)); });
  }

  function mk(id, cfg) { if (typeof Chart === 'undefined') return; const c = el(id); if (!c) return; try { const o = Chart.getChart(c); if (o) o.destroy(); new Chart(c, cfg); } catch (e) { console.error('chart ' + id, e); } }
  const opt = extra => Object.assign({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { maxTicksLimit: 5 }, grid: { color: 'rgba(255,255,255,.05)' } } } }, extra || {});
  const legend = { plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 10 } } } } };

  function after() {
    inject();
    const x = X(), t = today(), r = readiness(), L = mainLink();
    const moodV = (x.mood && x.mood.date === t) ? x.mood.v : (L.m && L.m.mood ? Number(L.m.mood) : null);
    x.days[t] = Object.assign(x.days[t] || {}, { r, w: x.water || 0, st: Object.assign({}, s.stats), md: moodV, lv: s.level });
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    pushHabit();

    // rank emblem + shadows
    const rk = rank(), rEl = el('rank'); if (rEl && rEl.parentElement && !rEl.parentElement.querySelector('.fx-emb')) rEl.parentElement.insertAdjacentHTML('afterbegin', emblem(rk, 26)); else if (rEl) { const e = rEl.parentElement.querySelector('.fx-emb'); if (e) e.outerHTML = emblem(rk, 26); }
    [10, 20, 30, 40, 50].forEach((lv, i) => { const b = el('shadow' + (i + 1)); if (b) b.classList.toggle('fx-on', s.level >= lv); });

    // connected systems
    const L2 = mainLink(), habitOk = L2.fitHabits.length && L2.fitHabits.every(h => L2.done.includes(h.id));
    if (el('fxLink')) el('fxLink').innerHTML = `
      <div><span>Growth mode today</span><b style="color:${L2.mode ? L2.mode[1] : 'var(--muted)'}">${L2.mode ? L2.mode[0] : 'Not set'}</b><small>${L2.m ? `energy ${L2.m.energy}/10 • focus ${L2.m.focus}/10` : 'log a mood here or on the Growth tab'}</small></div>
      <div><span>Fitness habit</span><b style="color:${habitOk ? '#10b981' : '#fff'}">${L2.fitHabits.length ? (habitOk ? 'Ticked' : 'Pending') : 'No habit'}</b><small>${L2.fitHabits.length ? (habitOk ? 'synced to the Habit Matrix' : 'finish a guided session to tick it') : 'add a habit with "fitness" in its name'}</small></div>
      <div><span>Habits today</span><b>${L2.done.filter(id => L2.habits.some(h => h.id === id)).length} / ${L2.habits.length}</b><small>from the main app</small></div>
      <div><span>Focus today</span><b>${L2.focus} min</b><small>from the Growth focus timer</small></div>`;

    // ---- extended telemetry ----
    const d14 = lastDays(14), l14 = d14.map(d => d.getDate()), k14 = d14.map(dk), accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00e5ff';
    const day = k => x.days[k] || {};
    mk('fxcReady', { type: 'line', data: { labels: l14, datasets: [{ label: 'Readiness', data: k14.map(k => day(k).r ?? null), borderColor: accent, backgroundColor: 'rgba(0,229,255,.12)', fill: true, tension: .35, spanGaps: true, pointRadius: 3 }, { label: 'Mood', data: k14.map(k => day(k).md ? day(k).md * 20 : null), borderColor: '#fbbf24', borderDash: [5, 4], tension: .35, spanGaps: true, pointRadius: 3 }] }, options: opt(Object.assign({ scales: { x: { grid: { display: false } }, y: { min: 0, max: 100, ticks: { stepSize: 25 }, grid: { color: 'rgba(255,255,255,.05)' } } } }, legend)) });
    const log = x.log.slice(0, 10).reverse(), mc = { standard: '#3b82f6', overdrive: '#ef4444', recovery: '#10b981' };
    mk('fxcDone', { type: 'bar', data: { labels: log.length ? log.map(l => l.date.slice(5)) : ['—'], datasets: [{ data: log.length ? log.map(l => l.pct) : [0], backgroundColor: log.length ? log.map(l => mc[l.mode] || accent) : ['rgba(255,255,255,.06)'], borderRadius: 4 }] }, options: opt({ scales: { x: { grid: { display: false } }, y: { min: 0, max: 100, ticks: { stepSize: 25, callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,.05)' } } } }) });
    mk('fxcVol', { data: { labels: log.length ? log.map(l => l.date.slice(5)) : ['—'], datasets: [{ type: 'bar', label: 'Reps', data: log.map(l => l.vol || 0), backgroundColor: accent, borderRadius: 4, yAxisID: 'y' }, { type: 'line', label: 'Hold sec', data: log.map(l => l.hold || 0), borderColor: '#a855f7', backgroundColor: '#a855f7', tension: .3, yAxisID: 'h' }] }, options: opt(Object.assign({ scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { maxTicksLimit: 5 }, grid: { color: 'rgba(255,255,255,.05)' } }, h: { position: 'right', beginAtZero: true, ticks: { maxTicksLimit: 5 }, grid: { display: false } } } }, legend)) });
    const SC = { str: '#ef4444', vit: '#10b981', agi: '#3b82f6', int: '#a855f7', per: '#fbbf24' };
    mk('fxcStats', { type: 'line', data: { labels: l14, datasets: Object.keys(SC).map(st => ({ label: st.toUpperCase(), data: k14.map(k => day(k).st ? day(k).st[st] : null), borderColor: SC[st], backgroundColor: SC[st], tension: .25, spanGaps: true, pointRadius: 2, borderWidth: 2 })) }, options: opt(Object.assign({ scales: { x: { grid: { display: false } }, y: { beginAtZero: false, ticks: { maxTicksLimit: 5 }, grid: { color: 'rgba(255,255,255,.05)' } } } }, legend)) });
    const d7 = lastDays(7), k7 = d7.map(dk), l7 = d7.map(d => d.toLocaleDateString('en-GB', { weekday: 'short' }));
    mk('fxcWater', { data: { labels: l7, datasets: [{ type: 'bar', label: 'Glasses', data: k7.map(k => day(k).w ?? null), backgroundColor: '#3b82f6', borderRadius: 4 }, { type: 'line', label: 'Goal', data: l7.map(() => 8), borderColor: 'rgba(255,255,255,.5)', borderDash: [5, 5], pointRadius: 0, borderWidth: 1.5 }] }, options: opt({ scales: { x: { grid: { display: false } }, y: { min: 0, suggestedMax: 10, ticks: { stepSize: 2 }, grid: { color: 'rgba(255,255,255,.05)' } } } }) });
    const allK = Object.keys(x.days).sort(); const xpAt = k => { const i = allK.indexOf(k); if (i < 0 || x.days[k].xp == null) return null; const prev = i > 0 ? (x.days[allK[i - 1]].xp || 0) : 0; return Math.max(0, x.days[k].xp - prev); };
    mk('fxcXpDay', { type: 'bar', data: { labels: l14, datasets: [{ data: k14.map(xpAt), backgroundColor: '#a855f7', borderRadius: 4 }] }, options: opt() });
    mk('fxcMin', { type: 'bar', data: { labels: l14, datasets: [{ data: k14.map(k => x.log.filter(l => l.date === k).reduce((a, l) => a + l.min, 0) || null), backgroundColor: '#10b981', borderRadius: 4 }] }, options: opt() });
    const w = parseFloat(s.weight) || 72, h = parseFloat(s.height) || 178, b = x.bio || { age: 22, sex: 'male', goal: 'maintain' };
    const target = Math.round((10 * w + 6.25 * h - 5 * b.age + (b.sex === 'female' ? -161 : 5)) * (s.dailyExertion === 'heavy' ? 1.7 : s.dailyExertion === 'moderate' ? 1.5 : 1.35) + (b.goal === 'cut' ? -400 : b.goal === 'bulk' ? 300 : 0));
    const bal = k7.map(k => day(k).cal ? day(k).cal - target : null);
    mk('fxcBal', { type: 'bar', data: { labels: l7, datasets: [{ data: bal, backgroundColor: bal.map(v => v == null ? '#000' : v >= 0 ? '#fbbf24' : '#3b82f6'), borderRadius: 4 }] }, options: opt({ scales: { x: { grid: { display: false } }, y: { ticks: { maxTicksLimit: 5 }, grid: { color: 'rgba(255,255,255,.08)' } } } }) });

    if (el('fxCal')) {
      const d28 = lastDays(28); let n = 0;
      el('fxCal').innerHTML = d28.map(d => { const k = dk(d), tr = x.trained.includes(k), q = (x.days[k] || {}).q >= 4; if (tr) n++; return `<i title="${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}${tr ? ': trained' : ''}${q ? ', all quests cleared' : ''}" style="background:${tr ? 'var(--accent)' : 'rgba(0,0,0,.4)'};color:${tr ? '#000' : 'var(--muted)'};${q ? 'box-shadow:0 0 0 2px #a855f7;' : ''}${tr ? 'border-color:var(--accent);' : ''}">${d.getDate()}</i>`; }).join('');
      el('fxCalBadge').textContent = `${n} / 28 DAYS`;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  const prev = window.render;
  window.render = function () { const r = prev.apply(this, arguments); try { after(); } catch (e) { console.error('Expansion 3 render failed', e); } return r; };
  window.addEventListener('storage', e => { if (/^wallet(MoodHistory|HabitHistory|FocusLog)$/.test(e.key || '')) { try { render(); } catch (er) {} } });

  // optional personal artwork: drop files into fitness/assets/ and they are used automatically
  const artOk = {};
  function applyArt() {
    if (artOk.hero) { const h = document.querySelector('.hero'); if (h) { h.style.backgroundImage = "linear-gradient(100deg, rgba(3,7,18,.95) 35%, rgba(3,7,18,.45)), url('assets/hero.jpg')"; h.style.backgroundSize = 'cover'; h.style.backgroundPosition = 'center'; h.style.backgroundBlendMode = 'normal'; } }
    if (artOk.avatar) { const a = el('playerAvatar'); if (a) { a.textContent = ''; a.style.backgroundImage = "url('assets/avatar.jpg')"; a.style.backgroundSize = 'cover'; a.style.backgroundPosition = 'center'; } }
  }
  function probeArt() { ['hero', 'avatar'].forEach(n => { const im = new Image(); im.onload = () => { artOk[n] = true; applyArt(); }; im.src = 'assets/' + n + '.jpg'; }); }
  const auraPrev = window.applySystemAura;
  if (typeof auraPrev === 'function') window.applySystemAura = function () { const r = auraPrev.apply(this, arguments); try { applyArt(); } catch (e) {} return r; };

  document.addEventListener('DOMContentLoaded', () => { try { render(); probeArt(); } catch (e) { console.error(e); } });
})();


/* =========================================================
   LEVEL//UP FITNESS — EXPANSION PACK 4
   Hunter-system artwork (original), animated aura background,
   quest countdown, job titles, own-picture slots, motion,
   phone layout.
   Additive: nothing above this block is modified.
========================================================= */
(function () {
  'use strict';
  const el = id => document.getElementById(id);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const getJ = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } };

  const css = document.createElement('style');
  css.textContent = `
    #toast { pointer-events: none; }            /* the hidden toast used to sit invisibly over the corner and swallow taps */
    .coach-layout > *, .two-col > *, .dashboard-grid > *, .chart-grid-8 > *, .workout-grid > *, .metric-grid > *, .fuel-cards > *, .panel, main { min-width: 0; }   /* lets wide rows scroll inside their card instead of stretching the page */
    .quick, .filter { max-width: 100%; }
    #fxBg { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none; }
    #fxWall { position: fixed; inset: 0; z-index: 0; background-size: cover; background-position: center; opacity: .2; pointer-events: none; }
    .hero > *:not(.fx-scene) { position: relative; z-index: 2; }
    .fx-scene { position: absolute; right: 0; bottom: 0; height: 100%; width: min(62%, 560px); z-index: 1; opacity: .62; pointer-events: none; -webkit-mask-image: linear-gradient(90deg, transparent, #000 35%); mask-image: linear-gradient(90deg, transparent, #000 35%); }
    .fx-scene .swirl { transform-origin: 250px 120px; animation: fxSpin 18s linear infinite; } .fx-scene .swirl2 { transform-origin: 250px 120px; animation: fxSpin 11s linear infinite reverse; }
    .fx-scene .eye { animation: fxEye 3.2s ease-in-out infinite; } @keyframes fxEye { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
    .fx-scene .aura { animation: fxAura 4s ease-in-out infinite; transform-origin: 250px 200px; } @keyframes fxAura { 0%,100% { transform: scaleY(1); opacity: .5; } 50% { transform: scaleY(1.12); opacity: .85; } }
    #fxQuestHead { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; border: 1px solid rgba(96,165,250,.55); border-radius: 14px; padding: 14px 18px; margin-bottom: 14px; position: relative; overflow: hidden;
      background: linear-gradient(90deg, rgba(30,58,138,.45), rgba(3,7,18,.9)); box-shadow: 0 0 24px rgba(59,130,246,.25); }
    #fxQuestHead::before { content: '!'; flex: none; width: 34px; height: 34px; border: 2px solid #93c5fd; border-radius: 6px; display: grid; place-items: center; font: 900 20px 'Exo 2', sans-serif; color: #93c5fd; box-shadow: 0 0 12px #60a5fa; animation: fxEye 2s ease-in-out infinite; }
    #fxQuestHead b { font: 800 15px 'Exo 2', sans-serif; letter-spacing: 2px; color: #fff; text-transform: uppercase; display: block; } #fxQuestHead small { color: #93c5fd; font-size: 12px; font-weight: 700; }
    #fxClock { margin-left: auto; text-align: right; } #fxClock span { display: block; font-size: 10px; font-weight: 800; letter-spacing: 2px; color: var(--danger); } #fxClock strong { font: 800 26px 'Exo 2', sans-serif; color: #fff; text-shadow: 0 0 14px var(--danger); font-variant-numeric: tabular-nums; }
    .fx-job { display: block; margin-top: 4px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #c084fc; text-transform: uppercase; }
    .page.active > * { animation: fxUp .5s ease both; } .page.active > *:nth-child(2) { animation-delay: .05s; } .page.active > *:nth-child(3) { animation-delay: .1s; } .page.active > *:nth-child(4) { animation-delay: .15s; } .page.active > *:nth-child(n+5) { animation-delay: .2s; }
    @keyframes fxUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    .quest { transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; } .quest.done { box-shadow: 0 0 16px rgba(0,229,255,.2); }
    @media (hover: hover) { .quest:hover, .panel:hover { border-color: var(--accent); } .quest:hover { transform: translateX(3px); } .stat-box { transition: transform .2s; } .stat-box:hover { transform: translateY(-3px); } }
    .xpbar i { background-size: 200% 100%; animation: fxFlow 3s linear infinite; } @keyframes fxFlow { to { background-position: 200% 0; } }
    .fx-art-row { display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,.4); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; margin-top: 10px; flex-wrap: wrap; }
    .fx-art-row span { flex: 1; min-width: 160px; font-size: 13px; font-weight: 700; } .fx-art-row small { display: block; color: var(--muted); font-weight: 500; font-size: 12px; } .fx-art-row button { width: auto; }

    /* phones: the side rail becomes a bottom bar */
    @media (max-width: 768px) {
      .app-shell { display: block; }
      .sidebar { position: fixed; top: auto; bottom: 0; left: 0; right: 0; width: 100%; height: 62px; padding: 6px 8px; flex-direction: row; border-right: 0; border-top: 1px solid var(--line); box-shadow: 0 -8px 30px rgba(0,0,0,.7); z-index: 60; }
      .sidebar .logo, .sidebar .player-mini, .sidebar .system-tip { display: none; }
      .sidebar nav { flex-direction: row; width: 100%; gap: 2px; align-items: stretch; }
      .nav { flex: 1; justify-content: center; padding: 0; font-size: 20px; border-radius: 10px; } .nav:hover, .nav.active { box-shadow: inset 0 -3px var(--accent); }
      .nav-exit { margin-top: 0; border: 0; }
      main { margin-left: 0; width: 100%; padding: 14px 12px 86px; }
      .topbar { margin-bottom: 16px; } .topbar h1 { font-size: 20px; } .sync { display: none; }
      .hero { min-height: 0; padding: 20px 14px; } .hero h2 { font-size: 24px; } .orb { width: 96px; height: 96px; } .orb b { font-size: 36px; } .fx-scene { width: 100%; opacity: .3; }
      .status-header { flex-wrap: wrap; gap: 8px; } .status-bars { flex-direction: column; gap: 10px; }
      .stat-grid-5 { grid-template-columns: repeat(2, 1fr); } .metric-grid, .fuel-cards { grid-template-columns: 1fr 1fr; gap: 10px; } .metric b { font-size: 26px; } .fuel b { font-size: 26px; }
      .workout-grid { grid-template-columns: 1fr; } .page-heading { margin-bottom: 22px; } .page-heading h2 { font-size: 24px; } .page-heading p { font-size: 13px; }
      .section-title { flex-wrap: wrap; gap: 8px; } .panel { padding: 16px; } .panel-head { flex-wrap: wrap; gap: 8px; }
      .twice { grid-template-columns: 1fr; } .fx-moods { gap: 5px; } .fx-moods button small { font-size: 8.5px; }
      .exercise { flex-wrap: wrap; gap: 6px; } .quest { padding: 12px; gap: 10px; } .qxp { white-space: nowrap; }
      .chat { min-height: 300px; } .msg { max-width: 94%; } .composer { flex-wrap: wrap; } .composer .primary { width: 100% !important; }
      .ux-pr { flex-wrap: wrap; } .ux-pr span { flex-basis: 100%; } .ux-timer { font-size: 42px; }
      #toast { left: 12px; right: 12px; bottom: 74px; text-align: center; } .modal-card { padding: 18px; }
      #fxClock { margin-left: 0; text-align: left; width: 100%; } .fx-big { font-size: 36px; }
      input, select { font-size: 16px; }
    }
    @media (prefers-reduced-motion: reduce) { .page.active > *, .fx-scene *, .xpbar i, #fxQuestHead::before { animation: none !important; } }
  `;
  document.head.appendChild(css);

  /* ---------- animated aura background ---------- */
  function background() {
    if (el('fxBg')) return; const old = el('fxParticles'); if (old) old.remove();
    const c = document.createElement('canvas'); c.id = 'fxBg'; document.body.prepend(c);
    const x = c.getContext('2d'); let W, H, ps = [], raf = null, t = 0;
    const size = () => { const d = Math.min(window.devicePixelRatio || 1, 1.5); W = window.innerWidth; H = window.innerHeight; c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); const n = W < 768 ? 28 : 70; ps = [...Array(n)].map(() => spawn(true)); };
    const spawn = any => ({ x: Math.random() * W, y: any ? Math.random() * H : H + 10, v: .25 + Math.random() * .9, r: .7 + Math.random() * 2, w: Math.random() * 6.28, p: Math.random() < .3 });
    const frame = () => {
      t += .01; x.clearRect(0, 0, W, H);
      // slow breathing aura at the bottom, like mana rising off the floor
      const g = x.createRadialGradient(W * .5, H * 1.15, 0, W * .5, H * 1.15, H * (.75 + Math.sin(t) * .05));
      g.addColorStop(0, 'rgba(88,28,135,.30)'); g.addColorStop(.5, 'rgba(30,58,138,.14)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      for (const p of ps) {
        p.y -= p.v; p.w += .02; p.x += Math.sin(p.w) * .35;
        if (p.y < -10) Object.assign(p, spawn(false));
        const a = Math.min(1, p.y / H + .15) * .8;
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fillStyle = p.p ? `rgba(192,132,252,${a})` : `rgba(96,165,250,${a})`; x.shadowBlur = 8; x.shadowColor = p.p ? '#a855f7' : '#60a5fa'; x.fill();
      }
      x.shadowBlur = 0;
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    size(); frame();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); if (reduce) frame(); }, 200); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = null; } else if (!raf && !reduce) raf = requestAnimationFrame(frame); });
  }

  /* ---------- hero artwork: a gate, a hooded hunter and a shadow rank (original drawing) ---------- */
  const soldier = (x, s) => `<g transform="translate(${x},${250 - 62 * s}) scale(${s})"><path d="M14 0c-6 0-10 5-10 11v6l-4 9 5-1v37h18V25l5 1-4-9v-6C24 5 20 0 14 0z" fill="#0b1024" stroke="#6d28d9" stroke-width="1"/><circle class="eye" cx="10.5" cy="12" r="1.4" fill="#c084fc"/><circle class="eye" cx="17.5" cy="12" r="1.4" fill="#c084fc"/><path d="M27 20 L31 -10" stroke="#6d28d9" stroke-width="1.5"/></g>`;
  const SCENE = `<svg class="fx-scene" viewBox="0 0 400 260" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
    <defs><radialGradient id="fxPortal" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e0f2fe"/><stop offset=".25" stop-color="#38bdf8"/><stop offset=".6" stop-color="#6d28d9"/><stop offset="1" stop-color="#030712" stop-opacity="0"/></radialGradient>
      <linearGradient id="fxFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3a8a" stop-opacity=".5"/><stop offset="1" stop-color="#030712" stop-opacity="0"/></linearGradient></defs>
    <ellipse cx="250" cy="120" rx="78" ry="104" fill="url(#fxPortal)" opacity=".85"/>
    <g class="swirl" fill="none" stroke="#bae6fd" stroke-width="1.4" opacity=".7"><ellipse cx="250" cy="120" rx="62" ry="86" stroke-dasharray="40 26 10 26"/><ellipse cx="250" cy="120" rx="40" ry="58" stroke-dasharray="18 22"/></g>
    <g class="swirl2" fill="none" stroke="#c084fc" stroke-width="2" opacity=".6"><ellipse cx="250" cy="120" rx="72" ry="98" stroke-dasharray="70 60"/></g>
    <path d="M150 250 V70 Q150 6 250 6 Q350 6 350 70 V250 H322 V78 Q322 34 250 34 Q178 34 178 78 V250 Z" fill="#0b1024" stroke="#3b82f6" stroke-width="1.5"/>
    <path d="M150 96 h28 M150 150 h28 M150 204 h28 M322 96 h28 M322 150 h28 M322 204 h28 M214 20 l8 18 M286 20 l-8 18" stroke="#3b82f6" stroke-width="1" opacity=".7"/>
    <rect x="60" y="232" width="380" height="28" fill="url(#fxFloor)"/>
    <ellipse class="aura" cx="250" cy="238" rx="38" ry="58" fill="#6d28d9" opacity=".5"/>
    <path d="M250 150 c-9 0-15 7-15 16 0 5 1 8 3 11 l-16 18 -8 56 h72 l-8 -56 -16 -18 c2 -3 3 -6 3 -11 0 -9 -6 -16 -15 -16z" fill="#020617" stroke="#60a5fa" stroke-width="1.2"/>
    <path d="M286 198 l22 -34" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/>
    ${soldier(92, .8)}${soldier(126, .62)}${soldier(366, .62)}${soldier(332, .5)}</svg>`;

  const JOBS = [[50, 'Shadow Monarch'], [40, 'Sovereign of Shadows'], [30, 'Necromancer Commander'], [20, 'Necromancer'], [10, 'Awakened Hunter'], [0, 'Unawakened']];

  /* ---------- own pictures ---------- */
  const art = () => getJ('levelup_art', {});
  function applyArt() {
    const a = art(), h = document.querySelector('.hero'), av = el('playerAvatar');
    if (a.hero && h) { h.style.backgroundImage = `linear-gradient(100deg, rgba(3,7,18,.95) 30%, rgba(3,7,18,.35)), url('${a.hero}')`; h.style.backgroundSize = 'cover'; h.style.backgroundPosition = 'center'; h.style.backgroundBlendMode = 'normal'; const sc = h.querySelector('.fx-scene'); if (sc) sc.style.display = 'none'; }
    else if (h) { const sc = h.querySelector('.fx-scene'); if (sc) sc.style.display = ''; }
    if (a.avatar && av) { av.textContent = ''; av.style.backgroundImage = `url('${a.avatar}')`; av.style.backgroundSize = 'cover'; av.style.backgroundPosition = 'center'; }
    let w = el('fxWall'); if (a.wall) { if (!w) { w = document.createElement('div'); w.id = 'fxWall'; document.body.prepend(w); } w.style.backgroundImage = `url('${a.wall}')`; } else if (w) w.remove();
  }
  function readPicture(file, max) {
    return new Promise((res, rej) => {
      if (!file || !/^image\//.test(file.type)) return rej(new Error('Not an image'));
      const fr = new FileReader(); fr.onerror = () => rej(new Error('read failed'));
      fr.onload = () => { if (file.type === 'image/gif' && file.size < 1500000) return res(fr.result); const im = new Image(); im.onerror = () => rej(new Error('decode failed')); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); res(cv.toDataURL('image/jpeg', .82)); }; im.src = fr.result; };
      fr.readAsDataURL(file);
    });
  }
  window.FXArt = {
    async set(key, file) { try { const d = await readPicture(file, key === 'avatar' ? 300 : 1600); const a = art(); a[key] = d; localStorage.setItem('levelup_art', JSON.stringify(a)); render(); toast('[SYSTEM] PICTURE APPLIED'); } catch (e) { toast(/quota/i.test(String(e)) ? 'PICTURE TOO LARGE TO STORE' : 'COULD NOT USE THAT PICTURE', true); } },
    clear(key) { const a = art(); delete a[key]; localStorage.setItem('levelup_art', JSON.stringify(a)); if (key === 'hero') { const h = document.querySelector('.hero'); if (h) h.style.backgroundImage = ''; } if (key === 'avatar') { const av = el('playerAvatar'); if (av) av.style.backgroundImage = ''; } render(); }
  };

  function inject() {
    const hero = document.querySelector('.hero'); if (hero && !hero.querySelector('.fx-scene')) hero.insertAdjacentHTML('afterbegin', SCENE);
    const q = el('quests');
    if (q && !el('fxQuestHead')) q.insertAdjacentHTML('beforebegin', `<div id="fxQuestHead"><div><b>Daily quest has arrived</b><small>Clear every objective before the timer ends. Unfinished quests break the streak.</small></div><div id="fxClock"><span>TIME REMAINING</span><strong id="fxClockT">--:--:--</strong></div></div>`);
    const set = document.querySelector('#settings .settings-form');
    if (set && !el('fxArtPanel')) set.insertAdjacentHTML('afterend', `<article class="panel mt-6" id="fxArtPanel"><div class="panel-head"><div><span class="eyebrow">APPEARANCE</span><h3>Your Pictures</h3></div></div>
      <p class="fx-note" style="margin-top:0">Add your own artwork or GIFs. They are stored only in this browser. Large images are shrunk automatically; GIFs under 1.5 MB stay animated.</p><div id="fxArtRows"></div></article>`);
    const pt = el('playerTitle'); if (pt && !el('fxJob')) pt.insertAdjacentHTML('afterend', '<span class="fx-job" id="fxJob"></span>');
  }

  function after() {
    inject(); applyArt();
    const job = JOBS.find(j => s.level >= j[0]); if (el('fxJob')) el('fxJob').textContent = 'Job: ' + job[1];
    const rows = el('fxArtRows');
    if (rows) { const a = art(); rows.innerHTML = [['hero', 'Status banner', 'Background of the banner on the Status Window.'], ['avatar', 'Hunter avatar', 'The small square next to your name.'], ['wall', 'Page wallpaper', 'A dim picture behind the whole app.']].map(k => `<div class="fx-art-row"><span>${k[1]}<small>${k[2]} ${a[k[0]] ? '<b style="color:#10b981">Set.</b>' : ''}</small></span><button class="secondary" onclick="document.getElementById('fxArt_${k[0]}').click()">CHOOSE</button>${a[k[0]] ? `<button class="danger" onclick="FXArt.clear('${k[0]}')">REMOVE</button>` : ''}<input type="file" id="fxArt_${k[0]}" accept="image/*" style="display:none" onchange="FXArt.set('${k[0]}', this.files[0])"></div>`).join(''); }
    const done = s.quests.length && s.quests.every(q => q.done), head = el('fxQuestHead');
    if (head) { head.querySelector('b').textContent = done ? 'Daily quest complete' : 'Daily quest has arrived'; head.querySelector('small').textContent = done ? 'Rewards delivered. The next quest arrives at midnight.' : 'Clear every objective before the timer ends. Unfinished quests break the streak.'; head.style.borderColor = done ? '#10b981' : ''; }
  }
  function clock() { const t = el('fxClockT'); if (!t) return; const n = new Date(), e = new Date(n); e.setHours(24, 0, 0, 0); const d = Math.max(0, Math.floor((e - n) / 1000)); t.textContent = [Math.floor(d / 3600), Math.floor(d % 3600 / 60), d % 60].map(v => String(v).padStart(2, '0')).join(':'); t.style.textShadow = d < 3600 ? '0 0 18px #ef4444' : ''; }

  const prev = window.render;
  window.render = function () { const r = prev.apply(this, arguments); try { after(); } catch (e) { console.error('Expansion 4 render failed', e); } return r; };
  const aura = window.applySystemAura;
  if (typeof aura === 'function') window.applySystemAura = function () { const r = aura.apply(this, arguments); try { applyArt(); } catch (e) {} return r; };

  document.addEventListener('DOMContentLoaded', () => { try { background(); render(); clock(); setInterval(clock, 1000); } catch (e) { console.error(e); } });
})();


/* =========================================================
   LEVEL//UP FITNESS — EXPANSION PACK 5
   Shared typeface with the command centre (Oxanium + Sora).
========================================================= */
(function () {
  'use strict';
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap'; document.head.appendChild(l);
  const css = document.createElement('style');
  css.textContent = `
    body, button, input, select { font-family: 'Sora', 'Nunito', 'Inter', Arial, sans-serif !important; }
    .logo b, .logo small, .topbar h1, .hero h2, .orb b, .orb span, .stat-box b, .stat-box span, .metric b, .metric span, .section-title h3, .panel-head h3, .page-heading h2, .workout h3, .fuel b, .fuel span, .modal-header h3, .ux-timer, .plan-title, .player-mini strong, .player-mini b, .eyebrow, .badge, .nav, .rank, .primary, .secondary, .danger, .ghost, .fx-big, .fx-tiles b, .fx-sys h2, .fx-sys p, #fxQuestHead b, #fxClock strong, #fxClock span, .qxp, .fx-job, .sync, h1, h2, h3, h4 { font-family: 'Oxanium', 'Exo 2', 'Space Grotesk', sans-serif !important; }
    .hero h2 { letter-spacing: .02em; } .page-heading h2 { letter-spacing: .03em; }
  `;
  document.head.appendChild(css);
  try { if (typeof Chart !== 'undefined') Chart.defaults.font.family = "'Sora', 'Nunito', sans-serif"; } catch (e) {}
  const prev = window.renderProgress;
  if (typeof prev === 'function') window.renderProgress = function () { const r = prev.apply(this, arguments); try { Chart.defaults.font.family = "'Sora', 'Nunito', sans-serif"; } catch (e) {} return r; };
})();


/* =========================================================
   LEVEL//UP FITNESS — EXPANSION PACK 6
   Colour per page, ring emblems on every page heading,
   quest reminders, change tracking for cloud sync.
========================================================= */
(function () {
  'use strict';
  const el = id => document.getElementById(id);
  const getJ = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } };
  const today = () => new Date().toLocaleDateString('en-CA'), pad = n => String(n).padStart(2, '0');

  // change tracking, shared with the main app so fitness progress syncs too
  const SKIP = new Set(['walletTransactionsBackupV2', 'walletWishlistBackup', 'walletMediaBackup', 'walletWbLocal', 'walletArt', 'walletCloudKey', 'walletCaptureLog', 'walletIntroHidden', 'walletIntroChosen', 'walletNotifLast', 'walletDeleted', 'walletCloudLinked', 'walletRelay', 'walletGrowthLevel', 'walletNotifLog']);
  const synced = k => (/^(wallet|levelup_home)/.test(k) || k === 'keepNotes') && !SKIP.has(k);
  if (!Storage.prototype._cx) {
    Storage.prototype._cx = true; const rawSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (this === localStorage && synced(k) && this.getItem(k) !== String(v)) { try { const m = JSON.parse(localStorage.getItem('cxMT') || '{}'); m[k] = Date.now(); rawSet.call(localStorage, 'cxMT', JSON.stringify(m)); } catch (e) {} } return rawSet.apply(this, arguments); };
  }

  const PG = { command: ['#60a5fa', 'shield'], training: ['#f87171', 'swords'], nutrition: ['#34d399', 'flask'], progress: ['#c084fc', 'scroll'], coach: ['#22d3ee', 'cpu'], settings: ['#fbbf24', 'cog'] };
  const css = document.createElement('style');
  css.textContent = `
    body { --pg: #60a5fa; }
    .nav.active, .nav:hover { background: color-mix(in srgb, var(--own, var(--pg)) 14%, transparent) !important; color: var(--own, var(--pg)) !important; box-shadow: inset 3px 0 var(--own, var(--pg)) !important; }
    .nav { color: color-mix(in srgb, var(--own, #94a3b8) 55%, #94a3b8); }
    .page.active .page-heading .eyebrow, .page.active .section-title .eyebrow, .page.active .panel-head .eyebrow { color: var(--pg); }
    .page.active .panel::before { background: linear-gradient(90deg, transparent, var(--pg), transparent); }
    .page.active .page-heading h2 { background: linear-gradient(90deg, #fff 30%, var(--pg)); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .page.active .page-heading h2 .info-icon { color: var(--pg); -webkit-text-fill-color: initial; }
    .topbar { border-bottom: 1px solid color-mix(in srgb, var(--pg) 35%, transparent); padding-bottom: 14px; transition: border-color .4s; }
    .fx-ring { flex: none; width: 64px; height: 64px; color: var(--pg); filter: drop-shadow(0 0 8px var(--pg)); float: left; margin: 2px 16px 6px 0; }
    .fx-ring .a { transform-origin: 50px 50px; animation: fxSpin 9s linear infinite; } .fx-ring .b { transform-origin: 50px 50px; animation: fxSpin 6s linear infinite reverse; } .fx-ring .c { transform-origin: 50px 50px; animation: fxEye 2.4s ease-in-out infinite; }
    .page-heading::after { content: ''; display: block; clear: both; }
    @media (max-width: 768px) { .nav.active, .nav:hover { box-shadow: inset 0 -3px var(--own, var(--pg)) !important; } .fx-ring { width: 46px; height: 46px; margin-right: 10px; } }
    @media (prefers-reduced-motion: reduce) { .fx-ring * { animation: none !important; } }
  `;
  document.head.appendChild(css);
  const RING = g => `<svg class="fx-ring" viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="50" cy="50" r="47" stroke-width="1" opacity=".3"/><g class="a"><circle cx="50" cy="50" r="41" stroke-width="3" stroke-dasharray="46 20 9 20" stroke-linecap="round"/></g><g class="b"><circle cx="50" cy="50" r="32" stroke-width="1.5" stroke-dasharray="3 7" opacity=".8"/></g><circle class="c" cx="50" cy="50" r="22" fill="currentColor" stroke="none" opacity=".14"/><text x="50" y="59" text-anchor="middle" font-family="Oxanium, sans-serif" font-weight="800" font-size="26" fill="currentColor" stroke="none">${g}</text></svg>`;
  const GLYPH = { training: '⚔', nutrition: '◆', progress: '↗', coach: '✦', settings: '⚙' };

  function paint(page) { const p = PG[page] || PG.command; document.body.style.setProperty('--pg', p[0]); }
  function inject() {
    document.querySelectorAll('.sidebar .nav[data-page]').forEach(n => { const p = PG[n.dataset.page]; if (p) n.style.setProperty('--own', p[0]); });
    Object.keys(GLYPH).forEach(pg => { const h = document.querySelector(`#${pg} .page-heading`); if (h && !h.querySelector('.fx-ring')) h.insertAdjacentHTML('afterbegin', RING(GLYPH[pg])); });
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b) paint(b.dataset.page); });

  // quest reminder (also shown by the main app; logged once per day whichever page is open)
  function remind() {
    const c = Object.assign({ on: true, evening: '20:30', kinds: {} }, getJ('walletNotif', {})); if (!c.on || (c.kinds && c.kinds.fitness === false)) return;
    const n = new Date(), hm = pad(n.getHours()) + ':' + pad(n.getMinutes()); if (hm < c.evening) return;
    const left = (s.quests || []).filter(q => !q.done).length, trained = ((s.ext || {}).trained || []).includes(today()); if (!left && trained) return;
    const log = getJ('walletNotifLog', { d: '', items: [] }), cur = log.d === today() ? log : { d: today(), items: [] }; if (cur.items.some(i => i.id === 'fit')) return;
    const t = 'LEVEL//UP: daily quest waiting', b = left ? `${left} objective${left > 1 ? 's' : ''} left before midnight. Unfinished quests break the streak.` : 'No guided session today. A short one keeps the run alive.';
    cur.items.unshift({ id: 'fit', tab: 'fitness', t, b, at: Date.now() }); localStorage.setItem('walletNotifLog', JSON.stringify(cur));
    try { toast('[SYSTEM] ' + b.toUpperCase(), true); } catch (e) {}
    try { if ('Notification' in window && Notification.permission === 'granted') new Notification(t, { body: b, tag: 'wally-fit' }); } catch (e) {}
  }
  const prev = window.render;
  window.render = function () { const r = prev.apply(this, arguments); try { inject(); } catch (e) {} return r; };
  document.addEventListener('DOMContentLoaded', () => { try { render(); paint('command'); setTimeout(remind, 3000); setInterval(remind, 60000); } catch (e) { console.error(e); } });
})();


/* ============================================================================
   LEVEL//UP — AI TRAINER (appended; nothing above is changed)
   Interview → calorie/protein targets → weekly plan with Main / Lite / Survival versions,
   injury-aware exercise filter, set logging with PRs, food logging by text, photo or search,
   coach chat with memory and plan edits, weekly check-in, 30-day map, weight projection,
   wellness reminders with quiet hours, voice input.
   AI answers come through your own server (/api/ai); everything also works offline with built-in rules.
   ============================================================================ */
(function () {
  'use strict';
  if (typeof s === 'undefined') return;
  const $ = id => document.getElementById(id);
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safe = fn => { try { return fn(); } catch (e) { console.warn('trainer', e); } };
  const say = (m, bad) => { try { toast(m, bad); } catch (e) {} };
  const dk = d => { const x = new Date(d || Date.now()); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const today = () => dk();
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const API = (() => { try { return location.protocol.startsWith('http') ? new URL('../api/', location.href).href : 'http://localhost:3000/api/'; } catch (e) { return '/api/'; } })();
  const T = () => { if (!s.ext) s.ext = {}; const t = s.ext.trainer || (s.ext.trainer = {}); ['log', 'prs', 'food', 'videos'].forEach(k => { if (!t[k] || typeof t[k] !== 'object' || Array.isArray(t[k])) t[k] = {}; }); ['myFoods', 'weights', 'memory', 'chat', 'checkins'].forEach(k => { if (!Array.isArray(t[k])) t[k] = []; }); t.well = Object.assign({ water: true, eyes: true, stretch: true, breathe: true, quietFrom: '22:00', quietTo: '07:00', glasses: {} }, t.well || {}); if (!t.well.glasses || typeof t.well.glasses !== 'object') t.well.glasses = {}; return t; };
  const persist = () => { try { save(); } catch (e) { localStorage.setItem('levelup_home_v7', JSON.stringify(s)); } };

  // ---------------------------------------------------------------- exercise catalog
  // eq: bw bodyweight, db dumbbells, band, bar barbell, gym machines/pull-up bar. load: joints it stresses. met: effort for calorie estimates.
  const EX = [
    ['Push-ups', 'bw', 'push', 'wrist shoulder', 8, '12'], ['Incline push-ups', 'bw', 'push', 'wrist', 6, '12'], ['Knee push-ups', 'bw', 'push', 'wrist', 5, '12'], ['Pike push-ups', 'bw', 'push', 'shoulder wrist', 7, '8'],
    ['Chair dips', 'bw', 'push', 'shoulder wrist', 6, '10'], ['Table rows', 'bw', 'pull', 'shoulder', 6, '10'], ['Superman hold', 'bw', 'pull', 'back', 4, '30s'], ['Doorway band-free rows', 'bw', 'pull', '', 4, '12'],
    ['Bodyweight squats', 'bw', 'legs', 'knee', 6, '15'], ['Reverse lunges', 'bw', 'legs', 'knee', 6, '10/leg'], ['Glute bridges', 'bw', 'legs', '', 4, '15'], ['Single-leg glute bridges', 'bw', 'legs', '', 5, '10/leg'], ['Wall sit', 'bw', 'legs', 'knee', 5, '40s'],
    ['Step-ups', 'bw', 'legs', 'knee', 7, '10/leg'], ['Calf raises', 'bw', 'legs', 'ankle', 4, '20'], ['Side-lying leg raises', 'bw', 'legs', '', 3, '15/side'], ['Hip hinge good mornings', 'bw', 'legs', 'back', 4, '15'],
    ['Plank', 'bw', 'core', 'shoulder', 4, '40s'], ['Side plank', 'bw', 'core', 'shoulder', 4, '30s/side'], ['Dead bug', 'bw', 'core', '', 4, '10/side'], ['Bird dog', 'bw', 'core', '', 3, '10/side'], ['Hollow hold', 'bw', 'core', 'back', 5, '25s'], ['Crunches', 'bw', 'core', 'neck', 4, '15'],
    ['Mountain climbers', 'bw', 'cardio', 'wrist shoulder', 8, '30s'], ['Jumping jacks', 'bw', 'cardio', 'knee ankle', 8, '40s'], ['High knees', 'bw', 'cardio', 'knee ankle', 8, '30s'], ['Burpees', 'bw', 'cardio', 'knee wrist shoulder back', 10, '8'], ['Shadow boxing', 'bw', 'cardio', 'shoulder', 7, '60s'],
    ['Brisk walk', 'bw', 'cardio', '', 4, '20 min'], ['Easy jog', 'bw', 'cardio', 'knee ankle', 7, '15 min'], ['Skipping', 'bw', 'cardio', 'knee ankle', 11, '60s'], ['Cycling', 'bw', 'cardio', 'knee', 7, '20 min'],
    ['Cat-cow', 'bw', 'mobility', '', 2, '60s'], ['Hip flexor stretch', 'bw', 'mobility', '', 2, '45s/side'], ['World’s greatest stretch', 'bw', 'mobility', '', 3, '5/side'], ['Thoracic rotations', 'bw', 'mobility', '', 2, '10/side'], ['Child’s pose breathing', 'bw', 'mobility', '', 1.5, '60s'],
    ['Goblet squat', 'db', 'legs', 'knee back', 6, '10'], ['Dumbbell Romanian deadlift', 'db', 'legs', 'back', 6, '10'], ['Dumbbell lunges', 'db', 'legs', 'knee', 6, '8/leg'], ['Dumbbell floor press', 'db', 'push', 'shoulder wrist', 5, '10'], ['Dumbbell shoulder press', 'db', 'push', 'shoulder neck', 5, '10'],
    ['One-arm dumbbell row', 'db', 'pull', 'back', 5, '10/side'], ['Dumbbell curls', 'db', 'pull', 'wrist', 4, '12'], ['Overhead triceps extension', 'db', 'push', 'shoulder', 4, '12'], ['Farmer carry', 'db', 'core', 'back wrist', 6, '40s'],
    ['Band pull-aparts', 'band', 'pull', '', 3, '15'], ['Band rows', 'band', 'pull', '', 4, '15'], ['Band face pulls', 'band', 'pull', '', 3, '15'], ['Band squats', 'band', 'legs', 'knee', 5, '15'], ['Band chest press', 'band', 'push', 'shoulder', 4, '12'],
    ['Pull-ups', 'gym', 'pull', 'shoulder', 8, '6'], ['Lat pulldown', 'gym', 'pull', 'shoulder', 5, '10'], ['Seated cable row', 'gym', 'pull', 'back', 5, '10'], ['Leg press', 'gym', 'legs', 'knee', 6, '12'], ['Leg curl machine', 'gym', 'legs', '', 4, '12'],
    ['Barbell back squat', 'bar', 'legs', 'knee back', 6, '6'], ['Barbell deadlift', 'bar', 'legs', 'back', 6, '5'], ['Barbell bench press', 'bar', 'push', 'shoulder wrist', 6, '6'], ['Overhead press', 'bar', 'push', 'shoulder neck back', 6, '6'], ['Barbell row', 'bar', 'pull', 'back', 6, '8']
  ].map(([n, eq, mus, load, met, dose]) => ({ n, eq, mus, load: load ? load.split(' ') : [], met, dose }));
  const byName = n => { const q = String(n || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); return EX.find(e => e.n.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === q) || EX.find(e => { const a = e.n.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); return q.length > 4 && (a.includes(q) || q.includes(a)); }); };
  const RISK = { knee: /squat|lunge|jump|step|burpee|pistol|jog|run|skip|sprint|leg press|wall sit|box|high knee|cycling/i, back: /deadlift|good morning|superman|sit-?up|burpee|barbell row|bent.?over|hyperextension|hollow|carry/i, shoulder: /press|push-?up|dip|pull-?up|chin-?up|handstand|pike|plank|pulldown|raise|boxing|climber/i, wrist: /push-?up|plank|dip|burpee|climber|curl|bench|carry|front squat/i, ankle: /jump|skip|jog|run|calf|hop|high knee|sprint/i, neck: /shrug|overhead|headstand|crunch|bridge on head/i };
  const INJ = ['knee', 'back', 'shoulder', 'wrist', 'ankle', 'neck'], INJL = { knee: 'Knee', back: 'Lower back', shoulder: 'Shoulder', wrist: 'Wrist / elbow', ankle: 'Ankle / foot', neck: 'Neck' };
  const EQ = { bw: 'Bodyweight', db: 'Dumbbells', band: 'Resistance bands', gym: 'Gym machines / pull-up bar', bar: 'Barbell & rack' };
  function allowed(p) { const eq = new Set(['bw'].concat(p.equipment || [])), inj = p.injuries || []; return EX.filter(e => eq.has(e.eq) && !e.load.some(l => inj.includes(l))); }
  function safeEx(name, p) { const inj = (p && p.injuries) || [], e = byName(name); if (e) { if (e.load.some(l => inj.includes(l))) return null; return e; } if (!inj.length) return { n: String(name).slice(0, 60), eq: 'bw', mus: 'other', load: [], met: 5, dose: '10' }; if (inj.some(i => RISK[i] && RISK[i].test(name))) return null; return null; }   // with an injury declared, anything uncertain is left out

  // ---------------------------------------------------------------- food database (common Indian portions)
  const FOOD = [
    ['Idli', 'piece', 39, 2, 8, .2], ['Plain dosa', 'piece', 133, 3.9, 18, 5], ['Masala dosa', 'piece', 300, 6, 40, 12], ['Ghee roast dosa', 'piece', 250, 4, 30, 12], ['Sambar', 'cup', 130, 6, 18, 4], ['Rasam', 'cup', 60, 2, 9, 2], ['Coconut chutney', '2 tbsp', 70, 1, 3, 6],
    ['Upma', 'cup', 250, 6, 35, 9], ['Pongal', 'cup', 290, 8, 40, 10], ['Poha', 'cup', 250, 5, 40, 8], ['Appam', 'piece', 120, 2, 22, 2], ['Idiyappam', 'piece', 70, 1.5, 15, .3], ['Puttu', 'cup', 250, 5, 50, 3], ['Medu vada', 'piece', 135, 4, 15, 7], ['Parotta', 'piece', 260, 5, 35, 11],
    ['Chapati', 'piece', 105, 3, 18, 3], ['Cooked rice', 'cup', 205, 4.3, 45, .4], ['Curd rice', 'cup', 230, 6, 35, 7], ['Lemon rice', 'cup', 260, 4, 42, 8], ['Sambar rice', 'cup', 250, 7, 42, 6], ['Veg biryani', 'plate', 450, 10, 70, 14], ['Chicken biryani', 'plate', 600, 25, 75, 22],
    ['Dal', 'cup', 200, 12, 28, 5], ['Rajma', 'cup', 240, 13, 35, 5], ['Chole', 'cup', 270, 12, 35, 9], ['Vegetable poriyal', 'cup', 120, 4, 12, 6], ['Paneer butter masala', 'cup', 400, 15, 15, 30], ['Paneer', '100 g', 265, 18, 3.6, 20], ['Tofu', '100 g', 145, 15, 3, 9], ['Soya chunks', '50 g dry', 170, 26, 17, .3], ['Boiled chana', 'cup', 270, 15, 45, 4], ['Sprouts salad', 'cup', 100, 7, 15, 1],
    ['Boiled egg', 'egg', 78, 6.3, .6, 5.3], ['Omelette (2 eggs)', 'plate', 180, 12, 1, 14], ['Chicken curry', 'cup', 300, 25, 8, 18], ['Chicken breast', '100 g cooked', 165, 31, 0, 3.6], ['Chicken 65', '100 g', 290, 20, 12, 18], ['Fish fry', 'piece', 220, 20, 8, 12], ['Fish curry', 'cup', 230, 22, 6, 13], ['Mutton curry', 'cup', 350, 25, 6, 25],
    ['Curd', 'cup', 120, 7, 9, 6], ['Milk', 'glass', 150, 8, 12, 8], ['Buttermilk', 'glass', 40, 2, 5, 1], ['Whey protein', 'scoop', 120, 24, 3, 1.5], ['Oats with milk', 'bowl', 300, 12, 45, 8], ['Bread', 'slice', 75, 2.5, 14, 1], ['Peanut butter', 'tbsp', 95, 4, 3, 8],
    ['Banana', 'piece', 105, 1.3, 27, .4], ['Apple', 'piece', 95, .5, 25, .3], ['Orange', 'piece', 62, 1.2, 15, .2], ['Mango', 'cup', 100, 1.4, 25, .6], ['Dates', '3 pieces', 70, .6, 18, 0], ['Peanuts', '30 g', 170, 7, 5, 14], ['Almonds', '10 pieces', 70, 2.5, 2.5, 6], ['Mixed dry fruits', '30 g', 150, 4, 10, 10], ['Coconut water', 'glass', 45, 1.7, 9, .5],
    ['Tea with milk and sugar', 'cup', 70, 2, 10, 2], ['Coffee with milk and sugar', 'cup', 80, 2, 11, 3], ['Soft drink', '300 ml', 130, 0, 33, 0], ['Samosa', 'piece', 260, 4, 30, 14], ['Instant noodles', 'pack', 350, 8, 50, 13], ['Pizza', 'slice', 285, 12, 36, 10], ['Burger', 'piece', 450, 20, 45, 20], ['French fries', 'medium', 365, 4, 48, 17],
    ['Gulab jamun', 'piece', 150, 2, 25, 5], ['Jalebi', '50 g', 200, 1, 30, 9], ['Ice cream', 'scoop', 140, 2.5, 16, 7], ['Vegetable salad', 'bowl', 50, 2, 10, .3]
  ].map(([n, unit, kcal, protein, carbs, fat]) => ({ n, unit, kcal, protein, carbs, fat }));
  const ALIAS = { roti: 'Chapati', chappathi: 'Chapati', chapathi: 'Chapati', rice: 'Cooked rice', 'white rice': 'Cooked rice', egg: 'Boiled egg', eggs: 'Boiled egg', 'egg omelette': 'Omelette (2 eggs)', omelet: 'Omelette (2 eggs)', tea: 'Tea with milk and sugar', chai: 'Tea with milk and sugar', coffee: 'Coffee with milk and sugar', dosai: 'Plain dosa', dosa: 'Plain dosa', vada: 'Medu vada', biryani: 'Chicken biryani', paratha: 'Parotta', porotta: 'Parotta', curd: 'Curd', yogurt: 'Curd', dahi: 'Curd', whey: 'Whey protein', oats: 'Oats with milk', noodles: 'Instant noodles', maggi: 'Instant noodles', chicken: 'Chicken curry', fish: 'Fish curry', mutton: 'Mutton curry' };
  function findFood(q) { q = q.toLowerCase().trim().replace(/s$/, ''); if (!q) return null; if (ALIAS[q]) return FOOD.find(f => f.n === ALIAS[q]); const ex = FOOD.find(f => f.n.toLowerCase() === q) || FOOD.find(f => f.n.toLowerCase().startsWith(q)) || FOOD.find(f => f.n.toLowerCase().includes(q)); if (ex) return ex; const k = Object.keys(ALIAS).find(a => q.includes(a)); return k ? FOOD.find(f => f.n === ALIAS[k]) : null; }
  const WORDNUM = { half: .5, one: 1, two: 2, three: 3, four: 4, five: 5, a: 1, an: 1, quarter: .25 };
  function parseMeal(text) {                        // "2 idli and sambar, 1 cup curd" → items from the built-in list
    const out = [], miss = [];
    String(text).toLowerCase().split(/,|\band\b|\bwith\b|\+|;|\n/).map(x => x.trim()).filter(Boolean).forEach(part => {
      const m = part.match(/^(\d+(?:\.\d+)?|half|one|two|three|four|five|a|an|quarter)?\s*(?:x\s*)?(cups?|bowls?|plates?|pieces?|pcs|glass(?:es)?|slices?|scoops?|tbsp|spoons?|g\b|grams?)?\s*(?:of\s+)?(.+)$/);
      const qty = m && m[1] ? (WORDNUM[m[1]] != null ? WORDNUM[m[1]] : parseFloat(m[1])) : 1, name = m ? m[3] : part; let f = findFood(name);
      if (!f) f = findFood(name.split(' ').slice(-1)[0]); if (!f) { miss.push(part); return; }
      const g = m && m[2] && /^g|gram/.test(m[2]) && /100 g/.test(f.unit) ? qty / 100 : qty;
      out.push({ name: f.n, qty: +g.toFixed(2), unit: f.unit, kcal: Math.round(f.kcal * g), protein: +(f.protein * g).toFixed(1), carbs: +(f.carbs * g).toFixed(1), fat: +(f.fat * g).toFixed(1), src: 'list' });
    });
    return { items: out, miss };
  }

  // ---------------------------------------------------------------- targets
  function targets(p) {
    const w = +p.weight || 70, h = +p.height || 170, a = +p.age || 25, sx = p.sex === 'female' ? -161 : p.sex === 'male' ? 5 : -78;
    const bmr = 10 * w + 6.25 * h - 5 * a + sx, af = Math.min(1.725, 1.2 + .075 * (+p.days || 3)), tdee = bmr * af;
    const adj = p.goal === 'lose' ? .8 : p.goal === 'gain' ? 1.1 : 1, kcal = Math.round(Math.max(p.sex === 'female' ? 1200 : 1500, tdee * adj) / 10) * 10;
    const bmi = w / Math.pow(h / 100, 2), ref = bmi > 30 && +p.target ? +p.target : w, protein = Math.round(ref * (p.goal === 'lose' ? 2 : p.goal === 'gain' ? 1.8 : 1.6));
    return { kcal, protein, water: Math.round(w * 35 / 250), bmr: Math.round(bmr), tdee: Math.round(tdee), bmi: +bmi.toFixed(1) };
  }

  // ---------------------------------------------------------------- local plan builder (offline fallback)
  function localPlan(p, intensity, note) {
    const pool = allowed(p), pick = (mus, n, skip) => pool.filter(e => e.mus === mus && !(skip || []).includes(e.n)).slice(0, n);
    const days = Math.max(1, Math.min(6, +p.days || 3)), mins = +p.minutes || 30, pref = (p.dow && p.dow.length ? p.dow : [1, 3, 5, 2, 4, 6, 0]).slice(0, days).sort();
    const vol = intensity === 'recovery' ? .7 : intensity === 'push' ? 1.15 : 1, sets = Math.max(1, Math.round((mins >= 40 ? 4 : mins >= 25 ? 3 : 2) * vol));
    const templates = p.goal === 'endurance' ? [['cardio', 'legs', 'core'], ['cardio', 'mobility', 'core'], ['cardio', 'push', 'pull']] : [['push', 'legs', 'core', 'cardio'], ['pull', 'legs', 'core', 'mobility'], ['push', 'pull', 'legs', 'cardio']];
    const names = ['Full body A', 'Full body B', 'Full body C'], focus = ['Push, legs, core', 'Pull, posterior chain, core', 'Mixed strength and conditioning'];
    const out = []; let k = 0;
    for (let d = 0; d < 7; d++) {
      if (!pref.includes(d)) { out.push({ dow: d, rest: true, title: 'Rest / walk', focus: 'Recovery', minutes: 0, exercises: [] }); continue; }
      const t = templates[k % 3], used = [], ex = []; t.forEach((mus, i) => { const list = pool.filter(e => e.mus === mus && !used.includes(e.n)); const e = list[(k + i) % Math.max(1, list.length)]; if (e) { used.push(e.n); ex.push({ name: e.n, sets: mus === 'mobility' ? 1 : sets, reps: e.dose, rest: mus === 'cardio' ? '30s' : '60s' }); } });
      if (mins >= 30) { const extra = pool.find(e => !used.includes(e.n) && (e.mus === t[0] || e.mus === 'core')); if (extra) ex.push({ name: extra.n, sets, reps: extra.dose, rest: '60s' }); }
      ex.unshift({ name: 'World’s greatest stretch', sets: 1, reps: '5/side', rest: '0s' });
      out.push({ dow: d, rest: false, title: names[k % 3], focus: focus[k % 3], minutes: mins, exercises: ex.filter(e => safeEx(e.name, p)) }); k++;
    }
    return { week: weekKey(), days: out, intensity: intensity || 'normal', note: note || (intensity === 'recovery' ? 'Recovery week: lighter volume, same habits.' : 'Built offline from your profile.'), source: 'built-in' };
  }
  function weekKey(d) { const x = new Date(d || Date.now()); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dk(x); }

  // ---------------------------------------------------------------- AI
  let aiOn = null;
  async function aiCheck() { if (aiOn !== null) return aiOn; try { const r = await fetch(API + 'health', { cache: 'no-store', credentials: 'same-origin' }); const j = await r.json(); aiOn = !!j.ai; } catch (e) { aiOn = false; } paintAiTag(); return aiOn; }
  async function askAI(body) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 70000);
    try { const r = await fetch(API + 'ai', { method: 'POST', credentials: 'same-origin', signal: ctl.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'HTTP ' + r.status); return j.reply || ''; }
    finally { clearTimeout(t); }
  }
  const parseJSON = txt => { try { return JSON.parse(txt); } catch (e) { const m = String(txt).match(/\{[\s\S]*\}/); if (m) try { return JSON.parse(m[0]); } catch (x) {} } return null; };
  const COACH = `You are the AI trainer inside LEVEL//UP, a Solo Leveling themed home-fitness app. Call the user "Hunter" now and then, keep it motivating but practical and brief. You are not a doctor: for pain, illness or medical conditions advise seeing one. Respect the user's declared injuries, conditions, diet and foods to avoid without exception.`;
  function profileCtx() { const t = T(); return { profile: t.profile, targets: t.targets, memory: t.memory.map(m => m.t).slice(-30), planSummary: t.plan ? t.plan.days.map(d => DOW[d.dow] + ': ' + (d.rest ? 'rest' : d.title + ' (' + d.exercises.map(e => e.name).join(', ') + ')')).join(' | ') : 'none', today: today(), weekday: DOWL[new Date().getDay()] }; }
  async function aiPlan(intensity, note) {
    const t = T(), p = t.profile, pool = allowed(p).map(e => e.n + ' [' + e.mus + ', usual dose ' + e.dose + ']');
    const prompt = `Build a 7-day training plan. Goal: ${p.goal}. Experience: ${p.level}. Training days per week: ${p.days}, about ${p.minutes} minutes each${p.dow && p.dow.length ? ', preferably on ' + p.dow.map(d => DOWL[d]).join(', ') : ''}. Intensity this week: ${intensity || 'normal'}${note ? '. Coach note: ' + note : ''}. Injuries: ${(p.injuries || []).join(', ') || 'none'}. Conditions: ${p.conditions || 'none'}.
Use ONLY exercise names from this list, spelled exactly: ${pool.join('; ')}.
Return JSON: {"note": "one sentence on the idea of this week", "days": [{"dow": 0-6 (0 = Sunday), "rest": true|false, "title": "short name", "focus": "few words", "minutes": number, "exercises": [{"name": "exact name from the list", "sets": number, "reps": "e.g. 12 or 30s or 10/leg", "rest": "e.g. 60s"}]}]} with exactly 7 days, warm-up first on training days, rest days with an empty list.`;
    const raw = await askAI({ system: COACH, prompt, json: true, max: 3000, context: profileCtx() }), j = parseJSON(raw);
    if (!j || !Array.isArray(j.days)) throw new Error('The AI did not return a plan.');
    const days = []; for (let d = 0; d < 7; d++) { const x = j.days.find(y => +y.dow === d) || { dow: d, rest: true }; const ex = (x.exercises || []).map(e => { const ok = safeEx(e.name, p); return ok ? { name: ok.n, sets: Math.max(1, Math.min(8, +e.sets || 3)), reps: String(e.reps || ok.dose).slice(0, 14), rest: String(e.rest || '60s').slice(0, 8) } : null; }).filter(Boolean); days.push({ dow: d, rest: !!x.rest || !ex.length, title: String(x.title || (ex.length ? 'Session' : 'Rest')).slice(0, 40), focus: String(x.focus || '').slice(0, 60), minutes: +x.minutes || (ex.length ? +p.minutes || 30 : 0), exercises: ex }); }
    return { week: weekKey(), days, intensity: intensity || 'normal', note: String(j.note || '').slice(0, 200), source: 'ai' };
  }
  async function buildPlan(intensity, note, offline) {
    const t = T(); if (!t.profile) return;
    let plan = null, why = '';
    if (!offline && await aiCheck()) { try { plan = await aiPlan(intensity, note); } catch (e) { why = e.message; } }
    if (!plan) { plan = localPlan(t.profile, intensity, note); if (why) say('AI plan failed (' + why.slice(0, 60) + '). Built offline instead.', true); }
    t.plan = plan; persist(); paint();
  }

  // ---------------------------------------------------------------- workout variants and logging
  const parseDose = d => { const m = String(d).match(/(\d+(?:\.\d+)?)\s*(s|sec|min)?/i); return m ? { n: +m[1], u: m[2] ? (/min/i.test(m[2]) ? 'min' : 's') : 'reps', per: /\/(leg|side)/.test(d) } : { n: 10, u: 'reps' }; };
  function variant(day, mode) {
    if (!day || day.rest) return [];
    const ex = day.exercises;
    if (mode === 'lite') return ex.slice(0, Math.max(2, Math.ceil(ex.length * .75))).map(e => { const d = parseDose(e.reps); return Object.assign({}, e, { sets: Math.max(1, e.sets - 1), reps: d.u === 'reps' ? Math.max(3, Math.round(d.n * .7)) + (d.per ? '/side' : '') : Math.max(10, Math.round(d.n * .7)) + (d.u === 'min' ? ' min' : 's') }); });
    if (mode === 'survival') return ex.filter(e => !/stretch|cat-cow|child/i.test(e.name)).slice(0, 2).map(e => Object.assign({}, e, { sets: 1 }));
    return ex;
  }
  const minutesOf = (day, mode) => mode === 'survival' ? 6 : Math.round((day.minutes || 30) * (mode === 'lite' ? .6 : 1));
  function kcalBurn(list, minutes) { const kg = +(T().profile || {}).weight || +s.weight || 70, met = list.length ? list.reduce((a, e) => a + ((byName(e.name) || {}).met || 5), 0) / list.length : 4; return Math.round(met * kg * minutes / 60); }
  let ses = null;
  function startSession(mode) {
    const t = T(), day = todayPlan(); if (!day || day.rest) return say('Rest day today. A walk counts, Hunter.');
    const list = variant(day, mode); ses = { mode, list, sets: {}, t0: Date.now() };
    list.forEach(e => { const pr = t.prs[e.name], d = parseDose(e.reps); ses.sets[e.name] = Array.from({ length: e.sets }, () => ({ reps: d.u === 'reps' ? d.n : '', sec: d.u !== 'reps' ? (d.u === 'min' ? d.n * 60 : d.n) : '', kg: pr && pr.kg ? pr.kg : '' })); });
    paint(); setTimeout(() => { const e = $('trSession'); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
  }
  function finishSession() {
    if (!ses) return; const t = T(), td = today(), mins = Math.max(3, Math.round((Date.now() - ses.t0) / 60000)) || minutesOf(todayPlan(), ses.mode), newPR = [];
    document.querySelectorAll('#trSession [data-ex]').forEach(inp => { const r = ses.sets[inp.dataset.ex][+inp.dataset.i]; r[inp.dataset.f] = inp.value === '' ? '' : +inp.value; });
    Object.keys(ses.sets).forEach(n => { ses.sets[n].forEach(r => { const kg = +r.kg || 0, reps = +r.reps || 0, sec = +r.sec || 0; let val, kind; if (kg > 0 && reps > 0) { val = kg * (1 + reps / 30); kind = '1rm'; } else if (reps > 0) { val = reps; kind = 'reps'; } else if (sec > 0) { val = sec; kind = 'sec'; } else return; const p = t.prs[n]; if (!p || (p.kind === kind && val > p.best) || (p.kind !== kind && kind === '1rm')) { if (p) newPR.push({ n, kind, val, kg, reps, sec }); t.prs[n] = { best: +val.toFixed(1), kind, kg, reps, sec, at: td }; } }); });
    const est = minutesOf(todayPlan(), ses.mode), use = Math.min(Math.max(mins, est * .5), est * 2), kcal = kcalBurn(ses.list, use);
    t.log[td] = { mode: ses.mode, sets: ses.sets, minutes: Math.round(use), kcal, at: Date.now() };
    if (!s.ext.trained) s.ext.trained = []; if (!s.ext.trained.includes(td)) s.ext.trained.push(td);
    const xp = ses.mode === 'main' ? 40 : ses.mode === 'lite' ? 25 : 12; try { if (typeof gain === 'function') gain(xp); s.sessions = (s.sessions || 0) + 1; } catch (e) {}
    ses = null; persist(); paint(); try { render(); } catch (e) {}
    say(`SESSION LOGGED • ${kcal} kcal • +${xp} EXP`); if (newPR.length) prCard(newPR[0]);
  }
  function prCard(p) {
    const txt = p.kind === '1rm' ? `${p.kg} kg × ${p.reps}` : p.kind === 'reps' ? `${p.reps} reps` : `${p.sec} s`;
    modal('trPR', `<div class="tr-pr"><span class="eyebrow">NEW PERSONAL RECORD</span><h2>${esc(p.n)}</h2><b>${esc(txt)}</b><p>The System records your growth, Hunter.</p><div class="tr-row"><button class="primary" onclick="LUT.sharePR()">Share</button><button onclick="LUT.close('trPR')">Close</button></div></div>`);
    LUT._pr = { n: p.n, txt };
  }
  async function sharePR() {
    const p = LUT._pr; if (!p) return; const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 1350); gr.addColorStop(0, '#030712'); gr.addColorStop(1, '#0b1a3a'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1350);
    g.strokeStyle = '#00e5ff'; g.lineWidth = 6; g.strokeRect(60, 60, 960, 1230); g.fillStyle = '#00e5ff'; g.font = '700 46px sans-serif'; g.textAlign = 'center'; g.fillText('NEW PERSONAL RECORD', 540, 330);
    g.fillStyle = '#fff'; g.font = '800 84px sans-serif'; g.fillText(p.n.slice(0, 22), 540, 560); g.fillStyle = '#fbbf24'; g.font = '800 130px sans-serif'; g.fillText(p.txt, 540, 760); g.fillStyle = '#94a3b8'; g.font = '600 40px sans-serif'; g.fillText('LEVEL//UP • ' + new Date().toLocaleDateString('en-GB'), 540, 1080);
    const blob = await new Promise(r => c.toBlob(r, 'image/png')), file = new File([blob], 'personal-record.png', { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file], title: 'New PR' }); } catch (e) { if (e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'personal-record.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  // ---------------------------------------------------------------- food
  const dayFood = d => { const t = T(); return t.food[d || today()] || (t.food[d || today()] = []); };
  function addItems(items, src) { const list = dayFood(); items.forEach(i => list.push({ name: String(i.name || 'Food').slice(0, 60), qty: +i.qty || 1, unit: i.unit || '', kcal: Math.max(0, Math.round(+i.kcal || 0)), protein: Math.max(0, +(+i.protein || 0).toFixed(1)), carbs: Math.max(0, +(+i.carbs || 0).toFixed(1)), fat: Math.max(0, +(+i.fat || 0).toFixed(1)), src: src || i.src || 'ai', at: Date.now() })); persist(); paint(); }
  const FOODPROMPT = p => `Estimate the nutrition of this meal for an Indian user${p && p.cuisine ? ' (usual cuisine: ' + p.cuisine + ')' : ''}. Use typical Indian home portions unless a quantity is given. Return JSON: {"items": [{"name": "dish", "qty": number, "unit": "piece/cup/plate/g", "kcal": number, "protein": grams, "carbs": grams, "fat": grams}], "note": "one short tip or caution, optional"}.`;
  async function logText(text) {
    text = String(text || '').trim(); if (!text) return;
    if (await aiCheck()) { try { const j = parseJSON(await askAI({ system: COACH, prompt: FOODPROMPT(T().profile) + '\nMeal: ' + text, json: true, max: 1200, context: { profile: T().profile } })); if (j && Array.isArray(j.items) && j.items.length) { addItems(j.items, 'ai'); say('Logged ' + j.items.length + ' item' + (j.items.length > 1 ? 's' : '') + (j.note ? ' • ' + j.note : '')); return true; } } catch (e) { say('AI estimate failed: ' + e.message.slice(0, 70) + '. Trying the built-in list.', true); } }
    const r = parseMeal(text); if (r.items.length) addItems(r.items, 'list'); say(r.items.length ? `Logged ${r.items.length} item${r.items.length > 1 ? 's' : ''} from the built-in list${r.miss.length ? '. Not found: ' + r.miss.join(', ') : ''}` : 'Not in the built-in list. Search below, or try with AI online.', !r.items.length); return !!r.items.length;
  }
  async function logPhoto(file) {
    if (!file) return; if (!(await aiCheck())) return say('Photo logging needs the AI on your server.', true);
    const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onerror = rej; fr.onload = () => { const im = new Image(); im.onerror = rej; im.onload = () => { const k = Math.min(1, 1024 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .8).split(',')[1]); }; im.src = fr.result; }; fr.readAsDataURL(file); });
    say('Reading the plate…');
    try { const j = parseJSON(await askAI({ system: COACH, prompt: FOODPROMPT(T().profile) + '\nIdentify every dish in the photo.', image: { mime: 'image/jpeg', data }, json: true, max: 1200, context: { profile: T().profile } })); if (!j || !Array.isArray(j.items) || !j.items.length) throw new Error('No food recognised'); addItems(j.items, 'photo'); say('Logged from the photo: ' + j.items.map(i => i.name).join(', ') + (j.note ? ' • ' + j.note : '')); }
    catch (e) { say('Photo not logged: ' + e.message.slice(0, 80), true); }
  }

  // ---------------------------------------------------------------- coach chat with memory and plan edits
  let thinking = false;
  async function coachSay(text) {
    text = String(text || '').trim(); if (!text || thinking) return; const t = T(); t.chat.push({ role: 'user', content: text, at: Date.now() }); t.chat = t.chat.slice(-40); thinking = true; paint();
    let reply = '', act = null;
    if (await aiCheck()) {
      try {
        const sys = COACH + ` You can change the user's week. Return JSON: {"reply": "your answer", "remember": ["new lasting facts about the user worth remembering, e.g. likes morning runs, knee hurts on stairs"], "forget": ["facts from memory that are no longer true, quoted exactly"], "action": null or one of {"type":"move_day","from":"Mon","to":"Sat"} | {"type":"swap","day":"Mon","from":"exercise","to":"exercise from the catalog"} | {"type":"rebuild","intensity":"normal|recovery|push","note":"why"} | {"type":"log_food","text":"what they ate"}}. Only use an action when the user asks for that change.`;
        const j = parseJSON(await askAI({ system: sys, messages: t.chat.slice(-12).map(m => ({ role: m.role, content: m.content })), json: true, max: 1500, context: Object.assign(profileCtx(), { foodToday: dayFood().map(f => f.name + ' ' + f.kcal + 'kcal'), trainedToday: !!t.log[today()] }) }));
        if (!j || !j.reply) throw new Error('empty answer'); reply = String(j.reply); act = j.action || null;
        (j.remember || []).slice(0, 5).forEach(f => { f = String(f).trim().slice(0, 140); if (f && !t.memory.some(m => m.t.toLowerCase() === f.toLowerCase())) t.memory.push({ t: f, at: Date.now() }); });
        (j.forget || []).forEach(f => { t.memory = t.memory.filter(m => m.t !== f); });
      } catch (e) { reply = 'I could not reach the AI (' + e.message.slice(0, 80) + '). ' + localCoach(text); }
    } else reply = localCoach(text);
    if (act) reply += '\n\n' + await applyAction(act);
    t.chat.push({ role: 'assistant', content: reply, at: Date.now() }); thinking = false; persist(); paint();
  }
  function localCoach(q) {
    const t = T(), d = todayPlan(), x = q.toLowerCase();
    if (/today|workout|train/.test(x)) return d && !d.rest ? `Today: ${d.title}, ${d.exercises.length} exercises, about ${d.minutes} min. Short on time? Pick Lite or Survival; Survival still counts.` : 'Rest day. A 20-minute walk keeps the streak alive.';
    if (/protein|calorie|eat|food/.test(x) && t.targets) return `Your targets: ${t.targets.kcal} kcal and ${t.targets.protein} g protein a day. Eaten so far: ${Math.round(sum(dayFood(), 'kcal'))} kcal, ${Math.round(sum(dayFood(), 'protein'))} g protein.`;
    try { return typeof ai === 'function' ? ai(q) : 'The AI is offline. Ask about today’s workout or your targets.'; } catch (e) { return 'The AI is offline right now.'; }
  }
  const dayIdx = v => { const i = DOW.findIndex(d => String(v || '').toLowerCase().startsWith(d.toLowerCase())); return i < 0 ? +v : i; };
  async function applyAction(a) {
    const t = T(); if (!t.plan) return '';
    try {
      if (a.type === 'move_day') { const f = dayIdx(a.from), to = dayIdx(a.to); const A = t.plan.days.find(d => d.dow === f), B = t.plan.days.find(d => d.dow === to); if (!A || !B) return ''; A.dow = to; B.dow = f; t.plan.days.sort((x, y) => x.dow - y.dow); persist(); return `✔ Moved ${DOWL[f]}’s session to ${DOWL[to]}.`; }
      if (a.type === 'swap') { const d = t.plan.days.find(x => x.dow === dayIdx(a.day)), ok = safeEx(a.to, t.profile); if (!d || !ok) return '✖ That swap is not safe with your profile, so I left the plan as it is.'; const e = d.exercises.find(x => x.name.toLowerCase() === String(a.from).toLowerCase()) || d.exercises.find(x => x.name.toLowerCase().includes(String(a.from).toLowerCase())); if (!e) return ''; const old = e.name; e.name = ok.n; e.reps = ok.dose; persist(); return `✔ Swapped ${old} for ${ok.n} on ${DOWL[d.dow]}.`; }
      if (a.type === 'rebuild') { await buildPlan(a.intensity || 'normal', a.note || ''); return '✔ Rebuilt your week.'; }
      if (a.type === 'log_food' && a.text) { await logText(a.text); return '✔ Logged that food.'; }
    } catch (e) {}
    return '';
  }

  // ---------------------------------------------------------------- voice input
  function listen(target) {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition; if (!R) return say('Voice input is not supported in this browser. Chrome on Android supports it.', true);
    const r = new R(); r.lang = 'en-IN'; r.interimResults = false; r.maxAlternatives = 1; say('Listening…');
    r.onresult = e => { const el = $(target); if (el) { el.value = (el.value ? el.value + ' ' : '') + e.results[0][0].transcript; el.focus(); } };
    r.onerror = e => say(e.error === 'not-allowed' ? 'Microphone permission was declined.' : 'Did not catch that.', true); try { r.start(); } catch (e) {}
  }

  // ---------------------------------------------------------------- wellness reminders
  const WELL = { water: ['💧', 'Drink a glass of water', 120], eyes: ['👁️', '20-20-20: look 20 feet away for 20 seconds', 60], stretch: ['🤸', 'Stand up and stretch for a minute', 90], breathe: ['🌬️', 'Box breathing: 4 in, 4 hold, 4 out, 4 hold, four rounds', 240] };
  const lastW = {};
  function quiet() { const t = T().well, n = new Date(), hm = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); return t.quietFrom > t.quietTo ? (hm >= t.quietFrom || hm < t.quietTo) : (hm >= t.quietFrom && hm < t.quietTo); }
  function wellTick() {
    const w = T().well; if (quiet() || document.hidden) return; const now = Date.now();
    Object.keys(WELL).forEach(k => { if (!w[k]) return; const every = WELL[k][2] * 60000; if (!lastW[k]) { lastW[k] = now; return; } if (now - lastW[k] < every) return; lastW[k] = now; say(WELL[k][0] + ' ' + WELL[k][1]); try { if ('Notification' in window && Notification.permission === 'granted') new Notification('LEVEL//UP', { body: WELL[k][1], tag: 'well-' + k }); } catch (e) {} });
  }

  // ---------------------------------------------------------------- helpers
  const todayPlan = () => { const t = T(); return t.plan ? t.plan.days.find(d => d.dow === new Date().getDay()) : null; };
  const sum = (l, k) => l.reduce((a, x) => a + (+x[k] || 0), 0);
  function streak() { const t = T(); let n = 0; const d = new Date(); for (let i = 0; i < 400; i++) { const k = dk(d); if (t.log[k] || (t.food[k] || []).length || (t.well.glasses[k] || 0) > 0) n++; else if (i > 0) break; d.setDate(d.getDate() - 1); } return n; }
  function ring(val, max, col, label, sub) { const p = Math.max(0, Math.min(1, max ? val / max : 0)), r = 32, c = 2 * Math.PI * r; return `<div class="tr-ring"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${r}" stroke="rgba(255,255,255,.08)" stroke-width="8" fill="none"/><circle cx="40" cy="40" r="${r}" stroke="${col}" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 40 40)"/></svg><b>${label}</b><small>${sub}</small></div>`; }
  function modal(id, html) { close(id); document.body.insertAdjacentHTML('beforeend', `<div class="tr-modal" id="${id}" onclick="if(event.target===this)LUT.close('${id}')"><div class="panel">${html}</div></div>`); }
  function close(id) { const e = $(id); if (e) e.remove(); }

  // ---------------------------------------------------------------- styles
  const css = document.createElement('style');
  css.textContent = `
    #trainer { --pg: #f97316; }
    .tr-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin: 0 0 16px; } .tr-tabs button { width: auto; padding: 9px 14px; border-radius: 10px; background: var(--panel); border: 1px solid var(--line); color: var(--muted); font-weight: 800; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; }
    .tr-tabs button.on { background: color-mix(in srgb, var(--pg) 18%, transparent); border-color: var(--pg); color: #fff; box-shadow: 0 0 14px color-mix(in srgb, var(--pg) 35%, transparent); }
    .tr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; } .tr-grid > * { min-width: 0; }
    #trainer .panel { position: relative; } #trainer h3 { margin: 4px 0 10px; } #trainer p.mut, #trainer .mut { color: var(--muted); font-size: 13px; line-height: 1.5; }
    .tr-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; } .tr-row > button, .tr-row > a.btn { width: auto; } .tr-row input, .tr-row select { flex: 1; min-width: 120px; }
    #trainer input, #trainer select, #trainer textarea, .tr-modal input { background: rgba(0,0,0,.4); border: 1px solid var(--line); color: var(--text); border-radius: 10px; padding: 10px 12px; font: inherit; font-size: 14px; }
    #trainer textarea { width: 100%; min-height: 70px; resize: vertical; } #trainer label.tr-l { display: block; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin: 12px 0 5px; }
    .tr-chips { display: flex; flex-wrap: wrap; gap: 6px; } .tr-chips label { display: inline-flex; align-items: center; gap: 6px; padding: 7px 11px; border: 1px solid var(--line); border-radius: 999px; font-size: 12.5px; cursor: pointer; user-select: none; } .tr-chips input { width: auto; margin: 0; } .tr-chips label:has(input:checked) { border-color: var(--pg); background: color-mix(in srgb, var(--pg) 16%, transparent); color: #fff; }
    .tr-hero { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; background: linear-gradient(120deg, color-mix(in srgb, var(--pg) 22%, var(--panel)), var(--panel) 70%); } .tr-hero .big { font: 800 30px "Space Grotesk", sans-serif; color: #fff; line-height: 1.1; } .tr-hero .tag { font-size: 11px; font-weight: 800; letter-spacing: 2px; color: var(--pg); text-transform: uppercase; }
    .tr-modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; } .tr-modes button { padding: 12px 8px; border-radius: 12px; border: 1px solid var(--line); background: rgba(0,0,0,.35); color: #fff; font-weight: 800; cursor: pointer; } .tr-modes button small { display: block; font-weight: 600; color: var(--muted); font-size: 11px; margin-top: 3px; } .tr-modes button:hover { border-color: var(--pg); }
    .tr-modes button.main { border-color: var(--pg); background: color-mix(in srgb, var(--pg) 20%, rgba(0,0,0,.35)); }
    .tr-rings { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; } .tr-ring { position: relative; text-align: center; } .tr-ring svg { width: 100%; max-width: 96px; display: block; margin: 0 auto; } .tr-ring b { display: block; font: 800 15px "Space Grotesk", sans-serif; margin-top: 4px; color: #fff; } .tr-ring small { color: var(--muted); font-size: 11px; }
    .tr-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; } .tr-day { border: 1px solid var(--line); border-radius: 12px; padding: 10px; background: rgba(0,0,0,.3); min-width: 0; } .tr-day.today { border-color: var(--pg); box-shadow: 0 0 16px color-mix(in srgb, var(--pg) 30%, transparent); }
    .tr-day h4 { margin: 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--pg); } .tr-day b { display: block; color: #fff; font-size: 13px; margin: 4px 0; } .tr-day li { font-size: 12px; color: var(--muted); list-style: none; padding: 3px 0; border-top: 1px solid rgba(255,255,255,.05); display: flex; justify-content: space-between; gap: 6px; } .tr-day li a { color: inherit; text-decoration: none; } .tr-day li a:hover { color: #fff; } .tr-day ul { padding: 0; margin: 6px 0 0; } .tr-day.rest { opacity: .6; }
    .tr-day .done { font-size: 10px; font-weight: 800; color: #34d399; letter-spacing: 1px; }
    .tr-set { display: grid; grid-template-columns: 26px 1fr 1fr 1fr; gap: 6px; align-items: center; margin: 5px 0; } .tr-set input { width: 100%; padding: 8px !important; } .tr-set span { color: var(--muted); font-size: 12px; text-align: center; }
    .tr-ex { border: 1px solid var(--line); border-radius: 12px; padding: 12px; margin-bottom: 10px; background: rgba(0,0,0,.25); } .tr-ex h4 { margin: 0 0 4px; display: flex; justify-content: space-between; gap: 8px; } .tr-ex h4 small { color: var(--muted); font-weight: 600; }
    .tr-food li { list-style: none; display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center; padding: 9px 0; border-top: 1px solid rgba(255,255,255,.06); font-size: 13px; } .tr-food ul { padding: 0; margin: 0; } .tr-food li small { color: var(--muted); display: block; } .tr-food li button { width: auto; padding: 5px 9px; font-size: 11px; }
    .tr-bar { height: 8px; border-radius: 6px; background: rgba(255,255,255,.07); overflow: hidden; margin: 4px 0 10px; } .tr-bar i { display: block; height: 100%; background: var(--c, var(--pg)); border-radius: 6px; transition: width .5s; }
    .tr-chat { max-height: 52vh; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 4px 2px 10px; } .tr-msg { max-width: 88%; padding: 10px 12px; border-radius: 14px; font-size: 13.5px; line-height: 1.55; white-space: pre-wrap; } .tr-msg.u { align-self: flex-end; background: color-mix(in srgb, var(--pg) 22%, transparent); border: 1px solid color-mix(in srgb, var(--pg) 50%, transparent); } .tr-msg.a { align-self: flex-start; background: rgba(0,0,0,.4); border: 1px solid var(--line); }
    .tr-mem li { list-style: none; display: flex; justify-content: space-between; gap: 8px; align-items: center; padding: 7px 0; border-top: 1px solid rgba(255,255,255,.06); font-size: 13px; } .tr-mem ul { padding: 0; margin: 0; } .tr-mem button { width: auto; padding: 4px 8px; font-size: 11px; }
    .tr-heat { display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; } .tr-heat i { aspect-ratio: 1; border-radius: 5px; background: rgba(255,255,255,.05); display: block; } .tr-heat i.m { background: var(--pg); } .tr-heat i.l { background: color-mix(in srgb, var(--pg) 60%, transparent); } .tr-heat i.s { background: color-mix(in srgb, var(--pg) 32%, transparent); } .tr-heat i.x { background: rgba(248,113,113,.35); } .tr-heat i.t { outline: 2px solid #fff; }
    .tr-legend { display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; color: var(--muted); margin-top: 8px; } .tr-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; vertical-align: -1px; margin-right: 4px; }
    .tr-modal { position: fixed; inset: 0; z-index: 9999; background: rgba(2,6,14,.82); backdrop-filter: blur(4px); display: grid; place-items: center; padding: 14px; } .tr-modal > .panel { width: min(520px, 100%); max-height: 90vh; overflow-y: auto; }
    .tr-pr { text-align: center; padding: 10px; } .tr-pr h2 { margin: 10px 0; } .tr-pr b { display: block; font: 800 44px "Space Grotesk", sans-serif; color: #fbbf24; text-shadow: 0 0 18px rgba(251,191,36,.5); margin: 8px 0 14px; } .tr-pr .tr-row { justify-content: center; }
    .tr-ai { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; padding: 4px 9px; border-radius: 999px; border: 1px solid; } .tr-ai.on { color: #34d399; border-color: #34d39966; } .tr-ai.off { color: #fbbf24; border-color: #fbbf2466; }
    .tr-kv { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; } .tr-kv div { border: 1px solid var(--line); border-radius: 10px; padding: 9px 11px; background: rgba(0,0,0,.25); } .tr-kv span { display: block; font-size: 9.5px; font-weight: 800; letter-spacing: 1.5px; color: var(--muted); text-transform: uppercase; } .tr-kv b { font: 800 18px "Space Grotesk", sans-serif; color: #fff; }
    @media (max-width: 900px) { .tr-week { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 520px) { .tr-week { grid-template-columns: 1fr; } .tr-tabs button { padding: 8px 10px; font-size: 10px; } .tr-hero .big { font-size: 24px; } }
  `;
  document.head.appendChild(css);

  // ---------------------------------------------------------------- page
  let tab = 'today';
  function mount() {
    if ($('trainer')) return;
    const main = document.querySelector('main'), nav = document.querySelector('.sidebar nav') || document.querySelector('.nav').parentElement; if (!main || !nav) return;
    main.insertAdjacentHTML('beforeend', `<section class="page" id="trainer"><div class="page-heading"><span class="eyebrow">S-RANK SUPPORT UNIT</span><h2>AI Trainer <span class="tr-ai off" id="trAiTag">CHECKING</span></h2><p>Plans your training and food around your life, remembers what matters, and adapts every week.</p></div><div class="tr-tabs" id="trTabs"></div><div id="trBody"></div></section>`);
    const set = nav.querySelector('[data-page="settings"]'); const b = document.createElement('button'); b.className = 'nav'; b.dataset.page = 'trainer'; b.innerHTML = '✪ <span>AI Trainer</span>'; b.style.setProperty('--own', '#f97316'); nav.insertBefore(b, set || null);
    document.addEventListener('click', e => { const n = e.target.closest('[data-page]'); if (n && n.dataset.page === 'trainer') { document.body.style.setProperty('--pg', '#f97316'); setTimeout(paint, 0); } });
    paint();
  }
  function paintAiTag() { const e = $('trAiTag'); if (e) { e.className = 'tr-ai ' + (aiOn ? 'on' : 'off'); e.textContent = aiOn ? 'AI ONLINE' : aiOn === false ? 'OFFLINE RULES' : 'CHECKING'; } }
  const TABS = [['today', 'Today'], ['plan', 'Plan'], ['food', 'Food'], ['coach', 'Coach'], ['progress', 'Progress'], ['profile', 'Profile']];
  function paint() {
    const body = $('trBody'); if (!body) return; const t = T();
    if (!t.profile) tab = 'profile';
    $('trTabs').innerHTML = TABS.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" onclick="LUT.tab('${k}')">${l}</button>`).join(''); paintAiTag();
    const keepFocus = document.activeElement && document.activeElement.id, val = keepFocus && $(keepFocus) ? $(keepFocus).value : null;
    body.innerHTML = ({ today: vToday, plan: vPlan, food: vFood, coach: vCoach, progress: vProgress, profile: vProfile }[tab] || vToday)();
    if (keepFocus && $(keepFocus) && val != null) { $(keepFocus).value = val; $(keepFocus).focus(); }
    if (tab === 'coach') { const c = $('trChat'); if (c) c.scrollTop = c.scrollHeight; }
    if (tab === 'progress') safe(drawWeight);
  }

  function vToday() {
    const t = T(), d = todayPlan(), td = today(), done = t.log[td], f = dayFood(), tg = t.targets || {}, burned = done ? done.kcal : 0, st = streak(), gl = t.well.glasses[td] || 0;
    let hero;
    if (!t.plan) hero = `<article class="panel tr-hero"><div style="flex:1;min-width:220px"><div class="tag">Up next</div><div class="big">Build this week’s plan</div><p class="mut">Your profile is ready. Let the trainer lay out the week.</p></div><button class="primary" style="width:auto" onclick="LUT.build()">Build my plan</button></article>`;
    else if (ses) hero = vSession();
    else if (!d || d.rest) hero = `<article class="panel tr-hero"><div style="flex:1;min-width:220px"><div class="tag">Today • ${DOWL[new Date().getDay()]}</div><div class="big">Rest day</div><p class="mut">Recovery is training too. A 20-minute walk or mobility keeps the streak alive.</p></div></article>`;
    else if (done) hero = `<article class="panel tr-hero"><div style="flex:1;min-width:220px"><div class="tag">Today • cleared</div><div class="big">${esc(d.title)} done ✔</div><p class="mut">${done.mode === 'main' ? 'Main' : done.mode === 'lite' ? 'Lite' : 'Survival'} session • ${done.minutes} min • about ${done.kcal} kcal burned.</p></div><button style="width:auto" onclick="LUT.redo()">Log again</button></article>`;
    else { const L = variant(d, 'lite'), S = variant(d, 'survival'); hero = `<article class="panel tr-hero" style="display:block"><div class="tag">Up next • ${DOWL[new Date().getDay()]}</div><div class="big">${esc(d.title)}</div><p class="mut">${esc(d.focus || '')}${d.focus ? ' • ' : ''}${d.exercises.map(e => esc(e.name)).join(', ')}</p><div class="tr-modes"><button class="main" onclick="LUT.start('main')">MAIN<small>${d.minutes} min • ${d.exercises.length} moves</small></button><button onclick="LUT.start('lite')">LITE<small>${minutesOf(d, 'lite')} min • ${L.length} moves</small></button><button onclick="LUT.start('survival')">SURVIVAL<small>${minutesOf(d, 'survival')} min • still counts</small></button></div></article>`; }
    const wk = weekKey(), needCheck = t.plan && t.plan.week !== wk && !t.checkins.some(c => c.week === t.plan.week);
    return `${needCheck ? `<article class="panel" style="border-color:var(--pg);margin-bottom:16px"><span class="eyebrow">WEEKLY CHECK-IN</span><h3>A new week, Hunter</h3><p class="mut">Last week: ${planStats(t.plan.week).done} of ${planStats(t.plan.week).planned} sessions. How did it go?</p><div class="tr-row" style="margin-top:8px">${[['great', 'Strong week'], ['ok', 'It was fine'], ['busy', 'Too busy'], ['tired', 'Tired / sore'], ['sick', 'Ill or injured']].map(x => `<button style="width:auto" onclick="LUT.checkin('${x[0]}')">${x[1]}</button>`).join('')}</div></article>` : ''}
      ${hero}
      <div class="tr-grid" style="margin-top:16px">
        <article class="panel"><span class="eyebrow">TODAY’S RINGS</span><div class="tr-rings" style="margin-top:10px">${ring(sum(f, 'kcal'), tg.kcal, '#34d399', Math.round(sum(f, 'kcal')) + '', 'of ' + (tg.kcal || '—') + ' kcal')}${ring(sum(f, 'protein'), tg.protein, '#60a5fa', Math.round(sum(f, 'protein')) + ' g', 'of ' + (tg.protein || '—') + ' g protein')}${ring(burned, 400, '#f97316', burned + '', 'kcal burned')}</div></article>
        <article class="panel"><span class="eyebrow">NO-ZERO DAYS</span><h3 style="font-size:34px;margin:6px 0">${st} 🔥</h3><p class="mut">One small action keeps it alive: a session, a logged meal or a glass of water.</p><div class="tr-row" style="margin-top:10px"><button style="width:auto" onclick="LUT.water(1)">+ Glass of water</button><span class="mut">${gl} / ${tg.water || 8} today</span></div></article>
        <article class="panel"><span class="eyebrow">QUICK LOG</span><h3>What did you eat?</h3><div class="tr-row"><input id="trQuick" placeholder="2 idli, sambar, filter coffee" onkeydown="if(event.key==='Enter')LUT.quick()"><button style="width:auto" title="Speak" onclick="LUT.listen('trQuick')">🎤</button><button class="primary" style="width:auto" onclick="LUT.quick()">Log</button></div><p class="mut" style="margin-top:8px">Or photograph the plate in the Food tab.</p></article>
      </div>`;
  }
  function vSession() {
    const d = todayPlan();
    return `<article class="panel" id="trSession"><span class="eyebrow">${ses.mode.toUpperCase()} SESSION • ${esc(d.title)}</span><h3>Log your sets</h3><p class="mut">Pre-filled from the plan and your best weights. Change what you actually did, then finish.</p>
      ${ses.list.map(e => { const ex = byName(e.name) || {}, dose = parseDose(e.reps), isT = dose.u !== 'reps', vid = T().videos[e.name]; return `<div class="tr-ex"><h4><span>${esc(e.name)}</span><small>${e.sets} × ${esc(e.reps)} • rest ${esc(e.rest || '60s')}</small></h4><div class="tr-row" style="margin-bottom:6px"><a class="mut" target="_blank" rel="noopener" href="${esc(vid || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(e.name + ' proper form'))}">▶ ${vid ? 'Your demo' : 'Watch form'}</a></div>
        <div class="tr-set"><span>#</span><span>${isT ? 'seconds' : 'reps'}</span><span>kg (optional)</span><span></span></div>${ses.sets[e.name].map((r, i) => `<div class="tr-set"><span>${i + 1}</span><input type="number" inputmode="numeric" min="0" data-ex="${esc(e.name)}" data-i="${i}" data-f="${isT ? 'sec' : 'reps'}" value="${isT ? r.sec : r.reps}"><input type="number" inputmode="decimal" min="0" step="0.5" data-ex="${esc(e.name)}" data-i="${i}" data-f="kg" value="${r.kg}" ${ex.eq === 'bw' ? 'placeholder="bodyweight"' : ''}><span></span></div>`).join('')}</div>`; }).join('')}
      <div class="tr-row"><button class="primary" style="width:auto" onclick="LUT.finish()">Finish session</button><button style="width:auto" onclick="LUT.cancel()">Cancel</button></div></article>`;
  }
  function vPlan() {
    const t = T(); if (!t.plan) return `<article class="panel"><h3>No plan yet</h3><p class="mut">Build one from your profile.</p><button class="primary" style="width:auto" onclick="LUT.build()">Build my plan</button></article>`;
    const wd = new Date().getDay(), order = [1, 2, 3, 4, 5, 6, 0];
    return `<article class="panel"><div class="tr-row" style="justify-content:space-between"><div><span class="eyebrow">WEEK OF ${esc(t.plan.week)} • ${esc((t.plan.intensity || 'normal').toUpperCase())} • ${t.plan.source === 'ai' ? 'AI PLAN' : 'BUILT-IN PLAN'}</span><p class="mut" style="margin-top:4px">${esc(t.plan.note || '')}</p></div><div class="tr-row"><button style="width:auto" onclick="LUT.build()">Rebuild with AI</button><button style="width:auto" onclick="LUT.build(null,null,true)">Rebuild offline</button><button style="width:auto" onclick="LUT.importForm()">Import</button></div></div>
      <div class="tr-week" style="margin-top:14px">${order.map(dw => { const d = t.plan.days.find(x => x.dow === dw) || { dow: dw, rest: true, exercises: [] }, dt = new Date(); dt.setDate(dt.getDate() + ((dw - wd + 7) % 7) - (dw < wd && dw !== 0 ? 7 : 0)); return `<div class="tr-day ${dw === wd ? 'today' : ''} ${d.rest ? 'rest' : ''}"><h4>${DOW[dw]}</h4><b>${esc(d.rest ? 'Rest' : d.title)}</b>${d.rest ? '<span class="mut" style="font-size:12px">Walk / mobility</span>' : `<span class="mut" style="font-size:11.5px">${d.minutes} min • ${esc(d.focus || '')}</span><ul>${d.exercises.map(e => `<li><a href="#" onclick="event.preventDefault();LUT.video('${esc(e.name).replace(/'/g, '&#39;')}')" title="Set a demo video">${esc(e.name)}</a><span>${e.sets}×${esc(e.reps)}</span></li>`).join('')}</ul>`}</div>`; }).join('')}</div>
      <p class="mut" style="margin-top:12px">Exercises that load a joint you listed as injured are never placed in the plan. Tap an exercise to attach your own demo video.</p></article>`;
  }
  function vFood() {
    const t = T(), f = dayFood(), tg = t.targets || {}, bar = (v, m, c) => `<div class="tr-bar" style="--c:${c}"><i style="width:${Math.min(100, m ? v / m * 100 : 0)}%"></i></div>`;
    return `<div class="tr-grid"><article class="panel"><span class="eyebrow">LOG A MEAL</span><h3>Describe it, say it, or snap it</h3><div class="tr-row"><input id="trMeal" placeholder="e.g. 1 plate chicken biryani and raita" onkeydown="if(event.key==='Enter')LUT.meal()"><button style="width:auto" onclick="LUT.listen('trMeal')" title="Speak">🎤</button><button class="primary" style="width:auto" onclick="LUT.meal()">Log</button></div>
        <div class="tr-row" style="margin-top:10px"><label class="btn" style="width:auto;cursor:pointer;padding:10px 14px;border:1px solid var(--line);border-radius:10px">📷 Photo of the plate<input type="file" accept="image/*" capture="environment" style="display:none" onchange="LUT.photo(this.files[0]);this.value=''"></label><span class="mut">Photos need the AI online; they are not stored.</span></div>
        <label class="tr-l">Search the built-in list</label><div class="tr-row"><input id="trFind" placeholder="idli, dal, paneer…" oninput="LUT.find(this.value)"></div><div id="trFound" class="tr-food"></div>
        ${t.myFoods.length ? `<label class="tr-l">My foods</label><div class="tr-row">${t.myFoods.slice(-12).map((m, i) => `<button style="width:auto;font-size:12px" onclick="LUT.mine(${t.myFoods.length - Math.min(12, t.myFoods.length) + i})">+ ${esc(m.name)}</button>`).join('')}</div>` : ''}</article>
      <article class="panel tr-food"><span class="eyebrow">TODAY</span><h3>${Math.round(sum(f, 'kcal'))} / ${tg.kcal || '—'} kcal</h3>${bar(sum(f, 'kcal'), tg.kcal, '#34d399')}<div class="mut">Protein ${Math.round(sum(f, 'protein'))} / ${tg.protein || '—'} g</div>${bar(sum(f, 'protein'), tg.protein, '#60a5fa')}<div class="mut">Carbs ${Math.round(sum(f, 'carbs'))} g • Fat ${Math.round(sum(f, 'fat'))} g</div>
        <ul style="margin-top:10px">${f.length ? f.map((x, i) => `<li><span>${esc(x.name)}<small>${x.qty} ${esc(x.unit || '')} • P ${x.protein} g • ${esc(x.src)}</small></span><b>${x.kcal}</b><span class="tr-row"><button onclick="LUT.qty(${i})">Edit</button><button onclick="LUT.keep(${i})" title="Save to My foods">★</button><button onclick="LUT.drop(${i})">✕</button></span></li>`).join('') : '<li><span class="mut">Nothing logged yet today.</span></li>'}</ul></article></div>`;
  }
  function vCoach() {
    const t = T();
    return `<div class="tr-grid" style="grid-template-columns:minmax(0,2fr) minmax(240px,1fr)"><article class="panel"><span class="eyebrow">COACH</span><div class="tr-chat" id="trChat">${t.chat.length ? t.chat.map(m => `<div class="tr-msg ${m.role === 'user' ? 'u' : 'a'}">${esc(m.content)}</div>`).join('') : `<div class="tr-msg a">Ask me anything about your training or food. I can also change your plan: try “move my push day to Saturday”, “swap squats for something knee-friendly”, or “I had 2 dosas for breakfast”.</div>`}${thinking ? '<div class="tr-msg a">Thinking…</div>' : ''}</div>
        <div class="tr-row"><input id="trAsk" placeholder="Talk to your coach…" onkeydown="if(event.key==='Enter')LUT.ask()"><button style="width:auto" onclick="LUT.listen('trAsk')" title="Speak">🎤</button><button class="primary" style="width:auto" onclick="LUT.ask()">Send</button></div><p class="mut" style="margin-top:6px">Voice text appears in the box first so you can check it before sending.</p></article>
      <article class="panel tr-mem"><span class="eyebrow">COACH MEMORY</span><p class="mut">What the coach remembers about you. Delete anything.</p><ul>${t.memory.length ? t.memory.map((m, i) => `<li><span>${esc(m.t)}</span><button onclick="LUT.forget(${i})">✕</button></li>`).join('') : '<li class="mut">Nothing yet.</li>'}</ul><div class="tr-row" style="margin-top:10px"><input id="trMem" placeholder="Add something to remember"><button style="width:auto" onclick="LUT.remember()">Add</button></div>${t.chat.length ? '<button style="width:auto;margin-top:12px" onclick="LUT.clearChat()">Clear conversation</button>' : ''}</article></div>`;
  }
  function planStats(week) { const t = T(), st = new Date(week + 'T12:00'); let planned = 0, done = 0; for (let i = 0; i < 7; i++) { const d = new Date(st); d.setDate(st.getDate() + i); const p = t.plan && t.plan.days.find(x => x.dow === d.getDay()); if (p && !p.rest) { planned++; if (t.log[dk(d)]) done++; } } return { planned, done }; }
  function vProgress() {
    const t = T(), cells = []; for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = dk(d), l = t.log[k], p = t.plan && t.plan.days.find(x => x.dow === d.getDay()); cells.push(`<i class="${l ? (l.mode === 'main' ? 'm' : l.mode === 'lite' ? 'l' : 's') : p && !p.rest && i > 0 && k >= (t.plan.week || '') ? 'x' : ''} ${i === 0 ? 't' : ''}" title="${k}${l ? ' • ' + l.mode + ' • ' + l.kcal + ' kcal' : ''}"></i>`); }
    const prs = Object.entries(t.prs).sort((a, b) => (b[1].at || '').localeCompare(a[1].at || '')), w = t.weights.slice(-1)[0];
    return `<div class="tr-grid"><article class="panel"><span class="eyebrow">LAST 30 DAYS</span><h3>Plan completion</h3><div class="tr-heat">${cells.join('')}</div><div class="tr-legend"><span><i style="background:var(--pg)"></i>Main</span><span><i style="background:color-mix(in srgb,var(--pg) 60%,transparent)"></i>Lite</span><span><i style="background:color-mix(in srgb,var(--pg) 32%,transparent)"></i>Survival</span><span><i style="background:rgba(248,113,113,.35)"></i>Missed</span></div>
        <div class="tr-kv" style="margin-top:14px"><div><span>Sessions, 30 days</span><b>${Object.keys(t.log).filter(k => k >= dk(Date.now() - 29 * 864e5)).length}</b></div><div><span>Burned, 30 days</span><b>${Object.entries(t.log).filter(([k]) => k >= dk(Date.now() - 29 * 864e5)).reduce((a, [, l]) => a + (l.kcal || 0), 0)}</b></div><div><span>No-zero streak</span><b>${streak()}</b></div></div></article>
      <article class="panel"><span class="eyebrow">BODY WEIGHT</span><h3>${w ? w.kg + ' kg' : 'No entries yet'}</h3><div class="tr-row"><input id="trW" type="number" step="0.1" inputmode="decimal" placeholder="Today’s weight, kg"><button class="primary" style="width:auto" onclick="LUT.weigh()">Save</button></div><div style="position:relative;height:190px;margin-top:10px"><canvas id="trWChart"></canvas></div><p class="mut" id="trProj" style="margin-top:8px"></p></article>
      <article class="panel tr-mem"><span class="eyebrow">PERSONAL RECORDS</span><ul>${prs.length ? prs.map(([n, p]) => `<li><span>${esc(n)}<br><small class="mut">${p.at}</small></span><b>${p.kind === '1rm' ? p.kg + ' kg × ' + p.reps : p.kind === 'reps' ? p.reps + ' reps' : p.sec + ' s'}</b></li>`).join('') : '<li class="mut">Log a session to start your records.</li>'}</ul></article>
      <article class="panel tr-mem"><span class="eyebrow">WEEKLY CHECK-INS</span><ul>${t.checkins.length ? t.checkins.slice(-8).reverse().map(c => `<li><span>Week of ${c.week}<br><small class="mut">${c.mood}</small></span><b>${c.done}/${c.planned}</b></li>`).join('') : '<li class="mut">Your first check-in appears when a new week starts.</li>'}</ul></article></div>`;
  }
  let wChart = null;
  function drawWeight() {
    const t = T(), cv = $('trWChart'), pj = $('trProj'); if (!cv || !window.Chart) return; const W = t.weights.slice(-60); if (wChart) { try { wChart.destroy(); } catch (e) {} }
    const tgt = +(t.profile || {}).target || 0, pts = W.slice(-21).map(x => [new Date(x.d + 'T12:00').getTime() / 864e5, +x.kg]);
    let msg = W.length < 3 ? 'Log at least three weigh-ins for a projection.' : '';
    if (pts.length >= 3) { const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n, sl = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / (pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0) || 1), wk = sl * 7;
      msg = `Trend: ${wk >= 0 ? '+' : ''}${wk.toFixed(2)} kg a week.`; if (tgt && Math.abs(sl) > 1e-4 && Math.sign(tgt - W[W.length - 1].kg) === Math.sign(sl)) { const days = Math.round((tgt - W[W.length - 1].kg) / sl), when = new Date(Date.now() + days * 864e5); msg += ` At this pace you reach ${tgt} kg around ${when.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.`; if (Math.abs(wk) > 1) msg += ' That is faster than a kilo a week; slow down to keep muscle.'; } else if (tgt) msg += ` Target ${tgt} kg is not on the current trend yet.`; }
    if (pj) pj.textContent = msg; if (!W.length) return;
    wChart = new Chart(cv, { type: 'line', data: { labels: W.map(x => x.d.slice(5)), datasets: [{ label: 'kg', data: W.map(x => x.kg), borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,.15)', fill: true, tension: .35, pointRadius: 3 }].concat(tgt ? [{ label: 'target', data: W.map(() => tgt), borderColor: '#34d399', borderDash: [5, 4], pointRadius: 0 }] : []) }, options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8', maxTicksLimit: 6 }, grid: { display: false } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,.06)' } } } } });
  }
  function vProfile() {
    const t = T(), x = s.ext || {}, b = x.bio || {}, p = t.profile || { goal: b.goal === 'cut' ? 'lose' : b.goal === 'bulk' ? 'gain' : 'fit', sex: b.sex || '', age: b.age || '', height: s.height || '', weight: s.weight || '', target: '', days: 3, minutes: 30, dow: [], equipment: [], injuries: [], conditions: '', diet: 'nonveg', cuisine: 'South Indian', avoid: '', level: 'beginner' };
    const chk = (name, val, list, label) => `<label><input type="checkbox" name="${name}" value="${val}" ${(list || []).map(String).includes(String(val)) ? 'checked' : ''}> ${label}</label>`, opt = (v, l, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${l}</option>`, tg = t.targets;
    return `<article class="panel"><span class="eyebrow">${t.profile ? 'YOUR PROFILE' : 'TWO-MINUTE INTERVIEW'}</span><h3>${t.profile ? 'Update anything, then save' : 'Tell the trainer about you'}</h3><p class="mut">Used to set your targets and keep every plan safe for you. It stays in your own app and database, and goes to your AI service only when it builds a plan or answers you.</p>
      <form id="trProf" onsubmit="event.preventDefault();LUT.saveProfile()"><div class="tr-grid" style="gap:0 16px">
        <div><label class="tr-l">Main goal</label><select name="goal">${opt('lose', 'Lose fat', p.goal)}${opt('gain', 'Build muscle', p.goal)}${opt('fit', 'Get fit and strong', p.goal)}${opt('endurance', 'Endurance / stamina', p.goal)}</select></div>
        <div><label class="tr-l">Experience</label><select name="level">${opt('beginner', 'Beginner', p.level)}${opt('intermediate', 'Some experience', p.level)}${opt('advanced', 'Trained for years', p.level)}</select></div>
        <div><label class="tr-l">Sex (for calorie maths)</label><select name="sex">${opt('male', 'Male', p.sex)}${opt('female', 'Female', p.sex)}${opt('', 'Prefer not to say', p.sex)}</select></div>
        <div><label class="tr-l">Age</label><input name="age" type="number" min="16" max="90" required value="${esc(p.age)}"></div>
        <div><label class="tr-l">Height, cm</label><input name="height" type="number" min="120" max="230" required value="${esc(p.height)}"></div>
        <div><label class="tr-l">Weight, kg</label><input name="weight" type="number" step="0.1" min="30" max="250" required value="${esc(p.weight)}"></div>
        <div><label class="tr-l">Target weight, kg (optional)</label><input name="target" type="number" step="0.1" value="${esc(p.target)}"></div>
        <div><label class="tr-l">Days a week</label><select name="days">${[2, 3, 4, 5, 6].map(n => opt(n, n + ' days', p.days)).join('')}</select></div>
        <div><label class="tr-l">Minutes a session</label><select name="minutes">${[15, 20, 30, 45, 60].map(n => opt(n, n + ' min', p.minutes)).join('')}</select></div>
        <div><label class="tr-l">Food</label><select name="diet">${opt('veg', 'Vegetarian', p.diet)}${opt('egg', 'Eggetarian', p.diet)}${opt('nonveg', 'Non-vegetarian', p.diet)}${opt('vegan', 'Vegan', p.diet)}</select></div>
        <div><label class="tr-l">Usual cuisine</label><input name="cuisine" value="${esc(p.cuisine)}"></div>
      </div>
      <label class="tr-l">Preferred training days</label><div class="tr-chips">${[1, 2, 3, 4, 5, 6, 0].map(d => chk('dow', d, p.dow, DOW[d])).join('')}</div>
      <label class="tr-l">Equipment you have (bodyweight is always included)</label><div class="tr-chips">${['db', 'band', 'gym', 'bar'].map(k => chk('equipment', k, p.equipment, EQ[k])).join('')}</div>
      <label class="tr-l">Injuries or sore spots — exercises that load them are left out</label><div class="tr-chips">${INJ.map(k => chk('injuries', k, p.injuries, INJL[k])).join('')}</div>
      <label class="tr-l">Medical conditions the coach should know (optional)</label><input name="conditions" style="width:100%" value="${esc(p.conditions)}" placeholder="e.g. asthma, high blood pressure">
      <label class="tr-l">Allergies or foods to avoid</label><input name="avoid" style="width:100%" value="${esc(p.avoid)}" placeholder="e.g. peanuts, mushrooms">
      <div class="tr-row" style="margin-top:16px"><button class="primary" style="width:auto">${t.profile ? 'Save profile' : 'Save and build my plan'}</button>${t.profile ? '<button type="button" style="width:auto" onclick="LUT.reset()">Start over</button>' : ''}</div></form>
      ${tg ? `<div class="tr-kv" style="margin-top:16px"><div><span>Calories / day</span><b>${tg.kcal}</b></div><div><span>Protein / day</span><b>${tg.protein} g</b></div><div><span>Water / day</span><b>${tg.water} glasses</b></div><div><span>Maintenance</span><b>${tg.tdee}</b></div><div><span>BMI</span><b>${tg.bmi}</b></div></div><p class="mut" style="margin-top:8px">Estimates from the Mifflin–St Jeor formula. Not medical advice; check with a doctor before starting if you have a condition.</p>` : ''}</article>
      <article class="panel" style="margin-top:16px"><span class="eyebrow">WELLNESS NUDGES</span><p class="mut">Gentle reminders while LEVEL//UP is open, never during quiet hours.</p><div class="tr-chips" style="margin-top:8px">${Object.keys(WELL).map(k => `<label><input type="checkbox" ${t.well[k] ? 'checked' : ''} onchange="LUT.well('${k}',this.checked)"> ${WELL[k][0]} ${['Water', 'Eye care', 'Stretch', 'Breathing'][Object.keys(WELL).indexOf(k)]} • every ${WELL[k][2] >= 120 ? WELL[k][2] / 60 + ' h' : WELL[k][2] + ' min'}</label>`).join('')}</div><div class="tr-row" style="margin-top:10px"><span class="mut">Quiet from</span><input type="time" value="${t.well.quietFrom}" style="flex:0 1 130px" onchange="LUT.well('quietFrom',this.value)"><span class="mut">to</span><input type="time" value="${t.well.quietTo}" style="flex:0 1 130px" onchange="LUT.well('quietTo',this.value)">${'Notification' in window && Notification.permission === 'default' ? '<button style="width:auto" onclick="Notification.requestPermission().then(()=>LUT.paint())">Allow notifications</button>' : ''}</div></article>`;
  }

  // ---------------------------------------------------------------- actions
  window.LUT = {
    tab(k) { tab = k; paint(); }, paint, close,
    async build(intensity, note, offline) { const t = T(); say(offline ? 'Building your week…' : 'The trainer is planning your week…'); await buildPlan(intensity || (t.plan && t.plan.intensity) || 'normal', note || '', offline); tab = 'plan'; paint(); say('Plan ready, Hunter.'); },
    start: startSession, finish: finishSession, cancel() { ses = null; paint(); }, redo() { const t = T(); delete t.log[today()]; persist(); paint(); },
    quick() { const e = $('trQuick'); const v = e.value; e.value = ''; logText(v); }, meal() { const e = $('trMeal'); const v = e.value; e.value = ''; logText(v); }, photo: logPhoto, listen,
    find(q) { const box = $('trFound'); if (!box) return; const l = q.trim().length < 2 ? [] : FOOD.filter(f => f.n.toLowerCase().includes(q.toLowerCase().trim())).slice(0, 8); box.innerHTML = l.length ? '<ul>' + l.map(f => `<li><span>${esc(f.n)}<small>1 ${esc(f.unit)} • P ${f.protein} g</small></span><b>${f.kcal}</b><span class="tr-row"><button onclick="LUT.addFood('${esc(f.n)}')">+ Add</button></span></li>`).join('') + '</ul>' : ''; },
    addFood(n) { const f = FOOD.find(x => x.n === n); if (f) { addItems([{ name: f.n, qty: 1, unit: f.unit, kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat }], 'list'); say('Added ' + f.n); } },
    mine(i) { const m = T().myFoods[i]; if (m) { addItems([m], 'my foods'); say('Added ' + m.name); } },
    keep(i) { const t = T(), f = dayFood()[i]; if (!f) return; if (!t.myFoods.some(m => m.name === f.name)) { t.myFoods.push({ name: f.name, qty: f.qty, unit: f.unit, kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat }); persist(); say('Saved to My foods'); paint(); } },
    qty(i) { const f = dayFood()[i]; if (!f) return; const v = prompt('Quantity for ' + f.name + ' (currently ' + f.qty + ')', f.qty); const n = parseFloat(v); if (!(n > 0)) return; const k = n / (f.qty || 1);['kcal', 'protein', 'carbs', 'fat'].forEach(x => { f[x] = +(f[x] * k).toFixed(x === 'kcal' ? 0 : 1); }); f.qty = n; persist(); paint(); },
    drop(i) { dayFood().splice(i, 1); persist(); paint(); },
    water(n) { const w = T().well, td = today(); w.glasses[td] = Math.max(0, (w.glasses[td] || 0) + n); persist(); paint(); },
    ask() { const e = $('trAsk'); const v = e.value; e.value = ''; coachSay(v); },
    forget(i) { T().memory.splice(i, 1); persist(); paint(); }, remember() { const e = $('trMem'), v = e.value.trim(); if (!v) return; T().memory.push({ t: v.slice(0, 140), at: Date.now() }); e.value = ''; persist(); paint(); },
    clearChat() { if (!confirm('Clear the conversation? Coach memory stays.')) return; T().chat = []; persist(); paint(); },
    weigh() { const v = parseFloat($('trW').value); if (!(v > 25 && v < 300)) return say('Enter a weight in kg.', true); const t = T(), td = today(); t.weights = t.weights.filter(x => x.d !== td).concat({ d: td, kg: +v.toFixed(1) }).sort((a, b) => a.d.localeCompare(b.d)); if (t.profile) { t.profile.weight = +v.toFixed(1); t.targets = targets(t.profile); } s.weight = +v.toFixed(1); persist(); paint(); say('Weight saved'); },
    video(n) { const t = T(), cur = t.videos[n] || ''; const v = prompt('Paste a YouTube or video link to use as the demo for “' + n + '”. Leave empty to use a form search.', cur); if (v === null) return; if (v && !/^https:\/\//i.test(v.trim())) return say('Use an https:// link.', true); if (v.trim()) t.videos[n] = v.trim(); else delete t.videos[n]; persist(); say('Demo saved'); },
    importForm() { modal('trImp', `<span class="eyebrow">BRING YOUR OWN PLAN</span><h3>Paste a program</h3><p class="mut">One exercise per line: day, exercise, sets, reps. For example:<br><code>Mon, Push-ups, 3, 12</code><br><code>Wed, Goblet squat, 4, 10</code><br>Exercises that clash with your injuries are skipped.</p><textarea id="trImpT" style="width:100%;min-height:150px;margin-top:8px;background:rgba(0,0,0,.4);color:#fff;border:1px solid var(--line);border-radius:10px;padding:10px"></textarea><div class="tr-row" style="margin-top:10px"><button class="primary" style="width:auto" onclick="LUT.importDo()">Import</button><button style="width:auto" onclick="LUT.close('trImp')">Cancel</button></div>`); },
    importDo() {
      const t = T(), p = t.profile || {}, days = Array.from({ length: 7 }, (_, d) => ({ dow: d, rest: true, title: 'Rest', focus: '', minutes: 0, exercises: [] })); let n = 0, skip = [];
      ($('trImpT').value || '').split('\n').map(l => l.split(/[,;\t]/).map(x => x.trim())).filter(c => c.length >= 2 && c[1]).forEach(c => { const d = dayIdx(c[0]); if (!(d >= 0 && d <= 6)) return; const ok = safeEx(c[1], p); if (!ok) { skip.push(c[1]); return; } const day = days[d]; day.rest = false; day.title = 'Imported'; day.minutes = +p.minutes || 30; day.exercises.push({ name: ok.n, sets: Math.max(1, +c[2] || 3), reps: c[3] || ok.dose, rest: '60s' }); n++; });
      if (!n) return say('Nothing to import. Check the format.', true); t.plan = { week: weekKey(), days, intensity: 'normal', note: 'Your own program.', source: 'imported' }; persist(); close('trImp'); tab = 'plan'; paint(); say(`Imported ${n} exercises${skip.length ? '. Skipped for safety: ' + skip.join(', ') : ''}`);
    },
    async checkin(mood) {
      const t = T(), st = planStats(t.plan.week), ratio = st.planned ? st.done / st.planned : 0; t.checkins.push({ week: t.plan.week, mood, done: st.done, planned: st.planned, at: Date.now() });
      const intensity = mood === 'sick' || mood === 'tired' || ratio < .4 ? 'recovery' : mood === 'great' && ratio >= .9 ? 'push' : 'normal';
      const note = { great: 'Last week went well; progress the load a little.', ok: 'Steady week; keep the same structure.', busy: 'Last week was busy; keep sessions short and easy to fit.', tired: 'User felt tired and sore; prioritise recovery and mobility.', sick: 'User was ill or injured; very light recovery week.' }[mood] + ` Completed ${st.done} of ${st.planned} sessions.`;
      persist(); say(intensity === 'recovery' ? 'A bad week gets a recovery week, not a lecture. Building it now.' : intensity === 'push' ? 'Strong week. Turning it up a notch.' : 'Got it. Building next week.'); await buildPlan(intensity, note); tab = 'today'; paint();
    },
    saveProfile() {
      const f = $('trProf'), fd = new FormData(f), g = k => fd.get(k), all = k => fd.getAll(k), t = T(), first = !t.profile;
      t.profile = { goal: g('goal'), level: g('level'), sex: g('sex'), age: +g('age'), height: +g('height'), weight: +g('weight'), target: +g('target') || '', days: +g('days'), minutes: +g('minutes'), diet: g('diet'), cuisine: String(g('cuisine') || '').slice(0, 40), dow: all('dow').map(Number), equipment: all('equipment'), injuries: all('injuries'), conditions: String(g('conditions') || '').slice(0, 200), avoid: String(g('avoid') || '').slice(0, 200) };
      t.targets = targets(t.profile); s.weight = t.profile.weight; s.height = t.profile.height; if (!t.weights.some(x => x.d === today())) t.weights.push({ d: today(), kg: t.profile.weight });
      if (t.plan) t.plan.days.forEach(d => { d.exercises = d.exercises.filter(e => safeEx(e.name, t.profile)); if (!d.exercises.length) d.rest = true; });   // a new injury immediately clears unsafe moves from the current week
      persist(); say('Profile saved'); if (first || !t.plan) LUT.build(); else paint();
    },
    reset() { if (!confirm('Start over? Your plan, profile and coach memory are cleared. Logs and records stay.')) return; const t = T(); delete t.profile; delete t.plan; delete t.targets; t.memory = []; t.chat = []; persist(); tab = 'profile'; paint(); },
    well(k, v) { T().well[k] = v; persist(); }, sharePR,
    // for testing and for the main app
    _: { targets, localPlan, parseMeal, safeEx, variant, allowed, EX, FOOD, T }
  };

  // ---------------------------------------------------------------- start
  function boot() {
    safe(mount); aiCheck();
    const h = location.hash.replace('#', ''); if (/^trainer/.test(h)) { try { show('trainer'); } catch (e) {} document.body.style.setProperty('--pg', '#f97316'); if (h === 'trainer-food') { tab = 'food'; } paint(); }
    setInterval(() => safe(wellTick), 60000);
    addEventListener('storage', e => { if (e.key === 'levelup_home_v7' && !ses && document.activeElement && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { try { const n = JSON.parse(e.newValue); if (n) { Object.keys(s).forEach(k => delete s[k]); Object.assign(s, n); paint(); } } catch (x) {} } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);
})();


/* ============================================================================
   LEVEL//UP — SOLO LEVELING TYPE (appended; nothing above is changed)
   Titles: your own copy of the Solo Leveling title font if you add one to fitness/fonts/,
   otherwise Orbitron. System text: Rajdhani, the closest open match to the anime's System windows.
   ============================================================================ */
(function () {
  'use strict';
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=Rajdhani:wght@500;600;700&display=swap';
  document.head.appendChild(l);
  const css = document.createElement('style');
  css.textContent = `
    @font-face { font-family: 'SL Title'; src: url('fonts/solo-leveling.woff2') format('woff2'), url('fonts/solo-leveling.ttf') format('truetype'), url('fonts/solo-leveling.otf') format('opentype'); font-display: swap; }
    html body, html body button, html body input, html body select, html body textarea { font-family: 'Rajdhani', 'Sora', 'Inter', Arial, sans-serif !important; font-weight: 600; letter-spacing: .02em; }
    html body { font-size: 16px; }
    html body p, html body li, html body .mut, html body small, html body label { font-weight: 500; }
    html body .logo b, html body .topbar h1, html body .hero h2, html body .page-heading h2, html body .section-title h3, html body .panel-head h3, html body .modal-header h3, html body .tr-hero .big, html body .tr-pr h2, html body #trainer h3, html body .orb b, html body .plan-title, html body .workout h3 {
      font-family: 'SL Title', 'Orbitron', 'Rajdhani', sans-serif !important; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
    html body .eyebrow, html body .nav, html body .nav span, html body .stat-box span, html body .metric span, html body .fuel span, html body .tr-tabs button, html body .sync, html body .tr-kv span, html body .tr-l {
      font-family: 'Rajdhani', sans-serif !important; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
    html body .stat-box b, html body .metric b, html body .fuel b, html body .tr-kv b, html body .tr-ring b, html body .ux-timer, html body .orb span, html body .tr-pr b, html body #trainer .tr-modes button {
      font-family: 'Orbitron', 'Rajdhani', sans-serif !important; font-weight: 700; letter-spacing: .04em; }
    html body .topbar h1 { letter-spacing: .1em; text-shadow: 0 0 14px color-mix(in srgb, var(--pg, #00e5ff) 45%, transparent); }
    html body .page-heading h2 { font-size: clamp(22px, 3.2vw, 34px); }
    /* the System window look: thin glowing frame, slight letter glow */
    html body .panel { box-shadow: inset 0 0 0 1px rgba(147,197,253,.06), 0 0 18px rgba(59,130,246,.10); }
    html body .eyebrow { text-shadow: 0 0 8px currentColor; }
  `;
  document.head.appendChild(css);
})();


/* =========================================================
   LEVEL//UP FITNESS — ROUND 16
   RESET VESSEL now really resets: the fresh state is saved as a new
   change, so sync carries the reset to the server and your other
   devices instead of pulling the old progress back.
========================================================= */
(function () {
  'use strict';
  const btn = document.getElementById('reset'); if (!btn) return;
  btn.onclick = async () => {
    if (!confirm('[WARNING] This will purge all hunter rank data, quests, history, food logs and the AI trainer, and reset your vessel to Level 1 on every device. Confirm?')) return;
    try {
      const keepName = s && s.profile ? s.profile.name : undefined;
      s = structuredClone(base); if (keepName) s.profile.name = keepName;
      save();                                                     // stamped as the newest change, so it wins everywhere
      const v = localStorage.getItem(KEY), t = Date.now();
      try { const m = JSON.parse(localStorage.getItem('cxMT') || '{}'); m[KEY] = t; localStorage.setItem('cxMT', JSON.stringify(m)); } catch (e) {}
      if (localStorage.getItem('walletCloudLinked') && /^https?:/.test(location.protocol)) {
        try { await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [KEY]: { v, t } }) }); } catch (e) {}
      }
    } catch (e) { localStorage.removeItem(KEY); }
    try { sessionStorage.setItem('cxKeep', String(Date.now())); } catch (e) {}
    location.reload();
  };
})();

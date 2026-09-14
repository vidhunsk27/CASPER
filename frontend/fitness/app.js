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
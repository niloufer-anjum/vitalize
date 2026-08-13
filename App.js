import { useState, useEffect, useRef } from "react";

const API = "https://api.anthropic.com/v1/messages";

// ─── User profile (single source of truth for all AI prompts) ───────────────
const PROFILE = {
  name: "Alex",
  location: "Hyderabad, India",
  dailyStepGoal: 10000,
  dailyWaterGlasses: 12, // 12 × 250ml = 3L
  conditions: ["Moderate Diastasis Recti (DR) — just starting rehab, no structured program yet"],
  pains: ["Lower back pain", "Knee & hip pain", "Shoulder & neck pain"],
  goals: ["Lose fat", "Maintain weight", "Build muscle & functional strength", "Build complete core strength (inner + outer)", "Become more active for daily tasks: dusting, sweeping, pulling, pushing, carrying", "Eat cleaner & nutritious meals", "Healthy gut"],
  daysPerWeek: 7,
  sessionMinutes: "25–35",
  drRules: [
    "NEVER prescribe crunches, sit-ups, leg raises, or any spinal flexion",
    "NEVER prescribe traditional planks until Phase 4",
    "ALWAYS cue 360° belly breathing and pelvic floor engagement before any core move",
    "Prefer transverse abdominis (TVA) exercises: dead bugs (modified), heel slides, diaphragmatic breathing",
    "No heavy intra-abdominal pressure — avoid Valsalva manoeuvre",
    "Avoid any exercise that causes visible doming or coning at the midline",
  ],
};

// ─── 4-Phase workout programme ───────────────────────────────────────────────
const PHASES = [
  {
    id: 1,
    name: "Recovery",
    subtitle: "Body Pains + Diastasis Recti",
    weeks: "Weeks 1–4",
    color: "#854F0B", bg: "#FAEEDA", border: "#FAC775",
    icon: "🌱",
    focus: "Heal first. DR-safe breathing, pelvic floor activation, pain relief for back/knees/shoulders. Zero spinal flexion. Active rest on off days.",
    weekPlan: [
      { day: "Mon", type: "work", title: "DR Breathwork & Pelvic Floor", duration: "25 min", exercises: ["360° diaphragmatic breathing (5 min)", "Pelvic floor activation holds (3×10)", "Heel slides on floor (3×10 each side)", "Supine marching — slow (3×10 each)", "Cat-cow — gentle (2×8)", "Seated shoulder rolls & neck release (5 min)"] },
      { day: "Tue", type: "work", title: "Lower Back & Hip Gentle Mobility", duration: "30 min", exercises: ["Pelvic floor warm-up (5 min)", "Supine figure-4 hip stretch (2×45s each)", "Glute bridges — no spinal extension push (3×10)", "Clam shells with band or bodyweight (3×12 each)", "Seated knee-to-chest stretch (2×30s)", "Wall angels for shoulders (3×10)"] },
      { day: "Wed", type: "rest", title: "Active Recovery — Walk", duration: "20 min", exercises: ["Gentle 20-min walk outdoors", "Focus on 10,000 steps today", "Drink all 12 glasses of water"] },
      { day: "Thu", type: "work", title: "DR Core Activation + Shoulder Care", duration: "30 min", exercises: ["Diaphragmatic breathing with TVA draw-in (5 min)", "Dead bug — modified, arms only (3×8 each)", "Bird dog — slow and controlled (3×8 each)", "Wall push-up — shoulder strengthening (3×10)", "Doorway chest stretch (2×30s)", "Knee-supported seated stretches"] },
      { day: "Fri", type: "work", title: "Full-Body Gentle Mobility", duration: "25 min", exercises: ["Pelvic floor + breathing warm-up (5 min)", "Supine knee rocks side to side (2×10)", "Seated thoracic rotation (2×10 each)", "Supported squat hold against wall (2×30s)", "Heel-toe raises for ankles (3×15)", "Neck and shoulder self-massage"] },
      { day: "Sat", type: "rest", title: "Active Recovery — Walk + Stretch", duration: "20 min", exercises: ["20-min walk, pace comfortable", "Full-body stretch: 5 major muscle groups", "Journal: note any pain changes this week"] },
      { day: "Sun", type: "rest", title: "Complete Rest", duration: "—", exercises: ["No structured exercise today", "Focus on sleep, hydration, nutrition", "Gentle movement only if you feel good"] },
    ],
  },
  {
    id: 2,
    name: "Lose Fat",
    subtitle: "Cardio · Strength · Pilates alternating",
    weeks: "Weeks 5–10",
    color: "#185FA5", bg: "#E6F1FB", border: "#B5D4F4",
    icon: "🔥",
    focus: "Alternating strength & cardio days. Pilates on cardio days for DR-safe core and stretching. Fat burning without stressing DR or joints. Still no crunches or spinal flexion.",
    weekPlan: [
      {
        day: "Mon", type: "strength", title: "Lower Body Strength — Knee Safe",
        duration: "30 min", tag: "💪 Strength",
        exercises: ["Breathing + pelvic floor warm-up (4 min)", "Sumo squat — shallow range (3×12)", "Glute bridge with 2s hold (4×10)", "Lateral band walks (3×12 each side)", "Step-ups onto low step (3×10 each leg)", "Calf raises (3×20)", "Standing hip hinge practice (2×10)"],
      },
      {
        day: "Tue", type: "cardio", title: "Low-Impact Cardio + Pilates Core",
        duration: "30 min", tag: "🏃 Cardio + 🧘 Pilates",
        exercises: ["March in place warm-up (3 min)", "Step-touch side to side (5 min)", "Seated leg extensions (3×15)", "Pilates: heel slides with TVA exhale (3×10 each)", "Pilates: supine marching — controlled (3×12 each)", "Pilates: pelvic curl — no doming (3×8)", "Pilates stretch: spine twist seated (2×8 each)", "Full-body cool-down stretch (4 min)"],
      },
      {
        day: "Wed", type: "strength", title: "Upper Body Strength — Shoulder Safe",
        duration: "30 min", tag: "💪 Strength",
        exercises: ["Shoulder warm-up: wall angels + arm circles (4 min)", "Wall push-ups progressing to incline (4×10)", "Seated resistance band rows (3×12)", "Lateral raises — very light (3×12)", "Band pull-apart (3×15)", "Tricep dips — assisted on chair (3×10)", "DR-safe dead bug — arms only (3×8 each)"],
      },
      {
        day: "Thu", type: "cardio", title: "Walking Intervals + Pilates Stretch",
        duration: "30 min", tag: "🏃 Cardio + 🧘 Pilates",
        exercises: ["Brisk walk or march in place (10 min)", "Standing step-touch cardio bursts (3×2 min)", "Pilates: cat-cow with breath (2×8)", "Pilates: child's pose to thread-the-needle (2×5 each)", "Pilates: supine figure-4 hip stretch (2×45s each)", "Pilates: seated spinal rotation (2×10 each)", "Cool-down: neck & shoulder release (3 min)"],
      },
      {
        day: "Fri", type: "strength", title: "Full Body Strength — Fat Burn Circuit",
        duration: "30 min", tag: "💪 Strength",
        exercises: ["Breathing activation warm-up (3 min)", "Squat to standing (3×12)", "Incline push-up (3×10)", "Band row (3×12)", "Glute kickback standing (3×12 each)", "Wall sit hold (3×20s)", "Heel slides with TVA — core finisher (3×10 each)"],
      },
      {
        day: "Sat", type: "cardio", title: "Active Cardio + Pilates Full Stretch",
        duration: "30 min", tag: "🏃 Cardio + 🧘 Pilates",
        exercises: ["Brisk walk outdoors (15 min — aim for 3,000 steps)", "Pilates: diaphragmatic breathing reset (3 min)", "Pilates: pelvic floor lifts with exhale (3×10)", "Pilates: supine knee folds — no doming (3×8 each)", "Pilates: seated roll-back — DR modified (2×6)", "Pilates: hip flexor kneeling stretch (2×40s each)", "Pilates: full-body side stretch (2×30s each)"],
      },
      {
        day: "Sun", type: "rest", title: "Rest — Nourish & Recover",
        duration: "—", tag: "😴 Rest",
        exercises: ["No structured exercise", "Gentle walk if you feel like it", "Focus on sleep, hydration, and meal prep", "Reflect: any doming this week? Note for coach"],
      },
    ],
  },
  {
    id: 3,
    name: "Muscle Strength",
    subtitle: "Push · Pull · Carry + Pilates",
    weeks: "Weeks 11–16",
    color: "#0F6E56", bg: "#E1F5EE", border: "#9FE1CB",
    icon: "💪",
    focus: "Alternating strength & cardio. Pilates builds deeper core alongside strength. Functional push/pull/carry patterns for daily life: sweeping, lifting, carrying groceries.",
    weekPlan: [
      {
        day: "Mon", type: "strength", title: "Push Day — Chest, Shoulders, Triceps",
        duration: "35 min", tag: "💪 Strength",
        exercises: ["Pelvic floor + breathing warm-up (4 min)", "Incline push-ups progressing (4×10)", "Dumbbell shoulder press — seated (3×10)", "Resistance band chest press (3×12)", "Lateral raises (3×12)", "Tricep overhead extension — light (3×10)", "Bird dog — controlled (3×8 each)"],
      },
      {
        day: "Tue", type: "cardio", title: "Low-Impact Cardio + Pilates Core",
        duration: "30 min", tag: "🏃 Cardio + 🧘 Pilates",
        exercises: ["Step-touch + march warm-up (5 min)", "Walking intervals or march in place (10 min)", "Pilates: 100s — modified, no neck lift (2×20 pumps)", "Pilates: single leg stretch — DR modified (3×8 each)", "Pilates: supine spinal twist (2×6 each)", "Pilates: clam with Pilates breath (3×12 each)", "Cool-down: full-body stretch (5 min)"],
      },
      {
        day: "Wed", type: "strength", title: "Pull Day — Back, Biceps, Posture",
        duration: "35 min", tag: "💪 Strength",
        exercises: ["Thoracic rotation warm-up (3 min)", "Resistance band pull-apart (3×15)", "Bent-over row — light dumbbells (4×10)", "Resistance band lat pulldown (3×12)", "Hammer curls (3×12)", "Face pulls with band (3×12)", "Dead bug — full progression (3×8 each)"],
      },
      {
        day: "Thu", type: "cardio", title: "Brisk Walk + Pilates Stretch Session",
        duration: "30 min", tag: "🏃 Cardio + 🧘 Pilates",
        exercises: ["Brisk walk 15–20 min (4,000+ steps)", "Pilates: standing Pilates roll-down (3×5)", "Pilates: kneeling side kick (3×10 each)", "Pilates: prone back extension — gentle (3×8)", "Pilates: hip flexor lunge stretch (2×40s each)", "Pilates: thread-the-needle thoracic stretch (2×6 each)", "Pilates: child's pose breathing (2 min)"],
      },
      {
        day: "Fri", type: "strength", title: "Carry & Hinge — Functional Strength",
        duration: "35 min", tag: "💪 Strength",
        exercises: ["Hip hinge warm-up (10 reps)", "Romanian deadlift — light dumbbells (4×10)", "Goblet squat — knee-safe depth (3×10)", "Farmer's carry — 20 steps (4 rounds)", "Suitcase carry — one hand (3×20 steps each)", "Hip thrust with band (3×12)", "Woodchop standing — mimics sweeping (3×10 each)"],
      },
      {
        day: "Sat", type: "cardio", title: "Active Cardio + Pilates Full Body",
        duration: "30 min", tag: "🏃 Cardio + 🧘 Pilates",
        exercises: ["Dance cardio or brisk walk (12 min)", "Pilates: standing side stretch (2×30s each)", "Pilates: Pilates squat with breath (3×10)", "Pilates: mermaid side stretch (2×8 each)", "Pilates: seated forward fold (2×40s)", "Pilates: supine figure-4 stretch (2×40s each)", "Pilates: full-body relaxation breathing (3 min)"],
      },
      {
        day: "Sun", type: "rest", title: "Rest — Recover & Prepare",
        duration: "—", tag: "😴 Rest",
        exercises: ["Full rest day", "Foam roll quads, glutes, upper back", "Meal prep for the week", "Check in: can you do more without pain?"],
      },
    ],
  },
  {
    id: 4,
    name: "Full Core Strength",
    subtitle: "Inner + outer core · Strength · Pilates",
    weeks: "Weeks 17+",
    color: "#993556", bg: "#FBEAF0", border: "#F4C0D1",
    icon: "⚡",
    focus: "Alternating strength & cardio with Pilates as the core backbone. Traditional planks, Pallof press, full bird dogs. Only enter this phase when DR gap has significantly closed.",
    weekPlan: [
      {
        day: "Mon", type: "strength", title: "Deep Core Strength + Push",
        duration: "35 min", tag: "💪 Strength",
        exercises: ["Breathing + TVA activation (5 min)", "Plank on knees — full if DR cleared (3×25s)", "Pallof press with band (3×10 each side)", "Push-up full or incline (4×10)", "Dead bug — full, weighted (3×10 each)", "Dumbbell shoulder press (3×10)", "Side plank on knee (3×20s each)"],
      },
      {
        day: "Tue", type: "cardio", title: "Cardio + Advanced Pilates Core",
        duration: "30 min", tag: "🏃 Cardio + 🧘 Pilates",
        exercises: ["Step-touch intervals (10 min)", "Pilates: 100s — progressed (3×30 pumps)", "Pilates: double leg stretch — DR safe (3×8)", "Pilates: criss-cross — modified (3×8 each)", "Pilates: side lying leg series (3×10 each)", "Pilates: swimming — prone (3×10 each arm/leg)", "Cool-down stretch (5 min)"],
      },
      {
        day: "Wed", type: "strength", title: "Outer Core + Pull",
        duration: "35 min", tag: "💪 Strength",
        exercises: ["Thoracic warm-up (3 min)", "Side plank progression — full (3×25s each)", "Pallof press — heavier band (3×12 each)", "Bent-over row (4×10)", "Anti-rotation hold (3×20s each)", "Resistance band lat pulldown (3×12)", "Copenhagen plank — modified (3×15s each)"],
      },
      {
        day: "Thu", type: "cardio", title: "Walk + Pilates Full Stretch & Flow",
        duration: "30 min", tag: "🏃 Cardio + 🧘 Pilates",
        exercises: ["Brisk walk 15 min (3,500+ steps)", "Pilates: standing roll-down series (3×5)", "Pilates: mermaid with rotation (2×8 each)", "Pilates: kneeling side kick series (3×10 each)", "Pilates: prone back extension — held (3×10s)", "Pilates: hip flexor + quad stretch (2×40s each)", "Pilates: relaxation breathing + body scan (3 min)"],
      },
      {
        day: "Fri", type: "strength", title: "Integrated Full Body — All Planes",
        duration: "35 min", tag: "💪 Strength",
        exercises: ["Dynamic warm-up (3 min)", "Romanian deadlift (4×10)", "Full plank or knee plank (3×30s)", "Push-up to rotation — DR safe (3×8 each)", "Farmer's carry + woodchop superset (3 rounds)", "Goblet squat (3×12)", "Core finisher: Pallof press + dead bug (2 rounds)"],
      },
      {
        day: "Sat", type: "cardio", title: "Active Cardio + Pilates Full Body Flow",
        duration: "30 min", tag: "🏃 Cardio + 🧘 Pilates",
        exercises: ["Dance or brisk walk (12 min)", "Pilates: full body warm-up flow (5 min)", "Pilates: roll-up — modified for DR (3×6)", "Pilates: teaser prep — knees bent (3×8)", "Pilates: side lying series (3×10 each)", "Pilates: seated spinal stretch forward (2×40s)", "Pilates: full cool-down — body scan (3 min)"],
      },
      {
        day: "Sun", type: "rest", title: "Rest — Reflect & Restore",
        duration: "—", tag: "😴 Rest",
        exercises: ["Complete rest or restorative yoga", "Check midline: any doming remaining?", "Celebrate progress — note strength gains", "Set intentions for the week ahead"],
      },
    ],
  },
];

const COACH_SYSTEM = `You are Vitalize AI, a warm, expert health and fitness coach embedded in a personal wellness app.

USER PROFILE:
- Name: ${PROFILE.name}, based in ${PROFILE.location}
- Daily targets: ${PROFILE.dailyStepGoal.toLocaleString()} steps, 3L water (12 glasses of 250ml)
- Conditions: ${PROFILE.conditions.join(", ")}
- Body pains: ${PROFILE.pains.join(", ")}
- Goals: ${PROFILE.goals.join("; ")}
- Workout commitment: daily (7 days/week), 25–35 min sessions

4-PHASE WORKOUT PROGRESSION (follow strictly in this order):
Phase 1 — Recovery (Weeks 1–4): DR-safe breathing, pelvic floor, gentle mobility for back/knee/shoulder. Zero spinal flexion or intra-abdominal pressure.
Phase 2 — Lose Fat (Weeks 5–10): Low-impact cardio (march, step-touch, walking intervals). Fat burning without stressing DR or joints.
Phase 3 — Muscle Strength (Weeks 11–16): Functional push/pull/carry/lift patterns for real daily life (sweeping, carrying, pushing).
Phase 4 — Full Core Strength (Weeks 17+): Deep TVA + outer core (planks, Pallof press, side planks) — ONLY after DR has significantly healed.

DIASTASIS RECTI RULES (non-negotiable):
${PROFILE.drRules.map(r => "- " + r).join("\n")}

BODY CHECK-IN WARMUP LOGIC:
When the user reports pain today, always prepend a 5–8 min targeted warmup before their main session:
- Lower back pain → cat-cow, pelvic tilts, supine knee rocks
- Knee/hip pain → hip circles, supine figure-4, clam shells
- Shoulder/neck pain → wall angels, neck rolls, doorway stretch

MEAL GUIDANCE:
- Anti-inflammatory foods (turmeric, ginger, leafy greens, omega-3s)
- Gut-healthy: fermented foods (curd/yoghurt, idli, dosa), fibre-rich meals
- High-protein for muscle: eggs, chicken, paneer, lentils, fish
- Moderate carbs (complex): brown rice, millets, oats, roti
- Clean eating: minimal processed food, less sugar, whole foods
- Indian/Hyderabad context: suggest locally available, seasonal ingredients
- Calorie range: 1,700–1,900 kcal/day for fat loss while maintaining muscle

Always be warm, concise, and encouraging. Never prescribe anything that contradicts the DR rules above. If asked about pain, always recommend consulting a physiotherapist for anything acute or worsening. Today's date: Saturday May 23, 2026.`;

const MEALS_SYSTEM = `You are a nutrition expert specialising in gut health, anti-inflammatory eating, and fat loss for Indian halal cuisine. Return ONLY a valid JSON array — no markdown, no explanation, no preamble.

USER CONTEXT:
- Based in Hyderabad, India. All proteins must be HALAL.
- Goals: fat loss, muscle maintenance, healthy gut, clean eating
- Conditions: Diastasis Recti recovery — avoid bloating foods (excess beans alone, raw cruciferous veg, carbonated drinks)
- Calorie range: 1,750–1,900 kcal/day
- Coffee preference: filter coffee with milk (one per day, mid-morning)

STRICT MEAL STRUCTURE — every day must have exactly 6 entries:
1. BREAKFAST: one carb (rotate: oats, rava upma, idli, dosa, poha, roti) + one halal protein source + something light (curd, fruit, chutney). ~350–400 kcal.
2. MORNING SNACK: small, protein-forward. Options: boiled eggs, handful of nuts + fruit, roasted chana, curd with seeds. ~150 kcal. Include filter coffee here.
3. LUNCH: rice (brown or white) + same protein curry as dinner + vegetable (curry, salad or dry sabzi). ~500–550 kcal.
4. EVENING SNACK: light and wholesome. Options: fruit + nuts, sprouts chaat, makhana, vegetable soup, buttermilk. ~150 kcal.
5. DINNER: 2 rotis + SAME protein curry as lunch + SAME vegetable as lunch. ~450–500 kcal.
6. FILTER COFFEE: already counted in morning snack.

HALAL PROTEIN ROTATION — rotate these across 7 days, no protein repeated on back-to-back days:
- Eggs (omelette, boiled, scrambled, egg curry)
- Chicken (curry, grilled, stir-fry)
- Mutton (curry, keema)
- Dal (moong, masoor, toor — counts as protein for vegetarian days)
- Soya (chunks curry, bhurji style)
- Fish (curry, grilled — use local Hyderabad fish: rohu, surmai, tilapia)
- Mixed (paneer or tofu for variety)

RECIPE VIDEOS — for each meal, provide a YouTube search URL in format:
https://www.youtube.com/results?search_query=QUERY (encode spaces as +, keep queries short and specific, e.g. "chicken+curry+recipe+indian")

Return exactly 7 objects. Each object must have these exact fields:
- day: e.g. "Sat"
- today: true only for the first item
- protein: the main protein for that day (e.g. "Chicken")
- breakfast: { meal: string, cal: string, recipe_url: string }
- morning_snack: { meal: string, cal: string }
- lunch: { meal: string, cal: string, recipe_url: string }
- evening_snack: { meal: string, cal: string }
- dinner: { meal: string, cal: string, recipe_url: string }
- total_cal: e.g. "1,820 kcal"

Important: lunch and dinner MUST share the same protein curry and same vegetable. Only the carb differs (rice for lunch, roti for dinner).`;

// ─── Theme system ─────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    // Primary accent — warm peach
    accent:       "#E8836A",
    accentLight:  "#FDEEE9",
    accentDark:   "#9D3D22",
    accentMid:    "#F4B49E",
    // Secondary — sage / muted teal
    sage:         "#7DAA8A",
    sageLight:    "#E8F3EB",
    sageDark:     "#3A5E44",
    // Warm tertiary tones
    amber:        "#C9934A",
    amberLight:   "#FDF0DC",
    blue:         "#6E8FC2",
    blueLight:    "#E6EDF8",
    rose:         "#C27A8A",
    roseLight:    "#F8ECF0",
    mauve:        "#9B7EC2",
    mauveLight:   "#F0EBF9",
    // Surfaces
    bg:           "#FDF6F0",      // warm cream parchment
    bgAlt:        "#F9EFE5",      // slightly deeper warm
    card:         "#FFFAF6",      // warm white card
    cardHover:    "#FFF3EB",
    border:       "#EDD9C8",      // warm tan border
    borderLight:  "#F3E8DA",
    // Text
    text:         "#3B2A1E",      // warm dark brown
    textMuted:    "#9A7B68",      // warm taupe
    textFaint:    "#C4A898",
    // Nav
    nav:          "#FFFAF6",
    navBorder:    "#EDD9C8",
    // Notification
    notifBg:      "#E8836A",
    notifText:    "#fff",
    notifSub:     "#FDEEE9",
  },
  dark: {
    accent:       "#E8836A",
    accentLight:  "#3D1F14",
    accentDark:   "#F4B49E",
    accentMid:    "#C4654C",
    sage:         "#7DAA8A",
    sageLight:    "#1A2E1F",
    sageDark:     "#A8D4B4",
    amber:        "#C9934A",
    amberLight:   "#2E2010",
    blue:         "#8FADD4",
    blueLight:    "#1A2035",
    rose:         "#D49AAA",
    roseLight:    "#2E1820",
    mauve:        "#B89ED4",
    mauveLight:   "#221535",
    bg:           "#1E1510",      // very dark warm brown
    bgAlt:        "#261A12",
    card:         "#2C1F15",      // dark warm card
    cardHover:    "#352416",
    border:       "#4A3020",
    borderLight:  "#3A2418",
    text:         "#F5E8DC",      // warm off-white
    textMuted:    "#A08060",
    textFaint:    "#6A4E38",
    nav:          "#221810",
    navBorder:    "#3A2418",
    notifBg:      "#C4654C",
    notifText:    "#fff",
    notifSub:     "#F4B49E",
  },
};

// C will be set dynamically based on dark mode — accessed via window.__C
let C = THEMES.light;

// ─── Playlist config ─────────────────────────────────────────────────────────
const BLS_THEMES = [
  "discipline and hard work",
  "stoicism and inner peace",
  "purpose and meaning",
  "resilience and not giving up",
  "focus and silence",
  "doing hard things",
  "consistency over motivation",
];

const WORKOUT_CATEGORIES = [
  { label: "4K Walk", emoji: "🌿", search: "4K walking tour no music peaceful" },
  { label: "Minimalism", emoji: "🤍", search: "minimalist lifestyle slow living vlog" },
  { label: "Home Org", emoji: "🗂️", search: "Marie Kondo style home organisation tidy" },
  { label: "Home Decor", emoji: "🏡", search: "quiet home decor aesthetic no music" },
  { label: "Productivity", emoji: "📋", search: "productive day routine no commentary" },
  { label: "Day in My Life", emoji: "☕", search: "slow day in my life vlog no music" },
  { label: "Painting", emoji: "🎨", search: "painting art process no talking no music" },
  { label: "Study With Me", emoji: "📖", search: "study with me no music quiet" },
];

const PLAYLIST_SYSTEM = `You are a YouTube playlist curator. The user wants a daily workout playlist with exactly 7 videos total:
- 2 motivational videos from Ben Lionel Scott's YouTube channel (https://www.youtube.com/@BenLionetScott). Pick from different themes each day: discipline, stoicism, purpose, resilience, focus, consistency, doing hard things.
- 5 videos from these categories (pick 5 different ones today, rotate daily): 4K scenic walks, minimalism/slow living, Marie Kondo style home organisation, home decor aesthetics, productivity routines, day-in-my-life vlogs, art/painting processes, study-with-me sessions.

STRICT content filters — every video must:
- Have little to no background music (peaceful ambient is OK, no upbeat tracks)
- Show NO skin (no workout videos showing midriff, no bikinis, etc.)
- Be family-safe, no vulgarity, no fast cuts or aggressive editing
- Be calming, slow-paced, and pleasant to watch while exercising

Return ONLY a valid JSON array of exactly 7 objects. Each object must have:
- type: "motivation" or "workout"
- title: realistic YouTube video title (as it would appear on YouTube)
- channel: channel name
- duration: e.g. "12:34"
- category: short label e.g. "Discipline", "4K Walk", "Minimalism", "Painting"
- emoji: one relevant emoji
- url: a real YouTube search URL using https://www.youtube.com/results?search_query=QUERY format (encode spaces as +)
- description: one short sentence (max 12 words) describing why this fits today

No markdown, no explanation, no preamble. Only the JSON array.`;

const DEFAULT_MEALS = [
  {
    day: "Sat", today: true, protein: "Eggs",
    breakfast: { meal: "Masala omelette (2 eggs) + 1 roti + mint chutney", cal: "380 kcal", recipe_url: "https://www.youtube.com/results?search_query=masala+omelette+indian+recipe" },
    morning_snack: { meal: "Filter coffee with milk + 1 banana + 5 almonds", cal: "160 kcal" },
    lunch: { meal: "Brown rice + egg curry + beans sabzi", cal: "530 kcal", recipe_url: "https://www.youtube.com/results?search_query=egg+curry+recipe+indian" },
    evening_snack: { meal: "Roasted makhana + buttermilk", cal: "140 kcal" },
    dinner: { meal: "2 rotis + egg curry + beans sabzi", cal: "470 kcal", recipe_url: "https://www.youtube.com/results?search_query=egg+curry+recipe+indian" },
    total_cal: "1,780 kcal",
  },
  {
    day: "Sun", today: false, protein: "Chicken",
    breakfast: { meal: "Vegetable upma (rava) + curd + green chutney", cal: "370 kcal", recipe_url: "https://www.youtube.com/results?search_query=vegetable+upma+recipe" },
    morning_snack: { meal: "Filter coffee with milk + boiled egg + small apple", cal: "155 kcal" },
    lunch: { meal: "White rice + chicken curry + palak sabzi", cal: "540 kcal", recipe_url: "https://www.youtube.com/results?search_query=simple+chicken+curry+indian" },
    evening_snack: { meal: "Sprouts chaat + lemon", cal: "130 kcal" },
    dinner: { meal: "2 rotis + chicken curry + palak sabzi", cal: "490 kcal", recipe_url: "https://www.youtube.com/results?search_query=simple+chicken+curry+indian" },
    total_cal: "1,810 kcal",
  },
  {
    day: "Mon", today: false, protein: "Fish",
    breakfast: { meal: "2 idli + sambar + coconut chutney", cal: "360 kcal", recipe_url: "https://www.youtube.com/results?search_query=soft+idli+recipe+home" },
    morning_snack: { meal: "Filter coffee with milk + handful roasted chana + orange", cal: "160 kcal" },
    lunch: { meal: "Brown rice + fish curry (surmai) + cucumber tomato salad", cal: "520 kcal", recipe_url: "https://www.youtube.com/results?search_query=fish+curry+indian+style" },
    evening_snack: { meal: "Fruit bowl (papaya + pomegranate)", cal: "120 kcal" },
    dinner: { meal: "2 rotis + fish curry (surmai) + cucumber tomato salad", cal: "480 kcal", recipe_url: "https://www.youtube.com/results?search_query=fish+curry+indian+style" },
    total_cal: "1,780 kcal",
  },
  {
    day: "Tue", today: false, protein: "Dal",
    breakfast: { meal: "Poha with peas & peanuts + curd", cal: "360 kcal", recipe_url: "https://www.youtube.com/results?search_query=poha+recipe+healthy+indian" },
    morning_snack: { meal: "Filter coffee with milk + 2 boiled eggs", cal: "175 kcal" },
    lunch: { meal: "White rice + masoor dal tadka + carrot methi sabzi", cal: "510 kcal", recipe_url: "https://www.youtube.com/results?search_query=masoor+dal+tadka+recipe" },
    evening_snack: { meal: "Vegetable soup (light, no cream)", cal: "110 kcal" },
    dinner: { meal: "2 rotis + masoor dal tadka + carrot methi sabzi", cal: "460 kcal", recipe_url: "https://www.youtube.com/results?search_query=masoor+dal+tadka+recipe" },
    total_cal: "1,760 kcal",
  },
  {
    day: "Wed", today: false, protein: "Mutton",
    breakfast: { meal: "Dosa (2 plain) + sambar + tomato chutney", cal: "380 kcal", recipe_url: "https://www.youtube.com/results?search_query=crispy+dosa+recipe+home" },
    morning_snack: { meal: "Filter coffee with milk + handful mixed nuts + 1 guava", cal: "165 kcal" },
    lunch: { meal: "Brown rice + mutton curry (light) + cabbage stir fry", cal: "550 kcal", recipe_url: "https://www.youtube.com/results?search_query=mutton+curry+hyderabadi+recipe" },
    evening_snack: { meal: "Roasted chana + lemon + cucumber sticks", cal: "130 kcal" },
    dinner: { meal: "2 rotis + mutton curry (light) + cabbage stir fry", cal: "500 kcal", recipe_url: "https://www.youtube.com/results?search_query=mutton+curry+hyderabadi+recipe" },
    total_cal: "1,840 kcal",
  },
  {
    day: "Thu", today: false, protein: "Soya",
    breakfast: { meal: "Oats (rolled) with banana, cinnamon + boiled egg", cal: "370 kcal", recipe_url: "https://www.youtube.com/results?search_query=healthy+oats+breakfast+indian" },
    morning_snack: { meal: "Filter coffee with milk + small apple + 5 walnuts", cal: "155 kcal" },
    lunch: { meal: "White rice + soya chunk curry + tomato onion salad", cal: "515 kcal", recipe_url: "https://www.youtube.com/results?search_query=soya+chunks+curry+recipe" },
    evening_snack: { meal: "Buttermilk (chaas) + 1 fruit", cal: "120 kcal" },
    dinner: { meal: "2 rotis + soya chunk curry + tomato onion salad", cal: "470 kcal", recipe_url: "https://www.youtube.com/results?search_query=soya+chunks+curry+recipe" },
    total_cal: "1,770 kcal",
  },
  {
    day: "Fri", today: false, protein: "Chicken",
    breakfast: { meal: "Moong dal chilla (2) + mint curd dip", cal: "360 kcal", recipe_url: "https://www.youtube.com/results?search_query=moong+dal+chilla+recipe" },
    morning_snack: { meal: "Filter coffee with milk + boiled egg + small banana", cal: "165 kcal" },
    lunch: { meal: "Brown rice + chicken keema + bottle gourd sabzi", cal: "535 kcal", recipe_url: "https://www.youtube.com/results?search_query=chicken+keema+recipe+indian" },
    evening_snack: { meal: "Makhana (roasted) + herbal tea", cal: "120 kcal" },
    dinner: { meal: "2 rotis + chicken keema + bottle gourd sabzi", cal: "480 kcal", recipe_url: "https://www.youtube.com/results?search_query=chicken+keema+recipe+indian" },
    total_cal: "1,790 kcal",
  },
];

async function callClaude(messages, system, maxTokens = 1000) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// Dynamic styles — call makeS(C) whenever theme changes
function makeS(C) { return {
  app: { fontFamily: "'Nunito','DM Sans','Segoe UI',sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 430, margin: "0 auto", paddingBottom: 84 },
  header: { padding: "18px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { fontFamily: "'Nunito',sans-serif", fontSize: 23, fontWeight: 800, letterSpacing: -0.5, color: C.text },
  page: { padding: "14px 20px" },
  secTitle: { fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 10 },
  card: { background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, padding: 16, marginBottom: 12,
          boxShadow: `0 2px 8px ${C.border}50` },
  badge: (bg, col) => ({ display: "inline-block", background: bg, color: col, fontSize: 11, fontWeight: 700,
          padding: "3px 10px", borderRadius: 20, marginBottom: 6 }),
  btn: (p) => ({ width: "100%", padding: "13px", background: p ? C.accent : "transparent",
          color: p ? "#fff" : C.text, border: p ? "none" : `1.5px solid ${C.border}`,
          borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer",
          fontFamily: "'Nunito',sans-serif", marginTop: p ? 10 : 0,
          boxShadow: p ? `0 4px 12px ${C.accentMid}60` : "none" }),
  metricCard: { background: C.card, borderRadius: 18, border: `1px solid ${C.border}`,
          padding: "13px 10px 11px", boxShadow: `0 2px 6px ${C.border}40` },
  bar: { height: 4, borderRadius: 4, background: C.borderLight, marginTop: 8, overflow: "hidden" },
  barFill: (pct, color) => ({ height: "100%", width: Math.min(100, pct) + "%", borderRadius: 4,
          background: color, transition: "width 0.7s ease" }),
  tracker: { display: "flex", alignItems: "center", justifyContent: "space-between",
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
          padding: "14px 16px", marginBottom: 10, boxShadow: `0 2px 6px ${C.border}40` },
  tBtn: { width: 34, height: 34, borderRadius: "50%", border: `1.5px solid ${C.border}`,
          background: C.bgAlt, fontSize: 18, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", color: C.text },
  bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430, background: C.nav, borderTop: `1px solid ${C.navBorder}`,
          display: "flex", zIndex: 100 },
  navItem: (a) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          padding: "9px 0 14px", cursor: "pointer", border: "none", background: "none" }),
  bubble: (mine) => ({ maxWidth: "82%", alignSelf: mine ? "flex-end" : "flex-start",
          background: mine ? C.accent : C.card, color: mine ? "#fff" : C.text,
          border: mine ? "none" : `1px solid ${C.border}`,
          borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "10px 14px", fontSize: 14, lineHeight: 1.55, marginBottom: 8,
          boxShadow: mine ? `0 3px 10px ${C.accentMid}50` : `0 1px 4px ${C.border}50` }),
}; }

let S = makeS(THEMES.light);

// ─── Sub-components ───────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, unit, pct, color, C }) {
  return (
    <div style={{ ...S.metricCard }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2, fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 17, fontWeight: 800, lineHeight: 1, color: C.text }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2 }}>{unit}</div>
      <div style={S.bar}><div style={S.barFill(pct, color)} /></div>
    </div>
  );
}

function CheckInBanner({ pains, onGenerate, warmup, loading, C }) {
  return (
    <div style={{ background: C.amberLight, border: `1px solid ${C.amber}50`, borderRadius: 18, padding: "14px 16px", marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.amber, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>⚠️ Daily body check-in</div>
      {warmup ? (
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{warmup}</div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 10, lineHeight: 1.5 }}>
            Active concerns: <strong>{pains.join(", ")}</strong>. Tap below to generate today's personalised warmup.
          </div>
          <button onClick={onGenerate} disabled={loading}
            style={{ padding: "8px 16px", background: C.amber, color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
            {loading ? "Generating warmup…" : "Generate today's warmup →"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── PLAYLIST PAGE ────────────────────────────────────────────────────────────
function PlaylistPage({ showNotif, onDismissNotif, C }) {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watched, setWatched] = useState({});
  const bgColors = [C.amberLight, C.sageLight, C.blueLight, C.roseLight, C.mauveLight, C.accentLight, C.amberLight];

  async function generatePlaylist() {
    setLoading(true);
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = dayNames[new Date().getDay()];
    const theme = BLS_THEMES[new Date().getDay() % BLS_THEMES.length];
    const reply = await callClaude(
      [{ role: "user", content: `Today is ${today}. Generate today's playlist. For Ben Lionel Scott videos, focus on theme: "${theme}". For the 5 workout videos, pick a fresh varied mix from the allowed categories. Make the titles feel authentic to real YouTube video titles.` }],
      PLAYLIST_SYSTEM, 1200
    );
    try {
      const parsed = JSON.parse(reply.replace(/```json|```/g, "").trim());
      setPlaylist(parsed); setWatched({});
    } catch { setPlaylist(null); }
    setLoading(false);
  }

  const motVideos = playlist?.filter(v => v.type === "motivation") || [];
  const workVideos = playlist?.filter(v => v.type === "workout") || [];

  return (
    <div style={S.page}>
      {showNotif && (
        <div style={{ background: C.accent, borderRadius: 18, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 24 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2, fontFamily: "'Nunito',sans-serif" }}>5 PM Workout Reminder</div>
            <div style={{ fontSize: 12, color: C.accentLight }}>Time to move! Tap Generate to load today's videos.</div>
          </div>
          <button onClick={onDismissNotif} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={S.secTitle}>Today's playlist</div>
        {playlist && <span style={{ fontSize: 12, color: C.textMuted }}>{Object.keys(watched).length}/7 watched</span>}
      </div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
        2 Ben Lionel Scott + 5 calming videos · No music · No skin · Refreshes daily
      </div>
      {!playlist && !loading && (
        <div style={{ ...S.card, textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎬</div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 6 }}>Ready for today's picks</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20, lineHeight: 1.5 }}>AI picks 2 BLS motivation videos + 5 calming workout-friendly videos fresh for today.</div>
          <button style={S.btn(true)} onClick={generatePlaylist}>✨ Generate today's playlist</button>
        </div>
      )}
      {loading && (
        <div style={{ ...S.card, textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🌸</div>
          <div style={{ fontSize: 14, color: C.textMuted, fontFamily: "'Nunito',sans-serif" }}>Curating your playlist…</div>
        </div>
      )}
      {playlist && !loading && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.amber, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginTop: 4 }}>🔥 Motivation — Ben Lionel Scott</div>
          {motVideos.map((v, i) => <VideoCard key={i} v={v} bg={bgColors[i]} watched={watched[`m${i}`]} onWatch={() => setWatched(w => ({ ...w, [`m${i}`]: true }))} C={C} />)}
          <div style={{ fontSize: 11, fontWeight: 800, color: C.blue, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginTop: 18 }}>🎬 Workout Playlist — Calm & Inspiring</div>
          {workVideos.map((v, i) => <VideoCard key={i} v={v} bg={bgColors[i + 2]} watched={watched[`w${i}`]} onWatch={() => setWatched(w => ({ ...w, [`w${i}`]: true }))} C={C} />)}
          <button style={{ ...S.btn(false), marginTop: 8 }} onClick={generatePlaylist}>↻ Refresh playlist</button>
        </>
      )}
    </div>
  );
}

function VideoCard({ v, bg, watched, onWatch, C }) {
  return (
    <a href={v.url} target="_blank" rel="noopener noreferrer" onClick={onWatch}
      style={{ display: "block", textDecoration: "none", marginBottom: 10 }}>
      <div style={{ ...S.card, marginBottom: 0, display: "flex", gap: 12, alignItems: "flex-start", opacity: watched ? 0.55 : 1, position: "relative" }}>
        {watched && <div style={{ position: "absolute", top: 10, right: 12, fontSize: 16 }}>✅</div>}
        <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{v.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: bg, color: C.text, padding: "2px 8px", borderRadius: 8 }}>{v.category}</span>
            <span style={{ fontSize: 11, color: C.textMuted }}>▶ {v.duration}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.35, marginBottom: 3 }}>{v.title}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{v.channel}</div>
          {v.description && <div style={{ fontSize: 11, color: C.textFaint, marginTop: 3, fontStyle: "italic" }}>{v.description}</div>}
        </div>
      </div>
    </a>
  );
}

// ─── TODAY PAGE ───────────────────────────────────────────────────────────────
function TodayPage({ steps, setSteps, water, setWater, currentPhase, onGoToPlaylist, C }) {
  const [warmup, setWarmup] = useState("");
  const [warmupLoading, setWarmupLoading] = useState(false);
  const phase = PHASES[currentPhase - 1];
  const todayWorkout = phase.weekPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  async function generateWarmup() {
    setWarmupLoading(true);
    const text = await callClaude(
      [{ role: "user", content: `Today's pains: ${PROFILE.pains.join(", ")}. Current phase: Phase ${phase.id} (${phase.name}). Generate a 5–8 minute targeted warmup routine. List 4–6 specific exercises with sets/reps/duration. Be very concise — just the exercise list, no preamble.` }],
      COACH_SYSTEM, 400
    );
    setWarmup(text); setWarmupLoading(false);
  }

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 3 }}>Saturday, May 23 · Hyderabad</div>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>
          Good morning, <span style={{ color: C.accent }}>Alex</span> 👋
        </div>
      </div>

      <CheckInBanner pains={PROFILE.pains} onGenerate={generateWarmup} warmup={warmup} loading={warmupLoading} C={C} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
        <MetricCard icon="👟" label="Steps" value={steps.toLocaleString()} unit="/ 10,000" pct={Math.round(steps / 100)} color={C.sage} C={C} />
        <MetricCard icon="💧" label="Water" value={water >= 4 ? ((water * 250)/1000).toFixed(1)+"L" : water*250+"ml"} unit="/ 3L · 12 glasses" pct={Math.round((water/12)*100)} color={C.blue} C={C} />
        <MetricCard icon="🔥" label="Calories" value="1,640" unit="/ 1,800" pct={91} color={C.accent} C={C} />
      </div>

      <div style={S.secTitle}>Quick log</div>
      <div style={{ marginBottom: 18 }}>
        {[
          { icon: "👟", label: "Steps", sub: "+500 per tap", val: `${(steps/1000).toFixed(1)}k`, dec: () => setSteps(s => Math.max(0, s-500)), inc: () => setSteps(s => s+500) },
          { icon: "💧", label: "Water glasses", sub: "Goal: 12 glasses = 3L", val: `${water}/12`, dec: () => setWater(w => Math.max(0, w-1)), inc: () => setWater(w => Math.min(12, w+1)) },
        ].map((t, i) => (
          <div key={i} style={S.tracker}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{t.icon} {t.label}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>{t.sub}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button style={S.tBtn} onClick={t.dec}>−</button>
              <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 800, minWidth: 44, textAlign: "center", color: C.text }}>{t.val}</span>
              <button style={S.tBtn} onClick={t.inc}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div onClick={onGoToPlaylist} style={{ ...S.card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", background: C.accentLight, border: `1px solid ${C.accentMid}50`, marginBottom: 18 }}>
        <div style={{ fontSize: 30 }}>🎬</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, color: C.accentDark, marginBottom: 2 }}>Today's playlist</div>
          <div style={{ fontSize: 12, color: C.accent }}>2 BLS + 5 calming videos · Tap to open →</div>
        </div>
        <div style={{ fontSize: 20, color: C.accent }}>▸</div>
      </div>

      <div style={S.secTitle}>Today's session</div>
      {todayWorkout && (
        <div style={S.card}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={S.badge(phase.bg, phase.color)}>{phase.icon} Phase {phase.id} · {phase.name}</span>
            {todayWorkout.tag && <span style={S.badge(C.bgAlt, C.textMuted)}>{todayWorkout.tag}</span>}
          </div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4 }}>{todayWorkout.title}</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 10 }}>{todayWorkout.type === "rest" ? "Rest / active recovery day" : todayWorkout.duration}</div>
          {todayWorkout.exercises.slice(0, 4).map((e, i) => (
            <div key={i} style={{ fontSize: 13, color: C.text, padding: "5px 0", borderBottom: i < 3 ? `1px solid ${C.borderLight}` : "none" }}>• {e}</div>
          ))}
          {todayWorkout.exercises.length > 4 && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>+{todayWorkout.exercises.length - 4} more exercises</div>}
        </div>
      )}
    </div>
  );
}

// ─── WORKOUT PAGE ─────────────────────────────────────────────────────────────
function WorkoutPage({ currentPhase, setCurrentPhase, C }) {
  const [expandedDay, setExpandedDay] = useState(null);
  const phase = PHASES[currentPhase - 1];

  return (
    <div style={S.page}>
      <div style={S.secTitle}>Your 4-phase journey</div>
      <div style={{ marginBottom: 18 }}>
        {PHASES.map(p => (
          <div key={p.id} onClick={() => setCurrentPhase(p.id)}
            style={{ ...S.card, marginBottom: 8, border: currentPhase === p.id ? `2px solid ${p.border}` : `1px solid ${C.border}`, cursor: "pointer", background: currentPhase === p.id ? p.bg + "80" : C.card }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 22 }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, color: C.text }}>Phase {p.id} — {p.name}</span>
                  {currentPhase === p.id && <span style={{ fontSize: 10, background: p.bg, color: p.color, padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>Current</span>}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{p.subtitle} · {p.weeks}</div>
              </div>
              <div style={{ fontSize: 18, color: C.textMuted }}>{currentPhase === p.id ? "▾" : "▸"}</div>
            </div>
            {currentPhase === p.id && (
              <div style={{ marginTop: 10, fontSize: 13, color: C.text, lineHeight: 1.55, paddingTop: 10, borderTop: `1px solid ${C.borderLight}` }}>{p.focus}</div>
            )}
          </div>
        ))}
      </div>

      <div style={S.secTitle}>This week — Phase {phase.id}: {phase.name}</div>
      {phase.weekPlan.map((day, i) => (
        <div key={i} style={{ ...S.card, marginBottom: 8, cursor: "pointer" }} onClick={() => setExpandedDay(expandedDay === i ? null : i)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: day.type === "rest" ? C.bgAlt : phase.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: day.type === "rest" ? C.textMuted : phase.color, flexShrink: 0, fontFamily: "'Nunito',sans-serif" }}>{day.day}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{day.title}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>{day.tag || (day.type === "rest" ? "😴 Rest / recovery" : day.duration)}</div>
            </div>
            <div style={{ fontSize: 16, color: C.textMuted }}>{expandedDay === i ? "▾" : "▸"}</div>
          </div>
          {expandedDay === i && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.borderLight}` }}>
              {day.exercises.map((e, j) => (
                <div key={j} style={{ fontSize: 13, color: C.text, padding: "5px 0", borderBottom: j < day.exercises.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>• {e}</div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 8, background: C.sageLight, border: `1px solid ${C.sage}50`, borderRadius: 14, padding: "12px 14px", fontSize: 13, color: C.sageDark, lineHeight: 1.55 }}>
        🌿 <strong>DR safety reminder:</strong> No crunches, sit-ups, or traditional planks until Phase 4. Breathe out on the effort. Stop if you see doming at your midline.
      </div>
    </div>
  );
}

// ─── MEALS PAGE ───────────────────────────────────────────────────────────────
const MEAL_SLOTS = [
  { key: "breakfast",     icon: "🌅", label: "Breakfast",      hasRecipe: true  },
  { key: "morning_snack", icon: "☕", label: "Morning Snack + Filter Coffee", hasRecipe: false },
  { key: "lunch",         icon: "🍚", label: "Lunch",          hasRecipe: true  },
  { key: "evening_snack", icon: "🍎", label: "Evening Snack",  hasRecipe: false },
  { key: "dinner",        icon: "🫓", label: "Dinner",         hasRecipe: true  },
];

// Protein colors use fixed pastel pairs (readable in both modes)
const PROTEIN_COLORS = {
  Eggs:    { bg: "#FDE8C8", color: "#7A4210" },
  Chicken: { bg: "#D6EDD8", color: "#2E5E34" },
  Mutton:  { bg: "#F2DDE8", color: "#7A2E50" },
  Dal:     { bg: "#D8E6F5", color: "#1E4878" },
  Soya:    { bg: "#E4DCF5", color: "#42248A" },
  Fish:    { bg: "#CCF0EE", color: "#0A5050" },
  Mixed:   { bg: "#EDE8E2", color: "#4A3828" },
};

function MealDayCard({ day, expanded, onToggle, C }) {
  const pc = PROTEIN_COLORS[day.protein] || PROTEIN_COLORS.Mixed;
  return (
    <div style={{ ...S.card, marginBottom: 10, padding: 0, overflow: "hidden" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", cursor: "pointer" }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: day.today ? C.accent : C.bgAlt, border: `1.5px solid ${day.today ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: day.today ? "#fff" : C.textMuted, flexShrink: 0, fontFamily: "'Nunito',sans-serif" }}>
          {day.day}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, color: C.text }}>{day.day}{day.today ? " · Today" : ""}</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: pc.bg, color: pc.color, padding: "2px 8px", borderRadius: 10 }}>{day.protein}</span>
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{day.total_cal} · {MEAL_SLOTS.length} meals</div>
        </div>
        <div style={{ fontSize: 16, color: C.textMuted }}>{expanded ? "▾" : "▸"}</div>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.borderLight}` }}>
          {MEAL_SLOTS.map((slot, i) => {
            const mealData = day[slot.key];
            if (!mealData) return null;
            return (
              <div key={slot.key} style={{ padding: "12px 16px", borderBottom: i < MEAL_SLOTS.length - 1 ? `1px solid ${C.borderLight}` : "none", background: i % 2 === 0 ? C.card : C.bgAlt + "80" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ fontSize: 18, marginTop: 1, flexShrink: 0 }}>{slot.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>{slot.label}</div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, marginBottom: 4 }}>{mealData.meal}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: C.textFaint }}>{mealData.cal}</span>
                      {slot.hasRecipe && mealData.recipe_url && (
                        <a href={mealData.recipe_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: C.blue, textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                          ▶ Recipe video ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ padding: "10px 16px", background: C.accentLight, borderTop: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: 11, color: C.accentDark, lineHeight: 1.5 }}>
              💡 <strong>Cook once, eat twice</strong> — lunch & dinner share the same {day.protein} curry and veg.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MealsPage({ C }) {
  const [meals, setMeals] = useState(DEFAULT_MEALS);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(0);

  async function regenerate() {
    setLoading(true);
    const reply = await callClaude(
      [{ role: "user", content: `Generate a fresh 7-day halal meal plan following the exact structure. Rotate proteins: Eggs, Chicken, Fish, Dal, Mutton, Soya, Chicken (no two same proteins back-to-back). Today is Saturday. Return ONLY the JSON array.` }],
      MEALS_SYSTEM, 2000
    );
    try {
      const parsed = JSON.parse(reply.replace(/```json|```/g, "").trim());
      setMeals(parsed); setExpanded(0);
    } catch {}
    setLoading(false);
  }

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={S.secTitle}>Weekly meal plan</div>
        <div style={{ display: "flex", gap: 5 }}>
          <span style={S.badge(C.amberLight, C.amber)}>Halal</span>
          <span style={S.badge(C.sageLight, C.sageDark)}>~1,800 kcal</span>
        </div>
      </div>
      <div style={{ background: C.sageLight, border: `1px solid ${C.sage}40`, borderRadius: 14, padding: "10px 14px", fontSize: 13, color: C.sageDark, marginBottom: 14, lineHeight: 1.6 }}>
        🌿 6 meals/day · Breakfast + 2 snacks + filter coffee · Lunch & dinner share same protein & veg
      </div>
      <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.entries(PROTEIN_COLORS).slice(0, 6).map(([p, c]) => (
          <span key={p} style={{ fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 10 }}>{p}</span>
        ))}
      </div>
      {meals.map((day, i) => (
        <MealDayCard key={i} day={day} expanded={expanded === i} onToggle={() => setExpanded(expanded === i ? null : i)} C={C} />
      ))}
      <button style={{ ...S.btn(false), marginTop: 4 }} onClick={regenerate} disabled={loading}>
        {loading ? "⏳ Generating with AI…" : "✨ Regenerate meal plan with AI →"}
      </button>
    </div>
  );
}

// ─── AI COACH PAGE ────────────────────────────────────────────────────────────
function AICoachPage({ C }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hi! I'm your Vitalize AI coach 💪\n\nI know your full profile — Diastasis Recti recovery, lower back, knee & shoulder pain, and your goals to lose fat, build functional strength, and eat cleaner. I'll never suggest anything that could worsen your DR.\n\nWhat can I help you with today?`
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text) {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const next = [...messages, { role: "user", content: msg }];
    setMessages(next); setInput(""); setLoading(true);
    const reply = await callClaude(next.map(m => ({ role: m.role, content: m.content })), COACH_SYSTEM, 800);
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  const suggestions = [
    "My lower back hurts today — modify my workout",
    "What should I eat for a healthy gut?",
    "How do I know when I'm ready for Phase 2?",
    "Give me a DR-safe core exercise I can do now",
    "I feel tired — should I still work out?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 84px)", background: C.bg }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column" }}>
        {messages.map((m, i) => (
          <div key={i} style={S.bubble(m.role === "user")}>{m.content}</div>
        ))}
        {loading && <div style={{ ...S.bubble(false), color: C.textMuted, fontStyle: "italic" }}>Thinking…</div>}
        <div ref={bottomRef} />
      </div>
      {messages.length <= 2 && (
        <div style={{ padding: "0 20px 10px", display: "flex", flexWrap: "wrap", gap: 7 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => send(s)}
              style={{ padding: "7px 13px", background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 20, fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{s}</button>
          ))}
        </div>
      )}
      <div style={{ padding: "10px 20px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, background: C.nav }}>
        <input
          style={{ flex: 1, padding: "11px 14px", background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, outline: "none", fontFamily: "'Nunito',sans-serif", color: C.text }}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask your AI coach…" />
        <button onClick={() => send()}
          style={{ padding: "11px 18px", background: C.accent, color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 12px ${C.accentMid}60` }}>↑</button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("today");
  const [steps, setSteps] = useState(4200);
  const [water, setWater] = useState(3);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [showNotif, setShowNotif] = useState(false);
  const [dark, setDark] = useState(false);

  // Sync theme whenever dark changes
  C = dark ? THEMES.dark : THEMES.light;
  S = makeS(C);

  useEffect(() => {
    function checkTime() {
      const now = new Date();
      if (now.getHours() === 17 && now.getMinutes() === 0) setShowNotif(true);
    }
    checkTime();
    const iv = setInterval(checkTime, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const now = new Date();
    try {
      const dismissed = sessionStorage.getItem(`notif_shown_${now.toDateString()}`);
      if (now.getHours() >= 17 && !dismissed) setShowNotif(true);
    } catch {}
  }, []);

  function dismissNotif() {
    try { sessionStorage.setItem(`notif_shown_${new Date().toDateString()}`, "1"); } catch {}
    setShowNotif(false);
  }

  const nav = [
    { id: "today",    icon: "🏠", label: "Today"    },
    { id: "playlist", icon: "🎬", label: "Playlist"  },
    { id: "workout",  icon: "💪", label: "Workout"   },
    { id: "meals",    icon: "🥗", label: "Meals"     },
    { id: "coach",    icon: "🤖", label: "Coach"     },
  ];

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* 5pm top banner */}
      {showNotif && tab !== "playlist" && (
        <div style={{ background: C.accent, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 18 }}>🔔</div>
          <div style={{ flex: 1, fontSize: 13, color: "#fff", fontFamily: "'Nunito',sans-serif", fontWeight: 600 }}>
            5 PM — your workout playlist is ready!
          </div>
          <button onClick={() => setTab("playlist")}
            style={{ background: "#fff", color: C.accent, border: "none", borderRadius: 10, padding: "4px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito',sans-serif", marginRight: 6 }}>
            Open
          </button>
          <button onClick={dismissNotif} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>
          vita<span style={{ color: C.accent }}>lize</span>
          <span style={{ fontSize: 13, marginLeft: 6, color: C.textMuted }}>🌸</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, background: PHASES[currentPhase-1].bg, color: PHASES[currentPhase-1].color, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
            {PHASES[currentPhase-1].icon} Phase {currentPhase}
          </span>
          {/* Dark mode toggle */}
          <button onClick={() => setDark(d => !d)}
            style={{ width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${C.border}`, background: C.bgAlt, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.accentLight, border: `1.5px solid ${C.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: C.accentDark, fontFamily: "'Nunito',sans-serif" }}>A</div>
        </div>
      </div>

      {tab === "today"    && <TodayPage steps={steps} setSteps={setSteps} water={water} setWater={setWater} currentPhase={currentPhase} onGoToPlaylist={() => setTab("playlist")} C={C} />}
      {tab === "playlist" && <PlaylistPage showNotif={showNotif} onDismissNotif={dismissNotif} C={C} />}
      {tab === "workout"  && <WorkoutPage currentPhase={currentPhase} setCurrentPhase={setCurrentPhase} C={C} />}
      {tab === "meals"    && <MealsPage C={C} />}
      {tab === "coach"    && <AICoachPage C={C} />}

      {/* Bottom nav */}
      <div style={S.bottomNav}>
        {nav.map(n => (
          <button key={n.id} style={S.navItem(tab === n.id)} onClick={() => setTab(n.id)}>
            <div style={{ fontSize: 19, color: tab === n.id ? C.accent : C.textMuted, marginBottom: 2, position: "relative" }}>
              {n.icon}
              {n.id === "playlist" && showNotif && (
                <span style={{ position: "absolute", top: -2, right: -4, width: 8, height: 8, background: C.rose, borderRadius: "50%", display: "block" }} />
              )}
            </div>
            <div style={{ fontSize: 10, color: tab === n.id ? C.accent : C.textMuted, fontWeight: tab === n.id ? 800 : 500, fontFamily: "'Nunito',sans-serif" }}>{n.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

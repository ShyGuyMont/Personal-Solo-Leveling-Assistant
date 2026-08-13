"use strict";

// A.R.C. Character Archives
// UI, state, preview, chart, and file handling live here.
// World data and the editable form schema live in catalogs.js.

const DEFAULT_STATS = {
  hand_to_hand: 0,
  strength: 0,
  speed: 0,
  durability: 0,
  reflexes: 0,
  nature_energy: 0,
  proficiency: 0,
  arts_potency: 0,
  battle_prowess: 0,
  intelligence: 0,
};

const STAT_MAX = 1000;
const STORY_CLASS_KEYS = new Set(["starting_class", "ending_class"]);

const STAT_CLASSES = Object.freeze([
  {
    name: "D",
    label: "Foundational",
    min: 0,
    max: 49,
    plotMin: 0,
    plotMax: 8,
    description:
      "Regular to trained battle capability; reliable in introductory or street-level conflict.",
  },
  {
    name: "C",
    label: "Enhanced",
    min: 50,
    max: 124,
    plotMin: 12,
    plotMax: 22,
    description:
      "Clearly beyond ordinary fighters; handles sustained urban or localized threats.",
  },
  {
    name: "B",
    label: "Elite",
    min: 125,
    max: 249,
    plotMin: 28,
    plotMax: 40,
    description:
      "A high-tier specialist who can dominate major battlefields and decide regional conflicts.",
  },
  {
    name: "A",
    label: "Apex",
    min: 250,
    max: 499,
    plotMin: 48,
    plotMax: 62,
    description:
      "An extremely rare strategic force whose presence can decide national or continental conflicts.",
  },
  {
    name: "S",
    label: "Planetary",
    min: 500,
    max: 899,
    plotMin: 74,
    plotMax: 82,
    description:
      "Legendary power with the potential to threaten, reshape, or defend an entire planet.",
  },
  {
    name: "World",
    label: "Transcendent",
    min: 900,
    max: 1000,
    plotMin: 100,
    plotMax: 100,
    description:
      "Beyond planetary measurement; 1000 is where the archive stops measuring, while the true upper limit remains unknown.",
  },
]);

const LEGACY_STAT_CLASSES = Object.freeze([
  { name: "D", min: 0, max: 39 },
  { name: "C", min: 40, max: 79 },
  { name: "B", min: 80, max: 119 },
  { name: "A", min: 120, max: 159 },
  { name: "S", min: 160, max: 194 },
  { name: "World", min: 195, max: 200 },
]);

const OVERALL_CLASS_REQUIREMENTS = Object.freeze({
  C: "At least 5 effective C-Class stats and a 70+ effective average.",
  B: "At least 5 effective B-Class-or-higher stats and a 165+ effective average.",
  A: "At least 6 effective A-Class-or-higher stats and a 350+ effective average.",
  S: "At least 7 effective S-Class-or-higher stats, a 650+ effective average, and no more than one stat below B-Class.",
  World:
    "Reach Complete Transcendence (all 10 effective stats at 900+, 975+ average, and every base stat at 500+) or Domain Transcendence (every unboosted stat in Body, Mind, or Soul at 900+, 7 effective S-Class-or-higher stats, 650+ average, and no more than two stats below B-Class).",
});

const CLASS_COLORS = Object.freeze({
  D: "#69716d",
  C: "#2d7d73",
  B: "#336da3",
  A: "#7550a0",
  S: "#b46a19",
  World: "#a6282d",
});

const POWER_DOMAINS = Object.freeze([
  {
    key: "body",
    label: "Body",
    gracedKey: "graced_body",
    stats: [
      "hand_to_hand",
      "strength",
      "speed",
      "durability",
      "reflexes",
    ],
  },
  {
    key: "mind",
    label: "Mind",
    gracedKey: "graced_mind",
    stats: ["battle_prowess", "intelligence", "proficiency"],
  },
  {
    key: "soul",
    label: "Soul",
    gracedKey: "graced_soul",
    stats: ["nature_energy", "arts_potency"],
  },
]);

const SECTION_DESCRIPTIONS = [
  "Start with the details that establish their identity, appearance, and place in the story.",
  "Map the bonds, loyalties, rivals, and institutions that pull on their choices.",
  "Define the inner tension: what they want, what they need, and what could break them.",
  "Shape how they fight, how their power expresses itself, and where their gifts are concentrated.",
  "Choose the optional starting-to-ending story arc, then rate ten core capabilities from 0–1000. The archive separates base ability from Graced potential and weighs dominant strengths, critical weaknesses, and transcendent domains to determine overall class.",
];

const FIELD_HELP = {
  ethnicity_other: "Shown when “Other” is selected above.",
  personality_traits: "Choose as many as fit. Additional nuance can go in the notes field.",
  brigade_sector: "Optional. Only used for Brigade characters.",
  arts: "Search by name or effect. Hover for a quick summary, tap the info button on phones, or open Details for the full Codex entry.",
  fighting_philosophy: "Select every approach that regularly shapes their decisions in combat.",
  graced_body: "Boosts hand-to-hand, strength, speed, durability, and reflexes.",
  graced_mind: "Boosts battle prowess, intelligence, and proficiency.",
  graced_soul: "Boosts nature energy and arts potency.",
  starting_class:
    "The character's story rank at the beginning. The Stats section separately calculates their capability profile.",
  ending_class:
    "The character's intended story rank at the end. The Stats section separately calculates their capability profile.",
};

const STAT_INFO = Object.freeze({
  hand_to_hand: {
    grace: "Graced Body",
    description:
      "Technical close-combat skill: striking, grappling, counters, and unarmed discipline.",
  },
  strength: {
    grace: "Graced Body",
    description:
      "Raw physical force, lifting power, impact, and the ability to overpower resistance.",
  },
  speed: {
    grace: "Graced Body",
    description:
      "Movement speed, acceleration, agility, and the ability to reposition through a battlefield.",
  },
  durability: {
    grace: "Graced Body",
    description:
      "How much physical punishment the character can withstand before their body fails.",
  },
  reflexes: {
    grace: "Graced Body",
    description:
      "Reaction speed, defensive response, and the ability to answer sudden danger in time.",
  },
  nature_energy: {
    grace: "Graced Soul",
    description:
      "The size and depth of the character's available Nature Energy reserves.",
  },
  proficiency: {
    grace: "Graced Mind",
    description:
      "Control, efficiency, precision, and technical command when shaping Nature Energy.",
  },
  arts_potency: {
    grace: "Graced Soul",
    description:
      "The force, intensity, and realized potential of the character's Arts when expressed.",
  },
  battle_prowess: {
    grace: "Graced Mind",
    description:
      "Combat judgment, timing, adaptability, and the ability to turn capability into victory.",
  },
  intelligence: {
    grace: "Graced Mind",
    description:
      "Reasoning, planning, learning, and tactical problem-solving beyond immediate instinct.",
  },
});

const WIDE_FIELD_TYPES = new Set([
  "textarea",
  "multiselect",
  "multiselect_arts",
  "checkbox_philosophy",
]);

const ALL_ARTS = Object.entries(ARTS_DB.styles || {}).flatMap(
  ([style, styleRecord]) =>
    Object.entries(styleRecord.tiers || {}).flatMap(([tier, arts]) =>
      arts.map((art) => ({ name: art.name, style, tier })),
    ),
);

const elements = {
  app: document.getElementById("app"),
  archiveCode: document.getElementById("archiveCode"),
  artDetailBadges: document.getElementById("artDetailBadges"),
  artDetailContent: document.getElementById("artDetailContent"),
  artDetailDialog: document.getElementById("artDetailDialog"),
  artDetailSelectionNote: document.getElementById("artDetailSelectionNote"),
  artDetailTitle: document.getElementById("artDetailTitle"),
  artsCodex: document.getElementById("artsCodex"),
  artsCodexButton: document.getElementById("artsCodexBtn"),
  clearCodexSearchButton: document.getElementById("clearCodexSearchBtn"),
  closeArtDetailButton: document.getElementById("closeArtDetailBtn"),
  closeArtsCodexButton: document.getElementById("closeArtsCodexBtn"),
  codexEmpty: document.getElementById("codexEmpty"),
  codexResults: document.getElementById("codexResults"),
  codexResultsCount: document.getElementById("codexResultsCount"),
  codexResultsTitle: document.getElementById("codexResultsTitle"),
  codexSearchInput: document.getElementById("codexSearchInput"),
  codexStyleFilters: document.getElementById("codexStyleFilters"),
  codexStyleGuide: document.getElementById("codexStyleGuide"),
  codexTierFilters: document.getElementById("codexTierFilters"),
  completionBar: document.getElementById("completionBar"),
  completionTrack: document.getElementById("completionTrack"),
  completionValue: document.getElementById("completionValue"),
  formRoot: document.getElementById("formRoot"),
  jsonFile: document.getElementById("jsonFile"),
  mobileViewSwitcher: document.querySelector(".mobile-view-switcher"),
  nextButton: document.getElementById("nextSectionBtn"),
  previousButton: document.getElementById("previousSectionBtn"),
  previewRoot: document.getElementById("previewRoot"),
  printButton: document.getElementById("printBtn"),
  saveButton: document.getElementById("saveJsonBtn"),
  sectionCount: document.getElementById("sectionCount"),
  sectionDescription: document.getElementById("sectionDescription"),
  sectionEyebrow: document.getElementById("sectionEyebrow"),
  sectionNav: document.getElementById("sectionNav"),
  sectionTitle: document.getElementById("sectionTitle"),
  statusText: document.getElementById("statusText"),
  toast: document.getElementById("toast"),
  toggleArtSelectionButton: document.getElementById("toggleArtSelectionBtn"),
  topbar: document.querySelector(".topbar"),
  workspace: document.getElementById("workspace"),
};

let activeSectionIndex = 0;
let character = normalizeCharacter({});
let toastTimer;
let resizeTimer;
let activeArtDetailName = "";
let codexReturnFocus = null;
let detailReturnFocus = null;
const codexFilters = {
  search: "",
  style: "All",
  tier: "All",
};

function normalizeCharacter(data, sourceVersion = 0) {
  const next = data && typeof data === "object" ? { ...data } : {};
  const incomingStats =
    data?.stats && typeof data.stats === "object" ? data.stats : {};
  const incomingValues = Object.values(incomingStats);
  const savedVersion = Number(sourceVersion) || 0;
  const shouldMigrateLegacyStats =
    incomingValues.length > 0 &&
    ((savedVersion > 0 && savedVersion < 4) ||
      (savedVersion === 0 &&
        incomingValues.every((value) => Number(value) <= 200)));

  next.stats = Object.fromEntries(
    Object.keys(DEFAULT_STATS).map((key) => [
      key,
      shouldMigrateLegacyStats
        ? migrateLegacyStat(incomingStats[key] ?? DEFAULT_STATS[key])
        : clampNumber(incomingStats[key] ?? DEFAULT_STATS[key], 0, STAT_MAX),
    ]),
  );

  next.starting_class =
    LEGACY_CLASS_ALIASES[next.starting_class] || next.starting_class;
  next.ending_class =
    LEGACY_CLASS_ALIASES[next.ending_class] || next.ending_class;

  ["arts", "fighting_philosophy", "personality_traits"].forEach((key) => {
    if (!Array.isArray(next[key])) next[key] = [];
  });

  next.arts = [...new Set(next.arts.map(migrateArtSelection).filter(Boolean))];

  return next;
}

function migrateArtSelection(value) {
  const selection = String(value ?? "").trim();
  if (!selection) return "";

  const separatorIndex = selection.indexOf(": ");
  if (separatorIndex === -1) {
    return ART_NAME_ALIASES[selection] || selection;
  }

  const tier = selection.slice(0, separatorIndex);
  const artName = selection.slice(separatorIndex + 2);
  const canonicalName = ART_NAME_ALIASES[artName] || artName;
  return `${tier}: ${canonicalName}`;
}

function initializeDefaults() {
  SCHEMA.flatMap((section) => section.fields).forEach((field) => {
    if (field.type === "select" && character[field.key] === undefined) {
      character[field.key] = field.options?.[0] ?? "";
    }

    if (field.type === "select_graced" && character[field.key] === undefined) {
      character[field.key] = 0;
    }
  });

  if (!character.style) character.style = getStyleNames()[0] ?? "";
  if (!character.origin_country) character.origin_country = getCountries()[0] ?? "";
  if (!character.origin_region) {
    character.origin_region = getRegions(character.origin_country)[0] ?? "";
  }
  if (!character.origin_city) {
    character.origin_city =
      getCities(character.origin_country, character.origin_region)[0] ?? "";
  }
  if (!character.faction) character.faction = getFactionNames()[0] ?? "";
  if (character.faction === "Brigade" && !character.brigade_rank) {
    character.brigade_rank = getBrigadeRanks()[0] ?? "";
  }
}

function getStyleNames() {
  return Object.keys(ARTS_DB.styles || {});
}

function getCountries() {
  return Object.keys(LOCATIONS_DB);
}

function getRegions(country) {
  return Object.keys(LOCATIONS_DB[country] || {});
}

function getCities(country, region) {
  return LOCATIONS_DB[country]?.[region] || [];
}

function getFactionNames() {
  return Object.keys(FACTIONS_DB);
}

function getBrigadeRanks() {
  return FACTIONS_DB.Brigade?.ranks || [];
}

function getBrigadeSectors() {
  return FACTIONS_DB.Brigade?.sectors || [];
}

function getStyleColor(styleName) {
  return ARTS_DB.styles?.[styleName]?.meta?.color || "#7c3aed";
}

function setStyleAccent() {
  document.documentElement.style.setProperty(
    "--style-accent",
    getStyleColor(character.style),
  );
}

function getGracedMultiplierForStat(statKey) {
  const groups = {
    body: new Set([
      "hand_to_hand",
      "strength",
      "speed",
      "durability",
      "reflexes",
    ]),
    mind: new Set(["battle_prowess", "intelligence", "proficiency"]),
    soul: new Set(["nature_energy", "arts_potency"]),
  };

  if (groups.body.has(statKey)) return 1 + Number(character.graced_body || 0);
  if (groups.mind.has(statKey)) return 1 + Number(character.graced_mind || 0);
  if (groups.soul.has(statKey)) return 1 + Number(character.graced_soul || 0);
  return 1;
}

function getProjectedStat(statKey) {
  const base = clampNumber(character.stats?.[statKey], 0, STAT_MAX);
  return Math.max(0, Math.round(base * getGracedMultiplierForStat(statKey)));
}

function getEffectiveStat(statKey) {
  return clampNumber(getProjectedStat(statKey), 0, STAT_MAX);
}

function getStatOverflow(statKey) {
  return Math.max(0, getProjectedStat(statKey) - STAT_MAX);
}

function clampNumber(value, minimum, maximum) {
  const number = Number(value);
  if (Number.isNaN(number)) return minimum;
  return Math.min(maximum, Math.max(minimum, number));
}

function migrateLegacyStat(value) {
  const legacyRating = clampNumber(value, 0, 200);
  const legacyClass =
    LEGACY_STAT_CLASSES.find(
      (classInfo) => legacyRating <= classInfo.max,
    ) || LEGACY_STAT_CLASSES[LEGACY_STAT_CLASSES.length - 1];
  const newClass =
    STAT_CLASSES.find((classInfo) => classInfo.name === legacyClass.name) ||
    STAT_CLASSES[0];
  const legacySpan = Math.max(1, legacyClass.max - legacyClass.min);
  const progress = (legacyRating - legacyClass.min) / legacySpan;

  return Math.round(
    newClass.min + progress * (newClass.max - newClass.min),
  );
}

function formatClassName(className) {
  return className === "World" ? "World Class" : `${className}-Class`;
}

function getStatClass(value) {
  const rating = clampNumber(value, 0, STAT_MAX);
  return (
    STAT_CLASSES.find((classInfo) => rating <= classInfo.max) ||
    STAT_CLASSES[STAT_CLASSES.length - 1]
  );
}

function getRadarValue(value) {
  const rating = clampNumber(value, 0, STAT_MAX);
  const classInfo = getStatClass(rating);

  if (classInfo.plotMin === classInfo.plotMax) return classInfo.plotMax;

  const classSpan = Math.max(1, classInfo.max - classInfo.min);
  const classProgress = (rating - classInfo.min) / classSpan;
  return (
    classInfo.plotMin +
    classProgress * (classInfo.plotMax - classInfo.plotMin)
  );
}

function getStatFields() {
  return SCHEMA[SCHEMA.length - 1].fields.filter(
    (field) => field.type === "stat",
  );
}

function getOverallQualification(values, baseValues = values) {
  const ratings = values.map((value) => clampNumber(value, 0, STAT_MAX));
  const baseRatings = baseValues.map((value) =>
    clampNumber(value, 0, STAT_MAX),
  );
  if (!ratings.length) {
    return {
      className: "D",
      average: 0,
      minimum: 0,
      baseMinimum: 0,
      counts: { c: 0, b: 0, a: 0, s: 0, world: 0 },
      criticalWeaknessCount: 0,
      worldPath: null,
      dominantDomain: null,
    };
  }

  const average =
    ratings.reduce((total, value) => total + value, 0) / ratings.length;
  const minimum = Math.min(...ratings);
  const baseMinimum = baseRatings.length ? Math.min(...baseRatings) : 0;
  const countAt = (minimumValue) =>
    ratings.filter((value) => value >= minimumValue).length;
  const counts = {
    c: countAt(50),
    b: countAt(125),
    a: countAt(250),
    s: countAt(500),
    world: countAt(900),
  };
  const criticalWeaknessCount = ratings.filter((value) => value < 125).length;
  const baseByStat = Object.fromEntries(
    getStatFields().map((field, index) => [field.key, baseRatings[index] || 0]),
  );
  const dominantDomain =
    POWER_DOMAINS.find((domain) =>
      domain.stats.every((key) => baseByStat[key] >= 900),
    ) || null;
  const completeWorld =
    minimum >= 900 && average >= 975 && baseMinimum >= 500;
  const domainWorld = Boolean(
    dominantDomain &&
      average >= 650 &&
      counts.s >= 7 &&
      criticalWeaknessCount <= 2,
  );

  let className = "D";
  let worldPath = null;
  if (completeWorld) {
    className = "World";
    worldPath = "complete";
  } else if (domainWorld) {
    className = "World";
    worldPath = "domain";
  } else if (
    average >= 650 &&
    counts.s >= 7 &&
    criticalWeaknessCount <= 1
  ) {
    className = "S";
  } else if (average >= 350 && counts.a >= 6) {
    className = "A";
  } else if (average >= 165 && counts.b >= 5) {
    className = "B";
  } else if (average >= 70 && counts.c >= 5) {
    className = "C";
  }

  return {
    className,
    average: Math.round(average),
    minimum,
    baseMinimum,
    counts,
    criticalWeaknessCount,
    worldPath,
    dominantDomain,
  };
}

function classifyOverallValues(values, baseValues = values) {
  return getOverallQualification(values, baseValues).className;
}

function describeOverallQualification(qualification) {
  if (qualification.worldPath === "complete") {
    return "Complete Transcendence: every measured capability is World-Class, backed by an already S-Class natural foundation.";
  }
  if (qualification.worldPath === "domain") {
    return `${qualification.dominantDomain.label} Transcendence: that entire unboosted domain is naturally World-Class, with enough S-Class support to remain a World-level threat despite concentrated weaknesses.`;
  }

  const requirementCount = {
    S: qualification.counts.s,
    A: qualification.counts.a,
    B: qualification.counts.b,
    C: qualification.counts.c,
  }[qualification.className];
  const weaknessText = qualification.criticalWeaknessCount
    ? ` ${qualification.criticalWeaknessCount} critical weakness${qualification.criticalWeaknessCount === 1 ? "" : "es"} remain visible without erasing the dominant profile.`
    : " No critical weaknesses were detected.";

  if (qualification.className === "D") {
    return `The profile does not yet meet the C-Class dominance requirements.${weaknessText}`;
  }
  return `${requirementCount} of 10 stats meet or exceed the dominant ${qualification.className}-Class threshold.${weaknessText}`;
}

function getOverallClassReport() {
  const baseValues = getStatFields().map((field) =>
    clampNumber(character.stats?.[field.key], 0, STAT_MAX),
  );
  const effectiveValues = getStatFields().map((field) =>
    getEffectiveStat(field.key),
  );
  const projectedValues = getStatFields().map((field) =>
    getProjectedStat(field.key),
  );
  const qualification = getOverallQualification(effectiveValues, baseValues);
  const className = qualification.className;
  const classInfo =
    STAT_CLASSES.find((candidate) => candidate.name === className) ||
    STAT_CLASSES[0];
  const classIndex = STAT_CLASSES.indexOf(classInfo);
  const nextInfo = STAT_CLASSES[classIndex + 1] || null;
  const criticalWeaknesses = getStatFields()
    .map((field, index) => ({ field, value: effectiveValues[index] }))
    .filter((entry) => entry.value < 125);

  return {
    average: qualification.average,
    baseAverage: baseValues.length
      ? Math.round(
          baseValues.reduce((total, value) => total + value, 0) /
            baseValues.length,
        )
      : 0,
    classInfo,
    minimum: qualification.minimum,
    qualification,
    qualificationDescription: describeOverallQualification(qualification),
    displayLabel:
      qualification.worldPath === "domain"
        ? `${qualification.dominantDomain.label} Transcendence`
        : classInfo.label,
    criticalWeaknesses,
    overflowCount: projectedValues.filter((value) => value > STAT_MAX).length,
    overflowTotal: projectedValues.reduce(
      (total, value) => total + Math.max(0, value - STAT_MAX),
      0,
    ),
    projectedAverage: averageRatings(projectedValues),
    nextInfo,
    nextRequirement: nextInfo
      ? OVERALL_CLASS_REQUIREMENTS[nextInfo.name]
      : qualification.worldPath === "domain"
        ? `World-Class confirmed through ${qualification.dominantDomain.label} Transcendence. Weaknesses remain real, but the dominant domain alone carries World-level threat potential; its true upper limit is unknown.`
        : "World-Class confirmed through Complete Transcendence. All ten measured stats qualify at the transcendent level, and their true upper limits remain unknown.",
  };
}

function averageRatings(values) {
  return values.length
    ? Math.round(values.reduce((total, value) => total + value, 0) / values.length)
    : 0;
}

function getPowerDomainReports() {
  return POWER_DOMAINS.map((domain) => {
    const baseValues = domain.stats.map((key) =>
      clampNumber(character.stats?.[key], 0, STAT_MAX),
    );
    const effectiveValues = domain.stats.map((key) => getEffectiveStat(key));
    const projectedValues = domain.stats.map((key) => getProjectedStat(key));
    const baseAverage = averageRatings(baseValues);
    const effectiveAverage = averageRatings(effectiveValues);
    const projectedAverage = averageRatings(projectedValues);
    const classInfo = getStatClass(effectiveAverage);

    return {
      ...domain,
      baseAverage,
      effectiveAverage,
      projectedAverage,
      overflowCount: projectedValues.filter((value) => value > STAT_MAX).length,
      overflowTotal: projectedValues.reduce(
        (total, value) => total + Math.max(0, value - STAT_MAX),
        0,
      ),
      classInfo,
      boostPercent: Math.round(Number(character[domain.gracedKey] || 0) * 100),
      visualPercent: getRadarValue(effectiveAverage),
    };
  });
}

function getStatHighlights() {
  const entries = getStatFields().map((field) => ({
    field,
    measured: getEffectiveStat(field.key),
    value: getProjectedStat(field.key),
  }));
  const hasRatings = entries.some((entry) => entry.value > 0);
  if (!hasRatings) return null;

  const ordered = [...entries].sort((left, right) => right.value - left.value);
  return {
    strongest: ordered[0],
    development: ordered[ordered.length - 1],
  };
}

function stripSectionPrefix(title) {
  return title.replace(/^Section\s+\d+:\s*/i, "");
}

function makeId(value) {
  return `field-${String(value).replace(/[^a-z0-9_-]/gi, "-")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 2600);
}

function getArtRecord(artName) {
  return ALL_ARTS.find((art) => art.name === artName) || null;
}

function getArtStoredValue(art) {
  return art ? `${art.tier}: ${art.name}` : "";
}

function getArtSearchText(art) {
  const details = ART_DETAILS?.[art.name];
  const sections = details?.sections || [];
  return [
    art.name,
    art.style,
    art.tier,
    ART_DESCRIPTIONS?.[art.name],
    details?.summary,
    ...(details?.tags || []),
    ...sections.flatMap((section) => [
      section.title,
      ...(section.body || []),
      ...(section.bullets || []),
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isArtSelected(art) {
  return Boolean(art && character.arts.includes(getArtStoredValue(art)));
}

function syncOverlayState() {
  const codexIsOpen = !elements.artsCodex.hidden;
  const detailIsOpen = elements.artDetailDialog.open;
  document.body.classList.toggle("has-open-overlay", codexIsOpen || detailIsOpen);
}

function initializeArtsCodex() {
  createCodexFilterButtons(
    elements.codexStyleFilters,
    ["All", ...Object.keys(ARTS_DB.styles || {})],
    "style",
  );
  createCodexFilterButtons(
    elements.codexTierFilters,
    ["All", "Tier 2", "Tier 3", "Forbidden"],
    "tier",
  );
  renderArtsCodex();
}

function createCodexFilterButtons(container, options, filterKey) {
  container.replaceChildren();
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.dataset.codexFilter = filterKey;
    button.dataset.codexValue = option;
    button.setAttribute("aria-pressed", String(codexFilters[filterKey] === option));
    button.addEventListener("click", () => {
      codexFilters[filterKey] = option;
      updateCodexFilterButtons();
      renderArtsCodex();
    });
    container.appendChild(button);
  });
}

function updateCodexFilterButtons() {
  document.querySelectorAll("[data-codex-filter]").forEach((button) => {
    const filterKey = button.dataset.codexFilter;
    button.setAttribute(
      "aria-pressed",
      String(codexFilters[filterKey] === button.dataset.codexValue),
    );
  });
}

function openArtsCodex({ style = "All", returnFocus = null } = {}) {
  codexReturnFocus = returnFocus || document.activeElement;
  codexFilters.style = style;
  updateCodexFilterButtons();
  renderArtsCodex();
  elements.artsCodex.hidden = false;
  elements.topbar.inert = true;
  elements.workspace.inert = true;
  elements.mobileViewSwitcher.inert = true;
  syncOverlayState();
  window.requestAnimationFrame(() => elements.codexSearchInput.focus());
}

function closeArtsCodex() {
  if (elements.artDetailDialog.open) {
    elements.artDetailDialog.close();
  }
  elements.artsCodex.hidden = true;
  elements.topbar.inert = false;
  elements.workspace.inert = false;
  elements.mobileViewSwitcher.inert = false;
  syncOverlayState();
  if (codexReturnFocus instanceof HTMLElement && codexReturnFocus.isConnected) {
    codexReturnFocus.focus();
  }
  codexReturnFocus = null;
}

function trapCodexFocus(event) {
  if (event.key !== "Tab" || elements.artDetailDialog.open) return;
  const focusable = [...elements.artsCodex.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  )].filter((item) => !item.hidden && item.offsetParent !== null);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function renderArtsCodex() {
  const query = codexFilters.search.trim().toLowerCase();
  const matches = ALL_ARTS.filter((art) => {
    const styleMatches = codexFilters.style === "All" || art.style === codexFilters.style;
    const tierMatches = codexFilters.tier === "All" || art.tier === codexFilters.tier;
    const searchMatches = !query || getArtSearchText(art).includes(query);
    return styleMatches && tierMatches && searchMatches;
  });

  renderCodexStyleGuide();
  elements.codexResults.replaceChildren();

  Object.keys(ARTS_DB.styles || {}).forEach((style) => {
    const styleMatches = matches.filter((art) => art.style === style);
    if (!styleMatches.length) return;

    const group = document.createElement("section");
    group.className = "codex-style-section";
    group.style.setProperty("--codex-accent", getStyleColor(style));

    const heading = document.createElement("div");
    heading.className = "codex-style-heading";
    const title = document.createElement("h4");
    title.textContent = `${style} Style`;
    const count = document.createElement("span");
    count.textContent = `${styleMatches.length} ${styleMatches.length === 1 ? "record" : "records"}`;
    heading.append(title, count);

    const grid = document.createElement("div");
    grid.className = "codex-card-grid";
    styleMatches.forEach((art) => grid.appendChild(createCodexCard(art)));
    group.append(heading, grid);
    elements.codexResults.appendChild(group);
  });

  const titleParts = [];
  if (codexFilters.style !== "All") titleParts.push(codexFilters.style);
  if (codexFilters.tier !== "All") titleParts.push(codexFilters.tier);
  elements.codexResultsTitle.textContent = titleParts.length
    ? titleParts.join(" · ")
    : "All Arts";
  elements.codexResultsCount.textContent = `${matches.length} of ${ALL_ARTS.length}`;
  elements.codexEmpty.hidden = matches.length !== 0;
  elements.clearCodexSearchButton.hidden = !query;
}

function renderCodexStyleGuide() {
  const style = codexFilters.style;
  elements.codexStyleGuide.replaceChildren();

  const eyebrow = document.createElement("span");
  eyebrow.className = "eyebrow";
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const mastery = document.createElement("p");
  mastery.className = "codex-style-mastery";

  if (style === "All") {
    eyebrow.textContent = "The five disciplines";
    title.textContent = "Power stays legible because every Art commits to one Style.";
    description.textContent =
      "Search every record at once, or choose a Style to read its philosophy and narrow the archive. Details include mechanics, combat use, broader applications, limitations, and mastery notes.";
    mastery.textContent =
      "Tier 2 establishes reliable specialized techniques. Tier 3 demands greater control and consequence management. Forbidden Arts carry disaster-scale failure conditions.";
    elements.codexStyleGuide.style.removeProperty("--codex-accent");
  } else {
    const guide = ART_STYLE_GUIDES?.[style];
    eyebrow.textContent = `${style} doctrine · ${guide?.motto || "Style archive"}`;
    title.textContent = `${style} Style`;
    description.textContent = guide?.overview || "";
    mastery.textContent = guide?.mastery || "";
    elements.codexStyleGuide.style.setProperty("--codex-accent", getStyleColor(style));
  }

  elements.codexStyleGuide.append(eyebrow, title, description, mastery);
}

function createCodexCard(art) {
  const card = document.createElement("article");
  card.className = "codex-card";
  card.style.setProperty("--codex-accent", getStyleColor(art.style));

  const meta = document.createElement("div");
  meta.className = "codex-card-meta";
  const tier = document.createElement("span");
  tier.className = art.tier === "Forbidden" ? "is-forbidden" : "";
  tier.textContent = art.tier;
  const selection = document.createElement("span");
  selection.className = "codex-selection-state";
  selection.textContent = isArtSelected(art) ? "Selected" : art.style;
  selection.classList.toggle("is-selected", isArtSelected(art));
  meta.append(tier, selection);

  const title = document.createElement("h5");
  title.textContent = art.name;
  const summary = document.createElement("p");
  summary.textContent = ART_DESCRIPTIONS?.[art.name] || "";

  const tags = document.createElement("div");
  tags.className = "codex-tags";
  (ART_DETAILS?.[art.name]?.tags || []).forEach((tag) => {
    const item = document.createElement("span");
    item.textContent = tag;
    tags.appendChild(item);
  });

  const detailsButton = document.createElement("button");
  detailsButton.type = "button";
  detailsButton.className = "codex-card-button";
  detailsButton.textContent = "Read full breakdown";
  detailsButton.addEventListener("click", () => openArtDetail(art.name, detailsButton));

  card.append(meta, title, summary, tags, detailsButton);
  return card;
}

function openArtDetail(artName, returnFocus = null) {
  const art = getArtRecord(artName);
  const details = ART_DETAILS?.[artName];
  if (!art || !details) {
    showToast("That Arts record is not available yet.");
    return;
  }

  activeArtDetailName = artName;
  detailReturnFocus = returnFocus || document.activeElement;
  renderArtDetail(art, details);
  if (!elements.artDetailDialog.open) {
    elements.artDetailDialog.showModal();
  }
  syncOverlayState();
  window.requestAnimationFrame(() => elements.closeArtDetailButton.focus());
}

function renderArtDetail(art, details) {
  elements.artDetailTitle.textContent = art.name;
  elements.artDetailBadges.replaceChildren();

  [art.style, art.tier].forEach((value) => {
    const badge = document.createElement("span");
    badge.textContent = value;
    badge.classList.toggle("is-forbidden", value === "Forbidden");
    badge.style.setProperty("--detail-accent", getStyleColor(art.style));
    elements.artDetailBadges.appendChild(badge);
  });

  elements.artDetailContent.replaceChildren();
  elements.artDetailContent.style.setProperty("--detail-accent", getStyleColor(art.style));

  const lead = document.createElement("p");
  lead.className = "art-detail-lead";
  lead.textContent = details.summary || ART_DESCRIPTIONS?.[art.name] || "";
  elements.artDetailContent.appendChild(lead);

  if (art.tier === "Forbidden") {
    const warning = document.createElement("aside");
    warning.className = "art-detail-warning";
    const warningLabel = document.createElement("strong");
    warningLabel.textContent = "Forbidden classification";
    const warningCopy = document.createElement("p");
    warningCopy.textContent =
      "This Art has a catastrophic failure condition. Its classification reflects uncontrollable consequence, not merely higher damage.";
    warning.append(warningLabel, warningCopy);
    elements.artDetailContent.appendChild(warning);
  }

  const sectionGrid = document.createElement("div");
  sectionGrid.className = "art-detail-sections";
  (details.sections || []).forEach((section) => {
    const panel = document.createElement("section");
    const heading = document.createElement("h3");
    heading.textContent = section.title;
    panel.appendChild(heading);

    (section.body || []).forEach((paragraphText) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = paragraphText;
      panel.appendChild(paragraph);
    });

    if (section.bullets?.length) {
      const list = document.createElement("ul");
      section.bullets.forEach((bulletText) => {
        const item = document.createElement("li");
        item.textContent = bulletText;
        list.appendChild(item);
      });
      panel.appendChild(list);
    }
    sectionGrid.appendChild(panel);
  });

  const source = document.createElement("p");
  source.className = "art-detail-source";
  source.textContent = `Archive record: ${details.source}.`;
  elements.artDetailContent.append(sectionGrid, source);
  updateArtDetailSelectionState();
}

function updateArtDetailSelectionState() {
  const art = getArtRecord(activeArtDetailName);
  if (!art) return;

  const styleMatches = character.style === art.style;
  const selected = isArtSelected(art);
  elements.toggleArtSelectionButton.disabled = !styleMatches;
  elements.toggleArtSelectionButton.classList.toggle("button-danger", selected);
  elements.toggleArtSelectionButton.textContent = selected
    ? "Remove from character"
    : "Add to character";

  if (!styleMatches) {
    elements.artDetailSelectionNote.textContent =
      `This is a ${art.style} Art. Choose ${art.style} as the character's Style before adding it.`;
  } else if (selected) {
    elements.artDetailSelectionNote.textContent =
      "This Art is currently included in the character profile.";
  } else {
    elements.artDetailSelectionNote.textContent =
      `This character uses ${art.style}, so the Art can be added directly.`;
  }
}

function toggleActiveArtSelection() {
  const art = getArtRecord(activeArtDetailName);
  if (!art || character.style !== art.style) return;

  const storedValue = getArtStoredValue(art);
  const selected = character.arts.includes(storedValue);
  character.arts = selected
    ? character.arts.filter((value) => value !== storedValue)
    : [...character.arts, storedValue];
  refreshAfterChange({ rerenderForm: true });
  renderArtsCodex();
  updateArtDetailSelectionState();
  showToast(selected ? `${art.name} removed.` : `${art.name} added to the character.`);
}

function setDocumentStatus(message, saved = false) {
  elements.statusText.textContent = message;
  elements.statusText.parentElement.classList.toggle("is-saved", saved);
}

function markChanged() {
  setDocumentStatus("Changes ready to save");
}

function shouldRenderField(field) {
  if (field.key === "ethnicity_other") {
    return character.ethnicity === "Other (write-in)";
  }

  if (field.key === "brigade_rank" || field.key === "brigade_sector") {
    return character.faction === "Brigade";
  }

  return true;
}

function getFieldValue(field) {
  if (field.type === "stat") return Number(character.stats?.[field.key] || 0);
  return character[field.key];
}

function isFieldComplete(field) {
  const value = getFieldValue(field);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value > 0;
  return Boolean(String(value ?? "").trim());
}

function updateProgress() {
  let totalFields = 0;
  let completedFields = 0;

  SCHEMA.forEach((section, index) => {
    const visibleFields = section.fields.filter(shouldRenderField);
    const completed = visibleFields.filter(isFieldComplete).length;
    totalFields += visibleFields.length;
    completedFields += completed;

    const progressNode = elements.sectionNav.querySelector(
      `[data-section-index="${index}"] .nav-progress`,
    );
    if (progressNode) progressNode.textContent = `${completed}/${visibleFields.length}`;
  });

  const percentage = totalFields
    ? Math.round((completedFields / totalFields) * 100)
    : 0;

  elements.completionValue.textContent = `${percentage}%`;
  elements.completionBar.style.width = `${percentage}%`;
  elements.completionTrack.setAttribute("aria-valuenow", String(percentage));
}

function getArchiveCompletion() {
  const fields = SCHEMA.flatMap((section) => section.fields).filter(shouldRenderField);
  if (!fields.length) return 0;
  return Math.round((fields.filter(isFieldComplete).length / fields.length) * 100);
}

function createArchivePayload() {
  const report = getOverallClassReport();
  return {
    version: 4,
    schema: "ARC_Profile_Template",
    savedAt: new Date().toISOString(),
    meta: {
      completion: getArchiveCompletion(),
      overallClass: report.classInfo.name,
      overallClassLabel: report.displayLabel,
    },
    data: character,
  };
}

function postToSystem(type, payload) {
  if (window.parent === window) return;
  window.parent.postMessage({ source: "arc-character-archives", type, payload }, window.location.origin);
}

function renderSectionNav() {
  elements.sectionNav.replaceChildren();

  SCHEMA.forEach((section, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.sectionIndex = String(index);
    button.classList.toggle("is-active", index === activeSectionIndex);
    button.setAttribute(
      "aria-current",
      index === activeSectionIndex ? "step" : "false",
    );

    const number = document.createElement("span");
    number.className = "nav-index";
    number.textContent = String(index + 1).padStart(2, "0");

    const label = document.createElement("span");
    label.textContent = stripSectionPrefix(section.title);

    const progress = document.createElement("span");
    progress.className = "nav-progress";

    button.append(number, label, progress);
    button.addEventListener("click", () => setActiveSection(index));
    elements.sectionNav.appendChild(button);
  });
}

function setActiveSection(index) {
  activeSectionIndex = clampNumber(index, 0, SCHEMA.length - 1);
  renderSectionNav();
  renderActiveSection();
  updateProgress();

  if (window.innerWidth <= 760) {
    document.querySelector(".builder-panel")?.scrollIntoView({ block: "start" });
  }
}

function renderActiveSection() {
  const section = SCHEMA[activeSectionIndex];
  const sectionNumber = String(activeSectionIndex + 1).padStart(2, "0");

  elements.sectionEyebrow.textContent = `File section ${sectionNumber}`;
  elements.sectionTitle.textContent = stripSectionPrefix(section.title);
  elements.sectionDescription.textContent =
    SECTION_DESCRIPTIONS[activeSectionIndex] || "";
  elements.sectionCount.textContent = `${sectionNumber} / ${String(SCHEMA.length).padStart(2, "0")}`;
  elements.previousButton.disabled = activeSectionIndex === 0;
  elements.nextButton.disabled = activeSectionIndex === SCHEMA.length - 1;

  const grid = document.createElement("div");
  grid.className = "field-grid";
  const visibleFields = section.fields.filter(shouldRenderField);
  const isStatsSection = activeSectionIndex === SCHEMA.length - 1;
  const gridFields = isStatsSection
    ? visibleFields.filter((field) => !STORY_CLASS_KEYS.has(field.key))
    : visibleFields;

  gridFields.forEach((field) => {
    grid.appendChild(renderField(field));
  });

  const contents = isStatsSection
    ? [
        createStoryClassPanel(
          visibleFields.filter((field) => STORY_CLASS_KEYS.has(field.key)),
        ),
        createOverallClassPanel(),
        grid,
      ]
    : [grid];
  elements.formRoot.replaceChildren(...contents);
}

function createStoryClassPanel(fields) {
  const panel = document.createElement("section");
  panel.className = "story-class-controls";
  panel.setAttribute("aria-labelledby", "storyClassControlsTitle");
  panel.innerHTML = `
    <div class="story-class-controls-heading">
      <div>
        <span>Optional narrative forecast</span>
        <strong id="storyClassControlsTitle">Story Class Progression</strong>
      </div>
      <small>Controls the Start → End growth arc shown in the dossier. It never changes the calculated capability class.</small>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "story-class-controls-grid";
  fields.forEach((field) => grid.appendChild(renderField(field)));
  panel.appendChild(grid);
  return panel;
}

function renderField(field) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";
  if (WIDE_FIELD_TYPES.has(field.type)) wrapper.classList.add("field-wide");
  if (field.type === "stat") wrapper.classList.add("is-stat-field");

  const label = document.createElement("label");
  label.className = "field-label";
  label.textContent = field.label;

  if (FIELD_HELP[field.key]) {
    const help = document.createElement("small");
    help.className = "field-help";
    help.textContent = FIELD_HELP[field.key];
    label.appendChild(help);
  }

  const control = createFieldControl(field);
  const directInput = control.matches("input, textarea, select")
    ? control
    : control.querySelector("input, textarea, select");

  if (directInput) {
    directInput.id = makeId(field.key);
    label.htmlFor = directInput.id;
  } else {
    const labelId = `${makeId(field.key)}-label`;
    label.id = labelId;
    control.setAttribute("aria-labelledby", labelId);
  }

  if (field.type === "stat" && STAT_INFO[field.key]) {
    const info = STAT_INFO[field.key];
    const heading = document.createElement("div");
    heading.className = "stat-field-heading";

    const infoButton = document.createElement("button");
    infoButton.className = "stat-info-button";
    infoButton.type = "button";
    infoButton.textContent = "i";
    infoButton.setAttribute("aria-label", `Explain ${field.label}`);
    infoButton.setAttribute("aria-expanded", "false");

    const infoPanel = document.createElement("aside");
    const infoId = `${makeId(field.key)}-info`;
    const graceKey = info.grace.replace(/^Graced\s+/i, "").toLowerCase();
    infoPanel.id = infoId;
    infoPanel.className = "stat-info-popover";
    infoPanel.setAttribute("role", "tooltip");
    infoPanel.innerHTML = `
      <span class="stat-grace-tag" data-grace="${escapeHtml(graceKey)}">${escapeHtml(info.grace)}</span>
      <strong>${escapeHtml(field.label)}</strong>
      <p>${escapeHtml(info.description)}</p>
      <small>${escapeHtml(info.grace)} raises this stat's effective rating and can affect its individual and overall class.</small>
    `;
    infoButton.setAttribute("aria-controls", infoId);
    infoButton.setAttribute("aria-describedby", infoId);

    infoButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldOpen = !wrapper.classList.contains("is-stat-info-open");
      closeStatInfoPopovers(wrapper);
      wrapper.classList.toggle("is-stat-info-open", shouldOpen);
      infoButton.setAttribute("aria-expanded", String(shouldOpen));
    });

    heading.append(label, infoButton, infoPanel);
    wrapper.append(heading, control);
  } else {
    wrapper.append(label, control);
  }
  return wrapper;
}

function closeStatInfoPopovers(except = null) {
  document.querySelectorAll(".field.is-stat-info-open").forEach((field) => {
    if (field === except) return;
    field.classList.remove("is-stat-info-open");
    field.querySelector(".stat-info-button")?.setAttribute("aria-expanded", "false");
  });
}

function createFieldControl(field) {
  switch (field.type) {
    case "textarea":
      return createTextArea(field);
    case "select_style":
      return createStyleSelect(field);
    case "multiselect_arts":
      return createArtsPicker(field);
    case "select":
      return createSelect(field, field.options || []);
    case "stat":
      return createStatControl(field);
    case "select_country":
      return createCountrySelect(field);
    case "select_region":
      return createRegionSelect(field);
    case "select_city":
      return createCitySelect(field);
    case "select_faction":
      return createFactionSelect(field);
    case "select_brigade_rank":
      return createSelect(field, getBrigadeRanks());
    case "select_brigade_sector_optional":
      return createSelect(field, getBrigadeSectors(), "— None —");
    case "select_graced":
      return createGracedSelect(field);
    case "checkbox_philosophy":
      return createCheckGrid(
        field,
        FIGHTING_PHILOSOPHY_OPTIONS,
        FIGHTING_PHILOSOPHY_DB,
      );
    case "multiselect":
      return createCheckGrid(field, field.options || []);
    default:
      return createTextInput(field);
  }
}

function createTextInput(field) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = character[field.key] ?? "";
  input.placeholder = getPlaceholder(field);
  input.addEventListener("input", () => {
    character[field.key] = input.value;
    refreshAfterChange();
  });
  return input;
}

function createTextArea(field) {
  const textarea = document.createElement("textarea");
  textarea.value = character[field.key] ?? "";
  textarea.placeholder = getPlaceholder(field);
  textarea.addEventListener("input", () => {
    character[field.key] = textarea.value;
    refreshAfterChange();
  });
  return textarea;
}

function getPlaceholder(field) {
  const placeholders = {
    name: "Full character name",
    alias: "Alias, title, or codename",
    age: "Age or apparent age",
    role: "Their function in the story",
    era: "Era, continuity, or timeline",
    hair: "Color, texture, and style",
    eyes: "Color or distinctive details",
    build: "Frame, posture, and physical impression",
    weapon: "Primary weapon or equipment",
  };
  return placeholders[field.key] || "Add archive notes…";
}

function createSelect(field, options, emptyLabel = "") {
  const select = document.createElement("select");

  if (emptyLabel) {
    select.appendChild(createOption("", emptyLabel));
  }
  options.forEach((option) => select.appendChild(createOption(option, option)));

  if (character[field.key] === undefined) {
    character[field.key] = emptyLabel ? "" : options[0] ?? "";
  }
  select.value = String(character[field.key] ?? "");
  select.addEventListener("change", () => {
    character[field.key] = select.value;
    refreshAfterChange({ rerenderForm: field.key === "ethnicity" });
  });

  return wrapSelect(select);
}

function createStyleSelect(field) {
  const select = document.createElement("select");
  getStyleNames().forEach((style) => select.appendChild(createOption(style, style)));
  select.value = character.style;
  select.addEventListener("change", () => {
    character.style = select.value;
    character.arts = [];
    setStyleAccent();
    refreshAfterChange({ rerenderForm: true, redrawChart: true });
  });
  return wrapSelect(select);
}

function createCountrySelect(field) {
  const select = document.createElement("select");
  getCountries().forEach((country) =>
    select.appendChild(createOption(country, country)),
  );
  select.value = character.origin_country;
  select.addEventListener("change", () => {
    character.origin_country = select.value;
    character.origin_region = getRegions(select.value)[0] ?? "";
    character.origin_city =
      getCities(character.origin_country, character.origin_region)[0] ?? "";
    refreshAfterChange({ rerenderForm: true });
  });
  return wrapSelect(select);
}

function createRegionSelect(field) {
  const select = document.createElement("select");
  getRegions(character.origin_country).forEach((region) =>
    select.appendChild(createOption(region, region)),
  );
  select.value = character.origin_region;
  select.addEventListener("change", () => {
    character.origin_region = select.value;
    character.origin_city =
      getCities(character.origin_country, character.origin_region)[0] ?? "";
    refreshAfterChange({ rerenderForm: true });
  });
  return wrapSelect(select);
}

function createCitySelect(field) {
  const select = document.createElement("select");
  getCities(character.origin_country, character.origin_region).forEach((city) =>
    select.appendChild(createOption(city, city)),
  );
  select.value = character.origin_city;
  select.addEventListener("change", () => {
    character.origin_city = select.value;
    refreshAfterChange();
  });
  return wrapSelect(select);
}

function createFactionSelect(field) {
  const select = document.createElement("select");
  getFactionNames().forEach((faction) =>
    select.appendChild(createOption(faction, faction)),
  );
  select.value = character.faction;
  select.addEventListener("change", () => {
    character.faction = select.value;
    if (character.faction === "Brigade") {
      character.brigade_rank ||= getBrigadeRanks()[0] ?? "";
    } else {
      character.brigade_rank = "";
      character.brigade_sector = "";
    }
    refreshAfterChange({ rerenderForm: true });
  });
  return wrapSelect(select);
}

function createGracedSelect(field) {
  const options = [
    ["0", "None (0%)"],
    ["0.25", "25%"],
    ["0.5", "50%"],
    ["0.75", "75%"],
    ["1", "100%"],
  ];
  const select = document.createElement("select");
  options.forEach(([value, label]) =>
    select.appendChild(createOption(value, label)),
  );
  select.value = String(character[field.key] ?? 0);
  select.addEventListener("change", () => {
    character[field.key] = Number(select.value);
    refreshAfterChange({ redrawChart: true });
  });
  return wrapSelect(select);
}

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function wrapSelect(select) {
  const wrapper = document.createElement("div");
  wrapper.className = "select-wrap";
  wrapper.appendChild(select);
  return wrapper;
}

function createCheckGrid(field, options, descriptions = {}) {
  const group = document.createElement("div");
  group.className = "option-grid";
  group.setAttribute("role", "group");

  if (!Array.isArray(character[field.key])) character[field.key] = [];

  options.forEach((option) => {
    const card = document.createElement("label");
    card.className = "check-card";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = option;
    checkbox.checked = character[field.key].includes(option);
    checkbox.addEventListener("change", () => {
      character[field.key] = checkbox.checked
        ? [...character[field.key], option]
        : character[field.key].filter((value) => value !== option);
      refreshAfterChange();
    });

    const copy = document.createElement("span");
    copy.textContent = option;
    if (descriptions[option]) {
      const description = document.createElement("small");
      description.textContent = descriptions[option];
      copy.appendChild(description);
    }

    card.append(checkbox, copy);
    group.appendChild(card);
  });

  return group;
}

function createArtsPicker(field) {
  const container = document.createElement("div");
  container.className = "arts-groups";
  container.setAttribute("role", "group");
  if (!Array.isArray(character.arts)) character.arts = [];
  let descriptionIndex = 0;

  const toolbar = document.createElement("div");
  toolbar.className = "arts-toolbar";

  const searchWrap = document.createElement("div");
  searchWrap.className = "arts-search";

  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.autocomplete = "off";
  searchInput.spellcheck = false;
  searchInput.placeholder = "Search Arts or effects…";
  searchInput.setAttribute("aria-label", "Search Arts by name or description");

  const clearSearch = document.createElement("button");
  clearSearch.type = "button";
  clearSearch.className = "arts-search-clear";
  clearSearch.textContent = "Clear";
  clearSearch.setAttribute("aria-label", "Clear Arts search");
  clearSearch.hidden = true;

  const resultsStatus = document.createElement("span");
  resultsStatus.className = "arts-results-status";
  resultsStatus.setAttribute("aria-live", "polite");
  resultsStatus.setAttribute("aria-atomic", "true");

  const codexButton = document.createElement("button");
  codexButton.type = "button";
  codexButton.className = "arts-codex-shortcut";
  codexButton.textContent = "Open full Arts Codex";
  codexButton.addEventListener("click", () =>
    openArtsCodex({ style: character.style, returnFocus: codexButton }),
  );

  searchWrap.append(searchInput, clearSearch);
  toolbar.append(searchWrap, resultsStatus, codexButton);
  container.appendChild(toolbar);

  const cards = [];
  const groupRecords = [];
  const tiers = ARTS_DB.styles?.[character.style]?.tiers || {};
  Object.entries(tiers).forEach(([tierName, arts]) => {
    const group = document.createElement("div");
    group.className = "arts-group";

    const heading = document.createElement("h4");
    heading.textContent = tierName;
    group.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "option-grid";

    arts.forEach((art) => {
      const storedValue = `${tierName}: ${art.name}`;
      const card = document.createElement("div");
      card.className = "art-card";

      const choice = document.createElement("label");
      choice.className = "check-card art-choice";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = storedValue;
      checkbox.checked = character.arts.includes(storedValue);
      checkbox.addEventListener("change", () => {
        character.arts = checkbox.checked
          ? [...character.arts, storedValue]
          : character.arts.filter((value) => value !== storedValue);
        updateArtsResults();
        refreshAfterChange();
      });

      const copy = document.createElement("span");
      copy.textContent = art.name;
      choice.append(checkbox, copy);
      card.appendChild(choice);

      const description = ART_DESCRIPTIONS?.[art.name] || "";
      const artRecord = { name: art.name, style: character.style, tier: tierName };
      card.dataset.searchText = getArtSearchText(artRecord);
      cards.push(card);

      const cardActions = document.createElement("div");
      cardActions.className = "art-card-actions";

      if (description) {
        const descriptionId = `art-description-${descriptionIndex}`;
        descriptionIndex += 1;

        const infoButton = document.createElement("button");
        infoButton.type = "button";
        infoButton.className = "art-info-button";
        infoButton.textContent = "i";
        infoButton.setAttribute("aria-label", `Quick description for ${art.name}`);
        infoButton.setAttribute("aria-controls", descriptionId);
        infoButton.setAttribute("aria-expanded", "false");

        const descriptionPanel = document.createElement("div");
        descriptionPanel.className = "art-description";
        descriptionPanel.id = descriptionId;
        descriptionPanel.setAttribute("role", "tooltip");
        descriptionPanel.textContent = description;
        checkbox.setAttribute("aria-describedby", descriptionId);

        infoButton.addEventListener("click", () => {
          const shouldOpen = !card.classList.contains("is-description-open");

          container.querySelectorAll(".art-card.is-description-open").forEach((openCard) => {
            openCard.classList.remove("is-description-open");
            openCard.querySelector(".art-info-button")?.setAttribute("aria-expanded", "false");
          });

          card.classList.toggle("is-description-open", shouldOpen);
          infoButton.setAttribute("aria-expanded", String(shouldOpen));
        });

        infoButton.addEventListener("keydown", (event) => {
          if (event.key !== "Escape") return;
          card.classList.remove("is-description-open");
          infoButton.setAttribute("aria-expanded", "false");
          infoButton.focus();
        });

        cardActions.appendChild(infoButton);
        card.appendChild(descriptionPanel);
      }

      const detailButton = document.createElement("button");
      detailButton.type = "button";
      detailButton.className = "art-detail-button";
      detailButton.textContent = "Details";
      detailButton.setAttribute("aria-label", `Open full details for ${art.name}`);
      detailButton.addEventListener("click", () => openArtDetail(art.name, detailButton));
      cardActions.appendChild(detailButton);
      card.insertBefore(cardActions, card.querySelector(".art-description"));

      grid.appendChild(card);
    });

    group.appendChild(grid);
    container.appendChild(group);
    groupRecords.push({ group, cards: [...grid.children] });
  });

  const emptyMessage = document.createElement("p");
  emptyMessage.className = "arts-empty";
  emptyMessage.textContent = "No Arts match that search.";
  emptyMessage.hidden = true;
  container.appendChild(emptyMessage);

  function updateArtsResults() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const matches = !query || card.dataset.searchText.includes(query);
      card.hidden = !matches;

      if (matches) {
        visibleCount += 1;
      } else {
        card.classList.remove("is-description-open");
        card
          .querySelector(".art-info-button")
          ?.setAttribute("aria-expanded", "false");
      }
    });

    groupRecords.forEach(({ group, cards: groupCards }) => {
      group.hidden = groupCards.every((card) => card.hidden);
    });

    const selectedCount = character.arts.length;
    resultsStatus.textContent = query
      ? `${visibleCount} of ${cards.length} shown · ${selectedCount} selected`
      : `${cards.length} Arts · ${selectedCount} selected`;
    clearSearch.hidden = !query;
    emptyMessage.hidden = visibleCount !== 0;
  }

  searchInput.addEventListener("input", updateArtsResults);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !searchInput.value) return;
    searchInput.value = "";
    updateArtsResults();
  });

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    updateArtsResults();
    searchInput.focus();
  });

  updateArtsResults();
  return container;
}

function createOverallClassPanel() {
  const panel = document.createElement("section");
  panel.id = "overallClassSummary";
  panel.className = "overall-class-panel";
  panel.setAttribute("aria-live", "polite");

  const scale = STAT_CLASSES.map(
    (classInfo) => `
      <div class="class-scale-item" data-class-level="${classInfo.name.toLowerCase()}">
        <strong>${escapeHtml(formatClassName(classInfo.name))}</strong>
        <span>${escapeHtml(classInfo.label)}</span>
        <small>${classInfo.min}–${classInfo.max}</small>
      </div>
    `,
  ).join("");

  panel.innerHTML = `
    <div class="overall-class-heading">
      <div>
        <span class="overall-class-kicker">Calculated capability profile</span>
        <div class="overall-class-title">
          <strong id="overallClassName"></strong>
          <span class="class-badge" id="overallClassBadge"></span>
        </div>
      </div>
      <div class="overall-class-metrics">
        <span>Base average <strong id="overallClassBaseAverage"></strong></span>
        <span>Effective average <strong id="overallClassAverage"></strong></span>
        <span>Graced index <strong id="overallClassProjected"></strong></span>
        <span>Lowest effective <strong id="overallClassMinimum"></strong></span>
      </div>
    </div>
    <p class="overall-class-description" id="overallClassDescription"></p>
    <p class="overall-class-next" id="overallClassNext"></p>
    <section class="power-intelligence" aria-label="Body, Mind, and Soul power summary">
      <div class="power-intelligence-heading">
        <div>
          <span class="overall-class-kicker">Power signature</span>
          <strong>Body · Mind · Soul</strong>
        </div>
        <small>Effective domain averages after Graced boosts</small>
      </div>
      <div class="power-domain-grid" id="powerDomainSummary"></div>
      <div class="stat-insight" id="statInsightSummary"></div>
    </section>
    <div class="class-scale" aria-label="Stat class ranges">${scale}</div>
    <small class="class-scale-note">
      The chart is class-scaled: the larger gaps before S and World are intentional.
      Stat badges and the overall profile use effective ratings after Graced boosts;
      Domain Transcendence additionally requires one complete unboosted domain at World level.
      Effective ratings stop at the archive's 1000-point measurement boundary.
      Beyond-scale readings compare continued Graced growth; they never define a maximum.
      World-Class upper limits remain unknown.
    </small>
  `;

  updateOverallClassPanel(panel);
  return panel;
}

function updateOverallClassPanel(
  panel = document.getElementById("overallClassSummary"),
) {
  if (!panel) return;

  const report = getOverallClassReport();
  const level = report.classInfo.name.toLowerCase();
  const name = panel.querySelector("#overallClassName");
  const badge = panel.querySelector("#overallClassBadge");
  const baseAverage = panel.querySelector("#overallClassBaseAverage");
  const average = panel.querySelector("#overallClassAverage");
  const projected = panel.querySelector("#overallClassProjected");
  const minimum = panel.querySelector("#overallClassMinimum");
  const description = panel.querySelector("#overallClassDescription");
  const next = panel.querySelector("#overallClassNext");
  const powerDomainSummary = panel.querySelector("#powerDomainSummary");
  const statInsightSummary = panel.querySelector("#statInsightSummary");

  panel.dataset.classLevel = level;
  name.textContent = report.displayLabel;
  badge.dataset.classLevel = level;
  badge.textContent = formatClassName(report.classInfo.name);
  baseAverage.textContent = `${report.baseAverage} / ${STAT_MAX}`;
  average.textContent = `${report.average} / ${STAT_MAX}`;
  projected.textContent = report.overflowCount
    ? `≥ ${report.projectedAverage} · open-ended`
    : String(report.projectedAverage);
  minimum.textContent = `${report.minimum} / ${STAT_MAX}`;
  description.textContent = `${report.classInfo.description} ${report.qualificationDescription}`;
  next.innerHTML = report.nextInfo
    ? `<strong>Next: ${escapeHtml(formatClassName(report.nextInfo.name))}</strong> — ${escapeHtml(report.nextRequirement)}`
    : `<strong>${escapeHtml(report.nextRequirement)}</strong>`;

  if (powerDomainSummary) {
    powerDomainSummary.innerHTML = getPowerDomainReports()
      .map(
        (domain) => `
          <article class="power-domain-card" data-class-level="${domain.classInfo.name.toLowerCase()}">
            <div class="power-domain-label">
              <strong>${escapeHtml(domain.label)}</strong>
              <span class="class-badge" data-class-level="${domain.classInfo.name.toLowerCase()}">${escapeHtml(formatClassName(domain.classInfo.name))}</span>
            </div>
            <div class="power-domain-score">${domain.effectiveAverage}<small> / ${STAT_MAX}</small></div>
            <div class="power-domain-meter" aria-hidden="true">
              <span style="--domain-fill: ${domain.visualPercent}%"></span>
            </div>
            <small>Base ${domain.baseAverage}${domain.boostPercent ? ` · Graced +${domain.boostPercent}%` : " · No Graced boost"}</small>
            ${domain.overflowTotal ? `<strong class="power-domain-overflow">Over-scale index ≥ ${domain.projectedAverage} · ${domain.overflowTotal} indexed past scale · upper limit unknown</strong>` : ""}
          </article>
        `,
      )
      .join("");
  }

  if (statInsightSummary) {
    const highlights = getStatHighlights();
    const developmentClass = highlights
      ? getStatClass(highlights.development.measured)
      : null;
    const developmentLabel =
      highlights && highlights.development.measured < 125
        ? "Critical weakness"
        : "Development edge";
    statInsightSummary.innerHTML = highlights
      ? `
          <span><small>Signature strength</small><strong>${escapeHtml(highlights.strongest.field.label)} · ${highlights.strongest.value > STAT_MAX ? `Index ≥ ${highlights.strongest.value} · limit unknown` : highlights.strongest.value}</strong></span>
          <span><small>${developmentLabel}</small><strong>${escapeHtml(highlights.development.field.label)} · ${highlights.development.measured} (${escapeHtml(formatClassName(developmentClass.name))})</strong></span>
        `
      : `<span><small>Profile insight</small><strong>Set the stats to reveal this character's signature and weakest edge.</strong></span>`;
  }
}

function createStatControl(field) {
  const wrapper = document.createElement("div");
  wrapper.className = "stat-control";

  const range = document.createElement("input");
  range.type = "range";
  range.min = "0";
  range.max = String(STAT_MAX);
  range.step = "1";
  range.value = String(
    clampNumber(character.stats[field.key], 0, STAT_MAX),
  );
  range.setAttribute("aria-label", `${field.label} rating`);

  const rangeShell = document.createElement("div");
  rangeShell.className = "stat-range-shell";

  const track = document.createElement("span");
  track.className = "stat-track";
  track.setAttribute("aria-hidden", "true");

  const effectiveMarker = document.createElement("span");
  effectiveMarker.className = "stat-effective-marker";
  effectiveMarker.setAttribute("aria-hidden", "true");

  const thresholds = document.createElement("span");
  thresholds.className = "stat-thresholds";
  thresholds.setAttribute("aria-hidden", "true");
  thresholds.innerHTML = STAT_CLASSES.map((classInfo) => {
    const midpoint = ((classInfo.min + classInfo.max) / 2 / STAT_MAX) * 100;
    const label = classInfo.name === "World" ? "W" : classInfo.name;
    return `<i data-class-level="${classInfo.name.toLowerCase()}" style="left:${midpoint}%">${label}</i>`;
  }).join("");

  rangeShell.append(track, effectiveMarker, range, thresholds);

  const number = document.createElement("input");
  number.type = "number";
  number.min = "0";
  number.max = String(STAT_MAX);
  number.step = "1";
  number.value = range.value;
  number.setAttribute("aria-label", `${field.label} numerical value`);

  const stepper = document.createElement("div");
  stepper.className = "stat-stepper";

  const decrease = document.createElement("button");
  decrease.type = "button";
  decrease.textContent = "−";
  decrease.setAttribute("aria-label", `Decrease ${field.label} by 10`);

  const increase = document.createElement("button");
  increase.type = "button";
  increase.textContent = "+";
  increase.setAttribute("aria-label", `Increase ${field.label} by 10`);

  stepper.append(decrease, number, increase);

  const classBadge = document.createElement("span");
  classBadge.className = "class-badge stat-class-badge";

  const effective = document.createElement("span");
  effective.className = "stat-effective";

  const updateReadout = (baseValue) => {
    const base = clampNumber(baseValue, 0, STAT_MAX);
    const effectiveValue = getEffectiveStat(field.key);
    const projectedValue = getProjectedStat(field.key);
    const overflow = getStatOverflow(field.key);
    const baseClass = getStatClass(base);
    const effectiveClass = getStatClass(effectiveValue);
    const basePercent = (base / STAT_MAX) * 100;
    const effectivePercent = (effectiveValue / STAT_MAX) * 100;

    classBadge.dataset.classLevel = effectiveClass.name.toLowerCase();
    classBadge.textContent = formatClassName(effectiveClass.name);
    classBadge.title = `${effectiveClass.label}: ${effectiveClass.description}`;

    effective.innerHTML = overflow
      ? `Base ${base} (${escapeHtml(formatClassName(baseClass.name))}) → Measured <strong>${effectiveValue}</strong> / ${STAT_MAX} (${escapeHtml(formatClassName(effectiveClass.name))}) <span class="stat-overflow-readout">Over-scale index <strong>≥ ${projectedValue}</strong> · ${overflow} indexed past archive scale <em>True upper limit unknown</em></span>`
      : projectedValue === base
        ? `Rating <strong>${base}</strong> / ${STAT_MAX} · ${escapeHtml(baseClass.label)}`
        : `Base ${base} (${escapeHtml(formatClassName(baseClass.name))}) → Effective <strong>${effectiveValue}</strong> / ${STAT_MAX} (${escapeHtml(formatClassName(effectiveClass.name))})`;

    rangeShell.style.setProperty("--stat-progress", `${basePercent}%`);
    rangeShell.style.setProperty("--effective-progress", `${effectivePercent}%`);
    rangeShell.style.setProperty(
      "--current-class-color",
      CLASS_COLORS[effectiveClass.name],
    );
    rangeShell.classList.toggle("is-boosted", projectedValue !== base);
    rangeShell.classList.toggle("has-overflow", overflow > 0);
  };

  const sync = (value) => {
    const next = clampNumber(value, 0, STAT_MAX);
    character.stats[field.key] = next;
    range.value = String(next);
    number.value = String(next);
    updateReadout(next);
    updateOverallClassPanel();
    refreshAfterChange({ redrawChart: true });
  };

  range.addEventListener("input", () => sync(range.value));
  number.addEventListener("input", () => sync(number.value));
  decrease.addEventListener("click", () => sync(Number(number.value) - 10));
  increase.addEventListener("click", () => sync(Number(number.value) + 10));
  updateReadout(range.value);

  wrapper.append(rangeShell, stepper, classBadge, effective);
  return wrapper;
}

function refreshAfterChange({ rerenderForm = false, redrawChart = false } = {}) {
  markChanged();
  if (rerenderForm) renderActiveSection();
  renderPreview();
  updateProgress();
  if (redrawChart) drawRadar();
}

function renderPreview() {
  const name = String(character.name || "").trim() || "Unnamed Character";
  const alias = String(character.alias || "").trim() || "Identity under review";
  const status = String(character.status || "").trim() || "Unknown";
  const role = String(character.role || "").trim() || "Unassigned";
  const age = String(character.age || "").trim() || "—";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const archiveCode = `ARC–${name
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase() || "UNFILED"}`;

  elements.archiveCode.textContent = archiveCode;

  const sections = SCHEMA.map((section, index) => {
    const isStats = index === SCHEMA.length - 1;
    const fields = isStats
      ? renderStatsPreview(section)
      : section.fields.map(renderPreviewField).join("");

    return `
      <section class="archive-section">
        <div class="archive-section-header">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h2>${escapeHtml(stripSectionPrefix(section.title))}</h2>
        </div>
        <div class="archive-fields">${fields}</div>
      </section>
    `;
  }).join("");

  elements.previewRoot.innerHTML = `
    <header class="sheet-masthead">
      <div>
        <span class="archive-kicker">A.R.C. Character Record · ${escapeHtml(archiveCode)}</span>
        <h1>${escapeHtml(name)}</h1>
        <div class="sheet-subtitle">${escapeHtml(alias)}</div>
      </div>
      <div class="seal" aria-hidden="true">${escapeHtml(initials || "A")}</div>
    </header>
    <div class="sheet-meta">
      <div><span>Status</span><strong>${escapeHtml(status)}</strong></div>
      <div><span>Age</span><strong>${escapeHtml(age)}</strong></div>
      <div><span>Story role</span><strong>${escapeHtml(role)}</strong></div>
    </div>
    ${sections}
  `;

  drawRadar();
}

function renderPreviewField(field) {
  if (["ethnicity_other", "origin_region", "origin_city", "height_in"].includes(field.key)) {
    return "";
  }

  if (field.key === "brigade_rank" || field.key === "brigade_sector") {
    return "";
  }

  let label = field.label;
  let value = getFieldValue(field);

  if (field.key === "ethnicity") {
    value =
      value === "Other (write-in)" && character.ethnicity_other
        ? character.ethnicity_other
        : value;
  }

  if (field.key === "origin_country") {
    label = "Birthplace";
    value = [
      character.origin_city,
      character.origin_region,
      character.origin_country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  if (field.key === "height_ft") {
    label = "Height";
    const feet = character.height_ft;
    const inches = character.height_in || "0";
    if (feet) {
      const centimeters = Math.round(
        (Number.parseInt(feet, 10) * 12 + Number.parseInt(inches, 10)) * 2.54,
      );
      value = `${feet}′ ${inches}″ / ${centimeters} cm`;
    } else {
      value = "";
    }
  }

  if (field.key === "faction" && character.faction === "Brigade") {
    label = "Brigade";
    value = [
      character.brigade_rank,
      character.brigade_sector
        ? `${character.brigade_sector} Sector`
        : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (field.key === "combat_role" && value) {
    value = `${value} — ${COMBAT_ROLE_DB[value] || ""}`.trim();
  }

  if (field.type === "select_graced") {
    value = Number(value)
      ? `${Math.round(Number(value) * 100)}% enhancement`
      : "None";
  }

  const isWide =
    WIDE_FIELD_TYPES.has(field.type) ||
    String(value ?? "").length > 90 ||
    Array.isArray(value);

  if (Array.isArray(value)) {
    const items = value.map((item) => {
      const description =
        field.key === "fighting_philosophy"
          ? FIGHTING_PHILOSOPHY_DB[item]
          : "";
      return `<li>${escapeHtml(item)}${description ? ` — ${escapeHtml(description)}` : ""}</li>`;
    });

    return `
      <dl class="archive-field ${isWide ? "is-wide" : ""}">
        <dt>${escapeHtml(label)}</dt>
        <dd class="${items.length ? "" : "is-empty"}">
          ${
            items.length
              ? `<ul class="archive-list">${items.join("")}</ul>`
              : "Not recorded"
          }
        </dd>
      </dl>
    `;
  }

  const text = String(value ?? "").trim();
  return `
    <dl class="archive-field ${isWide ? "is-wide" : ""}">
      <dt>${escapeHtml(label)}</dt>
      <dd class="${text ? "" : "is-empty"}">${text ? escapeHtml(text) : "Not recorded"}</dd>
    </dl>
  `;
}

function renderStatsPreview(section) {
  const overall = getOverallClassReport();
  const overallLevel = overall.classInfo.name.toLowerCase();
  const domains = getPowerDomainReports();
  const rows = section.fields
    .filter((field) => field.type === "stat")
    .map((field) => {
      const base = clampNumber(character.stats[field.key], 0, STAT_MAX);
      const effective = getEffectiveStat(field.key);
      const projected = getProjectedStat(field.key);
      const overflow = getStatOverflow(field.key);
      const classInfo = getStatClass(effective);
      return `
        <div>
          <dt>${escapeHtml(field.label)}</dt>
          <dd>
            <span class="class-badge stat-ledger-class" data-class-level="${classInfo.name.toLowerCase()}">${escapeHtml(formatClassName(classInfo.name))}</span>
            <span class="stat-rating">${base}${effective !== base ? ` → <strong>${effective}</strong>` : ""} / ${STAT_MAX}</span>
            ${overflow ? `<span class="stat-overflow-ledger">Over-scale index ≥ ${projected} · ${overflow} past scale · limit unknown</span>` : ""}
          </dd>
        </div>
      `;
    })
    .join("");
  const domainCards = domains
    .map(
      (domain) => `
        <article class="power-domain-preview" data-class-level="${domain.classInfo.name.toLowerCase()}">
          <div>
            <span>${escapeHtml(domain.label)}</span>
            <strong>${domain.effectiveAverage}</strong>
          </div>
          <span class="class-badge" data-class-level="${domain.classInfo.name.toLowerCase()}">${escapeHtml(formatClassName(domain.classInfo.name))}</span>
          <div class="power-domain-meter" aria-hidden="true"><span style="--domain-fill: ${domain.visualPercent}%"></span></div>
          <small>Base ${domain.baseAverage}${domain.boostPercent ? ` · Graced +${domain.boostPercent}%` : ""}</small>
          ${domain.overflowTotal ? `<strong class="power-domain-overflow">Over-scale index ≥ ${domain.projectedAverage} · ${domain.overflowTotal} past scale · limit unknown</strong>` : ""}
        </article>
      `,
    )
    .join("");

  return `
    <div class="overall-class-preview" data-class-level="${overallLevel}">
      <div>
        <span>Calculated overall class</span>
        <strong>${escapeHtml(overall.displayLabel)}</strong>
      </div>
      <span class="class-badge" data-class-level="${overallLevel}">${escapeHtml(formatClassName(overall.classInfo.name))}</span>
      <p>${escapeHtml(overall.classInfo.description)} ${escapeHtml(overall.qualificationDescription)}</p>
      <small>Base average ${overall.baseAverage} / ${STAT_MAX} · Effective average ${overall.average} / ${STAT_MAX} · ${overall.overflowCount ? `Graced over-scale index ≥ ${overall.projectedAverage} · upper limit unknown · ${overall.overflowCount} stat${overall.overflowCount === 1 ? "" : "s"} beyond scale` : `Graced index ${overall.projectedAverage}`} · ${overall.criticalWeaknesses.length ? `${overall.criticalWeaknesses.length} critical weakness${overall.criticalWeaknesses.length === 1 ? "" : "es"}` : "No critical weaknesses"}</small>
    </div>
    ${renderClassTrajectory()}
    <section class="power-domain-preview-grid" aria-label="Body, Mind, and Soul power summary">
      ${domainCards}
    </section>
    <div class="radar-wrap">
      <div class="radar-heading">
        <div>
          <span>Power signature</span>
          <strong>Class-scaled capability radar</strong>
        </div>
        <div class="radar-legend" aria-label="Chart legend">
          <span><i class="is-base"></i> Base</span>
          <span><i class="is-effective"></i> Effective</span>
          <span><i class="is-overflow"></i> Beyond scale</span>
        </div>
      </div>
      <canvas id="radarCanvas" width="900" height="620" aria-label="Class-scaled radar comparing base, Graced-effective, and beyond-scale character stats"></canvas>
      <p class="radar-caption">Dashed is natural ability. Solid includes Graced boosts. Luminous marks compare continued Graced pressure after the archive stops measuring; their distance is an index, never a ceiling. World-Class upper limits remain unknown.</p>
    </div>
    <div class="stat-ledger-heading">
      <div><span>Capability ledger</span><strong>Individual classifications</strong></div>
      <small>Base → effective when Graced</small>
    </div>
    <dl class="stat-ledger">${rows}</dl>
  `;
}

function renderClassTrajectory() {
  const start = LEGACY_CLASS_ALIASES[character.starting_class] || character.starting_class || "D";
  const end = LEGACY_CLASS_ALIASES[character.ending_class] || character.ending_class || start;
  const classNames = STAT_CLASSES.map((classInfo) => classInfo.name);
  const startIndex = Math.max(0, classNames.indexOf(start));
  const endIndex = Math.max(0, classNames.indexOf(end));
  const low = Math.min(startIndex, endIndex);
  const high = Math.max(startIndex, endIndex);
  const direction =
    endIndex > startIndex
      ? "Ascending trajectory"
      : endIndex < startIndex
        ? "Descending trajectory"
        : "Stable trajectory";

  const steps = STAT_CLASSES.map((classInfo, index) => {
    const states = ["trajectory-step"];
    if (index >= low && index <= high) states.push("is-path");
    if (index === startIndex) states.push("is-start");
    if (index === endIndex) states.push("is-end");
    return `
      <span class="${states.join(" ")}" data-class-level="${classInfo.name.toLowerCase()}">
        <i></i>
        <strong>${escapeHtml(classInfo.name)}</strong>
        ${index === startIndex && index === endIndex ? "<small>Start / End</small>" : index === startIndex ? "<small>Start</small>" : index === endIndex ? "<small>End</small>" : "<small></small>"}
      </span>
    `;
  }).join("");

  return `
    <section class="class-trajectory" aria-label="Story class trajectory from ${escapeHtml(start)} to ${escapeHtml(end)}">
      <div class="class-trajectory-heading">
        <div><span>Story growth arc</span><strong>${escapeHtml(start)} → ${escapeHtml(end)}</strong></div>
        <small>${direction}</small>
      </div>
      <div class="trajectory-track">${steps}</div>
    </section>
  `;
}

function drawRadar() {
  const canvas = document.getElementById("radarCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;
  const radarMax = 100;
  const startAngle = -Math.PI / 2;
  const fields = getStatFields();
  const accent = getStyleColor(character.style);

  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(centerX, centerY);
  context.strokeStyle = "rgba(74, 54, 33, 0.18)";
  context.fillStyle = "rgba(74, 54, 33, 0.72)";
  context.lineWidth = 1;
  context.font = "12px Georgia";

  STAT_CLASSES.forEach((classInfo) => {
    const ringRadius = radius * (classInfo.plotMax / radarMax);
    context.strokeStyle = hexToRgba(CLASS_COLORS[classInfo.name], 0.34);
    drawPolygon(context, fields.length, ringRadius, startAngle);
    context.stroke();
    context.fillStyle = hexToRgba(CLASS_COLORS[classInfo.name], 0.82);
    context.fillText(
      classInfo.name === "World" ? "World · 900+" : classInfo.name,
      6,
      -ringRadius - 4,
    );
  });

  fields.forEach((field, index) => {
    const angle = startAngle + (index * 2 * Math.PI) / fields.length;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(x, y);
    context.strokeStyle = "rgba(74, 54, 33, 0.16)";
    context.stroke();

    const labelX = Math.cos(angle) * (radius + 48);
    const labelY = Math.sin(angle) * (radius + 48);
    context.textAlign =
      Math.cos(angle) > 0.2 ? "left" : Math.cos(angle) < -0.2 ? "right" : "center";
    context.textBaseline =
      Math.sin(angle) > 0.2 ? "top" : Math.sin(angle) < -0.2 ? "bottom" : "middle";
    context.fillText(shortStatLabel(field.label), labelX, labelY);
  });

  const makePoints = (valueForField) => fields.map((field, index) => {
    const angle = startAngle + (index * 2 * Math.PI) / fields.length;
    const value = getRadarValue(valueForField(field));
    const pointRadius = radius * (value / radarMax);
    return {
      x: Math.cos(angle) * pointRadius,
      y: Math.sin(angle) * pointRadius,
    };
  });

  const basePoints = makePoints((field) =>
    clampNumber(character.stats?.[field.key], 0, STAT_MAX),
  );
  const effectivePoints = makePoints((field) => getEffectiveStat(field.key));

  drawRadarProfile(context, basePoints, {
    fill: "rgba(47, 40, 30, 0.035)",
    stroke: "rgba(47, 40, 30, 0.52)",
    lineWidth: 2,
    dash: [8, 6],
  });

  drawRadarProfile(context, effectivePoints, {
    fill: hexToRgba(accent, 0.2),
    stroke: accent,
    lineWidth: 3,
  });

  context.fillStyle = accent;
  effectivePoints.forEach((point) => {
    context.beginPath();
    context.arc(point.x, point.y, 4, 0, Math.PI * 2);
    context.fill();
  });

  drawRadarOverflow(context, fields, radius, startAngle, accent);

  context.beginPath();
  context.arc(0, 0, 3, 0, Math.PI * 2);
  context.fill();

  context.restore();
}

function drawRadarOverflow(context, fields, radius, startAngle, accent) {
  context.save();
  fields.forEach((field, index) => {
    const overflow = getStatOverflow(field.key);
    if (!overflow) return;

    const intensity = Math.min(1, overflow / STAT_MAX);
    const angle = startAngle + (index * 2 * Math.PI) / fields.length;
    const startRadius = radius + 4;
    const markerRadius = radius + 11 + intensity * 15;
    const startX = Math.cos(angle) * startRadius;
    const startY = Math.sin(angle) * startRadius;
    const markerX = Math.cos(angle) * markerRadius;
    const markerY = Math.sin(angle) * markerRadius;

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(markerX, markerY);
    context.strokeStyle = hexToRgba(accent, 0.52 + intensity * 0.34);
    context.lineWidth = 2 + intensity * 2;
    context.stroke();

    context.shadowColor = accent;
    context.shadowBlur = 9 + intensity * 18;
    context.fillStyle = hexToRgba(accent, 0.72 + intensity * 0.26);
    context.beginPath();
    context.arc(markerX, markerY, 4 + intensity * 3, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    context.strokeStyle = hexToRgba(accent, 0.36);
    context.lineWidth = 1;
    context.beginPath();
    context.arc(markerX, markerY, 8 + intensity * 5, 0, Math.PI * 2);
    context.stroke();
  });
  context.restore();
}

function drawRadarProfile(context, points, options) {
  context.save();
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.closePath();
  context.fillStyle = options.fill;
  context.fill();
  context.strokeStyle = options.stroke;
  context.lineWidth = options.lineWidth;
  context.setLineDash(options.dash || []);
  context.stroke();
  context.restore();
}

function drawPolygon(context, sides, radius, startAngle) {
  context.beginPath();
  for (let index = 0; index < sides; index += 1) {
    const angle = startAngle + (index * 2 * Math.PI) / sides;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
}

function shortStatLabel(label) {
  const labels = {
    "Hand-to-hand Combat": "Hand-to-hand",
    "Speed/Agility": "Speed",
    "Nature Energy Proficiency": "Proficiency",
  };
  return labels[label] || label;
}

function hexToRgba(hex, alpha) {
  const normalized = String(hex).replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((value) => value + value)
          .join("")
      : normalized;
  const number = Number.parseInt(full, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function downloadJson() {
  const fileName = (
    String(character.name || "").trim() || "arc_character"
  ).replace(/[^\w-]+/g, "_");
  const payload = createArchivePayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileName}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  setDocumentStatus("Working file saved", true);
  showToast("Character JSON saved.");
  postToSystem("arc:dossier-saved", payload);
}

function loadJsonFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      character = normalizeCharacter(parsed.data ?? parsed, parsed.version);
      initializeDefaults();
      setStyleAccent();
      activeSectionIndex = 0;
      renderAll();
      setDocumentStatus("Loaded from JSON", true);
      showToast("Character archive loaded.");
    } catch {
      showToast("That file is not a valid A.R.C. character JSON.");
    } finally {
      elements.jsonFile.value = "";
    }
  };
  reader.readAsText(file);
}

function setMobileView(view) {
  elements.app.dataset.mobileView = view;
  document.querySelectorAll(".mobile-view-switcher button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  if (view === "preview") renderPreview();
}

function renderAll() {
  renderSectionNav();
  renderActiveSection();
  renderPreview();
  updateProgress();
}

elements.previousButton.addEventListener("click", () => {
  setActiveSection(activeSectionIndex - 1);
});

elements.nextButton.addEventListener("click", () => {
  setActiveSection(activeSectionIndex + 1);
});

elements.saveButton.addEventListener("click", downloadJson);
elements.printButton.addEventListener("click", () => window.print());
elements.jsonFile.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) loadJsonFromFile(file);
});

elements.artsCodexButton.addEventListener("click", () =>
  openArtsCodex({ returnFocus: elements.artsCodexButton }),
);
elements.closeArtsCodexButton.addEventListener("click", closeArtsCodex);
elements.artsCodex.addEventListener("keydown", trapCodexFocus);
elements.codexSearchInput.addEventListener("input", () => {
  codexFilters.search = elements.codexSearchInput.value;
  renderArtsCodex();
});
elements.codexSearchInput.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !elements.codexSearchInput.value) return;
  event.stopPropagation();
  elements.codexSearchInput.value = "";
  codexFilters.search = "";
  renderArtsCodex();
});
elements.clearCodexSearchButton.addEventListener("click", () => {
  elements.codexSearchInput.value = "";
  codexFilters.search = "";
  renderArtsCodex();
  elements.codexSearchInput.focus();
});

elements.closeArtDetailButton.addEventListener("click", () =>
  elements.artDetailDialog.close(),
);
elements.toggleArtSelectionButton.addEventListener("click", toggleActiveArtSelection);
elements.artDetailDialog.addEventListener("click", (event) => {
  if (event.target === elements.artDetailDialog) {
    elements.artDetailDialog.close();
  }
});
elements.artDetailDialog.addEventListener("close", () => {
  activeArtDetailName = "";
  syncOverlayState();
  if (detailReturnFocus instanceof HTMLElement && detailReturnFocus.isConnected) {
    detailReturnFocus.focus();
  } else if (!elements.artsCodex.hidden) {
    elements.codexSearchInput.focus();
  }
  detailReturnFocus = null;
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".field.is-stat-field")) {
    closeStatInfoPopovers();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector(".is-stat-info-open")) {
    closeStatInfoPopovers();
    return;
  }

  if (
    event.key === "Escape" &&
    !elements.artsCodex.hidden &&
    !elements.artDetailDialog.open
  ) {
    closeArtsCodex();
  }
});

document.querySelectorAll(".mobile-view-switcher button").forEach((button) => {
  button.addEventListener("click", () => setMobileView(button.dataset.view));
});

window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(drawRadar, 120);
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || !event.data || typeof event.data !== "object") return;
  if (event.data.type === "arc:request-dossier") {
    postToSystem("arc:dossier-snapshot", createArchivePayload());
    showToast("Current dossier sent to The System library.");
    return;
  }
  if (event.data.type === "arc:load-dossier") {
    const payload = event.data.payload;
    character = normalizeCharacter(payload?.data ?? payload, payload?.version);
    initializeDefaults();
    setStyleAccent();
    activeSectionIndex = 0;
    renderAll();
    setDocumentStatus("Loaded from The System", true);
    showToast("Character dossier loaded from the A.R.C. Library.");
  }
  if (event.data.type === "arc:open-codex") {
    openArtsCodex({ returnFocus: elements.artsCodexButton });
  }
});

initializeDefaults();
setStyleAccent();
initializeArtsCodex();
renderAll();

if (new URLSearchParams(window.location.search).get("embedded") === "1") {
  document.body.classList.add("is-embedded");
  postToSystem("arc:forge-ready", { version: 4 });
}

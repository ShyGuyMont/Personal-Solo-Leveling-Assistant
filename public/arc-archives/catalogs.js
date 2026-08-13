// --- Schema: same sections and questions as your old template (easy to edit later) ---
// Older saved JSON is translated to these canonical spellings when loaded.
const ART_NAME_ALIASES = Object.freeze({
  "Nexus Wrath Arts": "Wrath Nexus Arts",
  "Atom/Atomic Arts": "Atom Arts",
  "Obscurring Ember Arts": "Obscuring Ember Arts",
  "MagmaFlow Arts": "Magmaflow Arts",
  "Pheonix Rebirth Arts": "Phoenix Rebirth Arts",
  "Life Blood Arts": "Lifeblood Arts",
  "Zephyr's Judgement Arts": "Zephyr's Judgment Arts",
  "Eternal Storm": "Eternal Storm Arts",
  "Natures Retribution Arts": "Nature's Retribution Arts",
  "AmberShroud Arts": "Amber Shroud Arts",
});

const ARTS_DB = {
	"styles": {
    "Lightning": {
	 meta: { color: "#7c3aed" },  // purple
      "tiers": {
        "Tier 2": [
          { "name": "Surge Pulse Arts" },
          { "name": "Arcing Strike Arts" },
          { "name": "Conductive Grid Arts" },
          { "name": "Magnetic Flux Arts" },
          { "name": "Tempest Veil Arts" },
          { "name": "Pulse Shroud Arts" },
          { "name": "Lightning Step Arts" },
          { "name": "Static Horizon Arts" },
          { "name": "Signal Ghost Arts" },
          { "name": "Current Stitch Arts" }
        ],
        "Tier 3": [
          { "name": "Arc Convergence Arts" },
          { "name": "Plasma Forge Arts" },
          { "name": "Lightning Mirage Arts" },
          { "name": "Thunder Cage Arts" },
          { "name": "Electro-Vortex Arts" },
          { "name": "Storm Conductor Arts" },
          { "name": "Voltage Chain Arts" },
          { "name": "Electro-Repulse Arts" },
          { "name": "Rail Lance Arts" },
          { "name": "Capacitor Vault Arts" },
          { "name": "Neuromotor Override Arts" }
        ],
        "Forbidden": [
          { "name": "Quantum Phase Arts" },
          { "name": "Apex Storm Arts" },
          { "name": "Eternal Tempest Arts" },
          { "name": "Synchronic Rift Arts" },
          { "name": "Armageddon Core Arts" },
          { "name": "Wrath Nexus Arts" },
          { "name": "Mirage Blitz Arts" },
          { "name": "Atom Arts" },
          { "name": "Heaven's Circuit Arts" }
        ]
      }
    },
    "Fire": {
	meta: { color: "#dc2626" },  // red
       "tiers": {
        "Tier 2": [
		{ "name": "Obscuring Ember Arts" },
		{ "name": "Infernal Surge Arts" },
		{ "name": "Scorchfall Arts" },
		{ "name": "Wildfire Arts" },
		{ "name": "Magmaflow Arts" },
		{ "name": "Heat Mirage Arts" },
		{ "name": "Backdraft Arts" },
		{ "name": "Brandmark Arts" },
		{ "name": "Flareburst Arts" },
		{ "name": "Cauterize Arts" }
		],
        "Tier 3": [
		{ "name": "Detonation Arts" },
		{ "name": "Phoenix Rebirth Arts" },
		{ "name": "Sacred Flame Arts" },
		{ "name": "Solar Incineration Arts" },
		{ "name": "Ember Haven Arts" },
		{ "name": "Scorchline Arts" },
		{ "name": "Amber Shroud Arts" },
		{ "name": "Lava Bloom Arts" },
		{ "name": "Thermal Reversal Arts" },
		{ "name": "Furnace Mantle Arts" },
		{ "name": "Firebreak Arts" }
		],
        "Forbidden": [
		{ "name": "Hellfire Arts" },
		{ "name": "Pyroclasm Arts" },
		{ "name": "Infernal Bloom Arts" },
		{ "name": "Ashen Spiral Arts" },
		{ "name": "Flame Warden Arts" },
		{ "name": "Cataclysm Tempest Arts" },
		{ "name": "Blazing Eternity Arts" },
		{ "name": "Starheart Arts" }
		]
      }
    },
    "Water": {
	 meta: { color: "#2563eb" },
      "tiers": {
        "Tier 2": [
		{ "name": "Mist Veil Arts" },
		{ "name": "Ice Shard Arts" },
		{ "name": "Whirlpool Arts" },
		{ "name": "Rain Arts" },
		{ "name": "Hydro Healing Arts" },
		{ "name": "Tidal Grip Arts" },
		{ "name": "Bubble Enclosure Arts" },
		{ "name": "Mirror Current Arts" },
		{ "name": "Echo Depth Arts" },
		{ "name": "Dewpoint Arts" },
		{ "name": "Surface Tension Arts" }
		],
        "Tier 3": [
		{ "name": "Abyss Arts" },
		{ "name": "Geyser Arts" },
		{ "name": "Crystal Blast Arts" },
		{ "name": "Cascade Grasp Arts" },
		{ "name": "Abyssal Surge Arts" },
		{ "name": "Bubble Fortress Arts" },
		{ "name": "Maelstrom Arts" },
		{ "name": "Pressure Needle Arts" },
		{ "name": "Undertow Passage Arts" },
		{ "name": "Brine Crucible Arts" }
		],
        "Forbidden": [
		{ "name": "Tidal Wave Arts" },
		{ "name": "Frozen Tempest Arts" },
		{ "name": "Lifeblood Arts" },
		{ "name": "Abyss Dominion Arts" },
		{ "name": "Ocean's Wrath Arts" },
		{ "name": "Eternal Ice Prison Arts" },
		{ "name": "Leviathan Ascension Arts" },
		{ "name": "Aether Sphere Arts" },
		{ "name": "Sanguine Ascendancy Arts" },
		{ "name": "First Spring Arts" }
		]
  }
},
	"Wind": {
	meta: { color: "#64748b" },
		"tiers": {
			"Tier 2": [
			{ "name": "Wind Scythe Arts" },
			{ "name": "Vacuum Arts" },
			{ "name": "Gale Force Arts" },
			{ "name": "Mist Gale Arts" },
			{ "name": "Shielding Breeze Arts" },
			{ "name": "Zephyr Arts" },
			{ "name": "Pressure Snap Arts" },
			{ "name": "Tempest Arts" },
			{ "name": "Spiral Current Arts" },
			{ "name": "Resonance Veil Arts" },
			{ "name": "Scentline Arts" },
			{ "name": "Air Pocket Arts" },
			{ "name": "Featherfall Arts" }
			],
			"Tier 3": [
			{ "name": "Cyclone Arts" },
			{ "name": "Whisper Blade Arts" },
			{ "name": "Pressure Wave Arts" },
			{ "name": "Slicing Tempest Arts" },
			{ "name": "Serene Flow Arts" },
			{ "name": "Skyborne Dominion Arts" },
			{ "name": "Slipstream Arts" },
			{ "name": "Atmosphere Lens Arts" },
			{ "name": "Barometric Lock Arts" }
			],
			"Forbidden": [
			{ "name": "Hurricane Sovereign Arts" },
			{ "name": "Celestial Spiral Arts" },
			{ "name": "Silent Cataclysm Arts" },
			{ "name": "Breath of Eternity Arts" },
			{ "name": "Zephyr's Judgment Arts" },
			{ "name": "Eternal Storm Arts" },
			{ "name": "Shattering Silence Arts" },
			{ "name": "Heavenfall Arts" }
			]
  }
},
	"Earth": {
	meta: { color: "#15803d" },
		"tiers": {
			"Tier 2": [
			{ "name": "Tremor Arts" },
			{ "name": "Earthen Grasp Arts" },
			{ "name": "Quicksand Arts" },
			{ "name": "Stone Blade Arts" },
			{ "name": "Bloom Arts" },
			{ "name": "Metal Arts" },
			{ "name": "Crystal Forge Arts" },
			{ "name": "Seismic Wave Arts" },
			{ "name": "Faultsense Arts" },
			{ "name": "Clay Seal Arts" },
			{ "name": "Mineral Compass Arts" },
			{ "name": "Dust Mantle Arts" }
			],
			"Tier 3": [
			{ "name": "Gemstone Arts" },
			{ "name": "Graviton Arts" },
			{ "name": "Earthen Shell Arts" },
			{ "name": "Quarry Arts" },
			{ "name": "Nature's Retribution Arts" },
			{ "name": "Golem Forge Arts" },
			{ "name": "Titan's Stride Arts" },
			{ "name": "Subterranean Ambush Arts" },
			{ "name": "Verdant Renewal Arts" },
			{ "name": "Keystone Arts" },
			{ "name": "Terrain Memory Arts" },
			{ "name": "Sinkhole Arts" }
			
			],
			"Forbidden": [
			{ "name": "World Tree Arts" },
			{ "name": "Continental Shift Arts" },
			{ "name": "Geoforge Arts" },
			{ "name": "Titan's Genesis Arts" },
			{ "name": "Eternal Garden Arts" },
			{ "name": "Core Implosion Arts" },
			{ "name": "Gaia's Embrace Arts" },
			{ "name": "Seed of Stone Arts" }
			]
  }
},


	     
  }
}

const LOCATIONS_DB = {
  "USA": {
    "California": ["Los Angeles", "San Diego", "San Francisco", "San Jose", "Sacramento"],
    "New York": ["New York City", "Buffalo", "Rochester"],
    "Texas": ["Houston", "Dallas", "Austin", "San Antonio"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"],
    "Illinois": ["Chicago"],
    "Georgia": ["Atlanta"],
    "Washington": ["Seattle"],
    "Massachusetts": ["Boston"],
    "Pennsylvania": ["Philadelphia", "Pittsburgh"],
    "Maryland": ["Baltimore", "Annapolis", "Columbia", "Silver Spring"]
  },

  "Canada": {
    "Ontario": ["Toronto", "Ottawa"],
    "British Columbia": ["Vancouver", "Victoria"],
    "Quebec": ["Montreal", "Quebec City"],
    "Alberta": ["Calgary", "Edmonton"]
  },

  "United Kingdom": {
  "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol", "Sheffield", "Nottingham"],
  "Scotland": ["Edinburgh", "Glasgow", "Aberdeen"],
  "Wales": ["Cardiff", "Swansea"],
  "Northern Ireland": ["Belfast", "Derry (Londonderry)"]
},


  "France": {
  "Île-de-France": ["Paris"],
  "Provence-Alpes-Côte d’Azur": ["Marseille", "Nice", "Cannes"],
  "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble"],
  "Occitanie": ["Toulouse", "Montpellier"],
  "Nouvelle-Aquitaine": ["Bordeaux"],
  "Hauts-de-France": ["Lille"],
  "Grand Est": ["Strasbourg"],
  "Normandy": ["Rouen"],
  "Brittany": ["Rennes", "Brest"]
},


  "Germany": {
  "Berlin": ["Berlin"],
  "Bavaria": ["Munich", "Nuremberg"],
  "Hamburg": ["Hamburg"],
  "Hesse": ["Frankfurt", "Wiesbaden"],
  "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen"],
  "Baden-Württemberg": ["Stuttgart", "Heidelberg"],
  "Saxony": ["Dresden", "Leipzig"],
  "Lower Saxony": ["Hanover"]
},


  "Spain": {
  "Community of Madrid": ["Madrid"],
  "Catalonia": ["Barcelona"],
  "Andalusia": ["Seville", "Malaga", "Granada"],
  "Valencian Community": ["Valencia", "Alicante"],
  "Basque Country": ["Bilbao", "San Sebastián"],
  "Galicia": ["Santiago de Compostela", "A Coruña"],
  "Canary Islands": ["Las Palmas", "Santa Cruz de Tenerife"],
  "Balearic Islands": ["Palma"]
},


  "Italy": {
    "Lazio": ["Rome"],
    "Lombardy": ["Milan"],
    "Campania": ["Naples"],
    "Piedmont": ["Turin"]
  },

  "Brazil": {
  "São Paulo": ["São Paulo", "Campinas", "Santos"],
  "Rio de Janeiro": ["Rio de Janeiro", "Niterói"],
  "Minas Gerais": ["Belo Horizonte", "Uberlândia"],
  "Paraná": ["Curitiba", "Londrina"],
  "Rio Grande do Sul": ["Porto Alegre", "Caxias do Sul"],
  "Santa Catarina": ["Florianópolis", "Joinville"],
  "Bahia": ["Salvador"],
  "Pernambuco": ["Recife"],
  "Ceará": ["Fortaleza"],
  "Pará": ["Belém"],
  "Amazonas": ["Manaus"],
  "Distrito Federal": ["Brasília"]
},


  "Mexico": {
  "CDMX": ["Mexico City"],
  "Jalisco": ["Guadalajara", "Puerto Vallarta"],
  "Nuevo León": ["Monterrey"],
  "Puebla": ["Puebla City"],
  "Baja California": ["Tijuana", "Mexicali"],
  "Chihuahua": ["Chihuahua City", "Ciudad Juárez"],
  "Coahuila": ["Saltillo", "Torreón"],
  "Guanajuato": ["León", "Guanajuato City"],
  "Querétaro": ["Querétaro"],
  "Yucatán": ["Mérida"],
  "Quintana Roo": ["Cancún", "Playa del Carmen", "Tulum"],
  "Sinaloa": ["Culiacán", "Mazatlán"],
  "Sonora": ["Hermosillo"],
  "Veracruz": ["Veracruz", "Xalapa"],
  "Oaxaca": ["Oaxaca City"],
  "Michoacán": ["Morelia"]
},


  "China": {
  "Beijing": ["Beijing"],
  "Shanghai": ["Shanghai"],
  "Tianjin": ["Tianjin"],
  "Chongqing": ["Chongqing"],

  "Guangdong": ["Guangzhou", "Shenzhen", "Dongguan", "Foshan", "Zhuhai"],
  "Zhejiang": ["Hangzhou", "Ningbo", "Wenzhou", "Shaoxing"],
  "Jiangsu": ["Nanjing", "Suzhou", "Wuxi", "Changzhou"],
  "Fujian": ["Fuzhou", "Xiamen", "Quanzhou"],

  "Shandong": ["Jinan", "Qingdao", "Yantai"],
  "Henan": ["Zhengzhou", "Luoyang"],
  "Hubei": ["Wuhan", "Yichang"],
  "Hunan": ["Changsha", "Zhuzhou"],
  "Anhui": ["Hefei", "Wuhu"],
  "Jiangxi": ["Nanchang"],

  "Sichuan": ["Chengdu", "Mianyang"],
  "Shaanxi": ["Xi'an", "Baoji"],
  "Liaoning": ["Shenyang", "Dalian"],
  "Jilin": ["Changchun"],
  "Heilongjiang": ["Harbin"],

  "Guangxi": ["Nanning", "Guilin"],
  "Yunnan": ["Kunming", "Dali", "Lijiang"],
  "Guizhou": ["Guiyang"],

  "Xinjiang": ["Urumqi"],
  "Tibet": ["Lhasa"],
  "Inner Mongolia": ["Hohhot"],
  "Hong Kong": ["Hong Kong"],
  "Macau": ["Macau"]
},


  "Japan": {
  "Hokkaido": ["Sapporo", "Hakodate", "Asahikawa"],
  "Tohoku": ["Sendai", "Aomori", "Morioka", "Fukushima", "Akita", "Yamagata"],
  "Kanto": ["Tokyo", "Yokohama", "Kawasaki", "Chiba", "Saitama", "Tsukuba"],
  "Chubu": ["Nagoya", "Niigata", "Kanazawa", "Toyama", "Nagano", "Shizuoka", "Hamamatsu"],
  "Kansai": ["Osaka", "Kyoto", "Kobe", "Nara", "Sakai", "Otsu"],
  "Chugoku": ["Hiroshima", "Okayama", "Shimonoseki", "Tottori"],
  "Shikoku": ["Matsuyama", "Takamatsu", "Tokushima", "Kochi"],
  "Kyushu": ["Fukuoka", "Kitakyushu", "Nagasaki", "Kumamoto", "Kagoshima", "Oita", "Miyazaki", "Naha (Okinawa)"]
},


  "South Korea": {
    "Seoul Capital Area": ["Seoul", "Incheon", "Suwon"],
    "Busan Region": ["Busan"],
    "Daegu Region": ["Daegu"],
    "Daejeon Region": ["Daejeon"]
  },

  "India": {
  "Delhi": ["New Delhi", "Delhi"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Karnataka": ["Bengaluru", "Mysuru"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  "Telangana": ["Hyderabad"],
  "West Bengal": ["Kolkata"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur"],
  "Uttar Pradesh": ["Lucknow", "Varanasi", "Agra", "Kanpur"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar"],
  "Kerala": ["Kochi", "Thiruvananthapuram"],
  "Madhya Pradesh": ["Bhopal", "Indore"],
  "Bihar": ["Patna"],
  "Odisha": ["Bhubaneswar"],
  "Andhra Pradesh": ["Visakhapatnam"],
  "Assam": ["Guwahati"]
},


  "Nigeria": {
  "Lagos": ["Lagos"],
  "Federal Capital Territory": ["Abuja"],
  "Rivers": ["Port Harcourt"],
  "Kano": ["Kano"],
  "Oyo": ["Ibadan"],
  "Kaduna": ["Kaduna"],
  "Enugu": ["Enugu"]
},

  "South Africa": {
  "Gauteng": ["Johannesburg", "Pretoria", "Soweto"],
  "Western Cape": ["Cape Town", "Stellenbosch"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg"],
  "Eastern Cape": ["Gqeberha (Port Elizabeth)"],
  "Free State": ["Bloemfontein"]
},


  "Egypt": {
  "Cairo": ["Cairo", "Giza"],
  "Alexandria": ["Alexandria"],
  "Red Sea": ["Hurghada"],
  "Luxor": ["Luxor"],
  "Aswan": ["Aswan"]
},


  "Australia": {
    "New South Wales": ["Sydney"],
    "Victoria": ["Melbourne"],
    "Queensland": ["Brisbane"],
    "Western Australia": ["Perth"],
    "South Australia": ["Adelaide"]
  },

 "Philippines": {
  "Metro Manila": ["Manila", "Quezon City", "Makati", "Pasig"],
  "Cebu": ["Cebu City"],
  "Davao": ["Davao City"],
  "Iloilo": ["Iloilo City"],
  "Benguet": ["Baguio"]
},


  "Vietnam": {
  "North": ["Hanoi", "Haiphong"],
  "Central": ["Da Nang", "Hue"],
  "South": ["Ho Chi Minh City", "Can Tho"]
},

  
  "Russia": {
  "Moscow": ["Moscow"],
  "Saint Petersburg": ["Saint Petersburg"],
  "Novosibirsk Oblast": ["Novosibirsk"],
  "Sverdlovsk Oblast": ["Yekaterinburg"],
  "Nizhny Novgorod Oblast": ["Nizhny Novgorod"],
  "Tatarstan": ["Kazan"],
  "Samara Oblast": ["Samara"],
  "Rostov Oblast": ["Rostov-on-Don"],
  "Krasnodar Krai": ["Krasnodar", "Sochi"],
  "Krasnoyarsk Krai": ["Krasnoyarsk"],
  "Primorsky Krai": ["Vladivostok"],
  "Irkutsk Oblast": ["Irkutsk"]
},

  "Thailand": {
  "Bangkok": ["Bangkok"],
  "Chiang Mai": ["Chiang Mai"],
  "Phuket": ["Phuket"],
  "Chonburi": ["Pattaya"],
  "Khon Kaen": ["Khon Kaen"]
},

"Indonesia": {
  "Jakarta": ["Jakarta"],
  "West Java": ["Bandung", "Bekasi"],
  "East Java": ["Surabaya", "Malang"],
  "Bali": ["Denpasar"],
  "Special Region of Yogyakarta": ["Yogyakarta"],
  "North Sumatra": ["Medan"],
  "South Sulawesi": ["Makassar"]
},

  
};

const FACTIONS_DB = {
  "Brigade": {
    ranks: [
      "Novice",
      "Operative",
      "Commander",
      "General",
	  "Director of Combat Ops",
	  "Director of Intelligence",
	  "Director of Research",
	  "Director of Logistics",
	  "Director of Medical Services",
	  "Director of Special Ops",
	  "Director of Training & Recruitment",
	  "Warden (Atlas Citadel)",
	  "Warden (Tundra Sentinel)",
	  "Warden (Ashen Apex)",
	  "Warden (Bastion of Unity)",
	  "Warden (Verdant Rainspire)",
	  "High Sentinel",
	  "High Commander",
	  "GrandMaster",
	  "Specialist/Personnel"
    ],
    sectors: [
      "Striker",
      "Barrier",
      "Ghost",
      "Intelligence",
      "Tether",
      "Special Ops",
	  "Rescue"
    ]
  },

  // Other factions (no ranks/sectors unless you add later)
  "Other": {},
  "Effigies": {},
  "Independent": {},
  "Order of Shadows": {},
  "Royal Court": {},
  "Crystal Alliance": {},
  "Elemental Circle": {},
  "Government": {},
  "Solar Dominion": {},
  "Old Rebellion": {},
  "New Rebellion": {}
};

const GRACED_MAP = {
  body: new Set(["hand_to_hand","strength","speed","durability","reflexes"]),
  mind: new Set(["battle_prowess","intelligence","proficiency"]),
  soul: new Set(["nature_energy","arts_potency"])
};

const CLASS_OPTIONS = ["D", "C", "B", "A", "S", "World"];

const LEGACY_CLASS_ALIASES = Object.freeze({
  F: "D",
  E: "D",
  SS: "S",
  "World-Class": "World",
});

const ETHNICITY_OPTIONS = [
  "African / African Diaspora (Black heritage — e.g., African-American, Caribbean, Nigerian, Ethiopian)",
  "Arab / Middle Eastern (e.g., Saudi, Lebanese, Emirati, Syrian)",
  "Central Asian (Inner Asia — e.g., Kazakh, Uzbek, Kyrgyz, Turkmen)",
  "East Asian (e.g., Chinese, Japanese, Korean, Mongolian)",
  "Hispanic / Latino (Spanish-speaking heritage — e.g., Mexican, Puerto Rican, Colombian)",
  "Indigenous / Native (Original peoples of a region — e.g., Native American, First Nations, Ainu)",
  "North African (e.g., Egyptian, Moroccan, Algerian, Berber)",
  "Pacific Islander (Oceanic cultures — e.g., Samoan, Hawaiian, Tongan, Fijian)",
  "South Asian (Indian subcontinent — e.g., Indian, Pakistani, Bangladeshi, Sri Lankan)",
  "Southeast Asian (e.g., Filipino, Vietnamese, Thai, Indonesian, Malaysian)",
  "White / European (e.g., German, French, Italian, Slavic, Nordic)",
  "Mixed Heritage",
  "Other (write-in)"
];

const PERSONALITY_OPTIONS = [
  "Calm",
  "Stoic",
  "Compassionate",
  "Protective",
  "Loyal",
  "Honorable",
  "Driven",
  "Ambitious",
  "Strategic",
  "Analytical",
  "Curious",
  "Idealistic",
  "Humble",
  "Disciplined",
  "Reckless",
  "Hot-headed",
  "Arrogant",
  "Sarcastic",
  "Playful",
  "Reserved",
  "Emotionally Guarded",
  "Vengeful",
  "Haunted",
  "Charismatic",
  "Manipulative",
  "Unpredictable"
];

const COMBAT_ROLE_DB = {
  "Vanguard": "Frontline pressure. Starts fights, breaks formations, draws heat.",
  "Duelist": "Wins 1v1s. Handles elite targets and rival matchups.",
  "Assassin": "Deletes priority targets. Mobility, stealth, burst, escape.",
  "Controller": "Shapes the battlefield. Zones, disables, traps, denial.",
  "Artillery": "Long-range output. Big AoE, suppression, siege pressure.",
  "Support": "Enables allies. Buffs, utility, positioning, protection.",
  "Healer": "Sustain and recovery. Keeps the team alive through attrition.",
  "Tank": "Soaks damage and anchors space. Protects allies, holds ground.",
  "Scout / Recon": "Intel and positioning. Tracks threats, maps routes, warns team.",
  "Specialist": "Weird niche value. Counters specific threats or solves unique problems."
};

const COMBAT_ROLE_OPTIONS = Object.keys(COMBAT_ROLE_DB);


const FIGHTING_PHILOSOPHY_DB = {
  "Brutal": "Wins through raw force and intimidation. Minimal restraint.",
  "Tactical": "Plans ahead, exploits weaknesses, controls tempo.",
  "Adaptive": "Reads patterns fast and changes approach mid-fight.",
  "Defensive": "Prioritizes survival and protection. Counters over chasing.",
  "Overwhelming": "Wins by pressure and output. Buries opponents in offense.",
  "Surgical": "Precise, efficient, minimal wasted movement or energy.",
  "Emotional": "Fights powered by feeling. Peaks high, can lose control.",
  "Detached": "Cold, clinical. Doesn’t get baited or shaken.",
  "Unpredictable": "Chaotic rhythm, irregular choices, hard to read.",
  "Patient": "Waits for perfect openings. Lets enemies overcommit.",
  "Honor-bound": "Follows rules or a code. Limits certain tactics.",
  "Ruthless": "No rules. Uses any advantage, targets weaknesses instantly."
};

const FIGHTING_PHILOSOPHY_OPTIONS = Object.keys(FIGHTING_PHILOSOPHY_DB);



const SCHEMA = [
  {
    title: "Section 1: The Basics",
    fields: [
      { key: "name", label: "Name", type: "text" },
	  { key: "alias", label: "Alias / Codename", type: "text" },
      { key: "age", label: "Age", type: "text" },
	  { key: "status", label: "Status", type: "select", options: ["Alive", "Deceased", "Sealed", "Missing", "Unknown"] },
      { key: "role", label: "Role in the Story", type: "text" },
	  { key: "era", label: "Era / Timeline", type: "text" },
      { key: "ethnicity", label: "Ethnicity", type: "select", options: ETHNICITY_OPTIONS },
      { key: "ethnicity_other", label: "If Other, specify", type: "text" },

      { key: "origin_country", label: "Birthplace (Country)", type: "select_country" },
      { key: "origin_region",  label: "Birthplace (Region/State)", type: "select_region" },
      { key: "origin_city",    label: "Birthplace (City)", type: "select_city" },
      { key: "hair", label: "Hair", type: "text" },
      { key: "eyes", label: "Eyes", type: "text" },
	  { key: "height_ft", label: "Height (Feet)", type: "select", options: ["3","4","5","6","7","8"] },
      { key: "height_in", label: "Height (Inches)", type: "select", options: ["0","1","2","3","4","5","6","7","8","9","10","11"] },
	  { key: "build", label: "Build / Physique", type: "text" },
      { key: "weapon", label: "Weapon", type: "text" },
      { key: "personality_traits", label: "Personality Traits", type: "multiselect", options: PERSONALITY_OPTIONS },
      { key: "personality_notes", label: "Additional Personality Notes (optional)", type: "textarea" },
    ],
  },
  {
    title: "Section 2: Relationships & Affiliations",
    fields: [
      { key: "family", label: "Family", type: "textarea" },
      { key: "relationship_history", label: "Relationship History", type: "textarea" },
	  { key: "allies", label: "Allies", type: "textarea" },
      { key: "rivals", label: "Rivals", type: "textarea" },
	  { key: "enemies", label: "Enemies", type: "textarea" },
	  { key: "faction", label: "Faction", type: "select_faction" },
      { key: "brigade_rank", label: "Brigade Rank", type: "select_brigade_rank" },
      { key: "brigade_sector", label: "Brigade Sector (optional)", type: "select_brigade_sector_optional" },
	  { key: "mentor", label: "Mentor(s)", type: "textarea" },
      { key: "students", label: "Students / Proteges", type: "textarea" },


    ],
  },
  {
   title: "Section 3: Story",
   fields: [
     { key: "goal", label: "What is their goal?", type: "textarea" },
     { key: "beliefs", label: "What do they strongly believe in?", type: "textarea" },

     { key: "want", label: "What do they WANT (surface desire)?", type: "textarea" },
     { key: "need", label: "What do they NEED (inner growth)?", type: "textarea" },

     { key: "love", label: "What do they love?", type: "textarea" },
     { key: "hate", label: "What do they hate?", type: "textarea" },

     { key: "wound", label: "Core Wound / Deepest Scar", type: "textarea" },
     { key: "fear", label: "Greatest Fear", type: "textarea" },
     { key: "flaw", label: "Fatal Flaw / Weakness of Character", type: "textarea" },

     { key: "secrets", label: "What secrets do they have?", type: "textarea" },
     { key: "line", label: "Line They Won't Cross", type: "textarea" },
     { key: "breaking_point", label: "What pushes them over the edge?", type: "textarea" },

     { key: "different", label: "What makes them different?", type: "textarea" },
     { key: "defining_moment", label: "What was a defining moment in their past?", type: "textarea" },
     { key: "changes", label: "How does their character change over time?", type: "textarea" },
     { key: "key_moments", label: "What are their key moments?", type: "textarea" }
	 
	 
    ],
 },
   {
   title: "Section 4: Power System & Arts",
   fields: [
  { key: "style", label: "Style", type: "select_style" },
  { key: "arts", label: "Arts (pick as many as needed)", type: "multiselect_arts" },
  { key: "combat_role", label: "Combat Role", type: "select", options: COMBAT_ROLE_OPTIONS },
  { key: "fighting_philosophy", label: "Fighting Philosophy", type: "checkbox_philosophy" },
  { key: "graced_body", label: "Graced Body", type: "select_graced" },
  { key: "graced_mind", label: "Graced Mind", type: "select_graced" },
  { key: "graced_soul", label: "Graced Soul", type: "select_graced" }
 
	 
    ],
 },
 
 {
  title: "Section 5: Final Stats & Classification (0–1000)",
  fields: [
    { key: "starting_class", label: "Starting Story Class", type: "select", options: CLASS_OPTIONS },
    { key: "ending_class", label: "Ending Story Class", type: "select", options: CLASS_OPTIONS },
    { key: "hand_to_hand", label: "Hand-to-hand Combat", type: "stat" },
    { key: "strength", label: "Strength", type: "stat" },
    { key: "speed", label: "Speed/Agility", type: "stat" },
    { key: "durability", label: "Durability", type: "stat" },
    { key: "reflexes", label: "Reflexes", type: "stat" },
    { key: "nature_energy", label: "Nature Energy", type: "stat" },
    { key: "proficiency", label: "Nature Energy Proficiency", type: "stat" },
    { key: "arts_potency", label: "Arts Potency", type: "stat" },
    { key: "battle_prowess", label: "Battle Prowess", type: "stat" },
    { key: "intelligence", label: "Intelligence", type: "stat" }
  ]
},

 
 ];

// Full Arts Codex data. Canon material is adapted from the supplied A.R.C. Arts documents.
// Keep ART_DESCRIPTIONS concise; long-form reading belongs in this file.
const ART_STYLE_GUIDES = Object.freeze({
  "Lightning": {
    "motto": "Speed, precision, disruption",
    "overview": "Lightning embodies raw energy, speed, and precision. Its wielders shape charge, current, plasma, and magnetism to interrupt opponents, cross distance instantly, and solve problems before heavier Styles can respond. The Style rewards sharp thinking and exact control; its greatest danger is the volatility of the power moving through the user's own body.",
    "mastery": "A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
  },
  "Fire": {
    "motto": "Destruction, renewal, will",
    "overview": "Fire embodies destruction, renewal, and the will to keep burning. Its wielders control flame, heat, smoke, ash, and ignition, ranging from direct devastation to crafting, purification, protection, and emergency care. Fire is naturally aggressive, but true mastery is measured by what the user can choose not to burn.",
    "mastery": "A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
  },
  "Water": {
    "motto": "Adaptation, flow, restoration",
    "overview": "Water holds the serenity of still lakes and the force of raging seas. Its wielders shape liquid, vapor, ice, pressure, and currents to heal, restrain, protect, travel, or overwhelm. Water is the most adaptable Style, but its user must constantly account for supply, temperature, pressure, contamination, and the path every current will take.",
    "mastery": "A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
  },
  "Wind": {
    "motto": "Freedom, motion, the unseen",
    "overview": "Wind represents freedom, precision, and unrelenting motion. Its wielders shape air currents, pressure, sound, drag, and atmosphere into movement, blades, shields, and battlefield-wide disruption. Because air is usually invisible, Wind excels at subtle positioning and surprise, but mistakes in pressure can endanger lungs, hearing, and allies.",
    "mastery": "A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
  },
  "Earth": {
    "motto": "Strength, resilience, creation",
    "overview": "Earth embodies strength, resilience, and creation. Its wielders shape soil, stone, metal, crystal, minerals, and plant-bearing ground to defend, build, restrain, restore, or reshape a battlefield. Earth rewards preparation and structural understanding; its power is immense, but heavy material resists rushed or careless control.",
    "mastery": "An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
  }
});

const ART_DETAILS = Object.freeze({
  "Surge Pulse Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "Releases a controlled shockwave of electricity that ripples outward, disrupting nerve signals, electronics, and Nature Energy flows.",
    "tags": [
      "Detection",
      "Control",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Releases a controlled shockwave of electricity that ripples outward, disrupting nerve signals, electronics, and Nature Energy flows. The shimmering wave spreads visibly across the battlefield, creating an area of intense disruption."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "This Art can stun enemies and disable their equipment, making it invaluable in battles against foes reliant on technology or energy-based Techniques. It can also interrupt casting, forcing enemies to restart their attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Surge Pulse can act as a localized EMP, neutralizing security systems or shutting down critical machinery in high-tech environments. This Art is perfect for characters who excel in tactical disruption."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. The information still requires interpretation and may be confused by interference or deliberate decoys."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Arcing Strike Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "The user refines their lightning into a high-voltage bolt capable of arcing toward targets bypassing obstacles and shields.",
    "tags": [
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user refines their lightning into a high-voltage bolt capable of arcing toward targets bypassing obstacles and shields. The bolt crackles as it finds its mark, moving with precision and speed."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Ideal for striking vital points or targeting enemies who think they are safe behind cover. The arcing effect ensures the attack reaches even evasive or well-protected foes."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art’s precision makes it useful for welding, melting, or cutting through metals with incredible accuracy, proving invaluable in crafting or sabotage."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Conductive Grid Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "Creates a glowing grid of electricity that connects objects or encircles enemies.",
    "tags": [
      "Mobility",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a glowing grid of electricity that connects objects or encircles enemies. Sparks leap between the grid points, electrifying anything within its bounds. The user can merge with the grid, traveling along its pathways as pure energy, allowing for instant repositioning and evasion."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The grid immobilizes enemies, delivering continuous shocks that weaken them over time. The user’s ability to travel within the grid makes it a potent tool for confusing opponents and creating unexpected angles for attacks. It also enhances teamwork by linking allies with an energy flow that temporarily boosts their abilities."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The grid powers multiple devices simultaneously or enables energy-based travel across long distances when linked to conductive materials, making it both a combat tool and a logistical marvel."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Magnetic Flux Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "The user manipulates magnetic fields to control metallic objects with precision.",
    "tags": [
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user manipulates magnetic fields to control metallic objects with precision. This Art allows for subtle adjustments, such as picking a lock, or dramatic displays of power, like hurling heavy machinery across the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Perfect for disarming opponents by pulling weapons away or immobilizing armored enemies by locking them in place. The user can also turn any nearby metal into a deadly projectile, overwhelming foes with flying debris."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Magnetic Flux is invaluable for construction, disassembling machinery, or transporting heavy materials effortlessly, making it as practical as it is powerful."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Tempest Veil Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "Summons storm clouds charged with lightning, shrouding the battlefield in chaos.",
    "tags": [
      "Mobility",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons storm clouds charged with lightning, shrouding the battlefield in chaos. The storm moves with the user, granting them cover and creating disorienting winds that hinder enemies’ visibility and movements."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user can direct lightning strikes to specific targets, overwhelming foes with precision and raw power. The storm amplifies the user’s attacks, making even simple Techniques devastatingly powerful."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Tempest Veil can alter weather conditions to disrupt enemy plans or aid allies, such as bringing rain to drought-stricken areas or cooling overheated systems"
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Pulse Shroud Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "The user wraps themselves in a field of oscillating electric pulses that absorb or redirect incoming energy-based attacks.",
    "tags": [
      "Healing",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user wraps themselves in a field of oscillating electric pulses that absorb or redirect incoming energy-based attacks. The pulses ripple outward, creating a protective aura that crackles with intensity."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "This Art deflects energy projectiles or neutralizes weaker Arts before they strike. When the shield absorbs too much energy, it releases a shockwave that stuns nearby enemies."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Pulse Shroud shields delicate equipment from electrical surges and protects allies in hazardous environments. It can also stabilize malfunctioning systems by absorbing excess energy."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Lightning Step Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "The user propels themselves forward with a burst of electrical energy, covering short distances in an instant.",
    "tags": [
      "Mobility",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user propels themselves forward with a burst of electrical energy, covering short distances in an instant. The movement leaves behind a charged trail that shocks and slows anyone who steps into it."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "This Art is perfect for closing gaps, dodging attacks, or setting up for surprise strikes. The charged trail acts as a trap to hinder enemies’ pursuit or force them into vulnerable positions."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Lightning Step can assist in scaling walls or escaping dangerous situations, providing unparalleled mobility in tight spaces."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Static Horizon Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "Spreads a low-voltage sensing field that maps nearby movement, living bioelectric signals, active machines, and breaks in conductive surfaces without directly shocking them.",
    "tags": [
      "Detection",
      "Mobility"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Spreads a low-voltage sensing field that maps nearby movement, living bioelectric signals, active machines, and breaks in conductive surfaces without directly shocking them."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The field warns the user about flanking movement, concealed electronics, and incoming bodies before direct sight is possible. It is especially valuable in darkness, smoke, cramped interiors, or any fight where ambush matters more than immediate damage."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Outside combat, it can sweep a room for active devices, locate a living person through thin cover, trace broken wiring, or reveal a gap in a conductive surface without dismantling it."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Static Horizon is a sensing Art, not a stun field. Insulation, heavy electromagnetic noise, grounded shielding, and large amounts of conductive clutter can blur the map or create false impressions, so the user must confirm what each return actually represents."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Signal Ghost Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "Injects precise electrical patterns into nearby unshielded devices to jam, spoof, or briefly control them, trading raw damage for quiet electronic infiltration.",
    "tags": [
      "Detection",
      "Defense",
      "Control"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Injects precise electrical patterns into nearby unshielded devices to jam, spoof, or briefly control them, trading raw damage for quiet electronic infiltration."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Rather than overpowering a device, the user imitates the electrical language it expects: false sensor returns, jammed communications, opened locks, or a brief hostile-system takeover. The Art is ideal for quiet infiltration and coordinated ambushes where a visible discharge would ruin the plan."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can diagnose circuits, spoof identification readers, retrieve simple signals, silence alarms, or temporarily bridge incompatible electronics without physically rebuilding them."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "It cannot create software knowledge the user does not possess. Shielded, isolated, mechanical, unfamiliar, or heavily encrypted systems resist control, and a bad pattern can destroy the device or expose the user's position to anyone monitoring the circuit."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Current Stitch Arts": {
    "style": "Lightning",
    "tier": "Tier 2",
    "summary": "Applies controlled microcurrents to restart a heart or re-engage failing muscles, stabilizing a body without repairing the injury that caused the failure.",
    "tags": [
      "Healing",
      "Control"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Applies controlled microcurrents to restart a heart or re-engage failing muscles, stabilizing a body without repairing the injury that caused the failure."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Microcurrents can restart a stopped heart, interrupt shock, or force failing muscles to contract long enough to move an injured ally out of danger. It is battlefield stabilization, not regeneration, and it does not remove blood loss, toxins, broken bones, or organ damage."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The Art can support emergency medicine, test nerve response, preserve muscle function during rescue, and keep a patient alive through the minutes needed to reach a true healer."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Incorrect current, placement, or timing can worsen an arrhythmia, burn tissue, or trigger uncontrolled muscle movement. The user needs anatomical knowledge and a clear read on the injury; repeated stimulation exhausts both patient and caster."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Arc Convergence Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "The user harnesses multiple streams of lightning, converging them into a concentrated beam of overwhelming energy.",
    "tags": [
      "Mobility",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user harnesses multiple streams of lightning, converging them into a concentrated beam of overwhelming energy. The beam pierces through obstacles and shields, leaving behind trails of residual electricity that act as electrified hazards."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "This Art devastates armored foes and fortified defenses with a single, focused strike. The lingering electrical fields punish enemies who move through the area, creating zones of denial."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Arc Convergence provides energy to large-scale systems or melts through dense materials for industrial applications, making it equally useful in non-combat scenarios."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Plasma Forge Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "The user superheats lightning into plasma, shaping it into solid constructs such as weapons, shields, or barriers.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user superheats lightning into plasma, shaping it into solid constructs such as weapons, shields, or barriers. These constructs are hyper-conductive and can channel additional lightning for enhanced effects."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Plasma Forge allows the user to create custom, electrified weapons for versatile combat, such as plasma blades or spears. Shields deflect attacks while shocking melee attackers, and barriers trap or redirect opponents."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art constructs tools or temporary structures for emergencies and repairs damaged machinery by filling gaps with conductive plasma, showcasing its utility beyond combat."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Lightning Mirage Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "The user moves at such extreme speeds that they leave behind afterimages made of pure electricity.",
    "tags": [
      "Mobility",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user moves at such extreme speeds that they leave behind afterimages made of pure electricity. These mirages can momentarily attack or distract enemies before dissipating into crackling sparks."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Lightning Mirage confuses enemies by surrounding them with multiple decoys, masking the user’s true position. Each mirage mimics the user’s attacks, overwhelming foes with rapid strikes."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art excels in infiltration or escape, using the mirages to distract pursuers or obscure the user’s path. It can also serve as a psychological weapon, breaking an opponent’s focus."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Thunder Cage Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "Summons a massive, electrified cage that descends from the sky, trapping enemies within a field of crackling energy.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons a massive, electrified cage that descends from the sky, trapping enemies within a field of crackling energy. The cage shrinks over time, intensifying the electricity as it closes in."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Thunder Cage immobilizes enemies while subjecting them to continuous shocks. The shrinking effect forces foes to choose between staying trapped or risking harm by escaping."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art contains dangerous creatures or individuals without physical restraints and creates a protective perimeter around allies or key locations."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Electro-Vortex Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "The user summons a swirling vortex of lightning that pulls enemies inward, shocking them repeatedly as they are dragged toward the center.",
    "tags": [
      "Detection",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user summons a swirling vortex of lightning that pulls enemies inward, shocking them repeatedly as they are dragged toward the center. The vortex grows stronger with time, increasing its gravitational pull."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Electro-Vortex disorients and immobilizes enemies while dealing constant damage, forcing foes into a confined space for follow-up attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The vortex clears debris or hazardous materials and contains volatile substances, preventing them from spreading. It’s a potent tool for crowd control in combat and problem-solving outside it."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. The information still requires interpretation and may be confused by interference or deliberate decoys."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Storm Conductor Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "The user summons storm clouds infused with a glowing web of electricity.",
    "tags": [
      "Mobility",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user summons storm clouds infused with a glowing web of electricity. The network acts as a conductor, amplifying the storm’s power and guiding lightning strikes to specific targets."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Storm Conductor turns the battlefield into a tactical nightmare, delivering lightning bolts precisely where they are needed. Enemies caught in the electrified web suffer continuous shocks, further amplifying the storm’s lethality."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art channels energy to power large areas or creates controlled environmental effects, such as generating rainfall or disabling enemy fortifications."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Voltage Chain Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "The user generates chains of electricity that extend and wrap around targets, binding them in place while delivering continuous shocks.",
    "tags": [
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user generates chains of electricity that extend and wrap around targets, binding them in place while delivering continuous shocks. The chains are semi-solid, glowing with an intense electrical current that hums with power."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Voltage Chain is perfect for immobilizing single targets or entangling groups of enemies. The continuous shocks weaken opponents over time, leaving them vulnerable to follow-up attacks. It can also be used to drag enemies into hazardous areas or hold them in place for an ally’s attack."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art secures unstable machinery or binds objects together temporarily in emergencies, making it a versatile tool for problem-solving. Its grappling mechanic adds a layer of tactical control not seen in other Arts."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Electro-Repulse Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "The user creates a powerful pulse of electromagnetic force, sending everything around them flying.",
    "tags": [
      "Healing",
      "Mobility",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user creates a powerful pulse of electromagnetic force, sending everything around them flying. Metal objects are repelled violently, and enemies within range are thrown back with shocking intensity."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Electro-Repulse clears space around the user in crowded fights, knocking enemies into hazardous terrain or away from key positions. The powerful repulsion effect disrupts enemy formations and provides breathing room for regrouping or launching a counterattack."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art moves debris or clears paths in emergencies, making it invaluable for rescue operations or creating space in confined areas. The repulsive force also stabilizes environments by moving dangerous objects or substances out of harm’s way."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Grounding, insulation, feedback, and accidental conduction can redirect the effect away from its intended path. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Rail Lance Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "Builds a straight electromagnetic rail of lightning that launches a charged projectile at extreme speed, trading area coverage for long-range accuracy and armor penetration.",
    "tags": [
      "Technique"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Builds a straight electromagnetic rail of lightning that launches a charged projectile at extreme speed, trading area coverage for long-range accuracy and armor penetration."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user establishes a narrow electromagnetic rail, aligns a charged projectile, and releases it before the target can leave the firing lane. It excels against armor, fortifications, and distant priority targets, but provides almost no crowd control once fired."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "With reduced power it can drive anchors, punch precise access holes, launch emergency lines across long gaps, or break a single reinforced obstruction without destroying everything around it."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The rail advertises its direction during charge-up and requires an unobstructed firing solution. Recoil, poor ammunition, magnetic interference, or a last-second obstruction can spoil the shot, while using full power near allies risks lethal overpenetration."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should emphasize repeatability, recovery, and safe cancellation rather than raw output alone. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Capacitor Vault Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "Plants charged nodes that absorb only electrical attacks, store the current, and discharge it later in a programmed sequence; overloaded nodes detonate unpredictably.",
    "tags": [
      "Defense"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Plants charged nodes that absorb only electrical attacks, store the current, and discharge it later in a programmed sequence; overloaded nodes detonate unpredictably."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Charged nodes can be arranged as traps, defensive batteries, or a delayed counterattack. A skilled user lets an enemy's Lightning power fill the network, then releases the stored current through chosen lanes and timings instead of returning it immediately."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The nodes can hold emergency power, stabilize a temporary grid, preserve energy for equipment, or sequence a controlled restart after a blackout."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The vault accepts electrical energy only; heat, kinetic force, and other Styles bypass it. Every node has a finite capacity, and damaged wiring or an overloaded charge can trigger an unpredictable discharge into nearby people, structures, or the user."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Neuromotor Override Arts": {
    "style": "Lightning",
    "tier": "Tier 3",
    "summary": "Locks onto a target's bioelectric signals to interrupt coordination or force a limb movement while the user maintains concentration; strong Nature Energy can resist it.",
    "tags": [
      "Detection",
      "Mobility",
      "Control"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Locks onto a target's bioelectric signals to interrupt coordination or force a limb movement while the user maintains concentration; strong Nature Energy can resist it."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user reads and interferes with a target's bioelectric motor signals, causing a missed step, locked joint, dropped weapon, or forced limb motion. It is strongest as a precise opening for an ally rather than as permanent control of an entire body."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "At careful settings it can test damaged nerve pathways or help a willing patient rehearse a movement during rehabilitation, though it still does not heal the underlying injury."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The link demands continuous concentration and a stable signal. Strong Nature Energy, unfamiliar anatomy, insulation, distance, pain tolerance, or erratic movement can break the lock; forcing control too hard risks neural injury to the target and feedback into the caster."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Quantum Phase Arts": {
    "style": "Lightning",
    "tier": "Forbidden",
    "summary": "Converts the user’s body into pure electrical energy, allowing them to phase through objects and travel through conductive materials.",
    "tags": [
      "Healing",
      "Mobility",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Converts the user’s body into pure electrical energy, allowing them to phase through objects and travel through conductive materials. While in this form, the user becomes a shimmering silhouette of lightning."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user avoids enemy attacks by phasing through them and performs devastating ambushes by re-materializing inside enemy defenses. Anything conductive they pass through becomes electrified, shocking foes or disrupting systems."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Quantum Phase enables infiltration of heavily secured areas or bypassing barriers. The user can travel quickly through electrical grids or machinery, making it ideal for high-speed transport."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Extended use risks destabilizing the user’s physical form, and non-conductive environments render the Art unusable."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Apex Storm Arts": {
    "style": "Lightning",
    "tier": "Forbidden",
    "summary": "The user ascends into a state of lightning-fueled empowerment, their body surrounded by a storm of destructive energy.",
    "tags": [
      "Healing",
      "Mobility",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user ascends into a state of lightning-fueled empowerment, their body surrounded by a storm of destructive energy. Every movement generates arcs of lightning, and the storm’s chaotic winds tear apart the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The storm enhances the user’s speed, strength, and reflexes to near-divine levels. Every attack releases destructive shockwaves, and the storm itself strikes randomly at nearby enemies, overwhelming entire armies."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Apex Storm can supercharge areas with energy, revitalizing failing systems, or obliterate physical barriers to clear paths or destroy enemy fortifications."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The storm is volatile and difficult to control, leading to collateral damage. The immense strain on the user’s body risks serious harm after prolonged use."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Eternal Tempest Arts": {
    "style": "Lightning",
    "tier": "Forbidden",
    "summary": "The user summons a world-altering storm that rages with unrelenting fury.",
    "tags": [
      "Disruption",
      "Creation",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user summons a world-altering storm that rages with unrelenting fury. Lightning rains from the heavens, guided by the user’s will, while thunder shakes the earth and winds devastate everything in their path."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Eternal Tempest blankets an entire region in chaos, continuously striking enemies with lightning. The storm amplifies the user’s Techniques and Arts, creating opportunities for overwhelming attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art reshapes weather on a massive scale, disrupting enemy forces or aiding allies by creating beneficial conditions. Entire infrastructures can be destroyed under its power."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The storm often harms allies or unintended targets, and the massive energy drain leaves the user vulnerable once the Art ends."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should distinguish the intended system from allies, infrastructure, and secondary effects in the same area. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Synchronic Rift Arts": {
    "style": "Lightning",
    "tier": "Forbidden",
    "summary": "The user creates a massive network of electrified pathways across the battlefield.",
    "tags": [
      "Detection",
      "Mobility",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user creates a massive network of electrified pathways across the battlefield. By phasing into the network, they move at lightning speed, leaving behind ghostly afterimages that lash out with electrical attacks."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user becomes nearly impossible to track as they phase between pathways, while afterimages overwhelm enemies with constant strikes. The electrified network itself paralyzes foes who step into it, creating a deadly zone of control."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Synchronic Rift functions as a rapid transport system in emergencies or secures key areas by creating an impenetrable defensive field."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Maintaining the electrified network rapidly depletes Nature Energy, and losing focus risks trapping the user mid-phase."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Armageddon Core Arts": {
    "style": "Lightning",
    "tier": "Forbidden",
    "summary": "The user condenses the entirety of their Nature Energy into a single, unstable orb of plasma-infused lightning, creating a weapon of unparalleled destruction.",
    "tags": [
      "Healing",
      "Defense",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user condenses the entirety of their Nature Energy into a single, unstable orb of plasma-infused lightning, creating a weapon of unparalleled destruction. The orb’s energy warps the air around it, threatening to explode with catastrophic force."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user can unleash the orb in a controlled detonation, leveling everything within a massive radius, or fire it as a concentrated beam to disintegrate anything in its path. Holding the orb acts as a shield, deflecting attacks while building its destructive potential."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Armageddon Core serves as a last-resort tool to annihilate overwhelming threats. If stabilized, it could theoretically provide limitless energy."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The user sacrifices all remaining Nature Energy, leaving them powerless after the attack. Mismanagement risks premature detonation, harming allies and the user."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Wrath Nexus Arts": {
    "style": "Lightning",
    "tier": "Forbidden",
    "summary": "Transforms the user into a living lightning storm that draws power from the atmosphere, redirecting constant strikes while greatly enhancing speed and strength.",
    "tags": [
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user becomes a living lightning storm, drawing energy directly from the atmosphere. Lightning continuously strikes their body, which they redirect outward as devastating attacks. The constant influx of power enhances their speed and strength to godlike levels."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Wrath Nexus overwhelms entire battlefields with continuous lightning strikes, while every physical attack becomes explosively charged. The user can channel the storm’s fury into concentrated blasts or devastating area attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The Art disrupts enemy strongholds by overloading their systems or obliterating their defenses entirely."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art’s unstable nature puts the user and allies at risk, and prolonged use can cause physical and mental burnout."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should distinguish the intended system from allies, infrastructure, and secondary effects in the same area. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Mirage Blitz Arts": {
    "style": "Lightning",
    "tier": "Forbidden",
    "summary": "The user moves at blinding speeds, leaving behind electrified mirages that persist as autonomous attackers.",
    "tags": [
      "Mobility",
      "Control",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user moves at blinding speeds, leaving behind electrified mirages that persist as autonomous attackers. Each step creates a shockwave, and the mirages amplify the chaos by striking enemies from every direction."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Mirage Blitz confuses and overwhelms enemies with unpredictable attacks, making it nearly impossible to pinpoint the real user. The shockwaves disorient and push foes into vulnerable positions, while the mirages deliver precise and devastating strikes."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art allows for unparalleled mobility, enabling the user to evade even the most dangerous attacks or infiltrate heavily secured areas. The electrified afterimages can also act as decoys to lure enemies away from allies or objectives."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Maintaining the speed and creating mirages rapidly depletes Nature Energy, leaving the user exhausted. Losing control risks injuring allies caught in the shockwaves."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Atom Arts": {
    "style": "Lightning",
    "tier": "Forbidden",
    "summary": "A rare Chiratsuki clan Art that commands Positive, Negative, and Neutral electric atoms, building precise techniques or dangerously self-multiplying collapse spirals.",
    "tags": [
      "Destruction",
      "Mobility",
      "Defense",
      "Detection",
      "Creation"
    ],
    "source": "Atom Arts Glossary - Version 2.0",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Atom Arts is a rare, Forbidden Lightning-Style Art developed by the Chiratsuki clan. It manipulates three kinds of electrically charged atoms - Positive, Negative, and Neutral - whose different behaviors let the user attack, absorb energy, shape constructs, move through a prepared field, or build compound reactions. Its true power comes from understanding how those three functions interact rather than treating them as interchangeable projectiles."
        ],
        "bullets": []
      },
      {
        "title": "The three atom functions",
        "body": [],
        "bullets": [
          "Positive atoms are the offensive charge. They release intense electrical energy as beams or bolts, can be transferred into other forms, and can mark people or objects as destinations the user may transfer to.",
          "Negative atoms specialize in defense and absorption. They draw Nature Energy from incoming attacks or the surrounding environment and can maintain a passive Flicker Field for motion detection and short-range repositioning.",
          "Neutral atoms are moldable stabilizers. They become weapons, shields, and projectiles while collecting excess Positive energy, regulating absorption, and holding unstable combinations together."
        ]
      },
      {
        "title": "Combination mechanics",
        "body": [
          "A Negative atom cannot safely absorb a Positive atom. The failed absorption instead creates more atoms - commonly three Positives and one Negative - which repeat the conflict and accelerate the reaction. Neutral atoms can moderate that loop, but they do not erase its danger."
        ],
        "bullets": [
          "Spiral Collapse is the rapidly expanding Positive-Negative chain reaction. It should be released quickly before its growing energy load detonates around the user.",
          "Spiral Fusion, also called Double Collapse, compresses two separate Spiral Collapses into one exponentially more unstable attack. Its output is devastating, but practical control is extraordinarily difficult.",
          "The Triple-Atom Combo adds Neutral atoms as regulatory cores. They synchronize the chaotic loops, collect excess energy, and re-channel it so the spiral can remain active longer with greater precision."
        ]
      },
      {
        "title": "Combat applications",
        "body": [
          "A skilled user can alternate between direct Positive fire, Negative absorption, Neutral armaments, and sudden transfers to marked positions. Inside a Flicker Field, harmlessly orbiting Negative atoms report motion while giving the user multiple evasion points. At higher mastery, the battlefield becomes a network of charges, constructs, and prepared reactions whose roles can change faster than an opponent can read them."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & failure conditions",
        "body": [
          "Every failed Positive-Negative interaction increases the number of active atoms, the energy load, and the concentration required to prevent premature detonation. Holding Spiral Collapse too long can turn the technique into an uncontrolled blast, while fusing two spirals magnifies the instability far faster than it magnifies the user's ability to contain it. Neutral regulation creates time and precision, not immunity from catastrophic failure."
        ],
        "bullets": []
      },
      {
        "title": "Operational limits",
        "body": [
          "The system demands continuous awareness of charge type, atom count, placement, absorption load, and the condition of every Neutral regulator. Losing track of even one part can redirect a transfer, break a construct, or feed the wrong reaction. The Art rewards fast decisions, but punishes any decision made without an exit path."
        ],
        "bullets": []
      },
      {
        "title": "Final mastery paths",
        "body": [
          "Chusei and Yoshanai represent opposite solutions to the Art. Chusei pursues maximum output: one massive Spiral Collapse overloads a single Neutral atom and expands until it can reach sun-like scale. Yoshanai pursues calculation: countless miniature spirals are synchronized, compressed, and released as guided swarms that seek Nature Energy and disintegrate matter at the molecular level. Chusei masters overwhelming scale; Yoshanai masters stable mass production and targeting. Both paths remain Forbidden because one control error can turn the user's own system against everything nearby."
        ],
        "bullets": []
      }
    ]
  },
  "Heaven's Circuit Arts": {
    "style": "Lightning",
    "tier": "Forbidden",
    "summary": "Blankets a vast region in a living electrical lattice that can restart, silence, or rewrite nervous activity across many bodies; every command risks rebounding through the user's own nervous system.",
    "tags": [
      "Disruption"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Blankets a vast region in a living electrical lattice that can restart, silence, or rewrite nervous activity across many bodies; every command risks rebounding through the user's own nervous system."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "A living electrical lattice spreads across a vast region and connects to every nervous system it can reach. Within that network the user may restart stopped bodies, silence motor function, or issue coordinated neural commands on a scale no ordinary battlefield should permit."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "In the most restrained possible use, the circuit could coordinate mass rescue signals or restart many critically failing victims at once, but the difference between aid and violation is a matter of precision measured across thousands of lives."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Every body in the lattice becomes part of the same dangerous circuit. Resistance, contradictory commands, damaged nodes, or simple overload can rebound through the user's brain and heart, spread seizures through the population, or permanently rewrite neural pathways. This is Forbidden because failure is regional and indiscriminate."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should distinguish the intended system from allies, infrastructure, and secondary effects in the same area. A Lightning specialist learns to control voltage, pathing, timing, and grounding. The cleanest technique is not always the largest discharge: it is the one that reaches the intended target without feeding an enemy conductor or rebounding into allies."
        ],
        "bullets": []
      }
    ]
  },
  "Obscuring Ember Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Creates clouds of thick, ember-laden smoke that obscure vision and disorient enemies.",
    "tags": [
      "Detection",
      "Mobility",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates clouds of thick, ember-laden smoke that obscure vision and disorient enemies. The user controls the density, spread, and movement of the smoke, giving them a tactical advantage in battle."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Obscures enemy vision, disrupts their movements, and causes choking disorientation in confined spaces. The ember particles can cause minor burns, further weakening opponents."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Acts as a cover for escapes, misleads pursuers, or traps enemies in dense, blinding clouds. The embers can also ignite flammable materials within the smoke, creating chain reactions."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. The information still requires interpretation and may be confused by interference or deliberate decoys."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Infernal Surge Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Summons a massive, surging wall of fire that sweeps across the battlefield, consuming everything in its path.",
    "tags": [
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons a massive, surging wall of fire that sweeps across the battlefield, consuming everything in its path. The flames radiate intense heat, creating an oppressive battlefield environment."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Devastates groups of enemies and breaks through enemy formations or defenses with its overwhelming power. Forces opponents to retreat or scatter."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears dense vegetation, blocks enemy advances, or creates a temporary wall of flames to control the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Scorchfall Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Converts flames into cascading ash clouds that linger in the air and coat surfaces.",
    "tags": [
      "Detection",
      "Mobility",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Converts flames into cascading ash clouds that linger in the air and coat surfaces. The ash is dense and clings to opponents, obscuring their vision and disrupting their breathing."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Blinds and disorients enemies, forcing them to struggle for visibility and air. The clinging ash makes opponents easier to track or choke out."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Fertilizes soil, preserves objects by coating them in ash, or creates protective layers against heat and cold."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. The information still requires interpretation and may be confused by interference or deliberate decoys."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Wildfire Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Releases living flames that move independently, seek targets, and spread across the battlefield to flush enemies from cover or reshape terrain.",
    "tags": [
      "Detection",
      "Mobility",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Releases living flames that move and spread independently, seeking }"
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Flushes enemies out of hiding, overwhelms groups with chaotic attacks, and creates environmental hazards that force opponents to reposition."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears obstacles, burns through fortified barriers, or spreads fire across large areas for controlled burns or destruction."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. The information still requires interpretation and may be confused by interference or deliberate decoys."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Magmaflow Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Combines fire with earth elements to create and manipulate streams of molten lava.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Combines fire with earth elements to create and manipulate streams of molten lava. The glowing, molten rock flows at the user’s command, reshaping the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Forms molten barriers, burns through enemy armor, and traps foes in impassable terrain. Its intense heat and consistency make it devastating against groups or heavily armored enemies."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Aids in forging weapons, reshaping landscapes, or creating channels to redirect water or magma flows."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Heat Mirage Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Manipulates ambient heat to create shimmering waves that distort vision, disrupt airflow, and fatigue enemies.",
    "tags": [
      "Control",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Manipulates ambient heat to create shimmering waves that distort vision, disrupt airflow, and fatigue enemies. The intense heat creates an oppressive aura around the user."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Surrounds enemies with oppressive heat, sapping their stamina and focus while warping the air to make ranged attacks less accurate."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Softens metal for forging, dries wet terrain, or creates controlled environments for heat-based tasks."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Backdraft Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Detonates a controlled burst of flame behind the user or an object to create sudden movement, emergency braking, directional knockback, or close-range breaching force.",
    "tags": [
      "Mobility",
      "Control",
      "Creation"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Detonates a controlled burst of flame behind the user or an object to create sudden movement, emergency braking, directional knockback, or close-range breaching force."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "A directional flame burst provides sudden acceleration, braking, knockback, or close-range breaching. The user can change an exchange by moving a body or object at the exact moment an opponent has committed to a line of attack."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Backdraft can launch rescue lines, shift debris, arrest a dangerous fall, free jammed machinery, or give a stalled vehicle a short emergency push."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The burst still produces heat, sound, exhaust, and recoil. Poor alignment can spin the user, injure passengers, ignite nearby fuel, or turn the object being moved into a projectile; repeated bursts also overheat the launch point."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Brandmark Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Places a persistent heat sigil on a touched surface or target that reveals its location and can be remotely ignited for a small, focused burn.",
    "tags": [
      "Technique"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Places a persistent heat sigil on a touched surface or target that reveals its location and can be remotely ignited for a small, focused burn."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "A touched target carries a heat signature the user can track through darkness, crowds, or partial cover. The mark may later be ignited as a small focused burn, making it useful for pressure and timing without becoming a large explosive attack."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can label equipment, trace stolen property, mark a safe route, identify a structural point for later cutting, or provide a persistent thermal beacon during rescue."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The user must first place the mark, and strong cooling, insulation, purification, distance, or enough time can weaken it. Remote ignition is deliberately narrow; trying to force more damage makes the signature unstable and easier to detect or remove."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should emphasize repeatability, recovery, and safe cancellation rather than raw output alone. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Flareburst Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Produces a compact flash of flame for signaling, exposing concealed silhouettes, or briefly blinding observers while creating very little sustained heat.",
    "tags": [
      "Detection",
      "Disruption"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Produces a compact flash of flame for signaling, exposing concealed silhouettes, or briefly blinding observers while creating very little sustained heat."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "A compact flash exposes hidden silhouettes, breaks visual focus, interrupts an ambush, or gives allies a clear signal without leaving a sustained blaze behind. It is a tempo tool rather than a finishing attack."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Different colors and patterns can serve as coded signals, emergency beacons, route markers, or a brief source of high-contrast light for search and rescue."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Anyone looking toward the flare can be affected, including allies and the user. Eye protection, distance, solid cover, or advance warning reduces its value, and repeated flashes quickly reveal the caster's location."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Cauterize Arts": {
    "style": "Fire",
    "tier": "Tier 2",
    "summary": "Uses a narrow sterile flame to stop bleeding and disinfect a wound, stabilizing the patient without restoring damaged tissue or preventing pain.",
    "tags": [
      "Healing"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Uses a narrow sterile flame to stop bleeding and disinfect a wound, stabilizing the patient without restoring damaged tissue or preventing pain."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "A narrow sterile flame seals severe bleeding and reduces surface contamination long enough to evacuate a wounded person. It is painful emergency stabilization and should never be mistaken for tissue restoration."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The same precision can sterilize instruments, close a controlled incision, destroy contaminated material, or provide exact heat where an open fire would be unsafe."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Cauterization damages tissue and can conceal deeper bleeding or infection. The Art requires medical judgment, restraint, and pain management; excess heat can destroy nerves, worsen a wound, or make later healing more difficult."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Detonation Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Condenses fire into volatile orbs that explode on impact, releasing fiery shockwaves.",
    "tags": [
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Condenses fire into volatile orbs that explode on impact, releasing fiery shockwaves. The explosions radiate intense heat, leaving behind scorched craters and waves of residual flame."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Detonation Art devastates large areas, breaking through defenses and scattering enemy formations with its sheer explosive force. The shockwaves disorient and damage anyone caught in the blast radius."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Demolishes structures, clears debris, and excavates terrain with surgical precision or destructive power."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must value aim, exclusion zones, and aftermath as highly as maximum output. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Phoenix Rebirth Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Conjures golden flames imbued with regenerative properties, capable of healing the user or allies.",
    "tags": [
      "Healing"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Conjures golden flames imbued with regenerative properties, capable of healing the user or allies. These soothing flames radiate warmth, mending wounds and restoring vitality."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Restores stamina and heals injuries mid-battle, allowing the user and their allies to maintain peak performance. The flames can also temporarily boost resilience by strengthening the body."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Aids in recovery from prolonged combat or illness, accelerates natural healing processes, and purifies areas of disease or corruption."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Sacred Flame Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Summons ethereal flames used for ceremonial purposes, binding contracts, purifying areas, or enhancing other fire Arts.",
    "tags": [
      "Control",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons ethereal flames used for ceremonial purposes, binding contracts, purifying areas, or enhancing other fire Arts. These flames burn with a steady, mystical glow."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Boosts allied fire users by enhancing their flame intensity or granting their attacks unique properties. The user can also disrupt enemy flames by “consecrating” the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Used in cultural ceremonies, purification rites, or as a tool for enchanting objects with fire-aligned energy."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Solar Incineration Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Harnesses the sun’s energy to unleash searing beams of fire capable of incinerating anything in their path.",
    "tags": [
      "Disruption",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Harnesses the sun’s energy to unleash searing beams of fire capable of incinerating anything in their path. The beams burn white-hot, vaporizing materials with pinpoint precision."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Vaporizes enemies with high-intensity, long-range attacks. The beams are perfect for eliminating heavily armored foes or fortified structures."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Provides a near-limitless heat source for forging, melts materials for crafting, or illuminates vast areas with blinding light."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should distinguish the intended system from allies, infrastructure, and secondary effects in the same area. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Ember Haven Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Creates a sanctuary of ember-laden smoke imbued with regenerative flames.",
    "tags": [
      "Healing",
      "Defense",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a sanctuary of ember-laden smoke imbued with regenerative flames. Allies within the haven recover stamina and heal wounds, while enemies are blinded, disoriented, and choked by the smoke."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Protects allies in the heat of battle by creating a healing zone while hindering enemies with thick smoke and ember burns. It serves as both a defensive stronghold and a regenerative hub."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Ember Haven can purify areas, restore vitality to weakened allies, or create a safe zone during extended engagements. The regenerative smoke also aids in curing illnesses or revitalizing flora."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Scorchline Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Creates a blazing line of fire that ripples with intense heat, distorting vision and making the battlefield nearly impassable.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a blazing line of fire that ripples with intense heat, distorting vision and making the battlefield nearly impassable. The fire’s intensity warps the air, creating shimmering mirages that disorient enemies."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Forces enemies into vulnerable positions by cutting off their routes and disorienting their vision. The oppressive heat saps their stamina, making them easier to overpower."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Scorchline can burn through dense obstacles, clear terrain, or act as a defensive perimeter to protect key areas."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Amber Shroud Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Combines superheated, controllable smoke with adaptive molten resin that can burn, trap, form weapons or barriers, harden into durable amber, and briefly let the user phase into smoke or resin.",
    "tags": [
      "Creation",
      "Control",
      "Defense"
    ],
    "source": "Amber Shroud archive",
    "sections": [
      {
        "title": "Overview",
        "body": [
          "AmberShroud Arts is a rare dual-element Nature Art combining superheated smoke with molten, adaptive resin (that can eventually harden into amber). It focuses on creating custom weapons, battlefield control, toxic fogs, and high-pressure slicing power through heat and smoke manipulation. Laziel Vulcan, its wielder, is both artistic and destructive—matching his chaotic, hyper nature."
        ],
        "bullets": []
      },
      {
        "title": "Resin Modes — Boiling Resin",
        "body": [],
        "bullets": [
          "Appearance: Thin, fast-flowing liquid with an orange glow.",
          "Function: Used for projectiles, flooding terrain, or coating weapons.",
          "Traits: Extremely hot and ignitable. Can burn flesh or melt soft materials.",
          "Common use: Ammo for pistols, boiling traps, or surprise blasts."
        ]
      },
      {
        "title": "Resin Modes — Thick Resin",
        "body": [],
        "bullets": [
          "Appearance: Honey-thick, highly viscous and sticky.",
          "Function: Used for traps, restraints, or coating terrain.",
          "Traits: Slows movement, extremely flammable, harder to remove.",
          "Common use: Hidden landmines, smoke-covered puddles, explosive zones."
        ]
      },
      {
        "title": "Resin Modes — Hardened Amber",
        "body": [],
        "bullets": [
          "Appearance: Golden-brown, semi-transparent hardened resin.",
          "Function: Forged into weapons, armor, or structures.",
          "Traits: Weak when raw, becomes tough and durable when infused with Nature energy.",
          "Common use: Main weapon material, especially Laz’s massive layered sword."
        ]
      },
      {
        "title": "Smoke Mechanics",
        "body": [
          "Laz’s smoke is different from normal fire smoke. It's thick, heavy, controllable, and often carries his resin particles within. It can be ignited remotely, shaped, compressed into projectiles, and even made to rotate at high speeds for cutting or propulsion."
        ],
        "bullets": []
      },
      {
        "title": "Smoke Mechanics — Smoke Forms & Progressions",
        "body": [],
        "bullets": [
          "Passive Smoke: Drifts naturally off Laz’s body and weapons.",
          "Ignited Smoke: Superheated smoke bursts that ignite resin or terrain.",
          "Toxic Resin Smoke: Infused with resin particles; slows enemies, burns lungs.",
          "Rotational Smoke: Laz can rotate smoke streams to cut, redirect attacks, or launch himself.",
          "Pressure Smoke: Highly pressurized bursts for propulsion or concussive force."
        ]
      },
      {
        "title": "Combination Techniques",
        "body": [
          "The beauty of AmberShroud Arts lies in how seamlessly resin and smoke work together."
        ],
        "bullets": [
          "Weapons can be coated in smoke, which burns hotter without damaging the amber.",
          "Resin puddles or traps can be remotely ignited using smoke.",
          "Laz’s pistols shoot resin bullets with smoke cores that explode on contact.",
          "Fog attacks are loaded with sticky resin vapor and sliced through by smoke-blade shrapnel."
        ]
      },
      {
        "title": "Final Thoughts",
        "body": [
          "AmberShroud is a true fusion art—refined, reactive, and incredibly dangerous in the right hands. It represents Laziel’s duality: goofy but genius, carefree but deadly, chaotic but deliberate."
        ],
        "bullets": []
      },
      {
        "title": "Final Thoughts — Laziel’s Amber Sword",
        "body": [
          "Laziel’s primary weapon is an 8-foot amber sword that he has forged over his entire life. He layers it with hardened amber—layer upon layer—infused with his own Nature energy. This infusion makes the blade unnaturally durable and able to withstand extreme heat without cracking or melting. The blade itself appears almost pitch black due to the dense smoke circulating through its inner layers, while its edges glow with an amber trim. When Laziel channels his smoke into the weapon, it begins to swirl with heat, glowing faint red and emitting trails of controlled vapor. His bond with this blade is so deep, only his will can cause it to melt or alter form."
        ],
        "bullets": []
      },
      {
        "title": "Final Thoughts — Resin as Defense",
        "body": [
          "Laziel can generate thick, warm resin that hardens rapidly upon impact with air or another surface. He uses this resin as a defensive wall, capable of stopping physical strikes, blunting blade impacts, and absorbing blunt force. This resin can be deployed in sheets, domes, or layered slabs—molded and adjusted on the fly through his mastery of Nature energy. Additionally, these resin barriers can be ignited by his smoke remotely, making any attempt to destroy them potentially lethal."
        ],
        "bullets": []
      },
      {
        "title": "Final Thoughts — Resin and Smoke Phasing",
        "body": [
          "Through intense mastery and complete synergy with his own Nature energy, Laziel can phase parts of his body—or in rare moments, his entire form—into either thick smoke or molten resin. In smoke form, he becomes an elusive blur, hard to detect and nearly untouchable, perfect for dodging or sneaking behind enemies. In molten resin form, his movement becomes sluggish and dangerous, but it allows him to slide through cracks, escape bonds, or re-emerge elsewhere in surprise. This technique is draining and cannot be maintained for long, especially the resin state, which risks burning him from the inside if sustained too long."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should include dismantling or safely deactivating everything the technique creates. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Lava Bloom Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Summons molten fire blooms that erupt from the ground, spreading molten lava and feral flames across the battlefield.",
    "tags": [
      "Detection",
      "Mobility",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons molten fire blooms that erupt from the ground, spreading molten lava and feral flames across the battlefield. These fiery blooms move unpredictably, overwhelming enemies with chaos and destruction."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Creates an area of extreme danger, trapping enemies in a chaotic zone of molten rock and living fire. It is especially effective against groups, forcing them to scatter or be consumed."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Lava Bloom reshapes terrain, clears obstacles, and can be used for large-scale controlled burns in crafting or landscaping."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Fuel, oxygen, stored heat, smoke, and secondary ignition remain hazards after the visible technique ends. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. The information still requires interpretation and may be confused by interference or deliberate decoys."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Thermal Reversal Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Draws nearby heat into a compact flame core, weakening fires and cooling the area before releasing the stored heat as a concentrated blast or protective ring.",
    "tags": [
      "Defense"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Draws nearby heat into a compact flame core, weakening fires and cooling the area before releasing the stored heat as a concentrated blast or protective ring."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user pulls heat out of fires, surfaces, or the surrounding air and condenses it into a compact flame core. This can weaken an enemy Fire technique or create a sudden cold zone before the stored heat is released as a concentrated blast or defensive ring."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can suppress a fire, cool machinery, protect heat-sensitive cargo, thaw or temper material with the later release, and move dangerous heat away from trapped civilians."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art transfers heat rather than erasing it. The core becomes increasingly unstable as it fills, cold shock can damage people and materials near the intake, and the user must eventually vent or place the stored energy somewhere safe."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Furnace Mantle Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Surrounds the user with layered radiant heat that softens armor, vaporizes weak projectiles, and punishes close attackers, but rapidly consumes stamina.",
    "tags": [
      "Technique"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Surrounds the user with layered radiant heat that softens armor, vaporizes weak projectiles, and punishes close attackers, but rapidly consumes stamina."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Layered radiant heat softens nearby armor, deforms weak projectiles, and makes grappling range punishing. The mantle moves with the user, turning personal space into a steadily intensifying hazard rather than a single outward blast."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "At lower output it can keep a group alive in extreme cold, dry soaked equipment, soften material for shaping, or protect a worker from brief contact with hostile heat."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The mantle consumes stamina continuously and heats the environment, the user's equipment, and anyone standing close. Insulation and distance reduce its effect, while a lapse in control can cause dehydration, friendly burns, or structural ignition."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should emphasize repeatability, recovery, and safe cancellation rather than raw output alone. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Firebreak Arts": {
    "style": "Fire",
    "tier": "Tier 3",
    "summary": "Converts combustible material along a chosen boundary into inert ash, stopping an advancing blaze and creating a controlled line that new flames cannot easily cross.",
    "tags": [
      "Control"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Converts combustible material along a chosen boundary into inert ash, stopping an advancing blaze and creating a controlled line that new flames cannot easily cross."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user draws a boundary and converts combustible material along it into inert ash, denying an advancing Fire technique the fuel it needs. The line can also divide a battlefield, expose concealed paths, or prevent flames from spreading behind a retreat."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Firebreak is designed for wildfire containment, evacuation corridors, protection of buildings, and controlled removal of dangerous fuel before an ignition event."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The line only affects combustible material within the user's control and cannot stop radiant heat, molten matter, explosions, or flames that leap the gap. Creating a wide boundary permanently destroys whatever fuel, plants, or possessions occupied it."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Hellfire Arts": {
    "style": "Fire",
    "tier": "Forbidden",
    "summary": "Summons black flames that burn hotter and longer than any natural fire.",
    "tags": [
      "Control",
      "Creation",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons black flames that burn hotter and longer than any natural fire. These flames consume everything indiscriminately, including water and even other forms of energy."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Hellfire Art devastates battlefields, annihilating all enemies and leaving nothing but ash. The black flames are nearly impossible to extinguish, making them a true weapon of mass destruction."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Rarely used outside of combat due to its uncontrollable nature, though it can reshape the environment permanently by incinerating entire landscapes."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Hellfire’s uncontrollable nature means it can harm allies and the user if not carefully managed. Its intensity drains massive amounts of Nature Energy, leaving the user vulnerable."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Pyroclasm Arts": {
    "style": "Fire",
    "tier": "Forbidden",
    "summary": "Combines fire and earth energies to create massive volcanic eruptions, releasing magma, ash, and molten rock in devastating waves.",
    "tags": [
      "Control",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Combines fire and earth energies to create massive volcanic eruptions, releasing magma, ash, and molten rock in devastating waves. The ground itself becomes a weapon under the user’s control."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Pyroclasm Art destroys entire armies with its sheer scale, burying foes under molten rock and suffocating them in clouds of burning ash. The eruptions also disrupt enemy formations and render terrain impassable."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Alters the landscape permanently, creating mountains, rivers of magma, or impassable terrain to cut off enemy advances."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art’s indiscriminate destruction makes it a last-resort weapon, and the massive energy drain leaves the user unable to sustain other Techniques."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Infernal Bloom Arts": {
    "style": "Fire",
    "tier": "Forbidden",
    "summary": "Combines Wildfire and Phoenix Arts, creating fiery blossoms that regenerate allies while incinerating enemies nearby.",
    "tags": [
      "Healing",
      "Detection",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Combines Wildfire and Phoenix Arts, creating fiery blossoms that regenerate allies while incinerating enemies nearby. These blooms spread and grow, consuming everything in their path."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Heals allies within range while delivering devastating damage to enemies caught in the blooms’ radius. The spreading effect makes it perfect for area denial and large-scale battles."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Restores damaged ecosystems with controlled regenerative fires or creates living fire installations as acts of artistic destruction."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The blooms’ chaotic growth makes them hard to control, and their spread can harm unintended targets if not contained."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Ashen Spiral Arts": {
    "style": "Fire",
    "tier": "Forbidden",
    "summary": "The user gains mastery in combining both black flames and dense, toxic burning smoke, shaping them into rotating weapons of mass destruction.",
    "tags": [
      "Detection",
      "Defense",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user gains mastery in combining both black flames and dense, toxic burning smoke, shaping them into rotating weapons of mass destruction. Hellfire-imbued smoke twists and contorts into whirling blades, hammers, or massive serpentine constructs that attack relentlessly. The black flames cling to the smoke, spreading destruction while the smoke chokes and blinds enemies."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Ashen Tempest allows the user to unleash spinning weapons of Hellfire and smoke that can cut through entire armies, trap enemies in suffocating zones of black fire, and reshape the battlefield with deadly precision. The user’s control extends to creating massive, rotating barriers or lashing tendrils of smoke and flame to attack from multiple angles simultaneously. The suffocating smoke disorients enemies, while the unextinguishable black flames ensure no one escapes unscathed."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "This Art can transform entire landscapes, carving through terrain with flaming constructs and leaving behind ash-choked wastelands. It is ideal for long-term environmental denial, creating impassable zones of smoke and Hellfire."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The sheer power of Ashen Tempest drains Nature Energy at an extreme rate, requiring immense focus to maintain. The chaotic nature of Hellfire-imbued smoke makes it difficult to control precisely, risking harm to allies or the user."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Flame Warden Arts": {
    "style": "Fire",
    "tier": "Forbidden",
    "summary": "The user merges with the essence of fire itself, transforming into a being of living flame.",
    "tags": [
      "Mobility",
      "Defense",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user merges with the essence of fire itself, transforming into a being of living flame. Their body radiates intense heat, and their movements leave trails of fire that ignite everything they touch."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Flame Warden grants near-invulnerability as physical attacks pass through the user’s fiery form, while their strikes ignite devastating explosions. The battlefield becomes a blazing inferno under their control."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Protects allies by shielding them with intense heat fields and neutralizes incoming projectiles by incinerating them mid-flight."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The user’s fiery form rapidly drains Nature Energy, and overuse risks permanently losing their physical body to the fire."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Cataclysm Tempest Arts": {
    "style": "Fire",
    "tier": "Forbidden",
    "summary": "Unleashes a spiraling torrent of molten explosions, creating a massive vortex of fire, lava, and shockwaves.",
    "tags": [
      "Control",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Unleashes a spiraling torrent of molten explosions, creating a massive vortex of fire, lava, and shockwaves. The spiral expands outward, obliterating everything in its path while reshaping the terrain into molten chaos."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Cataclysm Spiral devastates entire armies and strongholds, creating an impenetrable zone of destruction that forces enemies to retreat or perish. The combined fire and lava leave long-lasting hazards on the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Permanently alters landscapes, creating volcanic craters or rivers of lava to deter enemy advances or fortify allied positions."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art’s destructive scale is nearly impossible to control, and the immense energy drain leaves the user in a weakened state for a prolonged period."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Blazing Eternity Arts": {
    "style": "Fire",
    "tier": "Forbidden",
    "summary": "The user creates an eternal flame fueled directly by their Nature Energy and life force.",
    "tags": [
      "Detection",
      "Defense",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user creates an eternal flame fueled directly by their Nature Energy and life force. This flame burns indefinitely, consuming everything it touches while spreading endlessly unless extinguished by the user."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Blazing Eternity overwhelms enemies with unrelenting, ever-growing flames, creating an unstoppable force of destruction that persists long after the battle ends."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Creates barriers of endless fire to block key areas, destroys enemy fortifications permanently, or serves as a lasting warning to deter future attacks."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The user sacrifices part of their life force to sustain the eternal flame, and failure to extinguish it can lead to uncontrollable destruction."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Starheart Arts": {
    "style": "Fire",
    "tier": "Forbidden",
    "summary": "Compresses the user's fire into a miniature stellar furnace whose radiance can melt fortifications; losing control incinerates the surrounding area and may consume the caster.",
    "tags": [
      "Control",
      "Destruction"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Compresses the user's fire into a miniature stellar furnace whose radiance can melt fortifications; losing control incinerates the surrounding area and may consume the caster."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user compresses Fire Nature into a miniature stellar furnace whose radiance and pressure can melt fortifications before direct contact. It can be focused as a devastating core or allowed to radiate outward as an expanding zone of impossible heat."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "There is almost no ordinary utility at full scale; a perfectly restrained fragment could power forging or an emergency energy system, but maintaining that restraint is itself a Forbidden act."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The furnace feeds on the caster's Nature Energy and then their body when that energy falters. A damaged containment field can flash-incinerate the surrounding area, blind observers, poison the air, and consume the user from within. The Art is Forbidden because its failure behaves like a disaster, not a missed attack."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Fire specialist learns heat control, fuel awareness, oxygen management, and safe extinguishing. Precision matters around allies and structures because stored heat, secondary ignition, and smoke can remain dangerous after the visible flame is gone."
        ],
        "bullets": []
      }
    ]
  },
  "Mist Veil Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Generates a thick, swirling mist that blankets the battlefield, obscuring vision and dampening sound.",
    "tags": [
      "Healing",
      "Defense",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Generates a thick, swirling mist that blankets the battlefield, obscuring vision and dampening sound. The mist cools and invigorates allies while disorienting and confusing enemies."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Provides cover for ambushes, stealth maneuvers, and strategic retreats. The disorienting mist makes enemies’ ranged attacks less accurate and hinders coordination."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Protects crops and machinery from extreme heat, creates natural camouflage, or humidifies dry areas to restore balance."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Ice Shard Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Freezes water into razor-sharp shards that launch with incredible speed and precision.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Freezes water into razor-sharp shards that launch with incredible speed and precision. The user can create volleys of shards or a single, massive spear of ice."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Deals piercing damage, bypassing armor and shields. The shards can target multiple foes or focus devastating power on a single opponent."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Creates stable structures in freezing environments, forms temporary tools or weapons, or chills perishable goods."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Whirlpool Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Creates spinning vortexes in water bodies, trapping and pulling enemies into their depths.",
    "tags": [
      "Control",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates spinning vortexes in water bodies, trapping and pulling enemies into their depths. The vortexes grow in size and intensity based on the user’s control."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Immobilizes and drowns enemies in aquatic environments, leaving them helpless. The Art also disrupts enemy ships or waterborne platforms."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears underwater debris, disrupts aquatic predators, or redirects water flows."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Rain Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Summons torrential rain over a wide area, soaking the battlefield and replenishing water supplies.",
    "tags": [
      "Healing",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons torrential rain over a wide area, soaking the battlefield and replenishing water supplies. The rain cools the environment, extinguishing flames and boosting water-based Techniques."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Weakens fire-based enemies, reduces visibility for opponents, and enhances other water Arts by saturating the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Revives drought-stricken lands, restores water supplies, or aids in large-scale agricultural efforts."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Hydro Healing Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Channels water imbued with minerals and Nature Energy to heal wounds and restore vitality.",
    "tags": [
      "Healing"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Channels water imbued with minerals and Nature Energy to heal wounds and restore vitality. The water glows faintly, soothing pain and purifying toxins."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Rapidly heals allies in battle, allowing them to maintain peak performance. The restorative energy also purifies poisons or other harmful effects."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Revitalizes damaged crops, purifies contaminated water sources, or supports long-term recovery efforts."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Tidal Grip Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Summons tendrils of water that lash out to grab and immobilize enemies.",
    "tags": [
      "Mobility",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons tendrils of water that lash out to grab and immobilize enemies. The tendrils are fluid and strong, capable of adapting to their targets’ movements."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Restrains enemies mid-combat, preventing dodges or counters. The tendrils can also snatch weapons or throw opponents off balance."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Assists in rescue missions by lifting or moving heavy objects or saving individuals trapped in dangerous areas."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Bubble Enclosure Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Forms large, reinforced bubbles of water that trap enemies or protect allies.",
    "tags": [
      "Mobility",
      "Defense",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Forms large, reinforced bubbles of water that trap enemies or protect allies. The bubbles shimmer with refracted light, making them both mesmerizing and difficult to predict."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Encases enemies in unbreakable bubbles, restraining their movements or suffocating them. For allies, the bubbles act as mobile, protective shields."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Transports fragile items, provides oxygen for underwater exploration, or creates temporary shelters in hazardous environments."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Mirror Current Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Shapes thin moving films of water that bend light, creating false reflections, concealing movement, redirecting glare, or providing a view around obstacles.",
    "tags": [
      "Detection",
      "Mobility",
      "Creation"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Shapes thin moving films of water that bend light, creating false reflections, concealing movement, redirecting glare, or providing a view around obstacles."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Moving water films bend light to create false positions, hide a real movement, redirect glare, or give the user a view around cover. The illusion changes with the current, making it more convincing than a fixed reflection when used with disciplined timing."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can provide periscope-like sight, conceal an evacuation, reflect a signal, inspect a dangerous corner, or soften intense light without creating a solid barrier."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art needs a clean, stable film. Dust, freezing, evaporation, splashing, turbulent air, or an observer viewing from several angles can expose the distortion, and it creates no physical protection once discovered."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Echo Depth Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Sends subtle pressure ripples through nearby water and reads their return, mapping submerged spaces, hidden objects, and moving bodies even in darkness.",
    "tags": [
      "Detection"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Sends subtle pressure ripples through nearby water and reads their return, mapping submerged spaces, hidden objects, and moving bodies even in darkness."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Pressure ripples travel through water and return a map of submerged movement, hidden bodies, obstacles, and changes in depth. It lets the user fight without light or direct sight as long as the target shares the same connected water."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can survey flooded structures, search for survivors, inspect hulls, map underwater tunnels, or locate lost objects without entering every space."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Disconnected pools, bubbles, violent turbulence, multiple overlapping waves, and sound-dampening material can fragment the return. The Art reveals shape and motion more reliably than identity, so interpretation remains a learned skill."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Dewpoint Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Condenses moisture from the air into clean beads, ropes, or a drinking reserve, but produces very little water in extremely dry environments.",
    "tags": [
      "Technique"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Condenses moisture from the air into clean beads, ropes, or a drinking reserve, but produces very little water in extremely dry environments."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user draws ambient moisture into beads, ropes, or thin films that can wet surfaces, reveal airflow, interfere with fine powder, or provide the small supply needed to begin another Water technique."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Its primary value is survival: clean drinking water, wound washing, condensation collection, humidity control, and a dependable reserve in places where no open water is visible."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Dewpoint cannot ignore local humidity. Dry air, extreme cold, contamination, and rapid collection over a large area sharply reduce output, and producing combat-scale volume would take too long to matter."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should emphasize repeatability, recovery, and safe cancellation rather than raw output alone. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Surface Tension Arts": {
    "style": "Water",
    "tier": "Tier 2",
    "summary": "Reinforces the cohesion of a water surface so people can step across it or catch light objects, though heavy impacts collapse the platform.",
    "tags": [
      "Mobility",
      "Destruction"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Reinforces the cohesion of a water surface so people can step across it or catch light objects, though heavy impacts collapse the platform."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Reinforced cohesion turns a water surface into a temporary platform that supports footwork, catches light debris, or redirects a low-mass projectile. It creates unexpected angles without freezing or solidifying the water."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The platform can support a careful crossing, keep supplies afloat, stabilize a rescue target, prevent a small object from sinking, or create a temporary work surface."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The surface fails under concentrated weight, heavy impact, violent waves, or loss of focus. It does not protect anything below the water and can collapse suddenly if too many people treat it like permanent ground."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Abyss Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Manipulates the crushing pressure of deep water to immobilize or damage enemies.",
    "tags": [
      "Mobility",
      "Defense",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Manipulates the crushing pressure of deep water to immobilize or damage enemies. The immense force manifests as invisible walls of water that compress and hold targets."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Pins enemies in place or crushes them with overwhelming pressure. The Art is especially effective against armored foes or larger opponents."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Removes underwater obstacles, retrieves sunken treasures, or provides pressure shielding in deep-sea exploration."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Geyser Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Forces water from the ground in powerful bursts, creating scalding jets or shockwaves.",
    "tags": [
      "Control",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Forces water from the ground in powerful bursts, creating scalding jets or shockwaves. The geysers erupt with explosive force, launching enemies into the air."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Launches enemies or disrupts their formations with explosive geysers. The boiling water adds an extra layer of damage."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Creates natural hot springs, clears blocked water channels, or generates bursts of energy for water-powered systems."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Crystal Blast Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Freezes water into intricate, unbreakable crystalline structures.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Freezes water into intricate, unbreakable crystalline structures. These formations can trap, defend, or act as conduits for light."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Creates nearly indestructible shields or sharp crystal spikes to impale foes. The formations can also disorient enemies with refracted light."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Useful for crafting tools, amplifying light in dark environments, or creating defensive structures in hazardous areas."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Cascade Grasp Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Summons flowing tendrils of water imbued with healing properties, allowing the user to bind enemies while restoring vitality to themselves or allies.",
    "tags": [
      "Healing",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons flowing tendrils of water imbued with healing properties, allowing the user to bind enemies while restoring vitality to themselves or allies. The tendrils are flexible and glowing with restorative energy."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Simultaneously restrains enemies and siphons their energy to heal the user or their allies. The tendrils can also redirect enemy attacks by pulling their limbs off balance."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "In rescue missions, the healing tendrils can stabilize injured individuals while lifting them to safety. They can also purify harmful substances or stabilize collapsing structures."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Abyssal Surge Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Channels the depths of the ocean into a devastating torrent of water that crashes and rebounds across the battlefield.",
    "tags": [
      "Mobility",
      "Control",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Channels the depths of the ocean into a devastating torrent of water that crashes and rebounds across the battlefield. The surge moves with tidal force, obliterating obstacles and sweeping enemies aside."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Overwhelms enemies with a massive, unrelenting wave that ricochets off surfaces, attacking from multiple angles. The tidal force crushes weaker foes and scatters groups."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears debris, carves pathways through obstacles, or floods large areas for tactical control."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Bubble Fortress Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Creates a massive dome of crystalline water bubbles that acts as an impenetrable fortress.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a massive dome of crystalline water bubbles that acts as an impenetrable fortress. The bubbles are reinforced with frozen barriers, shimmering like stained glass."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Protects allies by creating an invincible shelter or traps enemies within the fortress for focused attacks. The structure also reflects incoming energy-based attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Provides a mobile base of operations, shelters large groups from environmental hazards, or serves as a temporary structure in emergencies."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Maelstrom Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Summons a massive spinning vortex of water that engulfs the battlefield, pulling everything into its inescapable currents.",
    "tags": [
      "Mobility",
      "Control",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons a massive spinning vortex of water that engulfs the battlefield, pulling everything into its inescapable currents. The swirling waters carry incredible force, tearing apart anything caught within."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Immobilizes and destroys enemies with its devastating pull, making it nearly impossible to escape. The Art also disrupts projectiles and disorients flying opponents."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears entire areas of debris, redirects water sources, or traps aquatic predators."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Available volume, temperature, contamination, and interrupted flow determine how much control the user can maintain. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Pressure Needle Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Compresses water into hair-thin jets that cut, puncture, or disable small mechanisms with surgical accuracy instead of broad destructive force.",
    "tags": [
      "Disruption"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Compresses water into hair-thin jets that cut, puncture, or disable small mechanisms with surgical accuracy instead of broad destructive force."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Hair-thin water jets puncture armor joints, sever restraints, disable tendons, or cut mechanisms without the wide destruction of a wave. The technique rewards anatomical and mechanical knowledge more than raw volume."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can perform precision cutting, clear a blocked line, shape fine material, open locks, or remove damaged components in places where a larger tool cannot fit."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The jet has little stopping power outside its narrow line and loses coherence with distance or insufficient pressure. A small aiming error can cause catastrophic injury, while heavy barriers, absorption, or disturbed flow can spoil the cut."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should distinguish the intended system from allies, infrastructure, and secondary effects in the same area. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Undertow Passage Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Creates a concealed directional current through connected water that carries allies or cargo along a prepared route, weakening wherever the waterway is interrupted.",
    "tags": [
      "Disruption",
      "Creation"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a concealed directional current through connected water that carries allies or cargo along a prepared route, weakening wherever the waterway is interrupted."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "A concealed directional current carries allies, equipment, or the user along a prepared route through connected water. It enables quiet repositioning, extraction, or a sudden flanking approach without creating a visible surface wave."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The passage can move cargo through canals, speed underwater rescue, maintain a hidden supply route, or guide swimmers safely through confusing flooded terrain."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The route fails wherever the water is interrupted, narrowed, contaminated, or violently opposed. Every passenger adds load, and anyone who enters the current without preparation may be carried to the wrong exit or unable to breathe during transit."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should distinguish the intended system from allies, infrastructure, and secondary effects in the same area. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Brine Crucible Arts": {
    "style": "Water",
    "tier": "Tier 3",
    "summary": "Separates dissolved salts, minerals, and contaminants from existing water, producing potable water or a concentrated corrosive brine but not removing dry poisons.",
    "tags": [
      "Technique"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Separates dissolved salts, minerals, and contaminants from existing water, producing potable water or a concentrated corrosive brine but not removing dry poisons."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user separates dissolved material from existing water, leaving a concentrated brine that can corrode exposed equipment, irritate wounds, or create a dense zone that changes buoyancy and flow."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Its central purpose is purification: producing potable water, recovering useful salts or minerals, treating contaminated reserves, and preparing controlled solutions for medicine or industry."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art can separate what is dissolved or suspended in water; it cannot remove a dry poison already inside a body or create water from nothing. The concentrated waste remains hazardous and must be contained rather than abandoned."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should emphasize repeatability, recovery, and safe cancellation rather than raw output alone. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Tidal Wave Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "Summons an enormous wave that crashes over everything in its path, reshaping the landscape and drowning opposition.",
    "tags": [
      "Healing",
      "Mobility",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons an enormous wave that crashes over everything in its path, reshaping the landscape and drowning opposition. The wave rises with a deafening roar, carrying unmatched destructive force."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Wipes out entire armies, obliterates defenses, and leaves behind a flooded battlefield to the wielder’s advantage."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Floods areas to restore aquatic habitats, creates natural barriers, or redirects entire waterways."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The sheer scale of the wave risks collateral damage to allies and the environment. The user is drained of Nature Energy after use."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Frozen Tempest Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "Combines mist and ice to create a storm of freezing rain and hail.",
    "tags": [
      "Defense",
      "Control",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Combines mist and ice to create a storm of freezing rain and hail. The battlefield becomes an icy wasteland as the Art intensifies, locking foes in place."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Slows and damages enemies over time, immobilizing them in ice while the hail pelts relentlessly."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Alters weather patterns to freeze over large bodies of water, create protective ice fields, or preserve ecosystems."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The storm is difficult to control and may harm allies or disrupt allied plans. Prolonged use risks freezing the user’s body."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Lifeblood Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "Merges Hydro Healing and Blood Arts, creating a restorative effect that purifies allies’ bodies while draining strength from foes.",
    "tags": [
      "Healing"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Merges Hydro Healing and Blood Arts, creating a restorative effect that purifies allies’ bodies while draining strength from foes. The water takes on a faint red glow, pulsing with life energy."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Simultaneously heals allies and weakens enemies, drawing their vitality to fuel the wielder’s strength."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Balances ecosystems by reinvigorating life and clearing toxins, or sustains entire groups in extreme conditions."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Requires the user to offer their own blood as a catalyst, limiting prolonged use. The draining effect risks leaving the user vulnerable."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Abyss Dominion Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "Transforms the battlefield into an endless abyss, summoning deep ocean currents and pressure that crush everything within range.",
    "tags": [
      "Creation",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Transforms the battlefield into an endless abyss, summoning deep ocean currents and pressure that crush everything within range. The Art creates an aquatic dome filled with inescapable, suffocating darkness."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Drowns enemies, crushes them with pressure, and disorients survivors in the darkness. The relentless current drags all but the strongest to their doom."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Alters the landscape permanently, turning battlefields into deep, water-filled craters or entire lakes."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The immense Nature Energy required risks the user’s survival. The abyss remains unstable and may collapse on the user if focus falters."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should include dismantling or safely deactivating everything the technique creates. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Ocean's Wrath Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "Summons a cataclysmic tidal wave combined with a massive whirlpool at its center.",
    "tags": [
      "Control",
      "Creation",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons a cataclysmic tidal wave combined with a massive whirlpool at its center. The wave sweeps across the battlefield, dragging everything into the vortex and destroying all in its wake."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Devastates entire armies with the wave’s force while the whirlpool traps survivors in an inescapable spiral."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Reconfigures entire ecosystems by reshaping coastlines, creating new water sources, or sinking enemy fortifications."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art’s massive scale makes it nearly impossible to control. Its use risks catastrophic damage to allies and the environment."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Eternal Ice Prison Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "Encases an entire area in unbreakable, enchanted ice that traps enemies and halts time within its bounds.",
    "tags": [
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Encases an entire area in unbreakable, enchanted ice that traps enemies and halts time within its bounds. The frozen zone becomes a timeless prison, preserving everything within indefinitely."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Immobilizes entire armies or fortifications, freezing them in time while the user regains control of the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Preserves ecosystems, creates defensive perimeters, or stores vital resources for future use."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The frozen area is indiscriminate, affecting allies, foes, and even the environment permanently unless undone by the user. The immense energy drain leaves the user weakened and vulnerable."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Leviathan Ascension Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "Summons a colossal water serpent or leviathan formed entirely of water, ice, and vapor.",
    "tags": [
      "Control",
      "Creation",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons a colossal water serpent or leviathan formed entirely of water, ice, and vapor. The leviathan acts as an extension of the user’s will, unleashing chaos upon the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The leviathan crushes, freezes, and drowns enemies with its enormous strength, sweeping through battlefields with unstoppable force. Its icy breath creates frozen wastelands, immobilizing survivors."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Reshapes terrain, creates massive bodies of water, or acts as a guardian for important sites."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Maintaining control of the leviathan requires immense focus. Losing control risks the leviathan turning on allies or the user."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Aether Sphere Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "Creates visually identical water spheres that may imprison, crush, explode, or deliver cumulative hallucinogenic exposure, forcing opponents to gamble on every bubble.",
    "tags": [
      "Defense",
      "Control",
      "Creation",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "The user forms enormous translucent spheres from layered water membranes and suspended mist. Each shell can serve as a prison, barrier, mobile environment, pressure chamber, or bomb. Different spheres may contain boiling water, suffocating vapor, crushing pressure, or a hallucinogenic suspension, yet the user can give every shell the same glow, refraction, and low hum. Reading the outside does not reveal what will happen when a sphere closes or ruptures."
        ],
        "bullets": []
      },
      {
        "title": "Hallucinogenic payload",
        "body": [
          "An Aether Sphere can disperse a fine psychoactive mist or condensate that enters through breathing, the eyes, or prolonged skin contact. Exposure stacks: early doses distort distance and color, repeated doses produce phantom movement and delayed sensory impressions, and severe saturation can make a target misidentify allies, exits, and even which spheres are real threats. The effect is biochemical rather than psychic - it cannot read thoughts or create a true illusion - but that limitation makes it harder to resist through willpower alone."
        ],
        "bullets": [
          "The user may disguise explosive and hallucinogenic spheres as an identical set, making hesitation part of the attack.",
          "False detonations, refracted silhouettes, and lingering afterimages can make a dosed opponent waste defenses on harmless shells while ignoring the destructive one.",
          "Dose strength depends on concentration, exposure time, body size, protective filtration, and the target's physiology; it is powerful uncertainty, not guaranteed control."
        ]
      },
      {
        "title": "Combat applications",
        "body": [
          "The user can encase groups in hostile environments, compress a sealed sphere until pressure overwhelms its contents, or rupture it as a catastrophic water bomb. Defensive spheres intercept attacks or isolate allies from battlefield hazards. The hallucinogenic option changes the tactical rhythm: an opponent who dodges every bubble may be herded into the real explosive, while one who breaks the wrong shell may spread the hidden dose across their own formation."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Stable spheres can contain hazardous substances, transport creatures or allies through hostile terrain, isolate contaminated material, or act as temporary emergency shelters. Their layered membranes can keep a controlled internal atmosphere separate from the surrounding area, though every added payload makes safe handling more demanding."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Maintaining several large spheres with different internal conditions consumes immense focus and Nature Energy. A lost shell may rupture unpredictably, release its hallucinogen into allies, or detonate close to the user. The psychoactive dose is difficult to calibrate across different bodies and can cause panic, injury, or dangerous lingering effects beyond the intended target. Massive pressure or explosive spheres also threaten the surrounding environment even when they hit correctly."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Mastery is the ability to keep pressure, membrane thickness, payload concentration, movement, and detonation timing independent across many visually identical spheres. The hallucinations remain Water-aligned because they are carried through liquid and mist and alter the body through exposure; the Art does not gain mental control or illusion casting. A Forbidden user must also plan an abort route for every sphere, because uncertainty is only useful while the caster still knows exactly which bubble is which."
        ],
        "bullets": []
      }
    ]
  },
  "Sanguine Ascendancy Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "A Forbidden Water-Style Art that governs the user's blood, cells, and circulation through Scarlet Bloom, Ivory Bloom, and lethal Blood Boiling amplification.",
    "tags": [
      "Healing",
      "Technique",
      "Creation",
      "Defense",
      "Disruption"
    ],
    "source": "Blood Arts - Blood Boiling and Scarlet/Ivory Bloom documentation",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Sanguine Ascendancy is total command of blood as the body's living current. The user controls circulation, cellular balance, density, and the conversion of external water into replacement blood. Its three central systems are Scarlet Bloom for physical output, Ivory Bloom for defense and repair, and Blood Boiling for dangerous whole-body amplification. Used together, they turn the body into a self-fueling combat engine whose greatest resource is also the one resource it cannot afford to lose."
        ],
        "bullets": []
      },
      {
        "title": "Scarlet Bloom & Ivory Bloom",
        "body": [
          "The two Blooms scale through invoked multipliers such as x3, x5, or x10. Higher multipliers create stronger results but push cell counts, blood pressure, and immune behavior farther outside safe limits. Neither pathway is harmless, and one cannot permanently cancel the consequences of the other."
        ],
        "bullets": [
          "Scarlet Bloom multiplies and empowers red blood cells, flooding the body with oxygen. It increases strength, agility, reaction speed, perception, stamina, and short-term resistance to fatigue.",
          "Ivory Bloom cultivates white blood cells to accelerate the repair of skin, muscle, and bone, resist Nature Energy-based poisons or foreign energies, purge corruption, and stabilize the body after Scarlet Bloom or Blood Boiling.",
          "Scarlet overgrowth can rupture vessels, hemorrhage the brain, distort vision, trigger spasms, or collapse the user. Ivory overgrowth can malfunction into fever, weakness, and an autoimmune attack in which the enhanced cells assault the user's own body."
        ]
      },
      {
        "title": "Blood Boiling",
        "body": [
          "Blood Boiling is the Art's primal amplifier. The user accelerates circulation and converts Nature Energy into dangerous internal heat, increasing muscle output, agility, reaction speed, and pain suppression while temporarily driving Scarlet Bloom beyond its normal ceiling. Steam rises through the pores as the body approaches failure. Ivory Bloom can be layered over it for emergency repair, but doing both at once requires exceptional control."
        ],
        "bullets": [
          "Simmer: light steam and a controlled adrenaline increase with the lowest immediate strain.",
          "Burn: a clear strength increase, red skin glow, and rapidly rising stamina cost.",
          "Rage Heat: darkened vessels, heavy vapor, and skin beginning to crack under the internal pressure.",
          "Red Veil: red-tinted vision, a distorted voice, trembling, extreme damage output, and accelerating internal injury.",
          "Hell Surge: an expert-only berserker state in which blood may ignite and skin chars. Ivory Bloom is required merely to improve the chance of survival."
        ]
      },
      {
        "title": "Foundational blood techniques",
        "body": [],
        "bullets": [
          "Blood Hardening infuses the user's blood with Nature Energy and solidifies it into shields, blades, projectiles, armor plates, or interlocking defensive structures.",
          "Blood Creation converts an external water source into the user's own blood. It can replace losses and extend a fight, but rapid or high-volume conversion is mentally and physically exhausting.",
          "Bloodborne Disturbance begins after the user's blood enters an opponent through a wound, vapor, or injection. Depending on dose and location, it can provoke dizziness, nausea, twitching, or disorientation and create an opening rather than an instant kill."
        ]
      },
      {
        "title": "Combat applications",
        "body": [
          "The Art can shift from armored defense to explosive close combat without changing its underlying resource. Scarlet Bloom supplies speed and force, hardened blood becomes equipment, and Bloodborne Disturbance punishes even a shallow successful cut. Ivory Bloom keeps accumulated trauma from ending the fight immediately, while Blood Creation can restore lost volume when water is available. Blood Boiling is the final escalation: it allows the user to overpower their normal limits now by accepting injuries that may become impossible to repair later."
        ],
        "bullets": []
      },
      {
        "title": "Blood Stasis recovery",
        "body": [
          "A skilled user can cool the body after Blood Boiling through an Ivory Bloom or a deliberate redirection of Nature Energy. This triggers Blood Stasis, a cryogenic recovery state that slows the heart and gives damaged cells time to stabilize and repair. It is not a free reset. The user becomes immobile and highly vulnerable for the duration, so entering Stasis without protection can be as lethal as remaining overheated."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & catastrophic failure",
        "body": [
          "Sanguine Ascendancy repeatedly pushes the brain, vessels, muscles, bones, organs, and immune system beyond their natural operating range. Blood Boiling can fry neurons, causing confusion, hallucinations, seizures, or permanent damage. Muscles may tear, bones may fracture under amplified force, organs may cook internally, and extreme use can evaporate the user's blood until they lose consciousness or die. Healing one failure with a stronger Ivory Bloom risks replacing heat trauma with autoimmune collapse."
        ],
        "bullets": []
      },
      {
        "title": "Mastery & Style boundary",
        "body": [
          "Forbidden mastery is not the highest multiplier; it is the ability to balance oxygenation, immunity, heat, blood volume, and structural reinforcement without letting one correction trigger another crisis. This remains a Water-Style Art because it governs a living fluid, its flow, its cells, and water-to-blood conversion. Blood Boiling's heat and possible ignition are physiological consequences of acceleration and overload, not Fire-Style control: the user cannot command outside flames through this Art. That boundary keeps the system unified around blood rather than mixing Styles."
        ],
        "bullets": []
      }
    ]
  },
  "First Spring Arts": {
    "style": "Water",
    "tier": "Forbidden",
    "summary": "Opens a primordial source that creates water without a nearby supply; its output continually grows and can cause continent-scale flooding unless the spring is resealed.",
    "tags": [
      "Creation"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Opens a primordial source that creates water without a nearby supply; its output continually grows and can cause continent-scale flooding unless the spring is resealed."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user opens a primordial source that generates water without drawing from a nearby supply. Even a restrained opening can flood defenses, erase terrain advantages, and feed every other Water technique in the area."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "If held to a thread, the spring could end a drought or sustain a population, but it is not a simple faucet: the source keeps growing while it remains connected to the world."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Output accelerates beyond the user's original command and pressure rises as the spring expands. Failure to reseal it can drown cities, alter weather and coastlines, or continue toward continent-scale flooding. This Art is Forbidden because creation has no natural stopping point once control is lost."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should include dismantling or safely deactivating everything the technique creates. A Water specialist learns to measure volume, pressure, phase, purity, and flow as one system. The Style becomes strongest when the user redirects existing motion and supply instead of spending Nature Energy to force water against its environment."
        ],
        "bullets": []
      }
    ]
  },
  "Wind Scythe Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Creates visible arcs of wind that slice through enemies or objects with precision and speed.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates visible arcs of wind that slice through enemies or objects with precision and speed. Unlike subtle techniques, the scythes are powerful and audible, resembling physical weapons made of air."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Ideal for mid-range combat, cutting through armor, shields, or multiple foes in a sweeping attack."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Effective for clearing debris, shaping materials, or precise cutting tasks."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Vacuum Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Removes air from a localized area, creating a vacuum that disrupts breathing, nullifies sound, or extinguishes flames.",
    "tags": [
      "Mobility",
      "Control",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Removes air from a localized area, creating a vacuum that disrupts breathing, nullifies sound, or extinguishes flames. The vacuum appears as a ripple in the air."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Suffocates enemies or nullifies fire-based attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears dangerous gases, creates controlled environments for experiments, or silences an area for stealth missions."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Gale Force Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Summons strong, continuous winds capable of pushing back multiple enemies or objects.",
    "tags": [
      "Mobility",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons strong, continuous winds capable of pushing back multiple enemies or objects. The winds howl and shake the environment visibly."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Keeps enemies at bay, disrupts formations, or knocks them off their feet."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Moves large debris, powers wind-based machinery, or cools overheated areas."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Mist Gale Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Combines mist and wind to create swirling clouds of vapor that blanket the battlefield.",
    "tags": [
      "Defense",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Combines mist and wind to create swirling clouds of vapor that blanket the battlefield. The mist obscures vision while the swirling wind subtly redirects attacks."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Provides cover for stealth maneuvers, ambushes, or retreats. The swirling mist confuses enemies, making it harder to aim or coordinate."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Protects areas from extreme heat, increases humidity, or creates dramatic environmental shifts."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Shielding Breeze Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Wraps the user in swirling currents of air that deflect small projectiles and reduce incoming damage.",
    "tags": [
      "Healing",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Wraps the user in swirling currents of air that deflect small projectiles and reduce incoming damage."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Protects the user or allies from arrows, debris, or weaker ranged attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Shields others from harsh weather, redirects airborne particles, or stabilizes delicate structures."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Zephyr Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Creates bursts of wind underfoot, propelling the user with great speed.",
    "tags": [
      "Mobility",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates bursts of wind underfoot, propelling the user with great speed. The user becomes a blur as they streak across the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Enables rapid dashes to evade or close the gap with enemies. The bursts can also create temporary lift for acrobatics."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Useful for long-distance travel, avoiding falling hazards, or crossing unstable terrain."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Pressure Snap Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Compresses air into a small, high-pressure zone that detonates on release, creating a shockwave.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Compresses air into a small, high-pressure zone that detonates on release, creating a shockwave. The blast is localized but incredibly powerful."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Knocks back enemies in a small radius, breaks through defenses, or disorients targets with concussive force."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears debris, breaks locks or barriers, or creates controlled demolitions."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Tempest Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Summons a violent windstorm that spreads chaos across the battlefield.",
    "tags": [
      "Detection",
      "Defense",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons a violent windstorm that spreads chaos across the battlefield. The winds roar ferociously, flinging objects, enemies, and debris in every direction."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Perfect for area control, scattering foes, disrupting formations, and overwhelming weaker opponents."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears large areas of debris, creates natural barriers, or hinders enemy advances with intense winds."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. The information still requires interpretation and may be confused by interference or deliberate decoys."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Spiral Current Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Creates spiraling air currents that pull enemies or objects into their center, immobilizing or disorienting them.",
    "tags": [
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates spiraling air currents that pull enemies or objects into their center, immobilizing or disorienting them. The spiral spins with increasing intensity, lifting lighter objects off the ground."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Traps enemies in a vortex, rendering them vulnerable to follow-up attacks or throwing them off balance."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Gathers scattered materials, redirects airborne threats, or clears loose obstacles with focused force."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Resonance Veil Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Controls vibrations carried through the air to mute a zone, carry a voice, imitate a sound, or amplify a focused sonic impact.",
    "tags": [
      "Mobility",
      "Control"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Controls vibrations carried through the air to mute a zone, carry a voice, imitate a sound, or amplify a focused sonic impact."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "By shaping vibration in the air, the user can mute footsteps, carry a whisper to one ally, imitate a distracting sound, or focus a brief sonic impact against balance and hearing. It controls information and attention more than raw wind force."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The veil can create private conversation zones, amplify an emergency call, damp dangerous noise, reproduce a known tone, or improve acoustics across a large room."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The user must understand the sound being shaped. Solid conduction, vacuum, chaotic noise, ear protection, and constantly changing air currents reduce precision; excessive amplification can injure allies or the caster's own hearing."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Scentline Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Separates and follows trace particles moving through the air, allowing the user to track a person, identify hazards, or redirect a scent away from allies.",
    "tags": [
      "Detection"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Separates and follows trace particles moving through the air, allowing the user to track a person, identify hazards, or redirect a scent away from allies."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user separates airborne trace particles to follow a target, reveal an unseen creature, detect a chemical hazard, or redirect an identifying scent away from allies. It remains useful after visual tracks have disappeared."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Scentline can locate leaks, spoiled supplies, smoke sources, missing people, animals, or contaminants and can keep a rescue route from being masked by stronger background odors."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Rain, sealed environments, filters, teleportation, fire, time, and violently mixed air can break or confuse a trail. The Art detects particles, not truth; deliberate decoys and similar scents demand careful comparison."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Air Pocket Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Maintains a small bubble of breathable air around a person in smoke, toxic gas, or underwater, but cannot protect against pressure or direct impact.",
    "tags": [
      "Defense"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Maintains a small bubble of breathable air around a person in smoke, toxic gas, or underwater, but cannot protect against pressure or direct impact."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "A small bubble of breathable air keeps one person conscious in smoke, toxic gas, or underwater long enough to escape or continue a rescue. It filters the immediate breathing space but offers no armor against the surrounding threat."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The pocket supports diving, firefighting, contaminated-area evacuation, enclosed-space rescue, and emergency breathing for a patient whose airway must remain clear."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "It does not resist deep-water pressure, heat, direct impact, radiation, or toxins that act through skin. The pocket is small, time-limited, and vulnerable to violent turbulence; protecting several people divides the user's attention and air supply."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Featherfall Arts": {
    "style": "Wind",
    "tier": "Tier 2",
    "summary": "Layers controlled updrafts beneath falling people or debris to produce a safe descent, without providing the lift needed for true flight.",
    "tags": [
      "Mobility",
      "Control"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Layers controlled updrafts beneath falling people or debris to produce a safe descent, without providing the lift needed for true flight."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Layered updrafts slow falling allies, civilians, or debris, denying an enemy the damage expected from a drop. The user can also soften a leap or protect a group forced from high ground."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It is designed for rescue from buildings, aircraft, cliffs, and collapsed structures, and can lower fragile cargo without ropes or heavy machinery."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Featherfall reduces descent but does not provide true lift or horizontal flight. Very heavy mass, a sudden impact, enclosed shafts, crosswinds, or too little stopping distance can overwhelm the available airflow."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Cyclone Arts": {
    "style": "Wind",
    "tier": "Tier 3",
    "summary": "Forms a massive spinning vortex of wind that sucks in objects and enemies, trapping them in a whirling prison.",
    "tags": [
      "Mobility",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Forms a massive spinning vortex of wind that sucks in objects and enemies, trapping them in a whirling prison. The cyclone’s core is highly unstable and destructive."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Immobilizes enemies and inflicts sustained damage, leaving them vulnerable to follow-up attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Captures airborne threats, clears pathways dramatically, or removes obstacles with sheer force."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Whisper Blade Arts": {
    "style": "Wind",
    "tier": "Tier 3",
    "summary": "Generates silent, invisible slashes of wind that cut through enemies with surgical precision.",
    "tags": [
      "Detection",
      "Defense",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Generates silent, invisible slashes of wind that cut through enemies with surgical precision. The slashes leave faint distortions in the air but create no sound."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Ideal for stealth-based attacks, catching enemies off guard with undetectable strikes. The user can unleash rapid flurries of invisible blades to dominate the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Cuts through bindings, barriers, or obstacles silently, making it ideal for precision tasks in delicate environments."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. The information still requires interpretation and may be confused by interference or deliberate decoys."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Pressure Wave Arts": {
    "style": "Wind",
    "tier": "Tier 3",
    "summary": "Unleashes a shockwave of compressed wind that ripples outward, blasting everything within range.",
    "tags": [
      "Defense",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Unleashes a shockwave of compressed wind that ripples outward, blasting everything within range. The wave crushes weaker barriers and creates destructive aftershocks."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Devastates groups of enemies with a single blast, disorienting survivors and disrupting their formations. The aftershocks can weaken enemy defenses over time."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears hazardous areas, demolishes structures, or creates a defensive perimeter in seconds."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Slicing Tempest Arts": {
    "style": "Wind",
    "tier": "Tier 3",
    "summary": "Summons a raging storm filled with countless blades of wind that slice through everything in their path.",
    "tags": [
      "Defense",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons a raging storm filled with countless blades of wind that slice through everything in their path. The storm is both destructive and precise, creating chaos while delivering surgical strikes."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Shreds enemy ranks, disables fortifications, and scatters forces with relentless precision. The storm’s reach ensures no target is safe."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears dense environments, reshapes landscapes, or creates a protective barrier of swirling blades."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Serene Flow Arts": {
    "style": "Wind",
    "tier": "Tier 3",
    "summary": "Manipulates air currents to create a zone of perfect stillness and clarity.",
    "tags": [
      "Mobility",
      "Disruption",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Manipulates air currents to create a zone of perfect stillness and clarity. Within this zone, the user moves with enhanced precision and speed, while enemies find their movements slowed and their attacks disrupted."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Grants the user enhanced evasion and attack speed while hindering enemy mobility and coordination. Ideal for one-on-one duels or evading large groups."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Creates stable conditions for delicate tasks or calms turbulent weather, ensuring precision in high-stakes environments."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Skyborne Dominion Arts": {
    "style": "Wind",
    "tier": "Tier 3",
    "summary": "Allows the user to take complete control of the skies, flying at incredible speeds while manipulating the air around them.",
    "tags": [
      "Mobility",
      "Defense",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Allows the user to take complete control of the skies, flying at incredible speeds while manipulating the air around them. The user creates powerful gusts that keep enemies grounded while granting allies aerial advantages."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Dominates the battlefield from above, attacking from unreachable positions and suppressing enemy movement below. The user can also shield airborne allies with controlled winds."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Enables long-distance travel, rescues stranded allies, or transports fragile materials safely through hazardous conditions."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, enclosed spaces, pressure trauma, and changing airflow can turn a clean effect into an unstable one. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Slipstream Arts": {
    "style": "Wind",
    "tier": "Tier 3",
    "summary": "Creates a stable corridor of accelerated air that reduces drag and propels allies, vehicles, or projectiles along a chosen route without granting full flight.",
    "tags": [
      "Mobility",
      "Creation"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a stable corridor of accelerated air that reduces drag and propels allies, vehicles, or projectiles along a chosen route without granting full flight."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "A low-drag corridor accelerates allies, vehicles, or projectiles along a chosen route. It is strongest as team infrastructure: a prepared lane for rapid entry, escape, reinforcement, or a precisely boosted strike."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Slipstreams can reduce travel time and fuel use, support high-speed couriers, guide aircraft through a safe approach, or move supplies rapidly across open distance."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The corridor follows a route rather than granting free flight. Sharp turns, crosswinds, obstacles, turbulence, and an overloaded lane destabilize it; anyone entering at the wrong angle may be thrown outward at dangerous speed."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Atmosphere Lens Arts": {
    "style": "Wind",
    "tier": "Tier 3",
    "summary": "Compresses and thins transparent layers of air to bend light, distort distance, or view faraway details; turbulence quickly breaks the effect.",
    "tags": [
      "Detection"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Compresses and thins transparent layers of air to bend light, distort distance, or view faraway details; turbulence quickly breaks the effect."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Transparent layers of compressed and thinned air bend light to magnify distant details, distort range, create a false horizon, or spoil an opponent's aim. It is a precision observation and deception Art rather than an opaque illusion."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The lens can scout across long distances, inspect high structures, improve navigation, focus a signal, or provide temporary magnification without physical optics."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Turbulence, heat shimmer, smoke, precipitation, moving observers, and disrupted pressure layers break the image. Stronger magnification narrows the field of view and demands stillness, making the user vulnerable while reading fine detail."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should separate a true signal from clutter, decoys, and the user's own expectations. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Barometric Lock Arts": {
    "style": "Wind",
    "tier": "Tier 3",
    "summary": "Seals a target inside nested air-pressure layers that resist movement and incoming objects; breaking the shell releases a dangerous decompression burst.",
    "tags": [
      "Mobility",
      "Defense",
      "Control"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Seals a target inside nested air-pressure layers that resist movement and incoming objects; breaking the shell releases a dangerous decompression burst."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Nested layers of air pressure resist a target's movement and deflect objects trying to cross the shell. The lock can isolate a dangerous fighter, hold debris in place, or buy time without filling the enclosure with solid material."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can stabilize a damaged chamber, contain gas or dust, protect a delicate operation, or temporarily seal a breach while repairs are prepared."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The layers store pressure as they are stressed. A violent break can release a decompression burst that injures everyone nearby, and the user must continually balance breathable air, temperature, and the force arriving from both sides."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Hurricane Sovereign Arts": {
    "style": "Wind",
    "tier": "Forbidden",
    "summary": "Summons a colossal hurricane spanning miles, with winds powerful enough to level fortifications and reshape landscapes.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons a colossal hurricane spanning miles, with winds powerful enough to level fortifications and reshape landscapes. The hurricane carries debris, rain, and lightning, becoming an unstoppable force of destruction."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Wipes out armies, obliterates defenses, and creates a battlefield of pure chaos. The relentless winds make it nearly impossible for enemies to stand, let alone fight."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Alters weather patterns to devastate enemy territories, create barriers, or replenish water supplies in drought-stricken regions."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The hurricane’s scale makes it uncontrollable, risking collateral damage to allies and the environment."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Celestial Spiral Arts": {
    "style": "Wind",
    "tier": "Forbidden",
    "summary": "Creates a towering spiral of wind that stretches into the heavens, drawing enemies and debris upward into a maelstrom of destruction.",
    "tags": [
      "Defense",
      "Control",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a towering spiral of wind that stretches into the heavens, drawing enemies and debris upward into a maelstrom of destruction. The user remains at its center, controlling the winds with absolute authority."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Immobilizes and crushes enemies within the spiral, rendering them helpless against its sheer force. The towering winds disrupt ranged attacks and even deflect aerial threats."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Redirects airborne dangers, reshapes terrain, or creates a temporary pathway into the skies."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Maintaining the spiral’s stability requires immense focus and drains Nature Energy rapidly. Losing control risks catastrophic backlashes."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Silent Cataclysm Arts": {
    "style": "Wind",
    "tier": "Forbidden",
    "summary": "Unleashes a storm of invisible, soundless wind blades that tear through everything in their path.",
    "tags": [
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Unleashes a storm of invisible, soundless wind blades that tear through everything in their path. The blades strike with surgical precision, leaving only destruction in their wake."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Decimates enemy forces without warning, striking with impossible speed and leaving survivors disoriented and defenseless. Perfect for ambushes or sudden assaults."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears dense environments or obstacles with minimal disturbance, allowing for precision work in delicate areas."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art’s soundless nature makes it difficult for allies to predict or avoid, posing risks in chaotic battlefields."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must value aim, exclusion zones, and aftermath as highly as maximum output. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Breath of Eternity Arts": {
    "style": "Wind",
    "tier": "Forbidden",
    "summary": "Manipulates the very essence of air, creating an endless, self-sustaining current that revitalizes allies while suffocating enemies.",
    "tags": [
      "Healing",
      "Detection",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Manipulates the very essence of air, creating an endless, self-sustaining current that revitalizes allies while suffocating enemies. The current spreads across the battlefield, controlling the flow of combat entirely."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Enhances allies’ speed and stamina while draining enemies’ energy, leaving them weakened and vulnerable. The Art can also deflect projectiles and attacks by shifting air currents."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Provides a continuous source of fresh air in hazardous conditions, sustains large groups during extended sieges, or powers wind-based machinery indefinitely."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The constant output of Nature Energy leaves the user highly vulnerable once the effect ends."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Zephyr's Judgment Arts": {
    "style": "Wind",
    "tier": "Forbidden",
    "summary": "Creates localized storm zones that unleash sporadic wind blades with devastating precision, shredding the battlefield and tearing fissures through the landscape.",
    "tags": [
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Calls upon the full wrath of the skies, to create localized Storm zones that also can summon countless sporadic wind blades that shred the battlefield. The blades strike with devastating precision, leaving fissures and torn landscapes in their wake."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Targets enemies across a wide area with pinpoint accuracy, decimating armies or defenses with relentless strikes. The Art is highly effective against heavily fortified positions."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Alters terrain permanently, clearing dense forests or collapsing mountain passes to block enemy advances without any warning."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art’s sheer scale makes it difficult to differentiate between friend and foe, requiring careful planning to avoid collateral damage."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Eternal Storm Arts": {
    "style": "Wind",
    "tier": "Forbidden",
    "summary": "Creates a permanent, localized storm that devastates everything within its range.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a permanent, localized storm that devastates everything within its range. The storm is fueled by the user’s Nature Energy and grows stronger the longer it is sustained. Lightning, hail, and gale-force winds ravage the area, making it uninhabitable."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Forces enemies to retreat or perish in the storm’s fury. Its constant output makes it impossible for opponents to regroup or counterattack."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Acts as an impenetrable barrier, securing strategic locations or deterring invaders."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The storm’s indiscriminate destruction affects allies and civilians alike. Its continuous drain on the user’s energy makes it unsustainable in prolonged engagements."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Shattering Silence Arts": {
    "style": "Wind",
    "tier": "Forbidden",
    "summary": "Compresses air into silent, invisible blades that detonate on impact, unleashing concussive shockwaves.",
    "tags": [
      "Defense",
      "Control",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Compresses air into silent, invisible blades that detonate on impact, unleashing concussive shockwaves. The user can launch a single devastating strike or a flurry of silent explosions, each capable of shredding through defenses and scattering enemies like leaves in a storm."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Perfect for both precision and wide-scale destruction. The silent blades cut through armor and barriers effortlessly, while their explosive aftermath disorients, immobilizes, and devastates everything within range. Ideal for ambushes or breaking enemy formations."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears large areas of obstacles, demolishes fortifications with surgical precision, or carves through dense materials with ease. The Art is also effective for creating safe passages through hazardous environments."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The dual nature of the Art—precision blades and concussive shockwaves—makes it energy-intensive. The explosions are unpredictable in close quarters, risking harm to the user or allies."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Heavenfall Arts": {
    "style": "Wind",
    "tier": "Forbidden",
    "summary": "Collapses a towering column of atmosphere downward across a wide territory, crushing structures with extreme pressure while leaving a volatile vacuum above the impact zone.",
    "tags": [
      "Mobility",
      "Destruction"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Collapses a towering column of atmosphere downward across a wide territory, crushing structures with extreme pressure while leaving a volatile vacuum above the impact zone."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "The user collapses a towering column of atmosphere downward, turning the sky itself into a crushing territory-wide impact. Structures, formations, and terrain are subjected to extreme pressure before the air rebounds around the strike zone."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "There is no responsible ordinary use at full scale. In theory, a microscopic application could redirect severe weather or clear airborne debris, but the margin between correction and catastrophe is vanishingly small."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The descending column leaves a volatile vacuum above the impact, so the initial crush may be followed by violent inflow, storms, pressure trauma, and secondary destruction far outside the target. The Art is Forbidden because atmosphere has no respect for battlefield boundaries."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. A Wind specialist learns pressure gradients, airflow, turbulence, and safe breathing zones. Great control means tracking how a current changes after it strikes terrain, another technique, or a moving body rather than treating air as a simple straight-line force."
        ],
        "bullets": []
      }
    ]
  },
  "Tremor Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Amplifies ground vibrations, creating stronger quakes that can knock enemies off balance or collapse fortifications.",
    "tags": [
      "Creation",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Amplifies ground vibrations, creating stronger quakes that can knock enemies off balance or collapse fortifications. The earth shakes visibly, with deep fissures forming underfoot."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Disorients enemies, topples formations, and destroys structures, leaving opponents vulnerable to follow-up attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears unstable terrain, creates trenches for defensive purposes, or reveals underground caves and resources."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should include dismantling or safely deactivating everything the technique creates. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Earthen Grasp Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Summons massive hands of stone from the ground that grab and immobilize enemies or shield allies.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons massive hands of stone from the ground that grab and immobilize enemies or shield allies. The hands are slow but immensely powerful."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Restrains enemies to prevent escape or attacks. Can crush heavily armored foes or redirect projectiles by grabbing them mid-air."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Lifts heavy objects, clears debris, or creates makeshift structures in emergencies."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Quicksand Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Converts the ground into a patch of quicksand, trapping enemies and slowing their movements.",
    "tags": [
      "Healing",
      "Mobility",
      "Defense"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Converts the ground into a patch of quicksand, trapping enemies and slowing their movements. The shifting earth is infused with Nature Energy, making escape nearly impossible."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Immobilizes groups of enemies, forcing them to waste energy escaping while leaving them vulnerable to ranged attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Creates natural barriers or stabilizes loose soil for construction."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Stone Blade Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Summons sharp blades of stone from the ground, launching them at enemies with incredible force.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons sharp blades of stone from the ground, launching them at enemies with incredible force. The blades can pierce through armor and shields."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Excellent for mid-range combat, dealing significant damage to multiple foes or fortified positions."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Shapes stone into tools, weapons, or precise cutting instruments."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Bloom Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Accelerates the growth of plants, causing flowers, grass, and trees to sprout instantly.",
    "tags": [
      "Healing",
      "Mobility",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Accelerates the growth of plants, causing flowers, grass, and trees to sprout instantly. The greenery glows faintly with Nature Energy."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Creates dense vegetation for cover, disrupts enemy movements, or entangles foes with sudden roots."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Restores damaged ecosystems, strengthens eroded soil, or enhances the environment aesthetically."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Metal Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Extracts and manipulates metals from the earth, shaping them into weapons, armor, or intricate constructs.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Extracts and manipulates metals from the earth, shaping them into weapons, armor, or intricate constructs. Metals gleam as they emerge from the ground, bending to the user’s will."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Forms sharp blades, durable shields, or metallic projectiles for versatile combat."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Ideal for crafting tools, reinforcing buildings, or enhancing machinery."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Crystal Forge Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Focuses on minerals and gemstones, growing them rapidly into sharp formations or ornate designs.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Focuses on minerals and gemstones, growing them rapidly into sharp formations or ornate designs. Crystals glow faintly with Nature Energy, refracting light beautifully."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Creates jagged spikes to impale enemies or reflective barriers for defense."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Enhances trade by producing valuable crystals or constructing intricate designs."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Seismic Wave Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Sends powerful waves of force through the ground, creating cracks and upheavals that destabilize the battlefield.",
    "tags": [
      "Healing",
      "Creation",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Sends powerful waves of force through the ground, creating cracks and upheavals that destabilize the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Topples enemy formations, collapses structures, and deals heavy damage to groups of opponents."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears terrain, breaks large rocks, or creates trenches for tactical or defensive purposes."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 2 use is dependable at a focused scale, but dividing attention across many targets quickly reduces precision. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Faultsense Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Reads vibrations and pressure through connected ground to track footsteps, detect buried spaces, locate structural weakness, and sense approaching attacks.",
    "tags": [
      "Detection",
      "Mobility"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Reads vibrations and pressure through connected ground to track footsteps, detect buried spaces, locate structural weakness, and sense approaching attacks."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Vibrations and pressure traveling through connected ground reveal footsteps, burrowing, structural weakness, and the beginning of an incoming ground-based attack. It provides a continuous tactical picture even when sight is blocked."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Faultsense can locate buried rooms, survivors, unstable foundations, tunnels, machinery, or approaching landslides and can guide excavation without opening every layer."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The target must share connected ground with the user. Soft fill, suspended structures, water, heavy machinery, crowds, and overlapping impacts create noise, and the Art reads current vibration rather than the material composition mapped by Mineral Compass."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Clay Seal Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Softens mineral-rich ground into dense moldable clay that can close breaches, restrain limbs, preserve impressions, or harden into fitted repairs.",
    "tags": [
      "Control"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Softens mineral-rich ground into dense moldable clay that can close breaches, restrain limbs, preserve impressions, or harden into fitted repairs."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Mineral-rich ground becomes dense moldable clay that can close around limbs, patch cover, capture an impression, or harden into a fitted restraint. The user shapes the seal to the target instead of simply piling earth on top of it."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can repair walls and vessels, close cracks, preserve tracks, create emergency splints, form molds, or weatherproof a temporary shelter with locally available material."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art needs suitable mineral matter and time to set. Dry sand, pure stone, metal flooring, violent water, intense heat, and powerful movement can prevent a clean seal; hardening too quickly may trap someone in a dangerous position."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should focus on precise boundaries and on releasing a target safely when concentration breaks. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Mineral Compass Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Reads the composition and depth of stone, ore, and underground voids through direct ground contact, but cannot detect movement like Faultsense.",
    "tags": [
      "Detection",
      "Mobility"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Reads the composition and depth of stone, ore, and underground voids through direct ground contact, but cannot detect movement like Faultsense."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Direct ground contact reveals the composition and depth of stone, ore, and underground voids, helping the user identify weak layers, hidden cover, metal deposits, and safe paths for another Earth technique."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can survey mines, find building material, map caverns, locate pipes or buried hazards, and distinguish valuable deposits without destructive drilling."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Mineral Compass reads matter, not live motion; it cannot replace Faultsense during an ambush. Range and resolution fall through mixed fill, artificial composites, deep voids, or ground the user cannot touch continuously."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should separate a true signal from clutter, decoys, and the user's own expectations. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Dust Mantle Arts": {
    "style": "Earth",
    "tier": "Tier 2",
    "summary": "Shapes mineral dust into an orbiting screen that obscures sight, marks invisible movement, and abrades exposed mechanisms through direct command of the particles.",
    "tags": [
      "Mobility",
      "Disruption",
      "Creation"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Shapes mineral dust into an orbiting screen that obscures sight, marks invisible movement, and abrades exposed mechanisms through direct command of the particles."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Controlled mineral dust orbits as a screen that obscures vision, outlines invisible movement, abrades exposed mechanisms, and marks the direction of incoming airflow. Unlike smoke, every particle remains part of the user's Earth control."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The mantle can reveal leaks, trace footprints, polish or strip surfaces, contain ordinary dust during excavation, and coat an area so later disturbance becomes visible."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Wind, water, sealed equipment, filters, and insufficient mineral particles reduce the screen. The dust can harm lungs and delicate machinery, including allied systems, so the user must contain and settle it after use."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Reliable Tier 2 mastery means repeating the effect under stress without losing its boundary, target, or safe exit. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Gemstone Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Enhances Crystal Art by focusing on rare, magical gemstones that amplify Nature Energy.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Enhances Crystal Art by focusing on rare, magical gemstones that amplify Nature Energy. These gems can store or release energy in bursts."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Forms explosive gem shards that detonate on impact, dealing massive area damage. The shards can also release bursts of energy to disorient enemies."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Creates energy sources, powers complex machinery, or enhances defensive barriers with stored energy."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Graviton Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Alters the gravitational force of the earth around the user, increasing or decreasing weight.",
    "tags": [
      "Healing",
      "Mobility",
      "Control"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Alters the gravitational force of the earth around the user, increasing or decreasing weight. Objects and enemies rise or sink based on the user’s control."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Pins enemies to the ground, preventing movement, or flings them upward for devastating follow-up attacks."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Assists in lifting heavy objects, stabilizing unstable structures, or improving physical training by manipulating gravity fields."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Earthen Shell Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Creates a protective cocoon of stone or soil around the user or allies.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a protective cocoon of stone or soil around the user or allies. The shell is nearly impenetrable, with layers that absorb impact."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Shields against heavy attacks or traps enemies inside the shell, isolating them from the battlefield."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Provides protection during natural disasters, extreme weather, or hazardous environments."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Quarry Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Summons massive slabs of stone from deep within the earth.",
    "tags": [
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons massive slabs of stone from deep within the earth. These slabs rise suddenly, crushing or barricading enemies."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Smashes enemies under heavy stone or blocks their paths with towering slabs."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Supplies materials for large-scale construction projects or creates defensive barriers during sieges."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Nature's Retribution Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Combines the violent shaking of tremors with explosive plant growth, creating a battlefield of vines, roots, and collapsing terrain.",
    "tags": [
      "Healing",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Combines the violent shaking of tremors with explosive plant growth, creating a battlefield of vines, roots, and collapsing terrain. The ground becomes a living weapon, striking and entangling enemies simultaneously."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Immobilizes enemies with roots while crushing them with collapsing terrain. Perfect for controlling large groups in chaotic battles."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Restores damaged ecosystems while reshaping terrain for tactical advantage."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Golem Forge Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Forges massive golems from metal and crystal, imbuing them with Nature Energy to act as autonomous guardians or attackers.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Forges massive golems from metal and crystal, imbuing them with Nature Energy to act as autonomous guardians or attackers. The golems are towering and nearly indestructible."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Deploys powerful allies to fight alongside the user, overwhelming enemy forces with brute strength and durability."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Constructs long-term defenders for fortresses, mines, or important sites. Can also serve as mobile construction units."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. A defense that absorbs force still has a capacity and can fail suddenly when that capacity is exceeded."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Titan's Stride Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Manipulates the earth beneath the user to create colossal stone legs, granting them immense size and mobility.",
    "tags": [
      "Healing",
      "Mobility",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Manipulates the earth beneath the user to create colossal stone legs, granting them immense size and mobility. Each step reshapes the battlefield, leaving massive craters or raising pillars of stone."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Crushes enemies underfoot while allowing the user to dominate the battlefield from an elevated position. Perfect for both offense and defense."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Assists in crossing hazardous terrain or stabilizing unstable ground by reshaping it underfoot."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Subterranean Ambush Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Allows the user to travel underground by manipulating the earth around them, reemerging with explosive force to surprise enemies.",
    "tags": [
      "Mobility",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Allows the user to travel underground by manipulating the earth around them, reemerging with explosive force to surprise enemies. The user can create tunnels as they move."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Evades enemy attacks or sets up devastating surprise strikes by bursting from below."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Creates underground pathways for safe traversal or access to hidden areas."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Verdant Renewal Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Channels Nature Energy into the ground, creating a vibrant field of life that heals allies and purifies the land.",
    "tags": [
      "Healing",
      "Mobility",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Channels Nature Energy into the ground, creating a vibrant field of life that heals allies and purifies the land. Plants infused with restorative energy sprout instantly, closing wounds, restoring stamina, and curing ailments within the field."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Creates a healing zone that restores allies over time, curing poisons and stabilizing critical injuries. The field also disrupts enemy footing, slowing their movements with overgrown roots and plants."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Reclaims barren land, revives dying crops, and purifies soil contaminated by toxins."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The technique depends on material composition, connected ground, and an accurate understanding of nearby foundations. Tier 3 output consumes substantial Nature Energy and becomes dangerous when maintained across a large area or through repeated resistance. Stabilization or restoration also cannot replace diagnosis of the original injury."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Keystone Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Distributes force through connected stone and soil to reinforce buildings, stabilize damaged terrain, and prevent a chosen structure from collapsing under pressure.",
    "tags": [
      "Healing"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Distributes force through connected stone and soil to reinforce buildings, stabilize damaged terrain, and prevent a chosen structure from collapsing under pressure."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Force is distributed through connected stone and soil so a chosen wall, bridge, bunker, or piece of terrain resists collapse under attack. It turns existing structure into a coordinated support network rather than creating a new shell."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Keystone is invaluable after earthquakes, explosions, or excavation: it can hold a building upright, brace a tunnel, stabilize a road, and keep rescuers safe while permanent repairs are made."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art cannot make missing material reappear. Unknown foundations, disconnected components, flexible structures, repeated vibration, and damage beyond the supported network can cause a delayed collapse when the user releases control."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Terrain Memory Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Reads deformation and residue preserved inside stone to reconstruct past movement or impacts, with older events becoming less complete and harder to interpret.",
    "tags": [
      "Detection",
      "Mobility",
      "Creation"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Reads deformation and residue preserved inside stone to reconstruct past movement or impacts, with older events becoming less complete and harder to interpret."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Deformation and residue preserved inside stone are read as an incomplete history of footsteps, impacts, collapses, and technique use. The user can reconstruct how a battlefield changed and identify routes or attacks an opponent believed were erased."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can investigate disasters and crimes, recover the sequence of a structural failure, trace old travel through a site, or preserve testimony written into damaged terrain."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Stone stores traces, not a perfect recording. Age, erosion, rebuilding, repeated traffic, shattered material, and the user's expectations create gaps or misleading overlaps; conclusions require interpretation and should be confirmed by other evidence."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training should separate a true signal from clutter, decoys, and the user's own expectations. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Sinkhole Arts": {
    "style": "Earth",
    "tier": "Tier 3",
    "summary": "Precisely collapses a mapped underground layer to swallow structures or form trenches, but poor geological knowledge can destabilize allies and nearby foundations.",
    "tags": [
      "Healing",
      "Detection",
      "Destruction"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Precisely collapses a mapped underground layer to swallow structures or form trenches, but poor geological knowledge can destabilize allies and nearby foundations."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "After mapping an underground layer, the user collapses it with precision to swallow a structure, isolate a formation, or cut a deep trench through a chosen route. Its strength is controlled failure, not a wide earthquake."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "It can create reservoirs, drainage basins, controlled demolition zones, emergency barriers, or access to a mapped underground chamber when the surrounding geology is understood."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Bad geological knowledge turns precision into cascading collapse. Hidden utilities, groundwater, weak neighboring foundations, occupied tunnels, and shifting loads can extend the sinkhole beneath allies or far beyond the intended boundary."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Tier 3 mastery requires the user to manage power, duration, and battlefield consequences at the same time. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "World Tree Arts": {
    "style": "Earth",
    "tier": "Forbidden",
    "summary": "Sileus Tavara plants Eden Zones that absorb Nature Energy, grow imagined guardians, and join an entire battlefield into one living sensory ecosystem.",
    "tags": [
      "Healing",
      "Detection",
      "Defense",
      "Control",
      "Creation"
    ],
    "source": "World Tree Arts - Master Document",
    "sections": [
      {
        "title": "Origin & sole wielder",
        "body": [
          "World Tree Arts is the rarest and most sacred Art in A.R.C., wielded only by Sileus Tavara. The ancient World Tree once served as the Nature Realm's central conduit of Nature Energy. After it withered, its guardian spirit chose Sileus - a newborn with no Nature Energy - and transformed him into a living vessel of nature's divine will. His quiet presence hides an Art capable of turning territory, summons, and stored energy into one connected organism."
        ],
        "bullets": []
      },
      {
        "title": "Core mechanics",
        "body": [
          "Sileus plants miniature World Trees that root into the battlefield and create Eden Zones. Each zone absorbs Nature Energy from enemy attacks, ambient reserves, and the internal reserves of opponents caught within it. The gathered power feeds Sileus, expands the trees, and strengthens the creatures grown from their territory. Destroying a rooted tree is the direct way to end its zone, but the task becomes harder as the ecosystem matures around it."
        ],
        "bullets": []
      },
      {
        "title": "Signature abilities",
        "body": [],
        "bullets": [
          "Edenfall Grove establishes the absorbing Eden Zones. Larger trees cover more territory and drain Nature Energy faster.",
          "World Tree's Stomping Grounds grows beasts, monsters, dragons, golems, and ancient guardians from seeds infused with Sileus's imagination and Nature Energy. Bark, vines, spirit wood, and sap become living forms with individual abilities.",
          "Verdant Touch drains Nature Energy through Sileus's palm. The energy can heal him, feed a World Tree, evolve a summon, or rapidly extend Edenfall Grove.",
          "Solar Declarations releases stored Nature Energy through plant limbs and tree conduits as devastating beams, radiant pulses, terrain-changing bursts, or sudden evolutions for a summon.",
          "World Tree Communion links Sileus psychically to every summon, allowing him to see, hear, feel, and issue commands through the entire network at once."
        ]
      },
      {
        "title": "Combat applications",
        "body": [
          "World Tree Arts wins by compounding control. An early tree steals the energy used against it; that energy expands the zone, evolves summons, and gives Sileus more bodies through which to observe and attack. Verdant Touch can drain a close opponent while Solar Declarations converts the stolen reserve into a decisive beam or pulse. As territory grows, the enemy faces more guardians with less Nature Energy, while Sileus commands the whole ecosystem through a single thought."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "The network can provide distributed reconnaissance, protection, healing energy, and long-term anchors across prepared territory. Sileus can perceive danger through distant summons instead of placing his own body at every location. A major linked summon may also serve as an anchor from which he can regrow after otherwise fatal destruction, provided a suitable World Tree was planted beforehand."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Eden Zones depend on planted trees, and destroying those trees removes the territory they control. Solar Declarations can cause severe backlash when stored power is released without enough precision. Communion also makes Sileus responsible for many simultaneous senses and commands rather than granting effortless awareness. Regrowing through a linked summon is exceptionally slow - days or weeks - and fails as an escape plan when no major summon and pre-planted tree remain to act as anchors. Because Edenfall absorbs Nature Energy throughout its zone, careless placement can also starve resources Sileus intended to preserve."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Full mastery is World Tree Communion: dozens of individual creatures become one shared awareness without losing their specialized roles. Sileus does not need to overpower every opponent personally; he plants, listens, drains, grows, and lets the balance of the battlefield move toward him. The Forbidden danger is systemic. Once the ecosystem reaches scale, every attack can become fuel, every rooted zone can produce more defenders, and the battlefield stops behaving like neutral ground. Sileus does not merely conquer it - he becomes it."
        ],
        "bullets": []
      }
    ]
  },
  "Continental Shift Arts": {
    "style": "Earth",
    "tier": "Forbidden",
    "summary": "Manipulates tectonic plates, creating massive earthquakes and reshaping landscapes.",
    "tags": [
      "Healing",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Manipulates tectonic plates, creating massive earthquakes and reshaping landscapes. Fissures erupt as the earth splits and shifts violently."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Destroys entire armies by tearing the ground apart. Massive fissures, towering walls of stone, and collapsing terrain make escape nearly impossible."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Alters geography permanently, redirecting rivers, creating mountain ranges, or sinking islands."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Risks collateral damage to allies, civilians, and ecosystems. Overuse can destabilize the region permanently."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Geoforge Arts": {
    "style": "Earth",
    "tier": "Forbidden",
    "summary": "Combines Metal Art and Crystal Art, forging colossal constructs of enchanted metal and crystal that act as autonomous guardians.",
    "tags": [
      "Defense",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Combines Metal Art and Crystal Art, forging colossal constructs of enchanted metal and crystal that act as autonomous guardians."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Creates titanic golems or weaponized constructs that fight with overwhelming strength and durability."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Constructs massive, indestructible fortresses or monuments of cultural significance."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The constructs require constant input of Nature Energy to remain active, leaving the user vulnerable if overextended."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should measure capacity and teach controlled release before a barrier becomes a trap or explosive failure point. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Titan's Genesis Arts": {
    "style": "Earth",
    "tier": "Forbidden",
    "summary": "Merges the user with the earth itself, transforming them into a towering colossus of stone and metal.",
    "tags": [
      "Mobility",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Merges the user with the earth itself, transforming them into a towering colossus of stone and metal. This massive form reshapes the battlefield with every step and strike, embodying Earth’s raw power."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Crushes armies with massive blows, hurls boulders with ease, and redirects enemy attacks with impenetrable defenses. Can manipulate terrain on a massive scale, creating fortifications or traps instantly."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Clears entire regions of hazards, constructs massive defenses, or redirects rivers and fault lines to reshape the land."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The transformation is temporary and exhausting, leaving the user severely weakened afterward."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should prioritize routes, stopping distance, passenger safety, and recovery from a failed path. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Eternal Garden Arts": {
    "style": "Earth",
    "tier": "Forbidden",
    "summary": "Covers the battlefield in an unending, sentient garden of plants infused with Nature Energy.",
    "tags": [
      "Healing",
      "Control",
      "Creation"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Covers the battlefield in an unending, sentient garden of plants infused with Nature Energy. The garden grows exponentially, engulfing everything in its path."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Plants ensnare and crush enemies, while poisonous spores and thorns incapacitate survivors. Healing plants sprout near allies, rapidly restoring their strength and stamina."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Creates self-sustaining ecosystems, purifies polluted areas, and restores barren lands with unmatched speed."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The garden’s rapid growth is hard to control, risking harm to allies or unintended areas."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Core Implosion Arts": {
    "style": "Earth",
    "tier": "Forbidden",
    "summary": "Manipulates the planet’s core energy, creating a localized gravitational collapse.",
    "tags": [
      "Healing",
      "Creation",
      "Destruction"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Manipulates the planet’s core energy, creating a localized gravitational collapse. The earth folds in on itself, pulling everything within range into an inescapable void."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Instantly destroys everything caught within the collapse, leaving a massive crater behind. The gravitational pull prevents enemies from escaping, ensuring total annihilation."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Can be used to create massive reservoirs or destroy critical enemy infrastructure permanently."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The Art is indiscriminate, making it dangerous to allies and the environment. Overuse risks destabilizing the region permanently."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Gaia's Embrace Arts": {
    "style": "Earth",
    "tier": "Forbidden",
    "summary": "Summons the full restorative power of the Earth itself, creating a massive, glowing dome of energy that revitalizes everything within its range.",
    "tags": [
      "Healing",
      "Mobility",
      "Disruption"
    ],
    "source": "Main Arts archive",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Summons the full restorative power of the Earth itself, creating a massive, glowing dome of energy that revitalizes everything within its range. The dome pulses with Nature Energy, healing allies, reviving the fallen, and restoring the battlefield to its natural state."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "Fully heals all allies within the dome, removing any debuffs or status effects. Revives fallen allies, restoring their vitality and stamina as if they had never been injured. Disorients enemies within the dome with overwhelming energy, weakening their resolve and sapping their strength."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Restores entire regions of land, purifying polluted water, regrowing forests, and mending the scars of battle. Creates long-term sanctuaries where life can thrive uninterrupted."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "Requires a massive sacrifice of the user’s Nature Energy, leaving them vulnerable after the effect ends. The Art’s overwhelming energy risks collateral effects, such as destabilizing nearby ecosystems or leaving allies temporarily overwhelmed by its power."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training must include anatomy, triage, and the discipline to stop before treatment becomes additional harm. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  },
  "Seed of Stone Arts": {
    "style": "Earth",
    "tier": "Forbidden",
    "summary": "Creates a self-propagating mineral seed that converts touched matter into inert stone; the user must contain its growth or risk petrifying the environment and themselves.",
    "tags": [
      "Creation"
    ],
    "source": "A.R.C. archive expansion",
    "sections": [
      {
        "title": "Core mechanics",
        "body": [
          "Creates a self-propagating mineral seed that converts touched matter into inert stone; the user must contain its growth or risk petrifying the environment and themselves."
        ],
        "bullets": []
      },
      {
        "title": "Combat applications",
        "body": [
          "A self-propagating mineral seed converts touched matter into inert stone and continues through connected material. It can freeze a vast threat or erase an advancing substance, but every successful conversion gives the seed more territory to consume."
        ],
        "bullets": []
      },
      {
        "title": "Broader applications",
        "body": [
          "Only the smallest sealed use could preserve a hazardous object or stop an uncontrollable material reaction. Any broader application risks replacing the problem with permanent petrification."
        ],
        "bullets": []
      },
      {
        "title": "Drawbacks & limits",
        "body": [
          "The seed does not naturally distinguish enemy, environment, ally, or caster. Growth can travel through ground and structures beyond sight, and attempts to command it from inside the spread may petrify the user's own body. The Art is Forbidden because containment failure can become self-sustaining."
        ],
        "bullets": []
      },
      {
        "title": "Mastery notes",
        "body": [
          "Forbidden mastery is never ordinary proficiency: the user must prepare containment, an abort condition, and a way to survive the technique turning against them. Training should include dismantling or safely deactivating everything the technique creates. An Earth specialist learns geology, load paths, material composition, and the difference between moving ground and supporting it. The Style is safest when the user understands what lies beneath a target before altering foundations, faults, roots, or underground spaces."
        ],
        "bullets": []
      }
    ]
  }
});

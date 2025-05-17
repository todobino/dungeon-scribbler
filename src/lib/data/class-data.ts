
import type { ClassDetail } from '@/lib/types';

export const DND_CLASS_DETAILS: ClassDetail[] = [
  {
    "class": "Barbarian",
    "source": "PHB",
    "hit_die": "d12",
    "primary_abilities": [
      "Strength"
    ],
    "saving_throws": [
      "Strength",
      "Constitution"
    ],
    "armor_proficiencies": [
      "Light armor",
      "Medium armor",
      "Shields"
    ],
    "weapon_proficiencies": [
      "Simple weapons",
      "Martial weapons"
    ],
    "tools": [],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Rage",
            "description": "Enter a rage as a bonus action, gaining damage bonuses, resistance to physical damage, and advantage on Strength checks/saves."
          },
          {
            "name": "Unarmored Defense",
            "description": "While not wearing armor, your AC = 10 + Dexterity mod + Constitution mod."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Reckless Attack",
            "description": "Gain advantage on your first melee attack, but attacks against you have advantage until your next turn."
          },
          {
            "name": "Danger Sense",
            "description": "Gain advantage on Dex saves against effects you can see, such as traps and spells."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Primal Path",
            "description": "Choose a subclass that grants features at 3rd, 6th, 10th, and 14th levels."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Path of the Berserker",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Frenzy",
            "description": "While raging, you can choose to frenzy: gain an extra melee attack as a bonus action each turn, but suffer one level of exhaustion after the rage ends."
          },
          {
            "level": 6,
            "name": "Mindless Rage",
            "description": "You can’t be charmed or frightened while raging. If charmed/frightened when you enter rage, the effect is suspended."
          },
          {
            "level": 10,
            "name": "Intimidating Presence",
            "description": "Use your action to frighten a creature within 30 ft (Wisdom save DC = 8 + prof + Charisma)."
          },
          {
            "level": 14,
            "name": "Retaliation",
            "description": "When a creature damages you with a melee attack, you can use your reaction to make a melee weapon attack against it."
          }
        ]
      },
      {
        "name": "Path of the Totem Warrior",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Spirit Seeker",
            "description": "Gain *beast sense* and *speak with animals* as ritual spells."
          },
          {
            "level": 3,
            "name": "Totem Spirit",
            "description": "Choose a spirit animal (e.g., Bear, Eagle, Wolf) that grants passive bonuses while raging."
          },
          {
            "level": 6,
            "name": "Aspect of the Beast",
            "description": "Your chosen animal spirit grants a new trait (e.g., Bear doubles carrying capacity, Eagle gives sight-related bonuses)."
          },
          {
            "level": 10,
            "name": "Spirit Walker",
            "description": "Cast *commune with nature* as a ritual to speak with your totem spirit."
          },
          {
            "level": 14,
            "name": "Totemic Attunement",
            "description": "Gain a powerful new ability tied to your chosen animal (e.g., Bear: enemies have disadvantage on attacks vs allies)."
          }
        ]
      },
      {
        "name": "Path of the Ancestral Guardian",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Ancestral Protectors",
            "description": "When raging, your first hit each turn marks the target: it has disadvantage on attacks not against you, and allies gain resistance to its damage."
          },
          {
            "level": 6,
            "name": "Spirit Shield",
            "description": "As a reaction, reduce damage an ally within 30 ft takes by 2d6 (scales with level)."
          },
          {
            "level": 10,
            "name": "Consult the Spirits",
            "description": "Cast *augury* or *clairvoyance* once per short rest without material components."
          },
          {
            "level": 14,
            "name": "Vengeful Ancestors",
            "description": "When Spirit Shield reduces damage, the attacker takes the same amount of damage."
          }
        ]
      },
      {
        "name": "Path of the Beast",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Form of the Beast",
            "description": "When you rage, grow a natural weapon (bite, claws, tail) with special effects and damage types."
          },
          {
            "level": 6,
            "name": "Bestial Soul",
            "description": "Your natural weapons become magical, gain climbing/swimming speeds, and improved mobility."
          },
          {
            "level": 10,
            "name": "Infectious Fury",
            "description": "When you hit with natural weapons, force a Con save or cause extra damage/confusion-like effects."
          },
          {
            "level": 14,
            "name": "Call the Hunt",
            "description": "Grant allies bonus damage when raging, based on your Con mod. You gain temp HP equal to number of allies affected."
          }
        ]
      },
      {
        "name": "Path of Wild Magic",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Magic Awareness",
            "description": "Sense magic in 60 ft radius as an action, once per long rest."
          },
          {
            "level": 3,
            "name": "Wild Surge",
            "description": "Roll on Wild Magic table at the start of each rage, producing a random magical effect."
          },
          {
            "level": 6,
            "name": "Bolstering Magic",
            "description": "Give allies a d3 bonus to attacks/saves or recover expended spell slots (random)."
          },
          {
            "level": 10,
            "name": "Unstable Backlash",
            "description": "When Wild Magic effect is active, you can use a reaction to re-roll your surge when taking damage."
          },
          {
            "level": 14,
            "name": "Controlled Surge",
            "description": "Choose the Wild Magic surge effect or roll twice and choose one."
          }
        ]
      }
    ]
  },
  {
    "class": "Bard",
    "source": "PHB",
    "hit_die": "d8",
    "primary_abilities": [
      "Charisma"
    ],
    "saving_throws": [
      "Dexterity",
      "Charisma"
    ],
    "armor_proficiencies": [
      "Light armor"
    ],
    "weapon_proficiencies": [
      "Simple weapons",
      "Hand crossbows",
      "Longswords",
      "Rapiers",
      "Shortswords"
    ],
    "tools": [
      "Three musical instruments of your choice"
    ],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Spellcasting",
            "description": "You can cast bard spells using Charisma as your spellcasting ability."
          },
          {
            "name": "Bardic Inspiration (d6)",
            "description": "Bonus action to inspire others. Add 1d6 to one ability check, attack roll, or saving throw within 10 minutes."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Jack of All Trades",
            "description": "Add half your proficiency bonus to any ability check not already including your proficiency bonus."
          },
          {
            "name": "Song of Rest",
            "description": "During a short rest, you or friendly creatures regain extra hit points if they hear your performance."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Bard College",
            "description": "Choose a Bard College that grants subclass features at 3rd, 6th, and 14th levels."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "College of Lore",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Bonus Proficiencies",
            "description": "Gain proficiency with three skills of your choice."
          },
          {
            "level": 3,
            "name": "Cutting Words",
            "description": "Use Bardic Inspiration to subtract from enemy attack, ability check, or damage roll."
          },
          {
            "level": 6,
            "name": "Additional Magical Secrets",
            "description": "Learn two spells from any class's spell list."
          },
          {
            "level": 14,
            "name": "Peerless Skill",
            "description": "Use Bardic Inspiration on your own ability checks."
          }
        ]
      },
      {
        "name": "College of Valor",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Bonus Proficiencies",
            "description": "Gain proficiency with medium armor, shields, and martial weapons."
          },
          {
            "level": 3,
            "name": "Combat Inspiration",
            "description": "Add Bardic Inspiration to weapon damage or AC as a reaction."
          },
          {
            "level": 6,
            "name": "Extra Attack",
            "description": "You can attack twice when taking the Attack action."
          },
          {
            "level": 14,
            "name": "Battle Magic",
            "description": "Cast a spell and make a weapon attack as a bonus action."
          }
        ]
      },
      {
        "name": "College of Glamour",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Mantle of Inspiration",
            "description": "Grant temp HP and allow allies to move without provoking opportunity attacks."
          },
          {
            "level": 3,
            "name": "Enthralling Performance",
            "description": "Charm people after performing for 1 minute."
          },
          {
            "level": 6,
            "name": "Mantle of Majesty",
            "description": "Cast Command every turn as a bonus action for 1 minute."
          },
          {
            "level": 14,
            "name": "Unbreakable Majesty",
            "description": "Enemies have disadvantage on attacks against you; charm on failed save."
          }
        ]
      },
      {
        "name": "College of Whispers",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Psychic Blades",
            "description": "Add extra psychic damage to weapon attacks with Bardic Inspiration."
          },
          {
            "level": 3,
            "name": "Words of Terror",
            "description": "Cause fear in creatures after 1 minute of conversation."
          },
          {
            "level": 6,
            "name": "Mantle of Whispers",
            "description": "Steal the shadow of a dead creature to impersonate them."
          },
          {
            "level": 14,
            "name": "Shadow Lore",
            "description": "Magically whisper a secret that can charm a creature for 8 hours."
          }
        ]
      },
      {
        "name": "College of Eloquence",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Silver Tongue",
            "description": "Persuasion/Deception rolls of 9 or lower count as 10."
          },
          {
            "level": 3,
            "name": "Unsettling Words",
            "description": "Subtract Bardic Inspiration die from a target's saving throw."
          },
          {
            "level": 6,
            "name": "Unfailing Inspiration",
            "description": "Targets keep Bardic Inspiration even if the roll fails."
          },
          {
            "level": 14,
            "name": "Infectious Inspiration",
            "description": "When someone uses your Bardic Inspiration successfully, another creature can gain it as a reaction."
          }
        ]
      },
      {
        "name": "College of Creation",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Mote of Potential",
            "description": "Bardic Inspiration creates a floating mote with bonus effects."
          },
          {
            "level": 3,
            "name": "Performance of Creation",
            "description": "Create a nonmagical item worth up to 20 × Bard level gp."
          },
          {
            "level": 6,
            "name": "Animating Performance",
            "description": "Animate an object to act as a dancing servant for 1 hour."
          },
          {
            "level": 14,
            "name": "Creative Crescendo",
            "description": "Create multiple items with Performance of Creation and no gp limit."
          }
        ]
      }
    ]
  },
  {
    "class": "Cleric",
    "source": "PHB",
    "hit_die": "d8",
    "primary_abilities": [
      "Wisdom"
    ],
    "saving_throws": [
      "Wisdom",
      "Charisma"
    ],
    "armor_proficiencies": [
      "Light armor",
      "Medium armor",
      "Shields"
    ],
    "weapon_proficiencies": [
      "Simple weapons"
    ],
    "tools": [],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Spellcasting",
            "description": "You can cast cleric spells using Wisdom as your spellcasting ability."
          },
          {
            "name": "Divine Domain",
            "description": "Choose a domain that grants subclass features at 1st, 2nd, 6th, 8th, and 17th levels."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Channel Divinity (1/rest)",
            "description": "Use divine energy to fuel magical effects. Your domain adds its own options."
          }
        ]
      },
      {
        "level": 5,
        "features": [
          {
            "name": "Destroy Undead (CR 1/2)",
            "description": "Turn Undead instantly destroys undead of CR 1/2 or lower."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Knowledge Domain",
        "source": "PHB",
        "features": [
          {
            "level": 1,
            "name": "Blessings of Knowledge",
            "description": "Gain proficiency in two languages and two skills from Arcana, History, Nature, or Religion. Double proficiency bonus."
          },
          {
            "level": 2,
            "name": "Channel Divinity: Knowledge of the Ages",
            "description": "Gain proficiency in any skill or tool for 10 minutes."
          },
          {
            "level": 6,
            "name": "Channel Divinity: Read Thoughts",
            "description": "Read a creature’s surface thoughts and cast Suggestion on it."
          },
          {
            "level": 8,
            "name": "Potent Spellcasting",
            "description": "Add Wisdom modifier to cantrip damage."
          },
          {
            "level": 17,
            "name": "Visions of the Past",
            "description": "Use your action to learn about an object or area’s past via spiritual visions."
          }
        ]
      },
      {
        "name": "Life Domain",
        "source": "PHB",
        "features": [
          {
            "level": 1,
            "name": "Disciple of Life",
            "description": "Healing spells restore additional HP equal to 2 + the spell’s level."
          },
          {
            "level": 2,
            "name": "Channel Divinity: Preserve Life",
            "description": "Heal multiple creatures for HP equal to 5 × cleric level, split as desired."
          },
          {
            "level": 6,
            "name": "Blessed Healer",
            "description": "When you cast a healing spell on others, you also regain HP equal to 2 + the spell’s level."
          },
          {
            "level": 8,
            "name": "Divine Strike",
            "description": "Once per turn, add 1d8 radiant damage to a weapon attack (2d8 at 14th)."
          },
          {
            "level": 17,
            "name": "Supreme Healing",
            "description": "When you roll dice to determine healing, use the maximum possible number."
          }
        ]
      },
      {
        "name": "Light Domain",
        "source": "PHB",
        "features": [
          {
            "level": 1,
            "name": "Warding Flare",
            "description": "Use your reaction to impose disadvantage on an attack against you within 30 ft, visible to you."
          },
          {
            "level": 2,
            "name": "Channel Divinity: Radiance of the Dawn",
            "description": "Each hostile creature in 30 ft takes radiant damage and dispels magical darkness."
          },
          {
            "level": 6,
            "name": "Improved Flare",
            "description": "Use Warding Flare to protect allies."
          },
          {
            "level": 8,
            "name": "Potent Spellcasting",
            "description": "Add Wisdom modifier to cantrip damage."
          },
          {
            "level": 17,
            "name": "Corona of Light",
            "description": "Create an aura that imposes disadvantage on saves vs. fire or radiant spells within 30 ft."
          }
        ]
      },
      {
        "name": "Forge Domain",
        "source": "XGtE",
        "features": [
          {
            "level": 1,
            "name": "Blessing of the Forge",
            "description": "At end of a long rest, imbue one nonmagical weapon or armor with a +1 bonus."
          },
          {
            "level": 2,
            "name": "Channel Divinity: Artisan’s Blessing",
            "description": "Create a finished item that includes metal, up to 100 gp in value."
          },
          {
            "level": 6,
            "name": "Soul of the Forge",
            "description": "+1 AC in heavy armor, resistance to fire damage, weapon attacks deal +1 fire damage."
          },
          {
            "level": 8,
            "name": "Divine Strike",
            "description": "Once per turn, add 1d8 fire damage to weapon attacks (2d8 at 14th)."
          },
          {
            "level": 17,
            "name": "Saint of Forge and Fire",
            "description": "Immunity to fire, heavy armor resists crits from nonmagical weapons."
          }
        ]
      },
      {
        "name": "Grave Domain",
        "source": "XGtE",
        "features": [
          {
            "level": 1,
            "name": "Circle of Mortality",
            "description": "Healing spells heal for max at 0 HP; spare the dying at 30 ft as bonus action."
          },
          {
            "level": 2,
            "name": "Channel Divinity: Path to the Grave",
            "description": "Curse a creature; next time it takes damage, it becomes vulnerable to it."
          },
          {
            "level": 6,
            "name": "Sentinel at Death’s Door",
            "description": "Turn a crit into a normal hit as a reaction, limited uses."
          },
          {
            "level": 8,
            "name": "Potent Spellcasting",
            "description": "Add Wisdom modifier to cantrip damage."
          },
          {
            "level": 17,
            "name": "Keeper of Souls",
            "description": "When a creature dies near you, a nearby creature regains HP equal to your cleric level."
          }
        ]
      },
      {
        "name": "Order Domain",
        "source": "TCoE",
        "features": [
          {
            "level": 1,
            "name": "Voice of Authority",
            "description": "When you cast a spell on an ally, they can make a weapon attack as a reaction."
          },
          {
            "level": 2,
            "name": "Channel Divinity: Order’s Demand",
            "description": "Charm creatures and force them to drop what they are holding."
          },
          {
            "level": 6,
            "name": "Embodiment of the Law",
            "description": "Cast enchantment spells as a bonus action when used on yourself."
          },
          {
            "level": 8,
            "name": "Divine Strike",
            "description": "Once per turn, add 1d8 psychic damage to a weapon attack (2d8 at 14th)."
          },
          {
            "level": 17,
            "name": "Order’s Wrath",
            "description": "When you deal Divine Strike damage, force a Wisdom save or allow an ally to attack the creature as a reaction."
          }
        ]
      },
      {
        "name": "Peace Domain",
        "source": "TCoE",
        "features": [
          {
            "level": 1,
            "name": "Emboldening Bond",
            "description": "Bond creatures for 10 minutes; they can add 1d4 to attack rolls, saves, or checks when near each other."
          },
          {
            "level": 2,
            "name": "Channel Divinity: Balm of Peace",
            "description": "Move without provoking opportunity attacks and heal those you pass."
          },
          {
            "level": 6,
            "name": "Protective Bond",
            "description": "Bonded creatures can teleport to take damage for each other."
          },
          {
            "level": 8,
            "name": "Potent Spellcasting",
            "description": "Add Wisdom modifier to cantrip damage."
          },
          {
            "level": 17,
            "name": "Expansive Bond",
            "description": "Bond range extends to 60 ft; allies gain resistance while using Protective Bond."
          }
        ]
      },
      {
        "name": "Twilight Domain",
        "source": "TCoE",
        "features": [
          {
            "level": 1,
            "name": "Eyes of Night",
            "description": "Darkvision up to 300 ft; share with others."
          },
          {
            "level": 1,
            "name": "Vigilant Blessing",
            "description": "Give one creature advantage on initiative rolls."
          },
          {
            "level": 2,
            "name": "Channel Divinity: Twilight Sanctuary",
            "description": "Create a 30 ft aura that grants temp HP or removes charm/fear."
          },
          {
            "level": 6,
            "name": "Steps of Night",
            "description": "Fly in dim light or darkness using your Channel Divinity."
          },
          {
            "level": 8,
            "name": "Divine Strike",
            "description": "Once per turn, add 1d8 radiant damage to a weapon attack (2d8 at 14th)."
          },
          {
            "level": 17,
            "name": "Twilight Shroud",
            "description": "Grant half cover to creatures in your Twilight Sanctuary."
          }
        ]
      }
    ]
  },
  {
    "class": "Druid",
    "source": "PHB",
    "hit_die": "d8",
    "primary_abilities": [
      "Wisdom"
    ],
    "saving_throws": [
      "Intelligence",
      "Wisdom"
    ],
    "armor_proficiencies": [
      "Light armor",
      "Medium armor",
      "Shields (non-metal only)"
    ],
    "weapon_proficiencies": [
      "Clubs",
      "Daggers",
      "Darts",
      "Javelins",
      "Maces",
      "Quarterstaffs",
      "Scimitars",
      "Sickles",
      "Slings",
      "Spears"
    ],
    "tools": [
      "Herbalism kit"
    ],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Druidic",
            "description": "You know Druidic, the secret language of druids."
          },
          {
            "name": "Spellcasting",
            "description": "You can cast druid spells using Wisdom as your spellcasting ability."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Wild Shape",
            "description": "Transform into a beast you've seen. Limitations based on level."
          },
          {
            "name": "Druid Circle",
            "description": "Choose a Circle that grants subclass features at 2nd, 6th, 10th, and 14th level."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Circle of the Land",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Bonus Cantrip",
            "description": "You learn one additional druid cantrip of your choice."
          },
          {
            "level": 2,
            "name": "Natural Recovery",
            "description": "Regain some expended spell slots on a short rest once per day."
          },
          {
            "level": 3,
            "name": "Circle Spells",
            "description": "Gain additional domain spells based on your chosen terrain (e.g., Arctic, Coast, Desert, etc.)"
          },
          {
            "level": 6,
            "name": "Land’s Stride",
            "description": "Ignore nonmagical difficult terrain, advantage on saves vs plants that impede movement."
          },
          {
            "level": 10,
            "name": "Nature’s Ward",
            "description": "Immune to poison and disease, charm and fright by elementals and fey."
          },
          {
            "level": 14,
            "name": "Nature’s Sanctuary",
            "description": "Animals and plants must succeed on a Wisdom save or be unable to attack you."
          }
        ]
      },
      {
        "name": "Circle of the Moon",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Combat Wild Shape",
            "description": "Wild Shape as a bonus action; spend spell slots to heal while transformed."
          },
          {
            "level": 2,
            "name": "Circle Forms",
            "description": "Access to more powerful beast forms earlier, including CR 1 at level 2."
          },
          {
            "level": 6,
            "name": "Primal Strike",
            "description": "Your beast attacks count as magical for overcoming resistance/immunity."
          },
          {
            "level": 10,
            "name": "Elemental Wild Shape",
            "description": "Spend 2 uses of Wild Shape to transform into an air, earth, fire, or water elemental."
          },
          {
            "level": 14,
            "name": "Thousand Forms",
            "description": "Cast *alter self* at will."
          }
        ]
      },
      {
        "name": "Circle of Dreams",
        "source": "XGtE",
        "features": [
          {
            "level": 2,
            "name": "Balm of the Summer Court",
            "description": "Heal as a bonus action, grant temporary HP based on druid level and dice pool."
          },
          {
            "level": 6,
            "name": "Hearth of Moonlight and Shadow",
            "description": "During a short/long rest, grants +5 Stealth and Perception to creatures in the area."
          },
          {
            "level": 10,
            "name": "Hidden Paths",
            "description": "Teleport up to 60 ft as a bonus action or teleport an ally up to 30 ft."
          },
          {
            "level": 14,
            "name": "Walker in Dreams",
            "description": "Cast *dream*, *scrying*, or *teleportation circle* without expending a spell slot once per long rest."
          }
        ]
      },
      {
        "name": "Circle of the Shepherd",
        "source": "XGtE",
        "features": [
          {
            "level": 2,
            "name": "Speech of the Woods",
            "description": "Speak with animals and sylvan; beasts can understand your speech."
          },
          {
            "level": 2,
            "name": "Spirit Totem",
            "description": "Summon a spirit (Bear, Hawk, or Unicorn) to influence healing, perception, and movement."
          },
          {
            "level": 6,
            "name": "Mighty Summoner",
            "description": "Your summoned beasts/fey have extra HP and magical attacks."
          },
          {
            "level": 10,
            "name": "Guardian Spirit",
            "description": "Your Spirit Totem heals summoned creatures in its aura at the start of their turns."
          },
          {
            "level": 14,
            "name": "Faithful Summons",
            "description": "If you drop to 0 HP, *conjure animals* is cast at 9th level automatically."
          }
        ]
      },
      {
        "name": "Circle of Spores",
        "source": "TCoE",
        "features": [
          {
            "level": 2,
            "name": "Halo of Spores",
            "description": "Reaction to deal necrotic damage to creatures within 10 ft."
          },
          {
            "level": 2,
            "name": "Symbiotic Entity",
            "description": "Use Wild Shape to gain temp HP and bonus necrotic damage to melee attacks."
          },
          {
            "level": 6,
            "name": "Fungal Infestation",
            "description": "Reanimate a slain creature as a zombie once per turn."
          },
          {
            "level": 10,
            "name": "Spreading Spores",
            "description": "As a bonus action, throw spores to create a damage-dealing cloud."
          },
          {
            "level": 14,
            "name": "Fungal Body",
            "description": "Immunity to blind, deaf, frightened, and critical hits."
          }
        ]
      },
      {
        "name": "Circle of Stars",
        "source": "TCoE",
        "features": [
          {
            "level": 2,
            "name": "Star Map",
            "description": "Spellcasting focus; once per day cast *guiding bolt* and access bonus features."
          },
          {
            "level": 2,
            "name": "Starry Form",
            "description": "Bonus action to enter a constellation form (Archer, Chalice, Dragon) with different bonuses."
          },
          {
            "level": 6,
            "name": "Cosmic Omen",
            "description": "After rest, roll d6 to predict weal or woe, which lets you add/subtract d6s to rolls."
          },
          {
            "level": 10,
            "name": "Twinkling Constellations",
            "description": "Enhance your Starry Form; additional effects for each form."
          },
          {
            "level": 14,
            "name": "Full of Stars",
            "description": "While in Starry Form, you are resistant to all damage."
          }
        ]
      },
      {
        "name": "Circle of Wildfire",
        "source": "TCoE",
        "features": [
          {
            "level": 2,
            "name": "Summon Wildfire Spirit",
            "description": "Use Wild Shape to summon a fire spirit with damage/healing effects."
          },
          {
            "level": 6,
            "name": "Enhanced Bond",
            "description": "Add Druid's Wisdom mod to damage or healing from your spells while spirit is summoned."
          },
          {
            "level": 10,
            "name": "Cauterizing Flames",
            "description": "When creatures die near you, create healing or damage motes."
          },
          {
            "level": 14,
            "name": "Blazing Revival",
            "description": "If you drop to 0 HP, spirit sacrifices itself to heal you and disappear."
          }
        ]
      }
    ]
  },
  {
    "class": "Fighter",
    "source": "PHB",
    "hit_die": "d10",
    "primary_abilities": [
      "Strength",
      "Dexterity"
    ],
    "saving_throws": [
      "Strength",
      "Constitution"
    ],
    "armor_proficiencies": [
      "All armor",
      "Shields"
    ],
    "weapon_proficiencies": [
      "Simple weapons",
      "Martial weapons"
    ],
    "tools": [],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Fighting Style",
            "description": "Choose a style that grants specific combat bonuses (e.g., Archery, Defense, Dueling)."
          },
          {
            "name": "Second Wind",
            "description": "Regain HP equal to 1d10 + fighter level as a bonus action, once per short/long rest."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Action Surge",
            "description": "Take one additional action on your turn, usable once per short/long rest (twice from level 17)."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Martial Archetype",
            "description": "Choose a subclass that grants features at 3rd, 7th, 10th, 15th, and 18th level."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Champion",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Improved Critical",
            "description": "Your weapon attacks score a critical hit on a roll of 19 or 20."
          },
          {
            "level": 7,
            "name": "Remarkable Athlete",
            "description": "Add half your proficiency bonus to untrained Strength, Dexterity, and Constitution checks."
          },
          {
            "level": 10,
            "name": "Additional Fighting Style",
            "description": "Choose a second Fighting Style."
          },
          {
            "level": 15,
            "name": "Superior Critical",
            "description": "Your weapon attacks score a critical hit on a roll of 18–20."
          },
          {
            "level": 18,
            "name": "Survivor",
            "description": "Regain HP at the start of your turn if below half HP. Heals 5 + Con modifier per round."
          }
        ]
      },
      {
        "name": "Battle Master",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Combat Superiority",
            "description": "Learn maneuvers to enhance attacks, using a pool of superiority dice (d8)."
          },
          {
            "level": 3,
            "name": "Student of War",
            "description": "Gain proficiency with one artisan’s tool."
          },
          {
            "level": 7,
            "name": "Know Your Enemy",
            "description": "Spend 1 minute observing a creature to learn about its capabilities compared to your own."
          },
          {
            "level": 10,
            "name": "Improved Combat Superiority",
            "description": "Superiority dice become d10s (then d12 at level 18)."
          },
          {
            "level": 15,
            "name": "Relentless",
            "description": "Regain 1 superiority die at the start of each combat if none remain."
          }
        ]
      },
      {
        "name": "Eldritch Knight",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Spellcasting",
            "description": "Learn and cast spells from the wizard spell list (mostly evocation and abjuration)."
          },
          {
            "level": 3,
            "name": "Weapon Bond",
            "description": "Ritually bond a weapon to summon it to your hand and prevent being disarmed."
          },
          {
            "level": 7,
            "name": "War Magic",
            "description": "Make a weapon attack as a bonus action after casting a cantrip."
          },
          {
            "level": 10,
            "name": "Eldritch Strike",
            "description": "Weapon attacks impose disadvantage on next save vs your spells."
          },
          {
            "level": 15,
            "name": "Arcane Charge",
            "description": "Teleport 30 ft when you Action Surge."
          },
          {
            "level": 18,
            "name": "Improved War Magic",
            "description": "Make a weapon attack as a bonus action after casting any spell (not just cantrips)."
          }
        ]
      },
      {
        "name": "Arcane Archer",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Arcane Archer Lore",
            "description": "Gain proficiency in Arcana or Nature and learn Prestidigitation or Druidcraft."
          },
          {
            "level": 3,
            "name": "Arcane Shot",
            "description": "Imbue arrows with magical effects from a list (e.g., Banishing, Grasping, Piercing)."
          },
          {
            "level": 7,
            "name": "Curving Shot",
            "description": "Use a bonus action to re-roll a missed arrow attack at another target."
          },
          {
            "level": 15,
            "name": "Ever-Ready Shot",
            "description": "Regain one use of Arcane Shot at the start of every combat."
          }
        ]
      },
      {
        "name": "Cavalier",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Bonus Proficiencies",
            "description": "Gain proficiency in one of: Animal Handling, History, Insight, Performance, or Persuasion, and Smith's Tools or a language."
          },
          {
            "level": 3,
            "name": "Born to the Saddle",
            "description": "Advantage on saves to stay mounted, and less mounting/disengage penalties."
          },
          {
            "level": 3,
            "name": "Unwavering Mark",
            "description": "Mark enemies you hit; if they attack anyone else, you get a bonus attack as a reaction."
          },
          {
            "level": 7,
            "name": "Warding Maneuver",
            "description": "Use reaction to add 1d8 to an ally's AC and reduce damage."
          },
          {
            "level": 10,
            "name": "Hold the Line",
            "description": "Enemies you hit with opportunity attacks have speed reduced to 0."
          },
          {
            "level": 15,
            "name": "Ferocious Charger",
            "description": "Force saves on a charge to knock enemies prone."
          },
          {
            "level": 18,
            "name": "Vigilant Defender",
            "description": "Make up to 1 opportunity attack per creature's turn."
          }
        ]
      },
      {
        "name": "Samurai",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Fighting Spirit",
            "description": "Bonus action for temp HP and advantage on weapon attacks until end of turn."
          },
          {
            "level": 3,
            "name": "Elegant Courtier",
            "description": "Add Wisdom bonus to Persuasion and gain proficiency in it if you lack it."
          },
          {
            "level": 7,
            "name": "Tireless Spirit",
            "description": "Regain one use of Fighting Spirit on initiative roll."
          },
          {
            "level": 10,
            "name": "Rapid Strike",
            "description": "Once per turn, trade advantage on an attack for an additional attack."
          },
          {
            "level": 15,
            "name": "Strength Before Death",
            "description": "When reduced to 0 HP, take a full turn immediately before falling unconscious."
          }
        ]
      },
      {
        "name": "Psi Warrior",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Psionic Power",
            "description": "Use a die pool to fuel telekinetic abilities like push, shield, or self-restore."
          },
          {
            "level": 7,
            "name": "Telekinetic Adept",
            "description": "Add movement effects to push or self-levitate for 10 minutes."
          },
          {
            "level": 10,
            "name": "Guarded Mind",
            "description": "Reduce psychic damage, end charm/frightened effects."
          },
          {
            "level": 15,
            "name": "Bulwark of Force",
            "description": "Grant half cover to allies for 1 minute using Psionic die."
          },
          {
            "level": 18,
            "name": "Telekinetic Master",
            "description": "Cast *telekinesis*, and make a weapon attack as a bonus action while concentrating."
          }
        ]
      },
      {
        "name": "Rune Knight",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Bonus Proficiencies",
            "description": "Gain proficiency with smith’s tools and learn Giant language."
          },
          {
            "level": 3,
            "name": "Rune Carver",
            "description": "Inscribe magic runes on gear for magical effects."
          },
          {
            "level": 3,
            "name": "Giant’s Might",
            "description": "Grow in size, gain bonus damage and advantage on Strength checks/saves."
          },
          {
            "level": 7,
            "name": "Runic Shield",
            "description": "Use reaction to impose disadvantage on an attack roll."
          },
          {
            "level": 10,
            "name": "Great Stature",
            "description": "Grow taller and increase Giant's Might bonus damage."
          },
          {
            "level": 15,
            "name": "Master of Runes",
            "description": "Use each rune twice per short rest."
          },
          {
            "level": 18,
            "name": "Runic Juggernaut",
            "description": "Your size increases again, and Giant's Might lasts 1 minute."
          }
        ]
      }
    ]
  },
  {
    "class": "Monk",
    "source": "PHB",
    "hit_die": "d8",
    "primary_abilities": [
      "Dexterity",
      "Wisdom"
    ],
    "saving_throws": [
      "Strength",
      "Dexterity"
    ],
    "armor_proficiencies": [],
    "weapon_proficiencies": [
      "Simple weapons",
      "Shortswords"
    ],
    "tools": [
      "Choose one type of artisan’s tools or one musical instrument"
    ],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Unarmored Defense",
            "description": "While not wearing armor, AC = 10 + Dex mod + Wis mod."
          },
          {
            "name": "Martial Arts",
            "description": "Use Dex instead of Str for unarmed/monk weapon attacks; unarmed strike deals 1d4 damage."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Ki",
            "description": "Use ki points for Flurry of Blows, Patient Defense, and Step of the Wind."
          },
          {
            "name": "Unarmored Movement",
            "description": "Increase speed by 10 feet while not wearing armor or carrying a shield."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Monastic Tradition",
            "description": "Choose a monk tradition (subclass) granting features at 3rd, 6th, 11th, and 17th levels."
          },
          {
            "name": "Deflect Missiles",
            "description": "Use reaction to reduce damage from a ranged weapon attack; catch projectile if reduced to 0."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Way of the Open Hand",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Open Hand Technique",
            "description": "Add effects to Flurry of Blows: knock prone, push, or deny reactions."
          },
          {
            "level": 6,
            "name": "Wholeness of Body",
            "description": "Heal yourself for 3 × monk level once per long rest as an action."
          },
          {
            "level": 11,
            "name": "Tranquility",
            "description": "Gain the effect of *sanctuary* at the end of a long rest until you attack or cast a spell."
          },
          {
            "level": 17,
            "name": "Quivering Palm",
            "description": "Strike a creature with ki vibrations that can later be used to reduce it to 0 HP."
          }
        ]
      },
      {
        "name": "Way of Shadow",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Shadow Arts",
            "description": "Spend 2 ki to cast *darkness*, *darkvision*, *pass without trace*, or *silence*."
          },
          {
            "level": 6,
            "name": "Shadow Step",
            "description": "Teleport 60 ft from one area of dim light/shadow to another, gaining advantage on next melee attack."
          },
          {
            "level": 11,
            "name": "Cloak of Shadows",
            "description": "Become invisible in dim light or darkness when not moving or taking actions."
          },
          {
            "level": 17,
            "name": "Opportunist",
            "description": "Use reaction to attack a creature hit by another’s melee attack."
          }
        ]
      },
      {
        "name": "Way of the Four Elements",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Disciple of the Elements",
            "description": "Learn elemental disciplines (ki-fueled spells) like *burning hands*, *water whip*, etc."
          },
          {
            "level": 6,
            "name": "Elemental Attunement",
            "description": "Access additional elemental disciplines (like *flames of the phoenix*, *clench of the north wind*)."
          },
          {
            "level": 11,
            "name": "More Disciplines",
            "description": "Gain more elemental effects as you increase monk level."
          },
          {
            "level": 17,
            "name": "Ultimate Discipline",
            "description": "Master advanced elemental disciplines with greater ki efficiency."
          }
        ]
      },
      {
        "name": "Way of the Drunken Master",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Drunken Technique",
            "description": "Flurry of Blows grants Disengage and +10 ft movement."
          },
          {
            "level": 6,
            "name": "Tipsy Sway",
            "description": "Redirect missed melee attacks and stand from prone for 5 ft of movement."
          },
          {
            "level": 11,
            "name": "Drunkard’s Luck",
            "description": "Spend 1 ki to cancel disadvantage on a roll."
          },
          {
            "level": 17,
            "name": "Intoxicated Frenzy",
            "description": "Make up to 5 extra attacks with Flurry of Blows if targeting multiple creatures."
          }
        ]
      },
      {
        "name": "Way of the Kensei",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Path of the Kensei",
            "description": "Gain proficiency with martial weapons, use them as monk weapons."
          },
          {
            "level": 6,
            "name": "One with the Blade",
            "description": "Your Kensei weapons count as magical; spend ki to boost AC or increase damage."
          },
          {
            "level": 11,
            "name": "Sharpen the Blade",
            "description": "Spend ki to increase weapon attack and damage rolls."
          },
          {
            "level": 17,
            "name": "Unerring Accuracy",
            "description": "Once per turn, reroll a missed attack with monk weapons or unarmed strikes."
          }
        ]
      },
      {
        "name": "Way of the Sun Soul",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Radiant Sun Bolt",
            "description": "Fire radiant blasts as a ranged spell attack using Dex; use Flurry of Blows for more."
          },
          {
            "level": 6,
            "name": "Searing Arc Strike",
            "description": "Spend ki to cast *burning hands* as a bonus action."
          },
          {
            "level": 11,
            "name": "Searing Sunburst",
            "description": "Create a radiant explosion (Con save or take radiant damage) in a 20-ft radius."
          },
          {
            "level": 17,
            "name": "Sun Shield",
            "description": "Glow with sunlight; attackers take radiant damage if they hit you with melee."
          }
        ]
      },
      {
        "name": "Way of Mercy",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Implements of Mercy",
            "description": "Gain proficiency with Insight and Medicine and a healer’s kit."
          },
          {
            "level": 3,
            "name": "Hand of Healing &amp; Harm",
            "description": "Use ki to heal or deal necrotic damage with unarmed strikes."
          },
          {
            "level": 6,
            "name": "Physician’s Touch",
            "description": "End disease and conditions when using Hand of Healing; Hand of Harm can impose poisoned."
          },
          {
            "level": 11,
            "name": "Flurry of Healing and Harm",
            "description": "Replace each Flurry of Blows strike with a Hand of Healing or Harm."
          },
          {
            "level": 17,
            "name": "Hand of Ultimate Mercy",
            "description": "Revive a creature that has died within 24 hours by expending ki and healer’s kit."
          }
        ]
      },
      {
        "name": "Way of the Astral Self",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Arms of the Astral Self",
            "description": "Summon spectral arms that deal force damage and replace Str with Wis for attacks."
          },
          {
            "level": 6,
            "name": "Visage of the Astral Self",
            "description": "Gain a spectral face that enhances insight, intimidation, and senses."
          },
          {
            "level": 11,
            "name": "Body of the Astral Self",
            "description": "Summon the full astral form: bonus to defense and damage reduction."
          },
          {
            "level": 17,
            "name": "Awakened Astral Self",
            "description": "Gain flight and increase all astral abilities; attacks deal additional damage."
          }
        ]
      }
    ]
  },
  {
    "class": "Paladin",
    "source": "PHB",
    "hit_die": "d10",
    "primary_abilities": [
      "Strength",
      "Charisma"
    ],
    "saving_throws": [
      "Wisdom",
      "Charisma"
    ],
    "armor_proficiencies": [
      "All armor",
      "Shields"
    ],
    "weapon_proficiencies": [
      "Simple weapons",
      "Martial weapons"
    ],
    "tools": [],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Divine Sense",
            "description": "As an action, detect good and evil until end of next turn; uses = 1 + Cha mod per long rest."
          },
          {
            "name": "Lay on Hands",
            "description": "Heal a total number of HP equal to Paladin level × 5 per long rest."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Divine Smite",
            "description": "Expend a spell slot to deal radiant damage on a melee weapon hit."
          },
          {
            "name": "Spellcasting",
            "description": "Cast spells using Charisma as your spellcasting ability."
          },
          {
            "name": "Fighting Style",
            "description": "Choose a combat style that grants specific bonuses (e.g., Defense, Dueling)."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Divine Health",
            "description": "You are immune to disease."
          },
          {
            "name": "Sacred Oath",
            "description": "Choose an Oath that grants subclass features at 3rd, 7th, 15th, and 20th levels."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Oath of Devotion",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Channel Divinity: Sacred Weapon",
            "description": "Add Charisma mod to weapon attacks for 1 minute."
          },
          {
            "level": 3,
            "name": "Channel Divinity: Turn the Unholy",
            "description": "Turn fiends and undead as with Turn Undead."
          },
          {
            "level": 7,
            "name": "Aura of Devotion",
            "description": "You and nearby allies are immune to charm."
          },
          {
            "level": 15,
            "name": "Purity of Spirit",
            "description": "You are always under the effects of *protection from evil and good*."
          },
          {
            "level": 20,
            "name": "Holy Nimbus",
            "description": "Emit bright light; fiends and undead in aura take radiant damage and have disadvantage on saves vs your spells."
          }
        ]
      },
      {
        "name": "Oath of the Ancients",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Channel Divinity: Nature’s Wrath",
            "description": "Restrain an enemy with spectral vines."
          },
          {
            "level": 3,
            "name": "Channel Divinity: Turn the Faithless",
            "description": "Turn fey and fiends."
          },
          {
            "level": 7,
            "name": "Aura of Warding",
            "description": "You and allies take half damage from spells."
          },
          {
            "level": 15,
            "name": "Undying Sentinel",
            "description": "When reduced to 0 HP, drop to 1 HP instead once per long rest."
          },
          {
            "level": 20,
            "name": "Elder Champion",
            "description": "For 1 minute, gain regen, debuff resistance, and auto-succeed on saves vs spells."
          }
        ]
      },
      {
        "name": "Oath of Vengeance",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Channel Divinity: Abjure Enemy",
            "description": "Frighten a creature; reduce its speed to 0."
          },
          {
            "level": 3,
            "name": "Channel Divinity: Vow of Enmity",
            "description": "Gain advantage on attack rolls against one creature for 1 minute."
          },
          {
            "level": 7,
            "name": "Relentless Avenger",
            "description": "Move up to half your speed when you hit a creature with an opportunity attack."
          },
          {
            "level": 15,
            "name": "Soul of Vengeance",
            "description": "When a creature under Vow of Enmity attacks someone else, make a reaction attack."
          },
          {
            "level": 20,
            "name": "Avenging Angel",
            "description": "Grow wings, gain frightful presence, and fly speed of 60 ft for 1 hour."
          }
        ]
      },
      {
        "name": "Oath of Conquest",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Channel Divinity: Conquering Presence",
            "description": "Frighten every creature within 30 ft."
          },
          {
            "level": 3,
            "name": "Channel Divinity: Guided Strike",
            "description": "Add +10 to an attack roll after seeing the roll."
          },
          {
            "level": 7,
            "name": "Aura of Conquest",
            "description": "Frightened creatures in aura have speed 0 and take psychic damage equal to half Paladin level."
          },
          {
            "level": 15,
            "name": "Scornful Rebuke",
            "description": "Creatures that damage you take psychic damage equal to Charisma modifier."
          },
          {
            "level": 20,
            "name": "Invincible Conqueror",
            "description": "For 1 minute, gain resistance to all damage, extra attack, and crit on 19–20."
          }
        ]
      },
      {
        "name": "Oath of Redemption",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Channel Divinity: Emissary of Peace",
            "description": "Gain +5 bonus to Charisma (Persuasion) checks for 10 minutes."
          },
          {
            "level": 3,
            "name": "Channel Divinity: Rebuke the Violent",
            "description": "Reflect damage to a creature that harms an ally."
          },
          {
            "level": 7,
            "name": "Aura of the Guardian",
            "description": "Take damage meant for an ally in your aura."
          },
          {
            "level": 15,
            "name": "Protective Spirit",
            "description": "Regain HP at the end of your turn if below half HP."
          },
          {
            "level": 20,
            "name": "Emissary of Redemption",
            "description": "Enemies who attack you without cause take radiant damage and have disadvantage."
          }
        ]
      },
      {
        "name": "Oath of Glory",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Channel Divinity: Peerless Athlete",
            "description": "Gain bonuses to Athletics and Acrobatics for 10 minutes."
          },
          {
            "level": 3,
            "name": "Channel Divinity: Inspiring Smite",
            "description": "Use a bonus action after Divine Smite to grant temp HP to allies within 30 ft."
          },
          {
            "level": 7,
            "name": "Aura of Alacrity",
            "description": "Your speed increases and allies start with bonus movement."
          },
          {
            "level": 15,
            "name": "Glorious Defense",
            "description": "Use reaction to increase AC of an ally, and possibly make a weapon attack."
          },
          {
            "level": 20,
            "name": "Living Legend",
            "description": "Reroll failed attack rolls, charm/frightened immunity, and command enemies to reroll successful attacks."
          }
        ]
      },
      {
        "name": "Oath of the Watchers",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Channel Divinity: Watcher’s Will",
            "description": "Grant advantage on Int, Wis, and Cha saves to allies."
          },
          {
            "level": 3,
            "name": "Channel Divinity: Abjure the Extraplanar",
            "description": "Turn aberrations, celestials, elementals, fey, and fiends."
          },
          {
            "level": 7,
            "name": "Aura of the Sentinel",
            "description": "Add your proficiency bonus to initiative of yourself and allies."
          },
          {
            "level": 15,
            "name": "Vigilant Rebuke",
            "description": "Deal radiant damage to creatures who force saving throws on allies."
          },
          {
            "level": 20,
            "name": "Mortal Bulwark",
            "description": "Gain truesight, advantage on monster saves, teleportation disruption, and opportunity attacks restrain."
          }
        ]
      }
    ]
  },
  {
    "class": "Ranger",
    "source": "PHB",
    "hit_die": "d10",
    "primary_abilities": [
      "Dexterity",
      "Wisdom"
    ],
    "saving_throws": [
      "Strength",
      "Dexterity"
    ],
    "armor_proficiencies": [
      "Light armor",
      "Medium armor",
      "Shields"
    ],
    "weapon_proficiencies": [
      "Simple weapons",
      "Martial weapons"
    ],
    "tools": [],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Favored Enemy",
            "description": "Choose a type of favored enemy; gain bonuses to tracking and knowledge about them."
          },
          {
            "name": "Natural Explorer",
            "description": "Choose a favored terrain and gain exploration bonuses while in it."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Fighting Style",
            "description": "Choose a combat style that grants specific bonuses (e.g., Archery, Defense)."
          },
          {
            "name": "Spellcasting",
            "description": "You can cast ranger spells using Wisdom as your spellcasting ability."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Ranger Archetype",
            "description": "Choose a subclass that grants features at 3rd, 7th, 11th, and 15th levels."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Hunter",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Hunter’s Prey",
            "description": "Choose a bonus like Colossus Slayer, Giant Killer, or Horde Breaker."
          },
          {
            "level": 7,
            "name": "Defensive Tactics",
            "description": "Choose one: Escape the Horde, Multiattack Defense, or Steel Will."
          },
          {
            "level": 11,
            "name": "Multiattack",
            "description": "Choose Volley (ranged) or Whirlwind Attack (melee)."
          },
          {
            "level": 15,
            "name": "Superior Hunter’s Defense",
            "description": "Choose one: Evasion, Stand Against the Tide, or Uncanny Dodge."
          }
        ]
      },
      {
        "name": "Beast Master",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Ranger’s Companion",
            "description": "Gain a beast companion that acts on your initiative and follows your commands."
          },
          {
            "level": 7,
            "name": "Exceptional Training",
            "description": "Your beast can take the Dash, Disengage, or Help action as a bonus action."
          },
          {
            "level": 11,
            "name": "Bestial Fury",
            "description": "Your beast can make two attacks when you use its Attack action."
          },
          {
            "level": 15,
            "name": "Share Spells",
            "description": "When you cast a spell targeting yourself, it also affects your beast companion."
          }
        ]
      },
      {
        "name": "Gloom Stalker",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Dread Ambusher",
            "description": "Add initiative bonus; move and attack more on first turn of combat."
          },
          {
            "level": 3,
            "name": "Umbral Sight",
            "description": "Gain darkvision or extend it; become invisible to creatures relying on darkvision."
          },
          {
            "level": 7,
            "name": "Iron Mind",
            "description": "Gain proficiency in Wisdom saving throws, or another if already proficient."
          },
          {
            "level": 11,
            "name": "Stalker’s Flurry",
            "description": "Missed weapon attack can be retried once per turn."
          },
          {
            "level": 15,
            "name": "Shadowy Dodge",
            "description": "Use reaction to impose disadvantage on an attack roll against you."
          }
        ]
      },
      {
        "name": "Horizon Walker",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Detect Portal",
            "description": "Detect planar portals within 1 mile once per short or long rest."
          },
          {
            "level": 3,
            "name": "Planar Warrior",
            "description": "Bonus action to make your next attack deal extra force damage."
          },
          {
            "level": 7,
            "name": "Ethereal Step",
            "description": "Bonus action to cast *etherealness* for 1 turn once per short rest."
          },
          {
            "level": 11,
            "name": "Distant Strike",
            "description": "Teleport before second attack each turn; make a third attack when targeting different creatures."
          },
          {
            "level": 15,
            "name": "Spectral Defense",
            "description": "Use reaction to halve damage from a visible attacker."
          }
        ]
      },
      {
        "name": "Monster Slayer",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Hunter’s Sense",
            "description": "Use action to learn a creature’s resistances, immunities, and vulnerabilities."
          },
          {
            "level": 3,
            "name": "Slayer’s Prey",
            "description": "Mark a creature to deal extra 1d6 damage on first hit each turn."
          },
          {
            "level": 7,
            "name": "Supernatural Defense",
            "description": "Add 1d6 to saving throws vs abilities of your Slayer’s Prey."
          },
          {
            "level": 11,
            "name": "Magic-User’s Nemesis",
            "description": "Reaction to disrupt a creature’s spell or teleport attempt."
          },
          {
            "level": 15,
            "name": "Slayer’s Counter",
            "description": "Reaction to attack when marked creature forces a save or attacks you."
          }
        ]
      },
      {
        "name": "Fey Wanderer",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Dreadful Strikes",
            "description": "Deal extra psychic damage to one target per turn."
          },
          {
            "level": 3,
            "name": "Otherworldly Glamour",
            "description": "Add Wis mod to Charisma checks and gain proficiency in Charisma skill."
          },
          {
            "level": 7,
            "name": "Beguiling Twist",
            "description": "Redirect charm/fear effects from others to a new target."
          },
          {
            "level": 11,
            "name": "Fey Reinforcements",
            "description": "Cast *summon fey* once per long rest or with spell slots."
          },
          {
            "level": 15,
            "name": "Misty Wanderer",
            "description": "Use *misty step* for free multiple times per day and bring an ally."
          }
        ]
      },
      {
        "name": "Swarmkeeper",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Gathered Swarm",
            "description": "Use a swarm to move enemies, yourself, or deal extra force damage."
          },
          {
            "level": 7,
            "name": "Writhing Tide",
            "description": "Gain a flying speed of 10 ft for 1 minute, once per short rest."
          },
          {
            "level": 11,
            "name": "Mighty Swarm",
            "description": "Your swarm’s effects are improved; flying speed or knock prone."
          },
          {
            "level": 15,
            "name": "Swarming Dispersal",
            "description": "Avoid damage by teleporting using your swarm once per short rest."
          }
        ]
      }
    ]
  },
  {
    "class": "Rogue",
    "source": "PHB",
    "hit_die": "d8",
    "primary_abilities": [
      "Dexterity"
    ],
    "saving_throws": [
      "Dexterity",
      "Intelligence"
    ],
    "armor_proficiencies": [
      "Light armor"
    ],
    "weapon_proficiencies": [
      "Simple weapons",
      "Hand crossbows",
      "Longswords",
      "Rapiers",
      "Shortswords"
    ],
    "tools": [
      "Thieves' tools"
    ],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Expertise",
            "description": "Double proficiency bonus for two skills (or one skill and thieves' tools)."
          },
          {
            "name": "Sneak Attack",
            "description": "Deal extra damage once per turn if you have advantage or an ally nearby."
          },
          {
            "name": "Thieves’ Cant",
            "description": "Secret language known by rogues."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Cunning Action",
            "description": "Take a bonus action on each turn to Dash, Disengage, or Hide."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Roguish Archetype",
            "description": "Choose a subclass that grants features at 3rd, 9th, 13th, and 17th levels."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Thief",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Fast Hands",
            "description": "Use Cunning Action to make Sleight of Hand checks, use thieves’ tools, or use an object."
          },
          {
            "level": 3,
            "name": "Second-Story Work",
            "description": "Climbing doesn’t cost extra movement; jump distance increases."
          },
          {
            "level": 9,
            "name": "Supreme Sneak",
            "description": "Advantage on Stealth if you move no more than half speed."
          },
          {
            "level": 13,
            "name": "Use Magic Device",
            "description": "Ignore class, race, and level requirements on magic items."
          },
          {
            "level": 17,
            "name": "Thief’s Reflexes",
            "description": "Take two turns on the first round of combat."
          }
        ]
      },
      {
        "name": "Assassin",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Bonus Proficiencies",
            "description": "Gain proficiency with the disguise kit and poisoner’s kit."
          },
          {
            "level": 3,
            "name": "Assassinate",
            "description": "Advantage against creatures that haven’t acted; critical hits vs surprised creatures."
          },
          {
            "level": 9,
            "name": "Infiltration Expertise",
            "description": "Create false identities and gather documentation."
          },
          {
            "level": 13,
            "name": "Impostor",
            "description": "Mimic speech and writing after 3 hours of study."
          },
          {
            "level": 17,
            "name": "Death Strike",
            "description": "Double damage against surprised creatures that fail a Constitution save."
          }
        ]
      },
      {
        "name": "Arcane Trickster",
        "source": "PHB",
        "features": [
          {
            "level": 3,
            "name": "Spellcasting",
            "description": "Cast spells from the wizard list (focus on enchantment and illusion)."
          },
          {
            "level": 3,
            "name": "Mage Hand Legerdemain",
            "description": "Enhance Mage Hand for theft and trickery."
          },
          {
            "level": 9,
            "name": "Magical Ambush",
            "description": "Creatures you surprise have disadvantage on saving throws vs your spells."
          },
          {
            "level": 13,
            "name": "Versatile Trickster",
            "description": "Use Mage Hand to distract enemies and gain advantage on attacks."
          },
          {
            "level": 17,
            "name": "Spell Thief",
            "description": "Steal a spell that targets only you and cast it yourself once per long rest."
          }
        ]
      },
      {
        "name": "Swashbuckler",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Fancy Footwork",
            "description": "Creatures you melee don't get opportunity attacks when you move away."
          },
          {
            "level": 3,
            "name": "Rakish Audacity",
            "description": "Add Charisma to initiative; sneak attack without advantage if only one target is within 5 ft."
          },
          {
            "level": 9,
            "name": "Panache",
            "description": "Charm or taunt creatures using Persuasion to compel or distract them."
          },
          {
            "level": 13,
            "name": "Elegant Maneuver",
            "description": "Use bonus action to gain advantage on Acrobatics or Athletics this turn."
          },
          {
            "level": 17,
            "name": "Master Duelist",
            "description": "Re-roll a missed melee attack with advantage once per short rest."
          }
        ]
      },
      {
        "name": "Inquisitive",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Ear for Deceit",
            "description": "Treat rolls below 8 as 8 when using Insight to determine if someone is lying."
          },
          {
            "level": 3,
            "name": "Eye for Detail",
            "description": "Bonus action to make Perception to spot hidden or Insight to decipher clues."
          },
          {
            "level": 3,
            "name": "Insightful Fighting",
            "description": "Use Insight as bonus action to determine weaknesses and Sneak Attack without advantage."
          },
          {
            "level": 9,
            "name": "Steady Eye",
            "description": "Advantage on Perception or Investigation when you move ≤ half speed."
          },
          {
            "level": 13,
            "name": "Unerring Eye",
            "description": "Detect magic, illusion, shapeshifting creatures as a bonus action a number of times per rest."
          },
          {
            "level": 17,
            "name": "Eye for Weakness",
            "description": "Add 3d6 Sneak Attack damage against targets you’ve analyzed with Insightful Fighting."
          }
        ]
      },
      {
        "name": "Scout",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Skirmisher",
            "description": "Move up to half speed as a reaction when a creature ends its turn within 5 ft."
          },
          {
            "level": 3,
            "name": "Survivalist",
            "description": "Gain proficiency and expertise in Nature and Survival."
          },
          {
            "level": 9,
            "name": "Superior Mobility",
            "description": "Increase walking speed and climbing/swimming speeds."
          },
          {
            "level": 13,
            "name": "Ambush Master",
            "description": "Gain advantage and initiative boosts in the first round of combat."
          },
          {
            "level": 17,
            "name": "Sudden Strike",
            "description": "Make a second attack as a bonus action; can apply Sneak Attack to both."
          }
        ]
      },
      {
        "name": "Mastermind",
        "source": "XGtE",
        "features": [
          {
            "level": 3,
            "name": "Master of Intrigue",
            "description": "Gain disguise and mimicry proficiencies; mimic speech after 1 minute."
          },
          {
            "level": 3,
            "name": "Master of Tactics",
            "description": "Use Help as a bonus action and at 30 ft."
          },
          {
            "level": 9,
            "name": "Insightful Manipulator",
            "description": "Learn a creature’s key stats after 1 minute of observation."
          },
          {
            "level": 13,
            "name": "Misdirection",
            "description": "Redirect attacks to another creature if within 5 ft of both."
          },
          {
            "level": 17,
            "name": "Soul of Deceit",
            "description": "Your thoughts cannot be read and you can lie even under magical influence."
          }
        ]
      },
      {
        "name": "Phantom",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Whispers of the Dead",
            "description": "Gain temporary proficiency in a skill or tool on a short/long rest."
          },
          {
            "level": 3,
            "name": "Wails from the Grave",
            "description": "Deal half Sneak Attack damage to a second creature near your target."
          },
          {
            "level": 9,
            "name": "Tokens of the Departed",
            "description": "Harvest soul trinkets from dead creatures for bonuses or to cheat death."
          },
          {
            "level": 13,
            "name": "Ghost Walk",
            "description": "Become incorporeal for movement and resist all damage except force and radiant."
          },
          {
            "level": 17,
            "name": "Death Knell",
            "description": "Deal bonus necrotic damage with Wails from the Grave, regain HP when enemies die."
          }
        ]
      },
      {
        "name": "Soulknife",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Psionic Power",
            "description": "Use Psionic Energy dice for stealth, telepathy, and other abilities."
          },
          {
            "level": 3,
            "name": "Psychic Blades",
            "description": "Summon psychic weapons with finesse and ranged capability."
          },
          {
            "level": 9,
            "name": "Soul Blades",
            "description": "Add psionic effects to attacks, like causing disarm or teleport."
          },
          {
            "level": 13,
            "name": "Psychic Veil",
            "description": "Turn invisible for 1 minute once per long rest or with Psionic dice."
          },
          {
            "level": 17,
            "name": "Rend Mind",
            "description": "Force saves or stun creatures hit with Psychic Blades."
          }
        ]
      }
    ]
  },
  {
    "class": "Sorcerer",
    "source": "PHB",
    "hit_die": "d6",
    "primary_abilities": [
      "Charisma"
    ],
    "saving_throws": [
      "Constitution",
      "Charisma"
    ],
    "armor_proficiencies": [],
    "weapon_proficiencies": [
      "Daggers",
      "Darts",
      "Slings",
      "Quarterstaffs",
      "Light crossbows"
    ],
    "tools": [],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Spellcasting",
            "description": "You can cast sorcerer spells using Charisma as your spellcasting ability."
          },
          {
            "name": "Sorcerous Origin",
            "description": "Choose a Sorcerous Origin that grants subclass features at 1st, 6th, 14th, and 18th levels."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Font of Magic",
            "description": "Gain sorcery points that can be used for various magical effects."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Metamagic",
            "description": "Use sorcery points to modify spells in various ways (e.g., Distant, Twinned, Subtle)."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Draconic Bloodline",
        "source": "PHB",
        "features": [
          {
            "level": 1,
            "name": "Dragon Ancestor",
            "description": "Choose a dragon type which influences spell choices and damage type."
          },
          {
            "level": 1,
            "name": "Draconic Resilience",
            "description": "Gain AC bonus when not wearing armor and additional hit points."
          },
          {
            "level": 6,
            "name": "Elemental Affinity",
            "description": "Add Cha mod to damage of chosen element; spend 1 sorcery point to gain resistance."
          },
          {
            "level": 14,
            "name": "Dragon Wings",
            "description": "Sprout wings and gain a fly speed equal to your walking speed."
          },
          {
            "level": 18,
            "name": "Draconic Presence",
            "description": "Expend 5 sorcery points to exude awe or fear in a 60 ft aura."
          }
        ]
      },
      {
        "name": "Wild Magic",
        "source": "PHB",
        "features": [
          {
            "level": 1,
            "name": "Wild Magic Surge",
            "description": "Roll on the Wild Magic table when casting a sorcerer spell of 1st level or higher."
          },
          {
            "level": 1,
            "name": "Tides of Chaos",
            "description": "Gain advantage on one attack roll, ability check, or saving throw once per long rest."
          },
          {
            "level": 6,
            "name": "Bend Luck",
            "description": "Spend 2 sorcery points to add or subtract 1d4 to another creature’s roll."
          },
          {
            "level": 14,
            "name": "Controlled Chaos",
            "description": "Roll twice on Wild Magic table and choose either result."
          },
          {
            "level": 18,
            "name": "Spell Bombardment",
            "description": "When you roll max damage on a damage die, roll it again and add the result."
          }
        ]
      },
      {
        "name": "Divine Soul",
        "source": "XGtE",
        "features": [
          {
            "level": 1,
            "name": "Divine Magic",
            "description": "Gain access to cleric spell list and a bonus spell from your chosen divine alignment."
          },
          {
            "level": 1,
            "name": "Favored by the Gods",
            "description": "Add 2d4 to a failed save or missed attack roll once per short rest."
          },
          {
            "level": 6,
            "name": "Empowered Healing",
            "description": "Spend sorcery points to reroll healing dice."
          },
          {
            "level": 14,
            "name": "Otherworldly Wings",
            "description": "Grow angelic or bat-like wings and gain a fly speed."
          },
          {
            "level": 18,
            "name": "Unearthly Recovery",
            "description": "Once per day, if below half HP, regain HP equal to half your max HP as a bonus action."
          }
        ]
      },
      {
        "name": "Shadow Magic",
        "source": "XGtE",
        "features": [
          {
            "level": 1,
            "name": "Eyes of the Dark",
            "description": "Gain darkvision and can cast *darkness* using sorcery points."
          },
          {
            "level": 1,
            "name": "Strength of the Grave",
            "description": "Make a Charisma save to avoid dropping to 0 HP once per long rest."
          },
          {
            "level": 6,
            "name": "Hound of Ill Omen",
            "description": "Summon a shadowy hound to harass a target; it grants you advantage and hampers spellcasting."
          },
          {
            "level": 14,
            "name": "Shadow Walk",
            "description": "Teleport from one area of dim light or darkness to another."
          },
          {
            "level": 18,
            "name": "Umbral Form",
            "description": "Become incorporeal for 1 minute, gaining resistance to all damage except force and radiant."
          }
        ]
      },
      {
        "name": "Storm Sorcery",
        "source": "XGtE",
        "features": [
          {
            "level": 1,
            "name": "Wind Speaker",
            "description": "Learn the Primordial language and its dialects."
          },
          {
            "level": 1,
            "name": "Tempestuous Magic",
            "description": "Fly 10 ft as a bonus action when casting a spell of 1st level or higher."
          },
          {
            "level": 6,
            "name": "Heart of the Storm",
            "description": "Resist lightning/thunder and deal extra damage to nearby enemies when casting those spells."
          },
          {
            "level": 6,
            "name": "Storm Guide",
            "description": "Control nearby weather (wind and rain) as an action."
          },
          {
            "level": 14,
            "name": "Storm’s Fury",
            "description": "Rebuke attackers with lightning damage and knock them away."
          },
          {
            "level": 18,
            "name": "Wind Soul",
            "description": "Gain immunity to lightning and thunder damage and fly speed of 60 ft; grant to allies."
          }
        ]
      },
      {
        "name": "Aberrant Mind",
        "source": "TCoE",
        "features": [
          {
            "level": 1,
            "name": "Psionic Spells",
            "description": "Expanded spell list with telepathy and mind magic."
          },
          {
            "level": 1,
            "name": "Telepathic Speech",
            "description": "Speak telepathically to one creature within 30 ft."
          },
          {
            "level": 6,
            "name": "Psionic Sorcery",
            "description": "Cast psionic spells by spending sorcery points instead of spell slots."
          },
          {
            "level": 14,
            "name": "Revelation in Flesh",
            "description": "Spend sorcery points to gain movement adaptations (swim, fly, climb, teleport)."
          },
          {
            "level": 18,
            "name": "Warping Implosion",
            "description": "Create a gravitational implosion that teleports and damages enemies in a radius."
          }
        ]
      },
      {
        "name": "Clockwork Soul",
        "source": "TCoE",
        "features": [
          {
            "level": 1,
            "name": "Clockwork Magic",
            "description": "Expanded spell list of order-themed spells."
          },
          {
            "level": 1,
            "name": "Restore Balance",
            "description": "Cancel advantage or disadvantage on a roll within 60 ft as a reaction."
          },
          {
            "level": 6,
            "name": "Bastion of Law",
            "description": "Use sorcery points to create wards that absorb damage."
          },
          {
            "level": 14,
            "name": "Trance of Order",
            "description": "Become more consistent with rolls (treat below 10 as 10 for attacks/saves)."
          },
          {
            "level": 18,
            "name": "Clockwork Cavalcade",
            "description": "Summon clockwork spirits to restore HP, repair objects, and dispel magic effects."
          }
        ]
      }
    ]
  },
  {
    "class": "Warlock",
    "source": "PHB",
    "hit_die": "d8",
    "primary_abilities": [
      "Charisma"
    ],
    "saving_throws": [
      "Wisdom",
      "Charisma"
    ],
    "armor_proficiencies": [
      "Light armor"
    ],
    "weapon_proficiencies": [
      "Simple weapons"
    ],
    "tools": [],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Otherworldly Patron",
            "description": "Choose a patron that grants subclass features at 1st, 6th, 10th, and 14th levels."
          },
          {
            "name": "Pact Magic",
            "description": "Cast spells using Charisma. Spell slots are regained on a short rest."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Eldritch Invocations",
            "description": "Learn magical enhancements that grant new abilities or spell-like effects."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Pact Boon",
            "description": "Choose a boon: Pact of the Chain, Blade, or Tome, each with unique benefits."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "The Archfey",
        "source": "PHB",
        "features": [
          {
            "level": 1,
            "name": "Fey Presence",
            "description": "As an action, force creatures in a 10 ft cube to make a Wisdom save or be charmed/frightened."
          },
          {
            "level": 6,
            "name": "Misty Escape",
            "description": "Turn invisible and teleport 60 ft as a reaction to taking damage."
          },
          {
            "level": 10,
            "name": "Beguiling Defenses",
            "description": "Immune to charm, and when someone tries to charm you, you can attempt to charm them back."
          },
          {
            "level": 14,
            "name": "Dark Delirium",
            "description": "Charm or frighten a creature for 1 minute with an illusory world."
          }
        ]
      },
      {
        "name": "The Fiend",
        "source": "PHB",
        "features": [
          {
            "level": 1,
            "name": "Dark One’s Blessing",
            "description": "Gain temp HP equal to Charisma mod + level when you reduce a hostile creature to 0 HP."
          },
          {
            "level": 6,
            "name": "Dark One’s Own Luck",
            "description": "Add 1d10 to an ability check or saving throw once per short rest."
          },
          {
            "level": 10,
            "name": "Fiendish Resilience",
            "description": "Choose a damage type and gain resistance to it after a short rest."
          },
          {
            "level": 14,
            "name": "Hurl Through Hell",
            "description": "When you hit, banish a creature to a horrific plane for 10d10 psychic damage."
          }
        ]
      },
      {
        "name": "The Great Old One",
        "source": "PHB",
        "features": [
          {
            "level": 1,
            "name": "Awakened Mind",
            "description": "Telepathically speak to any creature you can see within 30 ft."
          },
          {
            "level": 6,
            "name": "Entropic Ward",
            "description": "Impose disadvantage on a missed attack; gain advantage if the attacker misses."
          },
          {
            "level": 10,
            "name": "Thought Shield",
            "description": "Resistance to psychic damage; attacker takes that damage if you’re hit with it."
          },
          {
            "level": 14,
            "name": "Create Thrall",
            "description": "Charm a creature permanently via touch."
          }
        ]
      },
      {
        "name": "The Celestial",
        "source": "XGtE",
        "features": [
          {
            "level": 1,
            "name": "Healing Light",
            "description": "Use a pool of d6s to heal creatures within 60 ft."
          },
          {
            "level": 6,
            "name": "Radiant Soul",
            "description": "Add Charisma modifier to radiant/fire damage once per turn."
          },
          {
            "level": 10,
            "name": "Celestial Resilience",
            "description": "Gain temp HP at rest; allies nearby do too."
          },
          {
            "level": 14,
            "name": "Searing Vengeance",
            "description": "If reduced to 0 HP, explode with radiant energy and stay at 1 HP."
          }
        ]
      },
      {
        "name": "The Hexblade",
        "source": "XGtE",
        "features": [
          {
            "level": 1,
            "name": "Hexblade’s Curse",
            "description": "Curse a target to take bonus damage and heal when it dies."
          },
          {
            "level": 1,
            "name": "Hex Warrior",
            "description": "Use Charisma for weapon attacks with a chosen weapon."
          },
          {
            "level": 6,
            "name": "Accursed Specter",
            "description": "Raise a slain humanoid as a specter under your control."
          },
          {
            "level": 10,
            "name": "Armor of Hexes",
            "description": "On a cursed creature’s attack, roll 4+ on d6 to negate the hit."
          },
          {
            "level": 14,
            "name": "Master of Hexes",
            "description": "Curse another creature if a cursed one drops to 0 HP."
          }
        ]
      },
      {
        "name": "The Fathomless",
        "source": "TCoE",
        "features": [
          {
            "level": 1,
            "name": "Tentacle of the Deeps",
            "description": "Summon a tentacle to deal cold damage and reduce speed."
          },
          {
            "level": 1,
            "name": "Gift of the Sea",
            "description": "Gain a swimming speed and the ability to breathe underwater."
          },
          {
            "level": 6,
            "name": "Oceanic Soul",
            "description": "Resist cold damage and communicate with creatures underwater."
          },
          {
            "level": 10,
            "name": "Guardian Coil",
            "description": "Tentacle can reduce damage to allies."
          },
          {
            "level": 14,
            "name": "Fathomless Plunge",
            "description": "Teleport self and others in a whirl of seawater."
          }
        ]
      },
      {
        "name": "The Genie",
        "source": "TCoE",
        "features": [
          {
            "level": 1,
            "name": "Genie’s Vessel",
            "description": "Magical container acts as a spell focus and has extra utility."
          },
          {
            "level": 1,
            "name": "Bottled Respite",
            "description": "Enter your vessel for a short rest or to hide."
          },
          {
            "level": 6,
            "name": "Elemental Gift",
            "description": "Gain resistance and a flying speed for a short time based on genie type."
          },
          {
            "level": 10,
            "name": "Sanctuary Vessel",
            "description": "Bring others into your vessel for safe short rests."
          },
          {
            "level": 14,
            "name": "Limited Wish",
            "description": "Duplicate a 6th-level or lower spell once per long rest."
          }
        ]
      }
    ]
  },
  {
    "class": "Wizard",
    "source": "PHB",
    "hit_die": "d6",
    "primary_abilities": [
      "Intelligence"
    ],
    "saving_throws": [
      "Intelligence",
      "Wisdom"
    ],
    "armor_proficiencies": [],
    "weapon_proficiencies": [
      "Daggers",
      "Darts",
      "Slings",
      "Quarterstaffs",
      "Light crossbows"
    ],
    "tools": [],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Spellcasting",
            "description": "You can cast wizard spells using Intelligence as your spellcasting ability."
          },
          {
            "name": "Arcane Recovery",
            "description": "Regain some spell slots after a short rest once per day."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Arcane Tradition",
            "description": "Choose a school of magic (subclass) that grants features at 2nd, 6th, 10th, and 14th levels."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "School of Abjuration",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Abjuration Savant",
            "description": "Copy abjuration spells into your spellbook for half time and cost."
          },
          {
            "level": 2,
            "name": "Arcane Ward",
            "description": "Create a magical ward to absorb damage when casting abjuration spells."
          },
          {
            "level": 6,
            "name": "Projected Ward",
            "description": "Use your Arcane Ward to protect others."
          },
          {
            "level": 10,
            "name": "Improved Abjuration",
            "description": "Add proficiency bonus to ability checks with abjuration spells."
          },
          {
            "level": 14,
            "name": "Spell Resistance",
            "description": "Advantage on saving throws vs spells and resistance to spell damage."
          }
        ]
      },
      {
        "name": "School of Conjuration",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Conjuration Savant",
            "description": "Copy conjuration spells into your spellbook for half time and cost."
          },
          {
            "level": 2,
            "name": "Minor Conjuration",
            "description": "Create a nonmagical object in your hand or on the ground within 10 ft."
          },
          {
            "level": 6,
            "name": "Benign Transposition",
            "description": "Teleport up to 30 ft or swap places with an ally."
          },
          {
            "level": 10,
            "name": "Focused Conjuration",
            "description": "Maintain concentration on conjuration spells even when taking damage."
          },
          {
            "level": 14,
            "name": "Durable Summons",
            "description": "Summoned creatures have 30 temporary HP."
          }
        ]
      },
      {
        "name": "School of Divination",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Divination Savant",
            "description": "Copy divination spells into your spellbook for half time and cost."
          },
          {
            "level": 2,
            "name": "Portent",
            "description": "Roll two d20s after a long rest and replace any roll with one of these."
          },
          {
            "level": 6,
            "name": "Expert Divination",
            "description": "Regain a spell slot when casting a divination spell of 2nd level or higher."
          },
          {
            "level": 10,
            "name": "The Third Eye",
            "description": "Gain darkvision, ethereal sight, greater comprehension, or see invisibility."
          },
          {
            "level": 14,
            "name": "Greater Portent",
            "description": "Roll three d20s for Portent instead of two."
          }
        ]
      },
      {
        "name": "School of Enchantment",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Enchantment Savant",
            "description": "Copy enchantment spells into your spellbook for half time and cost."
          },
          {
            "level": 2,
            "name": "Hypnotic Gaze",
            "description": "Charm a creature with your gaze for up to a minute."
          },
          {
            "level": 6,
            "name": "Instinctive Charm",
            "description": "Redirect an attack by forcing a Wisdom save."
          },
          {
            "level": 10,
            "name": "Split Enchantment",
            "description": "When you enchant a creature, target a second creature."
          },
          {
            "level": 14,
            "name": "Alter Memories",
            "description": "Make a creature forget it was charmed or see you as friendly."
          }
        ]
      },
      {
        "name": "School of Evocation",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Evocation Savant",
            "description": "Copy evocation spells into your spellbook for half time and cost."
          },
          {
            "level": 2,
            "name": "Sculpt Spells",
            "description": "Protect allies from your evocation spells’ effects."
          },
          {
            "level": 6,
            "name": "Potent Cantrip",
            "description": "Cantrips deal half damage on a successful save."
          },
          {
            "level": 10,
            "name": "Empowered Evocation",
            "description": "Add Int modifier to damage of evocation spells."
          },
          {
            "level": 14,
            "name": "Overchannel",
            "description": "Maximize spell damage at cost of potential self-damage."
          }
        ]
      },
      {
        "name": "School of Illusion",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Illusion Savant",
            "description": "Copy illusion spells into your spellbook for half time and cost."
          },
          {
            "level": 2,
            "name": "Improved Minor Illusion",
            "description": "You can create sound and image with *minor illusion*."
          },
          {
            "level": 6,
            "name": "Malleable Illusions",
            "description": "Change existing illusions using your action."
          },
          {
            "level": 10,
            "name": "Illusory Self",
            "description": "Use your reaction to create an illusory duplicate to avoid an attack."
          },
          {
            "level": 14,
            "name": "Illusory Reality",
            "description": "Make part of your illusion real for 1 minute."
          }
        ]
      },
      {
        "name": "School of Necromancy",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Necromancy Savant",
            "description": "Copy necromancy spells into your spellbook for half time and cost."
          },
          {
            "level": 2,
            "name": "Grim Harvest",
            "description": "Regain HP when you kill with a spell (double for necromancy spells)."
          },
          {
            "level": 6,
            "name": "Undead Thralls",
            "description": "Raise additional undead and buff them."
          },
          {
            "level": 10,
            "name": "Inured to Undeath",
            "description": "Gain resistance to necrotic damage and immunity to max HP reduction."
          },
          {
            "level": 14,
            "name": "Command Undead",
            "description": "Charm undead that fail a Charisma save."
          }
        ]
      },
      {
        "name": "School of Transmutation",
        "source": "PHB",
        "features": [
          {
            "level": 2,
            "name": "Transmutation Savant",
            "description": "Copy transmutation spells into your spellbook for half time and cost."
          },
          {
            "level": 2,
            "name": "Minor Alchemy",
            "description": "Transform one material into another temporarily."
          },
          {
            "level": 6,
            "name": "Transmuter’s Stone",
            "description": "Create a magical stone granting various effects (e.g., resistance, darkvision)."
          },
          {
            "level": 10,
            "name": "Shapechanger",
            "description": "Cast *polymorph* without using a spell slot or components."
          },
          {
            "level": 14,
            "name": "Master Transmuter",
            "description": "Use your stone for powerful effects like full heal, raise dead, or restore youth."
          }
        ]
      },
      {
        "name": "Bladesinging",
        "source": "TCoE",
        "features": [
          {
            "level": 2,
            "name": "Training in War and Song",
            "description": "Proficiency with light armor, one one-handed melee weapon, and Performance."
          },
          {
            "level": 2,
            "name": "Bladesong",
            "description": "Bonus to AC, movement, saves, and concentration while active."
          },
          {
            "level": 6,
            "name": "Extra Attack",
            "description": "Attack twice or once and cast a cantrip."
          },
          {
            "level": 10,
            "name": "Song of Defense",
            "description": "Use reaction and spell slots to reduce damage taken."
          },
          {
            "level": 14,
            "name": "Song of Victory",
            "description": "Add Int modifier to melee weapon damage while Bladesong is active."
          }
        ]
      },
      {
        "name": "Order of Scribes",
        "source": "TCoE",
        "features": [
          {
            "level": 2,
            "name": "Wizardly Quill",
            "description": "Magical quill that improves your spellbook and scribing speed."
          },
          {
            "level": 2,
            "name": "Awakened Spellbook",
            "description": "Your book becomes sentient, lets you cast spells with different damage types."
          },
          {
            "level": 6,
            "name": "Manifest Mind",
            "description": "Summon your spellbook's mind to project spells and see/hear remotely."
          },
          {
            "level": 10,
            "name": "Master Scrivener",
            "description": "Create scrolls of wizard spells that are easier to cast."
          },
          {
            "level": 14,
            "name": "One with the Word",
            "description": "Prevent death, explode with damage and erase spells from your book temporarily."
          }
        ]
      }
    ]
  },
  {
    "class": "Artificer",
    "source": "TCoE",
    "hit_die": "d8",
    "primary_abilities": [
      "Intelligence"
    ],
    "saving_throws": [
      "Constitution",
      "Intelligence"
    ],
    "armor_proficiencies": [
      "Light armor",
      "Medium armor",
      "Shields"
    ],
    "weapon_proficiencies": [
      "Simple weapons"
    ],
    "tools": [
      "Thieves’ tools",
      "Tinker’s tools",
      "One type of artisan’s tools of your choice"
    ],
    "base_class_features": [
      {
        "level": 1,
        "features": [
          {
            "name": "Magical Tinkering",
            "description": "Imbue a tiny nonmagical object with magical effects (light, recorded message, scent, etc)."
          },
          {
            "name": "Spellcasting",
            "description": "Cast artificer spells using Intelligence. Use tools as spellcasting focus."
          }
        ]
      },
      {
        "level": 2,
        "features": [
          {
            "name": "Infuse Item",
            "description": "Imbue items with magical infusions; choose from a list of options."
          }
        ]
      },
      {
        "level": 3,
        "features": [
          {
            "name": "Artificer Specialist",
            "description": "Choose a subclass that grants features at 3rd, 5th, 9th, and 15th levels."
          },
          {
            "name": "The Right Tool for the Job",
            "description": "Create a set of artisan’s tools using tinker’s tools during a short rest."
          }
        ]
      }
    ],
    "subclasses": [
      {
        "name": "Alchemist",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Alchemist Spells",
            "description": "Gain additional spells like Healing Word, Flaming Sphere, Revivify, etc."
          },
          {
            "level": 3,
            "name": "Experimental Elixir",
            "description": "Create magical elixirs that grant effects like healing, flight, or transformation."
          },
          {
            "level": 5,
            "name": "Alchemical Savant",
            "description": "Add Intelligence mod to one roll of healing/damage from alchemist spells."
          },
          {
            "level": 9,
            "name": "Restorative Reagents",
            "description": "Elixirs grant temp HP or remove conditions. Cast lesser restoration without a slot."
          },
          {
            "level": 15,
            "name": "Chemical Mastery",
            "description": "Gain resistance to acid and poison. Cast greater restoration and heal once per long rest."
          }
        ]
      },
      {
        "name": "Artillerist",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Artillerist Spells",
            "description": "Gain additional spells like Shield, Scorching Ray, Fireball, etc."
          },
          {
            "level": 3,
            "name": "Eldritch Cannon",
            "description": "Create a magical cannon (flamethrower, force ballista, or protector) that lasts 1 hour."
          },
          {
            "level": 5,
            "name": "Arcane Firearm",
            "description": "Use a wand/rod/staff as a firearm focus, adding 1d8 to artificer spell damage."
          },
          {
            "level": 9,
            "name": "Explosive Cannon",
            "description": "Your cannon’s damage increases; you can detonate it."
          },
          {
            "level": 15,
            "name": "Fortified Position",
            "description": "Summon two cannons; they grant half cover and boost saves for creatures in range."
          }
        ]
      },
      {
        "name": "Battle Smith",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Battle Smith Spells",
            "description": "Gain spells like Heroism, Warding Bond, Aura of Vitality, etc."
          },
          {
            "level": 3,
            "name": "Battle Ready",
            "description": "Use Intelligence for magic weapon attacks; gain martial weapons proficiency."
          },
          {
            "level": 3,
            "name": "Steel Defender",
            "description": "Summon a mechanical companion that fights with you and defends allies."
          },
          {
            "level": 5,
            "name": "Extra Attack",
            "description": "Attack twice instead of once when taking the Attack action."
          },
          {
            "level": 9,
            "name": "Arcane Jolt",
            "description": "Imbue attacks or Steel Defender’s attacks with healing or extra damage."
          },
          {
            "level": 15,
            "name": "Improved Defender",
            "description": "Steel Defender gains bonus damage and temporary HP when it uses its reaction."
          }
        ]
      },
      {
        "name": "Armorer",
        "source": "TCoE",
        "features": [
          {
            "level": 3,
            "name": "Arcane Armor",
            "description": "Infuse armor to become a magical extension of yourself."
          },
          {
            "level": 3,
            "name": "Armor Model",
            "description": "Choose Guardian (thunder gauntlets, defensive) or Infiltrator (lightning, stealthy)."
          },
          {
            "level": 5,
            "name": "Extra Attack",
            "description": "Attack twice when taking the Attack action."
          },
          {
            "level": 9,
            "name": "Armor Modifications",
            "description": "Infuse four armor pieces instead of normal limit."
          },
          {
            "level": 15,
            "name": "Perfected Armor",
            "description": "Guardian: pull and explode; Infiltrator: arc lightning chain effect."
          }
        ]
      }
    ]
  }
]

    
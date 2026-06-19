// CSS loaded via <link rel="stylesheet"> in index.html — no import needed

// ═══ CONSTANTS ═══
const ALL_CONDS=['Blinded','Charmed','Deafened','Exhausted','Frightened','Grappled','Incapacitated','Invisible','Paralyzed','Petrified','Poisoned','Prone','Restrained','Stunned','Unconscious'];
const SPELL_LVLS=['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];
const XP_T=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
const CP_INT={exploration:6,combat:3,roleplay:8,custom:6};
const DEFAULT_MAX_LB=1080;
function getMaxLb(){return parseFloat(state.wagon?.capacity)||DEFAULT_MAX_LB;}
const ZONE_IDS=['front','back','left','right','air','rear'];
const ZONE_LABELS={front:'Frontline',back:'Backline',left:'Left Flank',right:'Right Flank',air:'Air Space',rear:'Rear Guard'};
const ZONE_ADJ={front:['left','right','back','air'],back:['front','rear'],left:['front'],right:['front'],air:['front'],rear:['back']};
function _defaultZones(){var z={};ZONE_IDS.forEach(function(id){z[id]={label:ZONE_LABELS[id],effect:'',terrain:'',hidden:false};});return z;}
let _zoneMoveSel=null;
const ITYPES=['supply','foraged','ingredient','trade','loot','hoard','misc','key'];
const PC_ITEM_TYPES=['weapon','armor','shield','tool','potion','scroll','consumable','loot','misc','key'];
const GEAR_TYPES=new Set(['weapon','armor','shield','tool']);

// ── Level-Up Data (Fighter/Rogue/Bard L2–L5) ──
const LEVEL_UP_DATA={
  fighter:{hit_die:10,levels:{
    2:{auto:['Action Surge (1/Short Rest): Take one additional action on your turn.'],choose:[]},
    3:{auto:[],choose:[{type:'subclass',prompt:'Choose Martial Archetype',options:['Champion','Battle Master','Eldritch Knight']}]},
    4:{auto:[],choose:[{type:'asi',prompt:'Ability Score Improvement'}]},
    5:{auto:['Extra Attack: Attack twice when you take the Attack action.'],choose:[]},
    6:{auto:[],choose:[{type:'asi',prompt:'Ability Score Improvement'}]},
    7:{auto:['Battle Master: Know 5 maneuvers, 5 superiority dice (d8).','Champion: Remarkable Athlete — add half proficiency to STR/DEX/CON checks you aren\'t proficient in.'],choose:[]},
    8:{auto:[],choose:[{type:'asi',prompt:'Ability Score Improvement'}]},
    9:{auto:['Indomitable (1/Long Rest): Reroll a failed saving throw. Must use the new roll.'],choose:[]},
    10:{auto:['Battle Master: Know 7 maneuvers, gain 1 additional superiority die.','Champion: Additional Fighting Style.'],choose:[]}
  }},
  rogue:{hit_die:8,levels:{
    2:{auto:['Cunning Action: Dash, Disengage, or Hide as a Bonus Action each turn.'],choose:[]},
    3:{auto:['Sneak Attack increases to 2d6.'],choose:[{type:'subclass',prompt:'Choose Roguish Archetype',options:['Arcane Trickster','Assassin','Thief','Mastermind','Swashbuckler']}]},
    4:{auto:[],choose:[{type:'asi',prompt:'Ability Score Improvement'}]},
    5:{auto:['Uncanny Dodge: Use Reaction to halve damage from an attacker you can see.','Sneak Attack increases to 3d6.'],choose:[]},
    6:{auto:['Expertise: Choose 2 more skill proficiencies to double.'],choose:[]},
    7:{auto:['Evasion: DEX save for half damage → take no damage on success, half on fail.','Sneak Attack increases to 4d6.'],choose:[]},
    8:{auto:[],choose:[{type:'asi',prompt:'Ability Score Improvement'}]},
    9:{auto:['Arcane Trickster: Magical Ambush — if hidden, target has disadvantage on saves vs your spells.','Sneak Attack increases to 5d6.'],choose:[
      {type:'spell',prompt:'Choose 1 new spell (up to 2nd level)',count:1,tier:2}
    ]},
    10:{auto:[],choose:[{type:'asi',prompt:'Ability Score Improvement'}]}
  }},
  bard:{hit_die:8,
    slots:{1:[2],2:[3],3:[4,2],4:[4,3],5:[4,3,2],6:[4,3,3],7:[4,3,3,1],8:[4,3,3,2],9:[4,3,3,3,1],10:[4,3,3,3,2]},
    levels:{
      2:{auto:["Jack of All Trades: Add half your proficiency bonus (rounded down) to ability checks you aren't proficient in.",'Song of Rest (d6): Allies regain extra 1d6 HP when spending Hit Dice during a Short Rest.'],
        choose:[{type:'spell',prompt:'Choose 1 new Bard spell (1st level)',count:1,tier:1}]},
      3:{auto:['Expertise: Choose 2 more skills to double your proficiency bonus on them.'],
        choose:[
          {type:'subclass',prompt:'Choose Bard College',options:['College of Lore','College of Valor','College of Glamour','College of Whispers','College of Creation']},
          {type:'spell',prompt:'Choose 1 new Bard spell (up to 2nd level)',count:1,tier:2}
        ]},
      4:{auto:[],choose:[
        {type:'asi',prompt:'Ability Score Improvement'},
        {type:'spell',prompt:'Choose 1 new Bard spell or cantrip',count:1,tier:1,cantrip:true}
      ]},
      5:{auto:['Bardic Inspiration die upgrades to d8 (was d6).','Font of Inspiration: Regain all Bardic Inspiration uses on a Short Rest.'],
        choose:[{type:'spell',prompt:'Choose 1 new Bard spell (up to 3rd level)',count:1,tier:3}]},
      6:{auto:['College of Lore: Additional Magical Secrets — learn 2 spells from any class list (up to 3rd level).','Countercharm: As an action, start a performance that gives you and allies within 30 ft advantage on saves vs being frightened or charmed.'],
        choose:[{type:'spell',prompt:'Choose 2 Magical Secrets spells (any class, up to 3rd level)',count:2,tier:3}]},
      7:{auto:[],choose:[{type:'spell',prompt:'Choose 1 new Bard spell (up to 4th level)',count:1,tier:4}]},
      8:{auto:[],choose:[
        {type:'asi',prompt:'Ability Score Improvement'},
        {type:'spell',prompt:'Choose 1 new Bard spell (up to 4th level)',count:1,tier:4}
      ]},
      9:{auto:['Song of Rest upgrades to d8 (was d6).'],
        choose:[{type:'spell',prompt:'Choose 1 new Bard spell (up to 5th level)',count:1,tier:5}]},
      10:{auto:['Bardic Inspiration die upgrades to d10 (was d8).','Expertise: Choose 2 more skills to double proficiency.','Magical Secrets: Learn 2 spells from any class list (up to 5th level).'],
        choose:[{type:'spell',prompt:'Choose 2 Magical Secrets spells (any class, up to 5th level)',count:2,tier:5}]}
    }
  }
};
const BARD_SPELLS={
  0:['Dancing Lights','Friends','Light','Mage Hand','Mending','Message','Minor Illusion','Prestidigitation','True Strike','Vicious Mockery'],
  1:['Animal Friendship','Bane','Charm Person','Comprehend Languages','Cure Wounds','Detect Magic','Disguise Self','Faerie Fire','Feather Fall','Healing Word','Heroism','Identify','Illusory Script','Longstrider','Silent Image','Sleep','Speak with Animals','Thunderwave','Unseen Servant'],
  2:['Animal Messenger','Blindness/Deafness','Calm Emotions','Cloud of Daggers','Crown of Madness','Detect Thoughts','Enhance Ability','Enthrall','Heat Metal','Hold Person','Invisibility','Knock','Lesser Restoration','Locate Object','Magic Mouth','Phantasmal Force','See Invisibility','Shatter','Silence','Suggestion','Zone of Truth'],
  3:['Bestow Curse','Clairvoyance','Dispel Magic','Fear','Hypnotic Pattern','Major Image','Nondetection','Plant Growth','Sending','Slow','Speak with Dead','Stinking Cloud','Tongues'],
  4:['Compulsion','Confusion','Dimension Door','Freedom of Movement','Greater Invisibility','Hallucinatory Terrain','Locate Creature','Polymorph'],
  5:['Animate Objects','Awaken','Dominate Person','Dream','Geas','Greater Restoration','Hold Monster','Legend Lore','Mass Cure Wounds','Mislead','Modify Memory','Planar Binding','Raise Dead','Scrying','Seeming','Teleportation Circle']
};

// ═══ SPELL COMPENDIUM ═══
const SPELL_DB=[
// ── Cantrips ──
{name:'Acid Splash',level:0,school:'Conjuration',castTime:'1 action',range:'60 ft',duration:'Instantaneous',components:'V, S',desc:'Hurl a bubble of acid. One creature in range or two within 5 ft of each other must succeed DEX save or take 1d6 acid damage. Scales: 2d6 at 5th, 3d6 at 11th, 4d6 at 17th.',classes:['wizard']},
{name:'Blade Ward',level:0,school:'Abjuration',castTime:'1 action',range:'Self',duration:'1 round',components:'V, S',desc:'You gain resistance to bludgeoning, piercing, and slashing damage from weapon attacks until the start of your next turn.',classes:['bard','wizard']},
{name:'Booming Blade',level:0,school:'Evocation',castTime:'1 action',range:'Self (5-ft radius)',duration:'1 round',components:'S, M (a melee weapon worth at least 1 sp)',desc:'Make a melee attack with your weapon. On hit, the target takes normal damage plus, if it willingly moves before your next turn, it takes 1d8 thunder damage. Both scale at 5th level.',classes:['wizard']},
{name:'Chill Touch',level:0,school:'Necromancy',castTime:'1 action',range:'120 ft',duration:'1 round',components:'V, S',desc:'Ranged spell attack. 1d8 necrotic damage and target can\'t regain HP until your next turn. Against undead, also has disadvantage on attacks against you. Scales at 5th/11th/17th.',classes:['wizard']},
{name:'Dancing Lights',level:0,school:'Evocation',castTime:'1 action',range:'120 ft',duration:'Concentration, 1 min',components:'V, S, M (phosphorus or wychwood)',desc:'Create up to four torch-sized lights within range. Each sheds dim light in 10-ft radius. You can move them up to 60 ft as a bonus action.',classes:['bard','wizard']},
{name:'Fire Bolt',level:0,school:'Evocation',castTime:'1 action',range:'120 ft',duration:'Instantaneous',components:'V, S',desc:'Ranged spell attack. 1d10 fire damage. Ignites unattended flammable objects. Scales: 2d10 at 5th, 3d10 at 11th, 4d10 at 17th.',classes:['wizard']},
{name:'Friends',level:0,school:'Enchantment',castTime:'1 action',range:'Self',duration:'Concentration, 1 min',components:'S, M (makeup)',desc:'You have advantage on CHA checks against one creature that isn\'t hostile. When the spell ends, the creature realizes you used magic and becomes hostile.',classes:['bard','wizard']},
{name:'Green-Flame Blade',level:0,school:'Evocation',castTime:'1 action',range:'Self (5-ft radius)',duration:'Instantaneous',components:'S, M (a melee weapon worth at least 1 sp)',desc:'Make a melee attack. On hit, green fire leaps to a different creature within 5 ft of target, dealing fire damage equal to your spellcasting modifier. Both scale at 5th level.',classes:['wizard']},
{name:'Guidance',level:0,school:'Divination',castTime:'1 action',range:'Touch',duration:'Concentration, 1 min',components:'V, S',desc:'Touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the check. The spell then ends.',classes:['druid']},
{name:'Light',level:0,school:'Evocation',castTime:'1 action',range:'Touch',duration:'1 hour',components:'V, M (firefly or phosphorescent moss)',desc:'Touch one object no larger than 10 ft. It sheds bright light in a 20-ft radius and dim light for an additional 20 ft. Hostile creature gets DEX save.',classes:['bard','wizard']},
{name:'Mage Hand',level:0,school:'Conjuration',castTime:'1 action',range:'30 ft',duration:'1 min',components:'V, S',desc:'A spectral floating hand appears. It can manipulate objects, open doors, stow/retrieve items, or pour out vials. Can\'t attack, activate magic items, or carry more than 10 lbs. Arcane Trickster version is invisible.',classes:['bard','wizard']},
{name:'Mending',level:0,school:'Transmutation',castTime:'1 min',range:'Touch',duration:'Instantaneous',components:'V, S, M (two lodestones)',desc:'Repair a single break or tear in an object you touch (broken chain link, two halves of a key, torn cloak). The break can be no larger than 1 ft in any dimension.',classes:['bard','wizard']},
{name:'Message',level:0,school:'Transmutation',castTime:'1 action',range:'120 ft',duration:'1 round',components:'V, S, M (copper wire)',desc:'Whisper a message to a creature in range. Only the target hears it and can reply in a whisper that only you hear. Can cast through solid objects if you are familiar with the target.',classes:['bard','wizard']},
{name:'Minor Illusion',level:0,school:'Illusion',castTime:'1 action',range:'30 ft',duration:'1 min',components:'S, M (a bit of fleece)',desc:'Create a sound or an image of an object within range. Sound can be any volume from whisper to scream. Image must fit in a 5-ft cube and can\'t create sensory effects. Investigation check vs your spell DC reveals it as illusion.',classes:['bard','wizard']},
{name:'Mold Earth',level:0,school:'Transmutation',castTime:'1 action',range:'30 ft',duration:'Instantaneous or 1 hour',components:'S',desc:'Choose a portion of dirt or stone no larger than 5 ft on a side. You can: excavate it and move it up to 5 ft (loose earth only); cause shapes/colors/words to appear on dirt or stone for 1 hour; or make dirt/stone difficult or normal terrain for 1 hour. Two non-instantaneous effects max at once.',classes:['druid','wizard']},
{name:'Poison Spray',level:0,school:'Conjuration',castTime:'1 action',range:'10 ft',duration:'Instantaneous',components:'V, S',desc:'Target must succeed on a CON save or take 1d12 poison damage. Scales: 2d12 at 5th, 3d12 at 11th, 4d12 at 17th.',classes:['wizard']},
{name:'Prestidigitation',level:0,school:'Transmutation',castTime:'1 action',range:'10 ft',duration:'1 hour',components:'V, S',desc:'Minor magical trick: sensory effect, light/snuff candle, clean/soil 1 cu ft, chill/warm/flavor 1 cu ft of material, make a color/mark/symbol for 1 hour, create a trinket or illusory image that fits in your hand for 1 round.',classes:['bard','wizard']},
{name:'Ray of Frost',level:0,school:'Evocation',castTime:'1 action',range:'60 ft',duration:'Instantaneous',components:'V, S',desc:'Ranged spell attack. 1d8 cold damage and target\'s speed is reduced by 10 ft until your next turn. Scales: 2d8 at 5th, 3d8 at 11th, 4d8 at 17th.',classes:['wizard']},
{name:'Shocking Grasp',level:0,school:'Evocation',castTime:'1 action',range:'Touch',duration:'Instantaneous',components:'V, S',desc:'Melee spell attack with advantage if target wears metal armor. 1d8 lightning damage and target can\'t take reactions until its next turn. Scales at 5th/11th/17th.',classes:['wizard']},
{name:'Thunderclap',level:0,school:'Evocation',castTime:'1 action',range:'5 ft',duration:'Instantaneous',components:'S',desc:'Each creature within 5 ft other than you must succeed on a CON save or take 1d6 thunder damage. The sound is audible 100 ft away. Scales at 5th/11th/17th.',classes:['bard']},
{name:'True Strike',level:0,school:'Divination',castTime:'1 action',range:'30 ft',duration:'Concentration, 1 round',components:'S',desc:'You gain advantage on your first attack roll against the target on your next turn.',classes:['bard','wizard']},
{name:'Vicious Mockery',level:0,school:'Enchantment',castTime:'1 action',range:'60 ft',duration:'Instantaneous',components:'V',desc:'Unleash a string of insults at a creature. WIS save or 1d4 psychic damage and disadvantage on next attack roll before end of its next turn. Scales at 5th/11th/17th.',classes:['bard']},
// ── 1st Level ──
{name:'Absorb Elements',level:1,school:'Abjuration',castTime:'1 reaction',range:'Self',duration:'1 round',components:'S',desc:'When you take acid, cold, fire, lightning, or thunder damage, you gain resistance to that damage type until your next turn. First melee attack on your next turn deals an extra 1d6 of that damage type.',classes:['wizard']},
{name:'Animal Friendship',level:1,school:'Enchantment',castTime:'1 action',range:'30 ft',duration:'24 hours',components:'V, S, M (morsel of food)',desc:'Convince a beast that you mean it no harm. WIS save (fails if INT 4+). Beast is charmed for the duration. At higher levels: +1 beast per slot level.',classes:['bard']},
{name:'Bane',level:1,school:'Enchantment',castTime:'1 action',range:'30 ft',duration:'Concentration, 1 min',components:'V, S, M (drop of blood)',desc:'Up to 3 creatures must make CHA saves. On failure, subtract 1d4 from all attack rolls and saving throws for the duration. At higher levels: +1 creature per slot.',classes:['bard']},
{name:'Charm Person',level:1,school:'Enchantment',castTime:'1 action',range:'30 ft',duration:'1 hour',components:'V, S',desc:'Charm a humanoid you can see. WIS save (advantage if you\'re fighting it). Charmed creature regards you as a friendly acquaintance. It knows it was charmed when the spell ends. Higher levels: +1 target per slot.',classes:['bard','wizard']},
{name:'Color Spray',level:1,school:'Illusion',castTime:'1 action',range:'Self (15-ft cone)',duration:'1 round',components:'V, S, M (pinch of powder)',desc:'Roll 6d10; that many HP of creatures are blinded (starting with lowest current HP). At higher levels: +2d10 per slot level above 1st.',classes:['wizard']},
{name:'Comprehend Languages',level:1,school:'Divination',castTime:'1 action (ritual)',range:'Self',duration:'1 hour',components:'V, S, M (pinch of soot and salt)',desc:'You understand the literal meaning of any spoken language you hear and any written language you see. It takes about 1 minute to read one page of text. Doesn\'t decode secret messages or glyphs.',classes:['bard','wizard']},
{name:'Cure Wounds',level:1,school:'Evocation',castTime:'1 action',range:'Touch',duration:'Instantaneous',components:'V, S',desc:'Creature you touch regains 1d8 + your spellcasting modifier hit points. No effect on undead or constructs. At higher levels: +1d8 per slot level above 1st.',classes:['bard']},
{name:'Detect Magic',level:1,school:'Divination',castTime:'1 action (ritual)',range:'Self',duration:'Concentration, 10 min',components:'V, S',desc:'You sense magic within 30 ft. You can use your action to see a faint aura around any visible creature or object that bears magic, and learn its school. Blocked by 1 ft of stone, 1 inch of metal, thin sheet of lead, or 3 ft of wood/dirt.',classes:['bard','wizard']},
{name:'Disguise Self',level:1,school:'Illusion',castTime:'1 action',range:'Self',duration:'1 hour',components:'V, S',desc:'You make yourself—including clothing, armor, weapons, and belongings—look different. You can change height by up to 1 ft, appear thinner/fatter, and change body type. Investigation check vs your spell DC to discern illusion.',classes:['bard','wizard']},
{name:'Entangle',level:1,school:'Conjuration',castTime:'1 action',range:'90 ft',duration:'Concentration, 1 min',components:'V, S',desc:'Grasping weeds and vines sprout from the ground in a 20-ft square starting from a point within range. Creatures in the area must make a STR save or be restrained. A creature restrained can use its action to make a STR check vs your spell DC to free itself. The area is difficult terrain for the duration.',classes:['druid']},
{name:'Dissonant Whispers',level:1,school:'Enchantment',castTime:'1 action',range:'60 ft',duration:'Instantaneous',components:'V',desc:'Whisper a discordant melody. Target makes WIS save. Fail: 3d6 psychic damage and must use reaction to move away from you. Pass: half damage, no movement. Deafened creatures auto-succeed. Higher levels: +1d6 per slot.',classes:['bard']},
{name:'Faerie Fire',level:1,school:'Evocation',castTime:'1 action',range:'60 ft',duration:'Concentration, 1 min',components:'V',desc:'Objects and creatures in a 20-ft cube are outlined in blue, green, or violet light. DEX save or affected creature sheds dim light in 10-ft radius. Attacks against affected creatures have advantage. Invisible creatures become visible.',classes:['bard']},
{name:'Feather Fall',level:1,school:'Transmutation',castTime:'1 reaction',range:'60 ft',duration:'1 min',components:'V, M (small feather or piece of down)',desc:'Choose up to 5 falling creatures within range. Their rate of descent slows to 60 ft per round. If they land before the spell ends, they take no falling damage and can land on their feet.',classes:['bard','wizard']},
{name:'Find Familiar',level:1,school:'Conjuration',castTime:'1 hour (ritual)',range:'10 ft',duration:'Instantaneous',components:'V, S, M (10 gp of charcoal, incense, herbs)',desc:'Summon a spirit as a familiar (bat, cat, hawk, owl, rat, raven, spider, etc.). You can communicate telepathically within 100 ft, see through its eyes as an action, and deliver touch spells through it. Disappears at 0 HP.',classes:['wizard']},
{name:'Grease',level:1,school:'Conjuration',castTime:'1 action',range:'60 ft',duration:'1 min',components:'V, S, M (a bit of pork rind or butter)',desc:'Slick grease covers the ground in a 10-ft square centered on a point within range. The area becomes difficult terrain. Each creature standing in the area when the spell is cast must succeed on a DEX save or fall prone. A creature that enters or ends its turn in the area must also make a DEX save or fall prone.',classes:['wizard']},
{name:'Healing Word',level:1,school:'Evocation',castTime:'1 bonus action',range:'60 ft',duration:'Instantaneous',components:'V',desc:'Creature you can see within range regains 1d4 + your spellcasting modifier hit points. No effect on undead or constructs. At higher levels: +1d4 per slot level above 1st.',classes:['bard']},
{name:'Heroism',level:1,school:'Enchantment',castTime:'1 action',range:'Touch',duration:'Concentration, 1 min',components:'V, S',desc:'Creature you touch gains temporary HP equal to your spellcasting modifier at the start of each of its turns. Also immune to being frightened. Higher levels: +1 creature per slot.',classes:['bard']},
{name:'Identify',level:1,school:'Divination',castTime:'1 min (ritual)',range:'Touch',duration:'Instantaneous',components:'V, S, M (a pearl worth at least 100 gp and an owl feather)',desc:'Learn the properties and how to use a magic item or spell-affected object. Touching a creature reveals any spells currently affecting it.',classes:['bard','wizard']},
{name:'Illusory Script',level:1,school:'Illusion',castTime:'1 min (ritual)',range:'Touch',duration:'10 days',components:'S, M (a lead-based ink worth at least 10 gp)',desc:'Write on parchment/paper/other surface. To you and creatures you designate, the writing appears normal. To all others, it appears as an unknown or magical script, or a different message you choose.',classes:['bard','wizard']},
{name:'Longstrider',level:1,school:'Transmutation',castTime:'1 action',range:'Touch',duration:'1 hour',components:'V, S, M (pinch of dirt)',desc:'Touch a creature. Its speed increases by 10 ft for the duration. At higher levels: +1 creature per slot level above 1st.',classes:['bard','wizard']},
{name:'Shield',level:1,school:'Abjuration',castTime:'1 reaction',range:'Self',duration:'1 round',components:'V, S',desc:'When you are hit by an attack or targeted by magic missile, gain +5 AC until the start of your next turn, including against the triggering attack. You take no damage from magic missile.',classes:['wizard']},
{name:'Silent Image',level:1,school:'Illusion',castTime:'1 action',range:'60 ft',duration:'Concentration, 10 min',components:'V, S, M (a bit of fleece)',desc:'Create an image of an object, creature, or other visible phenomenon no larger than a 15-ft cube. It seems real but has no sound, smell, or tactile effect. You can move it within range as an action. Investigation check reveals it.',classes:['bard','wizard']},
{name:'Sleep',level:1,school:'Enchantment',castTime:'1 action',range:'90 ft',duration:'1 min',components:'V, S, M (pinch of sand, rose petals, or a cricket)',desc:'Roll 5d8; that many HP of creatures in a 20-ft radius sphere fall unconscious (starting with lowest current HP). Undead and creatures immune to being charmed are unaffected. Higher levels: +2d8 per slot.',classes:['bard','wizard']},
{name:'Snare',level:1,school:'Abjuration',castTime:'1 min',range:'Touch',duration:'8 hours',components:'S, M (25 ft of rope)',desc:'Create a trap with a 5-ft-radius circle of rope. Nearly invisible (Investigation vs spell DC to spot). Creature entering the area is hoisted 3 ft in the air, restrained and hanging upside down. DEX save to avoid.',classes:['wizard']},
{name:'Speak with Animals',level:1,school:'Divination',castTime:'1 action (ritual)',range:'Self',duration:'10 min',components:'V, S',desc:'You gain the ability to comprehend and verbally communicate with beasts. Their knowledge and awareness is limited by their intelligence. You can persuade a beast for a short favor.',classes:['bard']},
{name:'Tasha\'s Hideous Laughter',level:1,school:'Enchantment',castTime:'1 action',range:'30 ft',duration:'Concentration, 1 min',components:'V, S, M (tiny tarts and a feather)',desc:'Target falls prone and becomes incapacitated, unable to stand. WIS save each turn to end. Creatures with INT 4 or lower are unaffected. Target saves again when it takes damage.',classes:['bard','wizard']},
{name:'Thunderwave',level:1,school:'Evocation',castTime:'1 action',range:'Self (15-ft cube)',duration:'Instantaneous',components:'V, S',desc:'Wave of thunderous force. Each creature in a 15-ft cube originating from you makes a CON save. Fail: 2d8 thunder damage and pushed 10 ft away. Pass: half damage, no push. Audible 300 ft. Higher levels: +1d8 per slot.',classes:['bard','wizard']},
{name:'Unseen Servant',level:1,school:'Conjuration',castTime:'1 action (ritual)',range:'60 ft',duration:'1 hour',components:'V, S, M (a piece of string and a bit of wood)',desc:'Create an invisible, mindless, shapeless force to perform simple tasks: fetch things, clean, mend, fold clothes, light fires, serve food, pour wine. AC 10, 1 HP, STR 2, can\'t attack. Moves 15 ft per round.',classes:['bard','wizard']},
// ── 2nd Level ──
{name:'Animal Messenger',level:2,school:'Enchantment',castTime:'1 action (ritual)',range:'30 ft',duration:'24 hours',components:'V, S, M (morsel of food)',desc:'A Tiny beast delivers a 25-word message. You specify location, recipient description, and the message. Beast travels 50 miles/24 hours (flying) or 25 miles (other). Higher slots extend duration.',classes:['bard']},
{name:'Blindness/Deafness',level:2,school:'Necromancy',castTime:'1 action',range:'30 ft',duration:'1 min',components:'V',desc:'Blind or deafen a creature. CON save each turn to end. No concentration. At higher levels: +1 target per slot level above 2nd.',classes:['bard','wizard']},
{name:'Blur',level:2,school:'Illusion',castTime:'1 action',range:'Self',duration:'Concentration, 1 min',components:'V',desc:'Your body becomes blurred. Any creature that makes an attack roll against you has disadvantage. Doesn\'t work if attacker has truesight, blindsight, or can see through illusions.',classes:['wizard']},
{name:'Calm Emotions',level:2,school:'Enchantment',castTime:'1 action',range:'60 ft',duration:'Concentration, 1 min',components:'V, S',desc:'Each humanoid in a 20-ft-radius sphere makes CHA save. On fail, you can suppress charm/frighten effects OR make the target indifferent toward creatures of your choice that it is hostile toward.',classes:['bard']},
{name:'Cloud of Daggers',level:2,school:'Conjuration',castTime:'1 action',range:'60 ft',duration:'Concentration, 1 min',components:'V, S, M (a sliver of glass)',desc:'Fill a 5-ft cube with spinning daggers. A creature takes 4d4 slashing damage when it enters the area for the first time on a turn or starts its turn there. Higher levels: +2d4 per slot.',classes:['bard','wizard']},
{name:'Crown of Madness',level:2,school:'Enchantment',castTime:'1 action',range:'120 ft',duration:'Concentration, 1 min',components:'V, S',desc:'One humanoid must succeed on WIS save or become charmed. While charmed, must use its action to make a melee attack against a creature you choose (other than itself). WIS save at end of each turn to end.',classes:['bard','wizard']},
{name:'Detect Thoughts',level:2,school:'Divination',castTime:'1 action',range:'Self',duration:'Concentration, 1 min',components:'V, S, M (a copper piece)',desc:'Read surface thoughts of creatures within 30 ft. As an action, probe deeper (WIS save to resist; on fail, you gain insight into its reasoning, emotional state, and something that looms large in its mind).',classes:['bard','wizard']},
{name:'Enhance Ability',level:2,school:'Transmutation',castTime:'1 action',range:'Touch',duration:'Concentration, 1 hour',components:'V, S, M (fur or feather)',desc:'Touch a creature and grant one effect: Bear (advantage STR checks, +2d6 carry), Bull (advantage STR checks), Cat (advantage DEX, no fall damage ≤20 ft), Eagle (advantage CHA), Fox (advantage INT), Owl (advantage WIS). Higher levels: +1 target.',classes:['bard']},
{name:'Enthrall',level:2,school:'Enchantment',castTime:'1 action',range:'60 ft',duration:'1 min',components:'V, S',desc:'Weave a distracting string of words. Creatures that can hear you must make WIS save (advantage if fighting you). Fail: disadvantage on Perception checks to perceive any creature other than you.',classes:['bard']},
{name:'Heat Metal',level:2,school:'Transmutation',castTime:'1 action',range:'60 ft',duration:'Concentration, 1 min',components:'V, S, M (iron and a flame)',desc:'A manufactured metal object you can see becomes red-hot. Creature in contact takes 2d8 fire damage. Until the spell ends, you can use a bonus action to deal damage again. Creature wearing it has disadvantage on attacks and checks unless it drops the object (CON save). Higher levels: +1d8 per slot.',classes:['bard']},
{name:'Hold Person',level:2,school:'Enchantment',castTime:'1 action',range:'60 ft',duration:'Concentration, 1 min',components:'V, S, M (small piece of iron)',desc:'Humanoid must succeed on WIS save or be paralyzed. Target makes a new save at end of each turn. Attacks within 5 ft are automatic crits. Higher levels: +1 target per slot above 2nd.',classes:['bard','wizard']},
{name:'Invisibility',level:2,school:'Illusion',castTime:'1 action',range:'Touch',duration:'Concentration, 1 hour',components:'V, S, M (eyelash in gum arabic)',desc:'Creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible too. Spell ends if the target attacks or casts a spell. Higher levels: +1 target per slot.',classes:['bard','wizard']},
{name:'Knock',level:2,school:'Transmutation',castTime:'1 action',range:'60 ft',duration:'Instantaneous',components:'V',desc:'Choose an object within range. If it is locked, the lock opens. If it has multiple locks, only one is unlocked. If barred, the bar lifts. If held shut by Arcane Lock, that spell is suppressed for 10 minutes. The knock is audible 300 ft away.',classes:['bard','wizard']},
{name:'Lesser Restoration',level:2,school:'Abjuration',castTime:'1 action',range:'Touch',duration:'Instantaneous',components:'V, S',desc:'Touch a creature and end one disease or one condition afflicting it: blinded, deafened, paralyzed, or poisoned.',classes:['bard']},
{name:'Locate Object',level:2,school:'Divination',castTime:'1 action',range:'Self',duration:'Concentration, 10 min',components:'V, S, M (a forked twig)',desc:'Sense the direction of an object you\'re familiar with or that you can describe, as long as it\'s within 1,000 ft. If the object is moving, you know the direction of its movement. Can\'t locate if any thickness of lead blocks the path.',classes:['bard','wizard']},
{name:'Magic Mouth',level:2,school:'Illusion',castTime:'1 min (ritual)',range:'30 ft',duration:'Until dispelled',components:'V, S, M (honeycomb and jade dust worth 10 gp)',desc:'Implant a message (25 words, up to 10 min to deliver) within an object. When a trigger condition is met, a magical mouth appears on the object and recites the message. Can be set to repeat or deliver once.',classes:['bard','wizard']},
{name:'Mirror Image',level:2,school:'Illusion',castTime:'1 action',range:'Self',duration:'1 min',components:'V, S',desc:'Three illusory duplicates appear. Each time you\'re targeted by an attack, roll to see if it hits a duplicate instead (3 dupes: 6+, 2 dupes: 8+, 1 dupe: 11+). A duplicate has AC 10 + your DEX mod. No concentration.',classes:['wizard']},
{name:'Misty Step',level:2,school:'Conjuration',castTime:'1 bonus action',range:'Self',duration:'Instantaneous',components:'V',desc:'Briefly surrounded by silvery mist, you teleport up to 30 ft to an unoccupied space that you can see.',classes:['wizard']},
{name:'Phantasmal Force',level:2,school:'Illusion',castTime:'1 action',range:'60 ft',duration:'Concentration, 1 min',components:'V, S, M (a bit of fleece)',desc:'Craft an illusion in the mind of a creature. INT save to resist. The phantasm is perceived only by the target. The target treats it as real and rationalizes illogical outcomes. Can deal 1d6 psychic damage per turn. Investigation check vs spell DC to end.',classes:['bard','wizard']},
{name:'See Invisibility',level:2,school:'Divination',castTime:'1 action',range:'Self',duration:'1 hour',components:'V, S, M (a pinch of talc and powdered silver)',desc:'You can see invisible creatures and objects as if they were visible, and you can see into the Ethereal Plane. Ethereal creatures and objects appear ghostly and translucent.',classes:['bard','wizard']},
{name:'Shadow Blade',level:2,school:'Illusion',castTime:'1 bonus action',range:'Self',duration:'Concentration, 1 min',components:'V, S',desc:'You weave threads of shadow to create a sword of solidified gloom. Simple melee weapon, finesse, light, thrown (20/60 ft). 2d8 psychic damage. You have advantage on attacks in dim light or darkness. Higher levels: 3d8 at 3rd, 4d8 at 5th, 5d8 at 7th.',classes:['wizard']},
{name:'Shatter',level:2,school:'Evocation',castTime:'1 action',range:'60 ft',duration:'Instantaneous',components:'V, S, M (a chip of mica)',desc:'A sudden loud noise painfully intense erupts. Each creature in a 10-ft-radius sphere centered on a point must make a CON save. Fail: 3d8 thunder damage. Pass: half. Nonmagical objects that aren\'t worn also take damage. Higher levels: +1d8 per slot.',classes:['bard','wizard']},
{name:'Silence',level:2,school:'Illusion',castTime:'1 action (ritual)',range:'120 ft',duration:'Concentration, 10 min',components:'V, S',desc:'Create a 20-ft-radius sphere of silence. No sound can be created or pass through the area. Creatures inside are immune to thunder damage. Casting spells with verbal components is impossible inside.',classes:['bard']},
{name:'Suggestion',level:2,school:'Enchantment',castTime:'1 action',range:'30 ft',duration:'Concentration, 8 hours',components:'V, M (a snake\'s tongue and either honeycomb or a drop of sweet oil)',desc:'Suggest a course of activity (limited to a sentence or two) to a creature that can hear and understand you. WIS save to resist. The suggestion must sound reasonable. The target pursues the activity to the best of its ability.',classes:['bard','wizard']},
{name:'Zone of Truth',level:2,school:'Enchantment',castTime:'1 action',range:'60 ft',duration:'10 min',components:'V, S',desc:'Create a 15-ft-radius sphere where creatures can\'t deliberately lie. CHA save — you know whether each creature succeeded or failed. Affected creatures are aware of the spell and can be evasive but cannot lie.',classes:['bard']},
// ── 3rd Level ──
{name:'Bestow Curse',level:3,school:'Necromancy',castTime:'1 action',range:'Touch',duration:'Concentration, 1 min',components:'V, S',desc:'Touch a creature. WIS save or be cursed. Choose one: disadvantage on one ability\'s checks and saves; disadvantage on attacks against you; WIS save each turn or waste action doing nothing; your attacks deal extra 1d8 necrotic. At 5th slot: 8 hours, no concentration. At 7th: permanent.',classes:['bard','wizard']},
{name:'Clairvoyance',level:3,school:'Divination',castTime:'10 min',range:'1 mile',duration:'Concentration, 10 min',components:'V, S, M (a focus worth at least 100 gp)',desc:'Create an invisible sensor at a point within range that you\'re familiar with. Choose seeing or hearing when you cast. You can switch as an action. The sensor has normal capabilities and can be detected with Detect Magic.',classes:['bard','wizard']},
{name:'Dispel Magic',level:3,school:'Abjuration',castTime:'1 action',range:'120 ft',duration:'Instantaneous',components:'V, S',desc:'Choose one creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends. For higher-level spells, make an ability check using your spellcasting ability (DC = 10 + the spell\'s level).',classes:['bard','wizard']},
{name:'Fear',level:3,school:'Illusion',castTime:'1 action',range:'Self (30-ft cone)',duration:'Concentration, 1 min',components:'V, S, M (a white feather or the heart of a hen)',desc:'Each creature in a 30-ft cone must succeed on a WIS save or drop what it\'s holding and become frightened. Must take the Dash action to move away from you each turn. WIS save at end of turn if it can\'t see you.',classes:['bard','wizard']},
{name:'Hypnotic Pattern',level:3,school:'Illusion',castTime:'1 action',range:'120 ft',duration:'Concentration, 1 min',components:'S, M (a glowing stick of incense or a crystal vial filled with phosphorescent material)',desc:'Create a twisting pattern of colors in a 30-ft cube. Each creature that sees it must make WIS save or become charmed: incapacitated and speed 0. Effect ends if creature takes damage or someone uses an action to shake it out.',classes:['bard','wizard']},
{name:'Leomund\'s Tiny Hut',level:3,school:'Evocation',castTime:'1 min (ritual)',range:'Self (10-ft-radius hemisphere)',duration:'8 hours',components:'V, S, M (a small crystal bead)',desc:'A 10-ft-radius immobile dome of force springs into existence around you. Up to 9 Medium creatures can fit inside. No spell effects or weather can pass through it. You can designate who can pass through. Interior climate is comfortable and dry.',classes:['bard','wizard']},
{name:'Major Image',level:3,school:'Illusion',castTime:'1 action',range:'120 ft',duration:'Concentration, 10 min',components:'V, S, M (a bit of fleece)',desc:'Create the image of an object, creature, or other phenomenon no larger than a 20-ft cube. It seems perfectly real, including sounds, smells, and temperature appropriate to the thing depicted. Investigation check vs spell DC to reveal. At 6th level: permanent, no concentration.',classes:['bard','wizard']},
{name:'Nondetection',level:3,school:'Abjuration',castTime:'1 action',range:'Touch',duration:'8 hours',components:'V, S, M (a pinch of diamond dust worth 25 gp)',desc:'You hide a target from divination magic. The target can be a willing creature, a place, or an object no larger than 10 ft in any dimension. The target can\'t be targeted by any divination magic or perceived through magical scrying sensors.',classes:['bard','wizard']},
{name:'Plant Growth',level:3,school:'Transmutation',castTime:'1 action or 8 hours',range:'150 ft',duration:'Instantaneous',components:'V, S',desc:'(1 action) All normal plants in a 100-ft radius become thick and overgrown, making the area difficult terrain (costs 4 ft of movement per 1 ft). (8 hours) Enriches plants in a half-mile radius, doubling yield for 1 year.',classes:['bard']},
{name:'Sending',level:3,school:'Evocation',castTime:'1 action',range:'Unlimited',duration:'1 round',components:'V, S, M (a short piece of fine copper wire)',desc:'Send a 25-word message to a creature you are familiar with. The creature hears the message, recognizes you, and can reply immediately with a 25-word message. Works across planes (5% fail chance).',classes:['bard','wizard']},
{name:'Slow',level:3,school:'Transmutation',castTime:'1 action',range:'120 ft',duration:'Concentration, 1 min',components:'V, S, M (a drop of molasses)',desc:'Up to 6 creatures in a 40-ft cube make WIS saves. On fail: speed halved, -2 AC, -2 DEX saves, no reactions, only 1 attack per turn (action OR bonus action, not both), and if casting a spell, 50% chance it delays to next turn.',classes:['bard','wizard']},
{name:'Speak with Dead',level:3,school:'Necromancy',castTime:'1 action',range:'10 ft',duration:'10 min',components:'V, S, M (burning incense)',desc:'Grant a corpse the semblance of life. You can ask up to 5 questions. The corpse knows only what it knew in life and speaks in languages it knew. Answers are often brief, cryptic, or repetitive. Can\'t be used on the same corpse again for 10 days.',classes:['bard','wizard']},
{name:'Stinking Cloud',level:3,school:'Conjuration',castTime:'1 action',range:'90 ft',duration:'Concentration, 1 min',components:'V, S, M (a rotten egg or several skunk cabbage leaves)',desc:'Create a 20-ft-radius sphere of nauseating gas. Each creature starting its turn in the area must make a CON save or spend its action retching and reeling. Creatures immune to poison are unaffected. Moderate wind disperses in 4 rounds.',classes:['bard','wizard']},
{name:'Tongues',level:3,school:'Divination',castTime:'1 action',range:'Touch',duration:'1 hour',components:'V, M (a small clay model of a ziggurat)',desc:'The creature you touch gains the ability to understand any spoken language it hears. When it speaks, any creature that knows at least one language can understand it.',classes:['bard','wizard']},
];

const MANEUVER_DB=[
{name:'Commander\'s Strike',desc:'When you take the Attack action, forgo one attack. A friendly creature who can see or hear you can use its reaction to make one weapon attack, adding your superiority die to the damage roll.'},
{name:'Disarming Attack',desc:'When you hit with a weapon attack, add superiority die to the damage. Target must make a STR save or drop one held item of your choice, which lands at its feet.'},
{name:'Distracting Strike',desc:'When you hit with a weapon attack, add superiority die to the damage. The next attack roll against the target by an attacker other than you has advantage (if before the start of your next turn).'},
{name:'Evasive Footwork',desc:'When you move, add superiority die to your AC until you stop moving.'},
{name:'Feinting Attack',desc:'Use a bonus action to feint against one creature within 5 ft. You have advantage on your next attack roll against that creature this turn. If it hits, add superiority die to the damage.'},
{name:'Goading Attack',desc:'When you hit with a weapon attack, add superiority die to the damage. Target must make a WIS save or have disadvantage on all attack rolls against targets other than you until end of your next turn.'},
{name:'Lunging Attack',desc:'When you make a melee weapon attack on your turn, you can increase your reach by 5 ft. If you hit, add superiority die to the damage.'},
{name:'Maneuvering Attack',desc:'When you hit with a weapon attack, add superiority die to the damage. Choose a friendly creature who can see or hear you — it can use its reaction to move up to half its speed without provoking opportunity attacks.'},
{name:'Menacing Attack',desc:'When you hit with a weapon attack, add superiority die to the damage. Target must make a WIS save or be frightened of you until the end of your next turn.'},
{name:'Parry',desc:'When another creature damages you with a melee attack, use your reaction to reduce the damage by your superiority die + your DEX modifier.'},
{name:'Precision Attack',desc:'When you make a weapon attack roll, add superiority die to the roll. You can use this before or after making the attack roll, but before any effects are applied.'},
{name:'Pushing Attack',desc:'When you hit with a weapon attack, add superiority die to the damage. If the target is Large or smaller, it must make a STR save or be pushed up to 15 ft away from you.'},
{name:'Rally',desc:'Use a bonus action. A friendly creature who can see or hear you gains temporary hit points equal to your superiority die + your CHA modifier.'},
{name:'Riposte',desc:'When a creature misses you with a melee attack, use your reaction to make a melee weapon attack against that creature. If you hit, add superiority die to the damage.'},
{name:'Sweeping Attack',desc:'When you hit with a melee weapon attack, choose another creature within 5 ft of the original target and within your reach. If the original attack roll would hit that creature, it takes damage equal to your superiority die.'},
{name:'Trip Attack',desc:'When you hit with a weapon attack, add superiority die to the damage. If the target is Large or smaller, it must make a STR save or be knocked prone.'},
];

// ═══ 5e FEATS DATABASE ═══
const FEATS_DB=[
// PHB Feats
{name:'Alert',desc:'+5 to initiative. Can\'t be surprised while conscious. Hidden creatures don\'t gain advantage on attack rolls against you.',half:false,source:'PHB'},
{name:'Athlete',desc:'Increase STR or DEX by 1. Standing from prone costs only 5 ft. Climbing doesn\'t cost extra movement. Running long/high jump with only 5 ft running start.',half:['STR','DEX'],source:'PHB'},
{name:'Actor',desc:'Increase CHA by 1. Advantage on Deception and Performance checks when passing yourself off as another person. Mimic speech or sounds of other creatures.',half:['CHA'],source:'PHB'},
{name:'Charger',desc:'When you Dash, you can use a bonus action to make one melee attack or shove. If you moved 10+ ft in a straight line, +5 damage (melee) or push 10 ft (shove).',half:false,source:'PHB'},
{name:'Crossbow Expert',desc:'Ignore loading quality of crossbows you\'re proficient with. No disadvantage on ranged attacks within 5 ft. When you Attack with a one-handed weapon, bonus action crossbow attack.',half:false,source:'PHB'},
{name:'Defensive Duelist',desc:'When wielding a finesse weapon and a creature hits you with a melee attack, use reaction to add your proficiency bonus to AC for that attack. Requires DEX 13+.',half:false,prereq:'DEX 13',source:'PHB'},
{name:'Dual Wielder',desc:'+1 AC while dual wielding. Two-weapon fighting with non-light melee weapons. Draw or stow two weapons at once.',half:false,source:'PHB'},
{name:'Dungeon Delver',desc:'Advantage on Perception and Investigation to detect secret doors. Advantage on saves vs. traps. Resistance to trap damage. Search for traps at normal pace.',half:false,source:'PHB'},
{name:'Durable',desc:'Increase CON by 1. When you roll Hit Dice to regain HP, the minimum you regain equals 2 × your CON modifier (minimum of 2).',half:['CON'],source:'PHB'},
{name:'Elemental Adept',desc:'Choose acid, cold, fire, lightning, or thunder. Spells you cast ignore resistance to that damage type. When you roll damage, treat any 1 on a damage die as a 2. Requires spellcasting.',half:false,prereq:'Spellcasting',source:'PHB'},
{name:'Grappler',desc:'Advantage on attacks against creatures you are grappling. You can pin a creature grappled by you (both restrained until grapple ends). Requires STR 13+.',half:false,prereq:'STR 13',source:'PHB'},
{name:'Great Weapon Master',desc:'On a crit or reducing a creature to 0 HP with a melee weapon, make one melee attack as a bonus action. Before attacking with a heavy weapon, choose -5 to hit for +10 damage.',half:false,source:'PHB'},
{name:'Healer',desc:'When you stabilize with a healer\'s kit, the creature also regains 1 HP. As an action, spend one use of a healer\'s kit to restore 1d6 + 4 + creature\'s max Hit Dice in HP (once per rest per creature).',half:false,source:'PHB'},
{name:'Heavily Armored',desc:'Increase STR by 1. Gain proficiency with heavy armor. Requires medium armor proficiency.',half:['STR'],prereq:'Medium armor proficiency',source:'PHB'},
{name:'Heavy Armor Master',desc:'Increase STR by 1. While wearing heavy armor, bludgeoning, piercing, and slashing damage from nonmagical weapons is reduced by 3. Requires heavy armor proficiency.',half:['STR'],prereq:'Heavy armor proficiency',source:'PHB'},
{name:'Inspiring Leader',desc:'Spend 10 minutes inspiring companions. Up to 6 creatures within 30 ft gain temporary HP equal to your level + CHA modifier. Once per rest. Requires CHA 13+.',half:false,prereq:'CHA 13',source:'PHB'},
{name:'Keen Mind',desc:'Increase INT by 1. Always know which way is north. Always know the number of hours before the next sunrise or sunset. Accurately recall anything you\'ve seen or heard within the past month.',half:['INT'],source:'PHB'},
{name:'Lightly Armored',desc:'Increase STR or DEX by 1. Gain proficiency with light armor.',half:['STR','DEX'],source:'PHB'},
{name:'Linguist',desc:'Increase INT by 1. Learn three languages of your choice. Create written ciphers (INT check to decipher without your help).',half:['INT'],source:'PHB'},
{name:'Lucky',desc:'You have 3 luck points. Spend one to roll an additional d20 on an attack, ability check, or saving throw (choose which d20 to use). Also works when a creature attacks you. Regain all points on a long rest.',half:false,source:'PHB'},
{name:'Mage Slayer',desc:'When a creature within 5 ft casts a spell, you can use your reaction to make a melee attack. When you damage a concentrating creature, it has disadvantage on the save. Advantage on saves vs. spells cast within 5 ft.',half:false,source:'PHB'},
{name:'Magic Initiate',desc:'Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. Learn two cantrips and one 1st-level spell from that class\'s spell list. Cast the 1st-level spell once per long rest without a slot.',half:false,source:'PHB'},
{name:'Martial Adept',desc:'Learn two Battle Master maneuvers. Gain one superiority die (d6) which is expended when used and regained on a short or long rest.',half:false,source:'PHB'},
{name:'Medium Armor Master',desc:'Wearing medium armor doesn\'t impose disadvantage on Stealth checks. When wearing medium armor, you can add 3 (instead of 2) from your DEX modifier to AC. Requires medium armor proficiency.',half:false,prereq:'Medium armor proficiency',source:'PHB'},
{name:'Mobile',desc:'Speed increases by 10 ft. When you Dash, difficult terrain doesn\'t cost extra movement. When you make a melee attack against a creature, you don\'t provoke opportunity attacks from that creature for the rest of the turn.',half:false,source:'PHB'},
{name:'Moderately Armored',desc:'Increase STR or DEX by 1. Gain proficiency with medium armor and shields. Requires light armor proficiency.',half:['STR','DEX'],prereq:'Light armor proficiency',source:'PHB'},
{name:'Mounted Combatant',desc:'Advantage on melee attacks against unmounted creatures smaller than your mount. Force attacks targeting your mount to target you instead. Mount takes no damage on DEX save success, half on fail.',half:false,source:'PHB'},
{name:'Observant',desc:'Increase INT or WIS by 1. +5 to passive Perception and passive Investigation. Read lips if you can see a creature\'s mouth and it speaks a language you understand.',half:['INT','WIS'],source:'PHB'},
{name:'Polearm Master',desc:'When you take the Attack action with a glaive, halberd, quarterstaff, or spear, make a bonus action attack with the other end (1d4 bludgeoning). Creatures provoke opportunity attacks when they enter your reach.',half:false,source:'PHB'},
{name:'Resilient',desc:'Increase one ability score of your choice by 1. Gain proficiency in saving throws using that ability.',half:['STR','DEX','CON','INT','WIS','CHA'],source:'PHB'},
{name:'Ritual Caster',desc:'Learn two 1st-level ritual spells from a chosen class. You can cast spells in your ritual book as rituals. Find and copy other ritual spells. Requires INT or WIS 13+.',half:false,prereq:'INT or WIS 13',source:'PHB'},
{name:'Savage Attacker',desc:'Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon\'s damage dice and use either total.',half:false,source:'PHB'},
{name:'Sentinel',desc:'Creatures you hit with opportunity attacks have their speed reduced to 0. Creatures provoke opportunity attacks even if they Disengage. When a creature within 5 ft attacks someone other than you, use reaction to melee attack it.',half:false,source:'PHB'},
{name:'Sharpshooter',desc:'No disadvantage on ranged attacks at long range. Ranged attacks ignore half and three-quarters cover. Before attacking with a ranged weapon, choose -5 to hit for +10 damage.',half:false,source:'PHB'},
{name:'Shield Master',desc:'When you take the Attack action, bonus action to shove with your shield. Add shield\'s AC bonus to DEX saves against effects targeting only you. On a DEX save for half damage, use reaction to take no damage on success.',half:false,source:'PHB'},
{name:'Skilled',desc:'Gain proficiency in any combination of three skills or tools of your choice.',half:false,source:'PHB'},
{name:'Skulker',desc:'You can try to hide when lightly obscured. When you miss with a ranged attack while hidden, your position isn\'t revealed. Dim light doesn\'t impose disadvantage on Perception checks. Requires DEX 13+.',half:false,prereq:'DEX 13',source:'PHB'},
{name:'Spell Sniper',desc:'Double the range of attack roll spells. Ranged spell attacks ignore half and three-quarters cover. Learn one attack-roll cantrip from any class. Requires spellcasting.',half:false,prereq:'Spellcasting',source:'PHB'},
{name:'Tavern Brawler',desc:'Increase STR or CON by 1. Proficient with improvised weapons. Unarmed strike deals 1d4. When you hit with an unarmed strike or improvised weapon, bonus action to grapple.',half:['STR','CON'],source:'PHB'},
{name:'Tough',desc:'Your hit point maximum increases by an amount equal to twice your level. Each time you gain a level thereafter, your HP max increases by 2 additional HP.',half:false,source:'PHB'},
{name:'War Caster',desc:'Advantage on CON saves to maintain concentration. Perform somatic components with hands full. When a creature provokes an opportunity attack, cast a spell (1 action, single target) instead. Requires spellcasting.',half:false,prereq:'Spellcasting',source:'PHB'},
{name:'Weapon Master',desc:'Increase STR or DEX by 1. Gain proficiency with four weapons of your choice.',half:['STR','DEX'],source:'PHB'},
// Tasha\'s Cauldron / Xanathar\'s Guide
{name:'Fey Touched',desc:'Increase INT, WIS, or CHA by 1. Learn Misty Step and one 1st-level divination or enchantment spell. Cast each once per long rest without a slot, or with slots.',half:['INT','WIS','CHA'],source:'TCoE'},
{name:'Shadow Touched',desc:'Increase INT, WIS, or CHA by 1. Learn Invisibility and one 1st-level illusion or necromancy spell. Cast each once per long rest without a slot, or with slots.',half:['INT','WIS','CHA'],source:'TCoE'},
{name:'Telekinetic',desc:'Increase INT, WIS, or CHA by 1. Learn Mage Hand (invisible, no components). As a bonus action, shove a creature within 30 ft (STR save or pushed 5 ft toward or away from you).',half:['INT','WIS','CHA'],source:'TCoE'},
{name:'Telepathic',desc:'Increase INT, WIS, or CHA by 1. You can speak telepathically to any creature within 60 ft. It can understand you if it knows at least one language. Cast Detect Thoughts once per long rest without a slot.',half:['INT','WIS','CHA'],source:'TCoE'},
{name:'Crusher',desc:'Increase STR or CON by 1. Once per turn, when you hit with bludgeoning damage, move the target 5 ft. On a critical hit with bludgeoning damage, attacks against that creature have advantage until your next turn.',half:['STR','CON'],source:'TCoE'},
{name:'Piercer',desc:'Increase STR or DEX by 1. Once per turn, reroll one piercing damage die (must use new roll). On a critical hit with piercing damage, roll one additional damage die.',half:['STR','DEX'],source:'TCoE'},
{name:'Slasher (Feat)',desc:'Increase STR or DEX by 1. Once per turn, when you hit with slashing damage, reduce target\'s speed by 10 ft until your next turn. On a critical hit, target has disadvantage on attack rolls until your next turn.',half:['STR','DEX'],source:'TCoE'},
{name:'Skill Expert',desc:'Increase one ability score of your choice by 1. Gain proficiency in one skill. Choose one skill you\'re proficient in — your proficiency bonus is doubled for that skill.',half:['STR','DEX','CON','INT','WIS','CHA'],source:'TCoE'},
{name:'Chef',desc:'Increase CON or WIS by 1. Gain proficiency with cook\'s utensils. During a short rest, prepare special food — up to 4 + proficiency bonus creatures regain 1d8 extra HP. On long rest, produce treats equal to proficiency bonus (eating one grants temporary HP equal to proficiency bonus).',half:['CON','WIS'],source:'TCoE'},
{name:'Fighting Initiate',desc:'Learn one Fighting Style option from the Fighter class. You can replace this style when you gain an ASI. Requires martial weapon proficiency.',half:false,prereq:'Martial weapon proficiency',source:'TCoE'},
{name:'Eldritch Adept',desc:'Learn one Eldritch Invocation option from the Warlock class (must meet any prerequisites, including level). You can replace the invocation when you gain a level. Requires spellcasting or Pact Magic.',half:false,prereq:'Spellcasting',source:'TCoE'},
{name:'Metamagic Adept',desc:'Learn two Metamagic options from the Sorcerer class. Gain 2 sorcery points (usable only for Metamagic, regain on long rest). Requires spellcasting.',half:false,prereq:'Spellcasting',source:'TCoE'},
{name:'Gunner',desc:'Increase DEX by 1. Proficiency with firearms. Ignore loading property of firearms. No disadvantage on ranged attack rolls within 5 ft of a hostile creature.',half:['DEX'],source:'TCoE'},
{name:'Poisoner',desc:'You can apply poison to a weapon or piece of ammunition as a bonus action. Proficiency with the poisoner\'s kit. Spend 50 gp to create a number of doses of potent poison equal to your proficiency bonus (1d4+CON mod save, 2d8 poison damage + poisoned).',half:false,source:'TCoE'},
];

// ═══ D&D TERM GLOSSARY ═══
const TERM_TIPS={
  // Conditions (14 D&D 5e conditions)
  'Prone':'Attacks against: advantage if adj (5 ft), disadvantage if ranged. Costs half movement to stand.',
  'Blinded':'Fails sight checks. Attacks: disadvantage. Attacks against: advantage.',
  'Stunned':'Incapacitated, can\'t move. Attacks: advantage. Fails STR/DEX saves.',
  'Frightened':'Disadvantage on checks/attacks while source visible. Can\'t willingly move closer.',
  'Grappled':'Speed becomes 0. Ends if grappler is incapacitated or creature moves out of reach.',
  'Restrained':'Speed 0. Attacks: disadvantage. Attacks against: advantage. DEX saves: disadvantage.',
  'Incapacitated':'Can\'t take actions or reactions.',
  'Paralyzed':'Incapacitated, can\'t move or speak. Auto-fail STR/DEX saves. Attacks: advantage (crit if within 5 ft).',
  'Charmed':'Can\'t attack the charmer. Charmer has advantage on social checks vs. creature.',
  'Poisoned':'Disadvantage on attack rolls and ability checks.',
  'Deafened':'Can\'t hear. Auto-fails checks that require hearing.',
  'Invisible':'Impossible to see without special sense. Attacks: advantage. Attacks against: disadvantage.',
  'Petrified':'Transformed to stone. Weight ×10. Incapacitated. Resistance to all damage. Immune to poison/disease.',
  'Unconscious':'Incapacitated, drops items, falls prone. Auto-fail STR/DEX saves. Attacks: advantage (crit within 5 ft).',
  'Exhaustion':'Stacks 1–6: ×1 disadvantage on checks, ×2 speed halved, ×3 disadvantage attacks/saves, ×4 speed 0, ×5 max HP halved, ×6 death.',
  'Concentration':'Damaged → CON save (DC 10 or ½ damage). Casting another concentration spell ends previous.',
  // Combat Actions
  'Sneak Attack':'Rogue: extra 1d6/2 levels/turn with finesse or ranged weapon + advantage OR ally adj to target.',
  'Opportunity Attack':'Triggered when creature voluntarily leaves reach. Uses reaction; one melee attack.',
  'Advantage':'Roll two d20s, use the higher result.',
  'Disadvantage':'Roll two d20s, use the lower result.',
  'Reaction':'Once per round, used immediately in response to a trigger. Resets on your turn.',
  'Bonus Action':'Additional action beyond your main Action (specific abilities grant one).',
  'Dash':'Gain extra movement equal to your speed for this turn.',
  'Disengage':'Your movement doesn\'t provoke opportunity attacks for the rest of this turn.',
  'Help':'Give one ally advantage on an ability check, OR on attack vs. a creature within 5 ft.',
  'Dodge':'Until next turn: attacks against you have disadvantage, DEX saves have advantage.',
  'Ready':'Hold an action to trigger after a specified condition before your next turn.',
  'Shove':'Athletics vs. target\'s Athletics/Acrobatics: push 5 ft or knock prone.',
  'Grapple':'Athletics vs. target\'s Athletics/Acrobatics: target becomes Grappled.',
  'Flanking':'Optional rule: if two allies are on opposite sides, both have advantage on melee attacks.',
  'Cover':'Half: +2 AC/DEX saves. Three-quarters: +5. Full: can\'t be targeted.',
  // Saving Throws & Checks
  'Saving Throw':'Roll d20 + ability mod + proficiency (if proficient). Meet or beat the DC to succeed.',
  'Ability Check':'Roll d20 + ability mod + proficiency (if applicable). Meet or beat the DC.',
  'Difficulty Class':'DC — target number to succeed. 5 very easy, 10 easy, 15 medium, 20 hard, 25 very hard, 30 nearly impossible.',
  'Proficiency Bonus':'Added to proficient skills, saves, attacks, spell DCs. +2 at L1–4, +3 at L5–8, +4 at L9–12.',
  'Expertise':'Double your proficiency bonus for the chosen skill or tool check.',
  'Passive Perception':'10 + Perception modifier. Used to detect hidden creatures, traps, and secret doors without rolling.',
  // Combat Mechanics
  'Initiative':'Roll d20 + DEX mod at combat start. Determines turn order (highest goes first).',
  'Armor Class':'AC — target number an attacker must meet or beat to land a hit.',
  'Hit Points':'HP — measure of vitality. 0 HP = unconscious and making death saves.',
  'Death Save':'d20 roll at 0 HP: 10+ = success, 9- = failure. 3 successes = stable. 3 failures = death. Nat 20 = regain 1 HP.',
  'Temporary HP':'Extra HP buffer. Doesn\'t stack (take highest). Lost first before real HP. Can\'t be healed.',
  'Hit Dice':'Pool of dice used to heal during short rest. Spend any number, roll + CON mod per die. Regain half on long rest.',
  'Critical Hit':'Natural 20 on attack roll. Double all damage dice. Always hits regardless of AC.',
  'Natural 1':'Auto-miss on attack rolls regardless of modifiers. No special effect on ability checks/saves (common houserule).',
  'Two-Weapon Fighting':'When you attack with a light melee weapon, use bonus action to attack with another light weapon in off hand. No ability mod to off-hand damage unless you have the Fighting Style.',
  'Finesse':'Use STR or DEX for attack and damage rolls with this weapon.',
  'Versatile':'Can be used one- or two-handed. Two-handed uses higher damage die.',
  'Reach':'Adds 5 ft to melee attack range (10 ft total). Affects opportunity attacks too.',
  'Thrown':'Can be thrown for a ranged attack using STR. Uses the same damage die as melee.',
  'Heavy':'Small creatures have disadvantage on attack rolls with this weapon.',
  'Light':'Can be used for two-weapon fighting without the Dual Wielder feat.',
  // Spellcasting
  'Spell Slot':'Resource spent to cast spells. Higher slots = stronger effects. Recovered on long rest (most classes).',
  'Cantrip':'Level 0 spell. Cast at will, no spell slot needed. Damage scales at 5th, 11th, and 17th level.',
  'Ritual':'Can be cast without spending a slot by adding 10 minutes to the cast time. Not all spells qualify.',
  'Spell Attack':'Ranged or melee: d20 + spellcasting mod + proficiency vs. target AC.',
  'Spell Save DC':'8 + proficiency bonus + spellcasting ability modifier. Target rolls save vs. this number.',
  'Components':'V = verbal (speaking), S = somatic (gestures), M = material (specific items). War Caster helps with S while holding weapons/shield.',
  'Upcasting':'Casting a spell with a higher slot than its base level for enhanced effects.',
  // Resting
  'Short Rest':'At least 1 hour of downtime. Spend Hit Dice to heal. Some abilities recharge.',
  'Long Rest':'8 hours (6 sleeping). Full HP restored, regain half max Hit Dice, reset most abilities and spell slots.',
  // Movement & Terrain
  'Difficult Terrain':'Each foot of movement costs 2 feet. Applies to rough ground, thick vegetation, stairs, etc.',
  'Climbing':'Costs 2 feet per foot moved (1 foot with climb speed). May require Athletics check on difficult surfaces.',
  'Swimming':'Costs 2 feet per foot moved (1 foot with swim speed). May require Athletics check in rough water.',
  // Light & Vision
  'Darkvision':'See in dim light as bright, in darkness as dim (greyscale). Range varies by race (usually 60 ft).',
  'Dim Light':'Lightly obscured. Disadvantage on Perception checks relying on sight.',
  'Bright Light':'Normal vision. Most creatures see fine here.',
  'Heavily Obscured':'Effectively blinded within the area. Darkness, opaque fog, dense foliage.',
  // Damage Types
  'Resistance':'Take half damage from this type. Doesn\'t stack with itself.',
  'Vulnerability':'Take double damage from this type.',
  'Immunity':'Take no damage from this type. Also blocks related conditions (e.g., poison immunity blocks poisoned).',
  // Economy & Equipment
  'Attunement':'Some magic items require attunement (short rest, 3 item limit). Ends if you exceed the limit or un-attune.',
  'Encumbrance':'Variant rule: STR × 5 = no penalty, STR × 10 = speed -10 ft, STR × 15 = max carry (speed -20 ft, disadvantage on physical rolls).',
  // Class Features
  'Action Surge':'Fighter: Take one additional action on your turn. Once per short/long rest.',
  'Second Wind':'Fighter: Bonus action to regain 1d10 + fighter level HP. Once per short rest.',
  'Cunning Action':'Rogue: Dash, Disengage, or Hide as a bonus action each turn.',
  'Bardic Inspiration':'Bard: Bonus action, give ally a die (d6–d12 by level) to add to one attack/check/save within 10 min.',
  'Uncanny Dodge':'Rogue: Use reaction when hit by an attacker you can see to halve the damage.',
  'Extra Attack':'Fighter/others: Make two attacks when you take the Attack action (three at 11th, four at 20th for Fighter).',
  'Superiority Dice':'Battle Master: d8 pool (4 dice, 5 at 7th, 6 at 15th). Fuel maneuvers. Regain on short/long rest.',
  'Lucky':'Halfling: Reroll natural 1s on d20 attack, check, or save. Feat: 3 luck points/long rest to roll extra d20.',
  'Stone\'s Endurance':'Goliath: Reaction to reduce damage by 1d12 + CON mod. Once per short rest.',
  'Shell Defense':'Tortle: Withdraw into shell as action. +4 AC, advantage on STR/CON saves, but speed 0, disadvantage on DEX saves, can\'t take reactions. End as bonus action.',
  'Breath Weapon':'Dragonborn: Action to exhale elemental damage in a line or cone. DC 8 + CON mod + proficiency. 2d6 scaling. Once per short rest.',
};
const _termRe=new RegExp('(?<![a-zA-Z>])('+ Object.keys(TERM_TIPS).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![a-zA-Z])', 'g');
function _highlightTerms(text){return text.replace(_termRe,(m,t)=>`<span class="term-tip" onclick="showTermTip(event,'${t}')">${t}</span>`);}
function showTermTip(event,term){
  event.stopPropagation();
  document.querySelectorAll('.term-popup').forEach(p=>p.remove());
  const def=TERM_TIPS[term];if(!def)return;
  const p=document.createElement('div');p.className='term-popup';
  p.innerHTML=`<strong>${esc(term)}</strong><div style="margin-top:4px;color:var(--text-dim)">${esc(def)}</div><button class="term-popup-close" onclick="this.closest('.term-popup').remove()">✕ close</button>`;
  const rect=event.target.getBoundingClientRect();
  const left=Math.min(rect.left,window.innerWidth-270);
  const top=rect.bottom+6>window.innerHeight-120?rect.top-10:'auto';
  const topVal=top!=='auto'?rect.top-p.offsetHeight-6:rect.bottom+6;
  p.style.left=left+'px';
  p.style.top=(top!=='auto'?rect.top-90:rect.bottom+6)+'px';
  document.body.appendChild(p);
  setTimeout(()=>{const cl=()=>{p.remove();document.removeEventListener('click',cl);};document.addEventListener('click',cl);},50);
}

// Save version — increment whenever PC data or state structure changes significantly
// loadState() uses this to detect stale saves and merge canonical PC data
const SAVE_VERSION=13;

// ═══ FIREBASE DROP 2 ═══
let fbConfig=null,fbApp=null,fbDb=null,fbRef=null,fbListening=false,fbLastWrite=0,fbEnabled=false,_chatMutatedAt=0,_lastMechReceipt=null;
const FB_PATH='campaigns/tinklepebble/state';
const FB_KEYS='campaigns/tinklepebble/keys';

function fbInit(config){
  if(!config||!config.databaseURL){toast('Firebase: missing databaseURL');return false;}
  try{
    if(fbApp){try{fbApp.delete();}catch(e){}}
    fbApp=firebase.initializeApp(config,'tt_app_'+Date.now());
    fbDb=firebase.database(fbApp);
    fbRef=fbDb.ref(FB_PATH);
    fbEnabled=true;
    localStorage.setItem('tt_fb_config',JSON.stringify(config));
    fbStartListening();
    fbLoadKeys();
    toast('✓ Firebase connected — real-time sync active');
    updFbStatus(true);
    return true;
  }catch(e){
    toast('⚠ Firebase unavailable — running in local-only mode','error');
    var errEl=document.getElementById('fb-error');
    if(errEl){errEl.textContent='Firebase unavailable — local-only mode ('+e.message+')';errEl.style.display='block';}
    fbEnabled=false;updFbStatus(false);return false;
  }
}

function fbSave(s){
  if(!fbEnabled||!fbRef)return;
  fbLastWrite=Date.now();
  const toSync=Object.assign({},s,{_ts:fbLastWrite,_device:playerName||'unknown'});
  fbRef.set(JSON.stringify(toSync)).catch(function(e){console.error('FB save:',e);});
  var keysRef=fbDb.ref(FB_KEYS);
  var gk=localStorage.getItem('tt_gk')||'';
  var ork=localStorage.getItem('tt_ork')||'';
  if(gk||ork){keysRef.set({gk:gk,ork:ork,gm:localStorage.getItem('tt_gm')||'',om:localStorage.getItem('tt_om')||'',prov:provider||'google'}).catch(function(){});}
}

function fbLoadKeys(){
  if(!fbEnabled||!fbDb)return;
  fbDb.ref(FB_KEYS).once('value',function(snap){
    var k=snap.val();if(!k)return;
    var hasLocal=localStorage.getItem('tt_gk')||localStorage.getItem('tt_ork');
    if(hasLocal)return;
    if(k.gk)localStorage.setItem('tt_gk',k.gk);
    if(k.ork)localStorage.setItem('tt_ork',k.ork);
    if(k.gm)localStorage.setItem('tt_gm',k.gm);
    if(k.om)localStorage.setItem('tt_om',k.om);
    if(k.prov)localStorage.setItem('tt_provider',k.prov);
    loadKeys();toast('\u{1F511} API keys synced from Firebase.');
  });
}

function _chatMsgKey(m){return m.msgId||(m.content||'').slice(0,80);}
function _mergeChatHistories(local,remote){
  if(!remote.length)return local;
  if(!local.length)return remote;
  // Fast path: if one array is a superset of the other, return it
  var longer=remote.length>=local.length?remote:local;
  var shorter=remote.length>=local.length?local:remote;
  var sk=_chatMsgKey(shorter[shorter.length-1]);
  for(var i=longer.length-1;i>=0;i--){
    if(_chatMsgKey(longer[i])===sk)return longer;
  }
  // Histories diverged — find the last common message and combine both forks
  var localKeys=new Set();
  local.forEach(function(m){localKeys.add(_chatMsgKey(m));});
  var remoteKeys=new Set();
  remote.forEach(function(m){remoteKeys.add(_chatMsgKey(m));});
  // Walk backwards through local to find last msg that also exists in remote
  var localFork=-1;
  for(var i=local.length-1;i>=0;i--){
    if(remoteKeys.has(_chatMsgKey(local[i]))){localFork=i;break;}
  }
  var remoteFork=-1;
  for(var i=remote.length-1;i>=0;i--){
    if(localKeys.has(_chatMsgKey(remote[i]))){remoteFork=i;break;}
  }
  if(localFork<0&&remoteFork<0)return local;
  // Take the shared prefix from whichever has it longer, then append both forks
  var base=localFork>=remoteFork?local.slice(0,localFork+1):remote.slice(0,remoteFork+1);
  var localNew=local.slice(localFork+1);
  var remoteNew=remote.slice(remoteFork+1);
  // Deduplicate: only add remote messages not already in local fork
  var localNewKeys=new Set();
  localNew.forEach(function(m){localNewKeys.add(_chatMsgKey(m));});
  var uniqueRemote=remoteNew.filter(function(m){return !localNewKeys.has(_chatMsgKey(m));});
  // Interleave by realTs (wall-clock string "HH:MM AM/PM") then by original order
  var allNew=[];
  localNew.forEach(function(m,i){allNew.push({m:m,src:'l',idx:i});});
  uniqueRemote.forEach(function(m,i){allNew.push({m:m,src:'r',idx:i});});
  allNew.sort(function(a,b){
    var ta=a.m.realTs||'';var tb=b.m.realTs||'';
    if(ta&&tb&&ta!==tb)return ta<tb?-1:1;
    return a.idx-b.idx;
  });
  return base.concat(allNew.map(function(x){return x.m;}));
}
function fbStartListening(){
  if(fbListening||!fbRef)return;
  fbListening=true;
  fbRef.on('value',function(snap){
    var raw=snap.val();if(!raw)return;
    try{
      var remote=JSON.parse(raw);
      var remoteTs=remote._ts||0;
      var localTs=state._ts||0;
      if(Date.now()-fbLastWrite<3000)return;
      // Chat merge (clock-independent): always keep the longest chat that
      // contains all of our messages.  Messages are append-only, so the
      // longer array is the more complete one.
      // Skip merge if a local delete/edit just happened — local is authoritative
      var localChat=state.chatHistory||[];
      var remoteChat=remote.chatHistory||[];
      var chatMerged=(Date.now()-_chatMutatedAt<10000)?localChat:_mergeChatHistories(localChat,remoteChat);
      // Even when remote timestamp is stale, pick up new/merged chat messages
      if(remoteTs<=localTs){
        if(chatMerged.length>localChat.length||chatMerged!==localChat){
          state.chatHistory=chatMerged;
          try{localStorage.setItem('tt_v1',JSON.stringify(state));}catch(e){}
          renderChat();
        }
        return;
      }
      delete remote._ts;delete remote._device;
      migrate(remote);
      remote.chatHistory=chatMerged;
      // PC data is managed via import/migrate — remote Firebase data is authoritative.
      // No canonical merge needed here; migrate(remote) already handles version gates.
      remote.saveVersion=SAVE_VERSION;
      // Preserve campaignSetup from local if remote has empty/missing version
      if(state.campaignSetup&&Object.keys(state.campaignSetup).length&&(!remote.campaignSetup||!Object.keys(remote.campaignSetup).length)){
        remote.campaignSetup=state.campaignSetup;
      }
      state=remote;state._ts=remoteTs;
      state.pcs.forEach(pc=>checkLevelUp(pc));
      try{localStorage.setItem('tt_v1',JSON.stringify(state));}catch(e){}
      renderAll();genLedger();autosaveDot();
      // Notify on new party messages from others
      const newLen=(state.partyChat||[]).length;
      if(newLen>_lastPartyChatLen){
        const curP=localStorage.getItem('tt_pchar')||'';
        (state.partyChat||[]).slice(_lastPartyChatLen).forEach(function(m){
          if(m.playerName&&m.playerName!==curP){
            _unreadParty++;updatePartyBadge();
            toast('🗨️ '+m.playerName+': '+String(m.content||'').slice(0,60));
            if(currentTab!=='tab-dm')flashTab('tab-dm');
            if(localStorage.getItem('tt_notif')==='granted'){
              try{new Notification('🗨️ '+m.playerName,{body:String(m.content||'').slice(0,80)});}catch(e){}
            }
          }
        });
        _lastPartyChatLen=newLen;
      }
      var lbl=document.getElementById('as-lbl');
      if(lbl){lbl.innerText='Synced \u21BA';setTimeout(function(){lbl.innerText='Saved';},2000);}
    }catch(e){console.error('FB sync:',e);}
  });
}

function fbDisconnect(){
  if(fbRef)fbRef.off();
  if(fbApp){try{fbApp.delete();}catch(e){}}
  fbEnabled=false;fbListening=false;fbApp=null;fbDb=null;fbRef=null;
  localStorage.removeItem('tt_fb_config');
  updFbStatus(false);toast('Firebase disconnected.');
}

function updFbStatus(connected){
  var el=document.getElementById('fb-status');
  if(el){el.textContent=connected?'\u{1F7E2} Syncing':'\u26AA Local only';el.style.color=connected?'var(--green-bright)':'var(--text-dim)';}
  var mini=document.getElementById('fb-status-mini');
  if(mini){mini.textContent=connected?'\uD83D\uDD25':'';mini.title=connected?'Firebase syncing':'Local only';}
  var discBtn=document.getElementById('fb-disconnect-btn');
  if(discBtn)discBtn.style.display=connected?'inline-flex':'none';
}

function fbLoadConfig(){
  if(typeof firebase==='undefined'){
    toast('⚠ Firebase unavailable — offline mode only','error');
    var banner=document.getElementById('fb-offline-banner');
    if(banner)banner.style.display='block';
    updFbStatus(false);
    return;
  }
  // Try saved config first
  var saved=localStorage.getItem('tt_fb_config');
  if(saved){try{var cfg=JSON.parse(saved);if(cfg&&cfg.databaseURL){fbInit(cfg);return;}}catch(e){}}
  // Default config for Tinkle's Tinctures
  var defaultCfg={
    apiKey:"AIzaSyCqTaMBHW7pai1eH0A8NuCuoVGL7XTmv-c",
    authDomain:"tinkles-tinctures.firebaseapp.com",
    databaseURL:"https://tinkles-tinctures-default-rtdb.firebaseio.com",
    projectId:"tinkles-tinctures",
    storageBucket:"tinkles-tinctures.firebasestorage.app",
    messagingSenderId:"1014640604516",
    appId:"1:1014640604516:web:45b0ac0acdb981778f7671"
  };
  fbInit(defaultCfg);
}

function connectFirebase(){
  var raw=document.getElementById('fb-config-input').value.trim();
  if(!raw){toast('Paste your Firebase config JSON first.');return;}
  try{
    // Strip const/var assignment prefix
    var cleaned=raw.replace(/^[\s\S]*?const\s+\w+\s*=\s*/,'').replace(/^[\s\S]*?var\s+\w+\s*=\s*/,'').trim();
    // Remove trailing semicolon
    cleaned=cleaned.replace(/;\s*$/,'').trim();
    // Strip line comments
    var stripped=[];
    var ls=cleaned.split('\n');
    for(var i=0;i<ls.length;i++){
      var l=ls[i];var ci=l.indexOf('//');
      stripped.push(ci>-1?l.substring(0,ci):l);
    }
    cleaned=stripped.join('\n');
    // Quote unquoted keys
    cleaned=cleaned.replace(/([{,]\s*)(\w+)(\s*:)/g,'$1"$2"$3');
    // Fix single quotes to double quotes
    cleaned=cleaned.replace(/'/g,'"');
    // Remove trailing slashes from URLs
    cleaned=cleaned.replace(/\/"\s*,/g,'",').replace(/\/"\s*}/g,'"}');
    var config=JSON.parse(cleaned);
    // Validate
    if(!config.databaseURL){toast('Missing databaseURL — copy it from Firebase Console → Realtime Database.');return;}
    if(!config.apiKey){toast('Missing apiKey — check your config.');return;}
    // Strip trailing slash from databaseURL
    config.databaseURL=config.databaseURL.replace(/\/+$/,'');
    toast('Connecting to Firebase...');
    var ok=fbInit(config);
    if(ok){state._ts=Date.now();fbSave(state);}
  }catch(e){
    toast('Config parse error: '+e.message,'error');
    var errEl=document.getElementById('fb-error');
    if(errEl){errEl.textContent='Error: '+e.message;errEl.style.display='block';}
    console.error('Firebase config error:',e);
  }
}


// ═══ STATE ═══
let state={
  pcs:[
    {
      id:'pc1',name:'',race:'',class:'Fighter',level:1,
      background:'',alignment:'',
      hp:10,hp_max:10,ac:10,initiative:0,speed:30,passive_perception:10,passive_insight:10,
      xp:0,color:'#c04a3a',
      str:'10 (+0)',dex:'10 (+0)',con:'10 (+0)',int:'10 (+0)',wis:'10 (+0)',cha:'10 (+0)',
      skills:'',
      features:'',
      magic:'',
      resources:[],
      conditions:[],
      slots:[],
      inventory:[],
      backstory_origin:'',
      backstory_motivation:'',
      backstory_secret:'',
      pending:[]
    },
    {
      id:'pc2',name:'',race:'',class:'Wizard',level:1,
      background:'',alignment:'',
      hp:6,hp_max:6,ac:10,initiative:0,speed:30,passive_perception:10,passive_insight:10,
      xp:0,color:'#4a7090',
      str:'10 (+0)',dex:'10 (+0)',con:'10 (+0)',int:'10 (+0)',wis:'10 (+0)',cha:'10 (+0)',
      skills:'',
      features:'',
      magic:'',
      resources:[],
      conditions:[],
      slots:[],
      inventory:[],
      backstory_origin:'',
      backstory_motivation:'',
      backstory_secret:'',
      pending:[]
    },
    {
      id:'pc3',name:'',race:'',class:'Bard',level:1,
      background:'',alignment:'',
      hp:8,hp_max:8,ac:10,initiative:0,speed:30,passive_perception:10,passive_insight:10,
      xp:0,color:'#7060a0',
      str:'10 (+0)',dex:'10 (+0)',con:'10 (+0)',int:'10 (+0)',wis:'10 (+0)',cha:'10 (+0)',
      skills:'',
      features:'',
      magic:'',
      resources:[],
      conditions:[],
      slots:[],
      inventory:[],
      backstory_origin:'',
      backstory_motivation:'',
      backstory_secret:'',
      pending:[]
    }
  ],
  worldData:{
    time:'Day 1, Dusk',season:'Late Summer',weather:'Smoke and haze — Greenest burns',
    illum:'Dim (firelight and smoke)',
    location:'Outskirts of Greenest — Trade Way approach',
    loc_desc:'The town of Greenest sprawls ahead in the valley below. Columns of smoke rise from burning buildings. A massive blue dragon circles overhead, lightning crackling between its jaws. Screaming civilians flee toward the central keep. The Cult of the Dragon has come to Greenest.',
    setting:'Sword Coast, Forgotten Realms. High fantasy. The Cult of the Dragon is raiding towns along the coast, amassing a hoard of treasure for a dark ritual to summon Tiamat from the Nine Hells.',
    plot:"- Cult of the Dragon: fanatical organization raiding settlements to amass treasure for Tiamat’s return.\n- The raid on Greenest is their latest operation — the party arrives as it begins.\n- Governor Nighthill coordinates defense from the keep. Castellan Escobert knows a secret tunnel.\n- Frulam Mondath (Wearer of Purple) leads the cult forces. Langdedrosa Cyanwrath (half-blue-dragon) is their champion.\n- Lennithon, an adult blue dragon, circles overhead — reluctant but dangerous.",
    secrets:'The Cult of the Dragon is gathering treasure across the Sword Coast to fund the summoning of Tiamat. Greenest is just one of many targets. The cult’s hoard is being transported north to a place called Castle Naerytar. Leosin Erlanthar, a Harper agent, has been captured during the raid.',
    timers:'PENDING — Active timers to be established through play.',
    premise:"Hoard of the Dragon Queen. Three adventurers arrive at the town of Greenest along the Trade Way to find it under siege by the Cult of the Dragon and an adult blue dragon. They must defend Greenest, investigate the cult’s plans, and ultimately stop the summoning of Tiamat.",
    premiseLocked:false,
    primaryMission:'Defend Greenest from the Cult of the Dragon raid. Investigate the cult’s plans and stop the summoning of Tiamat.',
    scene_title:'',
    scene_threat:'',
    scene_cond:'',
    travelLog:[],
    townReputation:[{town:'Greenest',status:'neutral',notes:'Just arriving. Town under attack by Cult of the Dragon.'}],
    businessProfile:{},
    campaignSecrets:[
      {text:"The Cult of the Dragon is gathering a massive hoard to fund Tiamat’s return from the Nine Hells. Greenest is one of many raids.",playerKnown:false,pending:false},
      {text:"Leosin Erlanthar (half-elf monk, Harper agent) has been captured during the raid. He holds vital intelligence about the cult’s plans.",playerKnown:false,pending:false},
      {text:"The cult’s hoard is being transported north through the Mere of Dead Men to Castle Naerytar, then onward to a flying castle.",playerKnown:false,pending:false,aiOnly:true}
    ]
  },
  npcs:[
    {name:'Governor Tarbaw Nighthill',disposition:'Desperate',details:'Human male, leader of Greenest. In the keep coordinating defense during the raid. Wounded but refusing to rest.',status:'active',lastSeen:'Greenest Keep'},
    {name:'Castellan Escobert the Red',disposition:'Gruff ally',details:'Shield dwarf. Keep commander. Knows a secret tunnel from the keep to the stream that bypasses the cult forces.',status:'active',lastSeen:'Greenest Keep'},
    {name:'Leosin Erlanthar',disposition:'Unknown',details:'Half-elf monk and Harper agent investigating the Cult of the Dragon. Was in Greenest when the raid began. Currently missing — likely captured.',status:'active',lastSeen:'Greenest (missing)'},
    {name:'Frulam Mondath',disposition:'Hostile',details:'Human female. Wearer of Purple — cult leader commanding the Greenest raid. Ambitious and ruthless.',status:'active',lastSeen:'Greenest (cult camp)'},
    {name:'Langdedrosa Cyanwrath',disposition:'Hostile',details:'Half-blue-dragon champion of the cult. Massive, proud, honorable in a brutal way. Will challenge the strongest-looking warrior to single combat.',status:'active',lastSeen:'Greenest (raid)'},
    {name:'Lennithon',disposition:'Indifferent',details:'Adult blue dragon. Participating in the raid reluctantly — the cult promised payment. Will retreat if sufficiently challenged or injured.',status:'active',lastSeen:'Sky above Greenest'}
  ],
  quests:[
    {text:'Defend Greenest from the Cult of the Dragon raid | Rescue civilians, protect key locations, survive the night',done:false,pending:false,status:'active',hidden:false,location:'Greenest'},
    {text:'Find Leosin Erlanthar | Harper agent gone missing during the raid. May have vital intel on the cult',done:false,pending:false,status:'active',hidden:false,location:'Greenest'},
    {text:'Investigate the Cult of the Dragon | Why are they raiding? Where is the hoard going? What is their endgame?',done:false,pending:false,status:'active',hidden:false}
  ],
  treasuryData:{
    pp:0,gp:15,ep:0,sp:0,cp:0,
    lifestyle:'Modest (traveling adventurers, 1 gp/day shared)',
    incomeLog:[
      {desc:'Starting funds — party pool',amt:15,type:'in',ts:'Day 1, Dusk',category:'startup'}
    ]
  },
  partyInventory:[
    {name:'Rations',qty:10,weight:20,type:'supply',notes:'Shared party supply. ~3 days for three people.'},
    {name:'Rope (50ft, hempen)',qty:1,weight:10,type:'supply',notes:''},
    {name:'Torches',qty:10,weight:10,type:'supply',notes:'Bright light 20ft, dim light 20ft. Burns 1 hour.'},
    {name:'Waterskins',qty:3,weight:15,type:'supply',notes:'One per party member.'}
  ],
  wagon:{
    ox:{
      name:'(No draft animal)',hp:0,hp_max:0,ac:10,conditions:'None',feed:'N/A',
      backstory:'The party has no mount or draft animal yet. Acquire one through play.',
      personality:'',
      bonds:{},
      quirks:[],
      experimentLog:''
    },
    cells:[],
    cargo:[],
    hoard:[],
    hp:0,hp_max:0,ac:10,conditions:'',
    wagonName:"No wagon yet",
    wagonDesc:"The party is traveling on foot along the Trade Way. A cart or wagon may be acquired through play."
  },
  relationships:[
    {from:'pc1',to:'pc2',disposition:'neutral',dynamic:'PENDING -- to be established through play.',aiOnly:false,pending:true},
    {from:'pc1',to:'pc3',disposition:'neutral',dynamic:'PENDING -- to be established through play.',aiOnly:false,pending:true},
    {from:'pc2',to:'pc1',disposition:'neutral',dynamic:'PENDING -- to be established through play.',aiOnly:false,pending:true},
    {from:'pc2',to:'pc3',disposition:'neutral',dynamic:'PENDING -- to be established through play.',aiOnly:false,pending:true},
    {from:'pc3',to:'pc1',disposition:'neutral',dynamic:'PENDING -- to be established through play.',aiOnly:false,pending:true},
    {from:'pc3',to:'pc2',disposition:'neutral',dynamic:'PENDING -- to be established through play.',aiOnly:false,pending:true}
  ],
  combat:{active:false,round:1,currentIdx:0,list:[]},
  encounterPresets:[
    {name:'Cult Raiders (Chapter 1)',enemies:'Cult Fanatic:22:13, Cultist:9:12, Cultist:9:12, Cultist:9:12, Guard Drake:33:14'},
    {name:'Kobold Ambush',enemies:'Kobold:5:12, Kobold:5:12, Kobold:5:12, Kobold:5:12, Winged Kobold:7:13'}
  ],
  scenes:[],activeSceneIdx:-1,
  snippets:[],dmSecrets:'',
  chatHistory:[],logSummary:'',
  logs:[{ts:'Day 1, Dusk',type:'dm',body:"Hoard of the Dragon Queen — campaign terminal initialized. Party approaches Greenest. The sky burns. Set starting location and run Session Zero to begin."}],
  activeEditTab:0,
  turnCount:0,turnsSince:0,chkCount:0,chkMode:'exploration',msgsSinceChk:0,autoChkInterval:8,
  chkHistory:[],rewindStack:[],
  wagonFilter:'all',
  plugins:[],
  errorLog:[],
  oocHistory:[],
  partyChat:[],
  storyChapters:[],
  campaignLaunched:false,
  prevSessionSummary:'',
  sessionNotes:'',
  hpSteps:[1,5],
  quickActions:[
    {id:'qa_1',label:'Adjust HP',type:'hp',params:{pc:'',amount:'',mode:'damage'},context:['tab-party','tab-combat','tab-dm']},
    {id:'qa_2',label:'Add Condition',type:'condition_add',params:{pc:'',condition:''},context:['tab-party','tab-combat','tab-dm']},
    {id:'qa_3',label:'Clear Conditions',type:'condition_clear',params:{pc:''},context:['tab-party','tab-combat','tab-dm']},
    {id:'qa_4',label:'Use Resource',type:'resource_use',params:{pc:'',resource:''},context:['tab-party','tab-combat','tab-dm']},
    {id:'qa_5',label:'Add Foraged Item',type:'item_add_foraged',params:{name:'',qty:1,weight:0},context:['tab-wagon','tab-world','tab-dm']},
    {id:'qa_6',label:'Long Rest',type:'long_rest',params:{},context:['tab-dm','tab-party','tab-combat']},
    {id:'qa_7',label:'Advance Time',type:'time_advance',params:{amount:'1 hour'},context:['tab-world','tab-dm','tab-session']},
    {id:'qa_8',label:'Save Game',type:'save_game',params:{},context:['tab-party','tab-world','tab-wagon','tab-combat','tab-dm','tab-session','tab-ait']},
    {id:'qa_9',label:'Next Turn',type:'combat_next',params:{},context:['tab-combat','tab-dm']},
    {id:'qa_10',label:'Add Log Entry',type:'log_entry',params:{type:'player',body:''},context:['tab-session','tab-dm']},
    {id:'qa_11',label:'Context Refresh',type:'context_refresh',params:{},context:['tab-dm','tab-ait','tab-party']},
    {id:'qa_12',label:'Update Town Rep',type:'town_rep',params:{town:'',status:'neutral',notes:''},context:['tab-world','tab-dm']},
    {id:'qa_13',label:'Roll & Submit',type:'roll_submit',params:{},context:['tab-party','tab-combat','tab-dm','tab-world']},
    {id:'qa_14',label:'Fix Missing State',type:'state_fix',params:{},context:['tab-party','tab-dm','tab-wagon','tab-world','tab-session']},
    {id:'qa_15',label:'Re-sync AI',type:'resync_ai',params:{},context:['tab-dm','tab-party']},
    {id:'qa_16',label:'Surroundings',type:'surroundings',params:{},context:['tab-dm','tab-party','tab-world']},
    {id:'qa_17',label:'Short Rest',type:'short_rest',params:{},context:['tab-dm','tab-party','tab-combat']},
    {id:'qa_18',label:'Random Event',type:'random_event',params:{},context:['tab-dm','tab-world','tab-wagon']},
    {id:'qa_19',label:'Roleplay NPC',type:'roleplay_npc',params:{},context:['tab-dm','tab-world']},
    {id:'qa_20',label:'Character Moment',type:'char_moment',params:{},context:['tab-dm','tab-party']},
    {id:'qa_21',label:'Send Active Scene',type:'send_scene',params:{},context:['tab-dm','tab-session']},
    {id:'qa_22',label:'Context Refresh',type:'context_refresh_btn',params:{},context:['tab-dm','tab-ait']},
    {id:'qa_23',label:'Investigate',type:'investigate',params:{},context:['tab-dm','tab-world','tab-party']}
  ]
};

let playerName='',playerChar='',provider='openrouter';
let sessionLogIdx=0;
let _lastPartyChatLen=0,_unreadParty=0;
const _expandedMsgs=new Set(); // message indices the user has expanded
let _spellFilter='all'; // spellbook level filter
let sessionStart=Date.now(),sessionStartGP=0;
// Message content lookup — avoids JSON.stringify in onclick attributes
const msgMap={};
function getMsgContent(idx){return msgMap[idx]||'';}

// ═══ INIT ═══
window.addEventListener('DOMContentLoaded',()=>{
  initThemeMode();loadState();loadKeys();loadTtsSettings();
  // Snapshot canonical PCs before Firebase can overwrite them
  window.INITIAL_PCS=JSON.parse(JSON.stringify(state.pcs));
  fbLoadConfig();
  sessionStartGP=parseFloat(state.treasuryData.gp)||0;
  sessionLogIdx=(state.treasuryData.incomeLog||[]).length;
  _lastPartyChatLen=(state.partyChat||[]).length;
  populateVoices();
  if(typeof speechSynthesis!=='undefined'&&speechSynthesis.onvoiceschanged!==undefined) speechSynthesis.onvoiceschanged=populateVoices;
  // Move non-DM tab sections into drawer body
  const drawerBody=document.getElementById('drawer-body');
  if(drawerBody){
    ['tab-party','tab-world','tab-wagon','tab-combat','tab-session','tab-ait','tab-dev','tab-setup'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)drawerBody.appendChild(el);
    });
  }
  // Swipe-down to close drawer (on handle + header area only)
  (()=>{
    const sheet=document.getElementById('drawer-sheet');
    if(!sheet)return;
    let _sy=0,_tracking=false;
    const handles=['.drawer-handle','.drawer-hdr'];
    handles.forEach(sel=>{
      const el=sheet.querySelector(sel);
      if(!el)return;
      el.addEventListener('touchstart',e=>{_sy=e.touches[0].clientY;_tracking=true;},{passive:true});
    });
    sheet.addEventListener('touchmove',e=>{
      if(!_tracking)return;
      const dy=e.touches[0].clientY-_sy;
      if(dy>0)sheet.style.transform='translateY('+dy+'px)';
    },{passive:true});
    sheet.addEventListener('touchend',e=>{
      if(!_tracking)return;
      _tracking=false;
      const dy=e.changedTouches[0].clientY-_sy;
      if(dy>80){closeDrawer();}
      else{sheet.style.transform='';}
    },{passive:true});
    sheet.addEventListener('touchcancel',()=>{_tracking=false;sheet.style.transform='';},{passive:true});
  })();
  // Close treasury when clicking outside
  document.addEventListener('click',e=>{
    const m=document.getElementById('treasury-modal');
    const gp=document.getElementById('hud-gp');
    if(m&&m.style.display!=='none'&&!m.contains(e.target)&&e.target!==gp&&document.contains(e.target)){m.style.display='none';}
  });
  // Draggable FAB
  (()=>{
    const wrap=document.getElementById('qa-fab-wrap');
    if(!wrap)return;
    let sx=0,sy=0,ox=0,oy=0,moved=false;
    wrap.addEventListener('touchstart',e=>{
      if(e.target.closest('button')&&e.target.id!=='qa-fab')return;
      const t=e.touches[0];
      sx=t.clientX;sy=t.clientY;
      const r=wrap.getBoundingClientRect();ox=r.left;oy=r.top;
      moved=false;
    },{passive:true});
    wrap.addEventListener('touchmove',e=>{
      const t=e.touches[0];
      const dx=t.clientX-sx,dy=t.clientY-sy;
      if(!moved&&Math.abs(dx)+Math.abs(dy)<10)return;
      moved=true;
      closeQAMenu();
      wrap.style.left=Math.max(0,Math.min(window.innerWidth-wrap.offsetWidth,ox+dx))+'px';
      wrap.style.top=Math.max(58,Math.min(window.innerHeight-wrap.offsetHeight-80,oy+dy))+'px';
      wrap.style.right='auto';wrap.style.bottom='auto';
      e.preventDefault();
    },{passive:false});
    wrap.addEventListener('touchend',()=>{
      if(moved){wrap.dataset.dragged='1';localStorage.setItem('tt_fab',JSON.stringify({left:wrap.style.left,top:wrap.style.top}));}
    },{passive:true});
    try{const s=JSON.parse(localStorage.getItem('tt_fab')||'null');if(s&&s.left){wrap.style.left=s.left;wrap.style.top=s.top;wrap.style.right='auto';wrap.style.bottom='auto';}}catch(e){}
  })();
  renderAll();genLedger();loadSetupFields();
  renderQAMenu();
  renderSuggestChips('narrative');
  showSessionMode('play'); // set initial session mode
  injectPanelFlags();
  setInterval(renderStatusMini,60000);
  // Auto-resize AI contract textareas
  ['ai-persona','ai-never','ai-actions','ai-continuity','ai-multi'].forEach(id=>{
    const ta=document.getElementById(id);if(!ta)return;
    const resize=()=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';};
    ta.addEventListener('input',resize);
    setTimeout(resize,200);
  });
});

function updatePlayerLbl(){
  const el=document.getElementById('player-lbl');if(!el)return;
  if(playerName&&playerChar){el.textContent='👤 '+playerName+' ('+playerChar+') ✎';el.title='Tap to switch player';}
  else{el.textContent='👤 Set player ▸';el.title='Set up your player name';}
}
function checkSetup(){
  playerName=localStorage.getItem('tt_pname')||'';
  playerChar=localStorage.getItem('tt_pchar')||'';
  if(playerName&&playerChar){closeModal('setup-modal');}
  updatePlayerLbl();
}
function populateSetup(){
  const sel=document.getElementById('setup-character');
  if(!sel)return;
  sel.innerHTML='<option value="">— Select your character —</option>';
  state.pcs.forEach(pc=>{sel.innerHTML+=`<option value="${pc.name}">${pc.name} — ${pc.class}</option>`;});
  const nn=document.getElementById('setup-name');if(nn&&playerName)nn.value=playerName;
  if(sel&&playerChar)sel.value=playerChar;
}
function completeSetup(){
  const n=document.getElementById('setup-name').value.trim();
  const c=document.getElementById('setup-character').value;
  if(!n){toast('Enter your name.');return;}
  if(!c){toast('Select your character.');return;}
  playerName=n;playerChar=c;
  localStorage.setItem('tt_pname',n);localStorage.setItem('tt_pchar',c);
  updatePlayerLbl();
  closeModal('setup-modal');toast('Welcome, '+n+'!');
}

// ═══ TABS ═══
function showTab(id){
  currentTab=id;
  closeQAMenu();
  // New interface: non-DM tabs open in drawer
  if(id==='tab-dm'){closeDrawer();return;}
  if(typeof _DRAWER_TABS!=='undefined'&&_DRAWER_TABS.includes(id)){
    openDrawer(id);
    return;
  }
  // Fallback (direct show, for any tabs not yet in drawer system)
  document.querySelectorAll('.tab-section').forEach(e=>{e.classList.remove('active');});
  document.querySelectorAll('.main-tab').forEach(e=>e.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  const btn=Array.from(document.querySelectorAll('.main-tab')).find(b=>b.getAttribute('onclick')?.includes(id));
  if(btn)btn.classList.add('active');
  clearTabBadge(id);
  renderQAMenu();
  if(id==='tab-session'){
    showSessionMode('play');
  } else {
    const modPanel=document.getElementById('sess-module-panel');
    const logPanel=document.getElementById('sess-log-panel');
    if(modPanel)modPanel.style.cssText='display:none;height:0;overflow:hidden;margin:0;padding:0';
    if(logPanel)logPanel.style.cssText='display:block';
  }
}
function showWorldTab(tab){
  if(tab==='locations'){
    const el=document.getElementById('journal-sec-locations');
    if(el){el.open=true;el.scrollIntoView({behavior:'smooth'});}
  }
  renderLocations();
}
function showSessionMode(mode){
  const playPanel=document.getElementById('sess-play-panel');
  const prepPanel=document.getElementById('sess-prep-panel');
  const playBtn=document.getElementById('sess-btn-play');
  const prepBtn=document.getElementById('sess-btn-prep');
  if(!playPanel||!prepPanel)return;
  // Always reset all panels first
  const modPanel2=document.getElementById('sess-module-panel');
  if(modPanel2)modPanel2.style.cssText='display:none;height:0;overflow:hidden;margin:0;padding:0';
  const modBtn2=document.getElementById('sess-btn-module');
  if(modBtn2)modBtn2.classList.remove('active');
  const logPanel2=document.getElementById('sess-log-panel');
  if(logPanel2)logPanel2.style.cssText='display:block';
  const tabSess2=document.getElementById('tab-session');
  if(tabSess2){tabSess2.style.paddingTop='';tabSess2.classList.remove('module-active');}
  const sn2=document.getElementById('sess-subnav');
  if(sn2)sn2.style.borderBottom='';
  if(mode==='play'){
    playPanel.style.cssText='display:block';
    prepPanel.style.cssText='display:none';
    if(playBtn)playBtn.classList.add('active');
    if(prepBtn)prepBtn.classList.remove('active');
  } else {
    playPanel.style.cssText='display:none';
    prepPanel.style.cssText='display:block';
    if(playBtn)playBtn.classList.remove('active');
    if(prepBtn)prepBtn.classList.add('active');
    renderSessionArchive();
  }
}
function showSessionTab(which){
  const logPanel=document.getElementById('sess-log-panel');
  const modPanel=document.getElementById('sess-module-panel');
  const logBtn=document.getElementById('sess-btn-log');
  const modBtn=document.getElementById('sess-btn-module');
  if(!logPanel||!modPanel)return;
  if(which==='log'){
    logPanel.style.cssText='display:block';
    modPanel.style.cssText='display:none;height:0;overflow:hidden;margin:0;padding:0';
    if(logBtn)logBtn.classList.add('active');
    if(modBtn)modBtn.classList.remove('active');
  }else{
    // Collapse everything before showing module
    const pp=document.getElementById('sess-play-panel');
    const sp=document.getElementById('sess-prep-panel');
    if(pp)pp.style.cssText='display:none!important;height:0;overflow:hidden;margin:0;padding:0';
    if(sp)sp.style.cssText='display:none!important;height:0;overflow:hidden;margin:0;padding:0';
    if(logPanel)logPanel.style.cssText='display:none!important;height:0;overflow:hidden;margin:0;padding:0';
    modPanel.style.cssText='display:block;margin-top:0;padding-top:0';
    const tabSess=document.getElementById('tab-session');
    if(tabSess){tabSess.style.paddingTop='0';tabSess.classList.add('module-active');}
    const sn=document.getElementById('sess-subnav');
    if(sn)sn.style.borderBottom='none';
    if(logBtn)logBtn.classList.remove('active');
    if(modBtn)modBtn.classList.add('active');
  }
}

// ═══ RENDER ALL ═══
function renderAll(){
  if(typeof renderHUD==='function')renderHUD();
  if(typeof renderTurnTracker==='function')renderTurnTracker();
  renderCharTabs();renderCards();renderSheets();renderStatusMini();
  renderNPCs();renderQuests();renderCombat();renderPresets();
  renderLogs();renderChat();renderTurnCtr();
  renderChkHist();renderRewind();renderScenes();renderSnips();renderModuleTracker();renderStoryRead();
  renderWagon();renderIncome();renderPartyInv();syncWorld();renderTreasuryTotal();
  renderCampaignSecrets();renderTownRep();renderConsequences();syncBP();renderAnimals();renderQAEditor();updProvStatusMini();
  renderPlugins();renderSuperpowers();renderErrorLog();updatePlayerLbl();renderOOC();renderParty();renderSetupLock();renderContracts();
  // Ensure session sub-panels are in correct state
  if(document.getElementById('sess-log-panel')){
    if(document.getElementById('sess-module-panel')?.style.display==='block'){
      showSessionTab('module');
    } else {
      showSessionMode('play');
    }
  }
  const acn=document.getElementById('auto-chk-n');if(acn)acn.value=state.autoChkInterval||8;

  // Render relationships for active edit tab
  if(state.pcs[state.activeEditTab||0])renderRelationships(state.activeEditTab||0);
  injectPanelFlags();
  renderContextStrip();renderWorldBar();
}

// ═══ WORLD BAR (compact location / time / weather at top of chat) ═══
function renderWorldBar(){
  const el=document.getElementById('world-bar');if(!el)return;
  const w=state.worldData||{};
  const parts=[];
  if(w.location)parts.push('📍 '+w.location);
  if(w.time)parts.push('🕐 '+w.time);
  if(w.weather)parts.push('☁ '+w.weather);
  if(state.combat&&state.combat.active){
    const r=state.combat.round||1;
    const cur=state.combat.list?.[state.combat.currentIdx||0];
    parts.push('⚔ Rd '+r+(cur?' · '+cur.name:''));
  }
  el.innerHTML=parts.map(p=>`<span>${esc(p)}</span>`).join('');
}

// ═══ CONTEXT STRIP (quest / consequence carousel) ═══
let _ctxSlide=0;
let _ctxTimer=null;
function _ctxSlides(){
  const slides=[];
  const w=state.worldData||{};
  if(w.primaryMission)slides.push({icon:'🎯',text:w.primaryMission,action:'showTab(\'tab-world\')',primary:true});
  if(state.combat&&state.combat.active&&(state.combat.list||[]).length){
    const round=state.combat.round||1;
    const cur=state.combat.list[state.combat.currentIdx||0];
    slides.push({icon:'⚔',text:'Round '+round+' · '+(cur?cur.name+'\'s turn':'—'),action:'showTab(\'tab-combat\')',combat:true});
  }
  const activeQuests=(state.quests||[]).filter(q=>q.status==='active');
  activeQuests.forEach(q=>{
    slides.push({icon:'📜',text:(q.text||'').split('|')[0].slice(0,60),action:'showTab(\'tab-world\')',quest:true});
  });
  const activeCsq=(state.consequences||[]).filter(c=>!c.resolved);
  activeCsq.forEach(c=>{
    const tag=c.type?c.type.toUpperCase()+': ':'';
    slides.push({icon:'⚠',text:tag+(c.text||'').slice(0,60),action:'showTab(\'tab-world\')',warning:true});
  });
  return slides;
}
function renderContextStrip(){
  const el=document.getElementById('context-strip');if(!el)return;
  const slides=_ctxSlides();
  if(!slides.length){el.innerHTML='<span style="color:var(--text-dim);font-style:italic">No active quests</span>';return;}
  el.innerHTML=slides.map((s,i)=>{
    const bg=s.primary?'rgba(208,120,69,.15)':s.combat?'var(--red)':s.warning?'rgba(208,120,69,.12)':s.quest?'var(--surface3)':'var(--surface2)';
    const color=s.primary?'var(--gold-bright)':s.combat?'var(--text-bright)':s.warning?'var(--gold-bright)':s.quest?'var(--green)':'var(--text)';
    const border=s.primary?'var(--gold-bright)':s.combat?'var(--red)':s.warning?'var(--gold)':s.quest?'var(--green)':'var(--border)';
    const extra=s.primary?'font-weight:700;font-size:11px;':'';
    return `<span class="ctx-chip" style="background:${bg};color:${color};border:1px solid ${border};${extra}" ${s.action?'onclick="event.stopPropagation();'+s.action+'"':''}>${s.icon} ${esc(s.text)}</span>`;
  }).join('');
}
function _tapCtxStrip(){
  const el=document.getElementById('context-strip');if(!el)return;
  el.scrollBy({left:120,behavior:'smooth'});
}

// ═══ CONTRACTS → STATE (DR-6) ═══
const _CONTRACT_KEYS=[['persona','ai-persona'],['never','ai-never'],['actions','ai-actions'],['continuity','ai-continuity'],['multi','ai-multi']];
function saveContract(key,value){
  if(!state.aiContracts)state.aiContracts={};
  state.aiContracts[key]=value;
  save();
}
function renderContracts(){
  _CONTRACT_KEYS.forEach(([key,id])=>{
    const el=document.getElementById(id);if(!el)return;
    if(state.aiContracts&&state.aiContracts[key]){
      // State has content — populate textarea from state
      if(el.value!==state.aiContracts[key])el.value=state.aiContracts[key];
    } else {
      // First load — seed state from whatever is in the DOM
      if(el.value.trim()){
        if(!state.aiContracts)state.aiContracts={};
        state.aiContracts[key]=el.value;
      }
    }
  });
}
function copyContracts(){
  const labels=['DM Persona','Never Do','Actions','Continuity','Multi-Player'];
  let out='AI CONTRACTS\n\n';
  _CONTRACT_KEYS.forEach(([key],i)=>{
    const val=(state.aiContracts?.[key]||'').trim();
    if(val)out+=labels[i]+':\n'+val+'\n\n';
  });
  copyText(out,'✓ Contracts copied');
}
function verifyContracts(){
  const c=state.aiContracts||{};
  const persona=c.persona||'';const never=c.never||'';
  const checks=[
    [!!persona.trim(),'① DM Persona is non-empty'],
    [persona.includes('MULTI-PLAYER ADDRESSING'),'① Multi-player addressing clause present'],
    [!!(c.never||'').trim(),'② What You Never Do is non-empty'],
    [never.includes('DUNGEON SECRETS'),'② DUNGEON SECRETS clause present'],
    [never.includes('PLAYER AGENCY'),'② PLAYER AGENCY clause present'],
    [never.includes('SKILL CHECKS'),'② SKILL CHECKS clause present'],
    [!!(c.actions||'').trim(),'③ Actions contract non-empty'],
    [!!(c.continuity||'').trim(),'④ Continuity contract non-empty'],
    [!!(c.multi||'').trim(),'⑤ Multi-Player contract non-empty'],
  ];
  const fails=checks.filter(([ok])=>!ok);
  if(fails.length){alert('⚠ Contract issues:\n'+fails.map(([,lbl])=>'• '+lbl).join('\n'));return;}
  const parts=['[CONTRACT REFRESH — re-read your operating contracts before responding]'];
  if(persona.trim())parts.push('## DM PERSONA\n'+persona.trim());
  if(never.trim())parts.push('## WHAT YOU NEVER DO\n'+never.trim());
  if((c.actions||'').trim())parts.push('## ACTIONS & MECHANICS\n'+c.actions.trim());
  if((c.continuity||'').trim())parts.push('## CONTINUITY\n'+c.continuity.trim());
  if((c.multi||'').trim())parts.push('## MULTI-PLAYER\n'+c.multi.trim());
  _ctxInject=parts.join('\n\n');
  const ts=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  state.chatHistory.push({role:'system',content:'🔍 Contracts verified ('+checks.length+' checks passed) — refresh queued for next message.',ts,realTs:ts});
  save();renderChat();showTab('tab-dm');
  toast('🔍 Contracts verified + refresh queued — send your next message to apply','green',4000);
}

// ═══ ESC HTML ═══
function esc(s){if(typeof s!=='string')return String(s||'');return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}

// ═══ PARTY PC COMPACT LIST ═══
function renderPartyPCList(){
  const c=document.getElementById('party-pc-list');if(!c)return;
  if(!state.pcs||!state.pcs.length){c.innerHTML='<div style="color:var(--text-dim);font-size:12px;padding:8px">No characters yet.</div>';return;}
  c.innerHTML=state.pcs.map((pc,i)=>{
    const hp=parseInt(pc.hp)||0,max=parseInt(pc.hp_max)||1;
    const pct=Math.max(0,Math.min(100,(hp/max)*100));
    const hpCol=hp<=0?'var(--red)':pct<25?'#c04a3a':pct<50?'var(--gold)':'var(--green)';
    const conds=(pc.conditions||[]).map(c2=>`<span onclick="event.stopPropagation();toggleCond(${i},'${c2.replace(/'/g,"\\'")}');renderPartyPCList()" style="font-size:9px;background:rgba(139,58,42,.25);color:#e08060;border:1px solid var(--red-dim);border-radius:3px;padding:2px 6px;cursor:pointer;min-height:20px;display:inline-flex;align-items:center">${esc(c2)} ✕</span>`).join(' ');
    const conc=pc.concentrating?`<span style="font-size:9px;color:var(--purple-bright)">⬤ ${esc(pc.concentrating)}</span>`:'';
    return `<div onclick="openPCOverview(${i})" style="background:var(--surface2);border:1px solid ${pc.color||'var(--border)'};border-radius:8px;padding:10px 12px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:border-color .15s">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <div style="flex:1;font-family:var(--serif);font-size:14px;font-weight:600;color:${pc.color||'var(--gold-bright)'}">${esc(pc.name||'PC')}</div>
        <div style="font-size:10px;color:var(--text-dim)">Lv ${pc.level||1} ${esc(pc.race||'')} ${esc(pc.class||'')}</div>
        <div style="font-size:10px;color:var(--text-dim);white-space:nowrap">AC ${pc.ac||10}</div>
        <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:${hpCol}">${hp}<span style="font-size:10px;color:var(--text-dim)">/${max}</span></div>
      </div>
      <div style="height:3px;background:var(--surface3);border-radius:2px;margin-bottom:4px"><div style="height:3px;width:${pct.toFixed(1)}%;background:${hpCol};border-radius:2px;transition:width .3s"></div></div>
      ${(()=>{const xp=parseInt(pc.xp)||0;const nxt=XP_T[Math.min(pc.level||1,19)];const xpPct=nxt?Math.min(100,(xp/nxt)*100):100;return`<div onclick="event.stopPropagation()" style="display:flex;align-items:center;gap:5px;margin-bottom:4px"><input type="range" min="0" max="${nxt||1}" value="${xp}" oninput="document.getElementById('xplbl-${i}').textContent=parseInt(this.value).toLocaleString()+' xp'" onchange="upd(${i},'xp',parseInt(this.value)||0);renderPartyPCList()" style="flex:1;height:6px;accent-color:var(--gold)"><span id="xplbl-${i}" style="font-size:8px;color:var(--text-dim);min-width:42px;text-align:right">${xp.toLocaleString()} xp</span></div>`;})()}
      ${conds||conc?`<div style="display:flex;flex-wrap:wrap;gap:3px">${conds}${conc}</div>`:''}
    </div>`;
  }).join('');
}

// ═══ CHAR TABS ═══
function renderCharTabs(){
  const c=document.getElementById('char-tabs');if(!c)return;c.innerHTML='';
  state.pcs.forEach((pc,i)=>{
    const b=document.createElement('button');
    b.className='main-tab'+(i===(state.activeEditTab||0)?' active':'');
    b.style.cssText='padding:6px 14px;border-left:3px solid '+(pc.color||'var(--border)')+';';
    b.textContent=pc.name||'Char '+(i+1);
    b.onclick=()=>{state.activeEditTab=i;renderCharTabs();renderSheets();};
    c.appendChild(b);
  });
}
function addNewChar(){
  state.pcs.push({id:'pc_'+Date.now(),name:'New Character',race:'Human',class:'Fighter',level:1,background:'Soldier',alignment:'Neutral',hp:10,hp_max:10,ac:14,initiative:2,speed:30,passive_perception:10,passive_insight:10,xp:0,color:'#5a8a5a',str:'10 (+0)',dex:'10 (+0)',con:'10 (+0)',int:'10 (+0)',wis:'10 (+0)',cha:'10 (+0)',skills:'',features:'',magic:'None',conditions:[],slots:[],inventory:[],backstory_origin:'',backstory_motivation:'',backstory_secret:''});
  state.activeEditTab=state.pcs.length-1;saveRefresh();toast('✓ Character added!');
}
function delChar(idx){
  if(state.pcs.length<=1){toast('Cannot delete last character.','error');return;}
  const n=state.pcs[idx].name;
  if(!confirm('Delete '+n+'?'))return;
  state.pcs.splice(idx,1);state.activeEditTab=Math.min(state.activeEditTab||0,state.pcs.length-1);
  saveRefresh();toast('✓ '+n+' removed.');
}

// ═══ PARTY CARDS ═══
function renderCards(){
  renderPartyPCList();
}
function renderPcInv(idx){
  const c=document.getElementById('pc-inv-'+idx);if(!c)return;
  c.innerHTML='';
  const pcForInv=state.pcs[idx];if(!pcForInv)return;
  if(!Array.isArray(pcForInv.inventory))pcForInv.inventory=[];
  pcForInv.inventory.forEach((item,ii)=>{
    const d=document.createElement('div');d.className='inv-item';
    const tag=item.type?`<span class="inv-tag ${item.type}">${item.type}</span>`:'';
    d.innerHTML=`<input type="text" value="${esc(item.name||'')}" style="flex:2;min-width:70px" placeholder="Item" onchange="updPcItem(${idx},${ii},'name',this.value)">${tag}<input type="number" value="${item.qty||1}" style="width:42px" onchange="updPcItem(${idx},${ii},'qty',parseInt(this.value)||1)"><input type="number" value="${item.weight||0}" style="width:50px" placeholder="lb" onchange="updPcItem(${idx},${ii},'weight',parseFloat(this.value)||0)"><select style="width:80px;font-size:11px;padding:3px" onchange="updPcItem(${idx},${ii},'type',this.value)">${ITYPES.map(t=>`<option value="${t}" ${item.type===t?'selected':''}>${t}</option>`).join('')}</select><button class="btn sm red icon-btn" onclick="remPcItem(${idx},${ii})">&times;</button>`;
    c.appendChild(d);
  });
}

// ═══ EDIT SHEETS ═══
var _pcSheetTab=0;
function setSheetTab(n){_pcSheetTab=n;renderSheets();}
function renderSheets(){
  const c=document.getElementById('edit-sheets');if(!c)return;c.innerHTML='';
  const idx=state.activeEditTab||0;const pc=state.pcs[idx];if(!pc)return;
  try{
  c.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="display:flex;gap:8px;align-items:center"><label class="field-label" style="margin:0">Color</label><input type="color" value="${pc.color||'#5a8a5a'}" onchange="upd(${idx},'color',this.value)" style="width:40px;height:32px;padding:2px;cursor:pointer;background:none;border:1px solid var(--border);border-radius:2px"></div>
      <button class="btn sm red" onclick="delChar(${idx})">🗑 Delete ${esc(pc.name)}</button>
    </div>
    <div class="form-row">
      <div class="fg"><label class="field-label">Name</label><input type="text" value="${esc(pc.name)}" onchange="upd(${idx},'name',this.value);renderCharTabs()"></div>
      <div class="fg"><label class="field-label">Race</label><input type="text" value="${esc(pc.race||'')}" onchange="upd(${idx},'race',this.value)"></div>
      <div class="fg"><label class="field-label">Class</label><input type="text" value="${esc(pc.class||'')}" onchange="upd(${idx},'class',this.value)"></div>
      <div class="fg"><label class="field-label">Subclass</label><input type="text" value="${esc(pc.subclass||'')}" onchange="upd(${idx},'subclass',this.value)" placeholder="e.g. Battle Master"></div>
      <div style="width:55px"><label class="field-label">Level</label><input type="number" value="${pc.level||1}" onchange="upd(${idx},'level',parseInt(this.value)||1)"></div>
    </div>
    <div class="form-row">
      <div class="fg"><label class="field-label">Background</label><input type="text" value="${esc(pc.background||'')}" onchange="upd(${idx},'background',this.value)"></div>
      <div class="fg"><label class="field-label">Alignment</label><input type="text" value="${esc(pc.alignment||'')}" onchange="upd(${idx},'alignment',this.value)"></div>
      <div style="width:60px"><label class="field-label">HP</label><input type="number" value="${pc.hp}" onchange="upd(${idx},'hp',parseInt(this.value)||0)"></div>
      <div style="width:68px"><label class="field-label">Max HP</label><input type="number" value="${pc.hp_max}" onchange="upd(${idx},'hp_max',parseInt(this.value)||1)"></div>
      <div style="width:55px"><label class="field-label">AC</label><input type="number" value="${pc.ac}" onchange="upd(${idx},'ac',parseInt(this.value)||10)"></div>
      <div style="width:65px"><label class="field-label">Initiative</label><input type="number" value="${pc.initiative||0}" onchange="upd(${idx},'initiative',parseInt(this.value)||0)"></div>
      <div style="width:60px"><label class="field-label">Speed</label><input type="number" value="${pc.speed||30}" onchange="upd(${idx},'speed',parseInt(this.value)||30)"></div>
    </div>
    <div class="form-row">
      <div class="fg"><label class="field-label">XP <button class="slot-add-btn" onclick="awardXP(${idx})">+ Award</button></label><input type="number" value="${pc.xp||0}" onchange="upd(${idx},'xp',parseInt(this.value)||0)"></div>
      <div class="fg"><label class="field-label">Next Level At</label><input type="text" value="${XP_T[Math.min((pc.level||1),19)]} XP" readonly style="color:var(--text-dim)"></div>
      <div class="fg"><label class="field-label">Pass. Perc.</label><input type="number" value="${pc.passive_perception||10}" onchange="upd(${idx},'passive_perception',parseInt(this.value)||10)"></div>
      <div class="fg"><label class="field-label">Pass. Insight</label><input type="number" value="${pc.passive_insight||10}" onchange="upd(${idx},'passive_insight',parseInt(this.value)||10)"></div>
    </div>
    <div class="stat-mini-row" style="margin-bottom:12px">
      ${['str','dex','con','int','wis','cha'].map(s=>{const n=parseInt(pc[s])||10;const m=Math.floor((n-10)/2);const ms=(m>=0?'+':'')+m;return`<div style="text-align:center"><label class="field-label">${s.toUpperCase()}</label><input type="text" value="${n}" onchange="upd(${idx},'${s}',parseInt(this.value)||10)" style="text-align:center;font-size:15px;font-weight:600"><div style="font-size:13px;font-weight:700;color:var(--gold);margin-top:3px;letter-spacing:.5px">${ms}</div></div>`;}).join('')}
    </div>
    <div style="display:flex;gap:0;margin:14px 0 10px;border-bottom:1px solid var(--border)">
      ${['Skills','Features','Attacks','Spells','Gear'].map((t,i)=>`<button onclick="setSheetTab(${i})" style="flex:1;padding:8px 2px;font-size:9px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;border:none;border-bottom:2px solid ${i===_pcSheetTab?'var(--gold)':'transparent'};background:none;color:${i===_pcSheetTab?'var(--gold)':'var(--text-dim)'};cursor:pointer;font-family:var(--sans);min-height:36px;transition:color .15s">${t}</button>`).join('')}
    </div>
    ${_pcSheetTab===0?`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;padding:10px;background:var(--surface2);border-radius:6px;border:1px solid var(--border)">
      ${(()=>{
        const prof=Math.floor(((pc.level||1)-1)/4)+2;
        const modN=s=>{const n=parseInt(pc[s])||10;return Math.floor((n-10)/2);};
        const fmtM=v=>(v>=0?'+':'')+v;
        const profs=Array.isArray(pc.skillProfs)?pc.skillProfs:[];
        const saves=[['STR Save','str'],['DEX Save','dex'],['CON Save','con'],['INT Save','int'],['WIS Save','wis'],['CHA Save','cha']];
        const checks=[['Athletics','str'],['Acrobatics','dex'],['Sleight of Hand','dex'],['Stealth','dex'],['Perception','wis'],['Insight','wis'],['Medicine','wis'],['Animal Handling','wis'],['Survival','wis'],['Persuasion','cha'],['Deception','cha'],['Intimidation','cha'],['Performance','cha'],['Arcana','int'],['History','int'],['Investigation','int'],['Nature','int'],['Religion','int']];
        return `<div><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;font-weight:600">Ability Saves <span style="font-weight:400">(+${prof} if prof)</span></div>${saves.map(([n,s])=>{const b=modN(s);const p=profs.includes(n);const tot=p?b+prof:b;return`<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:2px 0;border-bottom:1px solid var(--border)"><label style="display:flex;align-items:center;gap:5px;cursor:pointer;flex:1"><input type="checkbox" ${p?'checked':''} onchange="toggleSkillProf(${idx},'${n}',this.checked)" style="width:auto;margin:0;accent-color:var(--gold)"><span style="color:var(--text-dim)">${n}</span></label><span style="color:${p?'var(--gold)':'var(--text-bright)'};font-weight:700">${fmtM(tot)}</span></div>`}).join('')}</div>
        <div><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;font-weight:600">Skills <span style="font-weight:400">☑ = proficient (+${prof})</span></div>${checks.map(([n,s])=>{const b=modN(s);const p=profs.includes(n);const tot=p?b+prof:b;return`<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:2px 0;border-bottom:1px solid var(--border)"><label style="display:flex;align-items:center;gap:5px;cursor:pointer;flex:1"><input type="checkbox" ${p?'checked':''} onchange="toggleSkillProf(${idx},'${n}',this.checked)" style="width:auto;margin:0;accent-color:var(--gold)"><span style="color:var(--text-dim)">${n}<span style="font-size:9px;color:var(--border-bright);margin-left:3px">${s.toUpperCase()}</span></span></label><span style="color:${p?'var(--gold)':'var(--text-bright)'};font-weight:${p?700:400}">${fmtM(tot)}</span></div>`}).join('')}</div>`;
      })()}
    </div>
    <div class="form-group"><label class="field-label">Equipment Proficiencies &amp; Notes</label><textarea id="sheet-skills-${idx}" onchange="upd(${idx},'skills',this.value)" style="min-height:80px"></textarea></div>
    `:''}
    ${_pcSheetTab===1?`
    <div class="form-group"><label class="field-label">Features, Feats &amp; Class Resources</label><textarea id="sheet-features-${idx}" onchange="upd(${idx},'features',this.value)" style="min-height:120px"></textarea></div>
    <details class="bs" style="margin-top:8px" open>
      <summary>⚡ Resources &amp; Abilities <button class="slot-add-btn" onclick="event.stopPropagation();addResource(${idx})">+ Add</button></summary>
      <div class="bs-body" id="res-ed-${idx}"></div>
    </details>
    `:''}
    ${_pcSheetTab===2?`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:11px;color:var(--text-dim)">${(pc.attacks||[]).length} attack${(pc.attacks||[]).length===1?'':'s'}</span>
      <button class="btn sm gold" onclick="addAttack(${idx})">+ Add Attack</button>
    </div>
    <div id="attack-ed-${idx}"></div>
    `:''}
    ${_pcSheetTab===3?`
    <div class="form-group"><label class="field-label">Spell Slots <button class="slot-add-btn" onclick="addSlotLvl(${idx})">+ Add Level</button></label><div id="slot-ed-${idx}"></div></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:6px">
      <span style="font-size:11px;color:var(--text-dim)">✨ ${pc.spellbook&&pc.spellbook.length?pc.spellbook.length+' spell'+(pc.spellbook.length===1?'':'s'):'No spells yet'}</span>
      <div style="display:flex;gap:4px">
        <button class="btn sm" onclick="toggleCompendium(${idx})" style="font-size:10px">${_compOpen?'Close':'📚 Browse'}</button>
        <button class="btn sm gold" onclick="addSpell(${idx})">+ Manual</button>
      </div>
    </div>
    <div id="compendium-panel-${idx}">${_compOpen?'':'<!-- closed -->'}</div>
    <div id="spellbook-panel-${idx}"></div>
    <details class="bs" style="margin-top:10px"><summary style="font-size:10px;color:var(--text-dim)">Spellcasting Notes</summary><div class="bs-body"><textarea id="sheet-magic-${idx}" onchange="upd(${idx},'magic',this.value)" style="min-height:80px"></textarea></div></details>
    `:''}
    ${_pcSheetTab===4?`
    <details class="bs" open>
      <summary>🎒 Inventory <button class="slot-add-btn" onclick="event.stopPropagation();addPcItem(${idx})">+ Add Item</button></summary>
      <div class="bs-body" id="inv-ed-${idx}"></div>
    </details>
    ${pc.familiar?`
    <details class="bs" style="margin-top:8px" open>
      <summary>🦉 Familiar — ${esc(pc.familiar.name||'Unnamed')}</summary>
      <div class="bs-body" id="familiar-panel-${idx}"></div>
    </details>
    `:`
    <div style="margin-top:10px;text-align:center">
      <button class="btn sm" onclick="addFamiliar(${idx})">🦉 Add Familiar</button>
    </div>
    `}
    <details class="bs" style="margin-top:8px">
      <summary>🔗 Relationships</summary>
      <div class="bs-body" id="rel-editor-${idx}"></div>
    </details>
    <details class="bs" style="margin-top:8px">
      <summary>📖 Backstory &amp; Roleplay Hooks</summary>
      <div class="bs-body">
        <div class="form-group"><label class="field-label">Origin</label><textarea id="sheet-origin-${idx}" onchange="upd(${idx},'backstory_origin',this.value)" style="min-height:50px"></textarea></div>
        <div class="form-group"><label class="field-label">Motivation</label><textarea id="sheet-motiv-${idx}" onchange="upd(${idx},'backstory_motivation',this.value)" style="min-height:50px;border-color:var(--gold-dim)"></textarea></div>
        <div class="form-group"><label class="field-label">Secret / Flaw</label><textarea id="sheet-secret-${idx}" onchange="upd(${idx},'backstory_secret',this.value)" style="min-height:50px;border-color:var(--red-dim)"></textarea></div>
      </div>
    </details>
    `:''}
    `;
  renderSlotEditor(idx);
  renderResourceEditor(idx);
  renderAttackEditor(idx);
  renderPcInvEditor(idx);
  renderRelationships(idx);
  renderSpellbook(idx);
  if(_compOpen)renderCompendium(idx);
  renderFamiliarPanel(idx);
  // Set textarea values directly — innerHTML doesn't reliably populate textareas on mobile browsers
  const setTA=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val||'';};
  setTA('sheet-skills-'+idx, pc.skills);
  setTA('sheet-features-'+idx, pc.features);
  setTA('sheet-magic-'+idx, pc.magic);
  setTA('sheet-origin-'+idx, pc.backstory_origin);
  setTA('sheet-motiv-'+idx, pc.backstory_motivation);
  setTA('sheet-secret-'+idx, pc.backstory_secret);
  }catch(e){console.error('renderSheets error',e);c.innerHTML='<div style="color:var(--red);padding:12px;font-size:12px">⚠ Could not render character sheet. Error: '+e.message+'</div>';}
}
function renderSlotEditor(idx){
  const c=document.getElementById('slot-ed-'+idx);if(!c)return;c.innerHTML='';
  (state.pcs[idx].slots||[]).forEach((s,si)=>{
    const d=document.createElement('div');d.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap';
    d.innerHTML=`<span style="font-size:11px;color:var(--text-dim);min-width:45px">${SPELL_LVLS[si]}</span><label class="field-label" style="margin:0">Max</label><input type="number" value="${s.max}" min="1" max="9" style="width:50px" onchange="updSlot(${idx},${si},'max',parseInt(this.value)||1)"><label class="field-label" style="margin:0">Used</label><input type="number" value="${s.used}" min="0" style="width:50px" onchange="updSlot(${idx},${si},'used',parseInt(this.value)||0)"><button class="btn sm red" onclick="remSlotLvl(${idx},${si})">Remove</button>`;
    c.appendChild(d);
  });
}
function renderResourceEditor(idx){
  const c=document.getElementById('res-ed-'+idx);if(!c)return;c.innerHTML='';
  const pc=state.pcs[idx];if(!pc)return;
  if(!(pc.resources||[]).length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px 0">No resources. Click + Add to track abilities like Second Wind, Bardic Inspiration, etc.</div>';return;}
  pc.resources.forEach((res,ri)=>{
    const d=document.createElement('div');d.style.cssText='display:flex;gap:6px;align-items:center;margin-bottom:7px;flex-wrap:wrap;padding:6px 8px;background:var(--surface2);border:1px solid var(--border);border-radius:2px';
    d.innerHTML=`<input type="text" value="${esc(res.name||'')}" placeholder="Name (e.g. Second Wind)" style="flex:2;min-width:100px;font-size:11px" onchange="updResource(${idx},${ri},'name',this.value)"><label class="field-label" style="margin:0;white-space:nowrap">Max</label><input type="number" value="${res.max||1}" min="1" style="width:46px" onchange="updResource(${idx},${ri},'max',parseInt(this.value)||1)"><label class="field-label" style="margin:0;white-space:nowrap">Used</label><input type="number" value="${res.used||0}" min="0" style="width:46px" onchange="updResource(${idx},${ri},'used',parseInt(this.value)||0)"><select style="font-size:11px;padding:3px;width:90px" onchange="updResource(${idx},${ri},'restore',this.value)"><option value="short" ${res.restore==='short'?'selected':''}>Short Rest</option><option value="long" ${res.restore==='long'?'selected':''}>Long Rest</option><option value="dawn" ${res.restore==='dawn'?'selected':''}>Dawn</option></select><input type="text" value="${esc(res.desc||'')}" placeholder="Description..." style="flex:3;min-width:100px;font-size:11px" onchange="updResource(${idx},${ri},'desc',this.value)"><button class="btn sm red icon-btn" onclick="remResource(${idx},${ri})">&times;</button>`;
    c.appendChild(d);
  });
}
function addResource(idx){
  if(!state.pcs[idx].resources)state.pcs[idx].resources=[];
  state.pcs[idx].resources.push({name:'',max:1,used:0,restore:'short',desc:''});
  save();renderSheets();
}
function updResource(idx,ri,k,v){
  const res=state.pcs[idx]?.resources?.[ri];if(!res)return;
  res[k]=k==='max'||k==='used'?parseInt(v)||0:v;
  if(res.used>res.max)res.used=res.max;
  save();renderCards();
}
function remResource(idx,ri){state.pcs[idx].resources.splice(ri,1);save();renderSheets();}
function renderPcInvEditor(idx){
  const c=document.getElementById('inv-ed-'+idx);if(!c)return;c.innerHTML='';
  const pc=state.pcs[idx];if(!pc)return;
  const inv=pc.inventory||[];
  if(!inv.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px 0">No items. Tap + Add Item.</div>';return;}
  const mkItem=(item,ii)=>{
    const d=document.createElement('div');
    d.style.cssText='background:var(--surface2);border:1px solid var(--border-bright);border-radius:6px;padding:8px 10px;margin-bottom:6px';
    const typeOpts=PC_ITEM_TYPES.map(t=>`<option value="${t}" ${item.type===t?'selected':''}>${t}</option>`).join('');
    d.innerHTML=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px"><input type="text" value="${esc(item.name||'')}" style="flex:1;font-weight:600;font-size:13px;color:var(--text-bright);background:none;border:none;border-bottom:1px solid var(--border);padding:1px 0;min-width:0" placeholder="Item name" onchange="updPcItem(${idx},${ii},'name',this.value)"><button class="btn sm red icon-btn" onclick="remPcItemSheet(${idx},${ii})" style="flex-shrink:0">&times;</button></div><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><select style="font-size:10px;padding:2px 5px;border-radius:10px;border:1px solid var(--border-bright);background:var(--surface3);color:var(--text-dim)" onchange="updPcItem(${idx},${ii},'type',this.value)">${typeOpts}</select><span style="font-size:11px;color:var(--text-dim)">×</span><input type="number" value="${item.qty||1}" style="width:36px;font-size:11px" onchange="updPcItem(${idx},${ii},'qty',parseInt(this.value)||1)"><span style="font-size:11px;color:var(--text-dim)">·</span><input type="number" value="${item.weight||0}" style="width:40px;font-size:11px" placeholder="0" onchange="updPcItem(${idx},${ii},'weight',parseFloat(this.value)||0)"><span style="font-size:10px;color:var(--text-dim)">lb</span><input type="text" value="${esc(item.notes||'')}" style="flex:1;min-width:60px;font-size:11px;color:var(--text-dim)" placeholder="notes…" onchange="updPcItem(${idx},${ii},'notes',this.value)"></div>`;
    return d;
  };
  const gear=inv.filter(i=>GEAR_TYPES.has(i.type));
  const carried=inv.filter(i=>!GEAR_TYPES.has(i.type));
  if(gear.length){
    const h=document.createElement('div');h.style.cssText='font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;margin-top:2px';h.textContent='⚔ Equipped';
    c.appendChild(h);gear.forEach((item,gi)=>{const ii=inv.indexOf(item);c.appendChild(mkItem(item,ii));});
  }
  if(carried.length){
    const h=document.createElement('div');h.style.cssText='font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;'+(gear.length?'margin-top:10px':'');h.textContent='🎒 Carried';
    c.appendChild(h);carried.forEach((item,ci)=>{const ii=inv.indexOf(item);c.appendChild(mkItem(item,ii));});
  }
}
function addSlotLvl(idx){if(!state.pcs[idx].slots)state.pcs[idx].slots=[];state.pcs[idx].slots.push({max:2,used:0});save();renderSheets();}
function remSlotLvl(idx,si){state.pcs[idx].slots.splice(si,1);save();renderSheets();}
function updSlot(idx,si,k,v){const s=state.pcs[idx].slots[si];if(!s)return;s[k]=v;if(s.used>s.max)s.used=s.max;save();renderCards();}
function awardXP(idx){
  const amt=parseInt(prompt('Award XP to '+state.pcs[idx].name+'?','50'));
  if(isNaN(amt)||amt<=0)return;
  state.pcs[idx].xp=(state.pcs[idx].xp||0)+amt;
  checkLevelUp(state.pcs[idx]);
  saveRefresh();
}

// ═══ STATUS MINI ═══
function renderStatusMini(){
  const c=document.getElementById('party-status-mini');if(!c)return;c.innerHTML='';
  c.style.display=state.pcs.length?'flex':'none';
  state.pcs.forEach((pc,i)=>{
    let badge='<span class="status-badge ok">OK</span>';
    if(pc.hp<=0)badge='<span class="status-badge dead">⚠</span>';
    else if(pc.hp<pc.hp_max*0.4)badge='<span class="status-badge warn">!</span>';
    const d=document.createElement('div');d.className='psb-pc';
    d.innerHTML=`<span class="psb-name" style="color:${pc.color||'var(--text-dim)'}">${esc(pc.name)}:</span><span class="psb-hp">${pc.hp}/${pc.hp_max}</span>${badge}<span class="psb-sep">|</span>`;
    c.appendChild(d);
  });
  const goldDelta=Math.round((parseFloat(state.treasuryData.gp)||0)-sessionStartGP);
  const goldStr=(goldDelta>=0?'+':'')+goldDelta+' gp';
  const meta=document.createElement('div');meta.className='psb-pc';
  meta.style.cssText='flex-shrink:0;gap:8px;';
  meta.innerHTML=`<span style="color:var(--gold);font-size:10px">💰 ${goldStr}</span><span class="psb-sep">|</span><span style="color:var(--text-dim);font-size:10px">⏱ ${getElapsed()}</span>`;
  c.appendChild(meta);
}

// ═══ WORLD SYNC ═══
function syncWorld(){
  ['time','season','weather','illum','location','loc_desc','setting','plot','secrets','timers','premise','scene_title','scene_threat','scene_cond'].forEach(k=>{
    const el=document.getElementById('w_'+k);if(el&&state.worldData[k]!==undefined)el.value=state.worldData[k]||'';
  });
  ['pp','gp','ep','sp','cp','lifestyle'].forEach(k=>{const el=document.getElementById('t_'+k);if(el)el.value=state.treasuryData[k]||0;});
  const sl=document.getElementById('log-summary');if(sl)sl.value=state.logSummary||'';
  const sn=document.getElementById('session-notes');if(sn)sn.value=state.sessionNotes||'';
  const ds=document.getElementById('dm-secrets');if(ds)ds.value=state.dmSecrets||'';
  const qp=document.getElementById('q_primary');if(qp)qp.value=state.worldData.primaryMission||'';
  const tl=document.getElementById('w_travel_log');if(tl)tl.value=(state.worldData.travelLog||[]).join('\n');
  renderTravelLog();renderJournalHeader();renderJournalRep();renderWorldBar();
  const spr=document.getElementById('setup-premise');if(spr)spr.value=state.worldData.premise||'';
  const sst=document.getElementById('setup-setting');if(sst)sst.value=state.worldData.setting||'';
  const smq=document.getElementById('setup-mission');if(smq)smq.value=state.worldData.primaryMission||'';
  syncBP();renderAnimals();
  updatePremiseUI();
}
function renderJournalHeader(){
  const el=document.getElementById('journal-header');if(!el)return;
  const w=state.worldData||{};
  const loc=w.location||'Unknown';
  const time=w.time||'';
  const weather=w.weather||'';
  const mission=w.primaryMission||'';
  const pcs=state.pcs||[];
  const hpLine=pcs.map(p=>{
    const pct=p.hp_max?p.hp/p.hp_max:1;
    const col=pct<=.25?'var(--red)':pct<=.5?'var(--gold)':'var(--green)';
    return '<span style="color:'+col+'">'+esc(p.name.slice(0,3))+' '+p.hp+'/'+p.hp_max+'</span>';
  }).join('&nbsp; ');
  const activeQ=(state.quests||[]).filter(q=>q.status==='active').length;
  const activeCsq=(state.consequences||[]).filter(c=>!c.resolved).length;
  const locCount=(state.locations||[]).length;
  const npcCount=(state.npcs||[]).filter(n=>n.status==='active').length;
  el.innerHTML=
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'+
      '<span style="font-size:16px">📍</span>'+
      '<div style="flex:1;min-width:0">'+
        '<div style="font-size:14px;font-weight:700;color:var(--gold-bright);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(loc)+'</div>'+
        '<div style="font-size:10px;color:var(--text-dim)">'+(time?esc(time):'')+(time&&weather?' · ':'')+( weather?esc(weather):'')+'</div>'+
      '</div>'+
    '</div>'+
    (mission?'<div style="font-size:11px;color:var(--text);padding:5px 10px;background:var(--surface3);border-left:3px solid var(--gold);border-radius:0 4px 4px 0;margin-bottom:6px">⚔ '+esc(mission)+'</div>':'')+
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:4px">'+
      '<div style="font-size:10px;font-family:var(--mono,monospace);flex:1;min-width:0">'+hpLine+'</div>'+
    '</div>'+
    '<div style="display:flex;gap:4px;flex-wrap:wrap;font-size:9px;color:var(--text-dim)">'+
      (activeQ?'<span>📜 '+activeQ+' quest'+(activeQ>1?'s':'')+'</span>':'')+
      (locCount?'<span>📍 '+locCount+' loc'+(locCount>1?'s':'')+'</span>':'')+
      (npcCount?'<span>👤 '+npcCount+' NPC'+(npcCount>1?'s':'')+'</span>':'')+
      (activeCsq?'<span style="color:var(--red)">⚠ '+activeCsq+'</span>':'')+
    '</div>'+
    '<div style="display:flex;gap:6px;margin-top:8px">'+
      '<span class="journal-chip" onclick="previouslyOn()">📺 Previously On</span>'+
      '<span class="journal-chip" onclick="deepSeed()">🌱 Deep Seed</span>'+
    '</div>';
}
function renderJournalRep(){
  const c=document.getElementById('journal-rep-list');if(!c)return;
  if(!Array.isArray(state.worldData.townReputation))state.worldData.townReputation=[];
  c.innerHTML='';
  if(!state.worldData.townReputation.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px">No towns visited yet.</div>';return;}
  const statuses=['good','neutral','burned','fled'];
  state.worldData.townReputation.forEach((t,i)=>{
    const d=document.createElement('div');
    const statusColor=t.status==='good'?'var(--green)':t.status==='burned'||t.status==='fled'?'var(--red)':'var(--text-dim)';
    d.style.cssText='display:flex;flex-direction:column;gap:4px;padding:8px;border:1px solid var(--border);border-left:3px solid '+statusColor+';border-radius:4px;background:var(--surface2);margin-bottom:6px';
    d.innerHTML=`<div style="display:flex;align-items:center;gap:6px">
        <input type="text" value="${esc(t.town||'')}" style="flex:1;font-size:12px;font-weight:600" placeholder="Town name" onchange="updTown(${i},'town',this.value);renderJournalRep()">
        <select style="width:75px;font-size:10px;padding:3px;border-color:${statusColor};color:${statusColor}" onchange="updTown(${i},'status',this.value);renderJournalRep()">
          ${statuses.map(s=>`<option value="${s}" ${t.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
        <button class="btn sm red icon-btn" onclick="remTown(${i});renderJournalRep()">&times;</button>
      </div>
      <input type="text" value="${esc(t.notes||'')}" style="font-size:11px;color:var(--text)" placeholder="Notes — what happened here..." onchange="updTown(${i},'notes',this.value)">`;
    c.appendChild(d);
  });
}
function sw(k,v){state.worldData[k]=v;save();}
// Flash nav dot to signal AI-triggered state change on a drawer sub-tab
const _tabNavDots={
  'tab-world':'logistics-dot','tab-wagon':'logistics-dot','tab-combat':'logistics-dot',
  'tab-session':'systems-dot','tab-ait':'systems-dot','tab-dev':'systems-dot','tab-setup':'systems-dot'
};
function flashTab(tabId){
  if(tabId===currentTab)return;
  const dotId=_tabNavDots[tabId];
  if(dotId){const d=document.getElementById(dotId);if(d)d.style.display='inline-block';}
}
function clearTabBadge(tabId){
  const dotId=_tabNavDots[tabId];
  if(dotId){const d=document.getElementById(dotId);if(d)d.style.display='none';}
}
function quickSellItem(idx){
  const item=state.wagon.cargo[idx];if(!item)return;
  const catMap={real_stock:'real_stock',potion:'real_stock',snake_oil:'snake_oil',foraged:'reagents',ingredient:'reagents',reagent:'reagents'};
  const cat=catMap[item.type]||'misc';
  openQASheet('💰 Sell: '+item.name,`
    <div class="form-group"><label class="field-label">Item</label><div style="font-size:13px;font-weight:bold;color:var(--text-bright)">${esc(item.name)} <span style="font-size:11px;color:var(--text-dim)">(${item.qty} in stock)</span></div></div>
    <div class="form-row">
      <div class="fg"><label class="field-label">Price (gp)</label><input type="number" id="qs-price" value="1" min="0.01" step="0.01"></div>
      <div class="fg"><label class="field-label">Qty sold</label><input type="number" id="qs-qty" value="1" min="1" max="${item.qty}"></div>
    </div>
    <div class="form-group"><label class="field-label">Category</label>
      <select id="qs-cat">
        <option value="real_stock" ${cat==='real_stock'?'selected':''}>Real Stock</option>
        <option value="snake_oil" ${cat==='snake_oil'?'selected':''}>Snake Oil</option>
        <option value="reagents" ${cat==='reagents'?'selected':''}>Reagents</option>
        <option value="misc" ${cat==='misc'?'selected':''}>Misc</option>
      </select>
    </div>`,
    ()=>{
      const price=parseFloat(document.getElementById('qs-price').value)||0;
      const qty=parseInt(document.getElementById('qs-qty').value)||1;
      const selCat=document.getElementById('qs-cat').value;
      const total=Math.round(price*qty*100)/100;
      if(!total){toast('Enter a price.');return;}
      // Decrement stock
      item.qty-=qty;
      if(item.qty<=0)state.wagon.cargo.splice(idx,1);
      // Log income
      if(!Array.isArray(state.treasuryData.incomeLog))state.treasuryData.incomeLog=[];
      state.treasuryData.incomeLog.push({desc:'Sold '+qty+'× '+item.name,amt:total,type:'in',category:selCat,ts:state.worldData.time});
      state.treasuryData.gp=(parseFloat(state.treasuryData.gp)||0)+total;
      const gEl=document.getElementById('t_gp');if(gEl)gEl.value=state.treasuryData.gp;
      saveRefresh();renderIncome();renderTreasuryTotal();
      closeQAModal();toast('💰 Sold '+qty+'× '+item.name+' for '+total+' gp');
    });
}
function st(k,v){state.treasuryData[k]=isNaN(v)?v:(parseFloat(v)||0);save();renderTreasuryTotal();}
function renderTreasuryTotal(){
  const td=state.treasuryData;
  const total=(parseFloat(td.pp)||0)*10+(parseFloat(td.gp)||0)+(parseFloat(td.ep)||0)*0.5+(parseFloat(td.sp)||0)*0.1+(parseFloat(td.cp)||0)*0.01;
  const el=document.getElementById('treasury-total');
  if(el)el.textContent=total>0?'≈ '+total.toFixed(total%1===0?0:1)+' gp':'';
  renderHUD();
  renderSessionPL();
}
function renderSessionPL(){
  const log=(state.treasuryData.incomeLog||[]).slice(sessionLogIdx);
  if(!log.length){const el=document.getElementById('session-pl');if(el)el.textContent='';return;}
  const earned=log.filter(e=>e.type==='in').reduce((s,e)=>s+(parseFloat(e.amt)||0),0);
  const spent=log.filter(e=>e.type==='out').reduce((s,e)=>s+(parseFloat(e.amt)||0),0);
  const net=earned-spent;
  const el=document.getElementById('session-pl');
  if(el)el.textContent='session ▲'+earned.toFixed(0)+' ▼'+spent.toFixed(0)+' = '+(net>=0?'+':'')+net.toFixed(0)+' gp';
}
function togglePremise(){
  state.worldData.premiseLocked=!state.worldData.premiseLocked;save();updatePremiseUI();
  toast(state.worldData.premiseLocked?'🔒 Premise locked!':'🔓 Premise unlocked.');
}
function updatePremiseUI(){
  const btn=document.getElementById('premise-btn');const ta=document.getElementById('w_premise');
  if(!btn||!ta)return;
  const locked=state.worldData.premiseLocked;
  btn.textContent=locked?'🔒 Locked':'🔓 Unlocked';
  btn.className='lock-btn '+(locked?'locked':'unlocked');
  ta.className='premise-ta'+(locked?' locked':'');
  ta.readOnly=locked;
}

// ═══ NPCs ═══
function renderNPCs(){
  const c=document.getElementById('npc-list');if(!c)return;c.innerHTML='';
  const sorted=[...state.npcs.map((n,i)=>({n,i}))].sort((a,b)=>{
    const rank=s=>s==='deceased'?2:s==='departed'?1:0;
    return rank(a.n.status)-rank(b.n.status);
  });
  const DISPS=['Friendly','Neutral','Hostile','Ally','Enemy','Unknown'];
  if(!sorted.length){c.innerHTML='<div style="font-size:11px;color:var(--text-dim);padding:4px 0">No NPCs recorded.</div>';return;}
  if(sorted.length>3){const bar=document.createElement('div');bar.style.cssText='display:flex;justify-content:flex-end;margin-bottom:4px';bar.innerHTML='<button onclick="dedupNPCs()" style="font-size:9px;padding:2px 8px;border-radius:4px;border:1px solid var(--border);background:none;color:var(--text-dim);cursor:pointer;font-family:var(--sans)">🧹 Dedup</button>';c.appendChild(bar);}
  sorted.forEach(({n,i:idx})=>{
    const dead=n.status==='deceased'||n.status==='departed';
    const dispCol=n.disposition==='Friendly'||n.disposition==='Ally'?'var(--green)':n.disposition==='Hostile'||n.disposition==='Enemy'?'var(--red)':'var(--text-dim)';
    const d=document.createElement('details');
    d.style.cssText=`margin-bottom:5px;border:1px solid var(--border);border-radius:5px;background:var(--surface2);opacity:${dead?'0.6':'1'}`;
    d.innerHTML=`<summary style="cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;padding:6px 8px">
      <span style="flex:1;font-size:12px;font-weight:600;color:var(--text-bright);${dead?'text-decoration:line-through':''};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.name)||'Unnamed'}</span>
      <span style="font-size:10px;color:${dispCol};flex-shrink:0">${esc(n.disposition||'Neutral')}</span>
      ${n.lastSeen?`<span style="font-size:9px;color:var(--gold);cursor:pointer;flex-shrink:0;text-decoration:underline dotted" onclick="event.stopPropagation();var l=(state.locations||[]).find(function(x){return x.name.toLowerCase()==='${esc(n.lastSeen).toLowerCase()}'});if(l)openLocationDetail(l.id);else toast('${esc(n.lastSeen)} not in location journal')">📍 ${esc(n.lastSeen)}</span>`:''}
      ${dead?`<span style="font-size:9px;color:var(--text-dim);padding:1px 4px;border:1px solid var(--border);border-radius:3px;flex-shrink:0">${n.status}</span>`:''}
    </summary>
    <div style="padding:6px 8px 8px;border-top:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
        <input type="text" style="flex:1;font-size:11px" value="${esc(n.name)}" placeholder="Name" onchange="updNPC(${idx},'name',this.value);renderNPCs()">
        <select style="width:78px;font-size:10px;padding:2px 3px;border-color:${dispCol};color:${dispCol}" onchange="updNPC(${idx},'disposition',this.value);renderNPCs()">${DISPS.map(d2=>`<option value="${d2}" ${n.disposition===d2?'selected':''}>${d2}</option>`).join('')}</select>
        <select style="width:72px;font-size:10px;padding:2px 3px" onchange="updNPC(${idx},'status',this.value);renderNPCs()"><option value="active" ${n.status==='active'?'selected':''}>Active</option><option value="deceased" ${n.status==='deceased'?'selected':''}>Deceased</option><option value="departed" ${n.status==='departed'?'selected':''}>Departed</option></select>
        <button class="btn sm red icon-btn" onclick="remNPC(${idx})">&times;</button>
      </div>
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
        <span style="font-size:9px;color:var(--text-dim)">HP</span><input type="number" style="width:42px;font-size:11px;text-align:center" value="${n.hp||0}" onchange="updNPC(${idx},'hp',parseInt(this.value)||0)">
        <input type="text" style="flex:1;font-size:11px" value="${esc(n.lastSeen||'')}" placeholder="Last seen location" onchange="updNPC(${idx},'lastSeen',this.value)">
      </div>
      <input type="text" style="width:100%;font-size:11px;box-sizing:border-box" value="${esc(n.details||'')}" placeholder="Details / notes" onchange="updNPC(${idx},'details',this.value)">
    </div>`;
    c.appendChild(d);
  });
}
function addNPC(){state.npcs.push({name:'',disposition:'Neutral',details:'',status:'active',hp:0,lastSeen:state.worldData.location||''});saveRefresh();}
function updNPC(i,k,v){state.npcs[i][k]=v;save();}
function remNPC(i){const n=state.npcs[i];if(!confirm('Delete NPC '+(n?.name||'#'+(i+1))+'?'))return;state.npcs.splice(i,1);saveRefresh();}
function dedupNPCs(){
  const all=state.npcs||[];if(!all.length){toast('No NPCs to dedup');return;}
  const kept=[];let removed=0;
  all.forEach(n=>{
    const nLow=(n.name||'').toLowerCase().trim();
    if(!nLow){kept.push(n);return;}
    if(kept.some(k=>(k.name||'').toLowerCase().trim()===nLow))removed++;
    else kept.push(n);
  });
  if(!removed){toast('No duplicate NPCs found');return;}
  state.npcs=kept;save();renderNPCs();toast('Removed '+removed+' duplicate NPC'+(removed===1?'':'s'));
}

// ═══ QUESTS ═══
function renderQuests(){
  const c=document.getElementById('quest-list');if(!c)return;c.innerHTML='';
  const all=state.quests||[];
  if(!all.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px 0">No quests. Tap + Quest.</div>';return;}
  const active=all.filter(q=>q.status==='active').length;
  {const hdr=document.createElement('div');hdr.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px';
  hdr.innerHTML=(active?'<span style="font-size:9px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.7px">⬤ '+active+' Active</span>':'<span></span>')
    +(all.length>3?'<button onclick="dedupQuests()" style="font-size:9px;padding:2px 8px;border-radius:4px;border:1px solid var(--border);background:none;color:var(--text-dim);cursor:pointer;font-family:var(--sans)">🧹 Dedup</button>':'');
  c.appendChild(hdr);}
  const locGroups={};const noLoc=[];
  all.forEach((q,i)=>{
    const loc=(q.location||'').trim();
    if(!loc){noLoc.push({q,i});return;}
    if(!locGroups[loc])locGroups[loc]=[];
    locGroups[loc].push({q,i});
  });
  const locOrder=Object.keys(locGroups);
  const allGroups=[...locOrder.map(loc=>({loc,quests:locGroups[loc]}))];
  if(noLoc.length)allGroups.push({loc:'',quests:noLoc});
  allGroups.forEach((group,gi)=>{
    const isLast=gi===allGroups.length-1;
    const locName=group.loc||'Unknown Location';
    const locObj=group.loc?(state.locations||[]).find(l=>l.name.toLowerCase()===group.loc.toLowerCase()):null;
    const rep=(state.worldData.townReputation||[]).find(t=>t.town&&t.town.toLowerCase()===locName.toLowerCase());
    const npcsHere=(state.npcs||[]).filter(n=>n.status==='active'&&n.lastSeen&&n.lastSeen.toLowerCase()===locName.toLowerCase());
    const activeInGroup=group.quests.filter(({q})=>q.status==='active').length;
    const groupEl=document.createElement('div');
    groupEl.style.cssText='display:flex;gap:0;min-height:40px;margin-bottom:'+(isLast?'0':'2')+'px';
    const timeline=document.createElement('div');
    timeline.style.cssText='display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:18px;padding-top:4px';
    timeline.innerHTML=`<div style="width:12px;height:12px;border-radius:50%;flex-shrink:0;background:${activeInGroup?'var(--green)':'var(--surface3)'};border:2px solid ${activeInGroup?'var(--green)':'var(--border-bright)'}"></div>${!isLast?'<div style="width:1px;flex:1;background:var(--border);margin:3px 0"></div>':''}`;
    const content=document.createElement('div');
    content.style.cssText='flex:1;min-width:0;padding-bottom:'+(isLast?'0':'12')+'px;margin-left:6px';
    let locHdr=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:12px;font-weight:700;color:${activeInGroup?'var(--gold-bright)':'var(--text)'};cursor:${locObj?'pointer':'default'}" ${locObj?'onclick="openLocationDetail(\''+locObj.id+'\')"':''}>${esc(locName)}</span>
      <span style="font-size:9px;padding:1px 6px;border-radius:8px;background:${activeInGroup?'var(--gold-dim)':'var(--surface3)'};color:${activeInGroup?'var(--gold-bright)':'var(--text-dim)'};font-weight:700">${group.quests.length}</span>
      ${rep?`<span style="font-size:9px;padding:1px 5px;border-radius:4px;border:1px solid ${rep.status==='good'?'var(--green)':rep.status==='burned'||rep.status==='fled'?'var(--red)':'var(--border)'};color:${rep.status==='good'?'var(--green)':rep.status==='burned'||rep.status==='fled'?'var(--red)':'var(--text-dim)'}">${esc(rep.status)}</span>`:''}
    </div>`;
    if(npcsHere.length){
      locHdr+=`<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:6px">${npcsHere.map(n=>`<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:var(--surface3);border:1px solid var(--green);color:var(--green);cursor:pointer" onclick="var d=document.getElementById('journal-sec-npcs');if(d){d.open=true;d.scrollIntoView({behavior:'smooth'})}">👤 ${esc(n.name)}</span>`).join('')}</div>`;
    }
    content.innerHTML=locHdr;
    group.quests.sort((a,b)=>{const rank=s=>s==='active'?0:s==='failed'?1:2;return rank(a.q.status)-rank(b.q.status);}).forEach(({q,i:idx})=>{
      const qst=q.status||'active';
      const qcol=qst==='done'?'var(--text-dim)':qst==='failed'?'var(--red)':'var(--green)';
      const borderCol=qst==='active'?'var(--gold)':qst==='failed'?'var(--red)':'var(--border)';
      const det=document.createElement('details');det.id='quest-det-'+idx;
      det.style.cssText='margin-bottom:5px;border:1px solid var(--border);border-left:3px solid '+borderCol+';border-radius:6px;background:var(--surface2)';
      const statusBadge=qst==='done'?'<span style="font-size:8px;padding:1px 5px;border-radius:3px;background:var(--surface3);color:var(--text-dim);font-weight:700;flex-shrink:0">COMPLETED</span>'
        :qst==='failed'?'<span style="font-size:8px;padding:1px 5px;border-radius:3px;background:rgba(139,58,42,.3);color:var(--red);font-weight:700;flex-shrink:0">FAILED</span>'
        :'<span style="font-size:8px;padding:1px 5px;border-radius:3px;background:rgba(120,138,115,.2);color:var(--green);font-weight:700;flex-shrink:0">ACTIVE</span>';
      const hiddenBadge=q.hidden?'<span style="font-size:8px;padding:1px 4px;border-radius:3px;background:rgba(139,58,42,.2);color:var(--gold);border:1px solid var(--gold-dim);flex-shrink:0">DM</span>':'';
      det.innerHTML=`<summary style="list-style:none;cursor:pointer;padding:7px 10px;display:flex;align-items:center;gap:6px">
        ${statusBadge}
        <span style="flex:1;font-size:11px;font-weight:500;${qst==='done'?'text-decoration:line-through;color:var(--text-dim)':qst==='failed'?'color:var(--text-dim)':''};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(q.text||'(unnamed quest)')}</span>
        ${hiddenBadge}
      </summary>
      <div style="padding:8px 10px;border-top:1px solid var(--border)">
        <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;align-items:center">
          <select style="width:76px;font-size:10px;padding:3px 4px;border-color:${qcol};color:${qcol}" onchange="updQ(${idx},'status',this.value)"><option value="active" ${qst==='active'?'selected':''}>Active</option><option value="done" ${qst==='done'?'selected':''}>Done</option><option value="failed" ${qst==='failed'?'selected':''}>Failed</option></select>
          <button title="${q.hidden?'Reveal':'Hide'}" onclick="updQ(${idx},'hidden',${!q.hidden})" style="font-size:13px;padding:1px 5px;background:none;border:1px solid var(--border);border-radius:4px;cursor:pointer;color:${q.hidden?'var(--gold)':'var(--text-dim)'}">👁</button>
          <input type="text" value="${esc(q.location||'')}" placeholder="Location" style="width:90px;font-size:10px" onchange="updQ(${idx},'location',this.value)">
          <button class="btn sm red icon-btn" onclick="remQ(${idx})" style="margin-left:auto">&times;</button>
        </div>
        <input type="text" value="${esc(q.text||'')}" style="font-size:11px;width:100%;box-sizing:border-box;margin-bottom:6px" placeholder="Quest objective..." onchange="updQ(${idx},'text',this.value)">
        ${q.discovery?`<div style="margin-bottom:6px;padding:6px 8px;background:var(--bg);border-radius:4px;border-left:3px solid var(--gold-dim)"><div style="font-size:9px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;display:flex;justify-content:space-between;align-items:center"><span>📖 ${esc(q.discovery.ts||'')}</span>${q.chatMsgId?`<button onclick="viewQuestInChat(${JSON.stringify(q.chatMsgId)})" style="font-size:9px;background:none;border:1px solid var(--gold-dim);border-radius:3px;color:var(--gold);padding:1px 5px;cursor:pointer">↗ Chat</button>`:''}</div><div style="font-size:10px;color:var(--text);line-height:1.4;font-style:italic">${esc(q.discovery.text||'')}</div></div>`:''}
        <div class="form-group" style="margin-bottom:0"><label class="field-label">Notes</label><textarea style="min-height:40px;font-size:11px" onchange="updQ(${idx},'notes',this.value)">${esc(q.notes||'')}</textarea></div>
      </div>`;
      content.appendChild(det);
    });
    groupEl.appendChild(timeline);
    groupEl.appendChild(content);
    c.appendChild(groupEl);
  });
}
function addQuest(){state.quests.push({text:'',status:'active',hidden:false});saveRefresh();}
function viewQuestInChat(msgId){
  navTo('log');
  setTimeout(()=>{
    const el=msgId?document.querySelector('[data-msg-id="'+msgId+'"]'):null;
    if(!el){toast('That chat moment was archived in the session summary.');return;}
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.style.outline='2px solid var(--gold)';
    el.style.borderRadius='4px';
    setTimeout(()=>{el.style.outline='';el.style.borderRadius='';},2500);
  },250);
}
function updQ(i,k,v){state.quests[i][k]=v;saveRefresh();}
function remQ(i){state.quests.splice(i,1);saveRefresh();}
function dedupQuests(){
  const all=state.quests||[];if(!all.length){toast('No quests to dedup');return;}
  const kept=[];let removed=0;
  all.forEach(q=>{
    const qLow=(q.text||'').toLowerCase().slice(0,40);
    if(!qLow){kept.push(q);return;}
    const isDupe=kept.some(k=>{
      const kLow=(k.text||'').toLowerCase().slice(0,40);
      if(kLow===qLow)return true;
      const words=qLow.split(/\s+/).filter(w=>w.length>3);
      if(words.length<2)return false;
      return words.filter(w=>kLow.includes(w)).length/words.length>=0.6;
    });
    if(isDupe)removed++;else kept.push(q);
  });
  if(!removed){toast('No duplicate quests found');return;}
  state.quests=kept;save();renderQuests();toast('Removed '+removed+' duplicate quest'+(removed===1?'':'s'));
}

// ═══ CONSEQUENCES ═══
const CSQ_COLORS={background:'var(--text-dim)',faction:'var(--gold)',personal:'var(--green)',escalation:'var(--red)'};
const CSQ_TYPES=['background','faction','personal','escalation'];
function renderConsequences(){
  const c=document.getElementById('consequence-list');if(!c)return;c.innerHTML='';
  const all=state.consequences||[];
  const active=all.filter(cs=>!cs.resolved);
  const resolved=all.filter(cs=>cs.resolved);
  if(!active.length&&!resolved.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px 0">No consequences yet. The AI logs ripple effects here.</div>';return;}
  if(all.length>3){
    const bar=document.createElement('div');bar.style.cssText='display:flex;justify-content:flex-end;margin-bottom:6px';
    bar.innerHTML='<button onclick="dedupConsequences()" style="font-size:9px;padding:2px 8px;border-radius:4px;border:1px solid var(--border);background:none;color:var(--text-dim);cursor:pointer;font-family:var(--sans)">🧹 Dedup</button>';
    c.appendChild(bar);
  }
  const render=(cs,arrIdx,isResolved)=>{
    const realIdx=all.indexOf(cs);
    const col=CSQ_COLORS[cs.type]||'var(--text-dim)';
    const det=document.createElement('details');
    det.style.cssText=`margin-bottom:5px;border:1px solid var(--border);border-left:3px solid ${col};border-radius:6px;background:var(--surface2);${isResolved?'opacity:.5':''}`;
    det.innerHTML=`<summary style="list-style:none;cursor:pointer;padding:6px 8px;display:flex;align-items:center;gap:6px">
      <span style="font-size:10px;font-weight:700;color:${col};text-transform:uppercase;letter-spacing:.5px;flex-shrink:0">${cs.type||'background'}</span>
      <span style="flex:1;font-size:11px;color:${isResolved?'var(--text-dim)':'var(--text)'};${isResolved?'text-decoration:line-through':''};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(cs.text)}</span>
      ${cs.location?`<span style="font-size:9px;color:var(--text-dim);flex-shrink:0">📍 ${esc(cs.location)}</span>`:''}
      ${!isResolved?`<button onclick="event.stopPropagation();resolveConsequence('${cs.id}')" style="flex-shrink:0;font-size:12px;padding:4px 10px;background:none;border:1px solid var(--border);border-radius:4px;color:var(--text-dim);cursor:pointer;min-height:28px" title="Mark resolved" aria-label="Resolve consequence">✓</button>`:''}
    </summary>
    <div style="padding:8px 10px;border-top:1px solid var(--border)">
      <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;align-items:center">
        <select style="width:90px;font-size:10px;padding:3px;border-color:${col};color:${col}" onchange="updConsequence(${realIdx},'type',this.value)">${CSQ_TYPES.map(t=>`<option value="${t}" ${cs.type===t?'selected':''}>${t}</option>`).join('')}</select>
        <input type="text" value="${esc(cs.location||'')}" placeholder="Location" style="width:90px;font-size:10px" onchange="updConsequence(${realIdx},'location',this.value)">
        <button class="btn sm red icon-btn" onclick="remConsequence(${realIdx})" style="margin-left:auto" title="Delete" aria-label="Delete consequence">&times;</button>
      </div>
      <textarea style="font-size:11px;width:100%;box-sizing:border-box;min-height:50px" onchange="updConsequence(${realIdx},'text',this.value)">${esc(cs.text||'')}</textarea>
      ${cs.ts?`<div style="font-size:9px;color:var(--text-dim);margin-top:3px">${esc(cs.ts)}</div>`:''}
      ${cs.resolvedTs?`<div style="font-size:9px;color:var(--text-dim);margin-top:2px">Resolved: ${esc(cs.resolvedTs)}</div>`:''}
    </div>`;
    return det;
  };
  active.forEach((cs,i)=>c.appendChild(render(cs,i,false)));
  if(resolved.length){
    const det=document.createElement('details');
    det.style.cssText='margin-top:8px';
    const sum=document.createElement('summary');sum.style.cssText='font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;cursor:pointer;list-style:none;padding:4px 0';sum.textContent='▶ Resolved ('+resolved.length+')';
    det.appendChild(sum);
    const clearBar=document.createElement('div');clearBar.style.cssText='display:flex;justify-content:flex-end;padding:4px 0';
    clearBar.innerHTML='<button onclick="clearResolvedConsequences()" style="font-size:10px;padding:4px 10px;border-radius:4px;border:1px solid var(--red-dim);background:none;color:var(--red);cursor:pointer;font-family:var(--sans);min-height:28px" aria-label="Clear all resolved consequences">🗑 Clear resolved</button>';
    det.appendChild(clearBar);
    resolved.forEach((cs,i)=>det.appendChild(render(cs,active.length+i,true)));
    c.appendChild(det);
  }
}
function addConsequence(){
  if(!Array.isArray(state.consequences))state.consequences=[];
  state.consequences.push({id:'csq_'+Date.now(),text:'',type:'background',resolved:false,ts:state.worldData.time,location:state.worldData.location||''});
  save();renderConsequences();
}
function updConsequence(i,k,v){if(state.consequences[i]){state.consequences[i][k]=v;save();renderConsequences();}}
function remConsequence(i){if(!confirm('Delete this consequence?'))return;state.consequences.splice(i,1);save();renderConsequences();}
function resolveConsequence(id){
  const cs=state.consequences.find(c=>c.id===id);
  if(cs){cs.resolved=true;cs.resolvedTs=new Date().toLocaleString();save();renderConsequences();toast('✓ Consequence resolved.');}
}
function clearResolvedConsequences(){
  const resolved=(state.consequences||[]).filter(c=>c.resolved);
  if(!resolved.length){toast('No resolved consequences to clear.');return;}
  if(!confirm('Delete '+resolved.length+' resolved consequence'+(resolved.length===1?'':'s')+'? This cannot be undone.'))return;
  state.consequences=(state.consequences||[]).filter(c=>!c.resolved);
  save();renderConsequences();toast('✓ Cleared '+resolved.length+' resolved consequence'+(resolved.length===1?'':'s'));
}
function dedupConsequences(){
  const all=state.consequences||[];
  if(!all.length){toast('No consequences to dedup');return;}
  const kept=[];
  let removed=0;
  all.forEach(c=>{
    const cWords=(c.text||'').toLowerCase().split(/\s+/).filter(w=>w.length>3);
    const isDupe=kept.some(k=>{
      const kLow=(k.text||'').toLowerCase();
      const cLow=(c.text||'').toLowerCase();
      if(kLow===cLow)return true;
      if(!cWords.length)return false;
      const hits=cWords.filter(w=>kLow.includes(w)).length;
      return hits/cWords.length>=0.5;
    });
    if(isDupe)removed++;
    else kept.push(c);
  });
  if(!removed){toast('No duplicates found');return;}
  state.consequences=kept;
  save();renderConsequences();
  toast('Removed '+removed+' duplicate consequence'+(removed===1?'':'s'));
}

// ═══ PARTY INVENTORY ═══
let _piFilter='all';
let _piEditIdx=null;
function renderPartyInv(){
  const c=document.getElementById('party-inv');if(!c)return;c.innerHTML='';
  const all=state.partyInventory||[];
  const TYPE_ICON={supply:'📦',foraged:'🌿',ingredient:'⚗',trade:'💰',loot:'✨',hoard:'💎',misc:'📋',key:'🗝'};
  const groups={};
  all.forEach((item,idx)=>{const t=item.type||'misc';if(!groups[t])groups[t]=[];groups[t].push({item,idx});});
  const filters=['all',...ITYPES.filter(t=>groups[t])];
  const bar=document.createElement('div');
  bar.style.cssText='display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px';
  filters.forEach(f=>{
    const cnt=f==='all'?all.length:(groups[f]||[]).length;
    const b=document.createElement('button');
    b.textContent=(f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1))+' '+cnt;
    b.style.cssText=`font-size:10px;padding:3px 9px;border-radius:10px;border:1px solid ${_piFilter===f?'var(--gold)':'var(--border)'};background:${_piFilter===f?'var(--gold-dim)':'none'};color:${_piFilter===f?'var(--gold-bright)':'var(--text-dim)'};cursor:pointer;font-family:var(--sans)`;
    b.onclick=()=>{_piFilter=f;renderPartyInv();};
    bar.appendChild(b);
  });
  c.appendChild(bar);
  const visibleGroups=_piFilter==='all'?Object.keys(groups).sort():groups[_piFilter]?[_piFilter]:[];
  if(!visibleGroups.length){const e=document.createElement('div');e.style.cssText='color:var(--text-dim);font-size:11px;padding:6px 0';e.textContent=_piFilter==='all'?'No party items. Tap + Add Item.':'No '+_piFilter+' items.';c.appendChild(e);return;}
  visibleGroups.forEach(type=>{
    const items=groups[type]||[];if(!items.length)return;
    const sec=document.createElement('div');sec.style.cssText='margin-bottom:8px';
    if(_piFilter==='all'&&visibleGroups.length>1){
      const hdr=document.createElement('div');hdr.style.cssText='font-size:10px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.5px;padding:4px 0 3px';
      hdr.textContent=(TYPE_ICON[type]||'')+' '+type;sec.appendChild(hdr);
    }
    const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-wrap:wrap;gap:4px';
    items.forEach(({item,idx})=>{
      const isEdit=_piEditIdx===idx;
      const chip=document.createElement('div');
      if(isEdit){
        chip.style.cssText='background:var(--surface2);border:1px solid var(--gold);border-radius:6px;padding:6px 8px;width:100%';
        chip.innerHTML=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><input type="text" value="${esc(item.name||'')}" style="flex:1;font-weight:600;font-size:12px;color:var(--text-bright);background:none;border:none;border-bottom:1px solid var(--border);padding:1px 0;min-width:0" placeholder="Item name" onchange="updPI(${idx},'name',this.value)"><button class="btn sm" onclick="closeInvEdit()" style="font-size:10px;padding:2px 6px">✓</button><button class="btn sm red" onclick="remPI(${idx})" style="font-size:10px;padding:2px 6px">✕</button></div>`
          +`<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><select style="font-size:10px;padding:2px 5px;border-radius:10px;border:1px solid var(--border-bright);background:var(--surface3);color:var(--text-dim)" onchange="updPI(${idx},'type',this.value)">${ITYPES.map(t=>`<option value="${t}" ${item.type===t?'selected':''}>${t}</option>`).join('')}</select><span style="font-size:10px;color:var(--text-dim)">×</span><input type="number" value="${item.qty||1}" style="width:36px;font-size:11px" onchange="updPI(${idx},'qty',parseInt(this.value)||1)"><span style="font-size:10px;color:var(--text-dim)">·</span><input type="number" value="${item.weight||0}" style="width:40px;font-size:11px" onchange="updPI(${idx},'weight',parseFloat(this.value)||0)"><span style="font-size:9px;color:var(--text-dim)">lb</span></div>`
          +`<input type="text" value="${esc(item.notes||'')}" style="width:100%;font-size:11px;color:var(--text-dim);margin-top:4px;background:none;border:none;border-bottom:1px solid var(--border);padding:1px 0" placeholder="notes…" onchange="updPI(${idx},'notes',this.value)">`;
      }else{
        const name=item.name||'(unnamed)';
        const truncName=name.length>18?name.slice(0,17)+'…':name;
        const qtyBadge=item.qty>1?'<span style="font-size:9px;color:var(--gold);font-weight:700;margin-left:2px">×'+item.qty+'</span>':'';
        chip.style.cssText='display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border:1px solid var(--border);border-radius:8px;font-size:11px;color:var(--text-bright);background:var(--surface2);cursor:pointer;max-width:100%;transition:border-color .15s';
        chip.title=name+(item.notes?' — '+item.notes:'');
        chip.onclick=()=>{_piEditIdx=idx;renderPartyInv();};
        chip.innerHTML=truncName+qtyBadge;
      }
      wrap.appendChild(chip);
    });
    sec.appendChild(wrap);c.appendChild(sec);
  });
}
function closeInvEdit(){_piEditIdx=null;renderPartyInv();}
function addPartyItem(){if(!state.partyInventory)state.partyInventory=[];state.partyInventory.push({name:'',qty:1,weight:0,type:'supply',notes:''});_piEditIdx=state.partyInventory.length-1;save();renderPartyInv();}
function updPI(i,k,v){state.partyInventory[i][k]=v;save();}
function remPI(i){state.partyInventory.splice(i,1);_piEditIdx=null;save();renderPartyInv();}

// ═══ INCOME LOG ═══
let _incomeEditIdx=null;
function renderIncome(){
  const c=document.getElementById('income-log');if(!c)return;c.innerHTML='';
  const log=state.treasuryData.incomeLog||[];
  log.slice().reverse().forEach((e,ri)=>{
    const realIdx=log.length-1-ri;
    const d=document.createElement('div');
    d.className='income-row income-'+(e.type==='in'?'in':'out');
    d.style.cursor='pointer';
    if(_incomeEditIdx===realIdx){
      d.style.cssText='display:flex;flex-direction:column;gap:4px;padding:6px 8px;border:1px solid var(--gold);border-radius:4px;background:var(--surface2);margin-bottom:4px';
      d.innerHTML=`<input type="text" value="${esc(e.desc)}" style="font-size:11px" placeholder="Description" onchange="updIncome(${realIdx},'desc',this.value)">
        <div style="display:flex;gap:6px;align-items:center">
          <input type="number" value="${e.amt}" style="width:70px;font-size:11px" min="0" onchange="updIncome(${realIdx},'amt',parseFloat(this.value)||0)">
          <span style="font-size:10px;color:var(--text-dim)">gp</span>
          <select style="font-size:10px;width:60px" onchange="updIncome(${realIdx},'type',this.value)"><option value="in" ${e.type==='in'?'selected':''}>In</option><option value="out" ${e.type!=='in'?'selected':''}>Out</option></select>
          <button class="btn sm red" onclick="removeIncomeEntry(${realIdx})" style="margin-left:auto">Delete</button>
          <button class="btn sm" onclick="closeIncomeEdit()">Done</button>
        </div>`;
    }else{
      d.innerHTML=`<span>${esc(e.desc)}</span><span style="color:${e.type==='in'?'var(--green-bright)':'var(--red)'};font-weight:bold">${e.type==='in'?'+':'−'}${e.amt} gp</span>`;
      d.onclick=()=>{_incomeEditIdx=realIdx;renderIncome();};
    }
    c.appendChild(d);
  });
}
function closeIncomeEdit(){_incomeEditIdx=null;renderIncome();}
function updIncome(idx,key,val){
  const log=state.treasuryData.incomeLog;if(!log||!log[idx])return;
  const e=log[idx];
  if(key==='amt'){
    const oldAmt=e.amt;const diff=val-oldAmt;
    if(e.type==='in')state.treasuryData.gp=Math.max(0,(parseFloat(state.treasuryData.gp)||0)+diff);
    else state.treasuryData.gp=Math.max(0,(parseFloat(state.treasuryData.gp)||0)-diff);
    const gpEl=document.getElementById('t_gp');if(gpEl)gpEl.value=state.treasuryData.gp;
    renderTreasuryTotal();
  }
  e[key]=val;save();renderIncome();
}
function removeIncomeEntry(idx){
  _incomeEditIdx=null;
  const log=state.treasuryData.incomeLog;if(!log||!log[idx])return;
  const e=log[idx];
  if(!confirm('Delete "'+e.desc+' '+(e.type==='in'?'+':'−')+e.amt+'gp"?\nThis will adjust the treasury.'))return;
  if(e.type==='in')state.treasuryData.gp=Math.max(0,(parseFloat(state.treasuryData.gp)||0)-e.amt);
  else state.treasuryData.gp=(parseFloat(state.treasuryData.gp)||0)+e.amt;
  log.splice(idx,1);
  const gpEl=document.getElementById('t_gp');if(gpEl)gpEl.value=state.treasuryData.gp;
  save();renderIncome();renderTreasuryTotal();toast('✓ Entry removed, treasury adjusted.');
}
function addIncome(){
  const desc=document.getElementById('inc-desc').value.trim();
  const amt=parseFloat(document.getElementById('inc-amt').value)||0;
  const type=document.getElementById('inc-type').value;
  if(!desc||!amt)return;
  if(!state.treasuryData.incomeLog)state.treasuryData.incomeLog=[];
  state.treasuryData.incomeLog.push({desc,amt,type,ts:state.worldData.time});
  const cur=parseFloat(state.treasuryData.gp)||0;
  state.treasuryData.gp=type==='in'?cur+amt:Math.max(0,cur-amt);
  document.getElementById('inc-desc').value='';document.getElementById('inc-amt').value='';
  document.getElementById('t_gp').value=state.treasuryData.gp;
  save();renderIncome();renderTreasuryTotal();toast('✓ Entry logged.');
}

// ═══ WAGON ═══
function renderTravelLog(){
  const c=document.getElementById('travel-log-visual');if(!c)return;
  const log=state.worldData.travelLog||[];
  if(!log.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;font-style:italic">No travel recorded yet.</div>';return;}
  const _locMatch=(name,target)=>name&&target&&name.toLowerCase().includes(target.toLowerCase());
  const reversed=[...log].reverse();
  c.innerHTML=reversed.map((entry,i)=>{
    const isLast=i===0;
    const colIdx=entry.indexOf(':');
    let ts='',rest=entry;
    if(colIdx>-1&&colIdx<30){ts=entry.slice(0,colIdx).trim();rest=entry.slice(colIdx+1).trim();}
    const arrowIdx=rest.indexOf('→');
    const from=arrowIdx>-1?rest.slice(0,arrowIdx).trim():'';
    const afterArrow=arrowIdx>-1?rest.slice(arrowIdx+1).trim():rest;
    const pipeIdx=afterArrow.indexOf(' | ');
    const dest=pipeIdx>-1?afterArrow.slice(0,pipeIdx).trim():afterArrow;
    const note=pipeIdx>-1?afterArrow.slice(pipeIdx+3).trim():'';
    const label=isLast?(from?dest:dest)+' ← now':dest||from;
    const locName=dest||from;
    let chips='';
    if(locName){
      const quests=(state.quests||[]).filter(q=>_locMatch(q.location,locName));
      const npcs=(state.npcs||[]).filter(n=>_locMatch(n.lastSeen,locName)&&n.status==='active');
      const rep=(state.worldData.townReputation||[]).find(t=>_locMatch(t.town,locName));
      quests.forEach(q=>{
        const qIdx=(state.quests||[]).indexOf(q);
        const col=q.status==='done'?'var(--text-dim)':q.status==='failed'?'var(--red)':'var(--gold)';
        const icon=q.status==='done'?'✓':q.status==='failed'?'✗':'📜';
        chips+=`<span onclick="event.stopPropagation();var d=document.getElementById('journal-sec-quests');if(d)d.open=true;var e=document.getElementById('quest-det-${qIdx}');if(e){e.open=true;e.scrollIntoView({behavior:'smooth',block:'center'});e.style.outline='2px solid var(--gold)';setTimeout(function(){e.style.outline=''},2200)}" style="cursor:pointer;font-size:9px;padding:2px 6px;border-radius:8px;background:var(--surface3);border:1px solid ${col};color:${col};white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis">${icon} ${esc((q.text||'').split('|')[0].slice(0,30))}</span>`;
      });
      npcs.forEach(n=>{
        chips+=`<span onclick="event.stopPropagation();var d=document.getElementById('journal-sec-npcs');if(d){d.open=true;d.scrollIntoView({behavior:'smooth'})}" style="cursor:pointer;font-size:9px;padding:2px 6px;border-radius:8px;background:var(--surface3);border:1px solid var(--green);color:var(--green);white-space:nowrap">👤 ${esc(n.name.slice(0,20))}</span>`;
      });
      if(rep){
        const rc=rep.status==='good'?'var(--green)':rep.status==='burned'||rep.status==='fled'?'var(--red)':'var(--text-dim)';
        chips+=`<span onclick="event.stopPropagation();var d=document.getElementById('journal-sec-rep');if(d){d.open=true;d.scrollIntoView({behavior:'smooth'})}" style="cursor:pointer;font-size:9px;padding:2px 6px;border-radius:8px;background:var(--surface3);border:1px solid ${rc};color:${rc};white-space:nowrap">🏘 ${esc(rep.status)}</span>`;
      }
    }
    return `<div style="display:flex;gap:8px;min-height:${isLast?'32':'42'}px">
      <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:14px;padding-top:2px">
        <div style="width:10px;height:10px;border-radius:50%;flex-shrink:0;background:${isLast?'var(--gold)':'var(--surface3)'};border:2px solid ${isLast?'var(--gold-bright)':'var(--border-bright)'}"></div>
        ${!isLast?`<div style="width:1px;flex:1;background:var(--border);margin:3px 0"></div>`:''}
      </div>
      <div style="padding-bottom:${isLast?'0':'10'}px;min-width:0;flex:1">
        ${ts?`<div style="font-size:9px;color:var(--text-dim);letter-spacing:.3px;margin-bottom:1px">${esc(ts)}</div>`:''}
        <div style="font-size:12px;font-weight:${isLast?'600':'400'};color:${isLast?'var(--gold-bright)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(label)}</div>
        ${chips?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:3px">${chips}</div>`:''}
        ${note?`<div style="font-size:10px;color:var(--text-dim);font-style:italic;margin-top:2px">${esc(note)}</div>`:''}
      </div>
    </div>`;
  }).join('');
  c.scrollTop=0;
}
function renderWagon(){renderCapacity();renderCells();renderCargo();renderHoard();}
function calcWeight(){
  let w=0;
  (state.wagon.cargo||[]).forEach(i=>w+=(parseFloat(i.weight)||0)*(parseInt(i.qty)||1));
  (state.wagon.hoard||[]).forEach(i=>w+=(parseFloat(i.weight)||0)*(parseInt(i.qty)||1));
  (state.wagon.cells||[]).forEach(c=>w+=(parseFloat(c.weight)||0));
  return w;
}
function renderCapacity(){
  const maxLb=getMaxLb();const w=calcWeight();const pct=Math.min(100,(w/maxLb)*100);
  const fill=document.getElementById('cap-fill');const lbl=document.getElementById('cap-lbl');const warn=document.getElementById('cap-warn');
  if(fill){fill.style.width=pct+'%';fill.style.background=pct>100?'var(--red)':pct>50?'var(--gold)':'var(--green)';}
  if(lbl)lbl.textContent=w.toFixed(1)+' / '+maxLb+' lb ('+Math.round(pct)+'%)';
  if(warn)warn.style.display=w>maxLb/2?'block':'none';
  const capInput=document.getElementById('wagon-cap-input');if(capInput)capInput.value=maxLb;
  const thresh=document.getElementById('cap-thresholds');if(thresh)thresh.textContent='Encumbered >'+Math.round(maxLb/2)+' lb (−10ft) | Heavy >'+maxLb+' lb (−20ft, disadvantage on Str/Dex/Con)';
}
function renderCells(){
  const c=document.getElementById('holding-cells');if(!c)return;
  if(!(state.wagon.cells||[]).length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px">No holding cells.</div>';return;}
  c.innerHTML='';
  (state.wagon.cells||[]).forEach((cell,idx)=>{
    const d=document.createElement('div');d.className='cell-item '+(cell.temperament||'hostile');
    d.innerHTML=`<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
      <input type="text" value="${esc(cell.name||'')}" placeholder="Creature name" style="flex:2;min-width:80px;font-size:11px" onchange="updCell(${idx},'name',this.value)">
      <select style="width:75px;font-size:11px;padding:3px" onchange="updCell(${idx},'size',this.value)"><option ${cell.size==='Tiny'?'selected':''}>Tiny</option><option ${cell.size==='Small'?'selected':''}>Small</option><option ${'Medium'===cell.size||!cell.size?'selected':''}>Medium</option><option ${cell.size==='Large'?'selected':''}>Large</option><option ${cell.size==='Huge'?'selected':''}>Huge</option></select>
      <select style="width:80px;font-size:11px;padding:3px" onchange="updCell(${idx},'temperament',this.value);renderCells()"><option value="hostile" ${cell.temperament==='hostile'||!cell.temperament?'selected':''}>Hostile</option><option value="sedated" ${cell.temperament==='sedated'?'selected':''}>Sedated</option><option value="tamed" ${cell.temperament==='tamed'?'selected':''}>Tamed</option></select>
      <button class="btn sm red icon-btn" onclick="remCell(${idx})">&times;</button>
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap">
      <div style="flex:1"><label class="field-label">Escape DC</label><input type="text" value="${esc(cell.escDC||'')}" placeholder="DC 14" style="font-size:11px" onchange="updCell(${idx},'escDC',this.value)"></div>
      <div style="width:70px"><label class="field-label">Weight lb</label><input type="number" value="${cell.weight||0}" style="font-size:11px" onchange="updCell(${idx},'weight',parseFloat(this.value)||0);renderCapacity()"></div>
      <div style="flex:2"><label class="field-label">Notes</label><input type="text" value="${esc(cell.notes||'')}" style="font-size:11px" onchange="updCell(${idx},'notes',this.value)"></div>
    </div>`;
    c.appendChild(d);
  });
}
function addCell(){if(!state.wagon.cells)state.wagon.cells=[];state.wagon.cells.push({name:'',size:'Medium',temperament:'hostile',escDC:'DC 14',weight:0,notes:''});save();renderCells();}
function updCell(i,k,v){state.wagon.cells[i][k]=v;save();}
function remCell(i){state.wagon.cells.splice(i,1);save();renderCells();renderCapacity();}

let _cargoFilter='all';let _cargoEditIdx=null;
let _hoardEditIdx=null;let _cargoPCFilter=null;
let _invSearch='';
function _setInvSearch(v){_invSearch=v;renderCargo();renderHoard();requestAnimationFrame(()=>{const si=document.getElementById('inv-search');if(si){si.focus();si.setSelectionRange(v.length,v.length);}});}
function _renderInvChips(containerId,items,listType,editIdx,setEditIdx,filterState,setFilterFn,emptyMsg,searchTerm){
  const c=document.getElementById(containerId);if(!c)return;c.innerHTML='';
  const TYPE_ICON={supply:'📦',foraged:'🌿',ingredient:'⚗',trade:'💰',loot:'✨',hoard:'💎',misc:'📋',key:'🗝'};
  const groups={};
  const sq=searchTerm?searchTerm.toLowerCase():'';
  items.forEach((item,idx)=>{
    if(sq&&!(item.name||'').toLowerCase().includes(sq)&&!(item.notes||'').toLowerCase().includes(sq))return;
    const tags=(item.type||'misc').split(',').map(t=>t.trim());tags.forEach(t=>{if(!groups[t])groups[t]=[];groups[t].push({item,idx});});
  });
  const filters=['all',...ITYPES.filter(t=>groups[t])];
  if(filters.length>2){
    const bar=document.createElement('div');bar.style.cssText='display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px';
    filters.forEach(f=>{
      const cnt=f==='all'?items.length:(groups[f]||[]).length;
      const b=document.createElement('button');
      b.textContent=(f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1))+' '+cnt;
      b.style.cssText=`font-size:10px;padding:3px 9px;border-radius:10px;border:1px solid ${filterState===f?'var(--gold)':'var(--border)'};background:${filterState===f?'var(--gold-dim)':'none'};color:${filterState===f?'var(--gold-bright)':'var(--text-dim)'};cursor:pointer;font-family:var(--sans)`;
      b.onclick=()=>setFilterFn(f);
      bar.appendChild(b);
    });
    c.appendChild(bar);
  }
  const visibleGroups=filterState==='all'?Object.keys(groups).sort():groups[filterState]?[filterState]:[];
  if(!visibleGroups.length){const e=document.createElement('div');e.style.cssText='color:var(--text-dim);font-size:11px;padding:6px 0';e.textContent=emptyMsg;c.appendChild(e);return;}
  const sellable=listType==='cargo';
  visibleGroups.forEach(type=>{
    const grp=groups[type]||[];if(!grp.length)return;
    const sec=document.createElement('div');sec.style.cssText='margin-bottom:8px';
    if(filterState==='all'&&visibleGroups.length>1){
      const hdr=document.createElement('div');hdr.style.cssText='font-size:10px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.5px;padding:4px 0 3px';
      hdr.textContent=(TYPE_ICON[type]||'')+' '+type;sec.appendChild(hdr);
    }
    const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-wrap:wrap;gap:4px';
    grp.forEach(({item,idx})=>{
      const isEdit=editIdx===idx;
      const chip=document.createElement('div');
      if(isEdit){
        chip.style.cssText='background:var(--surface2);border:1px solid var(--gold);border-radius:6px;padding:6px 8px;width:100%';
        chip.innerHTML=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><input type="text" value="${esc(item.name||'')}" style="flex:1;font-weight:600;font-size:12px;color:var(--text-bright);background:none;border:none;border-bottom:1px solid var(--border);padding:1px 0;min-width:0" placeholder="Item name" onchange="updWItem('${listType}',${idx},'name',this.value)">${sellable?`<button class="btn sm gold" onclick="quickSellItem(${idx})" style="font-size:10px;padding:2px 7px;border-radius:8px" title="Quick sell">💰</button>`:''}<button class="btn sm" onclick="closeWEdit('${listType}')" style="font-size:10px;padding:2px 6px">✓</button><button class="btn sm red" onclick="remWItem('${listType}',${idx})" style="font-size:10px;padding:2px 6px">✕</button></div>`
          +`<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><div style="display:flex;gap:3px;flex-wrap:wrap">${ITYPES.filter(t=>t!=='hoard').map(t=>{const tags=(item.type||'misc').split(',').map(s=>s.trim());const checked=tags.includes(t);return`<label style="font-size:9px;color:${checked?'var(--gold-bright)':'var(--text-dim)'};display:flex;align-items:center;gap:1px;cursor:pointer"><input type="checkbox" ${checked?'checked':''} onchange="toggleItemTag('${listType}',${idx},'${t}')" style="width:11px;height:11px">${t}</label>`;}).join('')}</div><span style="font-size:10px;color:var(--text-dim)">×</span><input type="number" value="${item.qty||1}" style="width:36px;font-size:11px" onchange="updWItem('${listType}',${idx},'qty',parseInt(this.value)||1)"><span style="font-size:10px;color:var(--text-dim)">·</span><input type="number" value="${item.weight||0}" style="width:40px;font-size:11px" onchange="updWItem('${listType}',${idx},'weight',parseFloat(this.value)||0);renderCapacity()"><span style="font-size:9px;color:var(--text-dim)">lb</span></div>`
          +`<input type="text" value="${esc(item.notes||'')}" style="width:100%;font-size:11px;color:var(--text-dim);margin-top:4px;background:none;border:none;border-bottom:1px solid var(--border);padding:1px 0" placeholder="notes…" onchange="updWItem('${listType}',${idx},'notes',this.value)">`;
      }else{
        const name=item.name||'(unnamed)';
        const truncName=name.length>18?name.slice(0,17)+'…':name;
        const qtyBadge=item.qty>1?'<span style="font-size:9px;color:var(--gold);font-weight:700;margin-left:2px">×'+item.qty+'</span>':'';
        const wBadge=item.weight?'<span style="font-size:9px;color:var(--text-dim);margin-left:1px">'+item.weight+'lb</span>':'';
        chip.style.cssText='display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border:1px solid var(--border);border-radius:8px;font-size:11px;color:var(--text-bright);background:var(--surface2);cursor:pointer;max-width:100%;transition:border-color .15s';
        chip.title=name+(item.notes?' — '+item.notes:'')+(item.weight?' ('+item.weight+' lb)':'');
        chip.onclick=()=>{setEditIdx(idx);};
        chip.innerHTML=truncName+qtyBadge+wBadge;
      }
      wrap.appendChild(chip);
    });
    sec.appendChild(wrap);c.appendChild(sec);
  });
}
function setCargoPCFilter(name){_cargoPCFilter=_cargoPCFilter===name?null:name;_cargoEditIdx=null;renderCargo();}
function renderCargo(){
  const c=document.getElementById('wagon-cargo');if(!c)return;
  const pcs=state.pcs||[];
  let html='<div style="position:relative;margin-bottom:8px"><input type="text" id="inv-search" value="'+esc(_invSearch)+'" placeholder="🔍 Search items…" oninput="_setInvSearch(this.value)" style="width:100%;font-size:11px;padding:6px 10px;padding-right:28px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text-bright);font-family:var(--sans);box-sizing:border-box">';
  if(_invSearch)html+='<button onclick="_setInvSearch(\'\')" style="position:absolute;right:4px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:13px;padding:2px 4px" title="Clear search">✕</button>';
  html+='</div>';
  if(pcs.length){
    html+='<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
    const wSel=!_cargoPCFilter;
    html+='<button onclick="setCargoPCFilter(null)" style="font-size:10px;padding:3px 9px;border-radius:10px;border:1px solid '+(wSel?'var(--gold)':'var(--border)')+';background:'+(wSel?'var(--gold-dim)':'none')+';color:'+(wSel?'var(--gold-bright)':'var(--text-dim)')+';cursor:pointer;font-family:var(--sans)">Wagon</button>';
    pcs.forEach(pc=>{
      const sel=_cargoPCFilter===pc.name;
      const cnt=(pc.inventory||[]).length;
      html+='<button onclick="setCargoPCFilter(\''+esc(pc.name).replace(/'/g,"\\'")+'\')" style="font-size:10px;padding:3px 9px;border-radius:10px;border:1px solid '+(sel?'var(--gold)':'var(--border)')+';background:'+(sel?'var(--gold-dim)':'none')+';color:'+(sel?'var(--gold-bright)':'var(--text-dim)')+';cursor:pointer;font-family:var(--sans)">'+esc(pc.name)+' '+cnt+'</button>';
    });
    html+='</div>';
  }
  c.innerHTML=html;
  if(_cargoPCFilter){
    const pc=pcs.find(p=>p.name===_cargoPCFilter);
    if(!pc){_cargoPCFilter=null;renderCargo();return;}
    const items=pc.inventory||[];
    const pcIdx=pcs.indexOf(pc);
    const wrap=document.createElement('div');wrap.id='wagon-cargo-pc';
    c.appendChild(wrap);
    _renderInvChips('wagon-cargo-pc',items,'pc_'+pcIdx,_cargoEditIdx,
      idx=>{_cargoEditIdx=idx;renderCargo();},
      _cargoFilter,f=>{_cargoFilter=f;renderCargo();},pc.name+' has no items.',_invSearch);
  } else {
    const wrap=document.createElement('div');wrap.id='wagon-cargo-items';
    c.appendChild(wrap);
    _renderInvChips('wagon-cargo-items',state.wagon.cargo||[],'cargo',_cargoEditIdx,
      idx=>{_cargoEditIdx=idx;renderCargo();},
      _cargoFilter,f=>{_cargoFilter=f;renderCargo();},'No cargo.',_invSearch);
  }
}
function renderHoard(){
  _renderInvChips('wagon-hoard',state.wagon.hoard||[],'hoard',_hoardEditIdx,
    idx=>{_hoardEditIdx=idx;renderHoard();},
    'all',()=>{},'No hoard items.',_invSearch);
}
function closeWEdit(list){if(list==='hoard'){_hoardEditIdx=null;renderHoard();}else{_cargoEditIdx=null;renderCargo();if(list.startsWith('pc_'))renderCards();}}
function addWagonItem(list,type){
  const item={name:'',qty:1,weight:0,type:type,notes:'',ts:state.worldData.time,location:state.worldData.location};
  if(list==='hoard'){if(!state.wagon.hoard)state.wagon.hoard=[];state.wagon.hoard.push(item);_hoardEditIdx=state.wagon.hoard.length-1;}
  else{if(!state.wagon.cargo)state.wagon.cargo=[];state.wagon.cargo.push(item);_cargoEditIdx=state.wagon.cargo.length-1;}
  save();renderWagon();
}
function toggleItemTag(list,i,tag){
  const arr=_getWList(list);
  const item=arr[i];if(!item)return;
  const tags=(item.type||'misc').split(',').map(t=>t.trim()).filter(Boolean);
  const idx=tags.indexOf(tag);
  if(idx>=0)tags.splice(idx,1);else tags.push(tag);
  item.type=tags.length?tags.join(','):'misc';
  save();renderWagon();
}
function _getWList(list){
  if(list==='hoard')return state.wagon.hoard;
  if(list==='cargo')return state.wagon.cargo;
  const m=list.match(/^pc_(\d+)$/);
  if(m)return(state.pcs[parseInt(m[1])]||{}).inventory||[];
  return state.wagon.cargo;
}
function updWItem(list,i,k,v){
  const arr=_getWList(list);if(arr[i])arr[i][k]=v;
  save();renderCapacity();
}
function remWItem(list,i){
  const arr=_getWList(list);arr.splice(i,1);
  _cargoEditIdx=null;if(list==='hoard')_hoardEditIdx=null;
  save();renderWagon();
}

// ═══ COMBAT (Zone Combat Map) ═══
function _zoneHasFlying(){return(state.combat.list||[]).some(c=>c.zone==='air');}
function _tokenHTML(ent,idx){
  const isCur=state.combat.active&&state.combat.currentIdx===idx;
  const hp=parseInt(ent.hp)||0;const max=parseInt(ent.hp_max)||ent.hp||1;
  const pct=Math.max(0,Math.min(100,(hp/Math.max(max,1))*100));
  const hpCol=pct<20?'var(--red)':pct<55?'#cc8b3c':'var(--green)';
  const pc=ent.isPC?state.pcs.find(p=>p.name===ent.name):null;
  const color=pc?.color||'var(--text-dim)';
  const durs=ent.condDurations||{};
  const conds=(ent.conditions||[]).map(c=>{const d=durs[c];return '<span class="zt-cond">'+esc(c)+(d?' <small style="opacity:.7">'+d+'r</small>':'')+'</span>';}).join('');
  const conc=ent.concentrating?'<span class="zt-cond" style="border-color:var(--purple-bright);color:var(--purple-bright)">'+esc(ent.concentrating)+'</span>':'';
  const sel=_zoneMoveSel===idx?' zt-selected':'';
  return '<div class="zone-token'+(isCur?' zt-active':'')+sel+'" onclick="zoneTokenTap('+idx+')" style="border-left-color:'+color+'">'
    +'<div class="zt-row"><span class="zt-name">'+esc(ent.name)+'</span>'
    +'<span class="zt-hp" style="color:'+hpCol+'">'+hp+(ent.isPC?'/'+max:'')+'</span></div>'
    +'<div class="zt-bar-wrap"><div class="zt-bar" style="width:'+pct+'%;background:'+hpCol+'"></div></div>'
    +(conds||conc?'<div class="zt-conds">'+conds+conc+'</div>':'')
    +'</div>';
}
function renderCombat(){
  state.combat.list.forEach(c=>{if(c.isPC){const pc=state.pcs.find(p=>p.name===c.name);if(pc){c.hp=pc.hp;c.ac=pc.ac;c.hp_max=pc.hp_max;}}});
  const active=state.combat.active&&(state.combat.list||[]).length>0;
  const hdr=document.getElementById('zone-combat-hdr');
  const grid=document.getElementById('zone-grid');
  const card=document.getElementById('zone-active-card');
  const noCombat=document.getElementById('zone-no-combat');
  if(hdr)hdr.style.display=active?'':'none';
  if(!active){
    if(card)card.style.display='none';
    const zones=state.combat.zones||{};
    const hasLabels=ZONE_IDS.some(z=>zones[z]&&(zones[z].label!==ZONE_LABELS[z]||zones[z].effect||zones[z].terrain||zones[z].hidden));
    if(hasLabels&&grid){
      let html='';
      if(zones.air&&(zones.air.label!==ZONE_LABELS.air||zones.air.effect))html+=_exploreZoneHTML('air',zones);
      html+='<div class="zone-flanks">';
      html+=_exploreZoneHTML('left',zones);
      html+=_exploreZoneHTML('right',zones);
      html+='</div>';
      html+=_exploreZoneHTML('front',zones);
      html+=_exploreZoneHTML('back',zones);
      html+=_exploreZoneHTML('rear',zones);
      grid.innerHTML=html;
      if(noCombat)noCombat.style.display='none';
    }else{
      if(grid)grid.innerHTML='';
      if(noCombat)noCombat.style.display='';
    }
    _renderZoneChronicle();
    return;
  }
  if(noCombat)noCombat.style.display='none';
  // Round + turn name
  const rn=document.getElementById('zone-round-num');if(rn)rn.textContent=state.combat.round;
  const cur=state.combat.list[state.combat.currentIdx||0];
  const tn=document.getElementById('zone-turn-name');if(tn)tn.textContent=cur?cur.name+"'s Turn":'';
  // Initiative strip
  const strip=document.getElementById('init-strip');
  if(strip){
    strip.innerHTML='';
    state.combat.list.forEach((ent,idx)=>{
      const isCur=state.combat.currentIdx===idx;
      const pc=ent.isPC?state.pcs.find(p=>p.name===ent.name):null;
      const col=pc?.color||'var(--text-dim)';
      const hp=parseInt(ent.hp)||0;const max=parseInt(ent.hp_max)||ent.hp||1;
      const pct=Math.max(0,Math.min(100,(hp/Math.max(max,1))*100));
      const hpCol=pct<20?'var(--red)':pct<55?'#cc8b3c':'var(--green)';
      strip.innerHTML+='<div class="init-chip'+(isCur?' ic-active':'')+'" onclick="zoneTokenTap('+idx+')" style="border-bottom-color:'+col+'">'
        +'<span class="ic-name">'+esc(ent.name)+'</span>'
        +'<span class="ic-hp" style="color:'+hpCol+'">'+hp+'</span>'
        +'</div>';
    });
  }
  // Zone grid
  if(grid){
    const zones=state.combat.zones||_defaultZones();
    const showAir=_zoneHasFlying()||(zones.air&&zones.air.effect);
    let html='';
    if(showAir)html+=_zoneBoxHTML('air',zones);
    html+='<div class="zone-flanks">';
    html+=_zoneBoxHTML('left',zones);
    html+=_zoneBoxHTML('right',zones);
    html+='</div>';
    html+=_zoneBoxHTML('front',zones);
    html+=_zoneBoxHTML('back',zones);
    html+=_zoneBoxHTML('rear',zones);
    grid.innerHTML=html;
  }
  // Active card
  if(card&&cur){
    card.style.display='';
    const idx=state.combat.currentIdx;
    const hp=parseInt(cur.hp)||0;const max=parseInt(cur.hp_max)||cur.hp||1;
    const curDurs=cur.condDurations||{};
    const conds=(cur.conditions||[]).map((c,ci)=>{const d=curDurs[c];return '<span class="zt-cond" style="cursor:pointer" onclick="toggleCombCond('+idx+',\''+esc(c)+'\')">'+esc(c)+(d?' <small style="opacity:.7">'+d+'r</small>':'')+' ×</span>';}).join(' ');
    const conc=cur.concentrating?'<span class="zt-cond" style="border-color:var(--purple-bright);color:var(--purple-bright)">'+esc(cur.concentrating)+'</span>':'';
    const zoneLbl=(state.combat.zones||{})[cur.zone||'front']?.label||(cur.zone||'front');
    const deathSaves=cur.isPC&&hp<=0?(()=>{const pc=state.pcs.find(p=>p.name===cur.name);const ds=pc?.death_saves||{success:0,fail:0};return '<div class="zac-ds"><span style="color:var(--green)">'+('●'.repeat(ds.success)+'○'.repeat(3-ds.success))+'</span> <span style="font-size:9px;color:var(--text-dim)">DS</span> <span style="color:var(--red)">'+('●'.repeat(ds.fail)+'○'.repeat(3-ds.fail))+'</span> <button class="btn sm" onclick="toggleDeathSave(state.pcs.indexOf(state.pcs.find(p=>p.name===\''+esc(cur.name)+'\')),\'success\')" style="font-size:9px;padding:1px 5px">+S</button><button class="btn sm red" onclick="toggleDeathSave(state.pcs.indexOf(state.pcs.find(p=>p.name===\''+esc(cur.name)+'\')),\'fail\')" style="font-size:9px;padding:1px 5px">+F</button></div>';})():'';
    card.innerHTML='<div class="zac-top"><b>'+esc(cur.name)+'</b><span class="zac-meta">AC '+cur.ac+' · '+zoneLbl+'</span></div>'
      +'<div class="zac-hp-row">'
      +'<button class="btn sm red" onclick="zoneHPAdj('+idx+',-10)" style="font-size:10px;padding:2px 5px">-10</button>'
      +'<button class="btn sm red" onclick="zoneHPAdj('+idx+',-5)" style="font-size:10px;padding:2px 5px">-5</button>'
      +'<button class="btn sm red" onclick="zoneHPAdj('+idx+',-1)" style="font-size:10px;padding:2px 5px">-1</button>'
      +'<span class="zac-hp">'+hp+'/'+max+'</span>'
      +'<button class="btn sm green" onclick="zoneHPAdj('+idx+',1)" style="font-size:10px;padding:2px 5px">+1</button>'
      +'<button class="btn sm green" onclick="zoneHPAdj('+idx+',5)" style="font-size:10px;padding:2px 5px">+5</button>'
      +'<button class="btn sm green" onclick="zoneHPAdj('+idx+',10)" style="font-size:10px;padding:2px 5px">+10</button>'
      +'<input type="number" id="zac-custom-hp" style="width:38px;font-size:11px;text-align:center;margin-left:4px" placeholder="##">'
      +'<button class="btn sm red" onclick="zoneHPCustom('+idx+',-1)" style="font-size:10px;padding:2px 5px">Hit</button>'
      +'<button class="btn sm green" onclick="zoneHPCustom('+idx+',1)" style="font-size:10px;padding:2px 5px">Heal</button>'
      +'</div>'
      +'<div style="display:flex;gap:4px;align-items:center;margin-top:4px;flex-wrap:wrap"><button class="btn sm" onclick="addCombCond('+idx+')" style="font-size:10px;padding:2px 6px">+Cond</button><select id="zac-cond-pick" style="font-size:10px;padding:2px 4px;border-radius:4px;border:1px solid var(--border);background:var(--surface3);color:var(--text-dim)"><option value="">Quick…</option>'+ALL_CONDS.map(c=>'<option value="'+c+'">'+c+'</option>').join('')+'</select><input type="number" id="zac-cond-dur" placeholder="rds" style="width:36px;font-size:10px;padding:2px;text-align:center;border:1px solid var(--border);border-radius:4px;background:var(--surface3);color:var(--text-dim)" title="Duration in rounds (blank = permanent)"><button class="btn sm" onclick="quickAddCond('+idx+')" style="font-size:10px;padding:2px 5px">Add</button>'
      +(!cur.isPC?'<button class="btn sm" onclick="cloneCombatant('+idx+')" style="font-size:10px;padding:2px 6px;margin-left:auto" title="Clone this combatant">Clone</button>':'')
      +'</div>'
      +(conds||conc?'<div class="zac-conds">'+conds+conc+'</div>':'')
      +deathSaves;
  }else if(card){card.style.display='none';}
  _renderZoneChronicle();
}
function _renderZoneChronicle(){
  const el=document.getElementById('zone-chronicle');if(!el)return;
  const locName=(state.worldData?.location||'').trim();
  if(!locName){el.innerHTML='';return;}
  const loc=(state.locations||[]).find(l=>l.name.toLowerCase()===locName.toLowerCase());
  const npcNames=[...new Set([...(loc?.npcs||[]),...(state.npcs||[]).filter(n=>n.lastSeen&&n.lastSeen.toLowerCase()===locName.toLowerCase()&&n.status!=='deceased').map(n=>n.name)])];
  const locQuests=(state.quests||[]).filter(q=>q.status==='active'&&q.text&&q.text.toLowerCase().includes(locName.toLowerCase()));
  const locConseq=(state.consequences||[]).filter(cs=>!cs.resolved&&cs.location&&cs.location.toLowerCase()===locName.toLowerCase());
  if(!npcNames.length&&!locQuests.length&&!locConseq.length){el.innerHTML='';return;}
  const dcol=n=>{const npc=(state.npcs||[]).find(x=>x.name.toLowerCase()===n.toLowerCase());return npc?(npc.disposition==='Friendly'||npc.disposition==='Ally'?'var(--green)':npc.disposition==='Hostile'||npc.disposition==='Enemy'?'var(--red)':'var(--text-dim)'):'var(--text-dim)';};
  const CSQ_C=CSQ_COLORS;
  let html='<div style="border:1px solid var(--border);border-radius:6px;padding:8px 10px;background:var(--surface)">';
  html+='<div style="font-size:10px;font-weight:700;color:var(--gold-dim);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">'+esc(locName)+'</div>';
  if(npcNames.length){
    html+='<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">';
    npcNames.forEach(name=>{html+='<span style="display:inline-block;background:var(--surface3);border-radius:8px;padding:1px 7px;font-size:10px;border-left:2px solid '+dcol(name)+'">'+esc(name)+'</span>';});
    html+='</div>';
  }
  if(locQuests.length){
    locQuests.forEach(q=>{html+='<div style="font-size:10px;padding:2px 0;color:var(--green)">🟢 '+esc(q.text)+'</div>';});
  }
  if(locConseq.length){
    locConseq.forEach(cs=>{html+='<div style="font-size:10px;padding:2px 0;border-left:2px solid '+(CSQ_C[cs.type]||'var(--text-dim)')+';padding-left:6px;color:var(--text-dim)"><span style="font-size:8px;text-transform:uppercase;font-weight:700;color:'+(CSQ_C[cs.type]||'var(--text-dim)')+'">'+esc(cs.type||'bg')+'</span> '+esc(cs.text)+'</div>';});
  }
  html+='</div>';
  el.innerHTML=html;
}
function _zoneBoxHTML(zid,zones){
  const z=zones[zid]||{label:ZONE_LABELS[zid],effect:'',terrain:'',hidden:false};
  const tokens=(state.combat.list||[]).filter(c=>(c.zone||'front')===zid);
  const adj=_zoneMoveSel!==null&&ZONE_ADJ[zid]?.includes(state.combat.list[_zoneMoveSel]?.zone);
  if(z.hidden&&state._locDmMode===false){
    return '<div class="zone-box zb-fog" onclick="zoneBoxTap(\''+zid+'\')">'
      +'<div class="zb-hdr"><span class="zb-label" style="opacity:.5">???</span></div></div>';
  }
  const fogBadge=z.hidden?'<span class="zb-fog-badge" onclick="event.stopPropagation();toggleZoneFog(\''+zid+'\')">🌫</span>':'';
  return '<div class="zone-box'+(adj?' zb-adj':'')+(z.hidden?' zb-fogged':'')+'" onclick="zoneBoxTap(\''+zid+'\')">'
    +'<div class="zb-hdr"><span class="zb-label">'+esc(z.label)+'</span>'
    +fogBadge
    +(z.effect?'<span class="zb-effect">'+esc(z.effect)+'</span>':'')
    +(z.terrain?'<span class="zb-terrain">'+esc(z.terrain)+'</span>':'')
    +'</div>'
    +'<div class="zb-tokens">'+tokens.map((t,i)=>{
      const realIdx=state.combat.list.indexOf(t);
      return _tokenHTML(t,realIdx);
    }).join('')+'</div>'
    +'</div>';
}
function _exploreZoneHTML(zid,zones){
  const z=zones[zid]||{label:ZONE_LABELS[zid],effect:'',terrain:'',hidden:false};
  if(z.hidden&&state._locDmMode===false){
    return '<div class="zone-box zb-explore zb-fog"><div class="zb-hdr"><span class="zb-label" style="opacity:.5">???</span></div></div>';
  }
  const isDefault=z.label===ZONE_LABELS[zid]&&!z.effect&&!z.terrain&&!z.hidden;
  const fogBadge=z.hidden?'<span class="zb-fog-badge" onclick="event.stopPropagation();toggleZoneFog(\''+zid+'\')">🌫</span>':'';
  if(isDefault)return '<div class="zone-box zb-explore"><div class="zb-hdr"><span class="zb-label" style="opacity:.4">'+esc(z.label)+'</span></div></div>';
  return '<div class="zone-box zb-explore'+(z.hidden?' zb-fogged':'')+'">'
    +'<div class="zb-hdr"><span class="zb-label">'+esc(z.label)+'</span>'
    +fogBadge
    +(z.effect?'<span class="zb-effect">'+esc(z.effect)+'</span>':'')
    +(z.terrain?'<span class="zb-terrain">'+esc(z.terrain)+'</span>':'')
    +'</div></div>';
}
function zoneTokenTap(idx){
  if(state.combat.moveMode==='manual'){
    _zoneMoveSel=_zoneMoveSel===idx?null:idx;
    renderCombat();
    return;
  }
  state.combat.currentIdx=idx;renderCombat();
}
function zoneBoxTap(zid){
  if(_zoneMoveSel===null)return;
  const ent=state.combat.list[_zoneMoveSel];if(!ent)return;
  const curZone=ent.zone||'front';
  if(curZone===zid){_zoneMoveSel=null;renderCombat();return;}
  const adj=ZONE_ADJ[curZone]||[];
  if(!adj.includes(zid)){toast('Not adjacent — must move through connected zones','red');return;}
  ent.zone=zid;_zoneMoveSel=null;
  state.logs.push({ts:state.worldData.time,type:'combat',body:ent.name+' moved to '+(state.combat.zones[zid]?.label||zid)});
  saveRefresh();
}
function toggleZoneFog(zid){
  if(!state.combat.zones)state.combat.zones=_defaultZones();
  if(!state.combat.zones[zid])state.combat.zones[zid]={label:ZONE_LABELS[zid],effect:'',terrain:'',hidden:false};
  state.combat.zones[zid].hidden=!state.combat.zones[zid].hidden;
  save();renderCombat();
  toast(state.combat.zones[zid].hidden?'Zone hidden from players':'Zone revealed');
}
function zoneHPAdj(idx,amt){
  const ent=state.combat.list[idx];if(!ent)return;
  const max=parseInt(ent.hp_max)||ent.hp||999;
  const oldHp=parseInt(ent.hp)||0;
  ent.hp=amt>0?Math.min(max,oldHp+amt):Math.max(0,oldHp+amt);
  const dmg=amt<0?Math.abs(amt):0;
  if(dmg&&ent.concentrating){
    const dc=Math.max(10,Math.floor(dmg/2));
    toast('⚡ '+ent.name+' concentrating on '+ent.concentrating+' — CON save DC '+dc);
    _ctxInject='[CONCENTRATION CHECK] '+ent.name+' took '+dmg+' damage while concentrating on '+ent.concentrating+'. DC '+dc+' CON save required. Resolve this before continuing.';
  }
  const pc=state.pcs.find(p=>p.name===ent.name);
  if(pc){pc.hp=Math.max(0,Math.min(pc.hp_max,ent.hp));renderCards();renderStatusMini();}
  save();renderCombat();renderHUD();
}
function zoneHPCustom(idx,dir){
  const inp=document.getElementById('zac-custom-hp');
  const amt=parseInt(inp?.value);if(isNaN(amt)||amt<=0)return;
  zoneHPAdj(idx,dir*amt);if(inp)inp.value='';
}
function quickAddCond(idx){
  const sel=document.getElementById('zac-cond-pick');if(!sel||!sel.value)return;
  const dur=parseInt((document.getElementById('zac-cond-dur')||{}).value)||0;
  const ent=state.combat.list[idx];if(!ent)return;
  if(!ent.conditions)ent.conditions=[];
  ent.conditions.push(sel.value);
  if(dur>0){if(!ent.condDurations)ent.condDurations={};ent.condDurations[sel.value]=dur;}
  sel.value='';const durIn=document.getElementById('zac-cond-dur');if(durIn)durIn.value='';
  saveRefresh();
}
function toggleMoveMode(){
  state.combat.moveMode=state.combat.moveMode==='ai'?'manual':'ai';
  _zoneMoveSel=null;
  save();renderCombat();
  toast(state.combat.moveMode==='manual'?'Manual mode — tap token then tap zone to move':'AI mode — AI controls movement');
}
function toggleCombCond(idx,cond){
  const ent=state.combat.list[idx];if(!ent)return;
  if(!ent.conditions)ent.conditions=[];
  const i=ent.conditions.indexOf(cond);
  if(i>-1){ent.conditions.splice(i,1);if(ent.condDurations)delete ent.condDurations[cond];}
  else ent.conditions.push(cond);
  saveRefresh();
}
function addCombCond(idx){
  const cond=window.prompt('Add condition:');if(!cond)return;
  const durStr=window.prompt('Duration in rounds (0 or blank = permanent):','');
  const dur=parseInt(durStr)||0;
  const ent=state.combat.list[idx];if(!ent)return;
  if(!ent.conditions)ent.conditions=[];
  ent.conditions.push(cond);
  if(dur>0){if(!ent.condDurations)ent.condDurations={};ent.condDurations[cond]=dur;}
  saveRefresh();
}
function addCombatant(){
  const n=document.getElementById('new-init-name');if(!n.value)return;
  state.combat.active=true;
  if(!state.combat.zones)state.combat.zones=_defaultZones();
  const roll=Math.floor(Math.random()*20)+1;
  const val=parseInt(document.getElementById('new-init-val').value)||roll;
  const zone=(document.getElementById('new-init-zone')||{}).value||'front';
  state.combat.list.push({name:n.value,val,hp:parseInt(document.getElementById('new-init-hp').value)||10,ac:parseInt(document.getElementById('new-init-ac').value)||12,isPC:false,zone,conditions:[],concentrating:''});
  state.logs.push({ts:state.worldData.time,type:'combat',body:n.value+' added to '+ZONE_LABELS[zone]+' (init: '+val+')'});
  sortComb();n.value='';saveRefresh();
}
function cloneCombatant(idx){
  const src=state.combat.list[idx];if(!src||src.isPC)return;
  const baseName=src.name.replace(/\s*\d+$/,'');
  const existing=state.combat.list.filter(c=>c.name===baseName||c.name.match(new RegExp('^'+baseName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*\\d+$')));
  const num=existing.length+1;
  const name=baseName+' '+num;
  const roll=Math.floor(Math.random()*20)+1;
  state.combat.list.push({name,val:roll,hp:src.hp_max||src.hp,hp_max:src.hp_max||src.hp,ac:src.ac,isPC:false,zone:src.zone||'front',conditions:[],concentrating:''});
  state.logs.push({ts:state.worldData.time,type:'combat',body:name+' cloned from '+src.name+' (init: '+roll+')'});
  sortComb();saveRefresh();
  toast(name+' added');
}
function addPartyToCombat(){
  state.combat.active=true;
  if(!state.combat.zones)state.combat.zones=_defaultZones();
  state.pcs.forEach(pc=>{
    if(!state.combat.list.some(c=>c.name===pc.name)){
      const roll=Math.floor(Math.random()*20)+1;const val=roll+(pc.initiative||0);
      const zone=(pc.class||'').toLowerCase()==='fighter'?'front':'back';
      state.combat.list.push({name:pc.name,val,hp:pc.hp,hp_max:pc.hp_max,ac:pc.ac,isPC:true,zone,conditions:[],concentrating:''});
      state.logs.push({ts:state.worldData.time,type:'combat',body:pc.name+' joined '+ZONE_LABELS[zone]+' (d20['+roll+']+'+pc.initiative+'='+val+')'});
    }
  });
  // Add all animals + Wagon to Rear Guard
  (state.wagon.animals||[]).forEach(a=>{
    if(a.name&&a.hp_max>0&&!state.combat.list.some(c=>c.name===a.name)){
      state.combat.list.push({name:a.name,val:0,hp:a.hp||0,hp_max:a.hp_max||0,ac:a.ac||10,isPC:false,zone:'rear',conditions:[],concentrating:''});
    }
  });
  if(!state.combat.list.some(c=>c.name==='Wagon')){
    state.combat.list.push({name:'Wagon',val:0,hp:state.wagon?.hp||20,hp_max:state.wagon?.hp_max||20,ac:state.wagon?.ac||11,isPC:false,zone:'rear',conditions:[],concentrating:''});
  }
  sortComb();saveRefresh();
}
function sortComb(){state.combat.list.sort((a,b)=>b.val-a.val);}
function remComb(i){state.combat.list.splice(i,1);if((state.combat.list||[]).length>0&&state.combat.currentIdx>=(state.combat.list||[]).length&&state.combat.currentIdx>0)state.combat.currentIdx=0;saveRefresh();}
function updCombHP(i,val){
  const clamped=Math.max(0,val);
  state.combat.list[i].hp=clamped;
  const pc=state.pcs.find(p=>p.name===state.combat.list[i].name);
  if(pc){pc.hp=Math.max(0,Math.min(pc.hp_max,clamped));renderCards();renderStatusMini();}
  save();renderCombat();
}
function _injectTurnCtx(){
  const cur=state.combat.list[state.combat.currentIdx];if(!cur)return;
  const zone=(state.combat.zones||{})[cur.zone||'front']?.label||(cur.zone||'front');
  const durs=cur.condDurations||{};
  const conds=(cur.conditions||[]).length?cur.conditions.map(c=>{const d=durs[c];return c+(d?' ('+d+' rounds)':'');}).join(', '):'none';
  const conc=cur.concentrating?' Concentrating: '+cur.concentrating+'.':'';
  _ctxInject='[TURN ADVANCE] Round '+state.combat.round+', '+cur.name+"'s turn. Zone: "+zone+'. HP: '+cur.hp+'/'+cur.hp_max+'. AC: '+cur.ac+'. Conditions: '+conds+'.'+conc+' Awaiting action.';
}
function _tickCondDurations(entIdx){
  const ent=state.combat.list[entIdx];if(!ent||!ent.condDurations)return;
  const expired=[];
  Object.keys(ent.condDurations).forEach(c=>{
    ent.condDurations[c]--;
    if(ent.condDurations[c]<=0){expired.push(c);delete ent.condDurations[c];}
  });
  if(expired.length){
    ent.conditions=(ent.conditions||[]).filter(c=>!expired.includes(c));
    toast(ent.name+': '+expired.join(', ')+' expired');
  }
}
function nextTurn(){if(!state.combat.active||!(state.combat.list||[]).length)return;_tickCondDurations(state.combat.currentIdx);state.combat.currentIdx++;if(state.combat.currentIdx>=state.combat.list.length){state.combat.currentIdx=0;state.combat.round++;}_injectTurnCtx();saveRefresh();}
function prevTurn(){if(!state.combat.active||!(state.combat.list||[]).length)return;state.combat.currentIdx--;if(state.combat.currentIdx<0){state.combat.currentIdx=state.combat.list.length-1;state.combat.round=Math.max(1,state.combat.round-1);}_injectTurnCtx();saveRefresh();}
const COMBAT_ONLY_CONDS=new Set(['Prone','Grappled','Restrained']);
function endCombat(){
  if(!confirm('End combat? (Round '+state.combat.round+', '+state.combat.list.length+' combatants)'))return;
  var summary='Combat ended — Round '+state.combat.round+', '+state.combat.list.length+' combatants.';
  var loc=(state.worldData||{}).location||'';
  if(loc){
    var locObj=(state.locations||[]).find(function(l){return l.name===loc;});
    if(locObj){
      if(!locObj.history)locObj.history=[];
      locObj.history.push({ts:state.worldData.time||'',text:summary,dmOnly:false});
    }
  }
  const synced=[];
  state.combat.list.forEach(ent=>{
    if(!ent.isPC)return;
    const pc=state.pcs.find(p=>p.name===ent.name);if(!pc)return;
    const persistent=(ent.conditions||[]).filter(c=>!COMBAT_ONLY_CONDS.has(c));
    pc.conditions=persistent;
    pc.concentrating=ent.concentrating||'';
    if(persistent.length)synced.push(pc.name+': '+persistent.join(', '));
  });
  state.combat.list.forEach(ent=>{
    if(ent.isPC)return;
    (state.wagon.animals||[]).forEach(a=>{if(a.name===ent.name)a.hp=Math.max(0,ent.hp);});
    state.pcs.forEach(p=>{if(p.familiar&&p.familiar.name===ent.name)p.familiar.hp=Math.max(0,ent.hp);});
    if(state.wagon?.ox&&state.wagon.ox.name&&ent.name===state.wagon.ox.name)state.wagon.ox.hp=Math.max(0,ent.hp);
  });
  state.combat={active:false,round:1,currentIdx:0,list:[],zones:_defaultZones(),moveMode:'ai'};
  _zoneMoveSel=null;
  saveRefresh();
  toast('Combat ended'+(synced.length?' — conditions synced: '+synced.join('; '):' — summary added to location history'));
}
function renderPresets(){
  const c=document.getElementById('preset-list');if(!c)return;c.innerHTML='';
  if(!(state.encounterPresets||[]).length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px">No presets yet.</div>';return;}
  state.encounterPresets.forEach((p,idx)=>{
    const d=document.createElement('div');d.style.cssText='display:flex;gap:5px;margin-bottom:6px;flex-wrap:wrap;align-items:center';
    d.innerHTML=`<input type="text" value="${esc(p.name||'')}" style="flex:1;min-width:80px;font-size:11px" placeholder="Preset name" onchange="updPreset(${idx},'name',this.value)"><input type="text" value="${esc(p.enemies||'')}" style="flex:3;min-width:110px;font-size:11px" placeholder="Goblin:7:15, Hobgoblin:11:16" onchange="updPreset(${idx},'enemies',this.value)"><button class="btn sm green" onclick="loadPreset(${idx})">Load</button><button class="btn sm red icon-btn" onclick="remPreset(${idx})">&times;</button>`;
    c.appendChild(d);
  });
}
function addPreset(){if(!state.encounterPresets)state.encounterPresets=[];state.encounterPresets.push({name:'New Encounter',enemies:''});saveRefresh();}
function updPreset(i,k,v){state.encounterPresets[i][k]=v;save();}
function remPreset(i){state.encounterPresets.splice(i,1);saveRefresh();}
function loadPreset(idx){
  const p=state.encounterPresets[idx];if(!p?.enemies)return;
  state.combat.active=true;
  if(!state.combat.zones)state.combat.zones=_defaultZones();
  p.enemies.split(',').forEach(part=>{
    const bits=part.trim().split(':');const name=bits[0]?.trim()||'Enemy';
    const hp=parseInt(bits[1])||10;const ac=parseInt(bits[2])||12;
    const roll=Math.floor(Math.random()*20)+1;
    state.combat.list.push({name,val:roll,hp,ac,isPC:false,zone:'front',conditions:[],concentrating:''});
    state.logs.push({ts:state.worldData.time,type:'combat',body:name+' loaded (initiative: '+roll+')'});
  });
  sortComb();saveRefresh();showTab('tab-combat');toast('✓ '+p.name+' loaded!');
}

// ═══ RESTS ═══
function doShortRest(){if(!confirm('Take a Short Rest?'))return;state.logs.push({ts:state.worldData.time,type:'rest',body:'Party takes a Short Rest.'});saveRefresh();toast('⛺ Short Rest. Spend Hit Dice to heal.');}
function doLongRest(){
  if(!confirm('Take a Long Rest? Restores all HP and spell slots.'))return;
  state.pcs.forEach(pc=>{pc.hp=pc.hp_max;if(pc.slots)pc.slots.forEach(s=>s.used=0);});
  state.logs.push({ts:state.worldData.time,type:'rest',body:'Party takes a Long Rest. All HP and spell slots restored.'});
  saveRefresh();
  if(document.getElementById('auto-rest')?.checked)triggerChk('Long Rest');
  toast('🌙 Long Rest — all HP and slots restored!');
  state.pcs.forEach(pc=>checkLevelUp(pc));
  _autoOpenLevelUp();
}

// ═══ LEVEL UP WIZARD ═══
let _luWiz=null,_luTestSnapshot=null;

function checkLevelUp(pc){
  const lvl=pc.level||1;
  const xp=parseInt(pc.xp)||0;
  const threshold=XP_T[Math.min(lvl,19)];
  console.log('[LevelUp] checkLevelUp:',pc.name,'lvl='+lvl,'xp='+xp,'threshold='+threshold,'levelReady='+pc.levelReady);
  if(lvl>=20)return;
  if(pc.levelReady)return;
  if(xp>=threshold){
    pc.levelReady=true;
    const newLvl=lvl+1;
    console.log('[LevelUp] '+pc.name+' QUALIFIES for Level '+newLvl);
    toast('⬆ '+pc.name+' ready for Level '+newLvl+'! Use //levelup or take a Long Rest.');
    const clsKey=Object.keys(LEVEL_UP_DATA).find(k=>(pc.class||'').toLowerCase().includes(k));
    const lvlData=clsKey&&LEVEL_UP_DATA[clsKey]&&LEVEL_UP_DATA[clsKey].levels[newLvl];
    let choiceHints='';
    if(lvlData){
      if((lvlData.auto||[]).length)choiceHints+=' New features they gain automatically: '+lvlData.auto.map(f=>f.split(':')[0]).join(', ')+'.';
      (lvlData.choose||[]).forEach(c=>{
        if(c.type==='subclass')choiceHints+=' They must choose a subclass: '+c.prompt+' — options are: '+c.options.join(', ')+'.';
        else if(c.type==='spell'){
          choiceHints+=' SPELL CHOICE: '+c.prompt+'.';
          const cls=(pc.class||'').toLowerCase();
          const tier=c.tier||1;
          const known=(pc.spellbook||[]).map(s=>s.name.toLowerCase());
          let avail=[];
          if(cls.includes('bard')){for(let l=c.cantrip?0:1;l<=tier;l++){avail=avail.concat((BARD_SPELLS[l]||[]).filter(n=>!known.includes(n.toLowerCase())));}}
          else{avail=SPELL_DB.filter(s=>s.level<=(c.cantrip?0:tier)&&s.level>=(c.cantrip?0:1)&&!known.includes(s.name.toLowerCase())).map(s=>s.name);}
          if(avail.length)choiceHints+=' Available options: '+avail.join(', ')+'.';
        }
        else if(c.type==='asi')choiceHints+=' They get an Ability Score Improvement: +2 to one ability score, or +1 to two different scores.';
      });
    }
    _ctxInject='[LEVEL UP PENDING] '+pc.name+' has earned enough XP to reach Level '+newLvl+'!'
      +' Announce: "'+pc.name+' has earned enough experience to reach Level '+newLvl+'! Type //levelup in the chat or open the character sheet to advance."'
      +' Do NOT narrate stat changes, choose feats, choose spells, or apply HP increases — the Level Up wizard handles everything.'
      +' You may mention what awaits them in general terms (e.g. "exciting choices ahead at this level") but do NOT list specific options or fabricate a stat block.';
  }
}
function _autoOpenLevelUp(){
  const readyIdx=state.pcs.findIndex(pc=>pc.levelReady);
  if(readyIdx>=0){
    console.log('[LevelUp] Auto-opening wizard for '+state.pcs[readyIdx].name);
    setTimeout(()=>openLevelUpWizard(readyIdx),800);
  }
}

function openLevelUpWizard(idx){
  const pc=state.pcs[idx];if(!pc)return;
  const newLvl=(pc.level||1)+1;
  const clsKey=Object.keys(LEVEL_UP_DATA).find(k=>(pc.class||'').toLowerCase().includes(k))||null;
  const data=clsKey?LEVEL_UP_DATA[clsKey]:null;
  const lvlData=(data&&data.levels[newLvl])||{auto:[],choose:[]};
  const hitDie=data?data.hit_die:8;
  const steps=[{type:'hp',hitDie}];
  if((lvlData.auto||[]).length)steps.push({type:'auto',features:lvlData.auto});
  const cls=(pc.class||'').toLowerCase();
  const isSpellcaster=cls.includes('bard')||cls.includes('arcane trickster')||cls.includes('eldritch knight');
  if(isSpellcaster&&(pc.magic||'').trim().length>10)steps.push({type:'spell_swap'});
  (lvlData.choose||[]).forEach(c=>steps.push({type:'choice',choice:c}));
  steps.push({type:'confirm'});
  _luWiz={idx,pc,newLvl,clsKey,data,lvlData,steps,stepIdx:0,
    choices:{hp:0,autoFeatures:lvlData.auto||[],subclass:'',spells:[],asi:'',feat:'',featAbility:'',asiMode:'asi',swapOld:'',swapNew:''}};
  document.getElementById('levelup-modal').classList.add('open');
  _renderLevelUpStep();
}

function closeLevelUpModal(){
  document.getElementById('levelup-modal').classList.remove('open');
  _luWiz=null;
  if(_luTestSnapshot){
    state.pcs[_luTestSnapshot.idx]=JSON.parse(JSON.stringify(_luTestSnapshot.data));
    _luTestSnapshot=null;
    save();renderAll();
    toast('⚗ Test mode — all changes reverted.');
  }
}

function _luNext(){
  if(!_luWiz)return;
  _luWiz.stepIdx++;
  _renderLevelUpStep();
}

function _luSkipSwap(){
  if(!_luWiz)return;
  _luWiz.choices.swapOld='';
  _luWiz.choices.swapNew='';
  _luNext();
}

function _luRollHP(hd,conMod){
  if(!_luWiz)return;
  const roll=Math.ceil(Math.random()*hd);
  const total=Math.max(1,roll+conMod);
  _luWiz.choices.hp=total;
  const r=document.getElementById('lu-hp-roll');if(r)r.textContent=roll;
  const res=document.getElementById('lu-hp-result');
  if(res)res.textContent='Rolled '+roll+' + '+(conMod>=0?'+':'')+conMod+' = +'+total+' HP';
  const nb=document.getElementById('lu-next-btn');if(nb){nb.disabled=false;nb.textContent='→ Next';}
}

function _luSetHP(hp){
  if(!_luWiz)return;
  _luWiz.choices.hp=hp;
  const r=document.getElementById('lu-hp-roll');if(r)r.textContent='avg';
  const res=document.getElementById('lu-hp-result');if(res)res.textContent='Average taken: +'+hp+' HP';
  const nb=document.getElementById('lu-next-btn');if(nb){nb.disabled=false;nb.textContent='→ Next';}
}

function _luSelectSubclass(name){
  if(!_luWiz)return;
  _luWiz.choices.subclass=name;
  document.querySelectorAll('.lu-option').forEach(el=>{el.style.borderColor='var(--border)';el.classList.remove('selected');});
  const sid='luopt_'+name.replace(/[^a-zA-Z0-9]/g,'_');
  const el=document.getElementById(sid);
  if(el){el.style.borderColor='var(--gold)';el.classList.add('selected');}
  const nb=document.getElementById('lu-next-btn');if(nb)nb.disabled=false;
}

function _luToggleSpell(name){
  if(!_luWiz)return;
  const step=_luWiz.steps[_luWiz.stepIdx];
  const max=(step&&step.choice)?step.choice.count:1;
  const arr=_luWiz.choices.spells;
  const i=arr.indexOf(name);
  if(i>=0){arr.splice(i,1);}
  else if(arr.length<max){arr.push(name);}
  else{
    const old=arr.shift();arr.push(name);
    document.querySelectorAll('#lu-spell-list input[type=checkbox]').forEach(cb=>{if(cb.value===old)cb.checked=false;});
  }
  const nb=document.getElementById('lu-next-btn');if(nb)nb.disabled=(arr.length<max);
}

function _luUpdateASI(){
  if(!_luWiz)return;
  const s1=(document.getElementById('lu-asi-1')||{}).value||'';
  const s2=(document.getElementById('lu-asi-2')||{}).value||'';
  let asi='';let preview='';
  if(s1&&s2&&s1!==s2){asi=s1.toLowerCase()+'+1,'+s2.toLowerCase()+'+1';preview=s1+' +1 & '+s2+' +1';}
  else if(s1){asi=s1.toLowerCase()+'+2';preview=s1+' +2';}
  _luWiz.choices.asi=asi;
  const pv=document.getElementById('lu-asi-preview');if(pv)pv.textContent=preview?'→ '+preview:'';
  const nb=document.getElementById('lu-next-btn');if(nb)nb.disabled=!s1;
}

function _luSetASIMode(mode){
  if(!_luWiz)return;
  _luWiz.choices.asiMode=mode;
  if(mode==='asi'){_luWiz.choices.feat='';_luWiz.choices.featAbility='';}
  else{_luWiz.choices.asi='';}
  _renderLevelUpStep();
}

function _luSelectFeat(name){
  if(!_luWiz)return;
  _luWiz.choices.feat=name;
  _luWiz.choices.featAbility='';
  const feat=FEATS_DB.find(f=>f.name===name);
  document.querySelectorAll('.lu-feat-opt').forEach(el=>{el.style.borderColor='var(--border)';el.classList.remove('selected');});
  const sid='lufeat_'+name.replace(/[^a-zA-Z0-9]/g,'_');
  const el=document.getElementById(sid);
  if(el){el.style.borderColor='var(--gold)';el.classList.add('selected');}
  const abDiv=document.getElementById('lu-feat-ability');
  if(abDiv&&feat&&feat.half){
    const opts=feat.half.map(s=>'<option value="'+s+'">'+s+'</option>').join('');
    abDiv.innerHTML='<label class="field-label" style="margin-top:8px">Ability Score +1</label><select id="lu-feat-ab-sel" onchange="_luUpdateFeatAbility()"><option value="">— Choose —</option>'+opts+'</select>';
    abDiv.style.display='block';
  } else if(abDiv){abDiv.innerHTML='';abDiv.style.display='none';}
  const nb=document.getElementById('lu-next-btn');
  if(nb)nb.disabled=!!(feat&&feat.half&&!_luWiz.choices.featAbility);
}

function _luUpdateFeatAbility(){
  if(!_luWiz)return;
  _luWiz.choices.featAbility=(document.getElementById('lu-feat-ab-sel')||{}).value||'';
  const nb=document.getElementById('lu-next-btn');if(nb)nb.disabled=!_luWiz.choices.featAbility;
}

function _luFilterFeats(){
  if(!_luWiz)return;
  const q=(document.getElementById('lu-feat-search')||{}).value||'';
  const lower=q.toLowerCase();
  document.querySelectorAll('.lu-feat-opt').forEach(el=>{
    const name=(el.dataset.name||'').toLowerCase();
    const desc=(el.dataset.desc||'').toLowerCase();
    el.style.display=(name.includes(lower)||desc.includes(lower))?'':'none';
  });
}

function _luSelectSwapOld(name){
  if(!_luWiz)return;
  if(_luWiz.choices.swapOld===name){_luWiz.choices.swapOld='';_luWiz.choices.swapNew='';}
  else{_luWiz.choices.swapOld=name;_luWiz.choices.swapNew='';}
  _renderLevelUpStep();
}

function _luSelectSwapNew(name){
  if(!_luWiz)return;
  _luWiz.choices.swapNew=name;
  document.querySelectorAll('.lu-swap-new').forEach(el=>{el.style.borderColor='var(--border)';el.classList.remove('selected');});
  const sid='luswap_'+name.replace(/[^a-zA-Z0-9]/g,'_');
  const el=document.getElementById(sid);
  if(el){el.style.borderColor='var(--gold)';el.classList.add('selected');}
  const nb=document.getElementById('lu-next-btn');if(nb)nb.disabled=false;
}

function _luParseKnownSpells(pc){
  const magic=(pc.magic||'');if(!magic.trim())return[];
  const spells=[];
  magic.split('\n').forEach(line=>{
    const cleaned=line.replace(/^\[[^\]]*\]\s*/,'').trim();
    if(!cleaned)return;
    cleaned.split(',').map(s=>s.trim()).filter(Boolean).forEach(s=>{
      const name=s.replace(/^\[[^\]]*\]\s*/,'').trim();
      if(name&&!spells.includes(name))spells.push(name);
    });
  });
  return spells;
}

function _luGetSwapPool(pc){
  const cls=(pc.class||'').toLowerCase();
  const isBard=cls.includes('bard');
  const newLvl=_luWiz?_luWiz.newLvl:((pc.level||1)+1);
  let pool=[];
  if(isBard){
    const maxTier=newLvl>=5?3:newLvl>=3?2:1;
    for(let t=0;t<=maxTier;t++){(BARD_SPELLS[t]||[]).forEach(s=>pool.push(s));}
  } else {
    const maxSpellLvl=newLvl>=19?5:newLvl>=13?4:newLvl>=7?2:1;
    SPELL_DB.forEach(sp=>{
      if(sp.classes.includes('wizard')&&sp.level<=maxSpellLvl)pool.push(sp.name);
    });
  }
  const known=_luParseKnownSpells(pc);
  return pool.filter(s=>!known.includes(s));
}

function _getBardSpells(ch){
  const tier=ch.tier||1;
  let pool=[];
  if(ch.cantrip)(BARD_SPELLS[0]||[]).forEach(s=>pool.push('[Cantrip] '+s));
  for(let t=1;t<=tier;t++){(BARD_SPELLS[t]||[]).forEach(s=>pool.push((t>1?'[L'+t+'] ':'')+s));}
  const known=(_luWiz&&_luWiz.pc&&_luWiz.pc.magic)||'';
  return pool.filter(s=>!known.includes(s.replace(/^\[[^\]]+\]\s*/,'')));
}

function _renderLevelUpStep(){
  if(!_luWiz)return;
  const {pc,newLvl,steps,stepIdx,choices,data,clsKey}=_luWiz;
  const step=steps[stepIdx];
  const titleEl=document.getElementById('lu-title');
  const bodyEl=document.getElementById('lu-body');
  const actEl=document.getElementById('lu-actions');
  if(!titleEl||!bodyEl||!actEl)return;
  const prog='<small style="opacity:.5;font-size:10px;font-weight:400;margin-left:6px">'+(stepIdx+1)+'/'+steps.length+'</small>';
  const X='<button class="btn sm" onclick="closeLevelUpModal()" style="margin-left:auto">✕</button>';

  if(step.type==='hp'){
    const hd=step.hitDie||8;
    const conMod=parseInt(((pc.con||'10 (+0)').match(/\(([^)]+)\)/)||['','0'])[1])||0;
    const avg=Math.floor(hd/2)+1+conMod;
    titleEl.innerHTML='⬆ '+esc(pc.name)+' → Level '+newLvl+prog+X;
    bodyEl.innerHTML=
      '<div style="font-size:13px;font-weight:600;margin-bottom:12px">Hit Points</div>'+
      '<div style="display:flex;gap:16px;align-items:center;margin-bottom:14px">'+
        '<div id="lu-hp-roll" style="font-size:36px;font-weight:700;color:var(--gold);width:64px;height:64px;display:flex;align-items:center;justify-content:center;border:2px solid var(--gold-dim);border-radius:8px">d'+hd+'</div>'+
        '<div style="font-size:12px;color:var(--text-dim);line-height:2">Hit Die: d'+hd+'<br>CON mod: '+(conMod>=0?'+':'')+conMod+'<br>Average: <strong>+'+avg+'</strong></div>'+
      '</div>'+
      '<div id="lu-hp-result" style="font-size:14px;color:var(--gold);font-weight:600;min-height:22px"></div>';
    actEl.innerHTML=
      '<button class="btn gold" onclick="_luRollHP('+hd+','+conMod+')">🎲 Roll d'+hd+'</button>'+
      '<button class="btn" onclick="_luSetHP('+avg+')">Take Average (+'+avg+')</button>'+
      '<button class="btn" id="lu-next-btn" disabled onclick="_luNext()" style="margin-left:auto">→ Next</button>';
  }
  else if(step.type==='auto'){
    titleEl.innerHTML='⬆ New Features'+prog+X;
    bodyEl.innerHTML=
      '<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px">'+esc(pc.name)+' gains at Level '+newLvl+':</div>'+
      step.features.map(f=>'<div style="padding:10px 14px;background:var(--surface3);border:1px solid var(--border);border-left:3px solid var(--gold);border-radius:var(--radius-sm);margin-bottom:8px;font-size:12px;line-height:1.6">'+esc(f)+'</div>').join('');
    actEl.innerHTML='<button class="btn gold full" onclick="_luNext()">✓ Got It →</button>';
  }
  else if(step.type==='choice'){
    const ch=step.choice;
    titleEl.innerHTML='⬆ '+esc(ch.prompt||'Choose')+prog+X;
    if(ch.type==='subclass'){
      bodyEl.innerHTML='<div style="font-size:11px;color:var(--text-dim);margin-bottom:10px">This choice is permanent.</div>'+
        ch.options.map(o=>'<div id="luopt_'+o.replace(/[^a-zA-Z0-9]/g,'_')+'" class="lu-option" onclick="_luSelectSubclass(\''+o.replace(/'/g,"\\'")+'\')">'+esc(o)+'</div>').join('');
      actEl.innerHTML='<button class="btn gold full" id="lu-next-btn" disabled onclick="_luNext()">→ Next</button>';
    }
    else if(ch.type==='spell'){
      const spells=_getBardSpells(ch);
      bodyEl.innerHTML='<div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">Select '+ch.count+':</div>'+
        '<div id="lu-spell-list" style="max-height:360px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm)">'+
        spells.map(s=>{
          const raw=s.replace(/^\[[^\]]+\]\s*/,'');
          const sp=SPELL_DB.find(x=>x.name===raw);
          return '<label style="display:flex;align-items:flex-start;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border)">'+
            '<input type="checkbox" style="margin-top:2px" value="'+esc(raw)+'" onchange="_luToggleSpell(\''+raw.replace(/'/g,"\\'")+'\')">'+
            '<div><span style="font-size:12px">'+esc(s)+'</span>'+
            (sp?'<div style="font-size:9px;color:var(--text-dim);margin-top:2px;line-height:1.4">'+esc(sp.school)+' · '+esc(sp.castTime)+' · '+esc(sp.range)+'</div>'+
              '<div style="font-size:9px;color:var(--text-dim);line-height:1.4">'+esc(sp.desc.length>120?sp.desc.substring(0,120)+'…':sp.desc)+'</div>':'')+
            '</div></label>';
        }).join('')+
        '</div>';
      actEl.innerHTML='<button class="btn gold full" id="lu-next-btn" disabled onclick="_luNext()">→ Next</button>';
    }
    else if(ch.type==='asi'){
      const stats=['STR','DEX','CON','INT','WIS','CHA'];
      const mode=choices.asiMode||'asi';
      const scoreRow='<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">'+
        stats.map(s=>{
          const raw=(pc[s.toLowerCase()]||'10 (+0)');
          const score=raw.toString().split(' ')[0];
          const mod=raw.toString().match(/\(([^)]+)\)/);
          return '<div style="text-align:center;background:var(--surface3);border:1px solid var(--border);border-radius:6px;padding:4px 8px;min-width:42px">'+
            '<div style="font-size:9px;color:var(--gold);font-weight:600;letter-spacing:1px">'+s+'</div>'+
            '<div style="font-size:16px;font-weight:700;color:var(--text-bright)">'+score+'</div>'+
            (mod?'<div style="font-size:9px;color:var(--text-dim)">'+mod[1]+'</div>':'')+
          '</div>';
        }).join('')+'</div>';
      const modeToggle='<div style="display:flex;gap:0;margin-bottom:12px;border:1px solid var(--gold-dim);border-radius:var(--radius-sm);overflow:hidden">'+
        '<button onclick="_luSetASIMode(\'asi\')" style="flex:1;padding:8px;border:none;font-size:11px;font-weight:600;cursor:pointer;background:'+(mode==='asi'?'var(--gold)':'var(--surface2)')+';color:'+(mode==='asi'?'var(--bg)':'var(--text)')+'">Ability Score +</button>'+
        '<button onclick="_luSetASIMode(\'feat\')" style="flex:1;padding:8px;border:none;border-left:1px solid var(--gold-dim);font-size:11px;font-weight:600;cursor:pointer;background:'+(mode==='feat'?'var(--gold)':'var(--surface2)')+';color:'+(mode==='feat'?'var(--bg)':'var(--text)')+'">Take a Feat</button>'+
      '</div>';
      titleEl.innerHTML='⬆ Ability Score Improvement'+prog+X;
      if(mode==='asi'){
        const opts=stats.map(s=>'<option value="'+s+'">'+s+'</option>').join('');
        bodyEl.innerHTML=scoreRow+modeToggle+
          '<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px">+2 to one ability, or +1 to two different abilities. Max 20.</div>'+
          '<div class="form-group"><label class="field-label">First Ability</label><select id="lu-asi-1" onchange="_luUpdateASI()"><option value="">— Choose —</option>'+opts+'</select></div>'+
          '<div class="form-group"><label class="field-label">Second Ability (optional — split into +1/+1)</label><select id="lu-asi-2" onchange="_luUpdateASI()"><option value="">— None (first ability gets +2) —</option>'+opts+'</select></div>'+
          '<div id="lu-asi-preview" style="font-size:13px;color:var(--gold);font-weight:600;margin-top:6px;min-height:18px"></div>';
        actEl.innerHTML='<button class="btn gold full" id="lu-next-btn" disabled onclick="_luNext()">→ Next</button>';
      } else {
        const featHtml=FEATS_DB.map(f=>{
          const isHalf=f.half&&f.half.length;
          const tag=isHalf?'<span style="font-size:9px;color:var(--green);margin-left:4px">Half-feat (+1 '+f.half.join('/')+')</span>':'';
          const prereq=f.prereq?'<div style="font-size:9px;color:var(--red);margin-top:2px">Requires: '+esc(f.prereq)+'</div>':'';
          const src=f.source!=='PHB'?'<span style="font-size:8px;color:var(--text-dim);margin-left:4px">'+esc(f.source)+'</span>':'';
          const sel=choices.feat===f.name;
          return '<div id="lufeat_'+f.name.replace(/[^a-zA-Z0-9]/g,'_')+'" class="lu-feat-opt" data-name="'+esc(f.name)+'" data-desc="'+esc(f.desc)+'" '+
            'onclick="_luSelectFeat(\''+f.name.replace(/'/g,"\\'")+'\')" '+
            'style="padding:8px 12px;border:1px solid '+(sel?'var(--gold)':'var(--border)')+';border-radius:var(--radius-sm);margin-bottom:6px;cursor:pointer;background:var(--surface2)">'+
            '<div style="font-size:12px;font-weight:600;color:var(--text-bright)">'+esc(f.name)+tag+src+'</div>'+
            '<div style="font-size:10px;color:var(--text);line-height:1.5;margin-top:3px">'+esc(f.desc)+'</div>'+
            prereq+'</div>';
        }).join('');
        bodyEl.innerHTML=scoreRow+modeToggle+
          '<input type="text" id="lu-feat-search" oninput="_luFilterFeats()" placeholder="Search feats..." style="width:100%;padding:6px 10px;font-size:12px;margin-bottom:8px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface);color:var(--text)">'+
          '<div style="max-height:220px;overflow-y:auto">'+featHtml+'</div>'+
          '<div id="lu-feat-ability" style="display:none"></div>';
        actEl.innerHTML='<button class="btn gold full" id="lu-next-btn" '+(choices.feat?'':'disabled')+' onclick="_luNext()">→ Next</button>';
        if(choices.feat){const feat=FEATS_DB.find(f=>f.name===choices.feat);if(feat&&feat.half){const nb=document.getElementById('lu-next-btn');if(nb)nb.disabled=!choices.featAbility;_luSelectFeat(choices.feat);}}
      }
    }
  }
  else if(step.type==='spell_swap'){
    titleEl.innerHTML='⬆ Spell Swap (Optional)'+prog+X;
    const known=_luParseKnownSpells(pc);
    const pool=_luGetSwapPool(pc);
    let html='<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px">You may replace one known spell with another from your class spell list.</div>';
    html+='<div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:6px">Current Spells (tap to remove)</div>';
    html+='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">';
    known.forEach(s=>{
      const sel=choices.swapOld===s;
      html+='<button onclick="_luSelectSwapOld(\''+s.replace(/'/g,"\\'")+'\')" style="padding:4px 10px;font-size:11px;border:1px solid '+(sel?'var(--red)':'var(--border)')+';border-radius:12px;background:'+(sel?'var(--red)':'var(--surface2)')+';color:'+(sel?'var(--text-bright)':'var(--text)')+';cursor:pointer">'+(sel?'✕ ':'')+esc(s)+'</button>';
    });
    html+='</div>';
    if(choices.swapOld){
      html+='<div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:6px">Replace with</div>';
      html+='<div style="max-height:180px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm)">';
      pool.forEach(s=>{
        const sel=choices.swapNew===s;
        const sp=SPELL_DB.find(x=>x.name===s);
        const lvlTag=sp?'['+(!sp.level?'Cantrip':'L'+sp.level)+'] ':'';
        html+='<div id="luswap_'+s.replace(/[^a-zA-Z0-9]/g,'_')+'" class="lu-swap-new" onclick="_luSelectSwapNew(\''+s.replace(/'/g,"\\'")+'\')" style="padding:6px 12px;cursor:pointer;border-bottom:1px solid var(--border);border-color:'+(sel?'var(--gold)':'var(--border)')+'">'+
          '<span style="font-size:11px;color:'+(sel?'var(--gold)':'var(--text)')+'">'+lvlTag+esc(s)+'</span>'+
          (sp?'<div style="font-size:9px;color:var(--text-dim);margin-top:2px">'+esc(sp.desc.substring(0,80))+'...</div>':'')+
        '</div>';
      });
      html+='</div>';
    }
    bodyEl.innerHTML=html;
    const hasSwap=choices.swapOld&&choices.swapNew;
    actEl.innerHTML=
      '<button class="btn" onclick="_luSkipSwap()">Skip →</button>'+
      '<button class="btn gold" id="lu-next-btn" '+(hasSwap?'':'disabled')+' onclick="_luNext()" style="margin-left:auto">Swap & Next →</button>';
  }
  else if(step.type==='confirm'){
    titleEl.innerHTML='⬆ Confirm Level Up'+X;
    const rows=[];
    rows.push('<div style="font-size:15px;font-weight:700;color:var(--gold-bright);margin-bottom:10px">'+esc(pc.name)+' → Level '+newLvl+'</div>');
    rows.push('<div style="font-size:12px;line-height:2;color:var(--text-dim)">');
    rows.push('HP Max: '+(pc.hp_max||0)+' → <strong style="color:var(--text)">'+(pc.hp_max+choices.hp)+'</strong> (+'+choices.hp+')<br>');
    if(choices.autoFeatures&&choices.autoFeatures.length)rows.push('New Features: <strong style="color:var(--text)">'+esc(choices.autoFeatures.map(f=>f.split(':')[0]).join(', '))+'</strong><br>');
    if(choices.subclass)rows.push('Archetype: <strong style="color:var(--text)">'+esc(choices.subclass)+'</strong><br>');
    if(choices.spells&&choices.spells.length)rows.push('Spells Learned: <strong style="color:var(--text)">'+esc(choices.spells.join(', '))+'</strong><br>');
    if(choices.asi)rows.push('Ability Improvement: <strong style="color:var(--text)">'+esc(choices.asi.replace(/,/g,' & ').replace(/([a-z]+)/g,s=>s.toUpperCase()).replace(/\+/g,' +'))+'</strong><br>');
    if(choices.feat){
      let featStr=choices.feat;
      if(choices.featAbility)featStr+=' (+1 '+choices.featAbility+')';
      rows.push('Feat: <strong style="color:var(--text)">'+esc(featStr)+'</strong><br>');
    }
    if(choices.swapOld&&choices.swapNew)rows.push('Spell Swap: <strong style="color:var(--text)">'+esc(choices.swapOld)+' → '+esc(choices.swapNew)+'</strong><br>');
    if(clsKey==='bard'&&data&&data.slots&&data.slots[newLvl])rows.push('Spell Slots: <strong style="color:var(--text)">'+data.slots[newLvl].map((m,i)=>SPELL_LVLS[i]+': '+m).join(', ')+'</strong><br>');
    rows.push('</div>');
    bodyEl.innerHTML='<div style="padding:12px;background:var(--surface3);border-radius:var(--radius-sm)">'+rows.join('')+'</div>';
    actEl.innerHTML='<button class="btn gold full" style="font-size:15px;padding:14px" onclick="applyLevelUp()">🎉 Level Up!</button>';
  }
}

function applyLevelUp(){
  if(!_luWiz)return;
  const {idx,pc,newLvl,clsKey,data,choices}=_luWiz;
  const p=state.pcs[idx];
  // HP
  p.hp_max=(p.hp_max||0)+choices.hp;
  p.hp=Math.min((p.hp||0)+choices.hp,p.hp_max);
  // Level
  p.level=newLvl;
  // Auto features
  if(choices.autoFeatures&&choices.autoFeatures.length)
    p.features=(p.features?p.features+'\n':'')+choices.autoFeatures.join('\n');
  // Subclass
  if(choices.subclass){
    p.subclass=choices.subclass;
    p.features=(p.features?p.features+'\n':'')+choices.subclass+' (Level '+newLvl+')';
  }
  // ASI or Feat
  if(choices.asiMode==='feat'&&choices.feat){
    p.features=(p.features?p.features+'\n':'')+'[Feat] '+choices.feat;
    const feat=FEATS_DB.find(f=>f.name===choices.feat);
    if(feat&&feat.half&&choices.featAbility){
      const ab=choices.featAbility.toLowerCase();
      const cur=parseInt((p[ab]||'10').split(' ')[0]);
      const nv=Math.min(20,cur+1);
      const mod=Math.floor((nv-10)/2);
      p[ab]=nv+' ('+(mod>=0?'+':'')+mod+')';
    }
  } else if(choices.asi){
    choices.asi.split(',').forEach(part=>{
      const m=part.match(/^([a-z]+)\+(\d)$/);
      if(!m)return;
      const cur=parseInt((p[m[1]]||'10').split(' ')[0]);
      const nv=Math.min(20,cur+parseInt(m[2]));
      const mod=Math.floor((nv-10)/2);
      p[m[1]]=nv+' ('+(mod>=0?'+':'')+mod+')';
    });
  }
  // Spell swap
  if(choices.swapOld&&choices.swapNew&&p.magic){
    const lines=p.magic.split('\n');
    for(let i=0;i<lines.length;i++){
      if(lines[i].includes(choices.swapOld)){
        lines[i]=lines[i].replace(choices.swapOld,choices.swapNew);
        break;
      }
    }
    p.magic=lines.join('\n');
  }
  // Spells
  if(choices.spells&&choices.spells.length)
    p.magic=(p.magic?p.magic+'\n':'')+'[Level '+newLvl+'] '+choices.spells.join(', ');
  // Bard spell slots
  if(clsKey==='bard'&&data&&data.slots&&data.slots[newLvl]){
    p.slots=data.slots[newLvl].map((max,i)=>({max,used:Math.min((p.slots&&p.slots[i]?p.slots[i].used:0),max)}));
  }
  // Clear levelReady
  p.levelReady=false;
  // AI notification
  const parts=[pc.name+' advances to Level '+newLvl+'.'];
  parts.push('New HP max: '+p.hp_max+'.');
  if(choices.autoFeatures&&choices.autoFeatures.length)parts.push('New features: '+choices.autoFeatures.map(f=>f.split(':')[0]).join(', ')+'.');
  if(choices.subclass)parts.push('Chosen archetype: '+choices.subclass+'.');
  if(choices.spells&&choices.spells.length)parts.push('New spells: '+choices.spells.join(', ')+'.');
  if(choices.asiMode==='feat'&&choices.feat){
    let featPart='Feat chosen: '+choices.feat+'.';
    if(choices.featAbility)featPart+=' (+1 '+choices.featAbility+')';
    const feat=FEATS_DB.find(f=>f.name===choices.feat);
    if(feat)featPart+=' Effect: '+feat.desc;
    parts.push(featPart);
  } else if(choices.asi){parts.push('Ability improvement: '+choices.asi+'.');}
  if(choices.swapOld&&choices.swapNew)parts.push('Spell swap: replaced '+choices.swapOld+' with '+choices.swapNew+'.');
  const isTest=!!_luTestSnapshot;
  if(!isTest){
    _ctxInject='[LEVEL UP COMPLETE] '+parts.join(' ')+' Update your full understanding of this character and narrate the advancement when prompted.';
  }
  saveRefresh();
  closeLevelUpModal();
  if(!isTest)toast('🎉 '+pc.name+' is now Level '+newLvl+'!');
  // Re-check all PCs. The current PC may qualify for ANOTHER level (multi-level
  // XP jump — e.g. 2,050 XP clears both the L2 and L3 thresholds), and other PCs
  // may also be ready. checkLevelUp re-sets levelReady + a PENDING ctxInject.
  if(!isTest)state.pcs.forEach(p2=>checkLevelUp(p2));
  const nextIdx=state.pcs.findIndex(p2=>p2.levelReady);
  if(nextIdx>=0){
    // More advancement pending — reopen the wizard. The COMPLETE ctxInject above
    // is overwritten by checkLevelUp's PENDING; the AI sees the final state once
    // the whole chain resolves. Defer the checkpoint until then.
    setTimeout(()=>openLevelUpWizard(nextIdx),800);
  }else if(!isTest){
    // Final level-up in the chain — fire the checkpoint now.
    triggerChk('Level Up: '+pc.name+' → Level '+newLvl);
  }
}

// ═══ SESSION LOG ═══
function renderLogs(){
  const c=document.getElementById('log-entries');if(!c)return;c.innerHTML='';
  state.logs.forEach(function(l){
    const d=document.createElement('div');
    d.className='log-entry '+(l.type||'dm');
    d.style.position='relative';d.style.paddingRight='24px';
    const ts=document.createElement('div');ts.className='log-ts';ts.textContent='['+l.ts+']';
    const body=document.createElement('div');body.textContent=l.body;
    const btn=document.createElement('button');
    btn.className='log-flag-btn';btn.textContent='⚑';btn.title='Flag this entry';
    (function(entry){btn.onclick=function(){openFlagModal(-1,'Log: '+entry.body.slice(0,60));};})(l);
    d.appendChild(ts);d.appendChild(body);d.appendChild(btn);
    c.appendChild(d);
  });
  c.scrollTop=c.scrollHeight;
}
function addLogEntry(){
  const inp=document.getElementById('log-input');const type=document.getElementById('log-type').value;
  if(!inp?.value)return;
  state.logs.push({ts:state.worldData.time,type,body:inp.value});inp.value='';saveRefresh();
}
function clearLog(){if(confirm('Clear session log?')){state.logs=[];saveRefresh();}}
function buildRawSummary(){
  const el=document.getElementById('log-summary');
  if(!(state.logs||[]).length){if(el)el.value='No entries yet.';return;}
  const out=state.logs.map(l=>'['+l.type.toUpperCase()+'] '+l.body).join('\n');
  if(el)el.value=out;state.logSummary=out;save();toast('Summary built.');
}
function scrollStoryTop(){const el=document.getElementById('story-thread-read');if(el)el.scrollTop=0;}
function scrollStoryBottom(){const el=document.getElementById('story-thread-read');if(el)el.scrollTop=el.scrollHeight;}
function renderStoryRead(){
  const rd=document.getElementById('story-thread-read');if(!rd)return;
  const fmt=t=>esc(t).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>');
  const chapters=(state.storyChapters||[]).map(ch=>({title:ch.title,content:ch.content,date:ch.date||''}));
  if(!chapters.length){rd.innerHTML='<p style="color:var(--text-dim);font-style:italic">No chapters yet. Tap ✨ Chapter to have the AI chronicle recent events.</p>';return;}
  const toc=chapters.map((ch,i)=>`<a href="#st-ch-${i}" style="display:block;padding:3px 0;color:var(--gold);font-size:12px;text-decoration:none" onclick="event.preventDefault();document.getElementById('st-ch-${i}').scrollIntoView({behavior:'smooth'})">${esc(ch.title)}${ch.date?'<span style="color:var(--text-dim);margin-left:6px;font-size:10px">'+esc(ch.date)+'</span>':''}</a>`).join('');
  const body=chapters.map((ch,i)=>{
    const paras=ch.content.split(/\n\n+/).map(p=>`<p style="margin:0 0 12px">${fmt(p.replace(/\n/g,'<br>'))}</p>`).join('');
    return `<section id="st-ch-${i}" style="margin-bottom:28px"><h3 style="font-family:var(--display);color:var(--gold-bright);font-size:15px;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid var(--border)">${esc(ch.title)}${ch.date?'<span style="font-size:11px;color:var(--text-dim);font-family:var(--mono);margin-left:8px;font-weight:400">'+esc(ch.date)+'</span>':''}</h3>${paras}</section>`;
  }).join('');
  rd.innerHTML=`<details style="margin-bottom:16px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px" open><summary style="cursor:pointer;font-size:12px;color:var(--gold);font-weight:600;letter-spacing:.5px">📖 CONTENTS (${chapters.length})</summary><div style="margin-top:8px;padding-left:4px">${toc}</div></details>${body}`;
}
async function updateStoryThread(){
  const key=getKey();if(!key){toast('Set an API key first.');return;}
  if(!state.logs.length&&!state.logSummary){toast('No session data yet.');return;}
  toast('📖 Generating story chapter...');
  const logText=state.logs.slice(-50).map(l=>'['+l.type.toUpperCase()+'] '+l.body).join('\n');
  const existing=(state.storyChapters||[]).map((ch,i)=>ch.title+(ch.date?' ('+ch.date+')':'')+': '+ch.content.slice(0,120)+'…').join('\n');
  const chNum=(state.storyChapters||[]).length+1;
  const prompt='Write a new story chapter for this D&D campaign chronicle.\n\nEXISTING CHAPTERS:\n'+(existing||'None yet')+'\n\nRECENT SESSION LOG:\n'+logText+'\n\nOutput ONLY in this exact format (no other text):\n---MECHANICS---\nchapter_add: Chapter '+chNum+': [evocative title] | [3-6 sentences of narrative prose, past tense, third person. Focus on decisions, discoveries, consequences. Skip filler.]\n---END---';
  try{
    const res=await callAI([{role:'user',content:prompt}],'You are a D&D campaign chronicler. Output only the mechanics block.',400);
    const before=(state.storyChapters||[]).length;
    parseMechanics(res);
    if((state.storyChapters||[]).length===before){
      const m=res.match(/chapter_add:\s*(.+)/);
      if(m){const sep=m[1].indexOf('|');const t=sep>-1?m[1].slice(0,sep).trim():m[1].trim();const c=sep>-1?m[1].slice(sep+1).trim():'';if(t&&c){if(!state.storyChapters)state.storyChapters=[];state.storyChapters.push({id:Date.now(),title:t,content:c,date:state.worldData.time||''});save();}}
    }
    renderStoryRead();
    toast('✓ Chapter added!');
  }catch(e){toast('Error: '+e.message);}
}
async function buildAISummary(){
  const key=getKey();if(!key){toast('Set an API key first.');return;}
  if(!(state.logs||[]).length){toast('No log entries.');return;}
  toast('✨ Generating...');
  const logText=state.logs.map(l=>'['+l.type.toUpperCase()+'] '+l.body).join('\n');
  try{
    const res=await callAI([{role:'user',content:'Write a concise 3-5 sentence narrative summary of this D&D session log as a dramatic recap:\n\n'+logText}],'You are a D&D session narrator.',400);
    const el=document.getElementById('log-summary');if(el)el.value=res;
    state.logSummary=res;save();toast('✓ AI summary done!');
  }catch(e){toast('Error: '+e.message);}
}


// ═══ SESSION ARCHIVE ═══
function renderSessionArchive(){
  const el=document.getElementById('session-archive-list');if(!el)return;
  const archive=Array.isArray(state.sessionArchive)?state.sessionArchive:[];
  if(!archive.length){el.innerHTML='<p style="font-size:11px;color:var(--text-dim);text-align:center;padding:12px 0">No archived summaries yet — they appear here as chat gets pruned during play.</p>';return;}
  el.innerHTML='';
  [...archive].reverse().forEach((entry,i)=>{
    const d=new Date(entry.ts);
    const dateStr=d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
    const timeStr=d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
    const gameLabel=entry.gameTs?'<span style="color:var(--gold);font-size:10px;margin-left:6px">⏱ '+esc(entry.gameTs)+'</span>':'';
    const row=document.createElement('details');
    row.style.cssText='border-bottom:1px solid var(--border);padding:6px 0';
    row.innerHTML=`<summary style="font-size:11px;color:var(--text-dim);cursor:pointer;list-style:none;display:flex;align-items:center;gap:4px">`+
      `<span style="flex:1">${dateStr} ${timeStr}${gameLabel}</span>`+
      `<span style="font-size:10px;background:var(--surface3);border-radius:8px;padding:1px 6px">${entry.msgCount||'?'} msgs</span>`+
      `</summary>`+
      `<p style="font-size:12px;line-height:1.7;color:var(--text);margin:8px 0 4px;padding:0 4px">${esc(entry.summary)}</p>`;
    el.appendChild(row);
  });
}

// ═══ MODULE TRACKER ═══
function renderModuleTracker(){
  const list=document.getElementById('module-episode-list');if(!list)return;
  const namEl=document.getElementById('module-campaign-name');
  const bar=document.getElementById('module-progress-bar');
  const refEl=document.getElementById('module-reference');
  if(!Array.isArray(state.moduleProgress))state.moduleProgress=[];
  if(refEl&&refEl.value!==(state.moduleReference||''))refEl.value=state.moduleReference||'';
  const eps=state.moduleProgress;
  const done=eps.filter(e=>e.status==='complete').length;
  const pct=eps.length?Math.round(done/eps.length*100):0;
  if(bar)bar.style.width=pct+'%';
  if(namEl){
    const setting=state.worldData?.setting||'';
    namEl.textContent=(setting?setting.split('\n')[0]:'Campaign Module')+' — '+pct+'% complete ('+done+'/'+eps.length+' episodes)';
  }
  list.innerHTML='';
  eps.forEach((ep,i)=>{
    const col=ep.status==='complete'?'var(--green)':ep.status==='active'?'var(--gold)':'var(--text-dim)';
    const icon=ep.status==='complete'?'✓':ep.status==='active'?'▶':'○';
    const hasContent=!!(ep.content||'').trim();
    const d=document.createElement('div');
    d.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)';
    d.innerHTML=`<span style="color:${col};font-size:14px;flex-shrink:0;width:18px">${icon}</span>`+
      `<input type="text" value="${esc(ep.name)}" style="flex:1;background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0;font-size:12px;color:var(--text)" onchange="updModuleEp(${i},'name',this.value)">`+
      (hasContent?'<span style="font-size:9px;color:var(--gold)">📖</span>':'')+
      `<button class="btn sm" style="font-size:9px;padding:2px 6px" onclick="toggleEpContent(${i})">📄</button>`+
      `<select style="font-size:11px;padding:3px 5px;width:90px;color:${col}" onchange="updModuleEp(${i},'status',this.value)">`+
        `<option value="pending"${ep.status==='pending'?' selected':''}>Pending</option>`+
        `<option value="active"${ep.status==='active'?' selected':''}>▶ Active</option>`+
        `<option value="complete"${ep.status==='complete'?' selected':''}>✓ Done</option>`+
      `</select>`+
      `<button class="btn sm red" onclick="remModuleEp(${i})">✕</button>`;
    list.appendChild(d);
    if(ep.notes||ep.status==='active'){
      const nd=document.createElement('div');
      nd.style.cssText='padding:2px 26px 4px;';
      nd.innerHTML=`<input type="text" value="${esc(ep.notes||'')}" style="width:100%;font-size:10px;background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0;color:var(--text-dim)" placeholder="Short note..." onchange="updModuleEp(${i},'notes',this.value)">`;
      list.appendChild(nd);
    }
    if(ep._showContent){
      const cd=document.createElement('div');
      cd.style.cssText='padding:4px 26px 10px;';
      cd.innerHTML=`<div style="font-size:10px;color:var(--text-dim);margin-bottom:4px">📖 Episode Brief — paste key NPCs, locations, encounters, plot points from the module. <span style="color:var(--gold)">${ep.status==='active'?'Active — injected into AI prompt':'Stored — injected when this episode is active'}</span></div>`+
        `<textarea style="width:100%;min-height:100px;font-size:11px;background:var(--surface);border-color:var(--border)" placeholder="Paste module content for this episode: key NPCs, locations, encounters, plot summary, important dialogue or events..." onchange="updModuleEp(${i},'content',this.value)">${esc(ep.content||'')}</textarea>`;
      list.appendChild(cd);
    }
  });
}
function toggleEpContent(i){
  if(!state.moduleProgress[i])return;
  state.moduleProgress[i]._showContent=!state.moduleProgress[i]._showContent;
  renderModuleTracker();
}
function addModuleEpisode(){
  if(!Array.isArray(state.moduleProgress))state.moduleProgress=[];
  state.moduleProgress.push({name:'New Episode',status:'pending',notes:''});
  save();renderModuleTracker();
}
function updModuleEp(i,k,v){state.moduleProgress[i][k]=v;save();renderModuleTracker();}
function remModuleEp(i){state.moduleProgress.splice(i,1);save();renderModuleTracker();}

// ═══ PDF MODULE IMPORT ═══
var _pdfSections=[];
function _ensurePdfJs(){
  return new Promise((resolve,reject)=>{
    if(window.pdfjsLib){resolve(window.pdfjsLib);return;}
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload=()=>{
      if(window.pdfjsLib){
        window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      }else reject(new Error('pdf.js loaded but pdfjsLib not found'));
    };
    s.onerror=()=>reject(new Error('Failed to load pdf.js from CDN'));
    document.head.appendChild(s);
  });
}
function handleModuleFile(file){
  if(!file){toast('No file selected');return;}
  const ext=file.name.split('.').pop().toLowerCase();
  if(ext==='md'||ext==='txt')handleModuleMD(file);
  else if(ext==='pdf')handleModulePDF(file);
  else toast('Unsupported file type — use .pdf, .md, or .txt');
}
async function handleModuleMD(file){
  const inp=document.getElementById('pdf-upload-input');
  if(inp)inp.value='';
  const status=document.getElementById('pdf-import-status');
  if(!status){toast('❌ UI element missing');return;}
  status.style.display='block';
  status.innerHTML='<div style="padding:8px;font-size:11px;color:var(--gold)">📄 Reading '+esc(file.name)+'…</div>';
  try{
    const text=await file.text();
    const sections=_splitMarkdownSections(text);
    if(!sections.length){toast('No sections found in file');status.style.display='none';return;}
    _pdfSections=sections;
    _renderPDFImport(sections,file.name,sections.reduce((a,s)=>a+s.pageCount,0));
  }catch(err){
    status.innerHTML='<div style="padding:8px;font-size:11px;color:var(--red)">❌ Failed to read file: '+esc(err.message)+'</div>';
  }
}
function _splitMarkdownSections(text){
  const lines=text.split('\n');
  const sections=[];
  let cur=null;let lineNum=0;
  lines.forEach(line=>{
    lineNum++;
    const h1=line.match(/^#\s+(.+)/);
    const h2=line.match(/^##\s+(.+)/);
    const heading=h1||h2;
    if(heading){
      if(cur&&cur.lines.length)sections.push(cur);
      cur={title:heading[1].replace(/\*+/g,'').trim().slice(0,80),startPage:lineNum,lines:[],text:'',depth:h1?1:2};
    }
    if(cur)cur.lines.push(line);
    else{
      cur={title:'Introduction',startPage:1,lines:[line],text:'',depth:0};
    }
  });
  if(cur&&cur.lines.length)sections.push(cur);
  const merged=[];
  sections.forEach(s=>{
    if(s.depth<=1||!merged.length){
      merged.push({title:s.title,startPage:s.startPage,lines:[...s.lines],text:''});
    }else{
      merged[merged.length-1].lines.push(...s.lines);
    }
  });
  return merged.map(s=>{
    s.text=s.lines.join('\n').trim();
    s.endPage=s.startPage+s.lines.length-1;
    s.pageCount=s.lines.length;
    delete s.lines;delete s.depth;
    return s;
  }).filter(s=>s.text.length>0);
}
async function handleModulePDF(file){
  const inp=document.getElementById('pdf-upload-input');
  if(inp)inp.value='';
  if(!file){toast('No file selected');return;}
  const status=document.getElementById('pdf-import-status');
  if(!status){toast('❌ UI element missing');return;}
  status.style.display='block';
  status.innerHTML='<div style="padding:8px;font-size:11px;color:var(--gold)">📄 Loading PDF reader…</div>';
  try{
    const pdfjsLib=await _ensurePdfJs();
    status.innerHTML='<div style="padding:8px;font-size:11px;color:var(--gold)">📄 Reading '+esc(file.name)+'… <span id="pdf-progress">0%</span></div>';
    const buf=await file.arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:buf}).promise;
    const totalPages=pdf.numPages;
    const pages=[];
    for(let i=1;i<=totalPages;i++){
      const page=await pdf.getPage(i);
      const tc=await page.getTextContent();
      let lastY=null;const lines=[];let cur='';
      tc.items.forEach(it=>{
        if(lastY!==null&&Math.abs(it.transform[5]-lastY)>2){
          if(cur.trim())lines.push(cur.trim());cur='';
        }
        cur+=(cur?' ':'')+it.str;lastY=it.transform[5];
      });
      if(cur.trim())lines.push(cur.trim());
      const text=lines.join('\n');
      pages.push({num:i,text});
      const pEl=document.getElementById('pdf-progress');
      if(pEl)pEl.textContent=Math.round(i/totalPages*100)+'%';
    }
    const sections=_splitIntoChapters(pages,file.name);
    _pdfSections=sections;
    _renderPDFImport(sections,file.name,totalPages);
  }catch(err){
    status.innerHTML='<div style="padding:8px;font-size:11px;color:var(--red)">❌ Failed to read PDF: '+esc(err.message)+'</div>';
  }
}

function _splitIntoChapters(pages,filename){
  const chapterPatterns=[
    /^(chapter|episode|part|act|section)\s+(\d+)\s*[:\.\—\-–]\s*(.+)/i,
    /^(chapter|episode|part|act|section)\s+(\d+)\b\s*(.*)/i,
    /^(introduction|appendix\s*[a-z]?|epilogue|prologue|adventure\s+background|adventure\s+overview|adventure\s+hooks?|the\s+story\s+so\s+far|adventure\s+summary|conclusion)\s*[:\.\—\-–]?\s*(.*)/i,
    /^(mission|quest|encounter|objective)\s+(\d+)\s*[:\.\—\-–]\s*(.+)/i,
  ];
  const sections=[];
  let currentSection=null;
  pages.forEach(p=>{
    let matched=false;
    const lines=p.text.split('\n');
    for(const line of lines.slice(0,15)){
      const trimmed=line.trim();
      if(!trimmed||trimmed.length>120)continue;
      for(const pat of chapterPatterns){
        const m=trimmed.match(pat);
        if(m){
          if(currentSection)sections.push(currentSection);
          const title=m[3]?m[1]+' '+m[2]+': '+m[3].trim():m[0].trim();
          currentSection={title:title.slice(0,80),startPage:p.num,pages:[p],text:''};
          matched=true;
          break;
        }
      }
      if(matched)break;
    }
    if(!matched&&!currentSection){
      currentSection={title:'Introduction',startPage:p.num,pages:[p],text:''};
    }else if(!matched&&currentSection){
      currentSection.pages.push(p);
    }
  });
  if(currentSection)sections.push(currentSection);
  sections.forEach(s=>{
    s.text=s.pages.map(p=>p.text).join('\n\n');
    s.endPage=s.pages[s.pages.length-1].num;
    s.pageCount=s.pages.length;
    delete s.pages;
  });
  const avgSize=sections.length?pages.length/sections.length:pages.length;
  if((sections.length<=1&&pages.length>5)||(sections.length>1&&avgSize>40)){
    sections.length=0;
    const chunkSize=Math.max(3,Math.ceil(pages.length/Math.min(12,Math.ceil(pages.length/5))));
    for(let i=0;i<pages.length;i+=chunkSize){
      const chunk=pages.slice(i,i+chunkSize);
      let label='Section '+(Math.floor(i/chunkSize)+1);
      for(const cp of chunk){
        const cLines=cp.text.split('\n');
        for(const cl of cLines.slice(0,10)){
          const ct=cl.trim();
          if(ct.length>=5&&ct.length<=80&&!/^\d+$/.test(ct)){label=ct;break;}
        }
        if(label!=='Section '+(Math.floor(i/chunkSize)+1))break;
      }
      sections.push({
        title:label,
        startPage:chunk[0].num,endPage:chunk[chunk.length-1].num,
        pageCount:chunk.length,
        text:chunk.map(cp=>cp.text).join('\n\n')
      });
    }
  }else if(!sections.length&&pages.length){
    sections.push({
      title:'Full Document',startPage:1,endPage:pages.length,
      pageCount:pages.length,
      text:pages.map(p=>p.text).join('\n\n')
    });
  }
  return sections;
}

function _renderPDFImport(sections,filename,totalPages){
  const status=document.getElementById('pdf-import-status');
  if(!status)return;
  let html='<div style="padding:8px;border:1px solid var(--gold-dim);border-radius:var(--radius-sm);margin-bottom:10px;background:var(--surface)">';
  html+='<div style="font-size:12px;font-weight:600;color:var(--text-bright);margin-bottom:6px">📄 '+esc(filename)+' <span style="font-weight:400;color:var(--text-dim)">('+totalPages+' pages → '+sections.length+' sections detected)</span></div>';
  const hasExisting=(state.moduleProgress||[]).length>0;
  if(hasExisting){
    html+='<div style="padding:8px;margin-bottom:8px;background:var(--surface2);border-radius:4px;display:flex;align-items:center;gap:8px">';
    html+='<label style="font-size:11px;color:var(--text-bright);cursor:pointer"><input type="radio" name="pdf-import-mode" value="replace" checked style="margin-right:4px" onchange="_pdfModeToggle()">Replace current module</label>';
    html+='<label style="font-size:11px;color:var(--text);cursor:pointer"><input type="radio" name="pdf-import-mode" value="add" style="margin-right:4px" onchange="_pdfModeToggle()">Add to current</label>';
    html+='</div>';
  }
  html+='<div style="font-size:10px;color:var(--text-dim);margin-bottom:8px">Map each section to an episode, or load into Module Reference. Unassigned sections are skipped.</div>';
  const epOpts=((state.moduleProgress||[]).map((ep,i)=>'<option class="pdf-ep-opt" value="'+i+'">Ep '+(i+1)+': '+esc(ep.name)+'</option>').join(''));
  const defaultNew=hasExisting||!epOpts;
  sections.forEach((s,si)=>{
    const preview=s.text.slice(0,200).replace(/\n/g,' ')+'…';
    html+='<div style="padding:6px 0;border-bottom:1px solid var(--border)">';
    html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
    html+='<span style="font-size:10px;color:var(--text-dim);flex-shrink:0">§'+( si+1)+'</span>';
    html+='<span style="font-size:11px;color:var(--text-bright);flex:1">'+esc(s.title)+'</span>';
    html+='<span style="font-size:9px;color:var(--text-dim)">pp.'+s.startPage+'–'+s.endPage+' ('+s.pageCount+' pg, '+Math.round(s.text.length/1000)+'k chars)</span>';
    html+='</div>';
    html+='<div style="display:flex;align-items:center;gap:6px">';
    html+='<select id="pdf-assign-'+si+'" style="font-size:10px;padding:2px 4px;flex:1">';
    html+='<option value="">— Skip —</option>';
    html+='<option value="ref">→ Module Reference</option>';
    html+='<option value="new"'+(defaultNew?' selected':'')+'>→ Create New Episode</option>';
    if(!defaultNew)html+=epOpts;
    html+='</select>';
    html+='<button class="btn sm" style="font-size:9px" onclick="previewPDFSection('+si+')">👁</button>';
    html+='</div>';
    html+='<div id="pdf-preview-'+si+'" style="display:none;margin-top:4px;padding:6px;background:var(--surface2);border-radius:4px;font-size:10px;color:var(--text-dim);max-height:150px;overflow-y:auto;white-space:pre-wrap">'+esc(preview)+'</div>';
    html+='</div>';
  });
  html+='<div style="margin-top:10px;display:flex;gap:8px">';
  html+='<button class="btn green" onclick="applyPDFImport()">✓ Import Selected</button>';
  html+='<button class="btn" onclick="autoAssignPDF()">⚡ Auto-Assign</button>';
  html+='<button class="btn red" onclick="cancelPDFImport()">✕ Cancel</button>';
  html+='</div></div>';
  status.innerHTML=html;
  setTimeout(()=>autoAssignPDF(),50);
}

function previewPDFSection(si){
  const el=document.getElementById('pdf-preview-'+si);
  if(!el||!_pdfSections[si])return;
  if(el.style.display==='none'){
    el.style.display='block';
    el.textContent=_pdfSections[si].text.slice(0,2000)+((_pdfSections[si].text.length>2000)?'\n\n… ('+Math.round(_pdfSections[si].text.length/1000)+'k chars total)':'');
  }else{
    el.style.display='none';
  }
}

function autoAssignPDF(){
  if(!_pdfSections.length)return;
  const modeRadio=document.querySelector('input[name="pdf-import-mode"]:checked');
  const replaceMode=modeRadio&&modeRadio.value==='replace';
  const eps=state.moduleProgress||[];
  _pdfSections.forEach((s,si)=>{
    const sel=document.getElementById('pdf-assign-'+si);
    if(!sel)return;
    const titleLow=s.title.toLowerCase();
    if(titleLow.includes('introduction')||titleLow.includes('appendix')||titleLow.includes('prologue')||titleLow.includes('overview')||titleLow.includes('credits')||titleLow.includes('monsters')||titleLow.includes('magic items')){
      sel.value='ref';return;
    }
    if(replaceMode||eps.length===0){
      sel.value='new';return;
    }
    let bestMatch=-1;let bestScore=0;
    eps.forEach((ep,ei)=>{
      const epLow=ep.name.toLowerCase();
      const epWords=epLow.split(/\s+/);
      let score=0;
      epWords.forEach(w=>{if(w.length>3&&titleLow.includes(w))score+=2;});
      const epNum=ep.name.match(/\d+/);
      const secNum=s.title.match(/\d+/);
      if(epNum&&secNum&&epNum[0]===secNum[0])score+=3;
      if(score>bestScore){bestScore=score;bestMatch=ei;}
    });
    if(bestMatch>=0&&bestScore>=2){
      sel.value=String(bestMatch);
    }
  });
  toast('⚡ Auto-assigned — review and adjust before importing');
}

function applyPDFImport(){
  if(!_pdfSections.length)return;
  const modeRadio=document.querySelector('input[name="pdf-import-mode"]:checked');
  const replaceMode=modeRadio&&modeRadio.value==='replace';
  if(replaceMode){
    if(!confirm('This will replace ALL current episodes and module reference with the PDF content. Continue?'))return;
    state.moduleProgress=[];
    state.moduleReference='';
  }
  let imported=0;let refAdded=0;let epsCreated=0;
  _pdfSections.forEach((s,si)=>{
    const sel=document.getElementById('pdf-assign-'+si);
    if(!sel||!sel.value)return;
    if(sel.value==='ref'){
      state.moduleReference=(state.moduleReference||'')+'\n\n=== '+s.title+' ===\n'+s.text;
      refAdded++;imported++;
    }else if(sel.value==='new'){
      if(!Array.isArray(state.moduleProgress))state.moduleProgress=[];
      state.moduleProgress.push({name:s.title,status:'pending',notes:'',content:s.text});
      epsCreated++;imported++;
    }else{
      const idx=parseInt(sel.value);
      if(!isNaN(idx)&&state.moduleProgress[idx]){
        const existing=(state.moduleProgress[idx].content||'').trim();
        state.moduleProgress[idx].content=existing?(existing+'\n\n=== '+s.title+' ===\n'+s.text):s.text;
        imported++;
      }
    }
  });
  if(replaceMode&&state.moduleProgress.length>0)state.moduleProgress[0].status='active';
  if(!replaceMode&&epsCreated&&!(state.moduleProgress||[]).some(e=>e.status==='active')){
    const first=state.moduleProgress.find(e=>e.status==='pending');
    if(first){first.status='active';toast('▶ '+first.name+' set to Active');}
  }
  save();renderModuleTracker();
  const status=document.getElementById('pdf-import-status');
  if(status)status.style.display='none';
  _pdfSections=[];
  toast('📄 '+(replaceMode?'Replaced module: ':'Imported ')+imported+' sections'+(epsCreated?' ('+epsCreated+' new episodes)':'')+(refAdded?' ('+refAdded+' to reference)':''));
}

function cancelPDFImport(){
  _pdfSections=[];
  const status=document.getElementById('pdf-import-status');
  if(status){status.style.display='none';status.innerHTML='';}
}

function _pdfModeToggle(){
  const modeRadio=document.querySelector('input[name="pdf-import-mode"]:checked');
  const replace=modeRadio&&modeRadio.value==='replace';
  const epOpts=(state.moduleProgress||[]).map((ep,i)=>'<option class="pdf-ep-opt" value="'+i+'">Ep '+(i+1)+': '+esc(ep.name)+'</option>').join('');
  for(let si=0;si<_pdfSections.length;si++){
    const sel=document.getElementById('pdf-assign-'+si);
    if(!sel)continue;
    const old=sel.querySelectorAll('.pdf-ep-opt');
    old.forEach(o=>o.remove());
    if(!replace){
      sel.insertAdjacentHTML('beforeend',epOpts);
    }
    if(replace&&sel.value&&sel.value!=='ref'&&sel.value!=='new')sel.value='new';
  }
}

function recalibrateModule(){
  const modName=(state.worldData?.setting||'').split('\n')[0]||'the module';
  const eps=state.moduleProgress||[];
  const epNames=eps.map((e,i)=>'Ep '+(i+1)+': '+e.name).join('\n');
  if(!confirm('⚠️ RECALIBRATE CAMPAIGN\n\nThis will:\n• Reset all episodes to Pending, set Episode 1 to Active\n• Archive current chat to sessionArchive\n• Clear chat history and session summary\n• Inject a fresh Episode 1 opening context\n\nYour characters, gear, wagon, and inventory are kept.\n\nProceed?'))return;

  // Archive current chat before clearing — save full message content
  if((state.chatHistory||[]).length>5){
    if(!Array.isArray(state.sessionArchive))state.sessionArchive=[];
    const msgs=state.chatHistory||[];
    const fullLog=msgs.map(m=>{
      const role=m.role==='assistant'?'DM':m.role==='user'?'PLAYER':'SYSTEM';
      const who=m.playerChar?' ('+m.playerChar+')':m.playerName?' ('+m.playerName+')':'';
      return '['+(m.ts||'')+'] '+role+who+': '+(m.content||'').slice(0,500);
    }).join('\n\n');
    const archiveEntry={
      ts:new Date().toISOString(),
      label:'Pre-recalibration archive ('+msgs.length+' messages)',
      messages:msgs.length,
      summary:'FULL CHAT LOG BEFORE RECALIBRATION:\n\n'+fullLog
    };
    state.sessionArchive.push(archiveEntry);
    if(state.sessionArchive.length>50)state.sessionArchive=state.sessionArchive.slice(-50);
  }

  // Reset episode progress
  (state.moduleProgress||[]).forEach(ep=>{
    ep.status='pending';
    delete ep._showContent;
  });
  if(state.moduleProgress&&state.moduleProgress[0])state.moduleProgress[0].status='active';

  // Clear narrative state
  state.chatHistory=[];
  state.oocHistory=[];
  state.prevSessionSummary='';
  state.logSummary='';
  state.sessionNotes='';

  // Clear stale world state that was fabricated
  state.worldData.time='Day 1, Morning';
  state.worldData.weather='Clear';

  // Build opening context injection
  const activeEp=state.moduleProgress?.[0];
  const pcs=(state.pcs||[]).map(p=>p.name+' ('+p.race+' '+p.class+' '+p.level+')').join(', ');
  const openingCtx='CAMPAIGN RECALIBRATION — FRESH START\n'
    +'Module: '+modName+'\n'
    +'Starting Episode: '+(activeEp?activeEp.name:'Episode 1')+'\n'
    +'Party: '+pcs+'\n\n'
    +'The party is arriving at the start of Episode 1. Use the episode brief in Contract 9 '
    +'to set the scene. Introduce the setting, the immediate situation, and give the party '
    +'a reason to engage. This is the TRUE start of the campaign — any prior narrative is non-canonical.\n\n'
    +'Begin with a vivid opening scene based on the module content.';

  // Inject as system context for next AI message
  if(!state.chatHistory)state.chatHistory=[];
  state.chatHistory.push({
    role:'user',
    content:'[SYSTEM: Campaign recalibrated. Begin '+modName+' from Episode 1. Use the module episode brief to set the opening scene. The party has just arrived at the starting location.]',
    ts:'Day 1, Morning',
    realTs:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
    playerName:'SYSTEM',
    playerChar:''
  });

  // Reset quests to empty (fabricated quests)
  state.quests=[];

  // Reset consequences (fabricated)
  state.consequences=[];

  // Keep NPCs that are from the module, clear fabricated ones
  // We'll keep all NPCs but user can clean up manually

  state._ts=Date.now();
  save();
  setTimeout(()=>{state._ts=Date.now();save();},500);
  renderAll();
  toast('🔄 Campaign recalibrated — Episode 1 active. Send a message to begin!');
}

// ═══ MODULE SCENES ═══
function renderScenes(){
  const c=document.getElementById('scene-list');if(!c)return;
  if(!state.scenes)state.scenes=[];c.innerHTML='';
  if(!(state.scenes||[]).length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:8px">No scenes yet.</div>';return;}
  state.scenes.forEach((scene,idx)=>{
    const isA=idx===state.activeSceneIdx;
    const d=document.createElement('div');d.className='scene-item'+(isA?' active-scene':'');
    d.innerHTML=`<div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;flex-wrap:wrap">
      ${isA?'<span style="font-size:10px;color:var(--gold);font-weight:bold">▶ ACTIVE</span>':''}
      <input type="text" value="${esc(scene.name||'')}" placeholder="Scene name" onchange="updScene(${idx},'name',this.value)" style="flex:1;font-size:11px;background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0;color:var(--gold)">
      <button class="btn sm ${isA?'gold':'green'}" onclick="setScene(${idx})">${isA?'✓ Active':'Set Active'}</button>
      <button class="btn sm purple" onclick="speakScene(${idx})">🔊</button>
      <button class="btn sm red icon-btn" onclick="remScene(${idx})">&times;</button>
    </div>
    <textarea onchange="updScene(${idx},'text',this.value)" style="min-height:80px;font-size:11px" placeholder="Paste room description, read-aloud text, encounter notes...">${esc(scene.text||'')}</textarea>`;
    c.appendChild(d);
  });
}
function addScene(){if(!state.scenes)state.scenes=[];state.scenes.push({name:'New Scene',text:''});save();renderScenes();}
function updScene(i,k,v){state.scenes[i][k]=v;save();}
function remScene(i){state.scenes.splice(i,1);if(state.activeSceneIdx===i)state.activeSceneIdx=-1;else if(state.activeSceneIdx>i)state.activeSceneIdx--;save();renderScenes();}
function setScene(i){state.activeSceneIdx=i;save();renderScenes();toast('✓ Active scene set!');}
function sendSceneToDM(){
  const scene=state.scenes[state.activeSceneIdx];
  if(!scene){toast('No active scene. Set one in Module tab.');return;}
  const inp=document.getElementById('chat-input');
  if(inp){inp.value='[Scene: '+scene.name+']\n'+scene.text;showTab('tab-dm');}
}
function speakScene(idx){const s=state.scenes[idx];if(s)speak(s.text);}
function speakActiveScene(){speakScene(state.activeSceneIdx);}

// ═══ SNIPPETS ═══
function renderSnips(){
  const c=document.getElementById('snip-list');if(!c)return;
  if(!state.snippets)state.snippets=[];c.innerHTML='';
  if(!(state.snippets||[]).length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:8px">No snippets yet.</div>';return;}
  state.snippets.forEach((snip,idx)=>{
    const isA=snip.active!==false;
    const d=document.createElement('div');d.className='snip-item'+(isA?' active-snip':'');
    d.innerHTML=`<div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;flex-wrap:wrap">
      <input type="text" value="${esc(snip.name||'')}" placeholder="Snippet name" onchange="updSnip(${idx},'name',this.value)" style="flex:1;font-size:11px;background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0;color:var(--purple-bright)">
      <label style="display:flex;align-items:center;gap:4px;font-size:10px;cursor:pointer;white-space:nowrap"><input type="checkbox" ${isA?'checked':''} onchange="updSnip(${idx},'active',this.checked)" style="width:auto"> Always Active</label>
      <button class="btn sm red icon-btn" onclick="remSnip(${idx})">&times;</button>
    </div>
    <textarea onchange="updSnip(${idx},'text',this.value)" style="min-height:70px;font-size:11px" placeholder="Paste reference text...">${esc(snip.text||'')}</textarea>`;
    c.appendChild(d);
  });
}
function addSnip(){if(!state.snippets)state.snippets=[];state.snippets.push({name:'New Snippet',text:'',active:true});save();renderSnips();}
function updSnip(i,k,v){state.snippets[i][k]=v;save();renderSnips();}
function remSnip(i){state.snippets.splice(i,1);save();renderSnips();}
function saveDmSecrets(){const el=document.getElementById('dm-secrets');if(el){state.dmSecrets=el.value;save();toast('✓ Secrets saved.');}}

// ═══ LEDGER ═══
function _combatLedgerBlock(){
  if(!state.combat.active)return'';
  let l="COMBAT Round "+state.combat.round+" ("+state.combat.moveMode+" movement):\n";
  const zg={};state.combat.list.forEach(c=>{const z=c.zone||'front';if(!zg[z])zg[z]=[];zg[z].push(c);});
  ZONE_IDS.forEach(zid=>{const zd=state.combat.zones?.[zid];if(!zg[zid]&&zid==='air')return;l+='  ['+(zd?.label||ZONE_LABELS[zid])+']';if(zd?.effect)l+=' {'+zd.effect+'}';if(zd?.terrain)l+=' ['+zd.terrain+']';l+=': ';l+=(zg[zid]||[]).map(c=>(state.combat.list.indexOf(c)===state.combat.currentIdx?'>>>':'')+c.name+' HP:'+c.hp+'/'+c.hp_max+' AC:'+c.ac+(c.conditions?.length?' ('+c.conditions.join(',')+')':'')+(c.concentrating?' (Conc:'+c.concentrating+')':'')).join(', ')||(zid==='air'?'':'(empty)');l+='\n';});
  return l;
}
function _pcCarryWeight(pc){let w=0;(pc.inventory||[]).forEach(i=>w+=(parseFloat(i.weight)||0)*(parseInt(i.qty)||1));return w;}
function _pcCarryCap(pc){const str=parseInt(pc.str)||10;return str*15;}

function genLedger(){
  const fmt=document.getElementById('ledger-fmt')?.value||'compact';
  const pfx=document.getElementById('ledger-prefix')?.value||'';
  const out=document.getElementById('ledger-out');
  // COMPACT MODE — mechanical state only
  if(fmt==='compact'){
    let l="=== CAMPAIGN COMPACT STATE ===\n";
    l+="Location: "+state.worldData.location+" | Time: "+state.worldData.time+" | Weather: "+state.worldData.weather+"\n\n";
    state.pcs.forEach(p=>{
      if(!p.name)return;
      l+=p.name+' ('+p.race+' '+p.class+' Lv'+p.level+'): HP '+p.hp+'/'+p.hp_max+' | AC '+p.ac;
      if((p.conditions||[]).length)l+=' | Conditions: '+p.conditions.join(', ');
      const conc=p.concentrating||'';
      if(conc)l+=' | Concentrating: '+conc;
      if((p.resources||[]).length)l+=' | '+p.resources.map(r=>r.name+': '+(r.max-r.used)+'/'+r.max).join(', ');
      if((p.slots||[]).length)l+=' | Slots: '+p.slots.map((s,i)=>'L'+(i+1)+':'+(s.max-s.used)+'/'+s.max).join(' ');
      const pcW=_pcCarryWeight(p);const pcCap=_pcCarryCap(p);
      if(pcW>0)l+=' | Carry: '+pcW.toFixed(1)+'/'+pcCap+'lb'+(pcW>pcCap?' OVER':'');
      l+='\n';
    });
    const cb=_combatLedgerBlock();if(cb)l+='\n'+cb;
    (state.wagon.animals||[]).forEach(a=>{if(a.name&&a.hp_max>0)l+=a.name+' ('+a.role+'): HP '+a.hp+'/'+a.hp_max+(a.feed?' | Feed: '+a.feed:'')+'\n';});
    l+="Treasury: GP "+state.treasuryData.gp+"\n";
    l+="=== END COMPACT ===";
    if(out){out.value=l;const chars=l.length;const toks=Math.round(chars/4);document.getElementById('ledger-chars').innerText=chars+' chars';document.getElementById('ledger-tokens').innerText='~'+toks+' tokens';}
    return l;
  }
  let l="=== HOARD OF THE DRAGON QUEEN — CAMPAIGN STATE LEDGER ===\n"+pfx+"\n\n";
  l+="━━━ PARTY STATUS ━━━\n";
  state.pcs.forEach(p=>{
    if(!p.name)return;
    l+=p.name+' | Lv '+p.level+' '+p.race+' '+p.class+' | XP '+(p.xp||0)+'/'+XP_T[Math.min(p.level||1,19)]+'\n';
    l+='  HP: '+p.hp+'/'+p.hp_max+' | AC: '+p.ac+' | Speed: '+p.speed+'ft | Init: +'+p.initiative+'\n';
    l+='  STR '+p.str+' DEX '+p.dex+' CON '+p.con+' INT '+p.int+' WIS '+p.wis+' CHA '+p.cha+'\n';
    l+='  Conditions: ['+(p.conditions.length?p.conditions.join(', '):'None')+']\n';
    if(fmt==='full'){
      const _prof=Math.floor(((p.level||1)-1)/4)+2;
      const _mod=s=>{const n=parseInt(p[s])||10;return Math.floor((n-10)/2);};
      const _sk=[['Athletics','str'],['Acrobatics','dex'],['Sleight of Hand','dex'],['Stealth','dex'],['Perception','wis'],['Insight','wis'],['Medicine','wis'],['Animal Handling','wis'],['Survival','wis'],['Persuasion','cha'],['Deception','cha'],['Intimidation','cha'],['Performance','cha'],['Arcana','int'],['History','int'],['Investigation','int'],['Nature','int'],['Religion','int']];
      const _sText=(p.skills||'').toLowerCase();
      const _hasExp=n=>new RegExp(n.toLowerCase()+'[^\\n]*expertise','i').test(_sText);
      const _isProf=n=>new RegExp('\\b'+n+'\\b','i').test(_sText);
      const _skillLine=_sk.filter(([n])=>_isProf(n)).map(([n,s])=>{
        const b=_mod(s);const exp=_hasExp(n);
        const tot=exp?b+(_prof*2):b+_prof;
        return n+' '+(tot>=0?'+':'')+tot+(exp?' (Expertise)':'');
      }).join(', ');
      l+='  Skills: '+(_skillLine||p.skills||'None')+'\n  Features: '+p.features+'\n  Magic: '+p.magic+'\n';
      if(p.slots?.length)p.slots.forEach((s,i)=>l+='  Spell L'+(i+1)+': '+(s.max-s.used)+'/'+s.max+' remaining\n');
      if(p.backstory_motivation)l+='  Motivation: '+p.backstory_motivation+'\n';
      if(p.backstory_secret)l+='  Secret: '+p.backstory_secret+'\n';
      if((p.inventory||[]).length){const iw=_pcCarryWeight(p);const ic=_pcCarryCap(p);l+='  Inventory ('+iw.toFixed(1)+'/'+ic+'lb): '+p.inventory.map(i=>i.name+'(x'+i.qty+', '+((parseFloat(i.weight)||0)*(parseInt(i.qty)||1)).toFixed(1)+'lb)').join(', ')+'\n';}
    }
    l+='\n';
  });
  l+="━━━ WORLD ━━━\n";
  l+='Time: '+state.worldData.time+' | Season: '+state.worldData.season+' | Weather: '+state.worldData.weather+'\n';
  l+='Location: '+state.worldData.location+'\n'+state.worldData.loc_desc+'\n';
  if(state.worldData.scene_title)l+='Scene: '+state.worldData.scene_title+(state.worldData.scene_threat?' ['+state.worldData.scene_threat+']':'')+'\n';
  if(state.worldData.scene_cond)l+='Active Conditions: '+state.worldData.scene_cond+'\n';
  if(state.worldData.setting)l+='Setting: '+state.worldData.setting+'\n';
  if(fmt==='full'){
    l+="\n━━━ TREASURY ━━━\n";
    l+='PP:'+state.treasuryData.pp+' GP:'+state.treasuryData.gp+' EP:'+state.treasuryData.ep+' SP:'+state.treasuryData.sp+' CP:'+state.treasuryData.cp+'\n';
    if((state.partyInventory||[]).length){l+="\n━━━ PARTY INVENTORY ━━━\n";state.partyInventory.forEach(i=>l+='  '+i.name+' x'+i.qty+' ('+i.weight+'lb) ['+i.type+']\n');}
    l+="\n━━━ WAGON & TRANSPORT ━━━\n";
    (state.wagon.animals||[]).forEach(a=>{
      l+=a.role.toUpperCase()+' ('+a.name+'): HP '+(a.hp||0)+'/'+(a.hp_max||0)+' AC '+(a.ac||10)+(a.feed?' | Feed: '+a.feed:'')+(a.conditions&&a.conditions!=='None'?' | '+a.conditions:'')+'\n';
    });
    l+='Cargo Weight: '+calcWeight().toFixed(1)+'/'+getMaxLb()+'lb\n';
    if(state.wagon.cells?.length){l+='Holding Cells:\n';state.wagon.cells.forEach(c=>l+='  ['+c.temperament?.toUpperCase()+'] '+c.name+' ('+c.size+') Escape: '+c.escDC+' Weight: '+c.weight+'lb\n');}
    if(state.wagon.cargo?.length){l+='Cargo:\n';state.wagon.cargo.forEach(i=>l+='  '+i.name+' x'+i.qty+' ['+i.type+'] '+i.weight+'lb\n');}
    if(state.wagon.hoard?.length){l+="Party Hoard:\n";state.wagon.hoard.forEach(i=>l+='  '+i.name+' x'+i.qty+' '+i.weight+'lb\n');}
    l+="\n━━━ QUESTS ━━━\n";
    l+='Main Quest: '+(state.worldData.primaryMission||'')+'\n';
    state.quests.forEach((q,i)=>l+='  ['+(q.status||'active').toUpperCase()+'] '+(i+1)+'. '+q.text+'\n');
    l+="\n━━━ NPCs ━━━\n";
    state.npcs.filter(n=>n.status!=='deceased').forEach(n=>l+='  '+n.name+' ['+n.disposition+']'+(n.hp?' HP:'+n.hp:'')+' — '+n.details+'\n');
    if(state.worldData.plot)l+="\n━━━ PLOT ━━━\n"+state.worldData.plot+'\n';
    if(state.worldData.timers)l+="Timers: "+state.worldData.timers+'\n';
    if(state.logSummary)l+="\n━━━ SESSION SUMMARY ━━━\n"+state.logSummary+'\n';
    if(Array.isArray(state.storyChapters)&&state.storyChapters.length){l+="\n━━━ STORY CHAPTERS ━━━\n";state.storyChapters.forEach((ch,i)=>l+='Chapter '+(i+1)+': '+ch.title+(ch.date?' ('+ch.date+')':'')+'\n');}
  }
  if(state.combat.active){l+="\n━━━ ACTIVE COMBAT — ROUND "+state.combat.round+" ━━━\n";l+="Movement mode: "+state.combat.moveMode+"\n";l+="Zone layout:\n";const zg2={};state.combat.list.forEach(c=>{const z=c.zone||'front';if(!zg2[z])zg2[z]=[];zg2[z].push(c);});ZONE_IDS.forEach(zid=>{const zd=state.combat.zones?.[zid];if(!zg2[zid]&&zid==='air')return;l+='  ['+(zd?.label||ZONE_LABELS[zid])+']';if(zd?.effect)l+=' Effect: '+zd.effect;if(zd?.terrain)l+=' Terrain: '+zd.terrain;l+='\n';(zg2[zid]||[]).forEach((c,i)=>{l+='    '+(state.combat.list.indexOf(c)===state.combat.currentIdx?'>>> ':'')+c.val+' '+c.name+' HP:'+c.hp+'/'+c.hp_max+' AC:'+c.ac;if(c.conditions?.length)l+=' ['+c.conditions.join(', ')+']';if(c.concentrating)l+=' (Conc: '+c.concentrating+')';l+='\n';});});l+="Adjacency: Front↔Left, Front↔Right, Front↔Back, Front↔Air, Back↔Rear\n";}
  const as=state.scenes?.[state.activeSceneIdx];if(as)l+="\n━━━ ACTIVE SCENE: "+as.name+" ━━━\n"+as.text+'\n';
  if(Array.isArray(state.moduleProgress)&&state.moduleProgress.length){
    const activeEp=state.moduleProgress.find(e=>e.status==='active');
    const done=state.moduleProgress.filter(e=>e.status==='complete').length;
    l+="\n━━━ CAMPAIGN PROGRESS ━━━\n";
    l+="Module: "+(state.worldData.setting?.split('\n')[0]||'Hoard of the Dragon Queen')+"\n";
    l+="Progress: "+done+"/"+state.moduleProgress.length+" episodes complete\n";
    if(activeEp)l+="Current: "+activeEp.name+(activeEp.notes?' — '+activeEp.notes:'')+"\n";
    state.moduleProgress.forEach((ep,i)=>{if(ep.status!=='pending')l+="  ["+(ep.status==='complete'?'✓':ep.status==='active'?'▶':' ')+"] Ep "+(i+1)+": "+ep.name+"\n";});
  }
  l+="\n=== END LEDGER ===";
  // Extra sections: town rep, business profile, campaign secrets, relationships
  let extra='';
  if((state.worldData.townReputation||[]).length){
    extra+='\n━━━ TOWN REPUTATION ━━━\n';
    state.worldData.townReputation.forEach(t=>{extra+=`  ${t.town}: ${t.status.toUpperCase()}${t.notes?' — '+t.notes:''}\n`;});
    const burned=(state.worldData.townReputation||[]).filter(t=>t.status==='burned'||t.status==='fled');
    if(burned.length){
      extra+='\n━━━ REPUTATION RIPPLE ━━━\n';
      extra+='Word of what happened in the following location(s) has spread along trade routes:\n';
      burned.forEach(t=>{extra+=`  • ${t.town} (${t.status.toUpperCase()})${t.notes?' — '+t.notes:''}\n`;});
      extra+='When the party interacts with travelers, merchants, or guards who plausibly travel these routes, call for an Insight DC 12 to sense if the NPC recognizes them or has heard rumors. Do not make this automatic — it should arise naturally from context.\n';
    }
  }
  const bp=state.worldData.businessProfile;
  if(bp&&(bp.realStock||bp.snakeOil)){
    extra+='\n━━━ BUSINESS PROFILE ━━━\n';
    extra+=`Operation: ${state.wagon.wagonName||"The Shelled Alchemist"}\n`;
    if(bp.realStock)extra+=`Real stock: ${bp.realStock}\n`;
    if(bp.snakeOil)extra+=`Snake oil: ${bp.snakeOil}\n`;
    if(bp.reputation)extra+=`Reputation: ${bp.reputation}\n`;
  }
  const playerSecrets=(state.worldData.campaignSecrets||[]).filter(s=>s.playerKnown&&!s.pending);
  if(playerSecrets.length){
    extra+='\n━━━ ACTIVE CAMPAIGN THREADS ━━━\n';
    playerSecrets.forEach(s=>{extra+=`  - ${s.text}\n`;});
  }
  const pubRels=(state.relationships||[]).filter(r=>!r.aiOnly&&r.dynamic);
  if(pubRels.length){
    extra+='\n━━━ PARTY RELATIONSHIPS ━━━\n';
    pubRels.forEach(r=>{const fromPc=state.pcs.find(p=>p.id===r.from);extra+=`  ${fromPc?.name||r.from} → ${r.to} [${r.disposition}]: ${r.dynamic}\n`;});
  }
  const activeConseq=(state.consequences||[]).filter(cs=>!cs.resolved);
  if(activeConseq.length){
    extra+='\n━━━ WORLD CONSEQUENCES (active) ━━━\n';
    activeConseq.forEach(cs=>{extra+=`  [${cs.type||'background'}] ${cs.text}${cs.location?' ('+cs.location+')':''}\n`;});
    extra+='These are unresolved story ripples. Reference and escalate them as appropriate.\n';
  }
  if(extra)l=l.replace('=== END LEDGER ===',extra+'=== END LEDGER ===');
  if(out){out.value=l;const chars=l.length;const toks=Math.round(chars/4);document.getElementById('ledger-chars').innerText=chars+' chars';document.getElementById('ledger-tokens').innerText='~'+toks+' tokens'+(toks>7000?' ⚠ Large — consider Combat format':'');}
  return l;
}

// ═══ IMPORT / EXPORT ═══
let _resetMode='campaign';
function openResetModal(mode){
  _resetMode=mode;
  const title=document.getElementById('reset-modal-title');
  const desc=document.getElementById('reset-modal-desc');
  const confirmRow=document.getElementById('reset-confirm-row');
  const confirmBtn=document.getElementById('reset-confirm-btn');
  const confirmInput=document.getElementById('reset-confirm-input');
  if(mode==='campaign'){
    title.textContent='🌅 New Campaign';
    desc.textContent='Wipes all session data — chat, quests, NPCs, travel log, treasury, conditions. Character sheets, inventory, backstory, and AI contracts are preserved. Starting gold will be reset to the amount you enter.';
    confirmRow.style.display='none';
    confirmBtn.disabled=false;
    confirmBtn.className='btn gold';
  } else {
    title.textContent='⚠ Full Reset';
    desc.textContent='Wipes all session data AND character progress — XP, inventory, backstory, relationships. Stats, features, and AI contracts are preserved. Type RESET to confirm.';
    confirmRow.style.display='block';
    if(confirmInput)confirmInput.value='';
    confirmBtn.disabled=true;
    confirmBtn.className='btn';
  }
  document.getElementById('reset-gold-input').value='15';
  openModal('reset-modal');
}
function checkResetConfirm(){
  const val=document.getElementById('reset-confirm-input')?.value||'';
  const btn=document.getElementById('reset-confirm-btn');
  if(btn){btn.disabled=val!=='RESET';btn.className=val==='RESET'?'btn red':'btn';}
}
function executeReset(){
  const gold=parseInt(document.getElementById('reset-gold-input')?.value)||15;
  closeModal('reset-modal');
  resetState(_resetMode, gold);
}
function resetState(mode, startingGold){
  let cleanPCs;
  if(mode==='full'){
    cleanPCs=[
      {id:'pc1',name:'',race:'',class:'Fighter',level:1,background:'',alignment:'',
       hp:10,hp_max:10,ac:10,initiative:0,speed:30,passive_perception:10,passive_insight:10,
       xp:0,color:'#c04a3a',str:'10 (+0)',dex:'10 (+0)',con:'10 (+0)',int:'10 (+0)',wis:'10 (+0)',cha:'10 (+0)',
       skills:'',features:'',magic:'',resources:[],conditions:[],slots:[],inventory:[],
       backstory_origin:'',backstory_motivation:'',backstory_secret:'',pending:[]},
      {id:'pc2',name:'',race:'',class:'Wizard',level:1,background:'',alignment:'',
       hp:6,hp_max:6,ac:10,initiative:0,speed:30,passive_perception:10,passive_insight:10,
       xp:0,color:'#4a7090',str:'10 (+0)',dex:'10 (+0)',con:'10 (+0)',int:'10 (+0)',wis:'10 (+0)',cha:'10 (+0)',
       skills:'',features:'',magic:'',resources:[],conditions:[],slots:[],inventory:[],
       backstory_origin:'',backstory_motivation:'',backstory_secret:'',pending:[]},
      {id:'pc3',name:'',race:'',class:'Bard',level:1,background:'',alignment:'',
       hp:8,hp_max:8,ac:10,initiative:0,speed:30,passive_perception:10,passive_insight:10,
       xp:0,color:'#7060a0',str:'10 (+0)',dex:'10 (+0)',con:'10 (+0)',int:'10 (+0)',wis:'10 (+0)',cha:'10 (+0)',
       skills:'',features:'',magic:'',resources:[],conditions:[],slots:[],inventory:[],
       backstory_origin:'',backstory_motivation:'',backstory_secret:'',pending:[]}
    ];
  } else {
    const canonical=getCanonicalPCs();
    cleanPCs=canonical.map(function(pc){
      const clean=JSON.parse(JSON.stringify(pc));
      clean.hp=clean.hp_max;
      clean.conditions=[];
      clean.concentrating='';
      if(clean.resources)clean.resources.forEach(function(r){r.used=0;});
      if(clean.slots)clean.slots.forEach(function(s){s.used=0;});
      return clean;
    });
  }
  // Build clean world data
  const cleanWorld={
    time:'Day 1, 9:00 AM',season:'Early Spring',weather:'Clear',
    illum:'Bright Daylight',
    location:'PENDING — Set starting location',
    loc_desc:'',
    setting:'PENDING — Campaign setting to be established through play.',
    plot:'',secrets:'',timers:'',
    premise:state.worldData.premise||'',
    premiseLocked:false,
    primaryMission:'PENDING — To be established through play.',
    travelLog:[],townReputation:[],
    businessProfile:mode==='full'?{}:(state.worldData.businessProfile||{}),
    campaignSecrets:mode==='full'?[
      {text:"PC 1 secret: PENDING",playerKnown:false,pending:true},
      {text:"PC 2 secret: PENDING",playerKnown:false,pending:true},
      {text:"PC 3 secret: PENDING",playerKnown:false,pending:true}
    ]:(state.worldData.campaignSecrets||[])
  };
  // Build clean relationships
  const cleanRels=mode==='full'?[
    {from:'pc1',to:'pc2',disposition:'neutral',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'pc1',to:'pc3',disposition:'neutral',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'pc2',to:'pc1',disposition:'neutral',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'pc2',to:'pc3',disposition:'neutral',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'pc3',to:'pc1',disposition:'neutral',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'pc3',to:'pc2',disposition:'neutral',dynamic:'PENDING',aiOnly:false,pending:true}
  ]:(state.relationships||[]);
  // Preserve wagon canonical data
  const cleanWagon=JSON.parse(JSON.stringify(state.wagon));
  cleanWagon.hp=cleanWagon.hp_max;
  cleanWagon.conditions='';
  cleanWagon.cells=[];
  if(mode==='full'){
    cleanWagon.cargo=[];
    cleanWagon.hoard=[];
    cleanWagon.ox={name:'(No draft animal)',hp:0,hp_max:0,ac:10,conditions:'None',feed:'N/A',
      backstory:'No mount or draft animal yet. Acquire one through play.',
      personality:'',bonds:{},quirks:[],experimentLog:''};
    cleanWagon.wagonName='No wagon yet';
    cleanWagon.wagonDesc='The party is traveling on foot. A cart or wagon may be acquired through play.';
  }
  // Apply clean state
  state.pcs=cleanPCs;
  state.worldData=cleanWorld;
  state.relationships=cleanRels;
  state.wagon=cleanWagon;
  state.npcs=[];
  state.quests=[
    {text:'PENDING — Primary quest to be established through play.',done:false,pending:true,status:'active',hidden:false},
    {text:'PENDING — Secondary objectives to be established through play.',done:false,pending:true,status:'active',hidden:false}
  ];
  state.treasuryData={pp:0,gp:startingGold,ep:0,sp:0,cp:0,
    lifestyle:'Modest (traveling adventurers, 1 gp/day shared)',
    incomeLog:[{desc:'Starting funds — party pool',amt:startingGold,type:'in',ts:'Day 1, Dusk',category:'startup'}]
  };
  state.partyInventory=mode==='full'?[
    {name:'Rations',qty:10,weight:20,type:'supply',notes:'Shared party supply. ~3 days for three people.'},
    {name:'Rope (50ft, hempen)',qty:1,weight:10,type:'supply',notes:''},
    {name:'Torches',qty:10,weight:10,type:'supply',notes:'Bright light 20ft, dim light 20ft. Burns 1 hour.'},
    {name:'Waterskins',qty:3,weight:15,type:'supply',notes:'One per party member.'}
  ]:state.partyInventory;
  state.chatHistory=[];
  state.logs=[{ts:'Day 1, Dusk',type:'dm',body:"Hoard of the Dragon Queen — "+(mode==='full'?'Full Reset':'New Campaign')+". Party is ready. Set your starting location and run Session Zero to begin."}];
  state.logSummary='';
  state.storyChapters=[];
  state.campaignLaunched=false;
  state.prevSessionSummary='';
  state.combat={active:false,round:1,currentIdx:0,list:[]};
  state.chkHistory=[];
  state.rewindStack=[];
  state.turnCount=0;state.turnsSince=0;state.chkCount=0;state.msgsSinceChk=0;
  state.scenes=[];state.activeSceneIdx=-1;
  state.dmSecrets='';
  state.oocHistory=[];
  state.partyChat=[];
  state.snippets=[];
  state.consequences=[];
  if(mode==='full'){
    state.moduleProgress=[];
    state.moduleReference='';
    state.campaignSetup={};
    state.sessionArchive=[];
    state.locations=[];
    state.sessionNotes='';
    state.errorLog=[];
    state.aiContracts={};
    state.quickActions=[];
  }
  save();
  if(window.fbSave)fbSave();
  renderAll();genLedger();
  toast('✓ '+(mode==='full'?'Full reset complete.':'New campaign started.')+" Set your location and run Session Zero.");
}
function exportConfig(){
  try{
    const json=JSON.stringify(state,null,2);
    const blob=new Blob([json],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const loc=(state.worldData?.location||'unknown').replace(/[^a-z0-9]/gi,'_').toLowerCase().slice(0,24);
    const a=document.createElement('a');a.href=url;a.download='hotdq_save_'+loc+'.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
    toast('✓ Full save exported to Downloads.');
  }catch(e){
    try{navigator.clipboard.writeText(JSON.stringify(state));toast('✓ Save copied to clipboard.');}
    catch(e2){toast('Export failed: '+e2.message,'error');}
  }
}
function copyStateCompact(){
  try{
    // Deep copy — never mutate the live state object
    const compact=JSON.parse(JSON.stringify(state));
    compact.chatHistory=[];
    compact.logs=[];
    compact.chkHistory=[];
    compact.rewindStack=[];
    compact.snippets=[];
    if(compact.pcs)compact.pcs=compact.pcs.map(function(pc){
      pc.backstory_origin='';
      pc.backstory_motivation='';pc.backstory_secret='';
      pc.skills=pc.skills?pc.skills.substring(0,80):'';
      return pc;
    });
    if(compact.worldData){
      compact.worldData.secrets='';compact.worldData.plot='';
      compact.worldData.travelLog=compact.worldData.travelLog?compact.worldData.travelLog.slice(-3):[];
    }
    if(compact.npcs)compact.npcs=compact.npcs.map(function(n){return {name:n.name,disposition:n.disposition,status:n.status};});
    const json=JSON.stringify(compact);
    navigator.clipboard.writeText(json).then(()=>{
      toast('✓ Compact state copied — paste on any device. No chat history included.');
    }).catch(()=>{
      const ta=document.createElement('textarea');
      ta.value=json;ta.style.position='fixed';ta.style.top='-999px';
      document.body.appendChild(ta);ta.select();document.execCommand('copy');
      document.body.removeChild(ta);
      toast('✓ Compact state copied to clipboard.');
    });
  }catch(e){toast('Copy failed: '+e.message,'error');}
}
function importConfig(el){
  const file=el.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{const p=JSON.parse(e.target.result);if(p?.pcs?.length>=1){migrate(p);state=p;saveRefresh();toast('✓ Imported!');}else alert('Invalid save file.');}
    catch(err){alert('Error: '+err.message);}
  };
  reader.readAsText(file);el.value='';
}
function _convertGeminiPCs(chars){
  const colors=['#c04a3a','#4a7090','#7060a0','#60a070','#a07060'];
  return chars.map((c,i)=>{
    const abs=c.ability_scores||{};
    const fmt=k=>{const a=abs[k];return a?(a.score+' ('+(a.modifier>=0?'+':'')+a.modifier+')'):'10 (+0)';};
    const profs=c.proficiencies||{};
    const saves=(profs.saving_throws||[]).map(s=>s.slice(0,3).toUpperCase()+' Save');
    const skillList=(profs.skills||[]).map(sk=>{
      const ability={'Arcana':'int','History':'int','Investigation':'int','Nature':'int','Religion':'int','Perception':'wis','Insight':'wis','Survival':'wis','Medicine':'wis','Animal Handling':'wis','Athletics':'str','Acrobatics':'dex','Sleight of Hand':'dex','Stealth':'dex','Deception':'cha','Intimidation':'cha','Performance':'cha','Persuasion':'cha'};
      const ab=ability[sk]||'cha';const mod=(abs[ab]?.modifier||0)+2;
      return sk+' '+(mod>=0?'+':'')+mod;
    }).join(', ');
    const feats=(c.features||[]).map(f=>f.name.toUpperCase()+': '+f.description).join('\n');
    let magic='';
    if(c.spells){
      const sp=c.spells;const ab=c.class==='Wizard'?'Intelligence':c.class==='Bard'?'Charisma':c.class==='Cleric'||c.class==='Druid'?'Wisdom':'Charisma';
      const mod=c.class==='Wizard'?(abs.int?.modifier||0):c.class==='Bard'?(abs.cha?.modifier||0):(abs.wis?.modifier||0);
      const dc=8+2+mod;const atk=2+mod;
      magic='Spellcasting: '+ab+' | Save DC: '+dc+' | Attack Bonus: +'+(atk>=0?atk:0);
      if(sp.cantrips?.length)magic+='\nCantrips: '+sp.cantrips.join(', ');
      const l1=sp.prepared_level_1||sp.known_level_1||sp.level_1||[];
      if(l1.length)magic+='\nLevel 1 Spells: '+l1.join(', ');
    }
    const resources=(c.resources||[]).filter(r=>r.name!=='Level 1 Spell Slots'&&r.name!=='Level 2 Spell Slots').map(r=>({
      name:r.name,max:r.max||1,used:(r.max||1)-(r.current||0),
      restore:['Second Wind','Breath Weapon','Action Surge'].includes(r.name)?'short':'long',
      desc:((c.features||[]).find(f=>f.name===r.name)||{}).description||''
    }));
    const slotRes=(c.resources||[]).filter(r=>r.name&&r.name.includes('Spell Slot'));
    const slots=slotRes.map(r=>({max:r.max||0,used:(r.max||0)-(r.current||0)}));
    const inv=(c.equipment||[]).map(e=>({name:e.item||e.name,qty:e.quantity||1,weight:e.weight_lbs||e.weight||0,type:'supply',notes:''}));
    return {
      id:c.id||'pc'+(i+1),name:c.name||'',race:c.species||c.race||'',class:c.class||'',level:c.level||1,
      background:c.background||'',alignment:c.alignment||'',
      hp:c.hp?.current??c.hp??10,hp_max:c.hp?.max??c.hp_max??10,ac:c.ac||10,
      initiative:c.initiative||0,speed:c.speed||30,
      passive_perception:10+(abs.wis?.modifier||0)+((profs.skills||[]).includes('Perception')?2:0),
      passive_insight:10+(abs.wis?.modifier||0)+((profs.skills||[]).includes('Insight')?2:0),
      str:fmt('str'),dex:fmt('dex'),con:fmt('con'),int:fmt('int'),wis:fmt('wis'),cha:fmt('cha'),
      skills:skillList,features:feats,magic,resources,conditions:[],slots,inventory:inv,
      backstory_origin:'',backstory_motivation:'',backstory_secret:'',
      pending:[],concentrating:'',spellbook:[],familiar:null,
      skillProfs:saves,death_saves:{successes:0,failures:0},
      inspiration:false,hp_temp:0,exhaustion:0,hd_used:0,
      personality:'',ideals:'',bonds:'',flaws:'',
      languages:profs.languages||[],color:colors[i]||'#c04a3a',xp:c.xp||0,sheetLocked:true
    };
  });
}
function importFromPaste(){
  const raw=document.getElementById('paste-json')?.value?.trim()||'';
  const errEl=document.getElementById('paste-err');
  if(!raw){if(errEl){errEl.textContent='Nothing pasted.';errEl.style.display='block';}return;}
  try{
    let p=JSON.parse(raw);
    const errShow=(msg)=>{if(errEl){errEl.textContent=msg;errEl.style.display='block';}};
    // Auto-detect Gemini format and convert
    if(p?.characters&&Array.isArray(p.characters)&&!p.pcs){
      p={pcs:_convertGeminiPCs(p.characters)};
      toast('🔄 Converted from Gemini format');
    }
    // Detect partial vs full save
    const hasCore=p?.pcs?.length>=1&&p?.worldData&&p?.wagon;
    const hasPcsOnly=p?.pcs?.length>=1&&!p?.worldData;
    const hasWagonOnly=p?.wagon&&!p?.pcs;
    if(hasCore){
      // Full save — confirm before replacing
      const summary='Replace full save? This will update: '+Object.keys(p).join(', ')+'.';
      if(!confirm(summary+' Your current save will be overwritten.'))return;
      migrate(p);state=p;
    }else if(hasPcsOnly){
      // PC patch only — merge, preserve everything else
      if(!confirm('Update '+p.pcs.length+' character sheet(s) only? Everything else (world, wagon, chat, inventory) will be preserved.'))return;
      // Merge PCs
      p.pcs.forEach(newPc=>{
        const idx=state.pcs.findIndex(pc=>pc.id===newPc.id||pc.name===newPc.name);
        if(idx>-1){
          const existing=state.pcs[idx];
          const isBlank=!existing.name;
          if(isBlank){
            state.pcs[idx]=newPc;
          } else {
            const preserved={hp:existing.hp,xp:existing.xp,conditions:existing.conditions,inventory:existing.inventory,slots:existing.slots,resources:existing.resources};
            state.pcs[idx]={...newPc,...preserved};
          }
        }
        else state.pcs.push(newPc);
      });
    }else if(p?.worldData&&!p?.pcs){
      if(!confirm('Update world data only? PCs and wagon will be preserved.'))return;
      Object.assign(state.worldData,p.worldData);
    }else{
      throw new Error('Unrecognised format. Expected full save, pcs array, or worldData object.');
    }
    saveRefresh();
    document.getElementById('paste-json').value='';
    if(errEl)errEl.style.display='none';
    closeModal('paste-modal');
    toast('✓ '+(hasCore?'Full save':'Partial patch')+' loaded!');
  }catch(err){if(errEl){errEl.textContent='JSON Error: '+err.message;errEl.style.display='block';}}
}
function getCanonicalPCs(){
  // Returns fresh canonical PC definitions — used for version merge
  // These are the source of truth for sheet fields and starting inventory
  return JSON.parse(JSON.stringify(state.pcs.map(function(pc){
    // Return from INITIAL_PCS if available, else current state
    if(window.INITIAL_PCS){
      var found=window.INITIAL_PCS.find(function(p){return p.id===pc.id;});
      if(found)return found;
    }
    return pc;
  })));
}
function showSetupStep(n){
  for(let i=0;i<5;i++){
    const p=document.getElementById('setup-step-'+i);
    const b=document.getElementById('setup-btn-'+i);
    if(p)p.style.display=i===n?'block':'none';
    if(b)b.classList.toggle('active',i===n);
  }
  if(n===1)renderSetupPCCards();
  if(n===4){renderPlugins();}
  loadSetupFields();
}
function loadSetupFields(){
  const wd=state.worldData||{};
  const setup=state.campaignSetup||{};
  const f=(id,val)=>{const el=document.getElementById(id);if(el&&val!==undefined)el.value=val;};
  f('setup-tone',setup.tone||'');
  f('setup-origin',setup.origin||'');
  f('setup-goal',setup.goal||'');
  f('setup-lines',setup.lines||'');
  f('setup-premise',wd.premise||'');
  f('setup-setting',wd.setting||'');
  f('setup-mission',wd.primaryMission||'');
  f('setup-factions',wd.plot||'');
  f('setup-secrets',wd.secrets||'');
  f('setup-wagon-name',state.wagon?.wagonName||'');
  f('setup-cover',state.wagon?.wagonDesc||'');
  f('setup-gold',state.treasuryData?.gp||15);
}
function saveSetup(){
  if(!state.campaignSetup)state.campaignSetup={};
  const g=(id)=>document.getElementById(id)?.value||'';
  state.campaignSetup.tone=g('setup-tone');
  state.campaignSetup.origin=g('setup-origin');
  state.campaignSetup.goal=g('setup-goal');
  state.campaignSetup.lines=g('setup-lines');
  save();
}
function renderSetupPCCards(){
  const el=document.getElementById('setup-pc-cards');
  if(!el)return;
  try{
    el.innerHTML='';
    state.pcs.forEach(function(pc,idx){
      const col=pc.color||'var(--gold)';
      const div=document.createElement('div');
      div.className='panel';
      div.style.borderColor=col;
      div.style.marginBottom='16px';

      // header
      div.innerHTML=
        '<div class="panel-title" style="color:'+col+'">'+
          esc(pc.name)+' — '+esc(pc.race)+' '+esc(pc.class)+' Lv.'+(pc.level||1)+
          '<span style="margin-left:auto;display:flex;align-items:center;gap:8px">'+
            '<label class="field-label" style="margin:0;font-size:9px">Color</label>'+
            '<input type="color" id="sp-col-'+idx+'" value="'+(pc.color||'#5a8a5a')+'" style="width:32px;height:26px;padding:1px;cursor:pointer;background:none;border:1px solid var(--border);border-radius:2px">'+
            '<button class="btn sm red" onclick="delChar('+idx+')" style="font-size:10px">✕ Remove</button>'+
          '</span>'+
        '</div>'+

        // identity
        '<div class="sec-label" style="margin-bottom:6px">Identity</div>'+
        '<div class="form-row">'+
          '<div class="fg"><label class="field-label">Name</label><input type="text" id="sp-name-'+idx+'" value="'+esc(pc.name)+'"></div>'+
          '<div class="fg"><label class="field-label">Race</label><input type="text" id="sp-race-'+idx+'" value="'+esc(pc.race||'')+'"></div>'+
          '<div class="fg"><label class="field-label">Class</label><input type="text" id="sp-class-'+idx+'" value="'+esc(pc.class||'')+'"></div>'+
          '<div style="width:60px"><label class="field-label">Level</label><input type="number" id="sp-level-'+idx+'" value="'+(pc.level||1)+'" min="1" max="20"></div>'+
        '</div>'+
        '<div class="form-row">'+
          '<div class="fg"><label class="field-label">Background</label><input type="text" id="sp-bg-'+idx+'" value="'+esc(pc.background||'')+'"></div>'+
          '<div class="fg"><label class="field-label">Alignment</label><input type="text" id="sp-align-'+idx+'" value="'+esc(pc.alignment||'')+'"></div>'+
        '</div>'+

        // combat stats
        '<div class="sec-label" style="margin-bottom:6px;margin-top:4px">Combat Stats</div>'+
        '<div class="form-row">'+
          '<div style="width:68px"><label class="field-label">Max HP</label><input type="number" id="sp-hp-'+idx+'" value="'+(pc.hp_max||10)+'"></div>'+
          '<div style="width:55px"><label class="field-label">AC</label><input type="number" id="sp-ac-'+idx+'" value="'+(pc.ac||10)+'"></div>'+
          '<div style="width:65px"><label class="field-label">Initiative</label><input type="number" id="sp-init-'+idx+'" value="'+(pc.initiative||0)+'"></div>'+
          '<div style="width:60px"><label class="field-label">Speed</label><input type="number" id="sp-spd-'+idx+'" value="'+(pc.speed||30)+'"></div>'+
          '<div class="fg"><label class="field-label">Pass. Perception</label><input type="number" id="sp-pp-'+idx+'" value="'+(pc.passive_perception||10)+'"></div>'+
          '<div class="fg"><label class="field-label">Pass. Insight</label><input type="number" id="sp-pi-'+idx+'" value="'+(pc.passive_insight||10)+'"></div>'+
        '</div>'+

        // ability scores
        '<div class="sec-label" style="margin-bottom:6px;margin-top:4px">Ability Scores</div>'+
        '<div class="stat-mini-row" style="margin-bottom:12px">'+
          ['str','dex','con','int','wis','cha'].map(function(s){
            return '<div><label class="field-label">'+s.toUpperCase()+'</label>'+
              '<input type="text" id="sp-'+s+'-'+idx+'" value="'+esc(pc[s]||'10 (+0)')+'" style="font-size:11px;padding:4px 5px"></div>';
          }).join('')+
        '</div>'+

        // AI DM context
        '<div class="sec-label" style="margin-bottom:6px;margin-top:4px">AI DM Context</div>'+
        '<div class="form-group"><label class="field-label">Skills &amp; Proficiencies</label>'+
          '<textarea id="sp-skills-'+idx+'" style="min-height:44px"></textarea></div>'+
        '<div class="form-group"><label class="field-label">Features, Feats &amp; Class Abilities</label>'+
          '<textarea id="sp-feat-'+idx+'" style="min-height:80px"></textarea></div>'+
        '<div class="form-group"><label class="field-label">Spellcasting</label>'+
          '<textarea id="sp-magic-'+idx+'" style="min-height:44px"></textarea></div>'+

        // backstory
        '<details class="bs" style="margin-top:4px">'+
          '<summary>📖 Backstory &amp; Roleplay Hooks</summary>'+
          '<div class="bs-body">'+
            '<div class="form-group"><label class="field-label">Origin / Background Story</label>'+
              '<textarea id="sp-origin-'+idx+'" style="min-height:50px"></textarea></div>'+
            '<div class="form-group"><label class="field-label">Motivation (what drives them)</label>'+
              '<textarea id="sp-motiv-'+idx+'" style="min-height:50px;border-color:var(--gold-dim)"></textarea></div>'+
            '<div class="form-group"><label class="field-label">Secret / Flaw (AI DM knows, players may not)</label>'+
              '<textarea id="sp-secret-'+idx+'" style="min-height:50px;border-color:var(--red-dim)"></textarea></div>'+
          '</div>'+
        '</details>'+

        // save button
        '<div style="margin-top:12px;display:flex;justify-content:flex-end">'+
          '<button class="btn sm gold" onclick="saveSetupPC('+idx+')">✓ Save Character</button>'+
        '</div>';

      el.appendChild(div);

      // Set textarea values directly — innerHTML doesn't reliably populate textareas on mobile
      const setTA=(id,val)=>{const el2=document.getElementById(id);if(el2)el2.value=val||'';};
      setTA('sp-skills-'+idx, pc.skills);
      setTA('sp-feat-'+idx, pc.features);
      setTA('sp-magic-'+idx, pc.magic);
      setTA('sp-origin-'+idx, pc.backstory_origin);
      setTA('sp-motiv-'+idx, pc.backstory_motivation);
      setTA('sp-secret-'+idx, pc.backstory_secret);

      // wire color picker after DOM insert
      const colEl=document.getElementById('sp-col-'+idx);
      if(colEl) colEl.addEventListener('change',function(){upd(idx,'color',this.value);renderSetupPCCards();});
    });
  }catch(e){
    el.innerHTML='<div class="panel" style="border-color:var(--red);color:var(--red);font-size:12px;padding:12px">⚠ Could not render characters: '+esc(e.message)+'</div>';
  }
}

function saveSetupPC(idx){
  const g=function(id){const el=document.getElementById(id);return el?el.value:'';};
  const n=function(id){return parseInt(g(id))||0;};
  const pc=state.pcs[idx];if(!pc)return;
  pc.name=g('sp-name-'+idx)||pc.name;
  pc.race=g('sp-race-'+idx);
  pc.class=g('sp-class-'+idx);
  pc.level=parseInt(g('sp-level-'+idx))||1;
  pc.background=g('sp-bg-'+idx);
  pc.alignment=g('sp-align-'+idx);
  pc.hp_max=parseInt(g('sp-hp-'+idx))||1;
  if(pc.hp>pc.hp_max)pc.hp=pc.hp_max;
  pc.ac=parseInt(g('sp-ac-'+idx))||10;
  pc.initiative=parseInt(g('sp-init-'+idx))||0;
  pc.speed=parseInt(g('sp-spd-'+idx))||30;
  pc.passive_perception=parseInt(g('sp-pp-'+idx))||10;
  pc.passive_insight=parseInt(g('sp-pi-'+idx))||10;
  ['str','dex','con','int','wis','cha'].forEach(function(s){pc[s]=g('sp-'+s+'-'+idx)||pc[s];});
  pc.skills=g('sp-skills-'+idx);
  pc.features=g('sp-feat-'+idx);
  pc.magic=g('sp-magic-'+idx);
  pc.backstory_origin=g('sp-origin-'+idx);
  pc.backstory_motivation=g('sp-motiv-'+idx);
  pc.backstory_secret=g('sp-secret-'+idx);
  saveRefresh();
  toast('✓ '+pc.name+' saved.');
}
let _setupUnlocked=false;
function setSetupUnlocked(v){_setupUnlocked=v;renderSetupLock();}
function renderSetupLock(){
  const banner=document.getElementById('setup-lock-banner');if(!banner)return;
  if(state.campaignLaunched&&!_setupUnlocked){
    banner.innerHTML=`<div style="background:var(--surface2);border:1px solid var(--gold-dim);border-radius:var(--radius);padding:12px 14px;display:flex;flex-wrap:wrap;align-items:center;gap:10px">
      <div style="flex:1;min-width:160px">
        <div style="font-size:12px;font-weight:600;color:var(--gold-bright);margin-bottom:3px">⚔ Campaign Active</div>
        <div style="font-size:11px;color:var(--text-dim)">Setup is view-only during an active campaign. Use the main tabs for in-session changes.</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn sm" onclick="showTab('tab-world')">→ World</button>
        <button class="btn sm" onclick="showTab('tab-wagon')">→ Wagon</button>
        <button class="btn sm gold" onclick="setSetupUnlocked(true)">⚙ Edit</button>
      </div>
    </div>`;
  }else if(state.campaignLaunched&&_setupUnlocked){
    banner.innerHTML=`<div style="background:var(--surface2);border:1px solid var(--gold);border-radius:var(--radius);padding:10px 14px;display:flex;align-items:center;gap:10px">
      <div style="font-size:11px;color:var(--gold);flex:1">⚙ Setup unlocked — changes apply immediately to the active campaign.</div>
      <button class="btn sm red" onclick="setSetupUnlocked(false)">🔒 Lock</button>
    </div>`;
  }else{
    banner.innerHTML='';
  }
}
function lockPremise(){
  state.worldData.premiseLocked=true;
  const el=document.getElementById('setup-premise');
  if(el){state.worldData.premise=el.value;}
  save();toast('✓ Premise locked — now a fixed AI contract.');
}
function launchCampaign(){
  saveSetup();
  const g=(id)=>document.getElementById(id)?.value||'';
  // Validation — warn about empty fields but don't block
  const warnings=[];
  const namedPCs=state.pcs.filter(p=>p.name);
  if(!namedPCs.length)warnings.push('No characters have names (Step 1)');
  if(!g('setup-setting')&&!state.worldData?.setting)warnings.push('Campaign setting is blank (Step 2)');
  if(!g('setup-mission')&&!state.worldData?.primaryMission)warnings.push('Main quest is blank (Step 2)');
  if(!state.aiContracts?.persona)warnings.push('AI Persona contract is empty (AI Tools tab)');
  if(warnings.length&&!confirm('⚠ Launch with missing info?\n\n• '+warnings.join('\n• ')+'\n\nYou can fill these in later, but the AI DM will have less context.'))return;
  // Sync all setup fields to state
  state.wagon.wagonName=g('setup-wagon-name');
  state.wagon.wagonDesc=g('setup-cover');
  state.worldData.primaryMission=g('setup-mission');
  state.worldData.setting=g('setup-setting');
  state.worldData.plot=g('setup-factions');
  state.worldData.secrets=g('setup-secrets');
  state.treasuryData.gp=parseInt(g('setup-gold'))||15;
  // Sync step 0 goal into primaryMission if mission is empty
  if(!state.worldData.primaryMission&&state.campaignSetup?.goal){
    state.worldData.primaryMission=state.campaignSetup.goal;
  }
  state.campaignLaunched=true;
  save();
  generateSessionZero();openModal('s0-modal');
  showTab('tab-dm');
  toast('✓ Session Zero generated. Copy it and send to the AI DM to begin.');
}
function migrate(s){
  if(!s||typeof s!=='object')return;
  const savedVer=s.saveVersion||0;

  // ══ STRUCTURAL GUARDS — run every load (idempotent null/array protection) ══
  if(!Array.isArray(s.pcs))s.pcs=[];
  if(!Array.isArray(s.chatHistory))s.chatHistory=[];
  if(!Array.isArray(s.logs))s.logs=[];
  if(!Array.isArray(s.chkHistory))s.chkHistory=[];
  if(!Array.isArray(s.scenes))s.scenes=[];
  if(!Array.isArray(s.snippets))s.snippets=[];
  if(!Array.isArray(s.encounterPresets))s.encounterPresets=[];
  if(!Array.isArray(s.rewindStack))s.rewindStack=[];
  if(!Array.isArray(s.partyInventory))s.partyInventory=[];
  if(!Array.isArray(s.npcs))s.npcs=[];
  if(!Array.isArray(s.quests))s.quests=[];
  if(!Array.isArray(s.consequences))s.consequences=[];
  if(!Array.isArray(s.relationships))s.relationships=[];
  if(!Array.isArray(s.quickActions))s.quickActions=[];
  if(!Array.isArray(s.errorLog))s.errorLog=[];
  if(!Array.isArray(s.oocHistory))s.oocHistory=[];
  if(!Array.isArray(s.partyChat))s.partyChat=[];
  if(!Array.isArray(s.storyChapters))s.storyChapters=[];
  if(!Array.isArray(s.locations))s.locations=[];
  if(!Array.isArray(s.sessionArchive))s.sessionArchive=[];
  if(!Array.isArray(s.headerShortcuts))s.headerShortcuts=[];
  if(!s.campaignSetup||typeof s.campaignSetup!=='object')s.campaignSetup=s.campaignSetup||{};
  if(!s.aiContracts||typeof s.aiContracts!=='object')s.aiContracts={persona:'',never:'',actions:'',continuity:'',multi:''};
  // Auto-append missing contract clauses (idempotent — checks for marker text before appending)
  if(s.aiContracts.never&&!s.aiContracts.never.includes('DUNGEON SECRETS')){
    s.aiContracts.never+='\n\nAUTO-RULES:\n1. DUNGEON SECRETS: Never reveal unexplored rooms, loot, or enemy positions before players discover them.\n2. PLAYER AGENCY: Ask before resolving scene transitions, room entries, or significant actions. Never assume.\n3. SKILL CHECKS: Every uncertain action needs a declared DC + player roll via roll_request. No auto-successes.\n4. DICE: Never roll for players. Never write "Rolling 1d20... Result: 18." Use roll_request: only.';
  }
  if(s.aiContracts.multi&&!s.aiContracts.multi.includes('PLAYER AGENCY (STRICT')){
    s.aiContracts.multi+='\n\nPLAYER AGENCY (STRICT):\n1. One player cannot act for another\'s character. "We all charge in" → resolve ONLY that player\'s PC, then ask the others.\n2. Multiple objectives → each player chooses independently. Never assume the party stays together.\n3. Never narrate a PC\'s action/movement unless that PC\'s player stated it.\n4. After every action: has every PC had a chance to act? If not, ask by name.';
  }
  // Normalize NPCs, quests
  s.npcs.forEach(n=>{if(n.hp===undefined)n.hp=0;});
  s.quests.forEach(q=>{if(!q.status){q.status=q.done?'done':'active';}if(q.hidden===undefined)q.hidden=false;if(q.discovery===undefined)q.discovery=null;if(!q.chatMsgId)q.chatMsgId=null;});
  if(s.quests.length>0){
    const seen=new Set();
    s.quests=s.quests.filter(q=>{
      if(!q.text||q.text.trim()==='none'||q.text.trim()==='')return false;
      const key=q.text.split('|')[0].trim().toLowerCase();
      if(seen.has(key))return false;seen.add(key);return true;
    });
  }
  if(Array.isArray(s.pcs))s.pcs.forEach(pc=>{
    if(!Array.isArray(pc.inventory))return;
    const seen=new Set();
    pc.inventory=pc.inventory.filter(item=>{
      if(!item.name||item.name.trim()==='')return false;
      const key=(item.name+':'+(item.ts||'')).toLowerCase();
      if(seen.has(key))return false;seen.add(key);return true;
    });
  });

  // ══ VERSION GATE: savedVer < 8 — one-time migrations introduced up to SAVE_VERSION 8 ══
  if(savedVer<8){
    if(!Array.isArray(s.moduleProgress))s.moduleProgress=[
      {name:'Episode 1 — Greenest in Flames',status:'pending',notes:''},
      {name:'Episode 2 — Raiders\' Camp',status:'pending',notes:''},
      {name:'Episode 3 — Dragon Hatchery',status:'pending',notes:''},
      {name:'Episode 4 — On the Road',status:'pending',notes:''},
      {name:'Episode 5 — Construction Ahead',status:'pending',notes:''},
      {name:'Episode 6 — Castle Naerytar',status:'pending',notes:''},
      {name:'Episode 7 — Hunting Lodge',status:'pending',notes:''},
      {name:'Episode 8 — Castle in the Clouds',status:'pending',notes:''},
    ];
    if(!s.errorLog.find(f=>f.id==='dev_visual_redesign')){
      s.errorLog.unshift({id:'dev_visual_redesign',category:'infra',sectionCtx:'Dev Plan',location:'Visual Redesign',gameTs:'',ts:'',verdict:null,resolved:false,
        note:'VISUAL REDESIGN — Steampunk Fantasy (reference: screenshots shared 2026-06-13)\n\nPALETTE: body #1a0f00→#2a1a05 radial; surface #2d1f0a/#3a2812/#4a3520; gold #c8a850/#e8c870; text #d4b896/#a08060\n\nTEXTURES (pure CSS, no images): body repeating-linear-gradient noise over dark radial; panels inset box-shadow + subtle gradient; borders 1px gold-dim + outer glow; corner accents ::before/::after clip-path triangles\n\nCOMPONENT ORDER (one session):\n1. CSS variables + body (30m)\n2. Header + tab bar with icons (30m)\n3. Character cards + circular portrait frames (45m)\n4. Panel borders + corner ornaments (30m)\n5. Chat UI + badges (20m)\n6. Buttons + inputs (20m)\n\nTAB ICONS: Party=⚔ World=🌍 Wagon=🛞 Combat=💀 Session=📜 AI Tools=🔮 AI DM=🧙 Dev=⚙ Setup=🏛\n\nPORTRAIT FRAMES: circular clip-path colored div using pc.color, class initial or emoji as icon. No images needed.\n\nNOTE: Single CSS pass only. No external fonts, no images. All texture via CSS gradient patterns.'
      });
    }
    if(!s.errorLog.find(f=>f.id==='dev_vtt_roadmap')){
      s.errorLog.unshift({id:'dev_vtt_roadmap',category:'infra',sectionCtx:'Dev Plan',location:'VTT Roadmap',gameTs:'',ts:'',verdict:null,resolved:false,
        note:'VTT ROADMAP — Drops 4-7 (logged 2026-06-13)\n\nDROP 4 — Zone-Based Combat Map\nReplace flat initiative list with 6 spatial zones: Frontline/Backline/Left/Right/Air/Rear. Characters assigned to zones, DM moves them via UI, ledger reports positions. No grid — phone-friendly. REPLACES entire Combat tab initiative tracker.\n⚠ Do NOT refactor Combat tab before Drop 4 — it gets rebuilt.\n\nDROP 5 — Shared Dice Roll Feed\nFirebase broadcasts every roll to all connected devices in real time. Players see each other\'s rolls without DM narrating. Covers "did that hit?" gap.\n⚠ Move dice roller to globally accessible location before Drop 5 (currently buried in Combat tab).\n\nDROP 6 — Player View Mode\nSimplified Firebase-synced screen for second phone. Shows: HP bars, conditions, current scene, quest status, chat feed. No DM secrets, no config panels.\n⚠ Requires buildPlayerView() + state visibility split (see dev_state_visibility flag) BEFORE building this.\n\nDROP 7 — Handout / Image Cards\nStore URLs or base64 thumbnails on Firebase. DM taps "Show players" → appears on player view. Additive to Drop 6.'
      });
    }
    if(!s.errorLog.find(f=>f.id==='dev_state_visibility')){
      s.errorLog.unshift({id:'dev_state_visibility',category:'infra',sectionCtx:'Dev Plan',location:'State Visibility Audit',gameTs:'',ts:'',verdict:null,resolved:false,
        note:'STATE VISIBILITY AUDIT — Player View Foundation (logged 2026-06-13)\n\nAPPROACH: buildPlayerView() function — non-disruptive, additive only.\nComputes safe snapshot from existing state. Writes to Firebase /session/playerView on every save(). Player View (Drop 6) reads ONLY from /session/playerView.\n\nPUBLIC (player-visible):\n- pcs[*]: name, color, hp, hp_max, ac, conditions (NOT backstory_secret)\n- worldData: time, season, weather, location, scene_title, travelLog, premise, primaryMission\n- quests: all WHERE hidden !== true (needs hidden:false default added to quest model)\n- chatHistory: full narrative feed\n- combat.list: initiative + HP during combat\n- treasuryData: gp/pp/sp/cp/ep\n\nDM-ONLY (never in player view):\n- worldData.secrets, worldData.plot, worldData.timers, worldData.campaignSecrets\n- dmSecrets\n- pcs[*].backstory_secret\n- businessProfile.realStock, businessProfile.snakeOil\n- npcs[*].trueMotivation (if field added later)\n\nOPEN DESIGN QUESTIONS (answer before Drop 6):\n1. Town reputation — player-visible? (they\'d know their own rep in a town)\n2. Income log — player-visible? (they know what they sold)\n3. NPC dispositions — show to players or DM-only meta?\n4. Hidden quests — add hidden:false default to quest model for DM-planted objectives?\n\nIMPLEMENTATION CHECKLIST:\n[ ] Answer 4 open questions above\n[ ] Add hidden:false default to new quest objects\n[ ] Write buildPlayerView() function\n[ ] Call buildPlayerView() inside save() → write to Firebase /session/playerView\n[ ] Build Player View screen (Drop 6)'
      });
    }
    // qa_22: rename from Context Refresh duplicate to Module Check-in
    const qa22=s.quickActions.find(a=>a.id==='qa_22');
    if(qa22&&qa22.type==='context_refresh_btn'){qa22.label='Module Check-in';qa22.type='module_checkin';qa22.context=['tab-dm','tab-session'];}
    // Auto-resolve dev flags captured in roadmap
    ['dev_vtt_roadmap','dev_state_visibility'].forEach(id=>{
      const f=s.errorLog.find(f=>f.id===id);if(f&&!f.resolved)f.resolved=true;
    });
    // Remap old tab IDs + merge canonical contexts
    const tabRemap={'tab-log':'tab-session','tab-module':'tab-session','tab-ledger':'tab-ait','tab-chk':'tab-ait'};
    const canonicalContexts={'qa_1':['tab-party','tab-combat','tab-dm'],'qa_2':['tab-party','tab-combat','tab-dm'],'qa_3':['tab-party','tab-combat','tab-dm'],'qa_4':['tab-party','tab-combat','tab-dm'],'qa_5':['tab-wagon','tab-world','tab-dm'],'qa_6':['tab-wagon','tab-dm'],'qa_7':['tab-world','tab-dm','tab-session'],'qa_8':['tab-party','tab-world','tab-wagon','tab-combat','tab-dm','tab-session','tab-ait'],'qa_9':['tab-combat','tab-dm'],'qa_10':['tab-session','tab-dm'],'qa_11':['tab-dm','tab-ait','tab-party'],'qa_12':['tab-world','tab-dm'],'qa_13':['tab-party','tab-combat','tab-dm','tab-world'],'qa_14':['tab-party','tab-dm','tab-wagon','tab-world','tab-session'],'qa_15':['tab-dm','tab-party'],'qa_16':['tab-dm','tab-party','tab-world'],'qa_17':['tab-dm','tab-party','tab-combat'],'qa_18':['tab-dm','tab-world','tab-wagon'],'qa_19':['tab-dm','tab-world'],'qa_20':['tab-dm','tab-party'],'qa_21':['tab-dm','tab-session'],'qa_22':['tab-dm','tab-session'],'qa_23':['tab-party','tab-combat','tab-dm']};
    s.quickActions.forEach(qa=>{
      if(!Array.isArray(qa.context))qa.context=[];
      qa.context=qa.context.map(c=>tabRemap[c]||c);
      if(canonicalContexts[qa.id]){const merged=new Set([...qa.context,...canonicalContexts[qa.id]]);qa.context=[...merged];}
      qa.context=[...new Set(qa.context)];
    });
    if(!s.quickActions.find(qa=>qa.id==='qa_13'))s.quickActions.push({id:'qa_13',label:'Roll & Submit',type:'roll_submit',params:{},context:['tab-party','tab-combat','tab-dm','tab-world']});
    if(!s.quickActions.find(qa=>qa.id==='qa_23'))s.quickActions.push({id:'qa_23',label:'Shell Defense',type:'shell_defense_toggle',params:{},context:['tab-party','tab-combat','tab-dm']});
    // Clear stale Shell Defense conditions stuck between sessions
    const tPc=Array.isArray(s.pcs)?s.pcs.find(p=>p.name==='Tinkle'):null;
    if(tPc&&Array.isArray(tPc.conditions)&&tPc.conditions.includes('Shell Defense')){
      ['Shell Defense','Prone','Incapacitated'].forEach(c=>{const i=tPc.conditions.indexOf(c);if(i>-1)tPc.conditions.splice(i,1);});
    }
    // v8: seed storyChapters from legacy storyThread string
    if(s.storyThread&&!s.storyChapters.length){
      s.storyChapters=[{id:Date.now(),title:'Prologue',content:s.storyThread,date:(s.worldData&&s.worldData.time)||'Day 1'}];
    }
  }
  // DR-2: storyThread eliminated — purge from any loaded save (v8 gate above already migrated content)
  delete s.storyThread;

  // ══ VERSION GATE: savedVer < 9 — migrations introduced in SAVE_VERSION 9 ══
  if(savedVer<9){
    // DR-3: backfill campaignLaunched — true if campaign has been played (has chat history)
    if(s.campaignLaunched===undefined){
      s.campaignLaunched=!!(Array.isArray(s.chatHistory)&&s.chatHistory.length>0);
    }
  }

  // ══ VERSION GATE: savedVer < 10 — canonical L3 character sync (2026-06-14) ══
  if(savedVer<10){
    const _patch=function(id,upd){const pc=(s.pcs||[]).find(p=>p.id===id);if(!pc)return;Object.keys(upd).forEach(k=>{pc[k]=upd[k];});};
    _patch('slasher',{
      class:'Fighter (Battle Master)',subclass:'Battle Master',level:3,hp:39,hp_max:39,levelReady:false,
      features:'GREAT WEAPON FIGHTING (Style): When rolling damage for an attack with a two-handed weapon, reroll any 1 or 2 — must use new roll.\nSECOND WIND (Bonus Action, 1/Short Rest): Regain 1d10+3 HP as a bonus action.\nACTION SURGE (1/Short Rest): Take one additional action on your turn.\nACID BREATH (Action, Recharge 5-6): 5x30ft line, all creatures make DC 13 CON save or take 2d6 acid damage (half on success).\nACID RESISTANCE: Resistance to acid damage.\nHEAVY ARMOR PROFICIENCY: Wearing chain mail (AC 16). Disadvantage on Stealth checks.\nGREATSWORD: 2d6 slashing, heavy, two-handed. Primary weapon.\nSMITH\'S TOOLS: Proficient. Handles all equipment maintenance and repairs.\nGUILD MEMBERSHIP: Can call on the Smith\'s Guild for support, lodging, and contacts.\nHONEST TO A FAULT: Cannot deceive. Genuinely baffled by Tinkle and Pebble\'s methods.\nPROTECTOR: Sworn to keep Tinkle and Pebble safe.\nCOMBAT SUPERIORITY: 4 Superiority Dice (d8s) per short rest.\nMANEUVERS: Bait & Switch (swap with ally, add d8 to roll for AC), Precision Attack (add d8 to hit after roll), Trip Attack (add d8 damage, target makes DC 13 STR save or falls prone).',
      magic:'None.',conditions:[],slots:[],
      resources:[
        {name:'Second Wind',max:1,used:0,restore:'short',desc:'Bonus action, heal 1d10+3 HP'},
        {name:'Action Surge',max:1,used:0,restore:'short',desc:'One additional action on your turn'},
        {name:'Superiority Dice (d8)',max:4,used:0,restore:'short',desc:'Spend to trigger Battle Master maneuvers'}
      ]
    });
    _patch('tinkle',{
      class:'Rogue (Arcane Trickster)',subclass:'Arcane Trickster',level:3,hp:27,hp_max:27,levelReady:false,
      features:'NATURAL ARMOR: AC 17 flat. Cannot wear armor. Shields allowed.\nSHELL DEFENSE (Reaction or Hide Action): Withdraw into shell. Gain +4 AC (AC 21), become prone and incapacitated. Emerge using Bonus Action.\nSNEAK ATTACK (2d6): Once per turn when attacking with advantage OR when an ally is adjacent to target.\nCUNNING ACTION: Dash, Disengage, or Hide as a Bonus Action each turn.\nTHIEVES CANT: Secret underworld language.\nEXPERTISE: Deception and Investigation at double proficiency.\nHOLD BREATH: Up to 1 hour.\nCLAWS: 1d4 slashing natural weapon.\nBLOWGUN: 1d1 piercing, range 25/100ft. Loaded with Torpor Poison (DC 15 CON save or incapacitated for 4d6 hours).\nMAGE HAND LEGERDEMAIN: Mage Hand is invisible, can pick pockets, disarm traps, or stow objects remotely.\nTHE MASTERMIND: Manufactures the tonics, runs the operation, writes the labels.',
      magic:'Spellcasting: Intelligence | Save DC: 13 | Attack Bonus: +5\nCantrips: Mage Hand, Message, Prestidigitation\nLevel 1 Spells: Disguise Self, Find Familiar (Rat), Sleep',
      conditions:[],slots:[{max:2,used:0}],resources:[]
    });
    _patch('pebble',{
      class:'Bard (College of Lore)',subclass:'College of Lore',level:3,hp:30,hp_max:30,passive_perception:12,levelReady:false,
      skills:'Persuasion +7 (Expertise), Deception +7 (Expertise), Performance +5, Insight +2, Perception +2, Arcana +3, Sleight of Hand +4',
      features:'LITTLE GIANT: Counts as Large size for carrying capacity (240 lb) and push/drag/lift (480 lb).\nSTONES ENDURANCE (2/Long Rest): Reaction to reduce damage by 1d12+2. If reduced to 0, active concentration is automatically protected.\nLUCKY FEAT (3 Points/Long Rest): Spend 1 point to gain Advantage on a d20 Test OR impose Disadvantage on an attack against you.\nBARDIC INSPIRATION (3/Long Rest): Bonus Action, give a d6 die to a target within 60ft. They may add it to one d20 Test within 10 minutes, after seeing the roll.\nJACK OF ALL TRADES: Add +1 (half proficiency) to any ability check not already including proficiency.\nSONG OF REST: Allies who spend Hit Dice during a Short Rest regain an extra 1d6 HP.\nCOLLEGE OF LORE — BONUS PROFICIENCIES: Gained Perception, Arcana, and Sleight of Hand.\nCOLLEGE OF LORE — CUTTING WORDS: Use a Bardic Inspiration die as a Reaction to subtract the roll from an enemy\'s attack, ability check, or damage roll — declared before outcome.\nTHE PITCHMAN: Public face of Tinkle Tonics. High CHA is the product.',
      magic:'Spellcasting: Charisma | Save DC: 13 | Attack Bonus: +5\nCantrips: Friends, Vicious Mockery\n1st-Level Spells: Charm Person, Healing Word, Sleep\n2nd-Level Spells: Lesser Restoration, Suggestion',
      conditions:[],slots:[{max:4,used:0},{max:2,used:0}],
      resources:[
        {name:'Bardic Inspiration',max:3,used:0,restore:'long',desc:'d6 bonus die for allies; Cutting Words also expends a use'},
        {name:"Stone's Endurance",max:2,used:0,restore:'long',desc:'Reaction, 1d12+2 damage reduction; 0 dmg = concentration protected'},
        {name:'Lucky Points',max:3,used:0,restore:'long',desc:'Advantage on d20 test or force enemy disadvantage'}
      ]
    });
  }

  // ══ VERSION GATE: savedVer < 11 — re-patch L3 data clobbered by SHEET_FIELDS bug (2026-06-14) ══
  // The v10 gate ran correctly but its changes were overwritten by a stale SHEET_FIELDS merge
  // that read from pre-migration state.pcs. The corrupted data was then saved as saveVersion=10.
  // This gate re-applies the same patch so both localStorage and Firebase data are fixed.
  if(savedVer<11){
    const _p11=function(id,upd){const pc=(s.pcs||[]).find(p=>p.id===id);if(!pc)return;Object.keys(upd).forEach(k=>{pc[k]=upd[k];});};
    _p11('slasher',{
      class:'Fighter (Battle Master)',subclass:'Battle Master',level:3,hp_max:39,
      features:'GREAT WEAPON FIGHTING (Style): When rolling damage for an attack with a two-handed weapon, reroll any 1 or 2 — must use new roll.\nSECOND WIND (Bonus Action, 1/Short Rest): Regain 1d10+3 HP as a bonus action.\nACTION SURGE (1/Short Rest): Take one additional action on your turn.\nACID BREATH (Action, Recharge 5-6): 5x30ft line, all creatures make DC 13 CON save or take 2d6 acid damage (half on success).\nACID RESISTANCE: Resistance to acid damage.\nHEAVY ARMOR PROFICIENCY: Wearing chain mail (AC 16). Disadvantage on Stealth checks.\nGREATSWORD: 2d6 slashing, heavy, two-handed. Primary weapon.\nSMITH\'S TOOLS: Proficient. Handles all equipment maintenance and repairs.\nGUILD MEMBERSHIP: Can call on the Smith\'s Guild for support, lodging, and contacts.\nHONEST TO A FAULT: Cannot deceive. Genuinely baffled by Tinkle and Pebble\'s methods.\nPROTECTOR: Sworn to keep Tinkle and Pebble safe.\nCOMBAT SUPERIORITY: 4 Superiority Dice (d8s) per short rest.\nMANEUVERS: Bait & Switch (swap with ally, add d8 to roll for AC), Precision Attack (add d8 to hit after roll), Trip Attack (add d8 damage, target makes DC 13 STR save or falls prone).',
      magic:'None.',slots:[],
      resources:[
        {name:'Second Wind',max:1,used:0,restore:'short',desc:'Bonus action, heal 1d10+3 HP'},
        {name:'Action Surge',max:1,used:0,restore:'short',desc:'One additional action on your turn'},
        {name:'Superiority Dice (d8)',max:4,used:0,restore:'short',desc:'Spend to trigger Battle Master maneuvers'}
      ]
    });
    const _sl=s.pcs.find(p=>p.id==='slasher');if(_sl&&(_sl.hp===undefined||_sl.hp<1||_sl.hp>39))_sl.hp=39;
    _p11('tinkle',{
      class:'Rogue (Arcane Trickster)',subclass:'Arcane Trickster',level:3,hp_max:27,
      features:'NATURAL ARMOR: AC 17 flat. Cannot wear armor. Shields allowed.\nSHELL DEFENSE (Reaction or Hide Action): Withdraw into shell. Gain +4 AC (AC 21), become prone and incapacitated. Emerge using Bonus Action.\nSNEAK ATTACK (2d6): Once per turn when attacking with advantage OR when an ally is adjacent to target.\nCUNNING ACTION: Dash, Disengage, or Hide as a Bonus Action each turn.\nTHIEVES CANT: Secret underworld language.\nEXPERTISE: Deception and Investigation at double proficiency.\nHOLD BREATH: Up to 1 hour.\nCLAWS: 1d4 slashing natural weapon.\nBLOWGUN: 1d1 piercing, range 25/100ft. Loaded with Torpor Poison (DC 15 CON save or incapacitated for 4d6 hours).\nMAGE HAND LEGERDEMAIN: Mage Hand is invisible, can pick pockets, disarm traps, or stow objects remotely.\nTHE MASTERMIND: Manufactures the tonics, runs the operation, writes the labels.',
      magic:'Spellcasting: Intelligence | Save DC: 13 | Attack Bonus: +5\nCantrips: Mage Hand, Message, Prestidigitation\nLevel 1 Spells: Disguise Self, Find Familiar (Rat), Sleep',
      resources:[]
    });
    const _tk=s.pcs.find(p=>p.id==='tinkle');
    if(_tk){if(!_tk.slots||!_tk.slots[0]||_tk.slots[0].max!==2)_tk.slots=[{max:2,used:(_tk.slots||[])[0]?.used||0}];if(_tk.hp===undefined||_tk.hp<1||_tk.hp>27)_tk.hp=27;}
    _p11('pebble',{
      class:'Bard (College of Lore)',subclass:'College of Lore',level:3,hp_max:30,passive_perception:12,
      skills:'Persuasion +7 (Expertise), Deception +7 (Expertise), Performance +5, Insight +2, Perception +2, Arcana +3, Sleight of Hand +4',
      features:'LITTLE GIANT: Counts as Large size for carrying capacity (240 lb) and push/drag/lift (480 lb).\nSTONES ENDURANCE (2/Long Rest): Reaction to reduce damage by 1d12+2. If reduced to 0, active concentration is automatically protected.\nLUCKY FEAT (3 Points/Long Rest): Spend 1 point to gain Advantage on a d20 Test OR impose Disadvantage on an attack against you.\nBARDIC INSPIRATION (3/Long Rest): Bonus Action, give a d6 die to a target within 60ft. They may add it to one d20 Test within 10 minutes, after seeing the roll.\nJACK OF ALL TRADES: Add +1 (half proficiency) to any ability check not already including proficiency.\nSONG OF REST: Allies who spend Hit Dice during a Short Rest regain an extra 1d6 HP.\nCOLLEGE OF LORE — BONUS PROFICIENCIES: Gained Perception, Arcana, and Sleight of Hand.\nCOLLEGE OF LORE — CUTTING WORDS: Use a Bardic Inspiration die as a Reaction to subtract the roll from an enemy\'s attack, ability check, or damage roll — declared before outcome.\nTHE PITCHMAN: Public face of Tinkle Tonics. High CHA is the product.',
      magic:'Spellcasting: Charisma | Save DC: 13 | Attack Bonus: +5\nCantrips: Friends, Vicious Mockery\n1st-Level Spells: Charm Person, Healing Word, Sleep\n2nd-Level Spells: Lesser Restoration, Suggestion',
      resources:[
        {name:'Bardic Inspiration',max:3,used:0,restore:'long',desc:'d6 bonus die for allies; Cutting Words also expends a use'},
        {name:"Stone's Endurance",max:2,used:0,restore:'long',desc:'Reaction, 1d12+2 damage reduction; 0 dmg = concentration protected'},
        {name:'Lucky Points',max:3,used:0,restore:'long',desc:'Advantage on d20 test or force enemy disadvantage'}
      ]
    });
    const _pb=s.pcs.find(p=>p.id==='pebble');
    if(_pb){if(!_pb.slots||_pb.slots.length<2||_pb.slots[0].max!==4)_pb.slots=[{max:4,used:(_pb.slots||[])[0]?.used||0},{max:2,used:(_pb.slots||[])[1]?.used||0}];if(_pb.hp===undefined||_pb.hp<1||_pb.hp>30)_pb.hp=30;}
  }

  // ══ VERSION GATE: savedVer < 12 — Zone Combat Map (Drop 4) ══
  if(savedVer<12){
    if(!s.combat.zones)s.combat.zones=_defaultZones();
    if(!s.combat.moveMode)s.combat.moveMode='ai';
    (s.combat.list||[]).forEach(function(c){if(!c.zone)c.zone='front';});
  }

  // ══ VERSION GATE: savedVer < 13 — Multi-animal system ══
  if(savedVer<13){
    if(!Array.isArray(s.wagon.animals))s.wagon.animals=[];
    const ox=s.wagon.ox;
    if(ox&&ox.name&&ox.hp_max>0&&!s.wagon.animals.some(a=>a.name===ox.name)){
      s.wagon.animals.push({id:'animal_'+Date.now(),name:ox.name,type:ox.name?'ox':'',role:'draft',hp:ox.hp||0,hp_max:ox.hp_max||0,ac:ox.ac||10,conditions:ox.conditions||'None',feed:ox.feed||'N/A',backstory:ox.backstory||'',personality:ox.personality||'',notes:''});
    }
    s.pcs.forEach(p=>{
      if(p.familiar&&p.familiar.name&&!s.wagon.animals.some(a=>a.name===p.familiar.name)){
        const f=p.familiar;
        s.wagon.animals.push({id:'animal_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),name:f.name,type:f.type||'familiar',role:'familiar',hp:f.hp||1,hp_max:f.hp_max||1,ac:f.ac||10,conditions:'',feed:'',backstory:'',personality:'',notes:f.notes||'',ownerId:p.id,speed:f.speed||'',str:f.str,dex:f.dex,con:f.con,int:f.int,wis:f.wis,cha:f.cha,passive_perception:f.passive_perception});
      }
    });
  }

  // ══ CANONICAL QA COMPLETENESS — always run to pick up QAs added in current version ══
  const validTabs=['tab-party','tab-world','tab-wagon','tab-combat','tab-session','tab-ait','tab-dm'];
  const hasValidActions=s.quickActions.some(qa=>(qa.context||[]).some(c=>validTabs.includes(c)));
  if(!hasValidActions)s.quickActions=[];
  const canonicalQA=[
    {id:'qa_1',label:'Adjust HP',type:'hp',params:{},context:['tab-party','tab-combat','tab-dm']},
    {id:'qa_2',label:'Add Condition',type:'condition_add',params:{},context:['tab-party','tab-combat','tab-dm']},
    {id:'qa_3',label:'Clear Conditions',type:'condition_clear',params:{},context:['tab-party','tab-combat']},
    {id:'qa_4',label:'Use Resource',type:'resource_use',params:{},context:['tab-party','tab-combat','tab-dm']},
    {id:'qa_5',label:'Add Foraged Item',type:'item_add_foraged',params:{},context:['tab-wagon','tab-world','tab-dm']},
    {id:'qa_6',label:'Feed Mount',type:'ox_feed',params:{},context:['tab-wagon']},
    {id:'qa_7',label:'Advance Time',type:'time_advance',params:{},context:['tab-world','tab-session','tab-dm']},
    {id:'qa_8',label:'Save Game',type:'save_game',params:{},context:['tab-party','tab-world','tab-wagon','tab-combat','tab-session','tab-ait','tab-dm']},
    {id:'qa_9',label:'Next Turn',type:'combat_next',params:{},context:['tab-combat','tab-dm']},
    {id:'qa_10',label:'Add Log Entry',type:'log_entry',params:{},context:['tab-session','tab-dm']},
    {id:'qa_11',label:'Context Refresh',type:'context_refresh',params:{},context:['tab-dm','tab-ait','tab-party']},
    {id:'qa_12',label:'Update Town Rep',type:'town_rep',params:{},context:['tab-world','tab-dm']},
    {id:'qa_13',label:'Roll & Submit',type:'roll_submit',params:{},context:['tab-dm','tab-combat','tab-party']},
    {id:'qa_14',label:'Fix Missing State',type:'state_fix',params:{},context:['tab-party','tab-dm','tab-wagon','tab-world','tab-session']},
    {id:'qa_15',label:'Re-sync AI',type:'resync_ai',params:{},context:['tab-dm','tab-party']},
    {id:'qa_16',label:'Surroundings',type:'surroundings',params:{},context:['tab-dm','tab-party','tab-world']},
    {id:'qa_17',label:'Short Rest',type:'short_rest',params:{},context:['tab-dm','tab-party','tab-combat']},
    {id:'qa_18',label:'Random Event',type:'random_event',params:{},context:['tab-dm','tab-world','tab-wagon']},
    {id:'qa_19',label:'Roleplay NPC',type:'roleplay_npc',params:{},context:['tab-dm','tab-world']},
    {id:'qa_20',label:'Character Moment',type:'char_moment',params:{},context:['tab-dm','tab-party']},
    {id:'qa_21',label:'Send Active Scene',type:'send_scene',params:{},context:['tab-dm','tab-session']},
    {id:'qa_22',label:'Module Check-in',type:'module_checkin',params:{},context:['tab-dm','tab-session']},
    {id:'qa_24',label:'Previously On…',type:'previously_on',params:{},context:['tab-dm']},
    {id:'qa_25',label:'Catch Up',type:'catch_up',params:{},context:['tab-dm','tab-world']},
    {id:'qa_26',label:'Deep Seed',type:'deep_seed',params:{},context:['tab-dm','tab-world']}
  ];
  if(!s.quickActions.length){s.quickActions=canonicalQA;}
  else{
    canonicalQA.forEach(cqa=>{
      const existing=s.quickActions.find(a=>a.id===cqa.id);
      if(!existing)s.quickActions.push(cqa);
      else if(existing.label!==cqa.label)existing.label=cqa.label;
    });
  }

  // ══ STALE CONTRACT CLEANUP — clear old campaign refs so HTML defaults re-seed ══
  if(s.aiContracts){
    if(s.aiContracts.never&&s.aiContracts.never.includes('MEREN SPELLS'))s.aiContracts.never='';
    if(s.aiContracts.continuity&&s.aiContracts.continuity.includes('CON OPERATION MECHANICS'))s.aiContracts.continuity='';
  }

  // ══ CORE STRUCTURAL DEFAULTS — sub-objects, scalars, PC fields ══
  if(!Array.isArray(s.pcs)||s.pcs.length===0)return;
  const seenIds=new Set();
  s.pcs=s.pcs.filter(pc=>{if(!pc||!pc.id)return false;if(seenIds.has(pc.id))return false;seenIds.add(pc.id);return true;});
  if(s.pcs.length===0)return;
  if(typeof s.logSummary!=='string')s.logSummary='';
  if(typeof s.dmSecrets!=='string')s.dmSecrets='';
  if(s.activeSceneIdx===undefined||s.activeSceneIdx===null)s.activeSceneIdx=-1;
  if(s.activeEditTab===undefined)s.activeEditTab=0;
  if(s.turnCount===undefined)s.turnCount=0;
  if(s.turnsSince===undefined)s.turnsSince=0;
  if(s.chkCount===undefined)s.chkCount=0;
  if(!s.chkMode)s.chkMode='exploration';
  if(s.msgsSinceChk===undefined)s.msgsSinceChk=0;
  if(!s.autoChkInterval)s.autoChkInterval=8;
  if(s.campaignLaunched===undefined)s.campaignLaunched=false;
  if(s.prevSessionSummary===undefined)s.prevSessionSummary='';
  if(!s.sessionNotes)s.sessionNotes='';
  if(!s.wagonFilter)s.wagonFilter='all';
  if(!s.worldData||typeof s.worldData!=='object')s.worldData={};
  if(!Array.isArray(s.worldData.travelLog))s.worldData.travelLog=[];
  if(!Array.isArray(s.worldData.townReputation))s.worldData.townReputation=[];
  if(!Array.isArray(s.worldData.campaignSecrets))s.worldData.campaignSecrets=[];
  if(!s.worldData.businessProfile||typeof s.worldData.businessProfile!=='object')s.worldData.businessProfile={name:'',realStock:'',snakeOil:'',reagents:'',reputation:'',notes:''};
  if(s.worldData.premiseLocked===undefined)s.worldData.premiseLocked=false;
  if(!s.worldData.primaryMission)s.worldData.primaryMission='';
  if(!s.worldData.time)s.worldData.time='Day 1';
  if(!s.worldData.location)s.worldData.location='Unknown';
  if(!s.treasuryData||typeof s.treasuryData!=='object')s.treasuryData={pp:0,gp:0,ep:0,sp:0,cp:0,lifestyle:'',incomeLog:[]};
  if(!Array.isArray(s.treasuryData.incomeLog))s.treasuryData.incomeLog=[];
  if(!s.wagon||typeof s.wagon!=='object')s.wagon={};
  if(!s.wagon.ox||typeof s.wagon.ox!=='object')s.wagon.ox={name:'',hp:0,hp_max:0,ac:10,conditions:'None',feed:'N/A',backstory:'',personality:'',bonds:{},quirks:[],experimentLog:''};
  if(s.wagon.ox.name===undefined)s.wagon.ox.name='';
  if(s.wagon.ox.backstory===undefined)s.wagon.ox.backstory='';
  if(s.wagon.ox.personality===undefined)s.wagon.ox.personality='';
  if(!s.wagon.ox.bonds||typeof s.wagon.ox.bonds!=='object')s.wagon.ox.bonds={};
  if(!Array.isArray(s.wagon.ox.quirks))s.wagon.ox.quirks=[];
  if(s.wagon.ox.experimentLog===undefined)s.wagon.ox.experimentLog='';
  if(s.wagon.capacity===undefined)s.wagon.capacity=DEFAULT_MAX_LB;
  if(!Array.isArray(s.wagon.animals))s.wagon.animals=[];
  if(!Array.isArray(s.wagon.cells))s.wagon.cells=[];
  if(!Array.isArray(s.wagon.cargo))s.wagon.cargo=[];
  if(!Array.isArray(s.wagon.hoard))s.wagon.hoard=[];
  if(s.wagon.hp===undefined)s.wagon.hp=20;
  if(s.wagon.hp_max===undefined)s.wagon.hp_max=20;
  if(!s.wagon.ac)s.wagon.ac=11;
  if(!s.wagon.conditions)s.wagon.conditions='';
  if(s.wagon.wagonName===undefined)s.wagon.wagonName='';
  if(!s.combat||typeof s.combat!=='object')s.combat={active:false,round:1,currentIdx:0,list:[]};
  if(!Array.isArray(s.combat.list))s.combat.list=[];
  if(!s.combat.zones)s.combat.zones=_defaultZones();
  if(!s.combat.moveMode)s.combat.moveMode='ai';
  s.combat.list.forEach(c=>{if(!c.conditions)c.conditions=[];if(!c.concentrating)c.concentrating='';if(!c.zone)c.zone='front';});
  if(s.combat.active===undefined)s.combat.active=false;
  if(!s.combat.round)s.combat.round=1;
  if(s.combat.currentIdx===undefined)s.combat.currentIdx=0;
  s.pcs.forEach(pc=>{
    if(!pc||typeof pc!=='object')return;
    if(!pc.backstory_origin)pc.backstory_origin='';
    if(!pc.backstory_motivation)pc.backstory_motivation='';
    if(!pc.backstory_secret)pc.backstory_secret='';
    if(pc.xp===undefined)pc.xp=0;
    if(!pc.id)pc.id='pc_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
    if(!pc.color)pc.color='#5a8a5a';
    if(!Array.isArray(pc.inventory))pc.inventory=[];
    if(!Array.isArray(pc.conditions))pc.conditions=[];
    if(!Array.isArray(pc.slots))pc.slots=[];
    if(!Array.isArray(pc.resources))pc.resources=[];
    if(!Array.isArray(pc.pending))pc.pending=[];
    if(!pc.concentrating)pc.concentrating='';
    if(!pc.hp_max||pc.hp_max<1)pc.hp_max=10;
    if(pc.hp===undefined||pc.hp===null)pc.hp=pc.hp_max;
    if(pc.levelReady===undefined)pc.levelReady=false;
    if(!Array.isArray(pc.spellbook))pc.spellbook=[];
    if(pc.spellbook.length>1)_sortSpellbook(pc.spellbook);
    if(pc.familiar===undefined)pc.familiar=null;
    if(!pc.death_saves)pc.death_saves={successes:0,failures:0};
    if(pc.inspiration===undefined)pc.inspiration=false;
    // Character sheet rework state fields (no SAVE_VERSION bump)
    if(pc.hp_temp===undefined)pc.hp_temp=0;
    if(pc.exhaustion===undefined)pc.exhaustion=0;
    if(pc.hd_used===undefined)pc.hd_used=0;
    if(pc.personality===undefined)pc.personality='';
    if(pc.ideals===undefined)pc.ideals='';
    if(pc.bonds===undefined)pc.bonds='';
    if(pc.flaws===undefined)pc.flaws='';
    if(!Array.isArray(pc.languages))pc.languages=[];
    if(pc.sheetLocked===undefined)pc.sheetLocked=true;
    // Seed Tinkle's rat familiar (Find Familiar active per Contract 2)
    if(pc.name==='Tinkle'&&!pc.familiar){
      pc.familiar={name:'Pip',type:'Rat (Find Familiar)',hp:1,hp_max:1,ac:10,speed:'20 ft.',
        str:2,dex:11,con:9,int:2,wis:10,cha:4,passive_perception:10,
        notes:'Invisible Mage Hand Legerdemain familiar. Scouting, pick-pockets, disarm traps, stow objects — cannot attack. Dismissed/re-summoned as bonus action.'};
    }
  });

  // ── Seed HotDQ episode content if episodes exist but have no content ──
  if(Array.isArray(s.moduleProgress)&&s.moduleProgress.length&&!s.moduleProgress.some(ep=>ep.content)){
    const _HOTDQ_BRIEFS=[
`SETTING: Town of Greenest, under attack by Cult of the Dragon and a blue dragon (Lennithon)
OBJECTIVE: Survive the night, protect townspeople, complete missions from Governor Nighthill
KEY NPCs: Governor Nighthill (quest giver), Castellan Escobert (knows secret tunnel), Langdedrosa Cyanwrath (half-blue dragon champion)
LOCATIONS: Greenest Keep (safe haven), Temple of Chauntea, Old Tunnel under keep
MISSIONS: Save the Mill, Sanctuary (rescue from temple), Half-Dragon Champion duel, Dragon Attack
KEY EVENTS: Cyanwrath challenges party champion to single combat (trades 4 prisoners). Town under siege all night. Blue dragon Lennithon circles but retreats if bloodied.
LEVEL: Characters start at 1, reach 2 after completing. LOOT: 250gp each from Nighthill.`,
`SETTING: Cult raider camp in rocky plateau, 12 miles from Greenest
OBJECTIVE: Infiltrate camp, rescue prisoners (especially Leosin Erlanthar), gather intel
KEY NPCs: Leosin Erlanthar (captured Harper monk), Frulam Mondath (cult leader), Langdedrosa Cyanwrath (guards camp)
LOCATIONS: Raider camp plateau, prisoner area, Mondath's tent, Cyanwrath's tent
KEY EVENTS: Infiltrate disguised as cultists. Leosin tied to stake. ~200 cultists/kobolds. Cave entrance leads to Dragon Hatchery (Ep 3).
STEALTH: DC 5 to sneak in. Can bluff with cult robes. LEVEL: Reach 3. REWARDS: 250gp each, 250 XP for Leosin.`,
`SETTING: Cave system behind raider camp (Dragon Hatchery)
OBJECTIVE: Clear hatchery, recover dragon eggs, defeat remaining cult forces
KEY NPCs: Frulam Mondath (in cave), Langdedrosa Cyanwrath (guards with berserkers)
LOCATIONS: Fungus garden, Bat cavern, Dragon shrine (Tiamat), Frulam's chamber, Hatchery (3 black dragon eggs), Cyanwrath's lair
KEY ENCOUNTERS: Troglodytes, stirges, violet fungi, guard drakes, kobolds, Cyanwrath rematch
KEY EVENTS: Dragon eggs can be destroyed or taken. Mondath has map → loot goes to Naerytar.
TREASURE: Cult regalia, maps, pearls (300gp). LEVEL: Reach 4.`,
`SETTING: Journey Greenest → Elturel → Baldur's Gate → caravan to Waterdeep
OBJECTIVE: Follow cult treasure shipment north, infiltrate caravan, gather intelligence
KEY NPCs: Leosin Erlanthar (quest giver), Ontharr Frume (Order of the Gauntlet, Elturel), Azbara Jos (Red Wizard with cult), Jamna Gleamsilver (gnome Harper spy)
FACTIONS: Harpers (Leosin), Order of the Gauntlet (Ontharr) — party may join one
CARAVAN: Fellow travelers with side plots. Cult wagons carry looted treasure. ~2 months on road.
KEY EVENTS: Assassination attempt (bone slivers), meet Gleamsilver, road encounters. NO level up per milestone.`,
`SETTING: Waterdeep, north along High Road to Carnath Roadhouse
OBJECTIVE: Track cult treasure, discover tunnel to Mere of Dead Men
KEY NPCs: Bog Luck (half-orc, cult ally runs roadhouse), Ardred Briferhew (guard commander), Gristle Pete (cook)
LOCATIONS: Carnath Roadhouse, Strong room (locked), Secret tunnel to swamp
KEY EVENTS: Treasure to strong room at night. Lizardfolk carry it through tunnel under roadhouse into Mere of Dead Men.
DISCOVERY: Tunnel leads to Castle Naerytar. LEVEL: Reach 5.`,
`SETTING: Mere of Dead Men swamp, Castle Naerytar
OBJECTIVE: Infiltrate or assault Castle Naerytar, find teleportation portal
KEY NPCs: Dralmorrer Borngray (elf, cult commander), Pharblex Spattergoo (bullywug shaman), Rezmir (half-black dragon, Black Dragon Mask), Snapjaw (lizardfolk ally)
LOCATIONS: Mere of Dead Men, Lizardfolk camp, Castle Naerytar (3 floors + dungeon), Portal in dungeon
FACTIONS: Lizardfolk (ally via Snapjaw), Bullywugs (Pharblex), Cult (Borngray)
KEY EVENTS: Ally lizardfolk vs bullywugs. Rezmir escapes through portal. Portal → Hunting Lodge. LEVEL: Reach 6.`,
`SETTING: Hunting Lodge in Greypeak Mountains, then Parnast village
OBJECTIVE: Clear lodge, learn about Skyreach Castle, travel to Parnast
KEY NPCs: Talis the White (cult leader, may negotiate — wants Rezmir's position), Captain Othelstan, Perytons (roof)
LOCATIONS: Hunting Lodge (2 floors + roof), Parnast village
KEY EVENTS: Talis bitter about being passed over — temporary ally. Provides cultist disguises + Skyreach info. Portal from Naerytar exits here. Parnast cult-controlled.
NEGOTIATION: Talis helps infiltrate Skyreach if party undermines Rezmir. LEVEL: Reach 7.`,
`SETTING: Parnast village, Skyreach Castle (cloud giant flying fortress)
OBJECTIVE: Board Skyreach Castle, stop cult treasure transport, defeat occupants
KEY NPCs: Blagothkus (cloud giant, uneasy cult ally), Rezmir (final boss), Glazhael the Cloudchaser (adult white dragon), Rath Modar & Azbara Jos (Red Wizards)
LOCATIONS: Parnast, Skyreach Castle (courtyards, towers, ice cavern with dragon, giant's tower)
KEY EVENTS: Castle lifts off — must board before it leaves. Blagothkus can turn on cult. Glazhael guards massive hoard. Rezmir must be defeated.
FINAL BATTLE: Cult leaders + white dragon. Blagothkus potential ally.
TREASURE: Dragon hoard, Black Dragon Mask, flying castle. LEVEL: 7-8, ready for Rise of Tiamat.`
    ];
    s.moduleProgress.forEach((ep,i)=>{
      if(i<_HOTDQ_BRIEFS.length&&!ep.content)ep.content=_HOTDQ_BRIEFS[i];
    });
    if(!s.moduleReference){
      s.moduleReference=`CAMPAIGN: Hoard of the Dragon Queen (Tyranny of Dragons Part 1)
SETTING: Sword Coast, Forgotten Realms — Greenest to Waterdeep to Skyreach Castle

MAIN THREAT: Cult of the Dragon gathering treasure for ritual to summon Tiamat, Queen of Evil Dragons.
CULT LEADERSHIP: Severin Silrajin (overall leader), Rezmir (field commander, half-black dragon), five Dragon Masks needed.

RECURRING NPCs:
- Langdedrosa Cyanwrath — half-blue dragon, cult champion. Duels party Ep 1, rematch Ep 3.
- Frulam Mondath — Wearer of Purple, cult leader. Present Ep 1-3.
- Rezmir — half-black dragon, senior cult leader, Black Dragon Mask. Present Ep 5-8.
- Leosin Erlanthar — half-elf monk, Harper agent. Captured Ep 2, quest giver Ep 4+.
- Ontharr Frume — dwarf paladin, Order of the Gauntlet. Ally from Ep 4+.
- Azbara Jos — Red Wizard of Thay, cult ally. Caravan Ep 4, Skyreach Ep 8.

FACTIONS:
- Cult of the Dragon — main antagonists, collecting treasure for Tiamat ritual
- Harpers — secret intelligence network (Leosin)
- Order of the Gauntlet — militant defenders (Ontharr)
- Red Wizards of Thay — allied with cult for own purposes

TREASURE ROUTE: Greenest → Raider Camp → Dragon Hatchery → Baldur's Gate caravan → Waterdeep → Carnath Roadhouse → Castle Naerytar portal → Hunting Lodge → Skyreach Castle

DRAGON MASKS: Five masks (Black, White, Blue, Green, Red) needed to summon Tiamat. Rezmir has the Black Dragon Mask.`;
    }
  }
}
// ═══ PERSISTENCE ═══
// ═══ SAVE / LOAD — Firebase-ready layer ═══
// Drop 1: localStorage only. Drop 2: swap fbSave/fbLoad for Firebase calls.
// All callers use save() and loadState() — no changes needed elsewhere.

// What goes to Firebase (shared campaign state):
const STATE_KEYS = ['pcs','worldData','npcs','quests','treasuryData',
  'partyInventory','wagon','combat','encounterPresets','scenes',
  'activeSceneIdx','snippets','dmSecrets','logSummary','logs',
  'activeEditTab','turnCount','turnsSince','chkCount','chkMode',
  'chkHistory','rewindStack','wagonFilter','chatHistory','oocHistory','partyChat','plugins','errorLog','sessionNotes','storyChapters','prevSessionSummary','aiContracts','sessionArchive','locations','consequences','headerShortcuts','moduleProgress','moduleReference','campaignSetup'];

// What stays in localStorage (device-specific settings):
// tt_gk, tt_ok, tt_provider, tt_tts_*, tt_pname, tt_pchar, tt_cache

function save(){
  try{
    // Prune chatHistory to last 80 messages to prevent unbounded growth
    if(state.chatHistory&&state.chatHistory.length>80){
      state.chatHistory=state.chatHistory.slice(-80);
      _chatMutatedAt=Date.now();
    }
    // Prune logs to last 200 entries
    if(state.logs&&state.logs.length>200){
      state.logs=state.logs.slice(-200);
    }
    state.saveVersion=SAVE_VERSION;
    localStorage.setItem('tt_v1',JSON.stringify(state));
    autosaveDot();
    state._ts=Date.now();
    if(fbEnabled)fbSave(state);
  }catch(e){
    console.error('Save error',e);
    if(e.name==='QuotaExceededError'){
      // State too large — trim chat history aggressively and retry
      state.chatHistory=state.chatHistory.slice(-30);
      state.logs=state.logs.slice(-50);
      try{localStorage.setItem('tt_v1',JSON.stringify(state));autosaveDot();toast('⚠ Storage full — trimmed old messages','warn');}
      catch(e2){console.error('Save failed after trim:',e2);toast('Save failed — storage full','error',5000);}
    }
  }
}
function loadState(){
  const raw=localStorage.getItem('tt_v1')||localStorage.getItem('goodbarrel_v8_state')||localStorage.getItem('goodbarrel_v6_state');
  if(!raw)return;
  try{
    const p=JSON.parse(raw);
    if(!p?.pcs?.length)return;
    migrate(p);
    // ── Version check: merge canonical PC data if save is outdated ──
    const savedVer=p.saveVersion||0;
    if(savedVer<SAVE_VERSION){
      // Merge canonical PC data — preserve player-added fields (inventory, xp, hp, conditions, resources)
      // but overwrite structural/sheet fields from the canonical defaults
      // Only merge truly static fields — migrate() owns level-dependent fields
      // (class, hp_max, slots, resources, features, magic, skills are patched by version gates)
      const SHEET_FIELDS=['name','race','background','alignment','ac','speed',
        'passive_perception','passive_insight','str','dex','con','int','wis','cha',
        'backstory_origin','backstory_motivation','backstory_secret','color','initiative'];
      p._ts=Date.now();
      getCanonicalPCs().forEach(canonical=>{
        const saved=p.pcs.find(pc=>pc.id===canonical.id);
        if(saved){
          SHEET_FIELDS.forEach(f=>{if(canonical[f]!==undefined)saved[f]=canonical[f];});
          // v7 one-time: reset to canonical starting inventory (clears stale test-session gear)
          if(savedVer<8&&canonical.inventory&&canonical.inventory.length>0){
            saved.inventory=JSON.parse(JSON.stringify(canonical.inventory));
          }
          if(canonical.resources&&canonical.resources.length)saved.resources=canonical.resources;
        }
      });
      // Add any new canonical PCs not in the save
      state.pcs.forEach(canonical=>{
        if(!p.pcs.find(pc=>pc.id===canonical.id))p.pcs.push({...canonical});
      });
      // v7 one-time: fix stale premise text (old saves may reference wrong race)
      if(savedVer<8&&p.worldData&&p.worldData.premise){
        p.worldData.premise=p.worldData.premise.replace(/Slasher the Halfling/gi,'Slasher the Black Dragonborn');
      }
      p.saveVersion=SAVE_VERSION;
    }
    state=p;
    state.pcs.forEach(pc=>checkLevelUp(pc));
    setTimeout(()=>_autoOpenLevelUp(),1500);
  }
  catch(e){console.error('Load error',e);}
}
function saveRefresh(){save();renderAll();}
function autosaveDot(){
  const d=document.getElementById('as-dot');const l=document.getElementById('as-lbl');if(!d)return;
  d.className='autosave-dot saving';l.innerText='Saving...';
  setTimeout(()=>{d.className='autosave-dot';l.innerText='Saved';},700);
}

// ═══ MUTATORS ═══
function upd(idx,key,val){
  state.pcs[idx][key]=val;
  if(key==='hp_max'&&state.pcs[idx].hp>val)state.pcs[idx].hp=val;
  if(key==='xp')checkLevelUp(state.pcs[idx]);
  saveRefresh();
}
function adjHP(idx,isHeal){
  const inp=document.getElementById('hpamt-'+idx);if(!inp?.value)return;
  const amt=parseInt(inp.value);if(isNaN(amt))return;
  const pc=state.pcs[idx];
  const wasDown=pc.hp<=0;
  pc.hp=isHeal?Math.min(pc.hp_max,pc.hp+amt):Math.max(0,pc.hp-amt);
  pc.hp=Math.max(0,Math.min(pc.hp_max,pc.hp));
  inp.value='';
  if(isHeal&&wasDown&&pc.hp>0&&pc.conditions){pc.conditions=pc.conditions.filter(c=>c!=='Unconscious'&&c!=='Dying');}
  if(!isHeal&&pc.hp===0&&document.getElementById('auto-down')?.checked)triggerChk('PC Down: '+pc.name);
  saveRefresh();
}
// ═══ ATTACKS ═══
function renderAttackEditor(idx){
  const c=document.getElementById('attack-ed-'+idx);if(!c)return;
  const pc=state.pcs[idx];if(!pc)return;
  c.innerHTML='';
  if(!(pc.attacks||[]).length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:12px 0;text-align:center">No attacks yet. Add weapons, spells used in combat, or special abilities.</div>';return;}
  const prof=Math.floor(((pc.level||1)-1)/4)+2;
  const sm=s=>{const n=parseInt(pc[s])||10;return Math.floor((n-10)/2);};
  (pc.attacks||[]).forEach((atk,ai)=>{
    const b=(atk.proficient!==false?prof:0)+sm(atk.stat||'str')+(parseInt(atk.attackBonus)||0);
    const ds=atk.damageStat==='none'?0:sm(atk.damageStat||atk.stat||'str');
    const db=ds+(parseInt(atk.damageBonus)||0);
    const d=document.createElement('div');
    d.style.cssText='background:var(--surface2);border:1px solid var(--border-bright);border-radius:6px;padding:10px;margin-bottom:8px';
    d.innerHTML=
      `<div style="display:flex;gap:6px;align-items:center;margin-bottom:7px">
        <input type="text" value="${esc(atk.name||'')}" placeholder="Attack name" style="flex:1;font-weight:600;font-size:13px" onchange="updAtk(${idx},${ai},'name',this.value)">
        <span style="font-size:12px;color:var(--gold-bright);font-weight:700;white-space:nowrap">${b>=0?'+':''}${b} to hit</span>
        <button class="btn sm gold" onclick="rollAttack(${idx},${ai})" style="padding:3px 10px;min-height:28px">🎲</button>
        <button class="btn sm red icon-btn" onclick="remAtk(${idx},${ai})">&times;</button>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:11px;margin-bottom:5px">
        <label class="field-label" style="margin:0">Stat</label>
        <select style="font-size:11px;padding:3px" onchange="updAtk(${idx},${ai},'stat',this.value)">${['str','dex','con','int','wis','cha'].map(s=>`<option value="${s}" ${(atk.stat||'str')===s?'selected':''}>${s.toUpperCase()}</option>`).join('')}</select>
        <label class="field-label" style="margin:0">+Bonus</label>
        <input type="number" value="${parseInt(atk.attackBonus)||0}" style="width:46px" onchange="updAtk(${idx},${ai},'attackBonus',parseInt(this.value)||0)">
        <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px"><input type="checkbox" ${atk.proficient!==false?'checked':''} onchange="updAtk(${idx},${ai},'proficient',this.checked)"> Prof</label>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:11px;margin-bottom:5px">
        <label class="field-label" style="margin:0">Damage</label>
        <input type="text" value="${esc(atk.damageDie||'1d6')}" placeholder="1d8" style="width:52px;font-size:11px" onchange="updAtk(${idx},${ai},'damageDie',this.value)">
        <label class="field-label" style="margin:0">+</label>
        <select style="font-size:11px;padding:3px" onchange="updAtk(${idx},${ai},'damageStat',this.value)">${['str','dex','con','int','wis','cha','none'].map(s=>`<option value="${s}" ${(atk.damageStat||atk.stat||'str')===s?'selected':''}>${s==='none'?'None':s.toUpperCase()}</option>`).join('')}</select>
        <span style="color:var(--gold);font-weight:700">${(db>=0?'+':'')+db} total</span>
      </div>
      <input type="text" value="${esc(atk.notes||'')}" placeholder="Notes (e.g. Versatile 1d10, Reach, Thrown 20/60)" style="width:100%;font-size:11px" onchange="updAtk(${idx},${ai},'notes',this.value)">`;
    c.appendChild(d);
  });
}
function addAttack(idx){
  if(!state.pcs[idx])return;
  if(!state.pcs[idx].attacks)state.pcs[idx].attacks=[];
  state.pcs[idx].attacks.push({name:'',stat:'str',proficient:true,attackBonus:0,damageDie:'1d6',damageStat:'str',damageBonus:0,notes:''});
  save();renderSheets();
}
function updAtk(idx,ai,k,v){const atk=state.pcs[idx]?.attacks?.[ai];if(!atk)return;atk[k]=v;save();renderSheets();}
function remAtk(idx,ai){state.pcs[idx]?.attacks?.splice(ai,1);save();renderSheets();}
function rollAttack(idx,ai){
  const pc=state.pcs[idx];if(!pc)return;
  const atk=(pc.attacks||[])[ai];if(!atk)return;
  const prof=Math.floor(((pc.level||1)-1)/4)+2;
  const sm=s=>{const n=parseInt(pc[s])||10;return Math.floor((n-10)/2);};
  const atkBonus=(atk.proficient!==false?prof:0)+sm(atk.stat||'str')+(parseInt(atk.attackBonus)||0);
  const d20=Math.ceil(Math.random()*20);
  const total=d20+atkBonus;
  const isCrit=d20===20,isMiss=d20===1;
  const [dc,df]=(atk.damageDie||'1d6').split('d').map(Number);
  let dmg=0;for(let i=0;i<(dc||1);i++)dmg+=Math.ceil(Math.random()*(df||6));
  const dmgBonus=(atk.damageStat==='none'?0:sm(atk.damageStat||atk.stat||'str'))+(parseInt(atk.damageBonus)||0);
  const dmgTotal=dmg+dmgBonus;
  const note=isCrit?' ⚡ CRITICAL!':isMiss?' 💀 MISS':total>=15?' ✓':'';
  toast(`${esc(atk.name||'Attack')}: d20(${d20})${atkBonus>=0?'+':''}${atkBonus}=${total}${note} | Dmg: ${dmgTotal}`,3500);
  const el=document.getElementById('dice-result');if(el){el.textContent=`${atk.name}: ${total} to hit | ${dmgTotal} dmg${note}`;el.style.color=isCrit?'var(--gold-bright)':isMiss?'var(--red)':'var(--text-bright)';}
}
function rollStatCheck(idx,stat,label){
  const pc=state.pcs[idx];if(!pc)return;
  const n=parseInt(pc[stat])||10;
  const m=Math.floor((n-10)/2);
  const d20=Math.ceil(Math.random()*20);
  const total=d20+m;
  const isCrit=d20===20,isFumble=d20===1;
  const lbl=label||(stat.toUpperCase()+' check');
  const note=isCrit?' ⚡ NAT 20':isFumble?' 💀 NAT 1':'';
  const sendTxt='['+esc(pc.name||'PC')+' rolls '+lbl+': d20('+d20+')'+(m>=0?'+':'')+m+' = '+total+note+']';
  toast(lbl+': '+total+note,2500);
  const sa=document.getElementById('po-roll-result');
  if(sa){
    sa.style.display='flex';
    sa.innerHTML='<span style="color:'+(isCrit?'var(--gold-bright)':isFumble?'var(--red)':'var(--text-bright)')+'">🎲 '+lbl+': <strong>'+total+'</strong>'+note+'</span>'
      +'<button onclick="sendRollToChat(\''+sendTxt.replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\');this.textContent=\'✓ Sent\';this.disabled=true" style="font-size:10px;padding:2px 8px;margin-left:8px;background:var(--surface3);border:1px solid var(--gold-dim);color:var(--gold);border-radius:4px;cursor:pointer">📨 Send</button>';
  }
}
function rollInitiative(idx){
  const pc=state.pcs[idx];if(!pc)return;
  const bonus=parseInt(pc.initiative)||0;
  const d20=Math.ceil(Math.random()*20);
  const total=d20+bonus;
  const sendTxt='['+esc(pc.name||'PC')+' rolls Initiative: d20('+d20+')'+(bonus>=0?'+':'')+bonus+' = '+total+']';
  toast('Initiative: '+total,2500);
  const sa=document.getElementById('po-roll-result');
  if(sa){
    sa.style.display='flex';
    sa.innerHTML='<span style="color:var(--gold-bright)">⚔ Initiative: <strong>'+total+'</strong></span>'
      +'<button onclick="sendRollToChat(\''+sendTxt.replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\');this.textContent=\'✓ Sent\';this.disabled=true" style="font-size:10px;padding:2px 8px;margin-left:8px;background:var(--surface3);border:1px solid var(--gold-dim);color:var(--gold);border-radius:4px;cursor:pointer">📨 Send</button>';
  }
}
function pcShortRest(idx){
  const pc=state.pcs[idx];if(!pc)return;
  let recharged=0;
  (pc.resources||[]).forEach(r=>{if(r.restore==='short'&&r.used>0){r.used=0;recharged++;}});
  saveRefresh();
  toast((pc.name||'PC')+': Short Rest — '+(recharged?recharged+' abilit'+(recharged===1?'y':'ies')+' recharged':'nothing recharged'));
}
function pcLongRest(idx){
  const pc=state.pcs[idx];if(!pc)return;
  pc.hp=pc.hp_max;
  (pc.resources||[]).forEach(r=>{r.used=0;});
  (pc.slots||[]).forEach(s=>{if(s)s.used=0;});
  if(pc.conditions)pc.conditions=pc.conditions.filter(c=>c!=='Exhausted');
  pc.concentrating='';
  saveRefresh();renderHUD();
  toast('🌙 '+(pc.name||'PC')+': Long Rest — fully restored');
}
function toggleCond(idx,cond){
  const pc=state.pcs[idx];if(!pc)return;if(!Array.isArray(pc.conditions))pc.conditions=[];const i=pc.conditions.indexOf(cond);
  if(i>-1)pc.conditions.splice(i,1);else pc.conditions.push(cond);
  saveRefresh();
}
function clearPCConditions(idx){
  const pc=state.pcs[idx];if(!pc)return;
  const conds=(pc.conditions||[]).slice();
  if(!conds.length){toast('No conditions to clear.');return;}
  if(!confirm('Clear all conditions from '+pc.name+'?\n\n'+conds.join(', ')))return;
  pc.conditions=[];pc.concentrating='';
  saveRefresh();renderPCOverview();toast('✓ '+pc.name+' conditions cleared');
}
function addCondFromPicker(idx,sel){
  const cond=sel.value;if(!cond)return;
  const pc=state.pcs[idx];if(!pc)return;
  if(!Array.isArray(pc.conditions))pc.conditions=[];
  if(!pc.conditions.includes(cond))pc.conditions.push(cond);
  sel.value='';
  saveRefresh();
}
function toggleSlot(idx,li,pi){
  const pc=state.pcs[idx];if(!pc||!Array.isArray(pc.slots))return;const s=pc.slots[li];if(!s)return;
  s.used=(s.used===pi+1)?pi:pi+1;saveRefresh();
}
function addPcItem(idx){const pc=state.pcs[idx];if(!pc)return;if(!pc.inventory)pc.inventory=[];pc.inventory.push({name:'',qty:1,weight:0,type:'misc',notes:''});save();renderCards();renderSheets();}
function updPcItem(pi,ii,k,v){const pc=state.pcs[pi];if(!pc?.inventory?.[ii])return;pc.inventory[ii][k]=v;save();}
function remPcItem(pi,ii){const pc=state.pcs[pi];if(!pc?.inventory)return;pc.inventory.splice(ii,1);save();renderCards();}
function remPcItemSheet(pi,ii){const pc=state.pcs[pi];if(!pc?.inventory)return;pc.inventory.splice(ii,1);save();renderCards();renderSheets();}

// ═══ AI PROVIDER ═══
function setProvider(p){
  provider=p;localStorage.setItem('tt_provider',p);
  // Elements may not exist if modal hasn't been opened yet — guard all
  const pg=document.getElementById('panel-google');if(pg)pg.style.display=p==='google'?'block':'none';
  const po=document.getElementById('panel-or');if(po)po.style.display=p==='openrouter'?'block':'none';
  const bg=document.getElementById('btn-google');if(bg)bg.className='btn'+(p==='google'?' gold':'');
  const bo=document.getElementById('btn-or');if(bo)bo.className='btn'+(p==='openrouter'?' gold':'');
  updProvStatus();updProvStatusMini();
}
function saveKeys(){
  localStorage.setItem('tt_gk',document.getElementById('google-key')?.value||'');
  localStorage.setItem('tt_gm',document.getElementById('google-model')?.value||'gemini-2.5-flash-lite');
  localStorage.setItem('tt_ok',document.getElementById('or-key')?.value||'');
  localStorage.setItem('tt_om',document.getElementById('or-model')?.value||'google/gemini-2.0-flash-exp');
  localStorage.setItem('tt_oc',document.getElementById('or-custom')?.value||'');
  const isC=document.getElementById('or-model')?.value==='custom';
  const cr=document.getElementById('or-custom-row');if(cr)cr.style.display=isC?'block':'none';
  updProvStatus();
}
function loadKeys(){
  provider=localStorage.getItem('tt_provider')||'google';
  const gk=document.getElementById('google-key');if(gk)gk.value=localStorage.getItem('tt_gk')||'';
  const gm=document.getElementById('google-model');if(gm)gm.value=localStorage.getItem('tt_gm')||'gemini-2.5-flash-lite';
  const ok=document.getElementById('or-key');if(ok)ok.value=localStorage.getItem('tt_ok')||'';
  const om=document.getElementById('or-model');if(om)om.value=localStorage.getItem('tt_om')||'google/gemini-2.0-flash-exp';
  const oc=document.getElementById('or-custom');if(oc)oc.value=localStorage.getItem('tt_oc')||'';
  setProvider(provider);
}
function getKey(){return provider==='google'?localStorage.getItem('tt_gk')||'':localStorage.getItem('tt_ok')||'';}
function updProvStatus(){
  const el=document.getElementById('provider-status');if(!el)return;
  const key=getKey();
  if(!key){el.textContent='No key set — chat disabled.';el.style.color='var(--text-dim)';return;}
  const m=provider==='google'?(localStorage.getItem('tt_gm')||'gemini-2.5-flash-lite'):(localStorage.getItem('tt_om')||'gemini-2.0-flash-exp');
  el.textContent='✓ '+provider.toUpperCase()+' — '+m;el.style.color='var(--green-bright)';
}
function toggleVis(id){const el=document.getElementById(id);if(el)el.type=el.type==='password'?'text':'password';}

// ═══ CORE AI CALL ═══
function setAIStatus(msg){
  const el=document.getElementById('ai-retry-status');if(!el)return;
  el.textContent=msg;el.style.display=msg?'block':'none';
}
async function _fetchGoogle(messages,sysProm,maxTok,key,signal){
  const model=localStorage.getItem('tt_gm')||'gemini-2.5-flash-lite';
  const url='https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+key;
  const body={system_instruction:{parts:[{text:sysProm}]},contents:messages.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:maxTok}};
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error('Google AI '+res.status+': '+(e?.error?.message||res.statusText));}
  const data=await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text||'(No response)';
}
async function _fetchOR(messages,sysProm,maxTok,key,signal,modelOverride){
  const mr=modelOverride||(localStorage.getItem('tt_om')||'google/gemini-2.0-flash-exp');
  const model=(!modelOverride&&mr==='custom')?(localStorage.getItem('tt_oc')||'google/gemini-2.0-flash-exp'):mr;
  const res=await fetch('https://openrouter.ai/api/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+key,'HTTP-Referer':window.location.href,'X-Title':"Hoard of the Dragon Queen"},
    body:JSON.stringify({model,messages:[{role:'system',content:sysProm},...messages],max_tokens:maxTok}),
    signal
  });
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error('OpenRouter '+res.status+': '+(e?.error?.message||res.statusText));}
  const data=await res.json();
  return data.choices?.[0]?.message?.content||'(No response)';
}
async function callAI(messages,sysProm,maxTok=1400){
  const key=getKey();if(!key)throw new Error('No API key set.');
  const RETRY_DELAYS=[1200,2400];
  const DR4_NO_RETRY=/4\d\d/; // never retry 4xx (auth, quota, bad request)
  const is5xx=msg=>/5\d\d/.test(msg)||msg.includes('Failed to fetch')||msg.includes('NetworkError');
  let lastErr=null;
  // ── Primary provider with up to 2 retries ──
  for(let i=0;i<=RETRY_DELAYS.length;i++){
    if(i>0){
      setAIStatus('Retrying… ('+i+'/'+RETRY_DELAYS.length+')');
      await new Promise(r=>setTimeout(r,RETRY_DELAYS[i-1]));
    }
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),25000);
    try{
      const result=provider==='google'
        ?await _fetchGoogle(messages,sysProm,maxTok,key,ctrl.signal)
        :await _fetchOR(messages,sysProm,maxTok,key,ctrl.signal);
      setAIStatus('');return result;
    }catch(e){
      clearTimeout(timer);
      if(e.name==='AbortError'){setAIStatus('');throw new Error('AI request timed out after 25s. Check your connection and try again.');}
      lastErr=e;
      if(DR4_NO_RETRY.test(e.message)||!is5xx(e.message))break; // don't retry auth/4xx/unknown
    }finally{clearTimeout(timer);}
  }
  // ── Fallback: OpenRouter free model (only if primary was Google and OR key exists) ──
  if(provider==='google'){
    const orKey=localStorage.getItem('tt_ok');
    if(orKey){
      setAIStatus('Switching to fallback provider…');
      const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),25000);
      try{
        const result=await _fetchOR(messages,sysProm,maxTok,orKey,ctrl.signal,'meta-llama/llama-3.1-8b-instruct:free');
        setAIStatus('⚠ Fallback provider used — primary unavailable');
        setTimeout(()=>setAIStatus(''),4000);
        return result;
      }catch(e2){clearTimeout(timer);}finally{clearTimeout(timer);}
    }
  }
  setAIStatus('');throw lastErr;
}

// ═══ SYSTEM PROMPT BUILDER ═══
const _SLASHER_FRAGMENT=''; // HotDQ: no con-protection needed
function buildPrompt(ledger){
  // Read from state (DR-6) with DOM fallback for resilience
  const g=id=>{
    const key=_CONTRACT_KEYS.find(([,domId])=>domId===id)?.[0];
    if(key&&state.aiContracts?.[key])return state.aiContracts[key];
    return document.getElementById(id)?.value||'';
  };
  const persona=g('ai-persona');
  const activeSnips=(state.snippets||[]).filter(s=>s.active!==false&&s.text).map(s=>'['+s.name+']\n'+s.text).join('\n\n');
  const mechBlock=`
CONTRACT 6 — MECHANICS BLOCK (REQUIRED)
End EVERY response with a mechanics block. Machine-parsed — exact format required. Stripped from display.
If nothing changed: ---MECHANICS---\\nnone\\n---END---

FORMAT:
---MECHANICS---
key: value
---END---

EXAMPLE:
---MECHANICS---
hp: Slasher=10
conditions: Aria+poisoned
slot_use: Valenns=1
location: The Keep
time: Day 1, midnight
weather: Storm
income: 8, reward, Rescued caravan
item_add: Slasher, Iron Key, 1, key, 0
xp: Slasher+50, Aria+50, Valenns+50
npc_add: Escobert, Friendly, Shield dwarf castellan
quest_add: Defend the Sally Port
roll_request: Initiative | 1d20+1 | Slasher
combat_start: Sally Port Ambush
zone_add_enemy: Cultist | 9 | 12 | front | 14
---END---

FORMAT RULES:
1. One key: value per line. Only emit lines where something changed.
2. ---END--- is REQUIRED on its own line. Without it nothing saves.
3. Mechanics block is LAST in your response. Nothing after ---END---.
4. No code fences, bold, or formatting around the block.
5. Never invent HP — only change by exact stated/rolled amounts.
6. XP values are DELTAS (amount earned this encounter), never cumulative totals. xp:party+300 means "add 300 to each PC." Do not emit the running total.

MECHANIC KEY REFERENCE:
Character: hp:[name]=[val] | hp_max:[name]=[val] | conditions:[name]+/-[cond] | slot_use/slot_restore:[name]=[lvl or all] | resource_use/resource_restore:[pc],[name] | concentration:[name]=spell/off | short_rest:[name] | shell_defense:[name]=on/off | xp:[name]+[amt] (DELTA only, not total)
Economy: income:[amt],[category],[desc] (category: reward/found/loot/quest/trade) | expense:[amt],[desc] | gp/sp/cp/ep/pp: absolute SET only
Items: item_add:[target],[name],[qty],[type],[weight] | item_remove:[target],[name],[qty]
World: location:[name] | time:[value] | weather:[value] | loc_desc:[text] | travel_note:[text] | town_rep:[town],[status],[notes]
Story: quest_add/quest_done/quest_fail:[text] | quest_update:[name]|[notes] | primary_mission:[text] | npc_add:[name],[disposition],[desc] | npc_mood:[name]=[mood] | consequence_add:[text]|[type] | consequence_resolve:[text] | module_episode:N,active|complete
Location: location_add:Name|Type|Desc | location_visit:Name | location_history:Name|Text|dmOnly | location_investment:Name|Desc|Amt
Wagon: wagon_add:Name|Capacity|Weight|AC|Condition | wagon_cell_add/update/remove | wagon_hp:[val] | ox_hp:[val] | ox_condition:[cond]
Familiar: familiar_hp:[name]|[hp]
PC: pc_update:[name],[field],[value] | pc_add/pc_delete:[name]

CRITICAL RULES:
1. roll_request: Skill|DC|PCname — ONLY way players can roll. Emit for ALL rolls (checks, saves, attacks, damage, spells). NEVER resolve rolls in prose. Multiple roll_requests queue as separate banners.
2. npc_add: Emit for EVERY named NPC mentioned — formal intro, dialogue reference, or lore recall. Every time.
3. item_add: Emit for EVERY item found/foraged/bought/stolen/acquired — even if mentioned in prose.
4. location_add: Emit for ANY new named location visited.
5. Always update time/location/weather when they change.
6. Encumbrance: PC carry cap = STR×15 lbs. Wagon cap = ${getMaxLb()} lbs. Enforce penalties when exceeded.

COMBAT (6-zone system: Frontline/Backline/Left Flank/Right Flank/Air Space/Rear Guard):
Adjacency: Front↔Left, Front↔Right, Front↔Back, Front↔Air, Back↔Rear. Move=1 adjacent, 2 non-adjacent. OA on leaving hostile zone.
Starting positions: Melee→Front, Ranged/Casters→Back, Wagon/Mounts→Rear. Air only when flying exists.
Commands: combat_start:[desc] | combat_end:[summary] | zone_move:[name]|[zone] | zone_add_enemy:[name]|[hp]|[ac]|[zone]|[init] | zone_remove:[name] | zone_effect:[zone]|[text]|[type] | zone_label:[zone]|[label] | zone_fog:[zone]|hide/reveal

COMBAT START — MANDATORY SEQUENCE:
1. combat_start: [description]
2. zone_add_enemy: for EVERY enemy
3. roll_request: Initiative | 1d20+[mod] | [PC] for EACH PC
4. WAIT for initiative rolls before resolving actions

LEVEL-UP: You CANNOT level up characters. Direct players to //levelup or Sheet > Level Up. Only narrate after [LEVEL UP COMPLETE] context message.`;
  const premiseSection=state.worldData.premiseLocked&&state.worldData.premise?'\nLOCKED CAMPAIGN PREMISE (fixed fact — never contradict):\n'+state.worldData.premise+'\n':'';
  const s0=state.campaignSetup||{};
  let sessionZeroSection='';
  if(s0.tone||s0.origin||s0.goal||s0.lines){
    sessionZeroSection='\nSESSION ZERO — PERMANENT TABLE CONTRACT:\n';
    if(s0.tone)sessionZeroSection+='Campaign Tone: '+s0.tone+'\n';
    if(s0.origin)sessionZeroSection+='How the party met: '+s0.origin+'\n';
    if(s0.goal)sessionZeroSection+='What they are trying to accomplish: '+s0.goal+'\n';
    if(s0.lines)sessionZeroSection+='CONTENT BOUNDARIES (Lines & Veils — strictly enforced, never cross these):\n'+s0.lines+'\n';
  }
  const secretsSection=state.dmSecrets?'\nCONTRACT 7 — SECRET DM NOTES (NEVER reveal to players):\n'+state.dmSecrets+'\n':'';
  const snipsSection=activeSnips?'\nCONTRACT 8 — REFERENCE MATERIAL:\n'+activeSnips+'\n':'';
  const summarySection=state.prevSessionSummary?'\nCAMPAIGN HISTORY (auto-archived):\n'+state.prevSessionSummary+'\n':'';
  let moduleSection='';
  if(Array.isArray(state.moduleProgress)&&state.moduleProgress.length){
    const modName=state.worldData.setting?.split('\n')[0]||'';
    const activeEp=state.moduleProgress.find(e=>e.status==='active');
    const done=state.moduleProgress.filter(e=>e.status==='complete').length;
    const epList=state.moduleProgress.map((ep,i)=>'  '+(ep.status==='complete'?'[✓]':ep.status==='active'?'[▶]':'[ ]')+' Ep '+(i+1)+': '+ep.name+(ep.notes?' — '+ep.notes:'')).join('\n');
    const globalRef=(state.moduleReference||'').trim();
    const epContent=activeEp?(activeEp.content||'').trim():'';
    moduleSection='\nCONTRACT 9 — MODULE FIDELITY (MANDATORY):\n'
      +'This campaign is running the official module: '+modName+'\n'
      +'Progress: '+done+'/'+state.moduleProgress.length+' episodes complete.\n'
      +(activeEp?'Current episode: '+activeEp.name+(activeEp.notes?' — '+activeEp.notes:'')+'\n':'')
      +'Episode tracker:\n'+epList+'\n\n'
      +'RULES:\n'
      +'- You are running a PUBLISHED MODULE, not a homebrew campaign. Never claim otherwise.\n'
      +'- All locations, NPCs, plot points, and encounters must come from or be consistent with the source module.\n'
      +'- Do NOT invent major plot arcs, organizations, or MacGuffins that do not exist in the module.\n'
      +'- If the chat history contains fabricated content (locations, quests, plot devices not in the module), treat it as NON-CANONICAL. Do not continue fabricated storylines.\n'
      +'- The party\'s unique elements (the wagon, the con, the tinctures business) are overlaid ONTO the module — they do not replace it.\n'
      +'- When a player asks "where are we in the module," answer with the actual episode name and published content.\n'
      +'- Custom flavor and side content is fine, but the backbone must follow the module\'s chapter/episode progression.\n'
      +'- NEVER call this campaign "homebrew" or "DM original." It is a published module with party-specific flavor.\n'
      +'- Use module_episode: N, active|complete in mechanics blocks to advance the tracker.\n'
      +(globalRef?'\nMODULE REFERENCE (always active):\n'+globalRef+'\n':'')
      +(epContent?'\nACTIVE EPISODE CONTENT — '+activeEp.name+':\n'+epContent+'\n':'');
  }
  const inventoryGuard='\n\nINVENTORY INTEGRITY: Check CAMPAIGN STATE inventory before answering about items. If not listed, say so — never fabricate stats or magic item properties. Emit item_add: for EVERY item found, looted, bought, stolen, foraged, identified, or attuned.\n';
  return g('ai-persona')+'\n'+premiseSection+sessionZeroSection+'\nCONTRACT 2 — WHAT YOU NEVER DO:\n'+g('ai-never')+inventoryGuard+'\n\nCONTRACT 3 — HOW YOU HANDLE ACTIONS:\n'+g('ai-actions')+'\n\nCONTRACT 4 — CONTINUITY & WAGON:\n'+g('ai-continuity')+'\n\nCONTRACT 5 — MULTI-PLAYER:\n'+g('ai-multi')+mechBlock+moduleSection+secretsSection+snipsSection+summarySection+(ledger?'\nCURRENT CAMPAIGN STATE:\n'+ledger:'');
}

// ═══ MECHANICS BLOCK PARSER — Option B ═══
// All recognized mechanic keys — used by parseMechanics and display stripping
const _MECH_KEYS='hp|hp_max|conditions|concentration|location|time|weather|travel_note|loc_desc|gp|sp|cp|ep|pp|item_add|item_remove|slot_use|slot_restore|resource_use|resource_restore|shell_defense|wagon_add|wagon_cell_add|wagon_cell_update|wagon_cell_remove|wagon_hp|ox_hp|ox_condition|familiar_hp|animal_hp|animal_condition|income|expense|xp|quest_add|quest_done|quest_fail|quest_update|primary_mission|npc_add|npc_mood|pc_update|pc_add|pc_delete|module_episode|short_rest|town_rep|save_game|save|spell_add|sp_charge|consequence_add|consequence_resolve|chapter_add|chapter_update|location_add|location_visit|location_history|location_investment|roll_request|zone_move|zone_add_enemy|zone_remove|zone_effect|zone_label|combat_start|combat_end|zone_fog|none';
const _NAKED_MECH_RE=new RegExp('^[-*•]?\\s*(?:[A-Za-z][A-Za-z0-9 ]*:\\s*)?('+_MECH_KEYS+'): .+','m');
function parseMechanics(responseText, pendingMsgId=null){
  // Flexible mechanics block detection — catches all AI format variations
  let match=null;
  const cleanText=responseText.replace(/\*\*/g,'').replace(/\*/g,''); // strip bold/italic
  // Try with ---END--- first (preferred)
  match=cleanText.match(/---MECHANICS---([\s\S]*?)---END---/i);
  if(!match) match=cleanText.match(/MECHANICS BLOCK:?([\s\S]*?)---END---/i);
  if(!match) match=cleanText.match(/MECHANICS BLOCK:?([\s\S]*?)(?=\n\n[A-Z]|$)/i);
  if(!match) match=cleanText.match(/---MECHANICS---([\s\S]*)$/i);
  if(!match) match=cleanText.match(/MECHANICS:?([\s\S]*?)(?:---END---|$)/i);
  // Penultimate resort: find any line with key: value pattern after a MECHANICS-like header
  if(!match){
    const mechIdx=cleanText.search(/mechanics/i);
    if(mechIdx>-1) match={1:cleanText.slice(mechIdx+10)};
  }
  // Final fallback: naked mechanic lines in body with no MECHANICS header at all
  // Also catches "CharName: mechanic_key: value" pattern (AI prefixes lines with character names)
  if(!match){
    const nakedRe=new RegExp('^[-*•]?\\s*(?:[A-Za-z][A-Za-z0-9 ]*:\\s*)?('+_MECH_KEYS+'): .+','mg');
    const lines=[];let m;while((m=nakedRe.exec(cleanText))!==null){
      let line=m[0].replace(/^[-*•]\s+/,'');
      const ci=line.indexOf(':');
      if(ci>-1){const k=line.slice(0,ci).trim().toLowerCase();if(!_MECH_KEYS.split('|').includes(k)){const rest=line.slice(ci+1).trim();line=rest;}}
      lines.push(line);
    }
    if(lines.length) match={1:lines.join('\n')};
  }
  if(!match)return null;
  let block=match[1].trim();
  if(block==='none'||block==='')return null;
  const changes=[];
  const _rejected=[];
  const _mechKeySet=new Set(_MECH_KEYS.split('|'));
  // Split pipe-separated mechanics on a single line: "xp:party+100 | quest_done:..." → separate lines
  block=block.replace(new RegExp('\\s*\\|\\s*(?=('+_MECH_KEYS+'):)','gi'),'\n');
  const rawLines=block.split('\n').map(l=>{
    l=l.trim().replace(/^[-*•]\s+/,'');
    const ci=l.indexOf(':');
    if(ci>-1&&!_mechKeySet.has(l.slice(0,ci).trim().toLowerCase())){
      const rest=l.slice(ci+1).trim();
      const ci2=rest.indexOf(':');
      if(ci2>-1&&_mechKeySet.has(rest.slice(0,ci2).trim().toLowerCase()))l=rest;
    }
    return l;
  }).filter(Boolean);
  const lines=rawLines.filter(line=>{
    const ci=line.indexOf(':');if(ci===-1)return true;
    const k=line.slice(0,ci).trim().toLowerCase();
    const v=line.slice(ci+1).trim().toLowerCase();
    if(v==='none'||v==='0'||/^0\s*,/.test(v)){_rejected.push(k+': junk value');return false;}
    if(k==='combat_start'&&state.combat?.active){_rejected.push('combat_start: combat already active');return false;}
    if(k==='zone_add_enemy'){
      const nm=(line.slice(ci+1).split('|')[0]||'').trim();
      if(nm&&(state.combat?.list||[]).some(e=>e.name===nm)){_rejected.push('zone_add_enemy: '+nm+' already in combat');return false;}
    }
    if(['gp','sp','cp','ep','pp','income'].includes(k)&&/\bxp\b/i.test(v)){_rejected.push(k+': XP is not currency — use xp: mechanic');return false;}
    if(k==='xp'){
      const recent=(state.chatHistory||[]).slice(-3);
      const lastXPLine=recent.reverse().find(m=>m.mechanics?.some(c=>/xp/i.test(c.text||'')));
      if(lastXPLine){
        const lastXPText=lastXPLine.mechanics.filter(c=>/xp/i.test(c.text||'')).map(c=>c.text).join();
        const thisNorm=v.replace(/\s+/g,'');
        const lastNorm=lastXPText.replace(/[^0-9+]/g,'');
        const thisAmts=(thisNorm.match(/\+(\d+)/g)||[]).sort().join();
        const lastAmts=(lastNorm.match(/\+(\d+)/g)||[]).sort().join();
        if(thisAmts&&thisAmts===lastAmts){_rejected.push('xp: duplicate of recent award');return false;}
      }
    }
    return true;
  });
  lines.forEach(line=>{
    try{
      const colonIdx=line.indexOf(':');if(colonIdx===-1)return;
      const key=line.slice(0,colonIdx).trim().toLowerCase();
      const val=line.slice(colonIdx+1).trim();
      if(key==='hp'){
        val.split(',').forEach(part=>{
          const[nm,hpRaw]=part.trim().split('=');
          const hpStr=hpRaw?.split('/')[0];
          const pc=findPC(nm?.trim());
          if(pc&&hpStr!==undefined){const old=pc.hp;pc.hp=Math.max(0,Math.min(pc.hp_max,parseInt(hpStr)));changes.push({text:pc.name+' HP '+old+'→'+pc.hp});if(pc.hp>0&&old<=0&&pc.conditions){pc.conditions=pc.conditions.filter(c=>c!=='Unconscious'&&c!=='Dying');changes.push({text:pc.name+' no longer unconscious'});}if(pc.hp===0&&document.getElementById('auto-down')?.checked)setTimeout(()=>triggerChk('PC Down: '+pc.name),300);}
        });
      }else if(key==='hp_max'){
        val.split(',').forEach(part=>{const[nm,v]=part.trim().split('=');const pc=findPC(nm?.trim());if(pc&&v){pc.hp_max=parseInt(v);changes.push({text:pc.name+' MaxHP→'+v});}});
      }else if(key==='conditions'){
        val.split(',').forEach(part=>{
          const p=part.trim();
          const eqIdx=p.indexOf('=');const addIdx=p.indexOf('+');const remIdx=p.indexOf('-');
          let delimIdx=addIdx>-1?addIdx:remIdx;
          if(delimIdx<1&&eqIdx>0)delimIdx=eqIdx;
          if(delimIdx<1){return;}
          const nm=p.slice(0,delimIdx).trim();
          const cond=p.slice(delimIdx+1).trim();
          const pc=findPC(nm);
          if(!pc||!cond||cond==='none')return;
          const add=(addIdx>-1&&addIdx===delimIdx)||(eqIdx>0&&eqIdx===delimIdx);
          const rem=remIdx>-1&&remIdx===delimIdx;
          if(!Array.isArray(pc.conditions))pc.conditions=[];if(!Array.isArray(pc.slots))pc.slots=[];
          if(add&&!pc.conditions.includes(cond)){pc.conditions.push(cond);changes.push({text:pc.name+' +'+cond});}
          if(rem){const i=pc.conditions.indexOf(cond);if(i>-1){pc.conditions.splice(i,1);changes.push({text:pc.name+' −'+cond});}}
        });
      }else if(key==='slot_use'){
        val.split(',').forEach(part=>{const[nm,lv]=part.trim().split('=');const pc=findPC(nm?.trim());if(pc){if(!Array.isArray(pc.slots))pc.slots=[];const l=parseInt(lv)-1;if(pc.slots[l]&&pc.slots[l].used<pc.slots[l].max){pc.slots[l].used++;changes.push({text:pc.name+' L'+(l+1)+' slot used'});}}});
      }else if(key==='slot_restore'){
        val.split(',').forEach(part=>{const[nm,what]=part.trim().split('=');const pc=findPC(nm?.trim());if(pc){if(!Array.isArray(pc.slots))pc.slots=[];if(what==='all')pc.slots.forEach(s=>s.used=0);else{const l=parseInt(what)-1;if(pc.slots[l])pc.slots[l].used=0;}changes.push({text:pc.name+' slots restored'});}});
      }else if(key==='loc_desc'){state.worldData.loc_desc=val;changes.push({text:'Loc desc updated'});}
      else if(key==='concentration'){var cp2=val.split('=');var pc2=findPC(cp2[0]);if(pc2){pc2.concentrating=(cp2[1]||'').trim()==='none'?'':(cp2[1]||'').trim();changes.push({text:pc2.name+' concentration updated'});}}
      else if(key==='location'){
        if(val&&val!==state.worldData.location){const old=state.worldData.location;state.worldData.location=val;if(!state.worldData.travelLog)state.worldData.travelLog=[];state.worldData.travelLog.push(state.worldData.time+': '+old+' → '+val);changes.push({text:'Location → '+val});}
      }else if(key==='time'){if(val){state.worldData.time=val;changes.push({text:'Time → '+val});}}
      else if(key==='weather'){if(val){state.worldData.weather=val;changes.push({text:'Weather → '+val});}}
      else if(key==='travel_note'){if(val&&(state.worldData.travelLog||[]).length>0){const li=state.worldData.travelLog.length-1;state.worldData.travelLog[li]+=' | '+val;changes.push({text:'Travel note added'});}}
      else if(['gp','sp','cp','ep','pp'].includes(key)){
        const td=state.treasuryData;
        if(key==='gp'){
          if(val.startsWith('+')){
            const amt=parseFloat(val.slice(1))||0;
            td.gp=(parseFloat(td.gp)||0)+amt;
            if(!Array.isArray(td.incomeLog))td.incomeLog=[];
            td.incomeLog.push({desc:'Gold received',amt,type:'in',category:'misc',ts:state.worldData.time});
          }else if(val.startsWith('-')){
            const amt=parseFloat(val.slice(1))||0;
            td.gp=Math.max(0,(parseFloat(td.gp)||0)-amt);
            if(!Array.isArray(td.incomeLog))td.incomeLog=[];
            td.incomeLog.push({desc:'Gold spent',amt,type:'out',category:'misc',ts:state.worldData.time});
          }else{td.gp=parseFloat(val)||0;}
        }else{
          if(val.startsWith('+'))td[key]=(parseFloat(td[key])||0)+parseFloat(val.slice(1));
          else if(val.startsWith('-'))td[key]=Math.max(0,(parseFloat(td[key])||0)-parseFloat(val.slice(1)));
          else td[key]=parseFloat(val)||0;
        }
        changes.push({text:key.toUpperCase()+'→'+td[key]});
      }else if(key==='item_add'){
        const pts=val.split(',').map(p=>p.trim());
        const KNOWN_TGTS=['wagon','cargo','hoard','party'];
        // Detect if first token is a known target or PC name; fall back to wagon
        const firstLower=pts[0]?.toLowerCase()||'';
        const hasTarget=KNOWN_TGTS.includes(firstLower)||!!findPC(pts[0]);
        const tgt=hasTarget?firstLower:'wagon';
        const base=hasTarget?1:0; // offset: skip target token when present
        const iname=pts[base]||'Item';const iqty=parseInt(pts[base+1])||1;const itype=pts[base+2]||'misc';const iweight=parseFloat(pts[base+3])||0;
        const _provenance=[(state.worldData?.time||''),(state.worldData?.location||'')].filter(Boolean).join(' — ')||'';
        const item={name:iname,qty:iqty,weight:iweight,type:itype,notes:_provenance,ts:state.worldData?.time,location:state.worldData?.location};
        const _fuzzyMatch=(a,b)=>{const al=a.toLowerCase().replace(/\s+/g,''),bl=b.toLowerCase().replace(/\s+/g,'');if(al===bl)return true;if(Math.abs(al.length-bl.length)>2)return false;let d=0;for(let i=0;i<Math.max(al.length,bl.length);i++){if(al[i]!==bl[i])d++;if(d>1)return false;}return true;};
        const stackOrAdd=(list)=>{const ex=list.find(i=>_fuzzyMatch(i.name,iname));if(ex){ex.qty=(ex.qty||1)+iqty;return ex.name;}list.push(item);return false;};
        const _itemMsg=(s,dest)=>s?(s+' ×+'+iqty+' → '+dest):('+'+iname+' → '+dest);
        if(tgt==='wagon'||tgt==='cargo'){if(!state.wagon.cargo)state.wagon.cargo=[];changes.push({text:_itemMsg(stackOrAdd(state.wagon.cargo),'wagon')});}
        else if(tgt==='hoard'){if(!state.wagon.hoard)state.wagon.hoard=[];changes.push({text:_itemMsg(stackOrAdd(state.wagon.hoard),'hoard')});}
        else if(tgt==='party'){if(!state.partyInventory)state.partyInventory=[];changes.push({text:_itemMsg(stackOrAdd(state.partyInventory),'party')});}
        else{const pc=findPC(tgt);if(pc){if(!pc.inventory)pc.inventory=[];changes.push({text:_itemMsg(stackOrAdd(pc.inventory),pc.name)});}
        else{if(!state.wagon.cargo)state.wagon.cargo=[];changes.push({text:_itemMsg(stackOrAdd(state.wagon.cargo),'wagon')});}}
      }else if(key==='item_remove'){
        const pts=val.split(',').map(p=>p.trim());const tgt=pts[0]?.toLowerCase();const nm=pts[1]||'';const qty=parseInt(pts[2])||1;
        const remFrom=(list,n)=>{const nl=n.toLowerCase().replace(/\s+/g,'');const i=list.findIndex(item=>{const il=item.name.toLowerCase().replace(/\s+/g,'');if(il===nl)return true;if(Math.abs(il.length-nl.length)>2)return false;let d=0;for(let j=0;j<Math.max(il.length,nl.length);j++){if(il[j]!==nl[j])d++;if(d>1)return false;}return true;});if(i>-1){list[i].qty-=qty;if(list[i].qty<=0)list.splice(i,1);return true;}return false;};
        if(tgt==='wagon'||tgt==='cargo')remFrom(state.wagon.cargo||[],nm);
        else if(tgt==='party')remFrom(state.partyInventory||[],nm);
        else{const pc=findPC(tgt);if(pc)remFrom(pc.inventory||[],nm);}
        changes.push({text:'Removed '+qty+'x '+nm});
      }else if(key==='wagon_add'){
        const pts=val.split('|').map(p=>p.trim());
        if(pts[0])state.wagon.name=pts[0];
        if(pts[1]){const cap=parseFloat(pts[1]);if(cap>0)state.wagon.capacity=cap;}
        if(pts[2]!==undefined){const w=parseFloat(pts[2]);if(!isNaN(w))state.wagon.wagonWeight=w;}
        if(pts[3]){const ac=parseInt(pts[3]);if(ac>0)state.wagon.ac=ac;}
        if(pts[4])state.wagon.condition=pts[4];
        changes.push({text:'Wagon: '+(pts[0]||'updated')+' (cap '+(state.wagon.capacity||DEFAULT_MAX_LB)+' lb)'});
      }else if(key==='wagon_cell_add'){
        const pts=val.split(',').map(p=>p.trim());
        if(!state.wagon.cells)state.wagon.cells=[];
        state.wagon.cells.push({name:pts[0]||'Creature',size:pts[1]||'Medium',temperament:pts[2]||'hostile',escDC:pts[3]||'DC 14',weight:parseFloat(pts[4])||0,notes:''});
        changes.push({text:'Cell added: '+pts[0]});
      }else if(key==='wagon_cell_update'){
        const pts=val.split(',').map(p=>p.trim());
        const cell=(state.wagon.cells||[]).find(c=>c.name.toLowerCase()===pts[0]?.toLowerCase());
        if(cell){cell.temperament=pts[1]||cell.temperament;changes.push({text:cell.name+' → '+cell.temperament});}
      }else if(key==='wagon_cell_remove'){
        if(state.wagon.cells){const i=state.wagon.cells.findIndex(c=>c.name.toLowerCase()===val.toLowerCase());if(i>-1){state.wagon.cells.splice(i,1);changes.push({text:'Cell removed: '+val});}}
      }else if(key==='ox_hp'){
        const a=(state.wagon.animals||[]).find(an=>an.role==='draft');
        if(a){a.hp=Math.max(0,parseInt(val)||0);changes.push({text:a.name+' HP → '+a.hp});}
        if(state.wagon.ox)state.wagon.ox.hp=Math.max(0,parseInt(val)||0);
      }else if(key==='ox_condition'){
        const a=(state.wagon.animals||[]).find(an=>an.role==='draft');
        if(a){a.conditions=val;changes.push({text:a.name+' → '+val});}
        if(state.wagon.ox)state.wagon.ox.conditions=val;
      }else if(key==='familiar_hp'){
        const parts=val.split('|').map(s=>s.trim());
        const fname=parts[0]||'';const fhp=parseInt(parts[1]);
        if(!isNaN(fhp)){
          const a=findAnimal(fname);
          if(a){a.hp=Math.max(0,Math.min(a.hp_max,fhp));changes.push({text:a.name+' HP → '+a.hp});}
          const pc=state.pcs.find(p=>p.familiar&&p.familiar.name.toLowerCase()===fname.toLowerCase());
          if(pc&&pc.familiar)pc.familiar.hp=Math.max(0,Math.min(pc.familiar.hp_max,fhp));
        }
      }else if(key==='animal_hp'){
        const parts=val.split('=').map(s=>s.trim());
        const a=findAnimal(parts[0]);
        if(a){a.hp=Math.max(0,Math.min(a.hp_max,parseInt(parts[1])||0));changes.push({text:a.name+' HP → '+a.hp});}
      }else if(key==='animal_condition'){
        const parts=val.split('=').map(s=>s.trim());
        const a=findAnimal(parts[0]);
        if(a){a.conditions=parts[1]||'';changes.push({text:a.name+' → '+a.conditions});}
      }
      else if(key==='save_game'||key==='save'){
        save();changes.push({text:'Game saved'});
      }
      else if(key==='wagon_hp'){state.wagon.hp=Math.max(0,parseInt(val)||0);changes.push({text:'Wagon HP → '+state.wagon.hp});}
      else if(key==='resource_use'){
        const pts=val.split(',').map(p=>p.trim());const pc=findPC(pts[0]);const resName=pts.slice(1).join(',').trim();
        if(pc&&resName){const res=(pc.resources||[]).find(r=>r.name.toLowerCase().includes(resName.toLowerCase()));if(res&&res.used<res.max){res.used++;changes.push({text:pc.name+' used '+res.name+' ('+(res.max-res.used)+'/'+res.max+' left)'});}}
      }
      else if(key==='resource_restore'){
        // Handle comma-separated targets: tinkle=all, pebble=all
        const restoreTargets=val.split(/,(?=[a-z])/i);
        restoreTargets.forEach(target=>{
          const eqIdx=target.indexOf('=');
          const pcName=eqIdx>-1?target.slice(0,eqIdx).trim():target.trim();
          const resName=eqIdx>-1?target.slice(eqIdx+1).trim():'all';
          const pc=findPC(pcName);
          if(pc){if(resName==='all'){(pc.resources||[]).forEach(r=>r.used=0);changes.push({text:pc.name+' resources restored'});}
          else{const res=(pc.resources||[]).find(r=>r.name.toLowerCase().includes(resName.toLowerCase()));if(res){res.used=0;changes.push({text:pc.name+' '+res.name+' restored'});}}}});
      }
      else if(key==='shell_defense'){
        const pts=val.split('=');const onOff=pts[1]?.trim().toLowerCase();const pc=findPC(pts[0]);
        if(pc){if(onOff==='on'){if(!pc.conditions.includes('Shell Defense'))pc.conditions.push('Shell Defense');if(!pc.conditions.includes('Prone'))pc.conditions.push('Prone');if(!pc.conditions.includes('Incapacitated'))pc.conditions.push('Incapacitated');changes.push({text:'Retreated into shell (AC 21)'});}
        else{['Shell Defense','Prone','Incapacitated'].forEach(c=>{const i=pc.conditions.indexOf(c);if(i>-1)pc.conditions.splice(i,1);});changes.push({text:'Emerged from shell'});}}
      }
      else if(key==='town_rep'){
        const pts=val.split(',').map(p=>p.trim());
        const rep={town:pts[0]||'Unknown',status:pts[1]||'neutral',notes:pts.slice(2).join(','),ts:state.worldData.time};
        if(!Array.isArray(state.worldData.townReputation))state.worldData.townReputation=[];
        const existing=state.worldData.townReputation.findIndex(t=>t.town.toLowerCase()===rep.town.toLowerCase());
        const prevStatus=existing>-1?state.worldData.townReputation[existing].status:'';
        if(existing>-1)state.worldData.townReputation[existing]=rep;
        else state.worldData.townReputation.push(rep);
        changes.push({text:'Town rep: '+rep.town+' → '+rep.status});
        // Reputation Ripple — auto-consequence when a town turns burned/fled
        const nowBurned=(rep.status==='burned'||rep.status==='fled');
        const wasBurned=(prevStatus==='burned'||prevStatus==='fled');
        if(nowBurned&&!wasBurned){
          if(!Array.isArray(state.consequences))state.consequences=[];
          state.consequences.push({id:'csq_rep_'+Date.now(),text:'Word of the incident in '+rep.town+' is spreading along trade routes. Merchants, guards, and travelers in nearby settlements may have heard.'+(rep.notes?' ('+rep.notes+')':''),type:'faction',resolved:false,ts:state.worldData.time,location:state.worldData.location,_ripple:true});
          changes.push({text:'⚠ Reputation ripple: '+rep.town+' → spreading'});
        }
      }
      else if(key==='income'){
        const pts=val.split(',').map(p=>p.trim());const amt=parseFloat(pts[0])||0;const cat=pts[1]||'misc';const desc=pts.slice(2).join(',');
        if(/\bxp\b/i.test(desc)||/\bxp\b/i.test(cat)){_rejected.push('income: XP is not gold — use xp: mechanic instead');return;}
        if(!Array.isArray(state.treasuryData.incomeLog))state.treasuryData.incomeLog=[];
        state.treasuryData.incomeLog.push({desc,amt,type:cat==='overhead'||cat==='emergency'?'out':'in',category:cat,ts:state.worldData.time,location:state.worldData.location||''});
        const gpKey='gp';const td=state.treasuryData;
        if(cat==='overhead'||cat==='emergency')td[gpKey]=Math.max(0,(parseFloat(td[gpKey])||0)-amt);
        else td[gpKey]=(parseFloat(td[gpKey])||0)+amt;
        changes.push({text:'Income: '+(cat==='overhead'||cat==='emergency'?'-':'+')+''+amt+'gp ('+cat+')'});
      }
      else if(key==='expense'){
        const pts=val.split(',').map(p=>p.trim());const amt=parseFloat(pts[0])||0;const desc=pts.slice(1).join(',').trim()||'Expense';
        if(!Array.isArray(state.treasuryData.incomeLog))state.treasuryData.incomeLog=[];
        state.treasuryData.incomeLog.push({desc,amt,type:'out',category:'expense',ts:state.worldData.time,location:state.worldData.location||''});
        state.treasuryData.gp=Math.max(0,(parseFloat(state.treasuryData.gp)||0)-amt);
        changes.push({text:'Expense: -'+amt+'gp ('+desc+')'});
      }
      else if(key==='short_rest'){
        val.split(',').forEach(nm=>{
          const pc=findPC(nm.trim());
          if(!pc)return;
          // Restore Bardic Inspiration (Bard), Stone's Endurance (Goliath), and other short-rest features
          // These are tracked as free-text features so we just note it and let the player confirm
          changes.push({text:pc.name+' short rest features restored'});
        });
      }
      else if(key==='xp'){
        val.split(',').forEach(part=>{
          const p=part.trim();
          const m=p.match(/^([^+=]+?)\s*\+\s*(\d[\d,]*)\s*$/);
          if(m){
            const target=m[1].trim().toLowerCase();
            const amt=parseInt(m[2].replace(/,/g,''));
            if(target==='party'||target==='all'){
              state.pcs.forEach(pc=>{pc.xp=(pc.xp||0)+amt;changes.push({text:pc.name+' +'+amt+'xp'});checkLevelUp(pc);});
            }else{
              const pc=findPC(m[1].trim());if(pc){pc.xp=(pc.xp||0)+amt;changes.push({text:pc.name+' +'+amt+'xp'});checkLevelUp(pc);}
            }
          }
        });
      }else if(key==='module_episode'){
        const pts=val.split(',').map(p=>p.trim());
        const epIdx=parseInt(pts[0])-1;const epStatus=(pts[1]||'active').toLowerCase();
        if(!Array.isArray(state.moduleProgress))state.moduleProgress=[];
        if(epIdx>=0&&epIdx<state.moduleProgress.length){
          state.moduleProgress[epIdx].status=epStatus;
          if(epStatus==='active'){for(let j=0;j<epIdx;j++){if(state.moduleProgress[j].status==='pending')state.moduleProgress[j].status='complete';}}
          changes.push({text:'Episode '+(epIdx+1)+' → '+epStatus});
        }
      }else if(key==='primary_mission'){if(val){state.worldData.primaryMission=val;changes.push({text:'Main Quest → '+val.slice(0,40)});}}
      else if(key==='quest_done'){const q=state.quests.find(qu=>qu.text.toLowerCase().includes(val.toLowerCase()));if(q&&q.status!=='done'){q.status='done';changes.push({text:'Quest ✓: '+q.text.slice(0,30)});}}
      else if(key==='quest_fail'){const q=state.quests.find(qu=>qu.text.toLowerCase().includes(val.toLowerCase()));if(q){q.status='failed';changes.push({text:'Quest ✗: '+q.text.slice(0,30)});}}
      else if(key==='quest_update'){
        const parts=val.split('|').map(p=>p.trim());
        const name=parts[0];
        const q=state.quests.find(qu=>qu.text.toLowerCase().includes(name.toLowerCase()));
        if(q){
          const note=parts.slice(1).join(' | ').trim();
          if(note)q.notes=(q.notes?q.notes+'\n':'')+note;
          changes.push({text:'Quest ✎: '+q.text.slice(0,30)});
        }
      }
      else if(key==='quest_add'){
        // Dedup: skip if a quest with near-identical text already exists
        const norm=val.split('|')[0].toLowerCase().trim().slice(0,30);
        const dup=state.quests.find(qu=>qu.text.toLowerCase().slice(0,30)===norm);
        if(!dup){
          // Extract discovery paragraph: sentence(s) containing the quest name from AI prose
          const questTitle=val.split('|')[0].trim();
          let discovery=null;
          const proseOnly=responseText.replace(/---MECHANICS---[\s\S]*?(?:---END---|$)/i,'').trim();
          if(proseOnly&&questTitle){
            const sentences=proseOnly.split(/(?<=[.!?])\s+/);
            const titleWords=questTitle.toLowerCase().split(/\s+/).filter(w=>w.length>3);
            const hits=sentences.filter(s=>titleWords.some(w=>s.toLowerCase().includes(w)));
            discovery=hits.length?hits.slice(0,3).join(' ').trim().slice(0,400):proseOnly.slice(0,300).trim();
          }
          const questLoc=state.worldData?.location||'';
          const questObj={text:val,status:'active',hidden:false,discovery:discovery?{text:discovery,ts:new Date().toLocaleString()}:null,chatMsgId:pendingMsgId||null,location:questLoc,notes:''};
          state.quests.push(questObj);
          const newQuestIdx=state.quests.length-1;
          changes.push({text:'New quest: '+val.slice(0,30)});
          // Anchor quest to current location's history
          const _ql=(state.locations||[]).find(l=>l.name.toLowerCase()===questLoc.toLowerCase());
          if(_ql){if(!Array.isArray(_ql.history))_ql.history=[];_ql.history.push({ts:state.worldData?.time||'',text:'Quest discovered: '+questTitle,dmOnly:false});}
          // Tappable navToast — tap opens World tab → scrolls to & opens the specific quest
          setTimeout(()=>navToast('⚔','New Quest',questTitle.slice(0,40),()=>{
            navTo('world');
            setTimeout(()=>{
              const det=document.getElementById('quest-det-'+newQuestIdx);
              if(det){det.open=true;det.scrollIntoView({behavior:'smooth',block:'center'});det.style.outline='2px solid var(--gold)';det.style.borderRadius='6px';setTimeout(()=>{det.style.outline='';},2200);}
            },350);
          }),400);
        } else{changes.push({text:'Quest exists (skipped): '+norm});}
      }
      else if(key==='npc_mood'){const pts=val.split('=');const npc=state.npcs.find(n=>n.name.toLowerCase()===pts[0]?.trim().toLowerCase());if(npc&&pts[1]){npc.disposition=pts[1].trim();changes.push({text:npc.name+' → '+npc.disposition});}}
      else if(key==='npc_add'){
        const pts=val.split(',').map(p=>p.trim());const nname=pts[0]||'NPC';
        const existing=state.npcs.find(n=>n.name.toLowerCase()===nname.toLowerCase());
        if(existing){existing.disposition=pts[1]||existing.disposition;existing.lastSeen=state.worldData.location;changes.push({text:'NPC updated: '+nname});}
        else{state.npcs.push({name:nname,disposition:pts[1]||'Neutral',details:pts[2]||'',status:'active',hp:0,lastSeen:state.worldData.location});changes.push({text:'New NPC: '+nname});}
        const _curLoc=(state.locations||[]).find(l=>l.name.toLowerCase()===(state.worldData.location||'').toLowerCase());
        if(_curLoc){if(!Array.isArray(_curLoc.npcs))_curLoc.npcs=[];if(!_curLoc.npcs.some(n=>n.toLowerCase()===nname.toLowerCase()))_curLoc.npcs.push(nname);}
      }
      else if(key==='consequence_add'){
        const sep=val.indexOf('|');
        const text=sep>-1?val.slice(0,sep).trim():val.trim();
        const type=(sep>-1?val.slice(sep+1).trim():'background').toLowerCase();
        if(text){
          const textLow=text.toLowerCase();
          const isDupe=state.consequences.some(c=>{
            const cLow=(c.text||'').toLowerCase();
            if(cLow===textLow)return true;
            const words=textLow.split(/\s+/).filter(w=>w.length>3);
            if(words.length<2)return false;
            const hits=words.filter(w=>cLow.includes(w)).length;
            return hits/words.length>=0.6;
          });
          if(isDupe){changes.push({text:'Consequence skipped (duplicate): '+text.slice(0,40)});}
          else{
            state.consequences.push({id:'csq_'+Date.now(),text,type,resolved:false,ts:state.worldData.time,location:state.worldData.location});
            changes.push({text:'Consequence ['+type+']: '+text.slice(0,40)});
          }
        }
      }else if(key==='consequence_resolve'){
        const cs=state.consequences.find(c=>!c.resolved&&c.text.toLowerCase().includes(val.toLowerCase()));
        if(cs){cs.resolved=true;cs.resolvedTs=new Date().toLocaleString();changes.push({text:'Consequence resolved: '+cs.text.slice(0,40)});}
      }
      else if(key==='location_add'){
        const parts=val.split('|').map(s=>s.trim());
        const lname=parts[0],ltype=(parts[1]||'waypoint').toLowerCase(),ldesc=parts[2]||'';
        if(lname){
          const existing=state.locations.find(l=>l.name.toLowerCase()===lname.toLowerCase());
          if(existing){existing.status='visited';existing.lastVisited=state.worldData.time||'';}
          else{
            const lid='loc_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
            state.locations.push({id:lid,name:lname,type:ltype,status:'visited',firstVisited:state.worldData.time||'',lastVisited:state.worldData.time||'',rep:{disposition:'Neutral',notes:''},npcs:[],investments:[],history:ldesc?[{ts:state.worldData.time||'',text:ldesc,dmOnly:false}]:[],dmNotes:'',playerNotes:'',mapPos:null});
          }
          changes.push({text:'Location: '+lname});
        }
      }
      else if(key==='location_visit'){
        const lv=state.locations.find(l=>l.name.toLowerCase().includes(val.toLowerCase().trim()));
        if(lv){lv.status='visited';lv.lastVisited=state.worldData.time||'';changes.push({text:'Visited: '+lv.name});}
      }
      else if(key==='location_history'){
        const lhp=val.split('|').map(s=>s.trim());
        const lhLoc=state.locations.find(l=>l.name.toLowerCase().includes((lhp[0]||'').toLowerCase()));
        if(lhLoc&&lhp[1]){
          if(!Array.isArray(lhLoc.history))lhLoc.history=[];
          lhLoc.history.push({ts:state.worldData.time||'',text:lhp[1],dmOnly:(lhp[2]||'').toLowerCase()==='true'});
          changes.push({text:'History → '+lhLoc.name});
        }
      }
      else if(key==='location_investment'){
        const lip=val.split('|').map(s=>s.trim());
        const liLoc=state.locations.find(l=>l.name.toLowerCase().includes((lip[0]||'').toLowerCase()));
        if(liLoc&&lip[1]){
          if(!Array.isArray(liLoc.investments))liLoc.investments=[];
          liLoc.investments.push({desc:lip[1],amount:parseInt(lip[2])||0,startDay:state.worldData.time||'',notes:''});
          changes.push({text:'Investment @ '+liLoc.name});
        }
      }
      else if(key==='roll_request'){
        const rp=val.split('|').map(s=>s.trim());
        const skill=rp[0]||'Check',dc=rp[1]||'',pcname=rp[2]||'';
        const label=(pcname?pcname+': ':'')+skill+(dc?' DC '+dc:'');
        if(!window._rollRequestQueue)window._rollRequestQueue=[];
        const dupe=window._rollRequestQueue.some(r=>r.skill===skill&&r.pcname===pcname);
        if(!dupe){
          window._rollRequestQueue.push({skill,dc,pcname,label,id:Date.now()+Math.random()});
          _renderRollQueue();
        }
        changes.push({text:'Roll requested: '+label});
      }
      else if(key==='spell_add'){
        // Format: PCname|SpellName|level|castTime|range|duration|components|desc
        const parts=(val).split('|').map(s=>s.trim());
        const pcName=parts[0],spName=parts[1];
        if(!pcName||!spName)return;
        const lvl=parseInt(parts[2])||0;
        const spData={name:spName,level:lvl,castTime:parts[3]||'',range:parts[4]||'',duration:parts[5]||'',components:parts[6]||'',desc:parts[7]||''};
        const tpc=state.pcs.find(p=>p.name.toLowerCase().includes(pcName.toLowerCase()));
        if(tpc){
          if(!Array.isArray(tpc.spellbook))tpc.spellbook=[];
          if(!tpc.spellbook.find(s=>s.name.toLowerCase()===spName.toLowerCase())){
            tpc.spellbook.push(spData);
            _sortSpellbook(tpc.spellbook);
            changes.push({text:'Spell added: '+spName+(lvl?' ('+lvl+'th lvl)':' (cantrip)')+' → '+tpc.name});
          }
        }
      }
      else if(key==='death_save'){
        // Format: PCname|success OR PCname|failure
        const [pcn,result]=(val||'').split('|').map(s=>s.trim());
        const dpc=state.pcs.find(p=>p.name.toLowerCase().includes((pcn||'').toLowerCase()));
        if(dpc){
          if(!dpc.death_saves)dpc.death_saves={successes:0,failures:0};
          const isSuccess=/success/i.test(result||'');
          if(isSuccess){dpc.death_saves.successes=Math.min(3,dpc.death_saves.successes+1);if(dpc.death_saves.successes>=3){dpc.hp=1;dpc.death_saves={successes:0,failures:0};mechToast('⬤ '+esc(dpc.name)+' stabilized!','green');}}
          else{dpc.death_saves.failures=Math.min(3,dpc.death_saves.failures+1);if(dpc.death_saves.failures>=3){dpc.death_saves={successes:0,failures:0};mechToast('💀 '+esc(dpc.name)+' has died.','red');}}
          changes.push({text:dpc.name+' death save: '+(isSuccess?'success':'failure')});
        }
      }
      else if(key==='pc_update'){
        const pts=val.split(',').map(p=>p.trim());const pc=findPC(pts[0]);const field=pts[1];const nv=pts.slice(2).join(',');
        const fields=['name','race','class','level','background','alignment','initiative','speed','passive_perception','passive_insight','xp','str','dex','con','int','wis','cha','skills','features','magic','backstory_origin','backstory_motivation','backstory_secret','ac','hp_max'];
        if(pc&&field&&nv&&fields.includes(field)){pc[field]=isNaN(nv)?nv:(parseFloat(nv)||nv);changes.push({text:pc.name+' '+field+'→'+nv});}
      }else if(key==='pc_add'){
        const pts=val.split(',').map(p=>p.trim());
        state.pcs.push({id:'pc_'+Date.now(),name:pts[0]||'New',race:pts[1]||'Human',class:pts[2]||'Fighter',level:parseInt(pts[3])||1,hp:parseInt(pts[4])||10,hp_max:parseInt(pts[4])||10,ac:parseInt(pts[5])||14,initiative:parseInt(pts[6])||2,speed:30,passive_perception:10,passive_insight:10,xp:0,color:'#5a8a5a',str:'10 (+0)',dex:'10 (+0)',con:'10 (+0)',int:'10 (+0)',wis:'10 (+0)',cha:'10 (+0)',skills:'',features:'',magic:'None',conditions:[],slots:[],inventory:[],backstory_origin:'',backstory_motivation:'',backstory_secret:''});
        changes.push({text:'Added: '+pts[0]});
      }else if(key==='pc_delete'){
        const i=state.pcs.findIndex(p=>p.name.toLowerCase()===val.toLowerCase()||p.id===val);
        if(i>-1&&state.pcs.length>1){changes.push({text:'Removed: '+state.pcs[i].name});state.pcs.splice(i,1);state.activeEditTab=Math.min(state.activeEditTab||0,state.pcs.length-1);}
      }else if(key==='zone_move'){
        const zp=val.split('|').map(s=>s.trim());
        const zent=(state.combat.list||[]).find(c=>c.name.toLowerCase().includes((zp[0]||'').toLowerCase()));
        const zid=(zp[1]||'').toLowerCase();
        if(zent&&ZONE_IDS.includes(zid)){zent.zone=zid;changes.push({text:zent.name+' → '+(state.combat.zones[zid]?.label||zid)});}
      }else if(key==='zone_add_enemy'){
        const zp=val.split('|').map(s=>s.trim());
        const zname=zp[0]||'Enemy';const zhp=parseInt(zp[1])||10;const zac=parseInt(zp[2])||12;const zzone=zp[3]||'front';const zinit=parseInt(zp[4])||Math.floor(Math.random()*20)+1;
        state.combat.active=true;
        if(!state.combat.zones)state.combat.zones=_defaultZones();
        state.combat.list.push({name:zname,val:zinit,hp:zhp,hp_max:zhp,ac:zac,isPC:false,zone:ZONE_IDS.includes(zzone)?zzone:'front',conditions:[],concentrating:''});
        sortComb();changes.push({text:zname+' joined '+ZONE_LABELS[zzone||'front']});
      }else if(key==='zone_remove'){
        const zi=state.combat.list.findIndex(c=>c.name.toLowerCase().includes(val.toLowerCase()));
        if(zi>-1){changes.push({text:state.combat.list[zi].name+' removed'});state.combat.list.splice(zi,1);if(state.combat.currentIdx>=state.combat.list.length)state.combat.currentIdx=Math.max(0,state.combat.list.length-1);}
      }else if(key==='zone_effect'){
        const zp=val.split('|').map(s=>s.trim());
        const zid=(zp[0]||'').toLowerCase();const zfx=zp[1]||'';const ztype=zp[2]||'';
        if(ZONE_IDS.includes(zid)){
          if(!state.combat.zones)state.combat.zones=_defaultZones();
          if(!state.combat.zones[zid])state.combat.zones[zid]={label:ZONE_LABELS[zid],effect:'',terrain:'',hidden:false};
          if(ztype==='terrain'||ztype==='difficult')state.combat.zones[zid].terrain=zfx;
          else state.combat.zones[zid].effect=zfx;
          changes.push({text:(state.combat.zones[zid].label||zid)+': '+zfx});
        }
      }else if(key==='zone_label'){
        const zp=val.split('|').map(s=>s.trim());
        const zid=(zp[0]||'').toLowerCase();const zlbl=zp[1]||'';
        if(ZONE_IDS.includes(zid)&&zlbl){
          if(!state.combat.zones)state.combat.zones=_defaultZones();
          if(!state.combat.zones[zid])state.combat.zones[zid]={label:ZONE_LABELS[zid],effect:'',terrain:'',hidden:false};
          state.combat.zones[zid].label=zlbl;
          changes.push({text:'Zone renamed: '+zlbl});
        }
      }else if(key==='zone_fog'){
        const zp=val.split('|').map(s=>s.trim());
        const zid=(zp[0]||'').toLowerCase();const action=(zp[1]||'hide').toLowerCase();
        if(ZONE_IDS.includes(zid)){
          if(!state.combat.zones)state.combat.zones=_defaultZones();
          if(!state.combat.zones[zid])state.combat.zones[zid]={label:ZONE_LABELS[zid],effect:'',terrain:'',hidden:false};
          state.combat.zones[zid].hidden=action!=='reveal';
          changes.push({text:(state.combat.zones[zid].label||zid)+(action==='reveal'?' revealed':' hidden')});
        }
      }else if(key==='combat_start'){
        state.combat.active=true;
        if(!state.combat.zones)state.combat.zones=_defaultZones();
        changes.push({text:'Combat started'});
      }else if(key==='combat_end'){
        var ceSummary=val||('Combat ended — Round '+state.combat.round);
        var ceLoc=(state.worldData||{}).location||'';
        if(ceLoc){var ceLocObj=(state.locations||[]).find(function(l){return l.name===ceLoc;});if(ceLocObj){if(!ceLocObj.history)ceLocObj.history=[];ceLocObj.history.push({ts:state.worldData.time||'',text:ceSummary,dmOnly:false});}}
        state.combat={active:false,round:1,currentIdx:0,list:[],zones:_defaultZones(),moveMode:'ai'};
        _zoneMoveSel=null;
        changes.push({text:'Combat ended'});
      }else if(key==='chapter_add'){
        const sep=val.indexOf('|');const ctitle=sep>-1?val.slice(0,sep).trim():val.trim();const ccontent=sep>-1?val.slice(sep+1).trim():'';
        if(ctitle&&ccontent){if(!Array.isArray(state.storyChapters))state.storyChapters=[];state.storyChapters.push({id:Date.now(),title:ctitle,content:ccontent,date:state.worldData.time||''});changes.push({text:'Chapter added: '+ctitle});}
      }else if(key==='chapter_update'){
        const sep=val.indexOf('|');const cquery=sep>-1?val.slice(0,sep).trim():val.trim();const ccontent=sep>-1?val.slice(sep+1).trim():'';
        if(cquery&&ccontent&&Array.isArray(state.storyChapters)){const ch=state.storyChapters.find(c=>c.title.toLowerCase().includes(cquery.toLowerCase()));if(ch){ch.content=ccontent;ch.date=state.worldData.time||ch.date;changes.push({text:'Chapter updated: '+ch.title});}}
      }
    }catch(e){changes.push({text:'Parse err: '+line.slice(0,30),error:true});console.warn('Mech parse err:',line,e);}
  });
  if(changes.length>0){
    state.pcs.forEach(pc=>checkLevelUp(pc));
    _autoOpenLevelUp();
    save();
    renderCharTabs();renderCards();renderStatusMini();renderSheets();
    renderNPCs();renderQuests();renderConsequences();renderCombat();renderWagon();syncWorld();renderModuleTracker();
    mechToast(changes);
  }
  if(changes.length||_rejected.length){
    const applied=changes.map(c=>c.text).join(', ');
    const rejected=_rejected.join(', ');
    _lastMechReceipt='[MECHANICS RECEIPT] Applied: '+(applied||'none')+'.'+(_rejected.length?' Rejected: '+rejected+'.':'');
  }
  return changes.length>0?changes:null;
}
// State changelog — surfaces parsed mechanics as a stacking "ledger ink" feed
function mechToast(changes){
  if(!changes||!changes.length)return;
  // Flash affected tabs (only if not currently visible)
  const tabsToFlash=new Set();
  changes.forEach(ch=>{
    const t=ch.text||'';
    if(/\bHP\b|MaxHP|Prone|Incap|Condition|Shell|Sneak|concentrat/i.test(t))tabsToFlash.add('tab-party');
    if(/Quest|Main Quest|Episode/i.test(t))tabsToFlash.add('tab-session');
    if(/NPC|New NPC|→ \w|disposition/i.test(t))tabsToFlash.add('tab-world');
    if(/Income|Expense|gp|GP→/i.test(t))tabsToFlash.add('tab-world');
    if(/Added.*wagon|Added.*cargo|Added.*hoard/i.test(t))tabsToFlash.add('tab-wagon');
    if(/Location →/i.test(t))tabsToFlash.add('tab-world');
    if(/Consequence/i.test(t))tabsToFlash.add('tab-world');
    if(/Chapter added|Chapter updated/i.test(t))tabsToFlash.add('tab-session');
  });
  tabsToFlash.forEach(flashTab);
  let c=document.getElementById('mech-toast');
  if(!c){
    c=document.createElement('div');c.id='mech-toast';
    c.style.cssText='position:fixed;right:12px;bottom:96px;z-index:9998;display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none;max-width:80vw';
    document.body.appendChild(c);
  }
  changes.forEach((ch,i)=>{
    const txt=ch.text||'';
    let icon='✦';
    if(/Main Quest/i.test(txt))icon='🎯';
    else if(/Quest/i.test(txt))icon='📜';
    else if(/HP\b|MaxHP/i.test(txt))icon='⚔';
    else if(/NPC|→ \w/i.test(txt))icon='🗣';
    else if(/Episode/i.test(txt))icon='📖';
    else if(/xp\b|level up/i.test(txt))icon='⭐';
    else if(/[+−]\w|rest|shell|emerged|retreated/i.test(txt))icon='✨';
    else if(/Added:|New |Removed:/i.test(txt))icon='🎒';
    const danger=ch.error;
    const line=document.createElement('div');
    line.style.cssText='pointer-events:auto;cursor:pointer;font-size:12px;font-family:var(--mono,monospace);background:var(--surface2);color:'+(danger?'var(--red)':'var(--text-bright)')+';border:1px solid '+(danger?'var(--red)':'var(--gold-dim)')+';border-left:3px solid '+(danger?'var(--red)':'var(--gold)')+';border-radius:3px;padding:6px 10px;box-shadow:0 2px 8px rgba(0,0,0,.45);opacity:0;transform:translateX(14px);transition:opacity .25s ease,transform .25s ease';
    line.textContent=icon+' '+txt;
    line.onclick=()=>line.remove();
    c.appendChild(line);
    setTimeout(()=>{line.style.opacity='1';line.style.transform='translateX(0)';},70*i+30);
    setTimeout(()=>{line.style.opacity='0';line.style.transform='translateX(14px)';setTimeout(()=>line.remove(),320);},2700+70*i);
  });
}
// Tappable navigation toast — action-linked mechanic announcements
function navToast(icon, label, caption, onTap, autoMs=6500){
  let c=document.getElementById('mech-toast');
  if(!c){c=document.createElement('div');c.id='mech-toast';c.style.cssText='position:fixed;right:12px;bottom:96px;z-index:9998;display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none;max-width:80vw';document.body.appendChild(c);}
  const chip=document.createElement('div');
  chip.style.cssText='pointer-events:auto;cursor:pointer;font-size:12px;font-family:var(--sans);background:var(--surface2);color:var(--text-bright);border:1px solid var(--gold-dim);border-left:3px solid var(--gold);border-radius:5px;padding:8px 12px;box-shadow:0 2px 12px rgba(0,0,0,.5);opacity:0;transform:translateX(14px);transition:opacity .25s ease,transform .25s ease;max-width:220px';
  chip.innerHTML='<div style="font-size:13px;font-weight:700;color:var(--gold-bright)">'+icon+' '+esc(label)+'</div>'+(caption?'<div style="font-size:11px;color:var(--text);margin-top:2px">'+esc(caption)+'</div>':'')+'<div style="font-size:10px;color:var(--text-dim);margin-top:4px">Tap to open →</div>';
  chip.onclick=()=>{chip.remove();if(onTap)onTap();};
  c.appendChild(chip);
  setTimeout(()=>{chip.style.opacity='1';chip.style.transform='translateX(0)';},30);
  setTimeout(()=>{chip.style.opacity='0';chip.style.transform='translateX(14px)';setTimeout(()=>chip.remove(),320);},autoMs);
}
function _mechPillNav(el){
  const t=el.textContent||'';
  const pcs=state.pcs||[];
  let pi=-1;
  for(let i=0;i<pcs.length;i++){if(pcs[i].name&&t.startsWith(pcs[i].name)){pi=i;break;}}
  if(pi>=0){
    state.activeEditTab=pi;
    if(/slot/i.test(t))_pcSheetTab=3;
    else if(/ used | restored|short rest/i.test(t))_pcSheetTab=1;
    else if(/spell added/i.test(t))_pcSheetTab=3;
    else _pcSheetTab=0;
    navTo('party');return;
  }
  if(/→ wagon|→ hoard|→ party|^Removed |^Cell |^Ox |^Wagon HP|^\+.*→|×\+.*→/i.test(t)||
     /^(GP|SP|CP|EP|PP)→/i.test(t)||/^Income:|^Expense:/i.test(t)){navTo('wagon');return;}
  if(/^Location →|^Time →|^Weather →|^Travel note|^Loc desc|^Town rep|^Main Quest|^Episode |^Quest |^New quest|NPC|^Consequence|^Location:|^Visited:|^History →|^Investment/i.test(t)){navTo('world');return;}
  if(/Combat|initiative|joined |zone|removed$|hidden$|revealed$/i.test(t)){navTo('combat');return;}
  if(/^Chapter/i.test(t)){navTo('session');return;}
  if(/^Added:|Spell added/i.test(t)){navTo('party');return;}
}
// Catch gold the AI narrated in prose but forgot to log via income:/expense:/gp:
// Surfaces a one-tap confirm chip instead of forcing a tab-switch + manual entry.
function detectUnloggedGold(prose,changes){
  if(!prose)return;
  // If a gold mechanic already fired this turn, the AI did its job — stay quiet.
  const logged=(changes||[]).some(c=>/income:|expense:|GP\s*→|gp→/i.test(c.text||''));
  if(logged)return;
  // Transaction-shaped mention: a number bound directly to a gold-currency word.
  const m=prose.match(/(\d{1,5})\s*(?:gp|gold pieces?|gold coins?|gold)\b/i);
  if(!m)return;
  const amt=parseInt(m[1]);
  if(!amt)return;
  const ctx=prose.slice(Math.max(0,m.index-44),m.index+44).toLowerCase();
  const spent=/\b(pay|paid|pays|spend|spent|spends|cost|costs?|owe|owes|fee|buy|bought|buys|purchase|purchased)\b/.test(ctx);
  confirmLedgerChip(amt,spent?'out':'in');
}
function detectUnloggedNPC(prose,changes){
  if(!prose||prose.length<60)return;
  // Skip if npc_add already fired this turn
  if((changes||[]).some(c=>/NPC added/i.test(c.text||'')))return;
  // Known names (PC names + existing NPC names)
  const pcNames=new Set((state.pcs||[]).map(p=>p.name.toLowerCase()));
  const npcNames=new Set((state.npcs||[]).map(n=>n.name.toLowerCase()));
  const known=new Set([...pcNames,...npcNames]);
  // Attribution patterns: "Name said/replied/etc" or quoted speech with name
  const VERBS='said|replied|asked|whispered|nodded|smiled|frowned|laughed|sighed|called|announced|warned|barked|muttered|snapped|shook|gestured|bowed|raised';
  const attrRe=new RegExp('\\b([A-Z][a-z]{2,16})(?:\\s+[A-Z][a-z]+)?\\s+(?:'+VERBS+')','g');
  const candidates=new Map();
  let m;
  while((m=attrRe.exec(prose))!==null){
    const name=m[1];
    if(['The','A','An','He','She','They','It','His','Her','Their','You','We','Your','Our'].includes(name))continue;
    const low=name.toLowerCase();
    if(known.has(low))continue;
    candidates.set(name,(candidates.get(name)||0)+1);
  }
  // Only flag names that appear ≥2 times (reduces false positives)
  const hits=[...candidates.entries()].filter(([,c])=>c>=2).map(([n])=>n);
  if(!hits.length)return;
  // Show a single chip for the first unlogged name
  const topName=hits[0];
  let c=document.getElementById('mech-toast');
  if(!c){c=document.createElement('div');c.id='mech-toast';c.style.cssText='position:fixed;right:12px;bottom:96px;z-index:9998;display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none;max-width:80vw';document.body.appendChild(c);}
  const chip=document.createElement('div');
  chip.style.cssText='pointer-events:auto;display:flex;align-items:center;gap:8px;font-size:12px;background:var(--surface2);color:var(--text-bright);border:1px solid var(--purple);border-left:3px solid var(--purple);border-radius:3px;padding:6px 8px 6px 10px;box-shadow:0 2px 10px rgba(0,0,0,.5);opacity:0;transform:translateX(14px);transition:opacity .25s ease,transform .25s ease';
  const close=()=>{chip.style.opacity='0';chip.style.transform='translateX(14px)';setTimeout(()=>chip.remove(),300);};
  const txt=document.createElement('span');txt.textContent='👤 Log NPC "'+topName+'"?';
  const yes=document.createElement('button');yes.textContent='✓';yes.style.cssText='cursor:pointer;border:none;border-radius:3px;background:var(--purple);color:#fff;font-weight:bold;padding:2px 9px;font-size:13px';
  const no=document.createElement('button');no.textContent='✕';no.style.cssText='cursor:pointer;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--text-dim);padding:2px 8px;font-size:13px';
  yes.onclick=()=>{
    if(!Array.isArray(state.npcs))state.npcs=[];
    state.npcs.push({id:'npc_'+Date.now(),name:topName,race:'',occupation:'',disposition:'neutral',location:state.worldData?.location||'',lastSeen:state.worldData?.time||'',notes:'',history:[],aiOnly:false});
    save();renderNPCs();
    txt.textContent='✓ '+topName+' added to NPCs';chip.style.borderColor='var(--green)';chip.style.borderLeftColor='var(--green)';
    yes.remove();no.remove();setTimeout(close,1400);
  };
  no.onclick=close;
  chip.append(txt,yes,no);c.appendChild(chip);
  requestAnimationFrame(()=>{chip.style.opacity='1';chip.style.transform='translateX(0)';});
  setTimeout(close,9000);
}
function confirmLedgerChip(amt,dir){
  let c=document.getElementById('mech-toast');
  if(!c){
    c=document.createElement('div');c.id='mech-toast';
    c.style.cssText='position:fixed;right:12px;bottom:96px;z-index:9998;display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none;max-width:80vw';
    document.body.appendChild(c);
  }
  const verb=dir==='out'?'spent':'earned';
  const chip=document.createElement('div');
  chip.style.cssText='pointer-events:auto;display:flex;align-items:center;gap:8px;font-size:12px;background:var(--surface2);color:var(--text-bright);border:1px solid var(--gold);border-left:3px solid var(--gold);border-radius:3px;padding:6px 8px 6px 10px;box-shadow:0 2px 10px rgba(0,0,0,.5);opacity:0;transform:translateX(14px);transition:opacity .25s ease,transform .25s ease';
  const txt=document.createElement('span');txt.textContent='💰 Log '+amt+' gp '+verb+'?';
  const yes=document.createElement('button');yes.textContent='✓';
  yes.style.cssText='cursor:pointer;border:none;border-radius:3px;background:var(--gold);color:var(--bg);font-weight:bold;padding:2px 9px;font-size:13px';
  const no=document.createElement('button');no.textContent='✕';
  no.style.cssText='cursor:pointer;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--text-dim);padding:2px 8px;font-size:13px';
  const close=()=>{chip.style.opacity='0';chip.style.transform='translateX(14px)';setTimeout(()=>chip.remove(),300);};
  yes.onclick=()=>{
    if(!Array.isArray(state.treasuryData.incomeLog))state.treasuryData.incomeLog=[];
    state.treasuryData.incomeLog.push({desc:(dir==='out'?'Spent (confirmed)':'Earned (confirmed)'),amt,type:dir,category:dir==='out'?'expense':'misc',ts:state.worldData.time});
    const cur=parseFloat(state.treasuryData.gp)||0;
    state.treasuryData.gp=dir==='in'?cur+amt:Math.max(0,cur-amt);
    save();renderIncome();renderTreasuryTotal();const tg=document.getElementById('t_gp');if(tg)tg.value=state.treasuryData.gp;
    if(navigator.vibrate)try{navigator.vibrate(12);}catch(e){}
    txt.textContent='✓ '+amt+' gp '+verb+' logged';chip.style.borderColor='var(--green)';chip.style.borderLeftColor='var(--green)';
    yes.remove();no.remove();
    setTimeout(close,1400);
  };
  no.onclick=close;
  chip.appendChild(txt);chip.appendChild(yes);chip.appendChild(no);
  c.appendChild(chip);
  setTimeout(()=>{chip.style.opacity='1';chip.style.transform='translateX(0)';},40);
  // Auto-dismiss if ignored — never nags forever.
  setTimeout(()=>{if(chip.isConnected)close();},12000);
}
function findPC(name){if(!name)return null;const nl=name.trim().toLowerCase();return state.pcs.find(p=>p.id===name||p.name.toLowerCase()===nl)||state.pcs.find(p=>p.name.toLowerCase().startsWith(nl+' '))||state.pcs.find(p=>p.name.toLowerCase().split(' ')[0]===nl)||null;}

// ═══ AI COMPLIANCE CHIPS — NPC + ITEM ═══
function _showChip(icon,label,borderColor,onConfirm){
  let c=document.getElementById('mech-toast');
  if(!c){c=document.createElement('div');c.id='mech-toast';c.style.cssText='position:fixed;right:12px;bottom:96px;z-index:9998;display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none;max-width:80vw';document.body.appendChild(c);}
  const chip=document.createElement('div');
  chip.style.cssText='pointer-events:auto;display:flex;align-items:center;gap:8px;font-size:12px;background:var(--surface2);color:var(--text-bright);border:1px solid '+borderColor+';border-left:3px solid '+borderColor+';border-radius:3px;padding:6px 8px 6px 10px;box-shadow:0 2px 10px rgba(0,0,0,.5);opacity:0;transform:translateX(14px);transition:opacity .25s ease,transform .25s ease';
  const txt=document.createElement('span');txt.textContent=icon+' '+label;
  const yes=document.createElement('button');yes.textContent='✓';yes.style.cssText='cursor:pointer;border:none;border-radius:3px;background:'+borderColor+';color:var(--bg);font-weight:bold;padding:2px 9px;font-size:13px';
  const no=document.createElement('button');no.textContent='✕';no.style.cssText='cursor:pointer;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--text-dim);padding:2px 8px;font-size:13px';
  const close=()=>{chip.style.opacity='0';chip.style.transform='translateX(14px)';setTimeout(()=>chip.remove(),300);};
  yes.onclick=()=>{onConfirm(txt,yes,no);setTimeout(close,1400);};
  no.onclick=close;
  chip.appendChild(txt);chip.appendChild(yes);chip.appendChild(no);
  c.appendChild(chip);
  setTimeout(()=>{chip.style.opacity='1';chip.style.transform='translateX(0)';},40);
  setTimeout(()=>{if(chip.isConnected)close();},12000);
}
function detectUnloggedItem(prose,changes){
  if(!prose)return;
  if((changes||[]).some(c=>/item_add:/i.test(c.text||'')))return;
  const m=prose.match(/\b(?:receive[sd]?|find[s]?|found|gain(?:ed|s)?|pick(?:ed)? up|hand(?:ed)?|award(?:ed)?|obtain(?:ed)?|acquire[sd]?)\b[^.!?]{0,50}?\b([A-Za-z][a-z]{2,}(?:\s[A-Za-z][a-z]+)?)\b/i);
  if(!m)return;
  const item=(m[1]||'').trim();
  if(!item||item.length<3)return;
  const skip=new Set(['you','the','his','her','its','our','your','their','some','this','that','from','into','with','more','just','also','when','then','after','before','during','while','there','here','each','both','many','most']);
  if(skip.has(item.toLowerCase()))return;
  _showChip('📦','Log "'+item+'" to inventory?','var(--gold)',
    (txt,yes,no)=>{
      if(!Array.isArray(state.partyInventory))state.partyInventory=[];
      state.partyInventory.push({name:item,qty:1,type:'misc',notes:'',ts:state.worldData.time});
      saveRefresh();
      txt.textContent='✓ '+item+' added';yes.remove();no.remove();
    });
}

// ═══ AI COMPLIANCE — EXPANDED DETECTION ═══

function detectUnloggedDamage(prose,changes){
  if(!prose)return;
  if((changes||[]).some(c=>/HP\s*\d+→/i.test(c.text||'')))return;
  const pcNames=(state.pcs||[]).map(p=>p.name);
  const patterns=[
    /(\b(?:NAMES)\b)\s+(?:takes?|took|suffers?|suffered|receives?|received)\s+(\d{1,3})\s*(?:points?\s+(?:of\s+)?)?damage/gi,
    /(\d{1,3})\s*(?:points?\s+(?:of\s+)?)?damage\s+(?:to|against|on)\s+(\b(?:NAMES)\b)/gi,
    /(\b(?:NAMES)\b)\s+(?:loses?|lost)\s+(\d{1,3})\s*(?:HP|hit\s*points?)/gi,
  ];
  const nameAlt=pcNames.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  for(const pat of patterns){
    const re=new RegExp(pat.source.replace(/NAMES/g,nameAlt),pat.flags);
    let m;
    while((m=re.exec(prose))!==null){
      let pcName,amt;
      if(/^\d+$/.test(m[1])){amt=parseInt(m[1]);pcName=m[2];}
      else{pcName=m[1];amt=parseInt(m[2]);}
      const pc=(state.pcs||[]).find(p=>p.name.toLowerCase()===pcName.toLowerCase());
      if(!pc||!amt||amt<=0)continue;
      const newHp=Math.max(0,pc.hp-amt);
      _showChip('❤️',pc.name+' took '+amt+' dmg → '+newHp+' HP?','var(--red)',
        (txt)=>{pc.hp=Math.max(0,Math.min(pc.hp_max,newHp));saveRefresh();txt.textContent='✓ '+pc.name+' → '+pc.hp+' HP';});
      return;
    }
  }
}

function detectUnloggedHealing(prose,changes){
  if(!prose)return;
  if((changes||[]).some(c=>/HP\s*\d+→/i.test(c.text||'')))return;
  const pcNames=(state.pcs||[]).map(p=>p.name);
  const nameAlt=pcNames.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  const re=new RegExp('('+nameAlt+')\\s+(?:heals?|regains?|recovers?|restored?)\\s+(\\d{1,3})\\s*(?:HP|hit\\s*points?)','gi');
  let m;
  while((m=re.exec(prose))!==null){
    const pc=(state.pcs||[]).find(p=>p.name.toLowerCase()===m[1].toLowerCase());
    const amt=parseInt(m[2]);
    if(!pc||!amt||amt<=0)continue;
    const newHp=Math.min(pc.hp_max,pc.hp+amt);
    if(newHp===pc.hp)continue;
    _showChip('💚',pc.name+' heals '+amt+' → '+newHp+' HP?','var(--green)',
      (txt)=>{pc.hp=newHp;saveRefresh();txt.textContent='✓ '+pc.name+' → '+pc.hp+' HP';});
    return;
  }
}

function detectUnloggedCondition(prose,changes){
  if(!prose)return;
  if((changes||[]).some(c=>/[+−](?:Prone|Poisoned|Frightened|Charmed|Stunned|Blinded|Deafened|Paralyzed|Petrified|Restrained|Grappled|Incapacitated|Unconscious|Invisible|Exhaustion)/i.test(c.text||'')))return;
  const CONDS=['Prone','Poisoned','Frightened','Charmed','Stunned','Blinded','Deafened','Paralyzed','Petrified','Restrained','Grappled','Incapacitated','Unconscious','Invisible'];
  const pcNames=(state.pcs||[]).map(p=>p.name);
  const nameAlt=pcNames.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  const condAlt=CONDS.join('|');
  const re=new RegExp('('+nameAlt+')\\s+(?:is|becomes?|falls?|gets?|was|has been)\\s+(?:knocked\\s+)?('+condAlt+')','gi');
  let m;
  while((m=re.exec(prose))!==null){
    const pc=(state.pcs||[]).find(p=>p.name.toLowerCase()===m[1].toLowerCase());
    const cond=CONDS.find(c=>c.toLowerCase()===m[2].toLowerCase());
    if(!pc||!cond)continue;
    if((pc.conditions||[]).includes(cond))continue;
    _showChip('⚡',pc.name+' → '+cond+'?','var(--gold)',
      (txt)=>{if(!Array.isArray(pc.conditions))pc.conditions=[];if(!pc.conditions.includes(cond)){pc.conditions.push(cond);}saveRefresh();txt.textContent='✓ '+pc.name+' +'+cond;});
    return;
  }
}

function detectUnloggedLocation(prose,changes){
  if(!prose||prose.length<40)return;
  if((changes||[]).some(c=>/Loc→|Location/i.test(c.text||'')))return;
  const re=/\b(?:arrive[sd]?\s+(?:at|in)|reach(?:es|ed)?\s|enter(?:s|ed)?\s|step(?:s|ped)?\s+into|come[s]?\s+to|pull[s]?\s+(?:up\s+)?(?:to|into))\s+(?:the\s+)?([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){0,3})/g;
  const curLoc=(state.worldData?.location||'').toLowerCase();
  let m;
  while((m=re.exec(prose))!==null){
    const loc=m[1].trim();
    if(loc.length<3||loc.toLowerCase()===curLoc)continue;
    const skip=new Set(['The','This','That','His','Her','Their','Your','Our','Its']);
    if(skip.has(loc.split(' ')[0]))continue;
    _showChip('📍','Update location → '+loc+'?','var(--blue)',
      (txt)=>{state.worldData.location=loc;saveRefresh();txt.textContent='✓ Location: '+loc;});
    return;
  }
}

// ═══ MECHANIC VALIDATOR — POST-PARSE AUDIT ═══

function detectProseRolls(prose){
  if(!prose||prose.length<20)return;
  const patterns=[
    /[Rr]olling\s+\d+d\d+/,
    /[Rr]oll(?:ed|s)?\s*(?:\(?\s*\d+d\d+)/,
    /\b\d+d\d+[+\-]\d+\s*[=:]\s*\*{0,2}\d+\*{0,2}/,
    /[Rr]esult:\s*\*{0,2}\d+\*{0,2}/,
    /[Rr]olling\s+\d+d\d+.*?=\s*\*{0,2}\d+/,
  ];
  for(const re of patterns){
    if(re.test(prose)){
      toast('⚠ AI rolled dice in prose — rolls should use roll_request: so YOU roll in the app','warn');
      return;
    }
  }
}
function _validateMechanics(changes){
  if(!changes||!changes.length)return;
  const warnings=[];

  // HP above max or below 0
  (state.pcs||[]).forEach(pc=>{
    if(pc.hp>pc.hp_max){warnings.push(pc.name+' HP '+pc.hp+' clamped to max '+pc.hp_max);pc.hp=pc.hp_max;}
    if(pc.hp<0){pc.hp=0;}
  });

  // Ox HP above max
  const ox=state.wagon?.ox;
  if(ox&&ox.hp>ox.hp_max){warnings.push((ox.name||'Mount')+' HP '+ox.hp+' clamped to max '+ox.hp_max);ox.hp=ox.hp_max;}
  state.pcs.forEach(p=>{if(p.familiar&&p.familiar.hp>p.familiar.hp_max){warnings.push(p.familiar.name+' HP clamped to max '+p.familiar.hp_max);p.familiar.hp=p.familiar.hp_max;}});

  // Wagon HP above max
  const wg=state.wagon;
  if(wg&&wg.hp>wg.hp_max&&wg.hp_max>0){warnings.push('Wagon HP '+wg.hp+' clamped to max '+wg.hp_max);wg.hp=wg.hp_max;}

  // Duplicate conditions
  (state.pcs||[]).forEach(pc=>{
    if(!Array.isArray(pc.conditions))return;
    const unique=[...new Set(pc.conditions)];
    if(unique.length<pc.conditions.length){warnings.push(pc.name+' duplicate conditions removed');pc.conditions=unique;}
  });

  // Slot usage over max
  (state.pcs||[]).forEach(pc=>{
    (pc.slots||[]).forEach((s,i)=>{
      if(s.used>s.max){warnings.push(pc.name+' L'+(i+1)+' slots clamped ('+s.used+'→'+s.max+')');s.used=s.max;}
    });
  });

  // Resource usage over max
  (state.pcs||[]).forEach(pc=>{
    (pc.resources||[]).forEach(r=>{
      if(r.used>r.max){warnings.push(pc.name+' '+r.name+' uses clamped ('+r.used+'→'+r.max+')');r.used=r.max;}
    });
  });

  // Encumbrance check
  (state.pcs||[]).forEach(pc=>{
    const w=_pcCarryWeight(pc);const cap=_pcCarryCap(pc);
    if(w>cap)warnings.push(pc.name+' over carry capacity: '+w.toFixed(1)+'/'+cap+'lb');
  });
  const wagonW=calcWeight();
  if(wagonW>getMaxLb())warnings.push('Wagon over capacity: '+wagonW.toFixed(1)+'/'+getMaxLb()+'lb');

  // Treasury negative check
  if(state.treasuryData){
    ['gp','sp','cp','ep','pp'].forEach(k=>{
      if((state.treasuryData[k]||0)<0){warnings.push(k.toUpperCase()+' was negative, clamped to 0');state.treasuryData[k]=0;}
    });
  }

  // Treasure audit — dedup recent income log entries
  const il=state.treasuryData?.incomeLog;
  if(Array.isArray(il)&&il.length>=2){
    const recent=il.slice(-5);
    const seen=new Set();
    const dupes=[];
    recent.forEach((e,i)=>{
      const key=(e.desc||'').toLowerCase().trim()+'|'+e.amt+'|'+e.type;
      if(seen.has(key))dupes.push(il.length-5+i);
      seen.add(key);
    });
    if(dupes.length){
      for(let i=dupes.length-1;i>=0;i--)il.splice(dupes[i],1);
      warnings.push('Removed '+dupes.length+' duplicate income log entr'+(dupes.length===1?'y':'ies'));
    }
  }

  if(warnings.length){
    save();
    console.warn('[Mechanic Validator]',warnings);
    const warningChanges=warnings.map(w=>({text:'⚠ '+w,error:true}));
    mechToast(warningChanges);
    _lastMechReceipt=(_lastMechReceipt||'[MECHANICS RECEIPT]')+' Corrected: '+warnings.join(', ')+'.';
  }
}
const CKEY='tt_cache';
function cacheResp(user,resp){const c=JSON.parse(localStorage.getItem(CKEY)||'[]');c.unshift({ts:new Date().toLocaleString(),user:user.slice(0,60),response:resp});if(c.length>5)c.pop();localStorage.setItem(CKEY,JSON.stringify(c));}
function getCached(){return JSON.parse(localStorage.getItem(CKEY)||'[]')[0]||null;}

// ═══ AI DM CHAT ═══
function renderChat(){
  const c=document.getElementById('chat-msgs');if(!c)return;
  const prevScroll=c.scrollTop;const prevHeight=c.scrollHeight;
  c.innerHTML='';
  if(!state.chatHistory||!state.chatHistory.length){
    c.innerHTML=`<div class="chat-msg sys"><div class="msg-hdr"><span>System</span></div><div class="chat-msg-text">Welcome to Hoard of the Dragon Queen! Set your API key in the AI DM tab. The DM updates character sheets, inventory, wagon, and more automatically via the mechanics block.</div></div>`;
    return;
  }
  state.chatHistory.forEach((msg,msgIdx)=>{
    if(msg.role==='ooc_echo'){
      const d=document.createElement('div');
      d.className='ooc-echo-bar';
      d.onclick=()=>{showChatTab('ooc');setTimeout(()=>scrollToOOCMsg(msg.echoTarget),80);};
      d.innerHTML='💬 <span>'+esc(msg.content||'OOC message')+'</span><span style="margin-left:auto;font-size:10px;opacity:.55">view →</span>';
      c.appendChild(d);return;
    }
    const isDM=msg.role==='assistant';const isSys=msg.role==='system';
    const d=document.createElement('div');
    const isChk=msg.isCheckpoint||false;
    const isInit=msg.isInitiative||false;
    d.className='chat-msg '+(isInit?'init-msg':isChk?'chk-msg':isSys?'sys':isDM?'dm':'player');
    if(msg.msgId)d.dataset.msgId=msg.msgId;
    const sender=isSys?'System':isDM?'Dungeon Master':(msg.playerName||playerName||'Party')+(msg.playerChar?' ('+msg.playerChar+')':'');
    // Store in lookup map — avoids quote/newline breakage in onclick attributes
    msgMap[msgIdx]=msg.content||'';
    let text=esc(msg.content||'');
    text=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    text=text.replace(/\*(.*?)\*/g,'<em>$1</em>');
    text=text.replace(/\n/g,'<br>');
    if(isDM)text=_highlightTerms(text);
    const isLong=(msg.content||'').length>800;
    const mId=`msg-over-${msgIdx}`;
    const ttsBtn=isDM?`<button class="tts-btn" onclick="speakIdx(${msgIdx},this)" title="Read aloud">🔊</button>`:'';
    const flagBtn=isDM?`<button class="flag-btn" onclick="openFlagModal(${msgIdx})" title="Flag this response">⚑</button>`:'';
    const exportBtn=`<button class="flag-btn" onclick="exportMoment(${msgIdx})" title="Export this moment for dev review">⚠️</button>`;
    const overflowMenu=`<div id="${mId}" style="display:none;position:absolute;right:0;top:100%;background:var(--surface3);border:1px solid var(--border);border-radius:6px;z-index:200;padding:4px;display:none;gap:2px;flex-direction:row">${ttsBtn}${flagBtn}${exportBtn}<button class="flag-btn" onclick="deleteChatMsg(${msgIdx})" title="Delete message" style="color:#c05050">✕</button></div>`;
    const moreBtn=`<div style="position:relative;display:inline-flex"><button class="copy-btn" onclick="(function(el){var m=document.getElementById('${mId}');m.style.display=m.style.display==='flex'?'none':'flex';document.addEventListener('click',function h(e){if(!el.contains(e.target)){m.style.display='none';document.removeEventListener('click',h);}},{once:true,capture:true});event.stopPropagation()})(this.parentElement)" title="More actions" style="font-size:11px;padding:0 5px;min-width:22px">⋮</button>${overflowMenu}</div>`;
    const copyBtn=`<button class="copy-btn" onclick="copyIdx(${msgIdx})" title="Copy message">📋</button>`;
    let tsHtml='';
    if(msg.ts||msg.realTs){tsHtml='<span style="font-size:9px;opacity:.5">';if(msg.ts)tsHtml+=esc(msg.ts);if(msg.ts&&msg.realTs)tsHtml+=' · ';if(msg.realTs)tsHtml+=esc(msg.realTs);tsHtml+='</span>';}
    let mechBadge='';
    if(msg.mechanics?.length){
      const pills=msg.mechanics.map(m=>`<span class="mech-pill${m.error?' err':''}" onclick="_mechPillNav(this)">${esc(m.text)}</span>`).join('');
      mechBadge=`<div class="mech-badge"><div class="mech-badge-hdr" onclick="var p=this.nextElementSibling;p.style.display=p.style.display==='flex'?'none':'flex'"><span class="mech-badge-lbl">⚡ Changes</span><span style="font-size:10px;color:var(--green-bright);margin-left:4px">${msg.mechanics.length} — tap to expand</span></div><div class="mech-pills" style="display:none">${pills}</div></div>`;
    }
    const isExpanded=_expandedMsgs.has(msgIdx);
    let questChips='';
    if(isDM&&msg.msgId){const linked=(state.quests||[]).map((q,qi)=>({q,qi})).filter(({q})=>q.chatMsgId===msg.msgId);if(linked.length)questChips='<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">'+linked.map(({q,qi})=>`<span onclick="navTo('world');setTimeout(()=>{const d=document.getElementById('quest-det-${qi}');if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'center'});d.style.outline='2px solid var(--gold)';d.style.borderRadius='6px';setTimeout(()=>{d.style.outline='';},2200);}},350)" style="cursor:pointer;font-size:10px;background:var(--surface3);border:1px solid var(--gold-dim);border-radius:4px;padding:2px 8px;color:var(--gold)">⚔ ${esc((q.text||'').split('|')[0].slice(0,35))}</span>`).join('')+'</div>';}
    const truncToggle=isLong?(isExpanded?`<span class="read-more" onclick="_expandedMsgs.delete(${msgIdx});renderChat()">Show less ▲</span>`:`<span class="read-more" onclick="_expandedMsgs.add(${msgIdx});this.previousElementSibling.classList.remove('msg-collapsed');this.textContent='Show less ▲';this.onclick=function(){_expandedMsgs.delete(${msgIdx});renderChat();}">Read more ▼</span>`):'';
    d.innerHTML=`<div class="msg-hdr"><span style="font-weight:bold">${esc(sender)}</span><div style="display:flex;align-items:center;gap:2px">${copyBtn}${moreBtn}${tsHtml}</div></div><div class="chat-msg-text${isLong&&!isExpanded?' msg-collapsed':''}">${text}</div>${truncToggle}${mechBadge}${questChips}`;
    c.appendChild(d);
  });
  const distWas=prevHeight-prevScroll-c.clientHeight;
  if(distWas<150)c.scrollTop=c.scrollHeight;
  else c.scrollTop=prevScroll;
}

function deleteChatMsg(idx){
  if(!confirm('Delete this message?'))return;
  state.chatHistory.splice(idx,1);
  _chatMutatedAt=Date.now();
  save();renderChat();
}
function chatKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}}
async function summarizeAndPrune(){
  if(!Array.isArray(state.chatHistory)||state.chatHistory.length<75)return;
  const toSummarize=state.chatHistory.slice(0,30).filter(m=>m.role!=='system');
  if(toSummarize.length<5)return;
  const sysProm='You are a campaign narrator. In 2-3 sentences, summarize the key events, decisions, and outcomes from these messages. Include character names, locations, and major turning points. Write in past tense starting with "Previously:"';
  const msgs=toSummarize.map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.content.slice(0,800)}));
  try{
    const summary=await callAI(msgs,sysProm,350);
    if(!summary||summary.trim().length<30)return; // reject empty/malformed summaries
    const entry={ts:Date.now(),gameTs:state.worldData?.time||'',summary:summary.trim(),msgCount:toSummarize.length};
    if(!Array.isArray(state.sessionArchive))state.sessionArchive=[];
    state.sessionArchive.push(entry);
    if(state.sessionArchive.length>50)state.sessionArchive.splice(0,state.sessionArchive.length-50);
    // prevSessionSummary = last 3 archive entries joined (AI context window)
    state.prevSessionSummary=state.sessionArchive.slice(-3).map(e=>e.summary).join('\n\n');
    state.chatHistory.splice(0,30);
    _chatMutatedAt=Date.now();
    save();
    renderChat();
    toast('✓ Chat archived — oldest 30 messages summarized.');
  }catch(e){
    // Silent failure is correct — never prune without a confirmed summary
    console.warn('DR-7 summarize failed — messages preserved:',e.message);
  }
}
function clearChat(){if(confirm('Clear narrative chat and Rules channel? Log unaffected.')){state.chatHistory=[];state.oocHistory=[];showChatTab('narrative');saveRefresh();}}
function _renderRollQueue(){
  const c=document.getElementById('roll-request-queue');if(!c)return;
  const q=window._rollRequestQueue||[];
  if(!q.length){c.innerHTML='';return;}
  c.innerHTML=q.map((r,i)=>{
    const sub=r.pcname?'':'Roll and send your result to the DM.';
    return `<div style="background:var(--surface2);border:1px solid var(--gold);border-radius:6px;padding:8px 10px;font-size:12px;color:var(--text-bright)"><div style="display:flex;align-items:center;gap:6px"><span style="font-size:16px">🎲</span><div style="flex:1"><div style="font-weight:600;color:var(--gold-bright)">🎲 ${esc(r.label)}</div><div style="font-size:10px;color:var(--text-dim);margin-top:1px">${esc(sub)||'Roll and send your result.'}</div></div><button class="btn sm gold" onclick="openRollFromQueue(${i})" style="flex-shrink:0">Roll</button><button class="btn sm" onclick="dismissRollRequest(${i})" style="flex-shrink:0">✕</button></div></div>`;
  }).join('');
}
function dismissRollRequest(idx){
  const q=window._rollRequestQueue||[];
  if(idx!==undefined&&idx>=0&&idx<q.length)q.splice(idx,1);
  else q.length=0;
  _renderRollQueue();
}
function openRollFromQueue(idx){
  const q=window._rollRequestQueue||[];
  const r=q[idx];if(!r)return;
  window._pendingRollRequest={skill:r.skill,dc:r.dc,pcname:r.pcname};
  window._pendingRollQueueIdx=idx;
  openRollSheet();
}

// ═══ CHAT TABS ═══
let _activeTab='narrative';
let _testMode=false;
let _testHistory=[];
function updatePartyBadge(){
  const b=document.getElementById('party-badge');
  if(!b)return;
  if(_unreadParty>0){b.textContent=_unreadParty;b.style.display='inline';}
  else{b.style.display='none';}
}
function clearPartyBadge(){_unreadParty=0;updatePartyBadge();}
function requestNotifPermission(){
  if(!('Notification' in window)){toast('Notifications not supported on this device.');return;}
  Notification.requestPermission().then(function(p){
    localStorage.setItem('tt_notif',p);
    toast(p==='granted'?'✓ Notifications enabled — you\'ll be alerted when the other player sends a message.':'Notification permission '+p+'.');
  });
}
function scrollActiveChatBottom(){
  const ids={narrative:'chat-msgs',ooc:'ooc-msgs',party:'party-msgs'};
  const el=document.getElementById(ids[_activeTab]||'chat-msgs');
  if(el)el.scrollTop=el.scrollHeight;
}
function scrollActiveChatTop(){
  const ids={narrative:'chat-msgs',ooc:'ooc-msgs',party:'party-msgs'};
  const el=document.getElementById(ids[_activeTab]||'chat-msgs');
  if(el)el.scrollTop=0;
}
const SUGGEST_CHIPS={
  narrative:[
    {label:'I search the area',fill:'I search the area for anything useful.'},
    {label:'I talk to…',fill:'I approach and say "'},
    {label:'I attack',fill:'I attack '},
    {label:'What do I see?',fill:'I take a moment to observe my surroundings. What do I notice?'},
    {label:'Short rest',fill:'We take a short rest.'},
    {label:'// note',fill:'// '},
    {label:'// flag',fill:'//flag 20 '},
    {label:'// add item',fill:'//add item '},
    {label:'// explain',fill:'//explain '},
    {label:'// help',fill:'//help'},
  ],
  ooc:[
    {label:'How does this work?',fill:'How does '},
    {label:'What are the rules for…',fill:'What are the rules for '},
    {label:'Spell save DC?',fill:'What is my spell save DC and how is it calculated?'},
    {label:'Can I do this?',fill:'Can I use my bonus action to '},
    {label:'// note',fill:'// '},
    {label:'// flag',fill:'//flag 20 '},
  ],
  party:[
    {label:'Should we rest?',fill:'Should we take a short or long rest?'},
    {label:'What\'s the plan?',fill:'What\'s the plan here?'},
    {label:'Check inventory',fill:'What supplies do we have left?'},
  ],
  test:[
    {label:'Test mechanic',fill:'[Test] Apply: '},
    {label:'Test prompt',fill:'Describe the current scene in detail.'},
    {label:'Award XP',fill:'Award 300 XP to the party for defeating the bandits.'},
    {label:'Add condition',fill:'A cultist casts Hold Person on the Fighter. Apply the Paralyzed condition.'},
    {label:'Drop loot',fill:'The chest contains a Potion of Greater Healing, 45 gold, and a mysterious letter. Distribute it.'},
    {label:'Start combat',fill:'Three goblins and an ogre ambush the party on the road. Roll initiative.'},
    {label:'NPC intro',fill:'We enter the tavern and meet the bartender. Who are they?'},
    {label:'Damage + cond',fill:'The dragon breathes fire on the party. Dex saves all around, 8d6 fire damage. Apply Frightened on fail.'},
    {label:'Glossary',fill:'//explain grappled'},
    {label:'Rest & recover',fill:'We take a long rest at the inn. Restore HP and spell slots.'},
    {label:'Quest hook',fill:'The mayor asks us to clear the mine of undead. She offers 200 gold.'},
    {label:'Level announce',fill:'After turning in the quest, the party levels up. Announce it.'},
    {label:'Test level up',fill:'//testlevelup'},
  ]
};
function renderSuggestChips(tab){
  const c=document.getElementById('chat-suggest');if(!c)return;
  let chips=[...(SUGGEST_CHIPS[tab||'narrative']||SUGGEST_CHIPS.narrative)];
  if((state.pcs||[]).some(p=>p.levelReady))chips.unshift({label:'⬆ Level Up',fill:'//levelup'});
  c.innerHTML=chips.map(ch=>`<span class="chat-suggest-chip" onclick="fillSuggest(this,'${ch.fill.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">${ch.label}</span>`).join('');
}
function fillSuggest(el,text){
  const qi=document.getElementById('chat-quick-input');
  if(!qi)return;
  qi.value=text;
  qi.focus();
  if(text.endsWith(' ')||text.endsWith('"'))qi.setSelectionRange(text.length,text.length);
}
function showChatTab(tab){
  _activeTab=tab;
  ['narrative','ooc','party','test'].forEach(t=>{
    const pane=document.getElementById('chat-pane-'+t);
    const btn=document.getElementById('chat-tab-'+t);
    if(pane)pane.style.display=(t===tab)?'flex':'none';
    if(btn)btn.classList.toggle('active',t===tab);
  });
  const qi=document.getElementById('chat-quick-input');
  if(qi){
    if(tab==='ooc')qi.placeholder='Ask a rules question…';
    else if(tab==='party')qi.placeholder='Message party…';
    else if(tab==='test')qi.placeholder='⚗ Test a mechanic or prompt…';
    else qi.placeholder='Command AI DM…';
  }
  if(tab==='test')renderTestChat();
  renderSuggestChips(tab);
  requestAnimationFrame(()=>scrollActiveChatBottom());
}
function renderOOC(){
  const c=document.getElementById('ooc-msgs');if(!c)return;c.innerHTML='';
  if(!state.oocHistory||!state.oocHistory.length){
    c.innerHTML='<div class="chat-msg sys"><div class="chat-msg-text" style="font-size:11px">❓ Rules — ask rules questions, check lore, or request a context resync. Brief answers only.</div></div>';
    return;
  }
  state.oocHistory.forEach((msg,idx)=>{
    const d=document.createElement('div');
    const isDM=msg.role==='assistant';
    const isSys=msg.role==='sys'||msg.role==='system';
    d.className='chat-msg '+(isSys?'sys':isDM?'ooc-dm':'ooc-player');
    let text=esc(msg.content||'');
    text=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    text=text.replace(/\*(.*?)\*/g,'<em>$1</em>');
    text=text.replace(/\n/g,'<br>');
    const sender=isSys?'System':isDM?'DM (OOC)':(msg.playerName||playerName||'Party');
    let tsHtml='';
    if(msg.gameTs||msg.ts){tsHtml='<span style="font-size:9px;opacity:.5">';if(msg.gameTs)tsHtml+=esc(msg.gameTs);if(msg.gameTs&&msg.ts)tsHtml+=' · ';if(msg.ts)tsHtml+=esc(msg.ts);tsHtml+='</span>';}
    const copyBtn=`<button class="copy-btn" onclick="navigator.clipboard.writeText(state.oocHistory[${idx}].content||'');toast('Copied')" title="Copy">📋</button>`;
    const exportBtn=`<button class="flag-btn" onclick="exportOOCMoment(${idx})" title="Export this moment">⚠️</button>`;
    const delBtn=`<button class="flag-btn" onclick="deleteOOCMsg(${idx})" title="Delete" style="color:#c05050">✕</button>`;
    d.innerHTML=`<div class="msg-hdr"><span>${esc(sender)}</span><div style="display:flex;align-items:center;gap:2px">${copyBtn}${exportBtn}${delBtn}${tsHtml}</div></div><div class="chat-msg-text">${text}</div>`;
    if(msg.id)d.id='oocmsg_'+msg.id;
    c.appendChild(d);
  });
  c.scrollTop=c.scrollHeight;
}
function deleteOOCMsg(idx){
  if(!confirm('Delete this OOC message?'))return;
  state.oocHistory.splice(idx,1);save();renderOOC();
}
function exportOOCMoment(idx){
  const msgs=state.oocHistory||[];
  if(idx<0||idx>=msgs.length){toast('Message not found');return;}
  const start=Math.max(0,idx-5);const end=Math.min(msgs.length,idx+6);
  const window=msgs.slice(start,end);
  const loc=state.worldData.location||'Unknown';
  const pcs=(state.pcs||[]).map(p=>p.name+' ('+p.class+' '+p.level+', '+(p.hp||0)+'/'+(p.hp_max||0)+' HP)').join(', ');
  let out='=== TINKLE\'S TINCTURES — OOC MOMENT EXPORT ===\n';
  out+='Exported: '+new Date().toISOString().slice(0,16)+'\n';
  out+='Target message: #'+(idx+1)+' of '+msgs.length+'\n';
  out+='Context window: messages '+(start+1)+'–'+end+' ('+window.length+' total)\n';
  out+='Location: '+loc+'\nPCs: '+pcs+'\n\n--- CONTEXT ---\n\n';
  window.forEach((m,i)=>{
    const role=m.role==='assistant'?'DM (OOC)':m.role==='sys'||m.role==='system'?'SYSTEM':'PLAYER';
    const ts=m.gameTs||m.ts||'';
    const marker=(start+i)===idx?'\n>>> TARGET MESSAGE <<<':'';
    out+=(ts?'['+ts+'] ':'')+role+':\n'+m.content+'\n'+marker+'\n***\n\n';
  });
  out+='--- PROMPT FOR DEV ---\nThe player flagged this OOC moment for review. The TARGET MESSAGE is marked above.\n';
  out+='Cross-reference against .claude/roadmap.md and .claude/features.md.\n\n';
  out+='Analyze:\n1. What went wrong or felt off at this moment?\n2. Was it an AI rules error, a missing mechanic, a UX gap, or a context gap?\n3. Does a fix or feature already exist that should have caught this? If so, why didn\'t it?\n4. What specific change (code, contract clause, or prompt) would prevent this from recurring?\n';
  navigator.clipboard.writeText(out).then(()=>toast('OOC moment exported to clipboard')).catch(()=>toast('Export failed'));
}
function oocKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendOOCMsg();}}
function scrollToOOCMsg(id){
  const el=document.getElementById('oocmsg_'+id);
  if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.style.outline='2px solid var(--blue)';setTimeout(()=>el.style.outline='',1200);}
}

// ═══ TEST CHANNEL ═══
function toggleTestMode(){
  _testMode=!_testMode;
  const tabBtn=document.getElementById('chat-tab-test');
  const toggleBtn=document.getElementById('test-mode-toggle');
  if(tabBtn)tabBtn.style.display=_testMode?'':'none';
  if(toggleBtn){toggleBtn.textContent=_testMode?'⚗ Exit Test Mode':'Enable Test Mode';toggleBtn.classList.toggle('gold',_testMode);}
  if(_testMode){renderTestChat();showChatTab('test');}
  else showChatTab('narrative');
}
function clearTestChat(){_testHistory=[];renderTestChat();}
function exportTestChat(){
  if(!_testHistory.length){toast('No test messages to export');return;}
  const lines=_testHistory.map(m=>{
    const role=m.role==='assistant'?'DM (Test)':m.role==='system'?'SYSTEM':'PLAYER';
    let out='['+role+'] '+(m.content||'');
    if(m.preview&&m.preview.length)out+='\n  MECHANICS: '+m.preview.map(p=>p.key+': '+p.val).join(', ');
    return out;
  });
  const text='=== TEST CHAT EXPORT ===\n'+new Date().toISOString()+'\n'+lines.length+' messages\n\n'+lines.join('\n\n');
  navigator.clipboard.writeText(text).then(()=>toast('Copied '+lines.length+' test messages')).catch(()=>toast('Export failed'));
}
function renderTestChat(){
  const c=document.getElementById('test-msgs');if(!c)return;c.innerHTML='';
  if(!_testHistory.length){
    c.innerHTML='<div class="chat-msg sys"><div class="chat-msg-text" style="font-size:11px">⚗ Test sandbox — messages here use real AI contracts but never touch game state. Mechanics blocks are shown as dry-run previews only.</div></div>';
    return;
  }
  _testHistory.forEach(msg=>{
    const isDM=msg.role==='assistant';const isSys=msg.role==='system';
    const d=document.createElement('div');
    d.className='chat-msg '+(isSys?'sys':isDM?'dm':'player');
    let text=esc(msg.content||'');
    text=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
    let mechHtml='';
    if(isDM&&msg.preview&&msg.preview.length){
      mechHtml='<div style="margin-top:6px;padding:6px 8px;background:rgba(176,88,48,.12);border:1px solid var(--gold-dim);border-radius:4px">'
        +'<div style="font-size:9px;font-weight:700;color:var(--gold-bright);letter-spacing:.5px;margin-bottom:4px">⚗ MECHANIC PREVIEW — not applied</div>'
        +msg.preview.map(p=>'<div style="font-size:10px;font-family:var(--mono);margin-bottom:2px"><span style="color:var(--gold)">'+esc(p.key)+':</span> <span style="color:var(--text)">'+esc(p.val)+'</span></div>').join('')
        +'</div>';
    }
    d.innerHTML='<div class="msg-hdr"><span style="font-weight:bold">'+(isDM?'⚗ DM (Test)':isSys?'System':'You')+'</span><span style="margin-left:auto;font-size:10px;color:var(--text-dim)">'+esc(msg.ts||'')+'</span></div><div class="chat-msg-text">'+text+'</div>'+mechHtml;
    c.appendChild(d);
  });
  requestAnimationFrame(()=>{const el=document.getElementById('test-msgs');if(el)el.scrollTop=el.scrollHeight;});
}
function previewMechanics(responseText){
  const clean=responseText.replace(/\*\*/g,'').replace(/\*/g,'');
  let block='';
  let m=clean.match(/---MECHANICS---([\s\S]*?)(?:---END---|$)/i);
  if(!m)m=clean.match(/MECHANICS:?([\s\S]*?)(?:---END---|$)/i);
  if(m)block=m[1];
  if(!block)return[];
  const validKeys=new Set(_MECH_KEYS.split('|'));
  return block.split('\n').map(l=>l.trim().replace(/^[-*•]\s+/,'')).filter(l=>l&&l.includes(':')).map(l=>{
    const ci=l.indexOf(':');const key=l.slice(0,ci).trim().toLowerCase();const val=l.slice(ci+1).trim();
    return validKeys.has(key)?{key,val}:null;
  }).filter(Boolean);
}
async function sendTestMsg(text){
  if(!getKey()){toast('Set an API key first — tap ⚙ in the AI DM header.');return;}
  const ts=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  _testHistory.push({role:'user',content:text,ts});
  renderTestChat();
  const typEl=document.getElementById('test-typing-ind');
  if(typEl)typEl.classList.add('on');
  try{
    const useLedger=document.getElementById('chat-ledger')?.checked;
    if(useLedger)genLedger();
    const ledger=useLedger?(document.getElementById('ledger-out')?.value||''):'';
    const sysProm=buildPrompt(ledger)+'\n\n⚗ TEST MODE: This is a sandbox dry-run. Generate realistic mechanics blocks as you normally would. These will be shown as preview only — no state changes will be applied to the game. Feel free to generate any mechanic type including quest_add, item_add, npc_add, etc.';
    const histForApi=_testHistory.filter(m=>m.role!=='system').map(m=>({
      role:m.role==='assistant'?'assistant':'user',content:m.content
    }));
    const responseText=await callAI(histForApi,sysProm,1400);
    const preview=previewMechanics(responseText);
    const displayText=responseText
      .replace(/---MECHANICS---[\s\S]*?---END---/g,'')
      .replace(/---MECHANICS---[\s\S]*$/,'')
      .replace(/\*{1,3}MECHANICS\*{1,3}[\s\S]*?---END---/gi,'')
      .replace(/\*{1,3}MECHANICS\*{1,3}[\s\S]*$/gi,'')
      .replace(/(?:MECHANICS:|##\s*MECHANICS)[\s\S]*$/,'')
      .replace(/^---END---\s*$/gm,'')
      .replace(new RegExp('^[-*•]?\\s*('+_MECH_KEYS+'): .+$','gm'),'')
      .replace(/\n{3,}/g,'\n\n').trim();
    _testHistory.push({role:'assistant',content:displayText,preview,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
  }catch(err){
    _testHistory.push({role:'system',content:'⚠ Error: '+err.message,ts});
  }
  if(typEl)typEl.classList.remove('on');
  renderTestChat();
}

// ═══ PARTY CHANNEL ═══
function renderParty(){
  const c=document.getElementById('party-msgs');if(!c)return;c.innerHTML='';
  if(!state.partyChat||!state.partyChat.length){
    c.innerHTML='<div class="chat-msg sys"><div class="chat-msg-text" style="font-size:11px">Party channel — discuss strategy, theory craft, plan your next move. Tap 🧙 Ask DM to pull the DM in.</div></div>';
    return;
  }
  state.partyChat.forEach(msg=>{
    const d=document.createElement('div');
    const isDM=msg.role==='dm';
    const isSys=msg.role==='sys';
    d.className='chat-msg '+(isSys?'sys':isDM?'party-dm':'party-player');
    let text=esc(msg.content||'');
    text=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    text=text.replace(/\*(.*?)\*/g,'<em>$1</em>');
    text=text.replace(/\n/g,'<br>');
    const sender=isSys?'System':isDM?'Dungeon Master':(msg.playerName||playerName||'Party');
    let tsHtml='';
    if(msg.gameTs||msg.ts){tsHtml='<span style="font-size:9px;opacity:.5">';if(msg.gameTs)tsHtml+=esc(msg.gameTs);if(msg.gameTs&&msg.ts)tsHtml+=' · ';if(msg.ts)tsHtml+=esc(msg.ts);tsHtml+='</span>';}
    d.innerHTML=`<div class="msg-hdr"><span>${esc(sender)}</span><div>${tsHtml}</div></div><div class="chat-msg-text">${text}</div>`;
    c.appendChild(d);
  });
  c.scrollTop=c.scrollHeight;
}
function partyKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendPartyMsg();}}
function sendPartyMsg(contentOverride){
  let content;
  if(contentOverride!==undefined){content=String(contentOverride).trim();}
  else{const inp=document.getElementById('party-input');if(!inp||!inp.value.trim())return;content=inp.value.trim();inp.value='';}
  if(!content)return;
  if(!state.partyChat)state.partyChat=[];
  state.partyChat.push({role:'player',content,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),gameTs:state.worldData.time||'',playerName:playerName||'Party',id:'pc_'+Date.now()});
  save();renderParty();
}
async function askDMFromParty(){
  const key=getKey();if(!key){toast('Set an API key first.');return;}
  const lastPlayerMsg=(state.partyChat||[]).filter(m=>m.role==='player').slice(-1)[0];
  if(!lastPlayerMsg){toast('Type a message first, then tap Ask DM.');return;}
  const dmBtn=document.getElementById('party-dm-btn');
  const typingEl=document.getElementById('party-typing-ind');
  if(typingEl)typingEl.classList.add('on');
  if(dmBtn)dmBtn.disabled=true;
  const partyLedger=genLedger();
  const oocContract='OOC CONTRACT — CHANNEL RULES:\n1. You are answering OUT-OF-CHARACTER. No narrative prose. No immersion language.\n2. CHARACTER SEPARATION: Always name the specific character. Never say "you" to mean the whole party. Each PC may know things others do not.\n3. RULES ACCURACY: Cite actual D&D 5e rules. If unsure, say so. Do not invent rulings or fudge mechanics.\n4. NO DICE RESOLUTION: These channels answer questions only. Actual rolls and outcomes happen in the Narrative channel only.\n';
  const partySys='You are the Dungeon Master for this D&D 5e campaign. A player has a question out-of-character. Answer only their most recent question. Keep it to 3-5 sentences. No mechanics block. No in-character narration unless asked.\n\n'+oocContract+'\nCURRENT GAME STATE:\n'+partyLedger;
  const msgs=(state.partyChat||[]).filter(m=>m.role==='player'||m.role==='dm').slice(-6).map(m=>({role:m.role==='dm'?'assistant':'user',content:(m.playerName?'['+m.playerName+']: ':'')+m.content}));
  if(!state.partyChat)state.partyChat=[];
  try{
    const response=await callAI(msgs,partySys,500);
    state.partyChat.push({role:'dm',content:response,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),gameTs:state.worldData.time||'',id:'dm_'+Date.now()});
    save();
  }catch(err){
    state.partyChat.push({role:'sys',content:'DM error: '+err.message,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
    save();
  }finally{
    if(typingEl)typingEl.classList.remove('on');
    if(dmBtn)dmBtn.disabled=false;
    renderParty();
  }
}
function sendOOCMsg(contentOverride){
  let content;
  if(contentOverride!==undefined){content=String(contentOverride).trim();}
  else{const inp=document.getElementById('ooc-input');if(!inp||!inp.value.trim())return;content=inp.value.trim();inp.value='';}
  if(!content)return;
  const key=getKey();if(!key){toast('Set an API key first.');return;}
  const id='ooc_'+Date.now();
  if(!state.oocHistory)state.oocHistory=[];
  state.oocHistory.push({role:'user',content,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),gameTs:state.worldData.time||'',playerName:playerName||'Party',id});
  state.chatHistory.push({role:'ooc_echo',content:'OOC: '+content.slice(0,80)+(content.length>80?'…':''),echoTarget:id,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
  save();renderOOC();renderChat();
  _oocCallAI(content);
}
async function _oocCallAI(userMsg){
  const key=getKey();if(!key)return;
  const oocBtn=document.getElementById('ooc-send-btn');
  const typingEl=document.getElementById('ooc-typing-ind');
  if(typingEl)typingEl.classList.add('on');
  if(oocBtn)oocBtn.disabled=true;
  const oocLedger=genLedger();
  const recentNarrative=(state.chatHistory||[]).filter(m=>m.role==='assistant'&&m.content).slice(-8).map(m=>m.content.slice(0,400)).join('\n---\n');
  const sessionSummary=state.prevSessionSummary||state.logSummary||'';
  const sceneCtx='Current location: '+(state.worldData?.location||'unknown')+' | Time: '+(state.worldData?.time||'unknown')+' | Weather: '+(state.worldData?.weather||'unknown')+(state.worldData?.loc_desc?'\nScene: '+state.worldData.loc_desc:'')+(state.combat?.active?'\nCOMBAT ACTIVE — Round '+state.combat.round:'');
  const narrativeCtx=sceneCtx+'\n\n'+(sessionSummary?'RECENT SESSION SUMMARY:\n'+sessionSummary.slice(0,800)+'\n\n':'')+(recentNarrative?'RECENT NARRATIVE (for context — do not narrate, just use for accuracy):\n'+recentNarrative+'\n\n':'');
  const oocContract='OOC CONTRACT — CHANNEL RULES:\n1. You are answering OUT-OF-CHARACTER. No narrative prose. No immersion language.\n2. CHARACTER SEPARATION: Always name the specific character. Never say "you" to mean the whole party. Each PC may know things others do not.\n3. RULES ACCURACY: Cite actual D&D 5e rules. If unsure, say so. Do not invent rulings or fudge mechanics.\n4. NO DICE RESOLUTION: These channels answer questions only. Actual rolls and outcomes happen in the Narrative channel only.\n5. CAMPAIGN AWARENESS: This campaign uses the module and episode tracker shown in CURRENT GAME STATE. Always reference the actual module name and current progress when asked about campaign status.\n6. INVENTORY LOOKUPS: You CAN and SHOULD answer questions about items, loot, and inventory. Check the CURRENT GAME STATE inventory section. If an item is listed, report its details. If it is NOT listed, say "That item isn\'t in the tracked inventory." NEVER fabricate item details.\n';
  const oocSys='You are the Dungeon Master for this D&D 5e campaign. This is the OUT-OF-CHARACTER channel. Answer in 1-3 sentences only. No narrative prose. No mechanics block. For rules questions: state the rule directly. The story continues in the Narrative channel only.\n\n'+oocContract+'\n'+narrativeCtx+'CURRENT GAME STATE:\n'+oocLedger;
  const histForAI=(state.oocHistory||[]).filter(m=>m.role==='user'||m.role==='assistant').slice(-10).map(m=>({role:m.role,content:m.content}));
  try{
    const response=await callAI(histForAI,oocSys,300);
    state.oocHistory.push({role:'assistant',content:response,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),gameTs:state.worldData.time||'',id:'ooc_'+Date.now()});
    save();
  }catch(err){
    state.oocHistory.push({role:'sys',content:'OOC error: '+err.message,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
    save();
  }finally{
    if(typingEl)typingEl.classList.remove('on');
    if(oocBtn)oocBtn.disabled=false;
    renderOOC();
  }
}

function toggleDicePicker(){
  const p=document.getElementById('dice-picker-panel');
  const b=document.getElementById('dice-picker-btn');
  if(!p)return;
  const open=p.style.display==='flex';
  p.style.display=open?'none':'flex';
  p.style.pointerEvents=open?'none':'auto';
  if(b)b.style.background=open?'':'var(--gold-dim)';
}
function quickRoll(sides,modId,resultId){
  modId=modId||'dice-mod-quick';resultId=resultId||'dice-result';
  const modEl=document.getElementById(modId);
  const modRaw=(modEl?.value||'').trim().replace(/^\+/,'');
  const mod=parseInt(modRaw)||0;
  const roll=Math.floor(Math.random()*sides)+1;
  const total=roll+mod;
  const nat=roll===sides?'NAT '+sides+'!':(roll===1?'NAT 1!':'');
  const modStr=mod!==0?(mod>0?' + '+mod+' = '+total:' - '+Math.abs(mod)+' = '+total):'';
  const result='🎲 d'+sides+': '+roll+modStr+(nat?' ('+nat+')':'');
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(navigator.vibrate)try{navigator.vibrate(roll===sides||roll===1?[10,30,10]:[8,24]);}catch(e){}
  const disp=document.getElementById(resultId);
  if(disp){
    const col=roll===sides?'var(--gold-bright)':(roll===1?'var(--red)':'var(--text-bright)');
    const label=(nat?'✦ ':'')+'d'+sides+': '+roll+modStr+(nat?' ✦':'');
    const sendTxt='[d'+sides+' roll: '+roll+modStr+(nat?' ('+nat+')':'')+']';
    const settle=()=>{
      disp.innerHTML='<span style="color:'+col+';font-weight:700">'+label+'</span>'
        +'<button onclick="sendRollToChat(\''+sendTxt.replace(/'/g,"\\'")+'\')" style="margin-left:8px;font-size:10px;padding:2px 8px;background:var(--surface3);border:1px solid var(--gold-dim);color:var(--gold);border-radius:3px;cursor:pointer;-webkit-tap-highlight-color:transparent">📨 Send</button>';
      if(!reduce){disp.style.transition='none';disp.style.transform='scale(1.12)';requestAnimationFrame(()=>{disp.style.transition='transform .18s ease';disp.style.transform='scale(1)';});}
    };
    if(reduce){settle();}
    else{
      let ticks=0;
      const iv=setInterval(()=>{
        disp.innerHTML='<span style="color:var(--text-dim)">d'+sides+': '+(Math.floor(Math.random()*sides)+1)+'</span>';
        if(++ticks>=4){clearInterval(iv);settle();}
      },55);
    }
  }
  const ts=state.worldData&&state.worldData.time?state.worldData.time:'';
  if(!Array.isArray(state.chatHistory))state.chatHistory=[];
  state.chatHistory.push({role:'system',content:result,ts});
  saveRefresh();
  const cm=document.getElementById('chat-msgs');
  if(cm)cm.scrollTop=cm.scrollHeight;
}
function toggleDockDice(){
  const p=document.getElementById('dock-dice-panel');
  const b=document.getElementById('dice-picker-btn');
  if(!p)return;
  const open=p.style.display!=='none';
  p.style.display=open?'none':'flex';
  if(b)b.style.background=open?'':'var(--gold-dim)';
}
function sendRollToChat(txt){
  const qi=document.getElementById('chat-quick-input');
  const ci=document.getElementById('chat-input');
  if(ci&&document.getElementById('tab-dm')?.classList.contains('active')){ci.value=txt;sendMsg();}
  else if(qi){qi.value=txt;sendMsgQuick();}
  else if(ci){ci.value=txt;sendMsg();}
}
function openTreasury(){
  const m=document.getElementById('treasury-modal');
  if(!m)return;
  const isOpen=m.style.display!=='none';
  if(isOpen){m.style.display='none';return;}
  // Sync current values
  const td=state.treasuryData||{};
  ['pp','gp','ep','sp','cp'].forEach(k=>{const el=document.getElementById('t_'+k);if(el)el.value=td[k]||0;});
  const lf=document.getElementById('t_lifestyle');if(lf)lf.value=td.lifestyle||'';
  renderTreasuryTotal();renderIncome();syncBP();
  m.style.display='block';
}
function closeTreasury(){
  const m=document.getElementById('treasury-modal');
  if(m)m.style.display='none';
}
function quickD20(){const r=Math.floor(Math.random()*20)+1;const inp=document.getElementById('chat-input');if(inp){inp.value=inp.value+(inp.value?' ':'')+'[d20 = '+r+']';}}

async function sendMsg(){
  const inp=document.getElementById('chat-input');if(!inp)return;
  const text=inp.value.trim();if(!text)return;

  // ── Save game intercept ──
  const savePattern=/^(save|save game|save state|quick save|checkpoint|save progress)\.?$/i;
  if(savePattern.test(text)){
    inp.value='';
    save();
    triggerChk('Save Game');
    return;
  }
  // ── // command intercept ──
  if(text.startsWith('//')){
    inp.value='';
    _handleSlashCmd(text.slice(2).trim());
    return;
  }
  const key=getKey();if(!key){toast('Set an API key in the AI DM tab first.');return;}
  if(!playerName){populateSetup();openModal('setup-modal');toast('Set your player name first.');return;}
  const sendBtn=document.getElementById('send-btn');
  const typEl=document.getElementById('typing-ind');
  const ts=state.worldData.time||'';
  const realTs=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  if(!state.chatHistory||!Array.isArray(state.chatHistory))state.chatHistory=[];
  state.chatHistory.push({role:'user',content:text,ts,realTs,playerName,playerChar});
  if(document.getElementById('chat-log')?.checked)state.logs.push({ts,type:'player',body:'['+playerName+' / '+playerChar+'] '+text});
  inp.value='';saveRefresh();
  inp.disabled=true;if(sendBtn)sendBtn.disabled=true;
  if(typEl)typEl.classList.add('on');
  const ob=document.getElementById('offline-banner');if(ob)ob.style.display='none';
  try{
    const useLedger=document.getElementById('chat-ledger')?.checked;
    if(useLedger)genLedger();
    const ledger=useLedger?(document.getElementById('ledger-out')?.value||''):'';
    const _inject=_ctxInject;_ctxInject=null;
    const encWarns=[];
    const wW=calcWeight();if(wW>getMaxLb())encWarns.push('Wagon OVER capacity: '+wW.toFixed(0)+'/'+getMaxLb()+'lb. Travel speed halved, risk of axle failure.');
    (state.pcs||[]).forEach(p=>{const w=_pcCarryWeight(p),c=_pcCarryCap(p);if(w>c)encWarns.push(p.name+' ENCUMBERED: '+w.toFixed(0)+'/'+c+'lb.');});
    const encCtx=encWarns.length?'\n\n[ENCUMBRANCE WARNING] '+encWarns.join(' ')+' Enforce movement and travel penalties. Emit item_add/item_remove mechanics for any inventory changes.':'';
    const receipt=_lastMechReceipt||'';_lastMechReceipt=null;
    const pendingRolls=(window._rollRequestQueue||[]).length?'\n\n[PENDING ROLLS — DO NOT RESOLVE] '+window._rollRequestQueue.map(r=>(r.pcname||'Party')+': '+r.skill+(r.dc?' DC '+r.dc:'')).join('; ')+'. These players have NOT rolled yet. Do NOT narrate outcomes, assume results, or roll for them. Resolve ONLY the acting player\'s actions.':'';
    const sysProm=buildPrompt(ledger)+(_inject?'\n\n'+_inject:'')+encCtx+(receipt?'\n\n'+receipt:'')+pendingRolls;
    const histForApi=state.chatHistory.filter(m=>m.role!=='system').map(m=>({
      role:m.role==='assistant'?'assistant':'user',
      content:(m.playerName&&m.role!=='assistant'?'['+m.playerName+' playing '+m.playerChar+']: ':'')+m.content
    }));
    const responseText=await callAI(histForApi,sysProm,1400);
    const pendingMsgId='cm_'+Date.now()+'_'+Math.random().toString(36).slice(2,5);
    const mechanics=parseMechanics(responseText,pendingMsgId);
    // Strip mechanics block from display - handle with or without ---END---
  let displayText=responseText
    .replace(/---MECHANICS---[\s\S]*?---END---/g,'')
    .replace(/---MECHANICS---[\s\S]*$/,'')
    .replace(/\*{1,3}MECHANICS\*{1,3}[\s\S]*?---END---/gi,'')
    .replace(/\*{1,3}MECHANICS\*{1,3}[\s\S]*$/gi,'')
    .replace(/(?:MECHANICS:|##\s*MECHANICS)[\s\S]*$/,'')
    .replace(/(?:---\s*\n)?\bMECHANICS\b\s*\n[\s\S]*$/im,'')
    .replace(/^---END---\s*$/gm,'')
    .replace(/^---\s*$/gm,'')
    // Strip any naked mechanic lines the AI put directly in the response body
    .replace(new RegExp('^[-*•]?\\s*('+_MECH_KEYS+'): .+$','gm'),'')
    .replace(/\n{3,}/g,'\n\n')
    .trim();
    detectUnloggedGold(displayText,mechanics);
    detectUnloggedNPC(displayText,mechanics);
    detectUnloggedItem(displayText,mechanics);
    detectUnloggedDamage(displayText,mechanics);
    detectUnloggedHealing(displayText,mechanics);
    detectUnloggedCondition(displayText,mechanics);
    detectUnloggedLocation(displayText,mechanics);
    detectProseRolls(displayText);
    _validateMechanics(mechanics);
    cacheResp(text,displayText);
    if(localStorage.getItem('tt_tts_auto')==='1'&&typeof speechSynthesis!=='undefined')speak(displayText);
    state.chatHistory.push({role:'assistant',content:displayText,mechanics,ts,realTs:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),msgId:pendingMsgId});
    // Auto-increment turn counter on every AI response
    state.turnCount=(state.turnCount||0)+1;
    state.turnsSince=(state.turnsSince||0)+1;
    state.msgsSinceChk=(state.msgsSinceChk||0)+1;
    renderTurnCtr();
    // Auto-checkpoint: message count OR turn-based mode
    if(state.msgsSinceChk>=(state.autoChkInterval||8)){
      state.msgsSinceChk=0;
      setTimeout(()=>triggerChk('Auto — '+state.autoChkInterval+' messages'),800);
    }else if(state.turnsSince>=getCpInt()){
      setTimeout(()=>triggerChk('Auto — '+getCpInt()+' turns ('+state.chkMode+')'),800);
    }
    if(document.getElementById('chat-log')?.checked)state.logs.push({ts,type:'dm',body:displayText});
    saveRefresh();
    // DR-7: background summary + prune when chat exceeds 75 messages
    if(state.chatHistory.length>=75)setTimeout(summarizeAndPrune,2000);
  }catch(err){
    console.error('AI error:',err);
    const cached=getCached();
    if(!navigator.onLine&&cached){
      const ob2=document.getElementById('offline-banner');if(ob2)ob2.style.display='block';
      state.chatHistory.push({role:'assistant',content:'[OFFLINE — cached: '+cached.ts+']\n\n'+cached.response,ts});
    }else{
      const isGoogle=provider==='google';
    const tips=isGoogle
      ?'• Verify key at aistudio.google.com\n• Try model: gemini-2.5-flash-lite or gemini-3.5-flash\n• Enable billing at console.cloud.google.com if on paid model\n• Check aistudio.google.com for current free-tier models'
      :'• Check credit balance at openrouter.ai\n• Try Llama 3.1 8B (free tier)\n• Verify key at openrouter.ai/keys';
    state.chatHistory.push({role:'system',content:'⚠ Error: '+err.message+'\n\nTroubleshooting:\n• Check your '+( isGoogle?'Google AI Studio':'OpenRouter')+' key in Settings\n'+tips+'\n• Check internet connection',ts});
    }
    saveRefresh();
  }finally{
    inp.disabled=false;if(sendBtn)sendBtn.disabled=false;
    if(typEl)typEl.classList.remove('on');
    inp.focus();
  }
}

// ═══ QUICK ACTIONS ═══
function qa(t){const inp=document.getElementById('chat-input');if(inp){inp.value=t;sendMsg();}}
function qaNPC(){
  const active=state.npcs.filter(n=>n.status!=='deceased');
  if(!active.length){qa('No known NPCs nearby. Introduce a relevant one based on our location.');return;}
  const n=active[Math.floor(Math.random()*active.length)];
  qa('We approach '+n.name+' ('+n.disposition+' — '+n.details+'). Roleplay their reaction to us right now.');
}
function qaMotive(){
  const pc=state.pcs[Math.floor(Math.random()*state.pcs.length)];
  let p='Create a scene that speaks to '+pc.name+"'s motivation: \""+(pc.backstory_motivation||'their goals')+'".';
  if(pc.backstory_secret)p+=' Subtly reference their secret without revealing it.';
  qa(p);
}
// Roll type stat mapping
const ROLL_STATS={
  'Attack (STR)':'str','Attack (DEX)':'dex',
  'Acrobatics':'dex','Sleight of Hand':'dex','Stealth':'dex','Initiative':'dex',
  'Athletics':'str',
  'Arcana':'int','History':'int','Investigation':'int','Nature':'int','Religion':'int',
  'Animal Handling':'wis','Insight':'wis','Medicine':'wis','Perception':'wis','Survival':'wis',
  'Deception':'cha','Intimidation':'cha','Performance':'cha','Persuasion':'cha',
  'STR Save':'str','DEX Save':'dex','CON Save':'con','INT Save':'int','WIS Save':'wis','CHA Save':'cha',
  'Damage (1d6)':null,'Damage (1d8)':null,'Damage (1d4)':null,'Custom':null
};
const ROLL_FORMULAS={
  'Attack (STR)':'1d20','Attack (DEX)':'1d20',
  'Damage (1d6)':'1d6','Damage (1d8)':'1d8','Damage (1d4)':'1d4'
};
function getStatMod(statStr){
  if(!statStr)return 0;
  const m=statStr.match(/\(([+\-]\d+)\)/);
  return m?parseInt(m[1]):0;
}
function openRollSheet(){
  const pcOpts=state.pcs.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
  const rollTypes=Object.keys(ROLL_STATS).map(t=>`<option value="${t}">${t}</option>`).join('');
  openQASheet('🎲 Roll & Submit',`
    <div class="form-group" style="margin-bottom:8px"><label class="field-label">Character</label>
      <select id="rs-pc" onchange="updateRollMod()" style="font-size:13px">${pcOpts}</select>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <div style="flex:1"><label class="field-label">Roll Type</label>
        <select id="rs-type" onchange="updateRollMod()" style="font-size:12px;width:100%"><option value="">— Select —</option>${rollTypes}</select>
      </div>
      <div style="width:72px"><label class="field-label">Modifier</label>
        <input type="number" id="rs-mod" value="0" style="padding:5px;font-size:16px;font-weight:700;text-align:center;width:100%">
      </div>
    </div>
    <div id="rs-pills" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;min-height:4px"></div>
    <div style="display:flex;gap:4px;margin-bottom:10px">
      <button onclick="rsAdjMod(-5)" style="flex:1;height:38px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;font-family:var(--mono);font-weight:700;font-size:14px;color:var(--red);cursor:pointer;-webkit-tap-highlight-color:transparent">-5</button>
      <button onclick="rsAdjMod(-1)" style="flex:1;height:38px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;font-family:var(--mono);font-weight:700;font-size:14px;color:var(--red);cursor:pointer;-webkit-tap-highlight-color:transparent">-1</button>
      <button onclick="rsAdjMod(1)" style="flex:1;height:38px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;font-family:var(--mono);font-weight:700;font-size:14px;color:var(--green);cursor:pointer;-webkit-tap-highlight-color:transparent">+1</button>
      <button onclick="rsAdjMod(5)" style="flex:1;height:38px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;font-family:var(--mono);font-weight:700;font-size:14px;color:var(--green);cursor:pointer;-webkit-tap-highlight-color:transparent">+5</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px">
      <button class="btn gold" onclick="rsRollDice(4)" style="height:44px;font-size:15px;font-weight:700;font-family:var(--mono)">d4</button>
      <button class="btn gold" onclick="rsRollDice(6)" style="height:44px;font-size:15px;font-weight:700;font-family:var(--mono)">d6</button>
      <button class="btn gold" onclick="rsRollDice(8)" style="height:44px;font-size:15px;font-weight:700;font-family:var(--mono)">d8</button>
      <button class="btn gold" onclick="rsRollDice(10)" style="height:44px;font-size:15px;font-weight:700;font-family:var(--mono)">d10</button>
      <button class="btn gold" onclick="rsRollDice(12)" style="height:44px;font-size:15px;font-weight:700;font-family:var(--mono)">d12</button>
      <button class="btn gold" onclick="rsRollDice(20)" style="height:44px;font-size:15px;font-weight:700;font-family:var(--mono)">d20</button>
      <button class="btn gold" onclick="rsRollDice(100)" style="height:44px;font-size:15px;font-weight:700;font-family:var(--mono)">d%</button>
      <button class="btn" onclick="rsRollDice(0)" style="height:44px;font-size:13px;font-weight:700;font-family:var(--mono);border-color:var(--border-bright)">+0</button>
    </div>
    <div id="rs-result" style="min-height:40px;text-align:center;font-family:var(--mono);font-size:20px;font-weight:bold;color:var(--text-bright);margin-bottom:8px;padding:6px;background:var(--surface2);border-radius:6px;display:flex;align-items:center;justify-content:center"></div>
    <div class="form-group" style="margin-bottom:4px"><label class="field-label">Context (optional)</label>
      <input type="text" id="rs-action" placeholder="Attack the goblin, pick the lock..." style="font-size:12px">
    </div>`,
    ()=>{
      const resEl=document.getElementById('rs-result');
      const rt=document.getElementById('rs-type')?.value||'Roll';
      const act=document.getElementById('rs-action')?.value?.trim()||'';
      const pc=findPC(document.getElementById('rs-pc')?.value);
      if(!resEl||!resEl.dataset.sendTxt){toast('Roll a die first!');return;}
      const t='['+(pc?.name||'Party')+(rt?' — '+rt:'')+'] '+resEl.dataset.sendTxt+(act?' — "'+act+'"':'');
      closeQAModal();
      if(window._pendingRollQueueIdx!==undefined){dismissRollRequest(window._pendingRollQueueIdx);window._pendingRollQueueIdx=undefined;}
      const inp=document.getElementById('chat-input');if(inp){inp.value=t;sendMsg();}
    });
  setTimeout(()=>{
    const rr=window._pendingRollRequest;
    if(rr){
      if(rr.pcname){
        const pc=findPC(rr.pcname);
        if(pc){const sel=document.getElementById('rs-pc');if(sel)sel.value=pc.id;}
      }
      const typeEl=document.getElementById('rs-type');
      if(typeEl&&rr.skill){
        const skillLower=rr.skill.toLowerCase();
        const match=[...typeEl.options].find(o=>o.value.toLowerCase()===skillLower);
        if(match)typeEl.value=match.value;
      }
    }
    updateRollMod();_buildRsPills();
  },60);
}
function rsAdjMod(delta){
  const el=document.getElementById('rs-mod');if(!el)return;
  el.value=(parseInt(el.value)||0)+delta;
}
function rsRollDice(sides){
  const mod=parseInt(document.getElementById('rs-mod')?.value)||0;
  const res=document.getElementById('rs-result');if(!res)return;
  if(sides===0){
    const modStr=(mod>=0?'+':'')+mod;
    res.innerHTML='<span style="color:var(--gold)">Modifier: <strong>'+modStr+'</strong></span>';
    res.dataset.sendTxt='modifier '+modStr;
    return;
  }
  const roll=Math.floor(Math.random()*sides)+1;
  const total=roll+mod;
  const isMax=roll===sides,isMin=roll===1&&sides>1;
  const col=isMax?'var(--gold-bright)':isMin?'var(--red)':'var(--text-bright)';
  const nat=isMax?'⚡ MAX':isMin?'💀 MIN':'';
  const modStr=mod===0?'':(mod>0?'+'+mod:''+mod);
  res.innerHTML='<span style="color:'+col+'">d'+sides+'['+roll+']'+modStr+' = <strong>'+total+'</strong>'+(nat?' '+nat:'')+'</span>';
  res.dataset.sendTxt='d'+sides+'['+roll+']'+modStr+'='+total+(nat?' ('+nat+')':'');
  if(navigator.vibrate)try{navigator.vibrate(isMax||isMin?[10,30,10]:[8,20]);}catch(e){}
}
function _buildRsPills(){
  const c=document.getElementById('rs-pills');if(!c)return;c.innerHTML='';
  const items=[];
  const loc=state.worldData?.location;const scene=state.worldData?.scene_title;
  if(loc)items.push(loc);
  if(scene&&scene!==loc)items.push(scene);
  items.slice(0,3).forEach(lbl=>{
    const b=document.createElement('button');
    b.style.cssText='font-size:10px;padding:3px 8px;background:var(--surface2);border:1px solid var(--border);border-radius:12px;color:var(--text-dim);cursor:pointer;-webkit-tap-highlight-color:transparent;white-space:nowrap;overflow:hidden;max-width:180px;text-overflow:ellipsis';
    b.textContent=lbl;b.title=lbl;
    b.onclick=()=>{const ai=document.getElementById('rs-action');if(ai)ai.value=(ai.value?ai.value+' · ':'')+lbl;};
    c.appendChild(b);
  });
}
function updateRollMod(){
  const pcId=document.getElementById('rs-pc')?.value;
  const rt=document.getElementById('rs-type')?.value;
  const modEl=document.getElementById('rs-mod');
  const formulaEl=document.getElementById('rs-formula');
  if(!pcId||!rt||!modEl)return;
  const pc=findPC(pcId);if(!pc)return;
  const statKey=ROLL_STATS[rt];
  if(statKey){modEl.value=getStatMod(pc[statKey]);}
  // Auto-set formula
  if(ROLL_FORMULAS[rt]&&formulaEl)formulaEl.value=ROLL_FORMULAS[rt];
}
// Pending context injection — appended to system prompt on next sendMsg(), then cleared
let _ctxInject=null;
function sendContextRefresh(){
  const w=state.worldData;
  const lines=[
    '[CONTEXT REFRESH — re-read this before your next response]',
    'Location: '+(w.location||'unknown'),
    'Time: '+(w.time||'unknown'),
    'Scene: '+(w.scene_title||'none')+' — tone: '+(w.scene_threat||'calm'),
    'Active conditions: '+(w.scene_cond||'none'),
    'Weather: '+(w.weather||'unknown'),
  ];
  const cb=_combatLedgerBlock();
  if(cb){lines.push('');lines.push(cb);}
  else{lines.push('Combat: not active');}
  state.pcs.forEach(p=>{
    let s=p.name+': HP '+p.hp+'/'+p.hp_max+' AC '+p.ac;
    if((p.conditions||[]).length)s+=' ['+p.conditions.join(', ')+']';
    if(p.concentrating)s+=' (Conc: '+p.concentrating+')';
    lines.push(s);
  });
  _ctxInject=lines.join('\n');
  const ts=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  state.chatHistory.push({role:'system',content:'↺ Context refreshed — will apply on your next message.',ts,realTs:ts});
  save();renderChat();showTab('tab-dm');
  toast('↺ Context refresh queued — send your next message to apply.');
}

// ═══ SESSION ZERO ═══
function generateSessionZero(){
  genLedger();
  const ledger=document.getElementById('ledger-out')?.value||'';
  const verify=document.getElementById('s0-verify')?.value||'all PC names with current HP, location, and primary quest';
  const prompt=buildPrompt(ledger);
  const campName=(state.worldData?.setting||'').split('\n')[0]||'a D&D 5e campaign';
  const out=`╔═══════════════════════════════════════════════════════════╗
║        SESSION ZERO — AI DM ONBOARDING CONTRACT           ║
╚═══════════════════════════════════════════════════════════╝

You are being initialized as the AI Dungeon Master for ${campName}.
Read everything below before responding.

${prompt}

━━━ VERIFICATION ━━━
Confirm you have read this entire message. Output exactly:
"SESSION ZERO CONFIRMED. Verifying: ${verify}
[Fill in actual values from the ledger above]
Ready to begin. Awaiting your first action."`;
  const outEl=document.getElementById('s0-output');if(outEl)outEl.textContent=out;
}

function sendSessionZero(){
  const out=document.getElementById('s0-output')?.textContent||'';
  if(!out||out==='— Click Generate —'){toast('Generate the Session Zero first.');return;}
  const key=getKey();if(!key){toast('Set an API key first (AI Tools tab).');return;}
  _ctxInject=out;
  closeModal('s0-modal');
  showChatTab('narrative');
  const input=document.getElementById('chat-quick-input');
  if(input){input.value='Begin the campaign. Describe the opening scene.';input.focus();}
  toast('⚡ Session Zero loaded — send your first message to begin.');
}

// ═══ MODALS ═══
function openModal(id){document.getElementById(id)?.classList.add('open');}
function closeModal(id){document.getElementById(id)?.classList.remove('open');}

// ═══ COPY TEXT ═══
function copyText(text,msg){
  if(!text){toast('Nothing to copy.');return;}
  const label=msg||'✓ Copied!';
  const fallback=()=>{
    const ta=document.createElement('textarea');
    ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.focus();ta.select();
    try{document.execCommand('copy');toast(label);}
    catch(e){toast('Copy failed.');}
    ta.remove();
  };
  if(navigator.clipboard&&window.isSecureContext){
    navigator.clipboard.writeText(text).then(()=>toast(label)).catch(()=>fallback());
  }else{
    fallback();
  }
}

// ═══ TURN COUNTER ═══
function getCpInt(){if(state.chkMode==='custom')return parseInt(document.getElementById('cp-n')?.value)||6;return CP_INT[state.chkMode]||6;}
function updateCpMode(){state.chkMode=document.getElementById('cp-mode')?.value||'exploration';renderTurnCtr();save();}
function logTurn(){state.turnCount++;state.turnsSince++;renderTurnCtr();save();if(state.turnsSince>=getCpInt())triggerChk('Auto');}
function resetTurns(){if(!confirm('Reset turn counter?'))return;state.turnCount=0;state.turnsSince=0;renderTurnCtr();save();}
function renderTurnCtr(){
  const modeEl=document.getElementById('cp-mode');if(modeEl&&modeEl.value!==state.chkMode)modeEl.value=state.chkMode||'exploration';
  const interval=getCpInt();const rem=Math.max(0,interval-state.turnsSince);
  const urgent=state.turnsSince>=interval;const warn=state.turnsSince>=Math.floor(interval*.7)&&!urgent;
  const bar=document.getElementById('turn-counter-bar');
  if(bar){bar.classList.toggle('urgent',urgent);bar.classList.toggle('alert',warn);}
  const he=document.getElementById('hdr-turn');if(he)he.textContent=state.turnCount;
  const hc=document.getElementById('hdr-chk');
  if(hc){if(urgent){hc.textContent='⚠ NOW';hc.className='chk-status-msg urgent';}else if(warn){hc.textContent='In '+rem+' ⚡';hc.className='chk-status-msg warn';}else{hc.textContent='In '+rem;hc.className='chk-status-msg ok';}}
  // Mini indicator in header
  const mini=document.getElementById('hdr-chk-mini');
  if(mini){mini.textContent=urgent?'⚠ Checkpoint now':warn?'Chk in '+rem+' ⚡':'';mini.className='chk-status-msg '+(urgent?'urgent':warn?'warn':'ok');}
  const st=document.getElementById('stat-turns');if(st)st.textContent=state.turnCount;
  const ss=document.getElementById('stat-since');if(ss){ss.textContent=state.turnsSince;ss.style.color=urgent?'var(--red)':'var(--gold)';}
  const sc=document.getElementById('stat-chks');if(sc)sc.textContent=state.chkCount;
  const tb=document.getElementById('tab-btn-ait');if(tb)tb.textContent=urgent?'🔴 AI Tools':warn?'🟡 AI Tools':'🤖 AI Tools';
}
function triggerChk(reason){
  pushRewindSnap();
  state.chkCount++;state.turnsSince=0;
  genLedger();const ledger=document.getElementById('ledger-out')?.value||'';
  state.chkHistory.unshift({ts:new Date().toLocaleString(),reason,turn:state.turnCount,hp:state.pcs.map(p=>p.name+':'+p.hp+'/'+p.hp_max).join(', ')});
  if((state.chkHistory||[]).length>30)state.chkHistory.pop();
  renderTurnCtr();renderChkHist();renderRewind();save();
  document.getElementById('chk-modal-title').textContent=(reason==='Auto'?'🔔 Auto-Checkpoint':'⚡ Checkpoint')+' — Turn '+state.turnCount;
  document.getElementById('chk-modal-desc').textContent=reason+' checkpoint at turn '+state.turnCount+'.';
  document.getElementById('chk-modal-output').textContent=ledger;
  openModal('chk-modal');
}
function markChkDone(){state.turnsSince=0;renderTurnCtr();save();}
function renderChkHist(){
  const el=document.getElementById('chk-hist');if(!el)return;
  if(!state.chkHistory?.length){el.innerHTML='<div style="color:var(--text-dim);font-size:12px;padding:10px">No checkpoints yet.</div>';return;}
  el.innerHTML=state.chkHistory.map(h=>`<div class="chk-hist-item"><span style="color:var(--text-dim);min-width:80px;font-size:10px">${h.ts}</span><span style="color:var(--gold);font-weight:bold">[${h.reason}]</span><span style="font-size:10px;color:var(--text-dim)">T${h.turn}</span><span style="flex:1;color:var(--text);font-size:11px">${h.hp}</span></div>`).join('');
}
function clearChkHist(){if(!confirm('Clear history?'))return;state.chkHistory=[];renderChkHist();save();}

// ═══ REWIND STACK ═══
function pushRewindSnap(){
  if(!state.rewindStack)state.rewindStack=[];
  // Exclude chatHistory to save localStorage space
  const snap={ts:new Date().toLocaleString(),turn:state.turnCount,data:JSON.parse(JSON.stringify({pcs:state.pcs,worldData:state.worldData,treasuryData:state.treasuryData,quests:state.quests,npcs:state.npcs,combat:state.combat,wagon:state.wagon,partyInventory:state.partyInventory}))};
  state.rewindStack.unshift(snap);
  if((state.rewindStack||[]).length>10)state.rewindStack.pop();
}
function renderRewind(){
  const el=document.getElementById('rewind-list');if(!el)return;
  if(!state.rewindStack?.length){el.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:8px">No snapshots yet.</div>';return;}
  el.innerHTML=state.rewindStack.map((s,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--surface2);border:1px solid var(--border);border-radius:2px;margin-bottom:4px;font-size:11px;flex-wrap:wrap"><span style="flex:1;color:var(--text-dim)">${s.ts} — T${s.turn} — ${s.data.pcs.map(p=>p.name+':'+p.hp).join(', ')}</span><button class="btn sm red" onclick="rewindTo(${i})">Rewind</button></div>`).join('');
}
function rewindTo(idx){
  const s=state.rewindStack[idx];if(!s)return;
  if(!confirm('Rewind to '+s.ts+'?'))return;
  Object.assign(state,s.data);saveRefresh();toast('✓ Rewound!');
}

// ═══ TTS ═══
function populateVoices(){
  loadElSettings();
  if(typeof speechSynthesis==='undefined')return;
  const sel=document.getElementById('tts-voice');if(!sel)return;
  // Force fresh voice list — Android Chrome loads voices asynchronously
  const load=()=>{
    const voices=speechSynthesis.getVoices();
    if(!voices.length)return; // not ready yet
    const sv=localStorage.getItem('tt_tts_v')||'';
    sel.innerHTML=voices.map(v=>`<option value="${esc(v.name)}" ${v.name===sv?'selected':''}>${esc(v.name)} (${v.lang})</option>`).join('');
  };
  load();
  // Retry after short delay for Android
  setTimeout(load,500);
  setTimeout(load,1500);
}
function saveTts(){
  localStorage.setItem('tt_tts_v',document.getElementById('tts-voice')?.value||'');
  localStorage.setItem('tt_tts_r',document.getElementById('tts-rate')?.value||'1.0');
  localStorage.setItem('tt_tts_p',document.getElementById('tts-pitch')?.value||'1.0');
  localStorage.setItem('tt_tts_auto',document.getElementById('tts-auto')?.checked?'1':'0');
  const elv=document.getElementById('el-voice')?.value||'';if(elv)localStorage.setItem('tt_el_voice',elv);
  const els=document.getElementById('el-stability')?.value||'0.5';localStorage.setItem('tt_el_stability',els);
}
function loadTtsSettings(){
  loadElSettings();
  const r=localStorage.getItem('tt_tts_r')||'1.0';const p=localStorage.getItem('tt_tts_p')||'1.0';
  const re=document.getElementById('tts-rate');const pe=document.getElementById('tts-pitch');const ae=document.getElementById('tts-auto');
  if(re){re.value=r;document.getElementById('tts-rate-val').textContent=parseFloat(r).toFixed(1);}
  if(pe){pe.value=p;document.getElementById('tts-pitch-val').textContent=parseFloat(p).toFixed(1);}
  if(ae)ae.checked=localStorage.getItem('tt_tts_auto')==='1';
}
let _ttsActive=null;
function toggleSpeak(text,btnEl){
  if(typeof speechSynthesis==='undefined'||!('speechSynthesis' in window)){toast('TTS not supported on this browser.');return;}
  if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();if(btnEl)btnEl.textContent='▶';return;}
  if(speechSynthesis.paused){speechSynthesis.resume();if(btnEl)btnEl.textContent='⏸';return;}
  speak(text,btnEl);
}
function setTtsProvider(p){
  localStorage.setItem('tt_tts_provider',p);
  document.getElementById('tts-panel-browser').style.display=p==='browser'?'block':'none';
  document.getElementById('tts-panel-elevenlabs').style.display=p==='elevenlabs'?'block':'none';
  document.getElementById('tts-btn-browser').className='btn '+(p==='browser'?'gold':'');
  document.getElementById('tts-btn-elevenlabs').className='btn '+(p==='elevenlabs'?'gold':'');
}
function saveElKey(){
  const k=document.getElementById('el-key')?.value||'';
  localStorage.setItem('tt_el_key',k);
}
async function verifyElKey(){
  saveElKey();
  const key=localStorage.getItem('tt_el_key')||'';
  if(!key){toast('Enter your API key first.');return;}
  toast('Checking key…');
  try{
    const r=await fetch('https://api.elevenlabs.io/v1/user',{headers:{'xi-api-key':key}});
    if(!r.ok){const b=await r.text();let m='';try{m=JSON.parse(b)?.detail?.message||b;}catch{m=b;}toast('✗ Invalid key: '+String(m).slice(0,60),'error');return;}
    const u=await r.json();
    const used=u?.subscription?.character_count||0;
    const limit=u?.subscription?.character_limit||0;
    toast('✓ Key valid — '+used.toLocaleString()+' / '+limit.toLocaleString()+' chars used');
  }catch(e){toast('Network error: '+e.message,'error');}
}
function loadElSettings(){
  const k=localStorage.getItem('tt_el_key')||'';
  const el=document.getElementById('el-key');if(el)el.value=k;
  const p=localStorage.getItem('tt_tts_provider')||'browser';
  setTtsProvider(p);
  const ev=localStorage.getItem('tt_el_voice')||'21m00Tcm4TlvDq8ikWAM';
  const evEl=document.getElementById('el-voice');if(evEl)evEl.value=ev;
  const es=localStorage.getItem('tt_el_stability')||'0.5';
  const esEl=document.getElementById('el-stability');
  if(esEl){esEl.value=es;document.getElementById('el-stability-val').textContent=parseFloat(es).toFixed(2);}
}
async function speakElevenLabs(text,btnEl){
  const key=localStorage.getItem('tt_el_key')||'';
  if(!key){toast('Add your ElevenLabs API key in Voice settings.');return;}
  const voiceId=document.getElementById('el-voice')?.value||'21m00Tcm4TlvDq8ikWAM';
  const stability=parseFloat(document.getElementById('el-stability')?.value||'0.5');
  const clean=text.replace(/\*\*/g,'').replace(/\*/g,'').replace(/---MECHANICS---[\s\S]*?---END---/g,'').replace(/---MECHANICS---[\s\S]*/g,'').replace(/\[.*?\]/g,'').trim();
  if(!clean)return;
  if(btnEl)btnEl.textContent='⏳';
  try{
    const resp=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+voiceId,{
      method:'POST',
      headers:{'Content-Type':'application/json','xi-api-key':key},
      body:JSON.stringify({text:clean,model_id:'eleven_turbo_v2_5',voice_settings:{stability,similarity_boost:0.75}})
    });
    if(!resp.ok){
      const errBody=await resp.text();
      let msg='';
      try{const j=JSON.parse(errBody);msg=j?.detail?.message||j?.detail||errBody;}catch{msg=errBody;}
      toast('ElevenLabs '+resp.status+': '+String(msg).slice(0,80));
      if(btnEl)btnEl.textContent='🔊';return;
    }
    const blob=await resp.blob();
    const url=URL.createObjectURL(blob);
    const audio=new Audio(url);
    if(btnEl){btnEl.textContent='⏸';audio.onended=()=>{btnEl.textContent='🔊';URL.revokeObjectURL(url);};}
    audio.play();
    if(btnEl)btnEl.onclick=()=>{audio.paused?audio.play():audio.pause();btnEl.textContent=audio.paused?'▶':'⏸';};
  }catch(e){toast('ElevenLabs error: '+e.message);if(btnEl)btnEl.textContent='🔊';}
}
function speak(text,btnEl){
  // Check TTS provider
  if(localStorage.getItem('tt_tts_provider')==='elevenlabs'){speakElevenLabs(text,btnEl);return;}
  if(typeof speechSynthesis==='undefined'||!('speechSynthesis' in window)){toast('TTS not supported on this browser.');return;}
  speechSynthesis.cancel();
  const clean=text.replace(/\*\*/g,'').replace(/\*/g,'').replace(/---MECHANICS---[\s\S]*?---END---/g,'').replace(/---MECHANICS---[\s\S]*/g,'').replace(/\[.*?\]/g,'');
  const u=new SpeechSynthesisUtterance(clean);
  const voices=speechSynthesis.getVoices();const sv=localStorage.getItem('tt_tts_v')||'';
  if(sv){const v=voices.find(v=>v.name===sv);if(v)u.voice=v;}
  u.rate=parseFloat(localStorage.getItem('tt_tts_r'))||1.0;
  u.pitch=parseFloat(localStorage.getItem('tt_tts_p'))||1.0;
  if(btnEl){
    btnEl.textContent='⏸';
    u.onend=()=>{btnEl.classList.remove('speaking');btnEl.textContent='🔊';};
    u.onerror=()=>{btnEl.classList.remove('speaking');btnEl.textContent='🔊';};
    btnEl.onclick=()=>toggleSpeak(text,btnEl);
  }
  speechSynthesis.speak(u);
}
function copyIdx(idx){
  const text=getMsgContent(idx);
  if(!text){toast('Nothing to copy.');return;}
  // Format as markdown — preserve bold/italic markers
  const formatted=text;
  const fallback=()=>{
    const ta=document.createElement('textarea');
    ta.value=formatted;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.focus();ta.select();
    try{document.execCommand('copy');toast('✓ Copied!');}
    catch(e){toast('Copy failed — try long-pressing the text.');}
    ta.remove();
  };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(formatted)
      .then(()=>toast('✓ Copied!'))
      .catch(()=>fallback());
  }else{
    fallback();
  }
}
function speakIdx(idx,btnEl){
  const text=getMsgContent(idx);
  if(text)toggleSpeak(text,btnEl);
}
function testTts(){if(typeof speechSynthesis==='undefined'){toast('TTS not available on this browser.');return;}speak('The torchlight flickers as you push open the ancient door. Beyond lies darkness, and the smell of something very old.');}


// ═══ RESOURCE PIPS ═══
function useResource(pcIdx,resIdx,pipIdx){
  const pc=state.pcs[pcIdx];if(!pc||!pc.resources)return;
  const res=pc.resources[resIdx];if(!res)return;
  res.used=(res.used===pipIdx+1)?pipIdx:pipIdx+1;
  saveRefresh();
}

// ═══ RENDERALL ADDITIONS ═══
function renderRelationships(pcIdx){
  const c=document.getElementById('rel-editor-'+pcIdx);if(!c)return;
  c.innerHTML='';
  const pcRels=(state.relationships||[]).filter(r=>r.from===state.pcs[pcIdx]?.id);
  if(!pcRels.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px">No relationships defined.</div>';}
  pcRels.forEach((rel,i)=>{
    const realIdx=(state.relationships||[]).indexOf(rel);
    const d=document.createElement('div');d.className='rel-row'+(rel.pending?' pending-field':'');
    const dispositions=['trusts','relies_on','bonded','fond','complicated','neutral','tense','distrusts'];
    d.innerHTML=`<span style="font-size:11px;color:var(--text-dim);min-width:50px">→ ${esc(rel.to)}</span>
      <select style="width:100px;font-size:11px;padding:3px" onchange="updRel(${realIdx},'disposition',this.value)">
        ${dispositions.map(d2=>`<option value="${d2}" ${rel.disposition===d2?'selected':''}>${d2}</option>`).join('')}
      </select>
      <input type="text" value="${esc(rel.dynamic||'')}" style="flex:1;min-width:80px;font-size:11px" placeholder="One-line dynamic..." onchange="updRel(${realIdx},'dynamic',this.value)">
      <label style="display:flex;align-items:center;gap:3px;font-size:10px;white-space:nowrap;cursor:pointer">
        <input type="checkbox" ${rel.aiOnly?'checked':''} onchange="updRel(${realIdx},'aiOnly',this.checked)" style="width:auto"> AI only
      </label>
      <button class="btn sm red icon-btn" onclick="remRel(${realIdx})">&times;</button>
      ${rel.pending?'<span class="pending-badge">⏳ pending</span>':''}`;
    c.appendChild(d);
  });
  const addBtn=document.createElement('button');
  addBtn.className='btn sm green';addBtn.style.marginTop='4px';addBtn.textContent='+ Add Relationship';
  addBtn.onclick=()=>addRelationship(state.pcs[pcIdx]?.id);
  c.appendChild(addBtn);
}
function addRelationship(fromId){
  if(!state.relationships)state.relationships=[];
  const targets=state.pcs.filter(p=>p.id!==fromId).map(p=>p.name);
  const target=targets[0]||'unknown';
  state.relationships.push({from:fromId,to:target,disposition:'neutral',dynamic:'',aiOnly:false,pending:false});
  save();renderSheets();
}
function updRel(i,k,v){if(state.relationships[i])state.relationships[i][k]=v;save();}
function remRel(i){state.relationships.splice(i,1);save();renderSheets();}

// ─── SPELL COMPENDIUM BROWSER ───
let _compOpen=false;
let _compClass='all';
let _compLevel='all';
let _compSearch='';

function toggleCompendium(idx){
  _compOpen=!_compOpen;
  renderSheets();
  if(_compOpen) setTimeout(()=>{const p=document.getElementById('compendium-panel-'+idx);if(p)p.scrollIntoView({behavior:'smooth',block:'start'});},50);
}
function openCompendiumFromOverview(idx){
  _compOpen=true;
  state.activeEditTab=idx;
  _pcSheetTab=3;
  closePCOverview();
  const d=document.getElementById('char-editor-details');
  if(d)d.open=true;
  openDrawer('tab-party');
  setTimeout(()=>{const p=document.getElementById('compendium-panel-'+idx);if(p)p.scrollIntoView({behavior:'smooth',block:'start'});},150);
}

function setCompFilter(idx,k,v){
  if(k==='class')_compClass=v;
  else if(k==='level')_compLevel=v;
  else if(k==='search')_compSearch=v;
  renderCompendium(idx);
}

function addFromCompendium(idx,spellName){
  const pc=state.pcs[idx];if(!pc)return;
  if(!Array.isArray(pc.spellbook))pc.spellbook=[];
  if(pc.spellbook.find(s=>s.name.toLowerCase()===spellName.toLowerCase())){toast('Already in spellbook');return;}
  const entry=SPELL_DB.find(s=>s.name===spellName);
  if(entry){
    pc.spellbook.push({name:entry.name,level:entry.level,school:entry.school,castTime:entry.castTime,range:entry.range,duration:entry.duration,components:entry.components,desc:entry.desc});
    _sortSpellbook(pc.spellbook);
    save();renderSpellbook(idx);
    toast('Added '+entry.name);
  }
}

function addManeuverToPC(idx,name){
  const pc=state.pcs[idx];if(!pc)return;
  const entry=MANEUVER_DB.find(m=>m.name===name);
  if(!entry)return;
  const existing=(pc.features||'');
  if(existing.includes(name)){toast('Already known');return;}
  pc.features=(existing?existing+'\n':'')+name+': '+entry.desc;
  save();renderSheets();
  toast('Added '+name);
}

function renderCompendium(idx){
  const c=document.getElementById('compendium-panel-'+idx);if(!c)return;
  const pc=state.pcs[idx];if(!pc)return;
  const cls=(pc.class||'').toLowerCase();
  const isBard=cls.includes('bard');
  const isWizard=cls.includes('wizard')||cls.includes('arcane trickster');
  const isFighter=cls.includes('fighter')||cls.includes('battle master');
  const known=(pc.spellbook||[]).map(s=>s.name.toLowerCase());

  let html='<div style="padding:8px;background:var(--surface);border:1px solid var(--gold-dim);border-radius:var(--radius-sm);margin-bottom:10px">';

  if(isFighter){
    html+='<div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:8px">Battle Master Maneuvers</div>';
    const knownFeats=(pc.features||'').toLowerCase();
    MANEUVER_DB.forEach(m=>{
      const has=knownFeats.includes(m.name.toLowerCase());
      html+='<details style="margin-bottom:4px;border:1px solid var(--border);border-radius:4px;background:var(--surface2);'+(has?'opacity:.5':'')+'"><summary style="padding:6px 8px;font-size:11px;display:flex;align-items:center;gap:6px;cursor:pointer">';
      html+='<span style="flex:1;color:var(--text-bright);font-weight:600">'+esc(m.name)+'</span>';
      html+=has?'<span style="font-size:9px;color:var(--green)">Known</span>':'<button class="btn sm gold" onclick="event.stopPropagation();addManeuverToPC('+idx+',MANEUVER_DB['+MANEUVER_DB.indexOf(m)+'].name)">+ Add</button>';
      html+='</summary><div style="padding:6px 8px;font-size:11px;color:var(--text);line-height:1.5;border-top:1px solid var(--border)">'+esc(m.desc)+'</div></details>';
    });
    if(!isWizard&&!isBard){html+='</div>';c.innerHTML=html;return;}
    html+='<div style="border-top:1px solid var(--gold-dim);margin:12px 0 8px"></div>';
  }

  html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">';
  html+='<span style="font-size:11px;font-weight:600;color:var(--gold)">Spell Compendium</span>';
  html+='<select style="font-size:10px;padding:2px 4px" onchange="setCompFilter('+idx+',\'class\',this.value)">';
  html+='<option value="all"'+ (_compClass==='all'?' selected':'')+'>All Classes</option>';
  html+='<option value="bard"'+(_compClass==='bard'?' selected':'')+'>Bard</option>';
  html+='<option value="wizard"'+(_compClass==='wizard'?' selected':'')+'>Wizard</option>';
  html+='</select>';
  html+='<select style="font-size:10px;padding:2px 4px" onchange="setCompFilter('+idx+',\'level\',this.value)">';
  html+='<option value="all"'+(_compLevel==='all'?' selected':'')+'>All Levels</option>';
  html+='<option value="0"'+(_compLevel==='0'?' selected':'')+'>Cantrips</option>';
  ['1st','2nd','3rd'].forEach((l,i)=>{html+='<option value="'+(i+1)+'"'+(_compLevel===String(i+1)?' selected':'')+'>'+l+' Level</option>';});
  html+='</select>';
  html+='</div>';
  html+='<input type="text" placeholder="Search spells..." value="'+esc(_compSearch)+'" oninput="setCompFilter('+idx+',\'search\',this.value)" style="font-size:11px;padding:4px 8px;margin-bottom:8px;width:100%;box-sizing:border-box">';

  let filtered=SPELL_DB;
  if(_compClass!=='all')filtered=filtered.filter(s=>s.classes.includes(_compClass));
  if(_compLevel!=='all')filtered=filtered.filter(s=>s.level===parseInt(_compLevel));
  if(_compSearch){const q=_compSearch.toLowerCase();filtered=filtered.filter(s=>s.name.toLowerCase().includes(q)||s.school.toLowerCase().includes(q));}

  const LVLS=['Cantrip','1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];
  if(!filtered.length){html+='<div style="font-size:11px;color:var(--text-dim);padding:8px">No spells match your filters.</div>';}
  else{
    const grouped={};filtered.forEach(s=>{const k=s.level;if(!grouped[k])grouped[k]=[];grouped[k].push(s);});
    Object.keys(grouped).sort((a,b)=>a-b).forEach(lv=>{
      const lvLabel=parseInt(lv)===0?'Cantrips':LVLS[parseInt(lv)]+' Level';
      html+='<div style="font-size:9px;font-weight:700;color:var(--gold-dim);text-transform:uppercase;letter-spacing:.5px;margin:8px 0 4px;border-bottom:1px solid var(--border);padding-bottom:2px">'+lvLabel+' ('+grouped[lv].length+')</div>';
      grouped[lv].forEach(sp=>{
        const has=known.includes(sp.name.toLowerCase());
        const lvTag=sp.level===0?'Cantrip':'Lvl '+sp.level;
        html+='<details style="margin-bottom:3px;border:1px solid var(--border);border-radius:4px;background:var(--surface2);'+(has?'opacity:.5':'')+'"><summary style="padding:5px 8px;font-size:11px;cursor:pointer">';
        html+='<div style="display:flex;align-items:center;gap:4px">';
        html+='<span style="flex:1;min-width:0"><span style="color:var(--text-bright);font-weight:600">'+esc(sp.name)+'</span>';
        html+=' <span style="font-size:9px;color:var(--text-dim)">'+esc(sp.school)+'</span>';
        html+=' <span style="font-size:8px;color:var(--gold);background:var(--surface3);padding:1px 4px;border-radius:3px">'+lvTag+'</span></span>';
        html+=has?'<span style="font-size:9px;color:var(--green);flex-shrink:0">In Book</span>':'<button class="btn sm gold" style="font-size:9px;flex-shrink:0" onclick="event.stopPropagation();addFromCompendium('+idx+',SPELL_DB['+SPELL_DB.indexOf(sp)+'].name)">+</button>';
        html+='</div>';
        html+='<div style="font-size:9px;color:var(--text-dim);margin-top:2px">'+esc(sp.castTime)+' · '+esc(sp.range)+' · '+esc(sp.duration)+' · '+esc(sp.components)+'</div>';
        html+='</summary><div style="padding:6px 8px;border-top:1px solid var(--border);font-size:11px;line-height:1.5">';
        html+='<div style="color:var(--text)">'+esc(sp.desc)+'</div>';
        html+='</div></details>';
      });
    });
  }
  html+='</div>';
  c.innerHTML=html;
}

// ─── SPELLBOOK ───
function setSpellFilter(f){_spellFilter=f;const idx=state.activeEditTab||0;renderSpellbook(idx);}
function renderSpellbook(idx){
  const c=document.getElementById('spellbook-panel-'+idx);if(!c)return;
  const pc=state.pcs[idx];if(!pc)return;
  c.innerHTML='';
  const book=pc.spellbook||[];
  if(!book.length){c.innerHTML='<div style="color:var(--text-dim);font-size:12px;padding:14px 0;text-align:center">No spells added yet. Tap + Add Spell above.</div>';return;}
  const LVLS=['Cantrip','1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];
  // Level filter bar
  const usedLevels=[...new Set(book.map(sp=>sp.level||0))].sort((a,b)=>a-b);
  const filterBar=document.createElement('div');filterBar.style.cssText='display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px';
  const mkFBtn=(f,label)=>{const b=document.createElement('button');const active=_spellFilter===f;b.textContent=label;b.style.cssText=`font-size:10px;padding:3px 9px;border-radius:10px;border:1px solid ${active?'var(--purple)':'var(--border)'};background:${active?'rgba(138,94,106,.25)':'none'};color:${active?'var(--purple-bright)':'var(--text-dim)'};cursor:pointer;font-family:var(--sans)`;b.onclick=()=>setSpellFilter(f);return b;};
  filterBar.appendChild(mkFBtn('all','All ('+book.length+')'));
  // Always show Cantrips tab first, then the rest of the levels
  if(!usedLevels.includes(0))filterBar.appendChild(mkFBtn('0','Cantrips'));
  usedLevels.forEach(lv=>filterBar.appendChild(mkFBtn(String(lv),lv===0?'Cantrips':(LVLS[lv]||(lv+'th')))));
  c.appendChild(filterBar);
  const visible=_spellFilter==='all'?book:book.filter(sp=>String(sp.level||0)===_spellFilter);
  if(!visible.length){const e=document.createElement('div');e.style.cssText='color:var(--text-dim);font-size:12px;padding:10px 0;text-align:center';e.textContent='No spells at this level.';c.appendChild(e);return;}
  visible.forEach((sp)=>{
    const si=book.indexOf(sp);
    const d=document.createElement('details');d.className='bs';d.style.marginBottom='7px';
    const lvlStr=sp.level===0?'Cantrip':(LVLS[sp.level]||sp.level+'th')+' Level';
    d.innerHTML=`
      <summary style="display:flex;justify-content:space-between;align-items:center;gap:6px">
        <div style="flex:1;min-width:0">
          <span style="font-weight:600;color:var(--text-bright);font-size:13px">${esc(sp.name||'Unnamed Spell')}</span>
          <span style="margin-left:7px;font-size:10px;color:var(--purple-bright);background:rgba(138,94,106,.2);border-radius:3px;padding:1px 6px;white-space:nowrap">${esc(lvlStr)}</span>
          ${sp.school?`<span style="margin-left:4px;font-size:10px;color:var(--text-dim)">${esc(sp.school)}</span>`:''}
          ${sp.castTime?`<span style="display:block;font-size:10px;color:var(--text-dim);margin-top:1px">${esc(sp.castTime)}${sp.range?' · '+esc(sp.range):''}${sp.duration?' · '+esc(sp.duration):''}</span>`:''}
        </div>
        <button class="btn sm red icon-btn" onclick="event.stopPropagation();remSpell(${idx},${si})" style="flex-shrink:0">&times;</button>
      </summary>
      <div class="bs-body">
        <div style="font-size:12px;color:${sp.desc?'var(--text)':'var(--text-dim)'};font-style:${sp.desc?'normal':'italic'};line-height:1.5;margin-bottom:10px;padding:6px 8px;background:var(--surface);border-radius:4px;white-space:pre-wrap">${sp.desc?esc(sp.desc):'No description yet'}</div>
        <div class="form-row" style="margin-bottom:8px">
          <div style="width:58px"><label class="field-label">Level</label><input type="number" min="0" max="9" value="${sp.level||0}" onchange="updSpell(${idx},${si},'level',parseInt(this.value)||0)"></div>
          <div class="fg"><label class="field-label">School</label><input type="text" value="${esc(sp.school||'')}" placeholder="Enchantment" onchange="updSpell(${idx},${si},'school',this.value)"></div>
          <div class="fg"><label class="field-label">Cast Time</label><input type="text" value="${esc(sp.castTime||'')}" placeholder="1 action" onchange="updSpell(${idx},${si},'castTime',this.value)"></div>
        </div>
        <div class="form-row" style="margin-bottom:8px">
          <div class="fg"><label class="field-label">Range</label><input type="text" value="${esc(sp.range||'')}" placeholder="30 feet" onchange="updSpell(${idx},${si},'range',this.value)"></div>
          <div class="fg"><label class="field-label">Duration</label><input type="text" value="${esc(sp.duration||'')}" placeholder="Instantaneous" onchange="updSpell(${idx},${si},'duration',this.value)"></div>
          <div class="fg"><label class="field-label">Components</label><input type="text" value="${esc(sp.components||'')}" placeholder="V, S" onchange="updSpell(${idx},${si},'components',this.value)"></div>
        </div>
        <div class="form-group"><label class="field-label">Spell Name</label><input type="text" value="${esc(sp.name||'')}" onchange="updSpell(${idx},${si},'name',this.value)"></div>
        <div class="form-group"><label class="field-label">Description &amp; Rules</label><textarea id="spell-desc-${idx}-${si}" onchange="updSpell(${idx},${si},'desc',this.value)" style="min-height:90px;font-size:13px;line-height:1.5" placeholder="Spell description, rules, and notes..."></textarea></div>
      </div>`;
    c.appendChild(d);
    const ta=d.querySelector('#spell-desc-'+idx+'-'+si);if(ta)ta.value=sp.desc||'';
  });
}
function _sortSpellbook(book){
  book.sort((a,b)=>{
    const la=parseInt(a.level)||0,lb=parseInt(b.level)||0;
    if(la!==lb)return la-lb;
    return(a.name||'').toLowerCase().localeCompare((b.name||'').toLowerCase());
  });
}
function addSpell(idx){
  if(!state.pcs[idx])return;
  if(!Array.isArray(state.pcs[idx].spellbook))state.pcs[idx].spellbook=[];
  state.pcs[idx].spellbook.push({name:'',level:1,school:'',castTime:'1 action',range:'',duration:'',components:'V, S',desc:''});
  save();_pcSheetTab=3;renderSheets();
}
function updSpell(idx,si,k,v){const sp=state.pcs[idx]?.spellbook?.[si];if(!sp)return;sp[k]=v;if(k==='level'||k==='name')_sortSpellbook(state.pcs[idx].spellbook);save();if(k==='level'||k==='name')renderSheets();}
function remSpell(idx,si){state.pcs[idx].spellbook.splice(si,1);save();renderSheets();}
function toggleSkillProf(idx,name,checked){
  const pc=state.pcs[idx];if(!pc)return;
  if(!Array.isArray(pc.skillProfs))pc.skillProfs=[];
  if(checked){if(!pc.skillProfs.includes(name))pc.skillProfs.push(name);}
  else pc.skillProfs=pc.skillProfs.filter(n=>n!==name);
  save();renderSheets();
}

// ─── FAMILIAR ───
function addFamiliar(idx){
  const pc=state.pcs[idx];if(!pc)return;
  pc.familiar={name:'',type:'',hp:1,hp_max:1,ac:10,speed:'20 ft.',
    str:3,dex:15,con:10,int:2,wis:12,cha:7,passive_perception:11,notes:''};
  save();_pcSheetTab=4;renderSheets();
}
function renderFamiliarPanel(idx){
  const c=document.getElementById('familiar-panel-'+idx);if(!c)return;
  const pc=state.pcs[idx];if(!pc||!pc.familiar)return;
  const f=pc.familiar;
  c.innerHTML=`
    <div class="form-row" style="margin-bottom:8px">
      <div class="fg"><label class="field-label">Name</label><input type="text" value="${esc(f.name||'')}" placeholder="e.g. Pip" onchange="updFamiliar(${idx},'name',this.value)"></div>
      <div class="fg"><label class="field-label">Type / Species</label><input type="text" value="${esc(f.type||'')}" placeholder="Owl, Bat, Cat..." onchange="updFamiliar(${idx},'type',this.value)"></div>
    </div>
    <div class="form-row" style="margin-bottom:10px">
      <div style="width:52px"><label class="field-label">HP</label><input type="number" value="${f.hp||1}" onchange="updFamiliar(${idx},'hp',parseInt(this.value)||1)"></div>
      <div style="width:62px"><label class="field-label">Max HP</label><input type="number" value="${f.hp_max||1}" onchange="updFamiliar(${idx},'hp_max',parseInt(this.value)||1)"></div>
      <div style="width:52px"><label class="field-label">AC</label><input type="number" value="${f.ac||10}" onchange="updFamiliar(${idx},'ac',parseInt(this.value)||10)"></div>
      <div class="fg"><label class="field-label">Speed</label><input type="text" value="${esc(f.speed||'20 ft.')}" onchange="updFamiliar(${idx},'speed',this.value)"></div>
    </div>
    <div class="stat-mini-row" style="margin-bottom:10px">
      ${['str','dex','con','int','wis','cha'].map(s=>{const n=parseInt(f[s])||10;const m=Math.floor((n-10)/2);const ms=(m>=0?'+':'')+m;return`<div style="text-align:center"><label class="field-label">${s.toUpperCase()}</label><input type="text" value="${n}" onchange="updFamiliar(${idx},'${s}',parseInt(this.value)||10)" style="text-align:center;font-size:15px;font-weight:600"><div style="font-size:13px;font-weight:700;color:var(--purple-bright);margin-top:3px">${ms}</div></div>`;}).join('')}
    </div>
    <div class="form-row" style="margin-bottom:8px">
      <div style="width:80px"><label class="field-label">Pass. Perc.</label><input type="number" value="${f.passive_perception||11}" onchange="updFamiliar(${idx},'passive_perception',parseInt(this.value)||10)"></div>
    </div>
    <div class="form-group"><label class="field-label">Special Abilities &amp; Notes</label><textarea id="familiar-notes-${idx}" onchange="updFamiliar(${idx},'notes',this.value)" style="min-height:70px"></textarea></div>
    <button class="btn sm red" style="margin-top:8px" onclick="if(confirm('Remove familiar?')){state.pcs[${idx}].familiar=null;save();renderSheets();}">🗑 Remove Familiar</button>
  `;
  const nt=c.querySelector('#familiar-notes-'+idx);if(nt)nt.value=f.notes||'';
}
function updFamiliar(idx,k,v){const f=state.pcs[idx]?.familiar;if(!f)return;f[k]=v;save();}

// ═══ CAMPAIGN SECRETS ═══
function renderCampaignSecrets(){
  const c=document.getElementById('campaign-secrets-list');if(!c)return;
  if(!Array.isArray(state.worldData.campaignSecrets))state.worldData.campaignSecrets=[];
  c.innerHTML='';
  state.worldData.campaignSecrets.forEach((s,i)=>{
    const d=document.createElement('div');d.className='secret-row'+(s.pending?' pending-field':'');
    d.innerHTML=`<div style="display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap">
      <textarea style="flex:1;min-width:160px;min-height:40px;font-size:11px" onchange="updSecret(${i},'text',this.value)">${esc(s.text||'')}</textarea>
      <div style="display:flex;flex-direction:column;gap:4px;min-width:80px">
        <label style="font-size:10px;display:flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" ${s.playerKnown?'checked':''} onchange="updSecret(${i},'playerKnown',this.checked)" style="width:auto"> Player known</label>
        <button class="btn sm red" onclick="remSecret(${i})">&times; Remove</button>
        ${s.pending?'<span class="pending-badge">⏳ pending</span>':''}
      </div>
    </div>`;
    c.appendChild(d);
  });
}
function addCampaignSecret(){if(!Array.isArray(state.worldData.campaignSecrets))state.worldData.campaignSecrets=[];state.worldData.campaignSecrets.push({text:'',playerKnown:false,pending:false});save();renderCampaignSecrets();}
function updSecret(i,k,v){state.worldData.campaignSecrets[i][k]=v;save();}
function remSecret(i){state.worldData.campaignSecrets.splice(i,1);save();renderCampaignSecrets();}

// ═══ TOWN REPUTATION ═══
function renderTownRep(){
  const c=document.getElementById('town-rep-list');if(!c)return;
  if(!Array.isArray(state.worldData.townReputation))state.worldData.townReputation=[];
  c.innerHTML='';
  if(!state.worldData.townReputation.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px">No towns visited yet.</div>';return;}
  if(state.worldData.townReputation.length>2){const bar=document.createElement('div');bar.style.cssText='display:flex;justify-content:flex-end;margin-bottom:4px';bar.innerHTML='<button onclick="dedupTownRep()" style="font-size:9px;padding:2px 8px;border-radius:4px;border:1px solid var(--border);background:none;color:var(--text-dim);cursor:pointer;font-family:var(--sans)">🧹 Dedup</button>';c.appendChild(bar);}
  state.worldData.townReputation.forEach((t,i)=>{
    const d=document.createElement('div');d.className='town-row '+(t.status||'neutral');
    const statuses=['good','neutral','burned','fled'];
    const statusColor=t.status==='good'?'var(--green)':t.status==='burned'||t.status==='fled'?'var(--red)':'var(--text-dim)';
    d.style.cssText='display:flex;flex-direction:column;gap:4px;padding:8px;border:1px solid var(--border);border-left:3px solid '+statusColor+';border-radius:4px;background:var(--surface2);margin-bottom:6px';
    d.innerHTML=`<div style="display:flex;align-items:center;gap:6px">
        <input type="text" value="${esc(t.town||'')}" style="flex:1;font-size:12px;font-weight:600" placeholder="Town name" onchange="updTown(${i},'town',this.value)">
        <select style="width:75px;font-size:10px;padding:3px;border-color:${statusColor};color:${statusColor}" onchange="updTown(${i},'status',this.value);renderTownRep()">
          ${statuses.map(s=>`<option value="${s}" ${t.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
        <button class="btn sm red icon-btn" onclick="remTown(${i})">&times;</button>
      </div>
      <input type="text" value="${esc(t.notes||'')}" style="font-size:11px;color:var(--text)" placeholder="Notes — what happened here..." onchange="updTown(${i},'notes',this.value)">`;
    c.appendChild(d);
  });
}
function addTownRep(){if(!Array.isArray(state.worldData.townReputation))state.worldData.townReputation=[];state.worldData.townReputation.push({town:'',status:'neutral',notes:'',ts:state.worldData.time});save();renderTownRep();}
function dedupTownRep(){
  const all=state.worldData.townReputation||[];if(!all.length){toast('No town rep to dedup');return;}
  const kept=[];let removed=0;
  all.forEach(t=>{
    const nLow=(t.town||'').toLowerCase().trim();
    if(!nLow){kept.push(t);return;}
    if(kept.some(k=>(k.town||'').toLowerCase().trim()===nLow))removed++;
    else kept.push(t);
  });
  if(!removed){toast('No duplicate town rep found');return;}
  state.worldData.townReputation=kept;save();renderTownRep();renderJournalRep();toast('Removed '+removed+' duplicate'+(removed===1?'':'s'));
}
function updTown(i,k,v){state.worldData.townReputation[i][k]=v;save();}
function remTown(i){state.worldData.townReputation.splice(i,1);save();renderTownRep();}

// ═══ BUSINESS PROFILE ═══
function saveBP(k,v){if(!state.worldData.businessProfile)state.worldData.businessProfile={};state.worldData.businessProfile[k]=v;save();}
function syncBP(){
  const bp=state.worldData.businessProfile||{};
  ['wagonName','realStock','snakeOil','reagents','reputation','notes'].forEach(k=>{
    const el=document.getElementById('bp_'+k);if(el&&bp[k]!==undefined)el.value=bp[k]||'';
  });
  // Keep Setup step 3 fields in sync
  const sr=document.getElementById('setup-real');if(sr)sr.value=bp.realStock||'';
  const sn=document.getElementById('setup-snake');if(sn)sn.value=bp.snakeOil||'';
}

// ═══ OX PROFILE SYNC ═══
function syncMountTitle(){}
function syncOxProfile(){renderAnimals();}
function findAnimal(name){if(!name)return null;const nl=name.trim().toLowerCase();return(state.wagon.animals||[]).find(a=>a.name.toLowerCase()===nl)||(state.wagon.animals||[]).find(a=>a.name.toLowerCase().startsWith(nl+' '))||(state.wagon.animals||[]).find(a=>a.name.toLowerCase().split(' ')[0]===nl)||null;}
function renderAnimals(){
  const c=document.getElementById('animals-list');if(!c)return;
  const animals=state.wagon.animals||[];
  if(!animals.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px">No animals. Tap + Add.</div>';return;}
  c.innerHTML='';
  animals.forEach((a,i)=>{
    const roleIcon=a.role==='draft'?'🐂':a.role==='mount'?'🐴':a.role==='familiar'?'🦉':'🐾';
    const hpPct=a.hp_max>0?Math.max(0,Math.min(100,(a.hp/a.hp_max)*100)):0;
    const hpCol=hpPct<20?'var(--red)':hpPct<50?'var(--gold)':'var(--green)';
    const det=document.createElement('details');det.className='bs';det.style.cssText='margin-bottom:6px;border:1px solid var(--border);border-radius:6px;background:var(--surface2)';
    det.innerHTML=`<summary style="list-style:none;cursor:pointer;padding:8px 10px;display:flex;align-items:center;gap:6px">
      <span>${roleIcon}</span>
      <span style="flex:1;font-weight:600;font-size:12px;color:var(--text-bright)">${esc(a.name||'Unnamed')}</span>
      <span style="font-size:10px;padding:1px 6px;border-radius:8px;background:var(--surface3);color:var(--text-dim)">${a.role||'companion'}</span>
      <span style="font-size:11px;font-weight:700;color:${hpCol};font-family:var(--mono)">${a.hp||0}/${a.hp_max||0}</span>
    </summary>
    <div style="padding:8px 10px;border-top:1px solid var(--border)">
      <div class="form-row">
        <div class="fg"><label class="field-label">Name</label><input type="text" value="${esc(a.name||'')}" onchange="updAnimal(${i},'name',this.value)" style="font-size:11px"></div>
        <div style="width:50px"><label class="field-label">HP</label><input type="number" value="${a.hp||0}" onchange="updAnimal(${i},'hp',parseInt(this.value)||0)" style="font-size:11px"></div>
        <div style="width:55px"><label class="field-label">Max</label><input type="number" value="${a.hp_max||0}" onchange="updAnimal(${i},'hp_max',parseInt(this.value)||0)" style="font-size:11px"></div>
        <div style="width:45px"><label class="field-label">AC</label><input type="number" value="${a.ac||10}" onchange="updAnimal(${i},'ac',parseInt(this.value)||10)" style="font-size:11px"></div>
      </div>
      <div class="form-row">
        <div class="fg"><label class="field-label">Type</label><input type="text" value="${esc(a.type||'')}" placeholder="ox, horse, owl..." onchange="updAnimal(${i},'type',this.value)" style="font-size:11px"></div>
        <div class="fg"><label class="field-label">Role</label><select onchange="updAnimal(${i},'role',this.value)" style="font-size:11px">
          <option value="draft"${a.role==='draft'?' selected':''}>Draft</option>
          <option value="mount"${a.role==='mount'?' selected':''}>Mount</option>
          <option value="familiar"${a.role==='familiar'?' selected':''}>Familiar</option>
          <option value="companion"${a.role==='companion'?' selected':''}>Companion</option>
        </select></div>
        <div class="fg"><label class="field-label">Conditions</label><input type="text" value="${esc(a.conditions||'')}" onchange="updAnimal(${i},'conditions',this.value)" style="font-size:11px"></div>
      </div>
      ${a.role==='draft'?`<div class="form-row"><div class="fg"><label class="field-label">Feed</label><select onchange="updAnimal(${i},'feed',this.value)" style="font-size:11px"><option value="fed"${a.feed==='fed'?' selected':''}>Fed</option><option value="hungry"${a.feed==='hungry'?' selected':''}>Hungry</option><option value="starving"${a.feed==='starving'?' selected':''}>Starving</option></select></div></div>`:''}
      <div class="form-group" style="margin-top:4px"><label class="field-label">Notes</label><textarea style="min-height:35px;font-size:11px" onchange="updAnimal(${i},'notes',this.value)">${esc(a.notes||'')}</textarea></div>
      <div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn sm red" onclick="remAnimal(${i})">Remove</button></div>
    </div>`;
    c.appendChild(det);
  });
}
function addAnimal(){
  if(!Array.isArray(state.wagon.animals))state.wagon.animals=[];
  state.wagon.animals.push({id:'animal_'+Date.now(),name:'',type:'',role:'companion',hp:1,hp_max:1,ac:10,conditions:'',feed:'',backstory:'',personality:'',notes:''});
  save();renderAnimals();
}
function updAnimal(i,k,v){const a=(state.wagon.animals||[])[i];if(!a)return;a[k]=v;save();renderAnimals();renderHUD();}
function remAnimal(i){if(!confirm('Remove this animal?'))return;state.wagon.animals.splice(i,1);save();renderAnimals();renderHUD();}

// ═══ PROVIDER STATUS MINI ═══
function updProvStatusMini(){
  const el=document.getElementById('provider-status-mini');if(!el)return;
  const key=getKey();
  if(!key){el.textContent='No key';el.style.color='var(--red)';}
  else{const m=provider==='google'?(localStorage.getItem('tt_gm')||'gemini-2.5-flash-lite'):(localStorage.getItem('tt_om')||'gemini-2.0-flash-exp');el.textContent='✓ '+m.split('/').pop();el.style.color='var(--green-bright)';}
}

function previouslyOn(){
  const key=getKey();if(!key){toast('Set an API key first.');return;}
  const questCount=(state.quests||[]).filter(q=>q.status==='active').length;
  const locCount=(state.locations||[]).length;
  const npcCount=(state.npcs||[]).filter(n=>n.status==='active').length;
  const isSparse=questCount<3||locCount<3||npcCount<3;
  const sliceN=isSparse?20:8;
  const recent=(state.chatHistory||[]).filter(m=>m.role==='assistant'||m.role==='user').slice(-sliceN);
  if(recent.length<2){toast('Not enough chat history yet.');return;}
  let sys='You are a narrator for a D&D campaign. Summarize the most recent events in exactly 2 sentences for a TV-style "Previously On…" opening. Past tense. No mechanics or stat references. Focus on dramatic or plot-relevant events. Write as if opening an episode.';
  if(isSparse){
    sys+='\n\nIMPORTANT — The campaign trackers are sparse. After your narrative recap, add a MECHANICS block to seed missing data:\n'
      +'- quest_add: <quest objective text> (for any active objectives)\n'
      +'- location_add: <name>|<type> (for named places: town, camp, dungeon, waypoint)\n'
      +'- npc_add: <name>,<disposition>,<details> (for named NPCs)\n'
      +'- town_rep: <town>,<status>,<notes> (for town attitudes)\n'
      +'Only add entries clearly referenced in the chat. Use:\n---MECHANICS---\nkey: value\n---END---';
  }
  const msgs=recent.map(m=>({role:m.role,content:String(m.content||'').slice(0,600)}));
  msgs.push({role:'user',content:'Give me the 2-sentence "Previously On…" recap.'+(isSparse?' Also audit and fill in any missing quest/location/NPC/town rep trackers.':'')});
  const typEl=document.getElementById('typing-ind');
  if(typEl)typEl.classList.add('on');
  toast(isSparse?'Generating recap + seeding trackers…':'Generating recap…');
  callAI(msgs,sys,isSparse?500:120).then(resp=>{
    if(typEl)typEl.classList.remove('on');
    if(isSparse)parseMechanics(resp);
    const displayText=resp.replace(/---MECHANICS---[\s\S]*?(?:---END---|$)/gi,'').replace(/\*{1,3}MECHANICS\*{1,3}[\s\S]*/gi,'').trim();
    state.chatHistory.push({role:'sys',content:'📺 Previously on this campaign…\n\n'+displayText,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
    save();renderChat();renderAll();scrollActiveChatBottom();
  }).catch(err=>{if(typEl)typEl.classList.remove('on');toast('Recap failed: '+err.message);});
}
function catchUpAudit(){
  const key=getKey();if(!key){toast('Set an API key first.');return;}
  const recent=(state.chatHistory||[]).filter(m=>m.role==='assistant'||m.role==='user').slice(-20);
  if(recent.length<3){toast('Not enough chat history to audit.');return;}
  const snap=[];
  snap.push('QUESTS: '+(state.quests||[]).map(q=>'['+q.status+'] '+(q.text||'').slice(0,50)).join('; '));
  snap.push('NPCs: '+(state.npcs||[]).filter(n=>n.status!=='deceased').map(n=>n.name+' ('+n.disposition+')').join(', '));
  snap.push('LOCATIONS: '+((state.locations||[]).map(l=>l.name).join(', ')||'none'));
  snap.push('TOWN REP: '+((state.worldData.townReputation||[]).map(t=>t.town+':'+t.status).join(', ')||'none'));
  snap.push('CONSEQUENCES: '+((state.consequences||[]).filter(c=>!c.resolved).map(c=>(c.text||'').slice(0,50)).join('; ')||'none'));
  const sys='You are an auditor for a D&D campaign tracker app. Compare the recent chat against the current tracker state. '
    +'Identify any GAPS — NPCs mentioned but not tracked, quests implied but not logged, locations visited but not recorded, reputation changes not noted. '
    +'For each gap, emit the appropriate mechanic. Do NOT duplicate existing entries — if something similar already exists, skip it. '
    +'ONE consequence per distinct event — do not log the same event as multiple types. '
    +'Before the mechanics block, write 1-2 sentences summarizing what you found.\n\n'
    +'TRACKER STATE:\n'+snap.join('\n')+'\n\n'
    +'Format:\n---MECHANICS---\nquest_add: <text>\nnpc_add: <name>,<disposition>,<details>\nlocation_add: <name>|<type>\ntown_rep: <town>,<status>,<notes>\nconsequence_add: <text>|<type>\n---END---';
  const msgs=recent.map(m=>({role:m.role,content:String(m.content||'').slice(0,600)}));
  msgs.push({role:'user',content:'Audit recent events against our trackers. Emit mechanics for anything missing.'});
  const typEl=document.getElementById('typing-ind');
  if(typEl)typEl.classList.add('on');
  toast('Auditing trackers…');
  callAI(msgs,sys,500).then(resp=>{
    if(typEl)typEl.classList.remove('on');
    parseMechanics(resp);
    const displayText=resp.replace(/---MECHANICS---[\s\S]*?(?:---END---|$)/gi,'').replace(/\*{1,3}MECHANICS\*{1,3}[\s\S]*/gi,'').trim();
    state.chatHistory.push({role:'sys',content:'🔍 Catch-Up Audit\n\n'+displayText,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
    save();renderChat();renderAll();scrollActiveChatBottom();
  }).catch(err=>{if(typEl)typEl.classList.remove('on');toast('Catch-up failed: '+err.message);});
}
function deepSeed(){
  const key=getKey();if(!key){toast('Set an API key first.');return;}
  const allMsgs=(state.chatHistory||[]).filter(m=>m.role==='assistant'||m.role==='user');
  if(allMsgs.length<3){toast('Not enough chat history.');return;}
  const archive=(state.sessionArchive||[]).map(e=>e.summary||'').filter(Boolean);
  const typEl=document.getElementById('typing-ind');
  if(typEl)typEl.classList.add('on');
  toast('Deep Seed: scanning campaign history…');
  const MAX_PASSES=4;
  const findings=[];
  let totalAdded=0;
  let passesRun=0;
  function trackerSnap(){
    const s=[];
    s.push('QUESTS: '+(state.quests||[]).map(q=>'['+q.status+'] '+(q.text||'').slice(0,50)).join('; '));
    s.push('NPCs: '+(state.npcs||[]).filter(n=>n.status!=='deceased').map(n=>n.name+' ('+n.disposition+')').join(', '));
    s.push('LOCATIONS: '+((state.locations||[]).map(l=>l.name).join(', ')||'none'));
    s.push('TOWN REP: '+((state.worldData.townReputation||[]).map(t=>t.town+':'+t.status).join(', ')||'none'));
    s.push('CONSEQUENCES: '+((state.consequences||[]).filter(c=>!c.resolved).map(c=>(c.text||'').slice(0,50)).join('; ')||'none'));
    return s.join('\n');
  }
  function countTrackers(){
    return (state.quests||[]).length+(state.npcs||[]).length+(state.locations||[]).length
      +(state.worldData.townReputation||[]).length+(state.consequences||[]).filter(c=>!c.resolved).length;
  }
  function buildContext(pass){
    const chunks=[];
    if(pass===0) chunks.push(...allMsgs.slice(-20));
    else if(pass===1) chunks.push(...allMsgs.slice(-50,-15));
    else if(pass===2){
      chunks.push(...allMsgs.slice(-80,-40));
      if(archive.length) chunks.push({role:'assistant',content:'[SESSION ARCHIVE]\n'+archive.slice(-2).join('\n\n')});
    }else{
      if(archive.length>2) chunks.push({role:'assistant',content:'[SESSION ARCHIVE]\n'+archive.slice(0,-2).join('\n\n')});
      else chunks.push(...allMsgs.slice(0,20));
    }
    if(!chunks.length) return null;
    return chunks.map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,600)}));
  }
  function runPass(pass){
    if(pass>=MAX_PASSES){finish();return;}
    const ctx=buildContext(pass);
    if(!ctx||!ctx.length){finish();return;}
    const snap=trackerSnap();
    const sys='You are an auditor for a D&D campaign tracker app. Compare the provided chat history against the current tracker state. '
      +'Identify any GAPS — NPCs mentioned but not tracked, quests implied but not logged, locations visited but not recorded, reputation changes not noted, consequences not tracked. '
      +'Do NOT duplicate existing entries — if a consequence, quest, NPC, or location already exists with similar meaning (even different wording), skip it. '
      +'ONE consequence per distinct event — do not log the same event as multiple types (e.g., "ritual sabotaged" is one consequence, not separate SABOTAGE + SUCCESS + EVENT). '
      +'This is pass '+(pass+1)+' of a deep scan — earlier passes already added entries shown in TRACKER STATE. '
      +'Only add genuinely NEW entries from this chat window. '
      +'Write 1 sentence summarizing what you found (or "No new entries found." if nothing is missing).\n\n'
      +'TRACKER STATE:\n'+snap+'\n\n'
      +'Format:\n---MECHANICS---\nquest_add: <text>\nnpc_add: <name>,<disposition>,<details>\nlocation_add: <name>|<type>\ntown_rep: <town>,<status>,<notes>\nconsequence_add: <text>|<type>\ntravel_note: <text>\n---END---';
    const msgs=[...ctx,{role:'user',content:'Audit this section of campaign history. Emit mechanics for anything missing from our trackers.'}];
    toast('Deep Seed: pass '+(pass+1)+'/'+MAX_PASSES+'…');
    const beforeCount=countTrackers();
    callAI(msgs,sys,500).then(resp=>{
      passesRun++;
      parseMechanics(resp);
      const afterCount=countTrackers();
      const added=afterCount-beforeCount;
      totalAdded+=added;
      const displayText=resp.replace(/---MECHANICS---[\s\S]*?(?:---END---|$)/gi,'').replace(/\*{1,3}MECHANICS\*{1,3}[\s\S]*/gi,'').trim();
      if(displayText&&!displayText.toLowerCase().includes('no new entries'))findings.push(displayText);
      if(added===0){finish();return;}
      runPass(pass+1);
    }).catch(err=>{
      toast('Deep Seed pass '+(pass+1)+' failed: '+err.message);
      finish();
    });
  }
  function finish(){
    if(typEl)typEl.classList.remove('on');
    const summary=totalAdded===0
      ?'Trackers are up to date — no gaps found. ('+passesRun+' pass'+(passesRun===1?'':'es')+' scanned)'
      :'Added '+totalAdded+' entries across '+passesRun+' pass'+(passesRun===1?'':'es')+'.'+(findings.length?'\n\n'+findings.join('\n'):'');
    state.chatHistory.push({role:'sys',content:'🌱 Deep Seed Complete\n\n'+summary,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
    save();renderChat();renderAll();scrollActiveChatBottom();
    toast(totalAdded===0?'Trackers up to date':'Deep Seed: +'+totalAdded+' entries');
  }
  runPass(0);
}
// ═══ CONTEXT-AWARE QUICK ACTIONS FAB ═══
let currentTab='tab-dm';
function toggleQAMenu(){
  const wrap=document.getElementById('qa-fab-wrap');
  if(wrap&&wrap.dataset.dragged){delete wrap.dataset.dragged;return;}
  const menu=document.getElementById('qa-menu');
  const bd=document.getElementById('qa-backdrop');
  if(!menu)return;
  const isOpen=menu.classList.contains('open');
  const fab=document.getElementById('qa-fab');
  if(isOpen){
    menu.classList.remove('open');
    if(bd)bd.style.display='none';
    if(fab){fab.textContent=state.qaFabIcon||'⚡';fab.classList.remove('is-open');}
  }else{
    renderQAMenu();
    menu.classList.add('open');
    if(bd)bd.style.display='block';
    if(fab){fab.textContent='✕';fab.classList.add('is-open');}
  }
}
function closeQAMenu(){
  const menu=document.getElementById('qa-menu');
  const bd=document.getElementById('qa-backdrop');
  if(menu)menu.classList.remove('open');
  if(bd)bd.style.display='none';
  const fab=document.getElementById('qa-fab');
  if(fab){fab.textContent=state.qaFabIcon||'⚡';fab.classList.remove('is-open');}
}
function renderQAMenu(){
  const body=document.getElementById('qa-menu-items');
  const titleEl=document.getElementById('qa-menu-title');
  if(!body)return;
  const tabLabels={'tab-party':'Party','tab-world':'World','tab-wagon':'Wagon','tab-combat':'Combat','tab-session':'Session','tab-ait':'AI Tools','tab-dm':'Quick Actions'};
  if(titleEl)titleEl.textContent=tabLabels[currentTab]||'Quick Actions';
  const actions=(state.quickActions||[]).filter(a=>(a.context||[]).includes(currentTab));
  body.innerHTML='';
  // Permanent flag card — always first regardless of context
  const flagCard=document.createElement('div');
  flagCard.className='qa-card qa-flag-card';
  flagCard.innerHTML='<span class="qa-card-icon">⚑</span><span class="qa-card-label">Flag This Moment</span>';
  flagCard.onclick=()=>{closeQAMenu();openFlagModal(-1,'');};
  body.appendChild(flagCard);
  if(!actions.length){const noActions=document.createElement('div');noActions.style.cssText='padding:20px;font-size:12px;color:var(--text-dim);text-align:center';noActions.innerHTML='No actions for this tab.<br><em style="font-size:11px">Add some in AI Tools → Quick Actions.</em>';body.appendChild(noActions);return;}
  const icons={hp:'❤️',condition_add:'⚡',condition_clear:'✨',resource_use:'🔮',item_add_foraged:'🌿',ox_feed:'🐂',time_advance:'⏰',save_game:'💾',combat_next:'▶️',log_entry:'📝',context_refresh:'🔄',town_rep:'🏘️',roll_submit:'🎲',state_fix:'🔧',resync_ai:'↺',surroundings:'🧭',short_rest:'⛺',random_event:'🎲',roleplay_npc:'🗣️',char_moment:'🎭',send_scene:'📖',context_refresh_btn:'🔄',shell_defense_toggle:'🐢',module_checkin:'📋',previously_on:'📺',custom:'⚙️'};
  const PINNED=['qa_8','qa_13','qa_11'];
  const CAT_MAP={'Party & Combat':['hp','condition_add','condition_clear','resource_use','shell_defense_toggle','combat_next','short_rest','roll_submit'],'World & Story':['time_advance','surroundings','town_rep','random_event','roleplay_npc','char_moment','send_scene','item_add_foraged','ox_feed','log_entry'],'AI & System':['context_refresh','context_refresh_btn','resync_ai','module_checkin','previously_on','deep_seed','state_fix','save_game','custom']};
  const mkCard=a=>{const d=document.createElement('div');d.className='qa-card';d.innerHTML=`<span class="qa-card-icon">${icons[a.type]||'⚙️'}</span><span class="qa-card-label">${esc(a.label)}</span>`;d.onclick=()=>{closeQAMenu();executeQA(a);};return d;};
  const mkCatLabel=lbl=>{const d=document.createElement('div');d.className='qa-cat-label';d.textContent=lbl;return d;};
  const mkGrid=items=>{const g=document.createElement('div');g.className='qa-grid';items.forEach(a=>g.appendChild(mkCard(a)));return g;};
  const pinned=actions.filter(a=>PINNED.includes(a.id));
  const unpinned=actions.filter(a=>!PINNED.includes(a.id));
  if(pinned.length){body.appendChild(mkCatLabel('⭐ Pinned'));body.appendChild(mkGrid(pinned));}
  const allCatTypes=Object.values(CAT_MAP).flat();
  Object.entries(CAT_MAP).forEach(([cat,types])=>{
    const grp=unpinned.filter(a=>types.includes(a.type));
    if(!grp.length)return;
    body.appendChild(mkCatLabel(cat));body.appendChild(mkGrid(grp));
  });
  const other=unpinned.filter(a=>!allCatTypes.includes(a.type));
  if(other.length){body.appendChild(mkCatLabel('Other'));body.appendChild(mkGrid(other));}
}
function executeQA(action){
  switch(action.type){
    case 'save_game': save();triggerChk('Save Game');break;
    case 'combat_next': nextTurn();break;
    case 'context_refresh': sendContextRefresh();break;
    case 'ox_feed': (state.wagon.animals||[]).filter(a=>a.role==='draft').forEach(a=>a.feed='fed');if(state.wagon.ox)state.wagon.ox.feed='fed';save();renderWagon();renderAnimals();toast('✓ Draft animals fed.');break;
    case 'time_advance':
      openQASheet(action.label,`
        <div class="form-group"><label class="field-label">Advance time by</label>
          <select id="qa-time-amt" style="width:100%">
            <option>1 hour</option><option>2 hours</option><option>4 hours</option>
            <option>8 hours (long rest)</option><option>1 day</option><option>custom</option>
          </select>
        </div>
        <div id="qa-time-custom" style="display:none" class="form-group"><label class="field-label">Custom amount</label><input type="text" id="qa-time-custom-val" placeholder="e.g. 30 minutes"></div>`,
        ()=>{
          const sel=document.getElementById('qa-time-amt').value;
          const custom=document.getElementById('qa-time-custom-val')?.value||'';
          const amt=sel==='custom'?custom:sel;
          state.logs.push({ts:state.worldData.time,type:'dm',body:'Time advanced: '+amt});
          save();renderLogs();toast('⏰ Time advanced: '+amt);closeQAModal();
        });
      document.getElementById('qa-time-amt')?.addEventListener('change',function(){const qtc=document.getElementById('qa-time-custom');if(qtc)qtc.style.display=this.value==='custom'?'block':'none';});
      break;
    case 'hp':
      openQASheet('Adjust HP',`
        <div class="form-group"><label class="field-label">Character</label>
          <select id="qa-hp-pc">${state.pcs.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="field-label">Amount</label><input type="number" id="qa-hp-amt" min="1" value="1"></div>
        <div class="btn-row">
          <button class="btn gold" onclick="doQAHP(true)">+ Heal</button>
          <button class="btn red" onclick="doQAHP(false)">− Damage</button>
        </div>`,null);
      break;
    case 'condition_add':
      openQASheet('Add Condition',`
        <div class="form-group"><label class="field-label">Character</label>
          <select id="qa-cond-pc">${state.pcs.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="field-label">Condition</label>
          <select id="qa-cond-val">${ALL_CONDS.map(c=>`<option>${c}</option>`).join('')}<option value="Shell Defense">Shell Defense</option></select>
        </div>`,
        ()=>{const pcId=document.getElementById('qa-cond-pc').value;const cond=document.getElementById('qa-cond-val').value;const pc=findPC(pcId);if(pc&&!pc.conditions.includes(cond)){pc.conditions.push(cond);saveRefresh();toast('✓ '+cond+' added.');}closeQAModal();});
      break;
    case 'condition_clear':
      openQASheet('Clear Conditions',`
        <div class="form-group"><label class="field-label">Character</label>
          <select id="qa-clear-pc">${state.pcs.map(p=>`<option value="${p.id}">${p.name} (${(p.conditions||[]).join(', ')||'none'})</option>`).join('')}</select>
        </div>`,
        ()=>{const pcId=document.getElementById('qa-clear-pc').value;const pc=findPC(pcId);if(pc){pc.conditions=[];saveRefresh();toast('✓ Conditions cleared.');}closeQAModal();});
      break;
    case 'resource_use':
      openQASheet('Use Resource',`
        <div class="form-group"><label class="field-label">Character</label>
          <select id="qa-res-pc" onchange="renderQAResources()">${state.pcs.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
        </div>
        <div id="qa-res-list"></div>`,null);
      setTimeout(renderQAResources,50);
      break;
    case 'item_add_foraged':
      openQASheet('Add Foraged Item',`
        <div class="form-group"><label class="field-label">Item Name</label><input type="text" id="qa-forg-name" placeholder="Wild mushrooms, herbs..."></div>
        <div class="form-row">
          <div class="fg"><label class="field-label">Quantity</label><input type="number" id="qa-forg-qty" value="1" min="1"></div>
          <div class="fg"><label class="field-label">Weight (lb)</label><input type="number" id="qa-forg-wt" value="0.1" min="0" step="0.1"></div>
        </div>
        <div class="form-group"><label class="field-label">Type</label>
          <select id="qa-forg-type"><option value="foraged">Foraged</option><option value="ingredient">Ingredient</option></select>
        </div>
        <div class="form-group"><label class="field-label">Description (optional)</label><input type="text" id="qa-forg-notes" placeholder="Found near the riverbank, slightly bitter..."></div>`,
        ()=>{
          const name=document.getElementById('qa-forg-name').value.trim();
          if(!name){toast('Enter item name.');return;}
          if(!state.wagon.cargo)state.wagon.cargo=[];
          const notes=document.getElementById('qa-forg-notes')?.value.trim()||'';
          state.wagon.cargo.push({name,qty:parseInt(document.getElementById('qa-forg-qty').value)||1,weight:parseFloat(document.getElementById('qa-forg-wt').value)||0,type:document.getElementById('qa-forg-type').value,notes,ts:state.worldData.time,location:state.worldData.location});
          saveRefresh();toast('✓ '+name+' × '+(parseInt(document.getElementById('qa-forg-qty')?.value)||1)+' added to wagon.');closeQAModal();
        });
      break;
    case 'town_rep':
      openQASheet('Update Town Reputation',`
        <div class="form-group"><label class="field-label">Town Name</label><input type="text" id="qa-town-name" placeholder="Millhaven..."></div>
        <div class="form-group"><label class="field-label">Status</label>
          <select id="qa-town-status"><option value="good">Good</option><option value="neutral" selected>Neutral</option><option value="burned">Burned</option><option value="fled">Fled</option></select>
        </div>
        <div class="form-group"><label class="field-label">Notes</label><input type="text" id="qa-town-notes" placeholder="Sold snake oil, left before market day..."></div>`,
        ()=>{
          const town=document.getElementById('qa-town-name').value;if(!town)return;
          if(!Array.isArray(state.worldData.townReputation))state.worldData.townReputation=[];
          const existing=state.worldData.townReputation.findIndex(t=>t.town.toLowerCase()===town.toLowerCase());
          const rep={town,status:document.getElementById('qa-town-status').value,notes:document.getElementById('qa-town-notes').value,ts:state.worldData.time};
          if(existing>-1)state.worldData.townReputation[existing]=rep;
          else state.worldData.townReputation.push(rep);
          saveRefresh();toast('✓ '+town+' reputation logged.');closeQAModal();
        });
      break;
    case 'log_entry':
      openQASheet('Add Log Entry',`
        <div class="form-group"><label class="field-label">Type</label>
          <select id="qa-log-type"><option value="player">Player Action</option><option value="dm">DM Narration</option><option value="combat">Combat</option><option value="loot">Loot</option><option value="rest">Rest</option></select>
        </div>
        <div class="form-group"><label class="field-label">Entry</label><textarea id="qa-log-body" style="min-height:80px"></textarea></div>`,
        ()=>{const body=document.getElementById('qa-log-body').value;if(!body)return;state.logs.push({ts:state.worldData.time,type:document.getElementById('qa-log-type').value,body});saveRefresh();toast('✓ Log entry added.');closeQAModal();});
      break;
    case 'roll_submit': openRollSheet(); break;
    case 'surroundings': qa('Describe our current surroundings in detail. What do we see, hear, smell? What are our immediate options?'); break;
    case 'short_rest': qa('We take a Short Rest of 1 hour. What happens? Apply all short rest recovery. Roll Hit Dice if we choose to spend them.'); break;
    case 'random_event': qa('Enforce a random obstacle, complication, or opportunity based on our current location and situation.'); break;
    case 'roleplay_npc': qaNPC(); break;
    case 'char_moment': qaMotive(); break;
    case 'send_scene': sendSceneToDM(); break;
    case 'context_refresh_btn': sendContextRefresh(); break;
    case 'module_checkin': qa('Check the Campaign Progress tracker. Confirm which episode we\'re currently on, what\'s been completed, and what the next key objective is. Update any episode statuses that need changing via module_episode: mechanic.'); break;
    case 'previously_on': previouslyOn(); break;
    case 'catch_up': catchUpAudit(); break;
    case 'deep_seed': deepSeed(); break;
    case 'shell_defense_toggle':{
      const shellPC=state.pcs.find(p=>(p.race||'').toLowerCase().includes('tortle'))||state.pcs.find(p=>(p.features||'').toLowerCase().includes('shell defense'));
      if(!shellPC){toast('No Tortle PC found for Shell Defense.');break;}
      const inShell=shellPC.conditions.includes('Shell Defense');
      if(inShell){['Shell Defense','Prone','Incapacitated'].forEach(c=>{const i=shellPC.conditions.indexOf(c);if(i>-1)shellPC.conditions.splice(i,1);});}
      else{['Shell Defense','Prone','Incapacitated'].forEach(c=>{if(!shellPC.conditions.includes(c))shellPC.conditions.push(c);});}
      saveRefresh();toast(inShell?'🐢 '+(shellPC.name||'Tortle')+' emerged from shell (conditions cleared)':'🛡 '+(shellPC.name||'Tortle')+' entered Shell Defense (AC 21, Prone, Incapacitated)');
      break;}
    case 'state_fix': openStateFix(); break;
    case 'resync_ai': resyncAI(); break;
    default:
      // Custom action
      openQASheet(action.label,`<div class="form-group"><label class="field-label">Mechanics Command</label><textarea id="qa-custom-cmd" style="min-height:60px;font-family:var(--mono)">${esc(action.params?.cmd||'')}</textarea><div style="font-size:10px;color:var(--text-dim);margin-top:4px">Will be parsed as a mechanics block command.</div></div>`,
        ()=>{const cmd=document.getElementById('qa-custom-cmd').value;if(cmd){parseMechanics('---MECHANICS---\n'+cmd+'\n---END---');renderAll();}closeQAModal();});
  }
}
function doQAHP(isHeal){
  const pcId=document.getElementById('qa-hp-pc').value;
  const amt=parseInt(document.getElementById('qa-hp-amt').value)||0;
  const pc=findPC(pcId);if(!pc)return;
  pc.hp=isHeal?Math.min(pc.hp_max,pc.hp+amt):Math.max(0,pc.hp-amt);
  pc.hp=Math.max(0,Math.min(pc.hp_max,pc.hp)); // always clamp
  if(!isHeal&&pc.hp===0&&document.getElementById('auto-down')?.checked)triggerChk('PC Down: '+pc.name);
  saveRefresh();toast((isHeal?'💚 Healed ':'💔 Damaged ')+pc.name+' by '+amt);closeQAModal();
}
function renderQAResources(){
  const c=document.getElementById('qa-res-list');if(!c)return;
  const pcId=document.getElementById('qa-res-pc')?.value;
  const pc=findPC(pcId);if(!pc){c.innerHTML='';return;}
  if(!(pc.resources||[]).length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px">No trackable resources.</div>';return;}
  c.innerHTML=pc.resources.map((res,ri)=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-size:12px;font-weight:bold">${esc(res.name)}</div>
        <div style="font-size:10px;color:var(--text-dim)">${res.max-res.used}/${res.max} remaining</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn sm red" onclick="useResource(${state.pcs.indexOf(pc)},${ri},${res.used})" ${res.used>=res.max?'disabled':''}>Use 1</button>
        <button class="btn sm green" onclick="useResource(${state.pcs.indexOf(pc)},${ri},${res.used-1})" ${res.used<=0?'disabled':''}>Restore 1</button>
      </div>
    </div>`).join('');
}
function openQASheet(title,bodyHtml,onConfirm){
  document.getElementById('qa-sheet-title').textContent=title;
  document.getElementById('qa-sheet-content').innerHTML=bodyHtml;
  const acts=document.getElementById('qa-sheet-actions');
  acts.innerHTML='';
  if(onConfirm){const btn=document.createElement('button');btn.className='btn gold full';btn.textContent='✓ Confirm';btn.onclick=onConfirm;acts.appendChild(btn);}
  const cancel=document.createElement('button');cancel.className='btn full';cancel.textContent='Cancel';cancel.onclick=closeQAModal;acts.appendChild(cancel);
  document.getElementById('qa-modal').classList.add('open');
}
function closeQAModal(){document.getElementById('qa-modal').classList.remove('open');}

// ═══ QUICK ACTIONS EDITOR (in AI Tools tab) ═══
function renderQAEditor(){
  const c=document.getElementById('qa-editor-list');if(!c)return;
  const fabInp=document.getElementById('qa-fab-icon-input');
  if(fabInp)fabInp.value=state.qaFabIcon||'⚡';
  c.innerHTML='';
  if(!(state.quickActions||[]).length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px">No quick actions defined.</div>';return;}
  const tabLabels={'tab-party':'Party','tab-world':'Journal','tab-wagon':'Cargo','tab-combat':'Combat','tab-session':'Session','tab-ait':'AI Tools','tab-dm':'AI DM'};
  const typeLabels={hp:'Adjust HP',condition_add:'Add Condition',condition_clear:'Clear Conditions',resource_use:'Use Resource',item_add_foraged:'Add Foraged Item',ox_feed:'Feed Grit',time_advance:'Advance Time',save_game:'Save Game',combat_next:'Next Turn',log_entry:'Add Log Entry',context_refresh:'Context Refresh',context_refresh_btn:'Context Refresh',town_rep:'Town Reputation',roll_submit:'Open Roller',surroundings:'Describe Surroundings',short_rest:'Short Rest',random_event:'Random Event',roleplay_npc:'Roleplay NPC',char_moment:'Character Moment',send_scene:'Send Scene',module_checkin:'Module Check-in',previously_on:'Previously On',catch_up:'Catch Up Audit',deep_seed:'Deep Seed',shell_defense_toggle:'Shell Defense',state_fix:'State Fix',resync_ai:'Re-sync AI',custom:'Custom Command'};
  const typeGroups=[
    {label:'Combat',types:['hp','condition_add','condition_clear','combat_next','shell_defense_toggle','roll_submit']},
    {label:'AI',types:['context_refresh','resync_ai','surroundings','random_event','roleplay_npc','char_moment','send_scene','previously_on','catch_up','deep_seed','module_checkin']},
    {label:'Utility',types:['save_game','time_advance','log_entry','resource_use','item_add_foraged','ox_feed','town_rep','short_rest','state_fix','custom']}
  ];
  const contexts=Object.keys(tabLabels);
  state.quickActions.forEach((action,i)=>{
    const d=document.createElement('div');
    d.style.cssText='margin-bottom:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:4px';
    const typeOptions=typeGroups.map(g=>`<optgroup label="${g.label}">${g.types.map(t=>`<option value="${t}" ${action.type===t?'selected':''}>${typeLabels[t]||t}</option>`).join('')}</optgroup>`).join('');
    const activeCount=(action.context||[]).length;
    const tabSummary=activeCount===contexts.length?'All tabs':activeCount===0?'No tabs':activeCount+' tab'+(activeCount>1?'s':'');
    const tabId='qa-tabs-'+i;
    d.innerHTML=`<div style="display:flex;gap:6px;align-items:center">
        <input type="text" value="${esc(action.label)}" style="flex:1;font-size:12px;font-weight:600;min-width:0" placeholder="Label" onchange="updQA(${i},'label',this.value)">
        <select style="flex:1;font-size:10px;padding:3px;min-width:0" onchange="updQA(${i},'type',this.value)">${typeOptions}</select>
        <span onclick="var el=document.getElementById('${tabId}');el.style.display=el.style.display==='flex'?'none':'flex'" style="font-size:9px;color:var(--text-dim);cursor:pointer;white-space:nowrap;border:1px solid var(--border);border-radius:3px;padding:2px 5px">${tabSummary}</span>
        <button class="btn sm red icon-btn" onclick="remQA(${i})" style="flex-shrink:0;padding:0 6px">&times;</button>
      </div>
      <div id="${tabId}" style="display:none;flex-wrap:wrap;gap:3px;margin-top:5px">${contexts.map(ctx=>`<label style="display:inline-flex;align-items:center;gap:2px;font-size:9px;cursor:pointer;background:${(action.context||[]).includes(ctx)?'var(--gold-dim)':'var(--surface3)'};border:1px solid var(--border);border-radius:3px;padding:1px 5px"><input type="checkbox" ${(action.context||[]).includes(ctx)?'checked':''} onchange="toggleQAContext(${i},'${ctx}',this.checked);renderQAEditor()" style="width:auto;margin:0">${tabLabels[ctx]}</label>`).join('')}</div>`;
    c.appendChild(d);
  });
}
function addQA(){if(!state.quickActions)state.quickActions=[];state.quickActions.push({id:'qa_'+Date.now(),label:'New Action',type:'custom',params:{},context:['tab-party']});save();renderQAEditor();}
function updQA(i,k,v){if(state.quickActions[i])state.quickActions[i][k]=v;save();}
function toggleQAContext(i,ctx,checked){
  const qa=state.quickActions[i];if(!qa)return;
  if(!Array.isArray(qa.context))qa.context=[];
  if(checked){if(!qa.context.includes(ctx))qa.context.push(ctx);}
  else{qa.context=qa.context.filter(c=>c!==ctx);}
  save();
}
function remQA(i){state.quickActions.splice(i,1);save();renderQAEditor();}
function updQAFabIcon(val){
  state.qaFabIcon=val.trim()||'⚡';
  save();
  const fab=document.getElementById('qa-fab');
  if(fab&&!fab.classList.contains('is-open'))fab.textContent=state.qaFabIcon;
  const inp=document.getElementById('qa-fab-icon-input');
  if(inp)inp.value=state.qaFabIcon;
}
function pickQAFabIcon(icon){updQAFabIcon(icon);}

// ═══ LEDGER ADDITIONS — business profile, town rep, relationships ═══

// ═══ JUST SAVE ═══
function justSave(){
  save();
  toast('✓ Game saved.');
}

// ═══ QUICK STATE FIX — mid-session correction ═══
function openStateFix(){
  openQASheet('🔧 Fix Missing State',`
    <p style="font-size:11px;color:var(--text-dim);margin-bottom:10px">Something didn't save from chat? Add it manually here.</p>
    <div class="form-group"><label class="field-label">What to fix</label>
      <select id="sf-type" onchange="updateStateFixForm()" style="font-size:13px">
        <option value="item">Add Item to Inventory</option>
        <option value="npc">Add/Update NPC</option>
        <option value="hp">Fix HP</option>
        <option value="condition">Add/Remove Condition</option>
        <option value="location">Update Location</option>
        <option value="gp">Update Gold</option>
        <option value="note">Add to Story Thread</option>
      </select>
    </div>
    <div id="sf-form"></div>`,
    ()=>{applyStateFix();});
  setTimeout(updateStateFixForm,50);
}
function updateStateFixForm(){
  const type=document.getElementById('sf-type')?.value;
  const c=document.getElementById('sf-form');
  if(!c)return;
  const pcOpts=state.pcs.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
  const forms={
    item:`<div class="form-group"><label class="field-label">Who gets it</label>
      <select id="sf-pc">${pcOpts}<option value="wagon">Wagon Cargo</option><option value="party">Party (shared)</option><option value="hoard">Party Hoard</option></select></div>
      <div class="form-group"><label class="field-label">Item Name</label><input type="text" id="sf-name" placeholder="Silver-Leaf Seaweed..."></div>
      <div class="form-row"><div class="fg"><label class="field-label">Qty</label><input type="number" id="sf-qty" value="1" min="1"></div>
      <div class="fg"><label class="field-label">Type</label><select id="sf-itype"><option>foraged</option><option>supply</option><option>loot</option><option>key</option><option>trade</option><option>misc</option></select></div></div>`,
    npc:`<div class="form-group"><label class="field-label">NPC Name</label><input type="text" id="sf-npc-name" placeholder="Vane..."></div>
      <div class="form-group"><label class="field-label">Disposition</label>
      <select id="sf-npc-disp"><option>friendly</option><option>neutral</option><option>suspicious</option><option>hostile</option></select></div>
      <div class="form-group"><label class="field-label">Details / Notes</label><input type="text" id="sf-npc-detail" placeholder="Northern merchant guild, deals in antiquities..."></div>`,
    hp:`<div class="form-group"><label class="field-label">Character</label><select id="sf-pc">${pcOpts}</select></div>
      <div class="form-group"><label class="field-label">Set HP to</label><input type="number" id="sf-hp" value="10" min="0"></div>`,
    condition:`<div class="form-group"><label class="field-label">Character</label><select id="sf-pc">${pcOpts}</select></div>
      <div class="form-group"><label class="field-label">Condition</label><input type="text" id="sf-cond" placeholder="Poisoned, Prone..."></div>
      <div style="display:flex;gap:8px"><button class="btn gold" onclick="doStateFix('cond_add')">+ Add</button><button class="btn red" onclick="doStateFix('cond_rem')">− Remove</button></div>`,
    location:`<div class="form-group"><label class="field-label">New Location</label><input type="text" id="sf-loc" value="${esc(state.worldData.location)}"></div>
      <div class="form-group"><label class="field-label">Time</label><input type="text" id="sf-time" value="${esc(state.worldData.time)}"></div>`,
    gp:`<div class="form-group"><label class="field-label">Amount</label><input type="text" id="sf-gp" placeholder="+10 or -5 or 42"></div>`,
    note:`<div class="form-group"><label class="field-label">Add to Story Thread</label><textarea id="sf-note" style="min-height:80px" placeholder="Temple Token received. Contact Vane established..."></textarea></div>`
  };
  c.innerHTML=forms[type]||'';
}
function applyStateFix(){
  const type=document.getElementById('sf-type')?.value;
  const ts=state.worldData.time;
  const loc=state.worldData.location;
  switch(type){
    case 'item':{
      const tgt=document.getElementById('sf-pc')?.value;
      const nm=document.getElementById('sf-name')?.value;
      const qty=parseInt(document.getElementById('sf-qty')?.value)||1;
      const itype=document.getElementById('sf-itype')?.value||'misc';
      if(!nm){toast('Enter item name.');return;}
      const item={name:nm,qty,weight:0,type:itype,notes:'',ts,location:loc};
      if(tgt==='wagon'||tgt==='cargo'){state.wagon.cargo.push(item);}
      else if(tgt==='party'){state.partyInventory.push(item);}
      else if(tgt==='hoard'){state.wagon.hoard.push(item);}
      else if(tgt==='forage'){state.wagon.cargo.push({...item,type:'foraged'});}
      else{const pc=findPC(tgt);if(pc){if(!pc.inventory)pc.inventory=[];pc.inventory.push(item);}}
      saveRefresh();toast('✓ Added: '+nm);break;}
    case 'npc':{
      const nm=document.getElementById('sf-npc-name')?.value;
      const disp=document.getElementById('sf-npc-disp')?.value;
      const detail=document.getElementById('sf-npc-detail')?.value;
      if(!nm){toast('Enter NPC name.');return;}
      if(!state.npcs)state.npcs=[];
      const existing=state.npcs.findIndex(n=>n.name.toLowerCase()===nm.toLowerCase());
      const npc={name:nm,disposition:disp,details:detail,status:'active',lastSeen:loc};
      if(existing>-1)state.npcs[existing]=npc;
      else state.npcs.push(npc);
      saveRefresh();toast('✓ NPC logged: '+nm);break;}
    case 'hp':{
      const pc=findPC(document.getElementById('sf-pc')?.value);
      const hp=parseInt(document.getElementById('sf-hp')?.value)||0;
      if(pc){pc.hp=Math.max(0,Math.min(pc.hp_max,hp));saveRefresh();toast('✓ '+pc.name+' HP set to '+pc.hp);}break;}
    case 'location':{
      const loc2=document.getElementById('sf-loc')?.value;
      const time2=document.getElementById('sf-time')?.value;
      if(loc2)state.worldData.location=loc2;
      if(time2)state.worldData.time=time2;
      saveRefresh();toast('✓ Location updated');break;}
    case 'gp':{
      const raw=document.getElementById('sf-gp')?.value||'0';
      const td=state.treasuryData;
      if(raw.startsWith('+')||raw.startsWith('-'))td.gp=(parseFloat(td.gp)||0)+parseFloat(raw);
      else td.gp=parseFloat(raw)||0;
      saveRefresh();toast('✓ GP updated: '+td.gp);break;}
    case 'note':{
      const note=document.getElementById('sf-note')?.value;
      if(note){
        if(!Array.isArray(state.storyChapters))state.storyChapters=[];
        const fieldNotes=state.storyChapters.find(c=>c.title==='Field Notes');
        if(fieldNotes){fieldNotes.content+='\n- '+note;}
        else{state.storyChapters.push({id:Date.now(),title:'Field Notes',content:'- '+note,date:state.worldData?.time||''});}
        saveRefresh();toast('✓ Added to Field Notes');}break;}
  }
  closeQAModal();
}
function doStateFix(action){
  const pc=findPC(document.getElementById('sf-pc')?.value);
  const cond=document.getElementById('sf-cond')?.value;
  if(!pc||!cond)return;
  if(action==='cond_add'){if(!pc.conditions.includes(cond))pc.conditions.push(cond);}
  else{pc.conditions=pc.conditions.filter(c=>c!==cond);}
  saveRefresh();toast('✓ Condition updated');closeQAModal();
}

// ═══ RESYNC AI — send full state to AI ═══
function switchUser(){
  localStorage.removeItem('tt_pname');
  localStorage.removeItem('tt_pchar');
  playerName='';playerChar='';
  updatePlayerLbl();
  closeHeaderMenu();
  setTimeout(function(){
    populateSetup();
    var nameEl=document.getElementById('setup-name');
    var charEl=document.getElementById('setup-character');
    if(nameEl)nameEl.value='';
    if(charEl)charEl.value='';
    openModal('setup-modal');
    toast('Choose your character.');
  },150);
}

function rollInitiativeToChat(){
  var rolls=state.pcs.map(function(pc){
    var dexStr=pc.dex||'0';var dexMatch=dexStr.match(/([+-]?\d+)\)$/);
    var dex=dexMatch?parseInt(dexMatch[1]):0;
    var roll=Math.floor(Math.random()*20)+1;
    var total=roll+dex;
    return {name:pc.name,roll:roll,dex:dex,total:total};
  });
  rolls.sort(function(a,b){return b.total-a.total||b.dex-a.dex;});
  var orderText=rolls.map(function(r,i){return (i+1)+'. '+r.name+': '+r.total+' (d20['+r.roll+']+'+r.dex+')';}).join('\n');
  var msg='\u2694 INITIATIVE ORDER\n'+orderText+'\n\nWaiting for actions in this order.';
  var ts=state.worldData.time;
  state.chatHistory.push({role:'system',content:msg,ts:ts,isInitiative:true});
  state.combat.list=rolls.map(function(r){
    var pc=state.pcs.find(function(p){return p.name===r.name;});
    return {name:r.name,val:r.total,hp:pc?pc.hp:10,ac:pc?pc.ac:10,isPC:true,conditions:[],concentrating:''};
  });
  state.combat.active=true;state.combat.round=1;state.combat.currentIdx=0;
  saveRefresh();
  toast('\u2694 Initiative rolled — order posted to chat');
}

function resyncAI(){
  genLedger();
  const ledger=document.getElementById('ledger-out')?.value||'';
  _ctxInject='[FULL STATE RESYNC — read everything below before responding]\n'+ledger;
  const inp=document.getElementById('chat-input');
  if(inp)inp.value='[STATE RESYNC] Confirm in one sentence: current location, all PC HP values, and what the party is doing right now.';
  sendMsg();
  showTab('tab-dm');
}

// ═══ HEADER MENU ═══
function toggleHeaderMenu(){
  const m=document.getElementById('header-menu');
  if(!m)return;
  if(m.style.display==='none'||!m.style.display){
    const hdr=document.querySelector('.app-header')||document.querySelector('header');
    if(hdr){const r=hdr.getBoundingClientRect();m.style.top=r.bottom+'px';}
    m.style.display='block';
    _hdrEditMode=false;
    const eb=document.getElementById('hdr-edit-btn');if(eb)eb.textContent='✎';
    renderHeaderShortcuts();
  } else {
    m.style.display='none';
  }
}
function closeHeaderMenu(){
  const m=document.getElementById('header-menu');
  if(m)m.style.display='none';
}
const HEADER_SC_REG=[
  {id:'combat',icon:'⚔',label:'Combat'},
  {id:'session',icon:'📋',label:'Session'},
  {id:'ai-tools',icon:'🔮',label:'AI Tools'},
  {id:'roll',icon:'🎲',label:'Roll'},
  {id:'dev',icon:'🛠',label:'Dev'},
  {id:'setup',icon:'⚙',label:'Setup'},
  {id:'locations',icon:'📍',label:'Locations'},
  {id:'verify',icon:'🔍',label:'Verify AI'},
  {id:'prev-on',icon:'📺',label:'Previously'},
  {id:'refresh',icon:'🔄',label:'Refresh'},
  {id:'checkpoint',icon:'⚡',label:'Checkpoint'},
  {id:'switch',icon:'👤',label:'Switch Player'},
  {id:'world',icon:'🌍',label:'World'},
  {id:'wagon',icon:'📦',label:'Wagon'},
  {id:'archive',icon:'📔',label:'Archive'},
  {id:'export',icon:'📤',label:'Export'},
];
const HEADER_SC_DEFAULT=['combat','session','ai-tools','roll','dev','setup'];
function execHeaderSC(id){
  closeHeaderMenu();
  switch(id){
    case 'combat':showTab('tab-combat');break;
    case 'session':showTab('tab-session');break;
    case 'ai-tools':showTab('tab-ait');break;
    case 'roll':openRollSheet();break;
    case 'dev':showTab('tab-dev');break;
    case 'setup':showTab('tab-setup');break;
    case 'locations':openDrawer('tab-world');setTimeout(()=>showWorldTab('locations'),50);break;
    case 'verify':verifyContracts();break;
    case 'prev-on':previouslyOn();break;
    case 'catchup':case 'catch-up':catchUpAudit();break;
    case 'deepseed':case 'deep-seed':case 'seed':deepSeed();break;
    case 'refresh':sendContextRefresh();break;
    case 'checkpoint':triggerChk('Manual');break;
    case 'switch':switchUser();break;
    case 'world':openDrawer('tab-world');break;
    case 'wagon':openDrawer('tab-wagon');break;
    case 'archive':showTab('tab-session');showSessionMode('prep');break;
    case 'export':exportConfig();break;
  }
}
function renderHeaderShortcuts(){
  const el=document.getElementById('hdr-shortcuts-grid');if(!el)return;
  const ids=Array.isArray(state.headerShortcuts)&&state.headerShortcuts.length?state.headerShortcuts:HEADER_SC_DEFAULT;
  el.innerHTML='';
  ids.forEach(id=>{
    const sc=HEADER_SC_REG.find(s=>s.id===id);if(!sc)return;
    const btn=document.createElement('button');
    btn.className='btn';
    btn.textContent=sc.icon+' '+sc.label;
    btn.onclick=()=>execHeaderSC(id);
    el.appendChild(btn);
  });
}
let _hdrEditMode=false;
function toggleHeaderEdit(){
  _hdrEditMode=!_hdrEditMode;
  const el=document.getElementById('hdr-shortcuts-grid');if(!el)return;
  const editBtn=document.getElementById('hdr-edit-btn');
  if(_hdrEditMode){
    if(editBtn)editBtn.textContent='Done';
    const ids=Array.isArray(state.headerShortcuts)&&state.headerShortcuts.length?[...state.headerShortcuts]:[...HEADER_SC_DEFAULT];
    el.innerHTML='';
    HEADER_SC_REG.forEach(sc=>{
      const active=ids.includes(sc.id);
      const btn=document.createElement('button');
      btn.className='btn';
      btn.style.cssText=active?'border-color:var(--gold);color:var(--gold-bright)':'opacity:.45';
      btn.textContent=sc.icon+' '+sc.label;
      btn.onclick=()=>{
        const cur=Array.isArray(state.headerShortcuts)&&state.headerShortcuts.length?[...state.headerShortcuts]:[...HEADER_SC_DEFAULT];
        const idx=cur.indexOf(sc.id);
        if(idx>-1)cur.splice(idx,1); else cur.push(sc.id);
        state.headerShortcuts=cur;save();
        toggleHeaderEdit();toggleHeaderEdit();
      };
      el.appendChild(btn);
    });
  } else {
    if(editBtn)editBtn.textContent='✎';
    renderHeaderShortcuts();
  }
}
// Close header menu when tapping outside
document.addEventListener('click',e=>{
  const menu=document.getElementById('header-menu');
  const btn=document.getElementById('hdr-menu-btn');
  if(menu&&menu.style.display==='block'&&!menu.contains(e.target)&&e.target!==btn&&!btn?.contains(e.target)){
    menu.style.display='none';
  }
  // Close tab overflow menu when tapping outside
  const om=document.getElementById('tab-overflow-menu');
  const ob=document.getElementById('tab-overflow-btn');
  if(om&&om.style.display==='block'&&!om.contains(e.target)&&e.target!==ob&&!ob?.contains(e.target)){
    om.style.display='none';
  }
});
function toggleTabOverflow(){
  const m=document.getElementById('tab-overflow-menu');
  if(!m)return;
  if(m.style.display==='block'){m.style.display='none';return;}
  const btn=document.getElementById('tab-overflow-btn');
  if(btn){const r=btn.getBoundingClientRect();m.style.top=r.bottom+'px';m.style.right=(window.innerWidth-r.right)+'px';}
  m.style.display='block';
}
function closeTabOverflow(){const m=document.getElementById('tab-overflow-menu');if(m)m.style.display='none';}

// ═══ ERROR FLAGS ═══
let _flagMsgIdx=-1;
let _flagSelectedCat='';
let _flagSectionCtx='';
let _flagUICtx='';

function _buildFlagUIContext(){
  const TAB_NAMES={'tab-party':'Party','tab-world':'World','tab-wagon':'Wagon','tab-combat':'Combat','tab-session':'Session','tab-ait':'AI Tools','tab-dm':'AI DM','tab-dev':'Dev','tab-setup':'Setup'};
  const tab=typeof currentTab!=='undefined'?currentTab:'';
  let label=TAB_NAMES[tab]||tab||'Unknown';
  if(tab==='tab-dm'){
    const ch=typeof _activeTab!=='undefined'?_activeTab:'narrative';
    label+=' → '+({narrative:'Narrative',ooc:'Rules',party:'OOC chat'}[ch]||ch);
  } else if(tab==='tab-world'){
    const ops=document.getElementById('world-ops-panel');
    label+=' → '+(ops&&ops.style.display!=='none'?'Operations':'World State');
  } else if(tab==='tab-session'){
    const mod=document.getElementById('sess-module-panel');
    const prep=document.getElementById('sess-prep-panel');
    if(mod&&mod.style.display!=='none')label+=' → Module';
    else if(prep&&prep.style.display!=='none')label+=' → Between Sessions';
    else label+=' → During Session';
  }
  return label;
}

function openFlagModal(msgIdx,sectionCtx){
  _flagMsgIdx=msgIdx;
  _flagSelectedCat='';
  _flagSectionCtx=sectionCtx||'';
  _flagUICtx=_buildFlagUIContext();
  document.querySelectorAll('.flag-cat-btn').forEach(b=>b.classList.remove('selected'));
  const noteEl=document.getElementById('flag-note');
  if(noteEl)noteEl.value='';
  const ctx=document.getElementById('flag-context-display');
  if(ctx){
    const loc=state.worldData?.location||'Unknown location';
    const time=state.worldData?.time||'';
    const inCombat=state.combat?.active;
    let html='<strong>Where:</strong> '+esc(_flagUICtx);
    if(sectionCtx)html+=' · <em>'+esc(sectionCtx)+'</em>';
    html+='<br><strong>Location:</strong> '+esc(loc)+(time?' &nbsp;·&nbsp; <strong>Time:</strong> '+esc(time):'');
    if(inCombat)html+=' &nbsp;·&nbsp; <strong>Combat:</strong> Round '+esc(String(state.combat.round||1));
    if(msgIdx>=0&&state.chatHistory[msgIdx]){
      const snippet=(state.chatHistory[msgIdx].content||'').slice(0,200);
      html+='<br><br><strong>Flagged message:</strong><br><em style="color:var(--text)">'+esc(snippet)+(snippet.length>=200?'…':'')+'</em>';
    }
    ctx.innerHTML=html;
    ctx.style.display='block';
  }
  document.getElementById('flag-modal').classList.add('open');
}

function closeFlagModal(){
  document.getElementById('flag-modal').classList.remove('open');
}

function selectFlagCat(btn){
  document.querySelectorAll('.flag-cat-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  _flagSelectedCat=btn.dataset.cat||'other';
}

function submitFlag(){
  if(!_flagSelectedCat){toast('Tap a category first.');return;}
  if(!state.errorLog)state.errorLog=[];
  const note=document.getElementById('flag-note')?.value.trim()||'';
  const msgContent=_flagMsgIdx>=0?(state.chatHistory[_flagMsgIdx]?.content||''):(_flagSectionCtx?'['+_flagSectionCtx+']':'');
  const flag={
    id:'err_'+Date.now(),
    gameTs:state.worldData?.time||'',
    realTs:new Date().toISOString(),
    tab:typeof currentTab!=='undefined'?currentTab:'',
    uiCtx:_flagUICtx||'',
    location:state.worldData?.location||'',
    sectionCtx:_flagSectionCtx||'',
    category:_flagSelectedCat,
    note:note,
    msgContent:msgContent.slice(0,600),
    combatActive:!!(state.combat?.active),
    combatRound:state.combat?.round||null,
    verdict:null,
    aiVerdict:'',
    resolved:false
  };
  state.errorLog.push(flag);
  save();
  renderErrorLog();
  closeFlagModal();
  toast('⚑ Flagged.');
}

const FLAG_CATS={
  roll:{icon:'🎲',label:'Wrong Roll / Math'},
  rule:{icon:'📜',label:'Wrong Rule'},
  ai:{icon:'🤖',label:'AI Made It Up'},
  story:{icon:'📖',label:'Story Error'},
  infra:{icon:'🔧',label:'App Issue'},
  idea:{icon:'💡',label:'Idea / Feature'},
  other:{icon:'❓',label:'Something Felt Off'}
};
let _flagCatFilter='all';

function setFlagVerdict(id,verdict){
  const f=(state.errorLog||[]).find(f=>f.id===id);
  if(!f)return;
  f.verdict=f.verdict===verdict?null:verdict;
  save();renderErrorLog();
}

function resolveFlag(id){
  const f=(state.errorLog||[]).find(f=>f.id===id);
  if(!f)return;
  f.resolved=true;
  save();renderErrorLog();
}
function deleteFlag(id){
  if(!confirm('Delete this flag permanently?'))return;
  state.errorLog=(state.errorLog||[]).filter(f=>f.id!==id);
  save();renderErrorLog();
}
function editFlagNote(id){
  const f=(state.errorLog||[]).find(f=>f.id===id);if(!f)return;
  const card=document.getElementById('flag-'+id);if(!card)return;
  if(card.querySelector('.flag-note-edit'))return;
  const editEl='<div class="flag-note-edit" style="margin-top:6px">'+
    '<textarea id="fne-'+id+'" style="width:100%;min-height:60px;font-size:12px;margin:0" placeholder="Add a note...">'+(f.note||'')+'</textarea>'+
    '<div style="display:flex;gap:6px;margin-top:4px">'+
      '<button class="btn sm green" onclick="saveEditedNote(\''+id+'\')">Save</button>'+
      '<button class="btn sm" onclick="renderErrorLog()">Cancel</button>'+
      (f.note?'<button class="btn sm red" style="margin-left:auto" onclick="clearFlagNote(\''+id+'\')">Clear Note</button>':'')+
    '</div></div>';
  const actRow=card.querySelector('[data-flag-actions]');
  if(actRow)actRow.insertAdjacentHTML('beforebegin',editEl);
  else card.insertAdjacentHTML('beforeend',editEl);
  const ta=document.getElementById('fne-'+id);
  if(ta){ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);}
}
function saveEditedNote(id){
  const f=(state.errorLog||[]).find(f=>f.id===id);if(!f)return;
  const ta=document.getElementById('fne-'+id);if(!ta)return;
  f.note=ta.value.trim();
  save();renderErrorLog();
  toast('✓ Note saved');
}
function clearFlagNote(id){
  const f=(state.errorLog||[]).find(f=>f.id===id);if(!f)return;
  f.note='';save();renderErrorLog();toast('Note cleared');
}

function renderErrorLog(){
  const list=document.getElementById('error-log-list');
  const countEl=document.getElementById('error-log-count');
  const auditRow=document.getElementById('error-log-audit-row');
  if(!list)return;
  const allActive=(state.errorLog||[]).filter(f=>!f.resolved);
  if(countEl)countEl.textContent=allActive.length;
  const flags=_flagCatFilter==='all'?allActive:allActive.filter(f=>(f.category||'other')===_flagCatFilter);
  if(!allActive.length){
    list.innerHTML='<p style="font-size:11px;color:var(--text-dim)">No active flags. Use ⚑ on any AI message or Manual Flag to capture moments during play.</p>';
    if(auditRow)auditRow.style.display='none';
    return;
  }
  const failCount=allActive.filter(f=>f.verdict==='fail').length;
  if(auditRow)auditRow.style.display=failCount>0?'block':'none';
  if(!flags.length){
    list.innerHTML='<p style="font-size:11px;color:var(--text-dim)">No flags in this category.</p>';
    return;
  }
  list.innerHTML=flags.map(function(f){
    const cat=FLAG_CATS[f.category]||FLAG_CATS.other;
    const verdict=f.verdict==='pass'?'resolved':f.verdict;
    const vClass=verdict?'verdicted-'+verdict:'';
    let vBadgeClass,vBadgeText;
    if(!verdict){vBadgeClass='pending';vBadgeText='Pending';}
    else if(verdict==='fail'){vBadgeClass='fail';vBadgeText='Fail';}
    else if(verdict==='reviewed'){vBadgeClass='reviewed';vBadgeText='Reviewed';}
    else{vBadgeClass='resolved';vBadgeText='Resolved';}
    const vBadge='<span class="err-log-verdict-badge '+vBadgeClass+'" onclick="toggleFlagVerdict(\''+f.id+'\')" style="cursor:pointer" title="Tap to cycle: Pending → Fail → Resolved">'+vBadgeText+'</span>';
    const snippet=f.msgContent?
      '<div class="err-log-context">'+esc(f.msgContent.slice(0,180))+(f.msgContent.length>180?'…':'')+'</div>':'';
    const noteHtml=f.note?
      '<div class="err-log-note" onclick="editFlagNote(\''+f.id+'\')" style="cursor:pointer" title="Tap to edit note">'+esc(f.note)+'</div>':
      '<div style="font-size:11px;color:var(--text-dim);font-style:italic;margin:4px 0;cursor:pointer" onclick="editFlagNote(\''+f.id+'\')" title="Tap to add note">Add note…</div>';
    const aiVerdictHtml=f.aiVerdict?
      '<div class="err-log-ai-verdict'+(verdict==='fail'?' fail-verdict':'')+'">🤖 '+esc(f.aiVerdict)+'</div>':'';
    const whereLabel=f.uiCtx||(f.tab?({'tab-party':'Party','tab-world':'World','tab-wagon':'Wagon','tab-combat':'Combat','tab-session':'Session','tab-ait':'AI Tools','tab-dm':'AI DM','tab-dev':'Dev','tab-setup':'Setup'}[f.tab]||f.tab):'');
    const whereHtml=whereLabel?'<span style="font-size:10px;font-weight:600;color:var(--gold-dim);letter-spacing:.3px">📍 '+esc(whereLabel)+(f.sectionCtx?' · '+esc(f.sectionCtx):'')+'</span><br>':'';
    const whenHtml=(f.location||f.gameTs||f.combatActive)?'<span style="font-size:10px;color:var(--text-dim)">'+esc(f.location||'')+(f.gameTs?' · '+esc(f.gameTs):'')+(f.combatActive?' · Combat R'+esc(String(f.combatRound||1)):'')+(!whereLabel&&f.sectionCtx?' · '+esc(f.sectionCtx):'')+'</span><br>':'';
    return '<div class="err-log-item '+vClass+'" id="flag-'+f.id+'">'+
      '<div class="err-log-header">'+
        '<span class="err-log-cat">'+cat.icon+'</span>'+
        '<div class="err-log-meta">'+
          '<strong style="color:var(--text)">'+cat.label+'</strong><br>'+
          whereHtml+whenHtml+
        '</div>'+
        vBadge+
      '</div>'+
      snippet+noteHtml+aiVerdictHtml+
      '<div data-flag-actions style="display:flex;justify-content:flex-end;margin-top:8px">'+
        '<button class="btn sm red" onclick="deleteFlag(\''+f.id+'\')" title="Delete flag permanently">🗑</button>'+
      '</div>'+
    '</div>';
  }).join('');
}
function toggleFlagVerdict(id){
  const f=(state.errorLog||[]).find(f=>f.id===id);if(!f)return;
  const cur=f.verdict==='pass'?'resolved':f.verdict;
  const cycle=[null,'fail','reviewed','resolved'];
  f.verdict=cycle[(cycle.indexOf(cur)+1)%cycle.length];
  save();renderErrorLog();
}
function setFlagCatFilter(cat){
  _flagCatFilter=cat;
  document.querySelectorAll('.flag-filter-pill').forEach(p=>p.classList.toggle('active',p.dataset.cat===cat));
  renderErrorLog();
}
function copyDevNotes(){
  const val=state.sessionNotes||'';
  if(!val.trim()){toast('No dev notes to copy.');return;}
  copyText(val,'✓ Dev notes copied!');
}
function clearResolvedFlags(){
  if(!confirm('Remove all Resolved flags permanently?'))return;
  state.errorLog=(state.errorLog||[]).filter(f=>f.verdict!=='resolved'&&f.verdict!=='pass');
  save();renderErrorLog();
  toast('✓ Resolved flags cleared');
}
function exportFlagReport(mode){
  const all=(state.errorLog||[]).filter(f=>!f.resolved);
  const flags=mode==='pending'?all.filter(f=>!f.verdict):all;
  if(!flags.length){toast('No '+(mode==='pending'?'pending ':'')+'flags to export.');return;}
  const today=new Date().toISOString().slice(0,10);
  const nPending=all.filter(f=>!f.verdict).length;
  const nFail=all.filter(f=>f.verdict==='fail').length;
  const nResolved=all.filter(f=>f.verdict==='pass'||f.verdict==='resolved').length;
  const parts=[nPending+' pending'];
  if(nFail)parts.push(nFail+' fail');
  if(nResolved)parts.push(nResolved+' resolved');
  let report='FLAGS '+today+' — '+parts.join(', ')+'\n\n';
  flags.forEach(function(f,i){
    const cat=f.category||'other';
    const v=f.verdict==='pass'?'resolved':f.verdict||'pending';
    const note=(f.note||'').trim()||'(no note)';
    const where=f.uiCtx||(f.tab?({'tab-party':'Party','tab-world':'World','tab-wagon':'Wagon','tab-combat':'Combat','tab-session':'Session','tab-ait':'AI Tools','tab-dm':'AI DM','tab-dev':'Dev','tab-setup':'Setup'}[f.tab]||f.tab):'');
    const section=f.sectionCtx?' → '+f.sectionCtx:'';
    const loc=f.location?' @ '+f.location:'';
    const ctx=where||section||loc?'['+where+section+loc+']':'';
    report+=(i+1)+'. ['+cat+'|'+v+'] '+ctx+(ctx?' ':'')+ note+'\n';
    if(f.msgContent){
      const snip=f.msgContent.slice(0,200)+(f.msgContent.length>200?'…':'');
      report+=' '+snip+'\n';
    }
  });
  report+='\n--- PROMPT FOR DEV ---\n';
  report+='These flags were placed during gameplay. Each includes the UI location where it was flagged and the player\'s note.\n';
  report+='Cross-reference against .claude/roadmap.md and .claude/features.md.\n\n';
  report+='For each flag:\n';
  report+='1. Is this a bug, a missing feature, a UX gap, or a design question?\n';
  report+='2. Can it be fixed now, or does it need player clarification?\n';
  report+='3. What specific change (code, contract, or UI) would resolve it?\n';
  copyText(report,'✓ '+(mode==='pending'?'Pending':'All')+' flags copied!');
}

async function auditWithAI(){
  const fails=(state.errorLog||[]).filter(f=>!f.resolved&&f.verdict==='fail');
  if(!fails.length){toast('No Fails to audit.');return;}
  const cat=FLAG_CATS;
  let prompt='POST-SESSION ACCURACY AUDIT\n\nThe players have flagged '+fails.length+' moment'+(fails.length>1?'s':'')+' from this session as potential errors. For each one, evaluate whether the ruling was correct per D&D 5e PHB/DMG rules. Respond with PASS or FAIL for each, and a one-sentence explanation.\n\n';
  fails.forEach(function(f,i){
    const c=cat[f.category]||cat.other;
    prompt+=(i+1)+'. ['+c.label+'] '+f.location+(f.gameTs?' at '+f.gameTs:'')+(f.combatActive?' (Combat R'+(f.combatRound||1)+')':'')+'\n';
    if(f.msgContent)prompt+='   AI said: "'+f.msgContent.slice(0,300)+(f.msgContent.length>300?'…':'')+'"'+'\n';
    if(f.note)prompt+='   Player note: '+f.note+'\n';
    prompt+='\n';
  });
  prompt+='Format your response as:\n1. PASS/FAIL — [one-sentence explanation]\n2. PASS/FAIL — [one-sentence explanation]\n...';
  if(!Array.isArray(state.chatHistory))state.chatHistory=[];
  state.chatHistory.push({role:'user',content:prompt,ts:state.worldData?.time||''});
  save();renderChat();
  // Switch to AI DM tab
  if(typeof showTab==='function')showTab('tab-dm');
  toast('Audit sent to AI DM. Check the chat.');
  // Trigger AI response
  if(typeof sendMsg==='function'){
    const inp=document.getElementById('chat-input');
    if(inp){inp.value=prompt;await sendMsg();}
  }
}

// ═══ PANEL FLAGS ═══
function injectPanelFlags(){
  document.querySelectorAll('.panel-title').forEach(function(title){
    if(title.querySelector('.panel-flag-btn'))return;
    const raw=Array.from(title.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
    const sectionName=(raw||title.textContent.trim()).slice(0,50);
    if(!sectionName)return;
    const btn=document.createElement('button');
    btn.className='panel-flag-btn';btn.textContent='⚑';btn.title='Flag this section';
    btn.onclick=function(e){e.stopPropagation();openFlagModal(-1,sectionName);};
    title.appendChild(btn);
  });
}

// ═══ SESSION DASHBOARD ═══
function getElapsed(){
  const ms=Date.now()-sessionStart;
  const h=Math.floor(ms/3600000);const m=Math.floor((ms%3600000)/60000);
  return h>0?h+'h '+m+'m':m+'m';
}
function openDashboard(tab){
  renderDashStats();renderChangelog();
  openModal('dash-modal');
}
function showDashTab(tab){}
function renderDashStats(){
  const el=document.getElementById('dash-stats');if(!el)return;
  const goldDelta=Math.round((parseFloat(state.treasuryData.gp)||0)-sessionStartGP);
  const openFlags=(state.errorLog||[]).filter(f=>!f.resolved&&!f.verdict).length;
  const goldStr=(goldDelta>=0?'+':'')+goldDelta+' gp';
  el.innerHTML=[{val:getElapsed(),lbl:'Elapsed'},{val:goldStr,lbl:'Gold This Session'},{val:openFlags,lbl:'Unreviewed Flags'}]
    .map(s=>'<div class="dash-stat-cell"><div class="dash-stat-val">'+s.val+'</div><div class="dash-stat-lbl">'+s.lbl+'</div></div>').join('');
}
function renderChangelog(){
  const el=document.getElementById('dash-tab-changelog');if(!el)return;
  const versions=[
    {ver:'v1.18',date:'June 2026',notes:[
      'Clean without clutter (Session 9): chat message toolbar reduced from 4 visible buttons to 2 (copy + ⋮ overflow); TTS, flag, and delete now in overflow menu — main game screen significantly less cluttered',
      'NPC rows restructured: two-row layout (name/disposition/status/delete on top; HP + details below) — no longer overflows on mobile screens',
      'Quest expansion cleaned: emoji removed from status dropdown options (color already signals status); visibility button is now icon-only (👁) with tooltip; Quest Text label removed; delete is × icon-only',
      'Resolved consequences collapsed into a ▶ Resolved (N) disclosure instead of showing inline — active consequences visible without scrolling past resolved ones',
      'Filler description paragraphs removed from: Holding Cells, Town Rep, Campaign Premise, Campaign Secrets, Module Scenes, Secret DM Notes, Reference Snippets, AI Sandbox, Ledger Settings — contextual info moved to placeholder text where needed',
    ]},
    {ver:'v1.17',date:'June 2026',notes:[
      'Quest navToast: tapping the "New Quest" chip now opens the World drawer and scrolls directly to the new quest entry, gold-highlighted',
      'Quest chat anchor: robust msgId system replaces fragile array-index anchoring — the "↗ Chat" button finds the discovery message even if surrounding messages were pruned; shows "archived in summary" if the message no longer exists',
      'Systems → ⏪ Tools tab restored: Rewind Stack, QA Actions Editor, FAB icon picker, Firebase config, and Checkpoint History were rendering to invisible DOM nodes since the 4-tab nav migration; now accessible again',
      'Bug fixes (from Playwright audit): header menu z-index raised above drawer; HUD z-index 850 above backdrop; closeDrawer resets QA menu context; chat placeholder updates per channel (AI DM / Rules / Party)',
    ]},
    {ver:'v1.16',date:'June 2026',notes:[
      'World Consequence Engine: state.consequences[] — AI logs long-term consequences via consequence_add/consequence_resolve mechanics; shown in World tab and injected into every AI prompt',
      '"Previously On…" QA action: tap to generate a 2-sentence recap of the last 8 messages — fast session-start re-orientation',
      'Quest chat anchor: quest_add now embeds a tappable 📖 View Quest chip in narrative chat — tap navigates directly to the quest in World tab',
      'Foraged item descriptions: item_add captures description prose from AI response and stores it on the cargo entry',
      '"Clean without clutter" pass: redundant helper text, verbose panel labels, and decorative-only chrome trimmed throughout',
      'Scroll-to-top/bottom buttons streamlined into panel headers on all panes (consistent position, no layout disruption)',
      'Fix: save() and state globals exposed correctly to submodules; saveEditedNote() added to exports',
    ]},
    {ver:'v1.15',date:'June 2026',notes:[
      'Scroll freeze fixed (flags 1 & 4): narrative chat pane uses display:flex — scrolls correctly after switching to OOC/party and back without needing a page refresh',
      'iOS scroll fix: -webkit-overflow-scrolling:touch + touch-action:pan-y added to all chat panes',
      'Flag save button always visible: flag modal restructured with a scrollable body and pinned footer — "Flag It" no longer pushed off-screen by the mobile keyboard',
      'Auto-injected contract clauses (flags 11, 14, 15, 16): DUNGEON SECRETS, PLAYER AGENCY, and SKILL CHECKS appended to the "What You Never Do" contract on load if missing — idempotent, never duplicates',
      'Quest announcement chip: when AI fires quest_add, a tappable gold navToast chip appears in narrative chat; tap navigates to World tab quest log',
      'Quest discovery chapter: quest_add captures the discovery paragraph from AI prose into quest.discovery{text,ts}; visible as 📖 Discovery inside the quest details expand',
    ]},
    {ver:'v1.14',date:'June 2026',notes:[
      'Body layout fixed: display:flex; flex-direction:column; height:100dvh — AI DM chat area now fills the true viewport height between HUD and dock',
      'AI DM tab always-visible: no longer hidden when drawers open or close; closeDrawer() explicitly re-activates it',
      'Context-aware quick bar: single input at bottom of screen routes to correct channel (narrative / OOC / party) based on active tab — in-pane textarea inputs removed',
      'Quick bar placeholder updates dynamically: "Command AI DM…" / "Ask a rules question…" / "Message party…" as you switch tabs',
      'Ask DM button moved to party pane top bar — no longer buried below the scroll horizon',
      '↑ Top / ↓ Bottom scroll buttons added to narrative chat pane (OOC and party already had them)',
    ]},
    {ver:'v1.13',date:'June 2026',notes:[
      '4-tab bottom nav replaces the 9-tab top bar: AI DM / 📜 Sheet / 📦 Logistics / ⚙ Systems — cleaner navigation, all play surfaces one tap away',
      'Composite drawers: Logistics opens with 🌍 World / 🛒 Wagon / ⚔ Combat subnav; Systems opens with 📅 Session / 🤖 AI Tools / 🔧 Dev / ⚙ Setup subnav',
      'Nav activity dots: gold ● appears on Logistics or Systems button when AI mechanics push a state change on a hidden tab; clears when you visit that tab',
      'DR-6: AI contracts moved to state.aiContracts{} — all 5 contracts now Firebase-synced; survive device switches and session reloads',
      'Contract security validation: buildPrompt() validates the Slasher persona fragment before every AI send; hard error blocks the send if it is missing',
      'Flag system: "Idea" category added for feature requests and design notes distinct from bugs',
      'Flag filter pills: 8 category pills in Dev tab (All + each category) for fast triage',
      'Flag verdict "Reviewed" state: Pending → Fail → Reviewed → Resolved — "Reviewed" means acknowledged, not yet acted on',
      'Dev notes: Copy All button exports full dev notes section to clipboard',
    ]},
    {ver:'v1.12',date:'June 2026',notes:[
      'Theme fix: --ivory variable was undefined, breaking stat values, dice results, and modal titles across all modes',
      'Night mode readability overhaul — text, gold, and border values raised for legibility',
      'Hybrid parchment light mode — warm #f5efe1 background with filigree panel borders',
      'Flag export compact format — [category|verdict] note per line, drops emoji/location/labels (~70% shorter)',
      'Bug fix: narrative chat scroll-freeze on tab switch — requestAnimationFrame scroll-to-bottom on showChatTab',
      'Bug fix: QA FAB z-index raised so menu no longer appears behind the dock',
      'Bug fix: QA menu stuck open — closeQAMenu() called on showTab() and openDrawer()',
      'Bug fix: flag save button untappable — modal z-index 1600, iOS safe-area padding added',
      'Cantrips sub-tab (Level 0) added to Spellbook filter',
      'Quest entries expand/collapse inline via <details> — tap to reveal full detail',
      'Cargo/inventory multi-category filter — comma-separated item types now match across tags',
      'Dice picker buttons now open full Roll & Submit sheet (char select, modifier, send to chat)',
      'Context strip above HP bar — shows location · scene title; swaps to combat round/combatant during fights',
      'Spell descriptions added inline — tap row to expand full spell text',
      'AI Contracts: Copy All button concatenates all 5 contract textareas to clipboard',
      'Character sheet rework: 6-tab digital sheet (Core / Skills / Combat / Spells / Gear / Features)',
      'Sheet lock/unlock — all fields read-only during play; deliberate unlock to edit; auto-locks on close',
      'Hit Dice pip track — tap to spend (rolls die, heals, toasts result); tap spent pip to refund',
      'Exhaustion 0–6 pip track, Temp HP field, Death Save hearts/skulls always interactive',
      'Languages as tap chips with + Add in Features tab; Character Soul section (Personality/Ideals/Bonds/Flaws)',
    ]},
    {ver:'v1.11',date:'June 2026',notes:[
      'DR-7: Rolling AI summary — at 75 messages, oldest 30 are auto-summarized in background and pruned',
      'Summary stored as prevSessionSummary and injected into every AI system prompt as "CAMPAIGN HISTORY"',
      'Prune is never performed unless summary succeeds — messages preserved on any API failure',
      'prevSessionSummary synced to Firebase (STATE_KEYS) so all devices share continuity',
    ]},
    {ver:'v1.10',date:'June 2026',notes:[
      'DR-4: callAI() retry + provider fallback — 2 auto-retries on 5xx/network errors (1.2s, 2.4s backoff)',
      'Fallback: if Google fails all retries and OpenRouter key is set, silently retries on free Llama model',
      'Status display: "Retrying… (1/2)" / "Switching to fallback provider…" shown below send button',
      'Never retries 4xx errors (auth failures, bad request) — avoids wasting API credits',
      'Tab overflow ⋮ menu fixed: now position:fixed so it is no longer clipped by tab bar overflow',
    ]},
    {ver:'v1.9',date:'June 2026',notes:[
      'Campaign lock: Setup tab shows read-only banner after launch; ⚙ Edit to unlock, 🔒 to re-lock',
      'Deep links in Setup lock banner: World and Wagon tabs linked directly from lock banner',
      'SAVE_VERSION 9: existing campaigns auto-detected as launched (via chat history); v8→v9 upgrade skips inventory wipe',
    ]},
    {ver:'v1.8',date:'June 2026',notes:[
      'Story Chronicle panel: storyThread field eliminated — canonical structure is now storyChapters[] only',
      'Edit mode and mode toggle removed — panel always shows the ebook-style chapter read view',
      'Existing storyThread auto-migrates to Prologue chapter on first load (SAVE_VERSION 8 gate)',
      'storyThread purged from all loaded saves via migrate() — no longer stored in localStorage',
    ]},
    {ver:'v1.7',date:'June 2026',notes:[
      'Tab bar reordered: AI DM first, play tabs visible without scrolling; AI Tools/Dev/Setup in ⋮ overflow menu',
      '❓ Rules channel (renamed from ⚙ Systems) — clearer purpose label',
      'QA menu grouped by category: Party & Combat / World & Story / AI & System; ⭐ Pinned: Save Game, Roll & Submit, Context Refresh',
      'Count badges on World / Session / Wagon tabs — increments on each AI mechanic, clears on tab visit',
      'Field Notes: Quick Log action now appends to storyChapters[] "Field Notes" chapter instead of orphaned storyThread',
      'Story Chronicle chapter system (SAVE_VERSION 8): storyChapters[], chapter_add/chapter_update mechanics, ✨ Chapter button, legacy storyThread migration',
      'AI request timeout: 25-second AbortController — no more infinite hangs; user-readable error on timeout',
      'Ledger mode: Compact now default (~600 tokens); Full (~2500) for session start or resync only',
    ]},
    {ver:'v1.6',date:'June 2026',notes:[
      '🎲 Roll & Submit button in header — one-tap from any tab',
      'World tab split into World State | Operations sub-tabs',
      'OOC and party chat: live game state ledger injected on every send (fixes context drift)',
      'Context Refresh: queues scene snapshot silently for next AI DM message — no longer routes to OOC',
      'Re-sync AI State: injects full ledger + triggers visible confirmation in main chat — no longer routes to OOC',
      'Module tracker: Campaign Progress panel in Session tab — 8 Hoard of the Dragon Queen episodes',
      'AI can advance/complete episodes via module_episode: mechanic command',
      'Quest dedup: quest_add skips near-identical quests',
      'NPC dedup: npc_add updates existing NPC instead of creating duplicate',
      'primary_mission: mechanic — AI can now set/update the main quest',
      'quest_fail: mechanic added',
      'Income / NPC / Quest tracking contracts rewritten with strict no-exceptions enforcement',
      'AI Tools: Context Refresh vs Re-sync guidance panel added',
      'Flag list: dev plan flags captured in roadmap now auto-resolve on load',
      'Per-message ✕ delete button on all Narrative chat messages',
      'Story Thread: 📖 Read mode — ebook view with collapsible TOC and chapter sections',
      '↑ Top / ↓ Bottom scroll buttons on Narrative chat and Story Thread',
      'Quest hidden:false default field added — foundation for player-visible quest filtering (Drop 6)',
      'ElevenLabs TTS: updated to eleven_turbo_v2_5, readable error messages, ✓ Verify key button',
      '🐢 Shell Defense quick action — toggles Tinkle in/out of shell (Prone, Incapacitated, AC 21)',
      'Shell Defense AI contract: AI must now output shell_defense: tinkle=on/off in mechanics block',
      'Stale Shell Defense conditions auto-cleared from Tinkle on load via migrate()',
      'NPC tracking contract: AI must check NPC log before introducing any NPC in narrative prose',
      'Quest tracking contract: BEFORE adding quest_add, check existing quests for same objective',
      'Save export filename now uses current location instead of timestamp',
      '⚙ Systems + 🗨️ OOC channels: OOC contract added — rules accuracy, character separation, Slasher secret protection',
      'Party Ask DM: fixed multi-question context drift — now sends proper alternating conversation history',
      '✨ State changelog: parsed mechanics now surface as a stacking ledger feed (HP, quests, NPCs, conditions) — tap to dismiss',
      '🎲 Dice roll flourish: slot-machine flicker + color cue (gold nat-max, red nat-1), button press feedback, haptic on landing',
      '📖 Soft tab transitions — gentle fade-up when switching tabs',
      '♿ Honors prefers-reduced-motion — all new motion disabled for users who opt out',
      '💰 Ledger confirm chip: when the AI narrates gold but forgets to log it, a one-tap "Log X gp?" chip appears — no tab-switch, no retyping',
      '🕯 Night mode: third theme for low-light reading — deep sepia bg (#100d0a), warm amber text, 17px body font, larger chat messages. Cycle: Dark → Light → Night → Dark via ☀ header button',
      '⚡ Tab flash: when AI mechanics fire, the affected tab pulses gold — Party (HP/conditions), World (gold/NPC/quest), Wagon (cargo), Session (episodes)',
      '💰 Quick-sell button on cargo items — tap 💰, set price + qty, one confirm logs income and decrements stock',
      '≈ Treasury total strip — live gp-equivalent total computed from all coins (pp×10, ep×0.5, sp×0.1, cp×0.01)',
      '📊 Session P&L strip — shows earned / spent / net gp for this session next to the treasury total',
    ]},
    {ver:'v1.5',date:'June 2026',notes:[
      'Dev tab: Dev Notes, Flag Review, and Ops Debrief in dedicated Dev tab (last before Setup)',
      'Header: autosave dot only; 💰 gold delta and ⏱ session timer now live in the status bar',
      'Patch Notes: ☰ Session renamed; modal shows changelog + Debrief only (Flag Review moved to Dev tab)',
      'Flag rework: tap status badge to cycle Pending → Fail → Resolved; tap note to edit; 🗑 delete only',
      'Export Pending / Export All / Clear Resolved buttons added to Flag Review',
      'AI DM tabs: OOC → ⚙ Systems; Party → 🗨️ OOC',
      'Dual timestamps on all messages: game time + real clock time',
      '↑ Top / ↓ Bottom scroll buttons on ⚙ Systems and 🗨️ OOC channels',
      'Quest Log: Primary Mission renamed to Main Quest',
      'Campaign Premise moved alongside Plot & Lore in World tab',
      'Wagon Travel Log moved to Wagon tab',
      'Story Thread and Session Summary boxes enlarged',
    ]},
    {ver:'v1.4',date:'June 2026',notes:[
      'OOC channel — Narrative / OOC tabs in AI DM panel for out-of-character chat',
      'Context refresh and AI resync now route to OOC (no more "Acknowledged" in narrative)',
      'OOC echo indicator in narrative chat — tap to jump to OOC message',
      'OOC clears with main chat (Clear button)',
      'Flag system: edit note inline, delete flag permanently',
      'Flag categories: added Infrastructure / App Issue (🔧)',
      'Flag status: Unreviewed renamed to Pending everywhere',
      'Dev Notes clear button added',
      'Voice settings moved from ☰ menu into the 🔊 button (already in chat header)',
      'Ops Debrief: DM NOTES → DEV NOTES, UNREVIEWED → PENDING',
    ]},
    {ver:'v1.4',date:'June 2026',notes:[
      'Story Chronicle: AI-managed chapter system (SAVE_VERSION 8)',
      'chapter_add / chapter_update mechanics — AI or DM can write story chapters',
      '✨ Chapter button generates a new chapter from recent session log via AI',
      'Read mode renders from structured chapters with dates; falls back to legacy text',
      'Existing storyThread auto-migrates to Prologue chapter on first load',
      'Chapter titles listed in full ledger for AI context awareness',
      'Session tab flashes when a chapter is added or updated',
      'features.md added — comprehensive reference for all tabs, functions, and mechanics',
    ]},
    {ver:'v1.3',date:'June 2026',notes:[
      'Switch Player: tap your name in the DM chat bar to switch instantly',
      'Player name can no longer disappear or default to blue "Party" mid-session',
      'Error flagging: ⚑ button on every AI DM response and in the chat bar',
      'Flag categories: Roll / Rule / AI Made It Up / Story / Other',
      'Pass / Fail verdicts + AI accuracy audit for flagged moments',
      'Active Scene panel at top of World tab (title, tone, conditions)',
      'NPC HP field for enemy health tracking mid-combat',
      'Quest 3-state status: Active / Done / Failed',
      'Firebase panel deduplicated — one clean location in Checkpoints tab',
      'Session Dashboard (this panel) with Ops Debrief button',
    ]},
    {ver:'v1.2',date:'May 2026',notes:[
      'Plugin terminal: ⚡ Superpowers panel in Party tab',
      'Dice modifier fixed in AI DM quick picker',
      'Setup Characters page rebuilt for stability',
      'SAVE_VERSION bump — stale inventory auto-cleared on load',
    ]},
    {ver:'v1.1',date:'April 2026',notes:[
      'Full visual rework: Cinzel display font, textured surfaces, ornamental panels',
      'Emoji clutter removed from UI labels; functional emoji preserved',
      'Color palette muted toward warm copper-brown base',
    ]}
  ];
  el.innerHTML=versions.map(v=>'<div class="dash-version"><div class="dash-version-title">'+v.ver+' — '+v.date+'</div><ul>'+v.notes.map(n=>'<li>'+n+'</li>').join('')+'</ul></div>').join('');
}
function renderFlagReview(){}

// ═══ THEME TOGGLE ═══
function _applyTheme(mode){
  document.body.classList.remove('light-mode','night-mode');
  if(mode==='light')document.body.classList.add('light-mode');
  else if(mode==='night')document.body.classList.add('night-mode');
  // icon shows NEXT mode so user knows what tap will do
  const icons={dark:'☀',light:'🕯',night:'🌙'};
  const tips={dark:'Dark → Light',light:'Light → Night',night:'Night → Dark'};
  const btn=document.getElementById('theme-toggle-btn');
  if(btn){btn.textContent=icons[mode]||'☀';btn.title=tips[mode]||'Cycle theme';}
}
function toggleThemeMode(){
  const cycle=['dark','light','night'];
  const cur=localStorage.getItem('tt_theme_mode')||'dark';
  const next=cycle[(cycle.indexOf(cur)+1)%cycle.length];
  localStorage.setItem('tt_theme_mode',next);
  _applyTheme(next);
}
function initThemeMode(){
  const mode=localStorage.getItem('tt_theme_mode')||'dark';
  _applyTheme(mode);
}

function sessionRecap(){
  const flags=(state.errorLog||[]).filter(f=>!f.resolved);
  const ctxRefreshes=(state.logs||[]).filter(l=>l.body&&l.body.includes('[CONTEXT REFRESH]')).length;
  let report='=== TINKLE\'S TINCTURES — OPS DEBRIEF ===\n\n';
  report+='Duration: '+getElapsed()+'\n';
  report+='Turns logged: '+state.turnCount+' | Checkpoints: '+state.chkCount+'\n';
  report+='Context refreshes: '+ctxRefreshes+'\n';
  report+='Gold delta: '+(Math.round((parseFloat(state.treasuryData.gp)||0)-sessionStartGP))+' gp\n';
  report+='Location at close: '+(state.worldData?.location||'—')+'\n';
  if(state.worldData?.scene_title)report+='Last scene: '+state.worldData.scene_title+(state.worldData.scene_threat?' ['+state.worldData.scene_threat+']':'')+'\n';
  if(state.sessionNotes){report+='\n--- DEV NOTES ---\n'+state.sessionNotes+'\n';}
  if(flags.length){
    report+='\n--- FLAGGED MOMENTS ('+flags.length+') ---\n';
    flags.forEach(function(f,i){
      const cat=FLAG_CATS[f.category]||FLAG_CATS.other;
      const v=f.verdict==='pass'?'resolved':f.verdict;
      const verdictStr=!v?'PENDING':v.toUpperCase();
      report+=(i+1)+'. ['+cat.label+']'+(f.sectionCtx?' in '+f.sectionCtx:'')+(f.location?' @ '+f.location:'')+(f.gameTs?' ('+f.gameTs+')':'')+' → '+verdictStr+'\n';
      if(f.note)report+='   Note: '+f.note+'\n';
      if(f.msgContent&&f.msgContent.indexOf('[')!==0)report+='   AI said: "'+f.msgContent.slice(0,200)+(f.msgContent.length>200?'…':'')+'"'+'\n';
    });
  }else{
    report+='\n--- NO FLAGS THIS SESSION ---\n';
  }
  report+='\n--- PROMPT FOR DEV ---\nReview the flagged moments above against .claude/roadmap.md and .claude/features.md. For each flag:\n1. Check if a fix or feature already shipped that addresses it (cross-reference completed items and function index)\n2. If YES: mark as INCOMPLETE FIX — state what exists, what gap remains, and what specifically still needs to change\n3. If NO: mark as NEW — describe the root cause and what to build\nThen identify recurring failure patterns (rules the AI got wrong, mechanics that misfired, context the AI lacked). Suggest 1-2 specific, actionable changes to the system prompt or app that would most improve the next session.';
  [['dash-recap-out','dash-recap-text'],['dev-recap-out','dev-recap-text']].forEach(([outId,txtId])=>{
    const out=document.getElementById(outId);
    const txt=document.getElementById(txtId);
    if(out)out.style.display='block';
    if(txt){txt.value=report;setTimeout(()=>txt.select(),50);}
  });
  copyText(report,'✓ Ops report ready — paste to dev');
}

function exportGameplayLog(mode){
  const msgs=state.chatHistory||[];
  const slice=mode==='recent'?msgs.slice(-40):msgs;
  const archive=state.sessionArchive||[];
  const flags=(state.errorLog||[]).filter(f=>!f.resolved);
  let log='=== TINKLE\'S TINCTURES — GAMEPLAY LOG FOR DEV REVIEW ===\n';
  log+='Exported: '+new Date().toISOString().slice(0,16)+'\n';
  log+='Location: '+(state.worldData?.location||'—')+'\n';
  log+='PCs: '+(state.pcs||[]).map(p=>p.name+' ('+p.class+' '+p.level+', '+p.hp+'/'+p.hp_max+' HP)').join(', ')+'\n';
  log+='Messages in export: '+slice.length+' of '+msgs.length+' total\n\n';

  if(state.sessionNotes){
    log+='--- DEV NOTES (quick // notes from gameplay) ---\n'+state.sessionNotes.trim()+'\n\n';
  }

  if(archive.length){
    log+='--- SESSION ARCHIVE ('+archive.length+' summaries, newest first) ---\n';
    const archSlice=mode==='recent'?archive.slice(-3):archive;
    archSlice.slice().reverse().forEach(a=>{
      log+='['+a.gameTs+'] ('+a.msgCount+' msgs)\n'+a.summary+'\n\n';
    });
  }

  log+='--- CHAT LOG ---\n';
  log+='Format: [game_time] ROLE (character): message\n';
  log+='Mechanics lines show what the app parsed from the AI response.\n\n';

  slice.forEach(m=>{
    const ts=m.ts||'';
    const role=m.role==='assistant'?'DM':m.role==='user'?'PLAYER':'SYSTEM';
    const who=m.playerChar?' ('+m.playerChar+')':m.playerName?' ('+m.playerName+')':'';
    const content=(m.content||'').replace(/\n{3,}/g,'\n\n').trim();
    if(!content)return;
    log+='['+ts+'] '+role+who+':\n';
    const lines=content.split('\n');
    const mechLines=[];
    const textLines=[];
    lines.forEach(line=>{
      if(/^[a-z_]+:/.test(line.trim()))mechLines.push(line.trim());
      else textLines.push(line);
    });
    if(textLines.length)log+=textLines.join('\n')+'\n';
    if(mechLines.length)log+='  MECHANICS: '+mechLines.join(' | ')+'\n';
    log+='\n';
  });

  if(flags.length){
    log+='--- OPEN FLAGS ('+flags.length+') ---\n';
    const FLAG_CATS_LOCAL={bug:{label:'Bug'},story:{label:'Story Error'},rule:{label:'Wrong Rule'},idea:{label:'Idea / Feature'},app:{label:'App Issue'},other:{label:'Other'}};
    flags.forEach((f,i)=>{
      const cat=FLAG_CATS_LOCAL[f.category]||FLAG_CATS_LOCAL.other;
      log+=(i+1)+'. ['+cat.label+']'+(f.sectionCtx?' in '+f.sectionCtx:'')+(f.location?' @ '+f.location:'')+'\n';
      if(f.note)log+='   '+f.note+'\n';
    });
  }

  log+='\n--- PROMPT FOR DEV ---\n';
  log+='You are reviewing actual gameplay logs from a D&D 5e campaign management app.\n';
  log+='Cross-reference these logs against .claude/roadmap.md and .claude/features.md.\n\n';
  log+='Analyze for:\n';
  log+='1. UNMET PLAYER NEEDS — moments where the player wanted something the app couldn\'t do, or had to work around a limitation\n';
  log+='2. AI FAILURE PATTERNS — rules the DM got wrong repeatedly, context it lacked, mechanics it skipped\n';
  log+='3. AI SUCCESS PATTERNS — what the DM did well that should be preserved or reinforced\n';
  log+='4. UX FRICTION — interactions that took too many steps, confused the player, or broke flow\n';
  log+='5. INCOMPLETE FIXES — flags that match already-shipped features (mark what exists vs what\'s still missing)\n\n';
  log+='For each finding, state: what happened, where in the log, whether a fix exists, and what to change.\n';
  log+='Rank findings by gameplay impact. Suggest 2-3 specific, actionable changes.\n';

  const out=document.getElementById('dev-log-out');
  const txt=document.getElementById('dev-log-text');
  if(out)out.style.display='block';
  if(txt){txt.value=log;setTimeout(()=>txt.select(),50);}
  copyText(log,'✓ Gameplay log copied — paste to dev session');
}

function exportMoment(msgIdx){
  const msgs=state.chatHistory||[];
  if(msgIdx>=msgs.length){toast('That message was archived in a summary — can\'t export it.');return;}
  const radius=10;
  const start=Math.max(0,msgIdx-radius);
  const end=Math.min(msgs.length,msgIdx+radius+1);
  const slice=msgs.slice(start,end);
  const target=msgs[msgIdx];
  let log='=== TINKLE\'S TINCTURES — MOMENT EXPORT ===\n';
  log+='Exported: '+new Date().toISOString().slice(0,16)+'\n';
  log+='Target message: #'+(msgIdx+1)+' of '+msgs.length+'\n';
  log+='Context window: messages '+(start+1)+'–'+end+' ('+slice.length+' total)\n';
  log+='Location: '+(state.worldData?.location||'—')+'\n';
  log+='PCs: '+(state.pcs||[]).map(p=>p.name+' ('+p.class+' '+p.level+', '+p.hp+'/'+p.hp_max+' HP)').join(', ')+'\n\n';
  log+='--- CONTEXT ---\n\n';
  slice.forEach((m,i)=>{
    const absIdx=start+i;
    const isTarget=absIdx===msgIdx;
    const role=m.role==='assistant'?'DM':m.role==='user'?'PLAYER':'SYSTEM';
    const who=m.playerChar?' ('+m.playerChar+')':m.playerName?' ('+m.playerName+')':'';
    const content=(m.content||'').replace(/\n{3,}/g,'\n\n').trim();
    if(!content)return;
    if(isTarget)log+='>>> TARGET MESSAGE <<<\n';
    log+='['+(m.ts||'')+'] '+role+who+':\n';
    const lines=content.split('\n');
    const mechLines=[];
    const textLines=[];
    lines.forEach(line=>{
      if(/^[a-z_]+:/.test(line.trim()))mechLines.push(line.trim());
      else textLines.push(line);
    });
    if(textLines.length)log+=textLines.join('\n')+'\n';
    if(mechLines.length)log+='  MECHANICS: '+mechLines.join(' | ')+'\n';
    if(isTarget)log+='>>> END TARGET <<<\n';
    log+='\n';
  });
  const flags=(state.errorLog||[]).filter(f=>!f.resolved);
  const nearby=flags.filter(f=>{
    if(!target)return false;
    const tTs=target.ts||'';
    return f.gameTs&&f.gameTs===tTs;
  });
  if(nearby.length){
    log+='--- FLAGS AT THIS MOMENT ---\n';
    nearby.forEach(f=>{
      const cat={bug:'Bug',story:'Story Error',rule:'Wrong Rule',idea:'Idea',app:'App Issue',other:'Other'}[f.category]||'Other';
      log+='['+cat+'] '+((f.note||'')||'(no note)')+'\n';
    });
    log+='\n';
  }
  log+='--- PROMPT FOR DEV ---\n';
  log+='The player flagged this specific moment for review. The TARGET MESSAGE is marked above.\n';
  log+='Cross-reference against .claude/roadmap.md and .claude/features.md.\n\n';
  log+='Analyze:\n';
  log+='1. What went wrong or felt off at this moment?\n';
  log+='2. Was it an AI rules error, a missing mechanic, a UX gap, or a context gap?\n';
  log+='3. Does a fix or feature already exist that should have caught this? If so, why didn\'t it?\n';
  log+='4. What specific change (code, contract clause, or prompt) would prevent this from recurring?\n';
  copyText(log,'✓ Moment exported — paste to dev session');
  toast('Moment exported to clipboard');
}

// ═══ TOAST ═══
function toast(msg,style,dur){
  const t=document.getElementById('toast');if(!t)return;
  if(typeof style==='number'){dur=style;style=null;}
  t.innerText=msg;
  t.className='toast'+(style?' toast-'+style:'');
  t.style.display='block';
  setTimeout(()=>{t.style.display='none';},dur||2500);
}

// ═══ PLUGINS ═══
const PLUGIN_REGISTRY={
  'superpowers':{
    name:'Superpowers',
    registry:'claude-plugins-official',
    version:'1.0.0',
    icon:'⚡',
    description:'Adds a Superpowers panel to the Party tab. Each character unlocks a signature superpower based on their class abilities — a powerful combo move tracked per short rest.',
    sha:'a3f9e2b1c4d8f067e52a1b3c9d4e7f023b8a6c15d0e4f9a7b2c8d3e6f1a5b0c9'
  }
};

function termPrint(msg){
  const el=document.getElementById('plugin-terminal');
  if(!el)return;
  el.textContent+='\n'+msg;
  el.scrollTop=el.scrollHeight;
}

function handlePluginCmd(){
  const inp=document.getElementById('plugin-input');
  if(!inp)return;
  const raw=inp.value.trim();
  if(!raw)return;
  inp.value='';
  termPrint('$ '+raw);
  const parts=raw.trim().split(/\s+/);
  if(parts[0]==='claude'&&parts[1]==='plugin'&&parts[2]==='install'&&parts[3]){
    const atIdx=parts[3].indexOf('@');
    const pkgName=atIdx>-1?parts[3].slice(0,atIdx):parts[3];
    const registry=atIdx>-1?parts[3].slice(atIdx+1):'claude-plugins-official';
    installPlugin(pkgName,registry);
  } else if(parts[0]==='claude'&&parts[1]==='plugin'&&parts[2]==='list'){
    const list=state.plugins||[];
    if(!list.length){termPrint('No plugins installed.');return;}
    list.forEach(p=>termPrint('  ✓ '+p.id+'@'+p.version+' ('+p.registry+')'));
  } else if(parts[0]==='claude'&&parts[1]==='plugin'&&parts[2]==='uninstall'&&parts[3]){
    uninstallPlugin(parts[3]);
  } else if(parts[0]==='claude'&&parts[1]==='plugin'&&parts[2]==='search'){
    termPrint('Available packages in claude-plugins-official:');
    termPrint('  • superpowers@1.0.0 — Signature superpower combos for each character');
  } else {
    termPrint('Unknown command. Available commands:');
    termPrint('  claude plugin install <name>@<registry>');
    termPrint('  claude plugin list');
    termPrint('  claude plugin search');
    termPrint('  claude plugin uninstall <name>');
  }
}

function installPlugin(name,registry){
  if(!state.plugins)state.plugins=[];
  if(state.plugins.find(p=>p.id===name)){
    termPrint('✗ '+name+' is already installed. Use "claude plugin uninstall '+name+'" to remove it first.');
    return;
  }
  const def=PLUGIN_REGISTRY[name];
  if(!def||def.registry!==registry){
    termPrint('✗ Package "'+name+'@'+registry+'" not found in registry.');
    termPrint('  Try: claude plugin search');
    return;
  }
  termPrint('Fetching '+name+'@'+def.version+' from '+registry+'...');
  const steps=[
    '✓ Resolved '+name+'@'+def.version,
    '✓ Verified package integrity (sha256:'+def.sha+')',
    '✓ Installing '+name+'...',
    '✓ Registering hooks into campaign terminal...',
    '✓ '+name+'@'+def.version+' installed successfully.\n\nPlugin "'+name+'" is now active. Switch to the Party tab to see the new Superpowers panel.\n'
  ];
  let step=0;
  function tick(){
    if(step<steps.length){
      termPrint(steps[step++]);
      setTimeout(tick,260);
    } else {
      state.plugins.push({id:name,version:def.version,registry:registry,active:true,installedAt:new Date().toISOString()});
      save();
      renderPlugins();
      renderSuperpowers();
      toast('✓ '+name+' installed!');
    }
  }
  setTimeout(tick,100);
}

function uninstallPlugin(name){
  if(!state.plugins)state.plugins=[];
  const idx=state.plugins.findIndex(p=>p.id===name);
  if(idx===-1){termPrint('✗ Plugin "'+name+'" is not installed.');return;}
  state.plugins.splice(idx,1);
  save();
  renderPlugins();
  renderSuperpowers();
  termPrint('✓ '+name+' uninstalled.');
  toast(name+' uninstalled.');
}

function renderPlugins(){
  const el=document.getElementById('plugin-list');
  if(!el)return;
  const list=state.plugins||[];
  if(!list.length){
    el.innerHTML='<p style="font-size:11px;color:var(--text-dim)">No plugins installed yet. Try: <code style="color:var(--gold);background:rgba(201,168,76,.08);padding:1px 5px;border-radius:2px">claude plugin install superpowers@claude-plugins-official</code></p>';
    return;
  }
  el.innerHTML=list.map(p=>{
    const def=PLUGIN_REGISTRY[p.id]||{};
    return '<div class="plugin-card active-plugin">'
      +'<div class="plugin-icon">'+(def.icon||'🔌')+'</div>'
      +'<div class="plugin-info">'
        +'<div class="plugin-name">'+esc(def.name||p.id)+'<span class="plugin-status-badge installed">Active</span></div>'
        +'<div class="plugin-meta">'+esc(p.id)+'@'+esc(p.version)+' \xb7 '+esc(p.registry)+'</div>'
        +'<div class="plugin-desc">'+esc(def.description||'')+'</div>'
      +'</div>'
      +'<button class="btn sm red" onclick="showSetupStep(4);uninstallPlugin(\''+esc(p.id)+'\')" style="flex-shrink:0;margin-top:2px">Uninstall</button>'
    +'</div>';
  }).join('');
}

const SUPERPOWERS={
  slasher:{
    name:'ACID SURGE',
    icon:'🐉',
    desc:'Combine Acid Breath and Second Wind into a single devastating push. Until the end of your next turn: all attacks deal an extra 2d6 acid damage, AND you regain 1d10+1 HP. Consumes both Acid Breath (Recharge 5-6) and Second Wind (1/Short Rest).',
    restore:'short'
  },
  tinkle:{
    name:'SHELL GAMBIT',
    icon:'🐢',
    desc:'Enter Shell Defense (AC 21, prone) as bait. On your next turn, emerge as a Bonus Action and execute a guaranteed Sneak Attack with Advantage — no ally adjacency required. The mark who swung at the shell is the perfect setup. Consumes Shell Defense + 1 Sneak Attack use.',
    restore:'short'
  },
  pebble:{
    name:'PITCH PERFECT',
    icon:'🎭',
    desc:'The ultimate con: cast Charm Person, spend a Bardic Inspiration die, and burn a Lucky Point in one fluid pitch. The target makes their WIS save at Disadvantage, and on failure treats Pebble as a trusted friend. Whatever follows, the sale is made. Consumes 1 spell slot + 1 Bardic Inspiration + 1 Lucky Point.',
    restore:'short'
  }
};

function toggleSuperpower(pcId){
  if(!state.plugins?.find(p=>p.id==='superpowers'))return;
  const pc=state.pcs.find(p=>p.id===pcId);
  if(!pc)return;
  if(!pc.spUsed)pc.spUsed={};
  pc.spUsed[pcId]=!pc.spUsed[pcId];
  save();
  renderSuperpowers();
}

function renderSuperpowers(){
  const panel=document.getElementById('superpowers-panel');
  const cards=document.getElementById('sp-cards');
  if(!panel||!cards)return;
  const installed=(state.plugins||[]).find(p=>p.id==='superpowers');
  panel.style.display=installed?'block':'none';
  if(!installed)return;
  cards.innerHTML=state.pcs.map(pc=>{
    const sp=SUPERPOWERS[pc.id];
    if(!sp)return '';
    const used=!!(pc.spUsed&&pc.spUsed[pc.id]);
    return '<div class="sp-card'+(used?' sp-active':'')+'">'
      +'<div class="sp-card-header">'
        +'<span style="font-size:22px">'+sp.icon+'</span>'
        +'<div style="flex:1">'
          +'<div class="sp-name">'+esc(sp.name)+'</div>'
          +'<div class="sp-pc-name">'+esc(pc.name)+' \xb7 '+esc(pc.race)+' '+esc(pc.class)+'</div>'
        +'</div>'
        +'<span class="sp-charge '+(used?'spent':'ready')+'" style="flex-shrink:0">'+(used?'⬛ SPENT':'✦ READY')+'</span>'
      +'</div>'
      +'<div class="sp-desc">'+esc(sp.desc)+'</div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
        +'<button class="btn sm '+(used?'red':'purple')+'" onclick="toggleSuperpower(\''+esc(pc.id)+'\')">'+(used?'↺ Reset':'⚡ Activate')+'</button>'
        +'<span style="font-size:10px;color:var(--text-dim)">Restores on: Short or Long Rest</span>'
      +'</div>'
    +'</div>';
  }).join('');
}

// ═══ NEW INTERFACE — HUD + DRAWER + DOCK ═══

const _DRAWER_TABS=['tab-party','tab-world','tab-wagon','tab-combat','tab-session','tab-ait','tab-ait-chk','tab-dev','tab-setup'];
const _DRAWER_TITLES={'tab-party':'Party','tab-world':'Journal','tab-wagon':'Cargo','tab-combat':'Combat','tab-session':'Session','tab-ait':'AI Tools','tab-ait-chk':'Tools','tab-dev':'Dev','tab-setup':'Setup'};

function renderHUD(){
  const mosaic=document.getElementById('hud-mosaic');
  if(!mosaic)return;
  mosaic.innerHTML='';
  const pcs=state.pcs||[];
  pcs.forEach((pc,i)=>{
    const hp=parseInt(pc.hp)||0;
    const max=parseInt(pc.hp_max)||1;
    const pct=Math.max(0,Math.min(100,(hp/max)*100));
    const sparkCls=pct<20?'danger':pct<55?'warn':'ok';
    const tile=document.createElement('div');
    tile.className='hud-tile';
    tile.id='hud-tile-'+i;
    tile.onclick=(function(idx){return function(){openPCOverview(idx);};})(i);
    const hasCond=(pc.conditions||[]).length>0;
    const hasConc=!!pc.concentrating;
    const condDot=hasCond?'<span style="display:inline-block;width:5px;height:5px;background:var(--red);border-radius:50%;margin-left:3px;vertical-align:middle"></span>':'';
    const concDot=hasConc?'<span style="display:inline-block;width:5px;height:5px;background:var(--purple-bright);border-radius:50%;margin-left:2px;vertical-align:middle"></span>':'';
    tile.innerHTML='<div class="hud-name">'+esc(pc.name||'PC')+condDot+concDot+'</div>'
      +'<div class="hud-val">'+hp+'<span style="font-size:9px;color:var(--text-dim)">/'+max+'</span></div>'
      +'<div class="hud-spark '+sparkCls+'" style="width:'+pct.toFixed(1)+'%"></div>';
    mosaic.appendChild(tile);
  });
  // Animal tiles (unified: draft, mount, familiar, companion)
  (state.wagon.animals||[]).forEach((a,ai)=>{
    if(!a.name||!a.hp_max)return;
    const ahp=parseInt(a.hp)||0,amax=parseInt(a.hp_max)||1;
    const apct=Math.max(0,Math.min(100,(ahp/amax)*100));
    const asparkCls=apct<20?'danger':apct<55?'warn':'ok';
    const icon=a.role==='draft'?'🐂':a.role==='mount'?'🐴':a.role==='familiar'?'🦉':'🐾';
    const color=a.role==='familiar'?'var(--purple-bright)':'var(--green)';
    const tile=document.createElement('div');
    tile.className='hud-tile';
    tile.onclick=(function(idx){return function(){openAnimalOverview(idx);};})(ai);
    tile.innerHTML='<div class="hud-name" style="color:'+color+'">'+icon+' '+esc(a.name)+'</div>'
      +'<div class="hud-val">'+ahp+'<span style="font-size:9px;color:var(--text-dim)">/'+amax+'</span></div>'
      +'<div class="hud-spark '+asparkCls+'" style="width:'+apct.toFixed(1)+'%"></div>';
    mosaic.appendChild(tile);
  });
  // GP
  const gp=parseFloat((state.treasuryData||{}).gp)||0;
  const gpEl=document.getElementById('hud-gp');
  if(gpEl)gpEl.textContent=(gp%1===0?Math.round(gp):gp.toFixed(1))+'gp';
  // Sync dot
  const syncDot=document.getElementById('as-dot');
  // (already managed by existing save() / justSave() code via class toggles)
}

function renderTurnTracker(){
  const el=document.getElementById('turn-tracker');if(!el)return;
  const c=state.combat;
  if(!c||!c.active||!(c.list||[]).length){el.style.display='none';return;}
  el.style.display='flex';
  const curIdx=c.currentIdx||0;
  el.innerHTML='<span onclick="endCombat()" style="padding:2px 6px;border-radius:4px;color:var(--red);border:1px solid var(--red);font-size:10px;flex-shrink:0;cursor:pointer;font-weight:600" title="End combat">✕</span>'+c.list.map((ent,i)=>{
    const isCur=i===curIdx;
    const isPC=ent.isPC;
    const hp=parseInt(ent.hp)||0;
    const dead=hp<=0;
    const color=isCur?'var(--gold-bright)':dead?'var(--text-dim)':isPC?'var(--green)':'var(--red)';
    const bg=isCur?'var(--surface3)':'transparent';
    const border=isCur?'1px solid var(--gold-dim)':'1px solid transparent';
    return `<span style="padding:2px 6px;border-radius:4px;color:${color};background:${bg};border:${border};font-weight:${isCur?'700':'400'};opacity:${dead?.4:1};font-size:10px;flex-shrink:0${isCur?';text-decoration:underline':''}">${esc(ent.name.slice(0,8))}${isPC?'':' '+hp}</span>`;
  }).join('');
}
function openAnimalOverview(idx){
  const a=(state.wagon.animals||[])[idx];if(!a)return;
  const hp=parseInt(a.hp)||0,max=parseInt(a.hp_max)||1;
  const pct=Math.max(0,Math.min(100,(hp/max)*100));
  const hpCol=hp<=0?'var(--red)':pct<25?'#c04a3a':pct<50?'var(--gold)':'var(--green)';
  const icon=a.role==='draft'?'🐂':a.role==='mount'?'🐴':a.role==='familiar'?'🦉':'🐾';
  const titleEl=document.getElementById('grit-ov-title');
  const bodyEl=document.getElementById('grit-ov-body');
  if(titleEl)titleEl.textContent=icon+' '+esc(a.name||'Animal');
  const feedRow=a.role==='draft'?`<div style="display:flex;gap:6px;margin-top:8px">
    <button class="btn sm" onclick="state.wagon.animals[${idx}].feed='fed';save();openAnimalOverview(${idx});renderHUD()" style="flex:1;border-color:var(--green);color:var(--green)">✅ Fed</button>
    <button class="btn sm" onclick="state.wagon.animals[${idx}].feed='hungry';save();openAnimalOverview(${idx});renderHUD()" style="flex:1;border-color:var(--gold);color:var(--gold-bright)">⚠ Hungry</button>
    <button class="btn sm" onclick="state.wagon.animals[${idx}].feed='starving';save();openAnimalOverview(${idx});renderHUD()" style="flex:1;border-color:var(--red);color:var(--red)">🔴 Starving</button>
  </div>`:'';
  const feedEmoji=a.feed?({fed:'✅',hungry:'⚠',starving:'🔴'}[a.feed]||'')+'  '+a.feed+' · ':'';
  if(bodyEl)bodyEl.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
      <span style="font-size:11px;color:var(--text-dim)">${esc(a.type||a.role||'animal')} · AC ${a.ac||10}${a.feed?' · '+feedEmoji:''}${a.conditions&&a.conditions!=='None'?' · '+esc(a.conditions):''}</span>
      <span style="font-size:20px;font-weight:700;color:${hpCol};font-family:var(--mono);margin-left:auto">${hp}<span style="font-size:12px;color:var(--text-dim)">/${max}</span></span>
    </div>
    <div class="hp-bar-wrap" style="margin-bottom:8px"><div class="hp-bar-fill" style="width:${pct}%;background:${hpCol}"></div></div>
    ${a.notes?`<div style="font-size:10px;color:var(--text-dim);white-space:pre-line;line-height:1.5;margin-bottom:8px">${esc(a.notes)}</div>`:''}
    <div style="display:flex;gap:6px;align-items:center">
      <span style="font-size:11px;color:var(--text-dim)">HP:</span>
      <input type="number" id="gov-amt" style="width:52px;text-align:center;padding:4px;font-size:12px" placeholder="Amt">
      <button class="btn sm green" onclick="(function(){const v=parseInt(document.getElementById('gov-amt').value);if(!v)return;const a=state.wagon.animals[${idx}];a.hp=Math.min(a.hp_max,(a.hp||0)+v);document.getElementById('gov-amt').value='';save();openAnimalOverview(${idx});renderHUD();})()" style="padding:3px 10px">Heal</button>
      <button class="btn sm red" onclick="(function(){const v=parseInt(document.getElementById('gov-amt').value);if(!v)return;const a=state.wagon.animals[${idx}];a.hp=Math.max(0,(a.hp||0)-v);document.getElementById('gov-amt').value='';save();openAnimalOverview(${idx});renderHUD();})()" style="padding:3px 10px">Dmg</button>
    </div>
    ${feedRow}
  `;
  document.getElementById('grit-ov')?.classList.add('is-open');
  document.getElementById('grit-ov-bd')?.classList.add('is-open');
}
function openFamiliarOverview(pcIdx){
  const pc=state.pcs[pcIdx];if(!pc||!pc.familiar)return;
  const a=(state.wagon.animals||[]).findIndex(an=>an.ownerId===pc.id||an.name===pc.familiar.name);
  if(a>-1)openAnimalOverview(a);
}
function closeFamiliarOverview(){closeGritOverview();}
function toggleDeathSave(idx,type,slot){
  const pc=state.pcs[idx];if(!pc)return;
  if(!pc.death_saves)pc.death_saves={successes:0,failures:0};
  const key=type==='success'?'successes':'failures';
  const cur=pc.death_saves[key];
  pc.death_saves[key]=cur>slot?slot:slot+1;
  pc.death_saves[key]=Math.max(0,Math.min(3,pc.death_saves[key]));
  if(pc.death_saves.successes>=3){pc.hp=1;pc.death_saves={successes:0,failures:0};mechToast('⬤ '+esc(pc.name)+' stabilized!','green');}
  if(pc.death_saves.failures>=3){pc.death_saves={successes:0,failures:0};mechToast('💀 '+esc(pc.name)+' has died.','red');}
  saveRefresh();renderPCOverview();renderHUD();
}
function toggleInspiration(idx){
  const pc=state.pcs[idx];if(!pc)return;
  pc.inspiration=!pc.inspiration;
  if(pc.inspiration&&navigator.vibrate)try{navigator.vibrate([10,30,10]);}catch(e){}
  saveRefresh();
}
// ═══ LOCATION JOURNAL ═══
let _locViewMode='list';
let _mapPlaceId=null;
let _pinMenuId=null;
const _LOC_MAP_KEY='tt_area_map';
let _areaMapCache=undefined;
function _getAreaMap(){if(_areaMapCache!==undefined)return _areaMapCache;try{_areaMapCache=localStorage.getItem(_LOC_MAP_KEY)||null;}catch(e){_areaMapCache=null;}return _areaMapCache;}
function _setAreaMap(dataUrl){try{localStorage.setItem(_LOC_MAP_KEY,dataUrl);_areaMapCache=dataUrl;return true;}catch(e){toast('Map too large to store — try a smaller image');return false;}}
function _removeAreaMap(){try{localStorage.removeItem(_LOC_MAP_KEY);}catch(e){}_areaMapCache=null;}

function renderLocations(){
  const c=document.getElementById('locations-panel-content');
  if(!c)return;
  const locs=state.locations||[];
  const hasMap=!!_getAreaMap();
  if(_locViewMode==='map'&&!hasMap)_locViewMode='list';
  const typeIcon={town:'🏘',city:'🏙',camp:'⛺',ruin:'🏚',dungeon:'🗝',waypoint:'📍'};
  const repColor=(loc)=>{const d=(loc.rep?.disposition||'').toLowerCase();return d==='friendly'||d==='allied'?'var(--green)':d==='hostile'||d==='burned'?'var(--red)':'var(--text-dim)';};

  const toggleBtns=`<div style="display:flex;gap:4px;align-items:center">
    <button class="btn sm${_locViewMode==='list'?' active':''}" onclick="setLocView('list')" style="font-size:10px;padding:3px 8px;${_locViewMode==='list'?'background:var(--gold);color:var(--bg);border-color:var(--gold)':''}">📋 List</button>
    <button class="btn sm${_locViewMode==='map'?' active':''}" onclick="setLocView('map')" style="font-size:10px;padding:3px 8px;${_locViewMode==='map'?'background:var(--gold);color:var(--bg);border-color:var(--gold)':''}${!hasMap?';opacity:.4;pointer-events:none':''}">🗺 Map</button>
  </div>`;

  const headerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;padding:0 0 6px;gap:6px">
    <div style="font-size:11px;color:var(--text-dim)">${locs.length} loc${locs.length===1?'':'s'}</div>
    ${toggleBtns}
    <div style="display:flex;gap:4px">
      <button class="btn sm" onclick="uploadAreaMap()" title="${hasMap?'Change map image':'Upload map image'}" style="font-size:10px;padding:3px 8px">${hasMap?'🗺 Change':'🗺 Upload'}</button>
      ${locs.length>3?'<button class="btn sm" onclick="dedupLocations()" style="font-size:9px;padding:2px 6px" title="Remove duplicate locations">🧹</button>':''}
      <button class="btn sm" onclick="addLocationManual()" style="font-size:10px;padding:3px 8px">+ Add</button>
    </div>
  </div>`;

  if(_locViewMode==='map'){
    c.innerHTML=headerHTML+_renderAreaMap(locs,typeIcon,repColor);
    _initPinDrag();
    return;
  }

  const NODE_R=20,STEP_X=82,PAD_X=38,SVG_H=160,CY=78;
  const svgW=Math.max(300,PAD_X*2+Math.max(0,locs.length-1)*STEP_X);
  let svgLines='',svgNodes='';
  locs.forEach((loc,i)=>{
    const x=PAD_X+i*STEP_X, y=CY+(i%2===0?-22:22);
    if(i>0){
      const px=PAD_X+(i-1)*STEP_X, py=CY+((i-1)%2===0?-22:22);
      svgLines+=`<line x1="${px}" y1="${py}" x2="${x}" y2="${y}" stroke="var(--surface3)" stroke-width="2" stroke-dasharray="5 3"/>`;
    }
    const isCur=loc.status==='current';
    const fill=isCur?'var(--gold)':'var(--surface3)';
    const hasQuest=(state.quests||[]).some(q=>q.status==='active'&&q.text&&q.text.toLowerCase().includes(loc.name.toLowerCase()));
    const stroke=hasQuest?'var(--green)':repColor(loc);
    const labelY=y+(y<CY?-(NODE_R+8):NODE_R+14);
    const lbl=loc.name.length>10?loc.name.slice(0,9)+'…':loc.name;
    svgNodes+=`<g onclick="openLocationDetail('${loc.id}')" style="cursor:pointer">
      <circle cx="${x}" cy="${y}" r="${NODE_R}" fill="${fill}" stroke="${stroke}" stroke-width="${isCur?3:2}"/>
      <text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" fill="${isCur?'var(--bg)':'var(--text-bright)'}" pointer-events="none">${typeIcon[loc.type]||'📍'}</text>
      <text x="${x}" y="${labelY}" text-anchor="middle" font-size="9" fill="${isCur?'var(--gold-bright)':'var(--text)'}" pointer-events="none">${esc(lbl)}</text>
    </g>`;
  });
  const nodeMapHTML=locs.length
    ?`<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;padding:4px 0 6px"><svg viewBox="0 0 ${svgW} ${SVG_H}" width="${svgW}" height="${SVG_H}" style="display:block;overflow:visible">${svgLines}${svgNodes}</svg></div>`
    :`<div style="text-align:center;color:var(--text-dim);font-size:12px;padding:36px 20px;line-height:1.8">No locations recorded.<br>The DM logs locations automatically as you explore.</div>`;
  const listHTML=locs.map(loc=>{
    const isCur=loc.status==='current';
    return`<div onclick="openLocationDetail('${loc.id}')" style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:1px solid var(--border);cursor:pointer;background:${isCur?'var(--surface2)':'transparent'}">
      <span style="font-size:15px">${typeIcon[loc.type]||'📍'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;color:${isCur?'var(--gold-bright)':'var(--text-bright)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${isCur?'<span style="font-size:7px;vertical-align:middle;margin-right:3px">●</span>':''}${esc(loc.name)}</div>
        <div style="font-size:10px;color:var(--text-dim)">${loc.type||'waypoint'} · <span style="color:${repColor(loc)}">${loc.rep?.disposition||'Neutral'}</span>${loc.lastVisited?' · '+esc(loc.lastVisited):''}</div>
      </div>
      <span style="font-size:12px;color:var(--text-dim)">›</span>
    </div>`;
  }).join('');
  c.innerHTML=`
    ${headerHTML}
    ${nodeMapHTML}
    ${listHTML?`<div style="border:1px solid var(--border);border-radius:6px;margin-top:6px;overflow:hidden">${listHTML}</div>`:''}
  `;
}

function _renderAreaMap(locs,typeIcon,repColor){
  const mapUrl=_getAreaMap();
  if(!mapUrl)return'<div style="text-align:center;color:var(--text-dim);padding:24px;font-size:12px">No map uploaded.</div>';
  const _validPos=l=>l.mapPos&&typeof l.mapPos.x==='number'&&typeof l.mapPos.y==='number';
  const placedLocs=locs.filter(_validPos);
  const unplacedLocs=locs.filter(l=>!_validPos(l));

  const pinSVG=(fill,stroke)=>`<svg width="20" height="26" viewBox="0 0 20 26"><path class="pin-fill" d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 16 10 16s10-8.5 10-16C20 4.5 15.5 0 10 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><circle cx="10" cy="10" r="4" fill="rgba(0,0,0,.3)"/></svg>`;

  const pinsHTML=placedLocs.map(loc=>{
    const isCur=loc.status==='current';
    const fill=isCur?'var(--gold-bright)':'var(--surface3)';
    const stroke=repColor(loc);
    const selected=_pinMenuId===loc.id;
    return`<div class="map-pin${isCur?' pin-current':' pin-visited'}${selected?' pin-selected':''}" data-loc-id="${esc(loc.id)}" style="left:${loc.mapPos.x}%;top:${loc.mapPos.y}%" onclick="event.stopPropagation();pinAction('${esc(loc.id)}')" title="${esc(loc.name)} — tap for actions">
      ${pinSVG(fill,stroke)}
      <span class="map-pin-label">${esc(loc.name.length>14?loc.name.slice(0,13)+'…':loc.name)}</span>
    </div>`;
  }).join('');

  const selectedLoc=_pinMenuId?placedLocs.find(l=>l.id===_pinMenuId):null;
  const pinBar=selectedLoc?`<div class="pin-action-bar" onclick="event.stopPropagation()">
    <span class="pin-action-name">${typeIcon[selectedLoc.type]||'📍'} ${esc(selectedLoc.name)}</span>
    <button class="btn sm" onclick="movePin('${esc(selectedLoc.id)}')">↻ Move</button>
    <button class="btn sm" onclick="unpinFromMap('${esc(selectedLoc.id)}')">✕ Unpin</button>
    <button class="btn sm" onclick="closePinMenu();openLocationDetail('${esc(selectedLoc.id)}')">⋯ Details</button>
  </div>`:'';

  const placeChips=locs.map(loc=>{
    const isActive=_mapPlaceId===loc.id;
    const hasPos=!!loc.mapPos;
    return`<span class="map-place-chip${isActive?' mpc-active':''}${hasPos?' mpc-placed':''}" onclick="startMapPlace('${esc(loc.id)}')">${typeIcon[loc.type]||'📍'} ${esc(loc.name.length>12?loc.name.slice(0,11)+'…':loc.name)}${hasPos?` <span class="mpc-unpin" onclick="event.stopPropagation();unpinFromMap('${esc(loc.id)}')" title="Remove from map">✕</span>`:''}</span>`;
  }).join('');

  const placeMsg=_mapPlaceId?`<div class="map-place-msg">Tap the map to place <b>${esc((locs.find(l=>l.id===_mapPlaceId)||{}).name||'')}</b> · <a href="#" onclick="event.preventDefault();cancelMapPlace()" style="color:var(--text-dim)">cancel</a></div>`:'';

  return`
    ${placeMsg}
    <div class="area-map-wrap${_mapPlaceId?' placing':''}" id="area-map-container" onclick="handleMapTap(event)">
      <img src="${mapUrl}" alt="Area map" draggable="false">
      ${pinsHTML}
    </div>
    ${pinBar}
    ${unplacedLocs.length?`<div style="font-size:10px;color:var(--text-dim);padding:4px 0 2px">Unplaced (${unplacedLocs.length}) — tap a chip then tap the map:</div>`:''}
    <div class="map-toolbar">${placeChips}</div>
    <button class="btn sm" onclick="removeAreaMap()" style="font-size:10px;padding:3px 8px;border-color:var(--red);color:var(--red);margin-top:4px">Remove Map</button>
  `;
}

function uploadAreaMap(){
  const inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';
  inp.onchange=()=>{
    const file=inp.files[0];if(!file)return;
    if(file.size>3.5*1024*1024){toast('Image must be under 3.5 MB (base64 expands ~33%)');return;}
    const reader=new FileReader();
    reader.onload=()=>{
      if(!_setAreaMap(reader.result))return;
      _locViewMode='map';
      renderLocations();
      toast('Map uploaded');
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function removeAreaMap(){
  if(!confirm('Remove the current map image?'))return;
  _removeAreaMap();
  (state.locations||[]).forEach(l=>{l.mapPos=null;});
  save();
  _locViewMode='list';
  renderLocations();
  toast('Map removed');
}

function setLocView(mode){_locViewMode=mode;renderLocations();}

function startMapPlace(locId){
  _mapPlaceId=_mapPlaceId===locId?null:locId;
  _pinMenuId=null;
  renderLocations();
}

function cancelMapPlace(){
  _mapPlaceId=null;
  renderLocations();
}

function handleMapTap(e){
  if(_pinMenuId){_pinMenuId=null;renderLocations();if(!_mapPlaceId)return;}
  if(!_mapPlaceId)return;
  const container=document.getElementById('area-map-container');
  if(!container)return;
  const rect=container.getBoundingClientRect();
  const x=Math.max(0,Math.min(100,((e.clientX-rect.left)/rect.width)*100));
  const y=Math.max(0,Math.min(100,((e.clientY-rect.top)/rect.height)*100));
  const loc=(state.locations||[]).find(l=>l.id===_mapPlaceId);
  if(!loc)return;
  loc.mapPos={x:Math.round(x*100)/100,y:Math.round(y*100)/100};
  save();
  _mapPlaceId=null;
  renderLocations();
  toast(`${loc.name} placed on map`);
}
function pinAction(locId){
  _pinMenuId=_pinMenuId===locId?null:locId;
  renderLocations();
}
function closePinMenu(){
  _pinMenuId=null;
}
function movePin(locId){
  _pinMenuId=null;
  _mapPlaceId=locId;
  _locViewMode='map';
  closeLocDetail();
  renderLocations();
}
function unpinFromMap(locId){
  const loc=(state.locations||[]).find(l=>l.id===locId);
  if(!loc)return;
  loc.mapPos=null;
  _pinMenuId=null;
  save();
  renderLocations();
  toast(`${loc.name} removed from map`);
}
function _initPinDrag(){
  const container=document.getElementById('area-map-container');if(!container)return;
  const pins=container.querySelectorAll('.map-pin[data-loc-id]');
  pins.forEach(pin=>{
    let dragTimer=null,isDragging=false,startX,startY;
    const start=(cx,cy,e)=>{
      startX=cx;startY=cy;isDragging=false;
      dragTimer=setTimeout(()=>{
        isDragging=true;pin.style.zIndex='10';pin.style.opacity='.8';
        pin.style.transition='none';
        if(e.cancelable)e.preventDefault();
      },350);
    };
    const move=(cx,cy,e)=>{
      if(!isDragging){
        if(Math.abs(cx-startX)>6||Math.abs(cy-startY)>6){clearTimeout(dragTimer);dragTimer=null;}
        return;
      }
      if(e.cancelable)e.preventDefault();
      const rect=container.getBoundingClientRect();
      const x=Math.max(0,Math.min(100,((cx-rect.left)/rect.width)*100));
      const y=Math.max(0,Math.min(100,((cy-rect.top)/rect.height)*100));
      pin.style.left=x+'%';pin.style.top=y+'%';
    };
    const end=(cx,cy)=>{
      clearTimeout(dragTimer);
      if(isDragging){
        isDragging=false;pin.style.zIndex='';pin.style.opacity='';pin.style.transition='';
        const rect=container.getBoundingClientRect();
        const x=Math.max(0,Math.min(100,((cx-rect.left)/rect.width)*100));
        const y=Math.max(0,Math.min(100,((cy-rect.top)/rect.height)*100));
        const locId=pin.dataset.locId;
        const loc=(state.locations||[]).find(l=>l.id===locId);
        if(loc){loc.mapPos={x:Math.round(x*100)/100,y:Math.round(y*100)/100};save();}
      }
    };
    pin.addEventListener('pointerdown',e=>{pin.setPointerCapture(e.pointerId);start(e.clientX,e.clientY,e);});
    pin.addEventListener('pointermove',e=>{move(e.clientX,e.clientY,e);});
    pin.addEventListener('pointerup',e=>{end(e.clientX,e.clientY);});
    pin.addEventListener('pointercancel',()=>{clearTimeout(dragTimer);isDragging=false;pin.style.zIndex='';pin.style.opacity='';pin.style.transition='';});
    pin.style.touchAction='none';
  });
}
function openLocationDetail(id){
  const loc=(state.locations||[]).find(l=>l.id===id);if(!loc)return;
  const _dm=state._locDmMode!==false;
  const typeIcon={town:'🏘',city:'🏙',camp:'⛺',ruin:'🏚',dungeon:'🗝',waypoint:'📍'};
  const typeLabels={town:'Town',city:'City',camp:'Camp',ruin:'Ruin',dungeon:'Dungeon',waypoint:'Waypoint'};
  const repC=(loc)=>{const d=(loc.rep?.disposition||'').toLowerCase();return d==='friendly'||d==='allied'?'var(--green)':d==='hostile'||d==='burned'?'var(--red)':'var(--text-dim)';};
  const visHist=(loc.history||[]).filter(h=>_dm||!h.dmOnly);
  const histHTML=visHist.length
    ?visHist.map(h=>`<div style="display:flex;gap:8px;margin-bottom:6px;align-items:flex-start"><span style="font-size:10px;color:var(--text-dim);min-width:58px;padding-top:1px">${esc(h.ts)}</span><span style="flex:1;font-size:12px;line-height:1.4">${esc(h.text)}</span>${h.dmOnly?'<span style="font-size:9px;padding:1px 4px;border:1px solid var(--border);border-radius:3px;color:var(--text-dim);white-space:nowrap">DM</span>':''}</div>`).join('')
    :'<div style="font-size:11px;color:var(--text-dim)">No history recorded.</div>';
  const npcNames=[...new Set([...(loc.npcs||[]),...(state.npcs||[]).filter(n=>n.lastSeen&&n.lastSeen.toLowerCase()===loc.name.toLowerCase()&&n.status!=='deceased').map(n=>n.name)])];
  const npcHTML=npcNames.length
    ?npcNames.map(name=>{const npc=(state.npcs||[]).find(n=>n.name.toLowerCase()===name.toLowerCase());const dcol=npc?(npc.disposition==='Friendly'||npc.disposition==='Ally'?'var(--green)':npc.disposition==='Hostile'||npc.disposition==='Enemy'?'var(--red)':'var(--text-dim)'):'var(--text-dim)';return`<span style="display:inline-block;background:var(--surface3);border-radius:10px;padding:2px 8px;font-size:11px;margin:2px 2px 0 0;border-left:3px solid ${dcol}">${esc(name)}${npc?' <span style="font-size:9px;color:'+dcol+'">'+esc(npc.disposition||'')+'</span>':''}</span>`;}).join('')
    :'<span style="font-size:11px;color:var(--text-dim)">None recorded</span>';
  const locQuests=(state.quests||[]).filter(q=>q.status==='active'&&(q.location?.toLowerCase()===loc.name.toLowerCase()||(q.text&&q.text.toLowerCase().includes(loc.name.toLowerCase()))));
  const questHTML=locQuests.length?locQuests.map(q=>`<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:12px"><span style="color:var(--green);font-size:10px">🟢</span><span style="flex:1">${esc(q.text)}</span></div>`).join(''):'';
  const locConseq=(state.consequences||[]).filter(cs=>!cs.resolved&&cs.location&&cs.location.toLowerCase()===loc.name.toLowerCase());
  const CSQ_C=CSQ_COLORS;
  const conseqHTML=locConseq.length?locConseq.map(cs=>`<div style="font-size:12px;padding:4px 0;border-left:3px solid ${CSQ_C[cs.type]||'var(--text-dim)'};padding-left:8px;margin-bottom:4px"><span style="font-size:9px;color:${CSQ_C[cs.type]||'var(--text-dim)'};text-transform:uppercase;font-weight:700">${cs.type||'background'}</span> ${esc(cs.text)}</div>`).join(''):'';
  const townRep=(state.worldData?.townReputation||[]).find(t=>t.town.toLowerCase()===loc.name.toLowerCase());
  const repHTML=townRep?`<div style="display:flex;align-items:center;gap:6px;font-size:12px;padding:6px 8px;background:var(--surface2);border-radius:6px;margin-bottom:8px"><span style="font-weight:600;color:${repC(loc)}">Rep: ${esc(townRep.status)}</span>${townRep.notes?`<span style="flex:1;font-size:11px;color:var(--text-dim)">${esc(townRep.notes)}</span>`:''}</div>`:'';
  const locIncome=(state.treasuryData?.incomeLog||[]).filter(e=>e.location&&e.location.toLowerCase()===loc.name.toLowerCase());
  const incomeHTML=locIncome.length?`<details class="panel" style="margin-bottom:8px"><summary style="cursor:pointer;list-style:none;font-size:11px;font-weight:600;color:var(--gold)">Income (${locIncome.length})</summary><div style="margin-top:6px">${locIncome.map(e=>`<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span>${esc(e.desc)}</span><span style="color:${e.type==='in'?'var(--green)':'var(--red)'}">${e.type==='in'?'+':'−'}${e.amt}gp</span></div>`).join('')}</div></details>`:'';
  const invHTML=_dm&&loc.investments?.length
    ?`<details class="panel" style="margin-bottom:8px"><summary style="cursor:pointer;list-style:none;display:flex;align-items:center;font-size:11px;font-weight:600;color:var(--gold)">Investments</summary><div style="margin-top:6px">${loc.investments.map(inv=>`<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;font-size:12px"><span style="flex:1">${esc(inv.desc)}</span><span style="color:var(--gold)">${inv.amount}gp</span><span style="font-size:10px;color:var(--text-dim)">since ${esc(inv.startDay)}</span></div>`).join('')}</div></details>`:'';
  const titleEl=document.getElementById('loc-ov-title');
  const bodyEl=document.getElementById('loc-ov-body');
  if(titleEl)titleEl.innerHTML=`${typeIcon[loc.type]||'📍'} ${esc(loc.name)} <span style="font-size:10px;color:var(--text-dim);font-weight:400;margin-left:4px">${typeLabels[loc.type]||''}</span>`;
  if(bodyEl)bodyEl.innerHTML=`
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;align-items:center">
      <span style="font-size:11px;padding:2px 8px;border-radius:10px;border:1px solid var(--border);color:var(--text-dim)">${loc.status||'visited'}</span>
      <span style="font-size:11px;color:${repC(loc)}">${loc.rep?.disposition||'Neutral'}</span>
      ${loc.firstVisited?`<span style="font-size:10px;color:var(--text-dim)">First: ${esc(loc.firstVisited)}</span>`:''}
      ${loc.lastVisited?`<span style="font-size:10px;color:var(--text-dim)">Last: ${esc(loc.lastVisited)}</span>`:''}
      <button class="btn sm" style="margin-left:auto;font-size:10px;padding:2px 8px" onclick="toggleLocDmMode('${id}')">${_dm?'👁 DM':'👤 Player'}</button>
    </div>
    ${repHTML}
    <div style="margin-bottom:10px">
      <div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:4px">NPCs <button class="btn sm" style="font-size:10px;padding:2px 6px;margin-left:6px" onclick="addLocNPC('${id}')">+ Add</button></div>
      <div>${npcHTML}</div>
    </div>
    ${questHTML?`<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:4px">Active Quests</div>${questHTML}</div>`:''}
    ${conseqHTML?`<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:4px">Active Consequences</div>${conseqHTML}</div>`:''}
    <details class="panel" style="margin-bottom:8px" open>
      <summary style="cursor:pointer;list-style:none;display:flex;align-items:center;font-size:11px;font-weight:600;color:var(--gold)">History <button class="btn sm" style="font-size:10px;padding:2px 6px;margin-left:auto" onclick="event.stopPropagation();addLocHistory('${id}')">+ Entry</button></summary>
      <div style="margin-top:8px">${histHTML}</div>
    </details>
    ${invHTML}
    ${incomeHTML}
    <div class="panel" style="margin-bottom:8px;padding:8px 10px">
      <div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:4px">Player Notes</div>
      <textarea style="width:100%;min-height:55px;font-size:12px;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:6px;box-sizing:border-box;resize:vertical" oninput="updateLocNotes('${id}','player',this.value)" placeholder="Notes visible to players...">${esc(loc.playerNotes||'')}</textarea>
    </div>
    ${_dm?`<div class="panel" style="margin-bottom:8px;padding:8px 10px"><div style="font-size:11px;font-weight:600;color:var(--gold);margin-bottom:4px">DM Notes</div><textarea style="width:100%;min-height:55px;font-size:12px;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:6px;box-sizing:border-box;resize:vertical" oninput="updateLocNotes('${id}','dm',this.value)" placeholder="DM-only notes...">${esc(loc.dmNotes||'')}</textarea></div>`:''}
    <div style="display:flex;gap:6px;justify-content:space-between;flex-wrap:wrap;margin-top:4px">
      <button class="btn sm" onclick="setLocStatus('${id}','current')" style="border-color:var(--gold);color:var(--gold)">📍 Set Current</button>
      <div style="display:flex;gap:6px">${_getAreaMap()?`<button class="btn sm" onclick="movePin('${id}')" style="border-color:var(--gold)">🗺 ${loc.mapPos?'Move':'Place'} on Map</button>${loc.mapPos?`<button class="btn sm" onclick="unpinFromMap('${id}');closeLocDetail()" style="border-color:var(--text-dim);color:var(--text-dim)">✕ Unplace</button>`:''}`:''}${_dm?`<button class="btn sm" onclick="addLocInvestment('${id}')">+ Invest</button>`:''}
        <button class="btn sm" style="border-color:var(--red);color:var(--red)" onclick="deleteLocation('${id}')">Delete</button>
      </div>
    </div>`;
  document.getElementById('loc-ov')?.classList.add('is-open');
  document.getElementById('loc-ov-bd')?.classList.add('is-open');
}
function closeLocDetail(){
  document.getElementById('loc-ov')?.classList.remove('is-open');
  document.getElementById('loc-ov-bd')?.classList.remove('is-open');
}
function toggleLocDmMode(id){state._locDmMode=state._locDmMode===false?true:false;save();openLocationDetail(id);}
function addLocationManual(){
  const name=(prompt('Location name:')||'').trim();if(!name)return;
  const typeStr=(prompt('Type (town/city/camp/ruin/dungeon/waypoint):','waypoint')||'waypoint').toLowerCase().trim();
  const validTypes=['town','city','camp','ruin','dungeon','waypoint'];
  const type=validTypes.includes(typeStr)?typeStr:'waypoint';
  const id='loc_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
  if(!Array.isArray(state.locations))state.locations=[];
  state.locations.push({id,name,type,status:'visited',firstVisited:state.worldData?.time||'',lastVisited:state.worldData?.time||'',rep:{disposition:'Neutral',notes:''},npcs:[],investments:[],history:[],dmNotes:'',playerNotes:'',mapPos:null});
  save();renderLocations();
}
function dedupLocations(){
  const all=state.locations||[];if(!all.length){toast('No locations to dedup');return;}
  const kept=[];let removed=0;
  all.forEach(loc=>{
    const nLow=(loc.name||'').toLowerCase().trim();
    if(!nLow){kept.push(loc);return;}
    if(kept.some(k=>(k.name||'').toLowerCase().trim()===nLow))removed++;
    else kept.push(loc);
  });
  if(!removed){toast('No duplicate locations found');return;}
  state.locations=kept;save();renderLocations();toast('Removed '+removed+' duplicate location'+(removed===1?'':'s'));
}
function updateLocNotes(id,field,value){
  const loc=state.locations.find(l=>l.id===id);if(!loc)return;
  if(field==='player')loc.playerNotes=value;else if(field==='dm')loc.dmNotes=value;
  save();
}
function addLocHistory(id){
  const text=(prompt('History entry:')||'').trim();if(!text)return;
  const loc=state.locations.find(l=>l.id===id);if(!loc)return;
  if(!Array.isArray(loc.history))loc.history=[];
  const dmOnly=state._locDmMode!==false&&!!confirm('Mark as DM-only?');
  loc.history.push({ts:state.worldData.time||'',text,dmOnly});
  save();openLocationDetail(id);
}
function addLocNPC(id){
  const name=(prompt('NPC name:')||'').trim();if(!name)return;
  const loc=state.locations.find(l=>l.id===id);if(!loc)return;
  if(!Array.isArray(loc.npcs))loc.npcs=[];
  if(!loc.npcs.includes(name))loc.npcs.push(name);
  save();openLocationDetail(id);
}
function addLocInvestment(id){
  const desc=(prompt('Investment description:')||'').trim();if(!desc)return;
  const amt=parseInt(prompt('Amount in GP:','0')||'0')||0;
  const loc=state.locations.find(l=>l.id===id);if(!loc)return;
  if(!Array.isArray(loc.investments))loc.investments=[];
  loc.investments.push({desc,amount:amt,startDay:state.worldData.time||'',notes:''});
  save();openLocationDetail(id);
}
function setLocStatus(id,status){
  const loc=state.locations.find(l=>l.id===id);if(!loc)return;
  if(status==='current')state.locations.forEach(l=>{if(l.status==='current')l.status='visited';});
  loc.status=status;
  if(status==='current')loc.lastVisited=state.worldData.time||'';
  save();openLocationDetail(id);renderLocations();
}
function deleteLocation(id){
  if(!confirm('Delete this location and all its history?'))return;
  state.locations=state.locations.filter(l=>l.id!==id);
  closeLocDetail();save();renderLocations();
}

function openLocationSeed(){
  // Collect location names from all sources
  const known=new Map(); // lowercase name → {name, type, disposition, npcs[], source[]}
  const merge=(name,patch)=>{
    const k=name.trim().toLowerCase();
    if(!k||k.length<2)return;
    const entry=known.get(k)||{name:name.trim(),type:'town',disposition:'neutral',npcs:[],sources:[]};
    if(patch.type)entry.type=patch.type;
    if(patch.disposition)entry.disposition=patch.disposition;
    if(patch.npc&&!entry.npcs.includes(patch.npc))entry.npcs.push(patch.npc);
    if(patch.src&&!entry.sources.includes(patch.src))entry.sources.push(patch.src);
    if(!known.has(k))entry.name=name.trim(); // preserve first-seen casing
    known.set(k,entry);
  };
  // Current location
  const cur=state.worldData?.location||'';
  if(cur)merge(cur,{type:'town',src:'current location'});
  // Travel log: "Day 3: Millhaven → Thornbury | note"
  (state.worldData?.travelLog||[]).forEach(line=>{
    const m=line.match(/:\s*(.+?)\s*→\s*(.+?)(\s*\||\s*$)/);
    if(m){merge(m[1].trim(),{type:'town',src:'travel log'});merge(m[2].split('|')[0].trim(),{type:'town',src:'travel log'});}
  });
  // Town reputation
  (state.worldData?.townReputation||[]).forEach(t=>{
    const disp=t.status==='friendly'?'friendly':t.status==='allied'?'allied':t.status==='burned'||t.status==='fled'?'hostile':'neutral';
    merge(t.town,{type:'town',disposition:disp,src:'town rep'});
  });
  // NPC lastSeen
  (state.npcs||[]).forEach(n=>{
    if(n.lastSeen)merge(n.lastSeen,{type:'town',npc:n.name,src:'NPC lastSeen'});
  });
  // Filter out names already in state.locations
  const existingNames=new Set((state.locations||[]).map(l=>l.name.toLowerCase()));
  const drafts=[...known.values()].filter(d=>!existingNames.has(d.name.toLowerCase()));
  // Set current status on the current-location entry
  drafts.forEach(d=>{if(d.sources?.includes('current location'))d.isCurrent=true;});

  const el=document.getElementById('loc-seed');
  const body=document.getElementById('loc-seed-body');
  if(!el||!body)return;
  if(!drafts.length){
    body.innerHTML='<p style="text-align:center;color:var(--text-dim);font-size:12px;padding:24px 0">All known locations are already in the journal.</p>';
  } else {
    body.innerHTML=`<p style="font-size:11px;color:var(--text-dim);margin-bottom:10px">Found ${drafts.length} location${drafts.length===1?'':'s'} not yet in your journal. Uncheck any you want to skip, then tap Add.</p>`+
      `<div id="loc-seed-list">`+
      drafts.map((d,i)=>`<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">`+
        `<input type="checkbox" id="lsd${i}" checked style="margin-top:3px;flex-shrink:0">`+
        `<label for="lsd${i}" style="flex:1;font-size:12px">`+
        `<div style="font-weight:600;color:var(--text-bright)">${esc(d.name)}${d.isCurrent?'<span style="color:var(--gold);font-size:10px;margin-left:5px">● current</span>':''}</div>`+
        `<div style="font-size:10px;color:var(--text-dim);margin-top:1px">${d.sources.join(', ')}${d.npcs.length?' · NPCs: '+d.npcs.slice(0,3).join(', '):''}</div>`+
        `</label>`+
        `<select id="lsd-type${i}" style="font-size:11px;padding:3px 5px;width:80px">`+
        ['town','city','camp','ruin','dungeon','waypoint'].map(t=>`<option value="${t}"${t===d.type?' selected':''}>${t}</option>`).join('')+
        `</select></div>`).join('')+
      `</div>`+
      `<button class="btn gold full" style="margin-top:14px" onclick="confirmLocationSeed()">Add Selected to Journal</button>`;
    window._locSeedDrafts=drafts;
  }
  document.getElementById('loc-seed-bd').classList.add('is-open');
  el.classList.add('is-open');
}
function closeLocSeed(){
  document.getElementById('loc-seed-bd')?.classList.remove('is-open');
  document.getElementById('loc-seed')?.classList.remove('is-open');
}
function confirmLocationSeed(){
  const drafts=window._locSeedDrafts||[];
  if(!Array.isArray(state.locations))state.locations=[];
  const added=[];
  drafts.forEach((d,i)=>{
    const chk=document.getElementById('lsd'+i);
    if(!chk||!chk.checked)return;
    const typeEl=document.getElementById('lsd-type'+i);
    const type=typeEl?typeEl.value:d.type;
    const status=d.isCurrent?'current':'visited';
    state.locations.push({
      id:'loc_'+Date.now()+'_'+i,
      name:d.name,type,status,
      rep:{disposition:d.disposition||'neutral',notes:''},
      npcs:d.npcs.slice(0,5),
      investments:[],history:[],
      dmNotes:'',playerNotes:'',mapPos:null,
      lastVisited:d.isCurrent?state.worldData?.time||'':''
    });
    added.push(d.name);
  });
  save();closeLocSeed();renderLocations();
  toast(`✓ Added ${added.length} location${added.length===1?'':'s'} to journal.`);
}

function openGritOverview(){
  const idx=(state.wagon.animals||[]).findIndex(a=>a.role==='draft');
  if(idx>-1)openAnimalOverview(idx);
}
function closeGritOverview(){
  document.getElementById('grit-ov')?.classList.remove('is-open');
  document.getElementById('grit-ov-bd')?.classList.remove('is-open');
}

function openDrawer(tabId){
  closeQAMenu();_closeAllOverlays();
  document.getElementById('drawer-subnav')?.style && (document.getElementById('drawer-subnav').style.display='none');
  const drawerBody=document.getElementById('drawer-body');
  if(!drawerBody)return;
  // Move all known drawer tabs into drawer-body if not already there
  _DRAWER_TABS.forEach(id=>{
    const el=document.getElementById(id);
    if(el&&el.parentNode!==drawerBody)drawerBody.appendChild(el);
    if(el)el.classList.remove('active');
  });
  // Show the requested tab
  const target=document.getElementById(tabId);
  if(target)target.classList.add('active');
  if(tabId==='tab-party'){renderCharTabs();renderSheets();}
  // Update title
  const titleEl=document.getElementById('drawer-title');
  if(titleEl)titleEl.textContent=_DRAWER_TITLES[tabId]||tabId;
  // Show backdrop + sheet
  document.getElementById('drawer-backdrop')?.classList.add('is-open');
  document.getElementById('drawer-sheet')?.classList.add('is-open');
  document.getElementById('context-strip')?.style && (document.getElementById('context-strip').style.visibility='hidden');
  // Sync nav
  const navMap={'tab-party':'party','tab-world':'logistics','tab-wagon':'logistics','tab-combat':'logistics','tab-session':'systems','tab-ait':'systems','tab-ait-chk':'systems','tab-dev':'systems','tab-setup':'systems'};
  const navKey=navMap[tabId]||null;
  ['log','party','logistics','systems'].forEach(k=>{
    document.getElementById('nav-btn-'+k)?.classList.toggle('active',k===navKey);
  });
  // Session sub-tab state
  if(tabId==='tab-session'){showSessionMode('play');}
  clearTabBadge(tabId);
  renderQAMenu();
  setTimeout(injectPanelFlags,150);
}

function closeDrawer(){
  document.getElementById('drawer-backdrop')?.classList.remove('is-open');
  document.getElementById('drawer-sheet')?.classList.remove('is-open');
  document.getElementById('context-strip')?.style && (document.getElementById('context-strip').style.visibility='');
  ['log','party','logistics','systems'].forEach(k=>{
    document.getElementById('nav-btn-'+k)?.classList.toggle('active',k==='log');
  });
  document.querySelectorAll('.tab-section:not(.drawer-body .tab-section)').forEach(e=>e.classList.remove('active'));
  document.getElementById('tab-dm')?.classList.add('active');
  currentTab='tab-dm';
  _closeAllOverlays();
  if(Array.isArray(state.pcs)){state.pcs.forEach(p=>{p.sheetLocked=true;});save();}
  renderQAMenu();
}
function _closeAllOverlays(){
  ['loc-ov','loc-ov-bd','loc-seed','loc-seed-bd','grit-ov','grit-ov-bd','familiar-ov','familiar-ov-bd'].forEach(id=>{document.getElementById(id)?.classList.remove('is-open');});
  const picker=document.getElementById('sheet-picker-sheet');if(picker){picker.remove();document.getElementById('sheet-picker-bd')?.remove();}
  const pcOv=document.getElementById('pc-overview-sheet');if(pcOv){closePCOverview();}
}

let _logisticsTab='world';
let _systemsTab='session';

function openSheetPicker(){
  if(!state.pcs||!state.pcs.length)return;
  if(state.pcs.length===1){openPCOverview(0);return;}
  // Quick picker: small bottom sheet with PC name buttons
  const existing=document.getElementById('sheet-picker-sheet');
  if(existing){existing.remove();document.getElementById('sheet-picker-bd')?.remove();}
  const bd=document.createElement('div');
  bd.id='sheet-picker-bd';bd.className='drawer-backdrop';bd.style.cssText='z-index:940';
  bd.onclick=()=>{bd.remove();sh.remove();};
  const sh=document.createElement('div');
  sh.id='sheet-picker-sheet';sh.className='qa-sheet';sh.style.cssText='z-index:945;max-height:280px';
  sh.innerHTML=`<div class="qa-sheet-hdr"><span style="font-size:13px;font-weight:600;color:var(--gold-bright)">📔 Character Sheet</span><button class="btn sm" onclick="document.getElementById('sheet-picker-sheet').remove();document.getElementById('sheet-picker-bd').remove()">✕</button></div>
    <div class="qa-sheet-body" style="padding:12px">
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:10px">Select a character</div>
      ${state.pcs.map((pc,i)=>`<button class="btn full" style="margin-bottom:8px;text-align:left;padding:10px 14px;justify-content:flex-start;gap:10px" onclick="document.getElementById('sheet-picker-sheet').remove();document.getElementById('sheet-picker-bd').remove();openPCOverview(${i})">
        <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${pc.color||'var(--text-dim)'};flex-shrink:0"></span>
        <div><div style="font-size:13px;font-weight:600">${esc(pc.name)}</div><div style="font-size:10px;color:var(--text-dim)">${esc(pc.class||'')} ${pc.level?'L'+pc.level:''} · HP ${pc.hp||0}/${pc.hp_max||0}</div></div>
      </button>`).join('')}
    </div>`;
  document.body.append(bd,sh);
  requestAnimationFrame(()=>{sh.classList.add('is-open');bd.classList.add('is-open');});
  _setNavActive('party');
}
function navTo(key){
  if(key==='log'){closeDrawer();return;}
  if(key==='party'){openDrawer('tab-party');return;}
  if(key==='logistics'){openLogisticsDrawer();return;}
  if(key==='systems'){openSystemsDrawer();return;}
  if(['world','wagon'].includes(key)){openLogisticsDrawer(key);return;}
  if(key==='combat'){openDrawer('tab-combat');_setNavActive('logistics');renderCombat();return;}
  if(['session','ait','ait-chk','dev','setup'].includes(key)){openSystemsDrawer(key);return;}
  openDrawer('tab-'+key);
}
function _setNavActive(key){
  ['log','party','logistics','systems'].forEach(k=>{
    document.getElementById('nav-btn-'+k)?.classList.toggle('active',k===key);
  });
}
function openLogisticsDrawer(sub){
  sub=sub||_logisticsTab;
  _logisticsTab=sub;
  openDrawer('tab-'+sub);
  const sn=document.getElementById('drawer-subnav');
  if(sn){
    sn.style.display='flex';
    sn.innerHTML=[['world','📔 Journal'],['wagon','📦 Cargo']]
      .map(([k,lbl])=>`<button class="drawer-subnav-btn${k===sub?' active':''}" onclick="switchLogisticsTab('${k}')">${lbl}</button>`).join('');
  }
  const t=document.getElementById('drawer-title');if(t)t.textContent='Logistics';
  _setNavActive('logistics');
}
function openSystemsDrawer(sub){
  sub=sub||_systemsTab;
  _systemsTab=sub;
  openDrawer('tab-'+sub);
  const sn=document.getElementById('drawer-subnav');
  if(sn){
    sn.style.display='flex';
    const setupLabel=state.campaignLaunched?'⚙ Setup':'▶ Start Here';
    sn.innerHTML=[['session','📅 Session'],['ait','🤖 AI Tools'],['ait-chk','⏪ Tools'],['dev','🔧 Dev'],['setup',setupLabel]]
      .map(([k,lbl])=>`<button class="drawer-subnav-btn${k===sub?' active':''}" onclick="switchSystemsTab('${k}')">${lbl}</button>`).join('');
  }
  const t=document.getElementById('drawer-title');if(t)t.textContent='Systems';
  _setNavActive('systems');
}
function switchLogisticsTab(sub){
  _logisticsTab=sub;
  ['tab-world','tab-wagon','tab-combat'].forEach(id=>{document.getElementById(id)?.classList.remove('active');});
  document.getElementById('tab-'+sub)?.classList.add('active');
  document.querySelectorAll('#drawer-subnav .drawer-subnav-btn').forEach(b=>{
    b.classList.toggle('active',b.getAttribute('onclick')?.includes("'"+sub+"'"));
  });
  if(sub==='wagon'){renderWagon();renderAnimals();renderIncome();renderPartyInv();renderTreasuryTotal();}
  if(sub==='world'){syncWorld();renderLocations();renderNPCs();renderQuests();renderConsequences();renderCampaignSecrets();}
  if(sub==='combat'){renderCombat();}
  clearTabBadge('tab-'+sub);
  currentTab='tab-'+sub;
  renderQAMenu();setTimeout(injectPanelFlags,150);
}
function switchSystemsTab(sub){
  _systemsTab=sub;
  ['tab-session','tab-ait','tab-ait-chk','tab-dev','tab-setup'].forEach(id=>{document.getElementById(id)?.classList.remove('active');});
  document.getElementById('tab-'+sub)?.classList.add('active');
  document.querySelectorAll('#drawer-subnav .drawer-subnav-btn').forEach(b=>{
    b.classList.toggle('active',b.getAttribute('onclick')?.includes("'"+sub+"'"));
  });
  if(sub==='session'){showSessionMode('play');}
  if(sub==='ait-chk'){renderQAEditor();}
  clearTabBadge('tab-'+sub);
  currentTab='tab-'+sub;
  renderQAMenu();setTimeout(injectPanelFlags,150);
}

function _cmdResult(text){
  const el=document.getElementById('cmd-result');
  if(!el)return;
  const lines=text.split('\n');
  el.setAttribute('data-preview',lines[0]);
  el.textContent=text;
  el.style.display='block';
  el.classList.remove('expanded');
}
function _handleSlashCmd(raw){
  if(!raw)return;
  const lower=raw.toLowerCase();
  const ts=state.worldData?.time||'';
  const loc=state.worldData?.location||'';
  const stamp='['+loc+(ts?' · '+ts:'')+']';

  // //flag [N] reason — export last N messages with a reason
  const flagMatch=lower.match(/^flag\s+(?:last\s+)?(\d+)?\s*(.*)/);
  if(lower.startsWith('flag')){
    const n=flagMatch&&flagMatch[1]?parseInt(flagMatch[1]):20;
    const reason=flagMatch&&flagMatch[2]?flagMatch[2].trim():raw.slice(4).trim();
    const msgs=state.chatHistory||[];
    const slice=msgs.slice(-n);
    let log='=== TINKLE\'S TINCTURES — FLAGGED RANGE ===\n';
    log+='Exported: '+new Date().toISOString().slice(0,16)+'\n';
    log+='Reason: '+(reason||'(not specified)')+'\n';
    log+='Range: last '+n+' messages (of '+msgs.length+' total)\n';
    log+='Location: '+loc+'\n';
    log+='PCs: '+(state.pcs||[]).map(p=>p.name+' ('+p.class+' '+p.level+', '+p.hp+'/'+p.hp_max+' HP)').join(', ')+'\n\n';
    log+='--- CHAT LOG ---\n\n';
    slice.forEach(m=>{
      const role=m.role==='assistant'?'DM':m.role==='user'?'PLAYER':'SYSTEM';
      const who=m.playerChar?' ('+m.playerChar+')':m.playerName?' ('+m.playerName+')':'';
      const content=(m.content||'').replace(/\n{3,}/g,'\n\n').trim();
      if(!content)return;
      log+='['+(m.ts||'')+'] '+role+who+':\n'+content+'\n\n';
    });
    log+='--- PROMPT FOR DEV ---\n';
    log+='The player flagged this range for review.\nReason: '+(reason||'(not specified)')+'\n';
    log+='Cross-reference against .claude/roadmap.md and .claude/features.md.\n';
    log+='Analyze what went wrong, whether a fix exists, and what to change.\n';
    copyText(log,'✓ Flagged '+n+' messages — paste to dev');
    state.sessionNotes=(state.sessionNotes||'')+'\n'+stamp+' [FLAG] '+reason;
    save();
    _cmdResult('🚩 Flagged '+n+' messages — copied to clipboard'+(reason?' · '+reason:''));
    return;
  }

  // //add item "name" or //add item name — add to party inventory
  const addMatch=raw.match(/^add\s+(?:item\s+)?[""]?(.+?)[""]?\s*(?:to\s+(?:inventory|inv|cargo|hoard))?\s*$/i);
  if(lower.startsWith('add')&&addMatch){
    const itemName=addMatch[1].trim();
    if(!itemName)return;
    const target=lower.includes('cargo')?'cargo':lower.includes('hoard')?'hoard':'inv';
    if(target==='cargo'){
      if(!state.wagon)state.wagon={};
      if(!state.wagon.cargo)state.wagon.cargo=[];
      state.wagon.cargo.push({name:itemName,qty:1,weight:0,type:'loot',notes:'',ts:state.worldData?.time||''});
    }else if(target==='hoard'){
      if(!state.wagon)state.wagon={};
      if(!state.wagon.hoard)state.wagon.hoard=[];
      state.wagon.hoard.push({name:itemName,qty:1,weight:0,type:'treasure',notes:'',ts:state.worldData?.time||''});
    }else{
      if(!state.partyInventory)state.partyInventory=[];
      state.partyInventory.push({name:itemName,qty:1,weight:0,type:'loot',notes:''});
    }
    save();renderAll();
    _cmdResult('📦 Added: '+itemName+' → '+(target==='cargo'?'wagon cargo':target==='hoard'?'wagon hoard':'party inventory'));
    return;
  }

  // //hp +N or //hp -N — adjust active PC HP
  const hpMatch=raw.match(/^hp\s*([+-]?\d+)/i);
  if(hpMatch){
    const delta=parseInt(hpMatch[1]);
    const pc=state.pcs?.find(p=>p.name?.toLowerCase()===playerChar?.toLowerCase())||state.pcs?.[0];
    if(pc){
      pc.hp=Math.max(0,Math.min(pc.hp_max,(pc.hp||0)+delta));
      save();renderAll();
      _cmdResult((delta>0?'💚 +':'❤️ ')+delta+' HP → '+pc.name+' now at '+pc.hp+'/'+pc.hp_max);
    }
    return;
  }

  // //gold +N or //gold -N — adjust treasury
  const goldMatch=raw.match(/^gold\s*([+-]?\d+)/i);
  if(goldMatch){
    const delta=parseInt(goldMatch[1]);
    if(!state.treasuryData)state.treasuryData={};
    state.treasuryData.gp=(parseFloat(state.treasuryData.gp)||0)+delta;
    save();renderAll();
    _cmdResult((delta>0?'💰 +':'💰 ')+delta+' gp → '+state.treasuryData.gp+' gp total');
    return;
  }

  // //levelup — open the level-up wizard for the first ready PC
  if(lower==='levelup'||lower==='level up'||lower==='lu'){
    state.pcs.forEach(pc=>checkLevelUp(pc));
    const readyIdx=(state.pcs||[]).findIndex(p=>p.levelReady);
    if(readyIdx>=0){openLevelUpWizard(readyIdx);_cmdResult('⬆ Opening Level Up wizard for '+state.pcs[readyIdx].name);}
    else{
      const diag=(state.pcs||[]).map(p=>p.name+': Lv'+(p.level||1)+' XP='+(p.xp||0)+' need='+XP_T[Math.min(p.level||1,19)]).join(', ');
      _cmdResult('No characters are ready to level up. ['+diag+']');
    }
    return;
  }

  if(lower.startsWith('testlevelup')||lower.startsWith('test levelup')||lower.startsWith('testlu')){
    const parts=raw.trim().split(/\s+/);
    const targetLvl=parseInt(parts[parts.length-1]);
    const pcName=parts.length>2&&isNaN(parseInt(parts[parts.length-1]))?parts[parts.length-1]:
                 parts.length>2&&!isNaN(parseInt(parts[parts.length-1]))&&parts.length>3?parts[parts.length-2]:null;
    let pcIdx=0;
    if(pcName){const found=(state.pcs||[]).findIndex(p=>(p.name||'').toLowerCase().startsWith(pcName.toLowerCase()));if(found>=0)pcIdx=found;}
    const pc=state.pcs?.[pcIdx];
    if(!pc){_cmdResult('No PCs found.');return;}
    _luTestSnapshot={idx:pcIdx,data:JSON.parse(JSON.stringify(pc))};
    if(targetLvl>=2&&targetLvl<=20) pc.level=targetLvl-1;
    pc.levelReady=true;
    save();
    openLevelUpWizard(pcIdx);
    const lvlMsg=targetLvl>=2&&targetLvl<=20?' (L'+(targetLvl-1)+'→'+targetLvl+')':'';
    _cmdResult('⚗ Test mode: '+pc.name+lvlMsg+'. All changes auto-revert when wizard closes.');
    return;
  }

  // //help — show available commands
  if(lower==='help'||lower==='?'||lower==='commands'){
    _cmdResult('📖 Command Index (tap to expand)\n─────────────────────────────\n'
      +'QUICK ACTIONS\n'
      +'  //hp +5       — heal 5 HP          //hp -3       — take 3 damage\n'
      +'  //gold +10    — add 10 gp          //gold -5     — spend 5 gp\n'
      +'  //levelup     — open Level Up wizard for ready PCs\n'
      +'  //testlevelup [N] — force open Level Up wizard (optional: level N, e.g. //testlu 8)\n'
      +'  //add item "rope"          — add to party inventory\n'
      +'  //add item "gem" to cargo  — add to wagon cargo\n'
      +'  //add item "ring" to hoard — add to wagon hoard\n\n'
      +'DEV TOOLS\n'
      +'  //flag 20 reason   — export last 20 messages to clipboard\n'
      +'  // any text here   — log a dev note to session notes\n\n'
      +'HELP\n'
      +'  //explain actions   — what Quick Actions do\n'
      +'  //explain combat    — zone combat basics\n'
      +'  //explain map       — area map & pins\n'
      +'  //explain inventory — item management\n'
      +'  //explain commands  — this list\n'
      +'  //explain spells    — spell & slot tracking\n'
      +'  //explain rest      — short/long rest mechanics\n'
      +'  //explain dice      — dice roller usage\n'
      +'  //explain contracts — AI personality contracts\n'
      +'  //explain flags     — flagging AI mistakes\n'
      +'  //explain ooc       — OOC & party channels\n'
      +'  //explain export    — gameplay log exports\n'
      +'  //explain shortcuts — header shortcut buttons\n'
      +'  //explain notes     — dev notes system\n'
      +'  //help              — show this index');
    return;
  }

  // //explain topic — show a help card about a feature
  if(lower.startsWith('explain')||lower.startsWith('what is')||lower.startsWith('how to')){
    const topic=(raw.replace(/^(explain|what is|how to)\s*/i,'')).trim().toLowerCase();
    const EXPLAINS={
      'actions':       'Quick Actions (⚡) are one-tap shortcuts on the floating button. Tap ⚡ → pick an action → it runs instantly. Customize them in Systems > AI Tools > QA Editor.',
      'quick actions':  'Quick Actions (⚡) are one-tap shortcuts on the floating button. Tap ⚡ → pick an action → it runs instantly. Customize them in Systems > AI Tools > QA Editor.',
      'flags':         'Flags (⚑) mark moments where the AI got something wrong. Tap ⋮ on any DM message → ⚑ → pick a category → add a note. Flags appear in the Ops Debrief and exports.',
      'commands':      'Type // before a message for dev commands:\n// note — log a dev note\n//flag 20 reason — export last 20 messages\n//add item name — add to inventory\n//hp +5 — adjust your HP\n//gold -10 — adjust treasury\n//levelup — open Level Up wizard\n//explain topic — explain a feature\n//help — show this list',
      '//':            'Type // before a message for dev commands:\n// note — log a dev note\n//flag 20 reason — export last 20 messages\n//add item name — add to inventory\n//hp +5 — adjust your HP\n//gold -10 — adjust treasury\n//levelup — open Level Up wizard\n//explain topic — explain a feature\n//help — show this list',
      'combat':        'Zone Combat uses 6 zones (Frontline/Backline/Flanks/Air/Rear). Add combatants, roll initiative, then the AI moves tokens. Tap a token for HP/conditions. Toggle Manual mode to move tokens yourself by tapping token → zone.',
      'zones':         'Zone Combat uses 6 zones (Frontline/Backline/Flanks/Air/Rear). Add combatants, roll initiative, then the AI moves tokens. Tap a token for HP/conditions. Toggle Manual mode to move tokens yourself by tapping token → zone.',
      'map':           'Area Map: Upload a map image in Logistics > World > Locations (map icon). Tap a location chip → tap the map to place a pin. Tap a pin for Move/Unpin/Details.',
      'pins':          'Tap a map pin → action bar appears: ↻ Move (reposition), ✕ Unpin (remove from map), ⋯ Details (full location info). Long-press + drag also works for quick repositioning.',
      'inventory':     'Party inventory is in the Sheet tab. Wagon cargo and wagon hoard are in Logistics > Wagon. Tap any item chip to expand and edit. Use //add item "name" to quickly add items.',
      'ooc':           'The OOC tab (❓ Rules) is for rules questions — the AI answers as a rules reference, not as the DM character. The 🗨️ Party tab is for player-to-player chat outside the narrative.',
      'contracts':     'AI Contracts (Systems > AI Tools) control the DM\'s personality and rules. 5 contracts: Persona, Never Do, Actions, Continuity, Multi-Player. Edit these to fix recurring AI mistakes.',
      'context strip': 'The bar above the chat shows your current location and scene. It auto-updates when the AI changes location.',
      'dice':          'Tap 🎲 to open the dice roller. Pick a die, add modifiers, roll. Tap "Send to Chat" to include the result in your next message to the DM.',
      'export':        'Dev tab has Ops Debrief (stats + flags) and Gameplay Log Export (full chat). Tap ⋮ → ⚠️ on any message to export that specific moment with context.',
      'shortcuts':     'Tap ☰ in the header → ✎ to customize your shortcut buttons. 16 available shortcuts for quick access to common actions.',
      'rest':          'Short rest: hit dice healing + restore short-rest resources. Long rest: full HP, restore all resources and spell slots. Use the Quick Action or type "We take a short/long rest."',
      'spells':        'Spell management is in Sheet > your character > Spells tab. Tap a spell slot to mark used/available. The AI tracks concentration automatically.',
      'notes':         'Dev notes (// in chat) appear in Systems > Dev > Session Notes. They\'re also included in Ops Debrief and Gameplay Log exports.',
    };
    const key=Object.keys(EXPLAINS).find(k=>topic.includes(k))||null;
    if(key){
      _cmdResult('💡 '+key+'\n'+EXPLAINS[key]);
    }else{
      _cmdResult('❓ No help for "'+topic+'"\nTopics: actions, combat, map, inventory, commands, flags, contracts, dice, rest, spells, ooc, export, shortcuts, notes');
    }
    return;
  }

  // Default: plain dev note
  state.sessionNotes=(state.sessionNotes||'')+'\n'+stamp+' '+raw;
  save();
  _cmdResult('📝 Note logged: '+raw);
}
function sendMsgQuick(){
  const qi=document.getElementById('chat-quick-input');
  if(!qi)return;
  const val=qi.value.trim();
  if(!val)return;
  if(val.startsWith('//')){
    qi.value='';
    _handleSlashCmd(val.slice(2).trim());
    return;
  }
  const ci=document.getElementById('chat-input');
  if(ci&&ci.disabled)return;
  const activeBtn=document.querySelector('.chat-tab-btn.active');
  const channel=activeBtn?.id?.replace('chat-tab-','')||_activeTab;
  if(channel==='party'){qi.value='';sendPartyMsg(val);return;}
  if(!getKey()){toast('Set an API key first — tap ⚙ in the AI DM header.');return;}
  if(channel!=='party'&&channel!=='ooc'&&channel!=='test'&&!playerName){populateSetup();openModal('setup-modal');toast('Set your player name first.');return;}
  qi.value='';
  if(channel==='ooc'){sendOOCMsg(val);return;}
  if(channel==='test'){sendTestMsg(val);return;}
  if(ci){ci.value=val;sendMsg();}
}

function chatKeyQuick(e){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsgQuick();}
}

var _overviewIdx=null;
var _charSheetTab=0; // 0=Core 1=Skills 2=Combat 3=Spells 4=Gear 5=Features
function openPCOverview(idx){
  _overviewIdx=idx;
  _charSheetTab=0;
  renderPCOverview();
  const bd=document.getElementById('pc-overview-backdrop');
  const sh=document.getElementById('pc-overview-sheet');
  if(bd)bd.style.display='block';
  if(sh){sh.style.display='flex';sh.style.flexDirection='column';requestAnimationFrame(()=>sh.style.transform='translateY(0)');}
}
function setCharSheetTab(n){_charSheetTab=n;renderPCOverview();}
function toggleSheetLock(idx){
  const pc=state.pcs[idx];if(!pc)return;
  pc.sheetLocked=!pc.sheetLocked;
  save();renderPCOverview();
}
function closePCOverview(){
  const bd=document.getElementById('pc-overview-backdrop');
  const sh=document.getElementById('pc-overview-sheet');
  if(sh){sh.style.transform='translateY(100%)';setTimeout(()=>{if(sh)sh.style.display='none';},260);}
  if(bd)bd.style.display='none';
  // Auto-lock all character sheets on overview close
  if(Array.isArray(state.pcs)){state.pcs.forEach(p=>{p.sheetLocked=true;});save();}
  _overviewIdx=null;
  _charSheetTab=0;
}
function renderPCOverview(){
  const idx=_overviewIdx;if(idx===null)return;
  const pc=state.pcs[idx];if(!pc)return;
  const locked=pc.sheetLocked!==false;
  const pct=Math.max(0,Math.min(100,(pc.hp/(pc.hp_max||1))*100));
  // Update fixed header elements
  const nameEl=document.getElementById('po-name');if(nameEl)nameEl.textContent=pc.name||'Character';
  const classEl=document.getElementById('po-class');if(classEl)classEl.textContent=(pc.class||'')+(pc.subclass?' ('+pc.subclass+')':'')+(pc.level?' Lv.'+pc.level:'')+(pc.race?' — '+pc.race:'');
  const badgeEl=document.getElementById('po-badge');
  if(badgeEl){
    const _negConds=(pc.conditions||[]).filter(c=>!['Inspired','Concentrating','Dodge','Hidden','Invisible'].includes(c));
    let badge='<span class="status-badge ok">OK</span>';
    if(pc.hp<=0)badge='<span class="status-badge dead" onclick="setCharSheetTab(2);renderPCOverview()" style="cursor:pointer">DOWN</span>';
    else if(_negConds.length>0)badge='<span class="status-badge warn" onclick="clearPCConditions('+idx+')" style="cursor:pointer" title="Tap to clear conditions">'+esc(_negConds[0])+(_negConds.length>1?' +'+(_negConds.length-1):'')+'</span>';
    else if(pct<50)badge='<span class="status-badge warn" title="HP below 50%">HURT</span>';
    badgeEl.innerHTML=badge+'<button class="sheet-lock-btn '+(locked?'locked':'unlocked')+'" onclick="toggleSheetLock('+idx+')" title="'+(locked?'Unlock to edit':'Lock sheet')+'" style="margin-left:8px">'+(locked?'🔒':'🔓')+'</button>';
  }
  const body=document.getElementById('pc-overview-body');if(!body)return;
  body.innerHTML=renderCharSheet(idx,locked);
  // Set textarea values after innerHTML (mobile textarea reliability)
  if(!locked){
    const setTA=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val||'';};
    setTA('cs-personality-'+idx,pc.personality);
    setTA('cs-ideals-'+idx,pc.ideals);
    setTA('cs-bonds-'+idx,pc.bonds);
    setTA('cs-flaws-'+idx,pc.flaws);
  }
  // Roll result strip (persists across re-renders via id)
  const rr=document.getElementById('po-roll-result');
  if(rr)rr.style.display='none';
}

function renderCharSheet(idx,locked){
  const pc=state.pcs[idx];if(!pc)return'';
  const lvl=pc.level||1;
  const prof=Math.floor((lvl-1)/4)+2;
  const modN=s=>{const n=parseInt(pc[s])||10;return Math.floor((n-10)/2);};
  const fmtM=v=>(v>=0?'+':'')+v;
  const pct=Math.max(0,Math.min(100,(pc.hp/(pc.hp_max||1))*100));
  const hpCol=pc.hp<=0?'var(--red)':pct<25?'#c04a3a':pct<50?'var(--gold)':'var(--green)';
  const profs=Array.isArray(pc.skillProfs)?pc.skillProfs:[];
  const ALL_SKILLS=[['Athletics','str'],['Acrobatics','dex'],['Sleight of Hand','dex'],['Stealth','dex'],['Perception','wis'],['Insight','wis'],['Medicine','wis'],['Animal Handling','wis'],['Survival','wis'],['Persuasion','cha'],['Deception','cha'],['Intimidation','cha'],['Performance','cha'],['Arcana','int'],['History','int'],['Investigation','int'],['Nature','int'],['Religion','int']];
  const SAVES=[['STR Save','str'],['DEX Save','dex'],['CON Save','con'],['INT Save','int'],['WIS Save','wis'],['CHA Save','cha']];
  // Get class hit die
  const cls=(pc.class||'fighter').toLowerCase().trim();
  const classKey=Object.keys(LEVEL_UP_DATA).find(k=>cls.includes(k));
  const hitDie=classKey?LEVEL_UP_DATA[classKey].hit_die:8;
  // Passive perception & insight
  const wisMod=modN('wis');const intMod=modN('int');
  const passPerc=10+wisMod+(profs.includes('Perception')?prof:0);
  const passIns=10+wisMod+(profs.includes('Insight')?prof:0);
  // XP
  const xp=pc.xp||0;const nxtXp=XP_T[Math.min(lvl,19)];
  const xpPct=nxtXp?Math.min(100,(xp/nxtXp)*100):100;

  // ── ALWAYS-VISIBLE HEADER STRIP ──
  const tempBadge=pc.hp_temp>0?`<span style="font-size:10px;color:var(--blue-bright);background:rgba(96,130,120,.2);border:1px solid var(--blue);border-radius:4px;padding:1px 5px;margin-left:4px">+${pc.hp_temp} temp</span>`:'';
  const hdTotal=lvl;const hdUsed=pc.hd_used||0;const hdRem=Math.max(0,hdTotal-hdUsed);
  const dsRow=pc.hp<=0?`<span style="font-size:11px;margin-left:6px">${[0,1,2].map(i=>`<span onclick="toggleDeathSave(${idx},'success',${i});renderPCOverview()" style="cursor:pointer;opacity:${i<(pc.death_saves?.successes||0)?1:.25}">♥</span>`).join('')}${[0,1,2].map(i=>`<span onclick="toggleDeathSave(${idx},'failure',${i});renderPCOverview()" style="cursor:pointer;opacity:${i<(pc.death_saves?.failures||0)?1:.25}">💀</span>`).join('')}</span>`:'';
  const inspoBtn=`<span onclick="toggleInspiration(${idx});renderPCOverview()" style="cursor:pointer;font-size:14px;-webkit-tap-highlight-color:transparent">${pc.inspiration?'⭐':'☆'}</span>`;

  const headerStrip=`
  <div class="sheet-section" style="padding:8px 0 6px;border-bottom:1px solid var(--border);margin-bottom:0">
    <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-bottom:5px">
      <span style="font-size:13px;font-weight:700;color:${hpCol};font-family:var(--mono)" onclick="(function(){const v=parseInt(prompt('Set current HP (max ${pc.hp_max}):','${pc.hp}'));if(isNaN(v))return;state.pcs[${idx}].hp=Math.max(0,Math.min(state.pcs[${idx}].hp_max,v));saveRefresh();renderPCOverview();})()" style="cursor:pointer">${pc.hp}<span style="font-size:10px;color:var(--text-dim)">/${pc.hp_max}</span></span>${tempBadge}
      <span style="font-size:10px;color:var(--text-dim)">HP</span>
      <span style="width:1px;height:12px;background:var(--border);margin:0 3px"></span>
      <span style="font-size:10px;color:var(--text-dim)">AC</span><span style="font-size:13px;font-weight:700;color:var(--text-bright)">${pc.ac}</span>
      <span style="width:1px;height:12px;background:var(--border);margin:0 3px"></span>
      <span style="font-size:10px;color:var(--text-dim)">Init</span><span style="font-size:13px;font-weight:700;color:var(--text-bright)">${fmtM(parseInt(pc.initiative)||0)}</span>
      <span style="width:1px;height:12px;background:var(--border);margin:0 3px"></span>
      <span style="font-size:10px;color:var(--text-dim)">Spd</span><span style="font-size:13px;font-weight:700;color:var(--text-bright)">${pc.speed||30}ft</span>
      <span style="width:1px;height:12px;background:var(--border);margin:0 3px"></span>
      ${inspoBtn}<span style="font-size:10px;color:${pc.inspiration?'var(--gold)':'var(--text-dim)'};margin-left:2px">Inspiration</span>
    </div>
    <div class="hp-bar-wrap" style="margin:3px 0 4px"><div class="hp-bar-fill" style="width:${pct.toFixed(1)}%;background:${hpCol}"></div></div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--text-dim)">
      <span>HD: ${hdRem}/${hdTotal}d${hitDie}</span>
      <span>Prof: <strong style="color:var(--gold)">+${prof}</strong></span>
      <span>PP: ${passPerc}</span>
      <span onclick="(function(){const v=parseInt(prompt('Set XP for ${esc(pc.name)}:','${xp}'));if(isNaN(v))return;upd(${idx},'xp',v);renderPCOverview();})()" style="flex:1;height:6px;background:var(--surface3);border-radius:3px;cursor:pointer"><span style="display:block;height:6px;width:${xpPct.toFixed(1)}%;background:var(--gold-dim);border-radius:3px"></span></span>
      <span onclick="(function(){const v=parseInt(prompt('Set XP for ${esc(pc.name)}:','${xp}'));if(isNaN(v))return;upd(${idx},'xp',v);renderPCOverview();})()" style="cursor:pointer">${xp.toLocaleString()} XP</span>
      ${dsRow}
    </div>
  </div>`;

  // ── ROLL RESULT STRIP (always rendered, hidden by default) ──
  const rollResultStrip='<div id="po-roll-result" style="display:none;background:var(--surface2);border:1px solid var(--border-bright);border-radius:5px;padding:5px 8px;margin-top:6px;font-size:12px;align-items:center"></div>';

  // ── TAB ROW ──
  const TAB_NAMES=['Core','Skills','Combat','Spells','Gear','Features'];
  const tabRow='<div class="sheet-tab-row">'+TAB_NAMES.map((t,i)=>`<button class="sheet-tab-btn${i===_charSheetTab?' active':''}" onclick="setCharSheetTab(${i})">${t}</button>`).join('')+'</div>';

  // ── CORE TAB ──
  function coreTab(){
    const abilityTiles=['str','dex','con','int','wis','cha'].map(s=>{
      const score=parseInt(pc[s])||10;const m=modN(s);
      return`<div class="ability-tile" onclick="rollStatCheck(${idx},'${s}')" style="cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation">
        <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;font-weight:600">${s}</div>
        <div style="font-size:26px;font-weight:800;color:var(--text-bright);font-family:var(--mono);line-height:1.1">${locked?score:`<input type="number" value="${score}" onchange="upd(${idx},'${s}',parseInt(this.value)||10);renderPCOverview()" style="width:46px;text-align:center;font-size:22px;font-weight:800;font-family:var(--mono);background:none;border:none;border-bottom:1px solid var(--gold-dim);color:var(--text-bright);padding:0" onclick="event.stopPropagation()">`}</div>
        <div style="font-size:14px;font-weight:700;color:var(--gold)">${fmtM(m)}</div>
      </div>`;
    }).join('');
    const savesHtml=SAVES.map(([n,s])=>{const b=modN(s);const p=profs.includes(n);const tot=p?b+prof:b;
      return`<div class="save-row" onclick="rollStatCheck(${idx},'${s}','${n}')" style="cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation">
        <span class="prof-dot ${p?'filled':''}" title="${p?'Proficient':'Not proficient'}"></span>
        <span style="flex:1;font-size:11px;color:var(--text)">${n}</span>
        <span style="font-size:12px;font-weight:700;color:${p?'var(--gold)':'var(--text-bright)'}">${fmtM(tot)}</span>
      </div>`;
    }).join('');
    return`<div class="sheet-section">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">${abilityTiles}</div>
      <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;font-weight:600;margin-bottom:5px">Saving Throws</div>
      <div style="margin-bottom:12px">${savesHtml}</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:5px 10px;text-align:center;min-width:60px"><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.5px">Pass. Perc.</div><div style="font-size:18px;font-weight:700;color:var(--text-bright)">${passPerc}</div></div>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:5px 10px;text-align:center;min-width:60px"><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.5px">Pass. Insight</div><div style="font-size:18px;font-weight:700;color:var(--text-bright)">${passIns}</div></div>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:5px 10px;text-align:center;min-width:60px"><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.5px">Prof Bonus</div><div style="font-size:18px;font-weight:700;color:var(--gold)">+${prof}</div></div>
      </div>
    </div>`;
  }

  // ── SKILLS TAB ──
  function skillsTab(){
    // Derive effective proficiencies: use skillProfs array if populated,
    // else fall back to scanning the skills text for known skill names.
    const skillsText=pc.skills||'';
    const inferredProfs=profs.length>0?profs:
      ALL_SKILLS.filter(([n])=>new RegExp('\\b'+n+'\\b','i').test(skillsText)).map(([n])=>n);
    // Expertise: skills text contains "(Expertise)" near the skill name → double prof
    const hasExpertise=(n)=>new RegExp(n+'[^\\n]*Expertise','i').test(skillsText);
    const rows=ALL_SKILLS.map(([n,s])=>{
      const b=modN(s);const p=inferredProfs.includes(n);
      const expert=p&&hasExpertise(n);
      const tot=expert?b+(prof*2):p?b+prof:b;
      const dotClass=expert?'filled expertise':p?'filled':'';
      return`<div class="skill-row" onclick="rollStatCheck(${idx},'${s}','${n}')" style="cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation">
        <span class="prof-dot ${dotClass}" title="${expert?'Expertise':''}"></span>
        <span style="flex:1;font-size:11px;color:var(--text)">${n}</span>
        <span style="font-size:9px;color:var(--text-dim);margin-right:4px;text-transform:uppercase">${s}</span>
        <span style="font-size:12px;font-weight:700;color:${expert?'var(--gold-bright)':p?'var(--gold)':'var(--text-bright)'}">${fmtM(tot)}</span>
      </div>`;
    }).join('');
    return`<div class="sheet-section">${rows}</div>`;
  }

  // ── COMBAT TAB ──
  function combatTab(){
    // Conditions
    const pcConds=pc.conditions||[];
    let condHtml='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">';
    pcConds.forEach(c=>{condHtml+=`<span class="cond-chip active" onclick="toggleCond(${idx},'${c}');renderPCOverview()">${c} ✕</span>`;});
    condHtml+=`<select class="mini-select" onchange="addCondFromPicker(${idx},this);setTimeout(renderPCOverview,50)"><option value="">＋ condition…</option>${ALL_CONDS.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>`;
    // Concentration
    const concBadge=pc.concentrating?`<div style="font-size:10px;color:var(--purple-bright);margin-bottom:8px">⬤ Concentrating: ${esc(pc.concentrating)} <button onclick="upd(${idx},'concentrating','');renderPCOverview()" style="font-size:9px;padding:1px 5px;background:none;border:1px solid var(--purple);color:var(--purple-bright);cursor:pointer;border-radius:2px;margin-left:4px">end</button></div>`:'';
    // HP controls
    const hpControls=`<div style="margin-bottom:12px">
      <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;font-weight:600;margin-bottom:5px">Hit Points</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <div style="font-size:24px;font-weight:800;color:${hpCol};font-family:var(--mono)">${pc.hp}<span style="font-size:14px;color:var(--text-dim)">/${pc.hp_max}</span></div>
        <div style="display:flex;gap:4px"><input type="number" id="po-hpamt" style="width:52px;text-align:center;padding:4px;font-size:12px" placeholder="Amt">
          <button class="btn sm green" onclick="(function(){const v=parseInt(document.getElementById('po-hpamt').value);if(!v)return;state.pcs[${idx}].hp=Math.min(state.pcs[${idx}].hp_max,state.pcs[${idx}].hp+v);document.getElementById('po-hpamt').value='';saveRefresh();renderPCOverview();renderHUD();})()" style="padding:3px 8px">+</button>
          <button class="btn sm red" onclick="(function(){const v=parseInt(document.getElementById('po-hpamt').value);if(!v)return;state.pcs[${idx}].hp=Math.max(0,state.pcs[${idx}].hp-v);document.getElementById('po-hpamt').value='';saveRefresh();renderPCOverview();renderHUD();})()" style="padding:3px 8px">−</button>
        </div>
        <div style="display:flex;align-items:center;gap:4px"><label style="font-size:10px;color:var(--text-dim)">Temp HP:</label><input type="number" value="${pc.hp_temp||0}" min="0" style="width:52px;font-size:12px;padding:4px" onchange="state.pcs[${idx}].hp_temp=parseInt(this.value)||0;save();renderPCOverview()"></div>
      </div>
      <div class="hp-bar-wrap" style="margin-top:6px"><div class="hp-bar-fill" style="width:${pct.toFixed(1)}%;background:${hpCol}"></div></div>
    </div>`;
    // Death saves (always shown in combat tab)
    const deathSaves=`<div style="margin-bottom:12px;padding:8px;background:rgba(139,58,42,.12);border:1px solid var(--red);border-radius:6px">
      <div style="font-size:9px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px">Death Saves</div>
      <div style="display:flex;gap:20px">
        <div><div style="font-size:8px;color:var(--green);margin-bottom:3px">Successes</div><div style="display:flex;gap:5px">${[0,1,2].map(i=>`<span onclick="toggleDeathSave(${idx},'success',${i});renderPCOverview()" style="font-size:20px;cursor:pointer;-webkit-tap-highlight-color:transparent;opacity:${i<(pc.death_saves?.successes||0)?1:0.22}">♥</span>`).join('')}</div></div>
        <div><div style="font-size:8px;color:var(--red);margin-bottom:3px">Failures</div><div style="display:flex;gap:5px">${[0,1,2].map(i=>`<span onclick="toggleDeathSave(${idx},'failure',${i});renderPCOverview()" style="font-size:20px;cursor:pointer;-webkit-tap-highlight-color:transparent;opacity:${i<(pc.death_saves?.failures||0)?1:0.22}">💀</span>`).join('')}</div></div>
      </div>
    </div>`;
    // Hit dice pips
    const hdUsedN=pc.hd_used||0;
    const conMod=modN('con');
    const healAmt=Math.max(1,Math.floor(hitDie/2)+conMod);
    let hdPips='';for(let i=0;i<lvl;i++)hdPips+=`<span onclick="csSpendHD(${idx},${i})" style="width:22px;height:22px;border-radius:50%;display:inline-block;cursor:pointer;border:2px solid var(--green);background:${i<hdUsedN?'var(--surface3)':'var(--green)'};margin:1px;transition:background .15s;-webkit-tap-highlight-color:transparent" title="${i<hdUsedN?'Spent':'Spend for ~'+healAmt+' HP'}"></span>`;
    const hdSection=`<div style="margin-bottom:12px"><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;font-weight:600;margin-bottom:4px">Hit Dice (${Math.max(0,lvl-hdUsedN)} of ${lvl}d${hitDie} remaining) — tap to spend</div><div style="display:flex;flex-wrap:wrap;gap:2px">${hdPips}</div></div>`;
    // Exhaustion pips
    const exhaust=pc.exhaustion||0;
    let exPips='';for(let i=0;i<6;i++)exPips+=`<span onclick="csSetExhaustion(${idx},${i})" style="width:20px;height:20px;border-radius:50%;display:inline-block;cursor:pointer;border:2px solid var(--red);background:${i<exhaust?'var(--red)':'var(--surface3)'};margin:1px;transition:background .15s;-webkit-tap-highlight-color:transparent"></span>`;
    const exhaustSection=`<div style="margin-bottom:12px"><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;font-weight:600;margin-bottom:4px">Exhaustion (${exhaust}/6)</div><div style="display:flex;gap:2px">${exPips}</div></div>`;
    // Resources
    let resHtml='';
    if((pc.resources||[]).length){
      resHtml='<div style="margin-bottom:12px"><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;font-weight:600;margin-bottom:5px">Class Resources</div><div style="display:flex;flex-wrap:wrap;gap:8px">';
      pc.resources.forEach((res,ri)=>{
        const rem=res.max-res.used;
        let pips='';for(let i=0;i<res.max;i++)pips+=`<span onclick="useResource(${idx},${ri},${i});renderPCOverview()" style="width:16px;height:16px;border-radius:50%;display:inline-block;cursor:pointer;border:2px solid var(--purple);background:${i<res.used?'var(--surface3)':'var(--purple)'};-webkit-tap-highlight-color:transparent"></span>`;
        resHtml+=`<div><div style="font-size:9px;color:var(--text-dim);margin-bottom:2px">${esc(res.name)} ${rem}/${res.max}</div><div style="display:flex;gap:3px">${pips}</div></div>`;
      });
      resHtml+='</div></div>';
    }
    // Attacks table
    let atkHtml='';
    if((pc.attacks||[]).length){
      const sm=s=>{const n=parseInt(pc[s])||10;return Math.floor((n-10)/2);};
      atkHtml='<div style="margin-bottom:10px"><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;font-weight:600;margin-bottom:5px">Attacks</div>';
      pc.attacks.forEach((a,ai)=>{
        const b=(a.proficient!==false?prof:0)+sm(a.stat||'str')+(parseInt(a.attackBonus)||0);
        const ds=a.damageStat==='none'?0:sm(a.damageStat||a.stat||'str');
        const db=ds+(parseInt(a.damageBonus)||0);
        atkHtml+=`<div onclick="rollAttack(${idx},${ai})" style="background:var(--surface3);border:1px solid var(--border-bright);border-radius:5px;padding:6px 10px;cursor:pointer;margin-bottom:5px;-webkit-tap-highlight-color:transparent;touch-action:manipulation"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:11px;font-weight:600;color:var(--text-bright)">${esc(a.name||'Attack')}</span><span style="font-size:10px;color:var(--gold-bright)">${b>=0?'+':''}${b} to hit</span></div><div style="font-size:10px;color:var(--text-dim)">${a.damageDie||'1d6'}${db===0?'':db>0?'+'+db:db} ${a.notes?'· '+esc(a.notes):''}</div></div>`;
      });
      atkHtml+='</div>';
    }
    return`<div class="sheet-section">${hpControls}${deathSaves}${hdSection}${exhaustSection}${condHtml}${concBadge}${resHtml}${atkHtml}</div>`;
  }

  // ── SPELLS TAB ──
  function spellsTab(){
    let slotHtml='';
    if((pc.slots||[]).length){
      slotHtml='<div style="margin-bottom:12px"><div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;font-weight:600;margin-bottom:5px">Spell Slots</div><div class="spell-slots">';
      pc.slots.forEach((s,si)=>{if(!s||typeof s.max!=='number')return;slotHtml+=`<div class="slot-level"><div class="sl-label">${SPELL_LVLS[si]}</div><div class="slot-pips">`;for(let i=0;i<s.max;i++)slotHtml+=`<span class="slot-pip ${i<(s.used||0)?'used':''}" onclick="toggleSlot(${idx},${si},${i});renderPCOverview()"></span>`;slotHtml+='</div></div>';});
      slotHtml+='</div></div>';
    }
    const book=pc.spellbook||[];
    let bookHtml='';
    if(book.length){
      const LVLS=['Cantrip','1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];
      // Group by level
      const byLvl={};book.forEach(sp=>{const k=sp.level||0;if(!byLvl[k])byLvl[k]=[];byLvl[k].push(sp);});
      Object.keys(byLvl).sort((a,b)=>+a-+b).forEach(k=>{
        const lvlLabel=k==='0'?'Cantrips':(LVLS[+k]||k+'th')+' Level';
        bookHtml+=`<div style="font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;margin:10px 0 4px;border-bottom:1px solid var(--border);padding-bottom:3px">${lvlLabel}</div>`;
        byLvl[k].forEach(sp=>{
          bookHtml+=`<details style="margin-bottom:3px"><summary style="list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border)"><span style="font-size:11px;font-weight:600;color:var(--text-bright)">${esc(sp.name||'?')}</span><span style="font-size:9px;color:var(--purple-bright);background:rgba(138,94,106,.18);padding:1px 6px;border-radius:3px">${k==='0'?'Cantrip':LVLS[+k]||k+'th'}</span></summary><div style="font-size:10px;color:var(--text-dim);padding:5px 0 4px;line-height:1.5">${sp.castTime?'<span style="color:var(--text)">'+esc(sp.castTime)+'</span>':''}${sp.range?' · '+esc(sp.range):''}${sp.duration?' · '+esc(sp.duration):''}${sp.components?'<br>'+esc(sp.components):''}${sp.desc?'<br><span style="color:var(--text);margin-top:3px;display:block">'+esc(sp.desc)+'</span>':''}</div></details>`;
        });
      });
    } else {bookHtml='<div style="color:var(--text-dim);font-size:11px;padding:6px 0">No spells in spellbook.</div>';}
    if(pc.magic&&pc.magic!=='None'&&pc.magic.trim()){
      bookHtml=`<details style="margin-bottom:8px"><summary style="list-style:none;cursor:pointer;font-size:10px;font-weight:600;color:var(--purple-bright)">✨ Spellcasting Notes</summary><div style="font-size:10px;color:var(--text-dim);margin-top:5px;white-space:pre-line;line-height:1.7">${esc(pc.magic)}</div></details>`+bookHtml;
    }
    const compBtn=`<div style="display:flex;gap:6px;margin-bottom:10px"><button class="btn sm" onclick="openCompendiumFromOverview(${idx})" style="font-size:10px">📚 Browse Compendium</button></div>`;
    return`<div class="sheet-section">${slotHtml}${compBtn}${bookHtml}</div>`;
  }

  // ── GEAR TAB ──
  function gearTab(){
    const inv=pc.inventory||[];
    const gear=inv.filter(i=>GEAR_TYPES.has(i.type));
    const carried=inv.filter(i=>!GEAR_TYPES.has(i.type));
    const mkItem=(item,ii)=>{
      if(locked){
        const tag=item.type?`<span class="inv-tag ${item.type}" style="font-size:9px">${item.type}</span>`:'';
        return`<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:11px;color:var(--text-bright)">${esc(item.name||'?')}</span>
          ${tag}<span style="font-size:10px;color:var(--text-dim)">×${item.qty||1}</span>
          ${item.notes?`<span style="font-size:10px;color:var(--text-dim)">${esc(item.notes)}</span>`:''}
        </div>`;
      }else{
        const typeOpts=PC_ITEM_TYPES.map(t=>`<option value="${t}" ${item.type===t?'selected':''}>${t}</option>`).join('');
        return`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:6px 8px;margin-bottom:5px">
          <div style="display:flex;gap:5px;align-items:center;margin-bottom:4px">
            <input type="text" value="${esc(item.name||'')}" style="flex:1;font-size:12px;font-weight:600" placeholder="Item" onchange="updPcItem(${idx},${ii},'name',this.value)">
            <button class="btn sm red icon-btn" onclick="remPcItemSheet(${idx},${ii})">&times;</button>
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;font-size:11px">
            <select style="font-size:10px;padding:2px 4px" onchange="updPcItem(${idx},${ii},'type',this.value)">${typeOpts}</select>
            <span style="color:var(--text-dim)">×</span><input type="number" value="${item.qty||1}" style="width:36px;font-size:11px" onchange="updPcItem(${idx},${ii},'qty',parseInt(this.value)||1)">
            <input type="text" value="${esc(item.notes||'')}" style="flex:1;min-width:60px;font-size:11px;color:var(--text-dim)" placeholder="notes…" onchange="updPcItem(${idx},${ii},'notes',this.value)">
          </div>
        </div>`;
      }
    };
    let gearHtml='';
    if(gear.length){gearHtml='<div style="font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px">⚔ Equipped</div>'+gear.map(item=>mkItem(item,inv.indexOf(item))).join('');}
    if(carried.length){gearHtml+='<div style="font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;margin:'+(gear.length?'12px':'0')+' 0 6px">🎒 Carried</div>'+carried.map(item=>mkItem(item,inv.indexOf(item))).join('');}
    if(!inv.length)gearHtml='<div style="color:var(--text-dim);font-size:11px;padding:6px 0">No items yet.</div>';
    if(!locked)gearHtml+=`<button class="btn sm gold" onclick="addPcItem(${idx})" style="margin-top:8px">+ Add Item</button>`;
    // Currency (display from treasury, link)
    const coins=state.treasuryData?.coins||state.treasuryData||{};
    const gp=state.treasuryData?.gp||0;const sp=state.treasuryData?.sp||0;const cp=state.treasuryData?.cp||0;const pp=state.treasuryData?.pp||0;const ep=state.treasuryData?.ep||0;
    const coinHtml=`<div style="margin-top:14px"><div style="font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px">Party Currency <button onclick="closePCOverview();openTreasury()" style="font-size:9px;color:var(--gold);background:none;border:none;cursor:pointer;padding:0 4px">→ Treasury</button></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${[['CP',cp,'#a06040'],['SP',sp,'#a0a0b0'],['EP',ep,'#90a0a0'],['GP',gp,'#c8a040'],['PP',pp,'#b090c0']].map(([l,v,c])=>`<div style="background:var(--surface2);border:1px solid ${c};border-radius:6px;padding:4px 8px;text-align:center;min-width:38px"><div style="font-size:9px;color:${c};font-weight:700">${l}</div><div style="font-size:13px;font-weight:700;color:var(--text-bright)">${v}</div></div>`).join('')}
      </div></div>`;
    return`<div class="sheet-section">${gearHtml}${coinHtml}</div>`;
  }

  // ── FEATURES TAB ──
  function featuresTab(){
    // Features list
    let featHtml='';
    const featsRaw=pc.features||'';
    if(featsRaw.trim()){
      featHtml=`<details class="bs" style="margin-bottom:8px" open><summary>📜 Class Features &amp; Feats</summary><div class="bs-body"><div style="font-size:11px;color:var(--text);white-space:pre-line;line-height:1.6">${esc(featsRaw)}</div></div></details>`;
    }
    // Languages
    const langs=Array.isArray(pc.languages)?pc.languages:[];
    let langHtml=`<div style="margin-bottom:12px"><div style="font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px">Languages</div><div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">`;
    langs.forEach((l,li)=>{langHtml+=`<span style="font-size:11px;background:var(--surface3);border:1px solid var(--border-bright);border-radius:10px;padding:2px 8px;color:var(--text-bright)">${esc(l)}${!locked?` <button onclick="csRemLang(${idx},${li})" style="background:none;border:none;color:var(--text-dim);cursor:pointer;padding:0 2px;font-size:10px">✕</button>`:''}</span>`;});
    if(!locked)langHtml+=`<button onclick="csAddLang(${idx})" class="btn sm" style="padding:2px 8px;min-height:24px;font-size:11px">+ Add</button>`;
    langHtml+='</div></div>';
    // Proficiencies & Skills (text)
    const skillsRaw=pc.skills||'';
    let skillsHtml='';
    if(skillsRaw.trim()||!locked){
      skillsHtml=`<div style="margin-bottom:12px"><div style="font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px">Equipment Proficiencies &amp; Notes</div>${locked?`<div style="font-size:11px;color:var(--text);white-space:pre-line;line-height:1.6">${esc(skillsRaw)||'—'}</div>`:`<textarea id="cs-equip-profs-${idx}" onchange="upd(${idx},'skills',this.value)" style="min-height:60px"></textarea>`}</div>`;
    }
    // Character Soul (Personality/Ideals/Bonds/Flaws)
    const hasSoul=pc.personality||pc.ideals||pc.bonds||pc.flaws;
    const soulContent=locked?
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${[['Personality',pc.personality],['Ideals',pc.ideals],['Bonds',pc.bonds],['Flaws',pc.flaws]].map(([l,v])=>`<div><div style="font-size:9px;color:var(--text-dim);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">${l}</div><div style="font-size:11px;color:var(--text);line-height:1.5">${esc(v)||'—'}</div></div>`).join('')}
      </div>`
      :`<div style="display:flex;flex-direction:column;gap:8px">
        ${[['Personality','cs-personality-'+idx,'personality'],['Ideals','cs-ideals-'+idx,'ideals'],['Bonds','cs-bonds-'+idx,'bonds'],['Flaws','cs-flaws-'+idx,'flaws']].map(([l,id,k])=>`<div><label class="field-label">${l}</label><textarea id="${id}" onchange="upd(${idx},'${k}',this.value)" style="min-height:50px"></textarea></div>`).join('')}
      </div>`;
    const soulHtml=`<details class="bs" ${hasSoul?'open':''}><summary>🧠 Character Soul</summary><div class="bs-body">${soulContent}</div></details>`;
    // Inspiration + Prof
    const inspoHtml=`<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
      <div onclick="toggleInspiration(${idx});renderPCOverview()" style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;padding:4px 10px;border-radius:5px;border:1px solid ${pc.inspiration?'var(--gold)':'var(--border)'};background:${pc.inspiration?'var(--gold-dim)':'transparent'};-webkit-tap-highlight-color:transparent;touch-action:manipulation"><span style="font-size:14px">${pc.inspiration?'⭐':'☆'}</span><span style="font-size:10px;color:${pc.inspiration?'var(--gold-bright)':'var(--text-dim)'}">Inspiration</span></div>
      <div style="font-size:11px;color:var(--text-dim)">Proficiency Bonus: <strong style="color:var(--gold)">+${prof}</strong></div>
    </div>`;
    return`<div class="sheet-section">${inspoHtml}${featHtml}${langHtml}${skillsHtml}${soulHtml}</div>`;
  }

  // ── ACTION ROW ──
  const actionRow=`<div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
    <button class="btn sm" style="flex:1" onclick="closePCOverview();state.activeEditTab=${idx};const d=document.getElementById('char-editor-details');if(d)d.open=true;openDrawer('tab-party')">✎ Edit</button>
    <button class="btn sm red" onclick="if(confirm('Delete '+(state.pcs[${idx}]?.name||'character')+'?')){closePCOverview();delChar(${idx})}" style="padding:4px 10px" title="Delete">🗑</button>
  </div>`;

  // ── ASSEMBLE ──
  const tabContents=[coreTab,skillsTab,combatTab,spellsTab,gearTab,featuresTab];
  const activeTab=tabContents[_charSheetTab]?tabContents[_charSheetTab]():'';
  return headerStrip+rollResultStrip+tabRow+activeTab+actionRow;
}


// ═══ CHARACTER SHEET REWORK — HELPER FUNCTIONS ═══
function csSpendHD(idx,pipIdx){
  const pc=state.pcs[idx];if(!pc)return;
  const hdUsed=pc.hd_used||0;const lvl=pc.level||1;
  const cls=(pc.class||'fighter').toLowerCase().trim();
  const classKey=Object.keys(LEVEL_UP_DATA).find(k=>cls.includes(k));
  const hitDie=classKey?LEVEL_UP_DATA[classKey].hit_die:8;
  const conMod=(()=>{const n=parseInt(pc.con)||10;return Math.floor((n-10)/2);})();
  if(pipIdx<hdUsed){
    // Click on spent pip = un-spend (refund)
    pc.hd_used=Math.max(0,hdUsed-1);
  }else{
    // Spend a hit die = heal
    if(hdUsed>=lvl){toast('No hit dice remaining!');return;}
    const roll=Math.ceil(Math.random()*hitDie);
    const heal=Math.max(1,roll+conMod);
    pc.hp=Math.min(pc.hp_max,(pc.hp||0)+heal);
    pc.hd_used=hdUsed+1;
    toast('Hit Die: d'+hitDie+'('+roll+')+'+conMod+' = '+heal+' HP healed!',2500);
  }
  save();renderPCOverview();renderHUD();
}
function csSetExhaustion(idx,pipIdx){
  const pc=state.pcs[idx];if(!pc)return;
  const cur=pc.exhaustion||0;
  // Toggle: clicking the current last pip removes it; clicking new pip sets new level
  pc.exhaustion=cur===pipIdx+1?pipIdx:pipIdx+1;
  save();renderPCOverview();
}
function csAddLang(idx){
  const lang=prompt('Add language:','');
  if(!lang||!lang.trim())return;
  if(!Array.isArray(state.pcs[idx].languages))state.pcs[idx].languages=[];
  state.pcs[idx].languages.push(lang.trim());
  save();renderPCOverview();
}
function csRemLang(idx,li){
  state.pcs[idx].languages.splice(li,1);
  save();renderPCOverview();
}

// ═══ EXPOSE ALL FUNCTIONS NEEDED BY HTML EVENT HANDLERS ═══
// These are global because HTML onclick/oninput/etc. attributes need them
Object.assign(window, {
  _luNext, _luSkipSwap, _luRollHP, _luSelectSubclass, _luSetHP, _luToggleSpell, _luUpdateASI, _luSetASIMode, _luSelectFeat, _luUpdateFeatAbility, _luFilterFeats, _luSelectSwapOld, _luSelectSwapNew, FEATS_DB,
  addAttack, addCampaignSecret, addCell, addCombCond, addCombatant, cloneCombatant, addCondFromPicker,
  addAnimal, updAnimal, remAnimal, openAnimalOverview, renderAnimals,
  addFamiliar, addIncome, removeIncomeEntry, updIncome, closeIncomeEdit, addLogEntry, addModuleEpisode, addNPC, addNewChar,
  addPartyItem, addPartyToCombat, addPcItem, addPreset, addQA, addQuest,
  addFromCompendium, addManeuverToPC, MANEUVER_DB, SPELL_DB, addResource, addScene, addSlotLvl, addSnip, addSpell, addTownRep, addWagonItem,
  adjHP, applyLevelUp, askDMFromParty, auditWithAI, awardXP,
  buildAISummary, buildRawSummary,
  chatKey, chatKeyQuick, checkResetConfirm, clearChat, clearChkHist,
  clearLog, clearPartyBadge, clearResolvedFlags,
  closeDrawer, closeFlagModal, closeHeaderMenu, closeLevelUpModal, closeModal, openModal,
  closePCOverview, closeQAMenu, closeQAModal, closeTabOverflow, closeTreasury,
  completeSetup, connectFirebase, copyIdx, copyStateCompact, copyText,
  delChar, deleteChatMsg, deleteFlag, doLongRest, doQAHP, doShortRest,
  doStateFix, editFlagNote, endCombat, executeReset,
  exportConfig, exportFlagReport, fbDisconnect, genLedger, generateSessionZero, sendSessionZero,
  setFlagCatFilter, copyDevNotes,
  saveContract, renderContracts,
  handlePluginCmd, importConfig, importFromPaste, justSave, launchCampaign,
  loadPreset, lockPremise, logTurn, markChkDone,
  navTo, nextTurn, oocKey, openDashboard, openDrawer, openFlagModal,
  openLogisticsDrawer, openSystemsDrawer, switchLogisticsTab, switchSystemsTab,
  openLevelUpWizard, openPCOverview, openQASheet, openRollSheet, openTreasury, partyKey, renderTurnTracker,
  pcLongRest, pcShortRest, prevTurn, quickD20, quickRoll,
  remCell, remComb, remModuleEp, remNPC, remPI,
  remPcItemSheet, remPreset, remQA, remQ, remRel, remScene,
  remSecret, remSlotLvl, remSnip, remSpell, remTown, remWItem,
  renderAll, renderSheets, renderCards, renderChat, renderCells, renderNPCs, renderQAEditor, renderQAResources, renderTownRep, toast,
  resolveConsequence, addConsequence, updConsequence, remConsequence, clearResolvedConsequences, dedupConsequences, dedupNPCs, dedupQuests, dedupLocations, dedupTownRep, rollAttack, rollStatCheck, rollInitiative,
  saveRefresh, saveSetupPC, saveTts, saveBP,
  scrollStoryBottom, scrollStoryTop, selectFlagCat,
  sendContextRefresh, sendMsg, sendMsgQuick, sendOOCMsg, sendPartyMsg,
  sendRollToChat, sendSceneToDM, sessionRecap, setProvider, setScene,
  setSheetTab, setTtsProvider,
  showChatTab, renderSuggestChips, fillSuggest, showSessionMode, showSessionTab, showSetupStep, showTab, showWorldTab,
  speakActiveScene, speakIdx, speakScene, st, submitFlag, sw, switchUser,
  testTts, toggleCombCond, toggleCond, clearPCConditions, toggleDeathSave, toggleDockDice, toggleEpContent, toggleFlagVerdict, toggleInspiration,
  toggleHeaderMenu, toggleHeaderEdit, execHeaderSC, renderHeaderShortcuts,
  togglePremise, toggleQAContext, toggleQAMenu, toggleSkillProf,
  toggleSlot, toggleSuperpower, toggleTabOverflow, toggleThemeMode, toggleVis,
  triggerChk, uninstallPlugin, upd, updAtk, updCell, updCombHP, updFamiliar,
  updModuleEp, updNPC, updPI, updPcItem, updPreset, updQ, updQA, updRel,
  updQAFabIcon, pickQAFabIcon,
  updResource, updScene, updSecret, updSlot, updSnip, updSpell, updTown,
  toggleItemTag, updWItem, updateCpMode, updateRollMod, updateStateFixForm, updateStoryThread,
  useResource, verifyElKey, renderPartyPCList, toggleSkillProf,
  sendRollToChat, addPartyItem, remPI, updPI, closeInvEdit,
  showTermTip, rollStatCheck, rollInitiative,
  _expandedMsgs, openCompendiumFromOverview, setCompFilter, setSpellFilter, toggleCompendium,
  openFamiliarOverview, closeFamiliarOverview, openGritOverview, closeGritOverview, syncMountTitle,
  renderLocations, openLocationDetail, closeLocDetail, toggleLocDmMode,
  addLocationManual, updateLocNotes, addLocHistory, addLocNPC, addLocInvestment,
  setLocStatus, deleteLocation, openLocationSeed, closeLocSeed, confirmLocationSeed,
  uploadAreaMap, removeAreaMap, startMapPlace, cancelMapPlace, handleMapTap, setLocView, pinAction, closePinMenu, movePin, unpinFromMap,
  openSheetPicker, dismissRollRequest, openRollFromQueue,
  renderSessionArchive, handleModuleFile, handleModulePDF, handleModuleMD, previewPDFSection, autoAssignPDF, applyPDFImport, cancelPDFImport, _pdfModeToggle, recalibrateModule,
  verifyContracts, clearFlagNote,
  rsAdjMod, rsRollDice, _buildRsPills,
  renderCharSheet, toggleSheetLock, setCharSheetTab,
  csSpendHD, csSetExhaustion, csAddLang, csRemLang,
  renderContextStrip, _tapCtxStrip, renderWorldBar, copyContracts,
  navToast, _mechPillNav, catchUpAudit, deepSeed, renderJournalHeader, renderJournalRep, scrollActiveChatBottom, scrollActiveChatTop,
  toggleTestMode, clearTestChat, exportTestChat, sendTestMsg,
  save, saveEditedNote,
  previouslyOn, viewQuestInChat,
  exportGameplayLog, exportMoment, exportOOCMoment, deleteOOCMsg, populateVoices, openResetModal, requestNotifPermission,
  saveDmSecrets, renderSetupPCCards, resetTurns, resyncAI, quickSellItem,
  zoneTokenTap, zoneBoxTap, zoneHPAdj, zoneHPCustom, quickAddCond, toggleMoveMode, toggleZoneFog,
  renderSetupLock, setSetupUnlocked, remAtk, rewindTo,
  renderPCOverview, renderHUD, renderCharTabs,
  remPcItem, remResource, renderCapacity, renderErrorLog, closeWEdit, setCargoPCFilter, _setInvSearch,
});
// Live getter so inline onclick/oninput can access `state` even after Firebase reassigns it
Object.defineProperty(window,'state',{get(){return state;},configurable:true});

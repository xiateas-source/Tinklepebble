// CSS loaded via <link rel="stylesheet"> in index.html — no import needed

// ═══ CONSTANTS ═══
const ALL_CONDS=['Blinded','Charmed','Deafened','Exhausted','Frightened','Grappled','Incapacitated','Invisible','Paralyzed','Petrified','Poisoned','Prone','Restrained','Stunned','Unconscious'];
const SPELL_LVLS=['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];
const XP_T=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
const CP_INT={exploration:6,combat:3,roleplay:8,custom:6};
const MAX_LB=1080;
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
    5:{auto:['Extra Attack: Attack twice when you take the Attack action.'],choose:[]}
  }},
  rogue:{hit_die:8,levels:{
    2:{auto:['Cunning Action: Dash, Disengage, or Hide as a Bonus Action each turn.'],choose:[]},
    3:{auto:['Sneak Attack increases to 2d6.'],choose:[{type:'subclass',prompt:'Choose Roguish Archetype',options:['Arcane Trickster','Assassin','Thief','Mastermind','Swashbuckler']}]},
    4:{auto:[],choose:[{type:'asi',prompt:'Ability Score Improvement'}]},
    5:{auto:['Uncanny Dodge: Use Reaction to halve damage from an attacker you can see.','Sneak Attack increases to 3d6.'],choose:[]}
  }},
  bard:{hit_die:8,
    slots:{1:[2],2:[3],3:[4,2],4:[4,3],5:[4,3,2]},
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
        choose:[{type:'spell',prompt:'Choose 1 new Bard spell (up to 3rd level)',count:1,tier:3}]}
    }
  }
};
const BARD_SPELLS={
  0:['Dancing Lights','Friends','Light','Mage Hand','Mending','Message','Minor Illusion','Prestidigitation','True Strike','Vicious Mockery'],
  1:['Animal Friendship','Bane','Charm Person','Comprehend Languages','Cure Wounds','Detect Magic','Disguise Self','Faerie Fire','Feather Fall','Healing Word','Heroism','Identify','Illusory Script','Longstrider','Silent Image','Sleep','Speak with Animals','Thunderwave','Unseen Servant'],
  2:['Animal Messenger','Blindness/Deafness','Calm Emotions','Cloud of Daggers','Crown of Madness','Detect Thoughts','Enhance Ability','Enthrall','Heat Metal','Hold Person','Invisibility','Knock','Lesser Restoration','Locate Object','Magic Mouth','Phantasmal Force','See Invisibility','Shatter','Silence','Suggestion','Zone of Truth'],
  3:['Bestow Curse','Clairvoyance','Dispel Magic','Fear','Hypnotic Pattern','Major Image','Nondetection','Plant Growth','Sending','Slow','Speak with Dead','Stinking Cloud','Tongues']
};

// ═══ D&D TERM GLOSSARY ═══
const TERM_TIPS={
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
  'Exhaustion':'Stacks 1–6: ×1 disadvantage on checks, ×2 speed halved, ×3 disadvantage attacks/saves, ×4 speed 0, ×5 max HP halved, ×6 death.',
  'Concentration':'Damaged → CON save (DC 10 or ½ damage). Casting another concentration spell ends previous.',
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
const SAVE_VERSION=12;

// ═══ FIREBASE DROP 2 ═══
let fbConfig=null,fbApp=null,fbDb=null,fbRef=null,fbListening=false,fbLastWrite=0,fbEnabled=false;
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
    toast('⚠ Firebase unavailable — running in local-only mode');
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
      var localChat=state.chatHistory||[];
      var remoteChat=remote.chatHistory||[];
      var chatMerged=_mergeChatHistories(localChat,remoteChat);
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
      // Only merge static identity fields — migrate() owns all level-dependent fields.
      // getCanonicalPCs() reads from current state.pcs which may be demo/Level-1 data on a
      // fresh device, so including hp_max/slots/features/etc here causes them to be clobbered.
      var SHEET_FIELDS=['name','race','background','alignment','ac','speed',
        'passive_perception','passive_insight','str','dex','con','int','wis','cha',
        'backstory_origin','backstory_motivation','backstory_secret','color','initiative'];
      getCanonicalPCs().forEach(function(canonical){
        var saved=remote.pcs?remote.pcs.find(function(pc){return pc.id===canonical.id;}):null;
        if(saved){SHEET_FIELDS.forEach(function(f){if(canonical[f]!==undefined)saved[f]=canonical[f];});
            if(canonical.inventory&&canonical.inventory.length>0&&(!saved.inventory||saved.inventory.length===0)){
              saved.inventory=JSON.parse(JSON.stringify(canonical.inventory));
            }
        }
      });
      remote.saveVersion=SAVE_VERSION;
      state=remote;state._ts=remoteTs;
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
    toast('⚠ Firebase unavailable — offline mode only');
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
    toast('Config parse error: '+e.message);
    var errEl=document.getElementById('fb-error');
    if(errEl){errEl.textContent='Error: '+e.message;errEl.style.display='block';}
    console.error('Firebase config error:',e);
  }
}


// ═══ STATE ═══
let state={
  pcs:[
    {
      id:'slasher',name:'Slasher',race:'Black Dragonborn',class:'Fighter',level:1,
      background:'Guild Artisan (Smith)',alignment:'Lawful Good',
      hp:13,hp_max:13,ac:16,initiative:1,speed:30,passive_perception:11,passive_insight:11,
      xp:0,color:'#c04a3a',
      str:'17 (+3)',dex:'12 (+1)',con:'16 (+3)',int:'10 (+0)',wis:'12 (+1)',cha:'13 (+1)',
      skills:'Athletics +5, Intimidation +3, Insight +3, Persuasion +3',
      features:'GREAT WEAPON FIGHTING (Style): When rolling damage for an attack with a two-handed weapon, reroll any 1 or 2 — must use new roll.\nSECOND WIND (Bonus Action, 1/Short Rest): Regain 1d10+1 HP as a bonus action.\nACID BREATH (Action, Recharge 5-6): 5x30ft line, all creatures make DC 13 CON save or take 2d6 acid damage (half on success). Black Dragonborn trait.\nACID RESISTANCE: Resistance to acid damage.\nHEAVY ARMOR PROFICIENCY: Wearing chain mail (AC 16). Disadvantage on Stealth checks.\nGREATSWORD: 2d6 slashing, heavy, two-handed. Primary weapon.\nSMITH\u2019S TOOLS: Proficient. Handles all equipment maintenance and repairs for the party and wagon. This is his identity — he is the son of smiths.\nGUILD MEMBERSHIP: Can call on the Smith\u2019s Guild for support, lodging, and contacts in most towns.\nHONEST TO A FAULT: Cannot deceive. Genuinely baffled by Tinkle and Pebble\u2019s methods but follows their lead without question. If asked to lie, he will simply stand there looking confused.\nPROTECTOR: Has quietly sworn to keep Tinkle and Pebble safe. They handle the talking. He handles everything else.',
      magic:'None. Fighter with no spellcasting.',
      resources:[
        {name:"Second Wind",max:1,used:0,restore:'short',desc:'Bonus action, heal 1d10+1 HP'}
      ],
      conditions:[],
      slots:[],
      inventory:[
        {name:'Chain Mail',qty:1,weight:55,type:'supply',notes:'AC 16. Stealth disadvantage. Currently worn.'},
        {name:'Greatsword',qty:1,weight:6,type:'supply',notes:'2d6 slashing, heavy, two-handed. Primary weapon.'},
        {name:'Handaxe',qty:2,weight:4,type:'supply',notes:'1d6 slashing, thrown (20/60ft).'},
        {name:"Smith's Tools",qty:1,weight:8,type:'supply',notes:'Proficient. Used for party equipment maintenance and repairs.'},
        {name:"Dungeoneer's Pack",qty:1,weight:12,type:'supply',notes:'Rope, torches, rations, waterskin, tinderbox, backpack.'}
      ],
      backstory_origin:'Born to a family of smiths with a proud name and a longer history. Grew up with metal and fire, not words. Left the forge to become an adventurer because he believes the best smiths must first understand what their weapons endure. Has never been in a situation that required talking his way out.',
      backstory_motivation:'Forge himself into the perfect weapon. Become the best smith of his name. Every scar earned adventuring is research.',
      backstory_secret:'Genuinely does not understand that Tinkle\u2019s Tinctures is a con operation. He thinks they are a legitimate traveling apothecary. He is very proud to be part of something that helps people.',
      pending:[]
    },
    {
      id:'tinkle',name:'Tinkle',race:'Tortle',class:'Rogue',level:1,
      background:'Scholar / Con-Artist',alignment:'Neutral (Self-Interested)',
      hp:10,hp_max:10,ac:17,initiative:2,speed:30,passive_perception:10,passive_insight:13,
      xp:0,color:'#4a7090',
      str:'10 (+0)',dex:'14 (+2)',con:'13 (+1)',int:'16 (+3)',wis:'12 (+1)',cha:'8 (-1)',
      skills:'Deception +5 (Expertise), Investigation +5 (Expertise), Insight +3, Sleight of Hand +4, Stealth +4, Medicine +3',
      features:'NATURAL ARMOR: AC 17 flat. Cannot wear armor. Shields allowed.\nSHELL DEFENSE (Reaction or Hide Action): Withdraw into shell. Gain +4 AC (AC 21), become prone and incapacitated. Emerge using Bonus Action. Use when crowd turns hostile.\nSNEAK ATTACK (1d6): Once per turn when attacking with advantage OR when an ally is adjacent to target. Flavor: "persuasive exits when a grift goes south."\nTHIEVES CANT: Secret language of the criminal underworld.\nEXPERTISE: Deception and Investigation at double proficiency.\nHOLD BREATH: Up to 1 hour.\nCLAWS: 1d4 slashing natural weapon (melee).\nBLOWGUN: 1d1 piercing, range 25/100ft, loading (one shot per action). Loaded with Torpor Poison (DMG p.258): DC 15 CON save or incapacitated for 4d6 hours. Non-lethal preferred.\nTHE MASTERMIND: Tinkle manufactures the tonics, runs the operation, writes the labels. Always looking for an angle. Justifies grifts as "experimental field data collection."\nNote: Subclass (Arcane Trickster) unlocks at Level 3.',
      magic:'None at Level 1. Arcane Trickster spellcasting unlocks at Level 3.',
      resources:[],
      conditions:[],slots:[],inventory:[],
      backstory_origin:'Leads a trio of traveling grifters. Rolls into towns with "The Shelled Alchemist" wagon, laden with shimmering useless vials. Has been doing this long enough to have a system.',
      backstory_motivation:'Maximum profit, minimum effort. The placebo effect is a documented scientific phenomenon.',
      backstory_secret:'Perpetually one bad batch away from a bounty. Keeps the party moving before locals realize the side effects. Secretly fears Slasher or Pebble will decide he is more trouble than he is worth.',
      pending:[]
    },
    {
      id:'pebble',name:'Pebble',race:'Goliath (Stone Giant Ancestry)',class:'Bard',level:1,
      background:'Merchant',alignment:'Neutral Good',
      hp:10,hp_max:10,ac:13,initiative:2,speed:35,passive_perception:10,passive_insight:12,
      xp:0,color:'#7060a0',
      str:'8 (-1)',dex:'14 (+2)',con:'14 (+2)',int:'13 (+1)',wis:'10 (+0)',cha:'17 (+3)',
      skills:'Persuasion +7 (Expertise), Deception +7 (Expertise), Performance +5, Insight +2',
      features:'LITTLE GIANT (Passive): Counts as Large size for carrying capacity and push/drag/lift. Personal carry: 240 lb. Push/drag/lift max: 480 lb. Also counts as one size larger for grapple and shove.\nSTONES ENDURANCE (Reaction, 2/Long Rest): When you take damage, roll 1d12+2 (CON mod). Reduce that damage by the result. If damage is reduced to 0, any active concentration spell is automatically protected — no CON save required.\nLUCKY FEAT (3 Luck Points/Long Rest — NOT the Halfling racial): Spend 1 point to gain Advantage on any d20 Test you make, OR impose Disadvantage on an attack roll made against you. Decision made before the roll. This is the FEAT version with luck points, distinct from Halfling Lucky.\nBARDIC INSPIRATION (Bonus Action, 3/Long Rest): Target one creature within 60 feet. They receive a d6 Inspiration die. Within the next 10 minutes they may add it to one d20 Test result — AFTER seeing the roll, BEFORE the DM says if it succeeds.\nSPELLCASTING: Charisma. Save DC 13. Attack Bonus +5.\nCantrips: Friends, Vicious Mockery (2d4 psychic + target has Disadvantage on next attack).\nLevel 1 Spells (2 slots): Sleep, Hideous Laughter (Concentration), Charm Person (Concentration), Healing Word (Bonus Action, 1d4+3 heal).\nAC 13: Leather armor (11) + DEX +2.\nTHE PITCHMAN: Public face of Tinkles Tinctures. Uses Performance and Persuasion to draw crowds and sell the efficacy of Tinkles dubious brews. Bardic Inspiration can be used mid-pitch to bolster a sale. High CHA is the product.',
      magic:'Spellcasting: Charisma | Save DC: 13 | Attack Bonus: +5\nCantrips: Friends, Vicious Mockery\nLevel 1 Spells: Sleep, Hideous Laughter (Conc), Charm Person (Conc), Healing Word',
      resources:[
        {name:'Bardic Inspiration',max:3,used:0,restore:'short',desc:'Bonus action, 60ft range, d6, target adds after seeing roll'},
        {name:"Stone's Endurance",max:2,used:0,restore:'short',desc:'Reaction, 1d12+2 damage reduction, 0 damage = concentration protected'},
        {name:'Lucky Points',max:3,used:0,restore:'long',desc:'Spend for self-advantage on d20 test OR impose disadvantage on attack vs you'}
      ],
      conditions:[],slots:[{max:2,used:0}],inventory:[],
      backstory_origin:'Born to a clan of stone giant-descended traders who measured worth in contracts honored and debts repaid. Pebble is the smallest of their kin — hence the name.',
      backstory_motivation:'Prove that words and wit can move mountains that strength cannot. The Tinctures operation is the proof of concept.',
      backstory_secret:'Once talked a rival merchant caravan into a ruinous deal that bankrupted three families. Still not entirely sure it was wrong.',
      pending:[]
    }
  ],
  worldData:{
    time:'Day 1, 9:00 AM',season:'Early Spring',weather:'Clear, cool (62°F)',
    illum:'Bright Daylight',
    location:'Goodbarrel Logistics HQ — Loading Dock',
    loc_desc:'The last familiar place. Stone walls and ironbound doors. The wagon is loaded. Grit is hitched. Whatever Goodbarrel Logistics was, Tinkles Tinctures is what comes next.',
    setting:'PENDING — Campaign setting to be established through play.',
    plot:"- Goodbarrel Logistics: former employer. Left on terms that are complicated. Still connected in ways that may matter.\n- Tinkles Tinctures is newly independent. The grift operation is the business model.\n- The party dynamic: Tinkle (Mastermind), Pebble (Pitchman), Slasher (the reason exits are needed).",
    secrets:'PENDING — Secrets to be established through play.',
    timers:'PENDING — Active timers to be established through play.',
    premise:"Tinkles Tinctures is a traveling con operation run by three mismatched grifters. Tinkle the Tortle brews the product (mostly useless, occasionally real). Pebble the Goliath sells it to crowds who want to believe. Slasher the Black Dragonborn ensures things escalate in ways nobody planned. They travel in a brightly painted wagon called The Shelled Alchemist, moving town to town before the locals compare notes. Former associates of Goodbarrel Logistics — a connection they neither advertise nor fully disavow.",
    premiseLocked:false,
    primaryMission:'PENDING — To be established through play.',
    scene_title:'',
    scene_threat:'',
    scene_cond:'',
    travelLog:[],
    townReputation:[],
    businessProfile:{
      name:"Tinkle's Tinctures",
      wagaonName:"The Shelled Alchemist (publicly) / The Grift-Wagon (internally)",
      realStock:"Genuine healing potions and useful reagents — produced when Tinkle has quality ingredients and sufficient motivation. These actually work.",
      snakeOil:"Miracle cures, vitality tonics, cure-alls — flavored water, mild sedatives, and the occasional unintended side effect. The main product line.",
      reagents:"Foraged ingredients sold to apothecaries and herbalists. Legitimate revenue stream. Tinkle takes quality seriously here.",
      reputation:'Unknown — new operation',
      notes:"Tinkle justifies the grift as a public service: 'The placebo effect is a documented scientific phenomenon.'"
    },
    campaignSecrets:[
      {text:"Tinkle's secret: perpetually one bad batch from a bounty. Fears the party will cut him loose.",playerKnown:false,pending:false},
      {text:"Pebble's secret: once bankrupted three families with a deal. Not sure it was wrong.",playerKnown:false,pending:false},
      {text:"Slasher genuinely does not know Tinkle's Tinctures is a con operation. He believes it is a legitimate traveling apothecary and is proud to protect it. If he ever finds out, the consequences are unpredictable.",playerKnown:false,pending:false,aiOnly:true}
    ]
  },
  npcs:[
    {name:'Durgrim Ironheart',disposition:'Unknown',details:'Dwarf Guildmaster from a previous operation. Connection to Goodbarrel Logistics.',status:'active',lastSeen:'Goodbarrel Logistics HQ',pending:true}
  ],
  quests:[
    {text:'PENDING — Primary quest to be established through play.',done:false,pending:true},
    {text:'PENDING — Secondary objectives to be established through play.',done:false,pending:true}
  ],
  treasuryData:{
    pp:0,gp:15,ep:0,sp:0,cp:0,
    lifestyle:'Modest (wagon life, 1 gp/day shared)',
    incomeLog:[
      {desc:'Starting funds — party pool',amt:15,type:'in',ts:'Day 1, 9:00 AM',category:'startup'}
    ]
  },
  partyInventory:[
    {name:"Brewer's Supplies",qty:1,weight:9,type:'supply',notes:"Tinkle's primary tool for tonic production"},
    {name:'Empty Vials (assorted)',qty:24,weight:3,type:'supply',notes:'For the product line'},
    {name:'Labels (blank)',qty:50,weight:0.5,type:'supply',notes:'Tinkle writes these. Very official looking.'},
    {name:'Rations',qty:6,weight:12,type:'supply',notes:'3 days for the party'},
    {name:'Rope (50ft)',qty:1,weight:10,type:'supply',notes:''},
    {name:'Torpor Poison doses',qty:3,weight:0,type:'supply',notes:"For Tinkle's blowgun. DC 15 CON save or incapacitated 4d6 hours (DMG p.258)."}
  ],
  wagon:{
    ox:{
      name:'Grit',hp:15,hp_max:15,ac:11,conditions:'None',feed:'fed',
      backstory:'Raised from a calf by Tinkle. The only member of the operation who has never been asked to lie about anything. Has been used as a test subject for new batches on at least three documented occasions.',
      personality:'Stoic and dependable. Unusually calm around Tinkle specifically. Skittish around loud magic. Stubborn on roads he has decided are bad ideas.',
      bonds:{tinkle:'Deeply bonded — raised from calf. Tolerates the experiments with resigned dignity.',pebble:'Comfortable. Responds well to Pebble\'s voice. Possibly the most normal relationship on the wagon.',slasher:'Wary. Has learned that when Slasher gets excited, something loud is about to happen.'},
      quirks:['Refuses to cross bridges at a trot — walk only','Perks up noticeably around apples','Has a scar on his left flank from Experiment 7 — Tinkle does not discuss this','Occasionally regarded with suspicion by other animals, cause unknown'],
      experimentLog:'Vol. 3 (current). Vols 1-2 were lost in a hasty departure from Millhaven.'
    },
    cells:[],
    cargo:[
      {name:'Experiment Log Vol. 3',qty:1,weight:1,type:'supply',notes:"Tinkle's ongoing record of what has been tested on Grit and select willing/unwilling subjects. Moderately incriminating.",ts:'Day 1, 9:00 AM',location:'Goodbarrel Logistics HQ'},
      {name:'Tincture of Vitality (snake oil)',qty:12,weight:2,type:'trade',notes:'Flavored water with a pinch of ginger. Tastes medicinal. Does nothing.',ts:'Day 1, 9:00 AM',location:'Goodbarrel Logistics HQ'},
      {name:'Elixir of Restorative Clarity (snake oil)',qty:8,weight:1,type:'trade',notes:'Mild sedative. Technically solves some problems by making the patient not care about them.',ts:'Day 1, 9:00 AM',location:'Goodbarrel Logistics HQ'},
      {name:'Bottling Kit',qty:1,weight:5,type:'supply',notes:'Corks, wax sealer, funnel, the good labels.',ts:'Day 1, 9:00 AM',location:'Goodbarrel Logistics HQ'}
    ],
    hoard:[],
    hp:20,hp_max:20,ac:11,conditions:'',
    wagonName:"The Shelled Alchemist",
    wagonDesc:"Front: Brightly painted apothecary shop facade. Professional. Trustworthy-looking. Possibly too colorful. Back: Hidden secure compartment for today's coin, label prep, and planning the next town's pitch before the current town catches on."
  },
  relationships:[
    {from:'tinkle',to:'pebble',disposition:'relies_on',dynamic:'The pitch needs the product. Tinkle needs Pebble\'s CHA to make the operation work. Uneasy about the Grit experiments but has never said anything directly.',aiOnly:false},
    {from:'tinkle',to:'slasher',disposition:'fond',dynamic:'Tinkle finds Slasher\'s obliviousness both useful and terrifying. Slasher genuinely believes the operation is legitimate. Tinkle has decided never to correct him.',aiOnly:false},
    {from:'tinkle',to:'grit',disposition:'bonded',dynamic:'Raised from a calf. Genuine attachment. The experiments are scientific. These two things coexist.',aiOnly:false},
    {from:'pebble',to:'tinkle',disposition:'trusts',dynamic:'Pebble believes in the operation even when the product is dubious. Sees Tinkle as the brains. Has questions about the experiment log but asks them gently.',aiOnly:false},
    {from:'pebble',to:'slasher',disposition:'fond',dynamic:'Pebble finds Slasher\'s sincerity both endearing and occasionally heartbreaking. Slasher once complimented Pebble\'s pitch to a customer by saying \'I didn\'t understand any of it but everyone seemed happy\'.',aiOnly:false},
    {from:'slasher',to:'pebble',disposition:'trusts',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'slasher',to:'tinkle',disposition:'neutral',dynamic:'PENDING',aiOnly:false,pending:true}
  ],
  combat:{active:false,round:1,currentIdx:0,list:[]},
  encounterPresets:[
    {name:'Angry Crowd (Grift Gone Wrong)',enemies:'Angry Merchant:8:11, Angry Farmer:7:10, Angry Farmer:7:10, Town Guard:11:16'}
  ],
  scenes:[],activeSceneIdx:-1,
  snippets:[],dmSecrets:'',
  chatHistory:[],logSummary:'',
  logs:[{ts:'Day 1, 9:00 AM',type:'dm',body:"Tinkle's Tinctures campaign terminal v2 initialized. Party data updated. Grit is hitched. The wagon is ready."}],
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
    {id:'qa_6',label:'Feed Grit',type:'ox_feed',params:{},context:['tab-wagon','tab-dm']},
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
    {id:'qa_23',label:'Shell Defense',type:'shell_defense_toggle',params:{},context:['tab-party','tab-combat','tab-dm']}
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
    if(m&&m.style.display!=='none'&&!m.contains(e.target)&&e.target!==gp){m.style.display='none';}
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
  renderAll();genLedger();
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
  document.getElementById('world-state-panel').style.display=tab==='state'?'':'none';
  document.getElementById('world-ops-panel').style.display=tab==='ops'?'':'none';
  const lp=document.getElementById('world-locations-panel');if(lp)lp.style.display=tab==='locations'?'':'none';
  document.getElementById('world-btn-state').classList.toggle('active',tab==='state');
  document.getElementById('world-btn-ops').classList.toggle('active',tab==='ops');
  document.getElementById('world-btn-locs')?.classList.toggle('active',tab==='locations');
  if(tab==='locations')renderLocations();
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
  if(typeof renderStepBar==='function')renderStepBar();
  renderCharTabs();renderCards();renderSheets();renderStatusMini();
  renderNPCs();renderQuests();renderCombat();renderPresets();
  renderLogs();renderChat();renderTurnCtr();
  renderChkHist();renderRewind();renderScenes();renderSnips();renderModuleTracker();renderStoryRead();
  renderWagon();renderIncome();renderPartyInv();syncWorld();renderTreasuryTotal();
  renderCampaignSecrets();renderTownRep();renderConsequences();syncBP();syncOxProfile();renderQAEditor();updProvStatusMini();
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
  renderContextStrip();
}

// ═══ CONTEXT STRIP ═══
function renderContextStrip(){
  const el=document.getElementById('context-strip');if(!el)return;
  if(state.combat&&state.combat.active&&(state.combat.list||[]).length){
    const round=state.combat.round||1;
    const cur=state.combat.list[state.combat.currentIdx||0];
    const curName=cur?cur.name:'—';
    el.innerHTML=`<span style="color:var(--red);font-weight:600">⚔ Round ${round}</span><span style="color:var(--border)">·</span><span style="color:var(--text-dim)">${esc(curName)}'s turn</span>`;
  }else{
    const loc=state.worldData&&state.worldData.location?state.worldData.location:'—';
    const scene=state.worldData&&state.worldData.scene_title?state.worldData.scene_title:'';
    el.innerHTML=`<span style="cursor:pointer;color:var(--gold)" onclick="showTab('tab-world')">${esc(loc)}</span>`+(scene?`<span style="color:var(--border)">·</span><span style="color:var(--text-dim)">${esc(scene)}</span>`:'');
  }
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
    [persona.includes('He does not know the operation is a con'),'① Slasher con-protection clause present'],
    [persona.includes('Never tell him'),'① "Never tell him" present in Persona'],
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
    const conds=(pc.conditions||[]).map(c2=>`<span style="font-size:9px;background:rgba(139,58,42,.25);color:#e08060;border:1px solid var(--red-dim);border-radius:3px;padding:1px 4px">${esc(c2)}</span>`).join(' ');
    const conc=pc.concentrating?`<span style="font-size:9px;color:var(--purple-bright)">⬤ ${esc(pc.concentrating)}</span>`:'';
    return `<div onclick="openPCOverview(${i})" style="background:var(--surface2);border:1px solid ${pc.color||'var(--border)'};border-radius:8px;padding:10px 12px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:border-color .15s">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <div style="flex:1;font-family:var(--serif);font-size:14px;font-weight:600;color:${pc.color||'var(--gold-bright)'}">${esc(pc.name||'PC')}</div>
        <div style="font-size:10px;color:var(--text-dim)">Lv ${pc.level||1} ${esc(pc.race||'')} ${esc(pc.class||'')}</div>
        <div style="font-size:10px;color:var(--text-dim);white-space:nowrap">AC ${pc.ac||10}</div>
        <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:${hpCol}">${hp}<span style="font-size:10px;color:var(--text-dim)">/${max}</span></div>
      </div>
      <div style="height:3px;background:var(--surface3);border-radius:2px;margin-bottom:4px"><div style="height:3px;width:${pct.toFixed(1)}%;background:${hpCol};border-radius:2px;transition:width .3s"></div></div>
      ${(()=>{const xp=parseInt(pc.xp)||0;const nxt=XP_T[Math.min(pc.level||1,19)];const xpPct=nxt?Math.min(100,(xp/nxt)*100):100;return`<div style="display:flex;align-items:center;gap:5px;margin-bottom:4px"><div style="flex:1;height:2px;background:var(--surface3);border-radius:1px"><div style="height:2px;width:${xpPct.toFixed(1)}%;background:var(--gold-dim);border-radius:1px"></div></div><span style="font-size:8px;color:var(--text-dim)">${xp.toLocaleString()} xp</span></div>`;})()}
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
  if(state.pcs.length<=1){toast('Cannot delete last character.');return;}
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
      ${['Skills','Features','Attacks','Spells','Spellbook','Gear'].map((t,i)=>`<button onclick="setSheetTab(${i})" style="flex:1;padding:8px 2px;font-size:9px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;border:none;border-bottom:2px solid ${i===_pcSheetTab?'var(--gold)':'transparent'};background:none;color:${i===_pcSheetTab?'var(--gold)':'var(--text-dim)'};cursor:pointer;font-family:var(--sans);min-height:36px;transition:color .15s">${t}</button>`).join('')}
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
    <div class="form-group"><label class="field-label">Spellcasting</label><textarea id="sheet-magic-${idx}" onchange="upd(${idx},'magic',this.value)" style="min-height:100px"></textarea></div>
    <div class="form-group"><label class="field-label">Spell Slots <button class="slot-add-btn" onclick="addSlotLvl(${idx})">+ Add Level</button></label><div id="slot-ed-${idx}"></div></div>
    `:''}
    ${_pcSheetTab===4?`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-size:11px;color:var(--text-dim)">✨ ${pc.spellbook&&pc.spellbook.length?pc.spellbook.length+' spell'+(pc.spellbook.length===1?'':'s'):'No spells yet'}</span>
      <button class="btn sm gold" onclick="addSpell(${idx})">+ Add Spell</button>
    </div>
    <div id="spellbook-panel-${idx}"></div>
    `:''}
    ${_pcSheetTab===5?`
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
  renderTravelLog();
  // Keep Setup fields in sync with World tab (same state keys, two UIs)
  const spr=document.getElementById('setup-premise');if(spr)spr.value=state.worldData.premise||'';
  const sst=document.getElementById('setup-setting');if(sst)sst.value=state.worldData.setting||'';
  const smq=document.getElementById('setup-mission');if(smq)smq.value=state.worldData.primaryMission||'';
  syncBP();syncOxProfile();
  updatePremiseUI();
  const ox=state.wagon.ox;
  const om={name:'ox-name',hp:'ox-hp',hp_max:'ox-hp-max',ac:'ox-ac',conditions:'ox-cond',feed:'ox-feed'};
  Object.entries(om).forEach(([k,id])=>{const el=document.getElementById(id);if(el&&ox[k]!==undefined)el.value=ox[k];});
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
  sorted.forEach(({n,i:idx})=>{
    const dead=n.status==='deceased'||n.status==='departed';
    const dispCol=n.disposition==='Friendly'||n.disposition==='Ally'?'var(--green)':n.disposition==='Hostile'||n.disposition==='Enemy'?'var(--red)':'var(--text-dim)';
    const d=document.createElement('details');
    d.style.cssText=`margin-bottom:5px;border:1px solid var(--border);border-radius:5px;background:var(--surface2);opacity:${dead?'0.6':'1'}`;
    d.innerHTML=`<summary style="cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;padding:6px 8px">
      <span style="flex:1;font-size:12px;font-weight:600;color:var(--text-bright);${dead?'text-decoration:line-through':''};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.name)||'Unnamed'}</span>
      <span style="font-size:10px;color:${dispCol};flex-shrink:0">${esc(n.disposition||'Neutral')}</span>
      ${n.lastSeen?`<span style="font-size:9px;color:var(--text-dim);flex-shrink:0">${esc(n.lastSeen)}</span>`:''}
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
function remNPC(i){state.npcs.splice(i,1);saveRefresh();}

// ═══ QUESTS ═══
function renderQuests(){
  const c=document.getElementById('quest-list');if(!c)return;c.innerHTML='';
  const sorted=[...state.quests.map((q,i)=>({q,i}))].sort((a,b)=>{
    const rank=s=>s==='active'?0:s==='failed'?1:2;
    return rank(a.q.status)-rank(b.q.status);
  });
  if(!sorted.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px 0">No quests. Tap + Quest.</div>';return;}
  const active=state.quests.filter(q=>q.status==='active').length;
  if(active){const h=document.createElement('div');h.style.cssText='font-size:9px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px';h.textContent='⬤ '+active+' Active';c.appendChild(h);}
  sorted.forEach(({q,i:idx})=>{
    const det=document.createElement('details');det.id='quest-det-'+idx;det.style.cssText='margin-bottom:6px;border:1px solid var(--border);border-radius:6px;background:var(--surface2)';
    const qst=q.status||'active';
    const qcol=qst==='done'?'var(--text-dim)':qst==='failed'?'var(--red)':'var(--green)';
    const hiddenBadge=q.hidden?`<span style="font-size:9px;background:rgba(139,58,42,.2);color:var(--gold);border:1px solid var(--gold-dim);border-radius:3px;padding:1px 5px;margin-left:6px;flex-shrink:0">DM Only</span>`:'';
    const statusIcon=qst==='done'?'✓ Done':qst==='failed'?'✗ Failed':'🟢 Active';
    det.innerHTML=`<summary style="list-style:none;cursor:pointer;padding:8px 10px;display:flex;align-items:center;gap:6px">
      <span style="font-size:10px;color:${qcol};font-weight:700;flex-shrink:0">${statusIcon}</span>
      <span style="flex:1;font-size:12px;${qst==='done'?'text-decoration:line-through;color:var(--text-dim)':qst==='failed'?'color:var(--text-dim)':''};${q.hidden?'opacity:.7':''}">${esc(q.text||'(unnamed quest)')}</span>
      ${hiddenBadge}
    </summary>
    <div style="padding:8px 10px;border-top:1px solid var(--border)">
      <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;align-items:center">
        <select style="width:76px;font-size:10px;padding:3px 4px;border-color:${qcol};color:${qcol}" onchange="updQ(${idx},'status',this.value)"><option value="active" ${qst==='active'?'selected':''}>Active</option><option value="done" ${qst==='done'?'selected':''}>Done</option><option value="failed" ${qst==='failed'?'selected':''}>Failed</option></select>
        <button title="${q.hidden?'Reveal quest to players':'Hide quest from players'}" onclick="updQ(${idx},'hidden',${!q.hidden})" style="font-size:13px;padding:1px 5px;background:none;border:1px solid var(--border);border-radius:4px;cursor:pointer;color:${q.hidden?'var(--gold)':'var(--text-dim)'}">👁</button>
        <button class="btn sm red icon-btn" onclick="remQ(${idx})" style="margin-left:auto">&times;</button>
      </div>
      <input type="text" value="${esc(q.text||'')}" style="font-size:12px;width:100%;box-sizing:border-box;margin-bottom:8px" placeholder="Quest objective..." onchange="updQ(${idx},'text',this.value)">
      ${q.discovery?`<div style="margin-bottom:8px;padding:8px 10px;background:var(--bg);border-radius:4px;border-left:3px solid var(--gold-dim)"><div style="font-size:9px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><span>📖 Discovery · ${esc(q.discovery.ts||'')}</span>${q.chatMsgId?`<button onclick="viewQuestInChat(${JSON.stringify(q.chatMsgId)})" style="font-size:9px;background:none;border:1px solid var(--gold-dim);border-radius:3px;color:var(--gold);padding:1px 5px;cursor:pointer" title="Jump to discovery moment in chat">↗ Chat</button>`:''}</div><div style="font-size:11px;color:var(--text);line-height:1.5;font-style:italic">${esc(q.discovery.text||'')}</div></div>`:''}
      ${q.notes!==undefined?`<div class="form-group" style="margin-bottom:0"><label class="field-label">Notes</label><textarea style="min-height:50px;font-size:11px" onchange="updQ(${idx},'notes',this.value)">${esc(q.notes||'')}</textarea></div>`:''}
    </div>`;
    c.appendChild(det);
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

// ═══ CONSEQUENCES ═══
const CSQ_COLORS={background:'var(--text-dim)',faction:'var(--gold)',personal:'var(--green)',escalation:'var(--red)'};
function renderConsequences(){
  const c=document.getElementById('consequence-list');if(!c)return;c.innerHTML='';
  const all=state.consequences||[];
  const active=all.filter(cs=>!cs.resolved);
  const resolved=all.filter(cs=>cs.resolved);
  if(!active.length&&!resolved.length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px 0">No consequences yet. The AI logs ripple effects here.</div>';return;}
  const render=(cs,idx)=>{
    const col=CSQ_COLORS[cs.type]||'var(--text-dim)';
    const d=document.createElement('div');
    d.style.cssText=`margin-bottom:5px;padding:6px 8px;border:1px solid var(--border);border-left:3px solid ${col};border-radius:6px;background:var(--surface2);${cs.resolved?'opacity:.5':''}`;
    d.innerHTML=`<div style="display:flex;align-items:flex-start;gap:6px"><div style="flex:1"><div style="font-size:10px;font-weight:700;color:${col};text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">${cs.type||'background'}${cs.location?' · '+esc(cs.location):''}</div><div style="font-size:12px;color:${cs.resolved?'var(--text-dim)':'var(--text)'};${cs.resolved?'text-decoration:line-through':''}">${esc(cs.text)}</div>${cs.ts?`<div style="font-size:9px;color:var(--text-dim);margin-top:3px">${esc(cs.ts)}</div>`:''}</div>${!cs.resolved?`<button onclick="resolveConsequence('${cs.id}')" style="flex-shrink:0;font-size:10px;padding:3px 8px;background:none;border:1px solid var(--border);border-radius:4px;color:var(--text-dim);cursor:pointer" title="Mark resolved">✓</button>`:''}</div>`;
    c.appendChild(d);
  };
  active.forEach((cs,i)=>render(cs,i));
  if(resolved.length){
    const det=document.createElement('details');
    det.style.cssText='margin-top:8px';
    const sum=document.createElement('summary');sum.style.cssText='font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:.7px;cursor:pointer;list-style:none;padding:4px 0';sum.textContent='▶ Resolved ('+resolved.length+')';
    det.appendChild(sum);
    resolved.forEach((cs,i)=>{
      render(cs,active.length+i);
      det.appendChild(c.lastChild);
    });
    c.appendChild(det);
  }
}
function resolveConsequence(id){
  const cs=state.consequences.find(c=>c.id===id);
  if(cs){cs.resolved=true;cs.resolvedTs=new Date().toLocaleString();save();renderConsequences();toast('✓ Consequence resolved.');}
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
function renderIncome(){
  const c=document.getElementById('income-log');if(!c)return;c.innerHTML='';
  (state.treasuryData.incomeLog||[]).slice().reverse().forEach(e=>{
    const d=document.createElement('div');
    d.className='income-row income-'+(e.type==='in'?'in':'out');
    d.innerHTML=`<span>${esc(e.desc)}</span><span style="color:${e.type==='in'?'var(--green-bright)':'var(--red)'};font-weight:bold">${e.type==='in'?'+':'−'}${e.amt} gp</span>`;
    c.appendChild(d);
  });
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
  c.innerHTML=log.map((entry,i)=>{
    const isLast=i===log.length-1;
    // Format: "Day 1, 9:00 AM: Greenest → Cleft of Sighs | optional note"
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
    return `<div style="display:flex;gap:8px;min-height:${isLast?'32':'42'}px">
      <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:14px;padding-top:2px">
        <div style="width:10px;height:10px;border-radius:50%;flex-shrink:0;background:${isLast?'var(--gold)':'var(--surface3)'};border:2px solid ${isLast?'var(--gold-bright)':'var(--border-bright)'}"></div>
        ${!isLast?`<div style="width:1px;flex:1;background:var(--border);margin:3px 0"></div>`:''}
      </div>
      <div style="padding-bottom:${isLast?'0':'10'}px;min-width:0">
        ${ts?`<div style="font-size:9px;color:var(--text-dim);letter-spacing:.3px;margin-bottom:1px">${esc(ts)}</div>`:''}
        <div style="font-size:12px;font-weight:${isLast?'600':'400'};color:${isLast?'var(--gold-bright)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(label)}</div>
        ${note?`<div style="font-size:10px;color:var(--text-dim);font-style:italic;margin-top:2px">${esc(note)}</div>`:''}
      </div>
    </div>`;
  }).join('');
  c.scrollTop=c.scrollHeight;
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
  const w=calcWeight();const pct=Math.min(100,(w/MAX_LB)*100);
  const fill=document.getElementById('cap-fill');const lbl=document.getElementById('cap-lbl');const warn=document.getElementById('cap-warn');
  if(fill){fill.style.width=pct+'%';fill.style.background=pct>100?'var(--red)':pct>50?'var(--gold)':'var(--green)';}
  if(lbl)lbl.textContent=w.toFixed(1)+' / '+MAX_LB+' lb ('+Math.round(pct)+'%)';
  if(warn)warn.style.display=w>MAX_LB/2?'block':'none';
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
let _hoardEditIdx=null;
function _renderInvChips(containerId,items,listType,editIdx,setEditIdx,filterState,setFilterFn,emptyMsg){
  const c=document.getElementById(containerId);if(!c)return;c.innerHTML='';
  const TYPE_ICON={supply:'📦',foraged:'🌿',ingredient:'⚗',trade:'💰',loot:'✨',hoard:'💎',misc:'📋',key:'🗝'};
  const groups={};
  items.forEach((item,idx)=>{const t=item.type||'misc';if(!groups[t])groups[t]=[];groups[t].push({item,idx});});
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
          +`<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><select style="font-size:10px;padding:2px 5px;border-radius:10px;border:1px solid var(--border-bright);background:var(--surface3);color:var(--text-dim)" onchange="updWItem('${listType}',${idx},'type',this.value)">${ITYPES.map(t=>`<option value="${t}" ${item.type===t?'selected':''}>${t}</option>`).join('')}</select><span style="font-size:10px;color:var(--text-dim)">×</span><input type="number" value="${item.qty||1}" style="width:36px;font-size:11px" onchange="updWItem('${listType}',${idx},'qty',parseInt(this.value)||1)"><span style="font-size:10px;color:var(--text-dim)">·</span><input type="number" value="${item.weight||0}" style="width:40px;font-size:11px" onchange="updWItem('${listType}',${idx},'weight',parseFloat(this.value)||0);renderCapacity()"><span style="font-size:9px;color:var(--text-dim)">lb</span></div>`
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
function renderCargo(){
  _renderInvChips('wagon-cargo',state.wagon.cargo||[],'cargo',_cargoEditIdx,
    idx=>{_cargoEditIdx=idx;renderCargo();},
    _cargoFilter,f=>{_cargoFilter=f;renderCargo();},'No cargo.');
}
function renderHoard(){
  _renderInvChips('wagon-hoard',state.wagon.hoard||[],'hoard',_hoardEditIdx,
    idx=>{_hoardEditIdx=idx;renderHoard();},
    'all',()=>{},'"Mine." — Pebble');
}
function closeWEdit(list){if(list==='hoard'){_hoardEditIdx=null;renderHoard();}else{_cargoEditIdx=null;renderCargo();}}
function addWagonItem(list,type){
  const item={name:'',qty:1,weight:0,type:type,notes:'',ts:state.worldData.time,location:state.worldData.location};
  if(list==='hoard'){if(!state.wagon.hoard)state.wagon.hoard=[];state.wagon.hoard.push(item);_hoardEditIdx=state.wagon.hoard.length-1;}
  else{if(!state.wagon.cargo)state.wagon.cargo=[];state.wagon.cargo.push(item);_cargoEditIdx=state.wagon.cargo.length-1;}
  save();renderWagon();
}
function updWItem(list,i,k,v){
  if(list==='hoard')state.wagon.hoard[i][k]=v;
  else state.wagon.cargo[i][k]=v;
  save();renderCapacity();
}
function remWItem(list,i){
  if(list==='hoard'){state.wagon.hoard.splice(i,1);_hoardEditIdx=null;}
  else{state.wagon.cargo.splice(i,1);_cargoEditIdx=null;}
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
  const conds=(ent.conditions||[]).map(c=>'<span class="zt-cond">'+esc(c)+'</span>').join('');
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
    const conds=(cur.conditions||[]).map((c,ci)=>'<span class="zt-cond" style="cursor:pointer" onclick="toggleCombCond('+idx+',\''+esc(c)+'\')">'+esc(c)+' ×</span>').join(' ');
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
      +'<div style="display:flex;gap:4px;align-items:center;margin-top:4px"><button class="btn sm" onclick="addCombCond('+idx+')" style="font-size:10px;padding:2px 6px">+Cond</button><select id="zac-cond-pick" style="font-size:10px;padding:2px 4px;border-radius:4px;border:1px solid var(--border);background:var(--surface3);color:var(--text-dim)"><option value="">Quick…</option>'+ALL_CONDS.map(c=>'<option value="'+c+'">'+c+'</option>').join('')+'</select><button class="btn sm" onclick="quickAddCond('+idx+')" style="font-size:10px;padding:2px 5px">Add</button></div>'
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
  const ent=state.combat.list[idx];if(!ent)return;
  if(!ent.conditions)ent.conditions=[];
  ent.conditions.push(sel.value);sel.value='';saveRefresh();
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
  if(i>-1)ent.conditions.splice(i,1);else ent.conditions.push(cond);
  saveRefresh();
}
function addCombCond(idx){
  const cond=window.prompt('Add condition:');if(!cond)return;
  const ent=state.combat.list[idx];if(!ent)return;
  if(!ent.conditions)ent.conditions=[];
  ent.conditions.push(cond);saveRefresh();
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
function addPartyToCombat(){
  state.combat.active=true;
  if(!state.combat.zones)state.combat.zones=_defaultZones();
  state.pcs.forEach(pc=>{
    if(!state.combat.list.some(c=>c.name===pc.name)){
      const roll=Math.floor(Math.random()*20)+1;const val=roll+(pc.initiative||0);
      const zone=pc.id==='slasher'?'front':'back';
      state.combat.list.push({name:pc.name,val,hp:pc.hp,hp_max:pc.hp_max,ac:pc.ac,isPC:true,zone,conditions:[],concentrating:''});
      state.logs.push({ts:state.worldData.time,type:'combat',body:pc.name+' joined '+ZONE_LABELS[zone]+' (d20['+roll+']+'+pc.initiative+'='+val+')'});
    }
  });
  // Add Grit + Wagon to Rear Guard if not already present
  if(!state.combat.list.some(c=>c.name==='Grit')){
    const ox=state.wagon?.ox;if(ox){
      state.combat.list.push({name:'Grit',val:0,hp:ox.hp||15,hp_max:ox.hp_max||15,ac:ox.ac||11,isPC:false,zone:'rear',conditions:[],concentrating:''});
    }
  }
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
  const conds=(cur.conditions||[]).length?cur.conditions.join(', '):'none';
  const conc=cur.concentrating?' Concentrating: '+cur.concentrating+'.':'';
  _ctxInject='[TURN ADVANCE] Round '+state.combat.round+', '+cur.name+"'s turn. Zone: "+zone+'. HP: '+cur.hp+'/'+cur.hp_max+'. AC: '+cur.ac+'. Conditions: '+conds+'.'+conc+' Awaiting action.';
}
function nextTurn(){if(!state.combat.active||!(state.combat.list||[]).length)return;state.combat.currentIdx++;if(state.combat.currentIdx>=state.combat.list.length){state.combat.currentIdx=0;state.combat.round++;}_injectTurnCtx();saveRefresh();}
function prevTurn(){if(!state.combat.active||!(state.combat.list||[]).length)return;state.combat.currentIdx--;if(state.combat.currentIdx<0){state.combat.currentIdx=state.combat.list.length-1;state.combat.round=Math.max(1,state.combat.round-1);}_injectTurnCtx();saveRefresh();}
const COMBAT_ONLY_CONDS=new Set(['Prone','Grappled','Restrained']);
function endCombat(){
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
  const readyIdx=state.pcs.findIndex(pc=>pc.levelReady);
  if(readyIdx>=0)setTimeout(()=>openLevelUpWizard(readyIdx),800);
}

// ═══ LEVEL UP WIZARD ═══
let _luWiz=null;

function checkLevelUp(pc){
  const lvl=pc.level||1;if(lvl>=20||pc.levelReady)return;
  if((pc.xp||0)>=XP_T[Math.min(lvl,19)]){
    pc.levelReady=true;
    toast('⬆ '+pc.name+' ready for Level '+(lvl+1)+'! Take a Long Rest to advance.');
    _ctxInject='[LEVEL UP PENDING] '+pc.name+' has earned enough XP to reach Level '+(lvl+1)+'. They need a Long Rest first. Do not grant any new abilities yet.';
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
  (lvlData.choose||[]).forEach(c=>steps.push({type:'choice',choice:c}));
  steps.push({type:'confirm'});
  _luWiz={idx,pc,newLvl,clsKey,data,lvlData,steps,stepIdx:0,
    choices:{hp:0,autoFeatures:lvlData.auto||[],subclass:'',spells:[],asi:''}};
  document.getElementById('levelup-modal').classList.add('open');
  _renderLevelUpStep();
}

function closeLevelUpModal(){
  document.getElementById('levelup-modal').classList.remove('open');
  _luWiz=null;
}

function _luNext(){
  if(!_luWiz)return;
  _luWiz.stepIdx++;
  _renderLevelUpStep();
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
        '<div id="lu-spell-list" style="max-height:240px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius-sm)">'+
        spells.map(s=>'<label style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border)">'+
          '<input type="checkbox" value="'+esc(s.replace(/^\[[^\]]+\]\s*/,''))+'" onchange="_luToggleSpell(\''+s.replace(/^\[[^\]]+\]\s*/,'').replace(/'/g,"\\'")+'\')"> <span style="font-size:12px">'+esc(s)+'</span></label>').join('')+
        '</div>';
      actEl.innerHTML='<button class="btn gold full" id="lu-next-btn" disabled onclick="_luNext()">→ Next</button>';
    }
    else if(ch.type==='asi'){
      const stats=['STR','DEX','CON','INT','WIS','CHA'];
      const opts=stats.map(s=>'<option value="'+s+'">'+s+'</option>').join('');
      bodyEl.innerHTML='<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px">+2 to one ability, or +1 to two different abilities. Max 20.</div>'+
        '<div class="form-group"><label class="field-label">First Ability</label><select id="lu-asi-1" onchange="_luUpdateASI()"><option value="">— Choose —</option>'+opts+'</select></div>'+
        '<div class="form-group"><label class="field-label">Second Ability (optional — split into +1/+1)</label><select id="lu-asi-2" onchange="_luUpdateASI()"><option value="">— None (first ability gets +2) —</option>'+opts+'</select></div>'+
        '<div id="lu-asi-preview" style="font-size:13px;color:var(--gold);font-weight:600;margin-top:6px;min-height:18px"></div>';
      actEl.innerHTML='<button class="btn gold full" id="lu-next-btn" disabled onclick="_luNext()">→ Next</button>';
    }
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
  // ASI
  if(choices.asi){
    choices.asi.split(',').forEach(part=>{
      const m=part.match(/^([a-z]+)\+(\d)$/);
      if(!m)return;
      const cur=parseInt((p[m[1]]||'10').split(' ')[0]);
      const nv=Math.min(20,cur+parseInt(m[2]));
      const mod=Math.floor((nv-10)/2);
      p[m[1]]=nv+' ('+(mod>=0?'+':'')+mod+')';
    });
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
  if(choices.asi)parts.push('Ability improvement: '+choices.asi+'.');
  _ctxInject='[LEVEL UP COMPLETE] '+parts.join(' ')+' Update your full understanding of this character and narrate the advancement when prompted.';
  triggerChk('Level Up: '+pc.name+' → Level '+newLvl);
  saveRefresh();
  closeLevelUpModal();
  toast('🎉 '+pc.name+' is now Level '+newLvl+'!');
  // Queue next ready PC
  const nextIdx=state.pcs.findIndex((p2,i)=>i!==idx&&p2.levelReady);
  if(nextIdx>=0)setTimeout(()=>openLevelUpWizard(nextIdx),800);
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
  if(!Array.isArray(state.moduleProgress))state.moduleProgress=[];
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
    const d=document.createElement('div');
    d.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)';
    d.innerHTML=`<span style="color:${col};font-size:14px;flex-shrink:0;width:18px">${icon}</span>`+
      `<input type="text" value="${esc(ep.name)}" style="flex:1;background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0;font-size:12px;color:var(--text)" onchange="updModuleEp(${i},'name',this.value)">`+
      `<select style="font-size:11px;padding:3px 5px;width:90px;color:${col}" onchange="updModuleEp(${i},'status',this.value)">`+
        `<option value="pending"${ep.status==='pending'?' selected':''}>Pending</option>`+
        `<option value="active"${ep.status==='active'?' selected':''}>▶ Active</option>`+
        `<option value="complete"${ep.status==='complete'?' selected':''}>✓ Done</option>`+
      `</select>`+
      `<button class="btn sm red" onclick="remModuleEp(${i})">✕</button>`;
    list.appendChild(d);
    if(ep.notes||ep.status==='active'){
      const nd=document.createElement('div');
      nd.style.cssText='padding:4px 26px 8px;';
      nd.innerHTML=`<textarea style="width:100%;min-height:40px;font-size:11px;background:transparent;border-color:var(--border)" placeholder="Notes..." onchange="updModuleEp(${i},'notes',this.value)">${esc(ep.notes||'')}</textarea>`;
      list.appendChild(nd);
    }
  });
}
function addModuleEpisode(){
  if(!Array.isArray(state.moduleProgress))state.moduleProgress=[];
  state.moduleProgress.push({name:'New Episode',status:'pending',notes:''});
  save();renderModuleTracker();
}
function updModuleEp(i,k,v){state.moduleProgress[i][k]=v;save();renderModuleTracker();}
function remModuleEp(i){state.moduleProgress.splice(i,1);save();renderModuleTracker();}

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
function genLedger(){
  const fmt=document.getElementById('ledger-fmt')?.value||'compact';
  const pfx=document.getElementById('ledger-prefix')?.value||'';
  const out=document.getElementById('ledger-out');
  // COMPACT MODE — mechanical state only
  if(fmt==='compact'){
    let l="=== TINKLES TINCTURES — COMPACT STATE ===\n";
    l+="Location: "+state.worldData.location+" | Time: "+state.worldData.time+" | Weather: "+state.worldData.weather+"\n\n";
    state.pcs.forEach(p=>{
      l+=p.name+' ('+p.race+' '+p.class+' Lv'+p.level+'): HP '+p.hp+'/'+p.hp_max+' | AC '+p.ac;
      if((p.conditions||[]).length)l+=' | Conditions: '+p.conditions.join(', ');
      const conc=p.concentrating||'';
      if(conc)l+=' | Concentrating: '+conc;
      if((p.resources||[]).length)l+=' | '+p.resources.map(r=>r.name+': '+(r.max-r.used)+'/'+r.max).join(', ');
      if((p.slots||[]).length)l+=' | Slots: '+p.slots.map((s,i)=>'L'+(i+1)+':'+(s.max-s.used)+'/'+s.max).join(' ');
      l+='\n';
    });
    const cb=_combatLedgerBlock();if(cb)l+='\n'+cb;
    const ox=state.wagon.ox;l+="\nGrit: HP "+ox.hp+"/"+ox.hp_max+" | Feed: "+ox.feed+"\n";
    l+="Treasury: GP "+state.treasuryData.gp+"\n";
    l+="=== END COMPACT ===";
    if(out){out.value=l;const chars=l.length;const toks=Math.round(chars/4);document.getElementById('ledger-chars').innerText=chars+' chars';document.getElementById('ledger-tokens').innerText='~'+toks+' tokens';}
    return l;
  }
  let l="=== TINKLE'S TINCTURES — CAMPAIGN STATE LEDGER ===\n"+pfx+"\n\n";
  l+="━━━ PARTY STATUS ━━━\n";
  state.pcs.forEach(p=>{
    l+=p.name+' | Lv '+p.level+' '+p.race+' '+p.class+' | XP '+(p.xp||0)+'/'+XP_T[Math.min(p.level||1,19)]+'\n';
    l+='  HP: '+p.hp+'/'+p.hp_max+' | AC: '+p.ac+' | Speed: '+p.speed+'ft | Init: +'+p.initiative+'\n';
    l+='  STR '+p.str+' DEX '+p.dex+' CON '+p.con+' INT '+p.int+' WIS '+p.wis+' CHA '+p.cha+'\n';
    l+='  Conditions: ['+(p.conditions.length?p.conditions.join(', '):'None')+']\n';
    if(fmt==='full'){
      l+='  Skills: '+p.skills+'\n  Features: '+p.features+'\n  Magic: '+p.magic+'\n';
      if(p.slots?.length)p.slots.forEach((s,i)=>l+='  Spell L'+(i+1)+': '+(s.max-s.used)+'/'+s.max+' remaining\n');
      if(p.backstory_motivation)l+='  Motivation: '+p.backstory_motivation+'\n';
      if(p.backstory_secret)l+='  Secret: '+p.backstory_secret+'\n';
      if((p.inventory||[]).length)l+='  Inventory: '+p.inventory.map(i=>i.name+'(x'+i.qty+')').join(', ')+'\n';
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
    l+="\n━━━ WAGON — TINKLE'S TINCTURES ━━━\n";
    const ox=state.wagon.ox;
    l+='Ox ('+ox.name+'): HP '+ox.hp+'/'+ox.hp_max+' AC '+ox.ac+' | Feed: '+ox.feed+' | Conditions: '+ox.conditions+'\n';
    l+='Cargo Weight: '+calcWeight().toFixed(1)+'/'+MAX_LB+'lb\n';
    if(state.wagon.cells?.length){l+='Holding Cells:\n';state.wagon.cells.forEach(c=>l+='  ['+c.temperament?.toUpperCase()+'] '+c.name+' ('+c.size+') Escape: '+c.escDC+' Weight: '+c.weight+'lb\n');}
    if(state.wagon.cargo?.length){l+='Cargo:\n';state.wagon.cargo.forEach(i=>l+='  '+i.name+' x'+i.qty+' ['+i.type+'] '+i.weight+'lb\n');}
    if(state.wagon.hoard?.length){l+="Pebble's Hoard:\n";state.wagon.hoard.forEach(i=>l+='  '+i.name+' x'+i.qty+' '+i.weight+'lb\n');}
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
  // Get canonical PCs from INITIAL_PCS
  const canonical=getCanonicalPCs();
  // Build clean PCs
  const cleanPCs=canonical.map(function(pc){
    const clean=JSON.parse(JSON.stringify(pc));
    // Always reset session fields
    clean.hp=clean.hp_max;
    clean.conditions=[];
    clean.concentrating='';
    // Restore resources to full
    if(clean.resources)clean.resources.forEach(function(r){r.used=0;});
    if(clean.slots)clean.slots.forEach(function(s){s.used=0;});
    if(mode==='full'){
      // Full reset — also wipe progress fields
      clean.xp=0;
      clean.inventory=JSON.parse(JSON.stringify(pc.inventory||[]));
      clean.backstory_origin='';
      clean.backstory_motivation='';
      clean.backstory_secret='';
      clean.pending=pc.pending||[];
    }
    return clean;
  });
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
    businessProfile:state.worldData.businessProfile||{},
    campaignSecrets:mode==='full'?[
      {text:"Tinkle's secret: PENDING",playerKnown:false,pending:true},
      {text:"Pebble's secret: PENDING",playerKnown:false,pending:true},
      {text:"Slasher's secret: PENDING",playerKnown:false,pending:true}
    ]:(state.worldData.campaignSecrets||[])
  };
  // Build clean relationships
  const cleanRels=mode==='full'?[
    {from:'tinkle',to:'pebble',disposition:'relies_on',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'tinkle',to:'slasher',disposition:'complicated',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'pebble',to:'slasher',disposition:'fond',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'slasher',to:'pebble',disposition:'trusts',dynamic:'PENDING',aiOnly:false,pending:true},
    {from:'slasher',to:'tinkle',disposition:'neutral',dynamic:'PENDING',aiOnly:false,pending:true}
  ]:(state.relationships||[]);
  // Preserve wagon canonical data
  const cleanWagon=JSON.parse(JSON.stringify(state.wagon));
  cleanWagon.hp=cleanWagon.hp_max;
  cleanWagon.conditions='';
  cleanWagon.cells=[];
  if(mode==='full'){
    cleanWagon.cargo=JSON.parse(JSON.stringify(getCanonicalPCs()[0]?[]:(state.wagon.cargo||[])));
    cleanWagon.hoard=[];
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
    lifestyle:'Modest (wagon life, 1 gp/day shared)',
    incomeLog:[{desc:'Starting funds — party pool',amt:startingGold,type:'in',ts:'Day 1, 9:00 AM',category:'startup'}]
  };
  state.partyInventory=mode==='full'?[
    {name:"Brewer's Supplies",qty:1,weight:9,type:'supply',notes:"Tinkle's primary tool for tonic production"},
    {name:'Empty Vials (assorted)',qty:24,weight:3,type:'supply',notes:'For the product line'},
    {name:'Labels (blank)',qty:50,weight:0.5,type:'supply',notes:'Tinkle writes these. Very official looking.'},
    {name:'Rations',qty:6,weight:12,type:'supply',notes:'3 days for the party'},
    {name:'Rope (50ft)',qty:1,weight:10,type:'supply',notes:''},
    {name:'Torpor Poison doses',qty:3,weight:0,type:'supply',notes:"For Tinkle's blowgun. DC 15 CON save or incapacitated 4d6 hours."}
  ]:state.partyInventory;
  state.chatHistory=[];
  state.logs=[{ts:'Day 1, 9:00 AM',type:'dm',body:"Tinkle's Tinctures — "+(mode==='full'?'Full Reset':'New Campaign')+". Party is ready. Set your starting location and run Session Zero to begin."}];
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
    const a=document.createElement('a');a.href=url;a.download='tinkles_save_'+loc+'.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
    toast('✓ Full save exported to Downloads.');
  }catch(e){
    try{navigator.clipboard.writeText(JSON.stringify(state));toast('✓ Save copied to clipboard.');}
    catch(e2){toast('Export failed: '+e2.message);}
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
  }catch(e){toast('Copy failed: '+e.message);}
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
function importFromPaste(){
  const raw=document.getElementById('paste-json')?.value?.trim()||'';
  const errEl=document.getElementById('paste-err');
  if(!raw){if(errEl){errEl.textContent='Nothing pasted.';errEl.style.display='block';}return;}
  try{
    const p=JSON.parse(raw);
    const errShow=(msg)=>{if(errEl){errEl.textContent=msg;errEl.style.display='block';}};
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
        if(idx>-1){const preserved={hp:state.pcs[idx].hp,xp:state.pcs[idx].xp,conditions:state.pcs[idx].conditions,inventory:state.pcs[idx].inventory,slots:state.pcs[idx].slots,resources:state.pcs[idx].resources};state.pcs[idx]={...newPc,...preserved};}
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
  const bp=wd.businessProfile||{};
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
  f('setup-real',bp.realStock||'');
  f('setup-snake',bp.snakeOil||'');
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
  // Sync all setup fields to state
  const g=(id)=>document.getElementById(id)?.value||'';
  if(!state.worldData.businessProfile)state.worldData.businessProfile={};
  state.worldData.businessProfile.realStock=g('setup-real');
  state.worldData.businessProfile.snakeOil=g('setup-snake');
  state.wagon.wagonName=g('setup-wagon-name');
  state.wagon.wagonDesc=g('setup-cover');
  state.worldData.primaryMission=g('setup-mission');
  state.worldData.setting=g('setup-setting');
  state.worldData.plot=g('setup-factions');
  state.worldData.secrets=g('setup-secrets');
  state.treasuryData.gp=parseInt(g('setup-gold'))||15;
  state.campaignLaunched=true;
  save();
  // Open Session Zero modal
  generateSessionZero();openModal('s0-modal');
  showTab('tab-dm');
  toast('✓ Session Zero generated. Copy it and send to the AI DM to begin.');
}
function migrate(s){
  if(!s||typeof s!=='object')return;
  const savedVer=s.saveVersion||0;

  // ══ STRUCTURAL GUARDS — run every load (idempotent null/array protection) ══
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
  if(!s.aiContracts||typeof s.aiContracts!=='object')s.aiContracts={persona:'',never:'',actions:'',continuity:'',multi:''};
  // Auto-append missing contract clauses (idempotent — checks for marker text before appending)
  if(s.aiContracts.never&&!s.aiContracts.never.includes('DUNGEON SECRETS')){
    s.aiContracts.never+='\n\n• DUNGEON SECRETS: Never reveal the contents of unexplored rooms, loot locations, enemy positions, or dungeon secrets before the players discover them through play or successful checks.\n• PLAYER AGENCY: Before resolving any scene transition, room entry, escape sequence, or significant NPC action, ask the players what they want to do first. Do not assume and narrate.\n• SKILL CHECKS: Never skip skill checks. Every uncertain action with meaningful consequences requires a declared DC, a player roll, and narration of the result. No automatic successes or assumed outcomes.';
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
    {id:'qa_6',label:'Feed Grit',type:'ox_feed',params:{},context:['tab-wagon']},
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
    {id:'qa_24',label:'Previously On…',type:'previously_on',params:{},context:['tab-dm']}
  ];
  if(!s.quickActions.length){s.quickActions=canonicalQA;}
  else{canonicalQA.forEach(cqa=>{if(!s.quickActions.find(a=>a.id===cqa.id))s.quickActions.push(cqa);});}

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
  if(!s.worldData.businessProfile||typeof s.worldData.businessProfile!=='object')s.worldData.businessProfile={name:"Tinkle's Tinctures",realStock:'',snakeOil:'',reagents:'',reputation:'Unknown',notes:''};
  if(s.worldData.premiseLocked===undefined)s.worldData.premiseLocked=false;
  if(!s.worldData.primaryMission)s.worldData.primaryMission='';
  if(!s.worldData.time)s.worldData.time='Day 1';
  if(!s.worldData.location)s.worldData.location='Unknown';
  if(!s.treasuryData||typeof s.treasuryData!=='object')s.treasuryData={pp:0,gp:0,ep:0,sp:0,cp:0,lifestyle:'',incomeLog:[]};
  if(!Array.isArray(s.treasuryData.incomeLog))s.treasuryData.incomeLog=[];
  if(!s.wagon||typeof s.wagon!=='object')s.wagon={};
  if(!s.wagon.ox||typeof s.wagon.ox!=='object')s.wagon.ox={name:'Grit',hp:15,hp_max:15,ac:11,conditions:'None',feed:'fed',backstory:'',personality:'',bonds:{},quirks:[],experimentLog:''};
  if(!s.wagon.ox.name)s.wagon.ox.name='Grit';
  if(!s.wagon.ox.backstory)s.wagon.ox.backstory='Raised from a calf by Tinkle. The only member of the operation who has never been asked to lie about anything. Has been used as a test subject for new batches on at least three documented occasions.';
  if(!s.wagon.ox.personality)s.wagon.ox.personality='Stoic and dependable. Unusually calm around Tinkle specifically. Skittish around loud magic. Stubborn on roads he has decided are bad ideas.';
  if(!s.wagon.ox.bonds||typeof s.wagon.ox.bonds!=='object')s.wagon.ox.bonds={};
  if(!s.wagon.ox.bonds.tinkle)s.wagon.ox.bonds.tinkle='Deeply bonded — raised from calf. Tolerates the experiments with resigned dignity.';
  if(!s.wagon.ox.bonds.pebble)s.wagon.ox.bonds.pebble="Comfortable. Responds well to Pebble's voice. Possibly the most normal relationship on the wagon.";
  if(!s.wagon.ox.bonds.slasher)s.wagon.ox.bonds.slasher='Wary. Has learned that when Slasher gets excited, something loud is about to happen.';
  if(!Array.isArray(s.wagon.ox.quirks)||!s.wagon.ox.quirks.length)s.wagon.ox.quirks=['Refuses to cross bridges at a trot — walk only','Perks up noticeably around apples','Has a scar on his left flank from Experiment 7 — Tinkle does not discuss this','Occasionally regarded with suspicion by other animals, cause unknown'];
  if(!s.wagon.ox.experimentLog)s.wagon.ox.experimentLog='Vol. 3 (current). Vols 1-2 were lost in a hasty departure from Millhaven.';
  if(!Array.isArray(s.wagon.cells))s.wagon.cells=[];
  if(!Array.isArray(s.wagon.cargo))s.wagon.cargo=[];
  if(!Array.isArray(s.wagon.hoard))s.wagon.hoard=[];
  if(s.wagon.hp===undefined)s.wagon.hp=20;
  if(s.wagon.hp_max===undefined)s.wagon.hp_max=20;
  if(!s.wagon.ac)s.wagon.ac=11;
  if(!s.wagon.conditions)s.wagon.conditions='';
  if(!s.wagon.wagonName)s.wagon.wagonName='The Shelled Alchemist';
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
  'chkHistory','rewindStack','wagonFilter','chatHistory','oocHistory','partyChat','plugins','errorLog','sessionNotes','storyChapters','prevSessionSummary','aiContracts','sessionArchive','locations','consequences','headerShortcuts'];

// What stays in localStorage (device-specific settings):
// tt_gk, tt_ok, tt_provider, tt_tts_*, tt_pname, tt_pchar, tt_cache

function save(){
  try{
    // Prune chatHistory to last 80 messages to prevent unbounded growth
    if(state.chatHistory&&state.chatHistory.length>80){
      state.chatHistory=state.chatHistory.slice(-80);
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
      try{localStorage.setItem('tt_v1',JSON.stringify(state));autosaveDot();}
      catch(e2){console.error('Save failed after trim:',e2);}
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
  }
  catch(e){console.error('Load error',e);}
  // Drop 2: fbLoad() goes here — must call: migrate(fbData); applyVersionMerge(fbData); state=fbData; renderAll();
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
  saveRefresh();
}
function adjHP(idx,isHeal){
  const inp=document.getElementById('hpamt-'+idx);if(!inp?.value)return;
  const amt=parseInt(inp.value);if(isNaN(amt))return;
  const pc=state.pcs[idx];
  pc.hp=isHeal?Math.min(pc.hp_max,pc.hp+amt):Math.max(0,pc.hp-amt);
  pc.hp=Math.max(0,Math.min(pc.hp_max,pc.hp)); // always clamp
  inp.value='';
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
  const sm=s=>Math.floor((parseInt(pc[s])||10-10)/2);
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
  const sm=s=>Math.floor((parseInt(pc[s])||10-10)/2);
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
function addPcItem(idx){if(!state.pcs[idx].inventory)state.pcs[idx].inventory=[];state.pcs[idx].inventory.push({name:'',qty:1,weight:0,type:'misc',notes:''});save();renderCards();renderSheets();}
function updPcItem(pi,ii,k,v){state.pcs[pi].inventory[ii][k]=v;save();}
function remPcItem(pi,ii){state.pcs[pi].inventory.splice(ii,1);save();renderCards();}
function remPcItemSheet(pi,ii){state.pcs[pi].inventory.splice(ii,1);save();renderCards();renderSheets();}

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
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+key,'HTTP-Referer':window.location.href,'X-Title':"Tinkle's Tinctures"},
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
const _SLASHER_FRAGMENT='He does not know the operation is a con. Never tell him.';
function buildPrompt(ledger){
  // Read from state (DR-6) with DOM fallback for resilience
  const g=id=>{
    const key=_CONTRACT_KEYS.find(([,domId])=>domId===id)?.[0];
    if(key&&state.aiContracts?.[key])return state.aiContracts[key];
    return document.getElementById(id)?.value||'';
  };
  // ⛔ SECURITY — Slasher must never learn the operation is a con (permanent constraint)
  const persona=g('ai-persona');
  if(!persona.includes(_SLASHER_FRAGMENT)){
    throw new Error('⛔ SECURITY: Contract 1 (DM Persona) is missing the required Slasher con-protection clause. Open AI Tools → Contracts and restore:\n"'+_SLASHER_FRAGMENT+'"');
  }
  const activeSnips=(state.snippets||[]).filter(s=>s.active!==false&&s.text).map(s=>'['+s.name+']\n'+s.text).join('\n\n');
  const mechBlock=`
CONTRACT 6 — MECHANICS BLOCK (REQUIRED)
After EVERY response, end with a mechanics block. Use exact format. If nothing changed write "none".
This block is machine-parsed by the app — format must be exact. It is stripped from displayed text.

---MECHANICS---
hp: slasher=4
hp_max: tinkle=10
conditions: slasher+poisoned, tinkle-charmed
slot_use: tinkle=1
slot_restore: tinkle=all
short_rest: pebble
location: The Sunken Vault
time: Day 2, dusk
weather: Heavy rain
income: 8, real_stock, Sold Clarity Tonic to farmer
expense: 3, Stable fee at the Broken Axle
item_add: tinkle, Iron Key, 1, key, 0
item_remove: party, Torch, 2
item_add: wagon, Mushroom Cluster, 3, foraged, 0.1
wagon_cell_add: Goblin Scout, Small, hostile, DC14, 40
wagon_cell_update: Goblin Scout, sedated
wagon_cell_remove: Goblin Scout
wagon_hp: 14
ox_hp: 12
ox_condition: exhausted
xp: slasher+50, tinkle+50, pebble+50
quest_done: Find the missing cart
quest_add: Investigate the old mill
npc_mood: Durgrim=hostile
npc_add: Mira, Neutral, Halfling innkeeper
pc_update: slasher, class, Rogue/Fighter
pc_add: Grimtooth, Half-Orc, Barbarian, 1, 14, 14, 15
pc_delete: Grimtooth
---END---

Rules:
- One command per line, only include lines where something actually changed
- Never invent HP values — only change HP by exact stated or rolled amounts
- income: [amount], [category], [description] — USE THIS for all gold earned (logs to income ledger). Category: real_stock/snake_oil/reagents/misc
- expense: [amount], [description] — USE THIS for all gold spent (logs to expense ledger and deducts from GP)
- gp: use a plain number to SET an absolute GP value (corrections only — does not create a log entry)
- npc_add: EVERY TIME a named NPC is formally introduced, output npc_add. Every time.
- npc_mood: EVERY TIME an NPC's relationship to the party changes, output npc_mood.
- resource_use: [pc], [resource name] — decrements a resource pip (Bardic Inspiration, Stone's Endurance, Lucky Points)
- resource_restore: [pc], [resource name or all] — restores resource uses (short or long rest)
- shell_defense: tinkle=on — Tinkle retreats into shell (prone, incapacitated, AC 21). shell_defense: tinkle=off — emerges
- town_rep: [town name], [good/neutral/burned/fled], [brief notes] — updates town reputation log
- income: [amount], [category], [description] — logs business income (category: real_stock/snake_oil/reagents/overhead/emergency)
- If a numeric value is estimated, append (est) — e.g. wagon_cell_add: Cave Bear, Large, hostile, DC18, 400 (est)
- primary_mission: [text] — set or update the party's main quest objective
- quest_fail: [partial name] — mark a quest as failed/abandoned
- module_episode: N, active|complete — when the party enters a new story episode or completes one. N is the episode number. Auto-marks prior episodes complete when advancing. Output this whenever a major story chapter begins or ends
- EVERY item found, foraged, bought, stolen, or acquired MUST have an item_add: line. No exceptions. If the player forages mushrooms, the mechanics block must include item_add even if you mentioned them in prose
- NEVER generate JSON for the players to paste. ALL state updates go through the mechanics block only. Generating paste JSON will corrupt the game state
- The ---END--- marker is REQUIRED. Every mechanics block must end with ---END--- on its own line. Without it the entire block is ignored and nothing saves
- The mechanics block must be the LAST thing in your response. Nothing after ---END---
- Never wrap the mechanics block in markdown code fences, bold, or any formatting
- If nothing changed still write: ---MECHANICS---\nnone\n---END---
- Always update time: when meaningful time has passed (travel, rests, combat)
- short_rest: [name] restores Bardic Inspiration, Stone's Endurance uses, and other short-rest features
- consequence_add: [text] | [type] — log a world consequence. Types: background (ambient, slow-burn), faction (NPC group action), personal (affects a PC directly), escalation (urgent, building threat). Use for burned-town fallout, faction retaliation, PC reputation shifts, and ticking threats. Example: consequence_add: Thornhaven guards are now searching for a "tortoiseshell alchemist" | faction
- consequence_resolve: [partial text] — mark a consequence resolved when the party has addressed it. Example: consequence_resolve: guards searching
- location_add: Name | Type | Description — create a new location entry. Types: town/city/camp/ruin/dungeon/waypoint. Use when the party first arrives at a new named place. Example: location_add: Greenest | town | Small farming town under dragon attack
- location_visit: Name — mark a known location as visited and update its last-visited timestamp. Use on return trips. Example: location_visit: Greenest
- location_history: Name | Text | dmOnly — add an event entry to a location's history. Set dmOnly to true for secret events. Example: location_history: Greenest | Governor Nighthill paid 250gp for the party's help | false
- location_investment: Name | Description | Amount — record a party investment at a location. Example: location_investment: Greenest | Mill stake | 50
- roll_request: Skill | DC | PCname — show a persistent roll banner prompting the player to roll. PCname is optional (omit for whole party). Use whenever a player action triggers a check BEFORE narrating the outcome. Example: roll_request: Persuasion | 14 | Tinkle

ZONE COMBAT SYSTEM:
Combat uses 6 abstract zones instead of a grid: Frontline, Backline, Left Flank, Right Flank, Air Space, Rear Guard.
Adjacency: Frontline↔Left Flank, Frontline↔Right Flank, Frontline↔Backline, Frontline↔Air Space, Backline↔Rear Guard.
Movement costs 1 move for adjacent zones, 2 moves (or Dash) for non-adjacent. Leaving a zone with enemies provokes opportunity attacks.
Air Space only appears when flying creatures exist. Rear Guard is safest — enemies must punch through Backline.

Zone mechanics commands:
- combat_start: [optional description] — begin combat, initialize zone grid. Output this BEFORE any zone_add_enemy lines
- combat_end: [summary text] — end combat, reset zones, log summary to location history
- zone_move: [name] | [zone_id] — move a combatant to a zone. zone_id: front/back/left/right/air/rear. Example: zone_move: Slasher | left
- zone_add_enemy: [name] | [hp] | [ac] | [zone_id] | [initiative] — add enemy to combat in a specific zone. Example: zone_add_enemy: Cultist | 9 | 12 | front | 14
- zone_remove: [name] — remove a combatant (dead, fled, etc). Example: zone_remove: Cultist
- zone_effect: [zone_id] | [effect text] | [type] — apply an effect to a zone. type: terrain or effect (default). Example: zone_effect: front | Fog Cloud — obscured | effect. Example: zone_effect: back | Difficult terrain (rubble) | terrain
- zone_label: [zone_id] | [new label] — rename a zone for narrative context. Example: zone_label: left | Collapsed Tower. Example: zone_label: rear | Wagon Circle
- zone_fog: [zone_id] | hide — hide a zone from the player view (fog of war). Example: zone_fog: rear | hide
- zone_fog: [zone_id] | reveal — reveal a previously hidden zone. Example: zone_fog: left | reveal
Use fog of war to hide unexplored areas, secret rooms, or zones the party hasn't reached yet. Reveal zones as the party explores or discovers them.

Starting positions when combat begins:
- Melee fighters (Slasher): Frontline
- Ranged/casters (Pebble, Tinkle): Backline
- Grit + Wagon: Rear Guard (auto-added by the app)
- Flanks: for ambushes, flanking maneuvers, or when enemies surround
- Air Space: only when flying creatures exist
Override these defaults when the narrative demands it (ambush from behind, surrounded, etc).

ALWAYS use zone_move to reposition characters during combat based on the narrative. When a PC says "I charge in" move them to the appropriate zone. When enemies flank, move them to flanks. Keep zone positions consistent with the story.`;
  const premiseSection=state.worldData.premiseLocked&&state.worldData.premise?'\nLOCKED CAMPAIGN PREMISE (fixed fact — never contradict):\n'+state.worldData.premise+'\n':'';
  const secretsSection=state.dmSecrets?'\nCONTRACT 7 — SECRET DM NOTES (NEVER reveal to players):\n'+state.dmSecrets+'\n':'';
  const snipsSection=activeSnips?'\nCONTRACT 8 — REFERENCE MATERIAL:\n'+activeSnips+'\n':'';
  const summarySection=state.prevSessionSummary?'\nCAMPAIGN HISTORY (auto-archived):\n'+state.prevSessionSummary+'\n':'';
  return g('ai-persona')+'\n'+premiseSection+'\nCONTRACT 2 — WHAT YOU NEVER DO:\n'+g('ai-never')+'\n\nCONTRACT 3 — HOW YOU HANDLE ACTIONS:\n'+g('ai-actions')+'\n\nCONTRACT 4 — CONTINUITY & WAGON:\n'+g('ai-continuity')+'\n\nCONTRACT 5 — MULTI-PLAYER:\n'+g('ai-multi')+mechBlock+secretsSection+snipsSection+summarySection+(ledger?'\nCURRENT CAMPAIGN STATE:\n'+ledger:'');
}

// ═══ MECHANICS BLOCK PARSER — Option B ═══
// All recognized mechanic keys — used by parseMechanics and display stripping
const _MECH_KEYS='hp|hp_max|conditions|concentration|location|time|weather|travel_note|loc_desc|gp|sp|cp|ep|pp|item_add|item_remove|slot_use|slot_restore|resource_use|resource_restore|shell_defense|wagon_cell_add|wagon_cell_update|wagon_cell_remove|wagon_hp|ox_hp|ox_condition|income|expense|xp|quest_add|quest_done|quest_fail|primary_mission|npc_add|npc_mood|pc_update|pc_add|pc_delete|module_episode|short_rest|town_rep|save_game|save|spell_add|sp_charge|consequence_add|consequence_resolve|chapter_add|chapter_update|location_add|location_visit|location_history|location_investment|roll_request|zone_move|zone_add_enemy|zone_remove|zone_effect|zone_label|combat_start|combat_end|zone_fog|none';
const _NAKED_MECH_RE=new RegExp('^('+_MECH_KEYS+'): .+','m');
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
  if(!match&&_NAKED_MECH_RE.test(cleanText)){
    const nakedRe=new RegExp('^('+_MECH_KEYS+'): .+','mg');
    const lines=[];let m;while((m=nakedRe.exec(cleanText))!==null)lines.push(m[0]);
    if(lines.length) match={1:lines.join('\n')};
  }
  if(!match)return null;
  const block=match[1].trim();
  if(block==='none'||block==='')return null;
  const changes=[];
  const lines=block.split('\n').map(l=>l.trim()).filter(Boolean);
  lines.forEach(line=>{
    try{
      const colonIdx=line.indexOf(':');if(colonIdx===-1)return;
      const key=line.slice(0,colonIdx).trim().toLowerCase();
      const val=line.slice(colonIdx+1).trim();
      if(key==='hp'){
        val.split(',').forEach(part=>{
          const[nm,hpStr]=part.trim().split('=');
          const pc=findPC(nm?.trim());
          if(pc&&hpStr!==undefined){const old=pc.hp;pc.hp=Math.max(0,Math.min(pc.hp_max,parseInt(hpStr)));changes.push({text:pc.name+' HP '+old+'→'+pc.hp});if(pc.hp===0&&document.getElementById('auto-down')?.checked)setTimeout(()=>triggerChk('PC Down: '+pc.name),300);}
        });
      }else if(key==='hp_max'){
        val.split(',').forEach(part=>{const[nm,v]=part.trim().split('=');const pc=findPC(nm?.trim());if(pc&&v){pc.hp_max=parseInt(v);changes.push({text:pc.name+' MaxHP→'+v});}});
      }else if(key==='conditions'){
        val.split(',').forEach(part=>{
          const p=part.trim();
          const add=p.includes('+');const rem=p.includes('-');
          const nm=p.replace(/[+\-].*/,'').trim();
          const cond=p.replace(/^[^+\-]+[+\-]/,'').trim();
          const pc=findPC(nm);
          if(pc&&cond){
            if(!Array.isArray(pc.conditions))pc.conditions=[];if(!Array.isArray(pc.slots))pc.slots=[];if(add&&!pc.conditions.includes(cond)){pc.conditions.push(cond);changes.push({text:pc.name+' +'+cond});}
            if(rem){const i=pc.conditions.indexOf(cond);if(i>-1){pc.conditions.splice(i,1);changes.push({text:pc.name+' −'+cond});}}
          }
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
        const item={name:iname,qty:iqty,weight:iweight,type:itype,notes:'',ts:state.worldData?.time,location:state.worldData?.location};
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
      }else if(key==='ox_hp'){state.wagon.ox.hp=Math.max(0,parseInt(val)||0);changes.push({text:'Ox HP → '+state.wagon.ox.hp});}
      else if(key==='ox_condition'){state.wagon.ox.conditions=val;changes.push({text:'Ox → '+val});}
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
        if(pc){if(onOff==='on'){if(!pc.conditions.includes('Shell Defense'))pc.conditions.push('Shell Defense');if(!pc.conditions.includes('Prone'))pc.conditions.push('Prone');if(!pc.conditions.includes('Incapacitated'))pc.conditions.push('Incapacitated');changes.push({text:'Tinkle retreated into shell (AC 21)'});}
        else{['Shell Defense','Prone','Incapacitated'].forEach(c=>{const i=pc.conditions.indexOf(c);if(i>-1)pc.conditions.splice(i,1);});changes.push({text:'Tinkle emerged from shell'});}}
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
          const m=part.trim().match(/^([^+]+)\+(\d+)$/);
          if(m){const pc=findPC(m[1].trim());if(pc){const amt=parseInt(m[2]);pc.xp=(pc.xp||0)+amt;changes.push({text:pc.name+' +'+amt+'xp'});checkLevelUp(pc);}}
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
          const questObj={text:val,status:'active',hidden:false,discovery:discovery?{text:discovery,ts:new Date().toLocaleString()}:null,chatMsgId:pendingMsgId||null};
          state.quests.push(questObj);
          const newQuestIdx=state.quests.length-1;
          changes.push({text:'New quest: '+val.slice(0,30)});
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
          state.consequences.push({id:'csq_'+Date.now(),text,type,resolved:false,ts:state.worldData.time,location:state.worldData.location});
          changes.push({text:'Consequence ['+type+']: '+text.slice(0,40)});
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
        // Format: Skill|DC|PCname (PCname optional)
        const rp=val.split('|').map(s=>s.trim());
        const skill=rp[0]||'Check',dc=rp[1]||'',pcname=rp[2]||'';
        const label=(pcname?pcname+': ':'')+skill+(dc?' DC '+dc:'');
        const sub=pcname?'':'Roll and send your result to the DM.';
        const banner=document.getElementById('roll-request-banner');
        const lbl=document.getElementById('roll-request-label');
        const subEl=document.getElementById('roll-request-sub');
        if(banner){banner.style.display='block';}
        if(lbl)lbl.textContent='🎲 '+label;
        if(subEl)subEl.textContent=sub||'Roll and send your result.';
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
    save();
    renderCharTabs();renderCards();renderStatusMini();renderSheets();
    renderNPCs();renderQuests();renderConsequences();renderCombat();renderWagon();syncWorld();renderModuleTracker();
    mechToast(changes);
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
function findPC(name){if(!name)return null;return state.pcs.find(p=>p.id===name||p.name.toLowerCase()===name.toLowerCase());}

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

// ═══ OFFLINE CACHE ═══
const CKEY='tt_cache';
function cacheResp(user,resp){const c=JSON.parse(localStorage.getItem(CKEY)||'[]');c.unshift({ts:new Date().toLocaleString(),user:user.slice(0,60),response:resp});if(c.length>5)c.pop();localStorage.setItem(CKEY,JSON.stringify(c));}
function getCached(){return JSON.parse(localStorage.getItem(CKEY)||'[]')[0]||null;}

// ═══ AI DM CHAT ═══
function renderChat(){
  const c=document.getElementById('chat-msgs');if(!c)return;
  const prevScroll=c.scrollTop;const prevHeight=c.scrollHeight;
  c.innerHTML='';
  if(!state.chatHistory||!state.chatHistory.length){
    c.innerHTML=`<div class="chat-msg sys"><div class="msg-hdr"><span>System</span></div><div class="chat-msg-text">Welcome to Tinkle's Tinctures! Set your API key in the AI DM tab. The DM updates character sheets, inventory, wagon, and more automatically via the mechanics block.</div></div>`;
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
      const pills=msg.mechanics.map(m=>`<span class="mech-pill${m.error?' err':''}">${esc(m.text)}</span>`).join('');
      mechBadge=`<div class="mech-badge"><div class="mech-badge-hdr" onclick="var p=this.nextElementSibling;p.style.display=p.style.display==='flex'?'none':'flex'"><span class="mech-badge-lbl">⚡ Changes</span><span style="font-size:10px;color:var(--green-bright);margin-left:4px">${msg.mechanics.length} — tap to expand</span></div><div class="mech-pills" style="display:none">${pills}</div></div>`;
    }
    const isExpanded=_expandedMsgs.has(msgIdx);
    d.innerHTML=`<div class="msg-hdr"><span style="font-weight:bold">${esc(sender)}</span><div style="display:flex;align-items:center;gap:2px">${copyBtn}${moreBtn}${tsHtml}</div></div><div class="chat-msg-text${isLong&&!isExpanded?' msg-collapsed':''}">${text}</div>${isLong&&!isExpanded?`<span class="read-more" onclick="_expandedMsgs.add(${msgIdx});this.previousElementSibling.classList.remove('msg-collapsed');this.remove()">Read more ▼</span>`:''}${mechBadge}`;
    c.appendChild(d);
  });
  const distWas=prevHeight-prevScroll-c.clientHeight;
  if(distWas<150)c.scrollTop=c.scrollHeight;
  else c.scrollTop=prevScroll;
}

function deleteChatMsg(idx){
  if(!confirm('Delete this message?'))return;
  state.chatHistory.splice(idx,1);
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
    save();
    toast('✓ Chat archived — oldest 30 messages summarized.');
  }catch(e){
    // Silent failure is correct — never prune without a confirmed summary
    console.warn('DR-7 summarize failed — messages preserved:',e.message);
  }
}
function clearChat(){if(confirm('Clear narrative chat and Rules channel? Log unaffected.')){state.chatHistory=[];state.oocHistory=[];showChatTab('narrative');saveRefresh();}}
function dismissRollRequest(){const b=document.getElementById('roll-request-banner');if(b)b.style.display='none';}

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
  ]
};
function renderSuggestChips(tab){
  const c=document.getElementById('chat-suggest');if(!c)return;
  const chips=SUGGEST_CHIPS[tab||'narrative']||SUGGEST_CHIPS.narrative;
  c.innerHTML=chips.map(ch=>`<span class="chat-suggest-chip" onclick="fillSuggest(this,'${ch.fill.replace(/'/g,"\\'")}')">${ch.label}</span>`).join('');
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
  state.oocHistory.forEach(msg=>{
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
    d.innerHTML=`<div class="msg-hdr"><span>${esc(sender)}</span><div>${tsHtml}</div></div><div class="chat-msg-text">${text}</div>`;
    if(msg.id)d.id='oocmsg_'+msg.id;
    c.appendChild(d);
  });
  c.scrollTop=c.scrollHeight;
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
  const m=clean.match(/---MECHANICS---([\s\S]*?)(?:---END---|$)/i);
  if(m)block=m[1];
  if(!block)return[];
  const validKeys=new Set(_MECH_KEYS.split('|'));
  return block.split('\n').map(l=>l.trim()).filter(l=>l&&l.includes(':')).map(l=>{
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
      .replace(/(?:MECHANICS:|##\s*MECHANICS)[\s\S]*$/,'')
      .replace(new RegExp('^('+_MECH_KEYS+'): .+$','gm'),'')
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
  const oocContract='OOC CONTRACT — CHANNEL RULES:\n1. You are answering OUT-OF-CHARACTER. No narrative prose. No immersion language.\n2. SECRETS: Slasher (Black Dragonborn Fighter) must NEVER learn the operation is a con. If he asks anything that would expose it, deflect or give a non-answer.\n3. CHARACTER SEPARATION: Always name the specific character. Never say "you" to mean both players. Tinkle knows things Slasher does not and vice versa.\n4. RULES ACCURACY: Cite actual D&D 5e rules. If unsure, say so. Do not invent rulings or fudge mechanics.\n5. NO DICE RESOLUTION: These channels answer questions only. Actual rolls and outcomes happen in the Narrative channel only.\n';
  const partySys='You are the Dungeon Master for Tinkle\'s Tinctures. A player has a question out-of-character. Answer only their most recent question. Keep it to 3-5 sentences. No mechanics block. No in-character narration unless asked.\n\n'+oocContract+'\nCURRENT GAME STATE:\n'+partyLedger;
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
  const oocContract='OOC CONTRACT — CHANNEL RULES:\n1. You are answering OUT-OF-CHARACTER. No narrative prose. No immersion language.\n2. SECRETS: Slasher (Black Dragonborn Fighter) must NEVER learn the operation is a con. If he asks anything that would expose it, deflect or give a non-answer.\n3. CHARACTER SEPARATION: Always name the specific character. Never say "you" to mean both players. Tinkle knows things Slasher does not and vice versa.\n4. RULES ACCURACY: Cite actual D&D 5e rules. If unsure, say so. Do not invent rulings or fudge mechanics.\n5. NO DICE RESOLUTION: These channels answer questions only. Actual rolls and outcomes happen in the Narrative channel only.\n';
  const oocSys='You are the Dungeon Master for Tinkle\'s Tinctures. This is the OUT-OF-CHARACTER channel. Answer in 1-3 sentences only. No narrative prose. No mechanics block. For rules questions: state the rule directly. The story continues in the Narrative channel only.\n\n'+oocContract+'\nCURRENT GAME STATE:\n'+oocLedger;
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
    const sysProm=buildPrompt(ledger)+(_inject?'\n\n'+_inject:'');
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
    .replace(/(?:MECHANICS:|##\s*MECHANICS)[\s\S]*$/,'')
    // Strip any naked mechanic lines the AI put directly in the response body
    .replace(new RegExp('^('+_MECH_KEYS+'): .+$','gm'),'')
    .replace(/\n{3,}/g,'\n\n')
    .trim();
    detectUnloggedGold(displayText,mechanics);
    detectUnloggedNPC(displayText,mechanics);
    detectUnloggedItem(displayText,mechanics);
    cacheResp(text,displayText);
    if(localStorage.getItem('tt_tts_auto')==='1'&&typeof speechSynthesis!=='undefined')speak(displayText);
    state.chatHistory.push({role:'assistant',content:displayText,mechanics,ts,realTs:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),msgId:pendingMsgId});
    // Auto-checkpoint on message count
    state.msgsSinceChk=(state.msgsSinceChk||0)+1;
    if(state.msgsSinceChk>=(state.autoChkInterval||8)){
      state.msgsSinceChk=0;
      setTimeout(()=>triggerChk('Auto — '+state.autoChkInterval+' messages'),800);
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
      const inp=document.getElementById('chat-input');if(inp){inp.value=t;sendMsg();}
    });
  setTimeout(()=>{updateRollMod();_buildRsPills();},60);
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
  const out=`╔═══════════════════════════════════════════════════════════╗
║        SESSION ZERO — AI DM ONBOARDING CONTRACT           ║
╚═══════════════════════════════════════════════════════════╝

You are being initialized as the AI Dungeon Master for Tinkle's Tinctures,
an ongoing D&D 5e campaign. Read everything below before responding.

${prompt}

━━━ VERIFICATION ━━━
Confirm you have read this entire message. Output exactly:
"SESSION ZERO CONFIRMED. Verifying: ${verify}
[Fill in actual values from the ledger above]
Ready to begin. Awaiting your first action."`;
  const outEl=document.getElementById('s0-output');if(outEl)outEl.textContent=out;
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
  setTimeout(loadElSettings,100);
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
  const key=localStorage.getItem('tt_el_key')||document.getElementById('el-key')?.value||'';
  if(!key){toast('Enter your API key first.');return;}
  toast('Checking key…');
  try{
    const r=await fetch('https://api.elevenlabs.io/v1/user',{headers:{'xi-api-key':key}});
    if(!r.ok){const b=await r.text();let m='';try{m=JSON.parse(b)?.detail?.message||b;}catch{m=b;}toast('✗ Invalid key: '+String(m).slice(0,60));return;}
    const u=await r.json();
    const used=u?.subscription?.character_count||0;
    const limit=u?.subscription?.character_limit||0;
    toast('✓ Key valid — '+used.toLocaleString()+' / '+limit.toLocaleString()+' chars used');
  }catch(e){toast('Network error: '+e.message);}
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
function addSpell(idx){
  if(!state.pcs[idx])return;
  if(!Array.isArray(state.pcs[idx].spellbook))state.pcs[idx].spellbook=[];
  state.pcs[idx].spellbook.push({name:'',level:1,school:'',castTime:'1 action',range:'',duration:'',components:'V, S',desc:''});
  save();_pcSheetTab=4;renderSheets();
}
function updSpell(idx,si,k,v){const sp=state.pcs[idx]?.spellbook?.[si];if(!sp)return;sp[k]=v;save();}
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
  save();_pcSheetTab=5;renderSheets();
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
  state.worldData.townReputation.forEach((t,i)=>{
    const d=document.createElement('div');d.className='town-row '+(t.status||'neutral');
    const statuses=['good','neutral','burned','fled'];
    d.innerHTML=`<input type="text" value="${esc(t.town||'')}" style="flex:1;min-width:80px;font-size:11px" placeholder="Town name" onchange="updTown(${i},'town',this.value)">
      <select style="width:75px;font-size:11px;padding:3px" onchange="updTown(${i},'status',this.value);renderTownRep()">
        ${statuses.map(s=>`<option value="${s}" ${t.status===s?'selected':''}>${s}</option>`).join('')}
      </select>
      <input type="text" value="${esc(t.notes||'')}" style="flex:2;min-width:100px;font-size:11px" placeholder="Notes..." onchange="updTown(${i},'notes',this.value)">
      <button class="btn sm red icon-btn" onclick="remTown(${i})">&times;</button>`;
    c.appendChild(d);
  });
}
function addTownRep(){if(!Array.isArray(state.worldData.townReputation))state.worldData.townReputation=[];state.worldData.townReputation.push({town:'',status:'neutral',notes:'',ts:state.worldData.time});save();renderTownRep();}
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
function syncOxProfile(){
  const ox=state.wagon.ox||{};
  const fields={backstory:'ox-backstory',personality:'ox-personality','bonds.tinkle':'ox-bond-tinkle','bonds.pebble':'ox-bond-pebble','bonds.slasher':'ox-bond-slasher',experimentLog:'ox-exp-log'};
  Object.entries(fields).forEach(([k,id])=>{
    const el=document.getElementById(id);if(!el)return;
    if(k.includes('.')){const[obj,sub]=k.split('.');el.value=(ox[obj]||{})[sub]||'';}
    else el.value=ox[k]||'';
  });
}

// ═══ PROVIDER STATUS MINI ═══
function updProvStatusMini(){
  const el=document.getElementById('provider-status-mini');if(!el)return;
  const key=getKey();
  if(!key){el.textContent='No key';el.style.color='var(--red)';}
  else{const m=provider==='google'?(localStorage.getItem('tt_gm')||'gemini-2.5-flash-lite'):(localStorage.getItem('tt_om')||'gemini-2.0-flash-exp');el.textContent='✓ '+m.split('/').pop();el.style.color='var(--green-bright)';}
}

function previouslyOn(){
  const key=getKey();if(!key){toast('Set an API key first.');return;}
  const recent=(state.chatHistory||[]).filter(m=>m.role==='assistant'||m.role==='user').slice(-8);
  if(recent.length<2){toast('Not enough chat history yet.');return;}
  const sys='You are a narrator for a D&D campaign. Summarize the most recent events in exactly 2 sentences for a TV-style "Previously On…" opening. Past tense. No mechanics or stat references. Focus on dramatic or plot-relevant events. Write as if opening an episode.';
  const msgs=recent.map(m=>({role:m.role,content:String(m.content||'').slice(0,600)}));
  msgs.push({role:'user',content:'Give me the 2-sentence "Previously On…" recap.'});
  const typEl=document.getElementById('typing-ind');
  if(typEl)typEl.classList.add('on');
  callAI(msgs,sys,120).then(resp=>{
    if(typEl)typEl.classList.remove('on');
    state.chatHistory.push({role:'sys',content:'📺 Previously on Tinkle\'s Tinctures…\n\n'+resp,ts:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
    save();renderChat();scrollActiveChatBottom();
  }).catch(err=>{if(typEl)typEl.classList.remove('on');toast('Recap failed: '+err.message);});
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
  const tabLabels={'tab-party':'Party Actions','tab-world':'World Actions','tab-wagon':'Wagon Actions','tab-combat':'Combat Actions','tab-session':'Session Actions','tab-ait':'AI Tools Actions','tab-dm':'DM Actions'};
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
  const CAT_MAP={'Party & Combat':['hp','condition_add','condition_clear','resource_use','shell_defense_toggle','combat_next','short_rest','roll_submit'],'World & Story':['time_advance','surroundings','town_rep','random_event','roleplay_npc','char_moment','send_scene','item_add_foraged','ox_feed','log_entry'],'AI & System':['context_refresh','context_refresh_btn','resync_ai','module_checkin','previously_on','state_fix','save_game','custom']};
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
    case 'ox_feed': state.wagon.ox.feed='fed';save();renderWagon();toast('✓ Grit fed.');break;
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
    case 'shell_defense_toggle':{
      const tinklePC=state.pcs.find(p=>p.name==='Tinkle');
      if(!tinklePC){toast('Tinkle not found.');break;}
      const inShell=tinklePC.conditions.includes('Shell Defense');
      if(inShell){['Shell Defense','Prone','Incapacitated'].forEach(c=>{const i=tinklePC.conditions.indexOf(c);if(i>-1)tinklePC.conditions.splice(i,1);});}
      else{['Shell Defense','Prone','Incapacitated'].forEach(c=>{if(!tinklePC.conditions.includes(c))tinklePC.conditions.push(c);});}
      saveRefresh();toast(inShell?'🐢 Tinkle emerged from shell (conditions cleared)':'🛡 Tinkle entered Shell Defense (AC 21, Prone, Incapacitated)');
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
  if(!(state.quickActions||[]).length){c.innerHTML='<div style="color:var(--text-dim);font-size:11px;padding:6px">No quick actions defined.</div>';return;}
  const tabLabels={'tab-party':'Party','tab-world':'World','tab-wagon':'Wagon','tab-combat':'Combat','tab-session':'Session','tab-ait':'AI Tools','tab-dm':'AI DM'};
  state.quickActions.forEach((action,i)=>{
    const d=document.createElement('div');
    d.style.cssText='display:flex;gap:5px;margin-bottom:5px;align-items:center;flex-wrap:wrap;padding:6px 8px;background:var(--surface2);border:1px solid var(--border);border-radius:2px';
    const contexts=Object.keys(tabLabels);
    d.innerHTML=`<input type="text" value="${esc(action.label)}" style="flex:2;min-width:80px;font-size:11px" placeholder="Button label" onchange="updQA(${i},'label',this.value)">
      <select style="width:120px;font-size:11px;padding:3px" onchange="updQA(${i},'type',this.value)">
        ${['hp','condition_add','condition_clear','resource_use','item_add_foraged','ox_feed','time_advance','save_game','combat_next','log_entry','context_refresh','town_rep','custom'].map(t=>`<option value="${t}" ${action.type===t?'selected':''}>${t}</option>`).join('')}
      </select>
      <div style="display:flex;flex-wrap:wrap;gap:3px">${contexts.map(ctx=>`<label style="display:flex;align-items:center;gap:2px;font-size:9px;cursor:pointer"><input type="checkbox" ${(action.context||[]).includes(ctx)?'checked':''} onchange="toggleQAContext(${i},'${ctx}',this.checked)" style="width:auto">${tabLabels[ctx]}</label>`).join('')}</div>
      <button class="btn sm red icon-btn" onclick="remQA(${i})">&times;</button>`;
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
      <select id="sf-pc">${pcOpts}<option value="wagon">Wagon Cargo</option><option value="party">Party (shared)</option><option value="hoard">Pebble's Hoard</option></select></div>
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
    report+=(i+1)+'. ['+cat+'|'+v+'] '+note+'\n';
  });
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
  log+='You are reviewing actual gameplay logs from Tinkle\'s Tinctures, a D&D 5e campaign management app.\n';
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
function toast(msg,dur){
  const t=document.getElementById('toast');if(!t)return;
  t.innerText=msg;t.style.display='block';
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

var _stepTarget=null; // {type:'pc',idx:N} or {type:'gp'}
const _DRAWER_TABS=['tab-party','tab-world','tab-wagon','tab-combat','tab-session','tab-ait','tab-ait-chk','tab-dev','tab-setup'];
const _DRAWER_TITLES={'tab-party':'Party','tab-world':'World','tab-wagon':'Wagon','tab-combat':'Combat','tab-session':'Session','tab-ait':'AI Tools','tab-ait-chk':'Tools','tab-dev':'Dev','tab-setup':'Setup'};

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
    const isTarget=_stepTarget&&_stepTarget.type==='pc'&&_stepTarget.idx===i;
    const tile=document.createElement('div');
    tile.className='hud-tile'+(isTarget?' active-target':'');
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
  // Familiar tiles
  state.pcs.forEach((pc,pi)=>{
    if(!pc.familiar)return;
    const f=pc.familiar;
    const fhp=parseInt(f.hp)||0,fmax=parseInt(f.hp_max)||1;
    const fpct=Math.max(0,Math.min(100,(fhp/fmax)*100));
    const fsparkCls=fpct<20?'danger':fpct<55?'warn':'ok';
    const tile=document.createElement('div');
    tile.className='hud-tile fam-tile';
    tile.onclick=(function(idx){return function(){openFamiliarOverview(idx);};})(pi);
    tile.innerHTML='<div class="hud-name" style="color:var(--purple-bright)">🦉 '+esc(f.name||'Familiar')+'</div>'
      +'<div class="hud-val">'+fhp+'<span style="font-size:9px;color:var(--text-dim)">/'+fmax+'</span></div>'
      +'<div class="hud-spark '+fsparkCls+'" style="width:'+fpct.toFixed(1)+'%"></div>';
    mosaic.appendChild(tile);
  });
  // Grit tile
  const ox=state.wagon&&state.wagon.ox;
  if(ox){
    const ghp=parseInt(ox.hp)||0,gmax=parseInt(ox.hp_max)||15;
    const gpct=Math.max(0,Math.min(100,(ghp/gmax)*100));
    const gsparkCls=gpct<20?'danger':gpct<55?'warn':'ok';
    const gritTile=document.createElement('div');
    gritTile.className='hud-tile grit-tile';
    gritTile.onclick=openGritOverview;
    gritTile.innerHTML='<div class="hud-name" style="color:var(--green)">🐂 '+esc(ox.name||'Grit')+'</div>'
      +'<div class="hud-val">'+ghp+'<span style="font-size:9px;color:var(--text-dim)">/'+gmax+'</span></div>'
      +'<div class="hud-spark '+gsparkCls+'" style="width:'+gpct.toFixed(1)+'%"></div>';
    mosaic.appendChild(gritTile);
  }
  // GP
  const gp=parseFloat((state.treasuryData||{}).gp)||0;
  const gpEl=document.getElementById('hud-gp');
  if(gpEl)gpEl.textContent=(gp%1===0?Math.round(gp):gp.toFixed(1))+'gp';
  // Sync dot
  const syncDot=document.getElementById('as-dot');
  // (already managed by existing save() / justSave() code via class toggles)
  renderSceneLabel();
}

function renderSceneLabel(){
  const lbl=document.getElementById('step-target-label');if(!lbl)return;
  if(_stepTarget&&_stepTarget.type==='pc'){
    const pc=state.pcs[_stepTarget.idx];
    if(pc){lbl.textContent='⚔ '+esc(pc.name||'PC')+' selected · '+(parseInt(pc.hp)||0)+'/'+(parseInt(pc.hp_max)||1)+' HP';return;}
  }
  const loc=state.worldData?.location||'';
  const scene=state.worldData?.scene_title||'';
  const [sm,lg]=(state.hpSteps&&state.hpSteps.length===2)?state.hpSteps:[1,5];
  lbl.textContent=scene?'📍 '+(scene+(loc?' · '+loc:'')):(loc?'📍 '+loc:'Tap a tile · ±'+sm+'/±'+lg+' HP (long-press to edit)');
}
function renderStepBar(){
  const bar=document.getElementById('step-bar');if(!bar)return;
  const [sm,lg]=(state.hpSteps&&state.hpSteps.length===2)?state.hpSteps:[1,5];
  bar.innerHTML=
    `<button class="step-btn dec" onclick="executeStep(-${lg})">-${lg}</button>`+
    `<button class="step-btn dec" onclick="executeStep(-${sm})">-${sm}</button>`+
    `<button class="step-btn inc" onclick="executeStep(${sm})">+${sm}</button>`+
    `<button class="step-btn inc" onclick="executeStep(${lg})">+${lg}</button>`;
}
function setHpStep(which){
  const cur=(state.hpSteps||[1,5])[which];
  const label=which===0?'small step (currently '+cur+')':'large step (currently '+cur+')';
  const v=parseInt(prompt('Set HP '+label+':'),10);
  if(!v||v<1||v>999)return;
  if(!state.hpSteps)state.hpSteps=[1,5];
  state.hpSteps[which]=v;
  save();renderStepBar();renderSceneLabel();
}
function openStepConfig(){
  const [sm,lg]=(state.hpSteps&&state.hpSteps.length===2)?state.hpSteps:[1,5];
  openQASheet('⚙ Configure HP Steps',`
    <div class="form-row">
      <div class="fg"><label class="field-label">Small step (inner buttons)</label><input type="number" id="sc-sm" value="${sm}" min="1" max="99" style="font-size:20px;text-align:center;padding:8px"></div>
      <div class="fg"><label class="field-label">Large step (outer buttons)</label><input type="number" id="sc-lg" value="${lg}" min="1" max="999" style="font-size:20px;text-align:center;padding:8px"></div>
    </div>
    <p style="font-size:11px;color:var(--text-dim);margin-top:8px">Common: 1&amp;5 for fine control · 5&amp;10 for boss fights · 1&amp;10 for ranged skirmishes</p>`,
    ()=>{
      const s=parseInt(document.getElementById('sc-sm').value)||1;
      const l=parseInt(document.getElementById('sc-lg').value)||5;
      state.hpSteps=[Math.min(s,l),Math.max(s,l)];
      save();renderStepBar();renderSceneLabel();closeQAModal();
      toast('✓ HP steps set to ±'+state.hpSteps[0]+' / ±'+state.hpSteps[1]);
    });
}
function openFamiliarOverview(pcIdx){
  const pc=state.pcs[pcIdx];if(!pc||!pc.familiar)return;
  const f=pc.familiar;
  const hp=parseInt(f.hp)||0,max=parseInt(f.hp_max)||1;
  const pct=Math.max(0,Math.min(100,(hp/max)*100));
  const hpCol=hp<=0?'var(--red)':pct<25?'#c04a3a':pct<50?'var(--gold)':'var(--green)';
  const titleEl=document.getElementById('familiar-ov-title');
  const bodyEl=document.getElementById('familiar-ov-body');
  if(titleEl)titleEl.textContent='🦉 '+(f.name||'Familiar')+' · '+esc(pc.name)+"'s Familiar";
  if(bodyEl)bodyEl.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
      <span style="font-size:11px;color:var(--text-dim)">${esc(f.type||'Familiar')} · AC ${f.ac||10} · ${esc(f.speed||'20 ft.')}</span>
      <span style="font-size:20px;font-weight:700;color:${hpCol};font-family:var(--mono);margin-left:auto">${hp}<span style="font-size:12px;color:var(--text-dim)">/${max}</span></span>
    </div>
    <div class="hp-bar-wrap" style="margin-bottom:8px"><div class="hp-bar-fill" style="width:${pct}%;background:${hpCol}"></div></div>
    ${f.notes?`<div style="font-size:10px;color:var(--text-dim);white-space:pre-line;line-height:1.5;margin-bottom:10px">${esc(f.notes)}</div>`:''}
    <div style="display:flex;gap:6px;align-items:center">
      <span style="font-size:11px;color:var(--text-dim)">HP:</span>
      <input type="number" id="fov-amt" style="width:52px;text-align:center;padding:4px;font-size:12px" placeholder="Amt">
      <button class="btn sm green" onclick="(function(){const v=parseInt(document.getElementById('fov-amt').value);if(!v)return;state.pcs[${pcIdx}].familiar.hp=Math.min(state.pcs[${pcIdx}].familiar.hp_max,(state.pcs[${pcIdx}].familiar.hp||0)+v);document.getElementById('fov-amt').value='';save();openFamiliarOverview(${pcIdx});renderHUD();})()" style="padding:3px 10px">Heal</button>
      <button class="btn sm red" onclick="(function(){const v=parseInt(document.getElementById('fov-amt').value);if(!v)return;state.pcs[${pcIdx}].familiar.hp=Math.max(0,(state.pcs[${pcIdx}].familiar.hp||0)-v);document.getElementById('fov-amt').value='';save();openFamiliarOverview(${pcIdx});renderHUD();})()" style="padding:3px 10px">Dmg</button>
    </div>
  `;
  document.getElementById('familiar-ov')?.classList.add('is-open');
  document.getElementById('familiar-ov-bd')?.classList.add('is-open');
}
function closeFamiliarOverview(){
  document.getElementById('familiar-ov')?.classList.remove('is-open');
  document.getElementById('familiar-ov-bd')?.classList.remove('is-open');
}
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
    const stroke=repColor(loc);
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
  const locQuests=(state.quests||[]).filter(q=>q.status==='active'&&q.text&&q.text.toLowerCase().includes(loc.name.toLowerCase()));
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
  const ox=state.wagon&&state.wagon.ox;if(!ox)return;
  const hp=parseInt(ox.hp)||0,max=parseInt(ox.hp_max)||15;
  const pct=Math.max(0,Math.min(100,(hp/max)*100));
  const hpCol=hp<=0?'var(--red)':pct<25?'#c04a3a':pct<50?'var(--gold)':'var(--green)';
  const feedEmoji={fed:'✅',hungry:'⚠',starving:'🔴'}[ox.feed||'fed']||'✅';
  const titleEl=document.getElementById('grit-ov-title');
  const bodyEl=document.getElementById('grit-ov-body');
  if(titleEl)titleEl.textContent='🐂 '+esc(ox.name||'Grit');
  if(bodyEl)bodyEl.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
      <span style="font-size:11px;color:var(--text-dim)">AC ${ox.ac||11} · ${feedEmoji} ${ox.feed||'fed'} · ${esc(ox.conditions||'No conditions')}</span>
      <span style="font-size:20px;font-weight:700;color:${hpCol};font-family:var(--mono);margin-left:auto">${hp}<span style="font-size:12px;color:var(--text-dim)">/${max}</span></span>
    </div>
    <div class="hp-bar-wrap" style="margin-bottom:10px"><div class="hp-bar-fill" style="width:${pct}%;background:${hpCol}"></div></div>
    ${ox.personality?`<div style="font-size:10px;color:var(--text-dim);font-style:italic;margin-bottom:8px;line-height:1.4">${esc(ox.personality)}</div>`:''}
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:10px">
      <span style="font-size:11px;color:var(--text-dim)">HP:</span>
      <input type="number" id="gov-amt" style="width:52px;text-align:center;padding:4px;font-size:12px" placeholder="Amt">
      <button class="btn sm green" onclick="(function(){const v=parseInt(document.getElementById('gov-amt').value);if(!v)return;state.wagon.ox.hp=Math.min(state.wagon.ox.hp_max,(state.wagon.ox.hp||0)+v);document.getElementById('gov-amt').value='';save();openGritOverview();renderHUD();})()" style="padding:3px 10px">Heal</button>
      <button class="btn sm red" onclick="(function(){const v=parseInt(document.getElementById('gov-amt').value);if(!v)return;state.wagon.ox.hp=Math.max(0,(state.wagon.ox.hp||0)-v);document.getElementById('gov-amt').value='';save();openGritOverview();renderHUD();})()" style="padding:3px 10px">Dmg</button>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn sm" onclick="state.wagon.ox.feed='fed';save();openGritOverview();renderHUD()" style="flex:1;border-color:var(--green);color:var(--green)">✅ Fed</button>
      <button class="btn sm" onclick="state.wagon.ox.feed='hungry';save();openGritOverview();renderHUD()" style="flex:1;border-color:var(--gold);color:var(--gold-bright)">⚠ Hungry</button>
      <button class="btn sm" onclick="state.wagon.ox.feed='starving';save();openGritOverview();renderHUD()" style="flex:1;border-color:var(--red);color:var(--red)" style="flex:1">🔴 Starving</button>
    </div>
  `;
  document.getElementById('grit-ov')?.classList.add('is-open');
  document.getElementById('grit-ov-bd')?.classList.add('is-open');
}
function closeGritOverview(){
  document.getElementById('grit-ov')?.classList.remove('is-open');
  document.getElementById('grit-ov-bd')?.classList.remove('is-open');
}
function setStepTarget(type,idx){
  _stepTarget={type:type,idx:idx};
  document.querySelectorAll('.hud-tile').forEach(t=>t.classList.remove('active-target'));
  if(type==='pc'){const tile=document.getElementById('hud-tile-'+idx);if(tile)tile.classList.add('active-target');}
  renderSceneLabel();
}

function executeStep(delta){
  if(!_stepTarget){toast('Tap a party tile to set HP target');return;}
  const t=_stepTarget;
  if(t.type==='pc'){
    const pc=state.pcs[t.idx];
    if(!pc)return;
    let hp=(parseInt(pc.hp)||0)+delta;
    const max=parseInt(pc.hp_max)||1;
    hp=Math.max(0,Math.min(max,hp));
    pc.hp=hp;
    renderHUD();renderCards();renderSceneLabel();save();
    toast((pc.name||'PC')+': '+hp+'/'+max+' HP');
  }
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
        <span style="font-size:18px">${pc.color||'⬤'}</span>
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
  if(['world','wagon','combat'].includes(key)){openLogisticsDrawer(key);return;}
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
    sn.innerHTML=[['world','🌍 World'],['wagon','🛒 Wagon'],['combat','⚔ Combat']]
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
    sn.innerHTML=[['session','📅 Session'],['ait','🤖 AI Tools'],['ait-chk','⏪ Tools'],['dev','🔧 Dev'],['setup','⚙ Setup']]
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
  if(sub==='wagon'){renderWagon();renderIncome();renderPartyInv();renderTreasuryTotal();}
  if(sub==='world'){syncWorld();}
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
    _cmdResult('📦 Added: '+itemName+' → '+(target==='cargo'?'wagon cargo':target==='hoard'?'Pebble\'s hoard':'party inventory'));
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

  // //help — show available commands
  if(lower==='help'||lower==='?'||lower==='commands'){
    _cmdResult('📖 Command Index (tap to expand)\n─────────────────────────────\n'
      +'QUICK ACTIONS\n'
      +'  //hp +5       — heal 5 HP          //hp -3       — take 3 damage\n'
      +'  //gold +10    — add 10 gp          //gold -5     — spend 5 gp\n'
      +'  //add item "rope"          — add to party inventory\n'
      +'  //add item "gem" to cargo  — add to wagon cargo\n'
      +'  //add item "ring" to hoard — add to Pebble\'s hoard\n\n'
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
      'commands':      'Type // before a message for dev commands:\n// note — log a dev note\n//flag 20 reason — export last 20 messages\n//add item name — add to inventory\n//hp +5 — adjust your HP\n//gold -10 — adjust treasury\n//explain topic — explain a feature\n//help — show this list',
      '//':            'Type // before a message for dev commands:\n// note — log a dev note\n//flag 20 reason — export last 20 messages\n//add item name — add to inventory\n//hp +5 — adjust your HP\n//gold -10 — adjust treasury\n//explain topic — explain a feature\n//help — show this list',
      'combat':        'Zone Combat uses 6 zones (Frontline/Backline/Flanks/Air/Rear). Add combatants, roll initiative, then the AI moves tokens. Tap a token for HP/conditions. Toggle Manual mode to move tokens yourself by tapping token → zone.',
      'zones':         'Zone Combat uses 6 zones (Frontline/Backline/Flanks/Air/Rear). Add combatants, roll initiative, then the AI moves tokens. Tap a token for HP/conditions. Toggle Manual mode to move tokens yourself by tapping token → zone.',
      'map':           'Area Map: Upload a map image in Logistics > World > Locations (map icon). Tap a location chip → tap the map to place a pin. Tap a pin for Move/Unpin/Details.',
      'pins':          'Tap a map pin → action bar appears: ↻ Move (reposition), ✕ Unpin (remove from map), ⋯ Details (full location info). Long-press + drag also works for quick repositioning.',
      'inventory':     'Party inventory is in the Sheet tab. Wagon cargo and Pebble\'s hoard are in Logistics > Wagon. Tap any item chip to expand and edit. Use //add item "name" to quickly add items.',
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
  const activeBtn=document.querySelector('.chat-tab-btn.active');
  const channel=activeBtn?.id?.replace('chat-tab-','')||_activeTab;
  if(channel==='party'){qi.value='';sendPartyMsg(val);return;}
  if(!getKey()){toast('Set an API key first — tap ⚙ in the AI DM header.');return;}
  if(channel!=='party'&&channel!=='ooc'&&channel!=='test'&&!playerName){populateSetup();openModal('setup-modal');toast('Set your player name first.');return;}
  qi.value='';
  if(channel==='ooc'){sendOOCMsg(val);return;}
  if(channel==='test'){sendTestMsg(val);return;}
  const ci=document.getElementById('chat-input');
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
  setStepTarget('pc',idx);
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
    let badge='<span class="status-badge ok">OK</span>';
    if(pc.hp<=0)badge='<span class="status-badge dead">DOWN</span>';
    else if(pct<50||(pc.conditions||[]).length>0)badge='<span class="status-badge warn">HURT</span>';
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
      <span style="flex:1;height:2px;background:var(--surface3);border-radius:1px"><span style="display:block;height:2px;width:${xpPct.toFixed(1)}%;background:var(--gold-dim);border-radius:1px"></span></span>
      <span>${xp.toLocaleString()} XP</span>
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
      const sm=s=>Math.floor((parseInt(pc[s])||10-10)/2);
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
    return`<div class="sheet-section">${slotHtml}${bookHtml}</div>`;
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
  const conMod=Math.floor((parseInt(pc.con)||10-10)/2);
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
  _luNext, _luRollHP, _luSelectSubclass, _luSetHP, _luToggleSpell, _luUpdateASI,
  addAttack, addCampaignSecret, addCell, addCombCond, addCombatant, addCondFromPicker,
  addFamiliar, addIncome, addLogEntry, addModuleEpisode, addNPC, addNewChar,
  addPartyItem, addPartyToCombat, addPcItem, addPreset, addQA, addQuest,
  addResource, addScene, addSlotLvl, addSnip, addSpell, addTownRep, addWagonItem,
  adjHP, applyLevelUp, askDMFromParty, auditWithAI, awardXP,
  buildAISummary, buildRawSummary,
  chatKey, chatKeyQuick, checkResetConfirm, clearChat, clearChkHist,
  clearLog, clearPartyBadge, clearResolvedFlags,
  closeDrawer, closeFlagModal, closeHeaderMenu, closeLevelUpModal, closeModal, openModal,
  closePCOverview, closeQAMenu, closeQAModal, closeTabOverflow, closeTreasury,
  completeSetup, connectFirebase, copyIdx, copyStateCompact, copyText,
  delChar, deleteChatMsg, deleteFlag, doLongRest, doQAHP, doShortRest,
  doStateFix, editFlagNote, endCombat, executeReset, executeStep,
  exportConfig, exportFlagReport, fbDisconnect, genLedger, generateSessionZero,
  setFlagCatFilter, copyDevNotes,
  saveContract, renderContracts,
  handlePluginCmd, importConfig, importFromPaste, justSave, launchCampaign,
  loadPreset, lockPremise, logTurn, markChkDone,
  navTo, nextTurn, oocKey, openDashboard, openDrawer, openFlagModal,
  openLogisticsDrawer, openSystemsDrawer, switchLogisticsTab, switchSystemsTab,
  openLevelUpWizard, openPCOverview, openQASheet, openRollSheet, openStepConfig, openTreasury, partyKey,
  pcLongRest, pcShortRest, prevTurn, quickD20, quickRoll,
  remCell, remComb, remModuleEp, remNPC, remPI,
  remPcItemSheet, remPreset, remQA, remQ, remRel, remScene,
  remSecret, remSlotLvl, remSnip, remSpell, remTown, remWItem,
  renderAll, renderSheets, renderCards, resolveConsequence, rollAttack, rollStatCheck, rollInitiative,
  saveRefresh, saveSetupPC, saveTts, saveBP,
  scrollStoryBottom, scrollStoryTop, selectFlagCat,
  sendContextRefresh, sendMsg, sendMsgQuick, sendOOCMsg, sendPartyMsg,
  sendRollToChat, sendSceneToDM, sessionRecap, setProvider, setScene,
  setSheetTab, setStepTarget, setTtsProvider,
  showChatTab, renderSuggestChips, fillSuggest, showSessionMode, showSessionTab, showSetupStep, showTab, showWorldTab,
  speakActiveScene, speakIdx, speakScene, st, submitFlag, sw, switchUser,
  testTts, toggleCombCond, toggleCond, toggleDeathSave, toggleDockDice, toggleFlagVerdict, toggleInspiration,
  toggleHeaderMenu, toggleHeaderEdit, execHeaderSC, renderHeaderShortcuts,
  togglePremise, toggleQAContext, toggleQAMenu, toggleSkillProf,
  toggleSlot, toggleSuperpower, toggleTabOverflow, toggleThemeMode, toggleVis,
  triggerChk, uninstallPlugin, upd, updAtk, updCell, updCombHP, updFamiliar,
  updModuleEp, updNPC, updPI, updPcItem, updPreset, updQ, updQA, updRel,
  updQAFabIcon, pickQAFabIcon,
  updResource, updScene, updSecret, updSlot, updSnip, updSpell, updTown,
  updWItem, updateCpMode, updateRollMod, updateStateFixForm, updateStoryThread,
  useResource, verifyElKey, renderSceneLabel, renderPartyPCList, toggleSkillProf,
  sendRollToChat, addPartyItem, remPI, updPI, closeInvEdit,
  showTermTip, rollStatCheck, rollInitiative,
  _expandedMsgs, setSpellFilter,
  renderStepBar, setHpStep,
  openFamiliarOverview, closeFamiliarOverview, openGritOverview, closeGritOverview,
  renderLocations, openLocationDetail, closeLocDetail, toggleLocDmMode,
  addLocationManual, updateLocNotes, addLocHistory, addLocNPC, addLocInvestment,
  setLocStatus, deleteLocation, openLocationSeed, closeLocSeed, confirmLocationSeed,
  uploadAreaMap, removeAreaMap, startMapPlace, cancelMapPlace, handleMapTap, setLocView, pinAction, closePinMenu, movePin, unpinFromMap,
  openSheetPicker, dismissRollRequest,
  renderSessionArchive,
  verifyContracts, clearFlagNote,
  rsAdjMod, rsRollDice, _buildRsPills,
  renderCharSheet, toggleSheetLock, setCharSheetTab,
  csSpendHD, csSetExhaustion, csAddLang, csRemLang,
  renderContextStrip, copyContracts,
  navToast, scrollActiveChatBottom, scrollActiveChatTop,
  toggleTestMode, clearTestChat, sendTestMsg,
  save, saveEditedNote,
  previouslyOn, viewQuestInChat,
  exportGameplayLog, exportMoment, populateVoices, openResetModal, requestNotifPermission,
  saveDmSecrets, renderSetupPCCards, resetTurns, resyncAI, quickSellItem,
  zoneTokenTap, zoneBoxTap, zoneHPAdj, zoneHPCustom, quickAddCond, toggleMoveMode, toggleZoneFog,
  renderSetupLock, setSetupUnlocked, remAtk, rewindTo,
  renderPCOverview, renderHUD, renderCharTabs,
  remPcItem, remResource, renderCapacity, renderErrorLog, closeWEdit,
});
// Live getter so inline onclick/oninput can access `state` even after Firebase reassigns it
Object.defineProperty(window,'state',{get(){return state;},configurable:true});

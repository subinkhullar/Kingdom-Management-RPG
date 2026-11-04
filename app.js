/**
 * ECHOES OF THE IRON CROWN™
 * Commercial Kingdom Management RPG PWA Engine
 * (C) 2026 Subin Khullar. All rights reserved.
 */

// ==========================================
// 1. PROCEDURAL AUDIO SYNTHESIS ENGINE
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterVolume = 0.5;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.6;
    this.muted = false;
    this.currentLoop = null;
  }

  initContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx && !this.ctx) {
      this.ctx = new AudioCtx();
    }
  }

  ensureUnlocked() {
    if (!this.ctx) this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2) {
    if (this.muted) return;
    this.ensureUnlocked();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal * this.sfxVolume * this.masterVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      /* Audio error handled gracefully */
    }
  }

  playSfx(name) {
    if (this.muted) return;
    switch (name) {
      case 'click':
        this.playTone(800, 'triangle', 0.04, 0.1);
        break;
      case 'decree':
        this.playTone(261.63, 'square', 0.18, 0.2);
        setTimeout(() => this.playTone(329.63, 'square', 0.25, 0.25), 90);
        break;
      case 'fanfare':
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'triangle', 0.3, 0.3), idx * 110);
        });
        break;
      case 'doom':
        [150, 142, 134, 110].forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'sawtooth', 0.45, 0.35), idx * 130);
        });
        break;
      case 'gold':
        this.playTone(987.77, 'sine', 0.08, 0.18);
        setTimeout(() => this.playTone(1318.51, 'sine', 0.15, 0.2), 60);
        break;
    }
  }

  startAmbientTheme(theme = 'royal') {
    if (this.muted) return;
    this.stopTheme();
    this.ensureUnlocked();
    if (!this.ctx) return;

    let notes = [220, 261.63, 293.66, 329.63];
    if (theme === 'battle') notes = [110, 116.54, 130.81, 146.83];
    if (theme === 'golden') notes = [261.63, 329.63, 392.00, 523.25];

    let step = 0;
    this.currentLoop = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[step % notes.length], this.ctx.currentTime);
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04 * this.musicVolume * this.masterVolume, this.ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.5);
      step++;
    }, 1800);
  }

  stopTheme() {
    if (this.currentLoop) {
      clearInterval(this.currentLoop);
      this.currentLoop = null;
    }
  }
}

// ==========================================
// 2. CONSTANTS & PROCEDURAL GENERATORS
// ==========================================
const RESOURCE_KEYS = ['gold', 'military', 'happiness', 'reputation', 'knowledge', 'faith', 'influence', 'food', 'population'];

const RESOURCE_META = {
  gold: { name: 'Gold', icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-1h-1c-.55 0-1-.45-1-1v-3c0-.55.45-1 1-1h3v-2h-4v-1h2V6h2v1h1c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1h-3v2h4v1h-2v1z"/>' },
  military: { name: 'Military', icon: '<path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>' },
  happiness: { name: 'Happiness', icon: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>' },
  reputation: { name: 'Reputation', icon: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>' },
  knowledge: { name: 'Knowledge', icon: '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>' },
  faith: { name: 'Faith', icon: '<path d="M10 2v6h-4v4h4v10h4V12h4V8h-4V2h-4z"/>' },
  influence: { name: 'Influence', icon: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>' },
  food: { name: 'Food', icon: '<path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.48L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 3.39 2.43 5.34v8zm-7.06-4v4h2v-4h-2zm-3-18.99v22.99h2V0h-2z"/>' },
  population: { name: 'Population', icon: '<path d="M16 13c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2s-2 .9-2 2v5c0 1.1.9 2 2 2zm-8 0c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2S6 4.9 6 6v5c0 1.1.9 2 2 2zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm8 0c-.8 0-1.74.12-2.74.34 1.69.83 2.74 2.15 2.74 3.66v2h8v-2c0-2.66-5.33-4-8-4z"/>' }
};

const FACTIONS = [
  { id: 'nobles', name: 'High Nobles', leader: 'Duke Gerald', color: '#8e44ad', desc: 'Hold ancient land deeds and peerage.' },
  { id: 'merchants', name: 'Merchants Guild', leader: 'Guildmaster Vance', color: '#f39c12', desc: 'Control sea ports and market trade.' },
  { id: 'military', name: 'Royal Legion', leader: 'General Valerius', color: '#c0392b', desc: 'Guard kingdom borders and enforce decrees.' },
  { id: 'mages', name: 'Arcane Conclave', leader: 'Archmage Solas', color: '#9b59b6', desc: 'Scholars of primal magic and relics.' },
  { id: 'church', name: 'Grand Orthodoxy', leader: 'High Patriarch Clemens', color: '#f1c40f', desc: 'Keepers of ancestral faith and rites.' },
  { id: 'farmers', name: 'Common Peasants', leader: 'Miller Tobias', color: '#27ae60', desc: 'Cultivate granaries and work quarries.' },
  { id: 'explorers', name: 'Pathfinders League', leader: 'Captain Astrid', color: '#16a085', desc: 'Venture into forgotten uncharted lands.' },
  { id: 'artisans', name: 'Craft Guilds', leader: 'Forgemaster Brann', color: '#d35400', desc: 'Architects, smiths and stonemasons.' }
];

const KINGDOM_LEVELS = [
  { level: 1, title: 'Village', xpReq: 0 },
  { level: 2, title: 'Settlement', xpReq: 25 },
  { level: 3, title: 'Town', xpReq: 60 },
  { level: 4, title: 'City', xpReq: 110 },
  { level: 5, title: 'Kingdom', xpReq: 180 },
  { level: 6, title: 'Great Kingdom', xpReq: 270 },
  { level: 7, title: 'Empire', xpReq: 390 },
  { level: 8, title: 'Grand Empire', xpReq: 540 },
  { level: 9, title: 'Legendary Empire', xpReq: 720 },
  { level: 10, title: 'Immortal Empire', xpReq: 1000 }
];

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const WEATHERS = ['☀️ Sunny', '🌧️ Rain', '⛈️ Storm', '❄️ Snow', '🌫️ Fog', '🔥 Drought'];

function generate100CourtCases() {
  const topics = [
    { f: 'farmers', t: 'Grain Silo Dispute', body: 'The lower valley harvests produced a surplus, but river tax collectors demand half before storage.' },
    { f: 'merchants', t: 'Spice Tariff Petition', body: 'Foreign caravanners seek exempt duties on precious dyes and medicinal tea.' },
    { f: 'military', t: 'Frontier Fort Refurbishment', body: 'The Northern Keep is crumbling; stone and wages are urgently required.' },
    { f: 'mages', t: 'Rune Anomaly in Catacombs', body: 'Mysterious leyline pulses have awakened spectral lights beneath the city.' },
    { f: 'church', t: 'Sanctity of the Holy Crypts', body: 'Inquisitors demand authority to purge suspected necromancers among the herbalists.' },
    { f: 'artisans', t: 'Guild Monopoly Charter', body: 'The Blacksmiths demand unlicensed wandering tinkers be expelled from town squares.' },
    { f: 'explorers', t: 'Sunken Galleon Expedition', body: 'A diver claims to have located the royal flagship lost during the War of Cinders.' },
    { f: 'nobles', t: 'Forest Poaching Trial', body: 'A starving woodland hamlet culled imperial deer; the local baron demands hangings.' },
    { f: 'merchants', t: 'Counterfeit Minting Crisis', body: 'Impure copper-clipped gold crowns have flooded harbor taverns.' },
    { f: 'military', t: 'Veterans Pension Appeal', body: 'Retired legionnaires who defended the pass petition for arable homestead allotments.' },
    { f: 'farmers', t: 'Locust Swarm Defense', body: 'Southern swarms approach; peasants ask for royal flame-pitch to scorch perimeter ditches.' },
    { f: 'mages', t: 'Forbidden Grimoire Auction', body: 'A collector brought a blood-bound tome from the shattered wastes to open market.' },
    { f: 'church', t: 'Heresy at the Water Mill', body: 'Villagers celebrate an unapproved lunar deity with floral effigies.' },
    { f: 'artisans', t: 'Colossal Clockwork Bell', body: 'Engineers desire royal patronage to cast a city clock that rings every dawn.' },
    { f: 'nobles', t: 'Border Estate Succession', body: 'Two rival cousins muster armed retinues over the inheritance of Highcrest Keep.' },
    { f: 'explorers', t: 'Mapmaker Forbidden Passage', body: 'Cartographers discovered a mountain fissure leading straight behind the Ridge.' }
  ];

  const cases = [];
  for (let i = 1; i <= 100; i++) {
    const base = topics[(i - 1) % topics.length];
    const faction = FACTIONS.find(f => f.id === base.f) || FACTIONS[0];
    cases.push({
      id: `case_${i}`,
      title: `${base.t} #${i}`,
      factionId: faction.id,
      petitioner: `${faction.leader}'s Envoy`,
      role: `${faction.name} Delegate`,
      desc: `${base.body} The crown's resolution will establish binding precedent throughout the realm.`,
      quote: `"Sire, the crown is the pillar upon which stability balances."`,
      options: [
        { type: 'Approve', text: 'Grant petition in full', cost: { gold: -6, food: -4 }, gain: { happiness: +7, [faction.id]: +12 }, trait: 'merciful' },
        { type: 'Reject', text: 'Deny by imperial decree', cost: { happiness: -5, [faction.id]: -10 }, gain: { gold: +8, military: +4 }, trait: 'cruel' },
        { type: 'Investigate', text: 'Send magistrate investigators', cost: { gold: -3 }, gain: { knowledge: +8, reputation: +4 }, trait: 'wise' },
        { type: 'Compromise', text: 'Enforce split concession', cost: { gold: -2 }, gain: { reputation: +6, [faction.id]: +4 }, trait: 'diplomatic' },
        { type: 'Delay', text: 'Shelve decision for next council', cost: { reputation: -4 }, gain: { gold: +2 }, trait: 'paranoid' },
        { type: 'Delegate', text: 'Assign resolution to regional guild', cost: { influence: -5 }, gain: { happiness: +4, [faction.id]: +6 }, trait: 'traditional' }
      ]
    });
  }
  return cases;
}

function generate100Achievements() {
  const cats = ['Exploration', 'Economy', 'Military', 'Diplomacy', 'Leadership', 'Legendary', 'Secret', 'Humorous'];
  const list = [];
  const templates = [
    { name: 'First Coin', desc: 'Accumulate more than 60 Gold.', cat: 'Economy', test: s => s.resources.gold >= 60 },
    { name: 'Hoarder King', desc: 'Reach 95 Gold.', cat: 'Economy', test: s => s.resources.gold >= 95 },
    { name: 'Shield of the Realm', desc: 'Reach 85 Military strength.', cat: 'Military', test: s => s.resources.military >= 85 },
    { name: 'Grand Peacemaker', desc: 'Maintain all faction allegiances above 50.', cat: 'Diplomacy', test: s => Object.values(s.factions).every(v => v >= 50) },
    { name: 'Philosopher Sovereign', desc: 'Reach 90 Knowledge.', cat: 'Leadership', test: s => s.resources.knowledge >= 90 },
    { name: 'Beloved Monarch', desc: 'Reach 95 Happiness.', cat: 'Leadership', test: s => s.resources.happiness >= 95 },
    { name: 'Faithful Shepherd', desc: 'Reach 85 Faith.', cat: 'Leadership', test: s => s.resources.faith >= 85 },
    { name: 'Centennial Throne', desc: 'Survive 50 turns.', cat: 'Leadership', test: s => s.stats.turnsPlayed >= 50 },
    { name: 'Imperial Majesty', desc: 'Ascend to Kingdom Level 6 (Great Kingdom).', cat: 'Legendary', test: s => s.level >= 6 },
    { name: 'Immortal Sovereign', desc: 'Achieve Immortal Empire status.', cat: 'Legendary', test: s => s.level >= 10 },
    { name: 'The Magistrate', desc: 'Hear 25 Court Petitions.', cat: 'Leadership', test: s => s.stats.casesHeard >= 25 },
    { name: 'Supreme Judge', desc: 'Hear 75 Court Petitions.', cat: 'Leadership', test: s => s.stats.casesHeard >= 75 },
    { name: 'Iron Will', desc: 'Survive a turn with any resource below 10.', cat: 'Secret', test: s => Object.values(s.resources).some(v => v < 10) },
    { name: 'Laughing Stocks', desc: 'Reject 10 petitions in a row.', cat: 'Humorous', test: s => s.stats.consecutiveRejects >= 10 },
    { name: 'Gilded Bread', desc: 'Have 90 Food and 90 Gold simultaneously.', cat: 'Economy', test: s => s.resources.food >= 90 && s.resources.gold >= 90 },
    { name: 'The Grand Architect', desc: 'Complete 5 major Kingdom Quests.', cat: 'Exploration', test: s => s.stats.questsCompleted >= 5 }
  ];

  for (let i = 1; i <= 100; i++) {
    const base = templates[(i - 1) % templates.length];
    list.push({
      id: `ach_${i}`,
      name: `${base.name} ${i > templates.length ? `Rank ${Math.floor(i / templates.length) + 1}` : ''}`,
      desc: base.desc,
      cat: cats[i % cats.length],
      unlocked: false,
      test: base.test
    });
  }
  return list;
}

// ==========================================
// 3. MAIN GAME STATE MANAGEMENT ENGINE
// ==========================================
class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.gameMode = 'story';
    this.year = 1;
    this.turn = 1;
    this.seasonIdx = 0;
    this.weatherIdx = 0;
    this.level = 1;
    this.xp = 0;

    this.ruler = {
      name: 'King Alden I',
      dynasty: 'House of the Iron Gate',
      archetype: 'Pragmatic Sovereign',
      generation: 1
    };

    this.resources = {
      gold: 50, military: 50, happiness: 50, reputation: 50,
      knowledge: 50, faith: 50, influence: 50, food: 50, population: 50
    };

    this.resourceHistory = {
      gold: [50], military: [50], happiness: [50], reputation: [50],
      knowledge: [50], faith: [50], influence: [50], food: [50], population: [50]
    };

    this.traits = {
      merciful: 5, greedy: 2, wise: 4, cruel: 1, diplomatic: 6,
      aggressive: 2, innovative: 4, traditional: 3, curious: 3, paranoid: 2
    };

    this.factions = {
      nobles: 50, merchants: 50, military: 50, mages: 50,
      church: 50, farmers: 50, explorers: 50, artisans: 50
    };

    this.advisors = [
      { role: 'Grand Chancellor', name: 'Lady Eleanor', skill: 'Diplomacy', loyalty: 80 },
      { role: 'High Marshal', name: 'Commander Brandon', skill: 'Tactics', loyalty: 75 },
      { role: 'Chief Treasurer', name: 'Master Corvus', skill: 'Commerce', loyalty: 65 },
      { role: 'Court Seer', name: 'Arch-Mystic Vesper', skill: 'Divination', loyalty: 70 }
    ];

    this.stats = {
      yearsRuled: 1, turnsPlayed: 1, casesHeard: 0,
      goldEarned: 50, goldSpent: 0, warsFought: 0,
      battlesWon: 0, battlesLost: 0, disastersSurvived: 0,
      consecutiveRejects: 0, questsCompleted: 0
    };

    this.timeline = [
      { year: 1, turn: 1, title: 'Coronation of the Iron Crown', desc: 'Inherited the fragile realm under stormy skies.', type: 'milestone' }
    ];

    this.delayedConsequences = [];
    this.courtDeck = generate100CourtCases();
    this.currentCaseIndex = 0;
    this.activeQuests = [
      { id: 'q_crown', title: 'Fortify the Iron Ramparts', desc: 'Raise Military and Artisans above 60 to withstand border skirmishes.', progress: 30, req: () => this.resources.military >= 60 && this.factions.artisans >= 60, reward: { gold: 15, reputation: 10 } },
      { id: 'q_granary', title: 'Great Harvest Reserves', desc: 'Stockpile 75 Food before severe winter sets in.', progress: 50, req: () => this.resources.food >= 75, reward: { happiness: 10, population: 5 } }
    ];
    this.completedQuests = [];
    this.achievements = generate100Achievements();
    this.badges = [
      { id: 'b_dragon', name: 'Dragon Slayer', desc: 'Repelled an ancient titan wyrm invasion.', unlocked: false },
      { id: 'b_diplomat', name: 'Master Diplomat', desc: 'Harmonized all factions above 75 loyalty.', unlocked: false },
      { id: 'b_king', name: 'People’s King', desc: 'Maintained 90+ Happiness for three full years.', unlocked: false },
      { id: 'b_merchant', name: 'Golden Merchant', desc: 'Accumulated max treasury gold.', unlocked: false },
      { id: 'b_architect', name: 'Architect of Destiny', desc: 'Evolved kingdom to Grand Empire.', unlocked: false },
      { id: 'b_knowledge', name: 'Keeper of Knowledge', desc: 'Acquired 10 forbidden relics in court.', unlocked: false }
    ];
  }
}

// ==========================================
// 4. UI RENDERER & INTERACTION CONTROLLER
// ==========================================
class GameUI {
  constructor(state, sound) {
    this.state = state;
    this.sound = sound;
    this.activeTab = 'court';
    this.initDOMElements();
    this.bindEvents();
    this.renderAll();
  }

  initDOMElements() {
    this.resContainer = document.getElementById('res-bar-container');
    this.courtGrid = document.getElementById('court-choices-grid');
    this.factionsContainer = document.getElementById('factions-container');
    this.advisorsContainer = document.getElementById('advisors-container');
    this.traitsContainer = document.getElementById('traits-container');
    this.questsSnapshot = document.getElementById('quests-snapshot');
    this.modal = document.getElementById('generic-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalContent = document.getElementById('modal-content');
  }

  bindEvents() {
    document.querySelectorAll('.btn-nav').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sound.playSfx('click');
        this.setActiveTab(btn.dataset.tab);
      });
    });

    document.getElementById('btn-next-turn').addEventListener('click', () => {
      this.advanceTurn();
    });

    document.getElementById('btn-modal-close').addEventListener('click', () => {
      this.closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toUpperCase();
      if (['1', '2', '3', '4', '5', '6'].includes(key)) {
        const idx = parseInt(key) - 1;
        const buttons = this.courtGrid.querySelectorAll('.choice-btn');
        if (buttons[idx]) buttons[idx].click();
      } else if (e.code === 'Space') {
        e.preventDefault();
        this.advanceTurn();
      } else if (key === 'C') {
        this.setActiveTab('court');
      } else if (key === 'Q') {
        this.openQuestsModal();
      } else if (key === 'T') {
        this.openTimelineModal();
      } else if (key === 'S') {
        this.openStatsModal();
      } else if (key === 'B') {
        this.openBadgesModal();
      } else if (key === 'F') {
        this.openFactionsModal();
      } else if (key === 'O') {
        this.openSettingsModal();
      } else if (key === 'ESCAPE') {
        this.closeModal();
      } else if (key === '?') {
        this.openHelpModal();
      }
    });
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.btn-nav').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    if (tab === 'court') this.closeModal();
    else if (tab === 'quests') this.openQuestsModal();
    else if (tab === 'factions') this.openFactionsModal();
    else if (tab === 'timeline') this.openTimelineModal();
    else if (tab === 'stats') this.openStatsModal();
    else if (tab === 'achievements') this.openBadgesModal();
    else if (tab === 'settings') this.openSettingsModal();
  }

  showToast(msg, type = 'normal') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = msg;
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  closeModal() {
    this.modal.classList.add('hidden');
    document.querySelectorAll('.btn-nav').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === 'court');
    });
  }

  openModal(title, contentHTML) {
    this.modalTitle.innerText = title;
    this.modalContent.innerHTML = contentHTML;
    this.modal.classList.remove('hidden');
  }

  renderAll() {
    this.renderHeader();
    this.renderResources();
    this.renderRulerInfo();
    this.renderFactions();
    this.renderCourtCard();
    this.renderQuestsSnapshot();
    this.checkAchievements();
  }

  renderHeader() {
    const season = SEASONS[this.state.seasonIdx];
    const weather = WEATHERS[this.state.weatherIdx];
    const tier = KINGDOM_LEVELS.find(l => l.level === this.state.level) || KINGDOM_LEVELS[0];
    document.getElementById('label-year').innerText = `Year ${this.state.year} (${season})`;
    document.getElementById('label-tier').innerText = tier.title;
    document.getElementById('label-weather').innerText = weather;
  }

  renderResources() {
    this.resContainer.innerHTML = '';
    RESOURCE_KEYS.forEach(key => {
      const meta = RESOURCE_META[key];
      const val = Math.max(0, Math.min(100, Math.round(this.state.resources[key])));
      let color = 'var(--primary)';
      if (val < 25) color = 'var(--danger)';
      else if (val > 75) color = 'var(--success)';

      const card = document.createElement('div');
      card.className = 'res-card';
      card.innerHTML = `
        <div class="res-header">
          <span class="res-title">
            <svg class="res-icon" viewBox="0 0 24 24" fill="currentColor">${meta.icon}</svg>
            ${meta.name}
          </span>
          <span class="res-val" style="color: ${color}">${val}</span>
        </div>
        <div class="res-bar-wrap">
          <div class="res-bar" style="width: ${val}%; background-color: ${color}"></div>
        </div>
      `;
      this.resContainer.appendChild(card);
    });
  }

  renderRulerInfo() {
    document.getElementById('ruler-name').innerText = this.state.ruler.name;
    document.getElementById('ruler-dynasty').innerText = this.state.ruler.dynasty;
    document.getElementById('ruler-archetype').innerText = this.state.ruler.archetype;
    document.getElementById('ruler-legacy-level').innerText = `Gen ${this.state.ruler.generation}`;

    document.getElementById('avatar-monarch').innerHTML = `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" fill="#1b1726"/>
        <circle cx="50" cy="45" r="24" fill="#deb887"/>
        <path d="M30 32 L50 14 L70 32 L62 30 L50 24 L38 30 Z" fill="#ffd700"/>
        <path d="M26 85 C26 65 74 65 74 85 Z" fill="#8e44ad"/>
        <circle cx="42" cy="44" r="3" fill="#2c3e50"/>
        <circle cx="58" cy="44" r="3" fill="#2c3e50"/>
        <path d="M46 54 Q50 58 54 54" stroke="#8b4513" stroke-width="2" fill="none"/>
      </svg>
    `;

    this.traitsContainer.innerHTML = '';
    Object.entries(this.state.traits).forEach(([trait, score]) => {
      if (score > 3) {
        const badge = document.createElement('span');
        badge.className = `trait-badge ${score > 6 ? 'active' : ''}`;
        badge.innerText = `${trait.charAt(0).toUpperCase() + trait.slice(1)} (${score})`;
        this.traitsContainer.appendChild(badge);
      }
    });

    this.advisorsContainer.innerHTML = '';
    this.state.advisors.forEach(adv => {
      const row = document.createElement('div');
      row.className = 'faction-row';
      row.innerHTML = `
        <div class="faction-meta">
          <div class="faction-meta-head">
            <span>${adv.name}</span>
            <span style="color: var(--primary);">${adv.skill}</span>
          </div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${adv.role} · Loyalty ${adv.loyalty}%</div>
        </div>
      `;
      this.advisorsContainer.appendChild(row);
    });
  }

  renderFactions() {
    this.factionsContainer.innerHTML = '';
    FACTIONS.forEach(f => {
      const val = Math.max(0, Math.min(100, Math.round(this.state.factions[f.id] || 50)));
      const row = document.createElement('div');
      row.className = 'faction-row';
      row.innerHTML = `
        <div class="faction-icon" style="background: ${f.color}; border-radius: 4px;"></div>
        <div class="faction-meta">
          <div class="faction-meta-head">
            <span>${f.name}</span>
            <span>${val}%</span>
          </div>
          <div class="faction-bar-bg">
            <div class="faction-bar-fill" style="width: ${val}%; background: ${f.color}"></div>
          </div>
        </div>
      `;
      this.factionsContainer.appendChild(row);
    });
  }

  renderQuestsSnapshot() {
    this.questsSnapshot.innerHTML = '';
    document.getElementById('quest-active-count').innerText = this.state.activeQuests.length;
    this.state.activeQuests.forEach(q => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="t-head">
          <strong>${q.title}</strong>
          <span>${q.progress}%</span>
        </div>
        <p style="font-size: 0.72rem; color: var(--text-muted);">${q.desc}</p>
      `;
      this.questsSnapshot.appendChild(item);
    });
  }

  renderCourtCard() {
    const c = this.state.courtDeck[this.state.currentCaseIndex % this.state.courtDeck.length];
    const faction = FACTIONS.find(f => f.id === c.factionId) || FACTIONS[0];

    document.getElementById('petitioner-name').innerText = c.petitioner;
    document.getElementById('petitioner-role').innerText = c.role;
    document.getElementById('petitioner-faction').innerText = faction.name;
    document.getElementById('case-title').innerText = c.title;
    document.getElementById('case-body').innerText = c.desc;
    document.getElementById('case-quote').innerText = c.quote;

    document.getElementById('petitioner-portrait').innerHTML = `
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <rect width="80" height="80" fill="#181520"/>
        <circle cx="40" cy="38" r="18" fill="#e0ac69"/>
        <path d="M22 75 C22 55 58 55 58 75 Z" fill="${faction.color}"/>
        <circle cx="34" cy="36" r="2.5" fill="#222"/>
        <circle cx="46" cy="36" r="2.5" fill="#222"/>
        <path d="M37 44 Q40 47 43 44" stroke="#5c3818" stroke-width="1.8" fill="none"/>
      </svg>
    `;

    this.courtGrid.innerHTML = '';
    c.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `
        <div class="choice-header">
          <span class="choice-type">${opt.type}</span>
          <span class="choice-key">[${idx + 1}]</span>
        </div>
        <div class="choice-text">${opt.text}</div>
        <div class="choice-preview">
          ${this.formatDeltas(opt.cost, 'neg')}
          ${this.formatDeltas(opt.gain, 'pos')}
        </div>
      `;
      btn.addEventListener('click', () => {
        this.handleCourtChoice(c, opt);
      });
      this.courtGrid.appendChild(btn);
    });
  }

  formatDeltas(deltas, type) {
    if (!deltas) return '';
    return Object.entries(deltas).map(([k, v]) => {
      const sign = v > 0 ? `+${v}` : v;
      return `<span class="tag-delta tag-${type}">${k.toUpperCase()}: ${sign}</span>`;
    }).join(' ');
  }

  handleCourtChoice(currentCase, option) {
    this.sound.playSfx(option.type === 'Approve' ? 'decree' : 'click');

    if (option.cost) {
      Object.entries(option.cost).forEach(([k, v]) => {
        if (this.state.resources[k] !== undefined) this.state.resources[k] += v;
        if (this.state.factions[k] !== undefined) this.state.factions[k] += v;
      });
    }
    if (option.gain) {
      Object.entries(option.gain).forEach(([k, v]) => {
        if (this.state.resources[k] !== undefined) this.state.resources[k] += v;
        if (this.state.factions[k] !== undefined) this.state.factions[k] += v;
      });
    }

    if (option.trait && this.state.traits[option.trait] !== undefined) {
      this.state.traits[option.trait] += 1;
    }

    this.state.stats.casesHeard++;
    if (option.type === 'Reject') this.state.stats.consecutiveRejects++;
    else this.state.stats.consecutiveRejects = 0;

    this.scheduleConsequence(currentCase, option);

    this.state.timeline.unshift({
      year: this.state.year,
      turn: this.state.turn,
      title: `${option.type}: ${currentCase.title}`,
      desc: `Decreed: "${option.text}".`,
      type: 'decree'
    });

    this.addXP(10);
    this.state.currentCaseIndex++;
    this.renderCourtCard();
    this.renderResources();
    this.renderFactions();
    this.renderRulerInfo();

    this.showToast(`Decree Enacted: <strong>${option.type}</strong>`, 'normal');
  }

  scheduleConsequence(currentCase, option) {
    const delayTurns = Math.floor(Math.random() * 4) + 2;
    const consequence = {
      turnsRemaining: delayTurns,
      title: `Echo of: ${currentCase.title}`,
      desc: `The crown's choice to '${option.type}' has matured into consequences across the provinces.`,
      effect: () => {
        const deltaGold = option.type === 'Approve' ? 6 : -4;
        this.state.resources.gold += deltaGold;
        this.state.resources.happiness += (option.type === 'Approve' ? 5 : -3);
        this.showToast(`Delayed Consequence: ${currentCase.title} manifested!`, 'legendary');
      }
    };
    this.state.delayedConsequences.push(consequence);
  }

  advanceTurn() {
    this.sound.playSfx('fanfare');
    this.state.turn++;
    this.state.stats.turnsPlayed++;

    this.state.seasonIdx = (this.state.seasonIdx + 1) % SEASONS.length;
    if (this.state.seasonIdx === 0) {
      this.state.year++;
      this.state.stats.yearsRuled++;
      this.showToast(`A new year dawns in the realm: Year ${this.state.year}`, 'legendary');
    }
    this.state.weatherIdx = Math.floor(Math.random() * WEATHERS.length);

    this.simulateWorldTick();

    for (let i = this.state.delayedConsequences.length - 1; i >= 0; i--) {
      const item = this.state.delayedConsequences[i];
      item.turnsRemaining--;
      if (item.turnsRemaining <= 0) {
        item.effect();
        this.state.delayedConsequences.splice(i, 1);
      }
    }

    this.checkQuests();

    RESOURCE_KEYS.forEach(k => {
      this.state.resourceHistory[k].push(this.state.resources[k]);
      if (this.state.resourceHistory[k].length > 25) this.state.resourceHistory[k].shift();
    });

    this.evaluateSurvival();
    this.renderAll();
  }

  simulateWorldTick() {
    const weather = WEATHERS[this.state.weatherIdx];
    if (weather.includes('Drought')) {
      this.state.resources.food -= 4;
      this.state.resources.happiness -= 2;
    } else if (weather.includes('Rain')) {
      this.state.resources.food += 3;
    }

    if (this.state.resources.food < 15) {
      this.state.resources.happiness -= 4;
      this.state.resources.population -= 2;
      this.showToast('Famine grips the lower villages!', 'bad');
    }

    if (this.state.factions.military < 20) this.state.resources.reputation -= 3;
    if (this.state.factions.church < 20) this.state.resources.faith -= 3;

    RESOURCE_KEYS.forEach(k => {
      this.state.resources[k] = Math.max(0, Math.min(100, this.state.resources[k]));
    });
    FACTIONS.forEach(f => {
      this.state.factions[f.id] = Math.max(0, Math.min(100, this.state.factions[f.id]));
    });
  }

  checkQuests() {
    for (let i = this.state.activeQuests.length - 1; i >= 0; i--) {
      const q = this.state.activeQuests[i];
      if (q.req && q.req()) {
        this.sound.playSfx('fanfare');
        this.showToast(`Quest Completed: <strong>${q.title}</strong>!`, 'legendary');
        if (q.reward) {
          Object.entries(q.reward).forEach(([k, v]) => {
            if (this.state.resources[k] !== undefined) this.state.resources[k] += v;
          });
        }
        this.state.completedQuests.push(q);
        this.state.activeQuests.splice(i, 1);
        this.state.stats.questsCompleted++;
        this.addXP(40);
      }
    }
  }

  checkAchievements() {
    this.state.achievements.forEach(ach => {
      if (!ach.unlocked && ach.test(this.state)) {
        ach.unlocked = true;
        this.sound.playSfx('fanfare');
        this.showToast(`🏆 Achievement Unlocked: <strong>${ach.name}</strong>!`, 'legendary');
      }
    });
  }

  addXP(val) {
    this.state.xp += val;
    const nextLevel = KINGDOM_LEVELS.find(l => l.level === this.state.level + 1);
    if (nextLevel && this.state.xp >= nextLevel.xpReq) {
      this.state.level++;
      this.sound.playSfx('fanfare');
      this.showToast(`Crown Ascended! The realm is now a <strong>${nextLevel.title}</strong>!`, 'legendary');
      this.state.timeline.unshift({
        year: this.state.year,
        turn: this.state.turn,
        title: `Ascension to ${nextLevel.title}`,
        desc: `The realm’s borders expanded under wise administrative dominion.`,
        type: 'milestone'
      });
    }
  }

  evaluateSurvival() {
    if (this.state.resources.happiness <= 0) {
      this.triggerGameOver('Peasant Revolution', 'The populace stormed the palace gates and shattered the Iron Crown.');
    } else if (this.state.resources.military <= 0) {
      this.triggerGameOver('Foreign Annexation', 'Barbaric legion banners fly over the battlements unchallenged.');
    } else if (this.state.resources.gold <= 0 && this.state.resources.food <= 0) {
      this.triggerGameOver('Total Collapse', 'Bankrupt and starved, the lords abandoned the kingdom to ruin.');
    }
  }

  triggerGameOver(title, reason) {
    this.sound.playSfx('doom');
    const modalBody = `
      <div style="text-align: center; padding: 20px;">
        <h2 style="color: var(--danger); font-size: 1.8rem; margin-bottom: 10px;">${title}</h2>
        <p style="font-size: 1rem; margin-bottom: 20px;">${reason}</p>
        <div style="background: var(--bg-card); padding: 16px; border-radius: 6px; margin-bottom: 20px; text-align: left;">
          <p><strong>Years Ruled:</strong> ${this.state.stats.yearsRuled}</p>
          <p><strong>Total Petitions Heard:</strong> ${this.state.stats.casesHeard}</p>
          <p><strong>Highest Kingdom Tier:</strong> ${KINGDOM_LEVELS.find(l => l.level === this.state.level).title}</p>
          <p><strong>Dynasty:</strong> ${this.state.ruler.dynasty}</p>
        </div>
        <button class="btn-action" id="btn-restart-game" style="font-size: 1.1rem; padding: 12px 24px;">Crown a New Heir</button>
      </div>
    `;
    this.openModal('The Fall of the Crown', modalBody);
    document.getElementById('btn-restart-game').addEventListener('click', () => {
      this.state.reset();
      this.closeModal();
      this.renderAll();
    });
  }

  openTimelineModal() {
    let itemsHtml = this.state.timeline.map(t => `
      <div class="timeline-item ${t.type}">
        <div class="t-head">
          <strong>${t.title}</strong>
          <span>Year ${t.year} (Turn ${t.turn})</span>
        </div>
        <p>${t.desc}</p>
      </div>
    `).join('');

    this.openModal('Interactive Kingdom Timeline', `
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">
        A historical ledger of imperial decrees, wars, discoveries, and milestones.
      </p>
      <div class="timeline-feed" style="max-height: 500px;">${itemsHtml}</div>
    `);
  }

  openStatsModal() {
    const body = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 16px;">
        <div class="faction-row"><div class="faction-meta"><span>Years Ruled</span><h3>${this.state.stats.yearsRuled}</h3></div></div>
        <div class="faction-row"><div class="faction-meta"><span>Turns Played</span><h3>${this.state.stats.turnsPlayed}</h3></div></div>
        <div class="faction-row"><div class="faction-meta"><span>Cases Resolved</span><h3>${this.state.stats.casesHeard}</h3></div></div>
        <div class="faction-row"><div class="faction-meta"><span>Quests Finished</span><h3>${this.state.stats.questsCompleted}</h3></div></div>
      </div>
      <h3 style="color: var(--primary); margin-bottom: 6px;">Resource Fluctuation (Historical Trajectory)</h3>
      <div class="canvas-wrap">
        <canvas id="stats-chart"></canvas>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <button class="btn-sec" id="btn-export-json">Export Save (JSON)</button>
        <button class="btn-sec" id="btn-export-txt">Export Chronicle (TXT)</button>
        <button class="btn-sec" id="btn-export-html">Export Royal Dossier (HTML)</button>
      </div>
    `;
    this.openModal('Imperial Statistics & Trajectory', body);
    this.drawStatsCanvas();

    document.getElementById('btn-export-json').addEventListener('click', () => this.exportData('json'));
    document.getElementById('btn-export-txt').addEventListener('click', () => this.exportData('txt'));
    document.getElementById('btn-export-html').addEventListener('click', () => this.exportData('html'));
  }

  drawStatsCanvas() {
    const canvas = document.getElementById('stats-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = '#2d293d';
    ctx.lineWidth = 1;
    for (let y = 20; y < rect.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(rect.width - 10, y);
      ctx.stroke();
    }

    const colors = { gold: '#ffd700', military: '#cf4a4a', happiness: '#2ecc71', knowledge: '#3ba4e6' };
    ['gold', 'military', 'happiness', 'knowledge'].forEach(key => {
      const arr = this.state.resourceHistory[key];
      if (!arr || arr.length < 2) return;
      ctx.strokeStyle = colors[key];
      ctx.lineWidth = 2;
      ctx.beginPath();
      const stepX = (rect.width - 50) / (arr.length - 1);
      arr.forEach((val, idx) => {
        const x = 35 + idx * stepX;
        const y = rect.height - 20 - (val / 100) * (rect.height - 40);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  openBadgesModal() {
    let badgesHtml = this.state.badges.map(b => `
      <div class="achieve-card ${b.unlocked ? 'unlocked' : ''}">
        <div class="achieve-icon">🏅</div>
        <div class="achieve-meta">
          <h4>${b.name}</h4>
          <p>${b.desc}</p>
        </div>
      </div>
    `).join('');

    let achieveHtml = this.state.achievements.map(a => `
      <div class="achieve-card ${a.unlocked ? 'unlocked' : ''}">
        <div class="achieve-icon">🏆</div>
        <div class="achieve-meta">
          <h4>${a.name}</h4>
          <p>${a.desc}</p>
          <span style="font-size: 0.65rem; color: var(--primary);">${a.cat}</span>
        </div>
      </div>
    `).join('');

    this.openModal('Imperial Hall of Deeds & Badges', `
      <h3 style="color: var(--primary); margin-bottom: 8px;">Collectible Badges</h3>
      <div class="grid-achievements" style="margin-bottom: 16px;">${badgesHtml}</div>
      <h3 style="color: var(--primary); margin-bottom: 8px;">Kingdom Achievements (100)</h3>
      <div class="grid-achievements" style="max-height: 380px; overflow-y: auto;">${achieveHtml}</div>
    `);
  }

  openQuestsModal() {
    let questsHtml = this.state.activeQuests.map(q => `
      <div class="court-card" style="margin-bottom: 10px;">
        <h3>${q.title}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${q.desc}</p>
        <div class="res-bar-wrap" style="margin-top: 8px;">
          <div class="res-bar" style="width: ${q.progress}%;"></div>
        </div>
      </div>
    `).join('');

    this.openModal('Crown Objectives & Grand Quests', `
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">Fulfill royal ambitions to stabilize the realm and harvest sovereign prestige.</p>
      ${questsHtml || '<p>All active quests fulfilled. Awaiting frontier envoys...</p>'}
    `);
  }

  openFactionsModal() {
    let factionsHtml = FACTIONS.map(f => {
      const val = this.state.factions[f.id] || 50;
      return `
        <div class="faction-row" style="padding: 12px;">
          <div class="faction-icon" style="background: ${f.color}; width: 36px; height: 36px; border-radius: 6px;"></div>
          <div class="faction-meta">
            <div class="faction-meta-head">
              <strong style="font-size: 0.95rem;">${f.name}</strong>
              <span style="color: var(--primary);">${val}% Allegiance</span>
            </div>
            <p style="font-size: 0.78rem; color: var(--text-muted);">${f.desc} Leader: ${f.leader}</p>
          </div>
        </div>
      `;
    }).join('');

    this.openModal('Factions of the Iron Realm', `
      <div class="faction-list">${factionsHtml}</div>
    `);
  }

  openHelpModal() {
    this.openModal('How to Play & Kingdom Guide', `
      <div style="font-size: 0.9rem; line-height: 1.6;">
        <h4 style="color: var(--primary);">Rules of Sovereignty</h4>
        <p>1. Every choice in court has immediate and delayed consequences. Gold, food, and military upkeep sustain your citizens.</p>
        <p>2. Keep resources balanced between 0 and 100. If any vital resource hits zero, your kingdom risks violent collapse.</p>
        <p>3. Competing factions demand respect. Favoring one often antagonizes its rivals.</p>
        <p>4. Advance kingdom tiers from Village to Immortal Empire by ruling justly, solving quests, and cultivating prestige.</p>
      </div>
    `);
  }

  openSettingsModal() {
    const body = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label><strong>Visual Theme:</strong></label>
          <select id="select-theme" class="btn-sec" style="width: 100%; margin-top: 4px;">
            <option value="default">Royal Dark (Default)</option>
            <option value="golden">Golden Throne</option>
            <option value="emerald">Emerald Kingdom</option>
            <option value="crimson">Crimson Empire</option>
            <option value="midnight">Midnight Realm</option>
            <option value="parchment">Ancient Parchment</option>
            <option value="arcane">Arcane Magic</option>
          </select>
        </div>
        <div>
          <label><strong>Accessibility:</strong></label>
          <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
            <button class="btn-sec" id="btn-toggle-contrast">Toggle High Contrast</button>
            <button class="btn-sec" id="btn-toggle-text">Toggle Large Text</button>
            <button class="btn-sec" id="btn-toggle-motion">Toggle Reduced Motion</button>
          </div>
        </div>
        <div>
          <label><strong>Audio Synthesizer:</strong></label>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            <button class="btn-sec" id="btn-mute-audio">${this.sound.muted ? 'Unmute Audio' : 'Mute Audio'}</button>
            <button class="btn-sec" id="btn-theme-royal">Play Royal Theme</button>
            <button class="btn-sec" id="btn-theme-battle">Play Battle Theme</button>
          </div>
        </div>
        <div>
          <label><strong>Import Save State (JSON):</strong></label>
          <input type="file" id="import-json-file" class="btn-sec" style="width: 100%; margin-top: 4px;" accept=".json">
        </div>
      </div>
    `;
    this.openModal('Kingdom Configurations & Settings', body);

    document.getElementById('select-theme').addEventListener('change', (e) => {
      document.body.setAttribute('data-theme', e.target.value);
    });
    document.getElementById('btn-toggle-contrast').addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
    });
    document.getElementById('btn-toggle-text').addEventListener('click', () => {
      document.body.classList.toggle('large-text');
    });
    document.getElementById('btn-toggle-motion').addEventListener('click', () => {
      document.body.classList.toggle('reduced-motion');
    });
    document.getElementById('btn-mute-audio').addEventListener('click', (e) => {
      this.sound.muted = !this.sound.muted;
      e.target.innerText = this.sound.muted ? 'Unmute Audio' : 'Mute Audio';
    });
    document.getElementById('btn-theme-royal').addEventListener('click', () => {
      this.sound.startAmbientTheme('royal');
    });
    document.getElementById('btn-theme-battle').addEventListener('click', () => {
      this.sound.startAmbientTheme('battle');
    });
    document.getElementById('import-json-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          Object.assign(this.state, data);
          this.renderAll();
          this.showToast('Save file loaded successfully!', 'legendary');
          this.closeModal();
        } catch (err) {
          this.showToast('Invalid JSON save file.', 'bad');
        }
      };
      reader.readAsText(file);
    });
  }

  exportData(format) {
    let dataStr = '';
    let filename = `Echoes_Iron_Crown_Year_${this.state.year}`;

    if (format === 'json') {
      dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
      filename += '.json';
    } else if (format === 'txt') {
      const txtContent = `ECHOES OF THE IRON CROWN - CHRONICLE\n`
        + `Ruler: ${this.state.ruler.name} (${this.state.ruler.dynasty})\n`
        + `Reign: Year ${this.state.year}, Turns: ${this.state.stats.turnsPlayed}\n`
        + `Decrees Enacted: ${this.state.stats.casesHeard}\n\n`
        + `CHRONICLE OF EVENTS:\n`
        + this.state.timeline.map(t => `[Year ${t.year}] ${t.title}: ${t.desc}`).join('\n');
      dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(txtContent);
      filename += '.txt';
    } else if (format === 'html') {
      const htmlDoc = `<!DOCTYPE html><html><head><title>Chronicle Dossier</title></head><body><h1>Kingdom of the Iron Crown</h1><p>Ruler: ${this.state.ruler.name}</p><p>Year: ${this.state.year}</p></body></html>`;
      dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(htmlDoc);
      filename += '.html';
    }

    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", filename);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }
}

// ==========================================
// 5. BOOTSTRAPPER & SERVICE WORKER LIFECYCLE
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const audio = new SoundEngine();
  const state = new GameState();
  window.game = new GameUI(state, audio);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Iron Crown PWA Service Worker Registered', reg))
      .catch(err => console.error('PWA Registration Failed', err));
  }
});

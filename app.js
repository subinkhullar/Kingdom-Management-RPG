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
      /* Audio error handled safely */
    }
  }

  playSfx(name) {
    if (this.muted) return;
    switch (name) {
      case 'click':
        this.playTone(850, 'triangle', 0.04, 0.1);
        break;
      case 'decree':
        this.playTone(261.63, 'square', 0.16, 0.2);
        setTimeout(() => this.playTone(329.63, 'square', 0.22, 0.22), 80);
        break;
      case 'fanfare':
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'triangle', 0.28, 0.25), idx * 100);
        });
        break;
      case 'doom':
        [150, 142, 134, 110].forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 'sawtooth', 0.4, 0.3), idx * 120);
        });
        break;
      case 'gold':
        this.playTone(987.77, 'sine', 0.08, 0.16);
        setTimeout(() => this.playTone(1318.51, 'sine', 0.14, 0.18), 50);
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
      gain.gain.linearRampToValueAtTime(0.035 * this.musicVolume * this.masterVolume, this.ctx.currentTime + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.4);
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
  gold: { name: 'Gold', symbol: '💰' },
  military: { name: 'Military', symbol: '⚔️' },
  happiness: { name: 'Happiness', symbol: '😊' },
  reputation: { name: 'Reputation', symbol: '⭐' },
  knowledge: { name: 'Knowledge', symbol: '📚' },
  faith: { name: 'Faith', symbol: '🕊️' },
  influence: { name: 'Influence', symbol: '🏛️' },
  food: { name: 'Food', symbol: '🌾' },
  population: { name: 'Population', symbol: '👥' }
};

const FACTIONS = [
  { id: 'nobles', name: 'High Nobles', leader: 'Duke Gerald', symbol: '👑', color: '#8e44ad', desc: 'Hold ancient land deeds and baronies.' },
  { id: 'merchants', name: 'Merchants Guild', leader: 'Guildmaster Vance', symbol: '⚖️', color: '#f39c12', desc: 'Control sea ports and market trade.' },
  { id: 'military', name: 'Royal Legion', leader: 'General Valerius', symbol: '🛡️', color: '#c0392b', desc: 'Guard kingdom borders and forts.' },
  { id: 'mages', name: 'Arcane Conclave', leader: 'Archmage Solas', symbol: '🔮', color: '#9b59b6', desc: 'Keepers of ancient primal spells.' },
  { id: 'church', name: 'Grand Orthodoxy', leader: 'Patriarch Clemens', symbol: '✝️', color: '#f1c40f', desc: 'Keepers of ancestral faith and rites.' },
  { id: 'farmers', name: 'Common Folk', leader: 'Miller Tobias', symbol: '🌾', color: '#27ae60', desc: 'Cultivate grain silos and quarries.' },
  { id: 'explorers', name: 'Pathfinders', leader: 'Captain Astrid', symbol: '🧭', color: '#16a085', desc: 'Chart uncharted wilderlands.' },
  { id: 'artisans', name: 'Craft Guilds', leader: 'Smith Brann', symbol: '🔨', color: '#d35400', desc: 'Architects, smiths and masons.' }
];

const KINGDOM_LEVELS = [
  { level: 1, title: 'Village Realm', xpReq: 0 },
  { level: 2, title: 'Settlement Barony', xpReq: 25 },
  { level: 3, title: 'Provincial Town', xpReq: 60 },
  { level: 4, title: 'Royal City', xpReq: 110 },
  { level: 5, title: 'Sovereign Kingdom', xpReq: 180 },
  { level: 6, title: 'Great Kingdom', xpReq: 270 },
  { level: 7, title: 'Imperial Domain', xpReq: 390 },
  { level: 8, title: 'Grand Empire', xpReq: 540 },
  { level: 9, title: 'Legendary Empire', xpReq: 720 },
  { level: 10, title: 'Immortal Empire', xpReq: 1000 }
];

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const WEATHERS = [
  { name: 'Sunny', icon: '☀️' },
  { name: 'Rain', icon: '🌧️' },
  { name: 'Thunderstorm', icon: '⛈️' },
  { name: 'Snow', icon: '❄️' },
  { name: 'Mist', icon: '🌫️' },
  { name: 'Drought', icon: '🔥' }
];

function generate100CourtCases() {
  const topics = [
    { f: 'farmers', t: 'Grain Silo Dispute', body: 'The lower valley harvests produced a surplus, but river tax collectors demand half before storage.', emblem: '🌾', urgency: 'Civic Petition' },
    { f: 'merchants', t: 'Spice Tariff Petition', body: 'Foreign caravanners seek exempt duties on precious healing tea and cloth dyes.', emblem: '⚖️', urgency: 'Commerce Decree' },
    { f: 'military', t: 'Frontier Bastion Repairs', body: 'The Northern Keep faces winter collapse; stone and soldier wages are urgently requested.', emblem: '🛡️', urgency: 'Defense Appeal' },
    { f: 'mages', t: 'Leyline Catacomb Pulse', body: 'Luminous spectral lights have emerged beneath the royal library catacombs.', emblem: '🔮', urgency: 'Arcane Incident' },
    { f: 'church', t: 'Crypt Sanctuary Inquest', body: 'Inquisitors demand authority to inspect apothecaries suspected of unapproved rituals.', emblem: '✝️', urgency: 'Religious Plea' },
    { f: 'artisans', t: 'Smith Monopoly Charter', body: 'The Guild of Forgers requests wandering unchartered tinkers be banned from city squares.', emblem: '🔨', urgency: 'Guild Dispute' },
    { f: 'explorers', t: 'Sunken Flagship Vault', body: 'Divers discovered a gold-laden royal frigate lost during the War of Cinders.', emblem: '🧭', urgency: 'Expedition' },
    { f: 'nobles', t: 'Crown Forest Poaching', body: 'A starving woodland hamlet culled imperial deer; the local baron demands public hangings.', emblem: '👑', urgency: 'High Treason' },
    { f: 'merchants', t: 'Clipped Coin Epidemic', body: 'Counterfeit copper-core coins are circulating in tavern ports, inflating bread prices.', emblem: '⚖️', urgency: 'Currency Crisis' },
    { f: 'military', t: 'Legion Veteran Pensions', body: 'Retirees who held the mountain pass seek arable homestead parcels in the south.', emblem: '🛡️', urgency: 'Veterans Appeal' },
    { f: 'farmers', t: 'Locust Swarm Approach', body: 'Southern swarms threaten autumn granaries; peasants request pitch to scorch ditches.', emblem: '🌾', urgency: 'Blight Threat' },
    { f: 'mages', t: 'Relic of the Sunken God', body: 'An antiquarian brought a glowing obsidian idol to market that whispers at midnight.', emblem: '🔮', urgency: 'Relic Trial' },
    { f: 'church', t: 'The Moon-Weaver Heresy', body: 'Hill hamlets have erected lunar totems, claiming traditional rites fail to bring rain.', emblem: '✝️', urgency: 'Faith Crisis' },
    { f: 'artisans', t: 'Great Clockwork Chime', body: 'Artisans propose casting a grand bell tower to regulate marketplace trading hours.', emblem: '🔨', urgency: 'Civic Project' },
    { f: 'nobles', t: 'Inheritance Feud', body: 'Two noble cousins have gathered retinues over the titles of the Western Orchards.', emblem: '👑', urgency: 'Feudal Dispute' },
    { f: 'explorers', t: 'Forgotten Tunnel Gate', body: 'Cartographers unearthed a stone door behind the mountain ridge bearing ancient runes.', emblem: '🧭', urgency: 'Frontier Find' }
  ];

  const cases = [];
  for (let i = 1; i <= 100; i++) {
    const base = topics[(i - 1) % topics.length];
    const faction = FACTIONS.find(f => f.id === base.f) || FACTIONS[0];
    cases.push({
      id: `case_${i}`,
      title: `${base.t} #${i}`,
      factionId: faction.id,
      emblem: base.emblem,
      urgency: base.urgency,
      petitioner: `${faction.leader}'s Envoy`,
      role: `${faction.name} Legate`,
      desc: `${base.body} The crown's ruling here will set binding precedent throughout the realm.`,
      quote: `"Sire, the crown is the pillar upon which stability balances."`,
      options: [
        { type: 'Approve', icon: '✅', text: 'Grant petition in full', cost: { gold: -6, food: -4 }, gain: { happiness: +7, [faction.id]: +12 }, trait: 'merciful' },
        { type: 'Reject', icon: '❌', text: 'Deny by sovereign decree', cost: { happiness: -5, [faction.id]: -10 }, gain: { gold: +8, military: +4 }, trait: 'cruel' },
        { type: 'Investigate', icon: '🔍', text: 'Send magistrate scouts', cost: { gold: -3 }, gain: { knowledge: +8, reputation: +4 }, trait: 'wise' },
        { type: 'Compromise', icon: '🤝', text: 'Enforce split concession', cost: { gold: -2 }, gain: { reputation: +6, [faction.id]: +4 }, trait: 'diplomatic' },
        { type: 'Delay', icon: '⏳', text: 'Shelve decision for next season', cost: { reputation: -4 }, gain: { gold: +2 }, trait: 'paranoid' },
        { type: 'Delegate', icon: '📜', text: 'Refer resolution to regional guild', cost: { influence: -5 }, gain: { happiness: +4, [faction.id]: +6 }, trait: 'traditional' }
      ]
    });
  }
  return cases;
}

function generate100Achievements() {
  const cats = ['Exploration', 'Economy', 'Military', 'Diplomacy', 'Leadership', 'Legendary', 'Secret', 'Humorous'];
  const list = [];
  const templates = [
    { name: 'First Coin', desc: 'Hold more than 60 Gold.', cat: 'Economy', test: s => s.resources.gold >= 60 },
    { name: 'Gilded Vault', desc: 'Amass 95 Gold.', cat: 'Economy', test: s => s.resources.gold >= 95 },
    { name: 'Iron Phalanx', desc: 'Raise Military strength to 85.', cat: 'Military', test: s => s.resources.military >= 85 },
    { name: 'Grand Harmonizer', desc: 'Keep all faction loyalties above 50.', cat: 'Diplomacy', test: s => Object.values(s.factions).every(v => v >= 50) },
    { name: 'Scholar King', desc: 'Reach 90 Knowledge.', cat: 'Leadership', test: s => s.resources.knowledge >= 90 },
    { name: 'Beloved Sovereign', desc: 'Reach 95 Happiness.', cat: 'Leadership', test: s => s.resources.happiness >= 95 },
    { name: 'Devout Pillar', desc: 'Reach 85 Faith.', cat: 'Leadership', test: s => s.resources.faith >= 85 },
    { name: 'Centennial Reign', desc: 'Survive 50 sovereign turns.', cat: 'Leadership', test: s => s.stats.turnsPlayed >= 50 },
    { name: 'Great Kingdom', desc: 'Ascend to Kingdom Level 6.', cat: 'Legendary', test: s => s.level >= 6 },
    { name: 'Immortal Empire', desc: 'Achieve Kingdom Level 10.', cat: 'Legendary', test: s => s.level >= 10 },
    { name: 'Royal Magistrate', desc: 'Resolve 25 Court Petitions.', cat: 'Leadership', test: s => s.stats.casesHeard >= 25 },
    { name: 'Supreme Arbiter', desc: 'Resolve 75 Court Petitions.', cat: 'Leadership', test: s => s.stats.casesHeard >= 75 },
    { name: 'Edge of Ruin', desc: 'Survive a turn with any resource below 10.', cat: 'Secret', test: s => Object.values(s.resources).some(v => v < 10) },
    { name: 'The Stone Heart', desc: 'Reject 10 petitions in sequence.', cat: 'Humorous', test: s => s.stats.consecutiveRejects >= 10 },
    { name: 'Bountiful Harvest', desc: 'Hold 85 Food and 85 Gold simultaneously.', cat: 'Economy', test: s => s.resources.food >= 85 && s.resources.gold >= 85 },
    { name: 'Crown Architect', desc: 'Complete 5 major Kingdom Quests.', cat: 'Exploration', test: s => s.stats.questsCompleted >= 5 }
  ];

  for (let i = 1; i <= 100; i++) {
    const base = templates[(i - 1) % templates.length];
    list.push({
      id: `ach_${i}`,
      name: `${base.name} ${i > templates.length ? `II` : ''}`,
      desc: base.desc,
      cat: cats[i % cats.length],
      unlocked: false,
      test: base.test
    });
  }
  return list;
}

// ==========================================
// 3. MAIN GAME STATE ENGINE
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
      { role: 'Grand Chancellor', name: 'Lady Eleanor', emblem: '📜', skill: 'Diplomacy', loyalty: 80 },
      { role: 'High Marshal', name: 'Commander Brandon', emblem: '🛡️', skill: 'Tactics', loyalty: 75 },
      { role: 'Chief Treasurer', name: 'Master Corvus', emblem: '⚖️', skill: 'Commerce', loyalty: 65 },
      { role: 'Court Seer', name: 'Arch-Mystic Vesper', emblem: '🔮', skill: 'Divination', loyalty: 70 }
    ];

    this.stats = {
      yearsRuled: 1, turnsPlayed: 1, casesHeard: 0,
      goldEarned: 50, goldSpent: 0, warsFought: 0,
      battlesWon: 0, battlesLost: 0, disastersSurvived: 0,
      consecutiveRejects: 0, questsCompleted: 0
    };

    this.timeline = [
      { year: 1, turn: 1, title: 'Coronation of the Iron Crown', desc: 'Ascended the throne amid murmurs of famine and border unrest.', type: 'milestone' }
    ];

    this.delayedConsequences = [];
    this.courtDeck = generate100CourtCases();
    this.currentCaseIndex = 0;
    this.activeQuests = [
      { id: 'q_crown', title: 'Fortify Realm Borders', desc: 'Raise Military and Artisans above 60 to deter frontier raids.', progress: 30, req: () => this.resources.military >= 60 && this.factions.artisans >= 60, reward: { gold: 15, reputation: 10 } },
      { id: 'q_granary', title: 'Winter Granary Stockpile', desc: 'Secure 75 Food before severe winter frosts.', progress: 50, req: () => this.resources.food >= 75, reward: { happiness: 10, population: 5 } }
    ];
    this.completedQuests = [];
    this.achievements = generate100Achievements();
    this.badges = [
      { id: 'b_dragon', name: 'Dragon Slayer', symbol: '🐉', desc: 'Repelled an ancient titan wyrm invasion.', unlocked: false },
      { id: 'b_diplomat', name: 'Master Diplomat', symbol: '🕊️', desc: 'Harmonized all factions above 75 allegiance.', unlocked: false },
      { id: 'b_king', name: 'People’s King', symbol: '👑', desc: 'Maintained 90+ Happiness for three full seasons.', unlocked: false },
      { id: 'b_merchant', name: 'Golden Merchant', symbol: '💰', desc: 'Accumulated max royal treasury reserves.', unlocked: false },
      { id: 'b_architect', name: 'Architect of Destiny', symbol: '🏛️', desc: 'Elevated kingdom to Imperial Domain.', unlocked: false },
      { id: 'b_knowledge', name: 'Keeper of Knowledge', symbol: '📚', desc: 'Acquired 10 ancient relics in council.', unlocked: false }
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
      } else if (key === 'F') {
        this.openFactionsModal();
      } else if (key === 'T') {
        this.openTimelineModal();
      } else if (key === 'S') {
        this.openStatsModal();
      } else if (key === 'B') {
        this.openBadgesModal();
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
      setTimeout(() => toast.remove(), 250);
    }, 3200);
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
    document.getElementById('label-weather-icon').innerText = weather.icon;
    document.getElementById('label-weather').innerText = weather.name;
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
            <span class="res-icon">${meta.symbol}</span>
            <span>${meta.name}</span>
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

    // Traits Container
    this.traitsContainer.innerHTML = '';
    Object.entries(this.state.traits).forEach(([trait, score]) => {
      if (score > 3) {
        const badge = document.createElement('span');
        badge.className = `trait-badge ${score > 6 ? 'active' : ''}`;
        badge.innerText = `${trait.charAt(0).toUpperCase() + trait.slice(1)} ${score}`;
        this.traitsContainer.appendChild(badge);
      }
    });

    // Advisors Stack with symbols
    this.advisorsContainer.innerHTML = '';
    this.state.advisors.forEach(adv => {
      const row = document.createElement('div');
      row.className = 'advisor-card';
      row.innerHTML = `
        <span class="advisor-emblem">${adv.emblem}</span>
        <div class="advisor-meta">
          <div class="advisor-name-row">
            <span>${adv.name}</span>
            <span style="color: var(--primary);">${adv.skill}</span>
          </div>
          <div class="advisor-role">${adv.role} · ${adv.loyalty}% Trust</div>
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
        <span class="faction-emblem">${f.symbol}</span>
        <div class="faction-meta">
          <div class="faction-meta-head">
            <span>${f.name}</span>
            <span style="color: ${f.color}; font-weight: 700;">${val}%</span>
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
    document.getElementById('quest-active-count').innerText = `${this.state.activeQuests.length} Active`;
    this.state.activeQuests.forEach(q => {
      const item = document.createElement('div');
      item.className = 'quest-card';
      item.innerHTML = `
        <div class="quest-head">
          <span>${q.title}</span>
          <span>${q.progress}%</span>
        </div>
        <p class="quest-desc">${q.desc}</p>
        <div class="quest-bar-bg">
          <div class="quest-bar-fill" style="width: ${q.progress}%;"></div>
        </div>
      `;
      this.questsSnapshot.appendChild(item);
    });
  }

  getAdvisorWhisper(c) {
    const adv = this.state.advisors[this.state.turn % this.state.advisors.length];
    if (c.factionId === 'merchants') return `${adv.name} counsels: "Coin fuels our vaults, but starvation stirs rebellion in the streets."`;
    if (c.factionId === 'military') return `${adv.name} cautions: "Keep our garrisons supplied; weak shields invite foreign covetousness."`;
    if (c.factionId === 'farmers') return `${adv.name} whispers: "Granaries are the bedrock of peace. Never ignore the plowmen."`;
    if (c.factionId === 'mages') return `${adv.name} warns: "Old relics bring power, but curiosity unbinds ancient horrors."`;
    return `${adv.name} advises: "A balanced decree today averts bloodshed tomorrow, Your Majesty."`;
  }

  renderCourtCard() {
    const c = this.state.courtDeck[this.state.currentCaseIndex % this.state.courtDeck.length];
    const faction = FACTIONS.find(f => f.id === c.factionId) || FACTIONS[0];

    document.getElementById('petitioner-portrait').innerText = c.emblem || faction.symbol;
    document.getElementById('petitioner-name').innerText = c.petitioner;
    document.getElementById('petitioner-role').innerText = c.role;
    document.getElementById('petitioner-faction').innerText = faction.name;
    document.getElementById('case-title').innerText = c.title;
    document.getElementById('case-urgency-tag').innerText = c.urgency || 'Council Petition';
    document.getElementById('case-body').innerText = c.desc;
    document.getElementById('case-quote').innerText = c.quote;
    document.getElementById('advisor-advice-text').innerText = this.getAdvisorWhisper(c);

    // 6 Choices Action Grid
    this.courtGrid.innerHTML = '';
    c.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `
        <div class="choice-header">
          <span class="choice-type">
            <span>${opt.icon}</span> ${opt.type}
          </span>
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
      const sym = RESOURCE_META[k] ? RESOURCE_META[k].symbol : '🛡️';
      const sign = v > 0 ? `+${v}` : v;
      return `<span class="tag-delta tag-${type}">${sym} ${sign}</span>`;
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
      desc: `The crown's decree to '${option.type}' has matured into consequences across the provinces.`,
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
      this.showToast(`A new sovereign year begins: Year ${this.state.year}`, 'legendary');
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
    if (weather.name === 'Drought') {
      this.state.resources.food -= 4;
      this.state.resources.happiness -= 2;
    } else if (weather.name === 'Rain') {
      this.state.resources.food += 3;
    }

    if (this.state.resources.food < 15) {
      this.state.resources.happiness -= 4;
      this.state.resources.population -= 2;
      this.showToast('Famine stalks the outlying settlements!', 'bad');
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
        this.showToast(`Quest Fulfilled: <strong>${q.title}</strong>!`, 'legendary');
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
        this.showToast(`🏆 Deed Unlocked: <strong>${ach.name}</strong>!`, 'legendary');
      }
    });
  }

  addXP(val) {
    this.state.xp += val;
    const nextLevel = KINGDOM_LEVELS.find(l => l.level === this.state.level + 1);
    if (nextLevel && this.state.xp >= nextLevel.xpReq) {
      this.state.level++;
      this.sound.playSfx('fanfare');
      this.showToast(`Crown Ascended to <strong>${nextLevel.title}</strong>!`, 'legendary');
      this.state.timeline.unshift({
        year: this.state.year,
        turn: this.state.turn,
        title: `Ascension to ${nextLevel.title}`,
        desc: `The realm expanded under majestic administrative sovereignty.`,
        type: 'milestone'
      });
    }
  }

  evaluateSurvival() {
    if (this.state.resources.happiness <= 0) {
      this.triggerGameOver('Peasant Revolution', 'The populace stormed the throne room and broke the Iron Crown.');
    } else if (this.state.resources.military <= 0) {
      this.triggerGameOver('Foreign Incursion', 'Hostile legions breached the gates and deposed your dynasty.');
    } else if (this.state.resources.gold <= 0 && this.state.resources.food <= 0) {
      this.triggerGameOver('Total Collapse', 'Bankrupt and starved, the lords abandoned the kingdom to ruin.');
    }
  }

  triggerGameOver(title, reason) {
    this.sound.playSfx('doom');
    const modalBody = `
      <div style="text-align: center; padding: 14px;">
        <h2 style="color: var(--danger); font-size: 1.4rem; margin-bottom: 6px;">${title}</h2>
        <p style="font-size: 0.88rem; margin-bottom: 14px;">${reason}</p>
        <div style="background: var(--bg-card); padding: 10px; border-radius: 6px; margin-bottom: 14px; text-align: left; font-size: 0.78rem;">
          <p><strong>Years Ruled:</strong> ${this.state.stats.yearsRuled}</p>
          <p><strong>Petitions Decided:</strong> ${this.state.stats.casesHeard}</p>
          <p><strong>Highest Tier Reached:</strong> ${KINGDOM_LEVELS.find(l => l.level === this.state.level).title}</p>
          <p><strong>Dynasty:</strong> ${this.state.ruler.dynasty}</p>
        </div>
        <button class="btn-action" id="btn-restart-game" style="font-size: 0.9rem; padding: 8px 18px;">Crown a Worthy Heir</button>
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

    this.openModal('Kingdom Chronicles & Decrees', `
      <p style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 6px;">
        An interactive historical ledger recording every royal decree, conquest, and milestone.
      </p>
      <div class="timeline-feed">${itemsHtml}</div>
    `);
  }

  openStatsModal() {
    const body = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 6px; margin-bottom: 10px;">
        <div class="faction-row"><div class="faction-meta"><span>Years Ruled</span><h3>${this.state.stats.yearsRuled}</h3></div></div>
        <div class="faction-row"><div class="faction-meta"><span>Turns Played</span><h3>${this.state.stats.turnsPlayed}</h3></div></div>
        <div class="faction-row"><div class="faction-meta"><span>Cases Resolved</span><h3>${this.state.stats.casesHeard}</h3></div></div>
        <div class="faction-row"><div class="faction-meta"><span>Quests Finished</span><h3>${this.state.stats.questsCompleted}</h3></div></div>
      </div>
      <h3 style="color: var(--primary); margin-bottom: 4px; font-size: 0.82rem;">Realm Historical Trajectory</h3>
      <div class="canvas-wrap">
        <canvas id="stats-chart"></canvas>
      </div>
      <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
        <button class="btn-sec" id="btn-export-json">Save JSON</button>
        <button class="btn-sec" id="btn-export-txt">Export TXT</button>
        <button class="btn-sec" id="btn-export-html">Dossier HTML</button>
      </div>
    `;
    this.openModal('Imperial Ledger & Statistics', body);
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
    for (let y = 15; y < rect.height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(25, y);
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
      const stepX = (rect.width - 40) / (arr.length - 1);
      arr.forEach((val, idx) => {
        const x = 30 + idx * stepX;
        const y = rect.height - 15 - (val / 100) * (rect.height - 30);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  openBadgesModal() {
    let badgesHtml = this.state.badges.map(b => `
      <div class="achieve-card ${b.unlocked ? 'unlocked' : ''}">
        <span class="achieve-emblem">${b.symbol}</span>
        <div class="achieve-meta">
          <h4>${b.name}</h4>
          <p>${b.desc}</p>
        </div>
      </div>
    `).join('');

    let achieveHtml = this.state.achievements.map(a => `
      <div class="achieve-card ${a.unlocked ? 'unlocked' : ''}">
        <span class="achieve-emblem">🏆</span>
        <div class="achieve-meta">
          <h4>${a.name}</h4>
          <p>${a.desc}</p>
          <span style="font-size: 0.62rem; color: var(--primary);">${a.cat}</span>
        </div>
      </div>
    `).join('');

    this.openModal('Imperial Deeds & Badges', `
      <h3 style="color: var(--primary); margin-bottom: 4px; font-size: 0.82rem;">Collectible Badges</h3>
      <div class="grid-achievements" style="margin-bottom: 10px;">${badgesHtml}</div>
      <h3 style="color: var(--primary); margin-bottom: 4px; font-size: 0.82rem;">Kingdom Deeds (100)</h3>
      <div class="grid-achievements" style="max-height: 320px; overflow-y: auto;">${achieveHtml}</div>
    `);
  }

  openQuestsModal() {
    let questsHtml = this.state.activeQuests.map(q => `
      <div class="quest-card" style="padding: 10px; margin-bottom: 6px;">
        <div class="quest-head">
          <strong style="font-size: 0.88rem;">${q.title}</strong>
          <span>${q.progress}%</span>
        </div>
        <p style="font-size: 0.74rem; color: var(--text-muted);">${q.desc}</p>
        <div class="quest-bar-bg" style="height: 5px; margin-top: 4px;">
          <div class="quest-bar-fill" style="width: ${q.progress}%;"></div>
        </div>
      </div>
    `).join('');

    this.openModal('Crown Objectives & Quests', `
      <p style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 8px;">Accomplish kingdom ambitions to harvest sovereign prestige and secure regional supremacy.</p>
      ${questsHtml || '<p>All realm quests accomplished. Envoys approach...</p>'}
    `);
  }

  openFactionsModal() {
    let factionsHtml = FACTIONS.map(f => {
      const val = this.state.factions[f.id] || 50;
      return `
        <div class="faction-row" style="padding: 8px 10px;">
          <span class="faction-emblem" style="font-size: 1.1rem;">${f.symbol}</span>
          <div class="faction-meta">
            <div class="faction-meta-head">
              <strong style="font-size: 0.82rem;">${f.name}</strong>
              <span style="color: ${f.color}; font-weight: 700;">${val}% Allegiance</span>
            </div>
            <p style="font-size: 0.7rem; color: var(--text-muted);">${f.desc} Leader: ${f.leader}</p>
          </div>
        </div>
      `;
    }).join('');

    this.openModal('Factions of the Iron Crown', `
      <div class="factions-container">${factionsHtml}</div>
    `);
  }

  openHelpModal() {
    this.openModal('Kingdom Guide & Rules', `
      <div style="font-size: 0.82rem; line-height: 1.5;">
        <h4 style="color: var(--primary); margin-bottom: 4px;">Rules of Sovereignty</h4>
        <p>1. Every council petition shapes immediate resources and triggers delayed province consequences.</p>
        <p>2. Keep resources balanced between 0 and 100. If vital stats drop to 0, rebellion or ruin will topple the throne.</p>
        <p>3. Competing factions require careful diplomacy. Favoring one often antagonizes rivals.</p>
        <p>4. Advance kingdom tiers from Village Realm to Immortal Empire by ruling justly and completing crown quests.</p>
      </div>
    `);
  }

  openSettingsModal() {
    const body = `
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.8rem;">
        <div>
          <label><strong>Visual Theme:</strong></label>
          <select id="select-theme" class="btn-sec" style="width: 100%; margin-top: 3px;">
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
          <div style="display: flex; gap: 6px; margin-top: 3px; flex-wrap: wrap;">
            <button class="btn-sec" id="btn-toggle-contrast">Toggle Contrast</button>
            <button class="btn-sec" id="btn-toggle-text">Toggle Large Text</button>
            <button class="btn-sec" id="btn-toggle-motion">Toggle Reduced Motion</button>
          </div>
        </div>
        <div>
          <label><strong>Audio Synthesizer:</strong></label>
          <div style="display: flex; gap: 6px; margin-top: 3px; flex-wrap: wrap;">
            <button class="btn-sec" id="btn-mute-audio">${this.sound.muted ? 'Unmute Audio' : 'Mute Audio'}</button>
            <button class="btn-sec" id="btn-theme-royal">Royal Anthem</button>
            <button class="btn-sec" id="btn-theme-battle">Battle Cadence</button>
          </div>
        </div>
        <div>
          <label><strong>Import Save State (JSON):</strong></label>
          <input type="file" id="import-json-file" class="btn-sec" style="width: 100%; margin-top: 3px;" accept=".json">
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
          this.showToast('Invalid JSON file.', 'bad');
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

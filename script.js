const skins = [
  { id: "neon_green", name: "Neon Grün", category: "Basic", rarity: "Common", price: 1000, desc: "Klassischer grüner Neon-Look mit sauberem Glow." },
  { id: "neon_blue", name: "Neon Blau", category: "Basic", rarity: "Common", price: 1000, desc: "Kalter blauer Neon-Style für klare Arena-Kills." },
  { id: "neon_pink", name: "Neon Pink", category: "Basic", rarity: "Common", price: 1000, desc: "Auffälliger pinker Glow für maximale Sichtbarkeit." },
  { id: "neon_gold", name: "Neon Gold", category: "Basic", rarity: "Common", price: 1500, desc: "Goldener Basis-Skin für kleine Champions." },
  { id: "street_fighter", name: "Straßenkämpfer", category: "Urban", rarity: "Common", price: 2000, desc: "Rauer Street-Look mit Staub-Trail und Asphalt-Vibe." },
  { id: "hoodie_shadow", name: "Hoodie Schatten", category: "Urban", rarity: "Common", price: 2500, desc: "Dunkler Hoodie-Style mit dezenter Schatten-Aura." },
  { id: "comic_hero", name: "Comic-Held", category: "Lustig", rarity: "Common", price: 2500, desc: "Bunter Comic-Look mit Pop-Effekt beim Angriff." },
  { id: "tiny_goblin", name: "Kleiner Goblin", category: "Fantasy", rarity: "Common", price: 3000, desc: "Frecher Goblin-Style mit giftigem Miniglow." },
  { id: "cute_bunny", name: "Süßer Hase", category: "Süß", rarity: "Common", price: 3000, desc: "Niedlicher Hasen-Look mit Hasenohren und Herzchen-Vibe." },
  { id: "banana_warrior", name: "Bananenkrieger", category: "Lustig", rarity: "Common", price: 3500, desc: "Absurder gelber Krieger mit Cartoon-Flair." },

  { id: "blood_blade", name: "Blood Blade", category: "Horror", rarity: "Rare", price: 5000, desc: "Blutiger Schwerttrail und roter Horror-Glow." },
  { id: "toxic_fighter", name: "Toxic Fighter", category: "Horror", rarity: "Rare", price: 6000, desc: "Giftgrüne Aura mit toxischen Partikeln." },
  { id: "ice_stickman", name: "Eis-Krieger", category: "Elementar", rarity: "Rare", price: 6500, desc: "Frostiger Skin mit Eissplitter-Trail." },
  { id: "fire_runner", name: "Feuerläufer", category: "Elementar", rarity: "Rare", price: 6500, desc: "Feurige Spuren und heißer Schwertglow." },
  { id: "storm_slasher", name: "Sturm-Schlitzer", category: "Elementar", rarity: "Rare", price: 7000, desc: "Blitzpartikel und stürmischer Dash-Look." },
  { id: "shadow_cat", name: "Schattenkatze", category: "Süß/Dark", rarity: "Rare", price: 7500, desc: "Süßer, dunkler Katzenstyle mit lila Ohren-Glow." },
  { id: "clown_blade", name: "Messer-Clown", category: "Horror/Lustig", rarity: "Rare", price: 8000, desc: "Unheimlich-lustiger Clown-Look mit rotem Pop-Effekt." },
  { id: "pumpkin_reaper", name: "Kürbis-Schnitter", category: "Horror", rarity: "Rare", price: 8500, desc: "Halloween-Style mit Kürbis-Kopf und dunklem Trail." },
  { id: "plague_doctor", name: "Pestdoktor", category: "Horror", rarity: "Rare", price: 9000, desc: "Düsterer Pestdoktor-Look mit Schnabelmaske." },
  { id: "arcade_knight", name: "Arcade-Ritter", category: "Retro", rarity: "Rare", price: 9000, desc: "Retro-Pixel-Style mit 8-Bit Treffer-Effekt." },

  { id: "anime_swordsman", name: "Anime-Schwertkämpfer", category: "Anime", rarity: "Epic", price: 12000, desc: "Stachelhaar, langer Mantel, wehender Schal und Katana mit Anime-Speedlines." },
  { id: "demon_student", name: "Dämonenschüler", category: "Anime/Dark", rarity: "Epic", price: 13000, desc: "Dämon mit Schuluniform, Krawatte, Schultasche, Hörnern und kleinen Flügeln." },
  { id: "masked_ninja", name: "Maskierter Ninja", category: "Anime", rarity: "Epic", price: 14000, desc: "Vollmaske, Kapuze, Wickelrüstung, Rauchwolken und fliegende Shuriken." },
  { id: "spirit_samurai", name: "Geister-Samurai", category: "Anime/Fantasy", rarity: "Epic", price: 15000, desc: "Spektrale Samurai-Rüstung mit Kabuto, Runenrad und schwebenden Seelenflammen." },
  { id: "thunder_senpai", name: "Donner-Senpai", category: "Anime/Lustig", rarity: "Epic", price: 15000, desc: "Schuluniform, wildes Blitzhaar und eine elektrisch geladene Klinge." },
  { id: "rose_assassin", name: "Rosen-Assassine", category: "Elegant", rarity: "Epic", price: 16000, desc: "Verhüllte Assassinin mit Rose, Dornenranke, Blütenblättern und Rapier." },
  { id: "cyber_ninja", name: "Cyber Ninja", category: "Cyberpunk", rarity: "Epic", price: 18000, desc: "Tech-Helm, Neonvisier, Schaltkreisrüstung, Drohnen und Energie-Katana." },
  { id: "glitch_demon", name: "Glitch Demon", category: "Cyber/Horror", rarity: "Epic", price: 20000, desc: "Asymmetrische Hörner, zerrissene Flügel und ein zerhackter Pixelkörper." },
  { id: "mecha_stick", name: "Mecha Stickfighter", category: "Sci-Fi", rarity: "Epic", price: 20000, desc: "Massive Mecha-Platten, Schulterkanonen, Jetpack und leuchtender Reaktorkern." },
  { id: "holo_blade", name: "Holo Blade", category: "Sci-Fi", rarity: "Epic", price: 22000, desc: "Transparente Projektionsrüstung mit Drahtgitter, Visier und Holo-Klinge." },
  { id: "void_walker", name: "Void Walker", category: "Dark Fantasy", rarity: "Epic", price: 24000, desc: "Gesichtslose Kapuze, schwarzes Brustportal, schwebende Felsen und Void-Sense." },
  { id: "bone_knight", name: "Knochenritter", category: "Horror/Fantasy", rarity: "Epic", price: 25000, desc: "Schädelhelm, Rippenpanzer, gekreuzte Knochen und ein Knochen-Großschwert." },
  { id: "vampire_duelist", name: "Vampir-Duellant", category: "Horror/Edel", rarity: "Epic", price: 26000, desc: "Blasses Gesicht, rote Augen, Fangzähne, hoher Umhang und elegantes Rapier." },
  { id: "werewolf_rage", name: "Werwolf-Raserei", category: "Horror", rarity: "Epic", price: 28000, desc: "Wolfskopf, Fellmähne, Fangzähne und drei rasende Krallenangriffe." },
  { id: "angelic_guardian", name: "Himmlischer Wächter", category: "Fantasy", rarity: "Epic", price: 30000, desc: "Federflügel, Halo, heilige Plattenrüstung, Kreuzschild und Lichtklinge." },

  { id: "fallen_angel", name: "Gefallener Engel", category: "Dark Fantasy", rarity: "Legendary", price: 40000, desc: "Zerrissene schwarze Flügel, gebrochener Halo und fallende dunkle Federn." },
  { id: "gold_champion", name: "Gold Champion", category: "Prestige", rarity: "Legendary", price: 50000, desc: "Goldene Gladiatorenrüstung, Lorbeerkranz, Champion-Gürtel und Sternschild." },
  { id: "blood_emperor", name: "Blutkaiser", category: "Horror/Prestige", rarity: "Legendary", price: 55000, desc: "Hohe Kaiserkrone, Blutthron, königlicher Umhang und schwebende Blutkugeln." },
  { id: "dragon_soul", name: "Drachenseele", category: "Fantasy", rarity: "Legendary", price: 60000, desc: "Drachenkopf, Schuppenpanzer, Flügel, Schweif und lodernde Drachenseele." },
  { id: "shadow_horseman", name: "Schattenhengst", category: "Herde/Lore", rarity: "Legendary", price: 75000, desc: "Dunkler Reiter auf einem vollständigen Geisterpferd mit Lanze und Sattel." },
  { id: "cosmic_reaper", name: "Kosmischer Schnitter", category: "Cosmic Horror", rarity: "Legendary", price: 80000, desc: "Schädel unter einer Sternenmantel-Kapuze mit Planeten und kosmischer Sense." },
  { id: "neon_overlord", name: "Neon Overlord", category: "Cyber/Prestige", rarity: "Legendary", price: 85000, desc: "Gigantische Neonkrone, schwere Tech-Rüstung und zwei schwebende Drohnen." },
  { id: "rainbow_madness", name: "Regenbogen-Wahnsinn", category: "Lustig", rarity: "Legendary", price: 90000, desc: "Wildes Regenbogenhaar, ungleiche Augen, Farbringe und völliges Neonchaos." },
  { id: "kawaii_destroyer", name: "Kawaii Destroyer", category: "Süß/Chaos", rarity: "Legendary", price: 95000, desc: "Hasenohren, Riesenschleife, Herzrüstung und ein brutaler Pastell-Hammer." },
  { id: "herd_guardian", name: "Wächter der Herde", category: "Community", rarity: "Legendary", price: 100000, desc: "Pferdehelm, Herdengeister, Hufeisenschild und goldene Wächterlanze." },

  { id: "red_glitch_king", name: "Roter Glitch-König", category: "Cyber/Horror", rarity: "Mythic", price: 150000, desc: "Pixelkrone, Glitch-Thron, königlicher Mantel und zerrissene Datenblöcke." },
  { id: "nightmare_clown", name: "Albtraum-Clown", category: "Horror", rarity: "Mythic", price: 175000, desc: "Horrorclown mit scharfem Grinsen, Zähnen, Narrenkappe, Ballon und Beil." },
  { id: "celestial_samurai", name: "Celestial Samurai", category: "Anime/Fantasy", rarity: "Mythic", price: 200000, desc: "Mondsichel-Kabuto, kosmische Rüstung, Sterne, Planeten und Himmels-Katana." },
  { id: "golden_mustang", name: "Goldener Mustang", category: "Herde/Prestige", rarity: "Mythic", price: 250000, desc: "Goldener Pferdekopf, wehende Mähne und ein galoppierender Mustang-Körper." },
  { id: "the_final_boss", name: "The Final Boss", category: "Ultra Prestige", rarity: "Mythic", price: 500000, desc: "Dämonenkrone, vier Hörner, Flügel, Bossrüstung, Scherben und Riesenschwert." },

  { id: "storm_monk", name: "Storm Monk", category: "Elementar/Prestige", rarity: "Legendary", price: 110000, desc: "Gewitter-Mönch mit Blitzpanzer, Klauen und der Signature-Attacke Thunder Palm." },
  { id: "phantom_jester", name: "Phantom Jester", category: "Horror/Chaos", rarity: "Legendary", price: 125000, desc: "Geisterhafter Narr mit Rapier, Albtraumrüstung und der Signature-Attacke Final Laugh." },
  { id: "void_ronin", name: "Void Ronin", category: "Dark Fantasy", rarity: "Mythic", price: 225000, desc: "Leeren-Samurai mit Celestial Katana, Void-Rüstung und der Signature-Attacke Void Iai." },
  { id: "inferno_warden", name: "Inferno Warden", category: "Horror/Elementar", rarity: "Mythic", price: 300000, desc: "Glühender Feuerwächter mit Dämonenklinge und der Signature-Attacke Hellgate Breaker." },
  { id: "iron_colossus", name: "Iron Colossus", category: "Mecha/Prestige", rarity: "Mythic", price: 350000, desc: "Massiver Stahlkoloss mit Kernpanzer, Kriegshammer und der Signature-Attacke World Anvil." },
  { id: "astral_stallion", name: "Astral Stallion", category: "Herde/Ultra Prestige", rarity: "Mythic", price: 425000, desc: "Kosmischer Herden-Champion mit Mustang-Rüstung, goldener Lanze und Astral Stampede." }
];

const grid = document.getElementById("skinGrid");
const searchInput = document.getElementById("skinSearch");
const filterButtons = document.querySelectorAll(".filter-btn");
const toast = document.getElementById("toast");
const copyShopCommand = document.getElementById("copyShopCommand");

let activeFilter = "all";

function formatPrice(value) {
  return new Intl.NumberFormat("de-DE").format(value);
}

function getBuyCommand(id) {
  return `!buyskin ${id}`;
}

function getUseCommand(id) {
  return `!useskin ${id}`;
}

function isPremiumRarity(rarity) {
  return rarity === "Epic" || rarity === "Legendary" || rarity === "Mythic";
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1600);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Command kopiert: " + text);
  } catch (error) {
    showToast("Kopieren nicht möglich");
  }
}

const NEW_2_0_SKINS = new Set([
  "storm_monk", "phantom_jester", "void_ronin",
  "inferno_warden", "iron_colossus", "astral_stallion"
]);

function createAvatar(skinId, rarity = "") {
  if (NEW_2_0_SKINS.has(skinId)) {
    return `
      <div class="premium-render-avatar premium-rarity-${rarity} new-2-skin-avatar">
        <img class="new-2-skin-svg" src="fighter-assets/${skinId}.svg" alt="${skinId} Vorschau" />
      </div>
    `;
  }

  if (isPremiumRarity(rarity)) {
    return `
      <div class="premium-render-avatar premium-rarity-${rarity}">
        <canvas
          class="premium-skin-canvas"
          data-skin-id="${skinId}"
          width="400"
          height="280"
          aria-label="${skinId} Vorschau"
        ></canvas>
      </div>
    `;
  }

  return `
    <div class="avatar skin-${skinId} avatar-rarity-${rarity}">
      <div class="avatar-bg"></div>
      <div class="avatar-stick">
        <span class="part head"></span>
        <span class="part body"></span>
        <span class="part arm left"></span>
        <span class="part arm right"></span>
        <span class="part leg left"></span>
        <span class="part leg right"></span>
        <span class="part sword"></span>
        <span class="extra extra-1"></span>
        <span class="extra extra-2"></span>
        <span class="extra extra-3"></span>
      </div>
    </div>
  `;
}

function createPreviewPlayer(skinId) {
  const renderer = window.StickFightSkinRenderer;
  const style = renderer.getSkinStyle(skinId, "#00ff84");

  return {
    name: "",
    level: 1,
    xp: 0,
    skin: skinId,
    skinStyle: style,
    hp: 100,
    maxHp: 100,
    x: 200,
    y: 210,
    color: style.color,
    direction: 1,
    walkFrame: 0,
    attackAnim: 0,
    specialAnim: 0,
    hurtAnim: 0,
    spawnGlow: 0,
    spawnProtection: 0,
    dead: false,
    hideNameplate: true
  };
}

function renderPremiumPreview(targetCanvas) {
  const renderer = window.StickFightSkinRenderer;
  const sourceCanvas = document.getElementById("fightCanvas");
  const skinId = targetCanvas.dataset.skinId;

  if (!renderer || !sourceCanvas || !skinId) {
    targetCanvas.classList.add("render-failed");
    return;
  }

  const sourceContext = sourceCanvas.getContext("2d");
  const targetContext = targetCanvas.getContext("2d");

  sourceContext.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  renderer.clearEffects();
  renderer.drawPlayer(createPreviewPlayer(skinId));

  targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  targetContext.drawImage(
    sourceCanvas,
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height,
    0,
    0,
    targetCanvas.width,
    targetCanvas.height
  );
}

function renderPremiumPreviews(root = document) {
  root.querySelectorAll(".premium-skin-canvas").forEach(renderPremiumPreview);
}

function renderSkins() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = skins.filter((skin) => {
    const matchesFilter = activeFilter === "all" || skin.rarity === activeFilter;
    const haystack = `${skin.name} ${skin.id} ${skin.category} ${skin.rarity} ${skin.desc}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);

    return matchesFilter && matchesSearch;
  });

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="info-card" style="grid-column: 1 / -1;">
        <span class="info-icon">🔎</span>
        <h2>Keine Skins gefunden</h2>
        <p>Versuch einen anderen Suchbegriff oder entferne den Filter.</p>
      </div>
    `;
    return;
  }

  for (const skin of filtered) {
    const card = document.createElement("article");
    const exactRenderClass = isPremiumRarity(skin.rarity) ? " has-exact-render" : "";
    card.className = `skin-card rarity-${skin.rarity} skin-${skin.id}${exactRenderClass}`;
    card.innerHTML = `
      <div class="skin-rarity">${skin.rarity}</div>

      <div class="skin-figure">
        ${createAvatar(skin.id, skin.rarity)}
      </div>

      <h3 class="skin-name">${skin.name}</h3>

      <div class="skin-meta">
        <span>${skin.category}</span>
        <span class="price">${formatPrice(skin.price)} Hufeisen</span>
      </div>

      <p class="skin-desc">${skin.desc}</p>

      <div class="command-box">
        <div class="command-row">
          <span>${getBuyCommand(skin.id)}</span>
          <button class="copy-btn" data-copy="${getBuyCommand(skin.id)}">Copy</button>
        </div>

        <div class="command-row">
          <span>${getUseCommand(skin.id)}</span>
          <button class="copy-btn" data-copy="${getUseCommand(skin.id)}">Copy</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  }

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", () => {
      copyText(button.dataset.copy);
    });
  });

  renderPremiumPreviews(grid);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderSkins();
  });
});

searchInput.addEventListener("input", renderSkins);

copyShopCommand.addEventListener("click", () => {
  copyText("!skin-shop");
});

renderSkins();
renderPremiumPreviews(document.querySelector(".hero-preview"));

let lastHeroFrame = 0;

function animateHeroPreview(timestamp) {
  if (timestamp - lastHeroFrame >= 90) {
    renderPremiumPreviews(document.querySelector(".hero-preview"));
    lastHeroFrame = timestamp;
  }

  requestAnimationFrame(animateHeroPreview);
}

requestAnimationFrame(animateHeroPreview);

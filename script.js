const skins = [
  { id: "neon_green", name: "Neon Grün", category: "Basic", rarity: "Common", price: 1000, desc: "Klassischer grüner Neon-Look mit sauberem Glow." },
  { id: "neon_blue", name: "Neon Blau", category: "Basic", rarity: "Common", price: 1000, desc: "Kalter blauer Neon-Style für klare Arena-Kills." },
  { id: "neon_pink", name: "Neon Pink", category: "Basic", rarity: "Common", price: 1000, desc: "Auffälliger pinker Glow für maximale Sichtbarkeit." },
  { id: "neon_gold", name: "Neon Gold", category: "Basic", rarity: "Common", price: 1500, desc: "Goldener Basis-Skin für kleine Champions." },
  { id: "street_fighter", name: "Straßenkämpfer", category: "Urban", rarity: "Common", price: 2000, desc: "Rauer Street-Look mit Staub-Trail und Asphalt-Vibe." },
  { id: "hoodie_shadow", name: "Hoodie Schatten", category: "Urban", rarity: "Common", price: 2500, desc: "Dunkler Hoodie-Style mit dezenter Schatten-Aura." },
  { id: "comic_hero", name: "Comic-Held", category: "Lustig", rarity: "Common", price: 2500, desc: "Bunter Comic-Look mit Pop-Effekt beim Angriff." },
  { id: "tiny_goblin", name: "Kleiner Goblin", category: "Fantasy", rarity: "Common", price: 3000, desc: "Frecher Goblin-Style mit giftigem Miniglow." },
  { id: "cute_bunny", name: "Süßer Hase", category: "Süß", rarity: "Common", price: 3000, desc: "Niedlicher Hasen-Look mit Herzchen-Partikeln." },
  { id: "banana_warrior", name: "Bananenkrieger", category: "Lustig", rarity: "Common", price: 3500, desc: "Absurder gelber Krieger mit Cartoon-Flair." },

  { id: "blood_blade", name: "Blood Blade", category: "Horror", rarity: "Rare", price: 5000, desc: "Blutiger Schwerttrail und roter Horror-Glow." },
  { id: "toxic_fighter", name: "Toxic Fighter", category: "Horror", rarity: "Rare", price: 6000, desc: "Giftgrüne Aura mit toxischen Partikeln." },
  { id: "ice_stickman", name: "Eis-Krieger", category: "Elementar", rarity: "Rare", price: 6500, desc: "Frostiger Skin mit Eissplitter-Trail." },
  { id: "fire_runner", name: "Feuerläufer", category: "Elementar", rarity: "Rare", price: 6500, desc: "Feurige Spuren und heißer Schwertglow." },
  { id: "storm_slasher", name: "Sturm-Schlitzer", category: "Elementar", rarity: "Rare", price: 7000, desc: "Blitzpartikel und stürmischer Dash-Look." },
  { id: "shadow_cat", name: "Schattenkatze", category: "Süß/Dark", rarity: "Rare", price: 7500, desc: "Süßer, dunkler Katzenstyle mit lila Augen-Glow." },
  { id: "clown_blade", name: "Messer-Clown", category: "Horror/Lustig", rarity: "Rare", price: 8000, desc: "Unheimlich-lustiger Clown-Look mit roten Pop-Effekten." },
  { id: "pumpkin_reaper", name: "Kürbis-Schnitter", category: "Horror", rarity: "Rare", price: 8500, desc: "Halloween-Style mit Kürbis-Aura und dunklem Trail." },
  { id: "plague_doctor", name: "Pestdoktor", category: "Horror", rarity: "Rare", price: 9000, desc: "Düsterer Pestdoktor-Look mit Nebel-Partikeln." },
  { id: "arcade_knight", name: "Arcade-Ritter", category: "Retro", rarity: "Rare", price: 9000, desc: "Retro-Pixel-Style mit 8-Bit Treffer-Effekt." },

  { id: "anime_swordsman", name: "Anime-Schwertkämpfer", category: "Anime", rarity: "Epic", price: 12000, desc: "Dynamischer Anime-Kämpfer mit schnellen Dash-Linien." },
  { id: "demon_student", name: "Dämonenschüler", category: "Anime/Dark", rarity: "Epic", price: 13000, desc: "Dunkler Schuluniform-Vibe mit Dämonen-Aura." },
  { id: "masked_ninja", name: "Maskierter Ninja", category: "Anime", rarity: "Epic", price: 14000, desc: "Ninja-Style mit Schatten-Dash und Rauchpartikeln." },
  { id: "spirit_samurai", name: "Geister-Samurai", category: "Anime/Fantasy", rarity: "Epic", price: 15000, desc: "Samurai-Vibe mit Geisterflamme und Schwertspur." },
  { id: "thunder_senpai", name: "Donner-Senpai", category: "Anime/Lustig", rarity: "Epic", price: 15000, desc: "Anime-Drama, Blitz-Effekt und komplett übertriebener Style." },
  { id: "rose_assassin", name: "Rosen-Assassine", category: "Elegant", rarity: "Epic", price: 16000, desc: "Eleganter Assassinen-Look mit roten Rosenpartikeln." },
  { id: "cyber_ninja", name: "Cyber Ninja", category: "Cyberpunk", rarity: "Epic", price: 18000, desc: "Cyberpunk-Ninja mit Holo-Klinge und Glitchtrail." },
  { id: "glitch_demon", name: "Glitch Demon", category: "Cyber/Horror", rarity: "Epic", price: 20000, desc: "Verbuggte Dämonen-Aura mit digitalen Störungen." },
  { id: "mecha_stick", name: "Mecha Stickfighter", category: "Sci-Fi", rarity: "Epic", price: 20000, desc: "Mechanischer Fighter mit Metallglow und Servo-Partikeln." },
  { id: "holo_blade", name: "Holo Blade", category: "Sci-Fi", rarity: "Epic", price: 22000, desc: "Holografischer Skin mit futuristischer Lichtklinge." },
  { id: "void_walker", name: "Void Walker", category: "Dark Fantasy", rarity: "Epic", price: 24000, desc: "Leerenschatten und schwarzer Nebel für düstere Auftritte." },
  { id: "bone_knight", name: "Knochenritter", category: "Horror/Fantasy", rarity: "Epic", price: 25000, desc: "Knochiger Ritter-Look mit bleicher Aura." },
  { id: "vampire_duelist", name: "Vampir-Duellant", category: "Horror/Edel", rarity: "Epic", price: 26000, desc: "Edler Vampirstyle mit rotem Cape-Vibe." },
  { id: "werewolf_rage", name: "Werwolf-Raserei", category: "Horror", rarity: "Epic", price: 28000, desc: "Wilde Rage-Aura mit Krallen- und Mond-Effekt." },
  { id: "angelic_guardian", name: "Himmlischer Wächter", category: "Fantasy", rarity: "Epic", price: 30000, desc: "Heller Wächter-Look mit sanfter Lichtaura." },

  { id: "fallen_angel", name: "Gefallener Engel", category: "Dark Fantasy", rarity: "Legendary", price: 40000, desc: "Dunkle Flügel-Aura und himmlisch kaputter Style." },
  { id: "gold_champion", name: "Gold Champion", category: "Prestige", rarity: "Legendary", price: 50000, desc: "Goldener Prestige-Skin für echte Arena-Gewinner." },
  { id: "blood_emperor", name: "Blutkaiser", category: "Horror/Prestige", rarity: "Legendary", price: 55000, desc: "Kaiserlicher Horror-Look mit blutroter Dominanz." },
  { id: "dragon_soul", name: "Drachenseele", category: "Fantasy", rarity: "Legendary", price: 60000, desc: "Drachen-Aura, Flammenpartikel und epischer Schwertglow." },
  { id: "shadow_horseman", name: "Schattenhengst", category: "Herde/Lore", rarity: "Legendary", price: 75000, desc: "Dunkler Herden-Lore-Skin mit Pferdegeist-Aura." },
  { id: "cosmic_reaper", name: "Kosmischer Schnitter", category: "Cosmic Horror", rarity: "Legendary", price: 80000, desc: "Galaktischer Todesskin mit Sternennebel-Effekt." },
  { id: "neon_overlord", name: "Neon Overlord", category: "Cyber/Prestige", rarity: "Legendary", price: 85000, desc: "Neon-Herrscher mit massiver Cyber-Aura." },
  { id: "rainbow_madness", name: "Regenbogen-Wahnsinn", category: "Lustig", rarity: "Legendary", price: 90000, desc: "Komplett übertriebener Regenbogen-Chaos-Look." },
  { id: "kawaii_destroyer", name: "Kawaii Destroyer", category: "Süß/Chaos", rarity: "Legendary", price: 95000, desc: "Süß, bunt und trotzdem bereit für die Arena." },
  { id: "herd_guardian", name: "Wächter der Herde", category: "Community", rarity: "Legendary", price: 100000, desc: "Community-Skin mit Herden-Aura und Goldglow." },

  { id: "red_glitch_king", name: "Roter Glitch-König", category: "Cyber/Horror", rarity: "Mythic", price: 150000, desc: "Roter digitaler König mit aggressivem Glitch-Effekt." },
  { id: "nightmare_clown", name: "Albtraum-Clown", category: "Horror", rarity: "Mythic", price: 175000, desc: "Der Clown, den niemand nachts im Overlay sehen will." },
  { id: "celestial_samurai", name: "Celestial Samurai", category: "Anime/Fantasy", rarity: "Mythic", price: 200000, desc: "Kosmischer Samurai mit Sternen-Aura und Premium-Trail." },
  { id: "golden_mustang", name: "Goldener Mustang", category: "Herde/Prestige", rarity: "Mythic", price: 250000, desc: "Der ultimative Herden-Prestige-Skin in purem Gold." },
  { id: "the_final_boss", name: "The Final Boss", category: "Ultra Prestige", rarity: "Mythic", price: 500000, desc: "Der teuerste Skin. Für Leute, die als Endgegner erscheinen wollen." }
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

function createStickPreview() {
  return `
    <div class="mini-stick">
      <span class="mini-head"></span>
      <span class="mini-body"></span>
      <span class="mini-arm left"></span>
      <span class="mini-arm right"></span>
      <span class="mini-leg left"></span>
      <span class="mini-leg right"></span>
      <span class="mini-sword"></span>
    </div>
  `;
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
    card.className = `skin-card rarity-${skin.rarity}`;
    card.innerHTML = `
      <div class="skin-rarity">${skin.rarity}</div>

      <div class="skin-figure">
        ${createStickPreview()}
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

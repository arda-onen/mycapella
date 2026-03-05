const stones = [
  { id: "rose-quartz", name: "Pembe Kuvars", color: "#f2b8c6", price: 95, texture: "pinkquartz.png" },
  { id: "amethyst", name: "Ametist", color: "#8a72cd", price: 115, texture: "amethyst.png" },
  { id: "jade", name: "Beyaz Yeşim", color: "#9ccab2", price: 90, texture: "jade.png" },
  { id: "tiger-eye", name: "Kaplan Gözü", color: "#bb8a4a", price: 110, texture: "tigereye.png" },
  { id: "obsidian", name: "Obsidyen", color: "#2e2e36", price: 125, texture: "obsidian.png" },
  { id: "moonstone", name: "Ay Taşı", color: "#d7d7df", price: 105, texture: "moonstone.png" }
];

const basePrice = 890;
const slotCount = 24;
const defaultStone = stones[0];
const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0
});

const state = {
  selectedStoneId: defaultStone.id,
  slots: Array(slotCount).fill(defaultStone.id)
};

const pickerElement = document.getElementById("stone-picker");
const previewElement = document.getElementById("bracelet-preview");
const selectionListElement = document.getElementById("selection-list");
const totalPriceElement = document.getElementById("total-price");
const resetButton = document.getElementById("reset-button");
const themeToggleButton = document.getElementById("theme-toggle");
const sunIconSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="4.5"></circle>
    <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3"></path>
  </svg>
`;
const moonIconSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M20 14.2A8.4 8.4 0 1 1 9.8 4a7.2 7.2 0 1 0 10.2 10.2Z"></path>
  </svg>
`;

function getStoneById(stoneId) {
  return stones.find((stone) => stone.id === stoneId);
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgbToHex({ r, g, b }) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function tintColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: r + (255 - r) * amount,
    g: g + (255 - g) * amount,
    b: b + (255 - b) * amount
  });
}

function shadeColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const multiplier = 1 - amount;
  return rgbToHex({
    r: r * multiplier,
    g: g * multiplier,
    b: b * multiplier
  });
}

function toRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function renderStonePicker() {
  pickerElement.innerHTML = "";

  stones.forEach((stone) => {
    const button = document.createElement("button");
    button.className = `stone-option ${
      state.selectedStoneId === stone.id ? "active" : ""
    }`;
    button.type = "button";
    const dotStyle = stone.texture
      ? `background-image:url('${stone.texture}');background-size:cover;background-position:center;`
      : `background:${stone.color};`;
    button.innerHTML = `
      <span class="stone-dot" style="${dotStyle}"></span>
      <span class="stone-name">${stone.name}</span>
    `;

    button.addEventListener("click", () => {
      state.selectedStoneId = stone.id;
      renderStonePicker();
    });

    pickerElement.appendChild(button);
  });
}

function renderBracelet() {
  previewElement.innerHTML = "";
  const stoneRadiusX = 40;
  const stoneRadiusY = 29.5;
  previewElement.style.setProperty("--radius-x", `${stoneRadiusX}%`);
  previewElement.style.setProperty("--radius-y", `${stoneRadiusY}%`);

  state.slots.forEach((stoneId, index) => {
    const stone = getStoneById(stoneId);
    const angle = (index / slotCount) * (Math.PI * 2) - Math.PI / 2;
    const x = 50 + Math.cos(angle) * stoneRadiusX;
    const y = 50 + Math.sin(angle) * stoneRadiusY;
    const depth = (Math.sin(angle) + 1) / 2;
    const scale = 1.02 + depth * 0.08;
    const z = Math.floor(depth * 140) + 10;
    const lift = 3 + depth * 8;

    const highlight = tintColor(stone.color, 0.45);
    const midtone = tintColor(stone.color, 0.16);
    const shadowTone = shadeColor(stone.color, 0.32);
    const coreShadow = shadeColor(stone.color, 0.54);

    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "slot";
    slot.style.setProperty("--x", `${x}%`);
    slot.style.setProperty("--y", `${y}%`);
    slot.style.setProperty("--scale", scale.toFixed(3));
    slot.style.setProperty("--z", `${z}`);
    slot.style.setProperty("--depth", depth.toFixed(3));
    slot.style.setProperty("--lift", `${lift.toFixed(2)}px`);
    slot.style.setProperty("--tex-rot", `${((index * 13) % 11) - 5}deg`);
    slot.style.setProperty("--shadow-alpha", (0.24 + depth * 0.08).toFixed(3));
    slot.style.setProperty("--spec-opacity", (0.56 + depth * 0.18).toFixed(3));
    slot.style.setProperty("--stone-light", highlight);
    slot.style.setProperty("--stone-mid", midtone);
    slot.style.setProperty("--stone-dark", shadowTone);
    slot.style.setProperty("--stone-core", coreShadow);
    slot.style.setProperty("--vein", toRgba(shadeColor(stone.color, 0.6), 0.18));
    slot.style.setProperty("--spark", toRgba(tintColor(stone.color, 0.88), 0.72));
    slot.style.setProperty("--bead-ambient", toRgba(stone.color, 0.48));
    if (stone.texture) {
      slot.classList.add("textured-stone");
      slot.style.setProperty("--stone-texture", `url("${stone.texture}")`);
      slot.style.setProperty("--tex-x", `${45 + ((index * 7) % 10)}%`);
      slot.style.setProperty("--tex-y", `${44 + ((index * 5) % 10)}%`);
      slot.style.setProperty("--tex-zoom", `${140 + (index % 3) * 8}%`);
    }
    slot.title = `Slot ${index + 1}: ${stone.name}`;
    slot.setAttribute("aria-label", `Bracelet slot ${index + 1}: ${stone.name}`);

    slot.addEventListener("click", () => {
      state.slots[index] = state.selectedStoneId;
      renderBracelet();
      renderSummary();
    });

    previewElement.appendChild(slot);
  });
}

function renderSummary() {
  const counts = state.slots.reduce((acc, stoneId) => {
    acc[stoneId] = (acc[stoneId] || 0) + 1;
    return acc;
  }, {});

  selectionListElement.innerHTML = "";

  let total = basePrice;

  Object.entries(counts).forEach(([stoneId, amount]) => {
    const stone = getStoneById(stoneId);
    const linePrice = amount * stone.price;
    total += linePrice;

    const line = document.createElement("li");
    line.innerHTML = `
      <span>${stone.name} x${amount}</span>
      <span>${currencyFormatter.format(linePrice)}</span>
    `;

    selectionListElement.appendChild(line);
  });

  const baseLine = document.createElement("li");
  baseLine.innerHTML = `
    <span>Bileklik Baz Ücreti</span>
    <span>${currencyFormatter.format(basePrice)}</span>
  `;
  selectionListElement.prepend(baseLine);

  totalPriceElement.textContent = currencyFormatter.format(total);
}

function resetDesign() {
  state.selectedStoneId = defaultStone.id;
  state.slots = Array(slotCount).fill(defaultStone.id);

  renderStonePicker();
  renderBracelet();
  renderSummary();
}

resetButton.addEventListener("click", resetDesign);

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (themeToggleButton) {
    themeToggleButton.innerHTML = theme === "dark" ? sunIconSvg : moonIconSvg;
    themeToggleButton.setAttribute("aria-label", theme === "dark" ? "Açık moda geç" : "Koyu moda geç");
    themeToggleButton.setAttribute("title", theme === "dark" ? "Açık moda geç" : "Koyu moda geç");
  }
}

function applyThemeWithTransition(theme) {
  document.documentElement.classList.add("theme-transition");
  applyTheme(theme);
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transition");
  }, 420);
}

const storedTheme = localStorage.getItem("my-capella-theme");
applyTheme(storedTheme || "dark");

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyThemeWithTransition(nextTheme);
    localStorage.setItem("my-capella-theme", nextTheme);
  });
}

renderStonePicker();
renderBracelet();
renderSummary();

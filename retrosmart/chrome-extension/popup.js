const KITS = [
  // Win-3D Chrome
  { id: "win-3d-blue", name: "Win-3D Blue", category: "Win-3D Chrome", theme: "Cobalt Blue" },
  { id: "win-3d-red", name: "Win-3D Red", category: "Win-3D Chrome", theme: "Crimson Red" },
  { id: "win-3d-green", name: "Win-3D Green", category: "Win-3D Chrome", theme: "Emerald Green" },
  { id: "win-3d-violet", name: "Win-3D Violet", category: "Win-3D Chrome", theme: "Amethyst Violet" },

  // Mac-ish System 7
  { id: "mac-ish-classic", name: "Mac Classic", category: "Mac-ish System 7", theme: "Classic Monochrome" },
  { id: "mac-ish-catppucin", name: "Mac Catppuccin", category: "Mac-ish System 7", theme: "Catppuccin Mocha" },
  { id: "mac-ish-everforest", name: "Mac Everforest", category: "Mac-ish System 7", theme: "Everforest Nature" },
  { id: "mac-ish-gruvbox", name: "Mac Gruvbox", category: "Mac-ish System 7", theme: "Gruvbox Retro" },
  { id: "mac-ish-rose_pine", name: "Mac Rosé Pine", category: "Mac-ish System 7", theme: "Rosé Pine" },
  { id: "mac-ish-solarized_dark", name: "Mac Solarized", category: "Mac-ish System 7", theme: "Solarized Dark" },
  { id: "mac-ish-violet", name: "Mac Violet", category: "Mac-ish System 7", theme: "Electric Violet" },
  { id: "mac-ish-white", name: "Mac White", category: "Mac-ish System 7", theme: "Clean White" },

  // Win-ish 95
  { id: "win-ish-classic", name: "Win-ish Classic", category: "Win-ish 95", theme: "Classic B&W" },
  { id: "win-ish-catppucin", name: "Win-ish Catppuccin", category: "Win-ish 95", theme: "Catppuccin Mocha" },
  { id: "win-ish-everforest", name: "Win-ish Everforest", category: "Win-ish 95", theme: "Everforest Nature" },
  { id: "win-ish-gruvbox", name: "Win-ish Gruvbox", category: "Win-ish 95", theme: "Gruvbox Retro" },
  { id: "win-ish-rose_pine", name: "Win-ish Rosé Pine", category: "Win-ish 95", theme: "Rosé Pine" },
  { id: "win-ish-solarized_dark", name: "Win-ish Solarized", category: "Win-ish 95", theme: "Solarized Dark" },
  { id: "win-ish-violet", name: "Win-ish Violet", category: "Win-ish 95", theme: "Electric Violet" },
  { id: "win-ish-white", name: "Win-ish White", category: "Win-ish 95", theme: "Clean White" },

  // Cur-Font
  { id: "cur-font-classic", name: "Font Classic", category: "Cur-Font X11", theme: "X11 Monochrome" },
  { id: "cur-font-catppucin", name: "Font Catppuccin", category: "Cur-Font X11", theme: "Catppuccin Mocha" },
  { id: "cur-font-everforest", name: "Font Everforest", category: "Cur-Font X11", theme: "Everforest Nature" },
  { id: "cur-font-gruvbox", name: "Font Gruvbox", category: "Cur-Font X11", theme: "Gruvbox Retro" },
  { id: "cur-font-rose_pine", name: "Font Rosé Pine", category: "Cur-Font X11", theme: "Rosé Pine" },
  { id: "cur-font-solarized_dark", name: "Font Solarized", category: "Cur-Font X11", theme: "Solarized Dark" },
  { id: "cur-font-violet", name: "Font Violet", category: "Cur-Font X11", theme: "Electric Violet" },
  { id: "cur-font-white", name: "Font White", category: "Cur-Font X11", theme: "Clean White" }
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("catalog-container");
  const btnReset = document.getElementById("btn-reset");

  let currentActive = "";
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["activeCursor"], (res) => {
      currentActive = res.activeCursor || "";
      render();
    });
  } else {
    render();
  }

  function render() {
    container.innerHTML = "";
    const groups = {};
    KITS.forEach(k => {
      if (!groups[k.category]) groups[k.category] = [];
      groups[k.category].push(k);
    });

    Object.keys(groups).forEach(cat => {
      const header = document.createElement("div");
      header.className = "section-title";
      header.textContent = cat;
      container.appendChild(header);

      const grid = document.createElement("div");
      grid.className = "grid";

      groups[cat].forEach(k => {
        const card = document.createElement("div");
        card.className = "card" + (currentActive === k.id ? " active" : "");
        card.innerHTML = `
          <div class="icon-box">
            <img src="cursors/${k.id}_arrow.png" alt="${k.name}">
          </div>
          <div class="card-info">
            <div class="card-name">${k.name}</div>
            <div class="card-theme">${k.theme}</div>
          </div>
        `;

        card.addEventListener("click", () => {
          currentActive = k.id;
          if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ activeCursor: k.id }, () => {
              render();
            });
          } else {
            render();
          }
        });

        grid.appendChild(card);
      });

      container.appendChild(grid);
    });
  }

  btnReset.addEventListener("click", () => {
    currentActive = "";
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ activeCursor: "" }, () => {
        render();
      });
    } else {
      render();
    }
  });
});

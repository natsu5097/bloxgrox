// script.js
document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) spinner.style.display = "block";

  // ---------- helpers ----------
  function groupByRarity(items) {
    if (!Array.isArray(items)) return {};
    return items.reduce((groups, item) => {
      const key = item.rarity || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }

  function safeText(v) {
    return v === undefined || v === null ? "" : String(v);
  }

  function renderGroupedTables(groups, containerId, columns) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    Object.keys(groups).forEach(groupName => {
      const section = document.createElement("section");
      section.classList.add("collapsible-section");

      const header = document.createElement("h3");
      header.textContent = groupName;
      header.classList.add("collapsible-header");

      const tableWrapper = document.createElement("div");
      tableWrapper.classList.add("collapsible-content");

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      thead.innerHTML = `<tr>${columns.map(c => `<th>${c.header}</th>`).join("")}</tr>`;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      groups[groupName].forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = columns.map(c => {
          if (c.key === "image_url") {
            const src = safeText(item[c.key]) || "images/placeholder.png";
            const alt = safeText(item.name) || "";
            return `<td><img src="${src}" alt="${alt}" style="width:40px;height:40px;object-fit:contain"></td>`;
          }
          const txt = c.format ? c.format(item[c.key]) : safeText(item[c.key]);
          return `<td>${txt}</td>`;
        }).join("");
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tableWrapper.appendChild(table);

      section.appendChild(header);
      section.appendChild(tableWrapper);
      container.appendChild(section);

      header.addEventListener("click", () => tableWrapper.classList.toggle("active"));
    });
  }

  // ---------- fetch + render ----------
  fetch("data.json")
    .then(async resp => {
      if (!resp.ok) {
        throw new Error(`Failed to fetch data.json (HTTP ${resp.status})`);
      }
      const text = await resp.text();

      if (!text.trim()) {
        throw new Error("data.json is empty!");
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("❌ JSON parse error:", e, "Raw text was:", text);
        throw e;
      }
    })
    .then(data => {
      if (spinner) spinner.style.display = "none";
      console.log("✅ JSON loaded successfully", data);

      // Fruits
      const fruitColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Type", key: "type" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Price (Robux)", key: "price_robux", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.fruits || []), "fruits-sections", fruitColumns);

      // Swords
      const swordColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Price (Robux)", key: "price_robux", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.swords || []), "swords-sections", swordColumns);

      // Fighting styles (group by sea)
      if (Array.isArray(data.fightingStyles)) {
        const grouped = data.fightingStyles.reduce((acc, style) => {
          const key = style.sea || "Unknown Sea";
          if (!acc[key]) acc[key] = [];
          acc[key].push(style);
          return acc;
        }, {});
        const fsColumns = [
          { header: "Image", key: "image_url" },
          { header: "Name", key: "name" },
          { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
          { header: "Description", key: "description" }
        ];
        renderGroupedTables(grouped, "fighting-styles-sections", fsColumns);
      }

      // Guns
      const gunColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.guns || []), "guns-sections", gunColumns);

      // Accessories
      const accessoryColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.accessories || []), "accessories-sections", accessoryColumns);

      // Races
      const raceColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables({ "All Races": data.races || [] }, "races-sections", raceColumns);

      // Locations
      const locationColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables({ "Game Worlds": data.locations || [] }, "locations-sections", locationColumns);

      // Updates
      const updatesBody = document.querySelector("#updates-table tbody");
      if (updatesBody && Array.isArray(data.updates)) {
        updatesBody.innerHTML = "";
        data.updates.forEach(u => {
          const r = document.createElement("tr");
          r.innerHTML = `<td>${safeText(u.version)}</td><td>${safeText(u.date)}</td><td>${safeText(u.details)}</td>`;
          updatesBody.appendChild(r);
        });
      }
    })
    .catch(err => {
      if (spinner) spinner.style.display = "none";
      console.error("❌ Error loading JSON:", err);
      const main = document.querySelector("main") || document.body;
      if (main) {
        main.insertAdjacentHTML(
          "afterbegin",
          `<div style="background:#ffdddd;color:#900;padding:1em;margin:1em 0;border:1px solid red;">
            Failed to load <b>data.json</b>: ${err.message}
          </div>`
        );
      }
    });

  // ---------- UI helpers ----------
  const searchBar = document.getElementById("search-bar");
  const clearBtn = document.getElementById("clear-search");

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  if (searchBar) {
    searchBar.addEventListener("input", () => {
      const q = searchBar.value.trim();
      const qlc = q.toLowerCase();

      document.querySelectorAll("table tbody tr").forEach(row => {
        const txt = row.textContent.toLowerCase();
        const matches = !qlc || txt.includes(qlc);
        row.style.display = matches ? "" : "none";

        row.querySelectorAll("td").forEach(td => {
          if (!qlc) {
            td.innerHTML = safeText(td.textContent);
          } else {
            const escaped = escapeRegExp(qlc);
            td.innerHTML = td.textContent.replace(new RegExp(escaped, "gi"),
              m => `<span class="highlight">${m}</span>`);
          }
        });
      });

      if (clearBtn) clearBtn.style.display = q ? "inline-block" : "none";
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchBar) {
        searchBar.value = "";
        searchBar.dispatchEvent(new Event("input"));
      }
      clearBtn.style.display = "none";
    });
  }

  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      scrollTopBtn.style.display = (window.scrollY > 200) ? "block" : "none";
    });
    scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  const exp = document.getElementById("expandAll");
  const col = document.getElementById("collapseAll");
  if (exp) exp.addEventListener("click", () => document.querySelectorAll(".collapsible-content").forEach(c => c.classList.add("active")));
  if (col) col.addEventListener("click", () => document.querySelectorAll(".collapsible-content").forEach(c => c.classList.remove("active")));

  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    const icon = darkToggle.querySelector(".icon");

    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      icon.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    });
  }
});

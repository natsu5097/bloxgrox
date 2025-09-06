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
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.json();
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

      // Fighting styles
      const fsBody = document.querySelector("#fighting-styles-table tbody");
      if (fsBody && Array.isArray(data.fightingStyles)) {
        fsBody.innerHTML = "";
        data.fightingStyles.forEach(style => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><img src="${safeText(style.image_url) || 'images/placeholder.png'}" alt="${safeText(style.name)}" style="width:40px;height:40px;object-fit:contain"></td>
            <td>${safeText(style.name)}</td>
            <td>${style.price_money ? Number(style.price_money).toLocaleString() : ""}</td>
            <td>${safeText(style.description)}</td>
          `;
          fsBody.appendChild(tr);
        });
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
        main.insertAdjacentHTML("afterbegin",
          `<div style="background:#ffdddd;color:#900;padding:1em;margin:1em 0;border:1px solid red;">
            Failed to load <b>data.json</b>: ${err.message}
          </div>`
        );
      }
    });

  // ---------- UI helpers (search, expand/collapse, dark, scrollTop) ----------
  const searchBar = document.getElementById("search-bar");
  const clearBtn = document.getElementById("clear-search");
  if (searchBar) {
    searchBar.addEventListener("input", () => {
      const q = searchBar.value.trim().toLowerCase();
      // simple filter for all tables' rows
      document.querySelectorAll("table tbody tr").forEach(row => {
        const txt = row.innerText.toLowerCase();
        row.style.display = q === "" || txt.includes(q) ? "" : "none";
        // highlight
        row.querySelectorAll("td").forEach(td => {
          td.innerHTML = td.textContent.replace(new RegExp(q, "gi"), match => `<span class="highlight">${match}</span>`);
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

  // expand/collapse all
  const exp = document.getElementById("expandAll");
  const col = document.getElementById("collapseAll");
  if (exp) exp.addEventListener("click", () => document.querySelectorAll(".collapsible-content").forEach(c => c.classList.add("active")));
  if (col) col.addEventListener("click", () => document.querySelectorAll(".collapsible-content").forEach(c => c.classList.remove("active")));

  // dark mode toggle
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      darkToggle.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
  }
});

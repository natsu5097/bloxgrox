// script.js
document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) spinner.style.display = "block";

  // ---------- helpers ----------
  const formatPrice = v => v ? Number(v).toLocaleString() : "";
  const safeText = v => (v === undefined || v === null ? "" : String(v));

  function groupBy(items, keyFn) {
    if (!Array.isArray(items)) return {};
    return items.reduce((groups, item) => {
      const key = keyFn(item) || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }

  function renderGroupedTables(groups, containerId, columns) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    Object.entries(groups).forEach(([groupName, list]) => {
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
      list.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = columns.map(c => {
          if (c.key === "image_url") {
            const src = safeText(item[c.key]) || "images/placeholder.png";
            const alt = safeText(item.name) || "";
            return `<td><img src="${src}" alt="${alt}" width="40" height="40" style="object-fit:contain"></td>`;
          }
          const val = item[c.key];
          const txt = c.format ? c.format(val) : safeText(val);
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
      if (!resp.ok) throw new Error(`Failed to fetch data.json (HTTP ${resp.status})`);
      return resp.json();
    })
    .then(data => {
      if (spinner) spinner.style.display = "none";

      console.log("✅ JSON loaded successfully", data);

      renderGroupedTables(groupBy(data.fruits, i => i.rarity), "fruits-sections", [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Type", key: "type" },
        { header: "Price (Money)", key: "price_money", format: formatPrice },
        { header: "Price (Robux)", key: "price_robux", format: formatPrice },
        { header: "Description", key: "description" }
      ]);

      renderGroupedTables(groupBy(data.swords, i => i.rarity), "swords-sections", [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: formatPrice },
        { header: "Price (Robux)", key: "price_robux", format: formatPrice },
        { header: "Description", key: "description" }
      ]);

      if (Array.isArray(data.fightingStyles)) {
        const grouped = groupBy(data.fightingStyles, i => i.sea || "Unknown Sea");
        renderGroupedTables(grouped, "fighting-styles-sections", [
          { header: "Image", key: "image_url" },
          { header: "Name", key: "name" },
          { header: "Price (Money)", key: "price_money", format: formatPrice },
          { header: "Description", key: "description" }
        ]);
      }

      renderGroupedTables(groupBy(data.guns, i => i.rarity), "guns-sections", [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: formatPrice },
        { header: "Description", key: "description" }
      ]);

      renderGroupedTables(groupBy(data.accessories, i => i.rarity), "accessories-sections", [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: formatPrice },
        { header: "Description", key: "description" }
      ]);

      renderGroupedTables({ "All Races": data.races || [] }, "races-sections", [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Description", key: "description" }
      ]);

      renderGroupedTables({ "Game Worlds": data.locations || [] }, "locations-sections", [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Description", key: "description" }
      ]);

      const updatesBody = document.querySelector("#updates-table tbody");
      if (updatesBody && Array.isArray(data.updates)) {
        updatesBody.innerHTML = data.updates.map(u =>
          `<tr><td>${safeText(u.version)}</td><td>${safeText(u.date)}</td><td>${safeText(u.details)}</td></tr>`
        ).join("");
      }
    })
    .catch(err => {
      if (spinner) spinner.style.display = "none";
      console.error("❌ Error loading JSON:", err);
      const main = document.querySelector("main") || document.body;
      if (main) {
        main.insertAdjacentHTML("afterbegin",
          `<div style="background:#ffdddd;color:#900;padding:1em;margin:1em 0;border:1px solid red;">
            Failed to load <b>data.json</b>: ${safeText(err.message)}
          </div>`);
      }
    });

  // ---------- Search ----------
  const searchBar = document.getElementById("search-bar");
  const clearBtn = document.getElementById("clear-search");

  if (searchBar) {
    searchBar.addEventListener("input", () => {
      const query = searchBar.value.trim().toLowerCase();

      document.querySelectorAll("table tbody tr").forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = (!query || text.includes(query)) ? "" : "none";
      });

      if (clearBtn) clearBtn.style.display = query ? "inline-block" : "none";
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

  // ---------- Scroll to top ----------
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      scrollTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
    });
    scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ---------- Expand / Collapse ----------
  const exp = document.getElementById("expandAll");
  const col = document.getElementById("collapseAll");
  if (exp) exp.addEventListener("click", () => document.querySelectorAll(".collapsible-content").forEach(c => c.classList.add("active")));
  if (col) col.addEventListener("click", () => document.querySelectorAll(".collapsible-content").forEach(c => c.classList.remove("active")));

  // ---------- Dark Mode ----------
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    const icon = darkToggle.querySelector(".icon");

    // load preference
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      if (icon) icon.textContent = "☀️";
    }

    darkToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      if (icon) icon.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }
});

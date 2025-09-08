/* === script.js - Integrated ===
   Features:
   - fetches data.json
   - builds `allItems` array with category markers
   - renders per-category sections (fruits, swords, fightingStyles, etc.)
   - groups items by rarity inside each category (collapsible DataTables)
   - Fuse.js global search with clear button
   - Expand All / Collapse All controls
   - Scroll-to-top button
   - Dark Mode toggle
*/

document.addEventListener("DOMContentLoaded", async () => {
  // ---------- Setup ----------
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) spinner.style.display = "block";

  const searchInput = document.getElementById("search-input") || document.getElementById("search-box");
  const searchResults = document.getElementById("search-results");
  const clearSearchBtn = document.getElementById("clear-search");
  const expandAllBtn = document.getElementById("expandAll");
  const collapseAllBtn = document.getElementById("collapseAll");
  const scrollTopBtn = document.getElementById("scrollTopBtn") || document.getElementById("scrollToTop");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let allItems = [];
  let fuse = null;

  function safeText(v) {
    return v === undefined || v === null ? "" : String(v);
  }

  function groupByRarity(items) {
    return items.reduce((groups, item) => {
      const key = item.rarity || "Other";
      (groups[key] = groups[key] || []).push(item);
      return groups;
    }, {});
  }

  // ---------- Close search results ----------
  document.addEventListener("click", (e) => {
    if (searchResults && !searchResults.contains(e.target) && !searchInput.contains(e.target)) {
      searchResults.classList.remove("active");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchResults) {
      searchResults.classList.remove("active");
      if (clearSearchBtn) clearSearchBtn.style.display = "none";
      if (searchInput) searchInput.value = "";
    }
  });

  // ---------- Render grouped tables ----------
  function renderGroupedTables(groups, containerId, columns, category) {
    // ... your table rendering code here
  }

  // ---------- Render updates ----------
  function renderUpdates(updates) {
    // ... your updates code here
  }

  // ---------- Fuse.js ----------
  function initFuse(items) {
    fuse = new Fuse(items, {
      keys: ["name", "description", "short_description", "rarity", "type", "category"],
      threshold: 0.35,
      ignoreLocation: true
    });
  }

  function renderSearchResults(results) {
    // ... your results code here
  }

  // ---------- Wire up controls ----------
  // search input, clear button, expand/collapse, scrollToTop, dark mode toggle

  // ---------- Fetch + render ----------
  try {
    const resp = await fetch("data.json"); // ✅ adjust if not in root
    if (!resp.ok) throw new Error("Failed to fetch data.json");
    const data = await resp.json();

    // Build allItems for search
    allItems = [
      ...(data.fruits || []).map(i => ({ ...i, category: "fruits" })),
      ...(data.swords || []).map(i => ({ ...i, category: "swords" })),
      ...(data.fightingStyles || []).map(i => ({ ...i, category: "fightingStyles" })),
      ...(data.guns || []).map(i => ({ ...i, category: "guns" })),
      ...(data.accessories || []).map(i => ({ ...i, category: "accessories" })),
      ...(data.races || []).map(i => ({ ...i, category: "races" })),
      ...(data.locations || []).map(i => ({ ...i, category: "locations" })),
      ...(data.updates || []).map(i => ({ ...i, category: "updates" }))
    ];
    initFuse(allItems);

    // Render category sections
    renderGroupedTables(groupByRarity(data.fruits || []), "fruits-sections", [ /* ... */ ], "fruits");
    renderGroupedTables(groupByRarity(data.swords || []), "swords-sections", [ /* ... */ ], "swords");
    renderGroupedTables(groupByRarity(data.guns || []), "guns-sections", [ /* ... */ ], "guns");
    renderGroupedTables(groupByRarity(data.accessories || []), "accessories-sections", [ /* ... */ ], "accessories");
    renderGroupedTables({ "All Races": data.races || [] }, "races-sections", [ /* ... */ ], "races");
    renderGroupedTables({ "Locations": data.locations || [] }, "locations-sections", [ /* ... */ ], "locations");

    renderUpdates(data.updates || []);
  } catch (err) {
    console.error("Data load error:", err);
  } finally {
    if (spinner) spinner.style.display = "none";
  }
});

  // --------- Render grouped tables ----------
  function renderGroupedTables(groups, containerId, columns, category) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    Object.keys(groups).forEach(groupName => {
      const section = document.createElement("section");
      section.classList.add("collapsible-section");

      const header = document.createElement("h3");
      header.textContent = `${groupName} (${groups[groupName].length})`;
      header.classList.add("collapsible-header");

      const tableWrapper = document.createElement("div");
      tableWrapper.classList.add("collapsible-content");

      const table = document.createElement("table");
      table.classList.add("dataTable");

      const thead = document.createElement("thead");
      thead.innerHTML = `<tr>${columns.map(c => `<th>${c.header}</th>`).join("")}</tr>`;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      groups[groupName].forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = columns.map(c => {
          if (c.key === "image_url") {
            const src = safeText(item[c.key]) || "images/placeholder.png";
            return `<td><img src="${src}" alt="${safeText(item.name)}" style="width:40px;height:40px;object-fit:contain"></td>`;
          }
          const raw = item[c.key];
          const txt = c.format ? c.format(raw, item) : safeText(raw);
          return `<td>${txt}</td>`;
        }).join("");
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tableWrapper.appendChild(table);
      section.appendChild(header);
      section.appendChild(tableWrapper);
      container.appendChild(section);

      // collapsible + lazy DataTable
      let initialized = false;
      header.addEventListener("click", () => {
        header.classList.toggle("active");
        tableWrapper.classList.toggle("active");
        if (!initialized && tableWrapper.classList.contains("active")) {
          new DataTable(table, { paging: false, searchable: false, info: false });
          initialized = true;
        }
      });
    });
  }

  // --------- Render updates table ----------
  function renderUpdates(updates) {
    const updatesBody = document.querySelector("#updates-table tbody");
    if (!updatesBody) return;
    updatesBody.innerHTML = "";
    updates.forEach(u => {
      const r = document.createElement("tr");
      r.innerHTML = `
        <td><a href="item.html?category=updates&id=${u.id}">${safeText(u.version)}</a></td>
        <td>${safeText(u.date)}</td>
        <td>${safeText(u.details)}</td>
      `;
      updatesBody.appendChild(r);
    });
  }

  // --------- Fuse.js search ----------
  function initFuse(items) {
    fuse = new Fuse(items, {
      keys: ["name", "description", "short_description", "rarity", "type", "category"],
      threshold: 0.35,
      ignoreLocation: true
    });
  }

 function renderSearchResults(results) {
  if (!searchResults) return;
  searchResults.innerHTML = "";

  if (!results || results.length === 0) {
    searchResults.classList.remove("active"); // hide if no results
    searchResults.innerHTML = "<p>No results</p>";
    if (clearSearchBtn) clearSearchBtn.style.display = "none";
    return;
  }

  searchResults.classList.add("active"); // ✅ show results panel
  if (clearSearchBtn) clearSearchBtn.style.display = "inline-block";

  results.forEach(r => {
    const it = r.item || r;
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <img src="${safeText(it.image_url)}" alt="" />
      <div class="meta">
        <a href="item.html?category=${it.category}&id=${encodeURIComponent(it.id || it.name)}">
          <h3>${safeText(it.name)}</h3>
        </a>
        <p class="muted">${safeText(it.category)} • ${safeText(it.rarity)}</p>
        <p>${safeText(it.short_description || it.description || "")}</p>
      </div>
    `;
    searchResults.appendChild(card);
  });
}

  // --------- Wire up controls ----------
  if (searchInput) {
    let timer = null;
    searchInput.addEventListener("input", () => {
      clearTimeout(timer);
      const q = searchInput.value.trim();
      if (!q) {
        renderSearchResults([]);
        if (clearSearchBtn) clearSearchBtn.style.display = "none";
        return;
      }
      timer = setTimeout(() => {
        const res = fuse ? fuse.search(q, { limit: 50 }) : [];
        renderSearchResults(res);
      }, 200);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      renderSearchResults([]);
      clearSearchBtn.style.display = "none";
    });
  }

  if (expandAllBtn) {
    expandAllBtn.addEventListener("click", () => {
      document.querySelectorAll(".collapsible-content").forEach(c => {
        c.classList.add("active");
        const header = c.previousElementSibling;
        if (header) header.classList.add("active");
      });
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener("click", () => {
      document.querySelectorAll(".collapsible-content").forEach(c => c.classList.remove("active"));
      document.querySelectorAll(".collapsible-header").forEach(h => h.classList.remove("active"));
    });
  }

  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      scrollTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
    });
    scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // --------- Dark Mode ----------
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    const icon = darkToggle.querySelector(".icon");
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      if (icon) icon.textContent = "☀️";
    }
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        if (icon) icon.textContent = "☀️";
      } else {
        localStorage.setItem("theme", "light");
        if (icon) icon.textContent = "🌙";
      }
    });
  }

  // --------- Fetch + render ----------
  try {
    const resp = await fetch("data.json");
    if (!resp.ok) throw new Error("Failed to fetch data.json");
    const data = await resp.json();

    // build allItems for search
    allItems = [
      ...(data.fruits || []).map(i => ({ ...i, category: "fruits" })),
      ...(data.swords || []).map(i => ({ ...i, category: "swords" })),
      ...(data.fightingStyles || []).map(i => ({ ...i, category: "fightingStyles" })),
      ...(data.guns || []).map(i => ({ ...i, category: "guns" })),
      ...(data.accessories || []).map(i => ({ ...i, category: "accessories" })),
      ...(data.races || []).map(i => ({ ...i, category: "races" })),
      ...(data.locations || []).map(i => ({ ...i, category: "locations" })),
      ...(data.updates || []).map(i => ({ ...i, category: "updates" }))
    ];
    initFuse(allItems);

    // render per-category
    renderGroupedTables(groupByRarity(data.fruits || []), "fruits-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v,i)=>`<a href="item.html?category=fruits&id=${i.id}">${v}</a>` },
      { header: "Type", key: "type" },
      { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Price (Robux)", key: "price_robux", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Description", key: "description" }
    ], "fruits");

    renderGroupedTables(groupByRarity(data.swords || []), "swords-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v,i)=>`<a href="item.html?category=swords&id=${i.id}">${v}</a>` },
      { header: "Rarity", key: "rarity" },
      { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Price (Robux)", key: "price_robux", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Description", key: "description" }
    ], "swords");

    renderGroupedTables(groupByRarity(data.guns || []), "guns-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v,i)=>`<a href="item.html?category=guns&id=${i.id}">${v}</a>` },
      { header: "Rarity", key: "rarity" },
      { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Description", key: "description" }
    ], "guns");

    renderGroupedTables(groupByRarity(data.accessories || []), "accessories-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v,i)=>`<a href="item.html?category=accessories&id=${i.id}">${v}</a>` },
      { header: "Rarity", key: "rarity" },
      { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Description", key: "description" }
    ], "accessories");

    renderGroupedTables({ "All Races": data.races || [] }, "races-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v,i)=>`<a href="item.html?category=races&id=${i.id}">${v}</a>` },
      { header: "Description", key: "description" }
    ], "races");

    renderGroupedTables({ "Locations": data.locations || [] }, "locations-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v,i)=>`<a href="item.html?category=locations&id=${i.id}">${v}</a>` },
      { header: "Description", key: "description" }
    ], "locations");

    renderUpdates(data.updates || []);

  } catch (err) {
    console.error("Data load error:", err);
    const area = document.getElementById("tables-area");
    if (area) area.innerHTML = "<p class='error'>Failed to load data.</p>";
  } finally {
    if (spinner) spinner.style.display = "none";
  }
});

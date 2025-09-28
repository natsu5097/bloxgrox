document.addEventListener("DOMContentLoaded", async () => {
  const spinner = document.getElementById("loadingSpinner");
  const mainContent = document.querySelector("main");

  if (spinner) spinner.style.display = "block";

  const searchBox = document.getElementById("search-box");
  const searchResults = document.getElementById("search-results");
  const clearSearchBtn = document.getElementById("clear-search");
  const expandAllBtn = document.getElementById("expandAll");
  const collapseAllBtn = document.getElementById("collapseAll");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const darkToggle = document.getElementById("darkModeToggle");

  let allItems = [];
  let fuse = null;

  const safeText = v => (v === undefined || v === null ? "" : String(v));
  // inline 64x64 transparent PNG data URI as a final fallback when placeholder file is missing
  const placeholder = 'images/placeholder.png';
  const inlineFallback = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAAB49l3hAAAAJ0lEQVR42u3BMQEAAADCoPVPbQhPoAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwG4kAAc4b0/8AAAAASUVORK5CYII=';

  function groupByRarity(arr) {
    return (arr || []).reduce((acc, i) => {
      const r = i && i.rarity ? i.rarity : "Unknown";
      (acc[r] = acc[r] || []).push(i);
      return acc;
    }, {});
  }

  // Robust DataTable helper (supports different bundles/exports)
  function initDataTableSafe(table) {
    try {
      const ctor = window.DataTable || (window.simpleDatatables && window.simpleDatatables.DataTable) || window.simpleDatatables || null;
      if (!ctor) return null;
      // Some bundles export the ctor directly, others under DataTable property
      const C = ctor.DataTable ? ctor.DataTable : ctor;
      return new C(table, { searchable: false, paging: false, info: false });
    } catch (e) {
      // silently ignore if DataTable isn't available or fails
      console.warn('DataTable init failed:', e);
      return null;
    }
  }

  function renderGroupedTables(groups, containerId, columns) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    Object.keys(groups).forEach(groupName => {
      const list = groups[groupName] || [];
      const section = document.createElement("section");
      section.classList.add("collapsible-section");
      const header = document.createElement("h3");
      header.textContent = `${groupName} (${list.length})`;
      header.classList.add("collapsible-header");

      const tableWrapper = document.createElement("div");
      tableWrapper.classList.add("collapsible-content");

      const table = document.createElement("table");
      table.classList.add("dataTable");

      const thead = document.createElement("thead");
      thead.innerHTML = `<tr>${columns.map(c => `<th>${c.header}</th>`).join("")}</tr>`;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      list.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = columns.map(c => {
          if (c.key === "image_url") {
            // Use the item's image URL if present, otherwise the placeholder; also provide a safe onerror
            // handler that swaps to an inline data URL if the file doesn't exist or is blocked.
            const src = safeText(item[c.key]) || placeholder;
            return `<td><img src="${src}" alt="${safeText(item.name)}" loading="lazy" style="width:40px;height:40px;object-fit:contain" onerror="this.onerror=null;this.src='${inlineFallback}'"/></td>`;
          }
          return `<td>${c.format ? c.format(item[c.key], item) : safeText(item[c.key])}</td>`;
        }).join("");
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tableWrapper.appendChild(table);
      section.appendChild(header);
      section.appendChild(tableWrapper);
      container.appendChild(section);

      let initialized = false;
      header.addEventListener("click", () => {
        header.classList.toggle("active");
        tableWrapper.classList.toggle("active");
        if (!initialized && tableWrapper.classList.contains("active")) {
          initDataTableSafe(table);
          initialized = true;
        }
      });
    });
  }

  // Render fruits where each rarity key maps to an array of items (data.json uses this shape)
  function renderNestedFruits(fruitsData, containerId, columns) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    Object.keys(fruitsData || {}).forEach(rarity => {
      const group = fruitsData[rarity];
      if (!Array.isArray(group) || !group.length) return;

      const section = document.createElement("section");
      section.classList.add("collapsible-section");

      const header = document.createElement("h3");
      header.textContent = `${rarity} (${group.length})`;
      header.classList.add("collapsible-header");

      const tableWrapper = document.createElement("div");
      tableWrapper.classList.add("collapsible-content");

      const table = document.createElement("table");
      table.classList.add("dataTable");

      const thead = document.createElement("thead");
      thead.innerHTML = `<tr>${columns.map(c => `<th>${c.header}</th>`).join("")}</tr>`;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      group.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = columns.map(c => {
          if (c.key === "image_url") {
            const src = safeText(item[c.key]) || placeholder;
            return `<td><img src="${src}" alt="${safeText(item.name)}" loading="lazy" style="width:40px;height:40px;object-fit:contain" onerror="this.onerror=null;this.src='${inlineFallback}'"/></td>`;
          }
          return `<td>${c.format ? c.format(item[c.key], item) : safeText(item[c.key])}</td>`;
        }).join("");
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tableWrapper.appendChild(table);
      section.appendChild(header);
      section.appendChild(tableWrapper);
      container.appendChild(section);

      let initialized = false;
      header.addEventListener("click", () => {
        header.classList.toggle("active");
        tableWrapper.classList.toggle("active");
        if (!initialized && tableWrapper.classList.contains("active")) {
          initDataTableSafe(table);
          initialized = true;
        }
      });
    });
  }

  try {
    const resp = await fetch("data.json");
    if (!resp.ok) throw new Error("Failed to fetch data.json");
    const data = await resp.json();

    // Flatten fruits: data.Fruits is an object with rarity arrays
    const fruits = Object.values(data.Fruits || {}).flat().filter(Boolean).map(i => ({ ...i, category: 'Fruits' }));

    allItems = [
      ...fruits,
      ...((data.Swords || []).map(i => ({ ...i, category: 'Swords' }))),
      ...((data.Guns || []).map(i => ({ ...i, category: 'Guns' }))),
      ...((data.FightingStyles || []).map(i => ({ ...i, category: 'FightingStyles' }))),
      ...((data.Accessories || []).map(i => ({ ...i, category: 'Accessories' })))
    ];

    fuse = new Fuse(allItems, { keys: ["name", "description", "trivia"], threshold: 0.35 });

    renderNestedFruits(data.Fruits || {}, "fruits-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v, i) => `<a href="item.html?category=Fruits&id=${encodeURIComponent(i.id)}">${v}</a>` },
      { header: "Type", key: "type" },
      { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Price (Robux)", key: "price_robux", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Description", key: "description" }
    ]);

    renderGroupedTables(groupByRarity(data.Swords || []), "swords-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v, i) => `<a href="item.html?category=Swords&id=${encodeURIComponent(i.id)}">${v}</a>` },
      { header: "Rarity", key: "rarity" },
      { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Description", key: "description" }
    ]);

    renderGroupedTables(groupByRarity(data.Guns || []), "guns-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v, i) => `<a href="item.html?category=Guns&id=${encodeURIComponent(i.id)}">${v}</a>` },
      { header: "Rarity", key: "rarity" },
      { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
      { header: "Description", key: "description" }
    ]);

    renderGroupedTables(groupByRarity(data.FightingStyles || []), "fighting-styles-sections", [
      { header: "Image", key: "image_url" },
      { header: "Name", key: "name", format: (v, i) => `<a href="item.html?category=FightingStyles&id=${encodeURIComponent(i.id)}">${v}</a>` },
      { header: "Rarity", key: "rarity" },
      { header: "Description", key: "description" }
    ]);

  } catch (err) {
    console.error(err);
    if (mainContent) {
      mainContent.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">\u26a0\ufe0f Failed to load data.json. Check console for details.</p>`;
    }
  } finally {
    if (spinner) spinner.style.display = "none";
  }

  // Search functionality
  if (searchBox) {
    searchBox.addEventListener("input", () => {
      const q = searchBox.value.trim();
      if (!q) {
        if (searchResults) searchResults.innerHTML = "";
        if (searchResults) searchResults.classList.remove("active");
        if (clearSearchBtn) clearSearchBtn.style.display = "none";
        return;
      }
      const res = fuse ? fuse.search(q, { limit: 50 }) : [];
      if (searchResults) searchResults.innerHTML = "";
      res.forEach(r => {
        const it = r.item || r;
        const card = document.createElement("div");
        card.className = "result-card";
        const imgsrc = (it && it.image_url) ? safeText(it.image_url) : placeholder;
        // Use same inline fallback for result images and add accessibility attributes
        card.innerHTML = `
          <img src="${imgsrc}" alt="${safeText(it.name)}" loading="lazy" onerror="this.onerror=null;this.src='${inlineFallback}'"/>
          <div class="meta">
            <a href="item.html?category=${encodeURIComponent(it.category || '')}&id=${encodeURIComponent(it.id || it.name)}">
              <h3>${safeText(it.name)}</h3>
            </a>
            <p>${safeText(it.category)}</p>
            <p>${safeText(it.description || "")}</p>
          </div>
        `;
        searchResults.appendChild(card);
      });
      // show/hide the search overlay depending on whether we have results
      if (searchResults) {
        if (res && res.length > 0) searchResults.classList.add('active');
        else searchResults.classList.remove('active');
      }
      if (clearSearchBtn) clearSearchBtn.style.display = res && res.length > 0 ? "inline-block" : "none";
    });
  }

  if (clearSearchBtn) clearSearchBtn.addEventListener("click", () => {
    if (searchBox) searchBox.value = "";
    if (searchResults) searchResults.innerHTML = "";
    if (searchResults) searchResults.classList.remove("active");
    clearSearchBtn.style.display = "none";
  });

  // Expand/collapse all
  if (expandAllBtn) expandAllBtn.addEventListener("click", () => { document.querySelectorAll(".collapsible-content").forEach(c => c.classList.add("active")); document.querySelectorAll(".collapsible-header").forEach(h => h.classList.add("active")); });
  if (collapseAllBtn) collapseAllBtn.addEventListener("click", () => { document.querySelectorAll(".collapsible-content").forEach(c => c.classList.remove("active")); document.querySelectorAll(".collapsible-header").forEach(h => h.classList.remove("active")); });

  // Scroll top
  if (scrollTopBtn) { window.addEventListener("scroll", () => { scrollTopBtn.style.display = window.scrollY > 200 ? "block" : "none"; }); scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" })); }

  // Dark mode
  if (darkToggle) {
    const icon = darkToggle.querySelector(".icon");
    if (localStorage.getItem("theme") === "dark") { document.body.classList.add("dark"); if (icon) icon.textContent = "\u2600\ufe0f"; }
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      if (document.body.classList.contains("dark")) { localStorage.setItem("theme", "dark"); if (icon) icon.textContent = "\u2600\ufe0f"; }
      else { localStorage.setItem("theme", "light"); if (icon) icon.textContent = "\ud83c\udf19"; }
    });
  }
});

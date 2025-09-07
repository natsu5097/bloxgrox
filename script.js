document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) spinner.style.display = "block";

  let fuse;
  let allItems = [];

  // ---------- helpers ----------
  function safeText(v) {
    return v === undefined || v === null ? "" : String(v);
  }

  function groupByRarity(items) {
    if (!Array.isArray(items)) return {};
    return items.reduce((groups, item) => {
      const key = item.rarity || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }

  // ---------- render grouped tables ----------
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
      table.classList.add("datatable");

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

      // Collapsible + DataTables init
      let initialized = false;
      header.addEventListener("click", () => {
        header.classList.toggle("active"); // 🔥 arrow flips
        tableWrapper.classList.toggle("active");
        if (!initialized && tableWrapper.classList.contains("active")) {
          new DataTable(table, {
            paging: false,
            searching: false,
            info: false
          });
          initialized = true;
        }
      });
    });
  }

  // ---------- fetch + render ----------
  fetch("data.json")
    .then(resp => resp.json())
    .then(data => {
      if (spinner) spinner.style.display = "none";

      // Prepare allItems for Fuse.js
      allItems = [
        ...(data.fruits || []).map(item => ({ ...item, category: "fruits" })),
        ...(data.fightingStyles || []).map(item => ({ ...item, category: "fightingStyles" })),
        ...(data.swords || []).map(item => ({ ...item, category: "swords" })),
        ...(data.guns || []).map(item => ({ ...item, category: "guns" })),
        ...(data.accessories || []).map(item => ({ ...item, category: "accessories" })),
        ...(data.races || []).map(item => ({ ...item, category: "races" })),
        ...(data.locations || []).map(item => ({ ...item, category: "locations" })),
        ...(data.updates || []).map(item => ({ ...item, category: "updates" }))
      ];

      // Initialize Fuse.js
      fuse = new Fuse(allItems, {
        keys: ["name", "description", "rarity", "type", "category"],
        threshold: 0.3
      });

      // Fruits
      const fruitColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=fruits&id=${item.id}">${v}</a>` },
        { header: "Type", key: "type" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Price (Robux)", key: "price_robux", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.fruits || []), "fruits-sections", fruitColumns);

      // Swords
      const swordColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=swords&id=${item.id}">${v}</a>` },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Price (Robux)", key: "price_robux", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.swords || []), "swords-sections", swordColumns);

      // Fighting Styles
      if (Array.isArray(data.fightingStyles)) {
        const grouped = data.fightingStyles.reduce((acc, style) => {
          const key = style.sea || "Unknown Sea";
          if (!acc[key]) acc[key] = [];
          acc[key].push(style);
          return acc;
        }, {});
        const fsColumns = [
          { header: "Image", key: "image_url" },
          { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=fightingStyles&id=${item.id}">${v}</a>` },
          { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
          { header: "Description", key: "description" }
        ];
        renderGroupedTables(grouped, "fighting-styles-sections", fsColumns);
      }

      // Guns
      const gunColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=guns&id=${item.id}">${v}</a>` },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.guns || []), "guns-sections", gunColumns);

      // Accessories
      const accessoryColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=accessories&id=${item.id}">${v}</a>` },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.accessories || []), "accessories-sections", accessoryColumns);

      // Races
      const raceColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=races&id=${item.id}">${v}</a>` },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables({ "All Races": data.races || [] }, "races-sections", raceColumns);

      // Locations
      const locationColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=locations&id=${item.id}">${v}</a>` },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables({ "Game Worlds": data.locations || [] }, "locations-sections", locationColumns);

      // Updates
      const updatesBody = document.querySelector("#updates-table tbody");
      if (updatesBody && Array.isArray(data.updates)) {
        updatesBody.innerHTML = "";
        data.updates.forEach(u => {
          const r = document.createElement("tr");
          r.innerHTML = `
            <td><a href="item.html?category=updates&id=${u.id}">${safeText(u.version)}</a></td>
            <td>${safeText(u.date)}</td>
            <td>${safeText(u.details)}</td>
          `;
          updatesBody.appendChild(r);
        });
      }
    })
    .catch(err => {
      if (spinner) spinner.style.display = "none";
      console.error("❌ Error loading JSON:", err);
    });

  // ---------- Fuse.js search ----------
  function renderResults(results) {
    const container = document.getElementById("search-results");
    container.innerHTML = "";

    if (results.length === 0) {
      container.innerHTML = "<p>No results found.</p>";
      return;
    }

    results.forEach(({ item }) => {
      const card = document.createElement("div");
      card.classList.add("result-card");

      card.innerHTML = `
        <h3><a href="item.html?category=${item.category}&id=${item.id}">${item.name}</a> <small>(${item.category})</small></h3>
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" />` : ""}
        <p>${item.description || "No description available."}</p>
        ${item.rarity ? `<p><b>Rarity:</b> ${item.rarity}</p>` : ""}
        ${item.type ? `<p><b>Type:</b> ${item.type}</p>` : ""}
        ${item.price_money ? `<p><b>Price:</b> ${item.price_money}</p>` : ""}
      `;

      container.appendChild(card);
    });
  }

  const searchInput = document.getElementById("search-box");
  const clearBtn = document.getElementById("clear-search");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      if (!query) {
        document.getElementById("search-results").innerHTML = "";
        return;
      }
      const results = fuse.search(query);
      renderResults(results);
      if (clearBtn) clearBtn.style.display = query ? "inline-block" : "none";
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
      }
      clearBtn.style.display = "none";
    });
  }

  // ---------- Scroll to top ----------
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      scrollTopBtn.style.display = (window.scrollY > 200) ? "block" : "none";
    });
    scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ---------- Expand/Collapse ----------
  const exp = document.getElementById("expandAll");
  const col = document.getElementById("collapseAll");
  if (exp) exp.addEventListener("click", () => {
    document.querySelectorAll(".collapsible-header").forEach(h => h.classList.add("active"));
    document.querySelectorAll(".collapsible-content").forEach(c => c.classList.add("active"));
  });
  if (col) col.addEventListener("click", () => {
    document.querySelectorAll(".collapsible-header").forEach(h => h.classList.remove("active"));
    document.querySelectorAll(".collapsible-content").forEach(c => c.classList.remove("active"));
  });

  // ---------- Dark Mode ----------
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    const icon = darkToggle.querySelector(".icon");
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      icon.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) spinner.style.display = "block";

  let fuse;
  let allItems = [];

  // ---------- helpers ----------
  function safeText(v) {
    return v === undefined || v === null ? "" : String(v);
  }

  function groupByRarity(items) {
    if (!Array.isArray(items)) return {};
    return items.reduce((groups, item) => {
      const key = item.rarity || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }

  // ---------- render grouped tables ----------
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
      table.classList.add("datatable");

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

      // Collapsible + DataTables init
      let initialized = false;
      header.addEventListener("click", () => {
        header.classList.toggle("active"); // 🔥 arrow flips
        tableWrapper.classList.toggle("active");
        if (!initialized && tableWrapper.classList.contains("active")) {
          new DataTable(table, {
            paging: false,
            searching: false,
            info: false
          });
          initialized = true;
        }
      });
    });
  }

  // ---------- fetch + render ----------
  fetch("data.json")
    .then(resp => resp.json())
    .then(data => {
      if (spinner) spinner.style.display = "none";

      // Prepare allItems for Fuse.js
      allItems = [
        ...(data.fruits || []).map(item => ({ ...item, category: "fruits" })),
        ...(data.fightingStyles || []).map(item => ({ ...item, category: "fightingStyles" })),
        ...(data.swords || []).map(item => ({ ...item, category: "swords" })),
        ...(data.guns || []).map(item => ({ ...item, category: "guns" })),
        ...(data.accessories || []).map(item => ({ ...item, category: "accessories" })),
        ...(data.races || []).map(item => ({ ...item, category: "races" })),
        ...(data.locations || []).map(item => ({ ...item, category: "locations" })),
        ...(data.updates || []).map(item => ({ ...item, category: "updates" }))
      ];

      // Initialize Fuse.js
      fuse = new Fuse(allItems, {
        keys: ["name", "description", "rarity", "type", "category"],
        threshold: 0.3
      });

      // Fruits
      const fruitColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=fruits&id=${item.id}">${v}</a>` },
        { header: "Type", key: "type" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Price (Robux)", key: "price_robux", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.fruits || []), "fruits-sections", fruitColumns);

      // Swords
      const swordColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=swords&id=${item.id}">${v}</a>` },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Price (Robux)", key: "price_robux", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.swords || []), "swords-sections", swordColumns);

      // Fighting Styles
      if (Array.isArray(data.fightingStyles)) {
        const grouped = data.fightingStyles.reduce((acc, style) => {
          const key = style.sea || "Unknown Sea";
          if (!acc[key]) acc[key] = [];
          acc[key].push(style);
          return acc;
        }, {});
        const fsColumns = [
          { header: "Image", key: "image_url" },
          { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=fightingStyles&id=${item.id}">${v}</a>` },
          { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
          { header: "Description", key: "description" }
        ];
        renderGroupedTables(grouped, "fighting-styles-sections", fsColumns);
      }

      // Guns
      const gunColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=guns&id=${item.id}">${v}</a>` },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.guns || []), "guns-sections", gunColumns);

      // Accessories
      const accessoryColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=accessories&id=${item.id}">${v}</a>` },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money", format: v => v ? Number(v).toLocaleString() : "" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.accessories || []), "accessories-sections", accessoryColumns);

      // Races
      const raceColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=races&id=${item.id}">${v}</a>` },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables({ "All Races": data.races || [] }, "races-sections", raceColumns);

      // Locations
      const locationColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name", format: (v, item) => `<a href="item.html?category=locations&id=${item.id}">${v}</a>` },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables({ "Game Worlds": data.locations || [] }, "locations-sections", locationColumns);

      // Updates
      const updatesBody = document.querySelector("#updates-table tbody");
      if (updatesBody && Array.isArray(data.updates)) {
        updatesBody.innerHTML = "";
        data.updates.forEach(u => {
          const r = document.createElement("tr");
          r.innerHTML = `
            <td><a href="item.html?category=updates&id=${u.id}">${safeText(u.version)}</a></td>
            <td>${safeText(u.date)}</td>
            <td>${safeText(u.details)}</td>
          `;
          updatesBody.appendChild(r);
        });
      }
    })
    .catch(err => {
      if (spinner) spinner.style.display = "none";
      console.error("❌ Error loading JSON:", err);
    });

  // ---------- Fuse.js search ----------
  function renderResults(results) {
    const container = document.getElementById("search-results");
    container.innerHTML = "";

    if (results.length === 0) {
      container.innerHTML = "<p>No results found.</p>";
      return;
    }

    results.forEach(({ item }) => {
      const card = document.createElement("div");
      card.classList.add("result-card");

      card.innerHTML = `
        <h3><a href="item.html?category=${item.category}&id=${item.id}">${item.name}</a> <small>(${item.category})</small></h3>
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" />` : ""}
        <p>${item.description || "No description available."}</p>
        ${item.rarity ? `<p><b>Rarity:</b> ${item.rarity}</p>` : ""}
        ${item.type ? `<p><b>Type:</b> ${item.type}</p>` : ""}
        ${item.price_money ? `<p><b>Price:</b> ${item.price_money}</p>` : ""}
      `;

      container.appendChild(card);
    });
  }

  const searchInput = document.getElementById("search-box");
  const clearBtn = document.getElementById("clear-search");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      if (!query) {
        document.getElementById("search-results").innerHTML = "";
        return;
      }
      const results = fuse.search(query);
      renderResults(results);
      if (clearBtn) clearBtn.style.display = query ? "inline-block" : "none";
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
      }
      clearBtn.style.display = "none";
    });
  }

  // ---------- Scroll to top ----------
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      scrollTopBtn.style.display = (window.scrollY > 200) ? "block" : "none";
    });
    scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ---------- Expand/Collapse ----------
  const exp = document.getElementById("expandAll");
  const col = document.getElementById("collapseAll");
  if (exp) exp.addEventListener("click", () => {
    document.querySelectorAll(".collapsible-header").forEach(h => h.classList.add("active"));
    document.querySelectorAll(".collapsible-content").forEach(c => c.classList.add("active"));
  });
  if (col) col.addEventListener("click", () => {
    document.querySelectorAll(".collapsible-header").forEach(h => h.classList.remove("active"));
    document.querySelectorAll(".collapsible-content").forEach(c => c.classList.remove("active"));
  });

  // ---------- Dark Mode ----------
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    const icon = darkToggle.querySelector(".icon");
    darkToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      icon.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    });
  }
});

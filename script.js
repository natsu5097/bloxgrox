// ========== Utility ==========
function groupByRarity(items) {
  return items.reduce((groups, item) => {
    const rarity = item.rarity || "Other";
    if (!groups[rarity]) groups[rarity] = [];
    groups[rarity].push(item);
    return groups;
  }, {});
}

function renderGroupedTables(groups, containerId, columns) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  Object.keys(groups).forEach(rarity => {
    const section = document.createElement("section");
    section.classList.add("collapsible-section");

    const header = document.createElement("h3");
    header.textContent = rarity;
    header.classList.add("collapsible-header");

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("collapsible-content");

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr>${columns.map(c => `<th>${c.header}</th>`).join("")}</tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    groups[rarity].forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = columns.map(c =>
        c.key === "image_url"
          ? `<td><img src="${item[c.key] || "images/placeholder.png"}" alt="${item.name || ""}" style="width:40px;height:40px;"></td>`
          : `<td>${item[c.key] !== undefined ? item[c.key] : ""}</td>`
      ).join("");
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    section.appendChild(header);
    section.appendChild(tableWrapper);
    container.appendChild(section);

    header.addEventListener("click", () => {
      tableWrapper.classList.toggle("active");
    });
  });
}

// ========== Main ==========
document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("loadingSpinner");
  spinner.style.display = "block";

  fetch("data.json")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      spinner.style.display = "none";
      console.log("✅ JSON loaded successfully");

      // Fruits
      const fruitColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Type", key: "type" },
        { header: "Price (Money)", key: "price_money" },
        { header: "Price (Robux)", key: "price_robux" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.fruits), "fruits-sections", fruitColumns);

      // Swords
      const swordColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money" },
        { header: "Price (Robux)", key: "price_robux" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.swords), "swords-sections", swordColumns);

      // Fighting Styles
      const fightingStylesTableBody = document.querySelector("#fighting-styles-table tbody");
      data.fightingStyles.forEach(style => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><img src="${style.image_url || "images/placeholder.png"}" alt="${style.name || ""}" style="width:40px;height:40px;"></td>
          <td>${style.name || ""}</td>
          <td>${style.price_money ? style.price_money.toLocaleString() : ""}</td>
          <td>${style.description || ""}</td>
        `;
        fightingStylesTableBody.appendChild(row);
      });

      // Guns
      const gunColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.guns), "guns-sections", gunColumns);

      // Accessories
      const accessoryColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Rarity", key: "rarity" },
        { header: "Price (Money)", key: "price_money" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables(groupByRarity(data.accessories), "accessories-sections", accessoryColumns);

      // Races
      const raceColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables({ "All Races": data.races }, "races-sections", raceColumns);

      // Locations
      const locationColumns = [
        { header: "Image", key: "image_url" },
        { header: "Name", key: "name" },
        { header: "Description", key: "description" }
      ];
      renderGroupedTables({ "Game Worlds": data.locations }, "locations-sections", locationColumns);

      // Updates
      const updatesTableBody = document.querySelector("#updates-table tbody");
      data.updates.forEach(update => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${update.version}</td>
          <td>${update.date}</td>
          <td>${update.details}</td>
        `;
        updatesTableBody.appendChild(row);
      });
    })
    .catch(error => {
      spinner.style.display = "none";
      console.error("❌ Error loading JSON:", error);
      document.querySelector("main").insertAdjacentHTML(
        "afterbegin",
        `<div style="background:#ffdddd;color:#900;padding:1em;margin:1em 0;border:1px solid red;">
          Failed to load <b>data.json</b>: ${error.message}
        </div>`
      );
    });

  // ========== Extra Features ==========

  // Scroll to Top
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  window.addEventListener("scroll", () => {
    scrollTopBtn.style.display =
      document.body.scrollTop > 200 || document.documentElement.scrollTop > 200
        ? "block"
        : "none";
  });
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Clear search
  const searchBar = document.getElementById("search-bar");
  const clearBtn = document.getElementById("clear-search");
  searchBar.addEventListener("input", () => {
    clearBtn.style.display = searchBar.value ? "inline-block" : "none";
  });
  clearBtn.addEventListener("click", () => {
    searchBar.value = "";
    clearBtn.style.display = "none";
    searchBar.dispatchEvent(new Event("input"));
  });

  // Filters
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.filter;
      document.querySelectorAll("main > section").forEach(sec => {
        sec.style.display = sec.id === target ? "block" : "none";
      });
    });
  });

  // Expand / Collapse
  document.getElementById("expandAll").addEventListener("click", () => {
    document.querySelectorAll(".collapsible-content").forEach(c => c.classList.add("active"));
  });
  document.getElementById("collapseAll").addEventListener("click", () => {
    document.querySelectorAll(".collapsible-content").forEach(c => c.classList.remove("active"));
  });

  // Dark Mode
  const body = document.body;
  const darkToggle = document.getElementById("darkModeToggle");
  darkToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    darkToggle.textContent = body.classList.contains("dark")
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";
  });

  // Active nav link on scroll
  const links = document.querySelectorAll("#navbar a");
  window.addEventListener("scroll", () => {
    let current = "";
    document.querySelectorAll("main section").forEach(sec => {
      const secTop = sec.offsetTop - 80;
      if (scrollY >= secTop) current = sec.id;
    });
    links.forEach(a => {
      a.classList.remove("active");
      if (a.getAttribute("href") === "#" + current) a.classList.add("active");
    });
  });

  // Search filter + highlight
  searchBar.addEventListener("input", () => {
    const text = searchBar.value.toLowerCase();

    function filterTable(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const rows = container.querySelectorAll("tbody tr");
      rows.forEach(row => {
        const rowText = row.innerText.toLowerCase();
        row.style.display = rowText.includes(text) ? "" : "none";

        // Highlight text
        row.querySelectorAll("td").forEach(td => {
          td.innerHTML = td.textContent.replace(
            new RegExp(text, "gi"),
            match => `<span class="highlight">${match}</span>`
          );
        });
      });
    }

    filterTable("fruits-sections");
    filterTable("swords-sections");
    filterTable("guns-sections");
    filterTable("accessories-sections");
    filterTable("races-sections");
    filterTable("locations-sections");

    // Fighting styles
    document.querySelectorAll("#fighting-styles-table tbody tr").forEach(row => {
      const textContent = row.innerText.toLowerCase();
      row.style.display = textContent.includes(text) ? "" : "none";
    });

    // Updates
    document.querySelectorAll("#updates-table tbody tr").forEach(row => {
      const textContent = row.innerText.toLowerCase();
      row.style.display = textContent.includes(text) ? "" : "none";
    });
  });
});

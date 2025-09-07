document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const id = params.get("id");

  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      const items = data[category] || [];
      const item = items.find(i => i.id === id);

      if (!item) {
        document.getElementById("item-name").textContent = "Item Not Found";
        document.getElementById("item-details").innerHTML =
          "<p>Sorry, this item does not exist in the database.</p>";
        return;
      }

      // ✅ Page title + heading
      document.title = `${item.name} - BloxGrox Wiki`;
      document.getElementById("item-name").textContent = item.name;



      // ✅ Infobox (right column)
      const infobox = document.getElementById("item-infobox");
      infobox.innerHTML = `
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" />` : ""}
        ${item.rarity ? `<p><b>Rarity:</b> ${item.rarity}</p>` : ""}
        ${item.type ? `<p><b>Type:</b> ${item.type}</p>` : ""}
        ${item.sea ? `<p><b>Sea:</b> ${item.sea}</p>` : ""}
        ${item.price_money ? `<p><b>Price (Money):</b> ${Number(item.price_money).toLocaleString()}</p>` : ""}
        ${item.price_robux ? `<p><b>Price (Robux):</b> ${Number(item.price_robux).toLocaleString()}</p>` : ""}
      `;

      // ✅ Wiki-style sections (left column)
      const sections = [
        {
          id: "description",
          title: "Description",
          content: `<p>${item.description || "No description available."}</p>`
        },
        {
          id: "moves",
          title: "Moves",
          content: item.moves
            ? `<ul>${item.moves.map(m => `<li>${m}</li>`).join("")}</ul>`
            : "<p>No moves listed.</p>"
        },
        {
          id: "stats",
          title: "Stats",
          content: item.stats
            ? `<table>
                ${Object.entries(item.stats)
                  .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v}</td></tr>`)
                  .join("")}
              </table>`
            : "<p>No stats available.</p>"
        },
        {
          id: "trivia",
          title: "Trivia",
          content: item.trivia
            ? `<ul>${item.trivia.map(t => `<li>${t}</li>`).join("")}</ul>`
            : "<p>No trivia available.</p>"
        },
        {
          id: "gallery",
          title: "Gallery",
          content: item.gallery
            ? `<div class="gallery">
                ${item.gallery.map(img => `<img src="${img}" alt="${item.name} gallery image">`).join("")}
              </div>`
            : "<p>No gallery images.</p>"
        }
      ];

      const details = document.getElementById("item-details");
      details.innerHTML = ""; // clear placeholder

      const sectionContainer = document.createElement("div");
      sectionContainer.id = "wiki-sections";

      sections.forEach((s, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("collapsible-section");

        const header = document.createElement("h2");
        header.textContent = s.title;
        header.id = `item-${s.id}`; // 🔗 anchor
        header.classList.add("collapsible-header");

        const content = document.createElement("div");
        content.classList.add("collapsible-content");
        content.innerHTML = s.content;

        // expand first section by default
        if (index === 0) {
          header.classList.add("active");
          content.classList.add("active");
        }

        wrapper.appendChild(header);
        wrapper.appendChild(content);
        sectionContainer.appendChild(wrapper);
      });

      details.appendChild(sectionContainer);

      // ✅ Collapsible toggle
      document.querySelectorAll(".collapsible-header").forEach(header => {
        header.addEventListener("click", () => {
          header.classList.toggle("active");
          const content = header.nextElementSibling;
          content.classList.toggle("active");
        });
      });

      // ✅ Expand/Collapse All
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

      // ✅ Breadcrumb
      const categoryNames = {
        fruits: "Fruits",
        swords: "Swords",
        fightingStyles: "Fighting Styles",
        guns: "Guns",
        accessories: "Accessories",
        races: "Races",
        locations: "Locations",
        updates: "Updates"
      };

      document.getElementById("breadcrumb-category").textContent =
        categoryNames[category] || category;
      document.getElementById("breadcrumb-item").textContent = item.name;
    })
    .catch(err => {
      console.error("❌ Error loading item:", err);
      document.getElementById("item-details").innerHTML =
        "<p>Failed to load item data.</p>";
    });
});

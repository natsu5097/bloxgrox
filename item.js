/* === item.js - auto-flattened version === */
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get("category");
  const idParam = params.get("id");
  const spinner = document.getElementById("loadingSpinner");

  if (spinner) spinner.style.display = "block";

  function safeText(v) { return v === undefined || v === null ? "" : String(v); }

  try {
    const resp = await fetch("data.json");
    if (!resp.ok) throw new Error("Failed to fetch data.json");
    const data = await resp.json();

    // Flatten categories recursively
    function flattenCategory(obj, categoryName) {
      let flat = [];
      if (Array.isArray(obj)) return obj.map(i => ({ ...i, category: categoryName }));
      if (typeof obj === "object") {
        for (const key in obj) {
          flat = flat.concat(flattenCategory(obj[key], categoryName));
        }
      }
      return flat;
    }

    const categories = ["fruits","fightingStyles","swords","guns","accessories","races","locations","updates"];
    let allItems = [];
    categories.forEach(cat => {
      if (data[cat]) allItems = allItems.concat(flattenCategory(data[cat], cat));
    });

    // Try to find item
    let item = null;
    if (categoryParam && data[categoryParam]) {
      const flatCat = flattenCategory(data[categoryParam], categoryParam);
      item = flatCat.find(i => String(i.id) === idParam);
    }
    if (!item) {
      item = allItems.find(i => String(i.id) === idParam);
    }

    if (!item) {
      document.getElementById("item-name").textContent = "Item Not Found";
      document.getElementById("item-details").innerHTML = "<p>Sorry, this item does not exist in the database.</p>";
      return;
    }

    // Page title + heading
    document.title = `${item.name} - BloxGrox Wiki`;
    document.getElementById("item-name").textContent = item.name;

    // Page description
    const pageDesc = document.getElementById("page-description");
    if (pageDesc) pageDesc.innerHTML = item.page_description || item.description || "No description available.";

    // Infobox
    const infobox = document.getElementById("item-infobox");
    if (infobox) {
      infobox.innerHTML = `
        ${item.image_url ? `<img src="${safeText(item.image_url)}" alt="${safeText(item.name)}" style="width:100%;">` : ""}
        ${item.rarity ? `<p><b>Rarity:</b> ${safeText(item.rarity)}</p>` : ""}
        ${item.type ? `<p><b>Type:</b> ${safeText(item.type)}</p>` : ""}
        ${item.price_money ? `<p><b>Price (Money):</b> ${Number(item.price_money).toLocaleString()}</p>` : ""}
        ${item.price_robux ? `<p><b>Price (Robux):</b> ${Number(item.price_robux).toLocaleString()}</p>` : ""}
        ${item._wiki_source ? `<p><a href="${safeText(item._wiki_source)}" target="_blank" rel="noopener">View on Wiki</a></p>` : ""}
      `;
    }

    // Collapsible wiki sections
    const sections = [
      {
        id: "description",
        title: "Description",
        content: `<p>${safeText(item.wiki_description || item.description || item.page_description || "No description available.")}</p>`
      },
      {
        id: "moves",
        title: "Moves",
        content: item.moves ? `<ul>${item.moves.map(m => `<li>${safeText(m)}</li>`).join("")}</ul>` : "<p>No moves listed.</p>"
      },
      {
        id: "stats",
        title: "Stats",
        content: item.stats ? `<table>${Object.entries(item.stats).map(([k,v])=>`<tr><td><b>${safeText(k)}</b></td><td>${safeText(v)}</td></tr>`).join("")}</table>` : "<p>No stats available.</p>"
      },
      {
        id: "trivia",
        title: "Trivia",
        content: item.trivia ? `<ul>${item.trivia.map(t=>`<li>${safeText(t)}</li>`).join("")}</ul>` : "<p>No trivia available.</p>"
      },
      {
        id: "gallery",
        title: "Gallery",
        content: item.gallery ? `<div class="gallery">${item.gallery.map(img=>`<img src="${safeText(img)}" alt="${safeText(item.name)} gallery">`).join("")}</div>` : "<p>No gallery images.</p>"
      }
    ];

    const details = document.getElementById("item-details");
    if (details) {
      details.innerHTML = "";
      const sectionContainer = document.createElement("div");
      sectionContainer.id = "wiki-sections";

      sections.forEach((s, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("collapsible-section");

        const header = document.createElement("h2");
        header.textContent = s.title;
        header.id = `item-${s.id}`;
        header.classList.add("collapsible-header");

        const content = document.createElement("div");
        content.classList.add("collapsible-content");
        content.innerHTML = s.content;

        if (index === 0) { header.classList.add("active"); content.classList.add("active"); }

        wrapper.appendChild(header);
        wrapper.appendChild(content);
        sectionContainer.appendChild(wrapper);
      });

      details.appendChild(sectionContainer);
    }

    // Collapsible toggle
    document.querySelectorAll(".collapsible-header").forEach(header => {
      header.addEventListener("click", () => {
        header.classList.toggle("active");
        const content = header.nextElementSibling;
        if (content) content.classList.toggle("active");
      });
    });

    // Expand/Collapse All
    const exp = document.getElementById("expandAll");
    const col = document.getElementById("collapseAll");
    if (exp) exp.addEventListener("click", () => {
      document.querySelectorAll(".collapsible-header").forEach(h=>h.classList.add("active"));
      document.querySelectorAll(".collapsible-content").forEach(c=>c.classList.add("active"));
    });
    if (col) col.addEventListener("click", () => {
      document.querySelectorAll(".collapsible-header").forEach(h=>h.classList.remove("active"));
      document.querySelectorAll(".collapsible-content").forEach(c=>c.classList.remove("active"));
    });

    // Breadcrumb
    const categoryNames = {
      fruits:"Fruits", swords:"Swords", fightingStyles:"Fighting Styles", guns:"Guns",
      accessories:"Accessories", races:"Races", locations:"Locations", updates:"Updates"
    };
    const bcCat = document.getElementById("breadcrumb-category");
    const bcItem = document.getElementById("breadcrumb-item");
    if (bcCat) bcCat.textContent = categoryNames[item.category] || item.category;
    if (bcItem) bcItem.textContent = item.name;

  } catch(err) {
    console.error("❌ Error loading item:", err);
    const details = document.getElementById("item-details");
    if(details) details.innerHTML="<p>Failed to load item data.</p>";
  } finally {
    if(spinner) spinner.style.display="none";
  }

  // Dark mode toggle
  const darkToggle = document.getElementById("darkModeToggle");
  if(darkToggle){
    const icon = darkToggle.querySelector(".icon");
    if(localStorage.getItem("theme")==="dark"){ document.body.classList.add("dark"); if(icon) icon.textContent="☀️"; }
    darkToggle.addEventListener("click", ()=>{
      document.body.classList.toggle("dark");
      if(document.body.classList.contains("dark")){
        localStorage.setItem("theme","dark"); if(icon) icon.textContent="☀️";
      } else {
        localStorage.setItem("theme","light"); if(icon) icon.textContent="🌙";
      }
    });
  }
});

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
        document.getElementById("item-details").innerHTML = "<p>Sorry, this item does not exist in the database.</p>";
        return;
      }

      // Set page title and heading
      document.title = `${item.name} - BloxGrox Wiki`;
      document.getElementById("item-name").textContent = item.name;

      // Render details
      document.getElementById("item-details").innerHTML = `
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" style="max-width:200px;display:block;margin-bottom:15px;">` : ""}
        
        ${item.rarity ? `<p><b>Rarity:</b> ${item.rarity}</p>` : ""}
        ${item.type ? `<p><b>Type:</b> ${item.type}</p>` : ""}
        ${item.sea ? `<p><b>Sea:</b> ${item.sea}</p>` : ""}

        ${item.price_money ? `<p><b>Price (Money):</b> ${Number(item.price_money).toLocaleString()}</p>` : ""}
        ${item.price_robux ? `<p><b>Price (Robux):</b> ${Number(item.price_robux).toLocaleString()}</p>` : ""}
        
        <p><b>Description:</b> ${item.description || "No description available."}</p>
      `;

      // ✅ Set breadcrumbs (must be inside .then so `item` is defined)
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

      document.getElementById("breadcrumb-category").textContent = categoryNames[category] || category;
      document.getElementById("breadcrumb-item").textContent = item.name;
    })
    .catch(err => {
      console.error("❌ Error loading item:", err);
      document.getElementById("item-details").innerHTML = "<p>Failed to load item data.</p>";
    });
});

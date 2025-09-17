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

  function safeText(v){ return v===undefined||v===null?"":String(v); }
  function groupByRarity(arr){ return arr.reduce((acc,i)=>{const r=i.rarity||"Unknown"; (acc[r]=acc[r]||[]).push(i); return acc; },{}); }

  function renderGroupedTables(groups, containerId, columns){
    const container=document.getElementById(containerId);
    if(!container) return;
    container.innerHTML="";
    Object.keys(groups).forEach(groupName=>{
      const section=document.createElement("section");
      section.classList.add("collapsible-section");
      const header=document.createElement("h3");
      header.textContent=`${groupName} (${groups[groupName].length})`;
      header.classList.add("collapsible-header");

      const tableWrapper=document.createElement("div");
      tableWrapper.classList.add("collapsible-content");

      const table=document.createElement("table");
      table.classList.add("dataTable");

      const thead=document.createElement("thead");
      thead.innerHTML=`<tr>${columns.map(c=>`<th>${c.header}</th>`).join("")}</tr>`;
      table.appendChild(thead);

      const tbody=document.createElement("tbody");
      groups[groupName].forEach(item=>{
        const row=document.createElement("tr");
        row.innerHTML=columns.map(c=>{
          if(c.key==="image_url"){ return `<td><img src="${item[c.key]||'images/placeholder.png'}" style="width:40px;height:40px;object-fit:contain"/></td>`; }
          return `<td>${c.format?c.format(item[c.key],item):safeText(item[c.key])}</td>`;
        }).join("");
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tableWrapper.appendChild(table);
      section.appendChild(header);
      section.appendChild(tableWrapper);
      container.appendChild(section);

      let initialized=false;
      header.addEventListener("click",()=>{
        header.classList.toggle("active");
        tableWrapper.classList.toggle("active");
        if(!initialized && tableWrapper.classList.contains("active")){
          new DataTable(table,{paging:false,searchable:false,info:false});
          initialized=true;
        }
      });
    });
  }

  function renderNestedFruits(fruitsData, containerId, columns){
    const container=document.getElementById(containerId);
    if(!container) return;
    container.innerHTML="";
    Object.keys(fruitsData).forEach(rarity=>{
      const types=fruitsData[rarity];
      Object.keys(types).forEach(type=>{
        const group=types[type];
        if(!group || !group.length) return;
        const section=document.createElement("section");
        section.classList.add("collapsible-section");

        const header=document.createElement("h3");
        header.textContent=`${rarity} • ${type} (${group.length})`;
        header.classList.add("collapsible-header");

        const tableWrapper=document.createElement("div");
        tableWrapper.classList.add("collapsible-content");

        const table=document.createElement("table");
        table.classList.add("dataTable");

        const thead=document.createElement("thead");
        thead.innerHTML=`<tr>${columns.map(c=>`<th>${c.header}</th>`).join("")}</tr>`;
        table.appendChild(thead);

        const tbody=document.createElement("tbody");
        group.forEach(item=>{
          const row=document.createElement("tr");
          row.innerHTML=columns.map(c=>{
            if(c.key==="image_url"){ return `<td><img src="${item[c.key]||'images/placeholder.png'}" style="width:40px;height:40px;object-fit:contain"/></td>`; }
            return `<td>${c.format?c.format(item[c.key],item):safeText(item[c.key])}</td>`;
          }).join("");
          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        section.appendChild(header);
        section.appendChild(tableWrapper);
        container.appendChild(section);

        let initialized=false;
        header.addEventListener("click",()=>{
          header.classList.toggle("active");
          tableWrapper.classList.toggle("active");
          if(!initialized && tableWrapper.classList.contains("active")){
            new DataTable(table,{paging:false,searchable:false,info:false});
            initialized=true;
          }
        });
      });
    });
  }

  try {
    const resp=await fetch("data.json");
    if(!resp.ok) throw new Error("Failed to fetch data.json");
    const data=await resp.json();

    allItems=[
      ...(Object.values(data.Fruits||{}).flatMap(rarity=> Object.values(rarity).flatMap(typeArr=>typeArr.map(i=>({...i,category:"Fruits"})))),
      ...(data.Swords||[]).map(i=>({...i,category:"Swords"})),
      ...(data.Guns||[]).map(i=>({...i,category:"Guns"})),
      ...(data.FightingStyles||[]).map(i=>({...i,category:"Fighting Styles"})),
      ...(data.Accessories||[]).map(i=>({...i,category:"Accessories"}))
    ];

    fuse=new Fuse(allItems,{ keys:["name","description","trivia"], threshold:0.35 });

    renderNestedFruits(data.Fruits||{}, "fruits-sections", [
      {header:"Image",key:"image_url"},
      {header:"Name",key:"name",format:(v,i)=>`<a href="item.html?category=Fruits&id=${i.id}">${v}</a>`},
      {header:"Type",key:"type"},
      {header:"Price (Money)",key:"price_money",format:v=>v?Number(v).toLocaleString():""},
      {header:"Price (Robux)",key:"price_robux",format:v=>v?Number(v).toLocaleString():""},
      {header:"Description",key:"description"}
    ]);

    renderGroupedTables(groupByRarity(data.Swords||[]),"swords-sections",[
      {header:"Image",key:"image_url"},
      {header:"Name",key:"name",format:(v,i)=>`<a href="item.html?category=Swords&id=${i.id}">${v}</a>`},
      {header:"Rarity",key:"rarity"},
      {header:"Price (Money)",key:"price_money",format:v=>v?Number(v).toLocaleString():""},
      {header:"Description",key:"description"}
    ]);

    renderGroupedTables(groupByRarity(data.Guns||[]),"guns-sections",[
      {header:"Image",key:"image_url"},
      {header:"Name",key:"name",format:(v,i)=>`<a href="item.html?category=Guns&id=${i.id}">${v}</a>`},
      {header:"Rarity",key:"rarity"},
      {header:"Price (Money)",key:"price_money",format:v=>v?Number(v).toLocaleString():""},
      {header:"Description",key:"description"}
    ]);

    renderGroupedTables(groupByRarity(data.FightingStyles||[]),"fighting-styles-sections",[
      {header:"Image",key:"image_url"},
      {header:"Name",key:"name",format:(v,i)=>`<a href="item.html?category=Fighting Styles&id=${i.id}">${v}</a>`},
      {header:"Rarity",key:"rarity"},
      {header:"Description",key:"description"}
    ]);

  } catch(err){
    console.error(err);
    if(mainContent){
      mainContent.innerHTML=`<p style="color:red; text-align:center; font-weight:bold;">⚠️ Failed to load data.json. Check console for details.</p>`;
    }
  } finally{
    if(spinner) spinner.style.display="none";
  }

  // Search functionality
  if(searchBox){
    searchBox.addEventListener("input", ()=>{
      const q=searchBox.value.trim();
      if(!q){ searchResults.innerHTML=""; searchResults.classList.remove("active"); if(clearSearchBtn) clearSearchBtn.style.display="none"; return; }
      const res=fuse?fuse.search(q,{limit:50}):[];
      searchResults.innerHTML="";
      res.forEach(r=>{
        const it=r.item||r;
        const card=document.createElement("div");
        card.className="result-card";
        card.innerHTML=`
          <img src="${safeText(it.image_url)}"/>
          <div class="meta">
            <a href="item.html?category=${it.category}&id=${encodeURIComponent(it.id||it.name)}">
              <h3>${safeText(it.name)}</h3>
            </a>
            <p>${safeText(it.category)}</p>
            <p>${safeText(it.description||"")}</p>
          </div>
        `;
        searchResults.appendChild(card);
      });
      if(clearSearchBtn) clearSearchBtn.style.display="inline-block";
    });
  }

  if(clearSearchBtn) clearSearchBtn.addEventListener("click",()=>{
    if(searchBox) searchBox.value="";
    searchResults.innerHTML=""; searchResults.classList.remove("active");
    clearSearchBtn.style.display="none";
  });

  // Expand/collapse all
  if(expandAllBtn) expandAllBtn.addEventListener("click",()=>{ document.querySelectorAll(".collapsible-content").forEach(c=>c.classList.add("active")); document.querySelectorAll(".collapsible-header").forEach(h=>h.classList.add("active")); });
  if(collapseAllBtn) collapseAllBtn.addEventListener("click",()=>{ document.querySelectorAll(".collapsible-content").forEach(c=>c.classList.remove("active")); document.querySelectorAll(".collapsible-header").forEach(h=>h.classList.remove("active")); });

  // Scroll top
  if(scrollTopBtn){ window.addEventListener("scroll",()=>{ scrollTopBtn.style.display=window.scrollY>200?"block":"none"; }); scrollTopBtn.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"})); }

  // Dark mode
  if(darkToggle){
    const icon=darkToggle.querySelector(".icon");
    if(localStorage.getItem("theme")==="dark"){ document.body.classList.add("dark"); if(icon) icon.textContent="☀️"; }
    darkToggle.addEventListener("click",()=>{
      document.body.classList.toggle("dark");
      if(document.body.classList.contains("dark")){ localStorage.setItem("theme","dark"); if(icon) icon.textContent="☀️"; } 
      else { localStorage.setItem("theme","light"); if(icon) icon.textContent="🌙"; }
    });
  }
});

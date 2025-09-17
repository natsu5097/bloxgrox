document.addEventListener("DOMContentLoaded", async () => {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) spinner.style.display = "block";

  const searchInput = document.getElementById("search-input") || document.getElementById("search-box");
  const searchResults = document.getElementById("search-results");
  const clearSearchBtn = document.getElementById("clear-search");
  const expandAllBtn = document.getElementById("expandAll");
  const collapseAllBtn = document.getElementById("collapseAll");
  const scrollTopBtn = document.getElementById("scrollTopBtn") || document.getElementById("scrollToTop");

  let allItems = [];
  let fuse = null;

  function safeText(v){ return v===undefined||v===null?"":String(v); }

  // ---------- Render grouped tables (flat arrays) ----------
  function renderGroupedTables(groups, containerId, columns){
    const container=document.getElementById(containerId);
    if(!container)return;
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
          if(c.key==="image_url"){
            const src=item[c.key]||"images/placeholder.png";
            return `<td><img src="${src}" alt="${item.name||""}" style="width:40px;height:40px;object-fit:contain"></td>`;
          }
          const raw=item[c.key];
          return `<td>${c.format?c.format(raw,item):(raw||"")}</td>`;
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

  // ---------- Render nested fruits ----------
  function renderNestedFruits(fruitsData, containerId, columns){
    const container=document.getElementById(containerId);
    if(!container)return;
    container.innerHTML="";

    Object.keys(fruitsData).forEach(rarity=>{
      const types=fruitsData[rarity];
      Object.keys(types).forEach(type=>{
        const group=types[type];
        if(!group||group.length===0) return;

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
            if(c.key==="image_url"){
              const src=item[c.key]||"images/placeholder.png";
              return `<td><img src="${src}" alt="${item.name||""}" style="width:40px;height:40px;object-fit:contain"></td>`;
            }
            const raw=item[c.key];
            return `<td>${c.format?c.format(raw,item):(raw||"")}</td>`;
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

  // ---------- Fuse.js Search ----------
  function initFuse(items){ fuse=new Fuse(items,{ keys:["name","description","short_description","rarity","type","category"], threshold:0.35, ignoreLocation:true }); }
  function renderSearchResults(results){
    if(!searchResults)return;
    searchResults.innerHTML="";
    if(!results||results.length===0){ searchResults.classList.remove("active"); searchResults.innerHTML="<p>No results</p>"; if(clearSearchBtn) clearSearchBtn.style.display="none"; return; }

    searchResults.classList.add("active");
    if(clearSearchBtn) clearSearchBtn.style.display="inline-block";

    results.forEach(r=>{
      const it=r.item||r;
      const card=document.createElement("div");
      card.className="result-card";
      card.innerHTML=`
        <img src="${safeText(it.image_url)}" alt="" />
        <div class="meta">
          <a href="item.html?category=${it.category}&id=${encodeURIComponent(it.id||it.name)}">
            <h3>${safeText(it.name)}</h3>
          </a>
          <p class="muted">${safeText(it.category)} • ${safeText(it.rarity)}</p>
          <p>${safeText(it.short_description||it.description||"")}</p>
        </div>
      `;
      searchResults.appendChild(card);
    });
  }

  if(searchInput){
    let timer=null;
    searchInput.addEventListener("input",()=>{
      clearTimeout(timer);
      const q=searchInput.value.trim();
      if(!q){ renderSearchResults([]); if(clearSearchBtn) clearSearchBtn.style.display="none"; return; }
      timer=setTimeout(()=>{ const res=fuse?fuse.search(q,{limit:50}):[]; renderSearchResults(res); },200);
    });
  }
  if(clearSearchBtn) clearSearchBtn.addEventListener("click",()=>{ if(searchInput) searchInput.value=""; renderSearchResults([]); clearSearchBtn.style.display="none"; });

  // ---------- Expand/Collapse ----------
  if(expandAllBtn) expandAllBtn.addEventListener("click",()=>{ document.querySelectorAll(".collapsible-content").forEach(c=>c.classList.add("active")); document.querySelectorAll(".collapsible-header").forEach(h=>h.classList.add("active")); });
  if(collapseAllBtn) collapseAllBtn.addEventListener("click",()=>{ document.querySelectorAll(".collapsible-content").forEach(c=>c.classList.remove("active")); document.querySelectorAll(".collapsible-header").forEach(h=>h.classList.remove("active")); });

  // ---------- Scroll to top ----------
  if(scrollTopBtn){ window.addEventListener("scroll",()=>{ scrollTopBtn.style.display=window.scrollY>200?"block":"none"; }); scrollTopBtn.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"})); }

  // ---------- Dark Mode ----------
  const darkToggle=document.getElementById("darkModeToggle");
  if(darkToggle){ const icon=darkToggle.querySelector(".icon"); if(localStorage.getItem("theme")==="dark"){ document.body.classList.add("dark"); if(icon)icon.textContent="☀️"; } darkToggle.addEventListener("click",()=>{ document.body.classList.toggle("dark"); if(document.body.classList.contains("dark")){ localStorage.setItem("theme","dark"); if(icon)icon.textContent="☀️"; }else{ localStorage.setItem("theme","light"); if(icon)icon.textContent="🌙"; } }); }

  // ---------- Fetch + Render ----------
  try{
    const resp=await fetch("structured_data.json");
    if(!resp.ok) throw new Error("Failed to fetch structured_data.json");
    const data=await resp.json();

    // Flatten all items for search
    allItems=[
      ...(Object.values(data.fruits||{}).flatMap(rarity=> Object.values(rarity).flatMap(typeArr=>typeArr.map(i=>({...i,category:"fruits"})))),
      ...(data.swords||[]).map(i=>({...i,category:"swords"})),
      ...(data.guns||[]).map(i=>({...i,category:"guns"})),
      ...(data.fightingStyles||[]).map(i=>({...i,category:"fightingStyles"})),
      ...(data.accessories||[]).map(i=>({...i,category:"accessories"}))
    ];
    initFuse(allItems);

    // Render Fruits
    renderNestedFruits(data.fruits||{}, "fruits-sections", [
      {header:"Image",key:"image_url"},
      {header:"Name",key:"name",format:(v,i)=>`<a href="item.html?category=fruits&id=${i.id}">${v}</a>`},
      {header:"Type",key:"type"},
      {header:"Price (Money)",key:"price_money",format:v=>v?Number(v).toLocaleString():""},
      {header:"Price (Robux)",key:"price_robux",format:v=>v?Number(v).toLocaleString():""},
      {header:"Description",key:"description"}
    ]);

    // Render other categories
    renderGroupedTables(groupByRarity(data.swords||[]),"swords-sections",[
      {header:"Image",key:"image_url"},
      {header:"Name",key:"name",format:(v,i)=>`<a href="item.html?category=swords&id=${i.id}">${v}</a>`},
      {header:"Rarity",key:"rarity"},
      {header:"Price (Money)",key:"price_money",format:v=>v?Number(v).toLocaleString():""},
      {header:"Price (Robux)",key:"price_robux",format:v=>v?Number(v).toLocaleString():""},
      {header:"Description",key:"description"}
    ]);

    renderGroupedTables(groupByRarity(data.guns||[]),"guns-sections",[
      {header:"Image",key:"image_url"},
      {header:"Name",key:"name",format:(v,i)=>`<a href="item.html?category=guns&id=${i.id}">${v}</a>`},
      {header:"Rarity",key:"rarity"},
      {header:"Price (Money)",key:"price_money",format:v=>v?Number(v).toLocaleString():""},
      {header:"Description",key:"description"}
    ]);

    renderGroupedTables(groupByRarity(data.accessories||[]),"accessories-sections",[
      {header:"Image",key:"image_url"},
      {header:"Name",key:"name",format:(v,i)=>`<a href="item.html?category=accessories&id=${i.id}">${v}</a>`},
      {header:"Rarity",key:"rarity"},
      {header:"Price (Money)",key:"price_money",format:v=>v?Number(v).toLocaleString():""},
      {header:"Description",key:"description"}
    ]);

  }catch(err){ console.error("Data load error:",err); const area=document.getElementById("tables-area"); if(area)area.innerHTML="<p class='error'>Failed to load data.</p>"; }
  finally{ if(spinner) spinner.style.display="none"; }
});

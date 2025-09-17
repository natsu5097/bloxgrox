// item.js

// Container where all items will be displayed
const container = document.getElementById('items-container');

// Fetch the data.json file
fetch('./data/data.json')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load data.json');
    return response.json();
  })
  .then(data => {
    displayItems(data);
  })
  .catch(err => {
    console.error('Error loading JSON:', err);
    container.innerHTML = '<p>Failed to load items.</p>';
  });

// Function to display all items
function displayItems(items) {
  container.innerHTML = ''; // Clear container

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';

    // Image
    const img = document.createElement('img');
    img.src = `./images/${item.image}`; // Make sure 'image' matches JSON field
    img.alt = item.name;
    img.onerror = () => img.src = './images/placeholder.png'; // fallback

    // Name
    const name = document.createElement('h3');
    name.textContent = item.name;

    // Stats
    const stats = document.createElement('p');
    stats.innerHTML = `
      Type: ${item.type || 'Unknown'} <br>
      Rarity: ${item.rarity || 'Unknown'} <br>
      Power: ${item.power || 'N/A'}
    `;

    // Append everything
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(stats);
    container.appendChild(card);
  });
}

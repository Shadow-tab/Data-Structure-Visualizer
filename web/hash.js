// hash.js
// Hash Table with Open Addressing (Linear Probing)

let ModuleReady = false;
let moduleObj = (typeof Module !== 'undefined') ? Module : null;

// C function wrappers matching bindings.cpp
let hash_create, hash_insert, hash_search, hash_remove, hash_destroy;

// Hash table data
let hashTablePtr = null;
let tableSize = 11;
let hashTable = [];
let itemCount = 0;

// Display options
let showHash = true;
let showProbes = true;
let animateProbing = true;

// Probe animation state
let probingSlots = [];
let currentProbeIndex = 0;

// DOM refs
const wasmStatus = document.getElementById('wasmStatus');
const statusDot = document.getElementById('statusDot');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hashInfo = document.getElementById('hashInfo');
const emptyState = document.getElementById('emptyState');
const notification = document.getElementById('notification');
const probeAnimation = document.getElementById('probeAnimation');

// Stats
const tableSizeStat = document.getElementById('tableSizeStat');
const itemCountEl = document.getElementById('itemCount');
const loadFactorEl = document.getElementById('loadFactor');
const loadBarFill = document.getElementById('loadBarFill');

// Input elements
const tableSizeSelect = document.getElementById('tableSize');
const keyInput = document.getElementById('keyInput');
const valueInput = document.getElementById('valueInput');
const showHashCheck = document.getElementById('showHash');
const showProbesCheck = document.getElementById('showProbes');
const animateProbingCheck = document.getElementById('animateProbing');

// Buttons
const btnInsert = document.getElementById('btnInsert');
const btnSearch = document.getElementById('btnSearch');
const btnRemove = document.getElementById('btnRemove');
const btnRandomInsert = document.getElementById('btnRandomInsert');
const btnTestCollision = document.getElementById('btnTestCollision');
const btnClear = document.getElementById('btnClear');

// Event listeners
btnInsert.addEventListener('click', insert);
btnSearch.addEventListener('click', search);
btnRemove.addEventListener('click', remove);
btnRandomInsert.addEventListener('click', insertRandom);
btnTestCollision.addEventListener('click', testCollisions);
btnClear.addEventListener('click', clearTable);

tableSizeSelect.addEventListener('change', (e) => {
  tableSize = parseInt(e.target.value);
  resetTable();
});

showHashCheck.addEventListener('change', (e) => { showHash = e.target.checked; render(); });
showProbesCheck.addEventListener('change', (e) => { showProbes = e.target.checked; render(); });
animateProbingCheck.addEventListener('change', (e) => { animateProbing = e.target.checked; });

keyInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && ModuleReady) {
    insert();
  }
});

// WASM initialization
function onRuntimeInitialized() {
  moduleObj = Module;
  
  // Wrap C functions matching bindings.cpp
  hash_create = moduleObj.cwrap('hash_create', 'number', ['number']);
  hash_insert = moduleObj.cwrap('hash_insert', null, ['number', 'string', 'number']);
  hash_search = moduleObj.cwrap('hash_search', 'number', ['number', 'string']);
  hash_remove = moduleObj.cwrap('hash_remove', null, ['number', 'string']);
  hash_destroy = moduleObj.cwrap('hash_destroy', null, ['number']);

  hashTablePtr = hash_create(tableSize);
  initializeTable();
  moduleReadySet(true);
  render();
}

function moduleReadySet(ready) {
  ModuleReady = ready;
  wasmStatus.textContent = ready ? 'Ready' : 'Initializing...';
  if (ready) {
    statusDot.classList.add('ready');
  }
}

if (moduleObj && moduleObj['calledRun']) {
  onRuntimeInitialized();
} else {
  if (!moduleObj) {
    window.Module = {};
    moduleObj = window.Module;
  }
  moduleObj.onRuntimeInitialized = onRuntimeInitialized;
}

// Hash table operations
function initializeTable() {
  hashTable = [];
  for (let i = 0; i < tableSize; i++) {
    hashTable.push({ status: 'empty', key: null, value: null, probes: 0 });
  }
  itemCount = 0;
  updateStats();
}

function resetTable() {
  if (hashTablePtr) {
    hash_destroy(hashTablePtr);
  }
  hashTablePtr = hash_create(tableSize);
  initializeTable();
  render();
  showNotification(`Table reset to size ${tableSize}`, 'info');
}

function hashFunction(key) {
  // Simple hash: sum of char codes modulo table size
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i);
  }
  return hash % tableSize;
}

async function insert() {
  const key = keyInput.value.trim();
  const value = parseInt(valueInput.value);
  
  if (!key) {
    showNotification('Enter a key', 'error');
    return;
  }
  
  if (isNaN(value)) {
    showNotification('Enter a valid value', 'error');
    return;
  }
  
  if (itemCount >= tableSize) {
    showNotification('Table is full!', 'error');
    return;
  }
  
  // Check if key exists
  const existingIndex = findKey(key);
  if (existingIndex !== -1) {
    showNotification(`Key "${key}" already exists`, 'error');
    return;
  }
  
  // Find slot with linear probing
  const hash = hashFunction(key);
  let index = hash;
  let probeCount = 0;
  probingSlots = [index];
  
  while (hashTable[index].status === 'occupied') {
    probeCount++;
    index = (hash + probeCount) % tableSize;
    probingSlots.push(index);
    
    if (probeCount >= tableSize) {
      showNotification('Table is full!', 'error');
      return;
    }
  }
  
  // Animate probing if enabled
  if (animateProbing && probeCount > 0) {
    await animateProbe(probingSlots, key);
  }
  
  // Insert into table
  hashTable[index] = { status: 'occupied', key, value, probes: probeCount };
  itemCount++;
  
  // Insert into C++ hash table
  hash_insert(hashTablePtr, key, value);
  
  keyInput.value = '';
  valueInput.value = '';
  updateStats();
  render();
  
  const msg = probeCount > 0 
    ? `Inserted "${key}" at index ${index} (${probeCount} probes)`
    : `Inserted "${key}" at index ${index}`;
  showNotification(msg, 'success');
}

async function search() {
  const key = keyInput.value.trim();
  
  if (!key) {
    showNotification('Enter a key to search', 'error');
    return;
  }
  
  // Find with probing
  const hash = hashFunction(key);
  let index = hash;
  let probeCount = 0;
  probingSlots = [index];
  let found = false;
  
  while (hashTable[index].status !== 'empty' && probeCount < tableSize) {
    if (hashTable[index].status === 'occupied' && hashTable[index].key === key) {
      found = true;
      break;
    }
    probeCount++;
    index = (hash + probeCount) % tableSize;
    probingSlots.push(index);
  }
  
  // Animate probing
  if (animateProbing) {
    await animateProbe(probingSlots, key);
  }
  
  // Also call C++ search
  const result = hash_search(hashTablePtr, key);
  
  if (found) {
    const value = hashTable[index].value;
    showNotification(`Found "${key}" = ${value} at index ${index}`, 'success');
    
    // Highlight found slot
    anime({
      targets: hashTable[index],
      scale: [1, 1.1, 1],
      duration: 500,
      easing: 'easeOutElastic(1, .5)'
    });
  } else {
    showNotification(`Key "${key}" not found`, 'error');
  }
  
  render();
}

async function remove() {
  const key = keyInput.value.trim();
  
  if (!key) {
    showNotification('Enter a key to remove', 'error');
    return;
  }
  
  const index = findKey(key);
  
  if (index === -1) {
    showNotification(`Key "${key}" not found`, 'error');
    return;
  }
  
  // Mark as deleted (tombstone)
  hashTable[index].status = 'deleted';
  hashTable[index].key = null;
  hashTable[index].value = null;
  itemCount--;
  
  // Remove from C++ hash table
  hash_remove(hashTablePtr, key);
  
  keyInput.value = '';
  updateStats();
  render();
  showNotification(`Removed "${key}" from index ${index}`, 'success');
}

function findKey(key) {
  const hash = hashFunction(key);
  let index = hash;
  let probeCount = 0;
  
  while (hashTable[index].status !== 'empty' && probeCount < tableSize) {
    if (hashTable[index].status === 'occupied' && hashTable[index].key === key) {
      return index;
    }
    probeCount++;
    index = (hash + probeCount) % tableSize;
  }
  
  return -1;
}

function insertRandom() {
  const keys = ['apple', 'banana', 'cherry', 'date', 'fig', 'grape', 'kiwi'];
  const key = keys[Math.floor(Math.random() * keys.length)] + Math.floor(Math.random() * 100);
  const value = Math.floor(Math.random() * 1000);
  
  keyInput.value = key;
  valueInput.value = value;
  insert();
}

function testCollisions() {
  // Insert keys that will cause collisions
  const testKeys = ['abc', 'bca', 'cab']; // These will hash to same value
  
  testKeys.forEach((key, i) => {
    setTimeout(() => {
      keyInput.value = key;
      valueInput.value = i * 10;
      insert();
    }, i * 1000);
  });
  
  showNotification('Inserting keys that cause collisions...', 'info');
}

function clearTable() {
  resetTable();
  showNotification('Table cleared', 'success');
}

async function animateProbe(slots, key) {
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const slotY = 80 + slot * 45;
    
    probeAnimation.textContent = `Probing: ${key} → [${slot}]`;
    probeAnimation.style.top = slotY + 'px';
    probeAnimation.style.left = '50%';
    probeAnimation.style.transform = 'translateX(-50%)';
    
    await anime({
      targets: probeAnimation,
      opacity: [0, 1],
      duration: 200,
      easing: 'easeOutQuad'
    }).finished;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await anime({
      targets: probeAnimation,
      opacity: [1, 0],
      duration: 200,
      easing: 'easeInQuad'
    }).finished;
  }
}

function updateStats() {
  tableSizeStat.textContent = tableSize;
  itemCountEl.textContent = itemCount;
  
  const load = (itemCount / tableSize).toFixed(2);
  loadFactorEl.textContent = load;
  loadBarFill.style.width = (load * 100) + '%';
  
  let status = `Load: ${load} | Items: ${itemCount}/${tableSize}`;
  if (itemCount > 0) {
    const occupiedSlots = hashTable.filter(s => s.status === 'occupied').map((s, i) => i);
    status += ` | Occupied: [${occupiedSlots.join(', ')}]`;
  }
  hashInfo.textContent = status;
}

function showNotification(msg, type = 'success') {
  notification.textContent = msg;
  notification.className = `notification show ${type}`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Rendering
function render() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (itemCount === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
  }

  const slotHeight = 40;
  const slotWidth = 600;
  const startX = (canvas.width - slotWidth) / 2;
  const startY = 60;
  const gap = 5;

  // Draw title
  ctx.fillStyle = '#8b8d98';
  ctx.font = 'bold 14px Inter, Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Index', startX - 50, startY + 20);
  ctx.fillText('Status', startX + 80, startY + 20);
  ctx.fillText('Key', startX + 220, startY + 20);
  ctx.fillText('Value', startX + 380, startY + 20);
  if (showHash) {
    ctx.fillText('Hash', startX + 480, startY + 20);
  }

  // Draw slots
  hashTable.forEach((slot, index) => {
    const y = startY + 40 + index * (slotHeight + gap);
    drawSlot(startX, y, slotWidth, slotHeight, slot, index);
  });
}

function drawSlot(x, y, w, h, slot, index) {
  // Slot background
  let bgColor;
  if (slot.status === 'empty') {
    bgColor = '#2d2d44';
  } else if (slot.status === 'deleted') {
    bgColor = '#4a3030';
  } else {
    bgColor = '#2d4a44';
  }
  
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, w, h, 6, true, false);
  
  // Border
  let borderColor;
  if (slot.status === 'occupied') {
    borderColor = '#10b981';
  } else if (slot.status === 'deleted') {
    borderColor = '#ef4444';
  } else {
    borderColor = '#3d3d54';
  }
  
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 6, false, true);
  
  // Index
  ctx.fillStyle = '#667eea';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`[${index}]`, x - 30, y + h / 2);
  
  // Status icon
  let statusIcon = '';
  if (slot.status === 'empty') statusIcon = '⬜';
  else if (slot.status === 'deleted') statusIcon = '❌';
  else statusIcon = '🟦';
  
  ctx.font = '20px Arial';
  ctx.fillText(statusIcon, x + 80, y + h / 2);
  
  // Key and Value
  if (slot.status === 'occupied') {
    ctx.fillStyle = '#e8eaed';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(slot.key, x + 120, y + h / 2);
    
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(String(slot.value), x + 340, y + h / 2);
    
    // Hash value
    if (showHash) {
      const hash = hashFunction(slot.key);
      ctx.fillStyle = '#8b5cf6';
      ctx.font = '12px monospace';
      ctx.fillText(`h=${hash}`, x + 460, y + h / 2);
    }
    
    // Probe count
    if (showProbes && slot.probes > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`p=${slot.probes}`, x + 530, y + h / 2);
    }
  } else if (slot.status === 'deleted') {
    ctx.fillStyle = '#8b8d98';
    ctx.font = 'italic 12px Inter, Arial';
    ctx.textAlign = 'left';
    ctx.fillText('(tombstone)', x + 120, y + h / 2);
  }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') { stroke = true; }
  if (typeof radius === 'undefined') { radius = 5; }
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Continuous rendering
function continuousRender() {
  render();
  requestAnimationFrame(continuousRender);
}

continuousRender();

// Cleanup
window.addEventListener('beforeunload', () => {
  try {
    if (hashTablePtr && ModuleReady) {
      hash_destroy(hashTablePtr);
    }
  } catch (e) { /* ignore */ }
});
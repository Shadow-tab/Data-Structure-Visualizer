// avl.js
// Matches bindings.cpp AVL functions

let ModuleReady = false;
let moduleObj = (typeof Module !== 'undefined') ? Module : null;

// C function wrappers matching bindings.cpp
let avl_create, avl_insert, avl_delete, avl_get_height, avl_destroy;

// AVL Tree node structure for JS visualization
class AVLNode {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.balance = 0;
  }
}

let treeRoot = null;
let avlPtr = null;
let nodeCount = 0;
let searchedNode = null;

// Display options
let showBalance = true;
let showHeight = false;

// DOM refs
const wasmStatus = document.getElementById('wasmStatus');
const statusDot = document.getElementById('statusDot');
const inputValue = document.getElementById('valueInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const treeInfo = document.getElementById('treeInfo');
const emptyState = document.getElementById('emptyState');
const notification = document.getElementById('notification');

// Stats
const nodeCountEl = document.getElementById('nodeCount');
const treeHeightEl = document.getElementById('treeHeight');
const rootValueEl = document.getElementById('rootValue');

// Buttons
const btnInsert = document.getElementById('btnInsert');
const btnDelete = document.getElementById('btnDelete');
const btnSearch = document.getElementById('btnSearch');
const btnReset = document.getElementById('btnReset');
const btnRandom = document.getElementById('btnRandom');
const btnSorted = document.getElementById('btnSorted');
const showBalanceCheck = document.getElementById('showBalance');
const showHeightCheck = document.getElementById('showHeight');

// Event listeners
btnInsert.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); insert(); });
btnDelete.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); deleteKey(); });
btnSearch.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); search(); });
btnReset.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); reset(); });
btnRandom.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); insertRandom(); });
btnSorted.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); insertSorted(); });

showBalanceCheck.addEventListener('change', (e) => { showBalance = e.target.checked; render(); });
showHeightCheck.addEventListener('change', (e) => { showHeight = e.target.checked; render(); });

inputValue.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && ModuleReady) {
    insert();
  }
});

// WASM initialization
function onRuntimeInitialized() {
  moduleObj = Module;
  
  // Wrap C functions matching bindings.cpp
  avl_create = moduleObj.cwrap('avl_create', 'number', []);
  avl_insert = moduleObj.cwrap('avl_insert', null, ['number', 'number']);
  avl_delete = moduleObj.cwrap('avl_delete', null, ['number', 'number']);
  avl_get_height = moduleObj.cwrap('avl_get_height', 'number', ['number']);
  avl_destroy = moduleObj.cwrap('avl_destroy', null, ['number']);

  avlPtr = avl_create();
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

// AVL operations
function insert() {
  const key = parseInt(inputValue.value);
  if (Number.isNaN(key)) { 
    showNotification('Please enter a valid integer', 'error'); 
    return; 
  }
  
  // Check if already exists
  if (findNode(treeRoot, key)) {
    showNotification(`Key ${key} already exists`, 'error');
    return;
  }
  
  // Insert into C++ AVL
  avl_insert(avlPtr, key);
  
  // Insert into JS tree for visualization
  treeRoot = insertNode(treeRoot, key);
  nodeCount++;
  
  inputValue.value = '';
  render();
  showNotification(`Inserted ${key}`, 'success');
}

function deleteKey() {
  const key = parseInt(inputValue.value);
  if (Number.isNaN(key)) { 
    showNotification('Please enter a valid integer', 'error'); 
    return; 
  }
  
  if (!findNode(treeRoot, key)) {
    showNotification(`Key ${key} not found`, 'error');
    return;
  }
  
  // Delete from C++ AVL
  avl_delete(avlPtr, key);
  
  // Delete from JS tree
  treeRoot = deleteNode(treeRoot, key);
  nodeCount--;
  
  inputValue.value = '';
  render();
  showNotification(`Deleted ${key}`, 'success');
}

function search() {
  const key = parseInt(inputValue.value);
  if (Number.isNaN(key)) { 
    showNotification('Please enter a valid integer', 'error'); 
    return; 
  }
  
  const found = findNode(treeRoot, key);
  searchedNode = found ? key : null;
  
  render();
  
  if (found) {
    showNotification(`Found ${key}`, 'success');
  } else {
    showNotification(`${key} not found`, 'error');
  }
  
  setTimeout(() => {
    searchedNode = null;
    render();
  }, 2000);
}

function reset() {
  if (avlPtr) {
    avl_destroy(avlPtr);
  }
  avlPtr = avl_create();
  treeRoot = null;
  nodeCount = 0;
  searchedNode = null;
  render();
  showNotification('Tree cleared', 'success');
}

function insertRandom() {
  const count = 7;
  const values = new Set();
  
  while (values.size < count) {
    values.add(Math.floor(Math.random() * 100));
  }
  
  values.forEach(val => {
    if (!findNode(treeRoot, val)) {
      avl_insert(avlPtr, val);
      treeRoot = insertNode(treeRoot, val);
      nodeCount++;
    }
  });
  
  render();
  showNotification(`Inserted ${count} random values`, 'success');
}

function insertSorted() {
  const values = [10, 20, 30, 40, 50, 60, 70];
  
  values.forEach(val => {
    if (!findNode(treeRoot, val)) {
      avl_insert(avlPtr, val);
      treeRoot = insertNode(treeRoot, val);
      nodeCount++;
    }
  });
  
  render();
  showNotification('Inserted sorted sequence', 'success');
}

// AVL helper functions
function getHeight(node) {
  return node ? node.height : 0;
}

function getBalance(node) {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function updateHeight(node) {
  if (node) {
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    node.balance = getBalance(node);
  }
}

function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;
  
  x.right = y;
  y.left = T2;
  
  updateHeight(y);
  updateHeight(x);
  
  return x;
}

function rotateLeft(x) {
  const y = x.right;
  const T2 = y.left;
  
  y.left = x;
  x.right = T2;
  
  updateHeight(x);
  updateHeight(y);
  
  return y;
}

function insertNode(node, key) {
  if (!node) {
    return new AVLNode(key);
  }
  
  if (key < node.key) {
    node.left = insertNode(node.left, key);
  } else if (key > node.key) {
    node.right = insertNode(node.right, key);
  } else {
    return node; // Duplicate
  }
  
  updateHeight(node);
  const balance = getBalance(node);
  
  // LL
  if (balance > 1 && key < node.left.key) {
    return rotateRight(node);
  }
  
  // RR
  if (balance < -1 && key > node.right.key) {
    return rotateLeft(node);
  }
  
  // LR
  if (balance > 1 && key > node.left.key) {
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }
  
  // RL
  if (balance < -1 && key < node.right.key) {
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }
  
  return node;
}

function minValueNode(node) {
  let current = node;
  while (current.left) {
    current = current.left;
  }
  return current;
}

function deleteNode(node, key) {
  if (!node) return node;
  
  if (key < node.key) {
    node.left = deleteNode(node.left, key);
  } else if (key > node.key) {
    node.right = deleteNode(node.right, key);
  } else {
    if (!node.left || !node.right) {
      node = node.left || node.right;
    } else {
      const temp = minValueNode(node.right);
      node.key = temp.key;
      node.right = deleteNode(node.right, temp.key);
    }
  }
  
  if (!node) return node;
  
  updateHeight(node);
  const balance = getBalance(node);
  
  // LL
  if (balance > 1 && getBalance(node.left) >= 0) {
    return rotateRight(node);
  }
  
  // LR
  if (balance > 1 && getBalance(node.left) < 0) {
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }
  
  // RR
  if (balance < -1 && getBalance(node.right) <= 0) {
    return rotateLeft(node);
  }
  
  // RL
  if (balance < -1 && getBalance(node.right) > 0) {
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }
  
  return node;
}

function findNode(node, key) {
  if (!node) return null;
  if (key === node.key) return node;
  if (key < node.key) return findNode(node.left, key);
  return findNode(node.right, key);
}

function showNotification(msg, type = 'success') {
  notification.textContent = msg;
  notification.className = `notification show ${type}`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

// Rendering
function render() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update stats
  nodeCountEl.textContent = nodeCount;
  treeHeightEl.textContent = getHeight(treeRoot);
  rootValueEl.textContent = treeRoot ? treeRoot.key : '—';

  if (!treeRoot) {
    emptyState.classList.add('visible');
    treeInfo.textContent = 'Tree is empty';
    return;
  } else {
    emptyState.classList.remove('visible');
  }

  // Draw tree
  const startY = 60;
  const levelHeight = 80;
  
  drawTree(treeRoot, canvas.width / 2, startY, canvas.width / 4, levelHeight);
  
  // Update info
  const inorder = [];
  inorderTraversal(treeRoot, inorder);
  treeInfo.textContent = `Inorder: ${inorder.join(', ')}`;
}

function drawTree(node, x, y, xOffset, yOffset) {
  if (!node) return;
  
  const radius = 28;
  
  // Draw edges first
  if (node.left) {
    const childX = x - xOffset;
    const childY = y + yOffset;
    drawEdge(x, y + radius, childX, childY - radius);
    drawTree(node.left, childX, childY, xOffset / 2, yOffset);
  }
  
  if (node.right) {
    const childX = x + xOffset;
    const childY = y + yOffset;
    drawEdge(x, y + radius, childX, childY - radius);
    drawTree(node.right, childX, childY, xOffset / 2, yOffset);
  }
  
  // Draw node
  const isSearched = searchedNode === node.key;
  const isRoot = node === treeRoot;
  const isBalanced = Math.abs(node.balance) <= 1;
  
  drawNode(x, y, radius, node.key, node.balance, node.height, isRoot, isSearched, isBalanced);
}

function drawNode(x, y, radius, key, balance, height, isRoot, isSearched, isBalanced) {
  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  
  // Circle
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  
  if (isSearched) {
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(1, '#d97706');
  } else if (!isBalanced) {
    gradient.addColorStop(0, '#ef4444');
    gradient.addColorStop(1, '#dc2626');
  } else if (isRoot) {
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#7c3aed');
  } else {
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#5a67d8');
  }
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
  ctx.stroke();
  
  // Key value
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(key), x, y);
  
  // Balance factor
  if (showBalance) {
    const bfColor = Math.abs(balance) > 1 ? '#ef4444' : '#10b981';
    ctx.fillStyle = bfColor;
    ctx.font = 'bold 11px Inter, Arial';
    ctx.fillText(`BF:${balance}`, x, y - radius - 10);
  }
  
  // Height
  if (showHeight) {
    ctx.fillStyle = '#8b8d98';
    ctx.font = '10px Inter, Arial';
    ctx.fillText(`h:${height}`, x, y + radius + 14);
  }
}

function drawEdge(x1, y1, x2, y2) {
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function inorderTraversal(node, result) {
  if (!node) return;
  inorderTraversal(node.left, result);
  result.push(node.key);
  inorderTraversal(node.right, result);
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
    if (avlPtr && ModuleReady) {
      avl_destroy(avlPtr);
    }
  } catch (e) { /* ignore */ }
});
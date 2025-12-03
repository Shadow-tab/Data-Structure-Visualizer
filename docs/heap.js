// heap.js
// Assumes ds.js has been loaded first

let ModuleReady = false;
let moduleObj = (typeof Module !== 'undefined') ? Module : null;

// C function wrappers
let heap_create, heap_insert_min, heap_insert_max, heap_delete_root, heap_destroy;

// Local JS mirror of the heap
let jsHeap = [];
let heapPtr = null;
let isMinHeap = true; // true = min heap, false = max heap
let currentView = 'tree'; // 'tree' or 'array'

// Animation state
let animatingNode = null;
let animationProgress = 0;

// DOM refs
const wasmStatus = document.getElementById('wasmStatus');
const statusDot = document.getElementById('statusDot');
const inputValue = document.getElementById('valueInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const heapDisplay = document.getElementById('heapDisplay');
const emptyState = document.getElementById('emptyState');
const notification = document.getElementById('notification');

// Stats
const heapSize = document.getElementById('heapSize');
const rootValue = document.getElementById('rootValue');
const heapHeight = document.getElementById('heapHeight');

// Buttons
const btnInsert = document.getElementById('btnInsert');
const btnExtract = document.getElementById('btnExtract');
const btnPeek = document.getElementById('btnPeek');
const btnReset = document.getElementById('btnReset');
const btnMinHeap = document.getElementById('btnMinHeap');
const btnMaxHeap = document.getElementById('btnMaxHeap');
const btnTreeView = document.getElementById('btnTreeView');
const btnArrayView = document.getElementById('btnArrayView');

// Event listeners
btnInsert.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); insert(); });
btnExtract.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); extract(); });
btnPeek.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); peek(); });
btnReset.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); resetHeap(); });

btnMinHeap.addEventListener('click', () => switchHeapType('min'));
btnMaxHeap.addEventListener('click', () => switchHeapType('max'));

btnTreeView.addEventListener('click', () => switchView('tree'));
btnArrayView.addEventListener('click', () => switchView('array'));

inputValue.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && ModuleReady) {
    insert();
  }
});

// WASM initialization
function onRuntimeInitialized() {
  moduleObj = Module;
  
  // Wrap C functions matching bindings.cpp
  heap_create = moduleObj.cwrap('heap_create', 'number', []);
  heap_insert_min = moduleObj.cwrap('heap_insert_min', null, ['number', 'number']);
  heap_insert_max = moduleObj.cwrap('heap_insert_max', null, ['number', 'number']);
  heap_delete_root = moduleObj.cwrap('heap_delete_root', null, ['number']);
  heap_destroy = moduleObj.cwrap('heap_destroy', null, ['number']);

  heapPtr = heap_create();
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

// Heap operations
function insert() {
  const v = parseInt(inputValue.value);
  if (Number.isNaN(v)) { 
    showNotification('Please enter a valid integer', 'error'); 
    return; 
  }
  
  // Call appropriate C++ function based on heap type
  if (isMinHeap) {
    heap_insert_min(heapPtr, v);
  } else {
    heap_insert_max(heapPtr, v);
  }
  
  jsHeap.push(v);
  bubbleUp(jsHeap.length - 1);
  
  inputValue.value = '';
  render();
  showNotification(`Inserted ${v}`, 'success');
}

function extract() {
  if (jsHeap.length === 0) { 
    showNotification('Heap is empty', 'error'); 
    return; 
  }
  
  const root = jsHeap[0];
  heap_delete_root(heapPtr);
  
  // Swap root with last element and remove
  jsHeap[0] = jsHeap[jsHeap.length - 1];
  jsHeap.pop();
  
  if (jsHeap.length > 0) {
    heapifyDown(0);
  }
  
  render();
  showNotification(`Extracted ${root}`, 'success');
}

function peek() {
  if (jsHeap.length === 0) { 
    showNotification('Heap is empty', 'error'); 
    return; 
  }
  
  const root = jsHeap[0];
  showNotification(`Root: ${root}`, 'info');
}

function resetHeap() {
  if (heapPtr) {
    heap_destroy(heapPtr);
  }
  heapPtr = heap_create();
  jsHeap = [];
  render();
  showNotification('Heap cleared', 'success');
}

function switchHeapType(type) {
  if ((type === 'min' && isMinHeap) || (type === 'max' && !isMinHeap)) return;
  
  isMinHeap = (type === 'min');
  
  btnMinHeap.classList.toggle('active', isMinHeap);
  btnMaxHeap.classList.toggle('active', !isMinHeap);
  
  // Reset heap when switching type
  if (jsHeap.length > 0) {
    const currentValues = [...jsHeap];
    resetHeap();
    showNotification(`Switched to ${type} heap`, 'info');
  }
}

function switchView(view) {
  currentView = view;
  btnTreeView.classList.toggle('active', view === 'tree');
  btnArrayView.classList.toggle('active', view === 'array');
  render();
}

// Heap operations helpers
function bubbleUp(index) {
  if (index === 0) return;
  
  const parentIndex = Math.floor((index - 1) / 2);
  const shouldSwap = isMinHeap 
    ? jsHeap[index] < jsHeap[parentIndex]
    : jsHeap[index] > jsHeap[parentIndex];
  
  if (shouldSwap) {
    [jsHeap[index], jsHeap[parentIndex]] = [jsHeap[parentIndex], jsHeap[index]];
    bubbleUp(parentIndex);
  }
}

function heapifyDown(index) {
  const leftChild = 2 * index + 1;
  const rightChild = 2 * index + 2;
  let targetIndex = index;
  
  if (leftChild < jsHeap.length) {
    const shouldSwapLeft = isMinHeap
      ? jsHeap[leftChild] < jsHeap[targetIndex]
      : jsHeap[leftChild] > jsHeap[targetIndex];
    if (shouldSwapLeft) targetIndex = leftChild;
  }
  
  if (rightChild < jsHeap.length) {
    const shouldSwapRight = isMinHeap
      ? jsHeap[rightChild] < jsHeap[targetIndex]
      : jsHeap[rightChild] > jsHeap[targetIndex];
    if (shouldSwapRight) targetIndex = rightChild;
  }
  
  if (targetIndex !== index) {
    [jsHeap[index], jsHeap[targetIndex]] = [jsHeap[targetIndex], jsHeap[index]];
    heapifyDown(targetIndex);
  }
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
  heapSize.textContent = jsHeap.length;
  rootValue.textContent = jsHeap.length > 0 ? jsHeap[0] : '—';
  heapHeight.textContent = jsHeap.length > 0 ? Math.floor(Math.log2(jsHeap.length)) + 1 : 0;

  if (jsHeap.length === 0) {
    emptyState.classList.add('visible');
    heapDisplay.textContent = 'Heap is empty';
    return;
  } else {
    emptyState.classList.remove('visible');
  }

  if (currentView === 'tree') {
    renderTreeView();
  } else {
    renderArrayView();
  }

  // Update display
  const heapType = isMinHeap ? 'Min' : 'Max';
  heapDisplay.textContent = `${heapType} Heap: [${jsHeap.join(', ')}]`;
}

function renderTreeView() {
  const levels = Math.floor(Math.log2(jsHeap.length)) + 1;
  const startY = 50;
  const levelHeight = Math.min(80, (canvas.height - 100) / levels);
  
  // Draw edges first
  for (let i = 0; i < jsHeap.length; i++) {
    const leftChild = 2 * i + 1;
    const rightChild = 2 * i + 2;
    
    if (leftChild < jsHeap.length) {
      const parentPos = getNodePosition(i, levels, levelHeight, startY);
      const leftPos = getNodePosition(leftChild, levels, levelHeight, startY);
      drawEdge(parentPos.x, parentPos.y, leftPos.x, leftPos.y);
    }
    
    if (rightChild < jsHeap.length) {
      const parentPos = getNodePosition(i, levels, levelHeight, startY);
      const rightPos = getNodePosition(rightChild, levels, levelHeight, startY);
      drawEdge(parentPos.x, parentPos.y, rightPos.x, rightPos.y);
    }
  }
  
  // Draw nodes
  for (let i = 0; i < jsHeap.length; i++) {
    const pos = getNodePosition(i, levels, levelHeight, startY);
    const isRoot = i === 0;
    drawNode(pos.x, pos.y, 35, jsHeap[i], isRoot, i);
  }
}

function getNodePosition(index, levels, levelHeight, startY) {
  const level = Math.floor(Math.log2(index + 1));
  const posInLevel = index - (Math.pow(2, level) - 1);
  const nodesInLevel = Math.pow(2, level);
  
  const levelWidth = canvas.width - 80;
  const spacing = levelWidth / (nodesInLevel + 1);
  
  return {
    x: 40 + spacing * (posInLevel + 1),
    y: startY + level * levelHeight
  };
}

function renderArrayView() {
  const boxWidth = 60;
  const boxHeight = 50;
  const gap = 10;
  const startX = 40;
  const startY = canvas.height / 2 - boxHeight / 2;
  
  // Draw indices
  ctx.fillStyle = '#8b8d98';
  ctx.font = '11px Inter, Arial';
  ctx.textAlign = 'center';
  
  jsHeap.forEach((val, i) => {
    const x = startX + i * (boxWidth + gap);
    ctx.fillText(`[${i}]`, x + boxWidth / 2, startY - 10);
  });
  
  // Draw array boxes
  jsHeap.forEach((val, i) => {
    const x = startX + i * (boxWidth + gap);
    const isRoot = i === 0;
    drawArrayBox(x, startY, boxWidth, boxHeight, val, isRoot, i);
  });
  
  // Draw parent-child relationships with subtle arrows
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  
  for (let i = 0; i < jsHeap.length; i++) {
    const leftChild = 2 * i + 1;
    if (leftChild < jsHeap.length) {
      const parentX = startX + i * (boxWidth + gap) + boxWidth / 2;
      const childX = startX + leftChild * (boxWidth + gap) + boxWidth / 2;
      ctx.beginPath();
      ctx.moveTo(parentX, startY + boxHeight + 5);
      ctx.lineTo(childX, startY + boxHeight + 5);
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);
}

function drawNode(x, y, radius, value, isRoot, index) {
  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  
  // Circle
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  
  if (isRoot) {
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(1, '#d97706');
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
  
  // Value
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), x, y);
  
  // Index label
  ctx.fillStyle = '#8b8d98';
  ctx.font = '10px Inter, Arial';
  ctx.fillText(`[${index}]`, x, y + radius + 12);
}

function drawArrayBox(x, y, w, h, value, isRoot, index) {
  const radius = 6;
  
  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  
  // Box
  const gradient = ctx.createLinearGradient(x, y, x, y + h);
  
  if (isRoot) {
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(1, '#d97706');
  } else {
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#5a67d8');
  }
  
  ctx.fillStyle = gradient;
  roundRect(ctx, x, y, w, h, radius, true, false);
  ctx.restore();
  
  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, radius, false, true);
  
  // Value
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), x + w / 2, y + h / 2);
}

function drawEdge(x1, y1, x2, y2) {
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
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
    if (heapPtr && ModuleReady) {
      heap_destroy(heapPtr);
    }
  } catch (e) { /* ignore */ }
});
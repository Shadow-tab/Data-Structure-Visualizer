// linkedlist.js
// Assumes ds.js has been loaded first (via <script src="wasm/ds.js"></script>)
// and that it creates a global Module. We attach behavior only after runtime init.

let ModuleReady = false;
let moduleObj = (typeof Module !== 'undefined') ? Module : null;

// C function wrappers (will be assigned once Module is ready)
let ll_create, ll_push_front, ll_push_back, ll_pop_front, ll_pop_back, ll_get_head, ll_get_tail, ll_destroy;

// Local JS mirror of the list (keeps visualization fast and non-destructive)
let jsList = [];
let listPtr = null;

// Animation state
let animatingNode = null;
let animationProgress = 0;

// DOM refs
const wasmStatus = document.getElementById('wasmStatus');
const statusDot = document.getElementById('statusDot');
const inputValue = document.getElementById('valueInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nodeListDiv = document.getElementById('nodeList');
const emptyState = document.getElementById('emptyState');
const notification = document.getElementById('notification');

// Stats
const nodeCount = document.getElementById('nodeCount');
const headValue = document.getElementById('headValue');
const tailValue = document.getElementById('tailValue');

const btnPushFront = document.getElementById('btnPushFront');
const btnPushBack  = document.getElementById('btnPushBack');
const btnPopFront  = document.getElementById('btnPopFront');
const btnPopBack   = document.getElementById('btnPopBack');
const btnReset     = document.getElementById('btnReset');

// Setup event listeners (will no-op until module is ready)
btnPushFront.addEventListener('click', () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); pushFront(); });
btnPushBack.addEventListener('click',  () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); pushBack(); });
btnPopFront.addEventListener('click',  () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); popFront(); });
btnPopBack.addEventListener('click',   () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); popBack(); });
btnReset.addEventListener('click',     () => { if (!ModuleReady) return showNotification('WASM not ready', 'error'); resetList(); });

// Enter key to push back
inputValue.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && ModuleReady) {
    pushBack();
  }
});

// Called once WASM runtime is initialized
function onRuntimeInitialized() {
  moduleObj = Module;
  // Wrap C functions using cwrap (names must match bindings.cpp)
  ll_create      = moduleObj.cwrap('ll_create', 'number', []);
  ll_push_front  = moduleObj.cwrap('ll_push_front', null, ['number', 'number']);
  ll_push_back   = moduleObj.cwrap('ll_push_back', null, ['number', 'number']);
  ll_pop_front   = moduleObj.cwrap('ll_pop_front', null, ['number']);
  ll_pop_back    = moduleObj.cwrap('ll_pop_back', null, ['number']);
  ll_get_head    = moduleObj.cwrap('ll_get_head', 'number', ['number']);
  ll_get_tail    = moduleObj.cwrap('ll_get_tail', 'number', ['number']);
  ll_destroy     = moduleObj.cwrap('ll_destroy', null, ['number']);

  // Create the list and mark ready
  listPtr = ll_create();
  moduleReadySet(true);
  render();
}

// Helper to toggle status
function moduleReadySet(ready) {
  ModuleReady = ready;
  wasmStatus.textContent = ready ? 'Ready' : 'Initializing...';
  if (ready) {
    statusDot.classList.add('ready');
  }
}

// If Module already initialized before this script runs:
if (moduleObj && moduleObj['calledRun']) {
  // runtime already started
  onRuntimeInitialized();
} else {
  // attach initializer; ds.js will call this when ready
  if (!moduleObj) {
    // If Module is not defined yet, create placeholder and add callback
    window.Module = {};
    moduleObj = window.Module;
  }
  moduleObj.onRuntimeInitialized = onRuntimeInitialized;
}

// ---------------------------
// Linked List operations (update both WASM and jsList mirror)
// ---------------------------

function pushFront() {
  const v = parseInt(inputValue.value);
  if (Number.isNaN(v)) { 
    showNotification('Please enter a valid integer', 'error'); 
    return; 
  }
  
  ll_push_front(listPtr, v);
  jsList.unshift(v);
  inputValue.value = '';
  
  // Animate
  animateNode('front', v);
  showNotification(`Added ${v} to front`, 'success');
}

function pushBack() {
  const v = parseInt(inputValue.value);
  if (Number.isNaN(v)) { 
    showNotification('Please enter a valid integer', 'error'); 
    return; 
  }
  
  ll_push_back(listPtr, v);
  jsList.push(v);
  inputValue.value = '';
  
  // Animate
  animateNode('back', v);
  showNotification(`Added ${v} to back`, 'success');
}

function popFront() {
  if (jsList.length === 0) { 
    showNotification('List is empty', 'error'); 
    return; 
  }
  
  const removedValue = jsList[0];
  ll_pop_front(listPtr);
  jsList.shift();
  render();
  showNotification(`Removed ${removedValue} from front`, 'success');
}

function popBack() {
  if (jsList.length === 0) { 
    showNotification('List is empty', 'error'); 
    return; 
  }
  
  const removedValue = jsList[jsList.length - 1];
  ll_pop_back(listPtr);
  jsList.pop();
  render();
  showNotification(`Removed ${removedValue} from back`, 'success');
}

function resetList() {
  if (listPtr) {
    ll_destroy(listPtr);
  }
  listPtr = ll_create();
  jsList = [];
  render();
  showNotification('List cleared', 'success');
}

// ---------------------------
// Notifications
// ---------------------------

function showNotification(msg, type = 'success') {
  notification.textContent = msg;
  notification.className = `notification show ${type}`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

// ---------------------------
// Animation
// ---------------------------

function animateNode(position, value) {
  animatingNode = { position, value };
  animationProgress = 0;
  
  const animate = () => {
    animationProgress += 0.05;
    if (animationProgress >= 1) {
      animatingNode = null;
      render();
      return;
    }
    render();
    requestAnimationFrame(animate);
  };
  
  requestAnimationFrame(animate);
}

// ---------------------------
// Rendering
// ---------------------------

function render() {
  // Canvas size
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update stats
  nodeCount.textContent = jsList.length;
  headValue.textContent = jsList.length > 0 ? jsList[0] : '—';
  tailValue.textContent = jsList.length > 0 ? jsList[jsList.length - 1] : '—';

  // Show/hide empty state
  if (jsList.length === 0 && !animatingNode) {
    emptyState.classList.add('visible');
    nodeListDiv.textContent = 'List is empty';
    return;
  } else {
    emptyState.classList.remove('visible');
  }

  const startX = 40;
  const y = canvas.height / 2;
  const nodeW = 70;
  const nodeH = 50;
  const gap = 50;

  // Draw nodes
  jsList.forEach((val, i) => {
    const x = startX + i * (nodeW + gap);
    const isHead = i === 0;
    const isTail = i === jsList.length - 1;
    drawNode(x, y, nodeW, nodeH, val, isHead, isTail);

    // Arrow to next
    if (i < jsList.length - 1) {
      drawArrow(x + nodeW, y, x + nodeW + gap, y);
    }
  });

  // Draw animating node
  if (animatingNode) {
    const ease = easeOutCubic(animationProgress);
    let x, alpha;
    
    if (animatingNode.position === 'front') {
      x = startX - 100 + (100 * ease);
      alpha = ease;
    } else {
      const lastX = startX + (jsList.length - 1) * (nodeW + gap);
      x = lastX + nodeW + 100 - (100 * ease);
      alpha = ease;
    }
    
    ctx.save();
    ctx.globalAlpha = alpha;
    drawNode(x, y, nodeW, nodeH, animatingNode.value, false, false, true);
    ctx.restore();
  }

  // Update textual list
  if (jsList.length > 0) {
    nodeListDiv.textContent = 'List: ' + jsList.join(' → ');
  }
}

function drawNode(x, y, w, h, value, isHead, isTail, isAnimating = false) {
  const radius = 8;
  
  // Shadow
  if (!isAnimating) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
  }
  
  // Main rect
  const gradient = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
  
  if (isHead) {
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
  } else if (isTail) {
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#7c3aed');
  } else {
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#4f46e5');
  }
  
  ctx.fillStyle = gradient;
  roundRect(ctx, x, y - h / 2, w, h, radius, true, false);
  
  if (!isAnimating) {
    ctx.restore();
  }
  
  // Border highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  roundRect(ctx, x + 1, y - h / 2 + 1, w - 2, h - 2, radius, false, true);
  
  // Value
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), x + w / 2, y);
  
  // Labels
  ctx.font = '10px Inter, Arial';
  ctx.fillStyle = '#64748b';
  
  if (isHead) {
    ctx.fillText('HEAD', x + w / 2, y - h / 2 - 10);
  }
  if (isTail) {
    ctx.fillText('TAIL', x + w / 2, y + h / 2 + 18);
  }
  
  // Pointer visualization (small circle)
  ctx.fillStyle = isHead ? '#3b82f6' : isTail ? '#8b5cf6' : '#6366f1';
  ctx.beginPath();
  ctx.arc(x + w - 8, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawArrow(x1, y1, x2, y2) {
  const arrowSize = 10;
  const lineOffset = 8;
  
  // Line
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1 + lineOffset, y1);
  ctx.lineTo(x2 - lineOffset - arrowSize, y2);
  ctx.stroke();
  
  // Arrow head
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(x2 - lineOffset, y2);
  ctx.lineTo(
    x2 - lineOffset - arrowSize * Math.cos(angle - Math.PI / 6),
    y2 - arrowSize * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - lineOffset - arrowSize * Math.cos(angle + Math.PI / 6),
    y2 - arrowSize * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
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

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Continuous rendering for smooth animations
function continuousRender() {
  render();
  requestAnimationFrame(continuousRender);
}

// Start continuous rendering
continuousRender();

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  try {
    if (listPtr && ModuleReady) {
      ll_destroy(listPtr);
    }
  } catch (e) { /* ignore */ }
});
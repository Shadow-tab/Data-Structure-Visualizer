// graph.js
// Using anime.js for smooth animations

let ModuleReady = false;
let moduleObj = (typeof Module !== 'undefined') ? Module : null;

// C function wrappers matching bindings.cpp
let graph_create, graph_add_node, graph_remove_node, graph_add_edge,
  graph_add_undirected_edge, graph_remove_edge, graph_get_vertex_count,
  graph_bfs, graph_dfs, graph_dijkstra, graph_prim, graph_destroy;

// Graph data
let graphPtr = null;
let vertices = [];
let edges = [];
let isDirected = true;
let selectedNode = null;
let draggedNode = null;
let nextNodeId = 0;

// Animation state
let traversalPath = [];
let currentPathIndex = 0;

// DOM refs
const wasmStatus = document.getElementById('wasmStatus');
const statusDot = document.getElementById('statusDot');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const graphInfo = document.getElementById('graphInfo');
const emptyState = document.getElementById('emptyState');
const notification = document.getElementById('notification');

// Stats
const vertexCount = document.getElementById('vertexCount');
const edgeCount = document.getElementById('edgeCount');
const graphType = document.getElementById('graphType');

// Input elements
const edgeFrom = document.getElementById('edgeFrom');
const edgeTo = document.getElementById('edgeTo');
const edgeWeight = document.getElementById('edgeWeight');
const algoStart = document.getElementById('algoStart');

// Buttons
const btnAddNode = document.getElementById('btnAddNode');
const btnRemoveNode = document.getElementById('btnRemoveNode');
const btnAddEdge = document.getElementById('btnAddEdge');
const btnRemoveEdge = document.getElementById('btnRemoveEdge');
const btnBFS = document.getElementById('btnBFS');
const btnDFS = document.getElementById('btnDFS');
const btnDijkstra = document.getElementById('btnDijkstra');
const btnPrim = document.getElementById('btnPrim');
const btnClear = document.getElementById('btnClear');
const btnSample = document.getElementById('btnSample');
const btnDirected = document.getElementById('btnDirected');
const btnUndirected = document.getElementById('btnUndirected');

// Event listeners
btnAddNode.addEventListener('click', addNode);
btnRemoveNode.addEventListener('click', removeNode);
btnAddEdge.addEventListener('click', addEdge);
btnRemoveEdge.addEventListener('click', removeEdge);
btnBFS.addEventListener('click', runBFS);
btnDFS.addEventListener('click', runDFS);
btnDijkstra.addEventListener('click', runDijkstra);
btnPrim.addEventListener('click', runPrim);
btnClear.addEventListener('click', clearGraph);
btnSample.addEventListener('click', createSampleGraph);

btnDirected.addEventListener('click', () => switchGraphType(true));
btnUndirected.addEventListener('click', () => switchGraphType(false));

// Canvas interactions
canvas.addEventListener('mousedown', onCanvasMouseDown);
canvas.addEventListener('mousemove', onCanvasMouseMove);
canvas.addEventListener('mouseup', onCanvasMouseUp);

// WASM initialization
function onRuntimeInitialized() {
  moduleObj = Module;

  // Wrap C functions matching bindings.cpp
  graph_create = moduleObj.cwrap('graph_create', 'number', ['number']);
  graph_add_node = moduleObj.cwrap('graph_add_node', null, ['number']);
  graph_remove_node = moduleObj.cwrap('graph_remove_node', null, ['number', 'number']);
  graph_add_edge = moduleObj.cwrap('graph_add_edge', null, ['number', 'number', 'number', 'number']);
  graph_add_undirected_edge = moduleObj.cwrap('graph_add_undirected_edge', null, ['number', 'number', 'number', 'number']);
  graph_remove_edge = moduleObj.cwrap('graph_remove_edge', null, ['number', 'number', 'number']);
  graph_get_vertex_count = moduleObj.cwrap('graph_get_vertex_count', 'number', ['number']);
  // Note: BFS and DFS return arrays, handled separately
  graph_destroy = moduleObj.cwrap('graph_destroy', null, ['number']);

  graphPtr = graph_create(10); // Initial capacity
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

// Graph operations
function addNode() {
  const x = Math.random() * (canvas.width - 100) + 50;
  const y = Math.random() * (canvas.height - 100) + 50;

  const node = {
    id: nextNodeId++,
    x: x,
    y: y,
    vx: 0,
    vy: 0
  };

  vertices.push(node);
  graph_add_node(graphPtr);

  // Animate node appearance
  anime({
    targets: node,
    scale: [0, 1],
    duration: 400,
    easing: 'easeOutElastic(1, .5)'
  });

  updateStats();
  render();
  showNotification(`Added node ${node.id}`, 'success');
}

function removeNode() {
  if (selectedNode === null) {
    showNotification('Select a node first', 'error');
    return;
  }

  const nodeIndex = vertices.findIndex(v => v.id === selectedNode);
  if (nodeIndex === -1) return;

  // Remove connected edges
  edges = edges.filter(e => e.from !== selectedNode && e.to !== selectedNode);

  // Remove from C++ graph
  graph_remove_node(graphPtr, selectedNode);

  // Animate removal
  const node = vertices[nodeIndex];
  anime({
    targets: node,
    scale: 0,
    opacity: 0,
    duration: 300,
    easing: 'easeInQuad',
    complete: () => {
      vertices.splice(nodeIndex, 1);
      selectedNode = null;
      updateStats();
      render();
    }
  });

  showNotification(`Removed node ${selectedNode}`, 'success');
}

function addEdge() {
  const from = parseInt(edgeFrom.value);
  const to = parseInt(edgeTo.value);
  const weight = parseFloat(edgeWeight.value) || 1;

  if (isNaN(from) || isNaN(to)) {
    showNotification('Enter valid node IDs', 'error');
    return;
  }

  if (!vertices.find(v => v.id === from) || !vertices.find(v => v.id === to)) {
    showNotification('Node IDs do not exist', 'error');
    return;
  }

  if (edges.some(e => e.from === from && e.to === to)) {
    showNotification('Edge already exists', 'error');
    return;
  }

  edges.push({ from, to, weight });

  // Add to C++ graph
  if (isDirected) {
    graph_add_edge(graphPtr, from, to, weight);
  } else {
    graph_add_undirected_edge(graphPtr, from, to, weight);
  }

  updateStats();
  render();
  showNotification(`Added edge ${from} → ${to}`, 'success');
}

function removeEdge() {
  const from = parseInt(edgeFrom.value);
  const to = parseInt(edgeTo.value);

  if (isNaN(from) || isNaN(to)) {
    showNotification('Enter valid node IDs', 'error');
    return;
  }

  const index = edges.findIndex(e => e.from === from && e.to === to);
  if (index === -1) {
    showNotification('Edge not found', 'error');
    return;
  }

  edges.splice(index, 1);
  graph_remove_edge(graphPtr, from, to);

  updateStats();
  render();
  showNotification(`Removed edge ${from} → ${to}`, 'success');
}

function switchGraphType(directed) {
  isDirected = directed;
  btnDirected.classList.toggle('active', directed);
  btnUndirected.classList.toggle('active', !directed);
  graphType.textContent = directed ? 'Directed' : 'Undirected';

  // Recreate graph with new type
  if (graphPtr) {
    graph_destroy(graphPtr);
  }
  graphPtr = graph_create(10);

  // Re-add all nodes
  vertices.forEach(() => graph_add_node(graphPtr));

  // Re-add all edges with correct type
  edges.forEach(e => {
    if (directed) {
      graph_add_edge(graphPtr, e.from, e.to, e.weight);
    } else {
      graph_add_undirected_edge(graphPtr, e.from, e.to, e.weight);
    }
  });

  render();
  showNotification(`Switched to ${directed ? 'directed' : 'undirected'} graph`, 'info');
}

// Algorithm functions
function runBFS() {
  const start = parseInt(algoStart.value);
  if (isNaN(start) || !vertices.find(v => v.id === start)) {
    showNotification('Enter valid start vertex', 'error');
    return;
  }

  // Simulate BFS traversal (simplified)
  const visited = new Set();
  const queue = [start];
  traversalPath = [];

  while (queue.length > 0) {
    const node = queue.shift();
    if (visited.has(node)) continue;

    visited.add(node);
    traversalPath.push(node);

    // Add neighbors
    edges.filter(e => e.from === node).forEach(e => {
      if (!visited.has(e.to)) queue.push(e.to);
    });
  }

  animateTraversal('BFS');
}

function runDFS() {
  const start = parseInt(algoStart.value);
  if (isNaN(start) || !vertices.find(v => v.id === start)) {
    showNotification('Enter valid start vertex', 'error');
    return;
  }

  // Simulate DFS traversal
  const visited = new Set();
  traversalPath = [];

  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);
    traversalPath.push(node);

    edges.filter(e => e.from === node).forEach(e => {
      if (!visited.has(e.to)) dfs(e.to);
    });
  }

  dfs(start);
  animateTraversal('DFS');
}

function runDijkstra() {
  const start = parseInt(algoStart.value);
  if (isNaN(start) || !vertices.find(v => v.id === start)) {
    showNotification('Enter valid start vertex', 'error');
    return;
  }

  // Dijkstra's shortest path algorithm
  const distances = {};
  const visited = new Set();
  const previous = {};
  traversalPath = [];

  // Initialize distances
  vertices.forEach(v => {
    distances[v.id] = Infinity;
    previous[v.id] = null;
  });
  distances[start] = 0;

  // Priority queue (simple array-based implementation)
  const queue = vertices.map(v => v.id);

  while (queue.length > 0) {
    // Get vertex with minimum distance
    queue.sort((a, b) => distances[a] - distances[b]);
    const current = queue.shift();

    if (distances[current] === Infinity) break;

    visited.add(current);
    traversalPath.push(current);

    // Update distances to neighbors
    edges.filter(e => e.from === current).forEach(edge => {
      const neighbor = edge.to;
      if (!visited.has(neighbor)) {
        const newDist = distances[current] + (edge.weight || 1);
        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          previous[neighbor] = current;
        }
      }
    });
  }

  showNotification(`Dijkstra from node ${start}: Found shortest paths`, 'success');
  animateTraversal('Dijkstra');
}

function runPrim() {
  if (vertices.length === 0) {
    showNotification('Graph is empty', 'error');
    return;
  }

  // Prim's Minimum Spanning Tree algorithm
  const visited = new Set();
  const mstEdges = [];
  traversalPath = [];

  // Start from first vertex
  const start = vertices[0].id;
  visited.add(start);
  traversalPath.push(start);

  while (visited.size < vertices.length) {
    let minEdge = null;
    let minWeight = Infinity;

    // Find minimum weight edge connecting visited to unvisited vertex
    edges.forEach(edge => {
      if (visited.has(edge.from) && !visited.has(edge.to)) {
        const weight = edge.weight || 1;
        if (weight < minWeight) {
          minWeight = weight;
          minEdge = edge;
        }
      }
      // For undirected graphs, check reverse direction
      if (!isDirected && visited.has(edge.to) && !visited.has(edge.from)) {
        const weight = edge.weight || 1;
        if (weight < minWeight) {
          minWeight = weight;
          minEdge = { from: edge.to, to: edge.from, weight: edge.weight };
        }
      }
    });

    if (!minEdge) break; // Graph is disconnected

    visited.add(minEdge.to);
    traversalPath.push(minEdge.to);
    mstEdges.push(minEdge);
  }

  const totalWeight = mstEdges.reduce((sum, e) => sum + (e.weight || 1), 0);
  showNotification(`Prim's MST: Total weight = ${totalWeight}`, 'success');
  animateTraversal('Prim');
}

function animateTraversal(algo) {
  currentPathIndex = 0;

  const interval = setInterval(() => {
    if (currentPathIndex >= traversalPath.length) {
      clearInterval(interval);
      showNotification(`${algo} complete: ${traversalPath.join(' → ')}`, 'success');
      setTimeout(() => { traversalPath = []; render(); }, 2000);
      return;
    }

    const nodeId = traversalPath[currentPathIndex];
    const node = vertices.find(v => v.id === nodeId);

    if (node) {
      anime({
        targets: node,
        scale: [1, 1.3, 1],
        duration: 500,
        easing: 'easeOutElastic(1, .5)'
      });
    }

    currentPathIndex++;
    render();
  }, 600);
}

function clearGraph() {
  if (graphPtr) {
    graph_destroy(graphPtr);
  }
  graphPtr = graph_create(10);
  vertices = [];
  edges = [];
  selectedNode = null;
  nextNodeId = 0;
  traversalPath = [];

  updateStats();
  render();
  showNotification('Graph cleared', 'success');
}

function createSampleGraph() {
  clearGraph();

  // Create sample nodes
  const positions = [
    { x: 200, y: 100 }, { x: 400, y: 100 }, { x: 600, y: 100 },
    { x: 200, y: 300 }, { x: 400, y: 300 }, { x: 600, y: 300 }
  ];

  positions.forEach((pos, i) => {
    vertices.push({ id: i, x: pos.x, y: pos.y, vx: 0, vy: 0 });
    graph_add_node(graphPtr);
  });

  nextNodeId = vertices.length;

  // Create sample edges
  const sampleEdges = [
    { from: 0, to: 1, weight: 5 },
    { from: 1, to: 2, weight: 3 },
    { from: 0, to: 3, weight: 2 },
    { from: 1, to: 4, weight: 1 },
    { from: 2, to: 5, weight: 4 },
    { from: 3, to: 4, weight: 6 },
    { from: 4, to: 5, weight: 2 }
  ];

  sampleEdges.forEach(e => {
    edges.push(e);
    if (isDirected) {
      graph_add_edge(graphPtr, e.from, e.to, e.weight);
    } else {
      graph_add_undirected_edge(graphPtr, e.from, e.to, e.weight);
    }
  });

  updateStats();
  render();
  showNotification('Sample graph created', 'success');
}

// Canvas interaction handlers
function onCanvasMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const clicked = vertices.find(v => {
    const dx = v.x - x;
    const dy = v.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 25;
  });

  if (clicked) {
    selectedNode = clicked.id;
    draggedNode = clicked;
  } else {
    selectedNode = null;
  }

  render();
}

function onCanvasMouseMove(e) {
  if (!draggedNode) return;

  const rect = canvas.getBoundingClientRect();
  draggedNode.x = e.clientX - rect.left;
  draggedNode.y = e.clientY - rect.top;

  render();
}

function onCanvasMouseUp() {
  draggedNode = null;
}

function updateStats() {
  vertexCount.textContent = vertices.length;
  edgeCount.textContent = edges.length;

  const info = vertices.length === 0
    ? 'Graph is empty'
    : `Vertices: ${vertices.map(v => v.id).join(', ')}`;
  graphInfo.textContent = info;
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

  if (vertices.length === 0) {
    emptyState.classList.add('visible');
    return;
  } else {
    emptyState.classList.remove('visible');
  }

  // Draw edges first
  edges.forEach(edge => {
    const from = vertices.find(v => v.id === edge.from);
    const to = vertices.find(v => v.id === edge.to);
    if (from && to) {
      drawEdge(from, to, edge.weight, isDirected);
    }
  });

  // Draw vertices
  vertices.forEach(vertex => {
    const isSelected = vertex.id === selectedNode;
    const isInPath = traversalPath.slice(0, currentPathIndex).includes(vertex.id);
    drawVertex(vertex, isSelected, isInPath);
  });
}

function drawEdge(from, to, weight, directed) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);

  const startX = from.x + Math.cos(angle) * 25;
  const startY = from.y + Math.sin(angle) * 25;
  const endX = to.x - Math.cos(angle) * 25;
  const endY = to.y - Math.sin(angle) * 25;

  // Edge line
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Arrow for directed graphs
  if (directed) {
    const arrowSize = 12;
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle - Math.PI / 6),
      endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle + Math.PI / 6),
      endY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }

  // Weight label
  if (weight !== 1) {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    ctx.fillStyle = '#1e1e30';
    ctx.fillRect(midX - 15, midY - 10, 30, 20);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(weight, midX, midY);
  }
}

function drawVertex(vertex, isSelected, isInPath) {
  const radius = 25;

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;

  // Circle
  const gradient = ctx.createRadialGradient(vertex.x, vertex.y, 0, vertex.x, vertex.y, radius);

  if (isInPath) {
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(1, '#059669');
  } else if (isSelected) {
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(1, '#d97706');
  } else {
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#5a67d8');
  }

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(vertex.x, vertex.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Border
  ctx.strokeStyle = isSelected ? '#fff' : 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = isSelected ? 3 : 2;
  ctx.beginPath();
  ctx.arc(vertex.x, vertex.y, radius - 1, 0, Math.PI * 2);
  ctx.stroke();

  // ID label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(vertex.id, vertex.x, vertex.y);
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
    if (graphPtr && ModuleReady) {
      graph_destroy(graphPtr);
    }
  } catch (e) { /* ignore */ }
});
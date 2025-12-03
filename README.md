DATA STRUCTURE VISUALIZER
=========================

An interactive browser‑based visualizer for core data structures, 
powered by C++ and WebAssembly (Emscripten). The project compiles C++ 
implementations into a high‑performance WASM module and uses JavaScript + Canvas for real‑time animations.

----------------------------------------
FEATURES
----------------------------------------

1. LINKED LIST
   - Operations: push_front, push_back, pop_front, pop_back, peek
   - Visualization: horizontal node chain, head/tail indicators
   - Time Complexity: O(1)

3. BINARY HEAP
   - Supports min‑heap and max‑heap
   - Operations: insert, extract root, peek
   - Visualization: tree view + array view
   - Time Complexity: O(log n)

4. AVL TREE
   - Operations: insert, delete, search
   - Visualization: rotations (LL, RR, LR, RL) with animations
   - Time Complexity: O(log n)

5. GRAPH
   - Operations: add/remove node, add/remove edge, BFS, DFS, Dijkstra, Prim
   - Visualization: draggable nodes, weighted edges
   - Time Complexity: BFS/DFS O(V + E), Dijkstra/Prim O((V + E) log V)

6. HASH TABLE
   - Operations: insert, search, remove
   - Collision Handling: linear probing
   - Visualization: probing steps, tombstones
   - Time Complexity: O(1) average

----------------------------------------
INSTALLATION
----------------------------------------

PREREQUISITES:
- Python 3.x (optional for local server)
- Emscripten SDK
- C++ compiler

STEPS:
1. Clone repository:
   git clone https://github.com/Shadow-tab/data-structure-visualizer.git
   cd data-structure-visualizer

2. Install and activate Emscripten(Or use our Docker container):
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh   (Linux/Mac)
   emsdk_env.bat           (Windows)

3. Build project:
   cd build
   build.bat    (Windows)

4. Run:
   cd web
   Use Live Server
   python -m http.server 8000
   Open http://localhost:8000

----------------------------------------
BUILD DETAILS
----------------------------------------

Emscripten Output:
- web/wasm/ds.js   (JavaScript glue)
- web/wasm/ds.wasm (WebAssembly binary)

Compilation uses:
- O3 optimization
- EXPORTED_FUNCTIONS for C++ bindings
- cwrap/ccall for JS → WASM interface

----------------------------------------
PROJECT STRUCTURE
----------------------------------------


----------------------------------------
ARCHITECTURE
----------------------------------------

JavaScript Layer
- UI, rendering, animations
- Calls WASM using cwrap/ccall

WebAssembly Layer
- Compiled C++ functions
- Fast computation

C++ Layer
- Data structure logic
- Manual memory management

Data Flow:
User Input → JS Event → WASM Function → C++ Execution → JS Mirror → Canvas Rendering

----------------------------------------
TECHNOLOGIES
----------------------------------------
Frontend: HTML5 Canvas, JavaScript ES6, Anime.js, CSS3  
Backend: C++17, WebAssembly  
Toolchain: Emscripten

----------------------------------------
CONTRIBUTING
----------------------------------------
Fork → Branch → Commit → Push → Pull Request

----------------------------------------
SUPPORT
----------------------------------------
If you encounter any issues or have questions:

1. **Check the [Issues](https://github.com/Shadow-tab/data-structure-visualizer/issues)** page
2. **Open a new issue** with detailed information
3. **Join discussions** in the repository


----------------------------------------
Made for Computer Science students and educators.

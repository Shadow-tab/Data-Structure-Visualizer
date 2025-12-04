@echo off
REM 

set SRC=src\ds
set BINDINGS=src
set OUT=web\wasm

if not exist "%OUT%" mkdir "%OUT%"

emcc ^
 "%SRC%\linkedlist.cpp" ^
 "%SRC%\heap.cpp" ^
 "%SRC%\avl.cpp" ^
 "%SRC%\graph.cpp" ^
 "%SRC%\hash.cpp" ^
 "%BINDINGS%\bindings.cpp" ^
 -o "%OUT%\ds.js" ^
 -s WASM=1 -O3 ^
 -s EXPORTED_RUNTIME_METHODS=[\"cwrap\",\"ccall\"] ^
 -s EXPORTED_FUNCTIONS=[\"_ll_create\",\"_ll_push_front\",\"_ll_push_back\",\"_ll_pop_front\",\"_ll_pop_back\",\"_ll_get_head\",\"_ll_get_tail\",\"_ll_destroy\",\"_avl_create\",\"_avl_insert\",\"_avl_delete\",\"_avl_get_height\",\"_avl_destroy\",\"_heap_create\",\"_heap_insert_min\",\"_heap_insert_max\",\"_heap_delete_root\",\"_heap_destroy\",\"_graph_create\",\"_graph_add_node\",\"_graph_remove_node\",\"_graph_add_edge\",\"_graph_add_undirected_edge\",\"_graph_remove_edge\",\"_graph_get_vertex_count\",\"_graph_bfs\",\"_graph_dfs\",\"_graph_dijkstra\",\"_graph_prim\",\"_graph_print\",\"_graph_destroy\",\"_hash_create\",\"_hash_insert\",\"_hash_search\",\"_hash_remove\",\"_hash_destroy\"]


if %ERRORLEVEL% neq 0 (
    echo BUILD FAILED
    pause
) else (
    echo BUILD SUCCEEDED
    pause
)

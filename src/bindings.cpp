#include "./ds/linkedlist.h"
#include "./ds/AVL.h"
#include "./ds/heap.h"
#include "./ds/graph.h"
#include "ds/hash.h"

extern "C" {

// ===============================================================
// ====================== LINKED LIST =============================
// ===============================================================

// Create a new linked list
void* ll_create() {
    return new list();
}

// push_front(int)
void ll_push_front(void* ptr, int value) {
    ((list*)ptr)->push_front(value);
}

// push_back(int)
void ll_push_back(void* ptr, int value) {
    ((list*)ptr)->push_back(value);
}

// pop_front()
void ll_pop_front(void* ptr) {
    ((list*)ptr)->pop_front();
}

// pop_back()
void ll_pop_back(void* ptr) {
    ((list*)ptr)->pop_back();
}

// get head value  (returns -1 if empty)
int ll_get_head(void* ptr) {
    list* lst = (list*)ptr;
    if (lst->head == nullptr) return -1;
    return lst->head->value;
}

// get tail value  (returns -1 if empty)
int ll_get_tail(void* ptr) {
    list* lst = (list*)ptr;
    if (lst->tail == nullptr) return -1;
    return lst->tail->value;
}

// destroy the list
void ll_destroy(void* ptr) {
    delete (list*)ptr;
}



// ===============================================================
// ============================ AVL ==============================
// ===============================================================

// Create AVL tree
void* avl_create() {
    return new AVLTree();
}

// Insert key
void avl_insert(void* ptr, int key) {
    ((AVLTree*)ptr)->insertKey(key);
}

// Delete key
void avl_delete(void* ptr, int key) {
    ((AVLTree*)ptr)->deleteKey(key);
}

// Get height of root
int avl_get_height(void* ptr) {
    AVLTree* tree = (AVLTree*)ptr;
    return tree->height(tree->getRoot());
}

// destroy AVL tree
void avl_destroy(void* ptr) {
    delete (AVLTree*)ptr;
}
// ===============================================================
// ============================ HEAP ==============================
// ===============================================================

void* heap_create() {
    return new heap();
}

void heap_insert_min(void* ptr, int val) {
    ((heap*)ptr)->insertmin(val);
}

void heap_insert_max(void* ptr, int val) {
    ((heap*)ptr)->insertmax(val);
}

void heap_delete_root(void* ptr) {
    ((heap*)ptr)->deleteelement();
}

void heap_destroy(void* ptr) {
    delete (heap*)ptr;
}



// ===============================================================
// ============================ GRAPH =============================
// ===============================================================

void* graph_create(int vertices) {
    return new graph(vertices);
}

void graph_add_node(void* ptr) {
    ((graph*)ptr)->addnode();
}

void graph_remove_node(void* ptr, int u) {
    ((graph*)ptr)->removenode(u);
}

void graph_add_edge(void* ptr, int u, int v, double w) {
    ((graph*)ptr)->addedge(u, v, w);
}

void graph_add_undirected_edge(void* ptr, int u, int v, double w) {
    ((graph*)ptr)->addendirectededge(u, v, w);
}

void graph_remove_edge(void* ptr, int u, int v) {
    ((graph*)ptr)->removeedge(u, v);
}

int graph_get_vertex_count(void* ptr) {
    return ((graph*)ptr)->getVertexCount();
}

int* graph_bfs(void* ptr, int start, int* outCount) {
    return ((graph*)ptr)->BFS(start, *outCount);
}

int* graph_dfs(void* ptr, int start, int* outCount) {
    return ((graph*)ptr)->DFS(start, *outCount);
}

void graph_dijkstra(void* ptr, int start) {
    ((graph*)ptr)->dijkstra(start);
}

void graph_prim(void* ptr) {
    ((graph*)ptr)->prim();
}

void graph_print(void* ptr) {
    ((graph*)ptr)->printgraph();
}

void graph_destroy(void* ptr) {
    delete (graph*)ptr;
}


// -------------------------------
// HASH TABLE WRAPPERS (NEW)
// -------------------------------

HashTable* hash_create(int size) {
    return new HashTable(size);
}

void hash_insert(HashTable* ht, const char* key, int value) {
    if (!ht) return;
    ht->insert(std::string(key), value);
}

int hash_search(HashTable* ht, const char* key) {
    if (!ht || !key) return -1;
    int probes = 0;
    std::string k(key);
    return ht->search(k, probes);   
}
void hash_remove(HashTable* ht, const char* key) {
    if (!ht) return;
    ht->remove(std::string(key));
}

void hash_print(HashTable* ht) {
    if (!ht) return;
    ht->print();
}

void hash_destroy(HashTable* ht) {
    delete ht;
}
} // extern "C"

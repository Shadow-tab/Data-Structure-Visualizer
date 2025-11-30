#include "graph.h"
using namespace std;

singlenode::singlenode(int val, double w) {
    vertex = val;
    weight = w;
    nextnode = 0;
}

graph::graph(int num) {
    V = num;
    array = new singlenode*[V];
    for (int i = 0; i < V; i++) array[i] = 0;
}

graph::~graph() {
    for (int i = 0; i < V; i++) {
        singlenode* t = array[i];
        while (t) {
            singlenode* x = t;
            t = t->nextnode;
            delete x;
        }
    }
    delete[] array;
}

void graph::addnode() {
    singlenode** newarr = new singlenode*[V + 1];
    for (int i = 0; i < V; i++) newarr[i] = array[i];
    newarr[V] = 0;
    delete[] array;
    array = newarr;
    V++;
}

void graph::removeAllEdgesFrom(int u) {
    singlenode* t = array[u];
    while (t) {
        singlenode* x = t;
        t = t->nextnode;
        delete x;
    }
    array[u] = 0;
}

void graph::removenode(int u) {
    if (u < 0 || u >= V) return;

    removeAllEdgesFrom(u);

    for (int i = 0; i < V; i++) {
        if (i == u) continue;

        singlenode* prev = 0;
        singlenode* curr = array[i];

        while (curr) {
            if (curr->vertex == u) {
                if (prev == 0) array[i] = curr->nextnode;
                else prev->nextnode = curr->nextnode;
                delete curr;
                break;
            }
            prev = curr;
            curr = curr->nextnode;
        }
    }

    for (int i = 0; i < V; i++) {
        singlenode* curr = array[i];
        while (curr) {
            if (curr->vertex > u) curr->vertex--;
            curr = curr->nextnode;
        }
    }

    singlenode** newarr = new singlenode*[V - 1];
    int idx = 0;
    for (int i = 0; i < V; i++) {
        if (i == u) continue;
        newarr[idx++] = array[i];
    }

    delete[] array;
    array = newarr;
    V--;
}

void graph::addedge(int u, int v, double weight) {
    if (u < 0 || v < 0 || u >= V || v >= V) return;

    singlenode* n = new singlenode(v, weight);
    n->nextnode = array[u];
    array[u] = n;
}

void graph::addendirectededge(int u, int v, double weight) {
    addedge(u, v, weight);
    addedge(v, u, weight);
}

void graph::removeedge(int u, int v) {
    if (u < 0 || v < 0 || u >= V || v >= V) return;

    singlenode* prev = 0;
    singlenode* curr = array[u];

    while (curr) {
        if (curr->vertex == v) {
            if (prev == 0) array[u] = curr->nextnode;
            else prev->nextnode = curr->nextnode;
            delete curr;
            return;
        }
        prev = curr;
        curr = curr->nextnode;
    }
}

void graph::printgraph() {
    for (int i = 0; i < V; i++) {
        std::cout << i << " -> ";
        singlenode* t = array[i];
        while (t) {
            std::cout << "(" << t->vertex << ", w=" << t->weight << ")";
            t = t->nextnode;
        }
        std::cout << std::endl;
    }
}

int graph::getVertexCount() {
    return V;
}

int* graph::BFS(int start, int& outCount) {
    if (start < 0 || start >= V) {
        outCount = 0;
        return 0;
    }

    bool* visited = new bool[V];
    for (int i = 0; i < V; i++) visited[i] = false;

    int* order = new int[V];
    int idx = 0;

    int* q = new int[V];
    int front = 0, rear = 0;

    visited[start] = true;
    q[rear++] = start;

    while (front < rear) {
        int u = q[front++];
        order[idx++] = u;

        singlenode* t = array[u];
        while (t) {
            int v = t->vertex;
            if (!visited[v]) {
                visited[v] = true;
                q[rear++] = v;
            }
            t = t->nextnode;
        }
    }
    delete[] visited;
    delete[] q;
    outCount = idx;
    return order;
}

int* graph::DFS(int start, int& outCount) {
    if (start < 0 || start >= V) {
        outCount = 0;
        return 0;
    }
    bool* visited = new bool[V];
    for (int i = 0; i < V; i++) visited[i] = false;
    int* order = new int[V];
    int idx = 0;
    int* stack = new int[V];
    int top = -1;
    stack[++top] = start;
    while (top >= 0) {
        int u = stack[top--];
        if (!visited[u]) {
            visited[u] = true;
            order[idx++] = u;
            singlenode* t = array[u];
            while (t) {
                int v = t->vertex;
                if (!visited[v]) stack[++top] = v;
                t = t->nextnode;
            }
        }
    }
    delete[] visited;
    delete[] stack;
    outCount = idx;
    return order;
}

void graph::swapval(int& a, int& b) {
    int t = a;
    a = b;
    b = t;
}

void graph::heapifydown(int heap[], double key[], int pos[], int size, int i) {
    int left = 2 * i;
    int right = 2 * i + 1;
    int smallest = i;
    if (left <= size && key[heap[left]] < key[heap[smallest]])
        smallest = left;
    if (right <= size && key[heap[right]] < key[heap[smallest]])
        smallest = right;
    if (smallest != i) {
        pos[heap[i]] = smallest;
        pos[heap[smallest]] = i;
        swapval(heap[i], heap[smallest]);
        heapifydown(heap, key, pos, size, smallest);
    }
}

int graph::extractmin(int heap[], double key[], int pos[], int& size) {
    int root = heap[1];
    int last = heap[size];
    heap[1] = last;
    pos[last] = 1;
    size--;
    heapifydown(heap, key, pos, size, 1);
    return root;
}

void graph::decreasekey(int heap[], double key[], int pos[], int v) {
    int i = pos[v];
    while (i > 1 && key[heap[i]] < key[heap[i / 2]]) {
        pos[heap[i]] = i / 2;
        pos[heap[i / 2]] = i;
        swapval(heap[i], heap[i / 2]);
        i = i / 2;
    }
}

void graph::dijkstra(int start) {
    double inf = 1e9;
    double dist[1000];
    int parent[1000];
    bool visited[1000];
    int heap[1000];
    int pos[1000];
    int heapsize = V;
    for (int i = 0; i < V; i++) {
        dist[i] = inf;
        parent[i] = -1;
        visited[i] = false;
        heap[i + 1] = i;
        pos[i] = i + 1;
    }
    dist[start] = 0;
    decreasekey(heap, dist, pos, start);
    while (heapsize > 0) {
        int u = extractmin(heap, dist, pos, heapsize);
        visited[u] = true;
        singlenode* t = array[u];
        while (t) {
            int v = t->vertex;
            double w = t->weight;
            if (!visited[v] && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                decreasekey(heap, dist, pos, v);
            }
            t = t->nextnode;
        }
    }
    cout << "\nDijkstra Shortest Paths from " << start << ":\n";
    for (int i = 0; i < V; i++) {
        cout << "Vertex " << i << ": dist=" << dist[i]
             << ", parent=" << parent[i] << endl;
    }
}

void graph::prim() {
    int start = 0;
    double inf = 1e9;
    double key[1000];
    bool visited[1000];
    int parent[1000];
    int heap[1000];
    int pos[1000];
    int heapsize = V;
    for (int i = 0; i < V; i++) {
        visited[i] = false;
        key[i] = inf;
        parent[i] = -1;
        pos[i] = i + 1;
        heap[i + 1] = i;
    }
    key[start] = 0;
    decreasekey(heap, key, pos, start);
    while (heapsize > 0) {
        int u = extractmin(heap, key, pos, heapsize);
        visited[u] = true;
        singlenode* t = array[u];
        while (t) {
            int v = t->vertex;
            double w = t->weight;
            if (!visited[v] && w < key[v]) {
                key[v] = w;
                parent[v] = u;
                decreasekey(heap, key, pos, v);
            }
            t = t->nextnode;
        }
    }
    cout << "\nPRIM'S MST (starting at 0):\n";
    for (int i = 1; i < V; i++) {
        cout << parent[i] << " -- " << i << "   weight=" << key[i] << endl;
    }
}

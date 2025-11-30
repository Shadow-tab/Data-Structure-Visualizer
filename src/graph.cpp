#include "graph.h"
#include <iostream>
using namespace std;
singlenode::singlenode(int val, double w) {
    vertex = val;
    weight = w;
    nextnode = 0;
}

graph::graph(int num) {
    V = num;
    array = new singlenode*[V];
    for (int i = 0; i < V; i++) {
        array[i] = 0;
    }
}

graph::~graph() {
    for (int i = 0; i < V; i++) {
        singlenode* temp = array[i];
        while (temp) {
            singlenode* x = temp;
            temp = temp->nextnode;
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
    singlenode* temp = array[u];
    while (temp) {
        singlenode* x = temp;
        temp = temp->nextnode;
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
    singlenode* newnode = new singlenode(v, weight);
    newnode->nextnode = array[u];
    array[u] = newnode;
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
        std::cout << i << "->";
        singlenode* temp = array[i];
        while (temp) {
            std::cout << "(" << temp->vertex << ",w=" << temp->weight << ")";
            temp = temp->nextnode;
        }
        std::cout << std::endl;
    }
}

int graph::getVertexCount() {
    return V;
}

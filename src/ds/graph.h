#pragma once
#include <iostream>

class singlenode {
public:
    int vertex;
    double weight;
    singlenode* nextnode;
    singlenode(int val, double w);
};

class graph {
public:
    int V;
    singlenode** array;
    void removeAllEdgesFrom(int u);

public:
    graph(int num);
    ~graph();

    void addnode();
    void removenode(int u);

    void addedge(int u, int v, double weight);
    void addendirectededge(int u, int v, double weight);
    void removeedge(int u, int v);

    void printgraph();
    int getVertexCount();

    int* BFS(int start, int& outCount);
    int* DFS(int start, int& outCount);

    void swapval(int& a, int& b);
    void heapifydown(int heap[], double key[], int pos[], int size, int i);
    int extractmin(int heap[], double key[], int pos[], int& size);
    void decreasekey(int heap[], double key[], int pos[], int v);

    void dijkstra(int start);
    void prim();
};

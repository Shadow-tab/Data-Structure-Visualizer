#pragma once

class singlenode {
public:
    int vertex;
    double weight;
    singlenode* nextnode;
    singlenode(int val, double w);
};

class graph {
private:
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
};

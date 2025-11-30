#pragma once

class node {
public:
    int data;
    node* left;
    node* right;
    int height;

    node(int dat);
};

class AVLTree {
private:
    node* root;

    int height(node* n);
    int balancefactor(node* n);
    node* rightrotation(node* x);
    node* leftrotation(node* x);
    node* insert(node* n, int key);
    node* deleteAVL(node* r, int key);

public:
    AVLTree();

    void insertKey(int key);
    void deleteKey(int key);
    node* getRoot();
};

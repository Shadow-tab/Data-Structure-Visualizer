#pragma once

class AVLnode {
public:
    int data;
    AVLnode* left;
    AVLnode* right;
    int height;

    AVLnode(int dat);
};

class AVLTree {
public:
    AVLnode* root;
    int balancefactor(AVLnode
* n);
    AVLnode* rightrotation(AVLnode
* x);
    AVLnode* leftrotation(AVLnode
* x);
    AVLnode* insert(AVLnode
* n, int key);
    AVLnode* deleteAVL(AVLnode
* r, int key);

public:
    AVLTree();
    int height(AVLnode
* n);
    void insertKey(int key);
    void deleteKey(int key);
    AVLnode* getRoot();
};

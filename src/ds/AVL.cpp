#include "AVL.h"
//using namespace std;
AVLnode::AVLnode(int dat) {
    data = dat;
    left = nullptr;
    right = nullptr;
    height = 1;
}

AVLTree::AVLTree() {
    root = nullptr;
}

int AVLTree::height(AVLnode* n) {
    if (n == nullptr) return 0;
    return n->height;
}

int AVLTree::balancefactor(AVLnode* n) {
    if (n == nullptr) return 0;
    return height(n->left) - height(n->right);
}

AVLnode* AVLTree::rightrotation(AVLnode* x) {
    AVLnode* temp = x->left;
    AVLnode* temp2 = temp->right;

    x->left = temp2;
    temp->right = x;

    int hl = height(x->left);
    int hr = height(x->right);
    x->height = (hl > hr ? hl : hr) + 1;

    hl = height(temp->left);
    hr = height(temp->right);
    temp->height = (hl > hr ? hl : hr) + 1;

    return temp;
}

AVLnode* AVLTree::leftrotation(AVLnode* x) {
    AVLnode* temp = x->right;
    AVLnode* temp2 = temp->left;

    x->right = temp2;
    temp->left = x;

    int hl = height(x->left);
    int hr = height(x->right);
    x->height = (hl > hr ? hl : hr) + 1;

    hl = height(temp->left);
    hr = height(temp->right);
    temp->height = (hl > hr ? hl : hr) + 1;

    return temp;
}

AVLnode* AVLTree::insert(AVLnode* n, int key) {
    if (n == nullptr)
        return new AVLnode(key);

    if (key < n->data)
        n->left = insert(n->left, key);
    else if (key > n->data)
        n->right = insert(n->right, key);
    else
        return n;

    int hl = height(n->left);
    int hr = height(n->right);
    n->height = (hl > hr ? hl : hr) + 1;

    int balance = balancefactor(n);

    if (balance > 1 && key < n->left->data)
        return rightrotation(n);

    if (balance < -1 && key > n->right->data)
        return leftrotation(n);

    if (balance > 1 && key > n->left->data) {
        n->left = leftrotation(n->left);
        return rightrotation(n);
    }

    if (balance < -1 && key < n->right->data) {
        n->right = rightrotation(n->right);
        return leftrotation(n);
    }

    return n;
}

AVLnode* AVLTree::deleteAVL(AVLnode* r, int key) {
    if (r == nullptr) return r;

    if (key < r->data)
        r->left = deleteAVL(r->left, key);
    else if (key > r->data)
        r->right = deleteAVL(r->right, key);
    else {
        if (r->left == nullptr && r->right == nullptr) {
            delete r;
            return nullptr;
        }
        else if (r->left == nullptr) {
            AVLnode* temp = r->right;
            delete r;
            r = temp;
        }
        else if (r->right == nullptr) {
            AVLnode* temp = r->left;
            delete r;
            r = temp;
        }
        else {
            AVLnode* temp = r->right;
            while (temp->left)
                temp = temp->left;
            r->data = temp->data;
            r->right = deleteAVL(r->right, temp->data);
        }
    }

    if (r == nullptr) return r;

    int hl = height(r->left);
    int hr = height(r->right);
    r->height = (hl > hr ? hl : hr) + 1;

    int balance = balancefactor(r);

    if (balance > 1 && balancefactor(r->left) >= 0)
        return rightrotation(r);

    if (balance < -1 && balancefactor(r->right) <= 0)
        return leftrotation(r);

    if (balance > 1 && balancefactor(r->left) < 0) {
        r->left = leftrotation(r->left);
        return rightrotation(r);
    }

    if (balance < -1 && balancefactor(r->right) > 0) {
        r->right = rightrotation(r->right);
        return leftrotation(r);
    }

    return r;
}

void AVLTree::insertKey(int key) {
    root = insert(root, key);
}

void AVLTree::deleteKey(int key) {
    root = deleteAVL(root, key);
}

AVLnode* AVLTree::getRoot() {
    return root;
}

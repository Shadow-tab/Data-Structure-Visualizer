#pragma once

class node {
public:
    int value;
    node* next;

    node(int val);
};

class list {
public:
    node* head;
    node* tail;

    list();

    void push_front(int value);
    void push_back(int value);
    void pop_back();
    void pop_front();
};

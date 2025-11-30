#include "linkedlist.h"

node::node(int val) {
    value = val;
    next = nullptr;
}

list::list() {
    head = nullptr;
    tail = nullptr;
}

void list::push_front(int value) {
    node* newnode = new node(value);
    if (head == nullptr) {
        head = newnode;
        tail = newnode;
    } else {
        newnode->next = head;
        head = newnode;
    }
}

void list::push_back(int value) {
    node* newnode = new node(value);
    if (head == nullptr) {
        head = newnode;
        tail = newnode;
    } else {
        tail->next = newnode;
        tail = newnode;
    }
}

void list::pop_back() {
    if (head == nullptr)
        return;

    if (head == tail) {
        delete head;
        head = nullptr;
        tail = nullptr;
        return;
    }

    node* temp = head;
    while (temp->next != tail) {
        temp = temp->next;
    }

    delete tail;
    tail = temp;
    tail->next = nullptr;
}

void list::pop_front() {
    if (head == nullptr)
        return;

    node* temp = head;
    head = head->next;
    delete temp;

    if (head == nullptr)
        tail = nullptr;
}

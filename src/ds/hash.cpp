#include "hash.h"
#include <iostream>

HashTable::HashTable(int cap) {
    capacity = cap;
    size = 0;
    table = new Entry[capacity];
}

HashTable::~HashTable() {
    delete[] table;
}
int HashTable::hashFunction(const std::string& key) const {
    unsigned long hash = 5381;
    for (char c : key) {
        hash = ((hash << 5) + hash) + c;  
    }
    return hash % capacity;
}
int HashTable::probe(int index) const {
    return (index + 1) % capacity;
}

bool HashTable::insert(const std::string& key, int value) {
    if (size == capacity) return false; 
    int index = hashFunction(key);
    while (table[index].isOccupied && !table[index].isDeleted) {
        if (table[index].key == key) {
            table[index].value = value; 
            return true;
        }
        index = probe(index);
    }

    table[index].key = key;
    table[index].value = value;
    table[index].isOccupied = true;
    table[index].isDeleted = false;
    size++;

    return true;
}

bool HashTable::remove(const std::string& key) {
    int index = hashFunction(key);

    while (table[index].isOccupied) {
        if (!table[index].isDeleted && table[index].key == key) {
            table[index].isDeleted = true;
            size--;
            return true;
        }
        index = probe(index);
    }

    return false;
}
bool HashTable::search(const std::string& key, int &outValue) const {
    int index = hashFunction(key);

    while (table[index].isOccupied) {
        if (!table[index].isDeleted && table[index].key == key) {
            outValue = table[index].value;
            return true;
        }
        index = probe(index);
    }
    return false;
}
void HashTable::print() const {
    std::cout << "Hash Table:\n";
    for (int i = 0; i < capacity; i++) {
        if (table[i].isOccupied && !table[i].isDeleted) {
            std::cout << "[" << i << "] "<< table[i].key << " -> "<< table[i].value << "\n";
        } else {
            std::cout << "[" << i << "] EMPTY\n";
        }
    }
}

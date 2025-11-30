#pragma once
#include <string>

class HashTable {
private:
    struct Entry {
        std::string key;
        int value;
        bool isOccupied;
        bool isDeleted;

        Entry() : key(""), value(0), isOccupied(false), isDeleted(false) {}
    };

    Entry* table;
    int capacity;
    int size;

    int hashFunction(const std::string& key) const;
    int probe(int index) const;

public:
    HashTable(int cap = 100);
    ~HashTable();

    bool insert(const std::string& key, int value);
    bool remove(const std::string& key);
    bool search(const std::string& key, int &outValue) const;

    int getSize() const { return size; }
    void print() const;
};

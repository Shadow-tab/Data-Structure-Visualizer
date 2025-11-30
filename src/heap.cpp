#include "heap.h"

heap::heap() {
    size = 0;
}

void heap::insertmin(int value) {
    size++;
    arr[size] = value;
    bubbleupminitr(size);
}

void heap::insertmax(int value) {
    size++;
    arr[size] = value;
    bubbleupmaxitr(size);
}

void heap::bubbleupminrec(int i) {
    if (i <= 1) return;
    if (arr[i] < arr[i / 2]) {
        int t = arr[i];
        arr[i] = arr[i / 2];
        arr[i / 2] = t;
    }
    bubbleupminrec(i / 2);
}

void heap::bubbleupmaxrec(int i) {
    if (i <= 1) return;
    if (arr[i] > arr[i / 2]) {
        int t = arr[i];
        arr[i] = arr[i / 2];
        arr[i / 2] = t;
    }
    bubbleupmaxrec(i / 2);
}

void heap::bubbleupminitr(int i) {
    while (i > 1) {
        if (arr[i] < arr[i / 2]) {
            int t = arr[i];
            arr[i] = arr[i / 2];
            arr[i / 2] = t;
        }
        i = i / 2;
    }
}

void heap::bubbleupmaxitr(int i) {
    while (i > 1) {
        if (arr[i] > arr[i / 2]) {
            int t = arr[i];
            arr[i] = arr[i / 2];
            arr[i / 2] = t;
        }
        i = i / 2;
    }
}

void heap::deleteelement() {
    if (size == 0) return;
    arr[1] = arr[size];
    size--;
    bubbledownitr(1);
}

void heap::bubbledownitr(int i) {
    while (true) {
        int left = 2 * i;
        int right = 2 * i + 1;
        int largest = i;

        if (left <= size && arr[left] > arr[largest]) largest = left;
        if (right <= size && arr[right] > arr[largest]) largest = right;

        if (largest != i) {
            int t = arr[largest];
            arr[largest] = arr[i];
            arr[i] = t;
            i = largest;
        } else break;
    }
}

void heap::bubbledownrec(int i) {
    int left = 2 * i;
    int right = 2 * i + 1;
    int largest = i;

    if (left <= size && arr[left] > arr[largest]) largest = left;
    if (right <= size && arr[right] > arr[largest]) largest = right;

    if (largest != i) {
        int t = arr[largest];
        arr[largest] = arr[i];
        arr[i] = t;
        bubbledownrec(largest);
    }
}

int heap::getSize() const {
    return size;
}

int heap::getElement(int index) const {
    if (index < 1 || index > size) return -1;
    return arr[index];
}

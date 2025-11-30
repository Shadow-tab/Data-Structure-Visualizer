#pragma once

class heap {
public:
    int arr[100];
    int size;

    void bubbleupminrec(int i);
    void bubbleupmaxrec(int i);
    void bubbleupminitr(int i);
    void bubbleupmaxitr(int i);
    void bubbledownitr(int i);
    void bubbledownrec(int i);

public:
    heap();

    void insertmin(int value);
    void insertmax(int value);
    void deleteelement();
    int getSize() const;
    int getElement(int index) const;
};

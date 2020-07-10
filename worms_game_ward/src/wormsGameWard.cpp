#include <iostream>
#include <windows.h>
#include <conio.h>

#include "worms.cpp"

using namespace std;

bool shouldUploadData;

DWORD WINAPI readShouldUploadDataControlFlag(LPVOID args) {
    bool* v = (bool*) args;

    while(true) {
        char c = _getch();
        switch(c) {
            case 's':
            case 'S':
                *v = true;
                break;
            case 'n':
            case 'N':
                *v = false;
                break;
        }
        cout << "Reading new input in 1s (This is the time to kill the process if needed)" << endl;
        Sleep(1000);
    }
    return 0x0;
}

int main() {
    shouldUploadData = true;
    CreateThread(NULL, 0, readShouldUploadDataControlFlag, &shouldUploadData, 0, NULL);
    while(true) {
        HANDLE hProcess = attachToProcess();
        if(hProcess == NULL){
            cout << "Failed to attach, retrying in 3s..." << endl;
            Sleep(3000);
            continue;
        }

        WormsGame game = WormsGame(hProcess, &shouldUploadData, 1000);

        game.watchGame();
    }

    return 0;
}
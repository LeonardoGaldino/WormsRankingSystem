#include <iostream>
#include <windows.h>

#include "worms.cpp"

using namespace std;

int main() {
    while(true) {
        HANDLE hProcess = attachToProcess();
        if(hProcess == NULL){
            cout << "Failed to attach, retrying in 3s..." << endl;
            Sleep(3000);
            continue;
        }

        WormsGame game = WormsGame(hProcess, 1000);

        game.watchGame();
    }

    return 0;
}
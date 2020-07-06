#include <iostream>
#include <windows.h>

#include "process.hpp"
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
        cout << "Started watching current game. " << endl;

        if(!isProcessRunning(hProcess)) {
            cout << "Process exited before typing number teams." << endl;
            continue;
        }

        DWORD moduleBaseAddress = findModuleBaseAddress(hProcess);
        DWORD base = moduleBaseAddress;
        cout << "WA.exe module address: " << hex << base << endl;
        DWORD offs[] = {0x360D8C, 0x80, 0x4BC, 0x4};
        int ns = sizeof(offs)/sizeof(DWORD);

        for(int i = 0 ; i < ns ; ++i) {
            DWORD buffer;
            ReadProcessMemory(
                hProcess,
                (LPCVOID) (base + offs[i]),
                &buffer,
                sizeof(DWORD),
                NULL
            );
            base = buffer;
        }

        WormsGame game = WormsGame(hProcess, moduleBaseAddress, base, 1000);

        game.watchGame();
    }

    return 0;
}
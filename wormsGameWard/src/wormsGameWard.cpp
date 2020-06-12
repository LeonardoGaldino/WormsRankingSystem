#include <iostream>
#include <windows.h>

#include "worms.cpp"

using namespace std;

int main() {
    int wormsPid;
    cout << "Attach to process with PID: ";
    cin >> wormsPid;

    HANDLE hProcess = OpenProcess(
        PROCESS_VM_READ,
        FALSE,
        wormsPid
    );

    if (hProcess == NULL) {
        cout << "Could not attach to process. Error: " << GetLastError() << endl;
        cout << "Exiting..." << endl;
        return 1;
    }
    cout << "Attached" << endl;

    while(true) {
        int nTeams;
        cout << "Type in number of teams:" << endl;
        cin >> nTeams;
        cout << "Number of teams: " << nTeams << endl;
        cout << "Started watching current game. " << endl;

        DWORD base = (DWORD) 0x400000;
        DWORD offs[] = {0x360D8C, 0x80, 0x4BC, 0x4};
        int ns = sizeof(offs)/sizeof(DWORD);

        for(int i = 0 ; i < ns ; ++i) {
            DWORD buffer;
            BOOL rpm_number = ReadProcessMemory(
                hProcess,
                (LPCVOID) (base + offs[i]),
                &buffer,
                sizeof(DWORD),
                NULL
            );
            base = buffer;
        }

        WormsGame game = WormsGame(hProcess, base, nTeams, 1000);

        game.watchGame();
    }

    return 0;
}
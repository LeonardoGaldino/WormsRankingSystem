#include <iostream>
#include <windows.h>
#include <tlhelp32.h>
#include <Psapi.h>

#include "process.hpp"
#include "worms.cpp"

using namespace std;

DWORD findModuleBaseAddress(HANDLE hProcess)
{
    DWORD baseAddress = 0x400000;
    HMODULE *moduleArray;
    LPBYTE moduleArrayBytes;
    DWORD bytesRequired;

    if (EnumProcessModules(hProcess, NULL, 0, &bytesRequired))
    {
        if (bytesRequired)
        {
            moduleArrayBytes = (LPBYTE)LocalAlloc(LPTR, bytesRequired);

            if (moduleArrayBytes)
            {
                moduleArray = (HMODULE *)moduleArrayBytes;

                if (EnumProcessModules(hProcess, moduleArray, bytesRequired, &bytesRequired))
                {
                    baseAddress = (DWORD_PTR)moduleArray[0];
                }

                LocalFree(moduleArrayBytes);
            }
        }
    }

    return baseAddress;
}

int findPid(char* processName) {
    HANDLE hSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);

    if (hSnap == INVALID_HANDLE_VALUE) {
        cout << "Failed to get process snap handle. Error: " << GetLastError() << endl;
        return -1;
    }

    PROCESSENTRY32 pe32;
    pe32.dwSize = sizeof(PROCESSENTRY32);

    // Retrieve information about the first process and exit if unsuccessful
    if (!Process32First(hSnap, &pe32)) {
        cout << "Failed to get first process entry. Error: " << GetLastError() << endl;
        CloseHandle(hSnap);
        return -1;
    }

    int pid = 0;
    do {
        if (strcmp(pe32.szExeFile, processName) == 0) {
            pid = pe32.th32ProcessID;
        }
    } while (Process32Next(hSnap, &pe32));

    CloseHandle(hSnap);
    return pid;
}

HANDLE attachToProcess() {
    char processName[] = "WA.exe";
    cout << "Trying to attach to " << processName << "..." << endl;

    int wormsPid = findPid(processName);
    if (wormsPid <= 0) {
        cout << "Couldn't find a PID for " << processName << ". Is it running?" << endl;
        return NULL;
    }
    cout << "PID " << dec << wormsPid << " found for process " << processName << "." << endl;

    HANDLE hProcess = OpenProcess(
        PROCESS_ALL_ACCESS,
        FALSE,
        wormsPid
    );

    if (hProcess == NULL) {
        cout << "Could not attach to process. Error: " << GetLastError() << endl;
        cout << "Exiting..." << endl;
        return NULL;
    }
    cout << "Attached to " << processName << " (" << wormsPid << ")." << endl;

    return hProcess;
}

int main() {
    while(true) {
        HANDLE hProcess = attachToProcess();
        if(hProcess == NULL){
            cout << "Failed to attach, retrying in 3s..." << endl;
            Sleep(3000);
            continue;
        }
        
        int nTeams;
        cout << "Type in number of teams:" << endl;
        cin >> nTeams;
        cout << "Number of teams: " << nTeams << endl;
        cout << "Started watching current game. " << endl;

        if(!isProcessRunning(hProcess)) {
            cout << "Process exited before typing number teams." << endl;
            continue;
        }

        DWORD base = findModuleBaseAddress(hProcess);
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

        WormsGame game = WormsGame(hProcess, base, nTeams, 1000);

        game.watchGame();
    }

    return 0;
}
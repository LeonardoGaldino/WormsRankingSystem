#include <processthreadsapi.h>
#include <iostream>
#include <windows.h>
#include <tlhelp32.h>
#include <Psapi.h>

using namespace std;

bool isProcessRunning(HANDLE hProcess) {
    DWORD result; 
    GetExitCodeProcess(hProcess, &result);
    return result == STILL_ACTIVE;
}

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
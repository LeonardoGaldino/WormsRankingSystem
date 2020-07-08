bool isProcessRunning(HANDLE hProcess);

DWORD findModuleBaseAddress(HANDLE hProcess);

int findPid(char* processName);

HANDLE attachToProcess();
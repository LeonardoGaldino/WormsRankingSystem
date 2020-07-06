#include <processthreadsapi.h>

using namespace std;

bool isProcessRunning(HANDLE hProcess) {
    DWORD result; 
    GetExitCodeProcess(hProcess, &result);
    return result == STILL_ACTIVE;
}
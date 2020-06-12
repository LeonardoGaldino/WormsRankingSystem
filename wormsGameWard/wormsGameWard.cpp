#include <iostream>
#include <fstream>
#include <windows.h>
#include <time.h>
#include <vector>
#include <cstring>

using namespace std;

HANDLE hProcess;

class WormsTeam {
private:
    DWORD nameAddress;
public:
    const static DWORD nameKillsOffset = 0x00000078;
    const static DWORD nameDamageOffset = 0x0000007C;
    const static DWORD nameSelfDamageOffset = 0x00000084;
    const static DWORD wormOffset = 0x0000009C;

    string teamName;
    int nWorms;
    int kills;
    int totalDamage;
    int selfDamage;

    WormsTeam(DWORD nameAddress) {
        this->nameAddress = nameAddress;
        this->nWorms = 3;
        this->teamName = "Team at " + to_string(nameAddress) + " name not computed yet.";
        this->kills = 0;
        this->totalDamage = 0;
        this->selfDamage = 0;
    }

    ~WormsTeam() {
        cout << "Deleting team at " + to_string(this->nameAddress) << endl;
    }

    void save(ofstream* file) {
        *file << this->teamName << ": " << this->kills << " " << this->totalDamage << " " << this->selfDamage << endl;
    }

    // TODO: Check for errors.
    bool update() {
        int tmpKills = 0;
        int tmpTotalDamage = 0;
        int tmpSelfDamage = 0;

        char teamName[17];
        BOOL rpm_number = ReadProcessMemory(
            hProcess,
            (LPCVOID) this->nameAddress,
            teamName,
            sizeof(teamName)*sizeof(char),
            NULL
        );
        teamName[16] = '\0';
        this->teamName = string(teamName);

        for(int i = 0 ; i < this->nWorms ; ++i) {
            size_t read;
            int killsBuffer;
            int damageBuffer;
            int selfDamageBuffer;

            BOOL rpm_number = ReadProcessMemory(
                hProcess,
                (LPCVOID) (this->nameAddress + i*WormsTeam::wormOffset + WormsTeam::nameKillsOffset),
                &killsBuffer,
                sizeof(int),
                &read
            );
            tmpKills += killsBuffer;

            rpm_number = ReadProcessMemory(
                hProcess,
                (LPCVOID) (this->nameAddress + i*WormsTeam::wormOffset + WormsTeam::nameDamageOffset),
                &damageBuffer,
                sizeof(int),
                &read
            );
            tmpTotalDamage += damageBuffer;

            rpm_number = ReadProcessMemory(
                hProcess,
                (LPCVOID) (this->nameAddress + i*WormsTeam::wormOffset + WormsTeam::nameSelfDamageOffset),
                &selfDamageBuffer,
                sizeof(int),
                &read
            );
            tmpSelfDamage += selfDamageBuffer;
        }

        // Sinalize game has ended
        if(tmpKills < this->kills || tmpTotalDamage < this->totalDamage || tmpSelfDamage < this->selfDamage) {
            return true;
        }

        this->kills = tmpKills;
        this->totalDamage = tmpTotalDamage;
        this->selfDamage = tmpSelfDamage;

        return false;
    }
};

class WormsGame {
private:
    DWORD baseAddress;
    int nTeams;
    int watchStall;
    vector<WormsTeam*> teams;
public:
    const static DWORD teamOffset = 0x0000051C;
    const static DWORD player1NameOffset = 0x000045BC;

    WormsGame(DWORD baseAddress, int nTeams, int watchStall) {
        this->baseAddress = baseAddress;
        this->nTeams = nTeams;
        this->watchStall = watchStall;
        for(int i = 0 ; i < nTeams ; ++i) {
            DWORD teamNameAddress = this->baseAddress + WormsGame::player1NameOffset + i*WormsGame::teamOffset;
            WormsTeam* team = new WormsTeam(teamNameAddress);
            this->teams.push_back(team);
        }
    }

    ~WormsGame() {
        cout << "Deleting Game" << endl;
        for(int i = 0 ; i < this->nTeams ; ++i) {
            delete this->teams[i];
        }
        this->baseAddress = 0x0;
    }

    void watchGame() {
        bool gameEnd = false;

        long int start = (long int) time(NULL);
        string fileName = "game_data_" + to_string(start);
        char cFileName[fileName.size()+1];
        strcpy(cFileName, &fileName[0]);
        ofstream* file = new ofstream(cFileName);

        while(!gameEnd) {
            for(int i = 0 ; !gameEnd && i < this->nTeams ; ++i) {
                gameEnd |= this->teams[i]->update();
            }
            if(!gameEnd) {
                file->seekp(0);
                for(int i = 0 ; i < this->nTeams ; ++i) {
                    this->teams[i]->save(file);
                }
                Sleep(this->watchStall);
            }
        }
        long int end = (long int) time(NULL);
        *file << "end:" << to_string(end) << endl;
        file->close();
    }
};

int main() {

    int wormsPid;
    cout << "Attach to process with PID: ";
    cin >> wormsPid;

    hProcess = OpenProcess(
        PROCESS_VM_READ,
        FALSE,
        wormsPid
    );

    if (hProcess == NULL) {
        cout << GetLastError() << endl;
        return 0;
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

        WormsGame game = WormsGame(base, nTeams, 1000);

        game.watchGame();
    }

    return 0;
}
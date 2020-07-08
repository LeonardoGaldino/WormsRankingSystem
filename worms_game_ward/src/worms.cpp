#include <iostream>
#include <fstream>
#include <windows.h>
#include <time.h>
#include <vector>
#include <cstring>

#include "process.hpp"

using namespace std;

class WormsTeam {
private:
    DWORD nameAddress;
    HANDLE hProcess;
public:
    const static DWORD nameRoundsPlayedOffset = 0x0000004C;
    const static DWORD nameKillsOffset = 0x00000078;
    const static DWORD nameDamageOffset = 0x0000007C;
    const static DWORD nameSelfDamageOffset = 0x00000084;
    const static DWORD wormOffset = 0x0000009C;

    string teamName;
    int nWorms;
    int roundsPlayed;
    int kills;
    int totalDamage;
    int selfDamage;

    WormsTeam(HANDLE hProcess, DWORD nameAddress) {
        this->hProcess = hProcess;
        this->nameAddress = nameAddress;
        this->nWorms = 3;
        this->teamName = string();
        this->roundsPlayed = 0;
        this->kills = 0;
        this->totalDamage = 0;
        this->selfDamage = 0;
    }

    ~WormsTeam() {
        cout << "Deleting team at " + to_string(this->nameAddress) << endl;
    }

    void save(ofstream* file) {
        *file << this->teamName << "|" << this->roundsPlayed << "|" << this->kills << "|" << this->totalDamage << "|" << this->selfDamage << endl;
    }

    // TODO: Check for errors.
    bool update() {
        int tmpRoundsPlayed = 0;
        int tmpKills = 0;
        int tmpTotalDamage = 0;
        int tmpSelfDamage = 0;

        char teamName[17];
        ReadProcessMemory(
            this->hProcess,
            (LPCVOID) this->nameAddress,
            teamName,
            sizeof(teamName)*sizeof(char),
            NULL
        );
        teamName[16] = '\0';

        string teamNameStr = string(teamName);
        if(!this->teamName.empty() && teamNameStr != this->teamName) {
            // Sinalize game has ended
            return true;
        }
        this->teamName = teamNameStr;

        for(int i = 0 ; i < this->nWorms ; ++i) {
            SIZE_T read;
            int roundsPlayedBuffer;
            int killsBuffer;
            int damageBuffer;
            int selfDamageBuffer;

            ReadProcessMemory(
                this->hProcess,
                (LPCVOID) (this->nameAddress + i*WormsTeam::wormOffset + WormsTeam::nameRoundsPlayedOffset),
                &roundsPlayedBuffer,
                sizeof(int),
                &read
            );
            tmpRoundsPlayed += roundsPlayedBuffer;

            ReadProcessMemory(
                this->hProcess,
                (LPCVOID) (this->nameAddress + i*WormsTeam::wormOffset + WormsTeam::nameKillsOffset),
                &killsBuffer,
                sizeof(int),
                &read
            );
            tmpKills += killsBuffer;

            ReadProcessMemory(
                this->hProcess,
                (LPCVOID) (this->nameAddress + i*WormsTeam::wormOffset + WormsTeam::nameDamageOffset),
                &damageBuffer,
                sizeof(int),
                &read
            );
            tmpTotalDamage += damageBuffer;

            ReadProcessMemory(
                this->hProcess,
                (LPCVOID) (this->nameAddress + i*WormsTeam::wormOffset + WormsTeam::nameSelfDamageOffset),
                &selfDamageBuffer,
                sizeof(int),
                &read
            );
            tmpSelfDamage += selfDamageBuffer;
        }

        // Sinalize game has ended
        if(tmpRoundsPlayed < this->roundsPlayed || tmpKills < this->kills 
            || tmpTotalDamage < this->totalDamage || tmpSelfDamage < this->selfDamage) {
            return true;
        }

        this->roundsPlayed = tmpRoundsPlayed;
        this->kills = tmpKills;
        this->totalDamage = tmpTotalDamage;
        this->selfDamage = tmpSelfDamage;
        
        return false;
    }
};

class WormsGame {
private:
    HANDLE hProcess;
    DWORD moduleBaseAddress;
    int nTeams = 0;
    int watchStall;
    vector<WormsTeam*> teams;

    DWORD getTeam1NameAddress() {
        DWORD base = this->moduleBaseAddress;
        int ns = sizeof(WormsGame::pointerPathOffsets)/sizeof(DWORD);

        for(int i = 0 ; i < ns - 1 ; ++i) {
            ReadProcessMemory(
                hProcess,
                (LPCVOID) (base + WormsGame::pointerPathOffsets[i]),
                &base,
                sizeof(DWORD),
                NULL
            );
        }

        return base + WormsGame::pointerPathOffsets[ns-1];
    }

    void printEndGameTime(time_t* endTs) {
        tm* ptm = localtime(endTs);
        char buffer[32];
        strftime(buffer, 32, "%d/%m/%Y %H:%M:%S", ptm);  
        cout << "Game ended at: " << string(buffer) << endl; 
    }

    void setupTeams() {
        if(!this->isGameRunning() || !isProcessRunning(this->hProcess)) {
            return;
        }

        int i = 0;
        DWORD team1NameAddress = this->getTeam1NameAddress();

        do {
            DWORD teamNameAddress = team1NameAddress + i*WormsGame::teamOffset;
            char teamName[17];
            ReadProcessMemory(
                this->hProcess,
                (LPCVOID) teamNameAddress,
                teamName,
                sizeof(teamName)*sizeof(char),
                NULL
            );

            bool nonZeroChar = false;
            for(int j = 0 ; j < 16 ; ++j) {
                nonZeroChar |= ((int) teamName[j]) != 0;
            }

            if(nonZeroChar) {
                WormsTeam* team = new WormsTeam(hProcess, teamNameAddress);
                this->teams.push_back(team);
                ++i;
            } else {
                break;
            }
        } while(i < 6); // Max number of teams
        this->nTeams = i;
        cout << "Detected " << dec << i << " teams." << endl;
    }

public:
    constexpr static DWORD pointerPathOffsets[] = {0x360D8C, 0x80, 0x4BC, 0x4, 0x45BC};
    const static DWORD teamOffset = 0x0000051C;

    WormsGame(HANDLE hProcess, int watchStall) {
        this->hProcess = hProcess;
        this->watchStall = watchStall;
        this->moduleBaseAddress = findModuleBaseAddress(hProcess);
    }

    ~WormsGame() {
        cout << "Deleting Game" << endl;
        for(int i = 0 ; i < this->nTeams ; ++i) {
            delete this->teams[i];
        }
        this->moduleBaseAddress = 0x0;
    }

    bool isGameRunning() {
        DWORD buffer = 0x0;
        ReadProcessMemory(
            this->hProcess,
            (LPCVOID) (this->moduleBaseAddress + WormsGame::pointerPathOffsets[0]),
            &buffer,
            sizeof(buffer),
            NULL
        );
        
        return buffer != 0x0;
    }

    void watchGame() {
        this->moduleBaseAddress = findModuleBaseAddress(hProcess);
        cout << "WA.exe module address: " << hex << this->moduleBaseAddress << endl;

        while(isProcessRunning(this->hProcess) && !this->isGameRunning()) {
            cout << "Waiting for game to start..." << endl;
            Sleep(this->watchStall);
        }
        if(isProcessRunning(this->hProcess)) {
            cout << "Game started" << endl;
            Sleep(10*1000); // Wait 10s for game initialization
            this->setupTeams();
        } else {
            cout << "Process exited before game started." << endl;
            return;
        }

        long int start = (long int) time(NULL);
        string fileName = "game_data_" + to_string(start);
        ofstream* file = new ofstream(fileName.c_str());

        bool gameEndSignal = false;
        while(!gameEndSignal && isProcessRunning(this->hProcess) && this->isGameRunning()) {
            int i = 0;
            for(; !gameEndSignal && isProcessRunning(this->hProcess) && this->isGameRunning() && i < this->nTeams ; ++i) {
                gameEndSignal |= this->teams[i]->update();
            }

            if(!gameEndSignal && i == this->nTeams) {
                file->seekp(0);
                for(int i = 0 ; i < this->nTeams ; ++i) {
                    this->teams[i]->save(file);
                }
                Sleep(this->watchStall);
            }
        }

        time_t end = time(NULL);
        *file << "end|" << to_string((long int) end) << endl;
        file->close();

        this->printEndGameTime(&end);

        string command = "start python src/save_game_data.py " + fileName;
        system(command.c_str());
    }
};
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
        if(!this->teamName.empty() && this->teamName != teamNameStr) {
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
    DWORD baseAddress;
    int nTeams;
    int watchStall;
    vector<WormsTeam*> teams;
public:
    const static DWORD teamOffset = 0x0000051C;
    const static DWORD player1NameOffset = 0x000045BC;

    WormsGame(HANDLE hProcess, DWORD baseAddress, int nTeams, int watchStall) {
        this->hProcess = hProcess;
        this->baseAddress = baseAddress;
        this->nTeams = nTeams;
        this->watchStall = watchStall;
        for(int i = 0 ; i < nTeams ; ++i) {
            DWORD teamNameAddress = this->baseAddress + WormsGame::player1NameOffset + i*WormsGame::teamOffset;
            WormsTeam* team = new WormsTeam(hProcess, teamNameAddress);
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

    void printEndGameTime(time_t* endTs) {
        tm* ptm = localtime(endTs);
        char buffer[32];
        strftime(buffer, 32, "%d/%m/%Y %H:%M:%S", ptm);  
        cout << "Game ended at: " << string(buffer) << endl; 
    }

    void watchGame() {
        bool gameEnd = false;
        bool processExited = false;

        long int start = (long int) time(NULL);
        string fileName = "game_data_" + to_string(start);
        ofstream* file = new ofstream(fileName.c_str());

        while(!processExited && !gameEnd) {
            processExited |= !isProcessRunning(this->hProcess);

            for(int i = 0 ; !processExited && !gameEnd && i < this->nTeams ; ++i) {
                gameEnd |= this->teams[i]->update();
            }

            processExited |= !isProcessRunning(this->hProcess);
            
            if(!processExited && !gameEnd) {
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

        if(!processExited) {
            string command = "start python src/save_game_data.py " + fileName;
            system(command.c_str());
        } else {
            cout << "Process exited without detecting end game. Not sending data to server." << endl;
        }
    }
};
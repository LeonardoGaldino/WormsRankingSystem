# Worms Ranking System
Worms Ranking System is a ranking system for Worms Armageddon version 3.7.2.1. It consists of three modules, each with its responsibility which are described below.

# [Live here](http://leonardogaldino.com/worms)

# Modules
1. WormsGameWard: Module responsible for reading the running games memory and sending data to the server.
2. ServerSide: Module responsible for interfacing with the Database and running the API which serves clients: browser for users viewing the ranking and WormsGameWard for saving game's data.
3. ClientSide: Module responsible for the [website](http://leonardogaldino.com/worms) where clients can see the ranking, graphs and details about how calculations are made.

# Running locally
- Each module will have instructions on how to run it, its dependencies (not covered by its package manager) and dependencies on other modules (from this repository).
- Every module has a deps file on its top-level package describing which dependencies are needed in order to build/run. These dependencies are meant to be installed by OS package manager.

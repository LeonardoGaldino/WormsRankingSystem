# Worms Game Ward
This is the module responsible for collecting data from running Worms Armageddon process and sending to the server. It is designed for Worms Armageddon v3.7.2.1. It's composed of a C++ program that uses Windows API for reading Worms Armageddon process' memory and a python script that is invoked from the C++ program to send data to the server.

# Dependencies
This module depends on server side module running

# Running locally
- In this folder, a file called **deps** lists all softwares that should be installed. One of them is **make**, the default software for compiling C/C++ programs. **pip** is used for installing python script dependencies.
- Run **make**
- Run **pip install -r requirements**
- Set %WORMS_SERVER_ENDPOINT% to the host and port running the server
- **ward.exe**
- Launch Worms and play. If desire not to send data to the server just type 'n', if desire to save type 's'.

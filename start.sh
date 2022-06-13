#!/bin/bash

#run migrations when database is online
./wait-for-it.sh

#start node
node dist/main.js

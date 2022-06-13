#!/bin/bash

#run migrations when database is online
./wait-for-it.sh postgres:5432 && npx typeorm migration:run

#start node
node dist/main.js

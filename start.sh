#!/bin/bash

#run migrations when database is online
./wait-for-it.sh postgres:5432 && npx typeorm migration:run -d dist/data-source.js

#start node
node dist/main.js

#!/bin/bash

rm -rf ../../docs/backend/*
java -jar jsrun.jar app/run.js -a -t=templates/jsdoc -d=../../docs/backend/ -q -r=4 ../../ctf.js ../../backend/

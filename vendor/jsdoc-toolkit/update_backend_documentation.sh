#!/bin/bash

rm -rf ../../docs/backend/*
java -jar jsrun.jar app/run.js -p -x=js,cc -a -t=templates/jsdoc -d=../../docs/backend/ -r=4 ../../server.js ../../backend/ ../../modules/

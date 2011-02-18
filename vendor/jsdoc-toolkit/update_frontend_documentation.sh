#!/bin/bash

rm -rf ../../docs/backend/*
java -jar jsrun.jar app/run.js -t=templates/jsdoc -d=../../docs/frontend/ -r=4 ../../frontend/js/

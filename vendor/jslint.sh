#!/bin/bash

for file in `find ../server.js ../frontend/js/*.js ../backend/*.js`
do
	echo $file
	jslint $file
done
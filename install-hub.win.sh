#!/bin/bash

mkdir .pullquester-temp
cd .pullquester-temp
curl -L https://github.com/github/hub/archive/master.zip > master.zip
unzip master.zip
cd hub-master
rake install
cd ../..
rm -rf .pullquester-temp

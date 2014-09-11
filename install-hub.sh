#!/bin/bash

mkdir .pullquester-temp
cd .pullquester-temp
curl -L https://github.com/github/hub/archive/master.zip > master.zip
tar -xf master.zip
cd hub-master
sudo rake install
cd ../..
rm -rf .pullquester-temp

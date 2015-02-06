#!/bin/bash

goto_temp_dir() {

    if [ ! -d .pullquester-temp ]; then
        mkdir .pullquester-temp
    fi
    pushd .pullquester-temp
}

cleanup_temp_dir() {
    popd
    rm -r .pullquester-temp
}

install_go() {
    local GOVERSION=1.4.1
    
    echo Installing Go v$GOVERSION
    curl -o go.tar.gz "https://storage.googleapis.com/golang/go$GOVERSION.darwin-amd64-osx10.8.tar.gz"
    tar -C . -xzf go.tar.gz
    cp ./go/* $GOROOT
    echo Done!
}

ensure_GoRoot_dir() {
    if [ -z "$GOROOT" ]; then
        export GOROOT=$HOME/go
    fi

    echo GOROOT=$GOROOT

    if [ ! -d $GOROOT ]; then
        mkdir -p $GOROOT
    fi
}

ensure_GoPath_dir() {
    if [ -z "$GOPATH" ]; then
        export GOPATH=$GOROOT/packages
    fi

    echo GOPATH=$GOPATH

    if [ ! -d $GOPATH ]; then
        mkdir -p $GOPATH
    fi
}

ensure_Go_paths() {
    ensure_GoRoot_dir
    ensure_GoPath_dir
}

install_hub() {
    echo Installing hub...
    go get github.com/github/hub
    go install github.com/github/hub
    echo Done!
}

ensure_tmp_dir

# check for go installation
ensure_Go_paths

if [ -z "$(which go)" ]; then
    install_go
fi

#check for package storage location
ensure_GoPath_dir

export PATH=$PATH:$GOROOT/bin:$GOPATH/bin

install_hub

#!/bin/bash
cd `dirname $0`
rm -r ./docs/*
mkdir -p "./docs/open-data"
cp build/index.html "./docs/open-data"
mv ./build/* ./docs/

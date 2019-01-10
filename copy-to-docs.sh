#!/bin/bash
cd `dirname $0`
rm -r ./docs/*
mv ./build/* ./docs/

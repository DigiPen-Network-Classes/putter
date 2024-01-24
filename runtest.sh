#!/bin/bash
if [ "$#" -lt 1 ]
then
    echo 'What assignment to run???'
    exit 1
fi

case $1 in
    2 | 3 | 4 | 6)    
        filename=examples/CS261_Assignment$1_Postman.json
        ;;
    *)
        echo Unknown Argument or no Assignment For $1
        exit 1
        ;;
esac

if [ -n "$2" ]
then
    verbose="--verbose"
else
    verbose=""
fi

node putter run $filename $verbose

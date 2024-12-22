#!/usr/bin/bash

vitify() {
    if [ -f "$1" ]; then
        while IFS= read -r line; do
            if [[ $line == REACT_APP_* ]]; then
                echo "Replacing $line with ${line/REACT_APP_/VITE_}"
                sed -i "s@$line@${line/REACT_APP_/VITE_}@g" "$1"
            fi
        done < "$1"
    fi
}

vitify .env
vitify .env.local
vitify .env.prod

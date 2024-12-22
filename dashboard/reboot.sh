#! usr/bin/bash

git checkout .
git clean -fd
git pull

yarn install
yarn gql

pm2 stop dashboard
pm2 start yarn --name "dashboard" -- start:prod
pm2 logs --watch
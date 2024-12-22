#! usr/bin/bash

git checkout .
git clean -fd
git pull

yarn install
yarn build

pm2 stop control-tower
pm2 start yarn --name "control-tower" -- start:prod
pm2 logs --watch
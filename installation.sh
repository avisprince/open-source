#!/bin/bash

# MongoDB Installation
echo "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
echo "Verifying MongoDB status..."
# sudo systemctl status mongod

# Node.js Installation
echo "Installing Node.js..."
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "Node.js version:"
node -v
echo "NPM version:"
npm -v

# Yarn Installation
echo "Installing Yarn..."
sudo npm install -g yarn

# NestJS
sudo npm install -g @nestjs/cli
# PM2
sudo npm install -g pm2

# Redis Installation
echo "Installing Redis..."
sudo apt install -y redis-server
echo "Redis version:"
redis-server --version
sudo systemctl start redis
sudo systemctl enable redis
echo "Verifying Redis status..."
redis-cli ping

# Docker Installation
echo "Installing Docker..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
echo "Docker version:"
sudo docker --version
sudo systemctl enable docker
sudo systemctl start docker

# Kubectl Installation
echo "Installing Kubectl..."
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo mv ./kubectl /usr/local/bin/kubectl
sudo chmod +x /usr/local/bin/kubectl
sudo chown root:root /usr/local/bin/kubectl
echo "Verifying Kubectl installation..."
kubectl version --client

# Minikube Installation
echo "Installing Minikube..."
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube /usr/local/bin/
sudo usermod -aG docker $USER
echo "Log out and log back in, then start Docker and Minikube manually."
echo "Start Docker:" 
sudo systemctl start docker
echo "Start Minikube:" 
minikube start --driver=docker
minikube addons enable ingress
echo "Verify Minikube status:" 
minikube status
echo "Verify Kubernetes nodes:" 
kubectl get nodes

echo "Script execution complete!"

# Install ingress?
# kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.2/deploy/static/provider/cloud/deploy.yaml

# NestJS
sudo npm install -g @nestjs/cli
# PM2
sudo npm install -g pm2

# Setup hosts file
HOSTS_ENTRY="
127.0.0.1 local.dokkimi.com
127.0.0.1 control-tower.dokkimi.com
"

echo "$HOSTS_ENTRY" | sudo tee -a /etc/hosts > /dev/null

# Setup nginx
sudo apt install nginx
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 5000/tcp
sudo ufw enable

echo "Creating NGINX configuration..."
PUBLIC_IP=$(curl -s ifconfig.me)

sudo bash -c "cat > /etc/nginx/sites-available/api" <<EOF
server {
  listen 5000;  # External port to access the API via HTTP
  server_name $PUBLIC_IP;
  location / {
    proxy_pass http://localhost:5000;  # Forward requests to your API on port 5000
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}

server {
  listen 80;  # External port to access the API via HTTP
  server_name $PUBLIC_IP;
  location / {
    proxy_pass http://localhost:3000;  # Forward requests to your API on port 3000
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

sudo nginx -t
sudo systemctl reload nginx

# Git Installation
sudo apt update
sudo apt install git
git --version

# Install Dokkimi from Github
git clone "https://github.com/avisprince/open-source.git"

# Go to root folder
cd ./open-source

# Build the interceptor and proxy-service packages
yarn dbuild:interceptor
yarn dbuild:proxyservice

# Setup ControlTower env file and start project
cd ./control-tower
cp .env.local.template .env.local
bash reboot.sh

# Go to dashboard, setup env file and start project
cd ../dashboard
cp .env.local.template .env.local
bash reboot.sh

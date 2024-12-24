#!/bin/bash

# MongoDB Installation
# Update package list and install dependencies
echo "Updating package list..."
sudo apt-get update -y
sudo apt-get install -y gnupg curl wget lsb-release

# Add MongoDB GPG key
echo "Adding MongoDB GPG key..."
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg

# Add MongoDB repository
echo "Adding MongoDB repository..."
echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list after adding MongoDB repo
echo "Updating package list after adding MongoDB repository..."
sudo apt-get update -y

# Download and install libssl1.1 manually
echo "Installing libssl1.1..."
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo apt-get install -f -y

# Install MongoDB
echo "Installing MongoDB..."
sudo apt-get install -y mongodb-org

# Start and enable MongoDB service
echo "Starting and enabling MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Check MongoDB status
echo "Checking MongoDB service status..."
sudo systemctl status mongod --no-pager

echo "MongoDB installation complete."

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

# Setup REDIS
# Update package list
echo "Updating package list..."
sudo apt-get update -y

# Install Redis server
echo "Installing Redis server..."
sudo apt-get install -y redis-server

# Enable and start Redis service
echo "Starting and enabling Redis service..."
sudo systemctl start redis

# Check Redis status
echo "Checking Redis service status..."
sudo systemctl status redis --no-pager

echo "Basic Redis server installation complete."

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
# sudo usermod -aG docker $USER
echo "Log out and log back in, then start Docker and Minikube manually."
echo "Start Docker:" 
sudo systemctl start docker
echo "Start Minikube:" 
# minikube start --driver=docker
minikube start --force
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
sudo ufw allow 5001/tcp
sudo ufw enable
sudo ufw reload

echo "Creating NGINX configuration..."
PUBLIC_IP=$(curl -s ifconfig.me)
NGINX_AVAILABLE="/etc/nginx/sites-available/multiport"
NGINX_ENABLED="/etc/nginx/sites-enabled/multiport"

sudo bash -c "cat > $NGINX_AVAILABLE" <<EOF
server {
  listen 5001;  # External port to access the API via HTTP
  server_name $PUBLIC_IP;
  location / {
    proxy_pass http://localhost:5000;  # Forward requests to your API on port 5000

    # WebSocket-specific headers
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "Upgrade";
    
    # Standard proxy headers
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

echo "Enabling NGINX configuration..."
sudo ln -sf $NGINX_AVAILABLE $NGINX_ENABLED

echo "Testing NGINX configuration..."
sudo nginx -t

echo "Reloading NGINX..."
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
sed -i "s/PUBLIC_IP/$PUBLIC_IP/g" .env.local
# bash reboot.sh

# Go to dashboard, setup env file and start project
cd ../dashboard
cp .env.local.template .env.local
sed -i "s/PUBLIC_IP/$PUBLIC_IP/g" .env.local
# bash reboot.sh


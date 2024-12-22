# Dokkimi

## Installation

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your system. If not, download and install it from [Node.js official website](https://nodejs.org/).

- **MongoDB**: This project requires MongoDB. You can download and install MongoDB from [MongoDB's official site](https://www.mongodb.com/try/download/community).

- **Docker**: Docker is needed for running containers, including Kubernetes. Install Docker by following the instructions on [Docker Hub](https://docs.docker.com/get-docker/).

- **Redis**: Redis is required for caching purposes. You can download and install Redis from [Redis's official website](https://redis.io/download).

- **Auth0 Account**: You will need an Auth0 account to handle authentication. Create an account at [Auth0](https://auth0.com/) and follow the setup instructions to configure your application.

### Step 1: Clone the Repository

First, clone the Dokkimi repository to your local machine. Open your terminal and run the following command:

```bash
git clone https://github.com/yourusername/dokkimi.git
cd dokkimi
```

### Step 2: Install MongoDB

Follow the instructions provided on the MongoDB website to install MongoDB for your operating system. Ensure that MongoDB is running on your machine after installation.

### Step 3: Install Docker and Configure Kubernetes

1. Download and install Docker from Docker Hub. Make sure to follow the post-installation steps to configure Docker to run without sudo privileges (if necessary).
2. Enable Kubernetes within Docker:

   - Open Docker Desktop.
   - Go to Preferences > Kubernetes.
   - Check the box that says "Enable Kubernetes" and click 'Apply and Restart'.
   - Docker Desktop will start a Kubernetes cluster.

3. Set up Ingress for Kubernetes:

   - After enabling Kubernetes, you need to deploy an Ingress controller. You can use the following command to deploy the NGINX Ingress Controller:

   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
   ```

### Step 4: Install Redis

Install Redis by following the download and installation instructions on the Redis website. Ensure Redis is running properly on your system.

### Step 5: Update Local Hosts File

To make the application accessible via a local domain, update your local hosts file. Add the following line to map the domain to your local IP:

```plaintext
127.0.0.1 local.dokkimi.com
```

### Step 6: Configure Environment Settings

#### Control Tower

Navigate to the `control-tower` directory:

```bash
cd control-tower
```

Copy the `.env.template` file to `.env.local` and update the environment variables based on your setup:

```bash
cp .env.template .env.local
```

Edit `.env.local` and replace the placeholder values with the actual configuration values.

#### Dashboard

Navigate to the `dashboard` directory:

```bash
cd ../dashboard
```

Similarly, copy the `.env.template` file to `.env.local` and update the environment variables:

```bash
cp .env.template .env.local
```

Edit `.env.local` and replace the placeholder values with the actual configuration values.

### Step 7: Install Project Dependencies and Start Services

#### Control Tower

In the `control-tower` directory, install the dependencies and start the server:

```bash
npm install
npm start
```

#### Dashboard

In the `dashboard` directory, install the dependencies, start the dashboard, and initiate the relay server:

```bash
npm install
npm start
npm run gql:watch
```

### Final Steps

Ensure all services are running and visit `http://localhost:3000` in your browser to access the Dokkimi application.

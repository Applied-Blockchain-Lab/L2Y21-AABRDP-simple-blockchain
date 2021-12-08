#!/bin/bash

## Update package list and upgrade packages
sudo apt-get update

## Enter password for deploymentuser without being visible for the user
stty -echo
read -p "Enter password for deploymentuser: " password
stty echo
printf '\n'

## Add new user and assign superuser privileges
sudo adduser --quiet --disabled-password --shell /bin/bash --home /home/deploymentuser --gecos "User" deploymentuser
echo "deploymentuser:$password" | sudo /usr/sbin/chpasswd
sudo usermod -aG sudo deploymentuser

## Run commands as deploymentuser
sudo -i -u deploymentuser bash << EOF

## Switch to deploymentuser home directory
cd /home/deploymentuser || exit

## Install curl and wget
## They are not preinstalled in every Linux distribution
## Curl and wget transfer data to or from a network server
sudo apt-get -y install curl wget

## Install git
sudo apt-get -y install git

## Install Docker
sudo apt-get -y remove docker docker-engine docker.io containerd runc
sudo apt-get -y install \
    ca-certificates \
    gnupg \
    lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get -y install docker-ce docker-ce-cli containerd.io

## Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

## Don't need port configuration if deployment is with Docker,
## because Docker sets them automatically. 
## Firewall - configure ports with iptables
## Allow only SSH and API server ports
## Block all incoming traffic except on ports above
## Allow all outgoing traffic
## sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
## sudo iptables -A INPUT -p tcp --dport 4444 -j ACCEPT # Change API port here or add more ports
## sudo iptables -A INPUT -j REJECT
## sudo iptables -A OUTPUT -j ACCEPT
## sudo iptables -A OUTPUT -o lo -j ACCEPT

## Install PM2
## To start an application with PM2:
## pm2 start <app-entry-point>
## Example: pm2 start app.js
curl -sL https://raw.githubusercontent.com/Unitech/pm2/master/packager/setup.deb.sh | sudo -E bash -

## Install Fail2ban
## Fail2ban will run with default configuration
## For custom configuration, check: https://linuxize.com/post/install-configure-fail2ban-on-debian-10/
sudo apt install -y fail2ban
EOF
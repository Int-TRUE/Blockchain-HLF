#!/bin/bash

C_YELLOW='\033[1;33m'
C_BLUE='\033[0;34m'
C_RESET='\033[0m'

# subinfoln echos in blue color
function infoln() {
  echo -e "${C_YELLOW}${1}${C_RESET}"
}

function subinfoln() {
  echo -e "${C_BLUE}${1}${C_RESET}"
}



# Tear down running network.
infoln "Tear down running network"
./networkdown.sh

# add PATH to ensure we are picking up the correct binaries
export PATH=${HOME}/fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=${PWD}/config

# cleen up the MSP directory
if [ -d "organizations/peerOrganizations" ]; then
    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
fi

COMPOSE_FILES_CA=docker/docker-compose-ca.yaml
IMAGE_TAG=latest docker-compose -f $COMPOSE_FILES_CA up -d

. scripts/registerEnroll.sh

# Create crypto material using cryptogen

infoln "Generating certificates using cryptogen tool"


subinfoln "Creating Org1 Identities"

createOrg1

subinfoln "Creating Org2 Identities"

createOrg2


subinfoln "Creating Org3 Identities"

createOrg3


subinfoln "Creating Org4 Identities"

set -x
cryptogen generate --config=./config/crypto-config-org4.yaml --output="organizations"
res=$?
{ set +x; } 2>/dev/null

subinfoln "Creating Orderer Org Identities"

createOrderer


# Generate orderer system channel genesis block.
infoln "------------- Generating Orderer Genesis block"
set -x
configtxgen -profile FourOrgsOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block
{ set +x; } 2>/dev/null

# Bring up the peer and orderer nodes using docker compose.
infoln "------------- Bring up the peer and orderer nodes using docker compose"

COMPOSE_FILES=docker/docker-compose-net.yaml
# IMAGE_TAG=latest docker-compose -f $COMPOSE_FILES up -d 2>&1
COMPOSE_FILES_COUCH=docker/docker-compose-couch.yaml
IMAGE_TAG=latest docker-compose -f $COMPOSE_FILES -f $COMPOSE_FILES_COUCH up -d 2>&1

docker ps -a
#!/bin/bash

set -e # environment. execute된 결과물들을 어디에 뿌려줄지. 화면에 출력. 세팅. 로그를 찍어주는 환경변수

# clean out any old identities in the wallets
rm -rf wallet/*

# launch network; create channel and join peer to channel

pushd ../network # push directory : 지정한 디렉토리로 들어가기

./startnetwork.sh

sleep 5

./createchannel.sh

sleep 5

./setAnchorPeerUpdate.sh

sleep 5

./deployCC.sh

popd
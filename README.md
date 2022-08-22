# KickKeeping 실행방법 및 순서
<img src="https://user-images.githubusercontent.com/87708291/185851520-35e91005-a3a0-4711-9bb2-72d4f180f269.png" width="600px"/>

## 1. Network 실행

network 경로에서 (다음 쉘스크립트 순차 실행):

- ./startnetwork.sh
- ./createchannel.sh
- ./setAnchorPeerUpdate.sh
- ./deployCC.sh

## 2. application 경로에서 다음 쉘 스크립트 실행
- ./getCert.sh

## 3. CCP 생성

application/ccp 경로에서 (다음 쉘스크립트 실행):

- ./ccp-generate.sh


## 4. node.js 모듈 설치 (package.json에서 dependencies 확인할 것)

application 경로에서

- npm install

## 5. invoke/query 실행 또는 서버 실행

application 경로에서

- node server.js 실행

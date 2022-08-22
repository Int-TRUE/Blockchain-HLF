## TEST1 : Invoking the chaincode
infoln "TEST1 : Invoking the chaincode"
set -x
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} $PEER_CONN_PARMS -c '{"function":"addUser","Args":["abc@gmail.com"]}' >&log.txt
{ set +x; } 2>/dev/null
cat log.txt
sleep 3

## TEST2 : Invoking the chaincode
infoln "TEST2 : Invoking the chaincode"
set -x
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} $PEER_CONN_PARMS -c '{"function":"RegisterKickboard","Args":["0001", "202208181500", "팔달관_주차장"]}' >&log.txt
{ set +x; } 2>/dev/null
cat log.txt
sleep 3

## TEST3 : Invoking the chaincode
infoln "TEST3 : Invoking the chaincode"
set -x
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} $PEER_CONN_PARMS -c '{"function":"addRating","Args":["abc@gmail.com","myproj2","500"]}' >&log.txt
{ set +x; } 2>/dev/null
cat log.txt
sleep 3

## TEST4 : Query the chaincode
infoln "TEST4 : Query the chaincode"
set -x
peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"function":"readRating","Args":["abc@gmail.com"]}' >&log.txt
{ set +x; } 2>/dev/null
cat log.txt
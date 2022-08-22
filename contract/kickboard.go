package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}
// 다른 타입의 데이터들의 집합
type Kickboard struct{
	KickID string  `json:"kickid"`
	Battery string `json:"battery"`
	Location string `json:"location"`
	Drive string `json:"drive"`
	State string `json:"state"`
	History []History `json:"history"`
}

type History struct{
	UserID string  `json:"userid"`
	Drive string `json:"drive"`
	StartTime string `json:"starttime"`
	FinishTime string `json:"finishtime"`
	StartLocation string `json:"startlocation"`
	FinishLocation string `json:"finishlocation"`
}
 
// 킥보드 등록
func (s *SmartContract) RegisterKickboard(ctx contractapi.TransactionContextInterface, KickID string, Location string, Time string) error {

	var history = History{StartLocation: Location, FinishLocation: Location, StartTime: Time, FinishTime: Time}
	var kickboard = Kickboard{KickID: KickID, Battery: "100", Drive: "0", State: "1", Location: Location}

	kickboard.History=append(kickboard.History,history)

	// 넣어줄때는 byte형태로
	KickboardAsBytes, _ := json.Marshal(kickboard)

	return ctx.GetStub().PutState(KickID, KickboardAsBytes)
}

// 킥보드 조회
func (s *SmartContract) QueryKickboard(ctx contractapi.TransactionContextInterface, KickID string) (string, error) { //json을 string으로 변환해서 반환

	// getState
	KickboardAsBytes, err := ctx.GetStub().GetState(KickID)
	if err !=nil {
		return "", fmt.Errorf("\"Error\": Kickboard dose not exist: "+KickID+"\"")
	}
	
	if KickboardAsBytes == nil {
		return "", fmt.Errorf("\"Error\": Kickboard dose not exist: "+KickID+"\"")
	}

	return string(KickboardAsBytes[:]),nil
}


// 킥보드 폐기
func (s *SmartContract) DiscardKickboard(ctx contractapi.TransactionContextInterface, KickID string) error {

	// getState
	KickboardAsBytes, err := ctx.GetStub().GetState(KickID)
	if err !=nil {
		return err
	}
	
	if KickboardAsBytes == nil {
		return fmt.Errorf("\"Error\": Kickboard dose not exist: "+KickID+"\"")
	}

	kickboard := Kickboard{}
	err = json.Unmarshal(KickboardAsBytes, &kickboard)
	if err!= nil {
		return err
	}

	kickboard.State = "3"

	// PutState
	KickboardAsBytes, err = json.Marshal(kickboard);
	if err !=nil {
		return fmt.Errorf("failed to Marshaling: %v", err)
	}

	err = ctx.GetStub().PutState(KickID, KickboardAsBytes)
	if err !=nil {
		return fmt.Errorf("failed to PutState: %v", err)
	}
	return nil
}


// 정기적 정보 등록
// func (s *SmartContract) EnrollData(ctx contractapi.TransactionContextInterface, KickID string, Battery string, Location string) error {

// 	//getState User
// 	KickboardAsBytes, err := ctx.GetStub().GetState(KickID)
// 	if err !=nil {
// 		return err
// 	} else if KickboardAsBytes == nil {
// 		return fmt.Errorf("\"Error\": Kickboard dose not exist: "+KickID+"\"")
// 	}
// 	// state ok
// 	kickboard := Kickboard{}
// 	err = json.Unmarshal(KickboardAsBytes, &kickboard)
// 	if err != nil{
// 		return err
// 	}

// 	kickboard.Location = Location
// 	kickboard.Battery = Battery

// 	// PutState
// 	KickboardAsBytes, _ = json.Marshal(kickboard);
// 	if err != nil {
// 		return fmt.Errorf("failed to Marshaling: %v", err)
// 	}	
// 	err = ctx.GetStub().PutState(KickID, KickboardAsBytes) // (key, vlaue) : world state에 들어가는 방식
// 		if err != nil {
// 			return fmt.Errorf("failed to Enrolling Data : %v", err)
// 		}

// 	return nil
// }


// 킥보드 사용 요청
func (s *SmartContract) UseKickboard(ctx contractapi.TransactionContextInterface, KickID string, UserID string, StartTime string, StartLocation string) error {

	// getState user
	KickboardAsBytes, err := ctx.GetStub().GetState(KickID)

	if err!=nil{
		return err
	}else if KickboardAsBytes == nil{ // no State! error
		return fmt.Errorf("\"Error\": Kickboard dose not exist: "+KickID+"\"")
	}


	// state ok
	kickboard := Kickboard{}
	err = json.Unmarshal(KickboardAsBytes, &kickboard)
	if err!=nil{
		return err
	}

	if kickboard.State == "2"{
		return fmt.Errorf("\"Error\": Kickboard in use: "+KickID+"\"")
	}else if kickboard.State =="3"{
		return fmt.Errorf("\"Error\": Discarded kickboard: "+KickID+"\"")
	}

	// 사용이력 이어붙이기
	var History = History{UserID: UserID, StartTime: StartTime, StartLocation: StartLocation}
	kickboard.History=append(kickboard.History, History)

	kickboard.State = "2"

	KickboardAsBytes, err = json.Marshal(kickboard); // 다시 구조체로 바꿔준다.
	if err !=nil{
		return fmt.Errorf("Failed to Marshaling: %v", err)
	}

	// PutState
	err = ctx.GetStub().PutState(KickID, KickboardAsBytes)
	if err != nil{
		return fmt.Errorf("Failed to using: %v", err)
	}

	return nil
}


// 킥보드 사용 종료 - 주행거리, 배터리 상태도 업데이트
func (s *SmartContract) FinishKickboard(ctx contractapi.TransactionContextInterface, KickID string, UserID string, Drive string, Battery string, FinishTime string, FinishLocation string) error {

	// getState user
	KickboardAsBytes, err := ctx.GetStub().GetState(KickID)

	if err!=nil{
		return err
	}else if KickboardAsBytes == nil{ // no State! error
		return fmt.Errorf("\"Error\": Kickboard dose not exist: "+KickID+"\"")
	}


	// state ok
	kickboard := Kickboard{}
	err = json.Unmarshal(KickboardAsBytes, &kickboard)
	if err!=nil{
		return err
	}

	if kickboard.State == "1"{
		return fmt.Errorf(("\"Error\": This is not a kickboard in use: "+KickID+"\""))
	}else if kickboard.State =="3"{
		return fmt.Errorf(("\"Error\": Kickboard discarded: "+KickID+"\""))
	}

	// 사용이력 이어붙이기
	var History = History{UserID: UserID, Drive: Drive, FinishTime: FinishTime, FinishLocation: FinishLocation}
	kickboard.History=append(kickboard.History, History)


	// 사용가능 상태로 변경
	kickboard.State = "1"
	// 주행거리 업데이트
	oldDrive,_:= strconv.Atoi(kickboard.Drive)
	newDrive,_:= strconv.Atoi(Drive)
	kickboard.Drive = strconv.Itoa(oldDrive+newDrive)

	// 배터리 업데이트(사용 종료시 남은 배터리를 보내주는 방식)
	kickboard.Battery = Battery


	// putState
	KickboardAsBytes, err = json.Marshal(kickboard); // 다시 구조체로 바꿔준다.
	if err !=nil{
		return fmt.Errorf("Failed to Marshaling: %v", err)
	}

	err = ctx.GetStub().PutState(KickID, KickboardAsBytes)
	if err!=nil{
		return fmt.Errorf("Failed to finish: %v", err)
	}

	return nil
}
func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create teamate chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting teamate chaincode: %s", err.Error())
	}
}



// tx일으킨 ID 가져오기
// func (s *SmartContract) submittingClientIdentity(ctx contractapi.TransactionContextInterface) (string, error) {
// 	b64ID, err := ctx.GetClientIdentity().GetID()
// 	if err != nil{
// 		return "", fmt.Errorf("Failed to read clientID: %v", err)
// 	}
// 	decodeID, err := base64.StdEncoding.DecodeString(b64ID)
// 	if err != nil{
// 		return "", fmt.Errorf("failed to base64 decode clientID: %v", err)
// 	}
// 	return string(decodeID), nil
// }

// gcloud@ajou.ac.kr
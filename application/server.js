// 필요 모듈 포함시키기
const express = require('express') // server-static이 포함되어 있다.
const fs = require('fs')
const path = require('path')

const FabricCAServices = require("fabric-ca-client");
const { Gateway, Wallets } = require("fabric-network");


// 서버 설정 세팅
const app = express()
const PORT = 3000;
const HOST = "0.0.0.0" // 어떠한 ip든 받아올수있음(=전체)

app.use(express.static(path.join(__dirname,"views"))) // 이 미들웨어를 거쳐서 라우팅되기 때문에 현재폴더가 views로 설정됨.
app.use(express.urlencoded({extended:false}))
app.use(express.json())

// 공통적인 부분이므로 전역으로 뺌.
// load the network configuration. ccp불러오기
const ccpPath = path.resolve(__dirname, "ccp", "connection-org1.json"); // 재생성해줘야한대...
const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
// 조직별로 다른 권한
// const ccpPath2 = path.resolve(__dirname, "ccp", "connection-org2.json"); // 재생성해줘야한대...
// const ccp2 = JSON.parse(fs.readFileSync(ccpPath2, "utf8"));

// 라우터를 쓸까..??
// var router1 = express.Router()
// app.use('/login', router1)
// router1.route('/admin').post(async(req,res)=>{})


// 로그인을 기반으로 CC가 동작하게 미들뤠어 처리
// gateway접속, 채널 접속, 사용할 cc기져오기, cc호출하기 부분만 기술
// app.post('/login', async(req, res)=>{
//     const id = req.body.id
//     console.log(id)

//     try {
//         // Create a new file system based wallet for managing identities.
//         const walletPath = path.join(process.cwd(), "wallet");
//         const wallet = await Wallets.newFileSystemWallet(walletPath);
//         console.log(`Wallet path: ${walletPath}`);

//         // Check to see if we've already enrolled the user.
//         const identity = await wallet.get(id);
//         if (!identity) {
//             console.log(
//                 `An identity for the user ${id} does not exist in the wallet`
//             );
//             console.log("Please register and enroll your account before retrying");
//             const res_str=`Please register and enroll your account "${id}" before retrying`
//             res.send(res_str)
//             return;
//         }

//         // Create a new gateway for connecting to our peer node.
//         // 위에서 받아온 인증서를 가지고 BN에 접속.
//         const gateway = new Gateway();
//         await gateway.connect(ccp, {
//             wallet,
//             identity: id,
//             discovery: { enabled: true, asLocalhost: true },
//         });

//         // Get the network (channel) our contract is deployed to.
//         const network = await gateway.getNetwork("mychannel");

//         // Get the contract from the network.
//         const contract = network.getContract("kickboard");


//     } catch (error) {
//         console.error(`Failed to LOGIN: ${error}`);
//     }
// })
// admin로그인 미들웨어
// app.use('/admin', async(req, res, next)=>{
//     try {
//         // Create a new file system based wallet for managing identities.
//         const walletPath = path.join(process.cwd(), "wallet");
//         const wallet = await Wallets.newFileSystemWallet(walletPath);
//         console.log(`Wallet path: ${walletPath}`);

//         // Check to see if we've already enrolled the user.
//         const identity = await wallet.get("admin");
//         if (!identity) {
//             console.log(
//                 `An identity for the "admin" does not exist in the wallet`
//             );
//             console.log(`Please register and enroll "admin" before retrying`);
//             const res_str=`Please register and enroll "admin" before retrying`
//             res.send(res_str)
//             return;
//         }

//         // Create a new gateway for connecting to our peer node.
//         // 위에서 받아온 인증서를 가지고 BN에 접속.
//         const gateway = new Gateway();
//         await gateway.connect(ccp, {
//             wallet,
//             identity: "admin",
//             discovery: { enabled: true, asLocalhost: true },
//         });

//         // Get the network (channel) our contract is deployed to.
//         const network = await gateway.getNetwork("mychannel");

//         // Get the contract from the network.
//         const contract = network.getContract("kickboard");

//         // 로그인 성공하면 사용자 화면을 뿌려주는건..?
        
//         next()

//     } catch (error) {
//         console.error(`Failed to LOGIN: ${error}`);
//     }
// })

// 로그인페이지에서 페이지 연결하기(관리자, 사용자)
app.post('/connect', async(req, res)=>{
    const id = req.body.id
    const pw = req.body.pw
    console.log(id, pw)

    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(id);
        if (!identity) {
            console.log(
                `An identity for the user ${id} does not exist in the wallet`
            );
            console.log("Please register and enroll your account before retrying");
            const res_str=`Please register and enroll your account "${id}" before retrying`
            res.send(res_str)
            return;
        }

        // Create a new gateway for connecting to our peer node.
        // 위에서 받아온 인증서를 가지고 BN에 접속.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: id,
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("kickboard");


        // 로그인 성공하면 사용자 화면을 뿌려주는건..?
        if(id == "admin"){
            res.sendFile(__dirname + "/views/admin.html");
            // const resultPath = path.join(process.cwd(), "./views/admin.html")
        }else{
            res.sendFile(__dirname + "/views/user.html");
            // const resultPath = path.join(process.cwd(), "./views/user.html")
        }

        var resultHTML = fs.readFileSync(resultPath, "utf-8")

        //resultHTML = resultHTML.replace("<dir></dir>", "<div><p>Transaction(Register Kickboard) has been submitted</p></div>")
        res.send(resultHTML)

        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to LOGIN: ${error}`);
    }
})
// "/"경로 라우팅
app.get("/", (req, res)=>{
    res.sendFile(__dirname+"index.html")
})

// post: "/admin"경로 body(id/password) 라우팅
app.post("/registeradmin", async(req, res)=>{
    const id = req.body.id
    const pw = req.body.pw
    console.log(id, pw)

    //필요작업! ca에 인증서 받아와서 wallet에 저장.
    try {
        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(
            caInfo.url,
            { trustedRoots: caTLSCACerts, verify: false },
            caInfo.caName
        );

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(id);
        if (identity) {
            console.log(
                `An identity for the admin user "${id}" already exists in the wallet`
            );
            const res_str = `An identity for the admin user "${id}" already exists in the wallet`
            res.send(res_str)
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({
            enrollmentID: id,
            enrollmentSecret: pw,
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: "Org1MSP",
            type: "X.509",
        };
        await wallet.put(id, x509Identity);
        console.log(
            `Successfully enrolled admin user ${id} and imported it into the wallet`
        );
        const res_str = `Successfully enrolled ${id} user "admin" and imported it into the wallet`
        res.send(res_str)
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        const res_str = `Failed to enroll admin user ${id} : ${error}`
        res.send(res_str)
        // process.exit(1); // 프로그램 끄기임. 서버는 꺼지면 안되니까 주석처리
    }
})

// post: "/user"경로 body(id/userrole) 라우팅
app.post("/registeruser", async(req, res)=>{
    const id = req.body.id
    const pw = req.body.pw
    console.log(id, pw)

    //registerUser.js
    try {
        // 공통적인 부분이라 주석처리// load the network configuration
        // const ccpPath = path.resolve(__dirname, "ccp", "connection-org1.json");
        // const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities["ca.org1.example.com"].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(id);
        if (userIdentity) {
            console.log(
                `An identity for the user ${id} already exists in the wallet`
            );
            const res_str = `An identity for the user ${id} already exists in the wallet`
            res.send(res_str)
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get("admin");
        if (!adminIdentity) {
            console.log(
                `An identity for the admin user "admin" does not exist in the wallet`
            );
            console.log("You must enroll admin before retrying");
            const res_str = "You must enroll admin at Admin Page before retrying"
            res.send(res_str)
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet
            .getProviderRegistry()
            .getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, "admin");

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register(
            {
                affiliation: "org1.department1",
                enrollmentID: id,
                enrollmentSecret: pw,
            },
            adminUser
        ); // register가 되면 secret이 만들어짐.
        // 원래는 원할때 enroll해야하지만 register 후 바로 등록
        const enrollment = await ca.enroll({
            enrollmentID: id,
            enrollmentSecret: pw,
        }); // secret을 어딘가에 보관하고 있지는 않아서 재발급은 어렵다.
        // 발급된 인증서를 가지고 로그인은 가능하나 인증서 재발급이 안되는것임 주의!
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: "Org1MSP",
            type: "X.509",
        };
        await wallet.put(id, x509Identity);
        console.log(
            `Successfully registered and enrolled admin user ${id} and imported it into the wallet`
        );

        const res_str = "Success created."
        res.send(res_str)

        // const res_str = `Successfully registered and enrolled admin user ${id} and imported it into the wallet`
        // res.send(res_str)
    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        // process.exit(1);// 에러가 났을때 종료하라는 구문이라 없어져야함!!
        const res_str = `Failed to register user ${id}: ${error}`
        res.send(res_str)
    }
})

// post : "/admin/registerK"경로 body(kickid/location/time) 라우팅
app.post("/admin/registerK", async(req, res)=>{
    const kickid = req.body.kickid
    const location = req.body.location
    const time = req.body.time

    console.log(kickid, location, time)

    try {
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get("admin");
        if (!identity) {
            console.log(
                `An identity for the user "admin" does not exist in the wallet`
            );
            console.log("Please register and enroll your account before retrying");
            const res_str=`Please register and enroll your account "admin" before retrying`
            res.send(res_str)
            return;
        }

        // Create a new gateway for connecting to our peer node.
        // 위에서 받아온 인증서를 가지고 BN에 접속.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "admin",
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("kickboard");

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        await contract.submitTransaction(
            "RegisterKickboard",
            kickid,
            location,
            time
        );
        console.log("Transaction has been submitted");

        // Disconnect from the gateway.
        await gateway.disconnect();

        const res_str = "Success registered."
        res.send(res_str)

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
})

// post : "/admin/discardK"경로 body(cert/id/color/size/owner/value) 라우팅
app.post("/admin/discardK", async(req, res)=>{
    const kickid = req.body.kickid

    console.log(kickid)

    try {

        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get("admin");
        if (!identity) {
            console.log(
                `An identity for the user "admin" does not exist in the wallet`
            );
            console.log("Please register and enroll your account before retrying");
            const res_str=`Please register and enroll your account "admin" before retrying`
            res.send(res_str)
            return;
        }

        // Create a new gateway for connecting to our peer node.
        // 위에서 받아온 인증서를 가지고 BN에 접속.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "admin",
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("kickboard");

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        await contract.submitTransaction(
            "DiscardKickboard",
            kickid
        );
        console.log("Transaction has been submitted");

        // Disconnect from the gateway.
        await gateway.disconnect();

        const res_str = "Success discarded."
        res.send(res_str)

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
})

// post : "/login/useK"경로 body(kickid, userid, starttime, startlocation) 라우팅
app.post("/user/useK", async(req, res)=>{
    const kickid = req.body.kickid
    const userid = req.body.userid
    const starttime = req.body.starttime
    const startlocation = req.body.startlocation

    console.log(kickid, userid, starttime, startlocation)

    try {

        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(userid);
        if (!identity) {
            console.log(
                `An identity for the user ${userid} does not exist in the wallet`
            );
            console.log("Please register and enroll your account before retrying");
            const res_str=`Please register and enroll your account ${userid} before retrying`
            res.send(res_str)
            return;
        }

        // Create a new gateway for connecting to our peer node.
        // 위에서 받아온 인증서를 가지고 BN에 접속.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: userid,
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("kickboard");
        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        await contract.submitTransaction(
            "UseKickboard",
            kickid,
            userid,
            starttime,
            startlocation
        );
        console.log("Transaction has been submitted");

        // Disconnect from the gateway.
        await gateway.disconnect();

        const res_str = "Success use."
        res.send(res_str)

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
})

// post : "/login/finishK"경로 body(cert/id/color/size/owner/value) 라우팅
app.post("/user/finishK", async(req, res)=>{
    const kickid = req.body.kickid
    const userid = req.body.userid
    const drive = req.body.drive
    const battery = req.body.battery
    const finishtime = req.body.finishtime
    const finishlocation = req.body.finishlocation

    console.log(kickid, userid, drive, battery, finishtime, finishlocation)

    try {

        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(userid);
        if (!identity) {
            console.log(
                `An identity for the user ${userid} does not exist in the wallet`
            );
            console.log("Please register and enroll your account before retrying");
            const res_str=`Please register and enroll your account "${userid}" before retrying`
            res.send(res_str)
            return;
        }

        // Create a new gateway for connecting to our peer node.
        // 위에서 받아온 인증서를 가지고 BN에 접속.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: userid,
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("kickboard");
        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        await contract.submitTransaction(
            "FinishKickboard",
            kickid,
            userid,
            drive,
            battery,
            finishtime,
            finishlocation
        );
        console.log("Transaction has been submitted");

        // Disconnect from the gateway.
        await gateway.disconnect();

        const res_str = "Success finished."
        res.send(res_str)

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
})
// get : "/login/query"경로 query(id) 라우팅 (get으로 오면 query로 옴)
app.get("/queryK", async(req, res)=>{
    const id = req.query.id

    console.log(id)

    // const res_test = `{"result":"success", "msg":{"ID":"TestASSET", "color":"TESTC", "size":"TESTS", "onwer":"TESTO", "appraisevalue":"TESTV"}}`
    // res.json(JSON.parse(res_test))
    // return

    try {
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get("admin");
        if (!identity) {
            console.log(
                `An identity for the user "admin" does not exist in the wallet`
            );
            console.log("Please register and enroll your account before retrying");
            const res_str=`Please register and enroll your account "admin" before retrying`
            res.send(res_str)
            return;
        }

        // Create a new gateway for connecting to our peer node.
        // 위에서 받아온 인증서를 가지고 BN에 접속.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "admin",
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        // Get the contract from the network.
        const contract = network.getContract("kickboard");
        

        // invoke방식의 submitTransaction이 아닌 query방식의 evaluateTransaction 사용
        result = await contract.evaluateTransaction(  // 읽어오는 것이기 때문에 결과물을 뱉음.
            "QueryKickboard",
            id
        );
        console.log("Transaction has been submitted");
        console.log(result.toString());

        // Disconnect from the gateway.
        await gateway.disconnect();

        const res_str = `{"result":"success", "msg":${result}}`
        res.json(JSON.parse(res_str))

        //console.log(res.json(JSON.parse(res_str)))

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        const res_str = `{"result":"failed", "msg":Failed to submit transaction: ${error}}`
        res.json(JSON.parse(res_str))
    }
})

// get : "/assets"경로 query(cert/id) 라우팅 (get으로 오면 query로 옴)
// app.get("/login/assets", async(req, res)=>{
//     const cert = req.query.cert

//     console.log(cert, id)

//     // const res_test = `{"result":"success", "msg":{"ID":"TestASSET", "color":"TESTC", "size":"TESTS", "onwer":"TESTO", "appraisevalue":"TESTV"}}`
//     // res.json(JSON.parse(res_test))
//     // return

//     try {
//         // invoke방식의 submitTransaction이 아닌 query방식의 evaluateTransaction 사용
//         result = await contract.evaluateTransaction(  // 읽어오는 것이기 때문에 결과물을 뱉음.
//             "GetAllAsset",
//         );
//         console.log("Transaction has been submitted");

//         // Disconnect from the gateway.
//         await gateway.disconnect();

//         const res_str = `{"result":"success", "msg":${result}}`
//         res.json(JSON.parse(res_str))

//     } catch (error) {
//         console.error(`Failed to submit transaction: ${error}`);
//         const res_str = `{"result":"failed", "msg":Failed to submit transaction: ${error}}`
//         res.json(JSON.parse(res_str))
//     }
// })

// 서버 시작
app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
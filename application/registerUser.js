/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
// 네트워크 동작 - CCP생성 - CA접속 - 인증서 발급 - WALLET에 저장, 꺼내씀
/*전체 흐름도*/
// dApp이 BN에 CC를 요청하기 위해서는 인증서를 가지고 있어야한다.(필요한 인증서를 WALLET에서 꺼내서 요청)
// 이 인증서를 받기 위해서 CA에 요청을 해서 받아온 후 WALLET에 저장해둔다.
// dAPP은 CCP에 저장된 주소들을 보고 CA에 접속을함.
"use strict";

const { Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const fs = require("fs");
const path = require("path");

async function main() {
    try {
        // load the network configuration
        //ccp : dApp이 접속하기위한 주소들(ca, peer, orderer, ...)같은 configuration들을 모아놓은것.
        // 그 connection json파일도 개발자가 작성... 설정파일안에 주소들이 들어있다.
        // "certificateAuthorities": {
        //     "ca.org1.example.com": {
        //         "url": "https://localhost:7054", // 네트워크와 통신하는 포트
        // 공개된 공개키도 알아와서 적어줘야함.
        const ccpPath = path.resolve(__dirname, "ccp", "connection-org1.json");
        const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

        // Create a new CA client for interacting with the CA.
        // 주소와 포트를 가지고 DAPP과 CA서버와의 통신이 필요함.
        const caURL = ccp.certificateAuthorities["ca.org1.example.com"].url; // CA서버의 주소
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get("appUser");
        if (userIdentity) {
            console.log(
                'An identity for the user "appUser" already exists in the wallet'
            );
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get("admin");
        if (!adminIdentity) {
            console.log(
                'An identity for the admin user "admin" does not exist in the wallet'
            );
            console.log("Run the enrollAdmin.js application before retrying");
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet
            .getProviderRegistry()
            .getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, "admin");

        // Register the user, enroll the user, and import the new identity into the wallet.
        // admin권한으로 CA에 정보등록
        const secret = await ca.register(
            {
                affiliation: "org1.department1",
                enrollmentID: "appUser",
                role: "client",
            },
            adminUser
        );
        //---------------------------------------------- ADMIN 역할 끝
        // CA가 등록된 정보를 보고 인증서를 발급해줌
        const enrollment = await ca.enroll({
            enrollmentID: "appUser",
            enrollmentSecret: secret,
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: "Org1MSP",
            type: "X.509",
        };
        await wallet.put("appUser", x509Identity);
        console.log(
            'Successfully registered and enrolled admin user "appUser" and imported it into the wallet'
        );
    } catch (error) {
        console.error(`Failed to register user "appUser": ${error}`);
        process.exit(1);
    }
}

main();

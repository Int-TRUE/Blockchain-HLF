const fs = require("fs");
const { Wallets } = require("fabric-network");
const path = require("path");

// 정적인 방식. 이미 인증서 발급은 되었고 나중에 불러와서 쓰느것.
async function main() {
    // Main try/catch block
    try {
        // A wallet stores a collection of identities
        // "wallet"폴더 생성 또는 불러오기
        const wallet = await Wallets.newFileSystemWallet("wallet");
        // 존재하는지 체크
        const checkidentity = await wallet.get("appUser");
        if (checkidentity) {
            console.log(
                'An identity for the user "appUser" already exists in the wallet'
            );
            return;
        }

        // Identity to credentials to be stored in the wallet
        // 1. 인증서 발급 및 생성
        const credPath = path.join(__dirname, "msp");
        const certificate = fs
            .readFileSync(
                path.join(
                    credPath,
                    "/org1.example.com/users/signcerts/User1@org1.example.com-cert.pem"
                ) // 이미 발급된 인증서 꺼내씀
            )
            .toString();
        const privateKey = fs
            .readFileSync(
                path.join(credPath, "/org1.example.com/users/keystore/priv_sk") // 이미 발급된 인증서 꺼내씀
            )
            .toString();

        // Load credentials into wallet
        const identityLabel = "appUser";

        const identity = {
            credentials: {
                certificate,
                privateKey,
            },
            mspId: "Org1MSP",
            type: "X.509",
        };

        await wallet.put(identityLabel, identity);
        console.log('Successfully import an user("appUser") into the wallet');
    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

main();

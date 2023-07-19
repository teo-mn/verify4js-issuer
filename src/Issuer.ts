import * as fs from "fs";
import {CertStruct, IssuerStruct} from "./utils/structs";
import {abi as abiCert} from "./abi/certify";
import {abi as abiUniv} from "./abi/university";
import * as Utils from "./utils/utils";
import Web3, {Contract} from "web3";

const DEFAULT_GAS_LIMIT = 2000000;
export const VERSION = "v1.0-typescript";

class Issuer {
    smartContractAddress: string;
    issuerAddress: string;
    issuerName: string;
    nodeHost: string;
    chainId: number;
    hashType: string;
    contractType: string;
    __client: Web3;
    __contractInstance: Contract<typeof abiCert | typeof abiUniv>;

    constructor(
        smartContractAddress: string,
        nodeHost: string,
        issuerAddress: string = "",
        issuerName: string = "",
        chainId: number = 1104,
        hashType: string = "sha256",
        contractType: string = "",
    ) {
        this.__client = new Web3(new Web3.providers.HttpProvider(nodeHost));
        this.smartContractAddress =
            this.__client.utils.toChecksumAddress(smartContractAddress);
        this.issuerAddress = issuerAddress;
        this.issuerName = issuerName;
        this.nodeHost = nodeHost;
        this.chainId = chainId;
        this.hashType = hashType;
        this.contractType = contractType;

        const abi = contractType === "university" ? abiUniv : abiCert;
        this.__contractInstance = new this.__client.eth.Contract(
            abi,
            this.smartContractAddress
        );
    }

    getPk(
        privateKey: string = "",
        keyStore: string = "",
        passphrase: string = ""
    ): string {
        let pk = privateKey;
        if (privateKey === "") {
            if (fs.statSync(keyStore).isDirectory()) {
                const path = `${keyStore}/${this.issuerAddress}.json`;
                pk = Utils.decryptAccount(passphrase, path);
            } else if (fs.statSync(keyStore).isFile()) {
                pk = Utils.decryptAccount(passphrase, keyStore);
            } else {
                throw new Error("Private key or key store file is required");
            }
        }
        return pk;
    }

    async issue(
        id: string,
        hashValue: string,
        expireDate: number,
        desc: string,
        privateKey: string = "",
        keyStore: string = "",
        passphrase: string = "",
        doHash: boolean = false,
        hashImage: string = "",
        hashJson: string = ""
    ): Promise<{ txHash: string, error: string | null }> {
        const pk = this.getPk(privateKey, keyStore, passphrase);

        // Check credit
        const credit = await this.getCredit(this.issuerAddress);
        if (credit === 0) {
            throw new Error("Not enough credit");
        }
        const cert = await this.getCertificate(hashValue);
        if (cert.id > 0) {
            let isRevoked = cert.isRevoked;
            if (this.contractType !== "") {
                // @ts-ignore
                const arr2: { isRevoked: boolean } = await this.__contractInstance.methods.getRevokeInfo(hashValue).call();
                isRevoked = arr2.isRevoked;
            }
            if (!isRevoked) {
                throw new Error("Certificate already registered");
            }
        }

        const isDuplicated = await this.isDuplicatedCertNum(id);
        if (isDuplicated) {
            throw new Error("Certificate number already registered");
        }

        const res = await this.__issueUtil(
            hashValue,
            this.issuerAddress,
            id,
            expireDate,
            VERSION,
            desc,
            pk,
            hashImage,
            hashJson
        );

        if (res.error !== null) {
            console.error(res.error);
            throw new Error(res.error);
        }

        return res;
    }

    async __issueUtil(
        hashValue: string,
        issuerAddress: string,
        certNum: string,
        expireDate: number,
        version: string,
        desc: string,
        pk: string,
        hashImage: string = "",
        hashJson: string = ""
    ): Promise<{ txHash: string, error: string | null }> {
        const nonce = await this.__client.eth.getTransactionCount(
            this.__client.utils.toChecksumAddress(issuerAddress)
        );
        try {
            let func;
            if (this.contractType === "") {
                // @ts-ignore
                func = this.__contractInstance.methods.addCertification(hashValue, certNum, expireDate, version, desc);
            } else {
                // @ts-ignore
                func = this.__contractInstance.methods.addCertification(hashValue, hashImage, hashJson, certNum, expireDate, desc);
            }
            const data = await func.encodeABI();

            const tx = {
                from: issuerAddress,
                to: this.smartContractAddress,
                nonce: nonce,
                gasPrice: this.__client.utils.toWei("1000", "gwei"),
                gas: DEFAULT_GAS_LIMIT,
                data: data,
            };

            const signed = await this.__client.eth.accounts.signTransaction(tx, pk);
            const txRes = await this.__client.eth.sendSignedTransaction(
                signed.rawTransaction
            );
            if (txRes.status.toString() === '1') {
                try {
                    await this.writeTxId(
                        hashValue,
                        txRes.transactionHash.toString(),
                        issuerAddress,
                        pk
                    );
                } catch (e) {
                    console.error("Error occurred when sending txid", e);
                }

                return {txHash: txRes.transactionHash.toString(), error: null};
            }

            return {txHash: '', error: 'Failed on Blockchain'};
        } catch (e: any) {
            return {txHash: '', error: e};
        }
    }

    async writeTxId(
        hashValue: string,
        txHash: string,
        issuerAddress: string,
        pk: string
    ) {
        const nonce = await this.__client.eth.getTransactionCount(
            this.__client.utils.toChecksumAddress(issuerAddress)
        );

        // @ts-ignore
        const func = this.__contractInstance.methods.addTransactionId(hashValue, txHash);
        const data = await func.encodeABI();

        const tx = {
            from: issuerAddress,
            to: this.smartContractAddress,
            nonce: nonce,
            gasPrice: this.__client.utils.toWei("1000", "gwei"),
            gas: DEFAULT_GAS_LIMIT,
            data: data,
        };

        const signed = await this.__client.eth.accounts.signTransaction(tx, pk);
        await this.__client.eth.sendSignedTransaction(
            signed.rawTransaction
        );
    }

    async revoke(
        merkleRoot: string,
        revokerName: string,
        privateKey: string = "",
        keyStore: string = "",
        passphrase: string = ""
    ): Promise<{ txHash: string }> {
        const pk = this.getPk(privateKey, keyStore, passphrase);
        const credit = await this.getCredit(this.issuerAddress);
        if (credit === 0) {
            throw new Error("Not enough credit");
        }

        const cert = await this.getCertificate(merkleRoot);

        if (cert.id === 0) {
            throw new Error("Certificate not found");
        }

        if (this.contractType === '' && cert.isRevoked) {
            throw new Error("Certificate already revoked");
        }

        const {txHash, error} = await this.revokeUtil(
            merkleRoot,
            this.issuerAddress,
            revokerName,
            pk
        );

        if (error !== null) {
            console.error(error);
            throw new Error(error);
        }
        return {txHash: txHash};
    }

    async revokeUtil(
        merkleRoot: string,
        revokerAddress: string,
        revokerName: string,
        pk: string
    ) {
        const nonce = await this.__client.eth.getTransactionCount(
            this.__client.utils.toChecksumAddress(revokerAddress)
        );

        try {
            // @ts-ignore
            const func = this.__contractInstance.methods.revoke(merkleRoot, revokerName);

            const data = await func.encodeABI();

            const tx = {
                from: revokerAddress,
                to: this.smartContractAddress,
                nonce: nonce,
                gasPrice: this.__client.utils.toWei("1000", "gwei"),
                gas: DEFAULT_GAS_LIMIT,
                data: data,
            };
            const signed = await this.__client.eth.accounts.signTransaction(tx, pk);
            const txRes = await this.__client.eth.sendSignedTransaction(
                signed.rawTransaction
            );

            if (txRes.status.toString() === '1') {
                return {txHash: this.__client.utils.toHex(txRes.transactionHash.toString()), error: null};
            }

            return {txHash: '', error: "Failed on Blockchain"};
        } catch (e: any) {
            console.error(e);
            throw e;
        }
    }

    async verify_hash(hashValue: string, chainpointProof: string): Promise<void> {
        const proof = JSON.parse(chainpointProof)["proof"];
        // const cp = new ChainPointV2(this.hashType);

        await this.verify_root(hashValue);
    }

    async verify_root(hashValue: string): Promise<string> {
        const cert = await this.getCertificate(hashValue);
        const issuer = this.getIssuer(cert.issuer);
        let state = "ISSUED";

        if (cert.id === 0) {
            throw new Error("Hash not found in smart contract");
        }

        if (cert.isRevoked) {
            state = "REVOKED";
        } else {
            const ts = Math.floor(Date.now() / 1000);
            if (cert.expireDate > 0 && cert.expireDate < ts) {
                state = "EXPIRED";
            }
        }

        return state; //
    }

    async getCredit(address: string): Promise<number> {
        // @ts-ignore
        return await this.__contractInstance.methods.getCredit(this.__client.utils.toChecksumAddress(address)).call();
    }

    async isDuplicatedCertNum(certNum: string): Promise<boolean> {
        if (this.contractType === "") {
            return false;
        }

        // @ts-ignore
        const arr: CertStruct = await this.__contractInstance.methods.getCertificationByCertNum(certNum).call();

        if (arr.id > 0) {
            // @ts-ignore
            const arr2: { isRevoked: boolean } = await this.__contractInstance.methods.getRevokeInfo(arr.hash).call();
            return !arr2['isRevoked'];
        }
        return false;
    }

    async getCertificate(merkleRoot: string): Promise<CertStruct> {
        // @ts-ignore
        return await this.__contractInstance.methods.getCertification(merkleRoot).call();
    }

    async getIssuer(address: string): Promise<IssuerStruct> {
        // @ts-ignore
        return await this.__contractInstance.methods.getIssuerByAddress(address).call();
    }
}

export {Issuer, CertStruct, IssuerStruct};

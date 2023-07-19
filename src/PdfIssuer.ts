import {Issuer, VERSION} from "./Issuer";
import * as Utils from "./utils/utils";
import * as pdf_utils from "./pdf";
import * as fs from "fs";

export class PdfIssuer extends Issuer {
    constructor(
        smartContractAddress: string,
        nodeHost: string,
        issuerAddress: string = "",
        issuerName: string = "",
        chainId: number = 1104,
        hashType: string = "sha256"
    ) {
        super(
            smartContractAddress,
            nodeHost,
            issuerAddress,
            issuerName,
            chainId,
            hashType
        );
    }

    async issuePdf(
        id: string,
        sourceFilePath: string,
        destinationFilePath: string,
        expireDate: number,
        desc: string,
        additionalInfo: string,
        privateKey: string = "",
        keyStore: string = "",
        passphrase: string = ""
    ): Promise<{ txHash: string, error: string | null, hash: string }> {
        const hashVal = await this.writeMetadata(id, sourceFilePath, destinationFilePath, expireDate, desc, additionalInfo);
        const res = await this.issue(
            id,
            hashVal,
            expireDate,
            desc,
            privateKey,
            keyStore,
            passphrase
        );
        return {...res, hash: hashVal};
    }

    async writeMetadata(
        id: string,
        sourceFilePath: string,
        destinationFilePath: string,
        expireDate: number,
        desc: string,
        additionalInfo: string) {
        if (
            !fs.existsSync(sourceFilePath) ||
            !fs.lstatSync(sourceFilePath).isFile()
        ) {
            throw new Error("Source path should be valid");
        }

        if (
            fs.existsSync(destinationFilePath) &&
            fs.lstatSync(destinationFilePath).isDirectory()
        ) {
            throw new Error("Destination path can't be directory");
        }

        const verifymn = {
            issuer: {
                name: this.issuerName,
                address: this.issuerAddress,
            },
            info: {
                name: this.issuerName,
                desc: desc,
                cerNum: id,
                additionalInfo: additionalInfo,
            },
            version: VERSION,
            blockchain: {
                network: this.chainId === 1104 ? "CorexMain" : "CorexTest",
                smartContractAddress: this.smartContractAddress,
            },
        };

        await pdf_utils.addMetadata(sourceFilePath, destinationFilePath, JSON.stringify(verifymn));
        return await Utils.calcHash(destinationFilePath);
    }

    async revokePdf(
        filePath: string,
        revokerName: string,
        privateKey: string = "",
        keyStore: string = "",
        passphrase: string = ""
    ): Promise<any> {
        if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
            throw new Error("Source path should be valid");
        }

        const hashVal = await Utils.calcHash(filePath, this.hashType);
        console.log(hashVal);
        return this.revoke(
            hashVal,
            revokerName,
            privateKey,
            keyStore,
            passphrase
        );
    }
}

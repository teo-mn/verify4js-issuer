import * as fs from "fs";
import * as crypto from "crypto";
import Web3 from "web3";
import * as os from "os";
import * as path from "path";

const web3 = new Web3(new Web3.providers.HttpProvider('https://node-testnet.teo.mn'));

export function randomPassphrase(length: number = 8) {
    const characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
    let passphrase = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        passphrase += characters[randomIndex];
    }
    console.log(passphrase);
    return passphrase;
}

export function decryptAccount(passphrase: string, path: string) {
    const encryptedKey = fs.readFileSync(path, "utf-8");
    const private_key = web3.eth.accounts.decrypt(encryptedKey, passphrase);
    return web3.utils.toHex(private_key);
}

export function calcHash(path: string, algorithm: string = "sha256"): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(path);

        stream.on("data", (data: Buffer) => {
            hash.update(data);
        });

        stream.on("end", () => {
            const hashStr = hash.digest("hex");
            resolve(hashStr);
        });

        stream.on("error", (error: Error) => {
            reject(error);
        });
    });
}

export function calcHashStr(strVal: string) {
    const hashStr = crypto.createHash("sha256");
    hashStr.update(strVal, "utf-8");
    return hashStr.digest("hex");
}

export async function createTemporaryCopy(filePath: string): Promise<string> {
    const tempDir = os.tmpdir();
    const tempFileName = "temp_file_name";
    const tempPath = path.join(tempDir, tempFileName);

    await fs.promises.copyFile(filePath, tempPath);

    return tempPath;
}

export function generateAccount(
    keyStoreDirPath: string,
    verbose: boolean = false
): [string, string] {
    const acc = web3.eth.accounts.create();
    const passphrase = randomPassphrase(20);
    const keystore = acc.encrypt(passphrase);

    const fileName = `${acc.address}.json`;
    const filePath = path.join(keyStoreDirPath, fileName);

    fs.writeFileSync(filePath, JSON.stringify(keystore));

    if (verbose) {
        console.log("New address generated:", acc.address);
    }

    return [acc.address, passphrase];
}

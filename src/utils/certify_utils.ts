const Web3 = require("web3");
const abi = require("../abi/certify");

const DEFAULT_GAS_LIMIT = 2000000;

async function addCertification(
  hashStr: string,
  certNum: string,
  expireDate: number,
  version: string,
  desc: string,
  nodeUrl: string,
  address: string,
  contractAddress: string,
  pk: string
) {
  const client = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  const contract_instance = new client.eth.Contract(abi, contractAddress);
  const nonce = await client.eth.getTransactionCount(
    client.utils.toChecksumAddress(address)
  );

  try {
    const func = contract_instance.methods.addCertification(
      hashStr,
      certNum,
      expireDate,
      version,
      desc
    );
    const tx = func.encodeABI({
      from: address,
      gasPrice: client.utils.toWei("1000", "gwei"),
      nonce,
      gas: DEFAULT_GAS_LIMIT,
    });
    const signed = await client.eth.accounts.signTransaction(
      { data: tx, to: contractAddress, gas: DEFAULT_GAS_LIMIT },
      pk
    );
    const { rawTransaction } = signed;
    const tx_hash = await client.eth.sendSignedTransaction(rawTransaction);
    const tx_res = await client.eth.waitForTransactionReceipt(tx_hash);

    if (tx_res.status === true) {
      return client.utils.toHex(tx_hash);
    }
    return ["", "Failed on blockchain"];
  } catch (e) {
    console.log(e);
    return ["", e];
  }
}

async function revokeCertification(
  hashStr: string,
  revokerName: string,
  nodeUrl: string,
  contractAddress: string,
  address: string,
  pk: string
) {
  const client = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  const contract_instance = new client.eth.Contract(abi, contractAddress);
  const nonce = await client.eth.getTransactionCount(
    client.utils.toChecksumAddress(address)
  );

  try {
    const func = contract_instance.methods.revoke(hashStr, revokerName);
    const tx = func.encodeABI({
      from: address,
      gasPrice: client.utils.toWei("1000", "gwei"),
      nonce,
      gas: DEFAULT_GAS_LIMIT,
    });
    const signed = await client.eth.accounts.signTransaction(
      { data: tx, to: contractAddress, gas: DEFAULT_GAS_LIMIT },
      pk
    );
    const { rawTransaction } = signed;
    const tx_hash = await client.eth.sendSignedTransaction(rawTransaction);
    const tx_res = await client.eth.waitForTransactionReceipt(tx_hash);

    if (tx_res.status === true) {
      return client.utils.toHex(tx_hash);
    }
    return ["", "Failed on blockchain"];
  } catch (e) {
    console.log(e);
    return ["", e];
  }
}

async function revokeCertificationById(
  certId: number,
  revokerName: string,
  nodeUrl: string,
  contractAddress: string,
  address: string,
  pk: string
) {
  const client = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  const contract_instance = new client.eth.Contract(abi, contractAddress);
  const nonce = await client.eth.getTransactionCount(
    client.utils.toChecksumAddress(address)
  );

  try {
    const func = contract_instance.methods.revokeById(certId, revokerName);
    const tx = func.encodeABI({
      from: address,
      gasPrice: client.utils.toWei("1000", "gwei"),
      nonce,
      gas: DEFAULT_GAS_LIMIT,
    });
    const signed = await client.eth.accounts.signTransaction(
      { data: tx, to: contractAddress, gas: DEFAULT_GAS_LIMIT },
      pk
    );
    const { rawTransaction } = signed;
    const tx_hash = await client.eth.sendSignedTransaction(rawTransaction);
    const tx_res = await client.eth.waitForTransactionReceipt(tx_hash);

    if (tx_res.status === true) {
      return client.utils.toHex(tx_hash);
    }
    return ["", "Failed on blockchain"];
  } catch (e) {
    console.log(e);
    return ["", e];
  }
}

async function chargeCredit(
  address: string,
  credit: number,
  ownerAddress: string,
  ownerPk: string,
  nodeUrl: string,
  contractAddress: string
) {
  const client = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  const contract_instance = new client.eth.Contract(abi, contractAddress);
  const nonce = await client.eth.getTransactionCount(
    client.utils.toChecksumAddress(ownerAddress)
  );

  try {
    const func = contract_instance.methods.chargeCredit(
      client.utils.toChecksumAddress(address),
      credit
    );
    const tx = func.encodeABI({
      from: address,
      gasPrice: client.utils.toWei("1000", "gwei"),
      nonce,
      gas: DEFAULT_GAS_LIMIT,
    });
    const signed = await client.eth.accounts.signTransaction(
      { data: tx, to: contractAddress, gas: DEFAULT_GAS_LIMIT },
      ownerPk
    );
    const { rawTransaction } = signed;
    const tx_hash = await client.eth.sendSignedTransaction(rawTransaction);
    const tx_res = await client.eth.waitForTransactionReceipt(tx_hash);

    if (tx_res.status === true) {
      return client.utils.toHex(tx_hash);
    }
    return ["", "Failed on blockchain"];
  } catch (e) {
    console.log(e);
    return ["", e];
  }
}

async function getCredit(
  address: string,
  contractAddress: string,
  nodeUrl: string
) {
  const client = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  const contract_instance = new client.eth.Contract(abi, contractAddress);

  return contract_instance.methods
    .getCredit(client.utils.toChecksumAddress(address))
    .call();
}

async function getCertificate(
  hashStr: string,
  contractAddress: string,
  nodeUrl: string
) {
  const client = new Web3(new Web3.providers.HttpProvider(nodeUrl));
  const contract_instance = new client.eth.Contract(abi, contractAddress);
  return contract_instance.methods.getCertification(hashStr).call();
}

module.exports = {
  addCertification,
  revokeCertification,
  revokeCertificationById,
  chargeCredit,
  getCredit,
  getCertificate,
};

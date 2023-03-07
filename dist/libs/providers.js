"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletAddress = exports.sendTransaction = exports.getProvider = exports.TransactionState = void 0;
const ethers_1 = require("ethers");
const tokens_config_1 = require("../tokens.config");
// Single copies of provider and wallet
//const mainnetProvider = new ethers.providers.InfuraProvider()
const mainnetProvider = new ethers_1.ethers.providers.JsonRpcProvider(tokens_config_1.CurrentConfig.rpc.mainnet);
const wallet = createWallet();
let walletExtensionAddress = null;
// Interfaces
var TransactionState;
(function (TransactionState) {
    TransactionState["Failed"] = "Failed";
    TransactionState["New"] = "New";
    TransactionState["Rejected"] = "Rejected";
    TransactionState["Sending"] = "Sending";
    TransactionState["Sent"] = "Sent";
})(TransactionState = exports.TransactionState || (exports.TransactionState = {}));
// Provider and Wallet Functions
function getProvider() {
    return mainnetProvider;
}
exports.getProvider = getProvider;
function createWallet() {
    let provider = mainnetProvider;
    return new ethers_1.ethers.Wallet(tokens_config_1.CurrentConfig.wallet.privateKey, provider);
}
async function sendTransaction(transaction) {
    if (transaction.value) {
        transaction.value = ethers_1.BigNumber.from(transaction.value);
    }
    const txRes = await wallet.sendTransaction(transaction);
    let receipt;
    const provider = getProvider();
    if (!provider) {
        return TransactionState.Failed;
    }
    while (receipt === null) {
        try {
            receipt = await provider.getTransactionReceipt(txRes.hash);
            if (receipt === null) {
                continue;
            }
        }
        catch (e) {
            console.log(`Receipt error:`, e);
            break;
        }
    }
    // Transaction was successful if status === 1
    if (receipt) {
        return TransactionState.Sent;
    }
    else {
        return TransactionState.Failed;
    }
}
exports.sendTransaction = sendTransaction;
function getWalletAddress() {
    return wallet.address;
    //return '0x7b1312425c032b67ae33Ef290914C09463bA0f14'
}
exports.getWalletAddress = getWalletAddress;

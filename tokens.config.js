"use strict";
exports.__esModule = true;
exports.CurrentConfig = exports.Environment = void 0;
var v3_sdk_1 = require("@uniswap/v3-sdk");
var constants_1 = require("./libs/constants");
// Sets if the example should run locally or on chain
var Environment;
(function (Environment) {
    Environment[Environment["LOCAL"] = 0] = "LOCAL";
    Environment[Environment["WALLET_EXTENSION"] = 1] = "WALLET_EXTENSION";
    Environment[Environment["MAINNET"] = 2] = "MAINNET";
})(Environment = exports.Environment || (exports.Environment = {}));
// Example Configuration
exports.CurrentConfig = {
    env: Environment.LOCAL,
    rpc: {
        local: 'http://localhost:8545',
        mainnet: ''
    },
    wallet: {
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    },
    tokensETHTether: {
        token0: constants_1.WETH_TOKEN,
        token1: constants_1.TETHER_TOKEN,
        poolFee: v3_sdk_1.FeeAmount.LOW
    }
};

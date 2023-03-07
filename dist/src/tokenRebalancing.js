"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebalanceETHTether = void 0;
const balance_1 = require("../libs/balance");
const tokens_config_1 = require("../tokens.config");
const providers_1 = require("../libs/providers");
async function rebalanceETHTether() {
    const provider = (0, providers_1.getProvider)();
    const walletAddress = (0, providers_1.getWalletAddress)();
    const token0Amount = await (0, balance_1.getERC20Balance)(provider, walletAddress, tokens_config_1.CurrentConfig.tokensETHTether.token0.address);
    const token1Amount = await (0, balance_1.getERC20Balance)(provider, walletAddress, tokens_config_1.CurrentConfig.tokensETHTether.token1.address);
    console.log(token0Amount);
    console.log(token1Amount);
}
exports.rebalanceETHTether = rebalanceETHTether;
rebalanceETHTether();

"use strict";
// This file contains code to easily connect to and get information from a wallet on chain
Object.defineProperty(exports, "__esModule", { value: true });
exports.getERC20Balance = exports.getCurrencyBalance = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const conversion_1 = require("./conversion");
async function getCurrencyBalance(provider, address, currency) {
    // Handle ETH directly
    if (currency.isNative) {
        return ethers_1.ethers.utils.formatEther(await provider.getBalance(address));
    }
    // Get currency otherwise
    const currencyContract = new ethers_1.ethers.Contract(currency.address, constants_1.ERC20_ABI, provider);
    const balance = await currencyContract.balanceOf(address);
    const decimals = await currencyContract.decimals();
    // Format with proper units (approximate)
    return (0, conversion_1.toReadableAmount)(balance, decimals).toString();
}
exports.getCurrencyBalance = getCurrencyBalance;
async function getERC20Balance(provider, address, tokenAddress) {
    const currencyContract = new ethers_1.ethers.Contract(tokenAddress, constants_1.ERC20_ABI, provider);
    const balance = await currencyContract.balanceOf(address);
    return balance;
}
exports.getERC20Balance = getERC20Balance;

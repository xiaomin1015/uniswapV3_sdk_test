"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomiclabs/hardhat-waffle");
const config_1 = require("hardhat/config");
const tokenRebalancing_1 = require("../src/tokenRebalancing");
(0, config_1.task)('deploy', 'Deploy Greeter contract').setAction(async (_, hre) => {
    const Greeter = await hre.ethers.getContractFactory('Greeter');
    const greeter = await Greeter.deploy('Hello, Hardhat!');
    await greeter.deployed();
    console.log('Greeter deployed to:', greeter.address);
});
(0, config_1.task)('rebalanceTokens', 'balancing token pair for future LQ deposit').setAction(async (_, hre) => {
    (0, tokenRebalancing_1.rebalanceETHTether)();
});
(0, config_1.task)("check-balance", "Prints out the balance of your account").setAction(async function (taskArguments, hre) {
    //const account = getAccount();
    console.log(`Account balance for account.address: `);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapWETH = exports.getTokenTransferApproval = exports.executeTrade = exports.createTrade = void 0;
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const ethers_1 = require("ethers");
const jsbi_1 = __importDefault(require("jsbi"));
const constants_1 = require("./constants");
const constants_2 = require("./constants");
const pool_1 = require("./pool");
const providers_1 = require("./providers");
const utils_1 = require("./utils");
// Trading Functions
async function createTrade(amountIn, tokenIn, tokenOut, poolFee) {
    const poolInfo = await (0, pool_1.getPoolInfo)(tokenIn, tokenOut, poolFee);
    const pool = new v3_sdk_1.Pool(tokenIn, tokenOut, poolFee, poolInfo.sqrtPriceX96.toString(), poolInfo.liquidity.toString(), poolInfo.tick);
    const swapRoute = new v3_sdk_1.Route([pool], tokenIn, tokenOut);
    const amountOut = await getOutputQuote(swapRoute, amountIn, tokenIn);
    const uncheckedTrade = v3_sdk_1.Trade.createUncheckedTrade({
        route: swapRoute,
        inputAmount: sdk_core_1.CurrencyAmount.fromRawAmount(tokenIn, (0, utils_1.fromReadableAmount)(amountIn, tokenIn.decimals).toString()),
        outputAmount: sdk_core_1.CurrencyAmount.fromRawAmount(tokenOut, jsbi_1.default.BigInt(amountOut)),
        tradeType: sdk_core_1.TradeType.EXACT_INPUT,
    });
    return uncheckedTrade;
}
exports.createTrade = createTrade;
async function executeTrade(trade, tokenIn) {
    const walletAddress = (0, providers_1.getWalletAddress)();
    const provider = (0, providers_1.getProvider)();
    if (!walletAddress || !provider) {
        throw new Error('Cannot execute a trade without a connected wallet');
    }
    // Give approval to the router to spend the token
    const tokenApproval = await getTokenTransferApproval(tokenIn);
    // Fail if transfer approvals do not go through
    if (tokenApproval !== providers_1.TransactionState.Sent) {
        return providers_1.TransactionState.Failed;
    }
    const options = {
        slippageTolerance: new sdk_core_1.Percent(50, 10000),
        deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        recipient: walletAddress,
    };
    const methodParameters = v3_sdk_1.SwapRouter.swapCallParameters([trade], options);
    const tx = {
        data: methodParameters.calldata,
        to: constants_1.SWAP_ROUTER_ADDRESS,
        value: methodParameters.value,
        from: walletAddress,
        maxFeePerGas: constants_2.MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: constants_2.MAX_PRIORITY_FEE_PER_GAS,
    };
    const res = await (0, providers_1.sendTransaction)(tx);
    return res;
}
exports.executeTrade = executeTrade;
// Helper Quoting and Pool Functions
async function getOutputQuote(route, amountIn, tokenIn) {
    const provider = (0, providers_1.getProvider)();
    if (!provider) {
        throw new Error('Provider required to get pool state');
    }
    const { calldata } = await v3_sdk_1.SwapQuoter.quoteCallParameters(route, sdk_core_1.CurrencyAmount.fromRawAmount(tokenIn, (0, utils_1.fromReadableAmount)(amountIn, tokenIn.decimals).toString()), sdk_core_1.TradeType.EXACT_INPUT, {
        useQuoterV2: true,
    });
    const quoteCallReturnData = await provider.call({
        to: constants_1.QUOTER_CONTRACT_ADDRESS,
        data: calldata,
    });
    return ethers_1.ethers.utils.defaultAbiCoder.decode(['uint256'], quoteCallReturnData);
}
async function getTokenTransferApproval(token) {
    const provider = (0, providers_1.getProvider)();
    const address = (0, providers_1.getWalletAddress)();
    if (!provider || !address) {
        console.log('No Provider Found');
        return providers_1.TransactionState.Failed;
    }
    try {
        const tokenContract = new ethers_1.ethers.Contract(token.address, constants_1.ERC20_ABI, provider);
        const transaction = await tokenContract.populateTransaction.approve(constants_1.SWAP_ROUTER_ADDRESS, constants_1.TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER);
        return (0, providers_1.sendTransaction)({
            ...transaction,
            from: address,
        });
    }
    catch (e) {
        console.error(e);
        return providers_1.TransactionState.Failed;
    }
}
exports.getTokenTransferApproval = getTokenTransferApproval;
async function swapWETH(token) {
    const provider = (0, providers_1.getProvider)();
    const address = (0, providers_1.getWalletAddress)();
    if (!provider || !address) {
        console.log('No Provider Found');
        return providers_1.TransactionState.Failed;
    }
    try {
        const tokenContract = new ethers_1.ethers.Contract(token.address, constants_1.WETH_ABI, provider);
        const transaction = await tokenContract.populateTransaction.deposit(constants_1.SWAP_ROUTER_ADDRESS, constants_1.TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER);
        return (0, providers_1.sendTransaction)({
            ...transaction,
            from: address,
        });
    }
    catch (e) {
        console.error(e);
        return providers_1.TransactionState.Failed;
    }
}
exports.swapWETH = swapWETH;

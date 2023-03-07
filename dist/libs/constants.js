"use strict";
// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's
Object.defineProperty(exports, "__esModule", { value: true });
exports.WETH_ABI = exports.NONFUNGIBLE_POSITION_MANAGER_ABI = exports.ERC20_ABI = exports.TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = exports.MAX_PRIORITY_FEE_PER_GAS = exports.MAX_FEE_PER_GAS = exports.DAI_TOKEN = exports.WETH_TOKEN = exports.TETHER_TOKEN = exports.USDC_TOKEN = exports.SWAP_ROUTER_ADDRESS = exports.QUOTER_CONTRACT_ADDRESS = exports.NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS = exports.POOL_FACTORY_CONTRACT_ADDRESS = void 0;
const sdk_core_1 = require("@uniswap/sdk-core");
const ethers_1 = require("ethers");
// Addresses
exports.POOL_FACTORY_CONTRACT_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
exports.NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
exports.QUOTER_CONTRACT_ADDRESS = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e';
exports.SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
// Currencies and Tokens
exports.USDC_TOKEN = new sdk_core_1.Token(sdk_core_1.SupportedChainId.MAINNET, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USDC', 'USD//C');
exports.TETHER_TOKEN = new sdk_core_1.Token(sdk_core_1.SupportedChainId.MAINNET, '0xdac17f958d2ee523a2206206994597c13d831ec7', 6, 'USDT', 'Tether USD');
exports.WETH_TOKEN = new sdk_core_1.Token(sdk_core_1.SupportedChainId.MAINNET, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 6, 'WETH', 'Wrapped Ether');
exports.DAI_TOKEN = new sdk_core_1.Token(sdk_core_1.SupportedChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin');
// Transactions
exports.MAX_FEE_PER_GAS = '100000000000';
exports.MAX_PRIORITY_FEE_PER_GAS = '100000000000';
exports.TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = ethers_1.BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
// ABI's
exports.ERC20_ABI = [
    // Read-Only Functions
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    // Authenticated Functions
    'function transfer(address to, uint amount) returns (bool)',
    'function approve(address _spender, uint256 _value) returns (bool)',
    // Events
    'event Transfer(address indexed from, address indexed to, uint amount)',
];
exports.NONFUNGIBLE_POSITION_MANAGER_ABI = [
    // Read-Only Functions
    'function balanceOf(address _owner) view returns (uint256)',
    'function tokenOfOwnerByIndex(address _owner, uint256 _index) view returns (uint256)',
    'function tokenURI(uint256 tokenId) view returns (string memory)',
    'function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
];
exports.WETH_ABI = [
    /// @dev `msg.value` of ETH sent to this contract grants caller account a matching increase in WETH10 token balance.
    /// Emits {Transfer} event to reflect WETH10 token mint of `msg.value` from `address(0)` to caller account.
    'function deposit() external payable',
    /// @dev Burn `value` WETH10 token from caller account and withdraw matching ETH to the same.
    /// Emits {Transfer} event to reflect WETH10 token burn of `value` to `address(0)` from caller account. 
    /// Requirements:
    ///   - caller account must have at least `value` balance of WETH10 token.
    'function withdraw(uint256 value) external'
];

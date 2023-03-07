import { Token, TradeType } from '@uniswap/sdk-core';
import { Trade } from '@uniswap/v3-sdk';
import { BigNumber } from 'ethers';
export declare function fromReadableAmount(amount: number, decimals: number): BigNumber;
export declare function toReadableAmount(rawAmount: number, decimals: number): string;
export declare function displayTrade(trade: Trade<Token, Token, TradeType>): string;

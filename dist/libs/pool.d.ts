import { ethers } from 'ethers';
import { FeeAmount } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
export interface PoolInfo {
    token0: string;
    token1: string;
    fee: number;
    tickSpacing: number;
    sqrtPriceX96: ethers.BigNumber;
    liquidity: ethers.BigNumber;
    tick: number;
}
export declare function getPoolInfo(token0Info: Token, token1Info: Token, poolFee: FeeAmount): Promise<PoolInfo>;

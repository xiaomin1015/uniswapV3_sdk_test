import { Currency } from '@uniswap/sdk-core';
import { ethers } from 'ethers';
export declare function getCurrencyBalance(provider: ethers.providers.Provider, address: string, currency: Currency): Promise<string>;
export declare function getERC20Balance(provider: ethers.providers.Provider, address: string, tokenAddress: string): Promise<number>;

import { Token } from '@uniswap/sdk-core';
import { FeeAmount } from '@uniswap/v3-sdk';
export declare enum Environment {
    LOCAL = 0,
    WALLET_EXTENSION = 1,
    MAINNET = 2
}
export interface NetworkConfig {
    env: Environment;
    rpc: {
        local: string;
        mainnet: string;
    };
    wallet: {
        address: string;
        privateKey: string;
    };
    tokensETHTether: {
        token0: Token;
        token1: Token;
        poolFee: FeeAmount;
    };
}
export declare const CurrentConfig: NetworkConfig;

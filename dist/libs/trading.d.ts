import { Token, TradeType } from '@uniswap/sdk-core';
import { FeeAmount, Trade } from '@uniswap/v3-sdk';
import { TransactionState } from './providers';
export type TokenTrade = Trade<Token, Token, TradeType>;
export declare function createTrade(amountIn: number, tokenIn: Token, tokenOut: Token, poolFee: FeeAmount): Promise<TokenTrade>;
export declare function executeTrade(trade: TokenTrade, tokenIn: Token): Promise<TransactionState>;
export declare function getTokenTransferApproval(token: Token): Promise<TransactionState>;
export declare function swapWETH(token: Token): Promise<TransactionState>;

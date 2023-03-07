import { ethers } from 'ethers';
import { BaseProvider } from '@ethersproject/providers';
export declare enum TransactionState {
    Failed = "Failed",
    New = "New",
    Rejected = "Rejected",
    Sending = "Sending",
    Sent = "Sent"
}
export declare function getProvider(): BaseProvider;
export declare function sendTransaction(transaction: ethers.providers.TransactionRequest): Promise<TransactionState>;
export declare function getWalletAddress(): string;

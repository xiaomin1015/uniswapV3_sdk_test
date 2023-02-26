import{getERC20Balance} from '../libs/balance'
import{getPoolInfo} from '../libs/pool'
import{createTrade,executeTrade} from '../libs/trading'
import { Token } from '@uniswap/sdk-core'
import { CurrentConfig } from '../tokens.config'
import {
    getProvider,
    getWalletAddress,
    sendTransaction,
    TransactionState,
  } from '../libs/providers'

export async function rebalanceETHTether() {
    const provider= getProvider()
    const walletAddress = getWalletAddress()
    const token0Amount = await getERC20Balance(provider,walletAddress,CurrentConfig.tokensETHTether.token0.address)
    const token1Amount = await getERC20Balance(provider,walletAddress,CurrentConfig.tokensETHTether.token1.address)
    console.log(token0Amount)
    console.log(token1Amount)
}

rebalanceETHTether()
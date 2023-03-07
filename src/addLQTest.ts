import{getERC20Balance} from '../libs/balance'
import{getPoolInfo} from '../libs/pool'
import{createTrade,executeTrade, swapWETH,getTokenTransferApproval} from '../libs/trading'
import { Token } from '@uniswap/sdk-core'
import { CurrentConfig } from '../tokens.config'
import {
    getProvider,
    getWalletAddress,
    sendTransaction,
    TransactionState,
  } from '../libs/providers'
  import {
    FeeAmount,
  } from '@uniswap/v3-sdk'
import { DAI_TOKEN } from '../libs/constants'
import {mintPosition} from '../libs/positions'

export async function addLQTest() {
    const provider= getProvider()
    const walletAddress = getWalletAddress()
    const receipt = await swapWETH(1000)
    console.log(`Wrap ETH receipt: ${receipt}`);
    console.log()

    const token0Amount = await getERC20Balance(provider,walletAddress,CurrentConfig.tokensETHTether.token0.address)
    const token1Amount = await getERC20Balance(provider, walletAddress, CurrentConfig.tokensETHTether.token1.address)
    console.log(`before trade: ${token0Amount}`);
    console.log(`before trade: ${token1Amount}`);

    const positinID = await mintPosition(CurrentConfig.tokensETHTether.token0, CurrentConfig.tokensETHTether.token1, FeeAmount.LOW, 0.15);
    console.log(`minted positio ID: ${positinID}`);
    console.log()
    const token0Amount_LQ = await getERC20Balance(provider,walletAddress,CurrentConfig.tokensETHTether.token0.address)
    const token1Amount_LQ = await getERC20Balance(provider, walletAddress, CurrentConfig.tokensETHTether.token1.address)
    console.log(`after adding liquidity: ${token0Amount_LQ}`);
    console.log(`after adding liquidity: ${token1Amount_LQ}`);
}
addLQTest()
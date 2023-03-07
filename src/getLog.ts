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

export async function testLog() {
    const provider= getProvider()
    const walletAddress = getWalletAddress()
    const receipt = await swapWETH(1000)
    console.log(`Wrap ETH receipt: ${receipt}`);
}
testLog()
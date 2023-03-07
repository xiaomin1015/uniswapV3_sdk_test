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
import { TETHER_TOKEN, USDC_TOKEN } from '../libs/constants'
import {
    FeeAmount,
  } from '@uniswap/v3-sdk'
import { getPositionIds, getPositionInfo } from '../libs/positions'

export async function query() {
    const ALICE="0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
    const DAI="0x6b175474e89094c44da98b954eedeac495271d0f"
    const LUCKY_USER="0xad0135af20fa82e106607257143d0060a7eb5cbf"
    const USDC_ETH_Pool=0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8
    const provider= getProvider()
    const walletAddress = getWalletAddress()
    const token0Amount = await getERC20Balance(provider,ALICE,DAI)
    const token1Amount = await getERC20Balance(provider,LUCKY_USER,DAI)

    console.log(token0Amount)
    console.log(token1Amount)
}
export async function queryPool() {
    const poolinfo = await getPoolInfo(CurrentConfig.tokensETHTether.token0, CurrentConfig.tokensETHTether.token1, FeeAmount.LOW)
    console.log(`sqrtPriceX96: ${poolinfo.sqrtPriceX96.toString()}`);
    console.log(`liquidity: ${poolinfo.liquidity.toString()}`);
    console.log(`tick: ${poolinfo.tick}`);
    console.log(`tickSpacing: ${poolinfo.tickSpacing}`);
    //console.log(`token0: ${poolinfo.token0}`);
    //console.log(`token1: ${poolinfo.token1}`);
    console.log("position info: ")
    const num = await getPositionIds()
    const len = num.length
    if(len != 0) {
      for (let i = 0; i < len; i++) {
        const positionIndex = parseInt(num[i].toString());
        console.log(`positionIndex: ${positionIndex}`)
        const posi_info = await getPositionInfo(positionIndex)
        console.log(posi_info)
        //console.log(`position tickLower: ${posi_info.tickLower}`)
        //console.log(`position tickUpper: ${posi_info.tickUpper}`)
        //console.log(`position LQ: ${parseInt(posi_info.liquidity.toString())}`)
        console.log()
      }
    }
    const provider= getProvider()
    const walletAddress = getWalletAddress()
    const token0Amount = await getERC20Balance(provider,walletAddress,CurrentConfig.tokensETHTether.token0.address)
    const token1Amount = await getERC20Balance(provider, walletAddress, CurrentConfig.tokensETHTether.token1.address)
    console.log(`token0Amount: ${token0Amount}`);
    console.log(`token1Amount: ${token1Amount}`);
}

queryPool()
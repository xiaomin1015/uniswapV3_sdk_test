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



async function swapETHTether(): Promise<TransactionState>  {

  const poolinfo = await getPoolInfo(CurrentConfig.tokensETHTether.token0, CurrentConfig.tokensETHTether.token1, FeeAmount.LOW)
  console.log(`sqrtPriceX96: ${poolinfo.sqrtPriceX96.toString()}`);
  console.log(`liquidity: ${poolinfo.liquidity.toString()}`);
  console.log(`tick: ${poolinfo.tick}`);
  const poolTick = poolinfo.tick

  //const sqrtPriceUpper = sqrtprice * Math.pow((1+range), 0.5);
  //const sqrtPriceLower = sqrtprice * Math.pow((1-range), 0.5);

  const swapAmount = 50
  console.log(`going to swap in WETH amount: ${swapAmount}`);
  return swap(CurrentConfig.tokensETHTether.token0, CurrentConfig.tokensETHTether.token1, swapAmount)
  
}
async function swap(token0: Token, token1: Token, swapAmount: number) : Promise<TransactionState>{
    try {
      const uncheckedTrade = await createTrade(swapAmount, token0, token1, FeeAmount.LOW)
      const swapOutput = await executeTrade(uncheckedTrade, token0)
      console.log(`swapOutput: ${swapOutput}`);
      return swapOutput;
    } catch (e) {
      console.error(e)
      return TransactionState.Failed
    }
  }

swapETHTether()
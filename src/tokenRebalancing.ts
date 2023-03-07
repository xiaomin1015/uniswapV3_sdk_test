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

export async function rebalanceETHTether() {
    const provider= getProvider()
    const walletAddress = getWalletAddress()
    const receipt = await swapWETH(1000)
    console.log(`Wrap ETH receipt: ${receipt}`);
    console.log()

    const token0Amount = await getERC20Balance(provider,walletAddress,CurrentConfig.tokensETHTether.token0.address)
    const token1Amount = await getERC20Balance(provider, walletAddress, CurrentConfig.tokensETHTether.token1.address)
    console.log(`before trade: ${token0Amount}`);
    console.log(`before trade: ${token1Amount}`);

    await rebalancing(token0Amount, token1Amount, 0.15)
    console.log()
    const token0AmountA = await getERC20Balance(provider,walletAddress,CurrentConfig.tokensETHTether.token0.address)
    const token1AmountA = await getERC20Balance(provider, walletAddress, CurrentConfig.tokensETHTether.token1.address)
    console.log(`after trade: ${token0AmountA}`);
    console.log(`after trade: ${token1AmountA}`);
    console.log()
    const positinID = await mintPosition(CurrentConfig.tokensETHTether.token0, CurrentConfig.tokensETHTether.token1, FeeAmount.LOW, 0.15);
    console.log(`minted positio ID: ${positinID}`);
    console.log()
    const token0Amount_LQ = await getERC20Balance(provider,walletAddress,CurrentConfig.tokensETHTether.token0.address)
    const token1Amount_LQ = await getERC20Balance(provider, walletAddress, CurrentConfig.tokensETHTether.token1.address)
    console.log(`after adding liquidity: ${token0Amount_LQ}`);
    console.log(`after adding liquidity: ${token1Amount_LQ}`);
}
async function rebalancing( amount0: number, amount1: number, range: number): Promise<TransactionState>  {
  const poolinfo = await getPoolInfo(CurrentConfig.tokensETHTether.token0, CurrentConfig.tokensETHTether.token1, FeeAmount.LOW)
  const poolTick = poolinfo.tick
  const poolPrice =tickToPrice(poolTick);
  const sqrtprice = Math.pow(poolPrice, 0.5);
  console.log(`pool price: ${poolPrice}`);
  const sqrtPriceUpper = sqrtprice * Math.pow((1+range), 0.5);
  const sqrtPriceLower = sqrtprice * Math.pow((1-range), 0.5);

  const swap0for1 = amount0 * poolPrice - amount1 > 0;
  const constant = (1/sqrtprice - 1/sqrtPriceUpper)/(sqrtprice - sqrtPriceLower);

  if(swap0for1) {
    const swap0 = (amount0 - amount1*constant)/(1+constant*poolPrice*(1-FeeAmount.LOW/100000));
    const swapAmount = Math.round(swap0*Math.pow(10, -18));
    console.log(`going to swap in WETH amount: ${swapAmount}`);
    return swap(CurrentConfig.tokensETHTether.token0, CurrentConfig.tokensETHTether.token1, swapAmount)
  } else{
    const swap1= -(amount0 - amount1*constant)/(constant + (1-FeeAmount.LOW/100000)/poolPrice);
    const swapAmount = Math.round(swap1*Math.pow(10, -6));
    console.log(`going to swap in TETHER amount: ${swapAmount}`);
    return swap(CurrentConfig.tokensETHTether.token1, CurrentConfig.tokensETHTether.token0, swapAmount)
  }
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
export function tickToPrice(tick: number):number {
  return Math.pow(1.0001, tick);
}
rebalanceETHTether()


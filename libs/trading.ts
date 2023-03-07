import {
  Currency,
  CurrencyAmount,
  Percent,
  Token,
  TradeType,
} from '@uniswap/sdk-core'
import {
  FeeAmount,
  Pool,
  Route,
  SwapOptions,
  SwapQuoter,
  SwapRouter,
  Trade,
} from '@uniswap/v3-sdk'
import { ethers } from 'ethers'
import JSBI from 'jsbi'

import { CurrentConfig } from '../tokens.config'
import {
  ERC20_ABI,
  QUOTER_CONTRACT_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER,
  WETH_ABI,
  WETH_TOKEN,
} from './constants'
import { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } from './constants'
import { getPoolInfo } from './pool'
import {
  getProvider,
  getWalletAddress,
  sendTransaction,
  TransactionState,
} from './providers'
import { fromReadableAmount } from './utils'

export type TokenTrade = Trade<Token, Token, TradeType>

// Trading Functions

export async function createTrade(amountIn:number, tokenIn:Token, tokenOut:Token, poolFee: FeeAmount): Promise<TokenTrade> {
  const poolInfo = await getPoolInfo(tokenIn,tokenOut,poolFee)

  const pool = new Pool(
    tokenIn,
    tokenOut,
    poolFee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  )

  const swapRoute = new Route(
    [pool],
    tokenIn,
    tokenOut
  )

  const amountOut = await getOutputQuote(swapRoute,amountIn,tokenIn)
  console.log(`quote amountOut: ${amountOut}`)
  const uncheckedTrade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      tokenIn,
      fromReadableAmount(
        amountIn,
        tokenIn.decimals
      ).toString()
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      tokenOut,
      JSBI.BigInt(amountOut)
    ),
    tradeType: TradeType.EXACT_INPUT,
  })

  return uncheckedTrade
}

export async function executeTrade(
  trade: TokenTrade,
  tokenIn: Token
): Promise<TransactionState> {
  const walletAddress = getWalletAddress()
  const provider = getProvider()

  if (!walletAddress || !provider) {
    throw new Error('Cannot execute a trade without a connected wallet')
  }
  // Give approval to the router to spend the token
  const tokenApproval0 = await getTokenTransferApproval(tokenIn)
  //const tokenApproval1 = await getTokenTransferApproval(CurrentConfig.tokensETHTether.token1)
  console.log(`Give approval to the router result: ${tokenApproval0}`)
  
  // Fail if transfer approvals do not go through
  if (tokenApproval0 !== TransactionState.Sent ) {
    return TransactionState.Failed
  }
  

  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: walletAddress,
  }

  const methodParameters = SwapRouter.swapCallParameters([trade], options)

  const tx = {
    data: methodParameters.calldata,
    to: SWAP_ROUTER_ADDRESS,
    value: methodParameters.value,
    from: walletAddress,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    gasLimit: 9999999
  }

  const res = await sendTransaction(tx)
  console.log(`swap tx result: ${res}`)
  return res
}

// Helper Quoting and Pool Functions

async function getOutputQuote(route: Route<Currency, Currency>, amountIn: number, tokenIn: Token) {
  const provider = getProvider()

  if (!provider) {
    throw new Error('Provider required to get pool state')
  }

  const { calldata } = await SwapQuoter.quoteCallParameters(
    route,
    CurrencyAmount.fromRawAmount(
      tokenIn,
      fromReadableAmount(
        amountIn,
        tokenIn.decimals
      ).toString()
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    }
  )

  const quoteCallReturnData = await provider.call({
    to: QUOTER_CONTRACT_ADDRESS,
    data: calldata,
  })

  return ethers.utils.defaultAbiCoder.decode(['uint256'], quoteCallReturnData)
}

export async function getTokenTransferApproval(
  token: Token
): Promise<TransactionState> {
  const provider = getProvider()
  const address = getWalletAddress()
  if (!provider || !address) {
    console.log('No Provider Found')
    return TransactionState.Failed
  }

  try {
    const tokenContract = new ethers.Contract(
      token.address,
      ERC20_ABI,
      provider
    )

    const transaction = await tokenContract.populateTransaction.approve(
      SWAP_ROUTER_ADDRESS,
      TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
    )

    return sendTransaction({
      ...transaction,
      from: address
    })
  } catch (e) {
    console.error(e)
    return TransactionState.Failed
  }
}

export async function swapWETH(
  ethAmount: number
): Promise<TransactionState> {
  const provider = getProvider()
  const address = getWalletAddress()
  if (!provider || !address) {
    console.log('No Provider Found')
    return TransactionState.Failed
  }
  const ethIn = ethers.utils.parseUnits(ethAmount.toString(),"ether")

  try {
    const tokenContract = new ethers.Contract(
      WETH_TOKEN.address,
      WETH_ABI,
      provider
    )

    const transaction = await tokenContract.populateTransaction.deposit()
    const receiptOfsendETH = await sendTransaction({
      ...transaction,
      from: address,
      to : WETH_TOKEN.address,
      value: ethIn,
    })
    return receiptOfsendETH
  } catch (e) {
    console.error()
    console.log("fail in sending ETH")
    return TransactionState.Failed
  }
}

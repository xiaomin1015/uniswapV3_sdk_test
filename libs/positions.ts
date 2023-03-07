import {CollectOptions,RemoveLiquidityOptions} from '@uniswap/v3-sdk'
import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import {
  MintOptions,
  nearestUsableTick,
  NonfungiblePositionManager,
  Pool,
  Position,
  FeeAmount
} from '@uniswap/v3-sdk'
import { BigNumber, ethers } from 'ethers'
import {
  ERC20_ABI,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  NONFUNGIBLE_POSITION_MANAGER_ABI,
  NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
} from './constants'
import { TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER } from './constants'
import { fromReadableAmount } from './conversion'
import { getPoolInfo,PoolInfo} from './pool'
import {
  getProvider,
  sendTransaction,
  TransactionState,
  getWalletAddress,
  sendTransactionAddLQ,
} from './providers'
import{ getCurrencyBalance,getERC20Balance} from './balance'
import JSBI from 'jsbi'
export interface PositionInfo {
  tickLower: number
  tickUpper: number
  liquidity: BigNumber
  feeGrowthInside0LastX128: BigNumber
  feeGrowthInside1LastX128: BigNumber
  tokensOwed0: BigNumber
  tokensOwed1: BigNumber
}
function tickToPrice(tick: number):number {
  return Math.pow(1.0001, tick);
}
function sqrtPriceToTick(sqrtPrice: number):number {
  const tick =  Math.round(2*Math.log(sqrtPrice) / Math.log(1.0001))
  const remainder = tick % 10;
  return tick-remainder
}
export async function mintPosition(token0: Token,token1: Token, poolFee: FeeAmount, range:number): Promise<number> {
  const address = getWalletAddress()
  const provider = getProvider()
  if (!address || !provider) {
    return -1
  }

  // Give approval to the contract to transfer tokens
  const tokenInApproval = await getTokenTransferApproval(token0)
  const tokenOutApproval = await getTokenTransferApproval(token1)

  // Fail if transfer approvals do not go through
  if (
    tokenInApproval !== TransactionState.Sent ||
    tokenOutApproval !== TransactionState.Sent
  ) {
    return -1
  }
  //@@@
  const token0Amount = await getERC20Balance(provider,address,token0.address)
  const token1Amount = await getERC20Balance(provider,address,token1.address)
  const poolInfo = await getPoolInfo(token0,token1,poolFee)   
  
  const positionToMint = await constructPosition(
    CurrencyAmount.fromRawAmount(
      token0,
      JSBI.BigInt(token0Amount)
    ),
    CurrencyAmount.fromRawAmount(
      token1,
      JSBI.BigInt(token1Amount)
    ),
    poolInfo,
    range
  )
  console.log(`positionToMint liquidity: ${positionToMint.liquidity}`)
  console.log(`positionToMint tickLower: ${positionToMint.tickLower}`)
  console.log(`positionToMint tickUpper: ${positionToMint.tickUpper}`)
  console.log(`positionToMint tickCurrent: ${positionToMint.pool.tickCurrent}`)
  console.log(`positionToMint liquidity total(before add LQ): ${positionToMint.pool.liquidity}`)

  const mintOptions: MintOptions = {
    recipient: address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    slippageTolerance: new Percent(50, 10_000),
  }

  // get calldata for minting a position
  const { calldata, value } = NonfungiblePositionManager.addCallParameters(
    positionToMint,
    mintOptions
  )

  // build transaction
  const tx = {
    data: calldata,
    to: NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    value: value,
    from: address,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    gasLimit: 9999999
  }

  const res = await sendTransactionAddLQ(tx)
  return res
}

export async function constructPosition(
  token0Amount: CurrencyAmount<Token>,
  token1Amount: CurrencyAmount<Token>,
  poolInfo: PoolInfo,
  range: number
): Promise<Position> {
  // get pool info

  // construct pool instance
  const configuredPool = new Pool(
    token0Amount.currency,
    token1Amount.currency,
    poolInfo.fee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  )
  const poolTick = poolInfo.tick
  const poolPrice = tickToPrice(poolTick);
  const sqrtprice = Math.pow(poolPrice, 0.5);
  const sqrtPriceUpper = sqrtprice * Math.pow((1+range), 0.5);
  const sqrtPriceLower = sqrtprice * Math.pow((1-range), 0.5);
  const tickUpper = sqrtPriceToTick(sqrtPriceUpper);
  const tickLower = sqrtPriceToTick(sqrtPriceLower);
  //const tickLower = sqrtPriceToTick(sqrtprice) -10;

  // create position using the maximum liquidity from input amounts
  //amount0: JSBI.BigInt(token0Amount),
  //amount1: token1Amount.quotient,
  console.log(`token0Amount to depsit: ${token0Amount.quotient}`)
  console.log(`token1Amount to depsit: ${token1Amount.quotient}`)
  return Position.fromAmounts({
    pool: configuredPool,
    tickLower: tickLower,
    tickUpper: tickUpper,
    amount0: token0Amount.quotient,
    amount1: token1Amount.quotient,
    useFullPrecision: true,
  })
}

export async function getPositionIds(): Promise<number[]> {
  const provider = getProvider()
  const address = getWalletAddress()
  if (!provider || !address) {
    throw new Error('No provider available')
  }

  const positionContract = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    NONFUNGIBLE_POSITION_MANAGER_ABI,
    provider
  )

  // Get number of positions
  const balance: number = await positionContract.balanceOf(address)

  // Get all positions
  const tokenIds : number[]= []
  for (let i = 0; i < balance; i++) {
    const tokenOfOwnerByIndex: number =
      await positionContract.tokenOfOwnerByIndex(address, i)
    tokenIds.push(tokenOfOwnerByIndex)
  }

  return tokenIds
}

export async function getPositionInfo(tokenId: number): Promise<PositionInfo> {
  const provider = getProvider()
  if (!provider) {
    throw new Error('No provider available')
  }

  const positionContract = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    NONFUNGIBLE_POSITION_MANAGER_ABI,
    provider
  )

  const position = await positionContract.positions(tokenId)

  return {
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
    feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
    tokensOwed0: position.tokensOwed0,
    tokensOwed1: position.tokensOwed1,
  }
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
      NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
      TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
    )
    return sendTransaction({
      ...transaction,
      from: address,
      gasLimit: 9999999
    })
  } catch (e) {
    console.error(e)
    return TransactionState.Failed
  }
}

export async function removeLiquidity(token0: Token, token1: Token, poolFee: FeeAmount,
  positionId: number
): Promise<TransactionState> {
  const address = getWalletAddress()
  const provider = getProvider()
  if (!address || !provider) {
    return TransactionState.Failed
  }
  //const token0Amount = await getERC20Balance(provider,address,token0.address)
  //const token1Amount = await getERC20Balance(provider,address,token1.address)
  //console.log(`token0Amount: ${token0Amount}`)
  //console.log(`token1Amount: ${token1Amount}`)
  const poolInfo = await getPoolInfo(token0,token1,poolFee)   
  
  const currentPosition = await constructPositionForRedeem(
    CurrencyAmount.fromRawAmount(
      token0,
      JSBI.BigInt(0)
    ),
    CurrencyAmount.fromRawAmount(
      token1,
      JSBI.BigInt(0)
    ),
    poolInfo,
    positionId
  )
  
  console.log(`liquidity to redeem: ${currentPosition.liquidity}`)
  const collectOptions: Omit<CollectOptions, 'tokenId'> = {
    expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
      token0,
      0
    ),
    expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
      token1,
      0
    ),
    recipient: address,
  }

  const fractionToRemove = 1;
  const removeLiquidityOptions: RemoveLiquidityOptions = {
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    slippageTolerance: new Percent(50, 100),
    tokenId: positionId,
    // percentage of liquidity to remove
    liquidityPercentage: new Percent(fractionToRemove),
    collectOptions,
  }

  // get calldata for minting a position
  const { calldata, value } = NonfungiblePositionManager.removeCallParameters(
    currentPosition,
    removeLiquidityOptions
  )
  console.log(calldata)
  // build transaction
  const tx = {
    data: calldata,
    to: NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    value: value,
    from: address,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    gasLimit: 9999999
  }
  const res = await sendTransaction(tx)
  return res
}

async function constructPositionForRedeem(
  token0Amount: CurrencyAmount<Token>,
  token1Amount: CurrencyAmount<Token>,
  poolInfo: PoolInfo,
  positionIndex: number
): Promise<Position> {

  // construct pool instance
  const configuredPool = new Pool(
    token0Amount.currency,
    token1Amount.currency,
    poolInfo.fee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  )
  const posi_info = await getPositionInfo(positionIndex)
  const tickLower = posi_info.tickLower
  const tickUpper = posi_info.tickUpper
  console.log(posi_info.liquidity.toString());
  const LQ = JSBI.BigInt(posi_info.liquidity.toString())
  console.log(LQ);
  const LQ_1 = JSBI.subtract(LQ,JSBI.BigInt(1))
  console.log(LQ_1);

  const psitinArg = {pool: configuredPool, liquidity: LQ, tickLower: tickLower, tickUpper: tickUpper}
  return new Position(psitinArg)
}
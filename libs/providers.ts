import { ethers, providers, BigNumber } from 'ethers'
import { Environment, CurrentConfig } from '../tokens.config'
import { BaseProvider } from '@ethersproject/providers'

// Single copies of provider and wallet
//const mainnetProvider = new ethers.providers.InfuraProvider()
const mainnetProvider = new ethers.providers.JsonRpcProvider(
  CurrentConfig.rpc.mainnet
)
const wallet = createWallet()
let walletExtensionAddress: string | null = null

// Interfaces

export enum TransactionState {
  Failed = 'Failed',
  New = 'New',
  Rejected = 'Rejected',
  Sending = 'Sending',
  Sent = 'Sent',
}

// Provider and Wallet Functions

export function getProvider(): BaseProvider {
  return mainnetProvider
}

function createWallet(): ethers.Wallet {
  let provider = mainnetProvider
  return new ethers.Wallet(CurrentConfig.wallet.privateKey, provider)
}

export async function sendTransaction(
  transaction: ethers.providers.TransactionRequest
): Promise<TransactionState> {
  if (transaction.value) {
    transaction.value = BigNumber.from(transaction.value)
  }
  const txRes = await wallet.sendTransaction(transaction)

  let receipt
  const provider = getProvider()
  if (!provider) {
    return TransactionState.Failed
  }
  while (receipt === undefined || receipt === null) {
    try {
      receipt = await provider.getTransactionReceipt(txRes.hash)
      
    } catch (e) {
      console.log(`Receipt error:`, e)
      break
    }
  }
  
  // Transaction was successful if status === 1
  if (receipt) {
    console.log(`!!!!!!!!!!!!getting receipt at: ${receipt.blockNumber}`);
    /*
    const logs = receipt.logs
    const lenofLogs = logs.length
    if(lenofLogs != 0) {
      for (let i = 0; i < lenofLogs; i++) {
        console.log(`${i} data : ${parseInt(logs[i].data.toString())}`)
        console.log(`${i} address : ${logs[i].address}`)
        const topic = logs[i].topics
        const lenofTopics = topic.length
        if(lenofTopics == 0) {
          continue
        }
        for (let j = 0; j < lenofTopics; j++) {
          const topicInfo = topic[j];
          console.log(` ${j} topic: ${topicInfo}`)
        }
        console.log();
      }
    }
    */
    return TransactionState.Sent
  } else {
    console.log(`no receipt yet, tx hash is: ${txRes.hash}`);
    return TransactionState.Failed
  }
}

export function getWalletAddress(): string{
  return wallet.address
  //return '0x7b1312425c032b67ae33Ef290914C09463bA0f14'
}

export async function sendTransactionAddLQ(
  transaction: ethers.providers.TransactionRequest
): Promise<number> {
  if (transaction.value) {
    transaction.value = BigNumber.from(transaction.value)
  }
  const txRes = await wallet.sendTransaction(transaction)
  //console.log(txRes);
  let receipt
  const provider = getProvider()
  if (!provider) {
    return -1
  }
  while (receipt === undefined || receipt === null) {
    try {
      receipt = await provider.getTransactionReceipt(txRes.hash)
      
    } catch (e) {
      console.log(`Receipt error:`, e)
      break
    }
  }
  
  // Transaction was successful if status === 1
  if (receipt) {
    console.log(`!!!!!!!!!!!!getting receipt at: ${receipt.blockNumber}`);
    const logs = receipt.logs
    const lenofLogs = logs.length
    
    if(lenofLogs != 0) {
      for (let i = 0; i < lenofLogs; i++) {
        const topic = logs[i].topics
        const lenofTopics = topic.length
        if(lenofTopics == 0) {
          continue
        }
        if(topic[0] == "0x3067048beee31b25b2f1681f88dac838c8bba36af25bfb2b7cf7473a5847e35f"){
          return parseInt(topic[1].toString())
        }
      }
    }
    
    return 1
  } else {
    console.log(`no receipt yet, tx hash is: ${txRes.hash}`);
    return -1
  }
}
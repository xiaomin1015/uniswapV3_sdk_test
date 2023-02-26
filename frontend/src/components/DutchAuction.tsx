import { useWeb3React } from '@web3-react/core';
import { BigNumber, Contract, ethers,Signer } from 'ethers';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import styled from 'styled-components';
import DutchAuctionArtifact from '../artifacts/contracts/DutchAuction.sol/DutchAuction.json';
import { Provider } from '../utils/provider';
import { SectionDivider } from './SectionDivider';

const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 3rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;
const StyledGreetingDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 135px 2.7fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledAuctionDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 135px 2.7fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledLabelUnit = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
`;

const StyledInputBid = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
  width: 200px;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;



export function DutchAuction(): ReactElement {
  const context = useWeb3React<Provider>();

  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [auctionContract, setAuctionContract] = useState<Contract>();
  const [auctionContractAddr,setAuctionContractAddr] = useState<string>('');
  const [auctionWinnerAddr,setAuctionWinnerAddr] = useState<string>('');
  const [auctionOwnerAddr,setAuctionOwnerAddr] = useState<string>('');
  const [auctionJudgeAddr,setAuctionJudgeAddr] = useState<string>();
  const [auctionIsOpen, setAuctionIsOpen] =  useState<string>();
  const [auctionIsFinalized, setAuctionIsFinalized] =  useState<string>();
  const [auctionCurrentPrice,setAuctionCurrentPrice] = useState<number>();
  const [auctionBid,setAuctionBid] = useState<number>();
  const [auctionReservePrice,setAuctionReservePrice] = useState<number>();
  const [relocatedAuctionAddr,setRelocatedAuctionAddr] = useState<string>('');
  const [reservePrice,setReservePrice] = useState<number>();
  const [judgeAddress,setJudgeAddress] = useState<string>('0x0000000000000000000000000000000000000000');
  const [biddingTimePeriod,setBiddingTimePeriod] = useState<number>();
  const [offerPriceDecrement,setOfferPriceDecrement] = useState<number>();

  const addressNull = '0x0000000000000000000000000000000000000000';

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

 

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (!signer) {
      return;
    }
    if(context.account == judgeAddress)
    {
      window.alert('Contract owner can not be the judge');
      return;
    }
    

    async function deployAuctionContract(signer: Signer): Promise<void> {
      const Auction = new ethers.ContractFactory(
        DutchAuctionArtifact.abi,
        DutchAuctionArtifact.bytecode,
        signer
      );

      try {
        
        const auctionContract = await Auction.deploy(reservePrice,judgeAddress,biddingTimePeriod,offerPriceDecrement);
        await auctionContract.deployed();
        window.alert(`Auction deployed to: ${auctionContract.address}`);
        setAuctionContract(auctionContract);
        setAuctionContractAddr(auctionContract.address);
        setBasicInfo(auctionContract);
        
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    deployAuctionContract(signer);
  }

  function handleInputBid(event: ChangeEvent<HTMLInputElement>): void{
    event.preventDefault();
    setAuctionBid(Number(event.target.value));
  
  }
  function handleInputContractAddr(event: ChangeEvent<HTMLInputElement>): void{
    event.preventDefault();
    setRelocatedAuctionAddr(event.target.value);
  }
  function handleAuctionChange (event: MouseEvent<HTMLButtonElement>): void{
    event.preventDefault();
    async function callContract(): Promise<void> {
      const auctionContract =  new ethers.Contract(
        relocatedAuctionAddr,
        DutchAuctionArtifact.abi,
        signer
      );
      try{
        const receipt = await auctionContract.getBasicInfo();
      }catch{
        window.alert('It\'s not a valid Auction Contract ')
        return;
      }
      
      setAuctionContract(auctionContract);
      setAuctionContractAddr(auctionContract.address);
      setBasicInfo(auctionContract);
    }
    callContract();
  }

  async function setBasicInfo(auctionContract : Contract): Promise<void> {
    try{
      const receipt = await auctionContract.getBasicInfo();
      var auctionOpenedVar = receipt[0];
      var currentPriceVar = Number(receipt[1]._hex);
      var winnerAddrVar = receipt[2];
      console.log(receipt[2]);
      var reservePriceVar = Number(receipt[3]._hex);
      var judgeAddrVar = receipt[4];
      var ownerAddrVar = receipt[5];
      var auctionFinalizeVar = receipt[6];

      if(auctionOpenedVar){
        setAuctionIsOpen('true');
      }
      else
      {
        setAuctionIsOpen('false');
      }
      if(auctionFinalizeVar){
        setAuctionIsFinalized('true');
      }
      else
      {
        setAuctionIsFinalized('false');
      }

      setAuctionCurrentPrice(currentPriceVar);
      setAuctionWinnerAddr(winnerAddrVar);
      setAuctionReservePrice(reservePriceVar);
      setAuctionJudgeAddr(judgeAddrVar);
      setAuctionOwnerAddr(ownerAddrVar);
     
    }catch (error: any) {
      window.alert(
        'Error!' + (error && error.message ? `\n\n${error.message}` : '')
      );
    }
  }
  
  function handleCurrentPriceUpdate(event: MouseEvent<HTMLButtonElement>):void{

    event.preventDefault();

    if (!auctionContract) {
      window.alert('Undefined auctionContract');
      return;
    }
    setBasicInfo(auctionContract);

  }
  function handleAuctionFinalize(event : MouseEvent<HTMLButtonElement>):void{
    event.preventDefault();
    if (!auctionContract) {
      window.alert('Undefined auctionContract');
      return;
    }

    async function finalize(auctionContract:Contract):Promise<void> {
          const receipt = await auctionContract.finalize();
          await receipt.wait();
          window.alert(`Finalize Successfully : ${context.account}`);
          setBasicInfo(auctionContract);
    }
    finalize(auctionContract);
  }

  function handleAuctionBidSubmit(event : MouseEvent<HTMLButtonElement>):void{
    event.preventDefault();
    if (!auctionContract) {
      window.alert('Undefined auctionContract');
      return;
    }
    

    async function submitBid(auctionContract:Contract): Promise<void>{
      try{

        if(!auctionBid){
          window.alert('invalid bid');
          return;
        }
        var convertedAuctionBid = ethers.utils.parseUnits(auctionBid.toString(),"szabo");
        
        const options = {value: convertedAuctionBid,gasPrice: ethers.utils.parseUnits("100", "gwei"),
        gasLimit: "99000"};
        const receipt =  await auctionContract.bid(options);
        await receipt.wait();
        window.alert(`Bid Successfully submitted: ${auctionContract.address}`);
        setBasicInfo(auctionContract);
      }catch {
        window.alert('bid fail reverted');
      }
      
    }
    submitBid(auctionContract);
  }
  function handleAuctionSetting(event: ChangeEvent<HTMLInputElement>):void{
    event.preventDefault();
    switch(event.target.id){
      case "reservePrice" :{
        setReservePrice(Number(event.target.value));
        break;
      }
      case "judgeAddress" :{
        setJudgeAddress(event.target.value);
        break;
      }
      case "biddingTimePeriod" :{
        setBiddingTimePeriod(Number(event.target.value));
        break;
      }
      case "offerPriceDecrement" :{
        setOfferPriceDecrement(Number(event.target.value));
        break;
      }
      default:{
        break;
      }
    }
  }
  return (
    <>
    <StyledGreetingDiv>
       <StyledLabel htmlFor="reservePrice">Reserve price(Unit szabo)</StyledLabel>
        <StyledInput
          id="reservePrice"
          type="text"
          placeholder={ ''}
          onChange={handleAuctionSetting}
        ></StyledInput>
        <div></div>
        <StyledLabel htmlFor="judgeAddress">Judge address </StyledLabel>
        <StyledInput
          id="judgeAddress"
          type="text"
          placeholder={ ''}
          onChange={handleAuctionSetting}
        ></StyledInput>
        <div></div>
        <StyledLabel htmlFor="biddingTimePeriod">Bidding TimePeriod</StyledLabel>
        <StyledInput
          id="biddingTimePeriod"
          type="text"
          placeholder={ ''}
          onChange={handleAuctionSetting}
        ></StyledInput>
        <div></div>
        <StyledLabel htmlFor="offerPriceDecrement">Offer PriceDecrement</StyledLabel>
        <StyledInput
          id="offerPriceDecrement"
          type="text"
          placeholder={ ''}
          onChange={handleAuctionSetting}
        ></StyledInput>
        <StyledDeployContractButton
          style={{
            cursor: !active ? 'not-allowed' : 'pointer',
            borderColor: !active ? 'unset' : 'green'
          }}
          onClick={handleDeployContract}
        >
        Deploy DutchAution Contract</StyledDeployContractButton>
    </StyledGreetingDiv>
    <SectionDivider />
      <StyledAuctionDiv>
        <StyledLabel>Contract addr</StyledLabel>
        <div>
          {auctionContractAddr ? (
            auctionContractAddr
          ) : (
            <em>{`<Contract hasn't located>`}</em>
          )}
        </div>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        <StyledLabel>Auction open</StyledLabel>
        <div>
          {auctionIsOpen ? auctionIsOpen : <em>{`<Contract hasn't located>`}</em>}
        </div>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        
        <StyledLabel>Winner Address</StyledLabel>
          {auctionWinnerAddr != addressNull && auctionWinnerAddr? (
            auctionWinnerAddr
          ) : (
            !auctionWinnerAddr?
            (<em>{`<Contract hasn't located>`}</em>)
            :
            (<em>{`<Contract hasn't had a winner>`}</em>)
          )}
          <div></div>
          <StyledLabel>Reserve Price</StyledLabel>
          {auctionReservePrice ? (
            auctionReservePrice
          ) : (
            <em>{`<Contract hasn't located>`}</em>
          )}
           <div></div>
        <StyledLabel>Current Price</StyledLabel>
          {auctionCurrentPrice ? (
            auctionCurrentPrice
          ) : (
            <em>{`<Contract hasn't located>`}</em>
          )}
        <StyledButton
          disabled={!active ? true : false || auctionContractAddr.length==0 ? true : false}
          style={{
            cursor: !active ? 'not-allowed' : 'pointer',
            borderColor: !active ? 'unset' : 'brown'
          }}
          onClick={handleCurrentPriceUpdate}
        >
          Update
        </StyledButton>
        
        <StyledLabel htmlFor="bidInput">initial bid(Unit szabo)</StyledLabel>
        <StyledInputBid
          id="bidInput"
          type="text"
          placeholder={''}
          onChange={handleInputBid}
        ></StyledInputBid>
        <StyledButton
          disabled={!active ? true : false 
            || auctionContractAddr.length==0 ? true : false 
            || context.account == auctionOwnerAddr ? true : false 
            ||context.account == auctionJudgeAddr ? true : false
            || auctionIsOpen == 'false' ? true : false
          }
          
          style={{
            cursor: !active ? 'not-allowed' : 'pointer',
            borderColor: !active  ? 'unset' : 'blue'
          }}
          onClick={handleAuctionBidSubmit}
        >
          Submit
        </StyledButton>
        <StyledLabel>Judege Address</StyledLabel>
          {auctionJudgeAddr != addressNull && auctionJudgeAddr? (
            auctionJudgeAddr
          ) : (
            !auctionJudgeAddr?
            (<em>{`<Contract hasn't located>`}</em>)
            :
            (<em>{`<Judge isn't invoked>`}</em>)
          )}
          <div></div>
        <StyledLabel>Finalized</StyledLabel>
          {
            auctionIsFinalized ? (
            auctionIsFinalized
          ) : (
            <em>{`<Contract hasn't located>`}</em>
          )
          }
        <StyledButton
          disabled={!active ? true : false 
            || auctionContractAddr.length==0 ? true : false 
            || (context.account != auctionJudgeAddr && context.account != auctionWinnerAddr ? true : false) 
            || auctionIsFinalized == 'true' ? true : false
            || auctionWinnerAddr == addressNull ? true : false
            || auctionJudgeAddr == addressNull ? true : false
          }
          
          style={{
            cursor: !active ? 'not-allowed' : 'pointer',
            borderColor: 'red'
          }}
          onClick={handleAuctionFinalize}
        >
          Finalize
        </StyledButton>
        <StyledLabel htmlFor="bidInput">relocate auction contract</StyledLabel>
        <StyledInput
          id="bidInput"
          type="text"
          placeholder={''}
          onChange={handleInputContractAddr}
        ></StyledInput>
        <StyledButton
          disabled={!active ? true : false || auctionContractAddr.length==0 ? true : false}
          style={{
            cursor: !active ? 'not-allowed' : 'pointer',
            borderColor: !active  ? 'unset' : 'yellow'
          }}
          onClick={handleAuctionChange}
        >
          Relocate
        </StyledButton>
      </StyledAuctionDiv>
    </>
  );
}

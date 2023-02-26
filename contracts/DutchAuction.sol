// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;


contract DutchAuction {

    uint256 public reservePrice;
    address public judgeAddress;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;

    address private ownerAddr;
    uint256 public initialBlockNum;
    uint256 public initialPrice;
    address public winnerAddr;
    uint256 public winnerBid;

    bool public bidLocked;
    bool public itemOnSale;
    bool public refundIssued;
    bool public judgeFinalizeOrRefund;   
    bool public finalized;
    bool public refunded;

     constructor  (uint256 _reservePrice, address _judgeAddress, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement){
        //accept customized auction info
        reservePrice = _reservePrice;
        judgeAddress = _judgeAddress;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement =_offerPriceDecrement;
        //initialize contract
        ownerAddr = msg.sender;
        initialBlockNum = block.number;
        initialPrice = _reservePrice + _numBlocksAuctionOpen*_offerPriceDecrement;
        winnerAddr = address(0);
        winnerBid = 0;

        itemOnSale = true;
        bidLocked = false;
        refundIssued = false;
        judgeFinalizeOrRefund = false;
        finalized = false;
        refunded = false;
    }

    //make sure bid() caller is Ethereum externally-owned account 
    modifier onlyEOAs(address _msgSender){
        uint len;
        assembly{
            len := extcodesize(_msgSender)
        }
        require(len==0);
        _;
    }

    //make sure refund() caller is the Judge
    modifier onlyJudge(){
        require(judgeAddress != address(0),"refund() failed, no judge invoked");
        require(msg.sender == judgeAddress,"refund() failed, caller is not a judge");
        _;
    }
    
    //prevent neither Judge nor winner address from calling finalize()
    modifier onlyJudgeOrWinner(){
        require(judgeAddress != address(0),"Finalize failed, no judge invoked");
        require(winnerAddr != address(0),"Finalize failed, winning bid hasn't made");
        require(msg.sender == judgeAddress || msg.sender == winnerAddr,"Finalized failed, uncertified address can't finalize this auction");
        _;
    }

    //prevent re-entry attack
    modifier noReentrancy(){
        require(!bidLocked,"re-entrancy occured");
        bidLocked = true;
        _;
        bidLocked =false;
    }

    //make sure refund() available
    modifier onlyRefundAvailable(){
        require(!finalized,"refund() no available, auction already finalized");
        require(!refunded, "refund() no available, refund already issued");
        require(winnerAddr != address(0),"refund() no available, winning bid hasn't made");
        _;
    }

    //make sure finalize() available
    modifier onlyfinalizeAvailable(){
        require(!finalized,"finalize() no available, auction already finalized");
        require(!refunded, "finalize() no available, refund already issued");
        _;
    }
    
    function bid() public payable  onlyEOAs(msg.sender) returns(address) {
        require(itemOnSale,"Item sold");
        uint256 currentPrice = initialPrice - offerPriceDecrement*(block.number-initialBlockNum);
        require(currentPrice>reservePrice,"DutchAuction closed");
        require((msg.value/1000000000000)>=currentPrice,"bid fail");

        if(judgeAddress==address(0)){
            (bool success, ) = ownerAddr.call{value :msg.value}("");
            require(success,"seller doesn't get the eth, revert");
            winnerAddr = msg.sender;
        }
        else{
            winnerAddr = msg.sender;
            winnerBid = msg.value;
        }

        itemOnSale = false;
        return(msg.sender);
    }

    function finalize() public onlyJudgeOrWinner onlyfinalizeAvailable{
        (bool success,) = ownerAddr.call{value: winnerBid}("");
        require(success,"finalize failed, seller doesn't receive eth, revert");
        finalized = true;
    }

    function refund(uint256 refundAmount) public onlyJudge onlyRefundAvailable{
        require(msg.sender != winnerAddr,"refund failed, judge can't send eth to himself");
        (bool success,) = winnerAddr.call{value : refundAmount}("");
        require(success,"refund failed, winner doesn't get the eth");
        refunded = true;
    }

    function getBasicInfo() public view returns(bool,uint256,address,uint256,address,address,bool){
        uint256 currentPrice = initialPrice - offerPriceDecrement*(block.number-initialBlockNum);
        bool auctionOpened = currentPrice>reservePrice;
        bool auctionAvailable = false;
        if(itemOnSale&&!finalized&&!refunded&&auctionOpened){
            auctionAvailable = true;
        }
       
        return(auctionAvailable,currentPrice,winnerAddr,reservePrice,judgeAddress,ownerAddr,finalized);
    }
    
        
    //for testing framework
    function nop() public returns(bool) {
        return true;
    }
}

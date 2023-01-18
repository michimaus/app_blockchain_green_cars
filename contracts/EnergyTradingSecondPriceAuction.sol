// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract EvChargingMarket {
    enum ContractState {
        NotCreated,
        Created,
        HasOffer,
        Established,
        ReadyForPayement,
        ReportNotOk,
        Closed
    }
    enum AuctionState {
        Created,
        Closed,
        RevealEnd
    }

    struct Payment {
        uint256 bidId;
        uint256 date;
        uint256 energyAmount;
        bool toPay; //or toReceive
        uint256 total;
    }

    struct SealedBid {
        address bidder;
        bytes32 bid;
    }

    struct Account {
        // User account
        int256 balance;
        Payment[] payments;
        bool isUser;
    }

    struct Auction {
        uint256 nbBid;
        // SealedBid[] bids;
        mapping(address => SealedBid) bids;
        AuctionState state;
    }

    struct Contract {
        address buyer; // EV address
        address seller; // Winner EP address
        uint256 amount;
        uint256 buyerMaxPrice;
        uint256 currentPrice;
        uint256 secondLowestPrice;
        bool buyerMeterReport;
        bool sellerMeterReport;
        uint256 deliveryTime;
        uint256 auctionTimeOut;
        uint256 deliveryLocation;
        ContractState state;
    }

    modifier auctionNotClosed(uint256 _aucId) {
        require(auctions[_aucId].state == AuctionState.Created);
        _;
    }

    modifier auctionClosed(uint256 _aucId) {
        require(auctions[_aucId].state == AuctionState.Closed);
        _;
    }

    modifier revealNotEnded(uint256 _aucId) {
        require(auctions[_aucId].state != AuctionState.RevealEnd);
        _;
    }

    modifier auctionExisit(uint256 _aucId) {
        require(contracts[_aucId].state != ContractState.NotCreated);
        _;
    }

    modifier auctionTimeOut(uint256 _aucId) {
        require(contracts[_aucId].auctionTimeOut > block.timestamp);
        _;
    }

    modifier contractEstablished(uint256 _aucId) {
        require(contracts[_aucId].state == ContractState.Established);
        _;
    }

    modifier reportsOk(uint256 _aucId) {
        require(contracts[_aucId].sellerMeterReport);
        require(contracts[_aucId].buyerMeterReport);
        _;
    }

    modifier buyerOnly(uint256 _aucId) {
        require(contracts[_aucId].buyer == msg.sender);
        _;
    }

    modifier sellerOnly(uint256 _aucId) {
        require(contracts[_aucId].seller == msg.sender);
        _;
    }

    modifier accountExist(address _user) {
        require(accounts[_user].isUser);
        _;
    }

    uint256 public totalAuction;

    mapping(uint256 => Contract) public contracts;
    mapping(uint256 => Auction) auctions;
    mapping(address => Account) public accounts;

    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    event LogReqCreated(
        address indexed buyer,
        uint256 _aucId,
        uint256 _maxPrice,
        uint256 _amount,
        uint256 _time,
        uint256 _auctionTime,
        uint256 _location
    );
    event LowestBidDecreased(
        address _seller,
        uint256 _aucId,
        uint256 _price,
        uint256 _amount
    );
    event FirstOfferAccepted(
        address _seller,
        uint256 _aucId,
        uint256 _price,
        uint256 _amount
    );
    event ContractEstablished(uint256 _aucId, address _buyer, address _seller);
    event ReportOk(uint256 _aucId);
    event ReportNotOk(uint256 _aucId);
    event SealedBidReceived(
        address seller,
        uint256 _aucId,
        bytes32 _sealedBid,
        uint256 _bidId
    );
    event BidNotCorrectelyRevealed(
        address bidder,
        uint256 _price,
        bytes32 _sealedBid
    );
    event ActionClosed(uint256 indexed _aucId);
    event EndReveal(uint256 indexed _aucId, address indexed winner);

    function createReq(
        uint256 _amount,
        uint256 _price,
        uint256 _time,
        uint256 _auctionTime,
        uint256 _location
    ) public {
        uint256 aucId = totalAuction++;
        storeAndLogNewReq(
            msg.sender,
            aucId,
            _amount,
            _price,
            _time,
            _auctionTime,
            _location
        );
    }

    function makeSealedOffer(uint256 _aucId, bytes32 _sealedBid)
        public
        auctionExisit(_aucId)
        auctionNotClosed(_aucId)
        revealNotEnded(_aucId)
    {
        auctions[_aucId].bids[msg.sender] = SealedBid(msg.sender, _sealedBid);
        uint256 bidId = auctions[_aucId].nbBid;
        auctions[_aucId].nbBid = auctions[_aucId].nbBid++;
        emit SealedBidReceived(msg.sender, _aucId, _sealedBid, bidId);
    }

    function closeAuction(uint256 _aucId)
        public
        auctionExisit(_aucId)
        buyerOnly(_aucId)
    //to do: conractNotEstablished(_aucId)
    //auctionTimeOut(_aucId)
    {
        auctions[_aucId].state = AuctionState.Closed;
        emit ActionClosed(_aucId);
    }

    function endReveal(uint256 _aucId)
        public
        auctionExisit(_aucId)
        buyerOnly(_aucId)
    //to do: conractNotEstablished(_aucId)
    //auctionTimeOut(_aucId)
    {
        auctions[_aucId].state = AuctionState.RevealEnd;
        contracts[_aucId].state = ContractState.Established;
        emit EndReveal(_aucId, contracts[_aucId].seller);
    }

    function revealOffer(uint256 _aucId, uint256 _price)
        public
        auctionExisit(_aucId)
        auctionClosed(_aucId)
        revealNotEnded(_aucId)
    {
        if (
            auctions[_aucId].bids[msg.sender].bid !=
            keccak256(abi.encodePacked(_price))
        ) {
            emit BidNotCorrectelyRevealed(
                msg.sender,
                _price,
                keccak256(abi.encodePacked(_price))
            );
            return;
        }
        if (contracts[_aucId].state == ContractState.HasOffer) {
            if (_price < contracts[_aucId].currentPrice) {
                contracts[_aucId].secondLowestPrice = contracts[_aucId]
                    .currentPrice;
                contracts[_aucId].currentPrice = _price;
                contracts[_aucId].seller = msg.sender;
                emit LowestBidDecreased(msg.sender, _aucId, _price, 0);
            } else {
                if (_price < contracts[_aucId].secondLowestPrice) {
                    contracts[_aucId].secondLowestPrice = _price;
                }
            }
        } else {
            require(_price <= contracts[_aucId].buyerMaxPrice);
            contracts[_aucId].currentPrice = _price;
            contracts[_aucId].secondLowestPrice = _price;
            contracts[_aucId].seller = msg.sender;
            contracts[_aucId].state = ContractState.HasOffer;
            emit FirstOfferAccepted(msg.sender, _aucId, _price, 0);
        }
    }

    function setBuyerMeterReport(uint256 _aucId, bool _state)
        public
        auctionExisit(_aucId)
        contractEstablished(_aucId)
    {
        if (!_state) {
            emit ReportNotOk(_aucId);
        }
        contracts[_aucId].buyerMeterReport = _state;
        if (contracts[_aucId].sellerMeterReport) {
            updateBalance(
                _aucId,
                contracts[_aucId].buyer,
                contracts[_aucId].seller
            );
            emit ReportOk(_aucId);
        }
    }

    function setSellerMeterReport(uint256 _aucId, bool _state)
        public
        auctionExisit(_aucId)
        contractEstablished(_aucId)
    {
        if (!_state) {
            emit ReportNotOk(_aucId);
        }
        contracts[_aucId].sellerMeterReport = _state;
        if (contracts[_aucId].buyerMeterReport) {
            updateBalance(
                _aucId,
                contracts[_aucId].buyer,
                contracts[_aucId].seller
            );
            emit ReportOk(_aucId);
        }
    }

    function updateBalance(
        uint256 _aucId,
        address _buyer,
        address _seller
    ) public reportsOk(_aucId) {
        uint256 date = contracts[_aucId].deliveryTime;
        uint256 amount = contracts[_aucId].amount;
        uint256 amounToPay = amount * contracts[_aucId].secondLowestPrice;
        accounts[_buyer].payments.push(
            Payment(_aucId, date, amount, true, amounToPay)
        );
        accounts[_buyer].balance -= int256(amounToPay);
        accounts[_seller].payments.push(
            Payment(_aucId, date, amount, false, amounToPay)
        );
        accounts[_seller].balance += int256(amounToPay);
        contracts[_aucId].state = ContractState.Closed;
    }

    function registerNewUser(address _user) public {
        accounts[_user].isUser = true;
    }

    function getReq(uint256 _index) public view returns (ContractState) {
        return (contracts[_index].state);
    }

    function getContract(uint256 _index) public view returns (Contract memory) {
        return contracts[_index];
    }

    function getContractWinner(uint256 _aucId)
        public
        view
        returns (address, uint256)
    {
        return (contracts[_aucId].seller, contracts[_aucId].currentPrice);
    }

    function getNumberOfReq()
        public
        view
        returns (
            address[] memory,
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        uint256 count = 0;
        for (uint256 i = 0; i < totalAuction; i++) {
            if (auctions[i].state != AuctionState.RevealEnd) {
                count++;
            }
        }

        address[] memory returnBuyer = new address[](count);
        uint256[] memory returnPrice = new uint256[](count);
        uint256[] memory returnAmount = new uint256[](count);
        uint256[] memory returnAucID = new uint256[](count);

        uint256 j = 0;
        for (uint256 i = 0; i < totalAuction; i++) {
            if (auctions[i].state != AuctionState.RevealEnd) {
                returnBuyer[j] = contracts[i].buyer;
                returnPrice[j] = contracts[i].buyerMaxPrice;
                returnAmount[j] = contracts[i].amount;
                returnAucID[j] = i;
                j++;
            }
        }

        return (returnBuyer, returnPrice, returnAmount, returnAucID);
    }

    function storeAndLogNewReq(
        address _buyer,
        uint256 _id,
        uint256 _amount,
        uint256 _price,
        uint256 _time,
        uint256 _auctionTime,
        uint256 _location
    ) private {
        contracts[_id].buyer = _buyer;
        contracts[_id].amount = _amount;
        contracts[_id].buyerMaxPrice = _price;
        contracts[_id].deliveryTime = _time;
        contracts[_id].auctionTimeOut = block.timestamp + _auctionTime;
        contracts[_id].deliveryLocation = _location;
        contracts[_id].state = ContractState.Created;
        auctions[_id].state = AuctionState.Created;
        auctions[_id].nbBid = 0;
        emit LogReqCreated(
            _buyer,
            _id,
            _price,
            _amount,
            _time,
            _auctionTime,
            _location
        );
    }
}

import contract_abi from "../blockchain/abi/EvChargingMarket.json"

const abi = contract_abi.abi;

const tradingContract = web3 => {
    return new web3.eth.Contract(abi, "0xc00fE9a0DBE760332a96Cc4CFa62FD6523E42E0e")
}

export default tradingContract
import contract_abi from "../blockchain/abi/EvChargingMarket.json"

const abi = contract_abi.abi;

const tradingContract = web3 => {
    return new web3.eth.Contract(abi, "0x9d81A7edbF98e3A30EfCc8a6f68c916af5Fd0F3e")
}

export default tradingContract

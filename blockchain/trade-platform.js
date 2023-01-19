import contract_abi from "../blockchain/abi/EvChargingMarket.json"

const abi = contract_abi.abi;

const tradingContract = web3 => {
    // return new web3.eth.Contract(abi, "0x9d81A7edbF98e3A30EfCc8a6f68c916af5Fd0F3e")
    // return new web3.eth.Contract(abi, "0x12b9778fCf0e75c817D23a38815B8Bd173D7177b")
    // return new web3.eth.Contract(abi, "0xDF926Ec90508287d273Bd2F0EbE7a34CEB377274")


    // return new web3.eth.Contract(abi, "0x34B7d6158A042381fB9914a23481dB616e2c260D")

    // The ganache contract on our environment
    return new web3.eth.Contract(abi, "0x389280a8081363ce578539f7C4Ee0476E8A0Cd3B")



    // return new web3.eth.Contract(abi, "0x9Ecd58495785c9EfCa98652a406B25B89b95b2da")
}

export default tradingContract

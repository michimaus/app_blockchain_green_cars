const EnergyTradingSecondPriceAuction = artifacts.require("EvChargingMarket");

module.exports = function (deployer) {
    deployer.deploy(EnergyTradingSecondPriceAuction);
};

const EtherArena = artifacts.require("EtherArena");
const AstralAnima = artifacts.require("AstralAnima")


module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(EtherArena, AstralAnima.address);
    etherArena = await EtherArena.deployed()
    
  };
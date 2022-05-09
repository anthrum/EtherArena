const EtherArena = artifacts.require("EtherArena");
const AstralAnima = artifacts.require("AstralAnima")

module.exports = function(deployer) {
  deployer.deploy(EtherArena, AstralAnima.address);
};
const Journey = artifacts.require("Journey")
const AstralAnima = artifacts.require("AstralAnima");

module.exports = function(deployer) {
  deployer.deploy(AstralAnima, "0x0eA7deADAfD6726244A541fae7954F3b0405e1Ad");
};

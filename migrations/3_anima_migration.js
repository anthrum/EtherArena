const Journey = artifacts.require("Journey")
const AstralAnima = artifacts.require("AstralAnima");



module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(AstralAnima, accounts[0]);
  astralAnima = await AstralAnima.deployed()
  
  // 2nd account mints 6 animae, 3rd mints 7 animae
  for( let i = 1; i < 3; i++) {
    await astralAnima.multiMint(i + 5, {value: (i + 5)*155000000000000000, from: accounts[i]})
  } 

// 4th, 5th, 6th mint a single anima
  for ( let i = 3; i<8; i++) {
    await astralAnima.mintPublic({value: 155000000000000000, from: accounts[i]})
  } 
};



/*  ______________________________________________________________
   | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |  \\ \\  | ACCOUNTS  |
   ----------------------------------------------------------------
   | 0 | 6 | 7 | 1 | 1 | 1 | 1 | 1 | 0 | 0  |  //  // | ANIMAE    |
   
*/
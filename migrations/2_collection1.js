const Collection1 = artifacts.require("Collection1");


module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Collection1);
  collection1 = await Collection1.deployed()
  // 1st to 5th accounts minted 1 from collection 1
  for ( let i = 0; i<6; i++) {
    await collection1.mintPublic({value: 155000000000000000, from: accounts[i]})
  } 
};



/*  _______________________________________________________________
   | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | \\ \\  | ACCOUNTS   |
   ----------------------------------------------------------------
   | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0  | // //  |COLLECTION 1|
*/
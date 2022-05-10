const Collection2 = artifacts.require("Collection2");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(Collection2);
    collection2 = await Collection2.deployed()
    
    // from 3rd to last mint 1 from collection 2
    for ( let i = 2; i<9; i++) {
        await collection2.mintPublic({value: 155000000000000000, from: accounts[i]})
    } 
  };

  /*  ____________________________________________________________
   | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | \  \ |  ACCOUNTS   |
   ---------------------------------------------------------------
   | 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 0  | /  / | COLLECTION 2|
  */
const EtherArena = artifacts.require("EtherArena");
const AstralAnima = artifacts.require("AstralAnima")
const Collection1 = artifacts.require("Collection1")
const Collection2 = artifacts.require("Collection2")
module.exports = async function(network) {
    
    
        /////////////// ANIMAE STAKING ////////////////////
    console.log("----------//////////////// ANIMAE STAKING //////////////----------")
    console.log("")
    let expectedSupply = 9

    let accounts = await web3.eth.getAccounts();
    etherArena = await EtherArena.deployed()
    astralAnima = await AstralAnima.deployed()
    
    // The large holders stake 2 Animae each
    await astralAnima.approve(etherArena.address, 1, { from: accounts[1]})
    await astralAnima.approve(etherArena.address, 6, { from: accounts[1]})
    await etherArena.stake([1, 6], {from: accounts[1]})
    console.log("SUCCESS: account 1 staked animae 1 and 6")

    await astralAnima.approve(etherArena.address, 7, {from: accounts[2]})
    await astralAnima.approve(etherArena.address, 13, {from: accounts[2]})
    await etherArena.stake([7, 13], { from: accounts[2]})
    console.log(`SUCCESS: account 2 staked animae 7 and 13`)

    // Other Animae holders stake one each
    for ( let i = 3; i<8; i++) {
        await astralAnima.approve(etherArena.address, i + 11, {from: accounts[i]})
        await etherArena.stake([i + 11], { from: accounts[i]})
        console.log(`SUCCESS: account ${i} staked anima ${i + 11}`)
    } 
    let arenaSupply = await etherArena.totalSupply()
    if (arenaSupply == expectedSupply) { console.log(`SUCCESS: EtherArena has ${expectedSupply} staked Animae`)}
    else {console.log(`FAIL: staked Animae are ${arenaSupply} while expected supply is ${expectedSupply}`)}
    console.log("")
    //////////////// ANIMAE SELECTING CHAMPION //////////////
    console.log("----------//////////////// ANIMAE SELECTING CHAMPION //////////////----------")
    console.log("")
    let stakedAnimae = [1,6,7,13,14,15,16,17,18]
    collection1 = await Collection1.deployed()
    collection2 = await Collection2.deployed()
    let a1 = await collection1.address
    let a2 = await collection2.address
    let availableChampions = {a1 : [1,2,3,4,5],  a2 : [1,2,3,4,5,6,7]}
    let invited = {}
    

    // account 1 invites a champion from collection 1 and ID 1 with Anima 1 and a champion from collection 2 and ID 1 with anima 6
    await etherArena.inviteChamp(stakedAnimae[0], a1 , 1,{from: accounts[1]})
    invited[stakedAnimae[0]] = availableChampions.a1[0]
    console.log(`Anima ${stakedAnimae[0]} has invited ID ${invited[stakedAnimae[0]]} of collection ${a1}`)
    let map111 = (await etherArena.animaToChampStruct([stakedAnimae[0]])).champID
    
    
    if(map111 == invited[stakedAnimae[0]]){
        console.log(`SUCCESS: Anima ${stakedAnimae[0]} => champStruct mapping matches`)
    }
    else{
        console.log(`FAILURE: mapping doesn't match --- champID = ${map111}`)
    }
    console.log("..................................................................................")
    await etherArena.inviteChamp(stakedAnimae[1], a2 , 1,{from: accounts[1]})
    invited[stakedAnimae[1]] = availableChampions.a2[0]
    console.log(`Anima ${stakedAnimae[1]} has invited ID ${invited[stakedAnimae[1]]} of collection ${a2}`)
    let map621 = (await etherArena.animaToChampStruct(stakedAnimae[1])).champID
    
    if(map621 == invited[stakedAnimae[1]]){
        console.log(`SUCCESS: Anima ${stakedAnimae[1]} => champStruct mapping matches`)
    }
    else{
        console.log(`FAILURE: mapping doesn't match --- champID = ${map621}`)
    }
    console.log("..................................................................................")
    // account 2 invites champ from collection 2 and ID 2 with Anima 7
    await etherArena.inviteChamp(stakedAnimae[2], a2 , 2,{from: accounts[2]})
    invited[stakedAnimae[2]] = availableChampions.a2[1]
    console.log(`Anima ${stakedAnimae[2]} has invited ID ${invited[stakedAnimae[2]]} of collection ${a2}`)
    let map722 = (await etherArena.animaToChampStruct(stakedAnimae[2])).champID
    if(map722 == invited[stakedAnimae[2]]){
        console.log(`SUCCESS: Anima ${stakedAnimae[2]} => champStruct mapping matches`)
    }
    else{
        console.log(`FAILURE: mapping doesn't match --- champID = ${map722}`)
    }
    console.log("..................................................................................")


    // THIS IS TERRIBLE. MAKE IT CLEAN AND UNDERSTANDABLE WHEN NOT SLEEP DEPRIVED
    for (i=4; i < 7; i++){  // last 2 Animae holders excluded from inviting from collecion 1 (account 7 and 8)
        let mapp;
        await etherArena.inviteChamp(stakedAnimae[i], a1 , i-2,{from: accounts[i-1]})
        invited[stakedAnimae[i]] = availableChampions.a1[i-3]
        console.log(`Anima ${stakedAnimae[i]} has invited ID ${invited[stakedAnimae[i]]} of collection ${a1}`)
        mapp = (await etherArena.animaToChampStruct(stakedAnimae[i])).champID
        if(mapp == invited[stakedAnimae[i]]){
            console.log(`SUCCESS: Anima ${stakedAnimae[i]} => champStruct mapping matches`)
        }
        else{
            console.log(`FAILURE: mapping doesn't match --- champID = ${mapp}`)
        }
        console.log("..................................................................................") 
    }

    //////////////// CHAMPION GENERAL TESTING //////////////
    console.log("----------//////////////// CHAMPION GENERAL TESTING //////////////----------")
    console.log("")
    console.log("Testing battle correct initiation")
    // testing that invited champion can't attack given that less than 1 day has passed since their invitation
    await etherArena.initiateBattleWith(1, 2, {from: accounts[0]})
    if((await etherArena.animaToChampStruct(1)).inBattleWith ==  2){
        console.log(`SUCCESS: Battle status of initiator updated correctly`)
    }else{
        console.log(`FAILURE: Battle status of initiator updated incorrectly`)
    }
    if((await etherArena.animaToChampStruct(2)).inBattleWith ==  1){
        console.log(`SUCCESS: Battle status of challanged updated correctly`)
    }else{
        console.log(`FAILURE: Battle status of challanged updated correctly`)
    }
    console.log("Testing battle incorrect initiation")
    console.log("------------- testing when battle initiation function is used by someone other than the owner -------------")
    
    try{
        await etherArena.initiateBattleWith(12, 14, {from: accounts[3]})
        console.log(`FAILED FAILURE: Battle status of initiator updated correctly`)
    }catch{
        console.log(`FAILED SUCCESFULLY: Battle status of initiator updated incorrectly`)
    }

  };
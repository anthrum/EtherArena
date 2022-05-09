// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

/******************************************************************************\

/******************************************************************************/

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EtherArena is ERC721Holder, ReentrancyGuard, Ownable, Pausable {

    /* ========== STATE VARIABLES ========== */

    IERC721 public stakingToken;
    uint256 public periodFinish = 0;
    uint256 public lastUpdateTime;


  /* ========== STRUCTS ========== */

    struct champion {
        address champCollection;
        uint256 champID;
        uint256 lastAction; //time 

        uint256 inBattleWith;
        int256 hp;     // may use metadata
        uint256 astralBlessings;  // may use metadata
    }
    uint256 public totalSupply;

    // Mappings 
    mapping(address => uint256) public balances;
    mapping(uint256 => address) public stakedAssets;

    // Added Mappings 
    mapping(uint256 => uint256) public animaToLastInvite;
    mapping(uint256 => uint256) public animaToLastBlessing;
    mapping(address => mapping(uint256 => uint256)) public championsToAnima;

    // struct mappings
    mapping(uint256 => champion) public animaToChampStruct;

    
    constructor(address _stakingToken) {
        stakingToken = IERC721(_stakingToken);
    }

   
    

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Stakes user's NFTs
    /// @param tokenIds The tokenIds of the NFTs which will be staked
    function stake(uint256[] memory tokenIds) external nonReentrant {
        require(tokenIds.length != 0, "Staking: No tokenIds provided");

        uint256 amount;
        for (uint256 i = 0; i < tokenIds.length; i += 1) {
            // Transfer user's NFTs to the staking contract
            stakingToken.safeTransferFrom(msg.sender, address(this), tokenIds[i]);
            // Increment the amount which will be staked
            amount += 1;
            // Save who is the staker/depositor of the token
            stakedAssets[tokenIds[i]] = msg.sender;
        }
        _stake(amount);
        emit Staked(msg.sender, amount, tokenIds);
    }

    /// @notice Withdraws staked user's NFTs
    /// @param tokenIds The tokenIds of the NFTs which will be withdrawn
    function withdraw(uint256[] memory tokenIds) public {
        require(tokenIds.length != 0, "Staking: No tokenIds provided");

        uint256 amount;
        for (uint256 i = 0; i < tokenIds.length; i += 1) {
            // Check if the user who withdraws is the owner
            require(
                stakedAssets[tokenIds[i]] == msg.sender,
                "Staking: Not the staker of the token"
            );
            // Transfer NFTs back to the owner
            stakingToken.safeTransferFrom(address(this), msg.sender, tokenIds[i]);
            // Increment the amount which will be withdrawn
            amount += 1;
            // Cleanup stakedAssets for the current tokenId
            stakedAssets[tokenIds[i]] = address(0);

            // Cleanup Champions for the current tokenId
            delete animaToChampStruct[tokenIds[i]];
            
        }
        _withdraw(amount);

        emit Withdrawn(msg.sender, amount, tokenIds);
    }


    function exit(uint256[] memory tokenIds) external {
        withdraw(tokenIds);
    }

    function _stake(uint256 _amount) internal {
        totalSupply += _amount;
        balances[msg.sender] += _amount;
    }

    function _withdraw(uint256 _amount) internal {
        totalSupply -= _amount;
        balances[msg.sender] -= _amount;
    }


    function inviteChamp(uint256 _tokenId, address _champCollection, uint256 _champId ) public {
        require(stakedAssets[_tokenId] == msg.sender,"Staking: Not the staker of the Anima");
        require(block.timestamp - animaToLastInvite[_tokenId] > 1 weeks, "Must wait for next invite");

        // updating mappings 
        animaToLastInvite[_tokenId] = block.timestamp;
        animaToChampStruct[_tokenId] = champion(_champCollection, _champId, block.timestamp, 0, 100, 1); // this is fine as long as the anima has 1 champ at a time
        championsToAnima[_champCollection][_champId] = _tokenId;
    }

    // This function may require Oraclize or Chainlink
    function blessChamp(uint256 _tokenId, uint256 _targetId) public { 
        require(stakedAssets[_tokenId] == msg.sender,"Staking: Not the staker of the Anima");
        require(block.timestamp - animaToLastBlessing[_tokenId] > 1 days, "Must wait for next blessing");
        require(stakedAssets[_tokenId] != address(0), "The Anima selected is not staked");
        animaToLastBlessing[_tokenId] = block.timestamp;
        animaToChampStruct[_targetId].astralBlessings += 1; // This will later depend on the Anima's metadata.

    }


    // Testing performing action without staking NFT
    function initiateBattleWith(uint256 _sponsoringAnima, uint256 _targetAnima) public { 
        require(
            IERC721(
                animaToChampStruct[_sponsoringAnima].champCollection)  // using ERC721 interface of champ's collection
                .ownerOf( animaToChampStruct[_sponsoringAnima].champID) == msg.sender,  // checking msg sender against owner of champ ID
            "You are not in possession of selected champion"
        );
        require(animaToChampStruct[_targetAnima].inBattleWith == 0, "Target is in battle");
        require(animaToChampStruct[_sponsoringAnima].inBattleWith == 0, "You're already in a battle");

        // change battle state
        animaToChampStruct[_targetAnima].inBattleWith = _sponsoringAnima;
        animaToChampStruct[_sponsoringAnima].inBattleWith = _targetAnima;
        // update last action of champions so that 
        animaToChampStruct[_sponsoringAnima].lastAction = block.timestamp;
        animaToChampStruct[_targetAnima].lastAction = block.timestamp;
        
        
        emit BattleInitiates(
            _sponsoringAnima,
            _targetAnima // champ's id
            );
    }


    function attack(uint256 _sponsoringAnima, uint256 _targetAnima) public {
        require(
            IERC721(
                animaToChampStruct[_sponsoringAnima].champCollection)  // using ERC721 interface of champ's collection
                .ownerOf( animaToChampStruct[_sponsoringAnima].champID) == msg.sender,  // checking msg sender against owner of champ ID
            "You are not in possession of selected champion"
        );
        // require that Anima is in battle
        require(animaToChampStruct[_targetAnima].inBattleWith != 0, "You're not in a battle"); 

        /* insert random component with if{} else{} to calculate compute variation of animaToChampStruct[].hp 
                        with animaToChampStruct[].astralBlessings as a parameter */

        // once hp calculation is finneshed, check hp. If hp goes below zero --> delete animaToChampStruct[losingAnimaID] 
        // perform eventual compensatory action towards champion and (maybe) Sponsoring Anima
        // consider having win-loss count an updating that
    }

    /* ========== EVENTS ========== */

    event Staked(address indexed user, uint256 amount, uint256[] tokenIds);
    event Withdrawn(address indexed user, uint256 amount, uint256[] tokenIds);
    event InviteChamp(uint256 tokenId, address champCollection, uint256 champID);
    event BattleInitiates(uint256 challenger, uint256 challenged);

}
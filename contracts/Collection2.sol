// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


contract Collection2 is ERC721Enumerable, ReentrancyGuard, Ownable {
    string public baseURI;


    
    string public PROVENANCE = "";
    uint256 public lastId = 0;
    uint256 public maxSupply = 10000;
    uint256 public publicPrice = 150000000000000000; //0.15 ETH
    

    constructor() ERC721("Collection2", "COL2") {}

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function deposit() public payable onlyOwner {}


    function setPublicPrice(uint256 _newPrice) public onlyOwner {
        publicPrice = _newPrice;
    }

    function setMaxSupply(uint256 _newMax) public onlyOwner {
        maxSupply = _newMax;
    }

    function setLastId(uint256 _newLastId) public onlyOwner {
        lastId = _newLastId;
    }

     function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

     function setProvenance(string memory _prov) public onlyOwner {
        PROVENANCE = _prov;
    }


    function mintPublic() public payable nonReentrant {
        require(lastId < maxSupply, "Anima: Max Supply reached");
        require(msg.value >= publicPrice, "Anima: Value < price");
        _safeMint(msg.sender, lastId + 1);

        lastId++;
    }

    function multiMint(uint256 _amount) public payable nonReentrant {
        require((maxSupply - lastId) >= _amount, "Anima: Max Supply reached");
        require(msg.value >= (publicPrice * _amount), "Anima: Value < price");
        
        for (uint256 i=0; i<_amount; i++) {
            _safeMint(msg.sender, lastId + 1 + i);
        }

        lastId+=_amount;
    }

    function mintTo(address _receiver, uint256 _tokenId) public onlyOwner {
        _safeMint(_receiver, _tokenId);
    }
}
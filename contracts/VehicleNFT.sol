// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VehicleNFT
 * @dev ERC721 NFT contract to mint vehicles as NFTs.
 * Only the contract owner (usually admin or VehicleRegistry) can mint.
 */
contract VehicleNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => string) public vehicleVIN; // tokenId → VIN

    constructor() ERC721("VehicleNFT", "VNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint a new vehicle NFT with VIN.
     * @param to Address receiving the NFT.
     * @param vin Vehicle Identification Number.
     */
    function mint(address to, string memory vin) external onlyOwner {
        _safeMint(to, nextTokenId);
        vehicleVIN[nextTokenId] = vin;
        nextTokenId++;
    }
}


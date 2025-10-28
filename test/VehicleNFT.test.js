const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VehicleNFT Contract", function () {
  let VehicleNFT;
  let nft;
  let owner;
  let other;

  /**
   * Deploy a fresh instance of the VehicleNFT contract before each test.
   * The deployer will act as the contract owner.
   */
  beforeEach(async function () {
    [owner, other] = await ethers.getSigners(); // Get test accounts
    VehicleNFT = await ethers.getContractFactory("VehicleNFT");
    nft = await VehicleNFT.connect(owner).deploy(); // Deploy contract as owner
    await nft.waitForDeployment();
  });

  /**
   * Test Case: Minting a new vehicle NFT
   * - Ensures that the NFT is minted to the correct address.
   * - Confirms that the VIN is properly stored and linked to the token.
   */
  it("should mint a new NFT and store VIN", async function () {
    await nft.connect(owner).mint(owner.address, "VIN123");

    // Verify token ownership and VIN mapping
    expect(await nft.ownerOf(0)).to.equal(owner.address);
    expect(await nft.vehicleVIN(0)).to.equal("VIN123");
  });

  /**
   * Test Case: Token ID auto-increments correctly
   * - Mints two tokens and checks that the nextTokenId is incremented.
   */
  it("should increment tokenId after each mint", async function () {
    await nft.connect(owner).mint(owner.address, "VIN1");
    await nft.connect(owner).mint(owner.address, "VIN2");

    // Expect the next token ID to be 2 after two successful mints
    expect(await nft.nextTokenId()).to.equal(2);
  });

  /**
   * Test Case: Only contract owner can mint NFTs
   * - Ensures access control is enforced by reverting unauthorized minting attempts.
   */
  it("should not allow non-owners to mint", async function () {
    await expect(
      nft.connect(other).mint(other.address, "NONOWNER123")
    ).to.be.reverted;
  });
});

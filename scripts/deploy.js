// Import built-in Node.js modules for filesystem and path handling
const fs = require("fs");
const path = require("path");

// Main deployment function
async function main() {
  // Retrieve the deployer's wallet (first account from Hardhat node)
  const [deployer] = await hre.ethers.getSigners();

  // Compile and deploy the VehicleNFT contract
  const VehicleNFT = await hre.ethers.getContractFactory("VehicleNFT");
  const nft = await VehicleNFT.deploy();
  await nft.waitForDeployment();

  // Compile and deploy the VehicleRegistry contract, passing the NFT contract address
  const VehicleRegistry = await hre.ethers.getContractFactory("VehicleRegistry");
  const registry = await VehicleRegistry.deploy(nft.target);
  await registry.waitForDeployment();

  // Transfer ownership of the NFT contract to the registry for minting control
  await nft.transferOwnership(registry.target);

  // Read compiled artifact (ABI) of VehicleRegistry
  const artifact = await hre.artifacts.readArtifact("VehicleRegistry");

  // Prepare the path to save contract data for frontend use
  const frontendPath = path.join(__dirname, "../frontend/constants");
  fs.mkdirSync(frontendPath, { recursive: true });

  // Save ABI for contract interaction in frontend
  fs.writeFileSync(`${frontendPath}/VehicleRegistryABI.json`, JSON.stringify(artifact.abi, null, 2));

  // Save deployed contract address for frontend use
  fs.writeFileSync(`${frontendPath}/VehicleRegistryAddress.json`, JSON.stringify({ address: registry.target }, null, 2));

  console.log("✅ Deployed and exported ABI/address");
}

// Run the deployment script and handle errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});

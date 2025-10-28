const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VehicleNFT & VehicleRegistry Integration", function () {
  let VehicleNFT, VehicleRegistry;
  let nft, registry;
  let owner, user1, user2;

  /**
   * Deploy both VehicleNFT and VehicleRegistry contracts before each test.
   * Transfer ownership of the NFT contract to the registry for minting control.
   */
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy VehicleNFT contract
    const VehicleNFTFactory = await ethers.getContractFactory("VehicleNFT");
    nft = await VehicleNFTFactory.deploy();
    await nft.waitForDeployment();

    // Deploy VehicleRegistry contract with reference to VehicleNFT
    const VehicleRegistryFactory = await ethers.getContractFactory("VehicleRegistry");
    registry = await VehicleRegistryFactory.deploy(nft.target);
    await registry.waitForDeployment();

    // Grant minting control to the registry
    await nft.transferOwnership(registry.target);
  });

  /**
   * Test Case: Register a new vehicle and mint its NFT.
   * Verifies that the NFT is assigned to the correct owner and data is stored properly.
   */
  it("should register and mint a new vehicle", async function () {
    await registry.registerVehicle(
      "VIN123",
      user1.address,
      "V6",
      "AWD",
      "Auto",
      "Premium",
      "Black",
      "Beige",
      "Toyota",
      "Nagoya",
      "2025",
      "Sedan",
      "Petrol"
    );

    expect(await nft.ownerOf(0)).to.equal(user1.address);

    const vehicle = await registry.searchVehicle("VIN123");
    expect(vehicle.manufacturer).to.equal("Toyota");
  });

  /**
   * Test Case: Prevent duplicate VIN registrations.
   * Ensures the same VIN cannot be registered twice.
   */
  it("should not register the same VIN twice", async function () {
    await registry.registerVehicle(
      "VIN123",
      user1.address,
      "V6", "AWD", "Auto", "Premium", "Black", "Beige",
      "Toyota", "Nagoya", "2025", "Sedan", "Petrol"
    );

    await expect(
      registry.registerVehicle(
        "VIN123",
        user2.address,
        "V8", "FWD", "Manual", "Basic", "White", "Black",
        "Honda", "Tokyo", "2024", "Coupe", "Diesel"
      )
    ).to.be.revertedWith("Vehicle exists");
  });

  /**
   * Test Case: Update shipment status.
   * Verifies that the vehicle's shipment status can be updated to a valid enum value.
   */
  it("should update shipment status", async function () {
    await registry.registerVehicle("VIN001", user1.address, "V6", "AWD", "Auto", "Premium", "Black", "Beige", "Toyota", "Nagoya", "2025", "Sedan", "Petrol");

    await registry.updateShipmentStatus("VIN001", 2); // Delivered

    const vehicle = await registry.searchVehicle("VIN001");
    expect(vehicle.shipmentStatus).to.equal(2);
  });

  /**
   * Test Case: Add and retrieve crash records.
   * Ensures crash data is properly stored and retrievable from the full report.
   */
  it("should add and retrieve crash records", async function () {
    await registry.registerVehicle("VIN001", user1.address, "V6", "AWD", "Auto", "Premium", "Black", "Beige", "Toyota", "Nagoya", "2025", "Sedan", "Petrol");

    await registry.addCrashRecord("VIN001", "2024-05-01", "LA", "Frontal", "Minor scratch", true);

    const report = await registry.viewFullReport("VIN001");
    expect(report.crashHistory.length).to.equal(1);
    expect(report.crashHistory[0].description).to.equal("Minor scratch");
  });

  /**
   * Test Case: Transfer vehicle to a new owner.
   * Ensures ownership is transferred and availability is updated.
   */
  it("should transfer vehicle and mark unavailable", async function () {
    await registry.registerVehicle("VIN001", user1.address, "V6", "AWD", "Auto", "Premium", "Black", "Beige", "Toyota", "Nagoya", "2025", "Sedan", "Petrol");

    await registry.transferVehicle("VIN001", user2.address);

    const report = await registry.viewFullReport("VIN001");
    expect(report.currentOwner).to.equal(user2.address);
    expect(report.available).to.equal(false);
  });

  /**
   * Test Case: Mark a transferred vehicle as available again.
   * Useful when a car is ready for resale.
   */
  it("should mark a vehicle as available again", async function () {
    await registry.registerVehicle("VIN001", user1.address, "V6", "AWD", "Auto", "Premium", "Black", "Beige", "Toyota", "Nagoya", "2025", "Sedan", "Petrol");

    await registry.transferVehicle("VIN001", user2.address);
    await registry.markAsAvailable("VIN001");

    const vehicle = await registry.searchVehicle("VIN001");
    expect(vehicle.available).to.equal(true);
  });

  /**
   * Test Case: Retrieve all registered vehicles.
   * Confirms that all entries are stored and returned correctly.
   */
  it("should return all vehicles", async function () {
    await registry.registerVehicle("VIN123", user1.address, "V6", "AWD", "Auto", "Premium", "Black", "Beige", "Toyota", "Nagoya", "2025", "Sedan", "Petrol");
    await registry.registerVehicle("VIN456", user2.address, "V8", "RWD", "Manual", "Sport", "Red", "Black", "Tesla", "Fremont", "2023", "SUV", "Electric");

    const allVehicles = await registry.getAllVehicles();
    expect(allVehicles.length).to.equal(2);
  });
});

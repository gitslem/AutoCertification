// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VehicleNFT.sol";

/**
 * @title VehicleRegistry
 * @dev A smart contract that manages the lifecycle of vehicles using NFTs on the Ethereum blockchain.
 * Tracks registration, ownership, shipment status, crash history, mileage, and service records.
 */
contract VehicleRegistry {
    /// @notice Enum representing shipment statuses for vehicles
    enum ShipmentStatus {
        Scheduled,
        InTransit,
        Delivered,
        Delay
    }

    /// @notice Struct for storing crash record details
    struct CrashRecord {
        string date;
        string location;
        string damageType;
        string description;
        bool repaired;
    }

    /// @notice Struct for storing service record details
    struct ServiceRecord {
        string date;
        string serviceType;
        string description;
    }

    /// @notice Struct for storing comprehensive vehicle information
    struct Vehicle {
        string vin;
        address currentOwner;
        address[] ownerHistory;
        uint256[] ownershipTimestamps;
        uint256[] mileageRecords;
        string[] mileageTimestamps;
        CrashRecord[] crashHistory;
        ServiceRecord[] serviceHistory;
        string engineType;
        string drivetrain;
        string transmission;
        string trimLevel;
        string exteriorColor;
        string interiorColor;
        string manufacturer;
        string productionPlant;
        string modelYear;
        string bodyStyle;
        string fuelType;
        bool available;
        ShipmentStatus shipmentStatus;
    }

    mapping(string => Vehicle) public vehicles;
    VehicleNFT public vehicleNFT;
    string[] public allVINs;

    /**
     * @dev Initializes the registry with an address of the deployed VehicleNFT contract.
     * @param nftAddress Address of the deployed VehicleNFT contract.
     */
    constructor(address nftAddress) {
        vehicleNFT = VehicleNFT(nftAddress);
    }

    /**
     * @notice Registers a new vehicle and mints an NFT.
     */
    function registerVehicle(
        string memory vin,
        address to,
        string memory engineType,
        string memory drivetrain,
        string memory transmission,
        string memory trimLevel,
        string memory exteriorColor,
        string memory interiorColor,
        string memory manufacturer,
        string memory productionPlant,
        string memory modelYear,
        string memory bodyStyle,
        string memory fuelType
    ) external {
        require(bytes(vehicles[vin].vin).length == 0, "Vehicle exists");

        vehicles[vin] = Vehicle({
            vin: vin,
            currentOwner: to,
            ownerHistory: new address[](0),
            ownershipTimestamps: new uint256[](0),
            mileageRecords: new uint256[](0),
            mileageTimestamps: new string[](0),
            crashHistory: new CrashRecord[](0),
            serviceHistory: new ServiceRecord[](0),
            engineType: engineType,
            drivetrain: drivetrain,
            transmission: transmission,
            trimLevel: trimLevel,
            exteriorColor: exteriorColor,
            interiorColor: interiorColor,
            manufacturer: manufacturer,
            productionPlant: productionPlant,
            modelYear: modelYear,
            bodyStyle: bodyStyle,
            fuelType: fuelType,
            available: true,
            shipmentStatus: ShipmentStatus.Scheduled
        });

        vehicleNFT.mint(to, vin);
        allVINs.push(vin);
    }

    /**
     * @notice Updates the shipment status of a vehicle.
     */
    function updateShipmentStatus(
        string memory vin,
        ShipmentStatus status
    ) external {
        require(bytes(vehicles[vin].vin).length != 0, "Vehicle not found");
        vehicles[vin].shipmentStatus = status;
    }

    /**
     * @notice Adds a crash record to the vehicle's history.
     */
    function addCrashRecord(
        string memory vin,
        string memory date,
        string memory location,
        string memory damageType,
        string memory description,
        bool repaired
    ) external {
        require(bytes(vehicles[vin].vin).length != 0, "Vehicle not found");
        vehicles[vin].crashHistory.push(
            CrashRecord(date, location, damageType, description, repaired)
        );
    }

    /**
     * @notice Adds a new mileage entry to the vehicle record.
     */
    function addMileageRecord(
        string memory vin,
        uint256 mileage,
        string memory timestamp
    ) external {
        require(bytes(vehicles[vin].vin).length != 0, "Vehicle not found");
        vehicles[vin].mileageRecords.push(mileage);
        vehicles[vin].mileageTimestamps.push(timestamp);
    }

    /**
     * @notice Logs a new service record for the vehicle.
     */
    function addServiceRecord(
        string memory vin,
        string memory date,
        string memory serviceType,
        string memory description
    ) external {
        require(bytes(vehicles[vin].vin).length != 0, "Vehicle not found");
        vehicles[vin].serviceHistory.push(
            ServiceRecord(date, serviceType, description)
        );
    }

    /**
     * @notice Transfers vehicle ownership to another address.
     */
    function transferVehicle(
        string memory vin,
        address to
    ) external {
        Vehicle storage v = vehicles[vin];
        require(v.available, "Vehicle not available");
        v.ownerHistory.push(v.currentOwner);
        v.ownershipTimestamps.push(block.timestamp);
        v.currentOwner = to;
        v.available = false;
    }

    /**
     * @notice Marks a vehicle as available.
     */
    function markAsAvailable(string memory vin) external {
        vehicles[vin].available = true;
    }

    /**
     * @notice Updates availability status of a vehicle.
     */
    function updateVehicleAvailability(
        string memory vin,
        bool isAvailable
    ) external {
        vehicles[vin].available = isAvailable;
    }

    /**
     * @notice Returns basic details for a given VIN.
     */
    function viewBasicReport(string memory vin)
        external
        view
        returns (
            string memory manufacturer,
            string memory model,
            string memory modelYear,
            string memory color,
            string memory fuelType,
            string memory vinOut
        )
    {
        Vehicle storage v = vehicles[vin];
        return (
            v.manufacturer,
            v.bodyStyle,
            v.modelYear,
            v.exteriorColor,
            v.fuelType,
            v.vin
        );
    }

    /**
     * @notice Returns full vehicle data for a given VIN.
     */
    function viewFullReport(string memory vin)
        external
        view
        returns (Vehicle memory)
    {
        return vehicles[vin];
    }

    /**
     * @notice Retrieves a list of all registered vehicles.
     */
    function getAllVehicles()
        external
        view
        returns (Vehicle[] memory)
    {
        Vehicle[] memory list = new Vehicle[](allVINs.length);
        for (uint256 i = 0; i < allVINs.length; i++) {
            list[i] = vehicles[allVINs[i]];
        }
        return list;
    }

    /**
     * @notice Searches and returns a vehicle by VIN.
     */
    function searchVehicle(string memory vin)
        external
        view
        returns (Vehicle memory)
    {
        return vehicles[vin];
    }

    /**
     * @notice Returns the owner history of a vehicle.
     */
    function getOwnerHistory(string memory vin)
        external
        view
        returns (address[] memory, uint256[] memory)
    {
        Vehicle storage v = vehicles[vin];
        return (v.ownerHistory, v.ownershipTimestamps);
    }

    /**
     * @notice Returns mileage history of a vehicle.
     */
    function getMileageHistory(string memory vin)
        external
        view
        returns (uint256[] memory, string[] memory)
    {
        Vehicle storage v = vehicles[vin];
        return (v.mileageRecords, v.mileageTimestamps);
    }
}

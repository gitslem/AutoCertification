"use client";

import React, { useEffect, useState } from "react";
import { Search, Truck } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/wallet-context";
import { WalletWarning } from "@/components/wallet-warning";

type CrashRecord = {
  date: string;
  location: string;
  damageType: string;
  description: string;
  repaired: boolean;
};

type ServiceRecord = {
  date: string;
  serviceType: string;
  description: string;
};

type MintedVehicle = {
  vin: string;
  currentOwner: string;
  ownerHistory: string[];
  ownershipTimestamps: string[];
  mileageRecords: number[];
  mileageTimestamps: string[];
  crashHistory: CrashRecord[];
  serviceHistory: ServiceRecord[];
  engineType: string;
  drivetrain: string;
  transmission: string;
  trimLevel: string;
  exteriorColor: string;
  interiorColor: string;
  manufacturer: string;
  productionPlant: string;
  modelYear: string;
  bodyStyle: string;
  fuelType: string;
  available: boolean;
  shipmentStatus: number;
};

export default function LogisticsDashboard() {
  const { isConnected, contract } = useWallet();
  const [vin, setVin] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [allVehicle, setAllVehicle] = useState<MintedVehicle[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shipmentStatus, setShipmentStatus] = useState("");
  const [shipmentHistory, setShipmentHistory] = useState<any[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vin) {
      toast({
        title: "Error",
        description: "Please enter a VIN number",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      if (!contract) throw new Error("Smart contract not connected");

      const result = await contract.searchVehicle(vin);
      if (!result || result.vin === "") {
        toast({
          title: "Vehicle Not Found",
          description: "No car found with that VIN.",
          variant: "destructive",
        });
        setVehicleInfo(null);
        return;
      }

      const vehicleData = {
        vin: result.vin,
        make: result.manufacturer,
        model: result.bodyStyle,
        year: result.modelYear,
        trimLevel: result.trimLevel,
        engineType: result.engineType,
        from: "Factory",
        to: "Dealership",
        currentLocation: "N/A",
        estimatedArrival: "N/A",
        status: result.shipmentStatus,
      };

      setVehicleInfo(vehicleData);

      toast({
        title: "Vehicle Found",
        description: `Found vehicle with VIN: ${vin}`,
      });
    } catch (err) {
      console.error("Contract call failed:", err);
      toast({
        title: "Error",
        description: "Failed to fetch vehicle data.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !contract) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to update shipment status",
        variant: "destructive",
      });
      return;
    }

    if (!shipmentStatus || !vehicleInfo) {
      toast({
        title: "Error",
        description: "Please select a status and search a vehicle",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await contract.updateShipmentStatus(
        vehicleInfo.vin,
        ShipmentStatus[shipmentStatus.replace(" ", "")]
      );

      const updated = {
        ...vehicleInfo,
        status: shipmentStatus,
      };

      setVehicleInfo(updated);

      toast({
        title: "Status Updated",
        description: `Shipment status updated to: ${shipmentStatus}`,
      });
    } catch (err) {
      console.error("Status update failed:", err);
      toast({
        title: "Error",
        description: "Failed to update shipment status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const ShipmentStatus: Record<string, number> = {
    Scheduled: 0,
    InTransit: 1,
    Delivered: 2,
    Delayed: 3,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "0":
        return (
          <Badge className="bg-blue-500/10 text-blue-500">Scheduled</Badge>
        );
      case "1":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500">In Transit</Badge>
        );
      case "2":
        return (
          <Badge className="bg-green-500/10 text-green-500">Delivered</Badge>
        );
      case "3":
        return <Badge className="bg-red-500/10 text-red-500">Delayed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const fetchMintedVehicles = async () => {
    if (!isConnected || !contract) {
      setAllVehicle([]);
      return;
    }

    setIsLoadingInventory(true);
    try {
      const vehicles = await contract.getAllVehicles();
      setAllVehicle(vehicles);
    } catch (error: any) {
      toast({
        title: "Failed to fetch vehicles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingInventory(false);
    }
  };

  useEffect(() => {
    fetchMintedVehicles();
  }, [isConnected, contract]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Logistics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Update shipment status and track vehicle deliveries.
          </p>
        </div>

        <WalletWarning />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Search</CardTitle>
              <CardDescription>
                Enter a VIN to find a vehicle and update its shipment status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter VIN number"
                    className="pl-9"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {vehicleInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>
                  Details for VIN: {vehicleInfo.vin}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Make/Model
                      </p>
                      <p>
                        {vehicleInfo.make} {vehicleInfo.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Year
                      </p>
                      <p>{vehicleInfo.year}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Trim
                      </p>
                      <p>{vehicleInfo.trimLevel}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Engine
                      </p>
                      <p>{vehicleInfo.engineType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Status
                      </p>
                      <p>{getStatusBadge(Object.keys(ShipmentStatus).find(
                              (key) =>
                                ShipmentStatus[key] === vehicleInfo.status
                            ) || String(vehicleInfo.status))}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {vehicleInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Update Shipment Status</CardTitle>
              <CardDescription>
                Update the current shipment status for this vehicle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="update-form"
                onSubmit={handleUpdateStatus}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="status">Shipment Status</Label>
                  <Select
                    value={shipmentStatus}
                    onValueChange={setShipmentStatus}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="update-form"
                disabled={isUpdating || !isConnected}
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <Truck className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" /> Update Status
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Shipment History</CardTitle>
            <CardDescription>Recent shipment status updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VIN</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Trim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Origin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingInventory ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : allVehicle.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No vehicles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    allVehicle.map((vehicle) => (
                      <TableRow key={vehicle.vin}>
                        <TableCell className="font-mono text-xs">
                          {vehicle.vin}
                        </TableCell>
                        <TableCell>
                          {vehicle.manufacturer} {vehicle.bodyStyle}
                        </TableCell>
                        <TableCell>{vehicle.modelYear}</TableCell>
                        <TableCell>{vehicle.exteriorColor}</TableCell>
                        <TableCell>{vehicle.trimLevel}</TableCell>
                        <TableCell className="disabled:transform-none disabled:transition-none disabled:bg-gray disabled:cursor-not-allowed disabled:text-white">
                          {getStatusBadge(
                            Object.keys(ShipmentStatus).find(
                              (key) =>
                                ShipmentStatus[key] === vehicle.shipmentStatus
                            ) || String(vehicle.shipmentStatus)
                          )}
                        </TableCell>
                        <TableCell>{vehicle.productionPlant}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </DashboardLayout>
  );
}

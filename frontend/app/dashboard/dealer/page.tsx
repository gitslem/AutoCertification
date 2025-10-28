"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Car,
  Check,
  FileText,
  Search,
  ShieldCheck,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DealerDashboard() {
  const { isConnected, contract } = useWallet();
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [vin, setVin] = useState("");
  // const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  const fetchVehicles = async () => {
    if (!isConnected || !contract) {
      setAvailableVehicles([]);
      return;
    }

    // setIsLoadingInventory(true);
    try {
      const vehicles = await contract.getAllVehicles();
      setAvailableVehicles(vehicles);
    } catch (error: any) {
      toast({
        title: "Failed to fetch vehicles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      // setIsLoadingInventory(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [isConnected, contract]);

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !contract) {
      toast({
        title: "Wallet Not Connected",
        description: "Connect wallet.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVehicle) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const walletAddress = formData.get("wallet-address") as string;

    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Wallet address required",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);

    try {
      const tx = await contract.transferVehicle(
        selectedVehicle.vin,
        walletAddress
      );
      await tx.wait();
      toast({
        title: "Ownership Transferred",
        description: `Transferred to ${walletAddress}`,
      });
      fetchVehicles();
    } catch (err) {
      console.error("Transfer failed:", err);
      toast({
        title: "Error",
        description: "Transfer failed",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
      setSelectedVehicle(null);
    }
  };

  const handleAddServiceRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !contract || !selectedVehicle) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const serviceType = formData.get("service-type") as string;
    const description = formData.get("description") as string;
    const date = new Date().toISOString().split("T")[0];

    if (!serviceType || !description) {
      toast({
        title: "Error",
        description: "Fields required",
        variant: "destructive",
      });
      return;
    }

    setIsAddingService(true);

    try {
      const tx = await contract.addServiceRecord(
        selectedVehicle.vin,
        date,
        serviceType,
        description
      );
      await tx.wait();

      toast({
        title: "Service Record Added",
        description: `Added ${serviceType}`,
      });
      fetchVehicles();
    } catch (err) {
      console.error("Service failed:", err);
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive",
      });
    } finally {
      setIsAddingService(false);
      setSelectedVehicle(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setVehicleInfo(null);

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

      const result = await contract.viewFullReport(vin);
      console.log(result);

      // Check if the vehicle exists
      if (!result || result.vin === "") {
        toast({
          title: "Vehicle Not Found",
          description: "No car found with that VIN.",
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }

      // Parse and format data
      const vehicleData = {
        vin: result.vin,
        currentOwner: result.currentOwner,
        make: result.manufacturer,
        model: result.bodyStyle,
        trimLevel: result.trimLevel,
        year: result.modelYear,
        exteriorColor: result.exteriorColor,
        interiorColor: result.interiorColor,
        fuelType: result.fuelType,
        engine: result.engineType,
        driveTrain: result.drivetrain,
        transmission: result.transmission,
        available: result.available,
        mileage: result.mileageRecords.length
          ? result.mileageRecords[result.mileageRecords.length - 1]
          : 0,
        ownershipHistory: result.ownerHistory,
        ownershipTimestamps: result.ownershipTimestamps,
        serviceRecords: result.serviceHistory.map((s: any) => ({
          type: s.serviceType,
          date: s.date,
          mileage: 0, // Your contract doesn’t store mileage in service, so fallback
        })),
        crashRecords: result.crashHistory.map((c: any) => ({
          date: c.date,
          severity: c.damageType,
          description: c.description,
          repaired: c.repaired,
          location: c.location,
        })),
      };

      setVehicleInfo(vehicleData);

      toast({
        title: "Vehicle Found",
        description: `Found complete history for VIN: ${vin}`,
      });
    } catch (error: any) {
      console.error("viewFullReport failed:", error);
      toast({
        title: "Error",
        description: "Something went wrong while fetching the vehicle report.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dealer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage inventory and services.
          </p>
        </div>

        <WalletWarning />

        {/* <Card>
          <CardHeader>
            <CardTitle>Search Vehicle by VIN</CardTitle>
            <CardDescription>
              Enter VIN to fetch full vehicle report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSearchVin}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter VIN number"
                  className="pl-9"
                  value={searchVin}
                  onChange={(e) => setSearchVin(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {searchedVehicle && (
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {searchedVehicle.modelYear} {searchedVehicle.manufacturer}{" "}
                      {searchedVehicle.bodyStyle}
                    </CardTitle>
                    <CardDescription>
                      VIN: {searchedVehicle.vin}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Fuel</p>
                        <p>{searchedVehicle.fuelType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Drivetrain
                        </p>
                        <p>{searchedVehicle.drivetrain}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Transmission
                        </p>
                        <p>{searchedVehicle.transmission}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Color</p>
                        <p>{searchedVehicle.exteriorColor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Trim</p>
                        <p>{searchedVehicle.trimLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Availability
                        </p>
                        <p>
                          {searchedVehicle.available ? "Available" : "Sold"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Search</CardTitle>
            <CardDescription>
              Enter a Vehicle Identification Number (VIN) to retrieve complete
              vehicle history.
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
                  placeholder="Enter VIN number (e.g., 1HGCM82633A123456)"
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
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle>
                      {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                    </CardTitle>
                    <CardDescription>VIN: {vehicleInfo.vin}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {vehicleInfo.crashRecords &&
                    vehicleInfo.crashRecords.length > 0 ? (
                      <Badge variant="destructive">Crash History</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500"
                      >
                        No Crashes
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-500"
                    >
                      {vehicleInfo.mileage.toLocaleString()} mi
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVehicle(vehicleInfo)}
                            disabled={!vehicleInfo.available}
                          >
                            Transfer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Transfer Ownership</DialogTitle>
                            <DialogDescription>
                              Transfer VIN: {vin}
                            </DialogDescription>
                          </DialogHeader>
                          <form
                            id="transfer-form"
                            onSubmit={handleTransferOwnership}
                            className="space-y-4 py-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="wallet-address">
                                Wallet Address
                              </Label>
                              <Input
                                id="wallet-address"
                                name="wallet-address"
                                placeholder="Wallet address"
                              />
                            </div>
                          </form>
                          <DialogFooter>
                            <Button
                              type="submit"
                              form="transfer-form"
                              disabled={isTransferring}
                            >
                              {isTransferring
                                ? "Transferring..."
                                : "Transfer Ownership"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVehicle(vehicleInfo)}
                          >
                            Service
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Service Record</DialogTitle>
                            <DialogDescription>
                              For VIN: {vin}
                            </DialogDescription>
                          </DialogHeader>
                          <form
                            id="service-form"
                            onSubmit={handleAddServiceRecord}
                            className="space-y-4 py-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="service-type">Service Type</Label>
                              <Input
                                id="service-type"
                                name="service-type"
                                placeholder="e.g., Oil Change"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea id="description" name="description" />
                            </div>
                          </form>
                          <DialogFooter>
                            <Button
                              type="submit"
                              form="service-form"
                              disabled={isAddingService}
                            >
                              {isAddingService ? "Adding..." : "Add Service"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="specs">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="history">Ownership</TabsTrigger>
                <TabsTrigger value="service">Service</TabsTrigger>
                <TabsTrigger value="crash">Crash History</TabsTrigger>
              </TabsList>

              <TabsContent value="specs" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Specifications</CardTitle>
                    <CardDescription>
                      Detailed specifications for {vehicleInfo.year}{" "}
                      {vehicleInfo.make} {vehicleInfo.model}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Make
                        </p>
                        <p>{vehicleInfo.make}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Model
                        </p>
                        <p>{vehicleInfo.model}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Trim Level
                        </p>
                        <p>{vehicleInfo.trimLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Year
                        </p>
                        <p>{vehicleInfo.year}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Exterior Color
                        </p>
                        <p>{vehicleInfo.exteriorColor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Interior Color
                        </p>
                        <p>{vehicleInfo.interiorColor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Fuel Type
                        </p>
                        <p>{vehicleInfo.fuelType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Engine
                        </p>
                        <p>{vehicleInfo.engine}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Transmission
                        </p>
                        <p>{vehicleInfo.transmission}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Drive Train
                        </p>
                        <p>{vehicleInfo.driveTrain}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Current Mileage
                        </p>
                        <p>{vehicleInfo.mileage.toLocaleString()} miles</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Available
                        </p>
                        <p>{vehicleInfo.available}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          VIN
                        </p>
                        <p className="font-mono">{vehicleInfo.vin}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ownership History</CardTitle>
                    <CardDescription>
                      Complete ownership history for this vehicle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {vehicleInfo.ownershipHistory.length !== 0 ? (
                        vehicleInfo.ownershipHistory.map(
                          (owner: any, index: number) => (
                            <div key={index} className="flex">
                              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{owner}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(
                                    Number(
                                      vehicleInfo.ownershipTimestamps[index]
                                    ) * 1000
                                  ).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          )
                        )
                      ) : vehicleInfo.currentOwner ===
                        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" ? (
                        <div className="flex">
                          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Manufacturer</div>
                            <div className="text-sm text-muted-foreground">
                              Vehicle Not Sold Yet
                            </div>
                          </div>
                        </div>
                      ) : vehicleInfo.currentOwner ===
                        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" ? (
                        <div className="flex">
                          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Manufacturer</div>
                            <div className="text-sm text-muted-foreground">
                              Vehicle Not Sold Yet
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>Not Available</>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="service" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Records</CardTitle>
                    <CardDescription>
                      Maintenance and service history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {vehicleInfo.serviceRecords.length !== 0 ? (
                        vehicleInfo.serviceRecords.map(
                          (record: any, index: number) => (
                            <div key={index} className="flex">
                              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                <FileText className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <div className="font-medium">{record.type}</div>
                                <div className="text-sm text-muted-foreground">
                                  {record.date} •{" "}
                                  {record.mileage.toLocaleString()} miles
                                </div>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="mb-4 rounded-full bg-green-500/10 p-3">
                            <TriangleAlert className="h-6 w-6 text-yellow-500" />
                          </div>
                          <h3 className="text-lg font-semibold">
                            No Service Record Found
                          </h3>
                          <p className="text-muted-foreground">
                            This vehicle has no reported service history.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crash" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Crash History</CardTitle>
                    <CardDescription>
                      Accident records and damage reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vehicleInfo.crashRecords &&
                    vehicleInfo.crashRecords.length > 0 ? (
                      <div className="space-y-8">
                        {vehicleInfo.crashRecords.map(
                          (record: any, index: number) => (
                            <div key={index} className="flex">
                              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                                <Car className="h-5 w-5 text-red-500" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {record.severity} Accident
                                </div>
                                <div className="text-sm">
                                  {record.description}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {record.date} • {record.location}
                                </div>
                                <div className="mt-2 flex items-center">
                                  <Badge
                                    variant={
                                      record.repaired
                                        ? "outline"
                                        : "destructive"
                                    }
                                    className="flex items-center gap-1"
                                  >
                                    {record.repaired ? (
                                      <>
                                        <Check className="h-3 w-3" /> Repaired
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-3 w-3" /> Not Repaired
                                      </>
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 rounded-full bg-green-500/10 p-3">
                          <ShieldCheck className="h-6 w-6 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold">
                          No Crash Records
                        </h3>
                        <p className="text-muted-foreground">
                          This vehicle has no reported accidents or damage.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Available Vehicles</CardTitle>
            <CardDescription>Manage vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VIN</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableVehicles.map((v: any) => (
                    <TableRow key={v.vin}>
                      <TableCell className="font-mono text-xs">
                        {v.vin}
                      </TableCell>
                      <TableCell>
                        {v.manufacturer} {v.bodyStyle}
                      </TableCell>
                      <TableCell>{v.modelYear}</TableCell>
                      <TableCell>{v.exteriorColor}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            v.available
                              ? "bg-green-500/10 text-green-500"
                              : "bg-blue-500/10 text-blue-500"
                          }
                        >
                          {v.available ? "Available" : "Sold"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedVehicle(v)}
                                disabled={!v.available}
                              >
                                Transfer
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Transfer Ownership</DialogTitle>
                                <DialogDescription>
                                  Transfer VIN: {v.vin}
                                </DialogDescription>
                              </DialogHeader>
                              <form
                                id="transfer-form"
                                onSubmit={handleTransferOwnership}
                                className="space-y-4 py-4"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor="wallet-address">
                                    Wallet Address
                                  </Label>
                                  <Input
                                    id="wallet-address"
                                    name="wallet-address"
                                    placeholder="Wallet address"
                                  />
                                </div>
                              </form>
                              <DialogFooter>
                                <Button
                                  type="submit"
                                  form="transfer-form"
                                  disabled={isTransferring}
                                >
                                  {isTransferring
                                    ? "Transferring..."
                                    : "Transfer Ownership"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedVehicle(v)}
                              >
                                Service
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Service Record</DialogTitle>
                                <DialogDescription>
                                  For VIN: {v.vin}
                                </DialogDescription>
                              </DialogHeader>
                              <form
                                id="service-form"
                                onSubmit={handleAddServiceRecord}
                                className="space-y-4 py-4"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor="service-type">
                                    Service Type
                                  </Label>
                                  <Input
                                    id="service-type"
                                    name="service-type"
                                    placeholder="e.g., Oil Change"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="description">
                                    Description
                                  </Label>
                                  <Textarea
                                    id="description"
                                    name="description"
                                  />
                                </div>
                              </form>
                              <DialogFooter>
                                <Button
                                  type="submit"
                                  form="service-form"
                                  disabled={isAddingService}
                                >
                                  {isAddingService
                                    ? "Adding..."
                                    : "Add Service"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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

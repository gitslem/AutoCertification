"use client";

import type React from "react";

import { useState } from "react";
import {
  Car,
  Check,
  FileText,
  Search,
  ShieldCheck,
  ShieldQuestion,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/wallet-context";

export default function PremiumUserDashboard() {
  const [vin, setVin] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);

  // Filter states
  const [hasCrash, setHasCrash] = useState<boolean | null>(null);
  const [mileageFilter, setMileageFilter] = useState("");
  const [ownerType, setOwnerType] = useState("");
  const { isConnected, contract } = useWallet();

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
        mileage: result.mileageRecords.length
          ? result.mileageRecords[result.mileageRecords.length - 1]
          : 0,
        ownershipHistory: result.ownerHistory,
        ownershipTimestamps: result.ownershipTimestamps,
        // ownershipHistory: [],
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
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Premium User Dashboard
            </h1>
            <Badge className="bg-purple-500 hover:bg-purple-600">Premium</Badge>
          </div>
          <p className="text-muted-foreground">
            Access complete vehicle history and detailed reports.
          </p>
        </div>

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
                    No Images Available
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
      </div>
      <Toaster />
    </DashboardLayout>
  );
}

"use client";

import type React from "react";

import { useState } from "react";
import { Car, Search } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WalletWarning } from "@/components/wallet-warning";
import { useWallet } from "@/contexts/wallet-context";

export default function RegularUserDashboard() {
  const [vin, setVin] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
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
      if (!contract) {
        throw new Error("Smart contract not connected");
      }

      const result = await contract.viewBasicReport(vin);
      console.log("Vehicle data:", result);

      const carExists = result[5] !== "";

      if (carExists) {
        const vehicleData = {
          make: result[0],
          model: result[1],
          year: result[2],
          color: result[3],
          fuelType: result[4],
          vin: result[5],
        };
        console.log("This is vehicle data" + vehicleData);

        setVehicleInfo(vehicleData);

        toast({
          title: "Vehicle Found",
          description: `Found vehicle with VIN: ${vin}`,
        });
      } else {
        toast({
          title: "Vehicle Not Found",
          description: "No car found with that VIN.",
          variant: "destructive",
        });
      }

      setIsSearching(false);
    } catch (err: any) {
      console.error("Contract call failed:", err);

      if (
        err.code === "BAD_DATA" &&
        err.info?.method === "viewBasicReport" &&
        err.value === "0x"
      ) {
        // This is likely due to a missing vehicle entry
        toast({
          title: "Vehicle Not Found",
          description: "No car found with that VIN.",
          variant: "destructive",
        });
        setIsSearching(false);
      } else {
        toast({
          title: "Error",
          description: "Something went wrong while fetching vehicle data.",
          variant: "destructive",
        });
      }
      setIsSearching(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Regular User Dashboard
          </h1>
          <p className="text-muted-foreground">
            Search for basic vehicle information using a VIN number.
          </p>
        </div>

        <WalletWarning />

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Search</CardTitle>
            <CardDescription>
              Enter a Vehicle Identification Number (VIN) to retrieve basic
              vehicle information.
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
              <Button type="submit" disabled={isSearching || !isConnected}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {vehicleInfo && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Vehicle Information</CardTitle>
                <CardDescription>
                  Basic details about the vehicle with VIN: {vehicleInfo.vin}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                      <Car className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                        Year
                      </p>
                      <p>{vehicleInfo.year}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Color
                      </p>
                      <p>{vehicleInfo.color}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Fuel Type
                      </p>
                      <p>{vehicleInfo.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        VIN
                      </p>
                      <p className="font-mono">{vehicleInfo.vin}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30 border-dashed">
              <CardHeader>
                <CardTitle>Full Vehicle Report</CardTitle>
                <CardDescription>
                  Detailed vehicle history and records
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Premium Feature</h3>
                  <p className="text-muted-foreground">
                    Upgrade to Premium to unlock the full vehicle report
                    including crash history, service records, and ownership
                    history.
                  </p>
                  <Button variant="outline">Upgrade to Premium</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Alert>
          <AlertTitle>Regular User Access</AlertTitle>
          <AlertDescription>
            As a Regular User, you have access to basic vehicle information
            only. Upgrade to Premium to access full vehicle history reports
            including crash records, service history, and ownership transfers.
          </AlertDescription>
        </Alert>
      </div>
      <Toaster />
    </DashboardLayout>
  );
}

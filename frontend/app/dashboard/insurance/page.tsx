"use client";

import type React from "react";

import { useState } from "react";
import { Car, FileText, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useWallet } from "@/contexts/wallet-context";
import { WalletWarning } from "@/components/wallet-warning";

export default function InsuranceDashboard() {
  const { isConnected, contract } = useWallet();
  const [vin, setVin] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [isAddingCrash, setIsAddingCrash] = useState(false);
  const [crashRecords, setCrashRecords] = useState([]);

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

      const result = await contract.viewFullReport(vin);
      setVehicleInfo(result);
      setCrashRecords(result.crashHistory)
      toast({
        title: "Vehicle Found",
        description: `Found vehicle with VIN: ${vin}`,
      });
    } catch (err: any) {
      toast({
        title: "Vehicle Not Found",
        description: "No vehicle found with that VIN.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCrashRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !contract) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add a crash record",
        variant: "destructive",
      });
      return;
    }

    if (!vehicleInfo) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const date = formData.get("date") as string;
    const location = formData.get("location") as string;
    const severity = formData.get("severity") as string;
    const description = formData.get("description") as string;
    const repaired = (formData.get("repaired") === "on" || formData.get("repaired") === "true") ? true : false;

    if (!date || !location || !severity || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsAddingCrash(true);

    try {
      await contract.addCrashRecord(
        vin,
        date,
        location,
        severity,
        description,
        repaired
      );
      toast({
        title: "Crash Record Added",
        description: `Crash record added for VIN: ${vin}`,
      });
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.message || "Error adding crash record",
        variant: "destructive",
      });
    } finally {
      setIsAddingCrash(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Insurance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Search vehicle by VIN and add crash records to verified vehicles.
          </p>
        </div>

        <WalletWarning />

        <Card>
          <CardHeader>
            <CardTitle>Search Vehicle</CardTitle>
            <CardDescription>
              Enter a VIN to fetch vehicle information.
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
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Info</CardTitle>
                <CardDescription>VIN: {vehicleInfo.vin}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Make</p>
                    <p>{vehicleInfo.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p>{vehicleInfo.bodyStyle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p>{vehicleInfo.modelYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel</p>
                    <p>{vehicleInfo.fuelType}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={!isConnected}>
                      <FileText className="mr-2 h-4 w-4" /> Add Crash Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Crash Record</DialogTitle>
                      <DialogDescription>
                        Add crash info for VIN: {vehicleInfo.vin}
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      id="crash-form"
                      onSubmit={handleAddCrashRecord}
                      className="space-y-4 py-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" name="date" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="severity">Damage Type</Label>
                        <Select name="severity" required>
                          <SelectTrigger id="severity">
                            <SelectValue placeholder="Select damage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Minor">Minor</SelectItem>
                            <SelectItem value="Moderate">Moderate</SelectItem>
                            <SelectItem value="Severe">Severe</SelectItem>
                            <SelectItem value="Total Loss">
                              Total Loss
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="repaired" name="repaired" />
                        <Label htmlFor="repaired">
                          Vehicle has been repaired
                        </Label>
                      </div>
                    </form>
                    <DialogFooter>
                      <Button
                        type="submit"
                        form="crash-form"
                        disabled={isAddingCrash}
                      >
                        {isAddingCrash ? "Adding..." : "Add Record"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crash History</CardTitle>
                <CardDescription>
                  Previous crash records for this vehicle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicleInfo.crashHistory.length !== 0 ?
                    vehicleInfo.crashHistory.map((record: any, index: any) => (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                              <Car className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">
                                {record.severity} Accident
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {record.date} • {record.location}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm mb-2">{record.description}</p>
                          <Badge
                            variant="outline"
                            className={
                              record.repaired
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                            }
                          >
                            {record.repaired ? "Repaired" : "Not Repaired"}
                          </Badge>
                        </div>
                      )) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 rounded-full bg-green-500/10 p-3">
                      <Car className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold">No Crash Records</h3>
                    <p className="text-muted-foreground">
                      This vehicle has no reported accidents or damage.
                    </p>
                  </div>
                )
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Toaster />
    </DashboardLayout>
  );
}

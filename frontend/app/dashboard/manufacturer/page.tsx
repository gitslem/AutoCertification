"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Package } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useWallet } from "@/contexts/wallet-context";
import { WalletWarning } from "@/components/wallet-warning";
import { Badge } from "@/components/ui/badge";

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

export default function ManufacturerDashboard() {
  const { isConnected, contract, signer } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintedVehicles, setMintedVehicles] = useState<MintedVehicle[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  const shipmentStatusMap = ["Scheduled", "InTransit", "Delivered", "Delay"];

  const getValue = (form: FormData, key: string) =>
    (form.get(key) as string) || "";

  const handleMintVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !contract || !signer) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint a vehicle NFT",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const vin = getValue(formData, "vin");

    if (!vin) {
      toast({
        title: "Error",
        description: "VIN is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = await contract.registerVehicle(
        vin,
        await signer.getAddress(),
        getValue(formData, "engineType"),
        getValue(formData, "drivetrain"),
        getValue(formData, "transmission"),
        getValue(formData, "trimLevel"),
        getValue(formData, "exteriorColor"),
        getValue(formData, "interiorColor"),
        getValue(formData, "make"),
        getValue(formData, "productionPlant"),
        getValue(formData, "year"),
        getValue(formData, "model"),
        getValue(formData, "fuelType")
      );
      await tx.wait();
      await fetchMintedVehicles();
      (e.target as HTMLFormElement).reset();

      toast({
        title: "Vehicle NFT Minted",
        description: `Successfully registered and minted NFT for VIN: ${vin}`,
      });
    } catch (error: any) {
      toast({
        title: "Minting Failed",
        description: error?.message || "Failed to mint vehicle NFT.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMintedVehicles = async () => {
    if (!isConnected || !contract) {
      setMintedVehicles([]);
      return;
    }

    setIsLoadingInventory(true);
    try {
      const vehicles = await contract.getAllVehicles();
      setMintedVehicles(vehicles);
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

    const ShipmentStatus: Record<string, number> = {
    Scheduled: 0,
    InTransit: 1,
    Delivered: 2,
    Delayed: 3,
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Manufacturer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Mint new vehicle NFTs and manage your vehicle inventory.
          </p>
        </div>

        <WalletWarning />

        <Tabs defaultValue="mint">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mint">Mint Vehicle NFT</TabsTrigger>
            <TabsTrigger value="inventory">Vehicle Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="mint" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Mint New Vehicle NFT</CardTitle>
                <CardDescription>
                  Create a new vehicle NFT with factory specifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  id="mint-form"
                  onSubmit={handleMintVehicle}
                  className="space-y-6"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputGroup label="VIN *" name="vin" placeholder="e.g., 1HGCM82633A123456" required />
                    <SelectGroup label="Make *" name="make" options={["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Audi", "Tesla"]} required />
                    <InputGroup label="Model *" name="model" placeholder="e.g., Camry" required />
                    <InputGroup label="Year *" name="year" type="number" placeholder="e.g., 2023" required />
                    <InputGroup label="Exterior Color *" name="exteriorColor" placeholder="e.g., Silver" required />
                    <InputGroup label="Interior Color" name="interiorColor" placeholder="e.g., Black" />
                    <InputGroup label="Engine Type" name="engineType" placeholder="e.g., 2.5L 4-Cylinder" />
                    <InputGroup label="Trim Level" name="trimLevel" placeholder="e.g., LXS, Premium" />
                    <SelectGroup label="Drive Train" name="drivetrain" options={["AWD", "FWD", "RWD"]} />
                    <SelectGroup label="Transmission" name="transmission" options={["Automatic", "Manual", "CVT", "DCT", "Electric"]} />
                    <InputGroup label="Production Plant" name="productionPlant" placeholder="e.g., Toronto" />
                    <SelectGroup label="Fuel Type" name="fuelType" options={["Petrol", "Diesel", "Electric"]} />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="mint-form"
                  disabled={isSubmitting || !isConnected}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Package className="mr-2 h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Mint Vehicle NFT
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Minted Vehicles</CardTitle>
                <CardDescription>
                  View all vehicle NFTs minted by your organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>VIN</TableHead>
                        <TableHead>Make/Model</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Trim</TableHead>
                        <TableHead>Shipment</TableHead>
                        <TableHead>Availability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingInventory ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : mintedVehicles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            No vehicles found
                          </TableCell>
                        </TableRow>
                      ) : (
                        mintedVehicles.map((v) => (
                          <TableRow key={v.vin}>
                            <TableCell className="font-mono text-xs">{v.vin}</TableCell>
                            <TableCell>{v.manufacturer} {v.bodyStyle}</TableCell>
                            <TableCell>{v.modelYear}</TableCell>
                            <TableCell>{v.exteriorColor}</TableCell>
                            <TableCell>{v.trimLevel}</TableCell>
                            <TableCell>{getStatusBadge(Object.keys(ShipmentStatus).find(
                              (key) =>
                                ShipmentStatus[key] === v.shipmentStatus
                            ) || String(v.shipmentStatus))}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className={`mr-2 h-2 w-2 rounded-full ${v.available ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span>{v.available ? "Available" : "Sold"}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </DashboardLayout>
  );
}

const InputGroup = ({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} name={name} placeholder={placeholder} type={type} required={required} />
  </div>
);

const SelectGroup = ({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <Select name={name} required={required}>
      <SelectTrigger id={name}>
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

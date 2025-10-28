"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import { useTheme } from "next-themes";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("regular");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation
    if (!email || !password || !name) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const action = "signup";
      const response = await axios.post("http://localhost:3000/api/users", {
        email,
        password,
        name,
        accountType,
        action,
      });

      if (response.status === 201 || response.status === 200) {
        // Store user info in localStorage
        localStorage.setItem("userRole", accountType);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name);

        toast({
          title: "Success",
          description: "Your account has been created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Signup failed",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Signup failed",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if there's a pending VIN search
    const pendingVin = localStorage.getItem("pendingVinSearch");

    if (pendingVin) {
      // Clear the pending VIN
      localStorage.removeItem("pendingVinSearch");
      // Redirect to search page with the VIN
      router.push(`/dashboard/${accountType}/search?vin=${pendingVin}`);
    } else {
      // Redirect to dashboard
      router.push(`/dashboard/${accountType}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium mb-6 hover:text-primary"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <img
                src={theme === "light" ? "/logo-black.png" : "/logo-white.png"}
                alt="logo"
                height={80}
                width={80}
              />
            </div>
            <CardTitle className="text-2xl text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your information to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup
                    defaultValue="regular"
                    value={accountType}
                    onValueChange={setAccountType}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="regular"
                        id="regular"
                        onSelect={() => {
                          setAccountType("regular");
                        }}
                      />
                      <Label htmlFor="regular" className="cursor-pointer">
                        Regular (Free)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="premium"
                        id="premium"
                        onSelect={() => {
                          setAccountType("premium");
                        }}
                      />
                      <Label htmlFor="premium" className="cursor-pointer">
                        Premium ($9.99/month)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              <Link
                href="/auth/business"
                className="text-primary hover:underline"
              >
                Business signup
              </Link>{" "}
              (Manufacturers, Dealers, etc.)
            </div>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}

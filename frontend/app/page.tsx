"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  Database,
  FileText,
  Search,
  Shield,
  CheckCircle,
} from "lucide-react";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const router = useRouter();
  const [vin, setVin] = useState("");
  const { theme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vin) {
      toast({
        title: "Error",
        description: "Please enter a VIN number",
        variant: "destructive",
      });
      return;
    }

    // Store VIN in localStorage for retrieval after login
    localStorage.setItem("pendingVinSearch", vin);

    // Redirect to login page
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={theme === "light" ? "/logo-black.png" : "/logo-white.png"}
              alt="logo"
              height={36}
              width={36}
            />
            <span className="text-xl font-bold">AutoCertify</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium hover:text-primary"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative py-20 md:py-32 hero-gradient">
          <div className="container relative z-10">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
                  Track Your Car's History.{" "}
                  <span className="text-primary">Trust What You Drive.</span>
                </h1>
                <p className="text-xl text-gray-300">
                  AutoCertify uses blockchain technology to provide transparent,
                  immutable vehicle history records you can trust.
                </p>
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="relative flex-1">
                    <Search className="absolute z-10 left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter VIN number..."
                      className="pl-10 h-12 w-full bg-background/80 backdrop-blur-sm border-gray-700"
                      value={vin}
                      onChange={(e) => setVin(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-12">
                    <Search className="mr-2 h-5 w-5" /> Search
                  </Button>
                </form>
              </div>
              <div className="relative">
                <div className="hero-card rounded-xl p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Verified Vehicle History
                      </h3>
                      <p className="text-gray-400">
                        Blockchain-secured records
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-gray-300">
                        Complete ownership history
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-gray-300">Verified accident reports</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-gray-300">
                        Service and maintenance records
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-gray-300">
                        Tamper-proof mileage tracking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose AutoCertify?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our blockchain-based platform ensures transparency and trust in
                the automotive industry.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border border-primary/20 bg-card/50">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>NFT-Based Ownership</CardTitle>
                  <CardDescription>
                    Each vehicle is represented as a unique NFT on the
                    blockchain, ensuring secure and verifiable ownership.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border border-primary/20 bg-card/50">
                <CardHeader>
                  <FileText className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Complete Crash Records</CardTitle>
                  <CardDescription>
                    Access detailed accident history with information verified
                    by insurance companies and repair shops.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border border-primary/20 bg-card/50">
                <CardHeader>
                  <Database className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Comprehensive Reports</CardTitle>
                  <CardDescription>
                    Get full vehicle history including service records, mileage
                    logs, and ownership transfers.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                AutoCertify connects all stakeholders in the automotive
                ecosystem through blockchain technology.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="data-flow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <CardTitle>Manufacturer</CardTitle>
                  <CardDescription>
                    Creates the vehicle NFT with all factory specifications
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="data-flow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <CardTitle>Logistics & Dealers</CardTitle>
                  <CardDescription>
                    Update vehicle status and transfer ownership
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="data-flow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <CardTitle>Service & Insurance</CardTitle>
                  <CardDescription>
                    Add maintenance records and accident reports
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="data-flow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold">4</span>
                  </div>
                  <CardTitle>Vehicle Owners</CardTitle>
                  <CardDescription>
                    Access complete vehicle history and transfer ownership
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pricing Plans
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your needs
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <Card className="border border-primary/20">
                <CardHeader>
                  <CardTitle>Regular User</CardTitle>
                  <CardDescription>Basic vehicle information</CardDescription>
                  <div className="mt-4 text-4xl font-bold">Free</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Basic vehicle information
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      VIN lookup
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Limited history access
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/signup" className="w-full">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card className="border-2 border-primary relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <CardHeader>
                  <CardTitle>Premium User</CardTitle>
                  <CardDescription>Full vehicle history access</CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    $9.99
                    <span className="text-base font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Complete vehicle history
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Accident reports
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Service records
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Ownership history
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Advanced filtering
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/signup" className="w-full">
                    <Button className="w-full">Subscribe Now</Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card className="border border-primary/20">
                <CardHeader>
                  <CardTitle>Business</CardTitle>
                  <CardDescription>
                    For dealers, manufacturers & more
                  </CardDescription>
                  <div className="mt-4 text-4xl font-bold">Custom</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Role-based access
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Create & update records
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Bulk operations
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      API access
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                      Priority support
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/business" className="w-full">
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to explore vehicle history you can trust?
              </h2>
              <p className="text-xl mb-8 text-primary-foreground/80">
                Join thousands of users who trust AutoCertify for transparent
                vehicle history.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="h-12">
                  Explore Vehicle History{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={
                    theme === "light" ? "/logo-black.png" : "/logo-white.png"
                  }
                  alt="logo"
                  height={36}
                  width={36}
                />
                <span className="text-xl font-bold">AutoCertify</span>
              </div>
              <p className="text-muted-foreground">
                Blockchain-based Car Supply Chain platform.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>
              © {new Date().getFullYear()} AutoCertify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

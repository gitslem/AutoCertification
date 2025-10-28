"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  FileText,
  Home,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Store,
  Truck,
  X,
  Users,
  Activity,
  BarChart3,
  Database,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { useWallet } from "@/contexts/wallet-context";
import { useTheme } from "next-themes";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  requiresWallet?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, address } = useWallet();
  const { theme } = useTheme();

  useEffect(() => {
    // Check if user is authenticated
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");

    if (!role) {
      // Redirect to login if not authenticated
      router.push("/auth/login");
      return;
    }

    setUserRole(role);
    setUserEmail(email);
  }, [router]);

  const roleInfo = {
    regular: {
      name: "Regular User",
      icon: Car,
      color: "text-blue-500",
    },
    premium: {
      name: "Premium User",
      icon: ShieldCheck,
      color: "text-purple-500",
    },
    manufacturer: {
      name: "Manufacturer",
      icon: Settings,
      color: "text-green-500",
    },
    logistics: {
      name: "Logistics Provider",
      icon: Truck,
      color: "text-yellow-500",
    },
    dealer: {
      name: "Dealer",
      icon: Store,
      color: "text-red-500",
    },
    insurance: {
      name: "Insurance Company",
      icon: FileText,
      color: "text-indigo-500",
    },
    admin: {
      name: "Admin",
      icon: Shield,
      color: "text-gray-500",
    },
  };

  // Base navigation items for all roles
  const baseNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: `/dashboard/${userRole}`,
      icon: Home,
      roles: [
        "regular",
        "premium",
        "manufacturer",
        "logistics",
        "dealer",
        "insurance",
        "admin",
      ],
    },
  ];

  // Role-specific navigation items
  const roleNavigation: { [key: string]: NavigationItem[] } = {
    manufacturer: [],
    logistics: [],
    dealer: [],
    insurance: [],
    admin: [],
  };

  // Combine base navigation with role-specific navigation
  const navigation: NavigationItem[] = [
    ...baseNavigation,
    ...(userRole && roleNavigation[userRole as keyof typeof roleNavigation]
      ? roleNavigation[userRole as keyof typeof roleNavigation]
      : []),
  ];

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });

    // Clear user data from localStorage
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("walletAddress");

    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const currentRole = userRole
    ? roleInfo[userRole as keyof typeof roleInfo]
    : null;
  const RoleIcon = currentRole?.icon || Car;

  // Check if current user is a business user
  const isBusinessUser = [
    "manufacturer",
    "dealer",
    "logistics",
    "insurance",
    "admin",
  ].includes(userRole || "");

  if (!userRole) {
    return null; // Don't render anything until we check authentication
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 sm:max-w-xs">
            <div className="flex h-16 items-center border-b">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <img
                  src={
                    theme === "light" ? "/logo-black.png" : "/logo-white.png"
                  }
                  alt="logo"
                  height={36}
                  width={36}
                />
                <span>AutoCertify</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <nav className="grid gap-2 py-4">
              {navigation
                .filter(
                  (item) => !item.roles || item.roles.includes(userRole || "")
                )
                .map((item) => {
                  // Disable navigation items that require wallet if wallet is not connected
                  const isDisabled = item.requiresWallet && !isConnected;

                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={isDisabled ? "#" : item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                        pathname === item.href
                          ? "bg-muted font-medium"
                          : "text-muted-foreground"
                      } ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed pointer-events-none"
                          : ""
                      }`}
                      onClick={(e) => {
                        if (isDisabled) {
                          e.preventDefault();
                          toast({
                            title: "Wallet Not Connected",
                            description:
                              "Please connect your wallet to access this feature",
                            variant: "destructive",
                          });
                        } else {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              <Button
                variant="ghost"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm justify-start font-normal text-muted-foreground hover:text-primary"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img
            src={theme === "light" ? "/logo-black.png" : "/logo-white.png"}
            alt="logo"
            height={36}
            width={36}
          />
          <span className="hidden md:inline">AutoCertify</span>
        </Link>
        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
          <WalletConnectButton />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className={currentRole?.color}>
                    {userEmail?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex items-center gap-2">
                <RoleIcon className={`h-4 w-4 ${currentRole?.color}`} />
                <span>{currentRole?.name}</span>
              </DropdownMenuLabel>
              {isConnected && address && (
                <>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground break-all">
                    {address}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${userRole}/settings`}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4">
            {navigation
              .filter(
                (item) => !item.roles || item.roles.includes(userRole || "")
              )
              .map((item) => {
                // Disable navigation items that require wallet if wallet is not connected
                const isDisabled = item.requiresWallet && !isConnected;

                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={isDisabled ? "#" : item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                      pathname === item.href
                        ? "bg-muted font-medium"
                        : "text-muted-foreground"
                    } ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : ""
                    }`}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                        toast({
                          title: "Wallet Not Connected",
                          description:
                            "Please connect your wallet to access this feature",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            <Button
              variant="ghost"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm justify-start font-normal text-muted-foreground hover:text-primary"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">
          {!isConnected && (
            <div className="p-4 md:p-8">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-500">
                    Wallet Not Connected
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Please connect your MetaMask wallet to access blockchain
                    features.
                  </p>
                </div>
                <WalletConnectButton />
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { BrowserProvider, Contract, Eip1193Provider, JsonRpcSigner } from "ethers"
import { toast } from "@/components/ui/use-toast"
import VehicleRegistryABI from "@/constants/VehicleRegistryABI.json";
import VehicleRegistryAddress from "@/constants/VehicleRegistryAddress.json";

const contractAddress = VehicleRegistryAddress.address;

interface WalletContextType {
  address: string | null
  isConnecting: boolean
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  provider: BrowserProvider | null
  signer: JsonRpcSigner | null
  contract: Contract | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)

  const isMetaMaskInstalled = () =>
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress")
    const userRole = localStorage.getItem("userRole")
    const isBusinessUser = ["manufacturer", "dealer", "logistics", "insurance", "admin"].includes(
      userRole || ""
    )

    if (storedAddress && isBusinessUser) {
      autoConnect()
    }
  }, [])

  const initializeProvider = async () => {
    const ethProvider = new BrowserProvider(window.ethereum as Eip1193Provider)
    const walletSigner = await ethProvider.getSigner()
    const contractInstance = new Contract(contractAddress, VehicleRegistryABI, walletSigner)

    setProvider(ethProvider)
    setSigner(walletSigner)
    setContract(contractInstance)
  }

  const autoConnect = async () => {
    if (!isMetaMaskInstalled()) return

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        await initializeProvider()
      }
    } catch (error) {
      console.error("Error auto-connecting to MetaMask:", error)
    }
  }

  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: "MetaMask not installed",
        description: "Please install MetaMask extension to connect your wallet",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      if (accounts.length > 0) {
        const account = accounts[0]
        setAddress(account)
        setIsConnected(true)
        localStorage.setItem("walletAddress", account)
        await initializeProvider()

        toast({
          title: "Wallet Connected",
          description: `Connected to ${shortenAddress(account)}`,
        })
      }
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error)

      if (error.code === 4001) {
        toast({
          title: "Connection Rejected",
          description: "You rejected the connection request",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Connection Error",
          description: "Failed to connect to MetaMask",
          variant: "destructive",
        })
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setProvider(null)
    setSigner(null)
    setContract(null)
    localStorage.removeItem("walletAddress")

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== address) {
          setAddress(accounts[0])
          localStorage.setItem("walletAddress", accounts[0])
          await initializeProvider()

          toast({
            title: "Account Changed",
            description: `Switched to ${shortenAddress(accounts[0])}`,
          })
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [address])

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected,
        connect,
        disconnect,
        provider,
        signer,
        contract,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

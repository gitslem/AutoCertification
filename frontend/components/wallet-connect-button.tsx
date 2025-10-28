"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { Wallet, Loader2 } from "lucide-react"

export function WalletConnectButton() {
  const { isConnected, isConnecting, address, connect, disconnect } = useWallet()

  // Helper function to shorten address for display
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  if (isConnected && address) {
    return (
      <Button variant="outline" className="flex items-center gap-2" onClick={disconnect}>
        <Wallet className="h-4 w-4" />
        <span className="hidden md:inline">{shortenAddress(address)}</span>
        <span className="md:hidden">Disconnect</span>
      </Button>
    )
  }

  return (
    <Button variant="outline" className="flex items-center gap-2" onClick={connect} disabled={isConnecting}>
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </>
      )}
    </Button>
  )
}

"use client"

import { useWallet } from "@/contexts/wallet-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WalletWarning() {
  const { isConnected, connect, isConnecting } = useWallet()

  if (isConnected) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Wallet Not Connected</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span>Please connect your wallet to proceed with blockchain operations.</span>
        <Button size="sm" onClick={connect} disabled={isConnecting} className="sm:ml-auto">
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

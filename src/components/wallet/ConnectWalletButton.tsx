import { Button } from "@/components/ui/button";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";

export default function ConnectWalletButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  return (
    <div>
      <Button variant="outline" onClick={() => open()}>
        {isConnected && address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
      </Button>
      </div>
    );
  }
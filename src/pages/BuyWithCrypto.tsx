import { useState } from "react";
import { Button } from "@/components/ui/button";
import ConnectWalletButton from "@/components/wallet/ConnectWalletButton";

const CHAINS = [
  { name: "Ethereum", symbol: "ETH", address: "0xYourEthAddress" },
  { name: "Polygon", symbol: "MATIC", address: "0xYourPolygonAddress" },
  { name: "Binance Smart Chain", symbol: "BNB", address: "0xYourBscAddress" },
  // Add more chains as needed
];

const CREDIT_PRICE = 100; // Number of credits per purchase
const PRICE_USD = 10; // Example price in USD

export default function BuyWithCrypto() {
  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);
  const [txHash, setTxHash] = useState("");
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Buy Credits with Crypto</h2>
      <ConnectWalletButton />
      <div className="my-4">
        <label className="block mb-2 font-semibold">Select Chain:</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedChain.name}
          onChange={e => setSelectedChain(CHAINS.find(c => c.name === e.target.value) || CHAINS[0])}
        >
          {CHAINS.map(chain => (
            <option key={chain.name} value={chain.name}>{chain.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <div className="font-semibold">Send Payment To:</div>
        <div className="break-all bg-gray-100 p-2 rounded mt-1">{selectedChain.address}</div>
        <div className="mt-2">Amount: <span className="font-mono">{PRICE_USD} USD (~{PRICE_USD} {selectedChain.symbol})</span></div>
        <div className="text-xs text-gray-500 mt-1">* Use the address above to send payment on {selectedChain.name}. After payment, enter your transaction hash below.</div>
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Transaction Hash:</label>
        <input
          className="border rounded px-3 py-2 w-full"
          value={txHash}
          onChange={e => setTxHash(e.target.value)}
          placeholder="Paste your transaction hash here"
        />
      </div>
      <Button
        className="w-full"
        onClick={() => setStep(2)}
        disabled={!txHash}
      >
        Submit & Check Payment
      </Button>
      {step === 2 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <div className="font-semibold text-green-700 mb-2">Payment submitted!</div>
          <div className="text-sm">Your payment is being verified. Credits will be added to your account after confirmation.</div>
        </div>
      )}
      <div className="mt-8 text-center text-gray-500 text-xs">
        {CREDIT_PRICE} credits per purchase. Price: ${PRICE_USD} (crypto equivalent).
      </div>
    </div>
  );
}

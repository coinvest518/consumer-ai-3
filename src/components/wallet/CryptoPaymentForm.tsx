import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount, useChainId, useSwitchChain, useSendTransaction } from "wagmi";
import { parseUnits } from "ethers";


// PAYMENT_ADDRESSES is not used in this component. For future multi-chain support, use RECEIVER or refactor as needed.


const TOKENS = [
  // Native tokens
  { symbol: "MATIC", name: "Polygon Amoy", decimals: 18, address: undefined, chains: [80002] },
  { symbol: "ETH", name: "Ethereum", decimals: 18, address: undefined, chains: [1, 42161, 10, 8453, 324, 59144, 534352, 1313161554] },
  { symbol: "MATIC", name: "Polygon", decimals: 18, address: undefined, chains: [137] },
  { symbol: "BNB", name: "BNB Chain", decimals: 18, address: undefined, chains: [56] },
  { symbol: "AVAX", name: "Avalanche", decimals: 18, address: undefined, chains: [43114] },
  { symbol: "FTM", name: "Fantom", decimals: 18, address: undefined, chains: [250] },
  { symbol: "xDAI", name: "Gnosis", decimals: 18, address: undefined, chains: [100] },
  { symbol: "CELO", name: "Celo", decimals: 18, address: undefined, chains: [42220] },
  { symbol: "GLMR", name: "Moonbeam", decimals: 18, address: undefined, chains: [1284] },
  { symbol: "ONE", name: "Harmony", decimals: 18, address: undefined, chains: [1666600000] },
  { symbol: "CRO", name: "Cronos", decimals: 18, address: undefined, chains: [25] },
  // Major stablecoins and tokens (add more as needed)
  { symbol: "USDC", name: "USD Coin", decimals: 6, address: {
      1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      56: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      42161: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      10: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      8453: "0xd9AAEC86B65d86F6A7B5b1b0c42FFA531710b6CA",
      43114: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      250: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
      324: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
      59144: "0xA219439258ca9d89A6E24F6cf7A5E0b67E16dA0c",
      534352: "0x4300000000000000000000000000000000000003",
      100: "0xddafbb505ad214d7b80b1f830fcccc89b60fb7a7",
      42220: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      1284: "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
      25: "0xc21223249ca28397b4b6541dfddc2ebcaa6c6cc9"
    }, chains: [1, 137, 56, 42161, 10, 8453, 43114, 250, 324, 59144, 534352, 100, 42220, 1284, 25] },
  { symbol: "USDT", name: "Tether", decimals: 6, address: {
      1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      137: "0x3813e82e6f7098b9583FC0F33a962D02018B6803",
      56: "0x55d398326f99059fF775485246999027B3197955",
      42161: "0xFd086bC7CD5C481DCC9C85eFfFfaF9cB6325D3A",
      10: "0x94b008aA00579c1307B0EF2c499aD98a8cA99F9F",
      43114: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
      250: "0x049d68029688eAbF473097a2fC38ef61633A3C7A",
      324: "0x503234F203fC7Eb888EEC8513210612a43Cf6115",
      59144: "0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49",
      534352: "0x4300000000000000000000000000000000000004",
      100: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
      42220: "0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0",
      1284: "0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594",
      25: "0x66e428c3f67a68878562e79a0234c1f83c208770"
    }, chains: [1, 137, 56, 42161, 10, 43114, 250, 324, 59144, 534352, 100, 42220, 1284, 25] },
  { symbol: "DAI", name: "Dai Stablecoin", decimals: 18, address: {
      1: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      137: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      56: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
      42161: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      10: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      43114: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
      250: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
      324: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
      59144: "0xA3Fa99A148fA48D14Ed51d610c367C61876997F1",
      534352: "0x4300000000000000000000000000000000000005",
      100: "0x44fA8E6f47987339850636F88629646662444217",
      42220: "0xE4f726Adc8E891A5e69A6dB0aA4d2A3b31b2C8d6",
      1284: "0x80A16016e1bEaA7E9345706697bDd60c4a590524",
      25: "0xf2001b145b43032aaf5ee2884e456ccd805f677d"
    }, chains: [1, 137, 56, 42161, 10, 43114, 250, 324, 59144, 534352, 100, 42220, 1284, 25] },
  { symbol: "WETH", name: "Wrapped Ether", decimals: 18, address: {
      1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      137: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      56: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      42161: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      10: "0x4200000000000000000000000000000000000006",
      43114: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      250: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
      324: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
      59144: "0xE97d6B6e27b8cE0A7A5aB7A6e7e7e7e7e7e7e7e7", // Example, update as needed
      534352: "0x5300000000000000000000000000000000000004", // Example, update as needed
      100: "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
      42220: "0xE919F65739c24eeB9b313c8EAdD5A7A5E3C7D7D7",
      1284: "0xAcc15dC74880C9944775448304B263D191c6077F",
      25: "0x062E66477Faf219F25D27dCED647BF57C3107d52"
    }, chains: [1, 137, 56, 42161, 10, 43114, 250, 324, 59144, 534352, 100, 42220, 1284, 25] },
  // Add more tokens as needed
];

// Map of chainId to unique, user-friendly chain names
const CHAIN_ID_TO_NAME: Record<number, string> = {
  1: "Ethereum Mainnet",
  137: "Polygon",
  80002: "Polygon Amoy",
  56: "BNB Chain",
  42161: "Arbitrum",
  10: "Optimism",
  8453: "Base",
  324: "zkSync Era",
  59144: "Linea",
  534352: "Scroll",
  1313161554: "Aurora",
  43114: "Avalanche",
  250: "Fantom",
  100: "Gnosis",
  42220: "Celo",
  1284: "Moonbeam",
  1666600000: "Harmony",
  25: "Cronos",
};

// Dynamically generate supported chains from TOKENS
const SUPPORTED_CHAINS = Array.from(
  new Set(TOKENS.flatMap(t => t.chains))
).map(chainId => ({
  id: chainId,
  name: CHAIN_ID_TO_NAME[chainId] || `Chain ${chainId}`
}));

const CREDIT_RATE = 1; // 1 USDC = 1 credit (example)

// The address that will receive all crypto payments (must be EVM-compatible and support all listed tokens/chains)
const RECEIVER = "0xDf6aEF8ADc1871dA4f46A5E2866Ff917B53b9584";

export default function CryptoPaymentForm({ onPaymentResult }: { onPaymentResult?: (result: any) => void }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [selectedChain, setSelectedChain] = useState(137); // Default Polygon
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "confirmed" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  // Filter tokens for selected chain
  const availableTokens = TOKENS.filter(t => t.chains.includes(selectedChain));

  // Handle chain switching
  const handleSwitchChain = () => {
    if (switchChain) switchChain({ chainId: selectedChain });
  };


  // Native token transfer only (for demo)
  const isNative = availableTokens.find(t => t.symbol === selectedToken && t.address === undefined);
  const { data: txData, isPending: isTxPending, isSuccess: isTxSuccess, isError: isTxError, error: txError, sendTransaction } = useSendTransaction();

  React.useEffect(() => {
    if (isTxSuccess && txData) {
      setStatus("confirmed");
      setTxHash(txData);
      if (onPaymentResult) onPaymentResult({ success: true, txHash: txData });
    } else if (isTxError) {
      setStatus("failed");
      setError(txError?.message || "Transaction failed");
      if (onPaymentResult) onPaymentResult({ error: txError?.message || "Transaction failed" });
    }
  }, [isTxSuccess, isTxError, txData, txError, onPaymentResult]);

  // Handle payment (custom, no third-party modal)
  const handlePay = async () => {
    setError(null);
    setStatus("pending");
    if (!isConnected) {
      // This check is now redundant as the Header ensures connection.
      // However, leaving it as a fallback.
      setStatus("failed");
      setError("Wallet not connected. Please connect your wallet first.");
      return;
    }
    if (isNative && sendTransaction) {
      sendTransaction({
        to: RECEIVER,
        value: amount ? parseUnits(amount, isNative.decimals) : undefined,
        chainId: selectedChain,
      });
    } else {
      setStatus("failed");
      setError("Invalid transaction config or unsupported token. Only native token transfers are supported in this demo.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500">All payments go to: <span className="font-mono">{RECEIVER}</span></div>
      <div>
        <label className="block mb-1 font-medium">Select Chain</label>
        <select className="w-full border rounded p-2" value={selectedChain} onChange={e => setSelectedChain(Number(e.target.value))}>
          {SUPPORTED_CHAINS.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {chainId !== selectedChain && (
          <Button className="mt-2" onClick={handleSwitchChain}>Switch to {SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name}</Button>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Select Token</label>
        <select className="w-full border rounded p-2" value={selectedToken} onChange={e => setSelectedToken(e.target.value)}>
          {availableTokens.map(t => (
            <option key={t.symbol} value={t.symbol}>{t.name} ({t.symbol})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Amount</label>
        <input
          type="number"
          className="w-full border rounded p-2"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0"
        />
        <div className="text-xs text-gray-500 mt-1">You will receive {Number(amount || 0) * CREDIT_RATE} credits</div>
      </div>
      <Button className="w-full" onClick={handlePay} disabled={!amount || !selectedToken || !selectedChain || status === "pending" || isTxPending}>
        {isTxPending || status === "pending" ? "Processing..." : "Pay with Crypto"}
      </Button>
      {status === "confirmed" && <div className="text-green-600">Payment confirmed! Tx: {txHash}</div>}
      {status === "failed" && <div className="text-red-600">{error || "Payment failed."}</div>}
    </div>
  );
}

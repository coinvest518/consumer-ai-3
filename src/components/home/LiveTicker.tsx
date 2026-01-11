import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Shield, Users, CreditCard, Sparkles, Coins } from 'lucide-react';

interface TickerItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

// Simulated live data - in production, connect to your API or WebSocket
const generateTickerData = (): TickerItem[] => [
  {
    id: 'credit-score',
    icon: <CreditCard className="w-4 h-4" />,
    label: 'Avg Credit Score Boost',
    value: '+127 pts',
    trend: 'up',
    highlight: true,
  },
  {
    id: 'users-active',
    icon: <Users className="w-4 h-4" />,
    label: 'Active Users',
    value: '24,847',
    trend: 'up',
  },
  {
    id: 'disputes-won',
    icon: <Shield className="w-4 h-4" />,
    label: 'Disputes Won',
    value: '98.7%',
    trend: 'up',
    highlight: true,
  },
  {
    id: 'nft-minted',
    icon: <Sparkles className="w-4 h-4" />,
    label: 'Genesis Credit Builder NFTs Minted',
    value: '3,421 / 10,000',
    trend: 'neutral',
  },
  {
    id: 'yield-apy',
    icon: <Coins className="w-4 h-4" />,
    label: 'YieldBot APY',
    value: '12.4%',
    trend: 'up',
    highlight: true,
  },
  {
    id: 'response-time',
    icon: <Zap className="w-4 h-4" />,
    label: 'AI Response Time',
    value: '< 2s',
    trend: 'neutral',
  },
  {
    id: 'letters-generated',
    icon: <Shield className="w-4 h-4" />,
    label: 'Letters Generated Today',
    value: '1,247',
    trend: 'up',
  },
  {
    id: 'tokens-staked',
    icon: <Coins className="w-4 h-4" />,
    label: 'Tokens Staked',
    value: '$2.4M',
    trend: 'up',
    highlight: true,
  },
];

export default function LiveTicker() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(generateTickerData());

  // Simulate live updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerItems(prevItems => 
        prevItems.map(item => {
          // Randomly update some values to simulate live data
          if (item.id === 'users-active') {
            const base = 24847;
            const variance = Math.floor(Math.random() * 100) - 50;
            return { ...item, value: (base + variance).toLocaleString() };
          }
          if (item.id === 'letters-generated') {
            const base = 1247;
            const variance = Math.floor(Math.random() * 20);
            return { ...item, value: (base + variance).toLocaleString() };
          }
          return item;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Double the items for seamless infinite scroll
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/5 border-y border-border/50 py-3">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      
      {/* Scrolling ticker */}
      <motion.div
        className="flex gap-8 items-center"
        animate={{
          x: [0, -50 * tickerItems.length * 4],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 60,
            ease: "linear",
          },
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-1.5 rounded-full ${
              item.highlight 
                ? 'bg-primary/10 border border-primary/20' 
                : 'bg-muted/30'
            }`}
          >
            <span className={`${item.highlight ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.icon}
            </span>
            <span className="text-sm text-muted-foreground">{item.label}:</span>
            <span className={`text-sm font-semibold ${
              item.trend === 'up' ? 'text-green-500' : 
              item.trend === 'down' ? 'text-red-500' : 
              'text-foreground'
            }`}>
              {item.value}
            </span>
            {item.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
            {item.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

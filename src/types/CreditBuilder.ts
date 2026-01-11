import { ReactNode } from "react";

export interface CreditBuilder {
  id: string;
  title: string;
  link: string;
  description: string;
  bonus?: string;
  points: number;
  icon: ReactNode;
  gradient: string;
}

export const creditBuilders: CreditBuilder[] = [
  {
    id: 'chime',
    title: "Chime",
    link: "https://member.chime.com/join/divonwray",
    description: "Get a Free $100 and build credit with no annual fee. Perfect for beginners.",
    bonus: "$100",
    points: 100,
    icon: null, // Replace with icon in page
    gradient: "from-green-500 to-green-600"
  },
  {
    id: 'self',
    title: "Self Inc",
    link: "https://www.self.inc/",
    description: "Build credit while you save with a Credit Builder Account. No credit check required.",
    points: 75,
    icon: null,
    gradient: "from-blue-500 to-blue-600"
  },
  {
    id: 'kickoff',
    title: "Kickoff",
    link: "https://kikoff.com/refer/67PP77ZH",
    description: "Get a free $5 and start building credit with a small credit line.",
    bonus: "$5",
    points: 50,
    icon: null,
    gradient: "from-purple-500 to-purple-600"
  },
  {
    id: 'brigit',
    title: "Brigit",
    link: "https://brigit.app.link/cpFcNVSajub",
    description: "Get free $15 and access credit building features plus cash advances.",
    bonus: "$15",
    points: 60,
    icon: null,
    gradient: "from-red-500 to-red-600"
  },
  {
    id: 'growcredit',
    title: "Grow Credit",
    link: "https://growcredit.com",
    description: "Build credit using your subscription payments like Netflix and Spotify.",
    points: 45,
    icon: null,
    gradient: "from-indigo-500 to-indigo-600"
  },
  {
    id: 'creditstrong',
    title: "Credit Strong",
    link: "https://www.creditstrong.com",
    description: "Build credit and savings simultaneously with secured credit building.",
    points: 70,
    icon: null,
    gradient: "from-cyan-500 to-cyan-600"
  },
  {
    id: 'rentreporter',
    title: "RentReporter",
    link: "https://prf.hn/l/K3wvaqJ",
    description: "Use our link to get a free discount. Report rent payments to build credit.",
    points: 55,
    icon: null,
    gradient: "from-orange-500 to-orange-600"
  },
  {
    id: 'atlas',
    title: "Atlas Credit Card",
    link: "https://apps.apple.com/us/app/id1617487581",
    description: "5x higher approval, 0% APR. Use code: dwra618 for up to $1,000 bonus",
    bonus: "Up to $1,000",
    points: 90,
    icon: null,
    gradient: "from-gray-700 to-gray-800"
  },
  {
    id: 'tradelines',
    title: "Tradelines Made Easy",
    link: "https://www.dpbolvw.net/click-101325994-13503362",
    description: "Boost your credit score with authorized user tradelines.",
    points: 65,
    icon: null,
    gradient: "from-teal-500 to-teal-600"
  }
];

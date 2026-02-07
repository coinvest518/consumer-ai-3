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
  }
];

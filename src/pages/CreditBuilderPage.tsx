
import { creditBuilders as baseCreditBuilders, CreditBuilder } from "@/types/CreditBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Building, Shield, TrendingUp, DollarSign, CreditCard, Verified } from 'lucide-react';
import ElevenLabsChatbot from "@/components/ElevenLabsChatbot";

export default function CreditBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Assign icons locally for SSR compatibility
  const creditBuilders: CreditBuilder[] = baseCreditBuilders.map((b) => {
    let icon = null;
    switch (b.id) {
      case 'chime': icon = <Building className="w-6 h-6" />; break;
      case 'self': icon = <Shield className="w-6 h-6" />; break;
      case 'kickoff': icon = <TrendingUp className="w-6 h-6" />; break;
      case 'brigit': icon = <DollarSign className="w-6 h-6" />; break;
      case 'growcredit': icon = <TrendingUp className="w-6 h-6" />; break;
      case 'creditstrong': icon = <Shield className="w-6 h-6" />; break;
      case 'rentreporter': icon = <Building className="w-6 h-6" />; break;
      case 'atlas': icon = <CreditCard className="w-6 h-6" />; break;
      case 'tradelines': icon = <Verified className="w-6 h-6" />; break;
      default: icon = null;
    }
    return { ...b, icon };
  });

  const handleClick = async (builder: CreditBuilder) => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to earn credits." });
      return;
    }
    try {
      await fetch("/api/credit-builder-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ builderId: builder.id, userId: user.id, points: builder.points }),
      });
      window.open(builder.link, "_blank");
      toast({ title: "Credits Awarded!", description: `You earned ${builder.points} credits.` });
    } catch (e) {
      toast({ title: "Error", description: "Could not track or award credits." });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Credit Builder Offers</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {creditBuilders.map((builder) => (
          <div key={builder.id} className={`rounded-lg p-4 bg-gradient-to-r ${builder.gradient} text-white`}>
            <div className="flex items-center gap-3 mb-2">
              {builder.icon}
              <span className="font-semibold text-lg">{builder.title}</span>
            </div>
            <p className="mb-2">{builder.description}</p>
            <button
              className="bg-white text-black px-3 py-1 rounded shadow"
              onClick={() => handleClick(builder)}
            >
              Visit & Earn {builder.points} credits
            </button>
          </div>
        ))}
      </div>
      <ElevenLabsChatbot />
    </div>
  );
}

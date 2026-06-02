import type { LucideIcon } from "lucide-react";
import {
  Store, Briefcase, Ruler, ShoppingBag, ShoppingCart, HeartPulse,
  UtensilsCrossed, PartyPopper, Dumbbell, Building2, Factory, Wallet, LayoutGrid,
} from "lucide-react";

/** Mapeia o nome de ícone do nicho (string no config) para o componente lucide. */
export const NICHE_ICONS: Record<string, LucideIcon> = {
  Store, Briefcase, Ruler, ShoppingBag, ShoppingCart, HeartPulse,
  UtensilsCrossed, PartyPopper, Dumbbell, Building2, Factory, Wallet, LayoutGrid,
};

export function nicheIcon(name: string): LucideIcon {
  return NICHE_ICONS[name] ?? LayoutGrid;
}

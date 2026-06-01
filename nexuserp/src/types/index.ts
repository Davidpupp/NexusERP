export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PlanSlug = "start" | "growth" | "enterprise";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  setupFee: number;
  userLimit: number | null;
  features: string[];
  isPopular: boolean;
}

export interface KpiMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface CheckoutState {
  planId: string;
  planName: string;
  planPrice: number;
  setupFee: number;
  discount: number;
  formData?: {
    name: string;
    email: string;
    phone: string;
    companyName: string;
    cnpj?: string;
  };
}

"use client";

// Tokenização de cartão no client com MP.js. O PAN nunca é enviado ao nosso
// servidor — só o token gerado pelo Mercado Pago.

interface MpInstance {
  createCardToken(data: Record<string, string>): Promise<{ id: string }>;
  getPaymentMethods(opts: { bin: string }): Promise<{ results: { id: string }[] }>;
}
declare global {
  interface Window {
    MercadoPago?: new (key: string, opts?: { locale: string }) => MpInstance;
  }
}

let loader: Promise<void> | null = null;
function loadSdk(): Promise<void> {
  if (typeof window !== "undefined" && window.MercadoPago) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://sdk.mercadopago.com/js/v2";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar MP.js"));
    document.head.appendChild(s);
  });
  return loader;
}

export interface CardFormInput {
  cardNumber: string;
  cardName: string;
  expiry: string; // MM/AA
  cvv: string;
  installments: string;
  document: string;
}

export interface CardToken {
  token: string;
  installments: number;
  paymentMethodId: string;
  docType: string;
  docNumber: string;
}

export async function tokenizeCard(publicKey: string, input: CardFormInput): Promise<CardToken> {
  await loadSdk();
  if (!window.MercadoPago) throw new Error("MP.js indisponível");
  const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });

  const cardNumber = input.cardNumber.replace(/\s+/g, "");
  const [mm, yy] = input.expiry.split("/").map((s) => s.trim());
  const docNumber = input.document.replace(/\D/g, "");

  const token = await mp.createCardToken({
    cardNumber,
    cardholderName: input.cardName,
    cardExpirationMonth: mm,
    cardExpirationYear: yy.length === 2 ? `20${yy}` : yy,
    securityCode: input.cvv,
    identificationType: "CPF",
    identificationNumber: docNumber,
  });

  const pm = await mp.getPaymentMethods({ bin: cardNumber.slice(0, 6) });
  const paymentMethodId = pm.results?.[0]?.id;
  if (!paymentMethodId) throw new Error("Cartão não reconhecido");

  return {
    token: token.id,
    installments: Number(input.installments) || 1,
    paymentMethodId,
    docType: "CPF",
    docNumber,
  };
}

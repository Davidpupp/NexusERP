"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#FAFAFA",
          color: "#33363A",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Erro crítico</h1>
        <p style={{ marginTop: 8, color: "#6B7180" }}>
          A aplicação encontrou um problema. Recarregue a página.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 32,
            background: "#FFD54A",
            color: "#33363A",
            border: "none",
            borderRadius: 9999,
            padding: "12px 24px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}

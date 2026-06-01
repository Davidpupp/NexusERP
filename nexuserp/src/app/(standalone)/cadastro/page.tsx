import { redirect } from "next/navigation";

/**
 * Cadastro público gratuito foi REMOVIDO — a NexusERP é um produto pago e o
 * acesso só é liberado após contratação. Esta rota permanece apenas para não
 * quebrar links antigos e redireciona para a aquisição comercial.
 */
export default function CadastroPage() {
  redirect("/checkout");
}

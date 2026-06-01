"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Field, TextInput, Select, PrimaryButton } from "@/components/ui/form";
import { companySettingsSchema, inviteSchema } from "@/lib/validations";
import { updateCompanySettings, updateMemberRole } from "@/actions/companySettings";
import { inviteUser } from "@/actions/invite";

type Role = "OWNER" | "ADMIN" | "MANAGER" | "FINANCE" | "SALES" | "OPERATION" | "CLIENT";
const ROLES: Role[] = ["OWNER", "ADMIN", "MANAGER", "FINANCE", "SALES", "OPERATION", "CLIENT"];
const INVITE_ROLES = ["ADMIN", "MANAGER", "FINANCE", "SALES", "OPERATION", "CLIENT"] as const;

interface Member { id: string; name: string | null; email: string | null; role: Role }

export function SettingsManager({
  myRole,
  company,
  members,
}: {
  readonly myRole: Role;
  readonly company: { name: string; cnpj: string | null };
  readonly members: Member[];
}) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: { name: company.name, cnpj: company.cnpj ?? "" },
  });
  const [savingId, setSavingId] = useState<string | null>(null);

  const onSubmit = async (v: typeof companySettingsSchema._input) => {
    const res = await updateCompanySettings(v);
    if (res.success) { toast.success("Configurações salvas"); router.refresh(); } else toast.error(res.error);
  };

  const canInvite = myRole === "OWNER" || myRole === "ADMIN";
  const inviteForm = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: "", email: "", role: "MANAGER" as (typeof INVITE_ROLES)[number] },
  });

  const onInvite = async (v: typeof inviteSchema._input) => {
    const res = await inviteUser(v);
    if (res.success) {
      toast.success("Convite enviado por e-mail");
      inviteForm.reset();
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const changeRole = async (memberId: string, role: Role) => {
    setSavingId(memberId);
    const res = await updateMemberRole(memberId, role);
    setSavingId(null);
    if (res.success) { toast.success("Papel atualizado"); router.refresh(); } else toast.error(res.error);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Company */}
      <div className="bg-graphite-surface rounded-xl border border-d-border p-6">
        <h2 className="text-sm font-semibold text-ice-white mb-4">Dados da empresa</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Nome da empresa" error={errors.name?.message}><TextInput {...register("name")} /></Field>
          <Field label="CNPJ" error={errors.cnpj?.message}><TextInput {...register("cnpj")} placeholder="00.000.000/0001-00" /></Field>
          <PrimaryButton type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</PrimaryButton>
        </form>
      </div>

      {/* Invite */}
      {canInvite && (
        <div className="bg-graphite-surface rounded-xl border border-d-border p-6">
          <h2 className="text-sm font-semibold text-ice-white mb-1">Convidar membro</h2>
          <p className="text-xs text-d-on-surface-variant mb-4">
            O convidado recebe um e-mail para criar a senha e acessar. Não há cadastro público.
          </p>
          <form onSubmit={inviteForm.handleSubmit(onInvite)} className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome" error={inviteForm.formState.errors.name?.message}>
              <TextInput {...inviteForm.register("name")} placeholder="Nome do membro" />
            </Field>
            <Field label="E-mail" error={inviteForm.formState.errors.email?.message}>
              <TextInput {...inviteForm.register("email")} type="email" placeholder="membro@empresa.com.br" />
            </Field>
            <Field label="Papel" error={inviteForm.formState.errors.role?.message}>
              <Select {...inviteForm.register("role")}>
                {INVITE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <div className="flex items-end">
              <PrimaryButton type="submit" disabled={inviteForm.formState.isSubmitting}>
                {inviteForm.formState.isSubmitting ? "Enviando..." : "Enviar convite"}
              </PrimaryButton>
            </div>
          </form>
        </div>
      )}

      {/* Members */}
      <div className="bg-graphite-surface rounded-xl border border-d-border overflow-hidden">
        <div className="px-6 py-4 border-b border-d-border">
          <h2 className="text-sm font-semibold text-ice-white">Membros da equipe</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem]">
          <thead><tr className="bg-d-surface-container">{["Nome", "E-mail", "Papel"].map((h) => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-d-border">
                <td className="px-6 py-3 text-sm text-ice-white">{m.name ?? "—"}</td>
                <td className="px-6 py-3 text-xs text-d-on-surface-variant">{m.email ?? "—"}</td>
                <td className="px-6 py-3">
                  {myRole === "OWNER" ? (
                    <Select
                      value={m.role}
                      disabled={savingId === m.id}
                      onChange={(e) => changeRole(m.id, e.target.value as Role)}
                      className="!w-44 !py-1.5"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  ) : (
                    <span className="text-sm text-d-on-surface-variant">{m.role}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

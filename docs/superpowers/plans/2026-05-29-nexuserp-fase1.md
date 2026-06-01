# NexusERP Fase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build NexusERP — site público + checkout + auth + app shell + dashboard, tema claro premium, stack Next.js 14.

**Architecture:** Next.js 14 App Router com route groups `(public)` e `(app)`. Server Actions para mutações. Prisma + PostgreSQL para dados. NextAuth para sessão. shadcn/ui + Tailwind com tokens da marca.

**Tech Stack:** Next.js 14, TypeScript, TailwindCSS, shadcn/ui, Prisma, PostgreSQL, NextAuth v5, Zod, React Hook Form, Recharts, Lucide React, Framer Motion, Resend (mock).

---

## File Map

```
src/
  app/
    (public)/
      page.tsx                    # Homepage
      planos/page.tsx             # Pricing page  
      checkout/page.tsx           # Step 1: dados
      checkout/pagamento/page.tsx # Step 2: pagamento
      checkout/sucesso/page.tsx   # Step 3: sucesso
      login/page.tsx
      cadastro/page.tsx
      layout.tsx                  # Navbar + Footer
    (app)/
      app/
        layout.tsx                # Sidebar + Header
        dashboard/page.tsx
        financeiro/page.tsx
        vendas/page.tsx
        clientes/page.tsx
        estoque/page.tsx
      onboarding/page.tsx
    api/auth/[...nextauth]/route.ts
    layout.tsx                    # Root layout (fonts, providers)
    globals.css

  components/
    site/
      Navbar.tsx
      Footer.tsx
      HeroSection.tsx
      FeaturesSection.tsx
      PlansSection.tsx
      DashboardMockup.tsx
    app/
      AppSidebar.tsx
      AppHeader.tsx
    ui/                           # shadcn components
    charts/
      RevenueChart.tsx
      CategoryChart.tsx

  lib/
    auth.ts                       # NextAuth config
    prisma.ts                     # Prisma client singleton
    utils.ts                      # cn() + helpers
    validations.ts                # Zod schemas

  actions/
    auth.ts
    checkout.ts
    customers.ts
    transactions.ts

  types/index.ts

prisma/
  schema.prisma
  seed.ts
```

---

## Task 1: Initialize Project

- [ ] Run in `c:\Users\davip\Downloads\site modelo\NexusERP`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

- [ ] Install dependencies:
```bash
npm install @prisma/client prisma next-auth@beta @auth/prisma-adapter zod react-hook-form @hookform/resolvers bcryptjs recharts lucide-react framer-motion class-variance-authority clsx tailwind-merge
npm install -D @types/bcryptjs prisma
```

- [ ] Initialize shadcn/ui:
```bash
npx shadcn@latest init
```
Escolher: Default style, Zinc base color, CSS variables: yes.

- [ ] Install shadcn components:
```bash
npx shadcn@latest add button card input label select textarea badge dialog dropdown-menu separator sheet skeleton tabs toast form table
```

- [ ] Commit: `chore: initialize Next.js 14 project with shadcn/ui`

---

## Task 2: Configure Tailwind + Fonts + Tokens

- [ ] Update `tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        banana: { DEFAULT: "#FFD54A", dark: "#F6C400", light: "#FFF3C4" },
        graphite: "#33363A",
        warmWhite: "#FAFAFA",
        softGray: "#F1F2F4",
        silver: "#C7CCD1",
        border: "#E5E7EB",
        muted: "#6B7280",
        success: "#16A34A",
        danger: "#DC2626",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

- [ ] Update `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 98%;
    --foreground: 216 8% 21%;
    --primary: 44 100% 64%;
    --primary-foreground: 0 0% 10%;
    --radius: 0.75rem;
  }
  body {
    @apply bg-warmWhite text-graphite font-inter;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-sora;
  }
}
```

- [ ] Update `src/app/layout.tsx` with Google Fonts (Sora + Inter):
```tsx
import type { Metadata } from "next"
import { Sora, Inter } from "next/font/google"
import "./globals.css"

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "nexusERP — Conectando processos. Impulsionando resultados.",
  description: "Plataforma SaaS de gestão empresarial integrada para lojas, negócios e comércios brasileiros.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${sora.variable} ${inter.variable}`}>{children}</body>
    </html>
  )
}
```

- [ ] Create `src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date))
}
```

- [ ] Commit: `feat: configure Tailwind tokens and fonts for NexusERP brand`

---

## Task 3: Prisma Schema

- [ ] Initialize Prisma:
```bash
npx prisma init --datasource-provider postgresql
```

- [ ] Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  OWNER
  ADMIN
  MANAGER
  FINANCE
  SALES
  OPERATION
  CLIENT
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELED
  EXPIRED
}

enum OrderStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  CREDIT_CARD
  PIX
  BOLETO
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum TransactionType {
  INCOME
  EXPENSE
}

enum TransactionStatus {
  PENDING
  PAID
  OVERDUE
  CANCELED
}

enum OpportunityStage {
  NEW_LEAD
  CONTACTED
  PROPOSAL_SENT
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}

enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  ON_HOLD
  COMPLETED
  CANCELED
}

enum TaskStatus {
  BACKLOG
  IN_PROGRESS
  IN_REVIEW
  COMPLETED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_CLIENT
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model User {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  passwordHash String?
  image        String?
  role         UserRole      @default(ADMIN)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  memberships  CompanyMember[]
  assignedTasks Task[]       @relation("TaskAssignee")
  tickets      SupportTicket[]
  auditLogs    AuditLog[]
  accounts     Account[]
  sessions     Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Company {
  id             String         @id @default(cuid())
  name           String
  cnpj           String?        @unique
  segment        String?
  employeeCount  Int?
  logoUrl        String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  members        CompanyMember[]
  subscriptions  Subscription[]
  orders         Order[]
  customers      Customer[]
  products       Product[]
  transactions   Transaction[]
  projects       Project[]
  tickets        SupportTicket[]
  auditLogs      AuditLog[]
  opportunities  Opportunity[]
  purchaseOrders PurchaseOrder[]
  automations    Automation[]
}

model CompanyMember {
  id        String   @id @default(cuid())
  userId    String
  companyId String
  role      UserRole @default(ADMIN)
  status    String   @default("ACTIVE")
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  company   Company  @relation(fields: [companyId], references: [id])
  @@unique([userId, companyId])
}

model Plan {
  id           String         @id @default(cuid())
  name         String
  slug         String         @unique
  price        Float
  setupFee     Float          @default(0)
  userLimit    Int?
  features     String[]
  isPopular    Boolean        @default(false)
  createdAt    DateTime       @default(now())
  subscriptions Subscription[]
  orders       Order[]
}

model Subscription {
  id                  String             @id @default(cuid())
  companyId           String
  planId              String
  status              SubscriptionStatus @default(TRIAL)
  currentPeriodStart  DateTime           @default(now())
  currentPeriodEnd    DateTime
  cancelAtPeriodEnd   Boolean            @default(false)
  createdAt           DateTime           @default(now())
  company             Company            @relation(fields: [companyId], references: [id])
  plan                Plan               @relation(fields: [planId], references: [id])
}

model Order {
  id        String      @id @default(cuid())
  companyId String
  planId    String
  amount    Float
  setupFee  Float       @default(0)
  discount  Float       @default(0)
  total     Float
  status    OrderStatus @default(PENDING)
  createdAt DateTime    @default(now())
  company   Company     @relation(fields: [companyId], references: [id])
  plan      Plan        @relation(fields: [planId], references: [id])
  payments  Payment[]
}

model Payment {
  id                String        @id @default(cuid())
  orderId           String
  method            PaymentMethod
  status            PaymentStatus @default(PENDING)
  amount            Float
  provider          String        @default("mock")
  providerPaymentId String?
  paidAt            DateTime?
  createdAt         DateTime      @default(now())
  order             Order         @relation(fields: [orderId], references: [id])
}

model Customer {
  id            String        @id @default(cuid())
  companyId     String
  name          String
  email         String?
  phone         String?
  cnpj          String?
  segment       String?
  status        String        @default("ACTIVE")
  notes         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  company       Company       @relation(fields: [companyId], references: [id])
  opportunities Opportunity[]
  tickets       SupportTicket[]
}

model Opportunity {
  id             String           @id @default(cuid())
  companyId      String
  customerId     String?
  title          String
  estimatedValue Float            @default(0)
  stage          OpportunityStage @default(NEW_LEAD)
  ownerId        String?
  nextAction     String?
  status         String           @default("OPEN")
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  company        Company          @relation(fields: [companyId], references: [id])
  customer       Customer?        @relation(fields: [customerId], references: [id])
}

model Supplier {
  id             String          @id @default(cuid())
  companyId      String
  name           String
  email          String?
  phone          String?
  cnpj           String?
  createdAt      DateTime        @default(now())
  products       Product[]
  purchaseOrders PurchaseOrder[]
}

model Product {
  id            String              @id @default(cuid())
  companyId     String
  name          String
  sku           String?
  category      String?
  quantity      Int                 @default(0)
  minQuantity   Int                 @default(0)
  costPrice     Float               @default(0)
  salePrice     Float               @default(0)
  supplierId    String?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
  company       Company             @relation(fields: [companyId], references: [id])
  supplier      Supplier?           @relation(fields: [supplierId], references: [id])
  movements     InventoryMovement[]
}

model InventoryMovement {
  id        String   @id @default(cuid())
  productId String
  type      String
  quantity  Int
  notes     String?
  createdAt DateTime @default(now())
  product   Product  @relation(fields: [productId], references: [id])
}

model PurchaseOrder {
  id           String   @id @default(cuid())
  companyId    String
  supplierId   String?
  total        Float    @default(0)
  status       String   @default("PENDING")
  expectedDate DateTime?
  createdAt    DateTime @default(now())
  company      Company  @relation(fields: [companyId], references: [id])
  supplier     Supplier? @relation(fields: [supplierId], references: [id])
}

model CostCenter {
  id           String        @id @default(cuid())
  companyId    String
  name         String
  createdAt    DateTime      @default(now())
  transactions Transaction[]
}

model Transaction {
  id           String            @id @default(cuid())
  companyId    String
  description  String
  category     String
  type         TransactionType
  amount       Float
  status       TransactionStatus @default(PENDING)
  method       String?
  dueDate      DateTime?
  paidAt       DateTime?
  costCenterId String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  company      Company           @relation(fields: [companyId], references: [id])
  costCenter   CostCenter?       @relation(fields: [costCenterId], references: [id])
}

model Project {
  id          String        @id @default(cuid())
  companyId   String
  name        String
  description String?
  status      ProjectStatus @default(PLANNING)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  company     Company       @relation(fields: [companyId], references: [id])
  tasks       Task[]
}

model Task {
  id          String       @id @default(cuid())
  companyId   String
  projectId   String?
  title       String
  description String?
  status      TaskStatus   @default(BACKLOG)
  priority    TaskPriority @default(MEDIUM)
  assigneeId  String?
  dueDate     DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  project     Project?     @relation(fields: [projectId], references: [id])
  assignee    User?        @relation("TaskAssignee", fields: [assigneeId], references: [id])
}

model SupportTicket {
  id         String         @id @default(cuid())
  companyId  String
  customerId String?
  userId     String?
  subject    String
  category   String?
  priority   TicketPriority @default(MEDIUM)
  status     TicketStatus   @default(OPEN)
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
  company    Company        @relation(fields: [companyId], references: [id])
  customer   Customer?      @relation(fields: [customerId], references: [id])
  user       User?          @relation(fields: [userId], references: [id])
  messages   SupportMessage[]
}

model SupportMessage {
  id        String        @id @default(cuid())
  ticketId  String
  senderId  String?
  content   String
  createdAt DateTime      @default(now())
  ticket    SupportTicket @relation(fields: [ticketId], references: [id])
}

model Automation {
  id            String    @id @default(cuid())
  companyId     String
  name          String
  description   String?
  trigger       String
  action        String
  status        String    @default("ACTIVE")
  lastRunAt     DateTime?
  createdAt     DateTime  @default(now())
  company       Company   @relation(fields: [companyId], references: [id])
}

model AuditLog {
  id        String   @id @default(cuid())
  companyId String?
  userId    String?
  action    String
  entity    String
  entityId  String?
  metadata  Json?
  createdAt DateTime @default(now())
  company   Company? @relation(fields: [companyId], references: [id])
  user      User?    @relation(fields: [userId], references: [id])
}
```

- [ ] Create `.env.local`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/nexuserp"
AUTH_SECRET="your-secret-here-32-chars-minimum"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] Run migration:
```bash
npx prisma migrate dev --name init
```

- [ ] Commit: `feat: add complete Prisma schema for NexusERP`

---

## Task 4: Seed Data

- [ ] Create `prisma/seed.ts` and `src/lib/prisma.ts`:

`src/lib/prisma.ts`:
```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

`prisma/seed.ts` — ver arquivo completo gerado na implementação.

- [ ] Add to `package.json`:
```json
"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
```

- [ ] Run: `npx prisma db seed`

- [ ] Commit: `feat: add database seed with plans, admin user, sample data`

---

## Task 5: NextAuth Authentication

- [ ] Create `src/lib/auth.ts`:
```ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.passwordHash) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id as string
      return session
    },
  },
})
```

- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

- [ ] Create `src/middleware.ts`:
```ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAppRoute = req.nextUrl.pathname.startsWith("/app")
  if (isAppRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  return NextResponse.next()
})

export const config = { matcher: ["/app/:path*"] }
```

- [ ] Commit: `feat: add NextAuth with Prisma adapter and JWT session`

---

## Task 6: Public Layout + Navbar + Footer

- [ ] Create `src/app/(public)/layout.tsx` — wraps Navbar + Footer
- [ ] Create `src/components/site/Navbar.tsx` — sticky, blur on scroll, logo + nav links + CTA button
- [ ] Create `src/components/site/Footer.tsx` — 4 colunas + logo + copyright
- [ ] Commit: `feat: add public layout with Navbar and Footer`

---

## Task 7: Homepage

- [ ] `src/app/(public)/page.tsx` — imports all sections
- [ ] `src/components/site/HeroSection.tsx` — headline + CTA + dashboard mockup HTML/CSS
- [ ] `src/components/site/ProblemsSection.tsx` — 5 cards de dor
- [ ] `src/components/site/SolutionSection.tsx` — módulos conectados
- [ ] `src/components/site/FeaturesSection.tsx` — grid 3×3 de recursos
- [ ] `src/components/site/DashboardPreview.tsx` — mockup grande com Recharts
- [ ] `src/components/site/SegmentsSection.tsx` — 6 cards de segmento
- [ ] `src/components/site/IntegrationsSection.tsx` — logos de integração
- [ ] `src/components/site/PlansSection.tsx` — 3 planos (Start/Growth/Enterprise)
- [ ] `src/components/site/TestimonialsSection.tsx` — 3 depoimentos
- [ ] `src/components/site/FaqSection.tsx` — accordion com 10 perguntas
- [ ] `src/components/site/CtaSection.tsx` — banner final com botões
- [ ] Commit: `feat: add complete homepage with all sections`

---

## Task 8: Planos + Checkout

- [ ] `src/app/(public)/planos/page.tsx`
- [ ] `src/app/(public)/checkout/page.tsx` — formulário dados + resumo do plano
- [ ] `src/app/(public)/checkout/pagamento/page.tsx` — abas Cartão/Pix/Boleto
- [ ] `src/app/(public)/checkout/sucesso/page.tsx` — confirmação
- [ ] `src/actions/checkout.ts` — Server Actions para criar order, payment, company, user, subscription
- [ ] `src/lib/validations.ts` — Zod schemas: checkoutFormSchema, paymentFormSchema
- [ ] Commit: `feat: add plans page and complete checkout flow`

---

## Task 9: Auth Pages + Onboarding

- [ ] `src/app/(public)/login/page.tsx`
- [ ] `src/app/(public)/cadastro/page.tsx`
- [ ] `src/app/(app)/onboarding/page.tsx` — 5 etapas: empresa, preferências, usuários, módulos, finalização
- [ ] `src/actions/auth.ts` — register Server Action com bcrypt
- [ ] Commit: `feat: add login, register, and onboarding pages`

---

## Task 10: App Shell

- [ ] `src/app/(app)/app/layout.tsx` — sidebar + header + main content
- [ ] `src/components/app/AppSidebar.tsx` — navegação com todos os módulos, estado ativo, yellow accent
- [ ] `src/components/app/AppHeader.tsx` — busca, sino, avatar, breadcrumb
- [ ] Commit: `feat: add app shell with sidebar and header`

---

## Task 11: Dashboard

- [ ] `src/app/(app)/app/dashboard/page.tsx`
- [ ] `src/components/app/StatCard.tsx` — card KPI reutilizável
- [ ] `src/components/charts/RevenueChart.tsx` — Recharts LineChart (Receita vs Despesa)
- [ ] `src/components/charts/CategoryChart.tsx` — Recharts BarChart horizontal
- [ ] `src/actions/dashboard.ts` — queries agregadas do banco
- [ ] Commit: `feat: add dashboard with KPI cards and charts`

---

## Task 12: Core ERP Modules (Fase 2 preview)

- [ ] `src/app/(app)/app/financeiro/page.tsx` — tabela de transações + CRUD
- [ ] `src/app/(app)/app/vendas/page.tsx` — funil Kanban + oportunidades
- [ ] `src/app/(app)/app/clientes/page.tsx` — tabela clientes + CRUD
- [ ] `src/app/(app)/app/estoque/page.tsx` — produtos + movimentações
- [ ] Respective Server Actions para cada módulo
- [ ] Commit: `feat: add core ERP modules (financial, sales, customers, inventory)`

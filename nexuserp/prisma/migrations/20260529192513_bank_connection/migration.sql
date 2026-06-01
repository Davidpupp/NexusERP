-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual';

-- CreateTable
CREATE TABLE "BankConnection" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'pluggy',
    "itemId" TEXT NOT NULL,
    "institutionName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankConnection_itemId_key" ON "BankConnection"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_companyId_externalId_key" ON "Transaction"("companyId", "externalId");

-- AddForeignKey
ALTER TABLE "BankConnection" ADD CONSTRAINT "BankConnection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_chatId_key" ON "Analysis"("chatId");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

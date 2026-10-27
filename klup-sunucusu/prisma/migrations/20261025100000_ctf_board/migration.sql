-- CreateTable
CREATE TABLE "CtfSolve" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeKey" TEXT NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfSolve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfHintUnlock" (
    "userId" TEXT NOT NULL,
    "challengeKey" TEXT NOT NULL,
    "hint" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfHintUnlock_pkey" PRIMARY KEY ("userId","challengeKey","hint")
);

-- CreateIndex
CREATE INDEX "CtfSolve_challengeKey_createdAt_idx" ON "CtfSolve"("challengeKey", "createdAt");

-- CreateIndex
CREATE INDEX "CtfSolve_teamId_idx" ON "CtfSolve"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "CtfSolve_userId_challengeKey_key" ON "CtfSolve"("userId", "challengeKey");

-- AddForeignKey
ALTER TABLE "CtfSolve" ADD CONSTRAINT "CtfSolve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfHintUnlock" ADD CONSTRAINT "CtfHintUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

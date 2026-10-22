-- CreateEnum
CREATE TYPE "PresentationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "LiveEventType" AS ENUM ('QUESTION', 'ANNOUNCEMENT', 'HAND');

-- CreateTable
CREATE TABLE "Presentation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "PresentationStatus" NOT NULL DEFAULT 'DRAFT',
    "ownerId" TEXT,
    "currentVersionId" TEXT,
    "templateKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentationVersion" (
    "id" TEXT NOT NULL,
    "presentationId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "meta" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresentationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "steps" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "presentationId" TEXT,
    "versionId" TEXT NOT NULL,
    "hostId" TEXT,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "state" JSONB NOT NULL,
    "stateVersion" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstJoinAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectedMs" INTEGER NOT NULL DEFAULT 0,
    "connectCount" INTEGER NOT NULL DEFAULT 0,
    "handRaisedAt" TIMESTAMP(3),

    CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSessionEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "LiveEventType" NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveSessionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Presentation_currentVersionId_key" ON "Presentation"("currentVersionId");

-- CreateIndex
CREATE INDEX "Presentation_status_updatedAt_idx" ON "Presentation"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Presentation_ownerId_idx" ON "Presentation"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "PresentationVersion_presentationId_number_key" ON "PresentationVersion"("presentationId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Slide_versionId_position_key" ON "Slide"("versionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "LiveSession_code_key" ON "LiveSession"("code");

-- CreateIndex
CREATE INDEX "LiveSession_status_startedAt_idx" ON "LiveSession"("status", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_sessionId_userId_key" ON "SessionParticipant"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "LiveSessionEvent_sessionId_type_createdAt_idx" ON "LiveSessionEvent"("sessionId", "type", "createdAt");

-- AddForeignKey
ALTER TABLE "Presentation" ADD CONSTRAINT "Presentation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presentation" ADD CONSTRAINT "Presentation_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "PresentationVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentationVersion" ADD CONSTRAINT "PresentationVersion_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentationVersion" ADD CONSTRAINT "PresentationVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PresentationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PresentationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSessionEvent" ADD CONSTRAINT "LiveSessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSessionEvent" ADD CONSTRAINT "LiveSessionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

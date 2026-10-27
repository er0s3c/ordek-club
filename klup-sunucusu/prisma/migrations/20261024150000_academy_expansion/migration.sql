-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "activities" JSONB,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "LivePoll" ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'LIVE';

-- CreateTable
CREATE TABLE "LearningPreference" (
    "userId" TEXT NOT NULL,
    "dailyGoal" INTEGER NOT NULL DEFAULT 1,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT NOT NULL DEFAULT '19:00',
    "reminderEmail" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "protectionStart" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "LearningEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamProtection" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "startsOn" TEXT NOT NULL,
    "endsOn" TEXT NOT NULL,
    "memberIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamProtection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPersonal" (
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonPersonal_pkey" PRIMARY KEY ("userId","lessonId")
);

-- CreateTable
CREATE TABLE "ReviewCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "questionIndex" INTEGER NOT NULL,
    "contentHash" TEXT NOT NULL,
    "question" JSONB NOT NULL,
    "consecutive" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningReminder" (
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningReminder_pkey" PRIMARY KEY ("userId","day")
);

-- CreateTable
CREATE TABLE "FeatureSwitch" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "enabledAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureSwitch_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "LessonTranslation" (
    "lessonId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "goals" TEXT[],
    "activities" JSONB,
    "contentHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonTranslation_pkey" PRIMARY KEY ("lessonId","locale")
);

-- CreateTable
CREATE TABLE "ActivitySolution" (
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "solvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivitySolution_pkey" PRIMARY KEY ("userId","lessonId","activityId","contentHash")
);

-- CreateTable
CREATE TABLE "PlacementAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioWork" (
    "userId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioWork_pkey" PRIMARY KEY ("userId","submissionId")
);

-- CreateTable
CREATE TABLE "BankQuestion" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionRevision" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomOperation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "scenarioVersion" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "stage" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "history" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationParticipant" (
    "operationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "team" INTEGER NOT NULL,

    CONSTRAINT "OperationParticipant_pkey" PRIMARY KEY ("operationId","userId")
);

-- CreateTable
CREATE TABLE "OperationVote" (
    "operationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "choice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationVote_pkey" PRIMARY KEY ("operationId","userId","stage")
);

-- CreateTable
CREATE TABLE "CtfTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "joinCodeHash" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfTeamMember" (
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfTeamMember_pkey" PRIMARY KEY ("teamId","userId")
);

-- CreateTable
CREATE TABLE "ReportDraft" (
    "userId" TEXT NOT NULL,
    "labKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportDraft_pkey" PRIMARY KEY ("userId","labKey")
);

-- CreateTable
CREATE TABLE "SocAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertKey" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackExam" (
    "trackId" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackExam_pkey" PRIMARY KEY ("trackId")
);

-- CreateTable
CREATE TABLE "TrackExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "examVersion" INTEGER NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" INTEGER,
    "passed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TrackExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningCertificate" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "trackTitle" TEXT NOT NULL,
    "shareName" BOOLEAN NOT NULL DEFAULT false,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningEvent_userId_day_idx" ON "LearningEvent"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "LearningEvent_userId_key_key" ON "LearningEvent"("userId", "key");

-- CreateIndex
CREATE INDEX "ExamProtection_groupId_startsOn_idx" ON "ExamProtection"("groupId", "startsOn");

-- CreateIndex
CREATE INDEX "LearningPlan_userId_day_idx" ON "LearningPlan"("userId", "day");

-- CreateIndex
CREATE INDEX "ReviewCard_userId_dueAt_idx" ON "ReviewCard"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewCard_userId_lessonId_questionIndex_key" ON "ReviewCard"("userId", "lessonId", "questionIndex");

-- CreateIndex
CREATE INDEX "PlacementAttempt_userId_createdAt_idx" ON "PlacementAttempt"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionRevision_questionId_number_key" ON "QuestionRevision"("questionId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomOperation_sessionId_key" ON "ClassroomOperation"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CtfTeam_name_key" ON "CtfTeam"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CtfTeam_joinCodeHash_key" ON "CtfTeam"("joinCodeHash");

-- CreateIndex
CREATE UNIQUE INDEX "CtfTeamMember_userId_key" ON "CtfTeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocAttempt_userId_alertKey_key" ON "SocAttempt"("userId", "alertKey");

-- CreateIndex
CREATE INDEX "TrackExamAttempt_userId_trackId_createdAt_idx" ON "TrackExamAttempt"("userId", "trackId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LearningCertificate_token_key" ON "LearningCertificate"("token");

-- CreateIndex
CREATE UNIQUE INDEX "LearningCertificate_userId_trackId_key" ON "LearningCertificate"("userId", "trackId");

-- AddForeignKey
ALTER TABLE "LearningPreference" ADD CONSTRAINT "LearningPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamProtection" ADD CONSTRAINT "ExamProtection_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPlan" ADD CONSTRAINT "LearningPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPersonal" ADD CONSTRAINT "LessonPersonal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPersonal" ADD CONSTRAINT "LessonPersonal_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewCard" ADD CONSTRAINT "ReviewCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewCard" ADD CONSTRAINT "ReviewCard_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningReminder" ADD CONSTRAINT "LearningReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTranslation" ADD CONSTRAINT "LessonTranslation_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySolution" ADD CONSTRAINT "ActivitySolution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySolution" ADD CONSTRAINT "ActivitySolution_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementAttempt" ADD CONSTRAINT "PlacementAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioWork" ADD CONSTRAINT "PortfolioWork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankQuestion" ADD CONSTRAINT "BankQuestion_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionRevision" ADD CONSTRAINT "QuestionRevision_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BankQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomOperation" ADD CONSTRAINT "ClassroomOperation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationParticipant" ADD CONSTRAINT "OperationParticipant_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ClassroomOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationParticipant" ADD CONSTRAINT "OperationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationVote" ADD CONSTRAINT "OperationVote_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ClassroomOperation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationVote" ADD CONSTRAINT "OperationVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfTeam" ADD CONSTRAINT "CtfTeam_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfTeamMember" ADD CONSTRAINT "CtfTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "CtfTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfTeamMember" ADD CONSTRAINT "CtfTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportDraft" ADD CONSTRAINT "ReportDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocAttempt" ADD CONSTRAINT "SocAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackExam" ADD CONSTRAINT "TrackExam_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackExamAttempt" ADD CONSTRAINT "TrackExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackExamAttempt" ADD CONSTRAINT "TrackExamAttempt_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningCertificate" ADD CONSTRAINT "LearningCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningCertificate" ADD CONSTRAINT "LearningCertificate_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Durable invariants supplement input validation.
ALTER TABLE "LearningPreference" ADD CONSTRAINT "LearningPreference_goal_check" CHECK ("dailyGoal" BETWEEN 1 AND 3);
ALTER TABLE "ExamProtection" ADD CONSTRAINT "ExamProtection_range_check" CHECK ("startsOn" <= "endsOn");
ALTER TABLE "ClassroomOperation" ADD CONSTRAINT "ClassroomOperation_stage_check" CHECK ("stage" BETWEEN 0 AND 2);
ALTER TABLE "ClassroomOperation" ADD CONSTRAINT "ClassroomOperation_status_check" CHECK ("status" IN ('ACTIVE', 'PAUSED', 'ENDED'));
ALTER TABLE "OperationParticipant" ADD CONSTRAINT "OperationParticipant_team_check" CHECK ("team" BETWEEN 0 AND 2);
ALTER TABLE "OperationVote" ADD CONSTRAINT "OperationVote_choice_check" CHECK ("choice" BETWEEN 0 AND 2);
ALTER TABLE "LivePoll" ADD CONSTRAINT "LivePoll_purpose_check" CHECK ("purpose" IN ('LIVE', 'EXIT'));

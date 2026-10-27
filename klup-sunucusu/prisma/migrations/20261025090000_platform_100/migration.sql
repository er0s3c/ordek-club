-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN     "confidence" JSONB;

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "checklist" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "peerReviewCount" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "peerReviewEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "checklist" JSONB;

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "notifiedAt" TIMESTAMP(3),
ADD COLUMN     "publishAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ClassGroup" ADD COLUMN     "checkInCodeHash" TEXT,
ADD COLUMN     "checkInExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LearningPreference" ADD COLUMN     "fontScale" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "highContrast" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lineHeight" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "readableFont" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reduceMotion" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LessonPersonal" ADD COLUMN     "lastSection" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PortfolioWork" ADD COLUMN     "approach" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "learned" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "problem" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "result" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "OperationParticipant" ADD COLUMN     "roleHistory" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "ReportDraft" ADD COLUMN     "feedback" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewerId" TEXT,
ADD COLUMN     "rubricScores" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "lessonSlug" TEXT,
    "skill" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "reflection" TEXT NOT NULL DEFAULT '',
    "selfCheck" JSONB,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGoal" (
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetDay" TEXT NOT NULL,
    "trackKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGoal_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "BuddyPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "skill" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "flags" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuddyPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuddyReply" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "hiddenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuddyReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyCircle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT NOT NULL DEFAULT '',
    "plan" TEXT NOT NULL DEFAULT '',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyCircle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyCircleMember" (
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyCircleMember_pkey" PRIMARY KEY ("circleId","userId")
);

-- CreateTable
CREATE TABLE "Thanks" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "context" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thanks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonQuestion" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "staff" BOOLEAN NOT NULL DEFAULT false,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonFeedback" (
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT NOT NULL DEFAULT '',
    "unclear" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonFeedback_pkey" PRIMARY KEY ("userId","lessonId")
);

-- CreateTable
CREATE TABLE "IssueReport" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "userId" TEXT,
    "lessonId" TEXT,
    "location" TEXT NOT NULL DEFAULT '',
    "kind" TEXT NOT NULL DEFAULT 'CONTENT',
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "history" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonChange" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "oldHash" TEXT NOT NULL,
    "newHash" TEXT NOT NULL,
    "oldTitle" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpRequest" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "taskRef" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,

    CONSTRAINT "HelpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeerReview" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rubricScores" JSONB,
    "comment" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "PeerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionVersion" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "answers" JSONB,
    "fileIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtensionRequest" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requestedDue" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtensionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadlineOverride" (
    "assignmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadlineOverride_pkey" PRIMARY KEY ("assignmentId","userId")
);

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreClassCheck" (
    "id" TEXT NOT NULL,
    "groupId" TEXT,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreClassCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreClassAnswer" (
    "checkId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreClassAnswer_pkey" PRIMARY KEY ("checkId","userId")
);

-- CreateTable
CREATE TABLE "Misconception" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "belief" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lessonSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Misconception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeKey" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "evidence" TEXT NOT NULL DEFAULT '',
    "score" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "exemption" BOOLEAN NOT NULL DEFAULT false,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "review" TEXT NOT NULL DEFAULT '',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkshopAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocScenario" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "variants" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadarIntervention" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "lessonSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note" TEXT NOT NULL DEFAULT '',
    "dueAt" TIMESTAMP(3),
    "baseline" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RadarIntervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadarInterventionTarget" (
    "interventionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RadarInterventionTarget_pkey" PRIMARY KEY ("interventionId","userId")
);

-- CreateTable
CREATE TABLE "CommentSnippet" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricTemplate" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rubric" JSONB NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RubricTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementRead" (
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("announcementId","userId")
);

-- CreateTable
CREATE TABLE "CoursePlan" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "startsOn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lessonSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note" TEXT NOT NULL DEFAULT '',
    "createdById" TEXT,

    CONSTRAINT "CoursePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubGoal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "startsOn" TEXT NOT NULL,
    "endsOn" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubPoll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT true,
    "closesAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubPoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubPollVote" (
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "choice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubPollVote_pkey" PRIMARY KEY ("pollId","userId")
);

-- CreateTable
CREATE TABLE "ClubTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "dueAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "claimedById" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "ClubTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeHourSlot" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficeHourSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeHourBooking" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficeHourBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubResource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'DEVICE',
    "location" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceBooking" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "checkedOutAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "conditionNote" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCheckIn" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'CODE',
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventCheckIn_pkey" PRIMARY KEY ("groupId","userId")
);

-- CreateTable
CREATE TABLE "EventWaitlist" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "EventWaitlist_pkey" PRIMARY KEY ("groupId","userId")
);

-- CreateTable
CREATE TABLE "EventFeedback" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFeedback_pkey" PRIMARY KEY ("groupId","userId")
);

-- CreateTable
CREATE TABLE "PersonalCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'NOTE',
    "ref" TEXT NOT NULL DEFAULT '',
    "consecutive" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedTerm" (
    "userId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedTerm_pkey" PRIMARY KEY ("userId","termId")
);

-- CreateIndex
CREATE INDEX "StudySession_userId_startedAt_idx" ON "StudySession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "BuddyPost_status_createdAt_idx" ON "BuddyPost"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BuddyReply_postId_createdAt_idx" ON "BuddyReply"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "StudyCircleMember_userId_idx" ON "StudyCircleMember"("userId");

-- CreateIndex
CREATE INDEX "Thanks_toId_idx" ON "Thanks"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "Thanks_fromId_toId_context_key" ON "Thanks"("fromId", "toId", "context");

-- CreateIndex
CREATE INDEX "LessonQuestion_lessonId_status_createdAt_idx" ON "LessonQuestion"("lessonId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "LessonAnswer_questionId_createdAt_idx" ON "LessonAnswer"("questionId", "createdAt");

-- CreateIndex
CREATE INDEX "LessonFeedback_lessonId_idx" ON "LessonFeedback"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "IssueReport_number_key" ON "IssueReport"("number");

-- CreateIndex
CREATE INDEX "IssueReport_status_createdAt_idx" ON "IssueReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "IssueReport_userId_idx" ON "IssueReport"("userId");

-- CreateIndex
CREATE INDEX "LessonChange_createdAt_idx" ON "LessonChange"("createdAt");

-- CreateIndex
CREATE INDEX "HelpRequest_sessionId_resolvedAt_idx" ON "HelpRequest"("sessionId", "resolvedAt");

-- CreateIndex
CREATE INDEX "PeerReview_reviewerId_status_idx" ON "PeerReview"("reviewerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PeerReview_submissionId_reviewerId_key" ON "PeerReview"("submissionId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionVersion_submissionId_number_key" ON "SubmissionVersion"("submissionId", "number");

-- CreateIndex
CREATE INDEX "ExtensionRequest_assignmentId_status_idx" ON "ExtensionRequest"("assignmentId", "status");

-- CreateIndex
CREATE INDEX "ExtensionRequest_userId_idx" ON "ExtensionRequest"("userId");

-- CreateIndex
CREATE INDEX "ContentReview_lessonId_contentHash_idx" ON "ContentReview"("lessonId", "contentHash");

-- CreateIndex
CREATE INDEX "PreClassCheck_groupId_closesAt_idx" ON "PreClassCheck"("groupId", "closesAt");

-- CreateIndex
CREATE INDEX "ChallengeAttempt_userId_challengeKey_idx" ON "ChallengeAttempt"("userId", "challengeKey");

-- CreateIndex
CREATE INDEX "ChallengeAttempt_status_idx" ON "ChallengeAttempt"("status");

-- CreateIndex
CREATE INDEX "WorkshopAttempt_userId_kind_key_idx" ON "WorkshopAttempt"("userId", "kind", "key");

-- CreateIndex
CREATE INDEX "WorkshopAttempt_kind_key_createdAt_idx" ON "WorkshopAttempt"("kind", "key", "createdAt");

-- CreateIndex
CREATE INDEX "SocScenario_status_idx" ON "SocScenario"("status");

-- CreateIndex
CREATE INDEX "RadarIntervention_groupId_createdAt_idx" ON "RadarIntervention"("groupId", "createdAt");

-- CreateIndex
CREATE INDEX "RadarInterventionTarget_userId_idx" ON "RadarInterventionTarget"("userId");

-- CreateIndex
CREATE INDEX "CommentSnippet_ownerId_idx" ON "CommentSnippet"("ownerId");

-- CreateIndex
CREATE INDEX "RubricTemplate_ownerId_idx" ON "RubricTemplate"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "CoursePlan_groupId_week_key" ON "CoursePlan"("groupId", "week");

-- CreateIndex
CREATE INDEX "ClubGoal_endsOn_idx" ON "ClubGoal"("endsOn");

-- CreateIndex
CREATE INDEX "ClubTask_status_createdAt_idx" ON "ClubTask"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeHourSlot_startsAt_idx" ON "OfficeHourSlot"("startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeHourBooking_slotId_userId_key" ON "OfficeHourBooking"("slotId", "userId");

-- CreateIndex
CREATE INDEX "ResourceBooking_resourceId_startsAt_idx" ON "ResourceBooking"("resourceId", "startsAt");

-- CreateIndex
CREATE INDEX "ResourceBooking_userId_idx" ON "ResourceBooking"("userId");

-- CreateIndex
CREATE INDEX "EventCheckIn_userId_idx" ON "EventCheckIn"("userId");

-- CreateIndex
CREATE INDEX "PersonalCard_userId_dueAt_idx" ON "PersonalCard"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "Announcement_publishAt_idx" ON "Announcement"("publishAt");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyPost" ADD CONSTRAINT "BuddyPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyReply" ADD CONSTRAINT "BuddyReply_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BuddyPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyReply" ADD CONSTRAINT "BuddyReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCircle" ADD CONSTRAINT "StudyCircle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCircleMember" ADD CONSTRAINT "StudyCircleMember_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "StudyCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCircleMember" ADD CONSTRAINT "StudyCircleMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thanks" ADD CONSTRAINT "Thanks_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thanks" ADD CONSTRAINT "Thanks_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonQuestion" ADD CONSTRAINT "LessonQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonQuestion" ADD CONSTRAINT "LessonQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonAnswer" ADD CONSTRAINT "LessonAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LessonQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonAnswer" ADD CONSTRAINT "LessonAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueReport" ADD CONSTRAINT "IssueReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueReport" ADD CONSTRAINT "IssueReport_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonChange" ADD CONSTRAINT "LessonChange_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReview" ADD CONSTRAINT "PeerReview_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReview" ADD CONSTRAINT "PeerReview_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReview" ADD CONSTRAINT "PeerReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionVersion" ADD CONSTRAINT "SubmissionVersion_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtensionRequest" ADD CONSTRAINT "ExtensionRequest_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtensionRequest" ADD CONSTRAINT "ExtensionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtensionRequest" ADD CONSTRAINT "ExtensionRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineOverride" ADD CONSTRAINT "DeadlineOverride_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadlineOverride" ADD CONSTRAINT "DeadlineOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreClassCheck" ADD CONSTRAINT "PreClassCheck_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreClassCheck" ADD CONSTRAINT "PreClassCheck_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreClassAnswer" ADD CONSTRAINT "PreClassAnswer_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "PreClassCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreClassAnswer" ADD CONSTRAINT "PreClassAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Misconception" ADD CONSTRAINT "Misconception_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopAttempt" ADD CONSTRAINT "WorkshopAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocScenario" ADD CONSTRAINT "SocScenario_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadarIntervention" ADD CONSTRAINT "RadarIntervention_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadarIntervention" ADD CONSTRAINT "RadarIntervention_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadarInterventionTarget" ADD CONSTRAINT "RadarInterventionTarget_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "RadarIntervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadarInterventionTarget" ADD CONSTRAINT "RadarInterventionTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentSnippet" ADD CONSTRAINT "CommentSnippet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricTemplate" ADD CONSTRAINT "RubricTemplate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePlan" ADD CONSTRAINT "CoursePlan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePlan" ADD CONSTRAINT "CoursePlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubGoal" ADD CONSTRAINT "ClubGoal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPoll" ADD CONSTRAINT "ClubPoll_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPollVote" ADD CONSTRAINT "ClubPollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ClubPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPollVote" ADD CONSTRAINT "ClubPollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubTask" ADD CONSTRAINT "ClubTask_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubTask" ADD CONSTRAINT "ClubTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeHourSlot" ADD CONSTRAINT "OfficeHourSlot_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeHourBooking" ADD CONSTRAINT "OfficeHourBooking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "OfficeHourSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeHourBooking" ADD CONSTRAINT "OfficeHourBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceBooking" ADD CONSTRAINT "ResourceBooking_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "ClubResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceBooking" ADD CONSTRAINT "ResourceBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCheckIn" ADD CONSTRAINT "EventCheckIn_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCheckIn" ADD CONSTRAINT "EventCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventWaitlist" ADD CONSTRAINT "EventWaitlist_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventWaitlist" ADD CONSTRAINT "EventWaitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalCard" ADD CONSTRAINT "PersonalCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedTerm" ADD CONSTRAINT "SavedTerm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Mevcut duyurular oluşturuldukları anda yayınlanmış sayılır.
UPDATE "Announcement" SET "publishAt" = "createdAt", "notifiedAt" = "createdAt";

-- Durable invariants supplement input validation.
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_minutes_check" CHECK ("minutes" IN (15, 25, 45));
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_status_check" CHECK ("status" IN ('ACTIVE', 'DONE', 'ABANDONED'));
ALTER TABLE "BuddyPost" ADD CONSTRAINT "BuddyPost_status_check" CHECK ("status" IN ('OPEN', 'CLOSED', 'HIDDEN'));
ALTER TABLE "LessonQuestion" ADD CONSTRAINT "LessonQuestion_status_check" CHECK ("status" IN ('OPEN', 'ANSWERED', 'HIDDEN'));
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_rating_check" CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5);
ALTER TABLE "IssueReport" ADD CONSTRAINT "IssueReport_status_check" CHECK ("status" IN ('RECEIVED', 'REVIEWING', 'FIXED', 'REJECTED'));
ALTER TABLE "IssueReport" ADD CONSTRAINT "IssueReport_kind_check" CHECK ("kind" IN ('CONTENT', 'TECHNICAL', 'TRANSLATION'));
ALTER TABLE "PeerReview" ADD CONSTRAINT "PeerReview_status_check" CHECK ("status" IN ('ASSIGNED', 'DONE'));
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_peer_count_check" CHECK ("peerReviewCount" BETWEEN 1 AND 5);
ALTER TABLE "ExtensionRequest" ADD CONSTRAINT "ExtensionRequest_status_check" CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED'));
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_stage_check" CHECK ("stage" IN ('AUTHOR', 'TECH', 'LANGUAGE'));
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_decision_check" CHECK ("decision" IN ('APPROVED', 'CHANGES'));
ALTER TABLE "PreClassCheck" ADD CONSTRAINT "PreClassCheck_range_check" CHECK ("opensAt" < "closesAt");
ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_status_check" CHECK ("status" IN ('SUBMITTED', 'ACCEPTED', 'REJECTED'));
ALTER TABLE "WorkshopAttempt" ADD CONSTRAINT "WorkshopAttempt_score_check" CHECK ("score" BETWEEN 0 AND 100);
ALTER TABLE "SocScenario" ADD CONSTRAINT "SocScenario_status_check" CHECK ("status" IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
ALTER TABLE "ReportDraft" ADD CONSTRAINT "ReportDraft_status_check" CHECK ("status" IN ('DRAFT', 'SUBMITTED', 'REVIEWED'));
ALTER TABLE "ClubGoal" ADD CONSTRAINT "ClubGoal_metric_check" CHECK ("metric" IN ('LESSONS', 'LABS', 'STUDY_MINUTES'));
ALTER TABLE "ClubGoal" ADD CONSTRAINT "ClubGoal_range_check" CHECK ("startsOn" <= "endsOn" AND "target" > 0);
ALTER TABLE "ClubTask" ADD CONSTRAINT "ClubTask_status_check" CHECK ("status" IN ('OPEN', 'CLAIMED', 'DONE'));
ALTER TABLE "OfficeHourSlot" ADD CONSTRAINT "OfficeHourSlot_range_check" CHECK ("startsAt" < "endsAt" AND "capacity" BETWEEN 1 AND 20);
ALTER TABLE "OfficeHourBooking" ADD CONSTRAINT "OfficeHourBooking_status_check" CHECK ("status" IN ('BOOKED', 'CANCELLED', 'DONE'));
ALTER TABLE "ClubResource" ADD CONSTRAINT "ClubResource_kind_check" CHECK ("kind" IN ('DEVICE', 'ROOM', 'EQUIPMENT'));
ALTER TABLE "ResourceBooking" ADD CONSTRAINT "ResourceBooking_range_check" CHECK ("startsAt" < "endsAt");
ALTER TABLE "ResourceBooking" ADD CONSTRAINT "ResourceBooking_status_check" CHECK ("status" IN ('BOOKED', 'CANCELLED', 'OUT', 'RETURNED'));
ALTER TABLE "EventCheckIn" ADD CONSTRAINT "EventCheckIn_method_check" CHECK ("method" IN ('CODE', 'MANUAL'));
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_rating_check" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "PersonalCard" ADD CONSTRAINT "PersonalCard_source_check" CHECK ("source" IN ('NOTE', 'TERM'));
ALTER TABLE "LearningPreference" ADD CONSTRAINT "LearningPreference_font_check" CHECK ("fontScale" BETWEEN 85 AND 150);
ALTER TABLE "LearningPreference" ADD CONSTRAINT "LearningPreference_line_check" CHECK ("lineHeight" IN ('compact', 'normal', 'relaxed'));

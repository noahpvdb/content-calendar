-- CreateTable
CREATE TABLE "ContentIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT NOT NULL,
    "pillar" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'idea',
    "notes" TEXT,
    "caption" TEXT,
    "imageUrls" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScheduledPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ideaId" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "scheduledTime" TEXT NOT NULL DEFAULT '09:00',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "caption" TEXT,
    "platform" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduledPost_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ContentIdea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

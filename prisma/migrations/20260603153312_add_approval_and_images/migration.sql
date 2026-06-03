-- AlterTable
ALTER TABLE "ContentIdea" ADD COLUMN     "approvalNotes" TEXT,
ADD COLUMN     "approvalStatus" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "FriendRequest" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

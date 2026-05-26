-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "commentId" INTEGER,
ADD COLUMN     "publicationId" INTEGER;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "adminComment" TEXT,
ADD COLUMN     "reasons" TEXT[],
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

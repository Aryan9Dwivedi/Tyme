ALTER TABLE "Rating" DROP CONSTRAINT IF EXISTS "Rating_assignmentId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Rating_assignmentId_authorId_targetId_key"
ON "Rating"("assignmentId", "authorId", "targetId");

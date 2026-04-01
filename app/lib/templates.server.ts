import { db } from "./db.server";

export async function getPublicTemplates() {
  return db.template.findMany({
    where: { isPublic: true },
    orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
  });
}


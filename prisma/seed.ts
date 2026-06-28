import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Build a small Tiptap document with a heading, paragraphs, formatting and a list.
function sampleDoc(heading: string, intro: string): Prisma.InputJsonValue {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: heading }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: intro + " This document is " },
          { type: "text", marks: [{ type: "bold" }], text: "fully editable" },
          { type: "text", text: " and demonstrates " },
          { type: "text", marks: [{ type: "italic" }], text: "rich-text" },
          { type: "text", text: " formatting and sharing." },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Goals" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Ship the strongest slice in the timebox" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Make sharing obvious and reliable" }],
              },
            ],
          },
        ],
      },
    ],
  };
}

async function main() {
  // Demo users (idempotent).
  const alice = await prisma.user.upsert({
    where: { email: "alice@ajaia.test" },
    update: {},
    create: { email: "alice@ajaia.test", name: "Alice Owner" },
  });
  const ben = await prisma.user.upsert({
    where: { email: "ben@ajaia.test" },
    update: {},
    create: { email: "ben@ajaia.test", name: "Ben Editor" },
  });
  const carol = await prisma.user.upsert({
    where: { email: "carol@ajaia.test" },
    update: {},
    create: { email: "carol@ajaia.test", name: "Carol Viewer" },
  });

  // Start from a clean slate for demo documents so reseeding is predictable.
  await prisma.document.deleteMany({
    where: { ownerId: { in: [alice.id, ben.id, carol.id] } },
  });

  // 1) Alice owns a roadmap, shared with Ben (editor) and Carol (viewer).
  await prisma.document.create({
    data: {
      title: "Q3 Product Roadmap",
      content: sampleDoc(
        "Q3 Product Roadmap",
        "A shared plan owned by Alice.",
      ),
      ownerId: alice.id,
      shares: {
        create: [
          { userId: ben.id, role: "EDITOR" },
          { userId: carol.id, role: "VIEWER" },
        ],
      },
    },
  });

  // 2) Alice owns a private draft (not shared).
  await prisma.document.create({
    data: {
      title: "Personal Draft (private)",
      content: sampleDoc("Personal Draft", "Only Alice can see this."),
      ownerId: alice.id,
    },
  });

  // 3) Ben owns notes shared back to Alice as viewer.
  await prisma.document.create({
    data: {
      title: "Weekly Sync Notes",
      content: sampleDoc("Weekly Sync Notes", "Owned by Ben, shared with Alice."),
      ownerId: ben.id,
      shares: { create: [{ userId: alice.id, role: "VIEWER" }] },
    },
  });

  console.log("Seeded demo users and documents:");
  console.log("  alice@ajaia.test (owner)");
  console.log("  ben@ajaia.test   (editor on Alice's roadmap)");
  console.log("  carol@ajaia.test (viewer on Alice's roadmap)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

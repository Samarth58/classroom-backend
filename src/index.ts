import express from "express";
import { eq } from "drizzle-orm";

import { db } from "./db/index.js";
import { departments } from "./db/schema/index.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.get("/demo/crud", async (_req, res) => {
  try {
    const [newUser] = await db
      .insert(departments)
      .values({ code: "ADM", name: "Administration", description: "Administration Department" })
      .returning();

    if (!newUser) return res.status(500).json({ error: "Failed to create user" });

    const found = await db
      .select()
      .from(departments)
      .where(eq(departments.id, newUser.id));

    const [updated] = await db
      .update(departments)
      .set({ name: "Super Administration" })
      .where(eq(departments.id, newUser.id))
      .returning();

    await db.delete(departments).where(eq(departments.id, newUser.id));

    return res.json({
      created: newUser,
      read: found[0],
      updated,
      deletedId: newUser.id,
    });
  } catch (error) {
    console.error("CRUD error:", error);
    return res.status(500).json({ error: String(error) });
  }
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

app.use((req, _res, next) => {
  console.log(req.url);
  next();
});

// --- Optional: run once on boot (comment out if you prefer manual trigger) ---
// (async () => {
//   try {
//     console.log("Performing CRUD operations on boot...");
//     const [newUser] = await db
//       .insert(demoUsers)
//       .values({ name: "Admin User", email: `admin-${Date.now()}@example.com` })
//       .returning();
//
//     if (!newUser) throw new Error("Failed to create user");
//
//     const foundUser = await db
//       .select()
//       .from(demoUsers)
//       .where(eq(demoUsers.id, newUser.id));
//
//     const [updatedUser] = await db
//       .update(demoUsers)
//       .set({ name: "Super Admin" })
//       .where(eq(demoUsers.id, newUser.id))
//       .returning();
//
//     await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
//
//     console.log("CRUD completed:", { created: newUser, read: foundUser[0], updated: updatedUser });
//   } catch (error) {
//     console.error("CRUD boot error:", error);
//   }
// })();


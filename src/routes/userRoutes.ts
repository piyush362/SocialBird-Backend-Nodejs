import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// CRUD opperation on users
// Create user
// list users
// get one user
// update user
// delete user
// ----------------------------------

// to create user
router.post("/", async (req, res) => {
  const { email, name, username } = req.body;

  try {
    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        username,
      },
    });
    res.json(createdUser);
  } catch (error) {
    res.status(400).json({ error: "username and email should be unique" });
  }
});

// to get all user list
router.get("/", async (req, res) => {
  const alluser = await prisma.user.findMany();
  res.json(alluser);
});

// to get one user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: { tweets: true },
  });
  res.json(user);
});

// update user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { bio, name, image } = req.body;

  try {
    const result = await prisma.user.update({
      where: { id: Number(id) },
      data: { bio, name, image },
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: "unable to update user..." });
  }
});

// delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.user.delete({ where: { id: Number(id) } });
    res.status(200);
  } catch (error) {
    res.send({ error: "unable to delete user..." });
  }
});

export default router;

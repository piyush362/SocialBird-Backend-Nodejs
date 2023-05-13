import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// CRUD Operation on Tweets
// create tweet
// get all tweets
// get one tweet
// update tweet
// delete tweet

// create tweet
router.post("/", async (req, res) => {
  const { content, image } = req.body;
  // @ts-ignore
  const user = req.user;

  try {
    const result = await prisma.tweet.create({
      data: {
        content,
        image,
        userId: user.id,
      },
      include: { user: true },
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: "tweet not created..." });
  }
});

// get all tweets
router.get("/", async (req, res) => {
  try {
    const alltweet = await prisma.tweet.findMany({ include: { user: true } });
    res.json(alltweet);
  } catch (error) {
    res.json({ error: "error while fetching tweets..." });
  }
});

// get one tweet
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tweet = await prisma.tweet.findUnique({ where: { id: Number(id) } });
    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found.." });
    }
    res.json(tweet);
  } catch (error) {
    res.json({ error: "error while fetching tweets..." });
  }
});

// update Tweet
router.put("/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ error: `Not Implemented: ${id}` });
});

// delete Tweet
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.tweet.delete({ where: { id: Number(id) } });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(404);
  }
});

export default router;

import express from "express";
import prisma from "../config/db.js";
import authMiddleware from "../middleware/auth.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { visibility: "public" },
      include: {
        user: {
          select: { name: true, profile_pic_url: true }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { content, club_id, visibility } = req.body;
  const userId = req.user.userId;

  if (!content || !visibility) {
    return res.status(400).json({ error: "Content and visibility are required." });
  }

  try {
    const post = await prisma.post.create({
      data: {
        user_id: userId,
        content: content,
        visibility: visibility,
        club_id: club_id ? parseInt(club_id) : null,
      },
    });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

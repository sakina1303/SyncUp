import express from "express";
import prisma from "../config/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// GET /api/clubs - Get all clubs
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const clubs = await prisma.club.findMany({
      where,
      include: {
        creator: {
          select: { user_id: true, name: true }
        },
        _count: {
          select: { memberships: true, posts: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ clubs });
  } catch (err) {
    console.error("Error fetching clubs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/clubs/:id - Get single club
router.get("/:id", async (req, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { club_id: parseInt(req.params.id) },
      include: {
        creator: { select: { user_id: true, name: true, profile_pic_url: true }},
        memberships: {
          include: {
            user: { select: { user_id: true, name: true, profile_pic_url: true }}
          }
        },
        posts: {
          include: {
            user: { select: { user_id: true, name: true, profile_pic_url: true }},
            _count: { select: { likes: true, comments: true }}
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!club) return res.status(404).json({ error: "Club not found" });
    res.json({ club });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/clubs/:id/join - Join club
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const clubId = parseInt(req.params.id);

    const membership = await prisma.membership.create({
      data: { user_id: userId, club_id: clubId, role: 'member' }
    });

    res.status(201).json({ message: "Joined successfully", membership });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
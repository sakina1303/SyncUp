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
          select: {
            user_id: true,
            name: true,
            profile_pic_url: true,
          },
        },
        club: {
          select: {
            club_id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const post_with_cnt = posts.map((post) => ({
      ...post,
      likes_count: post._count.likes,
      comments_count: post._count.comments,
    }));

    res.status(200).json(post_with_cnt);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// CREATE post
router.post("/", authMiddleware, async (req, res) => {
  const { content, club_id, visibility } = req.body;
  const userId = req.user.userId;

  if (!content || !visibility) {
    return res
      .status(400)
      .json({ error: "Content and visibility are required." });
  }

  try {
    const post = await prisma.post.create({
      data: {
        user_id: userId,
        content: content,
        visibility: visibility,
        club_id: club_id ? parseInt(club_id) : null,
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            profile_pic_url: true,
          },
        },
      },
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

router.post("/:postId/like", authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user.userId;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        user_id_post_id: {
          user_id: userId,
          post_id: postId,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.like.delete({
        where: {
          like_id: existingLike.like_id,
        },
      });

      // Get updated count
      const likesCount = await prisma.like.count({
        where: { post_id: postId },
      });

      return res.json({
        message: "Post unliked",
        liked: false,
        likes_count: likesCount,
      });
    } else {
      // Like - create new like
      await prisma.like.create({
        data: {
          user_id: userId,
          post_id: postId,
        },
      });

      // Get updated count
      const likesCount = await prisma.like.count({
        where: { post_id: postId },
      });

      return res.json({
        message: "Post liked",
        liked: true,
        likes_count: likesCount,
      });
    }
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// GET comments for a post
router.get("/:postId/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);

    const comments = await prisma.comment.findMany({
      where: { post_id: postId },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            profile_pic_url: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// CREATE comment
router.post("/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user.userId;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Comment content is required" });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { post_id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        user_id: userId,
        post_id: postId,
        content: content,
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            profile_pic_url: true,
          },
        },
      },
    });

    // Get updated comment count
    const commentsCount = await prisma.comment.count({
      where: { post_id: postId },
    });

    res.status(201).json({
      comment,
      comments_count: commentsCount,
    });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// DELETE comment (only by owner)
router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.userId;

    const comment = await prisma.comment.findUnique({
      where: { comment_id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({
      where: { comment_id: commentId },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

export default router;

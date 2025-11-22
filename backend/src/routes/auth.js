import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
      },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login route called for email=${email}`);
    // Ensure we use a real DB; if DATABASE_URL missing, Prisma will throw which surfaces as 500.
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
      console.log('Prisma returned user:', !!user);
    } catch (prismaErr) {
      console.error('Prisma error during findUnique:', prismaErr && prismaErr.message);
      throw prismaErr;
    }
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // JWT_SECRET must be set in environment for production; here we use it directly.
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

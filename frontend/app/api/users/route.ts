import { NextRequest, NextResponse } from "next/server";
import Connection from "@/lib/mongodb";
import User from "@/schema/user-schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const USER = process.env.MONGODB_USER || "user";
const PASSWORD = process.env.MONGODB_PASSWORD || "password";

export async function POST(req: NextRequest) {
  await Connection(USER, PASSWORD);

  const body = await req.json();
  const { action } = body;

  if (action === 'signup') {
    const { email, password, name, userType } = body;

    if (!email || !password || !name || !userType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      userType,
    });

    await user.save();

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  }

  if (action === 'login') {
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
    });
  }

  if (action === 'businesslogin') {
    const { email, password, userType } = body;

    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ email, userType });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      message: "Business Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
    }, {status: 200});
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

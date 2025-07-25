import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import sanitizedConfig from "../config.js";

export const signupUser = async (data) => {
  const { name, email, password, phone, image_url, roleId, branchId, isAdmin } =
    data;

  // 1. Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // 2. Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create the user
  const newUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      phone,
      image_url,
      roleId,
      branchId,
      isAdmin,
    },
    include: {
      role: true,
      branch: true,
    },
  });

  return {
    message: "User registered successfully",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      image_url: newUser.image_url,
      role: newUser.role,
      branch: newUser.branch,
      isAdmin,
    },
  };
};

export const loginService = async ({ email, password }) => {
  // Other methods like signupUser...

  // 1. Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      branch: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // 3. Generate JWT
const token = jwt.sign(
  { id: user.id, email: user.email, roleId: user.role?.id, roleName: user.role?.name },
  sanitizedConfig.JWT_SECRET,
  { expiresIn: "7d" }
);


  // 4. Mark user as logged in (optional)
  await prisma.user.update({
    where: { id: user.id },
    data: { isLogin: true },
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image_url: user.image_url,
      role: user.role,
      branch: user.branch,
    },
  };
};

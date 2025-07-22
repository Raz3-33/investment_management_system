import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

import { prisma } from "../config/db.js";
import sanitizedConfig from "../config.js";

// Generate a 6-digit random password
const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit random number
};

// Send email using Nodemailer
const sendPasswordEmail = async (email, password) => {
  console.log(
    sanitizedConfig.EMAIL_USER,
    "sanitizedConfig.EMAIL_USERsanitizedConfig.EMAIL_USERsanitizedConfig.EMAIL_USERsanitizedConfig.EMAIL_USER"
  );
  console.log(
    sanitizedConfig.EMAIL_PASS,
    "sanitizedConfig.EMAIL_PASSsanitizedConfig.EMAIL_PASSsanitizedConfig.EMAIL_PASSsanitizedConfig.EMAIL_PASS"
  );

  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
    auth: {
      user: sanitizedConfig.EMAIL_USER, // Your email
      pass: sanitizedConfig.EMAIL_PASS, // Your email password or app password
    },
  });

  const mailOptions = {
    from: sanitizedConfig.EMAIL_USER, // Sender's email address
    to: email, // Recipient's email address
    subject: "Your Investor Account Password",
    text: `Dear Investor,\n\nYour account has been created. Please use the following password to access your account:\n\nPassword: ${password}\n\nThank you!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password email sent successfully");
  } catch (error) {
    console.error("Error sending password email: ", error);
  }
};

// Create a new investor
export const createInvestor = async (data) => {
  const {
    name,
    email,
    phone,
    type,
    address,
    pan,
    aadhaar,
    gstNumber,
    referredBy,
    status,
    relationshipManagerId,
    documents,
  } = data;

  const password = generatePassword(); // Generate a 6-digit password
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt

  try {
    const newInvestor = await prisma.investor.create({
      data: {
        name,
        email,
        phone,
        type,
        address,
        pan,
        aadhaar,
        gstNumber,
        referredBy,
        status,
        relationshipManagerId,
        documents,
        password: hashedPassword, // Store the hashed password
      },
    });

    // Send the password to the investor via email
    await sendPasswordEmail(email, password);

    return newInvestor;
  } catch (error) {
    throw new Error("Error creating investor: " + error.message);
  }
};

// Get all investors
export const getAllInvestors = async () => {
  try {
    const investors = await prisma.investor.findMany({
      include: {
        relationshipManager: true,
      },
    });

    return investors;
  } catch (error) {
    throw new Error("Error fetching investors: " + error.message);
  }
};

// Get investor by ID
export const getInvestorById = async (id) => {
  try {
    const investor = await prisma.investor.findUnique({
      where: { id },
      include: {
        relationshipManager: true,
      },
    });

    return investor;
  } catch (error) {
    throw new Error("Error fetching investor: " + error.message);
  }
};

// Update an investor
export const updateInvestor = async (id, data) => {
  try {
    const updatedInvestor = await prisma.investor.update({
      where: { id },
      data,
    });

    return updatedInvestor;
  } catch (error) {
    throw new Error("Error updating investor: " + error.message);
  }
};

// Delete an investor
export const deleteInvestor = async (id) => {
  try {
    const deletedInvestor = await prisma.investor.delete({
      where: { id },
    });

    return deletedInvestor;
  } catch (error) {
    throw new Error("Error deleting investor: " + error.message);
  }
};

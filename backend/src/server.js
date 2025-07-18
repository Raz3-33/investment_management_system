import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import sanitizedConfig from "./config.js";

import { errorHandler, notFound } from "./middlewares/errorMiddlware.js";
import roleRoutes from "./routes/role.routes.js";
import branchRouter from "./routes/branch.routes.js"
import userRouter from "./routes/user.routes.js"
import authenticationRoute from "./routes/authentication.routes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
// role Management
app.use("/api/roles", roleRoutes);
// branch
app.use("/api/branches", branchRouter);
// user management
app.use("/api/users",userRouter)
// authentication
app.use("/api/auth", authenticationRoute);

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use(notFound);
app.use(errorHandler);

const PORT = sanitizedConfig.PORT || 8000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}
===============
||           ||
||           ||
||           ||
===============
||         ||
||          ||
||           ||
||            ||`)
);

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

import sanitizedConfig from "./config.js";

import { errorHandler, notFound } from "./middlewares/errorMiddlware.js";
import roleRoutes from "./routes/role.routes.js";
import branchRouter from "./routes/branch.routes.js";
import userRouter from "./routes/user.routes.js";
import investmentOpportunity from "./routes/investmentOpportunity.routes.js";
import investorRouter from "./routes/investor.routes.js";
import investmentRoutes from "./routes/investment.routes.js";
import payoutsRoutes from "./routes/payout.routes.js";
import salesRoutes from "./routes/sales.routes.js"
import settingRouter from "./routes/settings.routes.js";
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
// authentication
app.use("/api/auth", authenticationRoute);

// role Management
app.use("/api/roles", roleRoutes);

// branch
app.use("/api/branches", branchRouter);

// user management
app.use("/api/users", userRouter);

// investment Opportunity
app.use("/api/investmentOpportunity", investmentOpportunity);

// investor routes
app.use("/api/investors", investorRouter);

// Use the investment routes
app.use("/api/investments", investmentRoutes);

// Use the Payouts routes
app.use("/api/payouts", payoutsRoutes);

// Use the Sales routes
app.use("/api/sales", salesRoutes);

// settings
app.use("/api/settings", settingRouter);

// app.get("/", (req, res) => {
//   res.send("API is running!");
// });

let dirname = path.resolve();

if (sanitizedConfig.NODE_ENV === "production") {
  try {
    app.use(express.static(path.join(dirname, "../frontend", "dist")));

    app.use((req, res) => {
      res.sendFile(path.resolve(dirname, "../frontend", "dist", "index.html"));
    });
  } catch (error) {
    console.log(
      error,
      "errorerrorerrorerrorerrorerrorerrorerrorerrorerrorerrorerror"
    );
  }
}

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

import * as authenticationService from "../services/authentication.service.js";

export const create = async (req, res, next) => {
    try {
        const validated = req.body;

        // Call the signup service
        const user = await authenticationService.signupUser(validated);

        // Send success response
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });

    } catch (err) {
        // Handle Prisma unique constraint error
        if (err.code === "P2002" && err.meta?.target?.includes("email")) {
            return res.status(409).json({
                success: false,
                message: `Email '${req.body.email}' is already registered.`,
            });
        }

        // Custom error thrown from service (e.g., user already exists)
        if (err.message) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }

        // Unhandled errors
        next(err);
    }
};


// controllers/user.controller.js

export const login = async (req, res, next) => {
    try {

        console.log(req.body, "reqqqqqqqqqqqqqqqqqqq")
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Call login service
        const result = await authenticationService.loginService({ email, password });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: err.message || "Authentication failed",
        });
    }
};

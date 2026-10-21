
const express = require("express");

const {
    createUser,
    getAllUsers,
    updateUser,
    updateUserStatus
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create user
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createUser
);

// Get all users
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAllUsers
);

// Update user details
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateUser
);

// Activate or deactivate user
router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateUserStatus
);

module.exports = router;
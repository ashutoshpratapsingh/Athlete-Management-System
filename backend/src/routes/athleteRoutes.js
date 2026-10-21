
const express = require("express");

const {
    createAthlete,
    getAllAthletes,
    getMyAthleteProfile,
    getAthleteById,
    updateAthlete,
    deactivateAthlete
} = require("../controllers/athleteController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

const router = express.Router();


// Get all athletes
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    getAllAthletes
);


// Get logged-in athlete profile
// This route must appear before /:id
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("ATHLETE"),
    getMyAthleteProfile
);


// Get athlete by ID
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    getAthleteById
);


// Create athlete
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    createAthlete
);


// Update athlete
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH"),
    updateAthlete
);


// Deactivate athlete
router.patch(
    "/:id/deactivate",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deactivateAthlete
);


module.exports = router;
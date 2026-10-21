const express = require("express");

const router = express.Router();

const {
    createPayment,
    verifyPayment,
    getAthletePayments,
    getAllPaymentsForAdmin
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

// ==========================================
// ATHLETE: Create Razorpay Payment Order
// ==========================================

router.post(
    "/athlete/:athleteId",
    authMiddleware,
    roleMiddleware("ATHLETE"),
    ownershipMiddleware,
    createPayment
);

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

router.post(
    "/verify",
    authMiddleware,
    roleMiddleware("ATHLETE"),
    verifyPayment
);

// ==========================================
// GET ATHLETE PAYMENT HISTORY
// ==========================================

router.get(
    "/athlete/:athleteId",
    authMiddleware,
    roleMiddleware("ADMIN", "COACH", "ATHLETE"),
    ownershipMiddleware,
    getAthletePayments
);

// ==========================================
// ADMIN: GET ALL SUCCESSFUL PAYMENTS
// ==========================================

router.get(
    "/admin/all",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAllPaymentsForAdmin
);

module.exports = router;
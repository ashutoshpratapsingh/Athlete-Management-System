
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        athleteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Athlete",
            required: true
        },

        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AIReport",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "INR"
        },

        paymentStatus: {
            type: String,
            enum: [
                "CREATED",
                "PENDING",
                "SUCCESS",
                "FAILED",
                "REFUNDED"
            ],
            default: "CREATED"
        },

        paymentMethod: {
            type: String,
            enum: ["SIMULATED", "RAZORPAY"],
            default: "RAZORPAY"
        },

        razorpayOrderId: {
            type: String,
            trim: true,
            unique: true,
            sparse: true
        },

        razorpayPaymentId: {
            type: String,
            trim: true
        },

        razorpaySignature: {
            type: String,
            trim: true
        },

        transactionId: {
            type: String,
            trim: true
        },

        paymentDate: {
            type: Date
        },

        verifiedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
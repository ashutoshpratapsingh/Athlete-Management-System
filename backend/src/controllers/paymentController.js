
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Payment = require("../models/Payment");
const AIReport = require("../models/AIReport");

const ReportAccess = require("../models/ReportAccess");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
const createPayment = async (req, res) => {
    try {
        const { reportId } = req.body;
        const athleteId = req.params.athleteId;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: "Report ID is required"
            });
        }

        const amount = Number(process.env.REPORT_FEE);

        if (!amount || amount <= 0) {
            return res.status(500).json({
                success: false,
                message: "Report fee is not configured correctly"
            });
        }

        // Find the AI report
        const report = await AIReport.findById(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "AI report not found"
            });
        }

        // Verify report ownership
        if (report.athleteId.toString() !== athleteId) {
            return res.status(403).json({
                success: false,
                message: "This report does not belong to this athlete"
            });
        }

        // Prevent duplicate payment
        if (report.isPaid) {
            return res.status(400).json({
                success: false,
                message: "This report has already been unlocked"
            });
        }

        // Razorpay requires amount in paise
        const amountInPaise = Math.round(amount * 100);

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `report_${reportId}_${Date.now()}`,
            notes: {
                athleteId: athleteId.toString(),
                reportId: reportId.toString()
            }
        };

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create(options);

        // Save payment as created
        const payment = await Payment.create({
            athleteId,
            reportId,
            amount,
            currency: "INR",
            paymentStatus: "CREATED",
            paymentMethod: "RAZORPAY",
            razorpayOrderId: razorpayOrder.id
        });

        return res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                paymentId: payment._id,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error("Create Razorpay order error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create payment order",
            error: error.message
        });
    }
};


// Verify Razorpay payment and unlock report
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            paymentId
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !paymentId
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required"
            });
        }

        
        // Find our local payment record
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found"
            });
        }

        // Ensure the payment belongs to the authenticated athlete
        if (
            req.user.role === "ATHLETE" &&
            (!req.user.athleteId ||
                payment.athleteId.toString() !== req.user.athleteId.toString())
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to verify this payment"
            });
        }

        // Verify the order belongs to the local payment
        if (payment.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Payment order mismatch"
            });
        }

        // Generate the expected Razorpay signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        // Compare signatures securely
        const expectedSignatureBuffer = Buffer.from(generatedSignature);
        const receivedSignatureBuffer = Buffer.from(razorpay_signature);

        const isSignatureValid =
            expectedSignatureBuffer.length === receivedSignatureBuffer.length &&
            crypto.timingSafeEqual(
                expectedSignatureBuffer,
                receivedSignatureBuffer
            );

        if (!isSignatureValid) {
            payment.paymentStatus = "FAILED";
            await payment.save();

            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        
// Find the report
const report = await AIReport.findById(payment.reportId);

if (!report) {
    return res.status(404).json({
        success: false,
        message: "AI report not found"
    });
}

// Verify that the payment and report belong to the same athlete
if (
    report.athleteId.toString() !== payment.athleteId.toString()
) {
    return res.status(403).json({
        success: false,
        message: "Payment and report ownership mismatch"
    });
}

        // Prevent repeated processing
        if (report.isPaid) {
            return res.status(200).json({
                success: true,
                message: "Report is already unlocked",
                data: {
                    reportAccess: true
                }
            });
        }

        // Mark payment as successful
        payment.paymentStatus = "SUCCESS";
        payment.paymentMethod = "RAZORPAY";
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.transactionId = razorpay_payment_id;
        payment.paymentDate = new Date();
        payment.verifiedAt = new Date();

        await payment.save();

        // Unlock report only after signature verification
        // Unlock report only after successful payment verification
report.isPaid = true;
await report.save();

// Create or update report access record
const reportAccess = await ReportAccess.findOneAndUpdate(
    {
        athleteId: payment.athleteId,
        reportId: payment.reportId
    },
    {
        athleteId: payment.athleteId,
        reportId: payment.reportId,
        paymentId: payment._id,
        accessType: "FULL",
        isActive: true,
        grantedAt: new Date()
    },
    {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
    }
);

        return res.status(200).json({
            success: true,
            message: "Payment verified. Full report unlocked.",
            data: {
                payment,
                reportAccess: true
            }

            
        });

    } catch (error) {
        console.error("Verify Razorpay payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
};


// Get athlete payment history
const getAthletePayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            athleteId: req.params.athleteId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {
        console.error("Get payments error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message
        });
    }
};

const getAllPaymentsForAdmin = async (req, res) => {
    try {
        const payments = await Payment.find({
            paymentStatus: "SUCCESS"
        })
            .populate("athleteId", "name email")
            .populate("reportId", "isPaid")
            .sort({ paymentDate: -1, createdAt: -1 });

        const totalRevenue = payments.reduce(
            (total, payment) => total + Number(payment.amount || 0),
            0
        );

        return res.status(200).json({
            success: true,
            count: payments.length,
            totalRevenue,
            data: payments
        });

    } catch (error) {
        console.error(
            "Admin payment history error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin payment history"
        });
    }
};

module.exports = {
    createPayment,
    verifyPayment,
    getAthletePayments,
    getAllPaymentsForAdmin
};
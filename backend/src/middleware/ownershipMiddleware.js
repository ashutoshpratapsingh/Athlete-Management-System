
const ownershipMiddleware = async (req, res, next) => {
    try {
        const userRole = String(req.user.role || "").toUpperCase();

        // ADMIN and COACH can access all athletes
        if (
            userRole === "ADMIN" ||
            userRole === "COACH"
        ) {
            return next();
        }

        // ATHLETE must have a linked athlete profile
        if (!req.user.athleteId) {
            return res.status(403).json({
                success: false,
                message: "No athlete profile linked to this account"
            });
        }

        const requestedAthleteId =
            req.params.athleteId || req.params.id;

        // Ensure the requested athlete ID exists
        if (!requestedAthleteId) {
            return res.status(400).json({
                success: false,
                message: "Athlete ID is required"
            });
        }

        // ATHLETE can only access their own data
        if (
            requestedAthleteId !== req.user.athleteId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only access your own athlete data"
            });
        }

        next();

    } catch (error) {
        console.error(
            "Ownership check error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to verify data ownership"
        });
    }
};

module.exports = ownershipMiddleware;
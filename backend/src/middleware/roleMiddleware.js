const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const userRole = String(req.user.role || "").toUpperCase();

        const normalizedAllowedRoles = allowedRoles.map((role) =>
            String(role).toUpperCase()
        );

        console.log("Role authorization check:", {
            userRole,
            allowedRoles: normalizedAllowedRoles
        });

        if (!normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action"
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
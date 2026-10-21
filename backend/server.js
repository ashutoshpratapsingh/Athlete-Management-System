
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/database");

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`AMS Backend running on port ${PORT}`);
});
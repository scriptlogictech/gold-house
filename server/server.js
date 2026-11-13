
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./config/db");

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Gold House DSS API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");


// ========================================
// MongoDB
// ========================================
connectDB();

// ========================================
// Middleware
// ========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// Test Route
// ========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running"
  });
});



// ========================================
// Swagger
// ========================================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// ========================================
// API Routes
// ========================================
app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/dashboard", dashboardRoutes);

// ========================================
// Server
// ========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
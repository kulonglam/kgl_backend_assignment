require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const connectDB = require("./config/db");

// Mongoose connection
connectDB();
const app = express();



// Json middleware
app.use(express.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/procurement", require("./routes/procurementRoutes"));
app.use("/sales", require("./routes/salesRoutes"));
app.use("/users", require("./routes/userRoutes"));


app.listen(process.env.PORT || 3000, () =>
  console.log(`Server running on port ${process.env.PORT || 3000}`)
);

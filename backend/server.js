import express, { json } from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import uploadRoutes from "./routes/upload.js";

config();
connectDB();

const app = express();
app.use(json());

app.use("/api", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

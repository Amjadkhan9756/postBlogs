import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import postRoutes from "./routes/posts.routes.js"
import userRoutes from "./routes/user.routes.js";


dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

app.use(postRoutes);
app.use(userRoutes);

app.use("/uploads", express.static("uploads"))

app.get("/", (req, res) => {
    res.send("API is working and connect to mongodb atles")
});

const PORT = process.env.PORT || 8080;

try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
} catch (err) {
    console.error("MongoDB connection failed; the API was not started.", err);
    process.exitCode = 1;
}




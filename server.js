const express = require("express");
const cors = require("cors");
require("dotenv").config();

const questionRoutes = require("./routes/questionRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Optional test route
app.get("/", (req, res) => {
  res.send("✅ API is working");
});

app.use("/api/questions", questionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

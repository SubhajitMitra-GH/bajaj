import express from "express";
import cors from "cors";
import { processData } from "./utils.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid input format" });
    }

    const result = processData(data);

    res.json({
      user_id: "subhajitmitra",
      email_id: "sm9199@srmist.edu.in",
      college_roll_number: "RA2311003010213",
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.listen(PORT, () => console.log(`Server running on ${PORT}`));
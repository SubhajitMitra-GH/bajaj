import express from "express";
import cors from "cors";
import { processData } from "./utils.js";

const app = express();
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
      user_id: "yourname_ddmmyyyy",
      email_id: "your@email.com",
      college_roll_number: "YOUR_ROLL",
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
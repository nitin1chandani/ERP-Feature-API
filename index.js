const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://root:<password>@cluster0.lwfqxqd.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Database connected");
  });

const employeeSchema = new mongoose.Schema({
  joinDate: Date,
  leavesInfo: {
    availableLeaves: Number,
    sickLeaves: Number,
    paidLeaves: Number,
    casualLeaves: Number,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

app.post("/detail", async (req, res) => {
  const joinDate = req.body.date;

  if (!joinDate) {
    return res.status(400).json({ error: "Date is required." });
  }

  const providedDate = new Date(joinDate);
  const year = providedDate.getFullYear();
  const month = providedDate.getMonth() + 1;
  const day = providedDate.getDate();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (isNaN(providedDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format." });
  }

  if (providedDate > currentDate) {
    return res
      .status(400)
      .json({ error: "Date of Joining cannot be in the future." });
  }

  if (month > 12 || month < 1 || day < 1) {
    return res.status(400).json({ error: "Invalid month or day." });
  }

  const daysInMonth = new Date(year, month, 0).getDate();

  if (day > daysInMonth) {
    return res.status(400).json({ error: "Invalid day for the given month." });
  }

  var sickLeaves = 12;
  var paidLeaves = 8;
  var casualLeaves = 4;

  const slpm = 1;
  const plpm = 8 / 12;
  const clpm = 4 / 12;
  var availableLeaves = 24;

  if (day <= 15) {
    for (let i = 1; i < month; i++) {
      sickLeaves -= slpm;
      paidLeaves -= plpm;
      casualLeaves -= clpm;
    }
    availableLeaves = sickLeaves + paidLeaves + casualLeaves;
  } else {
    for (let i = 1; i <= month; i++) {
      sickLeaves -= slpm;
      paidLeaves -= plpm;
      casualLeaves -= clpm;
    }
    availableLeaves = sickLeaves + paidLeaves + casualLeaves;
  }

  const newEmployee = new Employee({
    joinDate: providedDate,
    leavesInfo: {
      availableLeaves: Math.ceil(availableLeaves),
      sickLeaves: Math.ceil(sickLeaves),
      paidLeaves: paidLeaves < 0 ? 0 : paidLeaves,
      casualLeaves: casualLeaves < 0 ? 0 : casualLeaves,
    },
  });

  try {
    await newEmployee.save();
    res.json({
      availableLeaves: Math.ceil(availableLeaves),
      sickLeaves: Math.ceil(sickLeaves),
      paidLeaves: paidLeaves < 0 ? 0 : paidLeaves,
      casualLeaves: casualLeaves < 0 ? 0 : casualLeaves,
      message: "Employee data saved successfully.",
    });
  } catch (err) {
    res.status(500).json({ error: "Error saving employee data." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

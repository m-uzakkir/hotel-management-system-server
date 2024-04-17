const bcrypt = require("bcrypt");
const { Patient, User } = require("../models/User");
const { generateToken } = require("../services/token");

// Create a new patient

const createPatient = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    let user = await User.findOne({
      email,
    });

    if (!user) {
      user = await User.create({
        email,
        hashedPassword,
        role: "patient",
      });
    } else {
      return res.status(400).json({ message: "User already exists" });
    }

    const patient = await Patient.create({
      user: user._id,
      name,
    });

    const token = generateToken(
      {
        id: patient._id,
        role: user.role,
      },
      "1d"
    );

    res.status(201).json({ patient, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPatient,
  getPatients,
};

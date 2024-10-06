import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const adminSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    minlength: [3, "Full Name must be of three Characters atleast"],
  },
  username: {
    type: String,
    required: true,
    minlength: [2, "Username must be of two Characters"],
  },
  email: {
    type: String,
    required: true,
    validator: [validator.isEmail, "Please provide an valid Email Address"],
  },
  role: {
    type: String,
    required: true,
    enum: ["Admin"],
  },
  password: {
    type: String,
    required: true,
    validator: [
      validator.isStrongPassword,
      "Please provide an Strong Password",
    ],
  },
});

adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    } catch (error) {
      return next(error);
    }
  }
  next();
});
export const Admin = mongoose.model("Admin", adminSchema);

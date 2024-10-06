import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const generateToken = async (user, message, statuscode, res) => {
  console.log(user);

  const modifiedUser = { ...user._doc }; // Assuming 'user' is a Mongoose document, use ._doc
  delete modifiedUser.password;
  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );

  const cookieName = user.role == "Admin" ? "AdminToken" : "UserToken";

  if (typeof window !== "undefined") {
    localStorage.setItem(cookieName, token);
  }

  res
    .status(statuscode)
    .cookie(cookieName, token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .json({
      success: true,
      message,
      modifiedUser,
    });
};

export const comparePassword = async (user, enteredPassword) => {
  try {
    const result = await bcrypt.compare(enteredPassword, user.password);
    return result;
  } catch (error) {
    return new ErrorHandler(`Error while comparing Passwords: ${error}`, 501);
  }
};

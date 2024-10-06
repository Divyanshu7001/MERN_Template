import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import "dotenv/config";
import jwt from "jsonwebtoken";

export const verifyUser = async (req, _, next) => {
  try {
    const token =
      req.headers.cookie
        ?.split(";")
        .find((cookie) => cookie.trim().startsWith("UserToken="))
        ?.split("=")[1] || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new ErrorHandler("Unauthorized Request", 402));
    }

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      //console.log(decodedToken);

      const user = await User.findById(decodedToken?.id).select("-password");

      if (!user) {
        return next(new ErrorHandler("Invalid Access Token", 403));
      }

      req.user = user;
      next();
    } catch (verifyError) {
      return next(
        new ErrorHandler(
          `Token Verification Failed: ${verifyError.message}`,
          401
        )
      );
    }
  } catch (error) {
    return next(
      new ErrorHandler(error?.message || "Invalid Verification", 401)
    );
  }
};

export const verifyAdmin = async (req, _, next) => {
  try {
    const token =
      req.headers.cookie
        ?.split(";")
        .find((cookie) => cookie.trim().startsWith("AdminToken="))
        ?.split("=")[1] || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new ErrorHandler("Unauthorized Request", 402));
    }
    // console.log(token);

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const admin = await Admin.findById(decodedToken?.id).select("-password");

      if (!admin) {
        return next(
          new ErrorHandler("Invalid Access Token!! No Admin Found", 403)
        );
      }

      req.admin = admin;
      next();
    } catch (verifyError) {
      return next(
        new ErrorHandler(
          `Token Verification Failed: ${verifyError.message}`,
          401
        )
      );
    }
  } catch (error) {
    return next(
      new ErrorHandler(error?.message || "Invalid Verification", 401)
    );
  }
};

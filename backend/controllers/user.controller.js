import { User } from "../models/user.model.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generateToken } from "../utils/generateToken.js";
import { catchAsyncErrors } from "../middlewares/errorMiddleware.js";
import { comparePassword } from "../utils/generateToken.js";
import cloudinary from "cloudinary";
import fs from "fs";

export const createUser = catchAsyncErrors(async (req, res, next) => {
  let avatarUrl = {
    public_id: "",
    url: "",
  };
  //console.log(req);

  const { fullName, username, email, password } = req.body;

  if (!fullName || !username || !email || !password) {
    return next(new ErrorHandler("Please provide all the details", 401));
  }
  const existedUser = await User.findOne({ email: email });
  if (existedUser) {
    return next(
      new ErrorHandler("User already exists with these credentials", 402)
    );
  }
  if (req.file) {
    const avatar = req.file;
    const allowedFormats = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedFormats.includes(avatar.mimetype)) {
      return next(new ErrorHandler("File format not supported", 402));
    }

    try {
      console.log(avatar.path);

      const cloudinaryResponse = await cloudinary.uploader.upload(avatar.path);
      fs.unlinkSync(avatar.path);
      if (!cloudinaryResponse) {
        return next(
          new ErrorHandler("Error While uploading to Cloudinary", 500)
        );
      }

      if (cloudinaryResponse && !cloudinaryResponse.error) {
        console.log(cloudinaryResponse);

        avatarUrl = {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        };
        console.log(avatarUrl);
      } else {
        console.error(
          "Cloudinary Error: ",
          cloudinaryResponse.error || "Unknown Cloudinary error"
        );
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary: ", error);
      return next(new ErrorHandler("Error uploading avatar image", 500));
    }
  }

  const user = await User.create({
    fullName,
    email,
    role: "User",
    password,
    username,
    avatar: {
      public_id: avatarUrl.public_id,
      uri: avatarUrl.url,
    },
  });

  generateToken(user, "User Created Successfully", 201, res);
});

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide all the details", 401));
  }

  const existedUser = await User.findOne({ email }).select("-password");
  if (!existedUser) {
    return next(new ErrorHandler("No User exists with this Credintials", 402));
  }
  if (existedUser.role != "User") {
    return next(new ErrorHandler("No User with this credentials exists", 403));
  }

  const response = await comparePassword(existedUser, password);

  if (response) {
    generateToken(existedUser, "User Logged in Sucessfully", 202, res);
  } else {
    return next(new ErrorHandler("Passwords didn't match,Please try again!!"));
  }
};

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log(req.user);
    //console.log(req);

    const user = req.user;
    //console.log(user);

    res.status(200).json({
      success: true,
      message: "User Details fetched Successfully",
      user,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error while fetching User Details: ${error}`, 502)
    );
  }
});

export const logoutUser = catchAsyncErrors(async (req, res) => {
  // Clear the user token from the database
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { userToken: undefined } },
    { new: true }
  );

  // Clear the cookie
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res.status(200).clearCookie("UserToken", options).json({
    success: true,
    message: "User Logged out successfully",
  });
});

export const changePassword = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body);

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please provide all the Details", 401));
  }

  const verifiedUser = await User.findById(req.user?._id);

  const verifyPassword = await comparePassword(verifiedUser, oldPassword);

  if (!verifyPassword) {
    return next(new ErrorHandler("Password doesn't match!!,Try again", 403));
  }

  verifiedUser.password = newPassword;

  await verifiedUser.save({ validateBeforeSave: false });

  return res.status(299).json({
    success: true,
    message: "User Password Changed successfully",
    verifiedUser,
  });
});

export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const userVerified = req.user;
  const id = userVerified._id;
  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User details updated successfully",
    user,
  });
});

export const updateAvatar = catchAsyncErrors(async (req, res, next) => {
  if (req.file) {
    let avatarUrl = {
      public_id: "",
      url: "",
    };
    const avatar = req.file;
    const allowedFormats = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedFormats.includes(avatar.mimetype)) {
      return next(new ErrorHandler("File format not supported"));
    }

    try {
      const user = await User.findById(req.user._id).select("-password");
      if (user.avatar) {
        const publicId = user.avatar.public_id;
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      }
      const cloudinaryResponse = await cloudinary.uploader.upload(avatar.path);
      fs.unlinkSync(avatar.path);

      if (cloudinaryResponse && !cloudinaryResponse.error) {
        avatarUrl = {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        };
      } else {
        console.error(
          "Cloudinary Error: ",
          cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        return next(new ErrorHandler("Error uploading avatar image", 500));
      }
      user.avatar.public_id = avatarUrl.public_id;
      user.avatar.uri = avatarUrl.url;
      await user.save({ validateBeforeSave: false });

      res.status(201).json({
        success: true,
        message: "User Avatar updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary: ", error);
      return next(new ErrorHandler("Error uploading avatar image", 500));
    }
  } else {
    return next(new ErrorHandler("No Image Uploaded", 403));
  }
});

export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { userToken: undefined } },
      { new: true }
    );
    if (user.avatar && user.avatar.public_id && user.avatar.uri) {
      const publicId = user.avatar.public_id;
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
    }
    const deleted = await User.findByIdAndDelete(user._id);

    if (!deleted) {
      return next(new ErrorHandler("The User didn't get Deleted", 501));
    }

    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
      clearLocalStorage: true,
    });
  } catch (error) {
    return next(new ErrorHandler("Error while deleting User: ", error));
  }
});

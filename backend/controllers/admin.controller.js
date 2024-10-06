import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generateToken } from "../utils/generateToken.js";
import { catchAsyncErrors } from "../middlewares/errorMiddleware.js";
import { comparePassword } from "../utils/generateToken.js";
import cloudinary from "cloudinary";
export const createAdmin = catchAsyncErrors(async (req, res, next) => {
  const { fullName, username, email, password } = req.body;
  if (!fullName || !username || !email || !password) {
    return next(new ErrorHandler("Please provide all the details", 401));
  }

  const existedAdmin = await Admin.findOne({ email: email });
  if (existedAdmin) {
    return next(
      new ErrorHandler("Admin already exists with these credentials", 402)
    );
  }

  const admin = await Admin.create({
    fullName,
    email,
    role: "Admin",
    password,
    username,
  });
  generateToken(admin, "Admin Created Successfully", 201, res);
});

export const loginAdmin = catchAsyncErrors(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide all the details", 401));
  }

  const existedAdmin = await Admin.findOne({ email });

  if (!existedAdmin) {
    return new ErrorHandler("No Admin exists with this Credintials", 402);
  }
  if (existedAdmin.role != "Admin") {
    return new ErrorHandler("No Admin with this credentials exists", 403);
  }
  const response = await comparePassword(existedAdmin, password);
  //console.log(response);

  if (response) {
    generateToken(existedAdmin, "Admin Logged in Sucessfully", 202, res);
  } else {
    return new ErrorHandler("Passwords didn't match,Please try again!!");
  }
});

export const getAdminDetails = catchAsyncErrors(async (req, res) => {
  try {
    console.log(req.admin);
    const admin = req.admin;

    res.status(200).json({
      success: true,
      message: "Admin Details fetched Successfully",
      admin,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error while fetching Admin Details: ${error}`, 502)
    );
  }
});

export const logoutAdmin = catchAsyncErrors(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $set: {
        adminToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200).clearCookie("adminToken", options).json({
    success: true,
    message: "Admin Logged out successfully",
    clearLocalStorage: true,
  });
});

export const changePassword = catchAsyncErrors(async (req, res, next) => {
  //console.log(req.body);

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please provide all the Details", 401));
  }

  const verifiedAdmin = await Admin.findById(req.admin?._id);

  const verifyPassword = await comparePassword(verifiedAdmin, oldPassword);

  if (!verifyPassword) {
    return next(new ErrorHandler("Password doesn't match!!,Try again", 403));
  }

  verifiedAdmin.password = newPassword;

  await verifiedAdmin.save({ validateBeforeSave: false });

  return res.status(299).json({
    success: true,
    message: "Admin Password Changed successfully",
    verifiedAdmin,
  });
});

export const updateAdmin = catchAsyncErrors(async (req, res, next) => {
  const adminVerified = req.admin;
  const id = adminVerified._id;
  const admin = await Admin.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Admin details updated successfully",
    admin,
  });
});

export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body;
  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const modifiedUser = { ...user._doc }; // Assuming 'user' is a Mongoose document, use ._doc
  delete modifiedUser.password;
  res.status(200).json({
    success: true,
    message: "User details updated successfully",
    modifiedUser,
  });
});

export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    await User.findByIdAndUpdate(
      id,
      { $set: { userToken: undefined } },
      { new: true }
    );
    if (user.avatar && user.avatar.public_id && user.avatar.uri) {
      console.log(user.avatar);
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

export const deleteAdmin = catchAsyncErrors(async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    const deleted = await Admin.findByIdAndDelete(admin._id);
    if (!deleted) {
      return new ErrorHandler("The Admin didn't get deleted", 501);
    }
    return res.status(200).json({
      success: true,
      message: "Admin Deleted Sucessfully",
      clearLocalStorage: true,
    });
  } catch (error) {
    return new ErrorHandler("Error While deleting Admin: ", error);
  }
});

export const getAllUsers = catchAsyncErrors(async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      messsage: "All Users fetched successfully",
      users,
    });
  } catch (error) {
    return new ErrorHandler("Error while fetching all the Users: ", error);
  }
});

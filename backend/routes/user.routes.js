import { Router } from "express";
import { verifyUser } from "../utils/auth.js";
import {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getUserDetails,
  changePassword,
  updateAvatar,
  logoutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = new Router();

router.route("/createUser").post((req, res, next) => {
  if (req.headers["content-type"].includes("multipart/form-data")) {
    upload.single("avatar")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ heyyyyyyy: err.message });
      }
      next();
    });
  } else {
    next();
  }
}, createUser);
router.route("/loginUser").post(loginUser);
router.route("/logoutUser").post(verifyUser, logoutUser);
router.route("/getUser").get(verifyUser, getUserDetails);
router.route("/changePassword").put(verifyUser, changePassword);
router.route("/updateUser").put(verifyUser, updateUser);
router.route("/updateAvatar").put(
  verifyUser,
  (req, res, next) => {
    if (req.headers["content-type"].includes("multipart/form-data")) {
      upload.single("avatar")(req, res, (err) => {
        if (err) {
          return res
            .status(400)
            .json({ "Error Uploading Image(Multer)": err.message });
        }
        next();
      });
    } else {
      next();
    }
  },
  updateAvatar
);
router.route("/deleteUser").delete(verifyUser, deleteUser);

export default router;

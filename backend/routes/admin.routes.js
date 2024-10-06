import { Router } from "express";
import { verifyAdmin } from "../utils/auth.js";
import {
  createAdmin,
  loginAdmin,
  updateAdmin,
  deleteAdmin,
  getAllUsers,
  getAdminDetails,
  logoutAdmin,
  updateUser,
  changePassword,
  deleteUser,
} from "../controllers/admin.controller.js";

const router = new Router();

router.post("/createAdmin", createAdmin);
router.post("/loginAdmin", loginAdmin);
router.get("/getAdmin", verifyAdmin, getAdminDetails);
router.put("/changePassword", verifyAdmin, changePassword);
router.post("/logoutAdmin", verifyAdmin, logoutAdmin);
router.put("/updateAdmin", verifyAdmin, updateAdmin);
router.delete("/deleteAdmin", verifyAdmin, deleteAdmin);

router.get("/getAllUsers", verifyAdmin, getAllUsers);
router.put("/updateUser", verifyAdmin, updateUser);
router.delete("/deleteUser", verifyAdmin, deleteUser);

export default router;

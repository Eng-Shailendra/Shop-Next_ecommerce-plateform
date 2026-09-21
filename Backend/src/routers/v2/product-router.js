import { Router } from "express";
import { createProduct, getProductById, getProducts } from "../../controllers/v2/product-controller.js";
import { isAdmin, isLogin } from "../../middleware/auth-middleware.js";
import multer from "multer";
const upload = multer({dest : "uploads/"});

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", isLogin, isAdmin, upload.single("image"), createProduct);

export default router;
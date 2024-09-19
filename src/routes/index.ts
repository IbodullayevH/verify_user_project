import { AuthController } from "controllers";
import { Router } from "express";

let router: Router = Router()

router.post("/auth/sendCode", AuthController.SendCode)
router.post("/auth/verifydCode", AuthController.VerifyCode)

export default router
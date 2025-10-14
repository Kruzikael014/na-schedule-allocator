import { Router } from "express";
import * as controller from "../controllers/root.controller"

const router = Router({
  caseSensitive: false,
})

router.get('/', controller.test)

export { router as RootRouter }
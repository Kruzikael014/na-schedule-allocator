import { Router } from "express";
import * as controller from "../controllers/period.controller"

const router = Router({
    caseSensitive: false,
})

router.get('/', controller.getPeriods)
router.post('/', controller.createPeriod)
router.patch('/', controller.updatePeriod)
router.patch('/set-present', controller.updatePresentPeriod)

export { router as PeriodRouter }
import { Router } from "express"
import * as controller from "../controllers/activity.controller"

const router = Router({
    caseSensitive: false
})

router.post('/', controller.createActivities)
router.get('/:periodId', controller.getActivities)

export { router as ActivityRouter }
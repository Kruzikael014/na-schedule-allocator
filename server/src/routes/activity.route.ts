import { Router } from "express"
import * as controller from "../controllers/activity.controller"

const router = Router({
    caseSensitive: false
})

router.post('/', controller.createActivities)
router.get('/:periodId', controller.getActivities)
router.put('/:activityId', controller.updateActivity)

export { router as ActivityRouter }
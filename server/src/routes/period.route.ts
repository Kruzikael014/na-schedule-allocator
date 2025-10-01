import { Router } from "express";
import * as controller from "../controllers/period.controller"

const periodRouter = Router({
    caseSensitive: false,
})

periodRouter.get('/', controller.getPeriods)
periodRouter.post('/', controller.createPeriod)
periodRouter.patch('/', controller.updatePeriod)
periodRouter.patch('/set-present', controller.updatePresentPeriod)

export default periodRouter
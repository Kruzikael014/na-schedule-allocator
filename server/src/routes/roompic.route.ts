import { Router } from "express"
import * as controller from "../controllers/roompic.controller"

const router = Router({
  caseSensitive: false
})

router.get('/:periodId', controller.getRoomPics)
router.post('/bulk', controller.createBulkRoomPic)
router.post('/', controller.createRoomPic)

export { router as RoomPicRouter }
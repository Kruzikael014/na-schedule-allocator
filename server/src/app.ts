import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import { PeriodRouter } from "./routes/period.route"
import { NotFoundError } from "./lib/error"
import { ActivityRouter } from "./routes/activity.route"
import { RootRouter } from "./routes/root.route"

const app = express()

app.use(cors())
app.use(express.json())

// route lists
app.use('/period', PeriodRouter)
app.use('/activity', ActivityRouter)
app.use('/', RootRouter)

app.use((req: Request, res: Response, next: NextFunction) => {
    const err = new NotFoundError()
    res.status(err.status).json(err.data);
});

export default app
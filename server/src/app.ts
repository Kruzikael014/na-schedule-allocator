import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import periodRouter from "./routes/period.route"
import { NotFoundError } from "./lib/error"

const app = express()

app.use(cors())
app.use(express.json())

// route lists
app.use('/api/period', periodRouter)

app.use((req: Request, res: Response, next: NextFunction) => {
    const err = new NotFoundError()
    res.status(err.status).json(err.data);
});

export default app
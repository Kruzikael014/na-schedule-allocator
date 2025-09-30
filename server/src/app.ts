import express from "express"
import cors from "cors"

const app = express()

app.use(cors)
app.use(express.json())

// route lists


export default app
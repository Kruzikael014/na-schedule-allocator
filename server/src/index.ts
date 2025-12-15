import 'dotenv/config'
import app from './app'

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT} 9`)
})
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Revix API is running! 🚀' })
})

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`)
})
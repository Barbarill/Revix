import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import carRoutes from './routes/cars'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Revix API is running! 🚀' })
})

app.use('/api/auth', authRoutes)
app.use('/api/cars', carRoutes)

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`)
})
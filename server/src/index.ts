import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import carRoutes from './routes/cars'
import problemRoutes from './routes/problems'
import solutionRoutes from './routes/solutions'
import userRoutes from './routes/users'
import searchRoutes from './routes/search'
import notificationRoutes from './routes/notifications'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Revix API is running! 🚀' })
})

app.use('/api/auth', authRoutes)
app.use('/api/cars', carRoutes)
app.use('/api/problems', problemRoutes)
app.use('/api/solutions', solutionRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/notifications', notificationRoutes)

// Esporta app per i test (Supertest la usa senza avviare il server)
export { app }

// Avvia il server solo se eseguito direttamente (non quando importato dai test)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`)
  })
}
import { Router } from 'express'

import authRouter from './auth.js'
import healthRouter from './health.js'
import portfolioRouter from './portfolio.js'
import profilesRouter from './profiles.js'
import stocksRouter from './stocks.js'

export const routes = Router()

// Mount sub-routers
routes.use('/auth', authRouter)
routes.use('/health', healthRouter)
routes.use('/portfolio', portfolioRouter)
routes.use('/profiles', profilesRouter)
routes.use('/stocks', stocksRouter)

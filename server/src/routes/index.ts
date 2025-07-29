import { Router } from 'express'

import authRouter from './auth.js'
import healthRouter from './health.js'
import portfolioRouter from './portfolio.js'
import profilesRouter from './profiles.js'
import stockPricesRouter from './stock-prices.js'
import stocksRouter from './stocks.js'
import todosRouter from './todos.js'
import usersRouter from './users.js'

export const routes = Router()

// Mount sub-routers
routes.use('/auth', authRouter)
routes.use('/health', healthRouter)
routes.use('/portfolio', portfolioRouter)
routes.use('/stock-prices', stockPricesRouter)
routes.use('/profiles', profilesRouter)
routes.use('/stocks', stocksRouter)
routes.use('/todos', todosRouter)
routes.use('/users', usersRouter)

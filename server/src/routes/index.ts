import { Router } from 'express'

import authRouter from './auth'
import healthRouter from './health'
import portfolioRouter from './portfolio'
import priceHistoryRouter from './price-history'
import profilesRouter from './profiles'
import stocksRouter from './stocks'
import todosRouter from './todos'
import usersRouter from './users'

export const routes = Router()

// Mount sub-routers
routes.use('/auth', authRouter)
routes.use('/health', healthRouter)
routes.use('/portfolio', portfolioRouter)
routes.use('/price-history', priceHistoryRouter)
routes.use('/profiles', profilesRouter)
routes.use('/stocks', stocksRouter)
routes.use('/todos', todosRouter)
routes.use('/users', usersRouter)

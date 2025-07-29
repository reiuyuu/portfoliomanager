// npx tsx query-data.ts

import { db } from './src/config/db'

async function queryData() {
  // 查询 stocks 表
  const stocksResult = await db.from('stocks').select('*')
  console.log('Stocks 表数据:')
  console.log(stocksResult.data)
  console.log('\n')

  // 查询 todos 表
  const todosResult = await db.from('todos').select('*')
  console.log('Todos 表数据:')
  console.log(todosResult.data)
}

queryData()

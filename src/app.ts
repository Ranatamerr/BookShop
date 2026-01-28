import { Hono } from 'hono'
import dotenv from 'dotenv'

dotenv.config()

const app = new Hono()

app.get('/', (c) => c.text('Hello World!'))

export default app  

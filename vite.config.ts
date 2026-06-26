import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { PrismaClient } from '@prisma/client'
import { DEFAULT_USERS, INITIAL_CARDS, formatTimestamp } from './src/utils/constants'
import type { ActivityLog, Card, User } from './src/utils/constants'

const prisma = new PrismaClient()

function sendJson(res: any, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function readJson(req: any) {
  return new Promise<any>((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: { toString: () => string }) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
  })
}

async function createLog(message: string) {
  return prisma.activityLog.create({
    data: {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      message,
    },
  })
}

function toCard(card: any): Card {
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    assignedTo: card.assignedTo ?? '',
    priority: card.priority,
    column: card.column,
    createdAt: card.createdAt.toISOString(),
    createdBy: card.createdBy,
  }
}

function toUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

function toLog(log: any): ActivityLog {
  return {
    id: log.id,
    timestamp: formatTimestamp(log.timestamp.toISOString()),
    message: log.message,
  }
}

async function seedDatabase() {
  const userCount = await prisma.user.count()
  if (userCount === 0) {
    await prisma.user.createMany({ data: DEFAULT_USERS })
  }

  const cardCount = await prisma.card.count()
  if (cardCount === 0) {
    await prisma.card.createMany({
      data: INITIAL_CARDS.map((card) => ({
        ...card,
        assignedTo: card.assignedTo || null,
        createdAt: new Date(card.createdAt),
      })),
    })
  }

  const logCount = await prisma.activityLog.count()
  if (logCount === 0) {
    await prisma.activityLog.create({
      data: {
        id: 'log_1',
        message: 'Admin initialized the board with starter tasks.',
      },
    })
  }
}

async function boardPayload() {
  await seedDatabase()

  const [users, cards, logs] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: 'asc' } }),
    prisma.card.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.activityLog.findMany({ orderBy: { timestamp: 'desc' } }),
  ])

  return {
    users: users.map(toUser),
    cards: cards.map(toCard),
    logs: logs.map(toLog),
  }
}

function addApi(server: any) {
  server.middlewares.use(async (req: any, res: any, next: any) => {
    const url = req.url?.split('?')[0] ?? ''

    if (!url.startsWith('/api/')) {
      next()
      return
    }

    try {
      if (req.method === 'GET' && url === '/api/board') {
        sendJson(res, 200, await boardPayload())
        return
      }

      if (req.method === 'POST' && url === '/api/cards') {
        const card = await readJson(req)
        const saved = await prisma.card.create({
          data: {
            id: card.id,
            title: card.title,
            description: card.description,
            assignedTo: card.assignedTo || null,
            priority: card.priority,
            column: card.column,
            createdAt: new Date(card.createdAt),
            createdBy: card.createdBy,
          },
        })
        await createLog(`${card.createdBy} created "${card.title}" in ${card.column}.`)
        sendJson(res, 201, toCard(saved))
        return
      }

      const cardMatch = url.match(/^\/api\/cards\/([^/]+)(?:\/(move|assign))?$/)
      if (cardMatch) {
        const id = decodeURIComponent(cardMatch[1])
        const action = cardMatch[2]

        if (req.method === 'PATCH' && action === 'move') {
          const body = await readJson(req)
          const saved = await prisma.card.update({ where: { id }, data: { column: body.to } })
          await createLog(`${body.actor} moved a card from ${body.from} to ${body.to}.`)
          sendJson(res, 200, toCard(saved))
          return
        }

        if (req.method === 'PATCH' && action === 'assign') {
          const body = await readJson(req)
          const saved = await prisma.card.update({
            where: { id },
            data: { assignedTo: body.assignedTo || null },
          })
          await createLog(`${body.actor} assigned a card.`)
          sendJson(res, 200, toCard(saved))
          return
        }

        if (req.method === 'PATCH' && !action) {
          const body = await readJson(req)
          const saved = await prisma.card.update({
            where: { id },
            data: {
              ...body.updates,
              assignedTo: body.updates?.assignedTo || null,
            },
          })
          await createLog(`${body.actor} updated a card.`)
          sendJson(res, 200, toCard(saved))
          return
        }

        if (req.method === 'DELETE' && !action) {
          const body = await readJson(req)
          await prisma.card.delete({ where: { id } })
          await createLog(`${body.actor} deleted a card.`)
          sendJson(res, 200, { ok: true })
          return
        }
      }

      if (req.method === 'POST' && url === '/api/users') {
        const body = await readJson(req)
        const saved = await prisma.user.create({
          data: {
            id: body.id,
            name: body.name,
            email: body.email,
            role: body.role,
          },
        })
        await createLog(`${body.actor} added ${body.name}.`)
        sendJson(res, 201, toUser(saved))
        return
      }

      const userMatch = url.match(/^\/api\/users\/([^/]+)$/)
      if (userMatch) {
        const id = decodeURIComponent(userMatch[1])

        if (req.method === 'PATCH') {
          const body = await readJson(req)
          const saved = await prisma.user.update({ where: { id }, data: body.updates })
          await createLog(`${body.actor} updated a user.`)
          sendJson(res, 200, toUser(saved))
          return
        }

        if (req.method === 'DELETE') {
          const body = await readJson(req)
          await prisma.card.updateMany({ where: { assignedTo: id }, data: { assignedTo: null } })
          await prisma.user.delete({ where: { id } })
          await createLog(`${body.actor} deleted a user.`)
          sendJson(res, 200, { ok: true })
          return
        }
      }

      sendJson(res, 404, { error: 'API route not found' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Server error'
      sendJson(res, 500, { error: message })
    }
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'kanban-prisma-api',
      configureServer(server) {
        addApi(server)
      },
    },
  ],
})

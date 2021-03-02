'use strict'

const { default: fastify } = require("fastify")

module.exports = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    const { greeting = 'Hello' } = request.query
    return reply.view(`hello.hbs`, { greeting })
  })
}
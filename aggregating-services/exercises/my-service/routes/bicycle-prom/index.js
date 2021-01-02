'use strict'

const {promisify} = require('util') 
const model = require('../../model')
const { bicycle } = require('../../model')

const read = promisify(bicycle.read)
const create = promisify(bicycle.create)
const update = promisify(bicycle.update)
const del = promisify(bicycle.del)
const {uid} = bicycle

module.exports = async (fastify, opts) => {
    const { notFound } = fastify.httpErrors

    fastify.get('/:id', async (request, reply) => {
        try {
            const {id} = request.params
            return  await read(id)
        } catch (err) {
            if(err.message === 'not found') throw notFound()
            throw err
        }
    })

    fastify.post('/', async (request, reply) => {
            const id = uid()
            const { data } = request.body
            await create(id, data)
            reply.code(201)
            return { id }
    })

    fastify.post('/:id/update', async (request, reply) => {
        try {
            const {id} = request.params
            const { data } = request.body
            await update(id, data)
            return reply.code(204)
        } catch (err) {
            if(err.message === 'not found') throw notFound()
            throw err
        }
    })

    fastify.put('/:id', async (request, reply) => {
        try {
            const { id } = request.params
            const { data } = request.body
            await create(id, data)
            return reply.code(201)
        } catch (err) {
            if(err.message === 'resource exists') {
                await update(id, data)
                return reply.code(204)
            } else {
                throw err
            }
        }
    })

    fastify.delete('/:id', async (request, reply) => {
        try {
            const {id} = request.params
            await del(id)
            reply.code(204)
        } catch (err) {
            if(err.message === 'not found') throw notFound()
            throw err
        }
    })
}
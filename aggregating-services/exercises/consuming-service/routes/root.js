'use strict'
const got = require('got')
const {
  BICYCLE_SERVICE_PORT = 4000,
  BRAND_SERVICE_PORT = 5000
} = process.env
const bicycleServ = `http://localhost:${BICYCLE_SERVICE_PORT}`
const brandServ = `http://localhost:${BRAND_SERVICE_PORT}`

module.exports = async function (fastify, opts) {
  fastify.get('/:id', async function (request, reply) {
    const { id } = request.params
    const { httpErrors } = fastify
    try {
      const [ bycicle, brand ] = await Promise.all([ 
        got(`${bicycleServ}/${id}`).json(),
        got(`${brandServ}/${id}`).json()
      ])
      return {
        id: bycicle.id,
        color: bycicle.color,
        brand: brand.name
      }
    } catch (err) {
      if(!err.response) throw err
      if(err.response.statusCode === 404) {
        throw httpErrors.notFound()
      }
      if(err.response.statusCode === 400) {
        throw httpErrors.badRequest()
      }
      throw err
    }
  })
}

import Queries from '../src/helpers/queries'
const assert = require('chai').assert
const lxr = require('../lxr.json')
const leanixjs = require('leanix-js')

const { Authenticator, GraphQLClient } = leanixjs
const authenticator = new Authenticator(lxr.host, lxr.apitoken)
const graphql = new GraphQLClient(authenticator)

const queries = new Queries(graphql)

describe('The queries', () => {
  before(async () => {
    await authenticator.start()
  })
  after(async () => {
    await authenticator.stop()
  })

  xit('should fetch the opportunity costs tag group from workspace', async () => {
    const opportunityCostTagGroup = await queries.fetchOpportunityCostTagGroup()
    assert.containsAllKeys(opportunityCostTagGroup, ['id', 'name', 'tags'], 'the returned tagGroup must contain id, name and tags')
    assert.isArray(opportunityCostTagGroup.tags, 'tags should be an object')
    assert.lengthOf(opportunityCostTagGroup.tags, 4, 'tag group opportunity costs must have 4 tags in it')
    assert.deepEqual(opportunityCostTagGroup.tags.map(tag => tag.name).sort(), ['high', 'low', 'medium', 'very high'], 'tags names should have the expected values')
  })
})

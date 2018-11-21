const Queries = require('../src/helpers/queries')
const assert = require('chai').assert
const ProgressBar = require('progress')
const lxr = require('../lxr.json')
const leanixjs = require('leanix-js')
const projects = require('./devProjects.json')
const businessCapabilities = require('./devBusinessCapabilities.json')

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

  xit('should delete all workspace factsheets', async () => {
    const query = '{allFactSheets{edges{node{id}}}}'
    let ids = await graphql
      .executeGraphQL(query)
      .then(res => res.allFactSheets.edges.map(edge => edge.node.id))
    const bar = new ProgressBar(
      `Archiving ${ids.length} factSheets [:bar] :rate/fps :percent :etas - :errors errors`,
      { total: ids.length, renderThrottle: 100 }
    )
    let errors = []
    for (let id of ids) {
      const query = `mutation($id:ID!,$patches:[Patch]!){updateFactSheet(id:$id,comment:"Delete FS",patches:$patches,validateOnly:false){factSheet{id}}}`
      const variables = {
        id,
        patches: [{ op: 'add', path: '/status', value: 'ARCHIVED' }]
      }
      await graphql
        .executeGraphQL(query, variables)
        .catch(() => errors.push(id))
      bar.tick({ errors: errors.length })
    }
    assert(errors.length === 0, 'All factsheets should have been deleted')
  })

  it('should create projects in workspace', async () => {
    let errors = []
    const opportunityCostTagGroup = await queries.fetchOpportunityCostTagGroup()
    const bar = new ProgressBar(
      `Creating ${projects.length} projects [:bar] :rate/fps :percent :etas :errors errors`,
      { total: projects.length, renderThrottle: 100 }
    )
    const opportunityCostTags = opportunityCostTagGroup.tags
    for (let project of projects) {
      project.tags = project.tags
        .map(tagName => opportunityCostTags.find(tag => tag.name === tagName))
        .map(tag => { return { tagId: tag.id } })
      const query = `mutation($input:BaseFactSheetInput!,$patches:[Patch]){createFactSheet(input:$input,patches:$patches){factSheet{id}}}`
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      const variables = {
        input: { name: project.name, type: 'Project' },
        patches: [
          { op: 'replace', path: '/externalId', value: JSON.stringify({ externalId: project.externalId }) },
          { op: 'replace', path: '/budgetCapEx', value: project.budgetCapEx },
          { op: 'replace', path: '/budgetOpEx', value: project.budgetOpEx },
          { op: 'replace', path: '/tags', value: JSON.stringify(project.tags) },
          { op: 'replace', path: '/lifecycle', value: JSON.stringify({ phases: [{ phase: project.lifecycle, startDate: twoDaysAgo.toISOString().substring(0, 10) }] }) }
        ]
      }

      await graphql
        .executeGraphQL(query, variables)
        .catch(() => errors.push(project.id))
      bar.tick({ errors: errors.length })
    }
  })

  it('should create businessCapabilities in workspace', async () => {
    let errors = []
    const projectsIndex = await queries.fetchProjectsIndex()
    const bar = new ProgressBar(
      `Creating ${businessCapabilities.length} business capabilities [:bar] :rate/fps :percent :etas :errors errors`,
      { total: businessCapabilities.length, renderThrottle: 100 }
    )
    for (let businessCapability of businessCapabilities) {
      const projectRelationsPatches = businessCapability.projects
        .map(externalId => {
          const project = projectsIndex[externalId]
          if (project === undefined) console.warn(`Could not found project with externalId ${externalId}!!!`)
          return project
            ? {op: 'add', path: `/relBusinessCapabilityToProject/new_${project.id}`, value: JSON.stringify({ factSheetId: project.id })}
            : undefined
        })
        .filter(project => project !== undefined)
      const query = `mutation($input:BaseFactSheetInput!,$patches:[Patch]){createFactSheet(input:$input,patches:$patches){factSheet{id}}}`
      const variables = {
        input: { name: businessCapability.name, type: 'BusinessCapability' },
        patches: [
          ...projectRelationsPatches
        ]
      }
      await graphql
        .executeGraphQL(query, variables)
        .catch(() => errors.push(businessCapability.id))
      bar.tick({ errors: errors.length })
    }
  })
})

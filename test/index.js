const assert = require('chai').assert
const chance = require('chance').Chance()
const ProgressBar = require('progress')
const lxr = require('../lxr.json')
const leanixjs = require('leanix-js')

const { Authenticator, GraphQLClient } = leanixjs
const authenticator = new Authenticator(lxr.host, lxr.apitoken)
const graphql = new GraphQLClient(authenticator)

const pAuthorizationConcept = 0.5
const pUserAuthorization = 0.7
const pITRoleCatalog = 0.6
const pAIMRelevance = 0.4
const pAccountingRelevantData = 0.7

describe('Setting up workspace', () => {
  let ids = []

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

    let attempt = 0
    let errors = []
    do {
      const bar = new ProgressBar(
        `Archiving ${ids.length} factSheets [:bar] :rate/fps :percent :etas - :errors errors`,
        { total: ids.length, renderThrottle: 100 }
      )
      let done = 0
      await Promise.all(
        ids.map(async id => {
          const query = `mutation($id:ID!,$patches:[Patch]!){updateFactSheet(id:$id,comment:"Delete FS",patches:$patches,validateOnly:false){factSheet{id}}}`
          const variables = {
            id,
            patches: [{ op: 'add', path: '/status', value: 'ARCHIVED' }]
          }
          await graphql
            .executeGraphQL(query, variables)
            .then(() => done++)
            .catch(() => errors.push(id))
          bar.tick({ errors: errors.length })
          if (errors.length) ids = errors
        })
      )
      attempt++
    } while (errors.length !== 0 && attempt < 5)
    assert(errors.length === 0, 'All factsheets should have been deleted')
  })

  xit('should create N factsheets', async () => {
    const N = 10
    const factSheetType = 'Application'
    let errors = 0
    ids = []

    const bar = new ProgressBar(
      `Creating ${N} factSheets [:bar] :rate/fps :percent :etas :errors errors`,
      { total: N, renderThrottle: 100 }
    )

    // eslint-disable-next-line
    for (let n of Array.from(Array(N))) {
      const query = `mutation($input:BaseFactSheetInput!,$patches:[Patch]){createFactSheet(input:$input,patches:$patches){factSheet{id}}}`
      const variables = {
        input: { name: chance.sentence({ words: 3 }), type: factSheetType },
        patches: []
      }

      const aimRelevanceValues = ['free', 'sensitive', 'critical']
      const accountingRelevantDataValues = ['yes', 'no']

      const aimRelevance = Math.random() <= pAIMRelevance ? aimRelevanceValues[Math.floor(Math.random() * aimRelevanceValues.length)] : null
      const accountingRelevantData = Math.random() <= pAccountingRelevantData ? accountingRelevantDataValues[Math.floor(Math.random() * accountingRelevantDataValues.length)] : null

      variables.patches.push({ op: 'replace', path: '/aimRelevance', value: aimRelevance })
      variables.patches.push({ op: 'replace', path: '/accountingRelevantData', value: accountingRelevantData })

      await graphql
        .executeGraphQL(query, variables)
        .then(res => {
          bar.tick({ errors })
          ids.push(res.createFactSheet.factSheet.id)
        })
        .catch(() => {
          errors++
          bar.tick({ errors })
        })
    }
    assert(ids.length === N, 'All factsheets should have been created')
  })

  xit('should create documents', async () => {
    // documents should contain in the name the following strings
    /* it role catalog, it-role catalog, itrole catalog
    * user authorization
    * authorization concept, application authorization concept
    */

    let errors = 0

    const bar = new ProgressBar(
      `Creating documents for ${ids.length} factsheets [:bar] :rate/fps :percent :etas - :errors errors`,
      { total: ids.length, renderThrottle: 100 }
    )

    let userAuthorizationDocuments = 0
    let itRoleCatalogDocuments = 0
    let authorizationConceptDocuments = 0

    for (let factSheetId of ids) {
      const query = `mutation ($factSheetId:ID,$name:String!,$description:String,$url:String){createDocument(factSheetId:$factSheetId,name:$name,description:$description,url:$url){id}}`
      const variables = {
        userAuthorization: {
          factSheetId,
          name: 'user authorization',
          description: chance.sentence(),
          url: chance.url()
        },
        itRoleCatalog: {
          factSheetId,
          name: 'it role catalog',
          description: chance.sentence(),
          url: chance.url()
        },
        authorizationConcept: {
          factSheetId,
          name: 'authorization concept',
          description: chance.sentence(),
          url: chance.url()
        }
      }

      if (Math.random() <= pUserAuthorization) {
        await graphql
          .executeGraphQL(query, variables.userAuthorization)
          .then(() => userAuthorizationDocuments++)
          .catch(() => errors++)
      }
      if (Math.random() <= pITRoleCatalog) {
        await graphql
          .executeGraphQL(query, variables.itRoleCatalog)
          .then(() => itRoleCatalogDocuments++)
          .catch(() => errors++)
      }
      if (Math.random() <= pAuthorizationConcept) {
        await graphql
          .executeGraphQL(query, variables.authorizationConcept)
          .then(() => authorizationConceptDocuments++)
          .catch(() => errors++)
      }
      bar.tick({ errors })
    }
    console.log(
      `Created ${userAuthorizationDocuments} user authorization documents, ${itRoleCatalogDocuments} it role documents and ${authorizationConceptDocuments} authorization concept documents for ${ids.length} factsheets, with ${errors} errors`
    )
    assert(
      errors === 0,
      'All documents should have been created, without errors'
    )
  })
})

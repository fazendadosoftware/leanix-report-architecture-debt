<template>
  <modal v-if="show" @close="show = false">
    <span slot="header"/>
    <template slot="body">
      <template v-if="!selectedBusinessCapability">
        <div style="padding: 1em; font-size: 1.5em">
          <font-awesome-icon icon="arrow-left" style="cursor:pointer; margin-right: 1em" @click="show = false"/>
          <b>Business Capabilities</b> with <b>{{labels.opportunityCost}} </b>Opportunity Cost and <b>{{labels.weightedProjectSize}}</b> Project Size
        </div>
        <table-component
          table-class="table-modal"
          :show-filter="false"
          :show-caption="false"
          :data="rows">
          <table-column>
            <template slot-scope="row">
              <div class="centered link" @click="$lx.openLink(row.link, '_blank')">
                <font-awesome-icon icon="external-link-alt" style="cursor:pointer; font-size: 1.2em"/>
              </div>
            </template>
          </table-column>
          <table-column label="Business Capability">
            <template slot-scope="row">
              <div class="centered link" @click="selectedBusinessCapability = row">
                <span>{{row.name}}</span>
              </div>
            </template>
          </table-column>
          <table-column label="Related Projects">
            <template slot-scope="row">
              <div class="centered link" @click="selectedBusinessCapability = row">
                <span>{{row.numProjects}}</span>
              </div>
            </template>
          </table-column>
          <table-column label="Total Cost of Related Projects">
            <template slot-scope="row">
              <div class="centered">
                <span>{{currency.code}} {{row.sumBudgets}}</span>
              </div>
            </template>
          </table-column>
        </table-component>
      </template>
      <template v-if="selectedBusinessCapability">
        <div style="padding: 1em; font-size: 1.5em">
          <font-awesome-icon icon="arrow-left" style="cursor:pointer; margin-right: 1em" @click="selectedBusinessCapability = undefined"/>
          <b>Business Capability {{selectedBusinessCapability.name}}</b> (<b>{{labels.opportunityCost}} </b>Opportunity Cost and <b>{{labels.weightedProjectSize}}</b> Project Size)
        </div>
        <table-component
          table-class="table-modal"
          :show-filter="false"
          :show-caption="false"
          :data="selectedBusinessCapability.projects">
          <table-column>
            <template slot-scope="row">
              <div class="centered" @click="$lx.openLink(row.link, '_blank')">
                <font-awesome-icon icon="external-link-alt" style="cursor:pointer; font-size: 1.2em"/>
              </div>
            </template>
          </table-column>
          <table-column label="Project">
            <template slot-scope="row">
              <div class="centered">
                <span>{{row.name}}</span>
              </div>
            </template>
          </table-column>
          <table-column label="Lifecycle">
            <template slot-scope="row">
              <div class="centered">
                <span>{{row.lifecycle ? row.lifecycle.asString : row.lifecycle}}</span>
              </div>
            </template>
          </table-column>
          <table-column label="Project Cost">
            <template slot-scope="row">
              <div class="centered">
                <span>{{currency.code}} {{row.budgetOpEx + row.budgetCapEx}}</span>
              </div>
            </template>
          </table-column>
        </table-component>
      </template>
    </template>
    <span slot="footer"/>
  </modal>
</template>

<script>
import Modal from './Modal'

export default {
  components: { Modal },
  props: ['showModal', 'businessCapabilities', 'currency'],
  data () {
    return {
      selectedBusinessCapability: undefined
    }
  },
  computed: {
    show: {
      get () {
        return this.showModal
      },
      set (val) {
        if (!val) {
          this.selectedBusinessCapability = undefined
          this.$emit('close', val)
        }
      }
    },
    rows () {
      return (Array.isArray(this.businessCapabilities) ? this.businessCapabilities : [])
        .map(bc => {
          let { id, name, projects, sumBudgets, xKPI, yKPI } = bc
          const link = `factsheet/BusinessCapability/${id}`
          projects = projects.map(project => { return { ...project, link: `factsheet/Project/${project.id}` } })
          return { link, id, name, xKPI, yKPI, numProjects: projects.length, projects, sumBudgets: sumBudgets.toFixed(1) }
        })
    },
    labels () {
      let opportunityCost
      let weightedProjectSize
      const labels = ['Low', 'Medium', 'High', 'Very High']
      const row = Array.isArray(this.rows) && this.rows.length ? this.rows[0] : undefined
      if (row) {
        opportunityCost = labels[row.yKPI]
        weightedProjectSize = labels[row.xKPI]
      }
      return { opportunityCost, weightedProjectSize }
    }
  },
  mounted () {
    // console.log('businessCapabilities', JSON.parse(JSON.stringify(this.businessCapabilities)))
  }
}
</script>

<style lang="stylus">
  @import '../stylus/material-color'
  @import '../stylus/table-component'
  .centered
    display flex
    justify-content center
    align-items center
    height 100%

  .link
    cursor pointer
    // color clr-blue-800
    text-decoration underline
</style>

<template>
  <modal v-if="show" @close="show = false">
    <span slot="header"/>
    <template slot="body">
      <table-component
        table-class="table-modal"
        :show-filter="false"
        :show-caption="false"
        :data="rows">
        <table-column>
          <template slot-scope="row">
            <div class="centered" @click="$lx.openLink(row.link, '_blank')">
              <font-awesome-icon icon="external-link-alt" style="cursor:pointer; font-size: 1.2em"/>
            </div>
          </template>
        </table-column>
        <table-column label="Business Capability">
          <template slot-scope="row">
            <div class="centered">
              <span>{{row.name}}</span>
            </div>
          </template>
        </table-column>
        <table-column label="Related Projects">
          <template slot-scope="row">
            <div class="centered">
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
    <span slot="footer"/>
  </modal>
</template>

<script>
import Modal from './Modal'

export default {
  components: { Modal },
  props: ['showModal', 'businessCapabilities', 'currency'],
  computed: {
    show: {
      get () {
        return this.showModal
      },
      set (val) {
        if (!val) this.$emit('close', val)
      }
    },
    rows () {
      return (Array.isArray(this.businessCapabilities) ? this.businessCapabilities : [])
        .map(bc => {
          const { id, name, projects, sumBudgets } = bc
          const link = `factsheet/BusinessCapability/${id}`
          return { link, id, name, numProjects: projects.length, sumBudgets: sumBudgets.toFixed(1) }
        })
    }
  },
  mounted () {
    // console.log('businessCapabilities', JSON.parse(JSON.stringify(this.businessCapabilities)))
  }
}
</script>

<style lang="stylus">
  @import '../stylus/table-component'
  .centered
    display flex
    justify-content center
    align-items center
    height 100%
</style>

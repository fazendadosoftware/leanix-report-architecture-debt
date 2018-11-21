<template>
  <div id="app" @click.stop="hideTooltip">
    <bubble-modal
      :show-modal="selectedBusinessCapabilities && selectedBusinessCapabilities.length"
      @close="selectedBusinessCapabilities = undefined"
      :business-capabilities="selectedBusinessCapabilities"
      :currency="currency"
      />
    <div class="actions-container">
      <transition-group name="fade" class="btn-group">
        <div :disabled="!canExport" class="btn btn-default" @click="exportToExcel" :key="'export'">
          <font-awesome-icon icon="download" />
          Export to Excel
        </div>
        <div :disabled="!canExport" class="btn btn-default" @click="updateDataset" :key="'reload'">
          <font-awesome-icon icon="sync-alt" />
          Reload
        </div>
      </transition-group>
    </div>
    <notifications group="lx" />
    <transition name="fade">

      <tooltip
        v-if="tooltipData"
        :tooltip-data="tooltipData"
        :tooltip-model="tooltipModel"
        :canvas="canvas"
        :currency="currency"
        @mouseover.native="tooltipMouseOverHandler"
        @mouseleave.native="tooltipMouseLeaveHandler"
        class="tooltip-container"
      />

      <!--
      <tooltip2
        v-if="tooltipData"
        :tooltip-data="tooltipData"
        :tooltip-model="tooltipModel"
        :canvas="canvas"
        :currency="currency"
        @mouseover.native="tooltipMouseOverHandler"
        @mouseleave.native="tooltipMouseLeaveHandler"
      />
      -->
    </transition>
    <img class="logo" src="../static/DEL_PRI_PMS368_weiss_neu.svg">
    <div class="chart-wrapper">
      <bubble
        :chart-data="datacollection"
        @tooltip="tooltipEventHandler"
        @click="clickHandler"
        ref="chart"/>
    </div>
  </div>
</template>

<script>
import { getReportConfiguration } from './helpers/leanixReporting'
import BubbleModal from './components/BubbleModal'
import Bubble from './components/Bubble'
import Tooltip2 from './components/Tooltip2'
import Tooltip from './components/Tooltip'
import Queries from './helpers/queries'
import ExcelJS from 'exceljs/dist/es5/exceljs.browser'
import saveAs from 'file-saver'

export default {
  name: 'App',
  components: { Bubble, BubbleModal, Tooltip, Tooltip2 },
  data () {
    return {
      showModal: false,
      selectedBusinessCapabilities: undefined,
      datacollection: null,
      tooltipData: undefined,
      tooltipModel: undefined,
      canvas: undefined,
      currency: undefined,
      filter: {},
      loading: false
    }
  },
  methods: {
    hideTooltip () {
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
        delete this.tooltipTimeout
      }
      this.tooltipData = undefined
      this.tooltipModel = undefined
    },
    tooltipEventHandler ({tooltipModel, canvas}) {
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
        delete this.tooltipTimeout
      }
      this.canvas = canvas
      const { datasetIndex } = tooltipModel.dataPoints ? tooltipModel.dataPoints[0] : {}
      if (datasetIndex !== undefined) {
        const { data, backgroundColor, borderColor } = this.datacollection.datasets[datasetIndex]
        // eslint-disable-next-line
        const { x, y, r, businessCapabilities } = data[0] || {}
        this.tooltipData = {
          r,
          businessCapabilities,
          backgroundColor,
          borderColor
        }
        this.tooltipModel = tooltipModel
      } else {
        this.tooltipMouseLeaveHandler()
      }
    },
    tooltipMouseOverHandler () {
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout)
        delete this.tooltipTimeout
      }
    },
    tooltipMouseLeaveHandler () {
      this.tooltipTimeout = setTimeout(() => {
        this.tooltipData = undefined
        this.tooltipModel = undefined
      }, 1000)
    },
    clickHandler (evt, elements) {
      // console.log('catputed click', evt, elements)
      const businessCapabilities = elements
        .reduce((accumulator, element) => {
          const businessCapabilities = this.datacollection.datasets[element._datasetIndex].data
            .reduce((accumulator, item) => {
              const { businessCapabilities } = item
              return Array.from([...accumulator, ...businessCapabilities])
            }, [])
          return Array.from([...accumulator, ...businessCapabilities])
        }, [])
      const bcIndex = businessCapabilities.reduce((accumulator, bc) => { return { ...accumulator, [bc.id]: bc } }, {})
      // console.log('businessCapabilities', bcIndex)
      // this.showModal = true
      this.selectedBusinessCapabilities = Object.values(bcIndex)
    },
    setFilter (filter) {
      this.filter = {
        facetFilters: filter.facets,
        fullTextSearch: filter.fullTextSearchTerm,
        ids: filter.directHits.map(hit => hit.id)
      }
      this.updateDataset()
    },
    updateDataset () {
      this.loading = true
      this.$lx.showSpinner()
      this.queries.fetchBusinessCapabilities({ filter: this.filter })
        .then(this.queries.aggregateBusinessCapabilities)
        .then(datasets => { this.loading = false; this.$lx.hideSpinner(); this.datacollection = {datasets} })
        .catch(err => {
          this.$lx.hideSpinner()
          this.loading = false
          this.$notify({
            group: 'lx',
            type: 'error',
            title: 'Error while fetching report data',
            text: 'Check console for further details'
          })
          console.error(err)
        })
    },
    exportToExcel () {
      const getTimestamp = () => {
        const now = new Date()
        const mm = now.getMonth() + 1 // getMonth() is zero-based
        const dd = now.getDate()
        const hh = now.getHours()
        const MM = now.getMinutes()
        const timestamp = [now.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd, (hh > 9 ? '' : '0') + hh, (MM > 9 ? '' : '0') + MM].join('')
        return timestamp
      }
      try {
        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet('Business Capabilities')
        const businessCapabilities = this.datacollection.datasets
          .map(dataset => dataset.data[0].businessCapabilities)
          .reduce((accumulator, businessCapabilities) => Array.from([...accumulator, ...businessCapabilities]), [])
        const columns = [
          { header: 'FactSheet ID', key: 'id', width: 45 },
          { header: 'Name', key: 'name', width: 45 },
          { header: 'Max. Opportunity Cost', key: 'opportunityCost', width: 21, formatter: val => val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') },
          { header: 'Sum Project Budgets', key: 'sumBudgets', width: 21 },
          { header: 'Weighted Cost', key: 'xKPIValue', width: 21, formatter: val => Math.round(val * 100) / 100 }
        ]
        ws.columns = JSON.parse(JSON.stringify(columns))
        const rows = businessCapabilities
          .map(row => columns.map(column => typeof column.formatter === 'function' ? column.formatter(row[column.key]) : row[column.key]))
        ws.addRows(rows)

        ws.getRow(1).font = { size: 10, bold: true }

        // we need to set the hyperlinks on A2...N cells...
        wb.xlsx.writeBuffer().then(data => {
          const filename = `${getTimestamp()}_architecture_debt.xlsx`
          const blob = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
          saveAs(blob, filename)
          this.$notify({
            group: 'lx',
            type: 'success',
            title: `Exported report as ${filename}`
          })
        })
      } catch (err) {
        this.$notify({
          group: 'lx',
          type: 'error',
          title: 'Error while exporting to excel',
          text: 'Check console for further details'
        })
        console.error(err)
      }
    }
  },
  computed: {
    canExport () {
      return !this.loading && this.datacollection && this.datacollection.datasets
    }
  },
  created () {
    this.queries = new Queries(this.$lx)
  },
  mounted () {
    this.$lx.init()
      .then(setup => {
        this.currency = setup.settings.currency
        const config = getReportConfiguration({setup, facetFiltersChangedCallback: this.setFilter})
        this.$lx.ready(config)
      })
  }
}
</script>

<style lang="stylus" scoped>
  @import './stylus/main'

  #app
    display flex
    flex-flow column
    justify-content center
    align-items center
    height calc(100vh - 50px)
    position relative

  .actions-container
    position absolute
    top 0
    right 0

  .logo
    z-index 1
    $img-width=250px
    position fixed
    top 0
    left 0
    width $img-width
    border-radius 10px
    // z-index 9999
    background white
    padding 2em
    & > img
      width $img-width
    @media screen and (max-width: 800px)
      right 60px
      width 150px
      & > img
        width 150px

  .chart-wrapper
    width 80%
    margin-top 100px
    z-index 10

  .tooltip-container
    z-index 20

  .fade-enter-active, .fade-leave-active
    transition opacity .5s
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    opacity 0

  .btn-group
    > .btn
      margin-right 5px

  .btn
    display: inline-block
    margin-bottom: 0
    font-weight: 400
    text-align: center
    vertical-align: middle
    -ms-touch-action: manipulation
    touch-action: manipulation
    cursor: pointer
    background-image: none
    border: 1px solid transparent
    white-space: nowrap
    font-size: 12px
    line-height: 1.428571429
    border-radius: 3px
    padding 1px 5px
    &[disabled]
      transition opacity 0.6 ease
      opacity 0.3
      cursor default
  .btn-default
    color: #333
    background-color: #fff
    border-color: #ccc
</style>

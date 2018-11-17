<template>
  <div class="container" :style="style" @click.stop="">
    <div class="tooltip top-arrow" :style="tooltipStyle">
      <div class="tooltiptext">
        {{rows}}
      </div>
  </div>
  </div>

</template>

<script>
import Color from 'color'

export default {
  props: ['tooltipModel', 'tooltipData', 'canvas', 'currency'],
  data () {
    const roundDecimals = num => Math.round(num * 100) / 100
    return {
      columns: [
        { key: 'name', label: 'Name', cellClass: 'name-cell center', headerClass: 'center' },
        {
          key: 'opportunityCost',
          label: 'Max. Opp. Cost',
          formatter: val => val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          cellClass: 'center',
          headerClass: 'center'
        },
        {
          key: 'sumBudgets',
          label: 'Sum budget',
          cellClass: 'center',
          headerClass: 'center',
          formatter: val => `${this.currency ? this.currency.code + ' ' : ''}${roundDecimals(val)}`
        },
        { key: 'xKPIValue', label: 'Weighted cost', formatter: val => Math.round(val * 100) / 100, cellClass: 'center', headerClass: 'center' }
      ]
    }
  },
  computed: {
    style () {
      if (!this.canvas) return ''
      const { r } = this.tooltipData
      const yGap = r + 5
      const position = this.canvas.getBoundingClientRect()

      const left = position.left + this.tooltipModel.caretX - 108 + 'px'
      const top = position.top + window.pageYOffset + this.tooltipModel.caretY + yGap + 'px'
      return `left: ${left}; top: ${top}`
    },
    tooltipStyle () {
      const { backgroundColor, borderColor } = this.tooltipData

      const color = `black`
      const background = Color(backgroundColor).lighten(0.30).alpha(0.95).string()
      const border = `1px solid ${Color(borderColor).lighten(0.1).string()}`

      return `color:${color};background:${background};border:${border};border-radius:3px`
    },
    rows () {
      return this.tooltipData ? this.tooltipData.businessCapabilities : []
    }
  },
  methods: {
    onItemClick (row) {
      this.$lx.openLink(`factsheet/BusinessCapability/${row.id}`, '_blank')
    }
  }
}
</script>

<style lang="stylus" scoped>

$background=rgba(0, 0, 0, 0.7)
$tooltip-width=200px
$tooltip-height=100px

.container
  position absolute
  transition left 0.3s, top 0.3s
  transform translateX(200%)

.tooltip
  position absolute
  font-family "Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif
  width $tooltip-width
  height $tooltip-height
  .tooltiptext
    z-index 1
    display flex
    flex-flow column
    justify-content center
    align-items center
    border-color green

.tooltip
  &.bottom-arrow
    .tooltiptext::after
      content: " "
      position: absolute
      top: 100%; /* At the bottom of the tooltip */
      left: 50%
      margin-left: -5px
      border-width: 5px
      border-style: solid
      border-color: $background transparent transparent transparent
  &.top-arrow
    .tooltiptext::after
      content " "
      position absolute
      bottom: 100%  /* At the top of the tooltip */
      left 50%
      margin-left -5px
      border-width 5px
      border-style solid
      border-color transparent transparent $background transparent
</style>

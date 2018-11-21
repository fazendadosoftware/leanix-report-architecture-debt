<template>
  <div class="container" :style="style" @click.stop="">
    <div class="tooltip top-arrow">
      <div class="tooltiptext">
        <table>
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key" :class="column.headerClass">{{column.label}}</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td v-for="column in columns" :key="column.key" :class="column.cellClass" @click.stop="onItemClick(row)">
              {{column.formatter ? column.formatter(row[column.key]) : row[column.key]}}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
  </div>
  </div>

</template>

<script>
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
      const left = position.left + window.pageXOffset + this.tooltipModel.caretX - 258 + 'px'
      const top = position.top + window.pageYOffset + this.tooltipModel.caretY + yGap + 'px'
      return `left: ${left}; top: ${top}`
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

table
  table-layout auto
  width 500px
  cursor default

.name-cell
  white-space nowrap
  overflow hidden
  text-overflow ellipsis
  max-width 200px

.center
  text-align center
.left
  text-align left
.right
  text-align right

.container
  position absolute
  transition all 0.3s

.tooltip
  position absolute
  .tooltiptext
    // max-height 100px
    background-color $background
    color #fff
    border-radius 3px
    z-index 1
    display flex
    flex-flow column
    justify-content center
    align-items center

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

th, td
  padding 3px
  text-align left

tbody
  tr
    cursor pointer
    &:hover
      background-color darken($background, 5%)

</style>

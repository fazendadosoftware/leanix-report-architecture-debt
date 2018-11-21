<script>
import {Bubble, mixins} from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Bubble,
  mixins: [reactiveProp],
  computed: {
    options () {
      /*
      const {maxXKPI, xKPIBuckets = 4} = this.chartData && this.chartData.datasets ? this.chartData.datasets : {}
      const bucketSize = maxXKPI / xKPIBuckets
      const tags = maxXKPI && isFinite(maxXKPI)
        ? [...Array(xKPIBuckets * 2).keys()]
          .map((key, idx) => idx % 2 === 0 ? undefined : ((key + 1) / 2) * bucketSize) // Compute center points for each bucket
          .map(upperBound => {
            if (upperBound === undefined) return
            const lowerBound = upperBound - bucketSize
            const round = val => Math.round(val * 100) / 100
            return `${round(lowerBound)} - ${round(upperBound)}`
          })
        : []
      */

      return {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        animation: false,
        tooltips: {
          enabled: false,
          custom: tooltipModel => this.$emit('tooltip', {tooltipModel, canvas: this.$refs.canvas})
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
                offsetGridLines: false,
                drawTicks: false,
                color: 'white'
              },
              ticks: {
                display: true,
                min: 0,
                max: 8,
                padding: 10,
                callback: (value, index, values) => {
                  const tags = [undefined, 'Low', undefined, 'Medium', undefined, 'High', undefined, 'Very High']
                  return tags[index]
                }
                // callback: (value, index, values) => tags[index]
              },
              scaleLabel: {
                display: true,
                labelString: 'Weighted Project Size',
                fontStyle: '700',
                fontSize: 13
              }
            },
            {
              type: 'linear',
              gridLines: {
                display: true,
                drawTicks: false,
                drawBorder: false,
                color: '#cccccc',
                lineWidth: 1
              },
              ticks: {
                display: true,
                min: 0,
                max: 10,
                stepSize: 5,
                callback: () => ' '
              },
              scaleLabel: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              gridLines: {
                display: false,
                offsetGridLines: false,
                drawTicks: false,
                color: '#cccccc',
                lineWidth: 1
              },
              ticks: {
                display: true,
                min: 0,
                max: 8,
                padding: 10,
                fontSize: 11,
                callback: (value, index, values) => {
                  const tags = [undefined, 'Very High', undefined, 'High', undefined, 'Middle', undefined, 'Low']
                  return tags[index]
                }
              },
              scaleLabel: {
                display: true,
                labelString: 'Opportunity Cost',
                fontStyle: `700`,
                fontSize: 13
              }
            },
            {
              type: 'linear',
              gridLines: {
                display: true,
                drawTicks: false,
                drawBorder: false,
                color: '#cccccc'
              },
              ticks: {
                display: true,
                min: 0,
                max: 10,
                stepSize: 5,
                callback: () => ' '
              },
              scaleLabel: {
                display: false
              }
            }
          ]
        },
        onClick: (evt, elements) => this.$emit('click', evt, elements)
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>

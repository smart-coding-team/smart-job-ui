<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  }, 
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      console.log("pie data="+this.chartData)
      this.setOptions(this.chartData)
    },
    setOptions({ triggerCountSucTotal, triggerCountFailTotal,triggerCountRunningTotal } = {}) {
      this.chart.setOption({
        title : {
          text: '成功比例图' ,
          x:'center'
         },
        tooltip: {
          trigger: 'item',
          formatter: "{b} : {c} ({d}%)",
          padding: [5, 10]
        },
        legend: {
          icon: "circle",
          // left: 'left',
          bottom: '10',
          data: ['失败', '成功','进行中']
        },
        color:['#FB6261', '#00A65A', '#ffaf2c'],
        series: [
          {
            name: '分布比例',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: triggerCountFailTotal, name: '失败' },
              { value: triggerCountSucTotal, name: '成功' },
              { value: triggerCountRunningTotal, name: '进行中' },
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
          }
        ]
      })

    } 
  }
}
</script>

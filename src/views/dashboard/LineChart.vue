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
    autoResize: {
      type: Boolean,
      default: true
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
      console.log("line data="+this.chartData)
      this.setOptions(this.chartData)
    },
    setOptions({ failData, successData,runningData, dayList } = {}) {
      this.chart.setOption({
        xAxis: {
          data: dayList,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 40,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
        },

        legend: {
          icon: "circle",
          bottom: '10',
          data: ['失败', '成功','进行中']
        },
        // color:['#c23632', '#00A65A', '#F39C12'],
        series: [{
          name: '失败', itemStyle: {
            normal: {
              color: '#d33109',
              lineStyle: {
                color: '#FB6261',
                width: 2
              },
              areaStyle: {
                color: '#FFCCCC'
              }
            }
          },
          smooth: true,
          type: 'line',
          data: failData,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        },
        {
          name: '成功',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#5fb870',
              lineStyle: {
                color: '#00A65A',
                width: 2
              },
              areaStyle: {
                color: '#C8EDD1'
              }
            }
          },
          data: successData,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '进行中', itemStyle: {
            normal: {
              color: '#ffaf2c',
              lineStyle: {
                color: '#FFA94C',
                width: 2
              },
              areaStyle: {
                color: '#FEF0C3'
              }
            }
          },
          smooth: true,
          type: 'line',
          data: runningData,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        }
        ]
      })
    }
  }
}
</script>

<template>
  <div class="dashboard-editor-container">

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row  :gutter="32">
      <el-col :xs="24" :sm="24" :lg="16">
        <div class="chart-wrapper">
          <div> 调度统计</div>
          <line-chart :chart-data="lineChartData" />
        </div>
      </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <div> 调度统计</div>
          <pie-chart :chart-data="pieChartData"/>
        </div>
      </el-col>
    </el-row>

    <!-- <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row> -->

    
  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import RaddarChart from './dashboard/RaddarChart'
import PieChart from './dashboard/PieChart'
import BarChart from './dashboard/BarChart'
import * as dashborad from '@/api/job/dashborad'
const lineChartData = {
  chartInfo: {
    failData: [],
    successData: [],
    runningData: [],
    dayList: [],
    triggerCountSucTotal:0,
    triggerCountRunningTotal:0,
    triggerCountFailTotal:0
  }
}

export default {
  name: 'Index',
  components: {
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart
  },
  data() {
    return {
      lineChartData: lineChartData.chartInfo,
      pieChartData: lineChartData.chartInfo
    }
  },
  created(){
   this.chartInfo()
  },
  methods: {
   handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
    chartInfo() {
      dashborad.chartInfo().then(response => {
        const { data } = response
        this.lineChartData.successData = data.triggerDayCountSucList
        this.lineChartData.failData = data.triggerDayCountFailList
        this.lineChartData.runningData = data.triggerDayCountRunningList
        this.lineChartData.dayList = data.triggerDayList
        this.pieChartData.triggerCountSucTotal = data.triggerCountSucTotal
        this.pieChartData.triggerCountRunningTotal = data.triggerCountRunningTotal
        this.pieChartData.triggerCountFailTotal = data.triggerCountFailTotal
        // localStorage.setItem('countSucTotal', data.triggerCountSucTotal)
        localStorage.setItem('countRunningTotal', data.triggerCountRunningTotal)
        // localStorage.setItem('countFailTotal', data.triggerCountFailTotal)
      })
      dashborad.dashboardInfo().then(response => {
        const { data } = response
        localStorage.setItem('countSucTotal', data.jobLogSuccessCount)
        localStorage.setItem('countJobLogTotal', data.jobLogCount)
        localStorage.setItem('countJobTotal', data.jobInfoCount)
        localStorage.setItem('countJobExecutorTotal', data.executorCount)
      }) 
    }

  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding-top: 16px;
  padding-left: 100px;
  padding-right: 100px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>

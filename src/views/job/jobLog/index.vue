<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="任务名称" prop="jobId">
          <el-select
            v-model="queryParams.jobId"
            filterable
            remote
            clearable
            placeholder="任务名称或JobHandler"
            :remote-method="remoteQueryJobMethod"
            @change="handleQuery"
            @focus="initQueryJobName"
            :loading="loading"
          >
            <el-option
              v-for="item in jobList.jobItems"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            >
              <span style="float: left">{{ item.jobName }}</span>
              <span
                style="
                  float: right;
                  color: #8492a6;
                  font-size: 13px;
                  margin-left: 4px;
                "
                >{{ item.executorHandler }}</span
              >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="应用名" prop="jobGroup">
          <el-select
            v-model="queryParams.jobGroup"
            filterable
            remote
            clearable
            placeholder="应用名(appName)"
            :remote-method="remoteQueryJobGroupMethod"
            @change="handleQuery"
            @focus="initQueryJobGroupName"
            :loading="loading"
          >
            <el-option
              v-for="item in jobList.jobGroupItems"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            >
              <span style="float: left">{{ item.title }}</span>
              <span
                style="
                  float: right;
                  color: #8492a6;
                  font-size: 13px;
                  margin-left: 4px;
                "
                >{{ item.appName }}</span
              >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="运行结果" prop="jobStatus">
          <el-select
            v-model="queryParams.jobStatus"
            @change="handleQuery"
            placeholder="运行状态"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in jobStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调度时间">
          <el-date-picker
            v-model="filterTime"
            @change="handleQuery"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            align="right"
            style="width: 370px"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
            v-waves
            type="cyan"
            icon="el-icon-search"
            size="small"
            @click="handleQuery"
            >刷新</el-button
          >
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery"
            >重置</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="small"
            @click="handlerDelete"
            v-hasPermi="['job:jobLog:clearLog']"
            >清除日志</el-button
          >
        </el-form-item>
      </el-form>
      <span class="custom-total">共 {{ total || "0" }} 条</span>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      fit
      highlight-current-row
      style="width: 100%"
      size="small"
    >
      <el-table-column
        align="center"
        prop="id"
        label="任务日志Id"
        width="90"
        fixed
      ></el-table-column>
      <el-table-column
        align="center"
        prop="jobId"
        label="任务Id"
        width="90"
        fixed
      ></el-table-column>
      <el-table-column
        align="center"
        prop="jobName"
        label="任务名称"
        width="150"
        fixed
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <router-link
            :to="'/job/jobInfo?jobId=' + scope.row.jobId"
            class="link-type"
          >
            <span>{{ scope.row.jobName }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="运行结果" align="center" width="80">
        <template slot-scope="{ row }">
          <el-tag :type="row.jobStatus | statusFilter(jobStatusList)">{{
            parseCodeToLabel(jobStatusList, row.jobStatus)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="调度机器"
        prop="triggerAddress"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          {{ scope.row.triggerAddress || "--" }}
        </template>
      </el-table-column>
      <el-table-column
        label="调度时间"
        prop="triggerTime"
        align="center"
        width="180"
      >
        <template slot-scope="scope">
          {{ scope.row.triggerTime || "--" }}
        </template>
      </el-table-column>
      <el-table-column label="调度结果" align="center" width="80">
        <template slot-scope="{ row }">
          <el-tag :type="row.triggerCode | statusFilter(statusList)">{{
            parseCodeToLabel(statusList, row.triggerCode)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="调度详情" align="center">
        <template slot-scope="scope">
          <el-popover placement="bottom" width="400" trigger="click">
            <p
              style="font-size: 12px"
              v-for="(item, index) in triggerMsgList"
              :key="index"
            >
              {{ item.name }}: {{ item.value }}
            </p>
            <el-button
              slot="reference"
              @click="handleTriggerMsg(scope.row.triggerMsg)"
              size="mini"
              >查看</el-button
            >
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="执行方式"
        prop="triggerType"
        align="center"
        width="100"
      >
        <template slot-scope="{ row }">
          <el-tag>{{
            parseCodeToLabel(triggerTypeList, row.triggerType)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="执行机器"
        prop="executorAddress"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          {{ scope.row.executorAddress || "--" }}
        </template>
      </el-table-column>
      <el-table-column
        label="执行时间"
        prop="handleTime"
        align="center"
        width="180"
      >
        <template slot-scope="scope">
          {{ scope.row.handleTime || "--" }}
        </template>
      </el-table-column>
      <el-table-column label="执行参数" align="center" width="180">
        <template slot-scope="scope">
          <el-popover placement="bottom" trigger="click">
            <p>任务参数: {{ scope.row.executorParam || "无" }}</p>
            <p>任务分片参数: {{ scope.row.executorSharingParam || "无" }}</p>
            <el-button slot="reference" size="mini">查看</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="执行结果" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.handleCode | statusFilter(statusList)">{{
            parseCodeToLabel(statusList, row.handleCode)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="执行详情" align="center">
        <template slot-scope="scope">
          <el-popover placement="bottom" width="400" trigger="click">
            <h5 v-html="scope.row.handleMsg" />
            <el-button slot="reference" size="mini">查看</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <!-- <el-table-column label="执行人"  align="center">
      </el-table-column> -->
      <el-table-column label="告警状态" width="100" align="center">
        <template slot-scope="scope">
          <router-link
            v-if="scope.row.alarmStatus === 2 || scope.row.alarmStatus === 3"
            :to="'/job/alarmLog?jobLogId=' + scope.row.id"
            class="link-type"
          >
            <el-tag
              :type="scope.row.alarmStatus | statusFilter(alarmStatusList)"
              >{{
                parseCodeToLabel(alarmStatusList, scope.row.alarmStatus)
              }}</el-tag
            >
          </router-link>
          <el-tag
            v-else
            :type="scope.row.alarmStatus | statusFilter(alarmStatusList)"
            >{{
              parseCodeToLabel(alarmStatusList, scope.row.alarmStatus)
            }}</el-tag
          >
        </template>
      </el-table-column>

      <el-table-column
        label="创建时间"
        prop="gmtCreate"
        width="150"
        align="center"
      >
      </el-table-column>
      <el-table-column
        label="修改时间"
        prop="gmtModified"
        width="150"
        align="center"
      >
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        min-width="250"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="row.executorAddress"
            type="primary"
            plain
            size="mini"
            icon="el-icon-search"
            @click="handleViewJobLog(row)"
            v-hasPermi="['job:jobLog:detail']"
            >查看日志</el-button
          >
          <el-button
            v-if="row.handleCode === 0 && row.triggerCode === 200"
            type="danger"
            plain
            size="mini"
            icon="el-icon-delete"
            @click="killRunningJob(row)"
            v-hasPermi="['job:jobLog:killJob']"
            >终止任务</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page-sizes="[10, 15, 20, 30, 50]"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="handleQuery"
    />

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      width="500px"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
      >
        <el-row>
          <el-col :span="14" :offset="5">
            <el-form-item label="执行器">
              <el-input size="medium" value="全部" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="14" :offset="5">
            <el-form-item label="任务名称">
              <el-input size="medium" value="全部" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="14" :offset="5">
            <el-form-item label="清理方式">
              <el-select v-model="temp.deleteType" placeholder="请选清理方式">
                <el-option
                  v-for="item in deleteTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="temp.deleteType != '1'">
          <el-col :span="14" :offset="5">
            <el-form-item v-if="temp.deleteType == '2'" label="时间范围">
              <el-select
                v-model="temp.deleteNum"
                placeholder="请选清理的时间范围"
              >
                <el-option
                  v-for="item in deleteNumByTimeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-else label="数量大小">
              <el-select
                v-model="temp.deleteNum"
                placeholder="请选清理的数量大小"
              >
                <el-option
                  v-for="item in deleteNumByNumList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteLog">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="日志查看" :visible.sync="dialogVisible" width="95%">
      <div class="log-container">
        <pre v-loading="logLoading" v-text="logContent" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="loadLog">刷新日志</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as log from "@/api/job/jobLog";
import * as job from "@/api/job/jobInfo";
import * as executor from "@/api/job/jobExecutor";
import { isEmpty, praseValue, isNumber } from "@/utils/common";
import waves from "@/directive/waves"; // waves directive
export default {
  name: "JobLog",
  directives: { waves },
  data() {
    return {
      dialogVisible: false,
      list: null,
      listLoading: true,
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 15,
        id: undefined,
        jobGroup: undefined,
        jobId: undefined,
        jobStatus: null,
        triggerTimeStart: undefined,
        triggerTimeEnd: undefined,
      },
      filterTime: [],
      dialogPluginVisible: false,
      pluginData: [],
      dialogFormVisible: false,
      dialogStatus: "",
      executorList: "",
      textMap: {
        create: "Clear",
      },
      rules: {},
      temp: {
        deleteType: 1,
        jobGroup: 0,
        jobId: 0,
        deleteNum: undefined,
      },
      statusList: [
        { value: 500, label: "失败", type: "danger" },
        { value: 502, label: "失败(超时)", type: "danger" },
        { value: 200, label: "成功", type: "success" },
        { value: 0, label: "运行中", type: "primary" },
        { value: -1, label: "未开始", type: "info" },
      ],
      jobStatusList: [
        { value: 0, label: "未开始", type: "info" },
        { value: 1, label: "运行中", type: "" },
        { value: 500, label: "失败", type: "danger" },
        { value: 200, label: "成功", type: "success" },
      ],
      triggerTypeList: [
        { value: 0, label: "手动触发", type: "info" },
        { value: 1, label: "Cron触发", type: "primary" },
        { value: 2, label: "失败重试触发", type: "primary" },
        { value: 3, label: "父任务触发", type: "primary" },
        { value: 4, label: "API触发", type: "primary" },
      ],
      deleteTypeList: [
        { value: 1, label: "全部" },
        { value: 2, label: "按时间" },
        { value: 3, label: "按数量" },
      ],
      deleteNumByTimeList: [
        { value: 1, label: "清理一个月之前日志数据" },
        { value: 3, label: "清理三个月之前日志数据" },
        { value: 6, label: "清理六个月之前日志数据" },
        { value: 12, label: "清理一年之前日志数据" },
      ],
      deleteNumByNumList: [
        { value: 1000, label: "清理一千条以前日志数据" },
        { value: 10000, label: "清理一万条以前日志数据" },
        { value: 30000, label: "清理三万条以前日志数据" },
        { value: 100000, label: "清理十万条以前日志数据" },
      ],
      logStatusList: [
        { value: 1, label: "成功" },
        { value: 2, label: "失败" },
        { value: 3, label: "进行中" },
      ],
      alarmStatusList: [
        { value: 0, label: "未开始", type: "info" },
        { value: 1, label: "未启用", type: "warning" },
        { value: 2, label: "成功", type: "success" },
        { value: 3, label: "失败", type: "danger" },
      ],
      // 日志查询参数
      jobLogQuery: {
        executorAddress: "",
        triggerTime: "",
        id: "",
        fromLineNum: 1,
      },
      jobInfo: {},
      triggerMsgList: [],
      jobList: {
        timeout: "",
        jobGroupItems: [],
        jobItems: [],
      },
      // 日志内容
      logContent: "",
      // 显示日志
      logShow: false,
      // 日志显示加载中效果
      logLoading: false,
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
    };
  },
  filters: {},

  created() {
    this.handleQuery();
  },

  methods: {
    handleTriggerMsg(msg) {
      this.triggerMsgList = JSON.parse(msg);
    },
    initQueryJobName() {
      if (this.jobList.jobItems.length > 5) {
        return;
      }
      let queryString = "";
      this.loading = true;
      clearTimeout(this.timeout);
      setTimeout(() => {
        this.loading = false;
        job.querySearch(queryString).then((response) => {
          for (let i of response.data) {
            i.label = i.executorHandler
              ? i.jobName + "(" + i.executorHandler + ")"
              : i.jobName;
          }
          this.jobList.jobItems = response.data;
        });
      }, 100 * Math.random());
    },
    remoteQueryJobMethod(queryString) {
      queryString = queryString ? queryString.trim() : "";
      this.loading = true;
      clearTimeout(this.timeout);
      setTimeout(() => {
        this.loading = false;
        job.querySearch(queryString).then((response) => {
          for (let i of response.data) {
            i.label = i.executorHandler
              ? i.jobName + "(" + i.executorHandler + ")"
              : i.jobName;
          }
          let list = response.data;
          this.jobList.jobItems = list.filter((item) => {
            return new RegExp(queryString, "i").test(item.label);
          });
        });
      }, 100 * Math.random());
    },
    initQueryJobGroupName() {
      if (this.jobList.jobGroupItems.length > 5) {
        return;
      }
      this.loadJobGroupName(this, function (self, data) {
        self.jobList.jobGroupItems = data;
      });
    },
    remoteQueryJobGroupMethod(queryString) {
      this.queryJobGroupMethod(queryString, this, function (self, data) {
        self.jobList.jobGroupItems = data;
      });
    },
    loadJobGroupName(self, callback) {
      let queryString = "";
      this.loading = true;
      clearTimeout(this.timeout);
      setTimeout(() => {
        this.loading = false;
        executor.querySearch(queryString).then((response) => {
          for (let i of response.data) {
            i.label = i.title + "(" + i.appName + ")";
          }
          callback(self, response.data);
        });
      }, 100 * Math.random());
    },
    queryJobGroupMethod(queryString, self, callback) {
      queryString = queryString ? queryString.trim() : "";
      this.loading = true;
      clearTimeout(this.timeout);
      setTimeout(() => {
        this.loading = false;
        executor.querySearch(queryString).then((response) => {
          for (let i of response.data) {
            i.label = i.title + "(" + i.appName + ")";
          }
          let list = response.data.filter((item) => {
            return new RegExp(queryString, "i").test(item.label);
          });
          callback(self, list);
        });
      }, 100 * Math.random());
    },
    handleQuery() {
      this.listLoading = true;
      const param = Object.assign({}, this.queryParams);
      const urlJobId = this.$route.query.jobId;
      const urlJobLogId = this.$route.query.jobLogId;
      if (isNumber(urlJobId) && !param.jobId) {
        param.jobId = urlJobId;
      }
      if (isNumber(urlJobLogId) && !param.id) {
        param.id = urlJobLogId;
      }
      if (this.filterTime && this.filterTime.length === 2) {
        param.triggerTimeStart = this.filterTime[0];
        param.triggerTimeEnd = this.filterTime[1];
      }
      log.getList(param).then((response) => {
        this.total = response.data.total;
        this.list = response.data.list;
        this.listLoading = false;
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.$router.push({ query: {} });
      this.handleQuery();
    },
    getExecutor() {
      job.getExecutorList().then((response) => {
        const { data } = response;
        this.executorList = data;
        const defaultParam = { id: 0, title: "全部" };
        this.executorList.unshift(defaultParam);
        this.queryParams.jobGroup = this.executorList[0].id;
      });
    },
    handlerDelete() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    deleteLog() {
      let deleteNum = this.temp.deleteNum;
      if (this.temp.deleteNum === undefined) {
        deleteNum = 0;
      }
      log.clearLog(
          this.temp.jobGroup,
          this.temp.jobId,
          this.temp.deleteType,
          deleteNum
        )
        .then((response) => {
          this.handleQuery();
          this.dialogFormVisible = false;
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
        });
      // const index = this.list.indexOf(row)
    },
    // 查看日志
    handleViewJobLog(row) {
      // const str = location.href.split('#')[0]
      // window.open(`${str}#/ router的name `)
      this.dialogVisible = true;

      this.jobLogQuery.executorAddress = row.executorAddress;
      this.jobLogQuery.id = row.id;
      this.jobLogQuery.triggerTime = Date.parse(row.triggerTime);
      if (this.logShow === false) {
        this.logShow = true;
      }
      this.jobLogQuery.fromLineNum=1
      this.logContent = "";
      // window.open(`#/data/log?executorAddress=${this.jobLogQuery.executorAddress}&triggerTime=${this.jobLogQuery.triggerTime}&id=${this.jobLogQuery.id}&fromLineNum=${this.jobLogQuery.fromLineNum}`)
      this.loadLog();
    },
    // 获取日志
    loadLog() {
      this.logLoading = true;
      log
        .viewJobLog(
          this.jobLogQuery.executorAddress,
          this.jobLogQuery.triggerTime,
          this.jobLogQuery.id,
          this.jobLogQuery.fromLineNum
        )
        .then((response) => {
          // 判断是否是 '\n'，如果是表示显示完成，不重新加载
          if (response.data.logContent === "\n") {
            // this.jobLogQuery.fromLineNum = response.toLineNum - 20;
            // // 重新加载
            // setTimeout(() => {
            //   this.loadLog()
            // }, 2000);
          } else {
            this.logContent = this.logContent+response.data.logContent;
          }
          this.logLoading = false;
        });
    },
    loadJobDetialById(row) {
      job.loadById(row.jobId).then((response) => {
        const { data } = response;
        this.jobInfo = data;
      });
    },
    killRunningJob(row) {
      log.killJob(row.id).then((response) => {
        this.handleQuery();
        this.dialogFormVisible = false;
        this.$notify({
          title: "Success",
          message: "Kill Successfully",
          type: "success",
          duration: 2000,
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.log-container {
  margin-bottom: 20px;
  background: #f5f5f5;
  width: 100%;
  height: 400px;
  overflow: scroll;
  pre {
    display: block;
    padding: 10px;
    margin: 0 0 10.5px;
    word-break: break-all;
    word-wrap: break-word;
    color: #334851;
    background-color: #f5f5f5;
    // border: 1px solid #ccd1d3;
    border-radius: 1px;
  }
}
</style>
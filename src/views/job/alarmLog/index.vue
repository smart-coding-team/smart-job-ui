<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
        <el-form-item label="任务日志id" prop="logId">
          <el-input
            v-model="queryParams.logId"
            placeholder="请输入任务日志id"
            clearable
            onKeypress="return(/[\d]/.test(String.fromCharCode(event.keyCode)))"
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="发送状态" prop="sendStatus">
          <el-select v-model="queryParams.sendStatus" placeholder="请选择发送状态"  @change="handleQuery" clearable size="small">
              <el-option
              v-for="item in sendStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="cyan" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      v-loading="loading"
      :data="alarmLogList"
      element-loading-text="Loading"
      fit
      highlight-current-row
      style="width: 100%"
      size="small"
    >
      <el-table-column label="id" align="center" prop="id" width="80" fixed />
      <el-table-column label="任务日志id" align="center" prop="logId" >
        <template slot-scope="scope">
          <router-link :to="'/job/jobLog?jobLogId=' + scope.row.logId" class="link-type">
            <span>{{ scope.row.logId }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="任务名称" align="center" prop="jobName">
         <template slot-scope="scope">
          <router-link :to="'/job/jobInfo?jobId=' + scope.row.jobId" class="link-type">
            <span>{{scope.row.jobName}}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="告警方式" align="center" prop="noticeWay" >
               <template slot-scope="scope">
          <router-link :to="'/job/alarmInfo?alarmId=' + scope.row.alarmId" class="link-type">
            <span>{{scope.row.noticeWay}}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="告警状态" align="center" prop="sendStatus">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.sendStatus|statusFilter(sendStatusList)"
          >{{parseCodeToLabel(sendStatusList,scope.row.sendStatus)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="通知人" align="center" prop="noticeUsername" />
      
      <el-table-column label="创建时间" align="center" prop="gmtCreate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.gmtCreate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
        <el-table-column label="更新时间" align="center" prop="gmtModified" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.gmtModified, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page-sizes="[10,15,20,30,50]"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listAlarmLog, getAlarmLog, delAlarmLog } from "@/api/job/alarmLog";
import { isEmpty, praseValue,isNumber } from "@/utils/common";

export default {
  name: "AlarmLog",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 任务告警记录表格数据
      alarmLogList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 15,
        logId: undefined,
        sendStatus: null,
      },
      sendStatusList: [
        { value: false, label: "失败", type: "danger" },
        { value: true, label: "成功", type: "success" },
      ],
      alarmTypeList: [
        { value: "dingDing", label: "钉钉", type: "primary" },
        { value: "wxWechat", label: "企业微信", type: "success" },
        { value: "email", label: "邮箱", type: "info" },
        { value: "feishu", label: "飞书", type: "info" },
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        logId: [
          { required: true, message: "任务日志id不能为空", trigger: "blur" },
        ],
        gmtCreate: [
          { required: true, message: "创建时间不能为空", trigger: "blur" },
        ],
        gmtModified: [
          { required: true, message: "修改时间不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询任务告警记录列表 */
    getList() {
      this.loading = true;
      const param = Object.assign({}, this.queryParams);
       const urlJobLogId = this.$route.query.jobLogId;
      if (isNumber(urlJobLogId)&& !param.logId) {
         param.logId=parseInt(urlJobLogId);
      } 
      listAlarmLog(param).then((response) => {
        this.alarmLogList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        logId: null,
        alarmId: null,
        alarmName: null,
        sendStatus: 0,
        noticeId: null,
        noticeUsername: null,
        noticeWay: null,
        gmtCreate: null,
        gmtModified: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.$router.push({ query: {} });
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(
        '是否确认删除任务告警记录编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delAlarmLog(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function () {});
    },
  },
};
</script>

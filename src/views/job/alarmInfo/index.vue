<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        v-show="showSearch"
      >
        <el-form-item label="规则名称" prop="alarmName">
          <el-input
            v-model="queryParams.alarmName"
            placeholder="请输入规则名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="告警类型" prop="alarmType">
          <el-select
            v-model="queryParams.alarmType"
            placeholder="请选择类型"
            clearable
            size="small"
          >
            <el-option
              v-for="item in alarmTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="告警状态" prop="alarmStatus">
          <el-select
            v-model="queryParams.alarmStatus"
            placeholder="请选择状态"
            clearable
            size="small"
          >
            <el-option
              v-for="item in alarmStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="cyan"
            icon="el-icon-search"
            size="small"
            @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery"
            >重置</el-button
          >
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['job:alarmInfo:add']"
            >新增</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->

    <el-table
      v-loading="loading"
      :data="alarmWayList"
      element-loading-text="Loading"
      fit
      highlight-current-row
      style="width: 100%"
      size="small"
    >
      <el-table-column label="id" align="center" prop="id" width="80" fixed />
      <el-table-column label="规则名称" align="center" prop="alarmName" />
      <el-table-column label="告警类型" align="center" prop="alarmType">
        <template slot-scope="scope">
          <el-tag :type="scope.row.alarmType | statusFilter(alarmTypeList)">{{
            parseCodeToLabel(alarmTypeList, scope.row.alarmType)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="告警状态" align="center" prop="alarmStatus">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.alarmStatus | statusFilter(alarmStatusList)"
            >{{
              parseCodeToLabel(alarmStatusList, scope.row.alarmStatus)
            }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        label="告警地址"
        align="center"
        prop="alarmUrl"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="测试状态" align="center" prop="connectionStatus">
        <template slot-scope="scope">
          <el-tag
            :type="
              scope.row.connectionStatus | statusFilter(connectionStatusList)
            "
            >{{
              parseCodeToLabel(connectionStatusList, scope.row.connectionStatus)
            }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.updateTime, "{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        min-width="150"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="success"
            plain
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['job:alarmInfo:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="danger"
            plain
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['job:alarmInfo:remove']"
            >删除</el-button
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
      @pagination="getList"
    />

    <!-- 添加或修改告警配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="规则名称" prop="alarmName">
          <el-input v-model="form.alarmName" placeholder="请输入告警规则名称" />
        </el-form-item>
        <el-form-item label="告警类型" prop="alarmType">
          <el-select
            v-model="form.alarmType"
            placeholder="请选择类型"
            clearable
            size="small"
          >
            <el-option
              v-for="item in alarmTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="告警状态">
          <el-switch
            v-model="form.alarmStatus"
            class="show_switch_text show_switch_text_form"
            active-color="#00A854"
            :active-value="1"
            active-text="开启"
            inactive-color="#F04134"
            :inactive-value="0"
            inactive-text="关闭"
          />
        </el-form-item>
        <el-form-item
          label="告警地址"
          prop="alarmUrl"
          v-if="
            form.alarmType === 'dingDing' ||
            form.alarmType === 'wxWechat' ||
            form.alarmType === 'email'
          "
        >
          <el-input v-model="form.alarmUrl" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item
          label="告警端口"
          prop="alarmPort"
          v-if="form.alarmType === 'email'"
        >
          <el-input v-model="form.alarmPort" placeholder="请输入告警端口" />
        </el-form-item>
        <el-form-item
          label="告警账号"
          prop="alarmUsername"
          v-if="form.alarmType === 'email'"
        >
          <el-input v-model="form.alarmUsername" placeholder="请输入告警账号" />
        </el-form-item>
        <el-form-item
          label="告警密码"
          prop="alarmPassword"
          v-if="form.alarmType === 'email'"
        >
          <el-input v-model="form.alarmPassword" placeholder="请输入告警密码" />
        </el-form-item>
        <el-form-item label="告警变量">
          <el-form
              :inline="true"
              size="mini"
           >
         <span  class="tag-group" v-for="(itemGroup, index) in variableList" :key="index">
          <el-form-item
            :prop="item.prop"
             class="alarm-variable"
            v-for="(item, index) in itemGroup"
            :key="index"
            style="width:49%"
          >
          <span class="tag-group-span">
             <el-tag effect="plain">{{ item.title }}:</el-tag>
              <span>{{ item.variable }}</span>
              <el-button
                icon="el-icon-document-copy"
                size="mini"
                v-clipboard:copy="item.variable"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
              ></el-button>
            </span>
            <el-input
              v-model="item.value"
              placeholder="变量值" clearable 
             @change="changeVariableValue"
            >
             <template slot="prepend">测试值:</template>
            </el-input>
          </el-form-item>
        </span>
      
      </el-form>
      </el-form-item>
        <el-form-item label="跳转地址" prop="redirectUrl">
          <el-input v-model="form.redirectUrl" clearable placeholder="请输入${redirectUrl}变量">
             <template slot="prepend">${redirectUrl}:</template>
          </el-input>
        </el-form-item>
        <el-form-item label="告警模板" prop="alarmTemplate">
          <el-input
            v-model="form.alarmTemplate"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 20 }"
            :style="{ width: '100%' }"
            placeholder="请输入内容"
          />
          <el-divider content-position="left">告警内容预览
          </el-divider>
          <el-input
            v-model="alarmContent"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 20 }"
            :style="{ width: '100%' }"
            placeholder="请输入内容"
          />
          
        </el-form-item>
        <el-form-item label="通知对象" :inline="true">
            <el-input
              v-model="noticeUser.mobile"
              v-if="form.alarmType === 'email'"
              style="width:40%;margin-right:10px"
              placeholder="邮箱" 
              clearable 
            />
            <el-input
             v-else
              v-model="noticeUser.email"
              style="width:40%;margin-right:10px"
              placeholder="手机" 
              clearable 
            />
            <el-button
            type="primary"
            size="mini"
             style="margin-right:10px"
            @click="handleTestSend"
            >测试</el-button>
            <el-tag
            v-if="showConnectionStatus&&form.connectionStatus == 1"
            size="medium"
            v-model="form.connectionStatus"
            type="success"
            >成功</el-tag
          >
          <el-tag
            v-else-if="showConnectionStatus&&form.connectionStatus == 0"
            size="medium"
            v-model="form.connectionStatus"
            type="danger"
            >失败</el-tag
          >
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button  @click="restAlarmTemplate">恢 复</el-button>  
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listAlarm,
  getAlarm,
  delAlarm,
  addAlarm,
  testSend,
  updateAlarm,
} from "@/api/job/alarmInfo";
import { isEmpty, praseValue, isNumber } from "@/utils/common";
export default {
  name: "AlarmInfo",
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
      // 告警配置表格数据
      alarmWayList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      showConnectionStatus:false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 15,
        id: null,
        alarmName: null,
        alarmStatus: null,
        alarmType: null,
      },
      // 表单参数
      form: {
        alarmTemplate:null
      },
      alarmContent: "",
      noticeUser:{
         mobile:'',
         email:''
      },
      defaultAlarmTempldate:
        "${date}分布式定时任务平台告警: \n" +
        "1、告警标题: ${alarmTitle}\n" +
        "2、告警内容: ${alarmContent}\n" +
        "3、告警时间: ${alarmTime}\n" +
        "4、应用名称: ${appName}\n" +
        "5、任务名称: ${jobName}\n" +
        "6、任务Id:  ${jobId}\n" +
        "7、日志Id:  ${jobLogId}\n" +
        "8、触发方式：${triggerTypeEnum}\n" +
        "9、执行机器：${executorAddress}\n" +
        "10、执行结果：${handleCode}\n" +
        "详情请查看${redirectUrl}",
      defaultRedirectUrl: "${url}/job/jobLog?jobLogId=${jobLogId}",
      alarmStatusList: [
        { value: 0, label: "关闭", type: "info" },
        { value: 1, label: "开启", type: "success" },
      ],
      connectionStatusList: [
        { value: 0, label: "失败", type: "danger" },
        { value: 1, label: "成功", type: "success" },
      ],
      alarmTypeList: [
        { value: "dingDing", label: "钉钉", type: "primary" },
        { value: "wxWechat", label: "企业微信", type: "success" },
        { value: "email", label: "邮箱", type: "info" },
        { value: "feishu", label: "飞书", type: "info" },
      ],
      variableList: [],
      defaulVariableList: [
        [
          {
            title: "应用名称",
            variable: "${appName}",
            prop: "appName",
            value: "smart-job",
          },
          {
            title: "任务名称",
            variable: "${jobName}",
            prop: "jobName",
            value: "smart-job",
          },
        ],
        [
          {
            title: "执行结果",
            variable: "${handleCode}",
            prop: "handleCode",
            value: 200,
          },
          {
            title: "任务ID ",
            variable: "${jobId}",
            prop: "jobId",
            value: 1,
          },
        ],
        [
          {
            title: "日志ID ",
            variable: "${jobLogId}",
            prop: "jobLogId",
            value: 1,
          },
          {
            title: "告警时间",
            variable: "${alarmTime}",
            prop: "alarmTime",
            value: "2020-10-24 11:00:00",
          },
        ],
        [
          {
            title: "触发方式",
            variable: "${triggerType}",
            prop: "triggerType",
            value: 1,
          },
          {
            title: "告警内容",
            variable: "${alarmContent}",
            prop: "alarmContent",
            value: "xxx失败",
          },
        ],
        [
          {
            title: "告警日期",
            variable: "${date}",
            prop: "date",
            value: "2020-10-24",
          },
          {
            title: "告警标题",
            variable: "${alarmTitle}",
            prop: "alarmTitle",
            value: "定时任务执行失败",
          },
        ],
        [
          {
            title: "执行机器",
            variable: "${executorAddress}",
            prop: "executorAddress",
            value: "127.0.0.1",
          },
          {
            title: "跳转地址",
            variable: "${redirectUrl}",
            prop: "redirectUrl",
            value: "http://127.0.0.1:1024/job/jobLog?jobLogId=${jobLogId}",
          },
        ],
      ],
      // 表单校验
      rules: {
        alarmName: [
          { required: true, message: "告警别名不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  computed:{
        alarmTemplateVar(){
          return this.form.alarmTemplate;
        }
  },
  watch:{
      'form.alarmTemplate': {
      handler(newVal,oldVal) {
      const obj=this.variableList;
      this.handlePreAlarmConent(newVal,obj)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /** 查询告警配置列表 */
    getList() {
      this.loading = true;
      const param = Object.assign({}, this.queryParams);
      const urlAlarmId = this.$route.query.alarmId;
      if (isNumber(urlAlarmId) && !param.id) {
        param.id = urlAlarmId;
      }
      listAlarm(param).then((response) => {
        this.alarmWayList = response.data.list;
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
        alarmType: null,
        alarmName: null,
        alarmStatus: 0,
        alarmContent: null,
        alarmTemplate: null,
        alarmUrl: null,
        redirectUrl: null,
        alarmHost: null,
        alarmPort: null,
        alarmUsername: null,
        alarmPassword: null,
        connectionStatus: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.variableList =  Object.assign([],this.defaulVariableList);
      this.open = true;
      this.title = "添加告警规则";
      this.form.alarmTemplate = this.defaultAlarmTempldate;
      this.form.redirectUrl = this.defaultRedirectUrl.replace(
        "${url}",
        window.location.origin
      );
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.variableList =  Object.assign([],this.defaulVariableList);
      const id = row.id || this.ids;
      getAlarm(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改告警规则";
      });
    },
    restAlarmTemplate() {
      // console.log(JSON.stringify(this.defaulVariableList))
      this.form.alarmTemplate = this.defaultAlarmTempldate;
      this.variableList =  Object.assign([],this.defaulVariableList);
    },
    getRedirectUrlValue(variableList) {
      for (let i = 0, len = variableList.length; i < len; i++) {
        let item = variableList[i];
        for (let j = 0, lenj = item.length; j < lenj; j++) {
          let variableObj = item[j];
          if (variableObj.prop === "redirectUrl") {
            return variableObj.value;
          }
        }
      }
    },
    setRedirectUrlValue(variableList, redirectUrlValue) {
      for (let i = 0, len = variableList.length; i < len; i++) {
        let item = variableList[i];
        for (let j = 0, lenj = item.length; j < lenj; j++) {
          let variableObj = item[j];
          if (variableObj.prop === "redirectUrl") {
            return (variableObj.value = redirectUrlValue);
          }
        }
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateAlarm(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addAlarm(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
    handleTestSend() {
      this.testSend();
    },
    changeVariableValue(){
      this.handlePreAlarmConent(this.form.alarmTemplate,this.variableList)
    },
    handlePreAlarmConent(alarmTemplates,variableList) {
      if(alarmTemplates===null||variableList==null){
        return
      }
      this.alarmContent = alarmTemplates;
      let variableTemp = [];
      let redirectUrlObj = "";
      for (let i = 0, len = variableList.length; i < len; i++) {
        let item = variableList[i];
        for (let j = 0, lenj = item.length; j < lenj; j++) {
          let variableObj = item[j];
          variableTemp.push(variableObj);
          if (variableObj.prop === "redirectUrl") {
            redirectUrlObj = variableObj.value;
          }
        }
      }
      variableTemp.forEach((obj) => {
        redirectUrlObj = redirectUrlObj.replace(
          obj.variable,
          obj.value
        );
        if (obj.prop !== "redirectUrl") {
          this.alarmContent = this.alarmContent.replace(
            obj.variable,
            obj.value
          );
        }
      });
      this.alarmContent = this.alarmContent.replace(
        "${redirectUrl}",
        redirectUrlObj
      );
    },
    testSend() {
      let variableTemp=[];
       for (let i = 0, len = this.variableList.length; i < len; i++) {
        let item = this.variableList[i];
        for (let j = 0, lenj = item.length; j < lenj; j++) {
          let variableObj = item[j];
          variableTemp.push(variableObj);
        }
      }
      let testAlarmParamVO ={
        alarmInfo:this.form,
        variableList:variableTemp,
        noticeUser:this.noticeUser
      };
      this.form.connectionStatus==undefined;
      testSend(testAlarmParamVO).then((response) => {
        if (response.code === 200) {
          this.showConnectionStatus = true;
          if (response.data.sendStatus) {
            this.form.connectionStatus = 1;
            this.msgSuccess("测试成功");
          } else {
            this.form.connectionStatus = 0;
            this.msgError("测试失败:" + response.data.errorMsg);
          }
        }
      });
    },
    onCopy(e) {
      this.$message.success("内容" + e.text + "已复制到剪切板！");
    },
    onError(e) {
      this.$message.error("抱歉，复制失败！");
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(
        '是否确认删除告警规则编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delAlarm(ids);
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
<style lang="scss" scoped>
.tag-group {
  display: inline-block;
}
.tag-group .el-form-item {
  margin-bottom: 2px;
}
.tag-group .alarm-variable {
  // max-width: 260px;
  width: 48%;
  margin-right: 4px;
  display: inline-block;
}
.tag-group .alarm-variable .tag-group-span {
  // max-width: 260px;
  width: 300px;
  display: inline-block;
  margin-bottom: 4px;
}

.tag-group .alarm-variable .el-tag {
  margin-right: 2px;
}
.tag-group .alarm-variable .el-button {
  border: 0px;
  padding: 7px;
  font-size: 16px;
  margin-left: 2px;
}
.alarm-redirectUrl {
  margin-top: -18px;
}
.alarm-redirectUrl.el-input {
  margin-left: 2px;
}
.alarm-redirectUrl .el-button,
i {
  border: 0px;
  font-size: 16px;
  padding: 7px;
}
</style>

<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="任务名称" prop="id">
          <el-select
            v-model="queryParams.id"
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
              <span style="float: left;">{{ item.jobName }}</span>
              <span
                style="float: right; color: #8492a6; font-size: 13px;margin-left: 4px;margin-right: 14px"
              >{{ item.executorHandler}}</span>
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
              <span style="float: left;">{{ item.title }}</span>
              <span
                style="float: right; color: #8492a6; font-size: 13px;margin-left: 4px;margin-right: 14px"
              >{{ item.appName}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务类型" prop="glueType">
          <el-select
            v-model="queryParams.glueType"
            @change="handleQuery"
            placeholder="任务类型"
            style="width: 180px"
            clearable
            filterable
            class="filter-item"
          >
            <el-option
              v-for="item in glueTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="运行状态" prop="jobStatus">
          <el-select
            v-model="queryParams.jobStatus"
            @change="handleQuery"
            placeholder="运行状态"
            style="width: 120px"
            clearable
            filterable
            class="filter-item"
          >
            <el-option
              v-for="item in jobStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="triggerStatus">
          <el-select
            v-model="queryParams.triggerStatus"
            @change="handleQuery"
            placeholder="启用状态"
            style="width: 120px"
            clearable
            filterable
            class="filter-item"
          >
            <el-option
              v-for="item in triggerStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button v-waves type="cyan" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleCreate"
            v-hasPermi="['job:jobInfo:add']"
          >新增</el-button>
        </el-form-item>
      </el-form>
      <span class="custom-total">共 {{total}} 条</span>
    </div>
    <el-table
      v-loading="listLoading"
      :data="jobInfoList"
      element-loading-text="Loading"
      fit
      highlight-current-row
      style="width: 100%"
      size="small"
    >
      <el-table-column label="任务ID" prop="id" align="center" width="80" fixed/>
      <el-table-column label="任务名称" prop="jobName" align="center" width="200" :show-overflow-tooltip="true" fixed/>
      <el-table-column label="应用名" prop="title" align="center" width="200" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <router-link :to="'/job/jobGroup?jobGroup=' + scope.row.jobGroup" class="link-type">
            <span>{{ scope.row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="注册节点" align="center" width="120" >
        <template slot-scope="scope">
          <el-popover placement="bottom" width="420" @show="getOnLineAddressList(scope.row)">
            <el-table :data="registerNode">
              <el-table-column width="150" property="address" label="机器地址" align="center" />
              <el-table-column width="80" property="online" label="状态" align="center">
                <template slot-scope="{row}">
                  <el-tag v-if="row.online === 1" type="success">在线</el-tag>
                  <el-tag v-else type="info">离线</el-tag>
                </template>
              </el-table-column>
              <el-table-column property="updateTime" label="更新时间" align="center">
                <template slot-scope="{row}">{{row.updateTime || '--'}}</template>
              </el-table-column>
            </el-table>
            <span
              v-if="scope.row.onLineNum>0"
              style="cursor: pointer"
              slot="reference"
            ><span class="circle-online">●</span><span style="color:#337ab7">在线({{scope.row.onLineNum}}台)</span> </span>
            <span
              v-else
              style="cursor: pointer"
              slot="reference"
            ><span class="circle-offline">●</span><span style="color:#909399">离线</span></span>  
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="任务类型" prop="glueType" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{glueTypes.find(t => t.value === row.glueType).label}}</span>
        </template>
      </el-table-column>
      <el-table-column label="运行状态" prop="jobStatus" align="center" width="100">
        <template slot-scope="{row}">
          <el-tag
            :type="row.jobStatus | statusFilter(jobStatusList)"
          >{{ parseCodeToLabel(jobStatusList,row.jobStatus)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" prop="triggerStatus" align="center" width="100">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.triggerStatus"
              class="show_switch_text"
              active-color="#00A854"
              :active-value="1"
              :active-text="parseCodeToLabel(triggerStatusList,scope.row.triggerStatus)"
              inactive-color="#F04134"
              :inactive-value="0"
              :inactive-text="parseCodeToLabel(triggerStatusList,scope.row.triggerStatus)"
              :disabled="!checkPermi(['job:jobInfo:update'])"
              @change="changeJobTriggerStatusSwitch(scope.row)"
            />
        </template>
      </el-table-column>

      <el-table-column label="Cron表达式"  prop="jobCron" align="center" width="160"  :show-overflow-tooltip="true">
      </el-table-column>
      <el-table-column label="下次触发时间" align="center" width="100">
        <template slot-scope="scope">
          <el-popover placement="bottom" width="250" @show="nextTriggerTime(scope.row)">
            <div style="text-align:center;">
              <h4
                style="margin-top:4px;margin-bottom:8px;color:rgba(0,0,0,.65)"
              >时间: {{parseTime(new Date())}}</h4>
              <div
                style="margin:3px;color:rgb(0, 168, 84);"
                v-for="(item,index) in triggerNextTimes"
                :key="index"
              >
                <span>第{{index+1}}次: {{item}}</span>
              </div>
            </div>
            <el-button slot="reference" size="mini">查看</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="运行结果" align="center" width="100">
        <template slot-scope="{row}">
          <el-popover placement="bottom" width="350" trigger="click">
            <div>
              <span>
                调度结果:
                <el-tag :type="row.lastTriggerCode |  statusFilter(statusList)">
                  {{parseCodeToLabel(statusList,row.lastTriggerCode)}}
                  <span
                    v-if="row.lastTriggerTime"
                    class="el-icon-time"
                  >{{row.lastTriggerTime}}</span>
                </el-tag>
              </span>
              <p>
                执行结果:
                <el-tag :type="row.lastHandleCode | statusFilter(statusList)">
                  {{parseCodeToLabel(statusList,row.lastHandleCode)}}
                  <span
                    v-if="row.lastHandleTime"
                    class="el-icon-time"
                  >{{row.lastHandleTime}}</span>
                </el-tag>
              </p>
            </div>
            <el-button slot="reference" size="mini" plain  type="success"  v-if="row.lastTriggerCode === 200 && row.lastTriggerCode === 200">成功</el-button>
            <el-button slot="reference" size="mini" plain  type="danger" v-else>失败</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="创建方式" prop="createWay" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ parseCodeToLabel(createWayList,row.createWay)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="author" align="center" width="100">
        <template slot-scope="scope">{{scope.row.author || '--'}}</template>
      </el-table-column>
      <el-table-column label="创建时间" prop="addTime" width="150" align="center"></el-table-column>
      <el-table-column label="修改时间" prop="updateTime" width="150" align="center"></el-table-column>
      <el-table-column label="操作" align="center" min-width="280" fixed="right">
        <template slot-scope="{row}">
          <el-button
            type="success"
            plain
            size="mini"
            icon="el-icon-edit"
            divided
            v-hasPermi="['job:jobInfo:update']"
            @click.native="handlerUpdate(row)"
          >修改</el-button>
          <el-button
            size="mini"
            plain
            icon="el-icon-circle-check"
            v-hasPermi="['job:jobInfo:trigger']"
            @click.native="handlerExecute(row)"
          >执行</el-button>
          <el-dropdown style="margin-left:10px">
            <el-button size="mini" plain type="primary">
              更多
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handlerViewLog(row)">查询日志</el-dropdown-item>
              <el-dropdown-item @click.native="handlerCopy(row)" v-hasPermi="['job:jobInfo:copy']" >复制任务</el-dropdown-item>
              <el-dropdown-item
                @click.native="handlerDelete(row)"
                v-hasPermi="['job:jobInfo:remove']"
              >删除任务</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page-sizes="[10,15,20,30,50]"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="handleQuery"
    />

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :before-close="handleClose"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
      >

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="temp.jobName" size="medium" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应用名" prop="jobGroup">
              <el-select
                v-model="temp.jobGroup"
                filterable
                remote
                clearable
                placeholder="请选择应用名"
                :remote-method="remoteFormQueryJobGroupMethod"
                @focus="initFormQueryJobGroupName"
                :loading="loading"
                :style="{width: '100%'}"
              >
                <el-option
                  v-for="item in jobList.formJobGroupItems"
                  :key="item.id"
                  :label="item.label"
                  :value="item.id"
                >
                  <span style="float: left;">{{ item.title }}</span>
                  <span
                    style="float: right; color: #8492a6; font-size: 13px;margin-left: 4px;margin-right: 14px"
                  >{{ item.appName}}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
          <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务类型" prop="glueType">
              <el-select
                v-model="temp.glueType"
                filterable
                placeholder="任务类型"
                :style="{width: '100%'}"
              >
                <el-option
                  v-for="item in glueTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="JobHandler">
              <el-input
                v-model="temp.executorHandler"
                placeholder="请输入JobHandler"
                :disabled="temp.glueType !=='BEAN'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路由策略" prop="executorRouteStrategy">
              <el-select
                v-model="temp.executorRouteStrategy"
                filterable
                placeholder="请选择路由策略"
                :style="{width: '100%'}"
              >
                <el-option
                  v-for="item in routeStrategies"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Cron" prop="jobCron">
                <el-input v-model="temp.jobCron" size="mini" placeholder="请输入cron" >
                  <cron-button slot="append" v-model="temp.jobCron" size="mini"  @change="change" @preCron="preCron"/> 
                </el-input>
                <span style="text-align: center;" v-for="(item, index) in firstPreCron" :key="index">
                 <span style="color:rgb(0, 168, 84);front-size:14px"> 第{{index+1}}次: {{item}}</span> 
                 <el-button  v-if="index==0" v-model="temp.jobCron" style="margin-left:30px" size="mini" icon="el-icon-refresh-left" @click="reset"></el-button>
                </span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="阻塞处理" prop="executorBlockStrategy">
              <el-select
                v-model="temp.executorBlockStrategy"
                filterable
                placeholder="请选择阻塞处理策略"
                :style="{width: '100%'}"
              >
                <el-option
                  v-for="item in blockStrategies"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子任务">
              <el-select
                v-model="temp.childJobId"
                multiple
                filterable
                placeholder="子任务"
                value-key="id"
                :style="{width: '100%'}"
                :remote-method="remoteQueryJobMethod"
                @focus="initQueryJobName"
                :loading="loading"
              >
                <el-option
                  v-for="item in jobList.jobItems"
                  :key="item.id"
                  :label="item.label"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="超时时间(秒)">
              <el-input-number v-model="temp.executorTimeout" :min="0" :max="120" />
              <!-- <span style="margin-left: 5px ;">秒</span> -->
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失败重试次数">
              <el-input-number v-model="temp.executorFailRetryCount" :min="0" :max="3" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建方式">
              <el-select v-model="temp.createWay" placeholder="创建方式" :style="{width: '100%'}">
                <el-option
                  v-for="item in createWayList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人">
              <el-select
                v-model="temp.alarmUserIds"
                multiple
                filterable
                placeholder="请输入负责人"
                value-key="userId"
                :style="{width: '100%'}"
                :remote-method="remoteQueryUserMethod"
                @focus="initQueryUserName"
                :loading="loading"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.userId"
                  :label="item.label"
                  :value="item.userId"
                >
                  <span style="float: left;">{{ item.userName }}</span>
                  <span
                    style="float: right; color: #8492a6; font-size: 13px;margin-left: 6px;margin-right: 14px"
                  >{{ item.nickName}}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="temp.glueType==='BEAN'" :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务参数">
              <el-input
                v-model="temp.executorParam"
                type="textarea"
                :autosize="{minRows: 2, maxRows: 6}"
                :style="{width: '100%'}"
                placeholder="请输入任务参数"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- <json-editor v-if="temp.glueType==='GLUE_GROOVY'" ref="jsonEditor" v-model="jobJson" /> -->
      <shell-editor v-if="temp.glueType==='GLUE_SHELL'" ref="shellEditor" v-model="glueSource" />
      <python-editor v-if="temp.glueType==='GLUE_PYTHON'" ref="pythonEditor" v-model="glueSource" />
      <powershell-editor
        v-if="temp.glueType==='GLUE_POWERSHELL'"
        ref="powershellEditor"
        v-model="glueSource"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 手动执行任务框 -->
    <el-dialog
      title="手动执行任务"
      :visible.sync="formData.dialogFormVisible"
      width="400px"
      :before-close="handleClose"
    >
      <el-form
        ref="executorAddressForm"
        :model="formData"
        :rules="executeAddressRules"
        size="small"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="jobName">
          <el-input v-model="formData.jobName" type="text" :disabled="true" :style="{width: '90%'}"></el-input>
        </el-form-item>
        <el-form-item label="机器地址" prop="address">
          <el-select
            v-model="formData.address"
            placeholder="请选择执行机器地址"
            clearable
            :style="{width: '90%'}"
          >
            <el-option
              v-for="item in registerNode"
              :key="item.address"
              :value="item.address"
              :label="item.address"
            >
              <span style="float: left">{{item.address}}</span>
              <span
                style="float: right; color: rgb(0, 168, 84); font-size: 14px"
                v-if="item.online === 1"
              >在线</span>
              <span style="float: right; color: #909399; font-size: 14px" v-else>离线</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务参数" prop="executorParam">
          <el-input
            v-model="formData.executorParam"
            type="textarea"
            placeholder="请输入任务参数"
            :autosize="{minRows: 2, maxRows: 3}"
            :style="{width: '90%'}"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="formData.dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handelConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as executor from "@/api/job/jobExecutor";
import * as job from "@/api/job/jobInfo";
import * as user from "@/api/system/user";
import waves from "@/directive/waves"; // waves directive
import JsonEditor from "@/components/JsonEditor";
import ShellEditor from "@/components/ShellEditor";
import PythonEditor from "@/components/PythonEditor";
import PowershellEditor from "@/components/PowershellEditor";
import { isJSON } from "@/utils/validate";
import { checkPermi, checkRole } from "@/utils/permission";
import { isEmpty, praseValue,isNumber } from "@/utils/common";
import CronButton from 'vue-smart-cron/src/components/cron-button'
import { DEFAULT_CRON_EXPRESSION } from 'vue-smart-cron/src/constant/filed'
import {
  isArray,
  splitToInt,
  remoteQueryMethod,
  initQueryList,
} from "@/utils/common";

export default {
  name: "JobInfo",
  components: { JsonEditor, ShellEditor, PythonEditor, PowershellEditor,CronButton },
  directives: { waves },
  filters: {},
  data() {
    return {
      jobInfoList: null,
      listLoading: true,
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 15,
        jobGroup: undefined,
        id: undefined,
        triggerStatus: undefined,
        jobStatus: undefined,
        jobName: undefined,
        glueType: undefined,
      },
      showCronBox: false,
      dialogPluginVisible: false,
      pluginData: [],
      dialogFormVisible: false,
      dialogStatus: "",
      firstPreCron:"",
      textMap: {
        update: "Edit",
        create: "Create",
        detail: "Detail",
      },
      rules: {
        jobGroup: [
          {
            required: true,
            message: "jobGroup is required",
            trigger: "change",
          },
        ],
        executorRouteStrategy: [
          {
            required: true,
            message: "executorRouteStrategy is required",
            trigger: "change",
          },
        ],
        executorBlockStrategy: [
          {
            required: true,
            message: "executorBlockStrategy is required",
            trigger: "change",
          },
        ],
        glueType: [
          { required: true, message: "jobType is required", trigger: "change" },
        ],
        jobName: [
          { required: true, message: "jobName is required", trigger: "blur" },
          {
            min: 4,
            max: 64,
            message: "长度在 4 到 64 个字符",
            trigger: "blur",
          },
        ],
        jobCron: [
          { required: true, message: "jobCron is required", trigger: "blur" },
        ],
      },
      executeAddressRules: {
        address: [
          { required: true, message: "address is required", trigger: "blur" },
        ],
      },
      temp: {
        id: undefined,
        jobGroup: "",
        jobCron: DEFAULT_CRON_EXPRESSION,
        jobName: "",
        executorRouteStrategy: "",
        executorBlockStrategy: "",
        childJobId: "",
        executorFailRetryCount: "0",
        alarmUserIds: "",
        executorTimeout: "0",
        executorHandler: "",
        glueType: "",
        glueSource: "",
        executorParam: "",
        createWay: "",
      },
      resetTemp() {
        this.temp = this.$options.data().temp;
        this.glueSource = "";
      },
      executorList: "",
      jobIdList: "",
      blockStrategies: [
        { value: "SERIAL_EXECUTION", label: "单机串行" },
        { value: "DISCARD_LATER", label: "丢弃后续调度" },
        { value: "COVER_EARLY", label: "覆盖之前调度" },
      ],
      routeStrategies: [
        { value: "FIRST", label: "第一个" },
        { value: "LAST", label: "最后一个" },
        { value: "ROUND", label: "轮询" },
        { value: "RANDOM", label: "随机" },
        { value: "CONSISTENT_HASH", label: "一致性HASH" },
        { value: "LEAST_FREQUENTLY_USED", label: "最不经常使用" },
        { value: "LEAST_RECENTLY_USED", label: "最近最久未使用" },
        { value: "FAILOVER", label: "故障转移" },
        { value: "BUSYOVER", label: "忙碌转移" },
        { value: "SHARDING_BROADCAST", label: "分片广播" },
      ],
      glueTypes: [
        { value: "BEAN", label: "java任务" },
        { value: "GLUE_GROOVY", label: "Groovy任务" },
        { value: "GLUE_SHELL", label: "Shell任务" },
        { value: "GLUE_PYTHON", label: "Python任务" },
        { value: "GLUE_POWERSHELL", label: "PowerShell任务" },
        { value: "GLUE_PHP", label: "PHP任务" },
        { value: "GLUE_NODEJS", label: "NodeJs任务" },
      ],
      triggerNextTimes: "",
      registerNode: [],
      glueSource: "",
      statusList: [
        { value: 500, label: "失败", type: "danger" },
        { value: 502, label: "失败(超时)", type: "danger" },
        { value: 200, label: "成功", type: "success" },
        { value: 0, label: "无", type: "info" },
      ],
      jobStatusList: [
        { value: 0, label: "未运行", type: "info" },
        { value: 1, label: "进行中", type: "success" },
        { value: 200, label: "成功", type: "success" },
        { value: 500, label: "失败", type: "danger" },
      ],
      createWayList: [
        { value: 0, label: "API创建",type: ""  },
        { value: 1, label: "界面创建",type: "success" },
      ],
      triggerStatusList: [
        { value: 0, label: "禁用" },
        { value: 1, label: "开启" },
      ],
      formData: {
        address: undefined,
        executorParam: undefined,
        dialogFormVisible: false,
      },
      jobList: {
        timeout: "",
        jobGroupItems: [],
        formJobGroupItems: [],
        jobItems: [],
      },
      userList: [],
    };
  },
  created() {
    this.handleQuery();
  
  },

  methods: {
    checkPermi,
    checkRole,
     change(cron) {
      this.temp.jobCron = cron
    },
    reset(cron) {
      this.temp.jobCron = DEFAULT_CRON_EXPRESSION
    },
    preCron(result){
      this.firstPreCron=result
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
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
            i.label = i.jobName;
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
            i.label = i.jobName;
          }
          let list = response.data;
          this.jobList.jobItems = list.filter((item) => {
            return new RegExp(queryString, "i").test(item.label);
          });
        });
      }, 100 * Math.random());
    },
    initQueryUserName() {
      if (this.userList.length > 5) {
        return;
      }
      let queryString = "";
      this.loading = true;
      clearTimeout(this.timeout);
      setTimeout(() => {
        this.loading = false;
        user.querySearch(queryString).then((response) => {
          for (let i of response.data) {
            i.label = i.userName;
          }
          this.userList = response.data;
        });
      }, 100 * Math.random());
    },
    remoteQueryUserMethod(queryString) {
      queryString = queryString ? queryString.trim() : "";
      this.loading = true;
      clearTimeout(this.timeout);
      setTimeout(() => {
        this.loading = false;
        user.querySearch(queryString).then((response) => {
          for (let i of response.data) {
            i.label = i.userName;
          }
          let list = response.data;
          this.userList = list.filter((item) => {
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
    initFormQueryJobGroupName() {
      if (this.jobList.formJobGroupItems.length > 5) {
        return;
      }
      this.loadJobGroupName(this, function (self, data) {
        self.jobList.formJobGroupItems = data;
      });
    },
    remoteFormQueryJobGroupMethod(queryString) {
      this.queryJobGroupMethod(queryString, this, function (self, data) {
        self.jobList.formJobGroupItems = data;
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
            i.label = i.title;
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
            i.label = i.title;
          }
          let list = response.data.filter((item) => {
            return new RegExp(queryString, "i").test(item.label);
          });
          callback(self, list);
        });
      }, 100 * Math.random());
    },
    getExecutor() {
      job.getExecutorList().then((response) => {
        const { data } = response;
        this.executorList = data;
      });
    },
    getJobIdList() {
      job.getJobIdList().then((response) => {
        const { data } = response;
        this.jobIdList = data;
      });
    },
    handleQuery() {
      this.listLoading = true;
       const param = Object.assign({}, this.queryParams);
       const urlJobId = this.$route.query.jobId;
      if (isNumber(urlJobId)&& !param.id) {
         param.id = urlJobId;
      }  
      job.getList(param).then((response) => {
        this.jobInfoList = response.data.list;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.$router.push({ query: {} });
      this.handleQuery();
    },
    incStartTimeFormat(vData) {},
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        let createItem = Object.assign({}, this.temp);
        if (valid) {
          createItem.childJobId = this.temp.childJobId
            ? this.temp.childJobId.toString()
            : "";
          createItem.alarmUserIds = this.temp.alarmUserIds
            ? this.temp.alarmUserIds.toString()
            : "";
          createItem.glueSource = this.glueSource;
          job.createJob(createItem).then(() => {
            this.handleQuery();
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Created Successfully",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handlerUpdate(row) {
      this.resetTemp();
      this.temp = Object.assign({}, row); // copy obj
      if (this.temp.jobJson) this.jobJson = JSON.parse(this.temp.jobJson);
      this.glueSource = this.temp.glueSource;
      if (this.temp.jobGroup) {
        executor.loadById(this.temp.jobGroup).then((response) => {
          let data = response.data;
          data.label = data.title;
          let existItem = this.jobList.formJobGroupItems.filter(function (
            item
          ) {
            return item.id === data.id;
          });
          if (existItem == "") {
            this.jobList.formJobGroupItems.push(data);
          }
        });
      }
      if (this.temp.childJobId && this.temp.childJobId !== ",") {
        job.queryIds(this.temp.childJobId).then((response) => {
          for (let i of response.data) {
            i.label = i.jobName;
          }
          this.jobList.jobItems = response.data;
        });
        this.temp.childJobId = splitToInt(this.temp.childJobId);
      }
      if (this.temp.alarmUserIds && this.temp.alarmUserIds !== ",") {
        user.queryIds(this.temp.alarmUserIds).then((response) => {
          for (let i of response.data) {
            i.label = i.userName;
          }
          this.userList = response.data;
        });
        this.temp.alarmUserIds = splitToInt(this.temp.alarmUserIds);
      }
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          let updateJobGroup = Object.assign({}, this.temp);
          if (isArray(this.temp.childJobId)) {
            updateJobGroup.childJobId = this.temp.childJobId.toString();
          } else {
            updateJobGroup.childJobId = "";
          }
          if (isArray(this.temp.alarmUserIds)) {
            updateJobGroup.alarmUserIds = this.temp.alarmUserIds.toString();
          } else {
            updateJobGroup.alarmUserIds = "";
          }
          updateJobGroup.glueSource = this.glueSource;
          job.updateJob(updateJobGroup).then(() => {
            this.handleQuery();
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Update Successfully",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handlerDelete(row) {
      this.$confirm("确定删除【" + row.jobName + "】吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        job.removeJob(row.id).then((response) => {
          this.handleQuery();
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
        });
      });

      // const index = this.list.indexOf(row)
    },
    handlerExecute(row) {
      this.formData = this.$options.data().formData;
      this.formData.dialogFormVisible = true;
      this.formData.jobName = row.jobName;
      this.formData.id = row.id;
      this.$nextTick(() => {
        this.$refs["executorAddressForm"].clearValidate();
      });
      this.getOnLineAddressList(row, this, function (self, registerNode) {
        if (registerNode && registerNode.length === 1) {
          self.formData.address = registerNode[0].address;
        }
      });
    },
    handelConfirm() {
      this.$refs["executorAddressForm"].validate((valid) => {
        if (!valid) return;
        const param = {};
        param.jobId = this.formData.id;
        param.executorParam = this.formData.executorParam;
        param.address = this.formData.address;
        job.triggerJob(param).then((response) => {
          this.formData.dialogFormVisible = false;
          this.$notify({
            title: "Success",
            message: "Execute Successfully",
            type: "success",
            duration: 2000,
          });
          this.handleQuery();
        });
        // this.close()
      });
    },
    // 查看日志
    handlerViewLog(row) {
      this.$router.replace({
        path: "/job/jobLog",
        query: { jobId: row.id },
      });
    },
    //复制任务
    handlerCopy(row) {
        job.copyJob(row.id).then((response) => {
        this.$notify({
          title: "Success",
          message: "Successfully",
          type: "success",
          duration: 2000,
        });
        this.handleQuery();
      });
      
    },
    handlerChangeJobCreateWay(row, status) {
      job.changeJobCreateWay(row.id, status).then((response) => {
        this.$notify({
          title: "Success",
          message: "Successfully",
          type: "success",
          duration: 2000,
        });
      });
    },
    handlerChangeTriggerStatus(row, status) {
      job.changeJobStatus(row.id, status).then((response) => {
        this.$notify({
          title: "Success",
          message: "Successfully",
          type: "success",
          duration: 2000,
        });
        return response.code
      });
    },
    changeJobTriggerStatusSwitch(row) {
      let text = this.parseCodeToLabel(this.triggerStatusList,row.triggerStatus);
      this.$confirm('确认要"' + text + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return this.handlerChangeTriggerStatus(row, row.triggerStatus)
        })
        .catch(function(error) {
          console.log("changeJobTriggerStatusSwitch:"+error)
          row.triggerStatus = row.triggerStatus === 0 ? 1 : 0;
        });
    },
    changeCreateWaySwitch(row) {
      let text = this.parseCodeToLabel(this.createWayList,row.createWay);
      this.$confirm('确认要修改为"' + text + '"任务吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return this.handlerChangeJobCreateWay(row,row.createWay)
        })
        .catch(function () {
          row.createWay = row.createWay === 0 ? 1 : 0;
        });
    },
    nextTriggerTime(row) {
      job.nextTriggerTime(row.jobCron).then((response) => {
        const { data } = response;
        this.triggerNextTimes = data;
      });
    },
    getOnLineAddressList(row, self, callBack) {
      executor.getOnLineAddressList(row.jobGroup).then((response) => {
        this.registerNode = [];
        const { data } = response;
        if (!data) return;
        this.registerNode = data.registryInfoList;
        if (self && callBack) {
          callBack(self, this.registerNode);
        }
      });
    },
  },
};
</script>

<style lang="scss">
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}


</style>

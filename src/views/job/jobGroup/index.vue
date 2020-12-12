<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="应用名称" prop="jobGroup">
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
                style="float: right; color: #8492a6; font-size: 13px;margin-left: 4px"
              >{{ item.appName}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="注册方式" prop="addressType">
          <el-select
            v-model="queryParams.addressType"
            placeholder="请选择注册方式"
            @change="handleQuery"
            clearable
            filterable
            size="small"
          >
            <el-option
              v-for="item in addressTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="告警状态" prop="alarmStatus">
          <el-select
            v-model="queryParams.alarmStatus"
            placeholder="请选择告警状态"
            @change="handleQuery"
            clearable
            filterable
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
            v-waves
           type="cyan"
            icon="el-icon-search"
            size="small"
            @click="handleQuery"
          >搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleCreate">新增</el-button>
        </el-form-item>
      </el-form>
      <span class="custom-total">共 {{total}} 条</span>
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
      <el-table-column label="应用id" prop="id" width="80" align="center" fixed></el-table-column>
      <el-table-column
        label="appName"
        prop="appName"
        width="120"
        align="center"
        fixed
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        label="应用名称"
        prop="title"
        width="140"
        align="center"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <!-- <el-table-column label="环境" prop="env" width="90" align="center"></el-table-column> -->
      <el-table-column label="客户端版本" prop="clientVersion" width="90" align="center"></el-table-column>
      <el-table-column label="排序" prop="order" width="80"  align="center"></el-table-column>
      <el-table-column label="注册方式" width="100" align="center">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.addressType | statusFilter(addressTypeList)"
          >{{ parseCodeToLabel(addressTypeList,scope.row.addressType)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="在线机器" min-width="300" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <div v-for="item in scope.row.registryInfoList" :key="item.address" :model="item">
            <template v-if="(item.online == '1')">
              <span class="circle-online">●</span><span>{{item.address}}</span>
              <span
                class="el-icon-time"
                style="color:#13ce66; margin:8px"
              >{{item.updateTime ? item.updateTime:''}}</span>
            </template>
            <template v-else>
              <span class="circle-offline">●</span><span>{{item.address}}</span>
            </template>
          </div>
          <div v-if="scope.row.registryInfoList == null">
            <span>暂无在线的机器</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="告警状态" width="80" align="center">
        <template slot-scope="scope">
           <el-tag
            :type="scope.row.alarmStatus | statusFilter(alarmStatusList)"
          >{{ parseCodeToLabel(alarmStatusList,scope.row.alarmStatus)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="gmtCreate" width="180" align="center"></el-table-column>
      <el-table-column label="修改时间" prop="gmtModified" width="180" align="center"></el-table-column>
      <el-table-column label="操作" align="center" min-width="180" fixed="right">
        <template slot-scope="{row}">
          <el-button size="mini" type="success" plain icon="el-icon-edit" @click="handleUpdate(row)"  v-hasPermi="['job:jobGroup:update']">修改</el-button>
          <el-button size="mini" type="danger" plain icon="el-icon-delete" @click="handleDelete(row)"  v-hasPermi="['job:jobGroup:remove']">删除</el-button>
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
      width="600px"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="140px"
      >
        <el-form-item label="appName" prop="appName">
          <el-input v-model="temp.appName" placeholder="appName" />
        </el-form-item>
        <el-form-item label="应用名称" prop="title">
          <el-input v-model="temp.title" placeholder="请输入执行器名称" />
        </el-form-item>
        <el-form-item label="客户端版本" prop="clientVersion">
          <el-input v-model="temp.clientVersion" placeholder="请输入客户端版本" />
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number
            v-model="temp.order"
            :step="1"
            :min="1"
            :max="100000"
            step-strictly
            placeholder="执行器序号"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="注册方式" prop="addressType">
          <el-radio-group v-model="temp.addressType">
            <el-radio
              v-for="item in addressTypeList"
              :label="item.value"
              :key="item.value"
            >{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="temp.addressType =='1'"
          label="机器地址"
          prop="addressList"
          :rules="{
                 required: true, message: '机器地址不能为空', trigger: 'blur'
                }"
        >
          <el-input
            v-model="temp.addressList"
            type="textarea"
            :autosize="{minRows: 2, maxRows: 5}"
            placeholder="多个以逗号分隔"
          />
        </el-form-item>
        <el-form-item label="告警状态" prop="alarmStatus">
          <el-radio-group v-model="temp.alarmStatus">
            <el-radio
              v-for="item in alarmStatusList"
              :label="item.value"
              :key="item.value"
            >{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="告警方式"
          prop="alarmIds"
          v-if="temp.alarmStatus == '1'"
          :rules="[
      { required: true, message: '请选择告警方式', trigger: 'blur' }]"
        >
          <el-select
            v-model="temp.alarmIds"
            multiple
            filterable
            remote
            clearable
            placeholder="请选择告警方式"
            :remote-method="remoteQueryAlarmMethod"
            @change="handleQuery"
            @focus="initQueryAlarmName"
            :loading="loading"
          >
            <el-option
              v-for="item in alarmList"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            >
              <span style="float: left;">{{ item.alarmName}}</span>
              <span
                style="float: right; color: #8492a6; font-size: 13px;margin-left: 4px"
              >{{ item.alarmType}}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as executor from "@/api/job/jobExecutor";
import * as alarminfo from "@/api/job/alarmInfo";
import { isEmpty, praseValue,isNumber } from "@/utils/common";
import waves from "@/directive/waves"; // waves directive
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

export default {
  name: "Executor",
  components: { Pagination },
  directives: { waves },
  filters: {

  },
  data() {
    return {
      list: null,
      listLoading: true,
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 15,
        jobGroup: undefined,
        addressType: undefined,
        alarmStatus: undefined,
      },
      editJsonVisible: false,
      pluginData: [],
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      rules: {
        appName: [
          { required: true, message: "appName is required", trigger: "blur" },
          {
            min: 4,
            max: 64,
            message: "长度在 4 到 64 个字符",
            trigger: "blur",
          },
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" },
          {
            min: 4,
            max: 64,
            message: "长度在 4 到 64 个字符",
            trigger: "blur",
          },
        ],
        order: [
          { required: true, message: "order is required", trigger: "blur" },
        ],
        addressType: [
          {
            required: true,
            message: "addressType is required",
            trigger: "change",
          },
        ],
        alarmStatus: [
          {
            required: true,
            message: "alarmStatus is required",
            trigger: "blur",
          },
        ],
      },
      alarmList: [],
      temp: {
        id: undefined,
        appName: undefined,
        title: undefined,
        order: 1,
        addressType: 0,
        addressList: undefined,
        clientVersion: undefined,
        alarmStatus: 1,
        alarmIdArray: undefined,
      },
      resetTemp() {
        this.temp = this.$options.data().temp;
      },
      addressTypeList: [
        { value: 0, label: "自动注册",type:"success"},
        { value: 1, label: "手动录入",type:"" },
      ],
      alarmStatusList: [
        { value: 1, label: "开启",type:"success" },
        { value: 0, label: "关闭",type:"info" },
      ],
      jobList: {
        timeout: "",
        jobGroupItems: [],
      },
    };
  },
  created() {
    this.handleQuery();
  },
  methods: {
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    initQueryAlarmName() {
      if (this.alarmList.length > 5) {
        return;
      }
      let queryString = "";
      this.loading = true;
      clearTimeout(this.timeout);
      setTimeout(() => {
        this.loading = false;
        alarminfo.querySearch(queryString).then((response) => {
          for (let i of response.data) {
            i.label = i.alarmName;
          }
          this.alarmList = response.data;
        });
      }, 100 * Math.random());
    },
    remoteQueryAlarmMethod(queryString) {
      queryString = queryString ? queryString.trim() : "";
      this.loading = true;
      clearTimeout(this.timeout);
      setTimeout(() => {
        this.loading = false;
        alarminfo.querySearch(queryString).then((response) => {
          for (let i of response.data) {
            i.label = i.alarmName;
          }
          let list = response.data;
          this.alarmList = list.filter((item) => {
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
    handleQuery() {
      this.listLoading = true;
      const param = Object.assign({}, this.queryParams);
       const urlJobGroup = this.$route.query.jobGroup;
      if (isNumber(urlJobGroup)&& !param.jobGroup) {
         param.jobGroup=parseInt(urlJobGroup);
      } 
      executor.getPageList(param).then((response) => {
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
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      const tempData = Object.assign({}, this.temp);
      if (tempData.addressType != "1") {
          tempData.addressList = "";
      }
      if (tempData.alarmStatus == "1") {
        tempData.alarmIds = tempData.alarmIds.toString();
      }else{
        tempData.alarmIds=","
      }
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          executor.created(tempData).then(() => {
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      if (this.temp.alarmStatus == "1") {
        alarminfo.queryIds(this.temp.alarmIds).then((response) => {
          for (let i of response.data) {
            i.label = i.alarmName;
          }
          this.alarmList = response.data;
        });
      let alarmIdArray = this.temp.alarmIds.split(",");
      for (let i = 0; i < alarmIdArray.length; i++) {
        alarmIdArray[i] = parseInt(alarmIdArray[i]);
      }
      this.temp.alarmIds = alarmIdArray; 
      }
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      const tempData = Object.assign({}, this.temp);
      if (tempData.addressType != "1") {
        tempData.addressList = "";
      }
      if (tempData.alarmStatus == "1") {
          tempData.alarmIds = tempData.alarmIds.toString();
      }else{
        tempData.alarmIds=","
      }
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          executor.updated(tempData).then(() => {
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
    handleDelete(row) {
   this.$confirm("确定删除【" + row.appName + "】吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
      executor.deleted(row.id).then((response) => {
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
    handleFetchPv(id) {
      executor.fetch(id).then((response) => {
        this.pluginData = response;
        this.dialogPvVisible = true;
      });
    },
  },
};
</script>

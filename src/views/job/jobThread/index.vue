<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
        <el-form-item label="机器地址" prop="address">
          <el-input
            v-model="queryParams.address"
            placeholder="请输入机器地址"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="线程类型" prop="threadType">
          <el-select
            v-model="queryParams.threadType"
            placeholder="请选择线程类型"
             @change="handleQuery"
            clearable
            filterable
            size="small"
          >
            <el-option
              v-for="item in threadTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />  
          </el-select>
        </el-form-item>
        <el-form-item label="线程状态" prop="threadStatus">
          <el-select
            v-model="queryParams.threadStatus"
            placeholder="请选择状态"
            @change="handleQuery"
            clearable
            filterable
            size="small"
          >
            <el-option
              v-for="item in threadStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="cyan" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleAdd"
            v-hasPermi="['job:JobThread:add']"
          >新增</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table v-loading="loading" :data="JobThreadList" @selection-change="handleSelectionChange"    
      fit
      highlight-current-row
      style="width: 100%"
      size="small">
      <el-table-column label="id" align="center" width="100" prop="id" fixed />
      <el-table-column label="机器地址" align="center" min-width="120" prop="address" />
      <el-table-column label="机器名称" align="center" min-width="120" prop="hostName" />
      <el-table-column label="线程类型" align="center" prop="threadType">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.threadType|statusFilter(threadTypeList)"
          >{{parseCodeToLabel(threadTypeList,scope.row.threadType)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="线程状态" align="center" prop="threadStatus">
        <template slot-scope="scope">
            <el-switch
              v-model="scope.row.threadStatus"
              class="show_switch_text"
              active-color="#00A854"
              :active-value="1"
              :active-text="parseCodeToLabel(threadStatusList,scope.row.threadStatus)"
              inactive-color="#F04134"
              :inactive-value="0"
              :inactive-text="parseCodeToLabel(threadStatusList,scope.row.threadStatus)"
              :disabled="!checkPermi(['job:JobThread:changeStatus'])"
              @change="changeSwitch(scope.row)"
            />
        </template>
      </el-table-column>
      <el-table-column label="最近在线时间" align="center" prop="gmtCreate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastOnlineTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center" prop="updateBy"/>
      <el-table-column label="创建时间" align="center" prop="gmtCreate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.gmtCreate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="gmtModified" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.gmtModified, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="100" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            plain
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['job:JobThread:remove']"
          >删除</el-button>
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

    <!-- 添加或修改任务调度对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="机器地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入机器地址:端口" />
        </el-form-item>
        <el-form-item label="线程类型" prop="threadType">
          <el-select v-model="form.threadType" placeholder="请选择线程类型">
              <el-option
              v-for="item in threadTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="线程状态" prop="threadStatus">
           <el-select v-model="form.threadStatus" placeholder="请选择线程类型">  
              <el-option
              v-for="item in threadStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listJobThread,
  getJobThread,
  delJobThread,
  addJobThread,
  updateJobThread,
  exportJobThread,
  changeStatus,
} from "@/api/job/jobThread";
import { checkPermi, checkRole } from "@/utils/permission";

export default {
  name: "JobThread",
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
      // 任务调度表格数据
      JobThreadList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 15,
        address: null,
        threadType: null,
        threadStatus: null,
      },
      threadStatusList: [
        { value: 0, label: "关闭", type: "danger" },
        { value: 1, label: "开启", type: "success" },
      ],
      threadTypeList: [
        { value: 0, label: "客户端注册心跳线程", type: "success" },
        { value: 1, label: "任务调度线程", type: "" },
        { value: 2, label: "任务失败检查线程", type: "warning" },
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        address: [
          {
            required: true,
            message: "机器地址不能为空",
            trigger: "blur",
          },
        ],
        threadType: [
          {
            required: true,
            message: "线程类型不能为空",
            trigger: "blur",
          },
        ], 
        threadStatus: [
          {
            required: true,
            message: "线程状态不能为空",
            trigger: "blur",
          },
        ], 
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    checkPermi,
    checkRole,
    /** 查询任务调度列表 */
    getList() {
      this.loading = true;
      listJobThread(this.queryParams).then((response) => {
        this.JobThreadList = response.data.list;
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
        address: null,
        threadType: null,
        threadStatus: null,
        updateBy: null,
        updateTime: null,
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
      this.open = true;
      this.title = "添加线程任务";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getJobThread(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改任务调度";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateJobThread(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addJobThread(this.form).then((response) => {
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
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(
        '是否确认删除任务调度编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delJobThread(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function () {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有任务调度数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportJobThread(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        })
        .catch(function () {});
    },
    handleChangeStatus(row,status){
        changeStatus(row.id,status).then((response) => {
          this.$notify({
            title: "Success",
            message: "Successfully",
            type: "success",
            duration: 2000,
          });
        });
    },
    changeSwitch(row) {
     let text = this.parseCodeToLabel(this.threadStatusList,row.threadStatus);
      this.$confirm('确认要"' + text + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return this.handleChangeStatus(row, row.threadStatus)
        })
        .catch(function () {
          row.threadStatus = row.threadStatus === 0 ? 1 : 0;
        });
    },
  },
};
</script>

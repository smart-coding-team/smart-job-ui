<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="12" :offset="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>OpenLdap配置</span>
            <el-button
              v-if="disableForm"
              size="small"
              style="float: right"
              type="cyan"
              icon="el-icon-edit"
              @click="openUpdate"
              >编辑</el-button
            >
            <el-button
              v-else
              size="small"
              style="float: right"
              icon="el-icon-close"
              @click="closeUpdate"
              >取消</el-button
            >
          </div>
          <el-form
            :model="ldapConfig"
            ref="queryForm"
            v-show="showSearch"
            label-width="140px"
            :rules="rules"
            :disabled="disableForm"
          >
            <el-form-item label="Ldap设置状态" prop="enabled">
              <el-switch
              v-model="ldapConfig.enabled"
              class="show_switch_text show_switch_text_form"
              active-color="#00A854"
              :active-value="true"
              active-text="开启"
              inactive-color="#F04134"
              :inactive-value="false"
              inactive-text="关闭"
            />
            </el-form-item>
            <el-form-item  label="主机名" prop="urls">
              <el-input
               :disabled="!ldapConfig.enabled"
                v-model="ldapConfig.urls"
                placeholder="请输入主机名:端口号"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="是否使用SSL"
              prop="enableSsl"
            >
              <el-radio-group :disabled="!ldapConfig.enabled" v-model="ldapConfig.enableSsl">
                <el-radio :label="false">禁用</el-radio>
                <el-radio :label="true">开启</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item  label="base" prop="base">
              <el-input
               :disabled="!ldapConfig.enabled"
                v-model="ldapConfig.base"
                placeholder="请输入base 例如dc=example,dc=com"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="dn"
              prop="userDnPatterns"
            >
              <el-input
               :disabled="!ldapConfig.enabled"
                v-model="ldapConfig.userDnPatterns"
                placeholder="请输入dn例如:uid={},ou=people或cn={},ou=people"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="管理员账号"
              prop="managerDn"
            >
              <el-input
               :disabled="!ldapConfig.enabled"
                v-model="ldapConfig.managerDn"
                placeholder="请输入管理员账号"
                clearable
              />
            </el-form-item>
            <el-form-item
              
              label="管理员密码"
              prop="managerPassword"
            >
              <el-input
                type="password"
                :disabled="!ldapConfig.enabled"
                v-model="ldapConfig.managerPassword"
                placeholder="请输入管理员密码"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="属性:邮箱"
              prop="attributesMail"
            >
              <el-input
               :disabled="!ldapConfig.enabled"
                v-model="ldapConfig.attributesMail"
                placeholder="请输入邮箱属性"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="属性:手机号码"
              prop="attributesTelephone"
            >
              <el-input
               :disabled="!ldapConfig.enabled"
                v-model="ldapConfig.attributesTelephone"
                placeholder="请输入手机号码属性"
                clearable
              />
            </el-form-item>
            <el-form-item  label="备注" prop="remark">
              <el-input
               :disabled="!ldapConfig.enabled"
                v-model="ldapConfig.remark"
                placeholder="请输入备注"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="cyan"
                size="small"
                @click="handleSave"
                >保存</el-button
              >
              <el-button  size="small" @click="resetQuery"
                >重置</el-button
              >
              <!-- <el-button
                :disabled="!ldapConfig.enabled"
                type="cyan"
                size="small"
                @click="testLdap"
                >Ldap测试</el-button
              > -->
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as sysSetting from "@/api/system/setting";

export default {
  name: "Dict",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      disableForm: true,
      // 总条数
      total: 0,
      // 是否显示弹出层
      open: false,
      // 查询参数
      ldapConfig: {},
      defaultDdapConfig: {
        enabled: true,
        enableSsl: false,
        urls: "ldap://127.0.0.1:389",
        base: "dc=example,dc=com",
        managerDn: "cn=admin,dc=example,dc=com",
        managerPassword: "123456",
        userDnPatterns: "uid={},ou=people",
        attributesMail: "mail",
        attributesTelephone: "telephone",
      },
      // 表单校验
      rules: {
        urls: [
          { required: true, message: "主机名称不能为空", trigger: "blur" },
        ],
        base: [{ required: true, message: "base不能为空", trigger: "blur" }],
        dn: [{ required: true, message: "dn不能为空", trigger: "blur" }],
        managerDn: [
          { required: true, message: "管理员账号不能为空", trigger: "blur" },
        ],
        managerPassword: [
          { required: true, message: "管理员密码不能为空", trigger: "blur" },
        ],
        enabled: [
          { required: true, message: "开启或关闭不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.loadLdapConfig();
  },
  methods: {
    loadLdapConfig() {
      this.loading = true;
      sysSetting.getLdapInfo().then((response) => {
        this.ldapConfig = response.data;
        this.loading = false;
      });
    },
    openUpdate() {
      this.disableForm = false;
    },
    closeUpdate() {
      this.disableForm = true;
      this.loadLdapConfig();
    },
    testLdap() {
      this.loading = true;
      sysSetting.testLdap(this.ldapConfig).then((response) => {
        if (response.code === 200) {
          this.msgSuccess("测试成功");
        }
        this.loading = false;
      });
    },
    handleSave() {
      this.$refs["queryForm"].validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.ldapConfig.id == undefined) {
            sysSetting.addLdapInfo(this.ldapConfig).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.loadLdapConfig();
                this.disableForm = true;
              }
              this.loading = false;
            });
          } else {
            sysSetting.updateLdapInfo(this.ldapConfig).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.loadLdapConfig();
                this.disableForm = true;
              }
              this.loading = false;
            });
          }
        }
      });
    },
    resetQuery() {
      this.ldapConfig = this.defaultDdapConfig;
    },
  },
};
</script>
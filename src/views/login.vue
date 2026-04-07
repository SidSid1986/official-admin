<template>
  <div class="login-container">
    <!-- 登录卡片 -->
    <el-card class="login-card">
      <template #header>
        <div class="login-header">
          <h2>后台管理系统</h2>
        </div>
      </template>

      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" label-width="80px">
        <el-form-item label="用户名" prop="username">

          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" clearable
            size="large"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">

          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" clearable
            show-password size="large"></el-input>
        </el-form-item>

        <!--   
        <el-form-item class="form-actions">
    
          <el-checkbox v-model="loginForm.remember" size="large">记住密码</el-checkbox>
          <el-link type="primary" @click="handleForgetPwd">忘记密码？</el-link>
        </el-form-item> -->

        <!-- 登录按钮 -->
        <el-form-item class="login-btn-group">
          <el-button type="primary" size="large" class="login-btn" @click="handleLogin" :loading="loginLoading">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>

import { ref, reactive, onMounted } from 'vue';

import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

import { encrypt, decrypt } from '@/utils/crypto.js';


const router = useRouter();


const loginFormRef = ref(null);

// 登录加载状态
const loginLoading = ref(false);

// 登录表单数据 
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

// 表单验证规则
const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
});

// 页面挂载时
onMounted(() => {
  initRememberInfo();
});

// 初始化记住的密码/用户名
const initRememberInfo = () => {
  const encryptUsername = localStorage.getItem('remember_username');
  const encryptPassword = localStorage.getItem('remember_password');
  if (encryptUsername && encryptPassword) {
    // 解密并填充
    loginForm.username = decrypt(encryptUsername);
    loginForm.password = decrypt(encryptPassword);
    loginForm.remember = true;
  }
};

// 登录处理核心逻辑
const handleLogin = async () => {
  // 表单验证
  try {
    await loginFormRef.value.validate();
    loginLoading.value = true;

    //  构造请求参数（密码加密）
    const loginParams = {
      username: loginForm.username,
      password: encrypt(loginForm.password) // 前端加密密码，后端解密验证
    };

    // 模拟请求 
    //  axios.post('/api/login', loginParams).then(res => { ... })
    setTimeout(() => {
      // 模拟 Python 后端返回的 Token 数据（JWT 格式）
      const response = {
        code: 200,
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzE4NTAwMDAwfQ',
          username: loginForm.username,
          expireTime: new Date().getTime() + 86400 * 1000 // 24 小时过期
        },
        msg: '登录成功'
      };

      // 登录成功：加密存储 Token 等信息
      if (response.code === 200) {
        // 加密存储核心信息
        localStorage.setItem('token', encrypt(response.data.token));
        localStorage.setItem('username', encrypt(response.data.username));
        localStorage.setItem('expireTime', encrypt(response.data.expireTime.toString()));

        // 处理记住密码（仅用户勾选时存储）
        if (loginForm.remember) {
          localStorage.setItem('remember_username', encrypt(loginForm.username));
          localStorage.setItem('remember_password', encrypt(loginForm.password));
        } else {
          // 未勾选：清除记住的密码
          localStorage.removeItem('remember_username');
          localStorage.removeItem('remember_password');
        }

        //   提示并跳转首页
        ElMessage.success(response.msg);
        router.push('/');  
      } else {
        ElMessage.error(response.msg || '登录失败');
      }

      loginLoading.value = false;
    }, 1000);

  } catch (error) {
    ElMessage.error('请填写正确的登录信息！');
    console.error('表单验证失败：', error);
    loginLoading.value = false;
  }
};

// 忘记密码（占位方法）
const handleForgetPwd = () => {
  ElMessage.info('请联系管理员重置密码！');
};
</script>

<style scoped lang="scss">
.login-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
}


.login-card {
  // border: 1px solid red;
  width: 500px;
  min-width: 360px;
  flex-shrink: 0;
  max-width: 90%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #fff;
  font-size: 16px;
}

/* 登录头部 */
.login-header {
  // border: 1px solid red;
  text-align: center;
  padding-bottom: 10px;
}

.login-header h2 {
  margin: 0;
  color: #1989fa;
  font-size: 36px;
  font-weight: 600;
}

.login-header p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}


.login-form {
  padding: 40px 30px;
  --el-form-label-text-color: #333;
  --el-form-label-font-size: 16px;
}


.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 16px;
}

/* 登录按钮组 */
.login-btn-group {
  // border:1px solid red;
  margin: 0;
  margin-top: 20px;
}

.login-btn {
  width: 100%;
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  --el-button-padding: 0 20px;
}


:deep(.el-input__placeholder) {
  font-size: 16px;
}


:deep(.el-input__inner) {
  font-size: 16px;

  height: 50px;
  line-height: 50px;
}

:deep(.el-form-item) {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">登录</h2>
      <form @submit.prevent="login" class="auth-form">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input v-model="userName" type="text" id="username" class="form-input" placeholder="请输入用户名" required>
        </div>
        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input v-model="password" type="password" id="password" class="form-input" placeholder="请输入密码" required>
        </div>
        <div class="form-group captcha-group">
          <label for="code" class="form-label">验证码</label>
          <div class="captcha-container">
            <input v-model="code" type="text" id="code" class="form-input captcha-input" placeholder="请输入验证码" required>
            <img class="captcha-image" @click="refreshCaptcha" :src="captchaUrl" alt="验证码">
          </div>
        </div>
        <button type="submit" class="auth-btn">登录</button>
      </form>
      <div class="auth-switch">
        还没有账号？<RouterLink to="/register" class="switch-link">立即注册</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { userLogin } from '../api/User';
import { useUserStore } from '../store/useUser';
import { RouterLink } from 'vue-router';
import { getKaptcha } from '../api/File';
import { useToast } from 'vue-toastification';


const toast = useToast()
let userName = ref('')
let password = ref('')
let code = ref('')
let captchaUrl = ref()
const store = useUserStore()


onMounted(async () => {
  const response = await getKaptcha()
  store.redisKey = response.headers['rediskey']
  captchaUrl.value = response.data.data;
})

function refreshCaptcha() {
  getKaptcha().then(response => {
    captchaUrl.value = response.data.data;
    store.redisKey = response.headers['rediskey']
  });
}

const emit = defineEmits(['refresh'])

const refreshParent = () => {
  emit('refresh') // 触发刷新事件
}

async function login() {
  if (userName.value == '' || password.value == '' || code.value == '') {
    toast.warning("请信息填写完成后再登陆哦！")
  } else {
    const response = await userLogin(userName.value, password.value, code.value)
    const store = useUserStore()
    if (response.data.code == 200) {
      store.token = response.data.data.token
      refreshParent()
    } else {
      toast.warning(response.data.message)
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #f8f9fa 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(173, 216, 230, 0.2);
  padding: 30px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.auth-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
    margin: 10px;
  }
}

.auth-title {
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 15px;
}

.auth-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #409eff 0%, #66b2ff 100%);
  border-radius: 3px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.captcha-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 45px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #e1e5e9;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.captcha-image:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.auth-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #409eff 0%, #66b2ff 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  margin-top: 10px;
}

.auth-btn:hover {
  background: linear-gradient(135deg, #337ecc 0%, #4d94cc 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.auth-btn:active {
  transform: translateY(-1px);
}

.auth-form {
  margin-bottom: 20px;
}

.register-link {
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.register-link a:hover {
  text-decoration: underline;
  color: #337ecc;
}
</style>
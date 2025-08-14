<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">注册</h2>
      <form @submit.prevent="register" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <input v-model="username" type="text" id="username" class="form-input" placeholder="请输入用户名" required>
          </div>
          <div class="form-group">
            <label for="email" class="form-label">邮箱</label>
            <input v-model="email" type="email" id="email" class="form-input" placeholder="请输入邮箱" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <input v-model="password" type="password" id="password" class="form-input" placeholder="请输入密码" required>
          </div>
          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认密码</label>
            <input v-model="passwordT" type="password" id="confirmPassword" class="form-input" placeholder="请确认密码" required>
          </div>
        </div>
        <div class="form-group captcha-group">
          <label for="code" class="form-label">验证码</label>
          <div class="captcha-container">
            <input v-model="code" type="text" id="code" class="form-input captcha-input" placeholder="请输入验证码" required>
            <img class="captcha-image" @click="refreshCaptcha" :src="captchaUrl" alt="验证码">
          </div>
        </div>
        <button type="submit" class="auth-btn">注册</button>
      </form>
      <div class="auth-switch">
        已有账号？<RouterLink to="/login" class="switch-link">立即登录</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { userRegister } from '../api/User';
import { useRouter } from 'vue-router';
import { getKaptcha } from '../api/File';
import { useUserStore } from '../store/useUser';
import { useToast } from 'vue-toastification';

const toast = useToast()
let username = ref('')
let email = ref('')
let password = ref('')
let passwordT = ref('')
let code = ref('')
const router = useRouter()
let captchaUrl = ref('')
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

async function register() {
  if (!validateEnglishText(username.value)) {
    toast.warning("用户名请用英文哦！")
    return
  }
  if (!validateEmail(email.value)) {
    toast.warning("请填写正确的邮箱！")
    return
  }
  if (username.value == '' || email.value == '') {
    toast.warning("请信息填写完成后再登录哦！")
    return
  }
  if (password.value == '' || passwordT.value == '' || password.value != passwordT.value) {
    toast.warning("请确认两次密码输入正确哦！")
    return
  }
  if (code.value == '') {
    toast.warning("请输入验证码哦！")
    return
  }
  const response = await userRegister(username.value, password.value, email.value, code.value)
  if (response.data.code == 200) {
    confirm("注册成功！")
    router.replace('/login')
  } else {
    confirm(response.data.message)
  }
}

function validateEmail(email:string) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
function validateEnglishText(username:string) {
  const regex = /^[a-zA-Z]+$/;
  return regex.test(username);
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
  max-width: 600px;
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
  
  .form-row {
    flex-direction: column;
    gap: 0;
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

/* 横向布局样式 */
.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 20px;
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

.login-link {
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-link a:hover {
  text-decoration: underline;
  color: #337ecc;
}
</style>
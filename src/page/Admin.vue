<template>
  <div class="admin-container">
    <div class="admin-content" v-if="isAdmin">
      <div class="admin-tabs">
        <button 
          :class="['tab-button', { active: activeTab === 'files' }]"
          @click="onTabChange('files')"
        >
          文件管理
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'users' }]"
          @click="onTabChange('users')"
        >
          用户管理
        </button>
      </div>
      
      <!-- 文件管理组件 -->
      <div v-if="activeTab === 'files'" class="tab-content">
        <h2>文件管理</h2>
        <div class="file-management">
          <div class="file-filters">
            <div class="filter-buttons">
              <button 
                :class="['filter-button', { active: fileFilterStatus === 'all' }]"
                @click="filterFilesByStatus('all')"
              >
                全部文件
              </button>
              <button 
                :class="['filter-button', { active: fileFilterStatus === 'audited' }]"
                @click="filterFilesByStatus('audited')"
              >
                已审核
              </button>
              <button 
                :class="['filter-button', { active: fileFilterStatus === 'unaudited' }]"
                @click="filterFilesByStatus('unaudited')"
              >
                未审核
              </button>
            </div>
          </div>
          <div class="search-bar">
            <input 
              v-model="fileSearchQuery" 
              placeholder="搜索文件名..." 
              class="search-input"
              @keyup.enter="searchFiles"
            />
            <button @click="searchFiles" class="search-button">搜索</button>
            <button @click="resetFileSearch" class="reset-button">重置</button>
          </div>
          
          <div class="file-list">
            <div 
              v-for="file in fileList" 
              :key="file.id" 
              class="file-item"
            >
              <div class="file-info">
                <div class="file-name">{{ file.fileTitle }}</div>
                <div class="file-meta">
                  <span>上传者: {{ file.uploader }}</span>
                  <span>上传时间: {{ formatDate(file.uploadTime) }}</span>
                  <span>大小: {{ formatFileSize(file.fileSize) }}</span>
                  <span>审核状态: {{ file.status == '已审核' ? '已审核' : '未审核' }}</span>
                </div>
              </div>
              <div class="file-actions">
                <button 
                  @click="openPreview(file)" 
                  class="action-button preview-button"
                >
                  预览
                </button>
                <button 
                  @click="auditFile(file)" 
                  class="action-button audit-button"
                >
                  审核
                </button>
                <button 
                  @click="deleteFile(file)" 
                  class="action-button delete-button"
                >
                  删除
                </button>
              </div>
            </div>
            
            <div v-if="fileList.length === 0" class="no-files">
              暂无文件数据
            </div>
          </div>
          
          <div class="pagination" v-if="fileList.length > 0">
            <button 
              @click="prevFilePage" 
              :disabled="fileCurrentPage === 1"
              class="page-button"
            >
              上一页
            </button>
            <span class="page-info">
              第 {{ fileCurrentPage }} 页，共 {{ Math.ceil(fileTotal / filePageSize) }} 页
            </span>
            <button 
              @click="nextFilePage" 
              :disabled="fileCurrentPage >= Math.ceil(fileTotal / filePageSize)"
              class="page-button"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
      
      <!-- 文件预览模态框 -->
      <div class="modal-overlay" :class="{ 'show': showPreview }" @click="closePreview">
        <div class="modal-content" @click.stop>
          <button class="close-btn" @click="closePreview">&times;</button>
          <img v-lazy="currentFile.fileUrl" :alt="currentFile.fileTitle" class="preview-img" />
        </div>
      </div>
    
    <!-- 用户管理组件 -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <h2>用户管理</h2>
        <div class="user-management">
          <div class="search-bar">
            <input 
              v-model="userSearchQuery" 
              placeholder="搜索用户名..." 
              class="search-input"
              @keyup.enter="searchUsers"
            />
            <button @click="searchUsers" class="search-button">搜索</button>
            <button @click="resetUserSearch" class="reset-button">重置</button>
          </div>
          
          <div class="user-list">
            <div 
              v-for="user in userList" 
              :key="user.id" 
              class="user-item"
            >
              <div class="user-info">
                <div class="user-name">{{ user.username }}
                  <span class="user-status" :class="{ 'enabled': user.enabled, 'disabled': !user.enabled }">
                    {{ user.enabled ? '正常' : '已禁用' }}
                  </span>
                </div>
                <div class="user-meta">
                  <span>邮箱: {{ user.email }}</span>
                  <span>角色: {{ user.role }}</span>
                  <span>注册时间: {{ formatDate(user.registerTime) }}</span>
                </div>
              </div>
              <div class="user-actions">
                <button 
                  v-if="user.role !== 'superAdmin'" 
                  @click="changeUserRole(user)" 
                  class="action-button role-button"
                >
                  {{ user.role === 'user' ? '设为管理员' : '设为普通用户' }}
                </button>
                <button 
                  v-if="user.role !== 'superAdmin'" 
                  @click="toggleUserStatus(user)" 
                  class="action-button delete-button"
                  :class="{ 'disabled-button': user.enabled, 'enable-button': !user.enabled }"
                >
                  {{ user.enabled ? '禁用' : '启用' }}
                </button>
                <span v-else class="admin-label">超级管理员</span>
              </div>
            </div>
            
            <div v-if="userList.length === 0" class="no-users">
              暂无用户数据
            </div>
          </div>
          
          <div class="pagination" v-if="userList.length > 0">
            <button 
              @click="prevUserPage" 
              :disabled="userCurrentPage === 1"
              class="page-button"
            >
              上一页
            </button>
            <span class="page-info">
              第 {{ userCurrentPage }} 页，共 {{ Math.ceil(userTotal / userPageSize) }} 页
            </span>
            <button 
              @click="nextUserPage" 
              :disabled="userCurrentPage >= Math.ceil(userTotal / userPageSize)"
              class="page-button"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="loading" v-if="loading">
      <div class="loading-spinner"></div>
      <p>正在验证权限...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getUserInfo } from '../api/User';
import { useToast } from 'vue-toastification';
import { getImagesPageName } from '../api/File';
import { AdminPage } from '../api/Admin';
import { deleteWallpaper } from '../api/File';

const toast = useToast();
const router = useRouter();

const loading = ref(true);
const isAdmin = ref(false);
const activeTab = ref('files'); // 默认激活文件管理标签

// 文件管理相关状态
const fileList = ref();
const fileCurrentPage = ref(1);
const filePageSize = ref(6);
const fileTotal = ref(0);
const fileSearchQuery = ref('');
const fileFilterStatus = ref('all'); // 'all', 'audited', 'unaudited'

// 用户管理相关状态
const userList = ref();
const userCurrentPage = ref(1);
const userPageSize = ref(10);
const userTotal = ref(0);
const userSearchQuery = ref('');

// 预览状态
const showPreview = ref(false);
const currentFile = ref({
  fileId: '',
  fileUrl: '',
  fileTitle: '',
  fileName: ''
});

// 打开预览
const openPreview = (file: any) => {
  console.log('打开预览:', file);
  currentFile.value = {...file}; // 创建副本以避免引用问题
  showPreview.value = true;
  document.body.style.overflow = 'hidden';
};

// 关闭预览
const closePreview = () => {
  console.log('关闭预览');
  showPreview.value = false;
  // 重置当前文件信息
  currentFile.value = {
    fileId: '',
    fileUrl: '',
    fileTitle: '',
    fileName: ''
  };
  document.body.style.overflow = 'auto';
};

onMounted(() => {
  checkAdminPermission().then(() => {
    if (isAdmin.value) {
      loadFiles();
      loadUsers(); // 如果有用户管理API，可以在这里加载用户数据
    }
  });
});

// 监听标签页切换
function onTabChange(tab:any) {
  if (tab === 'files') {
    loadFiles();
  } else if (tab === 'users') {
    loadUsers();
  }
  activeTab.value = tab;
}

// 按审核状态过滤文件
function filterFilesByStatus(status:any) {
  fileFilterStatus.value = status;
  fileCurrentPage.value = 1;
  loadFiles();
}

// 加载文件列表
async function loadFiles() {
  try {
    let response;
    // 根据搜索查询和审核状态加载文件
    if (fileSearchQuery.value) {
      response = await getImagesPageName(fileCurrentPage.value, filePageSize.value, fileSearchQuery.value);
    } else {
      response = await AdminPage(fileCurrentPage.value, filePageSize.value);
    }
    
    if (response.data.code === 200) {
      // 如果后端API支持按审核状态筛选，这里需要修改
      // 目前我们先在前端进行筛选
      let files = response.data.data.records;
      
      // 根据审核状态筛选文件
      if (fileFilterStatus.value === 'audited') {
        // 假设文件对象有audited属性，值为boolean
        files = files.filter((file:any) => file.status === '已审核');
      } else if (fileFilterStatus.value === 'unaudited') {
        files = files.filter((file:any) => file.status === '未审核');
      }
      
      fileList.value = files;
      fileTotal.value = files.length;
      // 与Home.vue保持一致，同时设置当前页和总页数
      fileCurrentPage.value = 1; // 由于是前端筛选，重置为第一页
      // fileTotalPages.value = response.data.data.pages; // 如果需要总页数可以添加这个
    } else {
      toast.error("获取文件列表失败");
    }
  } catch (error) {
    console.error('获取文件列表失败:', error);
    toast.error("获取文件列表失败");
  }
}

// 搜索文件
function searchFiles() {
  fileCurrentPage.value = 1;
  loadFiles();
}

// 重置文件搜索
function resetFileSearch() {
  fileSearchQuery.value = '';
  fileCurrentPage.value = 1;
  loadFiles();
}

// 上一页
function prevFilePage() {
  if (fileCurrentPage.value > 1) {
    fileCurrentPage.value--;
    loadFiles();
  }
}

// 下一页
function nextFilePage() {
  const totalPages = Math.ceil(fileTotal.value / filePageSize.value);
  if (fileCurrentPage.value < totalPages) {
    fileCurrentPage.value++;
    loadFiles();
  }
}

// 预览文件功能已移除

// 审核文件
import { updateFileAuditStatus } from '../api/File';

function auditFile(file:any) {
  // 实现文件审核逻辑
  // 调用后端API来更新文件的审核状态
  updateFileAuditStatus(file.fileId, !file.audited).then(response => {
    if (response.data.code === 200) {
      // 更新成功后，切换文件的审核状态
      file.audited = !file.audited;
      toast.info(`文件已${file.audited ? '通过审核' : '取消审核'}: ${file.fileTitle}`);
      
      // 重新加载当前筛选的文件列表
      loadFiles();
    } else {
      toast.error('审核状态更新失败');
    }
  }).catch(error => {
    console.error('审核状态更新失败:', error);
    toast.error('审核状态更新失败');
  });
}

// 删除文件
async function deleteFile(file:any) {
  // 实现文件删除逻辑
  try {
    const response = await deleteWallpaper(file.fileId)
  if (response.data.code === 200) {
      toast.success("删除成功");
      closePreview();
      // 刷新壁纸列表
      loadFiles()
    } else {
      toast.error("删除失败: " + response.data.message);
    }
  } catch (error) {
    console.error('删除壁纸失败:', error);
    toast.error("删除失败，请重试");
  }
}

// 格式化文件大小
function formatFileSize(bytes:any) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(dateString:any) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
}

// 加载用户列表（模拟数据）
async function loadUsers() {
  try {
    // 模拟用户数据
    const mockUsers = [
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'superAdmin', registerTime: '2023-01-01', enabled: true },
      { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', registerTime: '2023-02-01', enabled: true },
      { id: 3, username: 'user2', email: 'user2@example.com', role: 'user', registerTime: '2023-03-01', enabled: false }
    ];
    
    userList.value = mockUsers;
    userTotal.value = mockUsers.length;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    toast.error("获取用户列表失败");
  }
}

// 搜索用户
function searchUsers() {
  userCurrentPage.value = 1;
  loadUsers();
}

// 重置用户搜索
function resetUserSearch() {
  userSearchQuery.value = '';
  userCurrentPage.value = 1;
  loadUsers();
}

// 上一页
function prevUserPage() {
  if (userCurrentPage.value > 1) {
    userCurrentPage.value--;
    loadUsers();
  }
}

// 下一页
function nextUserPage() {
  const totalPages = Math.ceil(userTotal.value / userPageSize.value);
  if (userCurrentPage.value < totalPages) {
    userCurrentPage.value++;
    loadUsers();
  }
}

// 更改用户角色
function changeUserRole(user:any) {
  // 实现更改用户角色逻辑
  toast.info(`更改用户 ${user.username} 的角色`);
}

// 启用/禁用用户
function toggleUserStatus(user:any) {
  // 实现启用/禁用用户逻辑
  user.enabled = !user.enabled;
  toast.info(`${user.enabled ? '启用' : '禁用'}用户: ${user.username}`);
}

// 检查管理员权限
async function checkAdminPermission() {
  try {
    // 获取用户信息
    const response = await getUserInfo();
    
    // 检查是否有用户信息
    if (response.data.code === 200) {
      const userData = response.data.data;
      
      // 检查用户角色是否为admin
      if (userData.role && userData.role === 'superAdmin') {
        isAdmin.value = true;
      } else {
        toast.error("权限不足");
        router.push('/profile');
      }
    } else {
      // 用户未登录
      toast.warning("请先登录");
      router.push('/login');
    }
  } catch (error: any) {
    console.error('权限验证失败:', error);
    // 检查是否是401未授权错误
    if (error.response && error.response.status === 401) {
      toast.warning("请先登录");
      router.push('/login');
    } else {
      toast.warning("请先登录");
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 40px);
  border-radius: 16px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.admin-content {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 50%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), inset 0 0 20px rgba(173, 216, 230, 0.2);
  backdrop-filter: blur(10px);
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.admin-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  position: relative;
  border-bottom: 2px solid #f0f0f0;
}

.tab-button {
  padding: 12px 28px;
  border: none;
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  color: #495057;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-weight: 500;
  position: relative;
  z-index: 1;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.tab-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  background: linear-gradient(145deg, #f0f2f5, #e2e6ea);
}

.tab-button.active {
  background: linear-gradient(135deg, #42b983 0%, #359469 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 6px 15px rgba(66, 185, 131, 0.3);
  transform: translateY(-3px);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: #42b983;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(66, 185, 131, 0.5);
}

.tab-content {
  min-height: 400px;
  animation: fadeInContent 0.4s ease-out;
}

@keyframes fadeInContent {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.tab-content h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 26px;
  position: relative;
  padding-bottom: 15px;
  font-weight: 600;
}

.tab-content h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #42b983 0%, #359469 100%);
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.3);
}

.file-filters {
  margin-bottom: 25px;
}

.filter-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-button {
  padding: 10px 20px;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  color: #495057;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.filter-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(145deg, #e9ecef, #dde0e3);
  transition: width 0.4s ease;
  z-index: -1;
}

.filter-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
}

.filter-button:hover::before {
  width: 100%;
}

.filter-button.active {
  background: linear-gradient(135deg, #42b983 0%, #359469 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(66, 185, 131, 0.3);
  transform: translateY(-3px);
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px 18px;
  border: 2px solid #e9ecef;
  border-radius: 24px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.search-input:focus {
  border-color: #42b983;
  box-shadow: 0 5px 15px rgba(66, 185, 131, 0.2);
  transform: translateY(-2px);
}

.search-button, .reset-button {
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.search-button {
  background: linear-gradient(135deg, #42b983 0%, #359469 100%);
  color: white;
}

.search-button:hover {
  background: linear-gradient(135deg, #359469 0%, #2d7d57 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(53, 148, 105, 0.3);
}

.reset-button {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  color: #495057;
}

.reset-button:hover {
  background: linear-gradient(145deg, #e9ecef, #dde0e3);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.file-list, .user-list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  margin-bottom: 20px;
}

.file-item, .user-item {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  border: 1px solid #e9ecef;
  margin-bottom: 0;
}

.file-item::before, .user-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #42b983 0%, #359469 100%);
  transform: scaleX(0);
  transition: transform 0.4s ease;
  transform-origin: left;
}

.file-item:hover, .user-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.file-item:hover::before, .user-item:hover::before {
  transform: scaleX(1);
}

.file-info, .user-info {
  flex: 1;
  width: 100%;
}

.file-name, .user-name {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.file-meta, .user-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 15px;
  color: #495057;
  margin: 8px 0;
}

.file-actions, .user-actions {
  display: flex;
  gap: 12px;
  margin-top: 15px;
  width: 100%;
}

.action-button {
  padding: 10px 18px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.preview-button {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
}

.preview-button:hover {
  background: linear-gradient(135deg, #138496 0%, #117a8b 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(23, 162, 184, 0.3);
}

.audit-button {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
}

.audit-button:hover {
  background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(40, 167, 69, 0.3);
}

.delete-button {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.delete-button:hover {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(220, 53, 69, 0.3);
}

.role-button {
  background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
  color: white;
}

.role-button:hover {
  background: linear-gradient(135deg, #531dab 0%, #401b8a 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(114, 46, 209, 0.3);
}

.admin-label {
  color: #999;
  font-size: 13px;
}

.no-files, .no-users {
  text-align: center;
  padding: 40px;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 40px;
  padding: 25px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-button {
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  color: #495057;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  min-width: 50px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.page-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(145deg, #e9ecef, #dde0e3);
  transition: width 0.4s ease;
  z-index: -1;
}

.page-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.page-button:hover::before {
  width: 100%;
}

.page-button.active {
  background: linear-gradient(135deg, #42b983 0%, #359469 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.4);
  transform: translateY(-3px);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.page-button:disabled:hover {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: none;
}

.page-info {
  color: #666;
  font-size: 0.9rem;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(66, 185, 131, 0.2);
  border-top: 5px solid #42b983;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.5, 0.5, 0.5, 0.5) infinite;
  box-shadow: 0 0 20px rgba(66, 185, 131, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 添加弹性动画效果 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.page-button:hover {
  animation: bounce 0.6s ease;
}

/* 文件预览模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: overlayFadeIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 20px;
  padding: 25px;
  max-width: 95vw;
  max-height: 95vh;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.35);
  animation: modalFadeIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.8) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  color: #495057;
}

.close-btn:hover {
  background: linear-gradient(145deg, #e9ecef, #dde0e3);
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.preview-img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  animation: imageAppear 0.5s ease-out;
  border: 1px solid rgba(0, 0, 0, 0.05);
  object-fit: contain;
  margin-bottom: 20px;
}

@keyframes imageAppear {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* 添加发光效果 */
.modal-content::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #42b983, #17a2b8, #28a745, #42b983);
  border-radius: 22px;
  z-index: -1;
  animation: glow 3s linear infinite;
  background-size: 400% 400%;
}

@keyframes glow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 禁用按钮样式 */
.disabled-button {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d) !important;
}

.disabled-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(149, 165, 166, 0.4);
}

/* 启用按钮样式 */
.enable-button {
  background: linear-gradient(135deg, #27ae60, #2ecc71) !important;
}

.enable-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(39, 174, 96, 0.4);
}

/* 用户状态标签样式 */
.user-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 10px;
}

.user-status.enabled {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.user-status.disabled {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-container {
    padding: 15px;
    margin: 15px;
    border-radius: 12px;
  }
  
  .admin-content {
    padding: 25px;
    border-radius: 12px;
  }
  
  .admin-tabs {
    gap: 8px;
    padding-bottom: 12px;
  }
  
  .tab-button {
    padding: 12px 20px;
    font-size: 15px;
    border-radius: 10px;
  }
  
  .filter-buttons {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .filter-button {
    padding: 8px 16px;
    font-size: 13px;
    border-radius: 20px;
  }
  
  .search-bar {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 20px;
  }
  
  .search-button, .reset-button {
    padding: 12px 20px;
    font-size: 15px;
    border-radius: 20px;
    width: 100%;
  }
  
  .file-list, .user-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .file-item, .user-item {
    padding: 18px;
    border-radius: 14px;
  }
  
  .file-info h3, .user-info h3 {
    font-size: 17px;
  }
  
  .file-info p, .user-info p {
    font-size: 14px;
  }
  
  .file-actions, .user-actions {
    width: 100%;
    justify-content: center;
    gap: 10px;
  }
  
  .preview-btn, .audit-btn, .delete-btn, .ban-btn, .unban-btn {
    padding: 10px 16px;
    font-size: 13px;
    border-radius: 10px;
  }
  
  .pagination {
    padding: 20px;
    border-radius: 12px;
  }
  
  .page-button {
    padding: 10px 16px;
    font-size: 14px;
    min-width: 40px;
    border-radius: 10px;
  }
  
  .modal-content {
    margin: 15px;
    padding: 20px;
    border-radius: 16px;
  }
  
  .close-button {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .preview-image {
    max-height: 70vh;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .admin-container {
    padding: 10px;
    margin: 10px;
    border-radius: 10px;
  }
  
  .admin-content {
    padding: 20px;
    border-radius: 10px;
  }
  
  .admin-tabs {
    gap: 6px;
    padding-bottom: 10px;
  }
  
  .tab-button {
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 8px;
  }
  
  .filter-buttons {
    gap: 6px;
  }
  
  .filter-button {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 18px;
  }
  
  .search-input {
    padding: 10px 14px;
    font-size: 13px;
    border-radius: 18px;
  }
  
  .search-button, .reset-button {
    padding: 10px 16px;
    font-size: 13px;
    border-radius: 18px;
  }
  
  .file-item, .user-item {
    padding: 15px;
    border-radius: 12px;
  }
  
  .file-info h3, .user-info h3 {
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .file-info p, .user-info p {
    font-size: 13px;
    margin: 6px 0;
  }
  
  .file-actions, .user-actions {
    gap: 8px;
  }
  
  .preview-btn, .audit-btn, .delete-btn, .ban-btn, .unban-btn {
    padding: 8px 14px;
    font-size: 12px;
    border-radius: 8px;
  }
  
  .pagination {
    padding: 15px;
    gap: 8px;
  }
  
  .page-button {
    padding: 8px 14px;
    font-size: 13px;
    min-width: 35px;
    border-radius: 8px;
  }
  
  .modal-content {
    margin: 10px;
    padding: 15px;
    border-radius: 14px;
  }
  
  .close-button {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .preview-image {
    max-height: 50vh;
    border-radius: 10px;
  }
}
</style>
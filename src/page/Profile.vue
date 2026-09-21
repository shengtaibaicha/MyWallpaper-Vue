<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="header-content">
        <div class="avatar-container">
          <img :src="userAvatar" alt="用户头像" class="avatar">
          <button class="change-avatar-btn">更换头像</button>
        </div>
        <div class="user-info">
          <h2 class="username">{{ username }}</h2>
          <p class="user-email">{{ email }}</p>
          <p class="join-date">注册时间: {{ joinDate }}</p>
        </div>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </div>

    <div class="profile-stats">
      <div class="stat-card">
        <div class="stat-icon">📤</div>
        <div class="stat-info">
          <p class="stat-value">{{ uploadedCount }}</p>
          <p class="stat-label">已上传壁纸</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❤️</div>
        <div class="stat-info">
          <p class="stat-value">{{ likedCount }}</p>
          <p class="stat-label">收藏壁纸</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📥</div>
        <div class="stat-info">
          <p class="stat-value">{{ downloadCount }}</p>
          <p class="stat-label">下载次数</p>
        </div>
      </div>
    </div>

    <div class="uploaded-wallpapers">
      <div class="section-header">
        <h3 class="section-title">我上传的壁纸</h3>
        <div class="section-controls">
          <span class="wallpaper-count">共 {{ uploadedCount }} 张壁纸</span>
        </div>
      </div>
      <div class="wallpaper-grid">
        <div v-for="wallpaper in userWallpapers" :key="wallpaper.fileId" class="wallpaper-card" @click="openPreview(wallpaper)">
          <div class="wallpaper-image-container">
            <img v-lazy="wallpaper.fileUrl" :alt="wallpaper.fileTitle" class="wallpaper-img" />
          </div>
          <div class="wallpaper-info">
            <div class="wallpaper-title">{{ wallpaper.fileTitle }}</div>
            <div class="wallpaper-meta">
              <span class="upload-date">{{ formatDate(wallpaper.uploadTime) }}</span>
              <div class="upload-date">{{ wallpaper.status }}</div>
            </div>
          </div>
          <div class="wallpaper-actions">
            <button @click.stop="openPreview(wallpaper)" class="action-btn edit-btn">查看/编辑</button>
          </div>
        </div>
      </div>

      <!-- 无数据提示 -->
      <div v-if="userWallpapers.length === 0 && !loading" class="no-data">
        <div class="no-data-icon">🖼️</div>
        <p>暂无上传的壁纸</p>
        <p class="no-data-subtext">快去上传一些精美的壁纸吧！</p>
      </div>

      <!-- 加载中提示 -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 分页控件 -->
      <div class="pagination" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
          <span v-if="currentPage === 1">上一页</span>
          <span v-else>上一页</span>
        </button>
        <div class="page-numbers">
          <button 
            v-for="page in getPageNumbers()" 
            :key="page" 
            @click="goToPage(page)" 
            :class="['page-btn', { 'active': page === currentPage }]"
            :disabled="page === '...'">
            {{ page }}
          </button>
        </div>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">
          <span v-if="currentPage === totalPages">下一页</span>
          <span v-else>下一页</span>
        </button>
      </div>
    </div>

    <!-- 预览模态框 -->
    <div v-if="showPreview" class="modal-overlay" @click="closePreview">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closePreview">&times;</button>
        <img v-lazy="currentWallpaper.fileUrl" :alt="currentWallpaper.fileTitle" class="preview-img" />
        <div class="preview-controls">
          <el-button @click="handleDeleteWallpaper(currentWallpaper.fileId)" type="danger" round>删除壁纸</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElButton } from 'element-plus';
import { useRouter } from 'vue-router';
import { getUserWallpapers, deleteWallpaper } from '../api/File';
import { getUserInfo } from '../api/User';
import { useToast } from 'vue-toastification';
import { useUserStore } from '../store/useUser';

const toast = useToast()
const loading = ref(false);
const userAvatar = ref('https://picsum.photos/200/200'); // 默认头像
const username = ref('用户名');
const email = ref('user@example.com');
const joinDate = ref('2023-01-01');
const uploadedCount = ref(0);
const likedCount = ref(0);
const downloadCount = ref(0);
const userWallpapers = ref<any[]>([]);
const router = useRouter();
const userStore = useUserStore();

// 分页状态
const currentPage = ref(1);
const pageSize = ref(4);
const totalPages = ref(0);

// 预览状态
const showPreview = ref(false);
const currentWallpaper = ref<any>({});

onMounted(() => {
  fetchUserInfo();
  fetchUserWallpapers(currentPage.value, pageSize.value);
});

// 格式化日期
function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// 获取用户信息
async function fetchUserInfo() {
  try {
    const response = await getUserInfo();
    if (response.data.code === 200) {
      const userData = response.data.data;
      username.value = userData.userName || '用户名';
      email.value = userData.userEmail || 'user@example.com';
      joinDate.value = formatDate(userData.joinDate) || '2023-01-01';
      uploadedCount.value = userData.uploadNumber || 0;
      likedCount.value = userData.collectNumber || 0;
      downloadCount.value = userData.downloadNumber || 0;
      userAvatar.value = userData.userAvatar || 'https://picsum.photos/200/200';
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 处理未登录情况
    toast.warning("请先登录");
    router.push('/login');
  }
}

// 获取用户上传的壁纸
async function fetchUserWallpapers(page: number, size: number) {
  loading.value = true;
  try {
    const response = await getUserWallpapers(page, size);
    if (response.data.code === 200) {
      userWallpapers.value = response.data.data.records || [];
      currentPage.value = response.data.data.current || 1;
      totalPages.value = response.data.data.pages || 0;
    }
  } catch (error) {
    console.error('获取用户壁纸失败:', error);
  }
  loading.value = false;
}

// 分页方法
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchUserWallpapers(currentPage.value, pageSize.value);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchUserWallpapers(currentPage.value, pageSize.value);
  }
};

// 跳转到指定页面
const goToPage = (page: number | string) => {
  // 如果是省略号，则不执行跳转
  if (page === '...') return;
  
  // 类型转换为number
  const pageNum = typeof page === 'string' ? parseInt(page) : page;
  
  if (pageNum >= 1 && pageNum <= totalPages.value && pageNum !== currentPage.value) {
    currentPage.value = pageNum;
    fetchUserWallpapers(currentPage.value, pageSize.value);
  }
};

// 获取分页数字数组
const getPageNumbers = (): (number | string)[] => {
  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    // 如果总页数小于等于最大可见页数，显示所有页码
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // 否则显示部分页码和省略号
    if (currentPage.value <= 3) {
      // 当前页在前3页内
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      // 当前页在后3页内
      pages.push(1);
      pages.push('...');
      for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
        pages.push(i);
      }
    } else {
      // 当前页在中间
      pages.push(1);
      pages.push('...');
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages.value);
    }
  }
  
  return pages;
};

// 打开预览
const openPreview = (wallpaper: any) => {
  currentWallpaper.value = wallpaper;
  showPreview.value = true;
  document.body.style.overflow = 'hidden';
};

// 关闭预览
const closePreview = () => {
  showPreview.value = false;
  currentWallpaper.value = {};
  document.body.style.overflow = 'auto';
};

// 删除壁纸
const handleDeleteWallpaper = async (fileId: string) => {
  try {
    const response = await deleteWallpaper(fileId);
    if (response.data.code === 200) {
      toast.success("删除成功");
      closePreview();
      // 刷新壁纸列表
      fetchUserWallpapers(currentPage.value, pageSize.value);
      fetchUserInfo()
    } else {
      toast.error("删除失败: " + response.data.message);
    }
  } catch (error) {
    console.error('删除壁纸失败:', error);
    toast.error("删除失败，请重试");
  }
}

const emit = defineEmits(['refresh'])

const refreshParent = () => {
  emit('refresh') // 触发刷新事件
}

// 退出登录
const handleLogout = () => {
  // 清除用户状态
  userStore.token = ""
  userStore.redisKey = ""
  // 跳转到登录页面
  router.push('/home');
  refreshParent()
  toast.success("已退出登录");
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.change-avatar-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.user-info {
  flex: 1;
}

.username {
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 600;
}

.logout-btn {
  padding: 8px 16px;
  background-color: rgba(255, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  align-self: center;
  margin-top: 10px;
}

.logout-btn:hover {
  background-color: rgba(255, 0, 0, 0.3);
  transform: translateY(-2px);
}

.user-email {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-size: 16px;
}

.join-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f4 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 28px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 0;
}

.wallpaper-count {
  color: #666;
  font-size: 14px;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.wallpaper-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.wallpaper-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.wallpaper-image-container {
  position: relative;
  padding-top: 75%; /* 4:3 aspect ratio */
  overflow: hidden;
}

.wallpaper-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.wallpaper-card:hover .wallpaper-img {
  transform: scale(1.05);
}

.wallpaper-info {
  padding: 15px;
}

.wallpaper-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallpaper-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.wallpaper-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.wallpaper-card:hover .wallpaper-actions {
  opacity: 1;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-btn {
  background-color: #4096ff;
  color: white;
}

.edit-btn:hover {
  background-color: #1890ff;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
}

.delete-btn:hover {
  background-color: #f54949;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.no-data-subtext {
  font-size: 14px;
  margin-top: 10px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4096ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
  padding: 20px 0;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-btn {
  padding: 8px 15px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #f5f7fa;
  border-color: #4096ff;
  color: #4096ff;
}

.page-btn.active {
  background-color: #4096ff;
  border-color: #4096ff;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}

.page-btn {
  padding: 5px 15px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.preview-img {
  max-width: 100%;
  max-height: 70vh;
  display: block;
  margin: 0 auto;
  object-fit: contain;
}

.preview-controls {
  padding: 25px;
  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.rename-section {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.rename-input {
  padding: 10px 15px;
  width: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.rename-input:focus {
  outline: none;
  border-color: #4096ff;
  box-shadow: 0 0 0 3px rgba(64, 150, 255, 0.2);
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4096ff 0%, #1890ff 100%);
  border: none;
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f56c6c 0%, #f54949 100%);
  border: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }

  .profile-header {
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .avatar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .change-avatar-btn {
    position: relative;
    bottom: auto;
    left: auto;
    transform: none;
    padding: 8px 16px;
    font-size: 14px;
  }

  .username {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .logout-btn {
    padding: 6px 12px;
    font-size: 12px;
    margin-top: 0;
    align-self: center;
  }

  .user-email {
    font-size: 15px;
    margin-bottom: 6px;
  }

  .join-date {
    font-size: 14px;
  }

  .profile-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 15px;
  }

  .stat-card {
    padding: 10px;
    border-radius: 6px;
  }

  .stat-icon {
    width: 45px;
    height: 45px;
    font-size: 24px;
  }

  .stat-value {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 13px;
  }

  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .section-title {
    font-size: 18px;
  }

  .wallpaper-count {
    font-size: 13px;
  }

  .wallpaper-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .wallpaper-card {
    border-radius: 8px;
  }

  .wallpaper-image-container {
    padding-top: 100%; /* 1:1 方形比例 */
  }

  .wallpaper-info {
    padding: 10px;
  }

  .wallpaper-title {
    font-size: 14px;
    margin-bottom: 6px;
  }

  .wallpaper-meta {
    font-size: 11px;
  }

  .rename-section {
    flex-direction: column;
    gap: 10px;
  }

  .rename-input {
    width: 100%;
    padding: 8px 12px;
    font-size: 13px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 20px;
    padding: 15px 0;
  }

  .page-numbers {
    gap: 3px;
  }

  .page-btn {
    padding: 6px 12px;
    font-size: 13px;
    border-radius: 4px;
  }

  .no-data {
    padding: 40px 15px;
  }

  .no-data-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 10px;
  }

  .profile-header {
    padding: 15px;
    border-radius: 10px;
  }

  .avatar {
    width: 80px;
    height: 80px;
  }

  .change-avatar-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .username {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .logout-btn {
    padding: 4px 8px;
    font-size: 10px;
  }

  .user-email {
    font-size: 13px;
    margin-bottom: 4px;
  }

  .join-date {
    font-size: 12px;
  }

  .stat-card {
    padding: 12px;
    border-radius: 8px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 20px;
    margin-bottom: 3px;
  }

  .stat-label {
    font-size: 12px;
  }

  .section-title {
    font-size: 16px;
  }

  .wallpaper-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .wallpaper-card {
    border-radius: 8px;
  }

  .wallpaper-image-container {
    padding-top: 65%;
  }

  .wallpaper-info {
    padding: 8px;
  }

  .wallpaper-title {
    font-size: 13px;
    margin-bottom: 5px;
  }

  .wallpaper-meta {
    font-size: 10px;
  }

  .preview-img {
    max-height: 60vh;
  }

  .preview-controls {
    padding: 15px;
  }

  .rename-input {
    padding: 6px 10px;
    font-size: 12px;
  }

  .page-btn {
    padding: 5px 10px;
    font-size: 12px;
  }

  .no-data {
    padding: 30px 10px;
  }

  .no-data-icon {
    font-size: 36px;
    margin-bottom: 10px;
  }

  .no-data-subtext {
    font-size: 13px;
  }
}
</style>

<template>
  <div class="home-container">
  <div class="category-section">
    <h3 class="category-title">壁纸分类</h3>
    <div class="category-tags">
      <button v-for="tag in tags" :key="tag.tagId" class="category-btn" @click="selected(tag.tagName, tag.tagId)" :class="{ 'active': selectedCategory === tag.tagName }">{{ tag.tagName }}</button>
    </div>
    <div class="search-container">
      <input @keyup.enter="enter()" type="text" v-model="searchQuery" placeholder="搜索壁纸，回车确认..." class="search-input">
    </div>
  </div>
      <!-- 壁纸网格 - 固定五列布局 -->
    <div class="wallpaper-grid">
      <div v-for="wallpaper in wallpapers" :key="wallpaper.fileId" class="wallpaper-item">
        <img v-lazy="wallpaper.fileUrlse" :alt="wallpaper.fileTitle" class="wallpaper-img" @click="openPreview(wallpaper)" />
        <div class="wallpaper-title-container">
          <div class="title-content">
            <span @click.stop="handleFavorite(wallpaper)" class="favorite-icon">
              <Star v-if="!wallpaper.collect" class="star-empty"/>
              <StarFilled v-else class="star-filled" />
            </span>
            <span class="wallpaper-title-text">{{ wallpaper.fileTitle }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">下一页</button>
    </div>

    <!-- 预览模态框 -->
    <div class="modal-overlay" :class="{ 'show': showPreview }" @click="closePreview">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closePreview">&times;</button>
        <img v-lazy="currentWallpaper.fileUrl" :alt="currentWallpaper.fileTitle" class="preview-img" />
        <div class="preview-controls">
          <button @click="getDownload(currentWallpaper.fileName)" class="download-btn">
            <DownloadIcon class="download-icon" />
            下载壁纸
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Download, getImagesPage, getImagesPageName, toggleFavorite } from '../api/File';
import { getImagesPageByTag, getTags } from '../api/Tag';
import router from '../router';
import { useToast } from 'vue-toastification'
import { Star, StarFilled, Download as DownloadIcon } from '@element-plus/icons-vue';

const toast = useToast()
const loading = ref(false);
const selectedCategory = ref('');
const searchQuery = ref('');
const tags = ref();

// 调试日志
onMounted(() => {
  console.log('Home组件已挂载');
  fetchData(currentPage.value, pageSize.value)
  getTag()
});

// 示例壁纸数据
const wallpapers = ref();

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(0);

async function enter() {
  if (searchQuery.value == '') {
    fetchData(currentPage.value, pageSize.value);
    return;
  }
  const response = await getImagesPageName(currentPage.value, pageSize.value, searchQuery.value)
  wallpapers.value = response.data.data.records;  // 将数据赋值给响应式变量
  currentPage.value = response.data.data.current;
  totalPages.value = response.data.data.pages;
}

// 分页方法
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
  fetchData(currentPage.value, pageSize.value)
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
  fetchData(currentPage.value, pageSize.value)
};

async function selected(tagname:string, tagId:number) {
  if (selectedCategory.value == '') {
    selectedCategory.value = tagname;
  } else if (selectedCategory.value == tagname) {
    selectedCategory.value = '';
    fetchData(currentPage.value, pageSize.value)
  } else {
    selectedCategory.value = tagname;
  }
  const response = await getImagesPageByTag(currentPage.value, pageSize.value, tagId)
  wallpapers.value = response.data.data.records
  currentPage.value = response.data.data.current;
  totalPages.value = response.data.data.pages;
}

// 预览状态
const showPreview = ref(false);
const currentWallpaper = ref({
  fileId: '',
  fileUrl: '',
  fileTitle: '',
  fileName: ''
});

// 打开预览
const openPreview = (wallpaper: any) => {
  console.log('打开预览:', wallpaper);
  currentWallpaper.value = {...wallpaper}; // 创建副本以避免引用问题
  showPreview.value = true;
  document.body.style.overflow = 'hidden';
};

// 关闭预览
const closePreview = () => {
  console.log('关闭预览');
  showPreview.value = false;
  // 重置当前壁纸信息
  currentWallpaper.value = {
    fileId: '',
    fileUrl: '',
    fileTitle: '',
    fileName: ''
  };
  document.body.style.overflow = 'auto';
};

  const getDownload = async (filename:any) => {
    try {
      const response = await Download(filename)
  
    // 创建Blob对象
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] // 使用响应头中的Content-Type
    });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // 从响应头获取文件名（后端已编码）
    const contentDisposition = response.headers['content-disposition'];
    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    const fileName = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : 'download.jpg';
    const name = '[生态白茶壁纸站]' + fileName.split("_")[1]

    a.download = name;
    document.body.appendChild(a);
    a.click();
    
    // 释放资源
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    } catch(err: any) {
      toast.warning("登录信息过期，请重新登录！")
      router.replace("/login")
    }
  }
const fetchData = async (page:number, size:number) => {
  loading.value = true;  // 开始加载，显示加载状态
  try {
    // 调用API获取数据（假设返回Promise）
    const response = await getImagesPage(page, size);
    wallpapers.value = response.data.data.records;
    currentPage.value = response.data.data.current;
    totalPages.value = response.data.data.pages;
  } catch (error) {
    // 错误处理：打印错误信息
    console.error('获取图片列表失败:', error);
  } finally {
    loading.value = false;  // 无论成功或失败，都结束加载状态
  }
};

// 处理收藏/取消收藏
const handleFavorite = async (wallpaper: any) => {
  try {
    // 切换收藏状态
    const response = await toggleFavorite(wallpaper.fileId);
    if (response.data.code === 200) {
      // 更新本地状态
      wallpaper.collect = !wallpaper.collect;
      toast.success(wallpaper.collect ? '收藏成功' : '取消收藏成功');
    } else {
      toast.error('操作失败: ' + response.data.message);
    }
  } catch (error:any) {
    console.error('收藏操作失败:', error);
    if (error.status == 401) {
      toast.error('未登录，请先登录！');
      return
    }
    toast.error('操作失败，请重试！');
  }
};

async function getTag() {
  const response = await getTags()
  tags.value = response.data.data
}
</script>

<style scoped>
.home-container {
  padding-top: 100px;
  height: calc(100vh + 100px);
  padding: 30px 0;
  margin: 0 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
/* 固定五列布局 */
.category-section {
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .category-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .category-title {
    margin-bottom: 10px;
  }

  .search-container {
    width: 100%;
    margin-top: 15px;
  }

  .category-tags {
    width: 100%;
  }
}

.search-container {
  flex: 1;
  min-width: 200px;
}

.category-title {
  margin-bottom: 0;
  margin-right: 20px;
  color: #303133;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(145deg, #f8ecfd, #e6d9f2);
  color: #303133;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.category-btn:hover {
  background: linear-gradient(145deg, #e0d0e9, #d4c0e0);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.category-btn.active {
  background: linear-gradient(135deg, #42b983 0%, #359469 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.25);
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #42b983;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

.wallpaper-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, calc(20% - 12px));
  padding: 20px 30px;
  gap: 15px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .wallpaper-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 15px;
    gap: 10px;
  }
  
  .wallpaper-item {
    height: 240px;
  }
  
  .wallpaper-img {
    height: 190px;
  }
}

.wallpaper-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  height: 280px;
  display: flex;
  flex-direction: column;
}

.wallpaper-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.wallpaper-img {
  width: 100%;
  height: 230px;
  object-fit: cover;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.wallpaper-item:hover .wallpaper-img {
  transform: scale(1.05);
}

.wallpaper-title-container {
  padding: 15px 10px;
  background-color: white;
  color: #555;
  font-size: 0.85rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  position: relative;
  margin: 0;
}

.title-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.wallpaper-title-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: center;
  margin-left: -24px; /* 抵消收藏图标的宽度 */
}

.favorite-icon {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  position: relative;
  z-index: 1;
  width: 24px;
}

.star-empty {
  color:rgb(206, 200, 200)9;
  display: inline-block;
  font-size: 18px;
  width: 18px;
  height: 18px;
}

.star-filled {
  color: #ff9500;
  display: inline-block;
  font-size: 18px;
  width: 18px;
  height: 18px;
}

/* 预览模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none; /* 默认不响应鼠标事件 */
}

.modal-overlay.show {
  opacity: 1;
  pointer-events: all; /* 显示时响应鼠标事件 */
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  transform: scale(0.9);
  transition: transform 0.3s ease;
  opacity: 0;
}

.modal-overlay.show .modal-content {
  transform: scale(1);
  opacity: 1;
}

.preview-img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 1px solid rgba(255,255,255,0.1);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: -40px;
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
}

.close-btn:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 6px 15px rgba(255, 71, 87, 0.4);
}

.preview-controls {
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #42b983 0%, #359469 100%);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3);
  position: relative;
  overflow: hidden;
}

.download-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.4);
}

.download-btn:active {
  transform: translateY(-1px);
}

.download-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(135deg, #359469 0%, #2d7a57 100%);
  transition: width 0.4s ease;
  z-index: 0;
}

.download-btn:hover::before {
  width: 100%;
}

.download-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  z-index: 1;
}

.download-btn:hover .download-icon {
  transform: translateY(-2px);
}

/* 分页控件样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
  gap: 15px;
  padding: 20px 0;
}

.page-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #42b983 0%, #359469 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.page-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.page-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #359469 0%, #2d7d57 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(53, 148, 105, 0.25);
}

.page-info {
  color: #666;
  font-size: 0.9rem;
}
</style>
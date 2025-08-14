<template>
  <div class="upload-container">
    <div class="upload-header">
      <h1 class="upload-title">上传壁纸</h1>
      <p class="upload-subtitle">选择并上传您的精美壁纸</p>
    </div>
    
    <div class="upload-content">
      <div class="upload-section">
        <div class="upload-area" 
          @dragover.prevent="handleDragOver" 
          @dragleave.prevent="handleDragLeave" 
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': isDragOver }">
          <div class="upload-icon">📁</div>
          <p class="upload-text">拖拽图片到此处</p>
          <p class="upload-hint">支持 JPG、PNG 格式，最多4张图片</p>
          <label for="file-upload" class="select-file-btn">
            选择文件
          </label>
          <input id="file-upload" multiple type="file" accept="image/*" @change="handleFileSelect" class="file-input"/>
        </div>
        

        
        <div class="category-section">
          <label class="file-label">壁纸分类</label>
          <select v-model="selectedCategory" class="category-select">
            <option value="">请选择分类</option>
            <option v-for="tag in tags" :key="tag.tagId" :value="tag.tagName">{{ tag.tagName }}</option>
          </select>
        </div>
        
        <button class="upload-btn" @click="handleUpload" :disabled="!fileSelected || !selectedCategory" :class="{ 'loading': !fileSelected }">
          {{ up }}
        </button>
      </div>
      
      <div class="preview-section">
        <h3>预览</h3>
        <div class="preview-container-multiple" v-if="previewUrls.length > 0">
          <div class="preview-item" v-for="(url, index) in previewUrls" :key="index" @mouseenter="showDeleteIcon(index)" @mouseleave="hideDeleteIcon(index)">
            <img :src="url" :alt="'预览图片 ' + (index + 1)" />
            <div class="file-name">{{ fileNames[index] }}</div>
            <div 
              class="delete-overlay" 
              v-if="showDelete[index]" 
              @click="removeImage(index)"
            >
              <div class="delete-icon">✕</div>
              <div class="delete-text">删除</div>
            </div>
          </div>
        </div>
        <div class="no-preview" v-else>
          <div class="preview-placeholder">暂无预览</div>
        </div>
        

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Upload } from '../api/File';
import { getTags } from '../api/Tag';
import { useToast } from 'vue-toastification';
import { getUserInfo } from '../api/User';

const toast = useToast()
const fileSelected = ref(false);
const fileNames = ref<string[]>([]);
const previewUrls = ref<string[]>([]);
const filesToUpload = ref<File[]>([]);
const selectedCategory = ref('');
const router = useRouter();
const tags = ref();
const tagId = ref();
const isDragOver = ref(false);

const up = ref('确认上传')

onMounted(async () => {
  fetchUserInfo()
  const response = await getTags()
  tags.value = response.data.data
})

// 处理文件选择（包括拖拽和点击选择）
const processFiles = (files: FileList) => {
  // 限制最多选择4张图片
  if (files.length > 4) {
    toast.warning("最多只能选择4张图片");
    return;
  }
  
  if (files.length > 0) {
    // 清空之前的状态
    filesToUpload.value = [];
    fileNames.value = [];
    previewUrls.value = [];
    
    // 处理每个选中的文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 检查文件类型是否为图片
      if (!file.type.startsWith('image/')) {
        toast.warning("只能选择图片文件");
        continue;
      }
      
      filesToUpload.value.push(file);
      fileNames.value.push(file.name);
      // 初始化previewUrls对应位置
      previewUrls.value.push('');
      
      // 为每个文件生成预览URL，确保索引位置正确
      const reader = new FileReader();
      reader.onload = (e) => {
        // 使用索引确保预览URL放在正确位置
        previewUrls.value[i] = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    
    fileSelected.value = true;
  } else {
    fileSelected.value = false;
  }
};

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    processFiles(input.files);
  }
};

// 拖拽事件处理函数
const handleDragOver = () => {
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false;
  if (e.dataTransfer && e.dataTransfer.files) {
    processFiles(e.dataTransfer.files);
  }
};

async function uploading() {
  // 这里添加文件上传逻辑
  try {
    // 上传每个文件
    for (const file of filesToUpload.value) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tagId', tagId.value)
      console.log(formData.get('file'))

      // 假设使用之前项目中的request工具
      const response = await Upload(formData);

      if (response.data.code == 200) {
        toast.success(`文件 ${file.name} 上传成功，请等待审核后查看！`)
      } else {
        toast.info(`文件 ${file.name} 上传失败: ${response.data.message}`)
      }

      if (response.data.code != 200) {
        toast.info(`文件 ${file.name} 上传失败: ${response.data.message}`)
      }
    }

    fileSelected.value = true
    up.value = '确认上传'
    filesToUpload.value = [];
    fileNames.value = [];
    previewUrls.value = [];

  } catch (error:any) {
    console.error('上传错误:', error);
    fileSelected.value = true
    up.value = '确认上传'
    toast.error("上传发生错误！")
  }
}

// 添加删除图片相关的响应式数据
const showDelete = ref<boolean[]>([]);

// 显示删除图标
const showDeleteIcon = (index: number) => {
  showDelete.value[index] = true;
};

// 隐藏删除图标
const hideDeleteIcon = (index: number) => {
  showDelete.value[index] = false;
};

// 删除图片
const removeImage = (index: number) => {
  // 从数组中移除对应项
  previewUrls.value.splice(index, 1);
  fileNames.value.splice(index, 1);
  filesToUpload.value.splice(index, 1);
  
  // 更新showDelete数组
  showDelete.value.splice(index, 1);
  
  // 如果没有图片了，重置状态
  if (previewUrls.value.length === 0) {
    fileSelected.value = false;
  }
};

const handleUpload = () => {
  if (filesToUpload.value.length === 0) return;
  if (selectedCategory.value == '') {
    toast.warning("请选择壁纸分类")
    return;
  }
  fileSelected.value = false
  up.value = '正在上传中，请耐心等待...'
  uploading()
};

async function fetchUserInfo() {
  try {
    const response = await getUserInfo();
    if (response.data.code === 200) {

    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 处理未登录情况
    toast.warning("请先登录");
    router.push('/login');
  }
}
</script>

<style scoped>
:root {
  --primary-color: #409eff;
  --primary-light: #e6f7ff;
  --primary-dark: #337ecc;
  --success-color: #52c41a;
  --success-dark: #43a047;
  --text-color: #303133;
  --text-light: #606266;
  --border-color: #dcdfe6;
  --border-radius: 8px;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.upload-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  min-height: calc(100vh - 100px);
}

.upload-header {
  text-align: center;
  margin-bottom: 30px;
}

.upload-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  position: relative;
  display: inline-block;
}

.upload-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #409eff 0%, #66b2ff 100%);
  border-radius: 2px;
}

.upload-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.upload-content {
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: stretch;
  min-height: calc(100vh - 200px);
  /* 移除固定的最大高度限制，让内容自然填充 */
}

@media (max-width: 768px) {
  .upload-content {
    flex-direction: column;
    height: auto;
    max-height: none;
  }
}

.upload-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  flex: 1;
  /* 调整overflow属性，确保内容正确显示 */
  overflow-y: visible;
}

.upload-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 16px;
  padding: 50px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  position: relative;
  overflow: hidden;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #409eff 0%, #66b2ff 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.upload-area:hover::before {
  opacity: 0.05;
}

.upload-area:hover {
  border-color: #4096ff;
  box-shadow: 0 8px 25px rgba(64, 150, 255, 0.15);
}

.upload-area.drag-over {
  border-color: #4096ff;
  background: linear-gradient(145deg, #e6f7ff, #d1e9ff);
  box-shadow: 0 8px 25px rgba(64, 150, 255, 0.2);
}

.upload-icon {
  font-size: 64px;
  color: #999;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.upload-area:hover .upload-icon {
  transform: scale(1.1);
  color: #4096ff;
}

.upload-text {
  color: #333;
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 10px;
}

.upload-hint {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 25px;
}

.select-file-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #4096ff 0%, #1890ff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(64, 150, 255, 0.25);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.select-file-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(135deg, #1890ff 0%, #0c76d4 100%);
  transition: width 0.3s ease;
  z-index: -1;
}

.select-file-btn:hover::before {
  width: 100%;
}

.select-file-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(24, 144, 255, 0.3);
}

.file-input {
  display: none;
}

.file-info {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  padding: 20px;
  margin-top: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.file-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.file-list {
  max-height: 150px;
  overflow-y: auto;
}

.file-item {
  padding: 8px 12px;
  background: rgba(64, 150, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #666;
  word-break: break-all;
}

.file-item:last-child {
  margin-bottom: 0;
}

.category-section {
  margin-bottom: 30px;
}

.file-label {
  display: block;
  margin-bottom: 12px;
  color: #333;
  font-weight: 500;
  font-size: 1rem;
}

.category-select {
  width: 100%;
  padding: 14px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  color: #333;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.category-select:focus {
  outline: none;
  border-color: #4096ff;
  box-shadow: 0 4px 12px rgba(64, 150, 255, 0.2);
}

.upload-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4096ff 0%, #1890ff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(64, 150, 255, 0.25);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.upload-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(135deg, #1890ff 0%, #0c76d4 100%);
  transition: width 0.3s ease;
  z-index: -1;
}

.upload-btn:hover::before {
  width: 100%;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(24, 144, 255, 0.3);
}

.upload-btn:disabled {
  background: linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.upload-btn.loading {
  position: relative;
  color: transparent;
}

.upload-btn.loading::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  top: 50%;
  left: 50%;
  margin: -12px 0 0 -12px;
  border: 3px solid #ffffff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  width: 350px;
  height: fit-content;
  position: sticky;
  top: 30px;
  align-self: flex-start;
  max-height: 100%;
  overflow-y: auto;
}

.preview-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.preview-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.3rem;
  position: relative;
  padding-bottom: 12px;
}

.preview-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(135deg, #409eff 0%, #66b2ff 100%);
  border-radius: 2px;
}

.preview-container-multiple {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px; /* 增加间距使布局更清晰 */
  /* 添加一些额外的样式调整 */
  margin-top: 10px;
}

@media (max-width: 768px) {
  .preview-container-multiple {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

.preview-item {
  position: relative;
  aspect-ratio: 1/1;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  /* 调整预览项样式以更好地显示文件名 */
  /* 移除padding-bottom，让图片填充整个区域 */
  justify-content: space-between;
}

.preview-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.preview-item:hover img {
  transform: scale(1.05);
}

.preview-item .file-name {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transform: translateZ(0);
  color: #333;
  padding: 8px 4px;
  margin: 0;
  font-size: 0.8rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px solid #eee;
  margin-top: auto;
  display: block; /* 确保文件名始终显示 */
  /* 添加一些额外的样式调整 */
  font-weight: 500;
  /* 移除border-bottom，避免影响布局 */
}

.delete-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-icon {
  font-size: 2rem;
  color: white;
  margin-bottom: 5px;
}

.delete-text {
  color: white;
  font-size: 0.9rem;
}

.no-preview {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 1rem;
}

.preview-placeholder {
  font-style: italic;
}
</style>
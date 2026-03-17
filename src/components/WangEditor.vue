<template>
  <div class="editor-wrapper">
    <!-- 外层容器：控制整体边框和高度 -->
    <div class="editor-container">
      <!-- 工具栏 -->
      <Toolbar class="toolbar-box" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />

      <!-- 编辑区域 -->
      <Editor class="editor-box" :defaultConfig="editorConfig" :mode="mode" v-model="valueHtml"
        @onCreated="handleCreated" @onChange="handleChange" @onDestroyed="handleDestroyed" @onFocus="handleFocus"
        @onBlur="handleBlur" @customAlert="customAlert" @customPaste="customPaste" />
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onBeforeUnmount } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';

// --- Props & Emits (支持 v-model) ---
const props = defineProps({
  modelValue: {
    type: String,
    default: '<p></p>'
  }
});

const emit = defineEmits(['update:modelValue']);

// --- 响应式数据 ---
const editorRef = shallowRef(); // 必须用 shallowRef
const valueHtml = ref(props.modelValue);
const mode = ref('default');

// --- 配置项 ---
const toolbarConfig = {};

const editorConfig = {
  placeholder: '请输入内容...',

  // 1. 颜色配置 (预设色板)
  COLOR_COLORS: [
    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
    '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e'
  ],

  // 2. 图片上传配置
  MENU_CONF: {
    uploadImage: {
      // 如果后端接口简单，可以直接配 server 和 fieldName，编辑器会自动发 FormData
      // server: '/api/upload/image',
      // fieldName: 'file',

      // 推荐：使用 customUpload 自定义逻辑 (处理 Token、特殊返回格式等)
      customUpload(file, insertFn) {
        console.log('开始上传图片:', file.name);

        // ================= 真实场景代码 (请取消注释并安装 axios) =================
        /*
        import axios from 'axios'; // 记得在文件顶部引入
        
        const formData = new FormData();
        formData.append('file', file); // 字段名根据后端要求修改

        axios.post('/api/upload/image', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            // 'Authorization': 'Bearer ' + token // 如果有 token
          }
        })
        .then(res => {
          // 假设后端返回格式: { code: 200, data: { url: 'http://...' } }
          if (res.data.code === 200 || res.data.status === 'success') {
            const imageUrl = res.data.data.url; 
            // 插入图片：(src, alt, href)
            insertFn(imageUrl, file.name, imageUrl);
          } else {
            alert('上传失败：' + (res.data.msg || '未知错误'));
          }
        })
        .catch(err => {
          console.error(err);
          alert('网络错误，上传失败');
        });
        */
        // =======================================================================

        // ================= 模拟上传代码 (演示用，实际使用请删除此块) =================
        setTimeout(() => {
          // 模拟一个随机图片地址
          const mockUrl = `https://via.placeholder.com/400x200?text=${encodeURIComponent(file.name)}`;

          console.log('模拟上传成功:', mockUrl);
          alert(`模拟上传成功：${file.name}`);

          // 关键：调用 insertFn 将图片插入编辑器
          // 参数顺序：(图片链接 src, 替代文本 alt, 点击跳转链接 href)
          insertFn(mockUrl, file.name, mockUrl);
        }, 1000);
        // =======================================================================
      }
    }
  }
};

// --- 事件处理函数 ---

const handleCreated = (editor) => {
  console.log('编辑器已创建', editor);
  editorRef.value = editor;
};

const handleChange = (editor) => {
  const html = editor.getHtml();
  valueHtml.value = html;
  // 触发 update:modelValue 事件，同步给父组件的 v-model
  emit('update:modelValue', html);
};

const handleDestroyed = (editor) => {
  console.log('编辑器已销毁', editor);
};

const handleFocus = (editor) => {
  console.log('编辑器获得焦点');
};

const handleBlur = (editor) => {
  console.log('编辑器失去焦点');
};

const customAlert = (info, type) => {
  // 这里可以替换为 Element Plus 的 ElMessage
  alert(`【系统提示】${type} - ${info}`);
};

const customPaste = (editor, event, callback) => {
  // 允许默认粘贴行为 (修复之前只能粘贴 'xxx' 的问题)
  callback(true);
};

// --- 生命周期 ---

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style scoped lang="scss">
.editor-wrapper {
  width: 100%;
}

.editor-container {
  border: 1px solid #ccc;
  margin-top: 10px;
  height: 500px;
  /* 总高度 */
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  /* 防止圆角被内部内容遮挡 */
}

.toolbar-box {
  border-bottom: 1px solid #ccc;
  flex-shrink: 0;
  /* 防止工具栏被压缩 */
  background-color: #fff;
  z-index: 10;
}

.editor-box {
  flex-grow: 1;
  /* 占据剩余空间 */
  overflow-y: auto;
  /* 内容过多时内部滚动 */
  background-color: #fff;

  // 修正一些默认的 z-index 问题
  :deep(.w-e-text-container) {
    z-index: 1 !important;
  }
}
</style>
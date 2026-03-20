<template>
  <div class="editor-wrapper">
    <div class="editor-container">
      <!-- 工具栏 -->
      <Toolbar class="toolbar-box" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />

      <!-- 编辑区域 -->
      <Editor class="editor-box" :defaultConfig="editorConfig" :mode="mode" v-model="valueHtml"
        @onCreated="handleCreated" @onChange="handleChange" @onDestroyed="handleDestroyed" @customAlert="customAlert"
        @customPaste="customPaste" />
    </div>
  </div>
</template>

<script setup>
// 【修正 1】补全必要的导入，特别是 watch, nextTick 和 axios
import { ref, shallowRef, onBeforeUnmount, watch, nextTick } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import "@wangeditor/editor/dist/css/style.css";
import axios from "axios";


const uploadUrl = "/api/common/upload_image";

// --- Props & Emits ---
const props = defineProps({
  modelValue: {
    type: String,
    default: "<p><br></p>",
  },

  moduleType: {
    type: String,
    default: "",
  },
});



const emit = defineEmits(["update:modelValue"]);

// --- 响应式数据 ---
const editorRef = shallowRef();
// 初始值设为空字符串或默认值，主要依赖 watch 来同步最新数据
const valueHtml = ref(props.modelValue);
const mode = ref("default");

// --- 配置项 ---
// --- 配置项 ---
const toolbarConfig = {};

const editorConfig = {
  placeholder: "请输入内容...",

  MENU_CONF: {

    color: {
      colors: [
        "#16418A",
        "#2E9DA4",
        "#000000",
        "#333333",
        "#666666",
        "#999999",
        "#cccccc",
        "#ffffff",
        "#003366",
        "#0055A5",
        "#4A90E2",
        "#5B9BD5",
        "#8FC1E3",
        "#D9534F",
        "#D9230F",
        "#F0AD4E",
        "#FFC107",
        "#FF8C00",
        "#E67E22",
        "#5CB85C",
        "#3F9D3F",
        "#27AE60",
        "#1ABC9C",
        "#16A085",
        "#8E44AD",
        "#9B59B6",
        "#E91E63",
        "#D81B60",
        "#F06292",
        "#34495E",
        "#7F8C8D",
        "#BDC3C7",
        "#F39C12",
        "#C0392B",
      ],
    },

    //   图片上传配置  
    uploadImage: {

      async customUpload(file, insertFn) {
        console.log("开始上传图片:", file.name);

        const formData = new FormData();

        formData.append("file", file);
         formData.append("module", props.moduleType);

        try {
          //  修改为 的真实上传接口地址
          const res = await axios.post(uploadUrl, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              // 如果有 Token，取消下面注释并替换真实 token
              // 'Authorization': 'Bearer ' + 'YOUR_TOKEN_HERE'
            },
          });

          // 【关键】解析后端返回的数据
          // 假设后端返回格式: { code: 200, data: { url: 'http://...' } }
          // 请根据你 际的后端返回结构调整下面的 if 判断

          let imageUrl = "";

          // 情况 A: 标准嵌套结构 (常见)
          if (res.data.code === 200 && res.data.data && res.data.data.url) {
            imageUrl = res.data.data.url;
          }
          // 情况 B: 直接返回 url 字符串 (较少见)
          else if (typeof res.data === "string" && res.data.startsWith("http")) {
            imageUrl = res.data;
          }
          // 情况 C: 其他成功标识 (如 status: 'success')
          else if (res.data.status === "success" && res.data.url) {
            imageUrl = res.data.url;
          } else {
            // 如果解析失败，抛出错误进入 catch
            throw new Error("无法从响应中解析图片 URL");
          }

          // 【核心】调用 insertFn 将图片插入编辑器
          // 参数顺序：(src, alt, href)
          // src: 图片地址
          // alt: 图片描述 (通常用文件名)
          // href: 点击跳转链接 (通常设为和图片地址一样，或者空字符串)
          insertFn(imageUrl, file.name, imageUrl);

          console.log("图片上传并插入成功:", imageUrl);
        } catch (error) {
          console.error("图片上传失败:", error);
          alert("图片上传失败，请稍后重试");
        }
      },
    },
  },
};

// --- 事件处理 ---

const handleCreated = (editor) => {
  editorRef.value = editor;
  console.log("✅ 编辑器实例已创建");

  // 如果此时 props 已经有值（极小概率），强制同步一次
  if (props.modelValue && props.modelValue !== valueHtml.value) {
    valueHtml.value = props.modelValue;
    try {
      editor.setHtml(props.modelValue);
    } catch (e) { /* 忽略初始化时的潜在错误 */ }
  }
};

const handleChange = (editor) => {
  const html = editor.getHtml();
  valueHtml.value = html;
  emit("update:modelValue", html);
};

const handleDestroyed = () => {
  editorRef.value = null;
};

const customAlert = (info, type) => {
  console.log(`[Alert] ${type}: ${info}`);
};

const customPaste = (editor, event, callback) => {
  callback(true);
};

// --- 【核心修复】Watch 监听逻辑 ---
// 监听父组件传来的 modelValue 变化，实现异步数据回显
watch(
  () => props.modelValue,
  async (newVal) => {
    if (!newVal) return;

    // 1. 先更新本地响应式变量，触发 v-model 机制
    valueHtml.value = newVal;
    console.log("📡 监听到内容变化，准备同步到编辑器...");

    // 2. 如果编辑器还没创建好，等待它创建（handleCreated 会处理后续）
    if (!editorRef.value) {
      console.log("⏳ 编辑器未就绪，等待初始化...");
      return;
    }

    // 3. 等待 DOM 更新
    await nextTick();

    // 4. 尝试同步内容到编辑器实例
    try {
      const editor = editorRef.value;
      const currentHtml = editor.getHtml();

      // 只有当内容真的不一致时才调用 setHtml，避免不必要的重绘
      if (newVal.trim() !== currentHtml.trim()) {
        editor.setHtml(newVal);
        console.log("✅ 内容已成功回显到编辑器");
      }
    } catch (error) {
      // 捕获 Slate 相关的 DOM 解析错误，防止页面崩溃
      console.warn("⚠️ 同步内容时发生非致命错误:", error);
    }
  },
  { immediate: true } // 组件挂载时立即执行一次检查
);

// --- 生命周期 ---
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor) {
    editor.destroy();
  }
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
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
}

.toolbar-box {
  border-bottom: 1px solid #ccc;
  flex-shrink: 0;
  background-color: #fff;
  z-index: 10;
}

.editor-box {
  flex-grow: 1;
  overflow-y: auto;
  background-color: #fff;

  :deep(.w-e-text-container) {
    z-index: 1 !important;
  }
}
</style>
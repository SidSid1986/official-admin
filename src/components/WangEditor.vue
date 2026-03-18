<template>
  <div class="editor-wrapper">
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
import { ref, shallowRef, onBeforeUnmount } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import "@wangeditor/editor/dist/css/style.css";
import axios from "axios"; // 【重要】确保已安装 axios: npm install axios

// --- Props & Emits ---
const props = defineProps({
  modelValue: {
    type: String,
    default: "<p></p>",
  },
});

const emit = defineEmits(["update:modelValue"]);

// --- 响应式数据 ---
const editorRef = shallowRef();
const valueHtml = ref(props.modelValue);
const mode = ref("default");

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
      //  如果后端返回格式完全符合 wangEditor 标准 (errno: 0, data: {url}),

      // server: '/api/upload/image',
      // fieldName: 'file',


      async customUpload(file, insertFn) {
        console.log("开始上传图片:", file.name);

        const formData = new FormData();
        //  'file' 是后端接收文件的字段名，如果后端要求叫 'image' 或 'avatar'，请修改这里
        formData.append("file", file);

        try {
          //  修改为 的真实上传接口地址
          const res = await axios.post("/api/upload/image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              // 如果有 Token，取消下面注释并替换真实 token
              // 'Authorization': 'Bearer ' + 'YOUR_TOKEN_HERE'
            },
          });

          // 【关键】解析后端返回的数据
          // 假设后端返回格式: { code: 200, data: { url: 'http://...' } }
          // 请根据你实际的后端返回结构调整下面的 if 判断

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

// --- 事件处理函数 ---

const handleCreated = (editor) => {
  console.log("编辑器已创建", editor);
  editorRef.value = editor;
};

const handleChange = (editor) => {
  const html = editor.getHtml();
  valueHtml.value = html;
  emit("update:modelValue", html);
};

const handleDestroyed = () => { };
const handleFocus = () => { };
const handleBlur = () => { };

const customAlert = (info, type) => {
  // 生产环境建议替换为 Element Plus 的 ElMessage.info()
  alert(`【系统提示】${type} - ${info}`);
};

const customPaste = (editor, event, callback) => {
  // 允许默认粘贴行为
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

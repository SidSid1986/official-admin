<template>
  <div class="editor-wrapper">
    <div class="editor-container">
      <Toolbar class="toolbar-box" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
      <Editor class="editor-box" :defaultConfig="editorConfig" :mode="mode" v-model="valueHtml"
        @onCreated="handleCreated" @onChange="handleChange" @onDestroyed="handleDestroyed" @customAlert="customAlert"
        @customPaste="customPaste" />
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onBeforeUnmount, watch, nextTick } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import "@wangeditor/editor/dist/css/style.css";
import { uploadImageCommon } from "@/api/common.js";
// 新增：引入微信图片下载接口
import { downloadWechatImage } from "@/api/common.js";

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

const editorRef = shallowRef();
const valueHtml = ref(props.modelValue);
const mode = ref("default");

// 工具栏配置
const toolbarConfig = {
  excludeKeys: ["fullScreen"],
};

// 编辑器配置
const editorConfig = {
  placeholder: "请输入内容...",
  pasteFilterStyle: false,
  pasteIgnoreImg: false,
  MENU_CONF: {
    color: {
      colors: [
        "#16418A", "#2E9DA4", "#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff",
        "#003366", "#0055A5", "#4A90E2", "#5B9BD5", "#8FC1E3", "#D9534F", "#D9230F", "#F0AD4E",
        "#FFC107", "#FF8C00", "#E67E22", "#5CB85C", "#3F9D3F", "#27AE60", "#1ABC9C", "#16A085",
        "#8E44AD", "#9B59B6", "#E91E63", "#D81B60", "#F06292", "#34495E", "#7F8C8D", "#BDC3C7",
        "#F39C12", "#C0392B",
      ],
    },

    // 手动上传图片
    uploadImage: {
      async customUpload(file, insertFn) {
        console.log("手动上传图片:", file.name);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("module", props.moduleType);
        const res = await uploadImageCommon(formData);
        if (res.code === 200 && res.data?.url) {
          insertFn(res.data.url, file.name, res.data.url);
          console.log("手动上传成功:", res.data.url);
        }
      },
    },

    // 粘贴图片自动上传
    pasteImage: {
      async customUpload(file, insertFn) {
        console.log("粘贴图片自动上传:", file.name);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("module", props.moduleType);
        const res = await uploadImageCommon(formData);
        if (res.code === 200 && res.data?.url) {
          insertFn(res.data.url, file.name, res.data.url);
          console.log("粘贴上传成功:", res.data.url);
        }
      },
    },
  },
};


const customPaste = async (editor, event, callback) => {
  //   获取粘贴内容
  const html = event.clipboardData.getData("text/html");
  const text = event.clipboardData.getData("text/plain");

  //  判断是否包含微信图片
  const hasWechatImage = /mmbiz\.qpic\.cn/i.test(html);

  //  只有包含微信图片时， 
  if (hasWechatImage) {
    event.preventDefault(); // 阻止默认粘贴  
  }

  //  匹配微信图片
  const wechatImgRegex = /<img[^>]+src=["'](https?:\/\/[^"']*mmbiz\.qpic\.cn[^"']*)["'][^>]*>/g;
  let matches;
  let newHtml = html;

  //  下载替换微信图片
  if (hasWechatImage) {
    while ((matches = wechatImgRegex.exec(html)) !== null) {
      const originalImgTag = matches[0];
      const originalImgUrl = matches[1];

      try {
        const res = await downloadWechatImage(originalImgUrl, props.moduleType);
        if (res.code === 200 && res.data?.url) {
          const newImgTag = originalImgTag.replace(originalImgUrl, res.data.url);
          newHtml = newHtml.replace(originalImgTag, newImgTag);
        }
      } catch (error) {
        console.error("微信图片下载失败", error);
      }
    }

    // 插入处理后的内容
    editor.dangerouslyInsertHtml(newHtml);
    callback(false);
    return;
  }

  // 不是微信内容正常粘贴
  callback(true);
};



const handleCreated = (editor) => {
  editorRef.value = editor;
  console.log("编辑器实例已创建");
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

// 监听外部v-model同步
watch(
  () => props.modelValue,
  async (newVal) => {
    if (!newVal || !editorRef.value) return;
    await nextTick();
    const editor = editorRef.value;
    const currentHtml = editor.getHtml();
    if (newVal.trim() !== currentHtml.trim()) {
      editor.setHtml(newVal);
      console.log("外部内容同步成功");
    }
  },
  { immediate: true }
);

// 卸载销毁
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor) editor.destroy();
});
</script>

<style scoped lang="scss">
.editor-wrapper {
  width: 100%;
}

.editor-container {
  border: 1px solid #ccc;
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
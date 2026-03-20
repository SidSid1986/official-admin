<!--
 * @Author: Sid Li
 * @Date: 2026-03-18 08:48:02
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-03-20 09:28:32
 * @FilePath: \admin-demo\src\views\service.vue
 * @Description: 服务管理页面
-->
<template>
  <div class="service-container">
    <div class="service-content">
      <div class="title">服务支持内容管理</div>

      <!-- 编辑器 -->
      <WangEditor v-model="serviceContent" moduleType="service" />

      <!-- 提交按钮 -->
      <div class="submit-btn">
        <el-button type="primary" :loading="loading" @click="submitService">
          {{ loading ? '提交中...' : '提交保存' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import { ElMessage } from 'element-plus'; // Element Plus 的消息提示
import WangEditor from '@/components/WangEditor.vue';
import { getServiceContent, putServiceContent } from '@/api/common.js';

const serviceContent = ref('');
const loading = ref(false);



/**
 * 获取当前的服务内容
 */
const fetchServiceContent = async () => {

  const response = await getServiceContent();
  console.log(response);

  if (response.data && response.data.content !== undefined) {
    serviceContent.value = response.data.content;
    console.log(serviceContent.value + '服务内容');
  } else {
    serviceContent.value = '暂无服务内容';
  }
}


/**
 * 提交服务内容 (PUT 请求)
 */
const submitService = async () => {
  // 简单校验
  if (!serviceContent.value || serviceContent.value.trim() === '') {
    ElMessage.warning('请输入服务内容');
    return;
  }

  loading.value = true;
  const data = {
    content: serviceContent.value
  }

  const response = await putServiceContent(data)

  console.log('提交成功:', response.data);
  ElMessage.success('服务内容更新成功！');
  loading.value = false;

  fetchServiceContent();

};

onMounted(() => {
  console.log('组件挂载了，开始加载数据...');
  fetchServiceContent();
});
</script>

<style scoped lang="scss">
.service-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
  }

  .submit-btn {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
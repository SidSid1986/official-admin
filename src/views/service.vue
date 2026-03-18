<template>
  <div class="service-container">
    <div class="service-content">
      <div>服务支持</div>
      <WangEditor v-model="serviceContent" />
      <div><el-button type="primary" @click="submitService">提交</el-button></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, } from 'vue';
import WangEditor from '@/components/WangEditor.vue';


const serviceContent = ref('');

const submitService = () => {
  if (serviceContent.value.trim() === '') {
    el.message.warning('请输入服务内容');
    return;
  }
  console.log(serviceContent.value);

  //  提交服务的逻辑

  // axios.post('/api/service', { content: serviceContent.value })
  //   .then(response => {
  //     console.log(response.data);
  //   })
  //   .catch(error => {
  //     console.error(error);
  //     el.message.error('服务提交失败');
  //   });    
};

onMounted(() => {
  console.log('组件挂载了');
});

</script>

<style scoped></style>

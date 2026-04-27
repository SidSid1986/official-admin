<template>
  <div class="sport-form-wrapper">
    <el-divider content-position="left">🎛️ 运动控制器</el-divider>
    <el-form :model="localModel" label-width="140px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="产品名称"><el-input v-model="localModel.name" /></el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="详情"><el-input v-model="localModel.detail" type="textarea" :rows="4" /></el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="详情图">
            <el-upload action="#" :auto-upload="false" :file-list="mainImageList" list-type="picture-card"
              :on-change="handleMainImageChange" :on-remove="handleMainImageRemove">
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="多图">
            <el-upload action="#" :auto-upload="false" :file-list="imagesList" list-type="picture-card"
              :on-change="handleImagesChange" :on-remove="handleImagesRemove">
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider>核心卖点</el-divider>
      <el-table :data="localSellingPoints" border>
        <el-table-column label="序号" type="index" /><
        <el-table-column label="标题"><template #default="s"><el-input v-model="s.row.title" /></template></el-table-column>
        <el-table-column label="内容"><template #default="s"><el-input v-model="s.row.content" /></template></el-table-column>
        <el-table-column label="操作"><template #default><el-button type="danger" @click="removeSellingPoint($index)">删</el-button></template></el-table-column>
      </el-table>
      <el-button style="margin:10px 0" @click="addSellingPoint">添加卖点</el-button>

      <el-divider>自定义表格</el-divider>
      <el-button style="margin-bottom:10px" @click="addCustomTable">添加表格</el-button>

      <div v-for="(t, idx) in localTables" :key="t.key" style="padding:16px;border:1px solid #e4e7ed;border-radius:8px;margin-bottom:16px">
        <el-input v-model="t.name" placeholder="表格名" style="margin-bottom:10px" />
        <el-table :data="t.rows" border>
          <el-table-column label="参数名"><template #default="s"><el-input v-model="s.row.key" /></template></el-table-column>
          <el-table-column label="参数值"><template #default="s"><el-input v-model="s.row.value" /></template></el-table-column>
          <el-table-column label="操作"><template #default><el-button type="danger" @click="removeRow(idx, $index)">删</el-button></template></el-table-column>
        </el-table>
        <div style="margin-top:10px">
          <el-button size="small" @click="addRow(idx)">添加行</el-button>
          <el-button size="small" type="danger" @click="removeTable(idx)">删表格</el-button>
        </div>
        <div style="margin-top:10px">
          <el-upload action="#" :auto-upload="false" :file-list="t.imageList" list-type="picture-card"
            :on-change="(f) => handleTableImageChange(f, idx)"
            :on-remove="(f) => handleTableImageRemove(f, idx)">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { uploadImageCommon } from '@/api/common';

const props = defineProps({
  modelValue: { type: Object, default: () => ({ name: '', detail: '', img: '', images: [] }) },
  uploadTableImageApi: Function,
  customTables: Array,
  sellingPoints: Array,
});

const emit = defineEmits(['update:modelValue', 'update:customTables', 'update:selling-points']);

const localModel = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) });
const localTables = computed({ get: () => props.customTables || [], set: v => emit('update:customTables', v) });
const localSellingPoints = computed({ get: () => props.sellingPoints || [], set: v => emit('update:selling-points', v) });

const mainImageList = ref([]);
const imagesList = ref([]);
const generateUniqueId = () => Date.now() + '' + Math.random();

const addSellingPoint = () => localSellingPoints.value = [...localSellingPoints.value, { title: '', content: '' }];
const removeSellingPoint = (i) => { const a = [...localSellingPoints.value]; a.splice(i, 1); localSellingPoints.value = a; };
const addCustomTable = () => localTables.value = [...localTables.value, { name: '', rows: [{ key: '', value: '' }], images: [], imageList: [], key: generateUniqueId() }];
const removeTable = (i) => { const a = [...localTables.value]; a.splice(i, 1); localTables.value = a; };
const addRow = (i) => { const a = [...localTables.value]; a[i].rows.push({ key: '', value: '' }); localTables.value = a; };
const removeRow = (i, j) => { const a = [...localTables.value]; a[i].rows.splice(j, 1); localTables.value = a; };

const beforeUpload = (f) => f.type.startsWith('image/') && f.size < 5 * 1024 * 1024 || (ElMessage.error('图片≤5M'), false);

const handleMainImageChange = async (f) => {
  const fd = new FormData();
  fd.append('file', f.raw);
  const res = await uploadImageCommon(fd);
  if (res.code === 200) {
    localModel.value.img = res.data.url;
    mainImageList.value = [{ url: res.data.url }];
  }
};

const handleMainImageRemove = () => {
  localModel.value.img = '';
  mainImageList.value = [];
};

const handleImagesChange = async (f) => {
  const fd = new FormData();
  fd.append('file', f.raw);
  const res = await props.uploadTableImageApi(fd);
  if (res.code === 200) {
    const arr = localModel.value.images || [];
    arr.push(res.data.url);
    localModel.value.images = arr;
  }
};

const handleImagesRemove = (f) => {
  const arr = (localModel.value.images || []).filter(u => u !== f.url);
  localModel.value.images = arr;
};

const handleTableImageChange = async (f, i) => {
  const t = localTables.value[i];
  t.imageList.push({ ...f, status: 'uploading' });
  const fd = new FormData();
  fd.append('file', f.raw);
  const res = await props.uploadTableImageApi(fd);
  if (res.code === 200) {
    t.images.push({ url: res.data.url, uid: f.uid });
    t.imageList = t.imageList.map(x => x.uid === f.uid ? { uid: f.uid, url: res.data.url, status: 'success' } : x);
  }
};

const handleTableImageRemove = (f, i) => {
  const t = localTables.value[i];
  t.imageList = t.imageList.filter(x => x.uid !== f.uid);
  t.images = t.images.filter(x => x.uid !== f.uid);
};

watch(() => localModel.value.img, v => (mainImageList.value = v ? [{ url: v }] : []), { immediate: true });
watch(() => localModel.value.images, v => (imagesList.value = (v || []).map(x => ({ url: x }))), { immediate: true });

</script>

<style scoped lang="scss">
.sport-form-wrapper {
  background: #f9fafc;
  padding: 20px;
  border-radius: 8px;
}
</style>
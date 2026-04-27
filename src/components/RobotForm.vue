<template>
  <div class="robot-form">
    <el-divider content-position="left">🤖 机器人固定参数</el-divider>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="最大臂展">
          <el-input v-model="localModel.maxArmSpan" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="最大负载">
          <el-input v-model="localModel.maxWeight" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="轴数">
          <el-input v-model="localModel.switchNum" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="本体重量">
          <el-input v-model="localModel.weight" clearable />
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="固定参数主图">
          <el-upload action="#" :auto-upload="false" :limit="1" :file-list="innerImageList" list-type="picture-card"
            :on-change="handleInnerImageChange" :on-remove="handleInnerImageRemove" :before-upload="beforeUpload">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="产品多图">
          <el-upload action="#" :auto-upload="false" :file-list="imagesList" list-type="picture-card"
            :on-change="handleImagesChange" :on-remove="handleImagesRemove" :limit="10" :before-upload="beforeUpload">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">📋 自定义参数表格</el-divider>
    <div style="margin-bottom:12px">
      <el-button type="success" icon="Plus" @click="addCustomTable">添加表格</el-button>
    </div>

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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElIcon, ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
  tables: { type: Array, required: true },
  uploadTableImageApi: Function,
});

const emit = defineEmits(['update:modelValue', 'update:tables']);
const localModel = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) });
const localTables = computed({ get: () => props.tables, set: v => emit('update:tables', v) });

const innerImageList = ref([]);
const imagesList = ref([]);

const generateUniqueId = () => Date.now() + '' + Math.random();

const addCustomTable = () => localTables.value = [...localTables.value, { name: '', rows: [{ key: '', value: '' }], images: [], imageList: [], key: generateUniqueId() }];
const removeTable = (i) => { const t = [...localTables.value]; t.splice(i, 1); localTables.value = t; };
const addRow = (i) => { const t = [...localTables.value]; t[i].rows.push({ key: '', value: '' }); localTables.value = t; };
const removeRow = (i, j) => { const t = [...localTables.value]; t[i].rows.splice(j, 1); localTables.value = t; };

const beforeUpload = (f) => {
  if (!f.type.startsWith('image/')) return ElMessage.error('只能图片'), false;
  if (f.size > 5 * 1024 * 1024) return ElMessage.error('最大5M'), false;
  return true;
};

const handleTableImageChange = async (f, i) => {
  const t = localTables.value[i];
  const list = [...t.imageList, { ...f, status: 'uploading' }];
  localTables.value[i].imageList = list;
  const fd = new FormData();
  fd.append('file', f.raw);
  const res = await props.uploadTableImageApi(fd);
  if (res.code === 200) {
    t.images.push({ url: res.data.url, uid: f.uid });
    list[list.length - 1] = { uid: f.uid, url: res.data.url, status: 'success' };
    ElMessage.success('ok');
  }
};

const handleTableImageRemove = (f, i) => {
  const t = localTables.value[i];
  t.imageList = t.imageList.filter(x => x.uid !== f.uid);
  t.images = t.images.filter(x => x.uid !== f.uid);
};

const handleInnerImageChange = async (f) => {
  innerImageList.value = [f];
  const fd = new FormData();
  fd.append('file', f.raw);
  const res = await props.uploadTableImageApi(fd);
  if (res.code === 200) {
    localModel.value.img = res.data.url;
    innerImageList.value = [{ url: res.data.url }];
  }
};

const handleInnerImageRemove = () => {
  localModel.value.img = '';
  innerImageList.value = [];
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

watch(() => localModel.value.img, v => {
  innerImageList.value = v ? [{ url: v }] : [];
}, { immediate: true });

watch(() => localModel.value.images, v => {
  imagesList.value = (v || []).map(u => ({ url: u }));
}, { immediate: true });

</script>

<style scoped>
.robot-form { padding: 10px 0; }
</style>
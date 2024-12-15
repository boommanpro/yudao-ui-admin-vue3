<template>
  <div
    ref="editorRef"
    :style="{
      height: computedHeight + 'px',
      width: computedWidth + 'px'
    }"
  ></div>
</template>

<script setup>
import {
  onUnmounted,
  toRefs,
  defineEmits,
  defineProps,
  onMounted,
  ref,
  toRaw,
  watch,
  nextTick
} from "vue";

import { debounce } from "lodash-es"; // 引入lodash的debounce函数
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const emits = defineEmits(["update:modelValue"]);

const props = defineProps({
  height: {
    type: Number,
    default: null
  },
  width: {
    type: Number,
    default: null
  },
  modelValue: {
    type: String,
    default: ""
  },
  language: {
    type: String,
    default: "json"
  },
  theme: {
    type: String,
    default: "vs-dark"
  }
});

const {height, width} = toRefs(props);
const editorRef = ref(null);
const editorInstance = ref(null);

const computedHeight = ref(height.value || 0);
const computedWidth = ref(width.value || 0);

const updateEditorSize = () => {
  const parentRect = editorRef.value.parentElement.getBoundingClientRect();
  computedHeight.value = height.value ?? parentRect.height;
  computedWidth.value = width.value ?? parentRect.width;
};

const debouncedUpdateModelValue = debounce(() => {
  emits("update:modelValue", toRaw(editorInstance.value).getValue());
}, 500); // 防抖时间间隔为500毫秒

async function increment() {
  await nextTick();
  updateEditorSize();
  if (editorRef.value && !editorInstance.value) {
    editorInstance.value = monaco.editor.create(editorRef.value, {
      value: props.modelValue,
      language: props.language,
      theme: props.theme,
      scrollBeyondLastLine: false,
      automaticLayout: true
    });
    editorInstance.value.onDidChangeModelContent(event => {
      debouncedUpdateModelValue(); // 使用防抖后的函数
    });
  }
}

onMounted(() => {
  increment();
});

// 监听外部code变化，更新内部状态
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    let currValue = toRaw(editorInstance.value).getValue();
    if (newVal !== currValue) {
      toRaw(editorInstance.value).setValue(newVal);
    }
  },
  {deep: true}
);
// 清除防抖定时器
onUnmounted(() => {
  debouncedUpdateModelValue.cancel();
});
</script>

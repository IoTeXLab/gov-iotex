<script setup>
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  modelValue: String,
  placeholder: String,
  modal: Boolean
});
const emit = defineEmits(['update:modelValue']);

const router = useRouter();

function handleInput(e) {
  const input = e.target.value;
  if (!props.modal) {
    const { query } = router.currentRoute.value;
    router.push({
      query: input ? { ...query, q: input } : { ...query, q: undefined }
    });
  }
  emit('update:modelValue', input);
}

function clearInput() {
  if (!props.modal) {
    const { query } = router.currentRoute.value;
    router.push({ query: { ...query, q: undefined } });
  }
  emit('update:modelValue', '');
}
</script>

<template>
  <div
    class="d-flex flex-items-center"
    :class="{ 'bg-color border-bottom py-3 px-4': modal }"
  >
    <Icon name="search" size="22" class="mb-1 mr-2 text-color" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="border-0 input flex-auto width-full"
    />
    <a @click="clearInput">
      <Icon v-if="modelValue" name="close" size="12" class="mb-1" />
    </a>
  </div>
</template>

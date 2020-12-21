<template>
  <div
    :class="{ 'active-pan': isActivePan }"
    :style="style"
    class="html-pan"
    @click="setActivePan('html')">
    <div class="pan-head">
      <el-dropdown trigger="click" @command="setTransformer">
        <span class="el-dropdown-link">
          {{ humanlizedTransformerName }} <i class="el-icon-caret-bottom el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="html">HTML</el-dropdown-item>
          <el-dropdown-item command="pug">Pug</el-dropdown-item>
          <el-dropdown-item command="markdown">Markdown</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <compiled-code-switcher v-if="html.code" type="html"></compiled-code-switcher>
    </div>
    <textarea ref="editor">{{ html.code }}</textarea>
    <pan-resizer :enable="enableResizer" pan="html" />
  </div>
</template>

<script>
  import createPan from '@/utils/create-pan';

  export default createPan({
    name:   'html',
    editor: {
      mode:          'htmlmixed',
      autoCloseTags: true,
    },
  });
</script>

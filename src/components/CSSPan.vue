<template>
  <div
    :class="{ 'active-pan': isActivePan }"
    :style="style"
    class="css-pan"
    @click="setActivePan('css')">
    <div class="pan-head">
      <el-dropdown trigger="click" @command="setTransformer">
        <span class="el-dropdown-link">
          {{ humanlizedTransformerName }} <i class="el-icon-caret-bottom el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="css">CSS</el-dropdown-item>
          <el-dropdown-item command="cssnext">cssnext</el-dropdown-item>
          <el-dropdown-item command="less">LESS</el-dropdown-item>
          <el-dropdown-item command="sass">SASS</el-dropdown-item>
          <el-dropdown-item command="scss">SCSS</el-dropdown-item>
          <el-dropdown-item command="stylus">Stylus</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="pan-head-right">
        <compiled-code-switcher v-if="css.code" type="css"></compiled-code-switcher>
      </div>
    </div>
    <textarea ref="editor">{{ css.code }}</textarea>
    <pan-resizer :enable="enableResizer" pan="css" />
  </div>
</template>

<script>
  import createPan from '@/utils/create-pan';

  export default createPan({
    name:   'css',
    editor: {
      mode:              'css',
      autoCloseBrackets: true,
    },
  });
</script>

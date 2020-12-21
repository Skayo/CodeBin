<template>
  <div
    :class="{'active-pan': isActivePan}"
    :style="style"
    class="console-pan"
    @click="setActivePan('console')">
    <div class="pan-head">
      <el-badge
        :max="99"
        :value="logs.length">
        Console
      </el-badge>
      <el-button
        v-show="logs.length"
        icon="el-icon-delete"
        size="mini"
        @click="clearLogs">
        Clear
      </el-button>
    </div>
    <div ref="console" class="console-logs">
      <div
        v-for="(log, index) in logs"
        :key="index"
        :class="`console-log-${log.type}`"
        class="console-log cm-s-default"
        v-html="log.message">
      </div>
    </div>
    <pan-resizer :enable="enableResizer" pan="console" />
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import { Badge, Button } from 'element-ui';
  import panPosition from '@/utils/pan-position';
  import PanResizer from '@/components/PanResizer.vue';
  import { hasNextPan } from '@/utils';
  import '@/utils/highlight';
  import Event from '@/utils/event';

  export default {
    data() {
      return {
        style: {},
      };
    },
    watch:      {
      logs() {
        const { console } = this.$refs;
        this.$nextTick(() => {
          console.scrollTop = console.scrollHeight;
        });
      },
      visiblePans: {
        immediate: true,
        handler(val) {
          this.style = panPosition(val, 'console');
        },
      },
    },
    mounted() {
      Event.$on(`set-console-pan-style`, style => {
        this.style = {
          ...this.style,
          ...style,
        };
      });
    },
    computed:   {
      ...mapState(['logs', 'visiblePans', 'activePan']),
      enableResizer() {
        return hasNextPan(this.visiblePans, 'console');
      },
      isActivePan() {
        return this.activePan === 'console';
      },
    },
    methods:    {
      ...mapActions(['clearLogs', 'setActivePan']),
    },
    components: {
      'el-badge':    Badge,
      'el-button':   Button,
      'pan-resizer': PanResizer,
    },
  };
</script>

<style lang="stylus" scoped>
  .console-logs
    height: calc(100% - 40px)
    overflow: auto

  .console-log
    white-space: pre
    font-size: 13px
    padding: 10px
    border-bottom: 1px solid #efefef

  .console-log-error
    color: red
</style>

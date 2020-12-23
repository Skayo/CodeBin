<template>
  <div
    class="output-pan"
    :class="{ 'active-pan': isActivePan }"
    @click="setActivePan('output')"
    :style="style">

    <div class="pan-head">
      Output
    </div>
    <div class="output-iframe" id="output-iframe">
      <div id="output-iframe-holder"></div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { getHumanlizedTransformerName, getFileExtByTransformer } from '@/utils'
import axios from 'axios'
import notie from 'notie'
import * as transform from '@/utils/transform'
import createIframe from '@/utils/iframe'
import Event from '@/utils/event'
import panPosition from '@/utils/pan-position'
import getScripts from '@/utils/get-scripts'
import api from '@/utils/github-api'
import proxyConsole from '!raw-loader!babel-loader?presets[]=babili&-babelrc!buble-loader!@/utils/proxy-console'
import SvgIcon from './SvgIcon.vue'

const sandboxAttributes = [
  'allow-modals',
  'allow-forms',
  'allow-pointer-lock',
  'allow-popups',
  'allow-same-origin',
  'allow-scripts'
]

const replaceQuote = str => str.replace(/__QUOTE_LEFT__/g, '<')

const createElement = tag => (content = '', attrs = {}) => {
  attrs = Object.keys(attrs)
    .map(key => {
      return `${key}="${attrs[key]}"`
    })
    .join(' ')
  return replaceQuote(
    `__QUOTE_LEFT__${tag} ${attrs}>${content}__QUOTE_LEFT__/${tag}>`
  )
}

const makeGist = (data, { showPans, activePan }) => {
  const files = {}

  if (data.html.code)
    files['index.' + getFileExtByTransformer(data.html.transformer)] = {
      content: data.html.code
    }

  if (data.css.code)
    files['style.' + getFileExtByTransformer(data.css.transformer)] = {
      content: data.css.code
    }

  if (data.js.code)
    files['main.' + getFileExtByTransformer(data.js.transformer)] = {
      content: data.js.code
    }

  files['codebin.json'] = {
    content: JSON.stringify({
      showPans,
      activePan
    })
  }

  return files
}

export default {
  name: 'output-pan',
  data() {
    return {
      style: {}
    }
  },
  watch: {
    visiblePans: {
      immediate: true,
      handler(val) {
        this.style = panPosition(val, 'output')
      }
    }
  },
  computed: {
    ...mapState([
      'js',
      'css',
      'html',
      'visiblePans',
      'activePan',
      'githubToken',
      'iframeStatus'
    ]),
    ...mapGetters([
      'isLoggedIn',
      'canUpdateGist'
    ]),
    isActivePan() {
      return this.activePan === 'output'
    }
  },
  mounted() {
    this.iframe = createIframe({
      el: document.getElementById('output-iframe-holder'),
      sandboxAttributes
    })

    window.addEventListener('message', this.listenIframe)
    Event.$on('run', () => this.run())
    Event.$on(`set-output-pan-style`, style => {
      this.style = {
        ...this.style,
        ...style
      }
    })
    Event.$on('save-gist', saveNew => {
      this.saveGist({ token: this.githubToken, saveNew })
    })
  },
  beforeDestroy() {
    window.removeEventListener('message', this.listenIframe)
  },
  methods: {
    ...mapActions([
      'addLog',
      'clearLogs',
      'setActivePan',
      'setBoilerplate',
      'editorSaved',
      'editorSaving',
      'editorSavingError',
      'setIframeStatus',
      'transform'
    ]),
    getHumanlizedTransformerName,

    async listenIframe({ data = {} }) {
      if (data.type === 'iframe-error') {
        this.addLog({ type: 'error', message: data.message.trim() })
        this.setIframeStatus('error')
      } else if (data.type === 'codebin-console') {
        if (data.method === 'clear') {
          this.clearLogs()
        } else {
          this.addLog({ type: data.method, message: data.args.join('') })
        }
      } else if (data.type === 'codebin-make-output-active') {
        this.setActivePan('output')
      } else if (data.type === 'codebin-set-boilerplate' && data.boilerplate) {
        await this.setBoilerplate(JSON.parse(data.boilerplate))
        Event.$emit('refresh-editor')
      } else if (data.type === 'iframe-success') {
        this.setIframeStatus('success')
      }
    },

    async run() {
      this.setIframeStatus('loading')
      let js
      // We may add preprocessors supports for html/css in the future
      let html
      let css
      const scripts = []

      await this.transform(true)

      try {
        await Promise.all([
          transform.js(this.js)
            .then(code => getScripts(code, scripts))
            .then(code => {
              js = code
            }),
          transform.html(this.html)
            .then(code => {
              html = code
            }),
          transform.css(this.css)
            .then(code => {
              css = code
            })
        ])

        js = js.replace(/<\/script>/, '<\\/script>')
        js = `
          try {
            ${js}
          } catch (err) {
            window.parent.postMessage(
              {
                type: 'iframe-error',
                message: err instanceof Error ? (err.frame ? err.message + '\\n' + err.frame : err.stack) : err
              },
              '*'
            )
          }
        `
        js = `
          if (window.Vue && window.Vue.config) {
            window.Vue.config.productionTip = false;
          }
          console.clear();
          document.addEventListener('DOMContentLoaded', __executeCodeBin);
          function __executeCodeBin(){
            window.parent.postMessage({ type: 'iframe-success' }, '*');
            let script = document.createElement('script');
            script.innerHTML = ${JSON.stringify(js)};
            document.body.appendChild(script);
          };`
      } catch (err) {
        this.setIframeStatus('error')
        return this.addLog({
          type: 'error',
          message: err.frame ? `${err.message}\n${err.frame}` : err.stack
        })
      }

      await this.transform(false)

      const headStyle = createElement('style')(css)
      const codeBinRuntime = createElement('script')(`
        window.process = window.process || { env: { NODE_ENV: 'development' } }
        `) +
        scripts
          .map(script =>
            createElement('script')('', {
              src: `https://bundle.run/${script.module}${script.path}?name=${
                script.name
              }`
            })
          )
          .join('\n') +
        createElement('script')(proxyConsole)
      const head = headStyle + codeBinRuntime

      const body =
        html +
        createElement('script')(js)

      this.iframe.setHTML({
        head,
        body
      })
    },

    /**
     * Save gist
     * When you are not logged in (no github token) it saves as guest gist
     * Otherwise it creates or updates gist
     */
    async saveGist({ token, saveNew } = {}) {
      this.editorSaving()
      let files = makeGist(
        {
          js: this.js,
          css: this.css,
          html: this.html
        },
        {
          showPans: this.visiblePans,
          activePan: this.activePan
        }
      )
      const shouldUpdateGist = this.canUpdateGist && !saveNew && this.$route.params.gist
      if (shouldUpdateGist) {
        const { files: oldFiles } = await api({
          endpoint: `gists/${this.$route.params.gist}`,
          token
        })
        if (!oldFiles) this.editorSavingError();

        Object.keys(oldFiles).forEach(key => {
          if (!files.hasOwnProperty(key)) files[key] = null; // Remove old and unused files
        });
      }
      const endpoint = `gists${
        shouldUpdateGist ?
        `/${this.$route.params.gist}` :
        ''
      }`
      const method = shouldUpdateGist ? 'PATCH' : 'POST'
      const data = await api({
        method,
        endpoint,
        token,
        data: {
          public: false,
          files
        }
      })
      if (!data) this.editorSavingError();

      if (shouldUpdateGist) {
        this.editorSaved()
      } else {
        this.$router.push(`/gist/${data.id}`)
        if (token) {
          // Update gist id in the description of newly created gist
          api({
            method: 'PATCH',
            endpoint: `gists/${data.id}`,
            token,
            data: {
              description: `Try it online! https://bin.skayo.dev/gist/${data.id}`
            }
          }).catch(err => console.error(err))
        }
      }
    }
  },
  components: {
    SvgIcon
  }
}
</script>

<style lang="stylus" scoped>
$statusSize = 12px

.output-pan
  overflow: hidden

.output-iframe
  width: 100%
  height: calc(100% - 40px)
  &.disable-mouse-events
    pointer-events: none
</style>

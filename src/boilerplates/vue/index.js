export default async () => {
  const [htmlCode, jsCode] = await Promise.all([
    import('!raw-loader!./codebin.html'),
    import('!raw-loader!./codebin.js')
  ])

  return {
    js: {
      code: jsCode,
      transformer: 'vue-jsx'
    },
    html: {
      code: htmlCode,
      transformer: 'html'
    },
    showPans: ['html', 'js', 'output']
  }
}

export default async () => {
  const [htmlCode, jsCode] = await Promise.all([
    import('!raw-loader!./codebin.html'),
    import('!raw-loader!./codebin.js')
  ])

  return {
    html: {
      code: htmlCode,
      transformer: 'html'
    },
    js: {
      code: jsCode,
      transformer: 'babel'
    },
    showPans: ['js', 'output']
  }
}

export default async () => {
  const jsCode = await import('!raw-loader!./codebin.js')

  return {
    js: {
      code: jsCode,
      transformer: 'babel'
    },
    showPans: ['js', 'console']
  }
}

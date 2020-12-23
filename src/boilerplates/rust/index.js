export default async () => {
  return {
    js: {
      code: await import('!raw-loader!./codebin.rs'),
      transformer: 'rust'
    },
    showPans: ['js', 'console']
  }
}

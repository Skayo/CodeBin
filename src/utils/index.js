export function hasNextPan(pans, pan) {
  return pans.length - 1 > pans.indexOf(pan)
}

const transformers = {
  html:             ['HTML',           'htmlmixed',       'html'],
  pug:              ['Pug',            'pug',             'pug'],
  markdown:         ['Markdown',       'markdown',        'md'],
  js:               ['JavaScript',     'jsx',             'js'],
  'vue-jsx':        ['Vue JSX',        'jsx',             'vue'],
  babel:            ['Babel',          'jsx',             'jsx'],
  jsx:              ['JSX',            'jsx',             'jsx'],
  css:              ['CSS',            'css',             'css'],
  reason:           ['Reason',         'mllike',          're'],
  'coffeescript-2': ['CoffeeScript 2', 'coffeescript',    'coffee'],
  cssnext:          ['cssnext',        'css',             'pcss'],
  less:             ['LESS',           'text/x-less',     'less'],
  typescript:       ['TypeScript',     'text/typescript', 'ts'],
  sass:             ['SASS',           'text/x-sass',     'sass'],
  scss:             ['SCSS',           'text/x-scss',     'scss'],
  rust:             ['Rust',           'rust',            'rs'],
  stylus:           ['Stylus',         'text/x-styl',     'styl']
}

export const getHumanlizedTransformerName = transformer => transformers[transformer] ? transformers[transformer][0] : transformer

export const getEditorModeByTransformer = transformer => transformers[transformer] ? transformers[transformer][1] : undefined

export const getFileExtByTransformer = transformer => transformers[transformer] ? transformers[transformer][2] : undefined

export const getTransformerByFileExt = fileExt => Object.keys(transformers).find(transformer => transformers[transformer][2] === fileExt)

export const inIframe = window.self !== window.top

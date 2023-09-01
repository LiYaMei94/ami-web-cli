// https://prettier.io/docs/en/options.html#tabs
module.exports = {
  bracketSpacing: true, //对象括号中的空格
  semi: true, //是否使用分号
  singleQuote: true, //是否使用单引号
  trailingComma: 'none', //末尾逗号
  printWidth: 150, //换行
  tabWidth: 2, //缩进
  useTabs: false, //使用空格代替tab缩进
  quoteProps: 'as-needed', //仅在必需时为对象的key添加引号
  jsxSingleQuote: true, // jsx中使用单引号
  arrowParens: 'always', //单参数箭头函数参数周围使用圆括号-eg: (x) => x
  requirePragma: false, //无需顶部注释即可格式化
  insertPragma: false, //在已被preitter格式化的文件顶部加上标注
  vueIndentScriptAndStyle: false, //不对vue中的script及style标签缩进
  embeddedLanguageFormatting: 'auto', //对引用代码进行格式化
  htmlWhitespaceSensitivity: 'ignore'
};

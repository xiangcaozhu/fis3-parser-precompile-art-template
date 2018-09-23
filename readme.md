# fis3-parser-precompile-art-template
根据官方最新的art-template@4.x内置的recompile方法，借鉴官方的art-template-loader和fis3官方插件规范编写。
## 预编译
通过这个插件，把`.tpl`或`.art`等自定义的模板文件，编译成js文件，如果`fis.match()`中设置了`isMod:true`,将编译产出的文件按照commonjs规范，导出编译后的渲染函数，如：
``` js
module.exports = function () {}
```
再经过fis3的自动包裹成符合`mod.js`模块加载器的前端规范：
``` js
define('src/components/table.tpl',function(require, exports, module){
    module.exports = function () {}
})
```
## 配置
fis-config.js文件中添加如下配置(支持template.defaults中所以的设置)：
``` js
fis.match('*.{tpl, art}', {
    rExt: '.js',
    isMod: true,
    parser:fis.plugin('precompile-art-template',{
        sourceMap: false,
        minimize: false,
        compileDebug: false,
        escape: false,
        cache: false,
        // 导入的模板运行时变量
        imports: 'art-template/lib/runtime'
    })
});
```
## 使用

> npm install fis3-parser-precompile-art-template

在需要引入的页面中，引入模板文件,这样做的目的是，在浏览器中，可以不依赖与`art-template`库，直接在浏览器中运行，相比于使用`template-web.js`在浏览器中运行时编译，提高性能，特别是在ie8这样的低版本浏览器，效果更明显。
``` js
var renderTable = require('../../components/table/table.tpl');
// 返回的直接就是渲染函数
var tableHtml = renderTable({
    title:'表格标题'
})
// 插入到文档页面中
$('body').append(tableHtml);
```

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
        cache: false
    })
});
```
## 使用

> npm install fis3-parser-precompile-art-template -g (全局安装)
> npm install fis3-parser-precompile-art-template -D （项目开发安装）

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

## 编译后
这是一个`tableCol.tpl`模板经过`fis3-parser-precompile-art-template`插件处理后的，返回一个渲染函数，这个函数不需要依赖`art-template`库，但内部运行需要`art-template/lib/runtime`，这个运行时环境插件也会帮我们打包好，无需关系。
``` js
define('src/components/table/tableCol.tpl', function(require, exports, module) {

  var $imports = require("node_modules/art-template/lib/runtime");
  module.exports = function ($data) {
      'use strict';
      $data = $data || {};
      var $$out = '', caption = $data.caption, $escape = $imports.$escape, $each = $imports.$each, theads = $data.theads, item = $data.item, headIndex = $data.headIndex, tbodys = $data.tbodys, row = $data.row, bodyIndex = $data.bodyIndex, value = $data.value, key = $data.key;
      $$out += '<div class="table-wrap"> ';
      if (caption) {
          $$out += ' <h5>';
          $$out += $escape(caption);
          $$out += '</h5> ';
      }
      $$out += ' <table class="table table-bordered table-hover table-condensed" role="gird"><thead><tr> ';
      $each(theads, function (item, headIndex) {
          $$out += ' <th>';
          $$out += $escape(item.title);
          $$out += '</th> ';
      });
      $$out += ' </tr></thead><tbody> ';
      $each(tbodys, function (row, bodyIndex) {
          $$out += ' <tr> ';
          $each(theads, function (item, headIndex) {
              $$out += ' ';
              $each(row, function (value, key) {
                  $$out += ' ';
                  if (key === item.name) {
                      $$out += ' <td>';
                      $$out += row[item.name];
                      $$out += '</td> ';
                  }
                  $$out += ' ';
              });
              $$out += ' ';
          });
          $$out += ' </tr> ';
      });
      $$out += ' </tbody></table></div>';
      return $$out;
  };
});


```
> 注意：模板函数内部`$imports`变量，依赖运行时`runtime`，而`runtime`时靠插件内部`precompile`来静态分析的，所以使用该插件时候，除了要在全局（-g）中安装外，项目（-D）里面也需要，才能保证最终分析出`runtime`路径:`var $imports = require("node_modules/art-template/lib/runtime");`

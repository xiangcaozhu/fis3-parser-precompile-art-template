
const path = require('path');
const template = require('art-template');
const precompile = require('art-template/lib/precompile');
const runtime = require('art-template/lib/runtime');
const _ = fis.util;
/**
 * Compile 阶段插件接口
 * @param  {string} content     文件内容
 * @param  {File}   file        fis 的 File 对象 [fis3/lib/file.js]
 * @param  {object} settings    插件配置属性
 * @return {string}             处理后的文件内容
 */
module.exports = function (content, file, settings) {
    // 不处理空文件，处理空文件有人反馈报错。
    if (!content || !content.trim() || file.basename[0] === '_') {
        return content;
    }
    // 初始化配置
    let result;
    // 默认与自定义配置合并
    let options = _.assign({
        filename: path.basename(file.realpath),
        imports: runtime,
        syncImport: true,
        relativeUrls: true
    }, settings);
    // 自定义minimize存在，就用自定义的
    if (options.minimize) {
        template.defaults.minimize = options.minimize;
    }
    // 自定义compileDebug存在，就用自定义的
    if (options.compileDebug) {
        template.defaults.compileDebug = options.compileDebug;
    }
    // 自定义escape存在，就用自定义的
    if (options.escape) {
        template.defaults.escape = options.escape;
    }
    // 自定义cache存在，就用自定义的
    if (options.cache) {
        template.defaults.cache = options.cache;
    }
    // 自定义rules存在，就用自定义的
    if (options.rules && options.rules instanceof Array) {
        template.defaults.rules = options.rules;
    }
    // 自定义ignore存在，就用新增自定义的
    if (options.ignore && options.ignore instanceof Array) {
        // 默认解析规则输入
        options.ignore.push(`require`);
    }
    // 自定义sourceMap存在，就用自定义的
    // 是否产生map源文件
    let sourceMap = options.sourceMap;
    let sourceMapFile;
    if (sourceMap) {
        if (_.isBoolean(sourceMap)) {
            sourceMap = {};
        }
        let sourceMapPath = file.realpath + '.map';
        sourceMapFile = fis.file.wrap(sourceMapPath);
        sourceMapFile.setContent('');
        options.sourceMap = _.assign({
            outputSourceFiles: true,
            sourceMapURL: path.basename(sourceMapFile.url),
            sourceMapBasepath: fis.project.getProjectPath(),
            sourceMapRootpath: '/source',
            sourceMapFileInline: false
        }, sourceMap);
    }
    // content是fis3读取的文件内容
    options.source = content;
    // options.filename = file.filename;
    options.sourceRoot = process.cwd();
    // 预编译模板文件
    try {
        result = precompile(options);
    } catch (error) {
        throw error;
    }
    // art-template编译出来的源文件
    const templateCode = result.toString();
    // art-template编译产出的映射文件
    const sourceMapResult = result.sourceMap;
    // 未知规则
    // const ast = result.ast;
    // 源文件数据处理
    if (sourceMapFile && sourceMapResult) {
        sourceMapFile.setContent(sourceMapResult.toString());
        file.derived.push(sourceMapFile);
    }
    // 把处理结果返回
    return templateCode;
};
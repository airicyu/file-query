'use strict';

const os = require('os');
const isWindow = os.type().indexOf('Win')===0 || os.platform().indexOf('win')===0;
const execSync = require('child_process').execSync;

const fs = require('fs');
const fse = require('fs-extra')
const path = require('path');
const jsdom = require('jsdom');
const RepoNode = require('./file-node').RepoNode;
const FileNode = require('./file-node').FileNode;
const html = require("html");
const deasync = require('deasync');

const jquery = fs.readFileSync(path.join(__dirname, "../lib/jquery/dist/jquery.min.js"), "utf-8");

const DEFAULT_OPTIONS = {
    debug: false
}

const fileQuery = function (options, callback) {

    if (typeof options === 'string') {
        let rootDir = options;
        options = {
            repos: {
                'DEFAULT_REPO': {
                    rootDir: rootDir
                }
            }
        }
    }
    for(var k in DEFAULT_OPTIONS){
        if (!options.hasOwnProperty(k)){
            options[k] = DEFAULT_OPTIONS[k];
        }
    }

    jsdom.env(
        '<root></root>', {
            src: [jquery],
            done: function (err, window) {
                var $ = window.$;
                wrapPlugin($, options);
                $.fileQuery('refresh');
                return callback(null, $);
            }
        });
};

function wrapPlugin($, options) {

    var fileQueryPluginFn = {
        rename: null,
        renameSync: null,
        moveToDir: null,
        moveToDirSync: null,
        copyToDir: null,
        CopyToDirSync: null,
        delete: null,
        deleteSync: null,
        newDir: null,
        newDirSync: null,
        searchInFiles: null,
        searchInFilesSync: null,

        options: null,
        option: null,
        refresh: null,
        prettyDom: null,
        debug: null
    };

    fileQueryPluginFn.renameSync = function (newName) {
        $.each(this, function (i, em) {
            var oldPath = $(em).attr('filePath');

            var name = newName;
            var dirName = $(em).attr('dirName');
            var filePath = path.join(dirName, name);
            var baseExt = path.extname(filePath);
            var baseName = path.basename(filePath, baseExt);

            var newPath = filePath;

            try {
                fs.renameSync(oldPath, newPath);

                $(em).attr('name', name);
                $(em).attr('dirName', dirName);
                $(em).attr('filePath', filePath);
                $(em).attr('baseExt', baseExt);
                $(em).attr('baseName', baseName);

                $("dir,file", em).each(function (j, emChild) {
                    var childDir = $(emChild).attr('dirName');
                    if (childDir.indexOf(oldPath) === 0) {
                        childDir = childDir.replace(oldPath, newPath);
                    }
                    var childName = $(emChild).attr('name');
                    var childPath = path.join(childDir, childName);
                    $(emChild).attr('dirName', childDir);
                    $(emChild).attr('filePath', childPath);
                });
            } catch (e) {
                options.debug && console.error('file-query: filepath[' + oldPath + '] rename to filename[' + newName + '] error', e);
                throw e;
            }
            options.debug && console.log('file-query: filepath[' + oldPath + '] renamed to filename[' + newName + ']');
        });
        return this;
    };

    fileQueryPluginFn.moveToDirSync = function (dest) {
        $.each(this, function (i, em) {
            let oldPath = $(em).attr('filePath');
            let name = $(em).attr('name')
            let newPath;

            if (typeof dest === 'string') {
                newPath = path.join(dest, name);
            } else if (typeof dest === 'object') {
                newPath = path.join($(dest).attr('filepath'), name);
            }
            newPath = newPath.replace(/\\/g, '/');

            let dirName = path.dirname(newPath);
            let baseExt = path.extname(newPath);
            let baseName = path.basename(newPath, baseExt);

            try {
                fse.ensureDirSync(path.normalize(dirName));
                if (isWindow){
                    try{
                        let normalizedOldPath = path.normalize(oldPath);
                        let normalizedNewPath = path.normalize(newPath);
                        fs.accessSync(normalizedOldPath, 'r');
                        execSync('MOVE /Y "'+normalizedOldPath+'" "'+normalizedNewPath+'"');
                    } catch(e){
                        if (e.errno !== -4058){
                            console.log(e);
                            throw e;
                        }
                    }
                } else {
                    fs.renameSync(oldPath, newPath);
                }

                $(em).attr('name', name);
                $(em).attr('dirName', dirName);
                $(em).attr('filePath', newPath);
                $(em).attr('baseExt', baseExt);
                $(em).attr('baseName', baseName);

                $(em).remove();
                
                var baseElem = $('repo[filePath="'+dirName+'"]').length >= 1 ?
                    $('repo[filePath="'+dirName+'"]').first() : 
                    $('dir[filePath="'+dirName+'"]').first();
                baseElem.append($(em));

                $("dir,file", em).each(function (j, emChild) {
                    let childDir = $(emChild).attr('dirName');
                    if (childDir.indexOf(oldPath) === 0) {
                        childDir = childDir.replace(oldPath, newPath);
                    }
                    let childName = $(emChild).attr('name');
                    let childPath = path.join(childDir, childName);
                    $(emChild).attr('dirName', childDir);
                    $(emChild).attr('filePath', childPath);
                });
            } catch (e) {
                options.debug && console.error('file-query: filepath[' + oldPath + '] move to filepath[' + newPath + '] error', e);
                throw e;
            }
            options.debug && console.log('file-query: filepath[' + oldPath + '] moved to filepath[' + newPath + ']');
        });
        return this;
    }

    fileQueryPluginFn.copyToDirSync = function (dest) {
        $.each(this, function (i, em) {
            let oldPath = $(em).attr('filePath');
            let name = $(em).attr('name')
            let newPath;

            if (typeof dest === 'string') {
                newPath = path.join(dest, name);
            } else if (typeof dest === 'object') {
                newPath = path.join($(dest).attr('filepath'), name);
            }
            newPath = newPath.replace(/\\/g, '/');

            let dirName = path.dirname(newPath);
            let baseExt = path.extname(newPath);
            let baseName = path.basename(newPath, baseExt);

            try {
                fse.ensureDirSync(path.normalize(dirName));
                fse.copySync(oldPath, newPath);

                var baseElem = $('repo[filePath="'+dirName+'"]').length >= 1 ?
                    $('repo[filePath="'+dirName+'"]').first() : 
                    $('dir[filePath="'+dirName+'"]').first();
                baseElem.append(new FileNode(newPath).toJQDom($));
            } catch (e) {
                options.debug && console.error('file-query: filepath[' + oldPath + '] move to filepath[' + newPath + '] error', e);
                throw e;
            }
            options.debug && console.log('file-query: filepath[' + oldPath + '] moved to filepath[' + newPath + ']');
        });
        $.fileQuery('refresh');
        return this;
    }

    fileQueryPluginFn.deleteSync = function () {
        $.each(this, function (i, em) {
            let filePath = $(em).attr('filePath');
            try {
                if (isWindow){
                    try{
                        fs.accessSync(filePath, 'r');
                        let normalizedPath = path.normalize(filePath);
                        let stats = fs.statSync(normalizedPath);
                        if (stats.isDirectory()){
                            execSync(normalizedPath.substr(0,2) + ' & DEL /Q /S /F "'+normalizedPath +'" 1>nul');
                            execSync(normalizedPath.substr(0,2) + ' & RMDIR /Q /S "'+normalizedPath+'"');
                        } else if (stats.isFile()){
                            execSync(normalizedPath.substr(0,2)+' & DEL /Q /F "'+normalizedPath+'"');
                        }
                    } catch(e){
                        if (e.errno !== -4058){
                            console.log(e);
                            throw e;
                        }
                    }
                } else {
                    fs.unlinkSync(filePath);
                }
                
                $(em).remove();
            } catch (e) {
                options.debug && console.error('file-query: filepath[' + filePath + '] delete error', e);
                throw e;
            }
            options.debug && console.log('file-query: filepath[' + filePath + '] deleted');
        });
        return $;
    }

    fileQueryPluginFn.newDirSync = function (dirName) {
        $.each(this, function (i, em) {
            if ($(em).attr('isDir') === 'false') {
                return;
            }
            let dirPath = path.join($(em).attr('filePath'), dirName)
            try {
                fs.mkdirSync(dirPath);
                $(em).append(new FileNode(dirPath).toJQDom($));
            } catch (e) {
                options.debug && console.error('file-query: newDir[' + dirPath + '] error', e);
                throw e;
            }
            options.debug && console.log('file-query: newDir[' + dirPath + ']');
        });
        return this;
    }

    fileQueryPluginFn.searchInFilesSync = function (searchKey, searchOptions) {
        searchOptions = searchOptions || {};
        var defaultSearchOptions = {
            encoding: 'utf8'
        }
        for(var k in defaultSearchOptions){
            if (!searchOptions.hasOwnProperty(k)){
                searchOptions[k] = defaultSearchOptions[k];
            }
        }

        let processedNode = {};
        let results = [];
        let searchBase = this.find('file');
        if ($(this).attr('isFile')==='true'){
            searchBase = searchBase.add(this);
        }

        searchBase.each(function (i, em) {
            let filePath = $(em).attr('filePath');
            if (processedNode[filePath]) {
                return;
            }

            processedNode[filePath] = true;

            let content = '';
            try {
                content = fs.readFileSync(filePath, searchOptions.encoding);
            } catch (e) {
                options.debug && console.error('file-query: searchInFilesSync file[' + filePath + '] error', e);
                throw e;
            }

            if (typeof searchKey === 'string') {
                if (content.indexOf(searchKey) !== -1) {
                    results.push(em);
                }
            } else if (typeof searchKey === 'object' && searchKey instanceof RegExp) {
                if (content.match(searchKey)) {
                    results.push(em);
                }
            }
        });

        return $(results);
    }

    fileQueryPluginFn.options = function () {
        if (arguments.length === 0) {
            return options;
        } else {
            options = $.extend(options, arguments[0]);
            return options;
        }
    }

    fileQueryPluginFn.option = function () {
        if (arguments.length === 2) {
            options[arguments[0]] = arguments[1];
            return this;
        } else if (arguments.length === 1) {
            return options[arguments[0]];
        }
    }

    fileQueryPluginFn.refresh = function () {
        $('root').empty();
        for (let repoKey in options.repos) {
            let repo = options.repos[repoKey];
            let repoNode = new RepoNode(repo.rootDir, repoKey);
            $('root').append(repoNode.toJQDom($));
        }
        return $('root');
    }

    fileQueryPluginFn.prettyDom = function () {
        return html.prettyPrint($('root').html(), {
            indent_size: 4
        });
    }

    fileQueryPluginFn.debug = function (isDebug) {
        options.debug = isDebug;
        return this;
    }

    fileQueryPluginFn.rename = function (newName) {
        let self = this;
        let args = arguments;
        return new Promise(function (resolve, reject) {
            try {
                var context = self.renameSync.apply(self, args);
                resolve(context);
            } catch (e) {
                reject(e);
            }
        });
    }
    fileQueryPluginFn.moveToDir = function (dest) {
        let self = this;
        let args = arguments;
        return new Promise(function (resolve, reject) {
            try {
                var context = self.moveToDirSync.apply(self, args);
                resolve(context);
            } catch (e) {
                reject(e);
            }
        });
    }
    fileQueryPluginFn.copyToDir = function (dest) {
        let self = this;
        let args = arguments;
        return new Promise(function (resolve, reject) {
            try {
                var context = self.copyToDirSync.apply(self, args);
                resolve(context);
            } catch (e) {
                reject(e);
            }
        });
    }
    fileQueryPluginFn.delete = function () {
        let self = this;
        let args = arguments;
        return new Promise(function (resolve, reject) {
            try {
                self.deleteSync.apply(self, args);
                resolve($);
            } catch (e) {
                reject(e);
            }
        });
    }
    fileQueryPluginFn.newDir = function (dirName) {
        let self = this;
        let args = arguments;
        return new Promise(function (resolve, reject) {
            try {
                var context = self.newDirSync.apply(self, args);
                resolve(context);
            } catch (e) {
                reject(e);
            }
        });
    }

    fileQueryPluginFn.searchInFiles = function (searchKey, searchOptions) {
            let self = this;
            let args = arguments;
            return new Promise(function (resolve, reject) {
                try {
                    var context = self.searchInFilesSync.apply(self, args);
                    resolve(context);
                } catch (e) {
                    reject(e);
                }
            });
        }
        
    $.fn.fileQuery = function (method) {
        if (fileQueryPluginFn[method]) {
            let args = Array.prototype.slice.call(arguments, 1);
            return fileQueryPluginFn[method].apply(this, args);
        }
    }

    /*
     * inject the alias functions:
     * $.fileQuery() => $().fileQuery() 
     */
    $.fileQuery = $().fileQuery.bind($)

    /*
     * inject the alias functions:
     * $.rename => $.fileQuery('rename')
     */
    for (let fnName in fileQueryPluginFn) {
        $.fn[fnName] = function () {
            return this.fileQuery.bind(this, fnName).apply(this, arguments);
        }
        $[fnName] = $().fileQuery.bind($, fnName);
    }
}

var fileQuerySync = deasync(fileQuery);

exports = module.exports = {
    fileQuery: fileQuery,
    fileQuerySync: fileQuerySync
}
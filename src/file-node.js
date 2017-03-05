'use strict';

var fs = require('fs');
var path = require('path');

var RepoNode = function(filePath, repoName){
    this.name = repoName;
    this.filePath = path.normalize(filePath).replace(/\\/g, '/');

    this.children = [];
    
    let subDirs = fs.readdirSync(filePath);
    for(let subDir of subDirs){
        this.children.push(new FileNode(filePath+'/'+subDir));
    }
}
RepoNode.prototype.toJQDom = function($){
    var dom = $('<repo>',{
        name : this.name,
        filePath : this.filePath
    });
    
    for(let child of this.children){
        $(dom).append(child.toJQDom($));
    }
    return dom;
}


var FileNode = function(filePath){
    filePath = path.normalize(filePath).replace(/\\/g, '/');;
    let stats = fs.statSync(filePath);

    this.name = path.basename(filePath);
    this.dirName = path.dirname(filePath);
    this.baseExt = stats.isFile() ? path.extname(filePath) : "";
    this.baseName = stats.isFile() ? path.basename(filePath, this.baseExt) : this.name;
    this.filePath = filePath;
    this.isFile = stats.isFile();
    this.isDir = stats.isDirectory();
    this.size = stats.size;
    this.stats = stats;

    this.children = [];
    if (this.isDir){
        let subDirs = fs.readdirSync(filePath);
        for(let subDir of subDirs){
            this.children.push(new FileNode(filePath+'/'+subDir));
        } 
    }
}
FileNode.prototype.toJQDom = function($){
    var elName = this.isDir ? 'dir' : 'file';
    var dom = $('<'+elName+'>',{
        name : this.name,
        dirName : this.dirName,
        baseName : this.baseName,
        baseExt : this.baseExt,
        filePath : this.filePath,
        isFile : this.isFile,
        isDir : this.isDir,
        size : this.size
    });
    if (this.isDir){
        for(let child of this.children){
            $(dom).append(child.toJQDom($));
        }
    }
    return dom;
}

exports = module.exports = {
    RepoNode : RepoNode,
    FileNode : FileNode
}
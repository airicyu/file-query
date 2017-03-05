# file-query

[![npm version](https://img.shields.io/npm/v/file-query.svg)](https://www.npmjs.com/package/file-query)
[![node](https://img.shields.io/node/v/file-query.svg)](https://www.npmjs.com/package/file-query)
[![Codecov branch](https://img.shields.io/codecov/c/github/airicyu/file-query/master.svg)](https://codecov.io/gh/airicyu/file-query)
[![Build](https://travis-ci.org/airicyu/file-query.svg?branch=master)](https://travis-ci.org/airicyu/file-query)

[![GitHub issues](https://img.shields.io/github/issues/airicyu/file-query.svg)](https://github.com/airicyu/file-query/issues)
[![GitHub forks](https://img.shields.io/github/forks/airicyu/file-query.svg)](https://github.com/airicyu/file-query/network)
[![GitHub stars](https://img.shields.io/github/stars/airicyu/file-query.svg)](https://github.com/airicyu/file-query/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/airicyu/file-query/master/LICENSE)
[![dependencies Status](https://david-dm.org/airicyu/file-query/status.svg)](https://david-dm.org/airicyu/file-query)
[![devDependencies Status](https://david-dm.org/airicyu/file-query/dev-status.svg)](https://david-dm.org/airicyu/file-query?type=dev)

This node.js module can map your file directory structure into a virtual XML DOM data-structure. And then you can use jQuery selector feature to manipulate your directories/files.

## Install

```bash
$ npm install --save file-query
```

## Human contact

- Eric Yu: airic.yu@gmail.com

------------------------
## Quick Samples

### Specify base directory
```javascript
var fileQuerySync = require('file-query').fileQuerySync;
var $ = fileQuerySync('D:/temp/baseDir');
```
This would map the target directory "D:/temp/baseDir" as the base working directory. Later on select queries/manipulations would base on this base file path.

The "$" returned from *fileQuerySync* is a jQuery function. You can then query directories/files with this jQuery object by selector syntax.
You can see the jQuery selector document from [here](https://api.jquery.com/category/selectors/)

### 1. Search directories with specific name
```javascript
$('dir[name="d4"]').each(function(i, em){
    let name = $(em).attr('name');
    let filePath = $(em).attr('filePath');
    console.log(`${i+1}: name: ${name}, filePath: ${filePath}`);
});
```
output:
```
1: name: f4, filePath: D:/temp/baseDir/d1/d3/d4
```
The above would try to query file paths and log found results.
The query selector **`dir[name="d4"]`** is a jQuery selector. It means that searching all directory with name "d4" under the baseDir.

### 2. Search File with specific name
```javascript
$('ile[name="f5.txt"]').each(function(i, em){
    let name = $(em).attr('name');
    let filePath = $(em).attr('filePath');
    console.log(`${i+1}: name: ${name}, filePath: ${filePath}`);
});
```
output:
```
1: name: f5.txt, filePath: D:/temp/baseDir/d1/d3/d4/f5.txt
```
The above would is similar to previous sample, but using selector **`file[name="f5.txt"]`** to query file with name "f5.txt".

### 3. Search File name end with ".txt"
```javascript
$(`file[name$=".txt"]`).each(function(i, em){
    let name = $(em).attr('name');
    let filePath = $(em).attr('filePath');
    console.log(`${i+1}: name: ${name}, filePath: ${filePath}`);
});
```
output:
```
1: name: f5.txt, filePath: D:/temp/baseDir/d1/d3/d4/f5.txt
2: name: f3.txt, filePath: D:/temp/baseDir/d1/f3.txt
3: name: f4.txt, filePath: D:/temp/baseDir/d1/f4.txt
4: name: f1.txt, filePath: D:/temp/baseDir/f1.txt
5: name: f2.txt, filePath: D:/temp/baseDir/f2.txt
```
The above sample used selector **`file[name$=".txt"]`** to query file with name attribute end with ".txt".

### 4. Search File name end with ".txt" (by "baseExt" attribute)
```javascript
$(`file[baseExt$=".txt"]`).each(function(i, em){
    let name = $(em).attr('name');
    let filePath = $(em).attr('filePath');
    console.log(`${i+1}: name: ${name}, filePath: ${filePath}`);
});
```
The above sample has the same effect as the previous sample. However, it is using selector **`file[baseExt$=".txt"]`** to query file with "baseExt" attribute equal to ".txt".

------------------------

## File directory to XML DOM mapping
In the concept of file-query module, file directory structure is mapped into a virtual XML DOM structure.
Take this  as example:
root

├─ d1

│...└ d2

│...│..└ foo.txt

│...└ bar.txt

This may mapped into a virtual XML DOM structure like this:

```xml
<repo name="DEFAULT_REPO" filepath="D:/root">
<dir name="folder" dirname="D:/root" basename="d1" baseext="" 
filepath="D:/root/d1" isfile="false" isdir="true" size="0">
    <dir name="d2" dirname="D:/root/d1" 
    basename="d2" baseext="" filepath="D:/root/d1/d2" isfile="false"
    isdir="true" size="0">
        <file name="foo.txt" dirname="D:/root/d1/d2" 
        basename="foo" baseext=".txt" filepath="D:/root/d1/d2/foo.txt" 
        isfile="true" isdir="false" size="10">
        </file>
    </dir>
    <file name="bar.txt" dirname="D:/root/d1" 
    basename="bar" baseext=".txt" filepath="D:/root/d1/bar.txt" 
    isfile="true" isdir="false" size="5">
    </file>
</dir>
</repo>  
```

#### Directories
Directories would map into XML DOM element named `dir`.
It would have below attributes:

| Attribute name | Description   | Example |
| -------------  | ------------- | ------- |
| name           | Directory name | d1 |
| dirname        | Parent directory path | D:/root |
| basename       | Directory name(same as name) | d1 |
| baseext        | (Not used) | |
| filepath       | File path | D:/root/d1 |
| isfile         | Whether this is file | false |
| isDir          | Whether this is directory | true |
| size           | (Not used) | |


#### Files
Files would map into XML DOM element named `file`.
It would have below attributes:

| Attribute name | Description   | Example |
| -------------  | ------------- | ------- |
| name           | File name | bar.txt |
| dirname        | Parent directory path | D:/root/d1 |
| basename       | File base name without extension | bar |
| baseext        | File base extension | .txt |
| filepath       | File path | D:/root/d1/bar.txt |
| isfile         | Whether this is file | true |
| isDir          | Whether this is directory | false |
| size           | File size(bytes) | 5 |


------------------------

## API
File manipulation APIs:
- [rename](#rename)
- [renameSync](#rename)
- [moveToDir](#movetodir)
- [moveToDirSync](#movetodir)
- [copyToDir](#copytodir)
- [copyToDirSync](#copytodir)
- [delete](#delete)
- [deleteSync](#delete)
- [newDir](#newdir)
- [newDirSync](#newdir)
- [searchInFiles](#searchinfiles)
- [searchInFilesSync](#searchinfiles)

Module APIs:
- [options](#options)
- [option](#option)
- [refresh](#refresh)
- [prettyDom](#prettyDom)
- [debug](#debug)

### rename
**rename(newName)**
Rename the selected directories/files with the new Name.
This is async function which return a promise.

**renameSync(newName)**
Sync version of `rename(newName)`.

### moveToDir
**moveToDir(destination)**
Move the selected directories/files to the destination.
Destination can either be a filepath (string type) or jQuery selected dir objecr (object type).
This is async function which return a promise.

**moveToDirSync(destination)**
Sync version of `moveToDir(destination)`.

### copyToDir
**copyToDir(destination)**
Copy the selected directories/files to the destination.
Destination can either be a filepath (string type) or jQuery selected dir objecr (object type).
This is async function which return a promise.

**copyToDirSync(destination)**
Sync version of `copyToDir(destination)`.

### delete
**delete()**
DELETE the selected directories/files. (Use with caution!)
This is async function which return a promise.

**deleteSync()**
Sync version of `delete()`.

### newDir
**newDir(name)**
Create new sub-directory under the selected directories.
This is async function which return a promise.

**newDirSync(name)**
Sync version of `newDir(name)`.

### searchInFiles
**searchInFiles(searchKey, searchOption)**
Search through all selected files for the target search keywords.
`searchKey` support either plain string key or RegRex object.
Default treating file as utf-8 encoding files.
This is async function which return a promise.

**searchInFilesSync(searchKey, searchOption)**
Sync version of `searchInFiles(searchKey, searchOption)`.

### options
**options()**
Return the module option map. This is sync function.

**options(optionMap)**
Update the module options. This is sync function.

### option
**option(key)**
Return a module option. This is sync function.

**option(key, value)**
Update the module options. This is sync function.

### refresh
**refresh()**
Sometimes file manipulation may make XML DOM structure out-sync. Using this function can refresh the structure. This is sync function.

### prettyDom
**prettyDom()**
Return a pretty-printed(tab size=4) XML DOM structure plain text value. This is sync function.

### debug
**debug(flag)**
Enable or disable debug mode. If in debug mode, file manipulation would log the operation in console. Debug mode is by default disabled.
This is sync function.

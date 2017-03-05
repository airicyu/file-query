'use strict'

var path = require('path');
var fs = require('fs');
var fileQuerySync = require('../index.js').fileQuerySync;
var baseDir = __dirname.replace(/\\/g, '/'); /* notice that we use linux style slash for path */

var $ = fileQuerySync(path.join(baseDir, '/sampleDir'));
$.debug(false);

resetSampleFolder();
console.log('======== Sample 1: Search directory with name ========');
console.log('Printing all directory paths which directory name is "d4".\n');

$(`dir[name="d4"]`).each(function(i, em){
    let name = $(em).attr('name');
    let filePath = $(em).attr('filePath');
    console.log(`${i+1}: name: ${name}, filePath: ${filePath}`);
});

console.log('\n\n');



console.log('======== Sample 2: Find files with extension ========');
console.log('Printing all file paths which file name ended with ".txt".\n');

$(`file[baseExt=".txt"]`).each(function(i, em){
    let name = $(em).attr('name');
    let filePath = $(em).attr('filePath');
    console.log(`${i+1}: name: ${name}, filePath: ${filePath}`);
});

console.log('\n\n');



console.log('======== Sample 3: Search files under particular directories ========');
console.log('Printing all file names under directories which named "d4" which is under directory path "${baseDir}/sampleDir/d1".\n');

$(`dir[filePath="${baseDir}/sampleDir/d1"] dir[name="d4"]>file`).each(function(i, em){
    let name = $(em).attr('name');
    let filePath = $(em).attr('filePath');
    console.log(`${i+1}: name: ${name}, filePath: ${filePath}`);
});

console.log('\n\n');

function resetSampleFolder(){
    var _$ = fileQuerySync(baseDir);
    _$('repo>dir[name="sampleDir"]>dir').deleteSync();
    _$('repo>dir[name="sampleDir_backup"]').children('*').copyToDirSync(_$('repo>dir[name="sampleDir"]'));
    $.fileQuery('refresh');
}
console.log($.prettyDom())
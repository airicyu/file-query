'use strict'

var path = require('path');
var fs = require('fs');
var fileQuerySync = require('../index.js').fileQuerySync;
var baseDir = __dirname.replace(/\\/g, '/'); /* notice that we use linux style slash for path */

var $ = fileQuerySync(path.join(baseDir, '/sampleDir'));
$.debug(false);

runSamples();

function runSamples(){
    resetSampleFolder();
    
    console.log('======== Sample 1: Rename files ========');
    sample_renameSync();

    console.log('======== Sample 2: Rename files (Promise) ========');
    sample_rename();

    console.log('======== Sample 3: Move files & Dirs ========');
    sample_moveToDirSync();

    console.log('======== Sample 4: Move files & Dirs (Promise) ========');
    sample_moveToDir();

    console.log('======== Sample 5: Delete files & Dirs ========');
    sample_deleteSync();
    
    console.log('======== Sample 6: Delete files & Dirs (Promise) ========');
    sample_Delete();
    
    console.log('======== Sample 7: Create Dir ========');
    sample_newDirSync();
    
    console.log('======== Sample 8: Create Dir (Promise) ========');
    sample_newDir();

    console.log('======== Sample 9: Search text in files ========');
    resetSampleFolder();
    sample_searchInFilesSync();
    
    console.log('======== Sample 10: Search text in files (Promise) ========');
    sample_searchInFiles();

    resetSampleFolder();
}
/*
        moveToDir: null,
        moveToDirSync: null,
        copyToDir: null,
        CopyToDirSync: null,
        delete: null,
        deleteSync: null,
        newDir: null,
        newDirSync: null,
        searchInFiles: null,
        searchInFilesSync: null,*/

function sample_renameSync(){

    $(`dir[name="sample1"] file[name^="f"]`).each(function(i, em){
        let filePath = $(em).attr('filePath');
        let baseName = $(em).attr('baseName');
        $(em).renameSync(baseName + '_suffix.txt');

        let newPath = $(em).attr('filePath');
        console.log(`${i+1}: filePath: "${filePath}" renamed to "${newPath}"`);
    });
    
    console.log('\n\n');

}







function sample_rename(){

    $(`dir[name="sample2"] file[name^="f"]`).each(function(i, em){
        let filePath = $(em).attr('filePath');
        let baseName = $(em).attr('baseName');

        //here come the promise
        $(em).rename(baseName + '_suffix.txt').then(function(context){
            let newPath = $(em).attr('filePath');
            console.log(`${i+1}: filePath: "${filePath}" renamed to "${newPath}"`);
        });

    });

    console.log('\n\n\n');

}


function resetSampleFolder(){
    var _$ = fileQuerySync(baseDir);
    for(let i=1; i<11; i++){
        _$(`repo>dir[name="sampleDir"]>dir[name="sample${i}"]`).deleteSync();
        _$('repo>dir[name="sampleDir"]').newDirSync('sample'+i);
        var dest = _$(`repo>dir[name="sampleDir"]>dir[name="sample${i}"]`);
        _$('repo>dir[name="sampleDir_backup"]').children('*').copyToDirSync(dest);
    }

    $.fileQuery('refresh');
}
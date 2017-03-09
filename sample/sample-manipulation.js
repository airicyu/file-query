'use strict'
/* This sample using async/await and only be able to run under node.js v7.6.0+ */

var path = require('path');
var fs = require('fs');
var fileQuerySync = require('../index.js').fileQuerySync;
var baseDir = __dirname.replace(/\\/g, '/'); /* notice that we use linux style slash for path */

var $ = fileQuerySync(path.join(baseDir, '/sampleDir'));
$.debug(false);

runSamples();

async function runSamples() {
    resetSampleFolder();

    console.log('======== Sample 1: Rename files ========');
    sample_renameSync();
    console.log('\n\n');

    console.log('======== Sample 2: Rename files (Promise) ========');
    await sample_rename();

    console.log('======== Sample 3: Move files & Dirs ========');
    sample_moveToDirSync();
    console.log('\n\n');

    console.log('======== Sample 4: Move files & Dirs (Promise) ========');
    await sample_moveToDir();
    console.log('\n\n');

    console.log('======== Sample 5: Delete files & Dirs ========');
    sample_deleteSync();

    console.log('======== Sample 6: Delete files & Dirs (Promise) ========');
    await sample_delete();
    console.log('\n\n');

    console.log('======== Sample 7: Create Dir ========');
    sample_newDirSync();

    console.log('======== Sample 8: Create Dir (Promise) ========');
    await sample_newDir();
    console.log('\n\n');

    console.log('======== Sample 9: Search text in files ========');
    sample_searchInFilesSync();

    console.log('======== Sample 10: Search text in files (Promise) ========');
    await sample_searchInFiles();
    console.log('\n\n');

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

function sample_renameSync() {

    $(`dir[name="sample1"] file[name^="f"]`).each(function (i, em) {
        let filePath = $(em).attr('filePath');
        let baseName = $(em).attr('baseName');
        $(em).renameSync(baseName + '_suffix.txt');

        let newPath = $(em).attr('filePath');
        console.log(`${i+1}: filePath: "${filePath}" renamed to "${newPath}"`);
    });

}


async function sample_rename() {

    return Promise.all(
        $(`dir[name="sample2"] file[name^="f"]`).map(function (i, em) {
            let filePath = $(em).attr('filePath');
            let baseName = $(em).attr('baseName');


            //here come the promise
            return $(em).rename(baseName + '_suffix.txt').then(function (context) {
                let newPath = $(em).attr('filePath');
                console.log(`${i+1}: filePath: "${filePath}" renamed to "${newPath}"`);
            });
        })
    );


}


function sample_moveToDirSync() {
    $(`dir[name="sample3"] file[name^="f3"]`).moveToDirSync($('dir[name="sample3"] dir[name="d1"]'))
    $(`dir[name="sample3"] file[name^="f3"]`).moveToDirSync($('dir[name="sample3"] dir[name="d1"]').attr('filepath'))
}


async function sample_moveToDir() {
    return $(`dir[name="sample4"] file[name^="f3"]`).moveToDir($('dir[name="sample4"] dir[name="d1"]')).then(function (context) {
        $.fileQuery('refresh');
    })
}


function sample_deleteSync() {
    $(`dir[name="sample5"] file[name^="f3"]`).deleteSync();
}


async function sample_delete() {
    return $(`dir[name="sample6"] file[name^="f3"]`).delete().then(function (context) {
        $.fileQuery('refresh');
    });
}


function sample_newDirSync() {
    $(`dir[name="sample7"]`).newDirSync('d2')
}

async function sample_newDir() {
    return $(`dir[name="sample8"]`).newDir('d2').then(function (context) {
        $.fileQuery('refresh');
    });
}

function sample_searchInFilesSync() {
    let results = $(`dir[name="sample9"]`).searchInFilesSync('abc')
    console.log('searchInFilesSync "abc" results:', results);
    console.log('\n\n');
}

async function sample_searchInFiles() {
    return $(`dir[name="sample10"]`).searchInFiles('abc').then(function (results) {
        console.log('searchInFilesSync "abc" results:', results);
    });
}

function resetSampleFolder() {
    var _$ = fileQuerySync(baseDir);
    for (let i = 1; i < 11; i++) {
        _$(`repo>dir[name="sampleDir"]>dir[name="sample${i}"]`).deleteSync();
        _$('repo>dir[name="sampleDir"]').newDirSync('sample' + i);
        var dest = _$(`repo>dir[name="sampleDir"]>dir[name="sample${i}"]`);
        _$('repo>dir[name="sampleDir_backup"]').children('*').copyToDirSync(dest);
    }

    $.fileQuery('refresh');
}
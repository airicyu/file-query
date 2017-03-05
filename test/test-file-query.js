'use strict';

var should = require('chai').should;
var expect = require('chai').expect;
var supertest = require('supertest');

var path = require('path');
var fs = require('fs');
var fileQuery = require('../index.js').fileQuery;
var fileQuerySync = require('../index.js').fileQuerySync;
var baseDir = __dirname;

var repo1FilePath = path.normalize(path.join(baseDir, "/test-folder")).replace(/\\/g, '/');
var repo2FilePath = path.normalize(path.join(baseDir, "/test-folder2")).replace(/\\/g, '/');
var d1FilePath = path.normalize(path.join(repo1FilePath, "/d1")).replace(/\\/g, '/');
var d1Selector = `repo[name="repo1"] dir[filePath="${d1FilePath}"]`;
var d2FilePath = path.normalize(path.join(repo1FilePath, "/d2")).replace(/\\/g, '/');
var d2Selector = `repo[name="repo1"] dir[filePath="${d2FilePath}"]`;
var newDirFilePath = path.normalize(path.join(repo1FilePath, "/newDir")).replace(/\\/g, '/');
var newDirSelector = `repo[name="repo1"] dir[filePath="${newDirFilePath}"]`;

describe('file-query-test-base-module', function () {
    this.timeout(2000);

    var $ = null;

    before(function(done){
        resetTestFolders();
        done();
    });

    it("test pass single rootDir option", function (done) {
        try {
            let $ = fileQuerySync(repo1FilePath);
            expect($('repo').length).to.equal(1);
            expect($('repo>dir[name=d1]').length).to.equal(1);
            done();
        } catch (e) {
            console.error(e);
            throw e;
        }
    });

    it("test debug mode", function (done) {
        try {
            let $ = fileQuerySync(repo1FilePath);
            expect($.option('debug')).to.equal(false);
            $.debug(true);
            expect($.option('debug')).to.equal(true);
            done();
        } catch (e) {
            console.error(e);
            throw e;
        }
    });

    it("test options", function (done) {
        try {
            let $ = fileQuerySync(repo1FilePath);
            expect($.options()['debug']).to.equal(false);
            $.options({'debug': true});
            expect($.options()['debug']).to.equal(true);
            $.option('debug', false);
            expect($.option('debug')).to.equal(false);
            done();
        } catch (e) {
            console.error(e);
            throw e;
        }
    });

    it("test prettyDom", function (done) {
        try {
            let $ = fileQuerySync(repo1FilePath);
            expect($.prettyDom()).to.not.null;
            done();
        } catch (e) {
            console.error(e);
            throw e;
        }
    });
});

describe('file-query-test-api', function () {
    this.timeout(5000);

    var $ = null;
    beforeEach(function () {
        resetTestFolders();
        $ = initFileQuery();
    });

    after(function(done){
        resetTestFolders();
        done();
    })

    it("test fileQuery.renameSync", function (done) {
        var selected = $(d1Selector);
        selected.renameSync(selected.attr('name') + ' renamed');
        fs.statSync(d1FilePath+' renamed');
        done();
    });

    it("test fileQuery.renameSync, test invalid filename", function (done) {
        var selected = $(d1Selector);
        try{
            selected.renameSync(selected.attr('name') + ' renamed:');
            fs.statSync(d1FilePath+' renamed:');
            done(new Error('Rename invalid filename should not OK.'));
        } catch (e){
            done();
        }
    });

    it("test fileQuery.rename", function (done) {
        var selected = $(d1Selector).first();
        selected.rename(selected.attr('name') + ' renamed').then(function (context) {
            fs.statSync(d1FilePath+' renamed');
            done();
        }).catch(function (error) {
            console.log('error:', error);
        });
    });

    it("test fileQuery.rename, test invalid filename", function (done) {
        var selected = $(d1Selector).first();
        selected.rename(selected.attr('name') + ' renamed:').then(function (context) {
            done(new Error('Rename invalid filename should not OK.'));
        }).catch(function (error) {
            done();
        });
    });

    it("test fileQuery.moveToDirSync(context: object)", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;
        var selected = $(d1Selector).children('dir,file');

        selected.moveToDirSync($(d2Selector));

        $.fileQuery('refresh');

        expect($('dir,file', $(d1Selector)).length).to.equal(0);
        expect($('dir,file', $(d2Selector)).length).to.equal(dirFilesCount);
        done();
    });

    it("test fileQuery.moveToDirSync(dest: string)", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;
        var selected = $(d1Selector).children('dir,file');

        selected.moveToDirSync(d2FilePath);

        $.fileQuery('refresh');

        expect($('dir,file', $(d1Selector)).length).to.equal(0);
        expect($('dir,file', $(d2Selector)).length).to.equal(dirFilesCount);
        done();
    });

    it("test fileQuery.moveToDirSync(dest: string), test dest filepath is repo filepath", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;
        var dirFilesCount2 = $('dir,file', $('repo[filepath="'+repo2FilePath+'"]')).length;
        var selected = $(d1Selector).children('dir,file');

        selected.moveToDirSync(repo2FilePath);

        $.fileQuery('refresh');
        
        expect($('dir,file', $(d1Selector)).length).to.equal(0);
        expect($('dir,file', $('repo[filepath="'+repo2FilePath+'"]')).length).to.equal(dirFilesCount+dirFilesCount2);
        done();
    });

    it("test fileQuery.moveToDirSync(dest: string), test invalid dest filepath", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;
        var selected = $(d1Selector).children('dir,file');

        try{
            selected.moveToDirSync(d2FilePath+':');
            done(new Error('Rename invalid filename should not OK.'));
        } catch(e){
            done();
        }
    });

    it("test fileQuery.moveToDir(context: object)", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;
        var selected = $(d1Selector).children('dir,file');

        selected.moveToDir($(d2Selector)).then(function (context) {

            $.fileQuery('refresh');

            expect($('dir,file', $(d1Selector)).length).to.equal(0);
            expect($('dir,file', $(d2Selector)).length).to.equal(dirFilesCount);
            done();

        }).catch(function (error) {
            console.log('error:', error);
        });
    });

    it("test fileQuery.moveToDir(dest: string)", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;
        var selected = $(d1Selector).children('dir,file');

        selected.moveToDir(d2FilePath).then(function (context) {

            $.fileQuery('refresh');

            expect($('dir,file', $(d1Selector)).length).to.equal(0);
            expect($('dir,file', $(d2Selector)).length).to.equal(dirFilesCount);
            done();

        }).catch(function (error) {
            console.log('error:', error);
        });
    });

    it("test fileQuery.moveToDir(dest: string), test invalid dest filepath", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;
        var selected = $(d1Selector).children('dir,file');

        selected.moveToDir(d2FilePath+":").then(function (context) {
            done(new Error('Rename invalid filename should not OK.'));
        }).catch(function (error) {
            done();
        });
    });

    it("test fileQuery.copyToDirSync(context: object)", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;

        $(d1Selector).children('dir,file').copyToDirSync($(d2Selector));

        $.fileQuery('refresh');
        expect($('dir,file', $(d1Selector)).length).to.equal(dirFilesCount);
        expect($('dir,file', $(d2Selector)).length).to.equal(dirFilesCount);
        done();
    });

    it("test fileQuery.copyToDirSync(dest: string)", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;

        $(d1Selector).children('dir,file').copyToDirSync(d2FilePath);

        $.fileQuery('refresh');
        expect($('dir,file', $(d1Selector)).length).to.equal(dirFilesCount);
        expect($('dir,file', $(d2Selector)).length).to.equal(dirFilesCount);
        done();
    });

    it("test fileQuery.copyToDirSync(dest: string), test dest filepath is repo filepath", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;
        var dirFilesCount2 = $('dir,file', $('repo[filepath="'+repo2FilePath+'"]')).length;

        $(d1Selector).children('dir,file').copyToDirSync(repo2FilePath);

        $.fileQuery('refresh');
        expect($('dir,file', $(d1Selector)).length).to.equal(dirFilesCount);
        expect($('dir,file', $('repo[filepath="'+repo2FilePath+'"]')).length).to.equal(dirFilesCount+dirFilesCount2);
        done();
    });

    it("test fileQuery.copyToDirSync(dest: string), test invalid dest filepath", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;

        try{
            $(d1Selector).children('dir,file').copyToDirSync(d2FilePath+':');
            done(new Error('Rename invalid filename should not OK.'));
        } catch(e) {
            done();
        }
    });

    it("test fileQuery.copyToDir(context: object)", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;

        $(d1Selector).children('dir,file').copyToDir($(d2Selector)).then(function (context) {
            $.fileQuery('refresh');
            expect($('dir,file', $(d1Selector)).length).to.equal(dirFilesCount);
            expect($('dir,file', $(d2Selector)).length).to.equal(dirFilesCount);
            done();
        }).catch(function (error) {
            console.log('error:', error);
        });
    });

    it("test fileQuery.copyToDir(dest: string)", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;

        $(d1Selector).children('dir,file').copyToDir(d2FilePath).then(function (context) {
            $.fileQuery('refresh');
            expect($('dir,file', $(d1Selector)).length).to.equal(dirFilesCount);
            expect($('dir,file', $(d2Selector)).length).to.equal(dirFilesCount);
            done();
        }).catch(function (error) {
            console.log('error:', error);
        });
    });
    
    it("test fileQuery.copyToDir(dest: string), test invalid dest filepath", function (done) {
        var dirFilesCount = $('dir,file', $(d1Selector)).length;

        $(d1Selector).children('dir,file').copyToDir(d2FilePath+':').then(function (context) {
            done(new Error('Rename invalid filename should not OK.'));
        }).catch(function (error) {
            done();
        });
    });

    it("test fileQuery.deleteSync", function (done) {
        var selected = $(d1Selector).children('dir,file');
        selected.deleteSync();

        $.fileQuery('refresh');

        expect($('dir,file', $(d1Selector)).length).to.equal(0);
        done();
    });

    it("test fileQuery.delete", function (done) {
        var selected = $(d1Selector).children('dir,file');

        selected.delete().then(function () {
            $.fileQuery('refresh');
            expect($('dir,file', $(d1Selector)).length).to.equal(0);
            done();
        }).catch(function (error) {
            console.log('error:', error);
        });
    });

    it("test fileQuery.newDirSync", function (done) {
        var selected = $('repo[name="repo1"]');
        selected.newDirSync('newDir');

        $.fileQuery('refresh');

        expect($(newDirSelector).length).to.equal(1);
        done();
    });

    it("test fileQuery.newDirSync, test invalid dest filepath", function (done) {
        var selected = $('repo[name="repo1"]');
        try{
            selected.newDirSync('newDir:');
            done(new Error('Rename invalid filename should not OK.'));
        } catch(e) {
            done();
        }
    });

    it("test fileQuery.newDir", function (done) {
        var selected = $('repo[name="repo1"]');

        selected.newDir('newDir').then(function (context) {
            $.fileQuery('refresh');
            expect($(newDirSelector).length).to.equal(1);
            done();
        }).catch(function (error) {
            console.log('error:', error);
        });
    });

    it("test fileQuery.newDir, test invalid dest filepath", function (done) {
        var selected = $('repo[name="repo1"]');

        selected.newDir('newDir:').then(function (context) {
            done(new Error('Rename invalid filename should not OK.'));
        }).catch(function (error) {
            done();
        });
    });

    it("test fileQuery.newDirSync, only create new dir for each selected directories. (Ignore selected files)", function (done) {
        var selected = $('repo[name="repo1"]>file[name="f1.txt"]');
        selected.newDirSync('newDir');
        $.fileQuery('refresh');

        expect($('repo[name="repo1"]>dir[name="f1.txt"]').length).to.equal(0);
        done();
    });

    it("test fileQuery.searchInFilesSync", function (done) {
        var selected = $('repo[name="repo1"]');
        var results = selected.searchInFilesSync('abc');
        var resultMap = {};
        var resultCount = 0;
        results.each(function(i, em){
            resultMap[$(em).attr('filePath')] = 1;
            resultCount++;
        })

        expect(resultCount).to.equal(2);
        expect(resultMap).to.contain.all.keys(repo1FilePath+'/f1.txt');
        expect(resultMap).to.contain.all.keys(d1FilePath+'/f3.txt');
        done();
    });

    it("test fileQuery.searchInFiles(searchKey: string)", function (done) {
        var selected = $('repo[name="repo1"]');
        selected.searchInFiles('abc').then(function(results){
            var resultMap = {};
            var resultCount = 0;
            results.each(function(i, em){
                resultMap[$(em).attr('filePath')] = 1;
                resultCount++;
            })

            expect(resultCount).to.equal(2);
            expect(resultMap).to.contain.all.keys(repo1FilePath+'/f1.txt');
            expect(resultMap).to.contain.all.keys(d1FilePath+'/f3.txt');
            done();
        });
    });

    it("test fileQuery.searchInFiles(pattern: Regexp)", function (done) {
        var selected = $('repo[name="repo1"]');
        selected.searchInFiles(/abc/).then(function(results){
            var resultMap = {};
            var resultCount = 0;
            results.each(function(i, em){
                resultMap[$(em).attr('filePath')] = 1;
                resultCount++;
            })

            expect(resultCount).to.equal(2);
            expect(resultMap).to.haveOwnProperty(repo1FilePath+'/f1.txt');
            expect(resultMap).to.haveOwnProperty(d1FilePath+'/f3.txt');
            done();
        });
    });

    it("test fileQuery.searchInFiles, test when selected multiple duplicate paths", function (done) {
        var selected = $('repo[name="repo1"]').add('repo[name="repo3"]');
        selected.searchInFiles('abc').then(function(results){
            var resultMap = {};
            var resultCount = 0;
            results.each(function(i, em){
                resultMap[$(em).attr('filePath')] = 1;
                resultCount++;
            })

            expect(resultCount).to.equal(2);
            expect(resultMap).to.haveOwnProperty(repo1FilePath+'/f1.txt');
            expect(resultMap).to.haveOwnProperty(d1FilePath+'/f3.txt');
            done();
        });
    });
});

function resetTestFolders(){
    let $ = fileQuerySync({
        repos: {
            'repo1': {
                'rootDir': repo1FilePath,
                'excludeFilePaths': ['d1/d3/d4']
            },
            'repo2': {
                'rootDir': repo2FilePath
            },
            'repo3': {
                'rootDir': repo1FilePath
            },
            'backuprepo1': {
                'rootDir': path.join(baseDir, "/test-folder-bak")
            },
            'backuprepo2': {
                'rootDir': path.join(baseDir, "/test-folder-bak2")
            }
        }
    });
    $('*', $('repo[name="repo1"]')).deleteSync();
    $('*', $('repo[name="repo2"]')).deleteSync();
    $('repo[name="backuprepo1"]').children('dir,file').copyToDirSync($('repo[name="repo1"]'));
    $('repo[name="backuprepo2"]').children('dir,file').copyToDirSync($('repo[name="repo2"]'));
}


function initFileQuery() {
    try {
        let $ = fileQuerySync({
            repos: {
                'repo1': {
                    'rootDir': repo1FilePath,
                    'excludeFilePaths': ['d1/d3/d4']
                },
                'repo2': {
                    'rootDir': repo2FilePath
                }
            }
        });
        $.debug(false);
        return $;
    } catch (e) {
        console.error(e);
        throw e;
    }
}
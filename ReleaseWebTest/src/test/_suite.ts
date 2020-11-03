import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as mch from 'mocha';
import * as ch from 'chai';
import * as webTest from '../webtest';

describe ('webTest', function() {

    it('should return array of two URLs to call', function(){

        var inputURLString:string = "http://www.woot.com, http://www.moofi.com";
        var result = webTest.ParseUrls(inputURLString);

        assert.equal(result.length, 2);

    });
});


//describe('Sample task tests', function () {

//    before( function() {
//
//   });
//
//    after(() => {
//
//    });
//
//    it('should succeed with simple inputs', function(done: MochaDone) {
//        this.timeout(1000);
//
//        let tp = path.join(__dirname, 'executeTask.js');
//        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
//        tr.run();
//        assert.equal(tr.succeeded, true, 'should have succeeded');
//        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
//        assert.equal(tr.errorIssues.length, 0, "should have no errors");
//        console.log(tr.stdout);
 //       console.log(tr.succeeded);
//        done();
//    
//    });
//
//   
//});
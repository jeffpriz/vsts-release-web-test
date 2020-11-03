"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var assert = require("assert");
var ttm = require("azure-pipelines-task-lib/mock-test");
describe('Sample task tests', function () {
    before(function () {
    });
    after(function () {
    });
    it('should succeed with simple inputs', function (done) {
        this.timeout(1000);
        var tp = path.join(__dirname, 'testURLSplit.js');
        var tr = new ttm.MockTestRunner(tp);
        tr.run();
        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors");
        console.log(tr.stdout);
        console.log(tr.succeeded);
        done();
    });
});
//# sourceMappingURL=_suite.js.map
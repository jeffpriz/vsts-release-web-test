"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var tl = require("vsts-task-lib");
var input_url = '';
var input_expectedCode = '';
var input_retryCount = 0;
var validInputs = true;
//=----------------------------------------------------------
//=  Validate that the inputs were provided as expected
//=----------------------------------------------------------
function validateInputs() {
    //URL input
    validInputs = true;
    try {
        input_url = tl.getInput('url', true);
    }
    catch (ex) {
        console.error("a URL is a required input to this task, but was not supplied");
        validInputs = false;
    }
    //Return Code Value Input
    try {
        input_expectedCode = tl.getInput('expectedReturnCode', true);
    }
    catch (ex) {
        console.error("An expected return code is a required input to this task, but was not supplied");
        validInputs = false;
    }
    //Retry Count input
    try {
        var rawRetryCount = tl.getInput('retryAttemptCount', true);
        input_retryCount = parseInt(rawRetryCount);
    }
    catch (ex) {
        console.error("A retry count is a required input to this task, but was not supplied, or was not valid.  You may place a value of 0 (Zero) to force no retries.");
        validInputs = false;
    }
}
///URL Check
function runCheckForUrl(url, retryCount) {
    var attemptCount = 0;
    var success = false;
    do {
        if (retryCount > 0) {
            console.debug("retrying " + url);
        }
        if (url.includes('http://')) {
            var http = require("http");
            http.get(url, function (res) {
                var statusCode = res.statusCode;
                var contentType = res.headers['content-type'];
                var error;
                if (statusCode != input_expectedCode) {
                    success = false;
                }
                else {
                    success = true;
                }
                res.resume();
            });
        }
        else if (url.includes('https://')) {
            var https = require("https");
            https.get(url, function (res) {
                var statusCode = res.statusCode;
                var contentType = res.headers['content-type'];
                var error;
                if (statusCode != input_expectedCode) {
                    success = false;
                }
                res.resume();
            });
        }
        else {
            attemptCount = retryCount + 1;
            console.warn("The value for the url does not seem valid -- expecting address to begin with the protocol (http:// or https://) but found: " + url);
        }
        if (!success) {
            console.warn("Failed to get expected result from " + url);
        }
        retryCount += 1;
    } while (attemptCount <= retryCount && !success);
}
//split the url input in to an array of addresses
function ParseUrls(inputUrls) {
    var urlList = inputUrls.split(',');
    return urlList;
}
console.log("Running web site validation tests... ");
validateInputs();
if (validInputs) {
    var urlArray = ParseUrls(input_url);
    try {
        for (var urlArray_1 = tslib_1.__values(urlArray), urlArray_1_1 = urlArray_1.next(); !urlArray_1_1.done; urlArray_1_1 = urlArray_1.next()) {
            var thisUrl = urlArray_1_1.value;
            console.log(" Running check for " + thisUrl);
            runCheckForUrl(thisUrl, input_retryCount);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (urlArray_1_1 && !urlArray_1_1.done && (_a = urlArray_1.return)) _a.call(urlArray_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
var e_1, _a;
//# sourceMappingURL=webtest.js.map
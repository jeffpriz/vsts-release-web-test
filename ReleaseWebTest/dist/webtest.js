"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var tl = require("vsts-task-lib");
var node_fetch_1 = require("node-fetch");
var input_url = '';
var input_expectedCode = '';
var input_retryCount = 0;
var validInputs = true;
//=----------------------------------------------------------
//=  Validate that the inputs were provided as expected
//=----------------------------------------------------------
function validateInputs() {
    //URL input
    tl.debug("validating inputs...");
    validInputs = true;
    try {
        input_url = tl.getInput('url', true);
    }
    catch (ex) {
        tl.error("a URL is a required input to this task, but was not supplied");
        validInputs = false;
    }
    //Return Code Value Input
    try {
        input_expectedCode = tl.getInput('expectedReturnCode', true);
    }
    catch (ex) {
        tl.error("An expected return code is a required input to this task, but was not supplied");
        validInputs = false;
    }
    //Retry Count input
    try {
        var maxretry = 12;
        var rawRetryCount = tl.getInput('retryAttemptCount', true);
        input_retryCount = parseInt(rawRetryCount);
        if (input_retryCount > maxretry) {
            input_retryCount = maxretry;
            console.log("the input value for retry count was greater than 12... setting a max of " + maxretry.toString() + " retries.");
            tl.debug("resetting max retry to " + maxretry.toString());
        }
        else {
            tl.debug("retry count " + input_retryCount.toString() + " is less than " + maxretry.toString());
        }
    }
    catch (ex) {
        tl.error("A retry count is a required input to this task, but was not supplied, or was not valid.  You may place a value of 0 (Zero) to force no retries.");
        validInputs = false;
    }
}
///URL Check
function runCheckForUrl(url, retryCount) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _this = this;
        var attemptCount, success;
        return tslib_1.__generator(this, function (_a) {
            attemptCount = 0;
            success = false;
            return [2 /*return*/, new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var response, s, err_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 6, , 7]);
                                _a.label = 1;
                            case 1:
                                if (attemptCount > 0) {
                                    tl.debug("retrying (" + attemptCount.toString() + ") " + url);
                                }
                                attemptCount += 1;
                                return [4 /*yield*/, node_fetch_1.default(url)];
                            case 2:
                                response = _a.sent();
                                return [4 /*yield*/, response.status];
                            case 3:
                                s = _a.sent();
                                console.log("Status: " + s.toString());
                                if (s.toString() == input_expectedCode) {
                                    success = true;
                                }
                                else {
                                    success = false;
                                }
                                if (!success) {
                                    console.warn("Failed to get expected result from " + url);
                                }
                                _a.label = 4;
                            case 4:
                                if (attemptCount <= retryCount && !success) return [3 /*break*/, 1];
                                _a.label = 5;
                            case 5:
                                resolve(success);
                                return [3 /*break*/, 7];
                            case 6:
                                err_1 = _a.sent();
                                tl.debug("error in runCheckForUrl: " + url);
                                reject(err_1);
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
//split the url input in to an array of addresses
function ParseUrls(inputUrls) {
    var urlList = inputUrls.split(',');
    return urlList;
}
///This function will loop through the array of passed in URLs and call
/// to individually test them, and will return an overall success status
function runTestsForAllURLS(urlArray) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _this = this;
        var completeSuccess;
        return tslib_1.__generator(this, function (_a) {
            completeSuccess = true;
            return [2 /*return*/, new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var urlArray_1, urlArray_1_1, thisUrl, s, e_1_1, err_2, e_1, _a;
                    return tslib_1.__generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 9, , 10]);
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 6, 7, 8]);
                                urlArray_1 = tslib_1.__values(urlArray), urlArray_1_1 = urlArray_1.next();
                                _b.label = 2;
                            case 2:
                                if (!!urlArray_1_1.done) return [3 /*break*/, 5];
                                thisUrl = urlArray_1_1.value;
                                console.log(" Running check for " + thisUrl);
                                return [4 /*yield*/, runCheckForUrl(thisUrl, input_retryCount)];
                            case 3:
                                s = _b.sent();
                                if (!s) {
                                    console.log("Failed");
                                    completeSuccess = false;
                                }
                                else {
                                    console.log("Success!");
                                }
                                _b.label = 4;
                            case 4:
                                urlArray_1_1 = urlArray_1.next();
                                return [3 /*break*/, 2];
                            case 5: return [3 /*break*/, 8];
                            case 6:
                                e_1_1 = _b.sent();
                                e_1 = { error: e_1_1 };
                                return [3 /*break*/, 8];
                            case 7:
                                try {
                                    if (urlArray_1_1 && !urlArray_1_1.done && (_a = urlArray_1.return)) _a.call(urlArray_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                                return [7 /*endfinally*/];
                            case 8:
                                resolve(completeSuccess);
                                return [3 /*break*/, 10];
                            case 9:
                                err_2 = _b.sent();
                                tl.debug("Error in runTestsForAllURLS " + err_2.toString());
                                reject(err_2);
                                return [3 /*break*/, 10];
                            case 10: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
///Run function to handle the async running process of the task
function Run() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var urlArray, completeSuccess, err_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Running web site validation tests... ");
                    validateInputs();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    if (!validInputs) return [3 /*break*/, 3];
                    urlArray = ParseUrls(input_url);
                    return [4 /*yield*/, runTestsForAllURLS(urlArray)];
                case 2:
                    completeSuccess = _a.sent();
                    tl.debug("completeSuccess = " + completeSuccess.toString());
                    if (completeSuccess != true) {
                        tl.error("There were failures while smoke testing...");
                        tl.setResult(tl.TaskResult.Failed, "Smoke Test was not valid");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    tl.setResult(tl.TaskResult.Failed, "Invalid Inputs");
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_3 = _a.sent();
                    tl.setResult(tl.TaskResult.Failed, "Smoke Test was not valid");
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
//main
try {
    Run();
}
catch (err) {
    tl.setResult(tl.TaskResult.Failed, "Smoke Test was not valid");
}
//# sourceMappingURL=webtest.js.map
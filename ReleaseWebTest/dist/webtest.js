"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseUrls = void 0;
var tslib_1 = require("tslib");
var tl = require("azure-pipelines-task-lib");
var httprequest = require("request-promise-native");
var timers_1 = require("timers");
var input_url = '';
var input_expectedCode = '';
var input_retryCount = 0;
var input_strictSSL = true;
var validInputs = false;
var input_retryDelay = 1000;
function delay(milliseconds) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    timers_1.setTimeout(function () { tl.debug("delay"); resolve(); }, milliseconds);
                })];
        });
    });
}
//=----------------------------------------------------------
//=  Validate that the inputs were provided as expected
//=----------------------------------------------------------
function validateInputs() {
    //URL input
    tl.debug("validating inputs...");
    validInputs = true;
    try {
        var test_1 = tl.getInput('url', true);
        if (test_1 != undefined) {
            input_url = test_1;
        }
        else {
            throw ("The input URL was undefined");
        }
    }
    catch (ex) {
        tl.error("a URL is a required input to this task, but was not supplied");
        validInputs = false;
    }
    //Return Code Value Input
    try {
        var test_2 = tl.getInput('expectedReturnCode', true);
        if (test_2 != undefined) {
            input_expectedCode = test_2;
        }
        else {
            throw ("The expected return code was undefined");
        }
    }
    catch (ex) {
        tl.error("An expected return code is a required input to this task, but was not supplied");
        validInputs = false;
    }
    try {
        var test_3 = tl.getInput('retryDelay', true);
        if (test_3 != undefined) {
            var temp_inputDelay = test_3;
            input_retryDelay = parseInt(temp_inputDelay);
        }
        else {
            throw ("the inputdelay was undefined");
        }
    }
    catch (ex) {
        tl.error("A retry delay value is require, and must be an integer value, but the task failed to get a valid value.  Please check your setting for this input.");
        validInputs = false;
    }
    try {
        input_strictSSL = tl.getBoolInput('strictSSL', true);
        tl.debug("input value of strictSSL is " + input_strictSSL.toString());
    }
    catch (ex) {
        tl.error("A StrictSSL input value is required, but not found.");
        validInputs = false;
    }
    //Retry Count input
    try {
        var maxretry = 12;
        var rawRetryCount = tl.getInput('retryAttemptCount', true);
        if (rawRetryCount != undefined) {
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
        else {
            throw ("the retry count was undefined");
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
        var attemptCount, success;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            attemptCount = 0;
            success = false;
            return [2 /*return*/, new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var reqOption, s, result, errorR_1, err_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 10, , 11]);
                                _a.label = 1;
                            case 1:
                                if (!(attemptCount > 0)) return [3 /*break*/, 3];
                                tl.debug("retrying (" + attemptCount.toString() + ") " + url);
                                return [4 /*yield*/, delay(input_retryDelay)];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                attemptCount += 1;
                                reqOption = {
                                    method: 'GET',
                                    uri: url,
                                    simple: false,
                                    resolveWithFullResponse: true,
                                    strictSSL: input_strictSSL
                                };
                                tl.debug("Options passed to request: " + JSON.stringify(reqOption));
                                s = 0;
                                _a.label = 4;
                            case 4:
                                _a.trys.push([4, 6, , 7]);
                                return [4 /*yield*/, httprequest(reqOption)];
                            case 5:
                                result = _a.sent();
                                tl.debug("Result status: " + result.statusCode);
                                s = result.statusCode;
                                return [3 /*break*/, 7];
                            case 6:
                                errorR_1 = _a.sent();
                                tl.debug("error with request" + errorR_1);
                                console.log("Error while calling url : " + errorR_1);
                                s = errorR_1;
                                return [3 /*break*/, 7];
                            case 7:
                                console.log("Status Code is:" + s);
                                if (s.toString() == input_expectedCode) {
                                    success = true;
                                }
                                else {
                                    success = false;
                                }
                                if (!success) {
                                    console.warn("Failed to get expected result from " + url);
                                }
                                _a.label = 8;
                            case 8:
                                if (attemptCount <= retryCount && !success) return [3 /*break*/, 1];
                                _a.label = 9;
                            case 9:
                                resolve(success);
                                return [3 /*break*/, 11];
                            case 10:
                                err_1 = _a.sent();
                                tl.debug("error in runCheckForUrl: " + url);
                                reject(err_1);
                                return [3 /*break*/, 11];
                            case 11: return [2 /*return*/];
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
exports.ParseUrls = ParseUrls;
///This function will loop through the array of passed in URLs and call
/// to individually test them, and will return an overall success status
function runTestsForAllURLS(urlArray) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var completeSuccess;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            completeSuccess = true;
            return [2 /*return*/, new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var urlArray_1, urlArray_1_1, thisUrl, s, e_1_1, err_2;
                    var e_1, _a;
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
                                tl.error(err_2.toString());
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
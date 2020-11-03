"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tmrm = require("azure-pipelines-task-lib/mock-run");
var path = require("path");
var taskPath = path.join(__dirname, '..', 'webtest.js');
var tmr = new tmrm.TaskMockRunner(taskPath);
tmr.setInput('samplestring', 'human');
tmr.run();
//# sourceMappingURL=testURLSplit.js.map
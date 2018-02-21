# vsts-release-web-test
TFS and VSTS release task to validate that a web app is available and running after in the release.  Written in node, not powershell, so may run on non-windows based build agents

# Smoke Web Test Task

This is an extension for Visual Studio Team Services.

It adds a task that allows you to make a smoke web test.

## Smoke Test task goals

Simple task to test the availability of a web applicaiton or api after a deployment to verify that there is some expected response.  This allows for a sanity check at the end of the release in to an environment to verify that what was deployed is actually functional.  


## Images
![Smoke web test task preview](images/task.jpg)
![Smoke web test task preview detail](images/task-detail.jpg)

## Requirements
Since the task is executed by the build agent, your build machines has to have access to the website you are trying to call.

## Source
[GitHub](https://github.com/jeffpriz/vsts-release-web-test)

## Issues
[File an issue](https://github.com/jeffpriz/vsts-release-web-test/issues)

## Credits
[Jeff Przylucki](http://www.oneluckidev.com)


import * as tl from 'vsts-task-lib';
import fetch from 'node-fetch';


let input_url:string = '';
let input_expectedCode:string = '';
let input_retryCount:number = 0;

let validInputs:boolean = true;



//=----------------------------------------------------------
//=  Validate that the inputs were provided as expected
//=----------------------------------------------------------
function validateInputs()
{
    //URL input
    validInputs = true;
    try {
        input_url = tl.getInput('url',true);
        

    }
    catch(ex)
    {
        tl.error("a URL is a required input to this task, but was not supplied");
        validInputs = false;
    }


    //Return Code Value Input
    try 
    {
        input_expectedCode = tl.getInput('expectedReturnCode',true);
    }
    catch(ex)
    {
        tl.error("An expected return code is a required input to this task, but was not supplied");
        validInputs = false;
    }


    //Retry Count input
    try 
    {
        let rawRetryCount = tl.getInput('retryAttemptCount',true);
        input_retryCount = parseInt(rawRetryCount);
    }
    catch(ex)
    {
        tl.error("A retry count is a required input to this task, but was not supplied, or was not valid.  You may place a value of 0 (Zero) to force no retries.");
        validInputs = false;
    }
}




///URL Check
async function runCheckForUrl(url:string, retryCount:number): Promise<boolean>
{

    let attemptCount:number = 0;
    let success: boolean = false;
   
    return new Promise<boolean>(async (resolve, reject) => {
    try{
        do{
       
            if(attemptCount > 0)
            {
                tl.debug("retrying (" + attemptCount.toString() + ") " + url);
                
            }
        
            attemptCount += 1;

            var response = await fetch(url);
            var s = await response.status;
            console.log("Status: " + s.toString());
            if(s.toString() == input_expectedCode)
            {
                success = true;
            }
            else{
                success = false;
            }


            if(!success)
            {
                console.warn ("Failed to get expected result from " + url);
            }
            
        }
        while(attemptCount <= retryCount && !success)  

        resolve(success)
    }
    catch(err)
    {
        tl.debug("error in runCheckForUrl: " + url);
        reject(err);

    }
    });
}

//split the url input in to an array of addresses
function ParseUrls(inputUrls:string)
{
    let urlList:string[] = inputUrls.split(',');

    return urlList;
}


///This function will loop through the array of passed in URLs and call
/// to individually test them, and will return an overall success status
async function runTestsForAllURLS(urlArray:string[]):Promise<boolean>
{
    var completeSuccess:boolean = true;
    
    return new Promise<boolean>(async (resolve, reject) => {
        try{
            for(let thisUrl of urlArray )
            {
                console.log(" Running check for " + thisUrl);
                var s:boolean = await runCheckForUrl(thisUrl, input_retryCount)
                
                    if(!s)
                    {
                        console.log("Failed");
                        completeSuccess= false;
                    }
                    else{
                        console.log("Success!");
                    }
            

            }
            resolve(completeSuccess);
        }
        catch(err)
        {
            tl.debug("Error in runTestsForAllURLS " + err.toString());
            reject(err);
        }
        });
}


///Run function to handle the async running process of the task
async function Run()
{
    console.log("Running web site validation tests... ");
    validateInputs();

    try{

        if(validInputs)
        {
            //var completeSuccess:boolean = true;
            let urlArray:string[] = ParseUrls(input_url);
            
            var completeSuccess = await runTestsForAllURLS(urlArray);

            tl.debug("completeSuccess = " + completeSuccess.toString());
            if(completeSuccess != true)
            {
                
                tl.error("There were failures while smoke testing...");
                
                
                tl.setResult(tl.TaskResult.Failed, "Smoke Test was not valid");
               
            }
        
        }
        else{
            tl.setResult(tl.TaskResult.Failed, "Invalid Inputs");
        }
    }
    catch(err)
    {
        tl.setResult(tl.TaskResult.Failed, "Smoke Test was not valid");
    }
}

//main
try
{
    Run();
}
catch(err)
{
    
    tl.setResult(tl.TaskResult.Failed, "Smoke Test was not valid");
}
import * as tl from 'azure-pipelines-task-lib';
import * as httprequest from 'request-promise-native';
import { setTimeout } from 'timers';
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';


let input_url:string = '';
let input_expectedCode:string = '';
let input_retryCount:number = 0;
let input_strictSSL:Boolean = true;
let validInputs:Boolean = false;
let input_retryDelay:number = 1000;



async function delay(milliseconds:number)
{
    
    return new Promise<void>(resolve=> {
            setTimeout(function(){tl.debug("delay");resolve();}, milliseconds);
            
        
    });
}


//=----------------------------------------------------------
//=  Validate that the inputs were provided as expected
//=----------------------------------------------------------
function validateInputs()
{

    //URL input
    tl.debug("validating inputs...");
    validInputs = true;
    try {
        let test:string|undefined = tl.getInput('url',true);
        if(test!= undefined)
        {
            input_url = test;
        }
        else{
            throw("The input URL was undefined");
        }
        

    }
    catch(ex)
    {
        tl.error("a URL is a required input to this task, but was not supplied");
        validInputs = false;
    }


    //Return Code Value Input
    try 
    {
        let test:string|undefined = tl.getInput('expectedReturnCode',true);
        if(test != undefined)
        {
            input_expectedCode = test;
        }
        else
        {
            throw("The expected return code was undefined");
        }
    }
    catch(ex)
    {
        
        tl.error("An expected return code is a required input to this task, but was not supplied");
        validInputs = false;
    }

    try
    {
        let test:string|undefined =tl.getInput('retryDelay', true);
        if(test != undefined)
        {
            let temp_inputDelay:string  = test;
            input_retryDelay = parseInt(temp_inputDelay);
        }
        else
        {
            throw("the inputdelay was undefined");
        }
    }
    catch(ex)
    {
        tl.error("A retry delay value is require, and must be an integer value, but the task failed to get a valid value.  Please check your setting for this input.");
        validInputs = false;
    }

    try
    {
        input_strictSSL  = tl.getBoolInput('strictSSL', true);
        tl.debug("input value of strictSSL is " + input_strictSSL.toString());
    }
    catch(ex)
    {
        tl.error("A StrictSSL input value is required, but not found.");
        validInputs = false;
    }

    //Retry Count input
    try 
    {
        let maxretry:number  = 12
        let rawRetryCount = tl.getInput('retryAttemptCount',true);
        if(rawRetryCount != undefined)
        {
            input_retryCount = parseInt(rawRetryCount);
            if(input_retryCount > maxretry)
            {
                input_retryCount = maxretry;
                console.log("the input value for retry count was greater than 12... setting a max of " + maxretry.toString() + " retries.");
                tl.debug("resetting max retry to " + maxretry.toString());
            }
            else
            {
                tl.debug("retry count " + input_retryCount.toString() + " is less than " + maxretry.toString());
            }
        }
        else
        {
            throw("the retry count was undefined");
        }
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
                await delay(input_retryDelay);
            }
        
            attemptCount += 1;
            var reqOption = {
                method:'GET',
                uri:url,
                simple:false,
                resolveWithFullResponse: true,
                strictSSL: input_strictSSL
            };

            tl.debug("Options passed to request: " + JSON.stringify(reqOption));
            var s:string = "";
            try{
                var result = await httprequest(reqOption);
                
                tl.debug("Result status: " + result.statusCode);

                s = result.statusCode;
                
            }
            catch(errorR)
            {
                tl.debug("error with request" + errorR);
                console.log("Error while calling url : " + errorR);
                s = JSON.stringify(errorR)

            }

            console.log("Status Code is:" + s);


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
export function ParseUrls(inputUrls:string)
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
            tl.error(JSON.stringify(err));
            tl.debug("Error in runTestsForAllURLS " + JSON.stringify(err));
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
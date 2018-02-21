import * as tl from 'vsts-task-lib';


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
        console.error("a URL is a required input to this task, but was not supplied");
        validInputs = false;
    }


    //Return Code Value Input
    try 
    {
        input_expectedCode = tl.getInput('expectedReturnCode',true);
    }
    catch(ex)
    {
        console.error("An expected return code is a required input to this task, but was not supplied");
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
        console.error("A retry count is a required input to this task, but was not supplied, or was not valid.  You may place a value of 0 (Zero) to force no retries.");
        validInputs = false;
    }
}




///URL Check
function runCheckForUrl(url:string, retryCount:number)
{
    let attemptCount:number = 0;
    let success: boolean = false;
    do{
        if(retryCount > 0)
        {
            console.debug("retrying " + url);
        }
    
        if(url.includes('http://'))
        {
            const http = require("http");
            http.get(url, (res)=> {
                const {statusCode } = res;
                const contentType = res.headers['content-type'];

                let error;
                if(statusCode != input_expectedCode)
                {
                    success = false;
                    
                }
                else{
                    success = true;
                }
                res.resume();
                
            });
        }
        else if(url.includes('https://'))
        {
            const https = require("https");
            https.get(url, (res)=> {
                const {statusCode } = res;
                const contentType = res.headers['content-type'];

                let error;
                if(statusCode != input_expectedCode)
                {
                    success = false;
                }
                res.resume();
                
            });
        }
        else 
        {
            attemptCount = retryCount +1;
            console.warn("The value for the url does not seem valid -- expecting address to begin with the protocol (http:// or https://) but found: " + url );
        }
        if(!success)
        {
            console.warn ("Failed to get expected result from " + url);
        }
        retryCount += 1;
    }
    while(attemptCount <= retryCount && !success)  
}

//split the url input in to an array of addresses
function ParseUrls(inputUrls:string)
{
    let urlList:string[] = inputUrls.split(',');

    return urlList;
}


console.log("Running web site validation tests... ");
validateInputs();

if(validInputs)
{
    let urlArray:string[] = ParseUrls(input_url);
    for(let thisUrl of urlArray )
    {
        console.log(" Running check for " + thisUrl);
        runCheckForUrl(thisUrl, input_retryCount);
    }
  
}
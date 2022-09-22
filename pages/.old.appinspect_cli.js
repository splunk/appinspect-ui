#! /usr/bin/env node

var request = require('request');
const prompt = require('prompt');
const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');

//*****Global Defaults******//
//Setup sleep seconds inbetween status checks
const sleep_seconds = 5;
//Processing message
var processing_text = 'Processing';
//Elapsed Time default
var elapsed = 0;

//Setup prompts for username/password
const properties = [
    {
        name: 'username',
        description: 'Enter your splunk.com Username',
    },
    {
        name: 'password',
        hidden: true,
        description: 'Enter your splunk.com Password',
    },
];
//Setup prompt for package
const app_details = [
    {
        name: 'filepath',
        description: 'Enter the path to your app you want to inspect',
    },
];

//Setup prompt for package
const report_location = [
    {
        name: 'reportpath',
        description: 'Enter the path where you want to save your report',
    },
];
//***** End Global Defaults ******//

prompt.start();

//This is what happens after the initial prompt returns.
prompt.get(properties, function (err, result) {
    if (err) {
        return onErr(err);
    }
    var options = {
        url: 'https://api.splunk.com/2.0/rest/login/splunk',
        auth: {
            user: result.username,
            pass: result.password,
        },
    };
    //Enter the Authentication Method
    res = request(options, authresponse);
});

function onErr(err) {
    console.log(err);
    return 1;
}

async function checkstatus(token, request_id) {
    var status = '';
    while (true) {
        elapsed = elapsed + sleep_seconds;
        //Now that we have a valid request ID, let's sleep and loop until our result is complete.
        status = await fetch('https://appinspect.splunk.com/v1/app/validate/status/' + request_id, {
            method: 'GET',
            headers: {
                Authorization: 'bearer ' + token,
            },
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
                throw res;
            })
            .then((json) => {
                return json;
            });

        if (status.status == 'PROCESSING') {
            console.log(processing_text + '.');
            console.log('Elapsed Time: ' + elapsed + ' seconds');
            await sleep(sleep_seconds);
        }
        if (status.status == 'SUCCESS') {
            console.log('Successfully processed App');
            prompt.get(report_location, function (err, result) {
                fetch('https://appinspect.splunk.com/v1/app/report/' + request_id, {
                    method: 'GET',
                    headers: {
                        Authorization: 'bearer ' + token,
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'application/json',
                    },
                })
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        }
                        throw res;
                    })
                    .then((json) => {
                        console.log('Writing file to: ' + result.reportpath + '/report.json');
                        fs.writeFile(
                            result.reportpath + '/report.json',
                            JSON.stringify(json),
                            (err) => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                            }
                        );
                    });

                fetch('https://appinspect.splunk.com/v1/app/report/' + request_id, {
                    method: 'GET',
                    headers: {
                        Authorization: 'bearer ' + token,
                        'Cache-Control': 'no-cache',
                        'Content-Type': 'text/html',
                    },
                })
                    .then((res) => {
                        if (res.ok) {
                            return res.text();
                        }
                        throw res;
                    })
                    .then((html) => {
                        console.log('Writing file to: ' + result.reportpath + '/report.html');
                        fs.writeFile(result.reportpath + '/report.html', html, (err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                        });
                    });
            });
            break;
        }
    }
    return status;
}

//Determine a successful auth
async function authresponse(error, response, body) {
    console.log(error);
    if (!error && response.statusCode == 200) {
        console.log('Successfully Authenticated to Splunk Appinspect');
        //Get the Bearer Token from the response
        const auth_response = JSON.parse(response.body);
        const token = auth_response.data.token;

        //Once we have a valid token, let's begin by prompting user for the path of their app
        prompt.get(app_details, function (err, result) {
            //We'll use the inputted file path to get the package we want to upload
            const filePath = result.filepath;
            const form = new FormData();
            const stats = fs.statSync(filePath);
            const fileSizeInBytes = stats.size;
            const fileStream = fs.createReadStream(filePath);
            form.append('app_package', fileStream, { knownLength: fileSizeInBytes });
            form.append('included_tags', 'cloud');

            //We will then add this package to the request, along with our token
            const options = {
                method: 'POST',
                body: form,
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Cache-Control': 'no-cache',
                },
            };

            //Now we'll fetch to get a request ID
            fetch('https://appinspect.splunk.com/v1/app/validate', { ...options })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    throw res;
                })
                .then((json) => {
                    //Check the status
                    console.log(
                        'Waiting for report. Will print report once inspection is complete.'
                    );
                    checkstatus(token, json.request_id).then((res) => {
                        return res;
                    });
                });
        });
    } else {
        console.log('Failed to authenticate: ' + response.statusCode);
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms * 1000);
    });
}

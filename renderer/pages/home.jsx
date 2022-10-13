import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import SplunkThemeProvider from '@splunk/themes/SplunkThemeProvider';
import dynamic from 'next/dynamic';
import React,  { useEffect, useRef, useCallback } from 'react';
import {useState} from 'react';
import User from '@splunk/react-icons/User';
import Error from '@splunk/react-icons/Error';
import Warning from '@splunk/react-icons/Warning';
import SVG from '@splunk/react-icons/SVG';
import {net} from  'electron'
import InfoCircle from '@splunk/react-icons/InfoCircle';
import Success from '@splunk/react-icons/Success';
import ReportSearch from '@splunk/react-icons/ReportSearch';

import AppInspectTags from './components/AppInspectTags';
import AppinspectReportTab from './components/AppinspectReportTab';
import { useRouter } from 'next/router';
import { isMobile } from 'react-device-detect';
import NoSSR from 'react-no-ssr';
import { ipcRenderer } from 'electron'

function Heart(props) {
    return (
        <SVG version="1.1" viewBox="0 0 700 700">
            <path
                d="m588.46 93.332v-41.531h-28.465v-33.133h-158.2v33.133h-33.133v41.531h-37.336v-41.531h-37.332v-33.133h-154v33.133h-32.668v41.531h-37.332v149.34h37.332v74.668l32.668-0.003907v41.535h37.332v37.801h42v32.664h37.336v37.336h37.332v37.332h37.332v37.332h37.332l0.003907-37.332h33.133v-37.332h41.531v-37.336h41.535v-32.664h33.133v-37.332l42-0.003907v-42h28.934v-74.664h41.066v-149.34zm-331.8 0h-74.668v145.13h-42v-145.13h42v-41.531h74.668z"
                fill="#FF0000"
            />
        </SVG>
    );
}


const TabLayout = dynamic(() => import('@splunk/react-ui/TabLayout'), {
  ssr: false,
});

TabLayout.Panel = dynamic(() => import('@splunk/react-ui/TabLayout').then((mod) => mod.Panel), {
  ssr: false,
});

const File = dynamic(() => import('@splunk/react-ui/File'), {
  ssr: false,
});

const Menu = dynamic(() => import('@splunk/react-ui/Menu'), {
  ssr: false,
});

Menu.Item = dynamic(() => import('@splunk/react-ui/Menu').then((mod) => mod.Item), {
  ssr: false,
});
Menu.Divider = dynamic(() => import('@splunk/react-ui/Menu').then((mod) => mod.Divider), {
  ssr: false,
});

const List = dynamic(() => import('@splunk/react-ui/List'), {
  ssr: false,
});


List.Item = dynamic(() => import('@splunk/react-ui/List').then((mod) => mod.Item), {
  ssr: false,
});

const Modal = dynamic(() => import('@splunk/react-ui/Modal'), {
    ssr: false,
});

Modal.Header = dynamic(() => import('@splunk/react-ui/Modal').then((mod) => mod.Header), {
    ssr: false,
});
Modal.Body = dynamic(() => import('@splunk/react-ui/Modal').then((mod) => mod.Body), {
    ssr: false,
});
Modal.Footer = dynamic(() => import('@splunk/react-ui/Modal').then((mod) => mod.Footer), {
    ssr: false,
});

const Heading = dynamic(() => import('@splunk/react-ui/Heading'), {
    ssr: false,
});

const Monogram = dynamic(() => import('@splunk/react-ui/Monogram'), {
  ssr: false,
});


const Popover = dynamic(() => import('@splunk/react-ui/Popover'), {
    ssr: false,
});

const P = dynamic(() => import('@splunk/react-ui/Paragraph'), {
    ssr: false,
});

const Chip = dynamic(() => import('@splunk/react-ui/Chip'), {
    ssr: false,
});

const Message = dynamic(() => import('@splunk/react-ui/Message'), {
    ssr: false,
});

const Card = dynamic(() => import('@splunk/react-ui/Card'), {
    ssr: false,
});

const Button = dynamic(() => import('@splunk/react-ui/Button'), {
    ssr: false,
});

const Text = dynamic(() => import('@splunk/react-ui/Text'), {
    ssr: false,
});

const WaitSpinner = dynamic(() => import('@splunk/react-ui/WaitSpinner'), {
    ssr: false,
});

const Link = dynamic(() => import('@splunk/react-ui/Link'), {
    ssr: false,
});

const timer = (ms) => new Promise((response) => setTimeout(response, ms));

async function checkstatus(
    token,
    request_id,
    elapsed,
    setElapsed,
    setFinalReport,
    setIsValidating,
    router,
    setIsLoggingIn,
    setLookupError
) {
    var elapsed = 0;
    var sleep_seconds = 1;
    if (typeof token !== undefined) {
        while (true) {
            elapsed = elapsed + sleep_seconds;
            setElapsed(elapsed);

            var status = await ipcRenderer.invoke('getreportstatus',
            {
                token: token,
                request_id: request_id,
            })
            
            .then((json) => {
                return {status: json};
            })
            


            //Now that we have a valid request ID, let's sleep and loop until our result is complete.
            /*status = await fetch('/api/getreportstatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({
                    token: token,
                    request_id: request_id,
                }),
            })
                .then(async (res) => {
                    if (res.ok) {
                        return res.json();
                    }

                    var data;
                    try {
                        data = await res.json();
                    } catch {
                        data = await res.body();
                    }
                    throw { data: data, status: res.status };
                })
                .then((json) => {
                    return json;
                })
                .catch((data) => {
                    return { status: { status: 'invalid_user' } };
                });
*/

            
            if (status.status.status == 'PROCESSING') {
                await timer(2000);
            }
            else if (status.status.status == 'SUCCESS') {
                console.log('Successfully processed App');


                ipcRenderer.invoke('getreport',
                {
                    token: token,
                    request_id: request_id,
                })
            
                .then((json) => {
                    setFinalReport(json);
                    setIsValidating(false);
                })


               /* fetch('/api/getreport', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },

                    body: JSON.stringify({
                        token: token,
                        request_id: request_id,
                    }),
                })
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        }
                        throw res;
                    })
                    .then((json) => {
                        setFinalReport(json);
                        setIsValidating(false);
                    });*/
                break;
            }
            else {
                await timer(2000);
                console.log(status)
            }
        }
    } else {
        delete router.query.request_id;
        router.push(router);
        setIsValidating(false);
        setIsLoggingIn(false);
    }
    return status;
}

export default function Home() {
    //Params for manipulating request_id in URL
    const router = useRouter();
    const { request_id } = router.query;

    //Toggle Modal for Request ID
    const modalToggle = useRef(null);
    const [moreResourcesModalOpen, setMoreModalResourcesOpen] = useState(false);
    const [lookupRequestModalOpen, setLookupRequestModalOpen] = useState(false);

    //Toggle Modal for Additional Resources
    const [open, setOpen] = useState(false);

    //Authentication
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState();
    const [loginError, setLoginError] = useState(null);
    const [token, setToken] = useState();
    const [invalidUserError, setInvalidUserError] = useState(null);

    // Popover
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [monogramAnchor, setMonogramAnchor] = useState();
    const monogramAnchorRef = useCallback((el) => setMonogramAnchor(el), []);

    //Get Final Report
    const [finalReport, _setFinalReport] = useState({});

    //Process Status
    const [requestId, setRequestId] = useState(request_id);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [selectedTags, setSelectedTags] = useState(['cloud']);
    const [lookupError, setLookupError] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [file, setFile] = useState("");
    const [errorSummary, setErrorSummary] = useState(<></>);

    const [defaultTabLayout, setDefaultTabLayout] = useState('error');

    // Dark mode detection
    const [theme, setMode] = useState('light');

    //What to do if we find a request_id in the URL
    useEffect(() => {
        if (requestId) {
            setIsValidating(true);
            checkstatus(
                token,
                requestId,
                elapsedTime,
                setElapsedTime,
                setFinalReport,
                setIsValidating,
                router,
                setIsLoggingIn
            );
        }
    }, [requestId]);

    useEffect(() => {
        if (router.query.request_id) {
            setRequestId(router.query.request_id);
        }
    }, [router]);

    const setFinalReport = (report) => {
        if (requestId) {
            _setFinalReport(report);
        }
    };

    const lookupRequestById = (request_id) => {
        setIsValidating(true);
        setRequestId(request_id);
        router.query.request_id = request_id;
        router.push(router);
        checkstatus(
            token,
            request_id,
            elapsedTime,
            setElapsedTime,
            setFinalReport,
            setIsValidating,
            router,
            setIsLoggingIn,
            handleLookupError
        );
        setLookupRequestModalOpen(false);
    };

    const closeLookupRequestModal = () => {
        setLookupError('');
        setLookupRequestModalOpen(false);
    };

    //What to do if we find a request_id in the URL
    useEffect(() => {
        if (router.query.request_id !== undefined) {
            if (token) {
                lookupRequestById(router.query.request_id);
            } else {
                refreshPage();
            }
        }
    }, []);

    //This handles dark and light theme of system
    useEffect(() => {
        // Add listener to update styles
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => setMode(e.matches ? 'dark' : 'light'));

        // Setup dark/light mode for the first time
        setMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        // Load token from cookie
        var cookieToken = getCookie('token');
        if (cookieToken) {
            try {
                var details = JSON.parse(
                    Buffer.from(cookieToken.split('.')[1], 'base64').toString()
                );
                setFullName(details['name']);
                setToken(cookieToken);
            } catch {
                deleteCookie('token');
            }
        }

        // Remove listener
        return () => {
            window
                .matchMedia('(prefers-color-scheme: dark)')
                .removeEventListener('change', () => {});
        };
    }, []);

    //Update Password as users are typing
    const updatePassword = (e) => {
        setPassword(e.target.value);
    };

    //Update Password as users are typing
    const updateUsername = (e) => {
        setUsername(e.target.value);
    };

    //Update Password as users are typing
    const changePanelID = (e, { activePanelId: panelId }) => {
        setDefaultTabLayout(panelId);
    };

    //When user clicks the login button
    const login = (e) => {
        e.preventDefault();

        setIsLoggingIn(true);

        ipcRenderer.invoke('auth',
    {
      username: username,
      password: password,
    }
  )
  .then((data) => {
    setIsLoggingIn(false);

    if (data.data === undefined) {
        if (data.msg == 'Failed to authenticate user') {
            setLoginError('Invalid Username or Password');
        } else {
            setLoginError(data.msg);
        }
    } else {
        //setCookie('token', data.data.token);
        setToken(data.data.token);
        setFullName(data.data.user.name);
        setCookie('token', data.data.token);

        if (router.query.request_id) {
            setIsValidating(true);

            checkstatus(
                data.data.token,
                router.query.request_id,
                elapsedTime,
                setElapsedTime,
                setFinalReport,
                setIsValidating,
                router,
                setIsLoggingIn
            );
        }
    }
  }).catch((resp) => console.warn(resp))

       
         

    };

    //Load the file when it is dropped onto the File component
        //Load the file when it is dropped onto the File component
        function loadFile(file) {
          const fileItem = { name: file.name };
  
          const fileReader = new FileReader();
          fileReader.onload = () => {
              fileItem.value = fileReader.result;
          };
          fileReader.readAsDataURL(file);
  
          return fileItem;
      }
  
      const handleAddFiles = (files) => {
          if (files) {
              setFile(loadFile(files));
              setUploadError(null);
          }
      };



    const handleRemoveFile = ({ index }) => {
        setFile(null);
        setUploadError(null);
    };

    const handleSelectTags = (e, { values }) => {
        setSelectedTags(values);
    };

    //How to logout
    const logout = () => {
        setToken(null);
        setFullName(null);
        deleteCookie('token');
        refreshPage();
    };

    //Open and Close the Developer Resources Modal
    const handleRequestOpen = () => {
        setOpen(true);
    };

    const handleRequestClose = () => {
        setOpen(false);
    };

    const handleLookupError = (error) => {
        setIsValidating(false);
        setLookupError(error);
        setLookupRequestModalOpen(true);
    };

    /* Validation Functions */
    const validateApps = (e) => {

        ipcRenderer.invoke('validateapp',
        {
            token: token,
            value: file.value,
            filename: file.name,
            included_tags: selectedTags,
        }
      )
      .then((data) => {
        router.query.request_id = data.request_id;
        router.push(router);
        if (data.request_id) {
            setRequestId(data.request_id);
            setIsValidating(true);
            checkstatus(
                token,
                data.request_id,
                elapsedTime,
                setElapsedTime,
                setFinalReport,
                setIsValidating,
                router,
                setIsLoggingIn
            );
        }
      })
    }
    


        /*fetch('/api/validateapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
                token: token,
                value: file.value,
                filename: file.name,
                included_tags: selectedTags,
            }),
        })
            .then(async (response) => {
                if (response.ok) {
                    return response.json();
                } else if (response.status == 413) {
                    throw { message: 'App package too large' };
                }
 
                var data;
                try {
                    data = await response.json();
                } catch {
                    data = { message: await response.body() };
                }
                throw data;
            })
            .then((data) => {
                router.query.request_id = data.request_id;
                router.push(router);
                if (data.request_id) {
                    setRequestId(data.request_id);
                    setIsValidating(true);
                    checkstatus(
                        token,
                        data.request_id,
                        elapsedTime,
                        setElapsedTime,
                        setFinalReport,
                        setIsValidating,
                        router,
                        setIsLoggingIn
                    );
                }
            })
            .catch((data) => {
                if (data.code == 'Unauthorized') {
                    setLoginError(data.description);
                    logout();
                } else {
                    setUploadError(data.message);
                }
            });*/

    //What to do if a user wants to upload a new app.
    const refreshPage = (e) => {
        delete router.query.request_id;
        router.push(router);
        setElapsedTime(0);
        setIsLoggingIn(false);
        setIsValidating(false);
        setSelectedTags(['cloud']);
        setFile(null);
        setFinalReport({});
        setUsername('');
        setPassword('');
        setRequestId('');
        setPopoverOpen(false);
    };

    //What to do if a user wants to upload a new app.
    const emailAppinspect = (e) => {
        e.preventDefault();
        window.location.href = 'mailto:appinspect@splunk.comn';
    };
    //What to do if a user wants to upload a new app.
    const downloadReport = (e) => {
        e.preventDefault();


        ipcRenderer.invoke('getreporthtml',
            {
                token: token,
                request_id: request_id,
            })
            
            .then((html) => {
                const element = document.createElement('a');
                const file = new Blob([html], {
                    type: 'text/html',
                });
                element.href = URL.createObjectURL(file);
                element.download = 'report.html';
                document.body.appendChild(element); // Required for this to work in FireFox
                element.click();
            });

       /* fetch('/api/getreporthtml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
                token: token,
                request_id: requestId,
            }),
        })
            .then((res) => {
                if (res.ok) {
                    return res.text();
                }
                throw res;
            })
            .then((html) => {
                const element = document.createElement('a');
                const file = new Blob([html], {
                    type: 'text/html',
                });
                element.href = URL.createObjectURL(file);
                element.download = 'report.html';
                document.body.appendChild(element); // Required for this to work in FireFox
                element.click();
            });*/
    };

    useEffect(() => {
        if (finalReport.summary !== undefined) {
            if (finalReport.summary.error > 0) {
                <>
                    <SplunkThemeProvider family="enterprise" colorScheme={theme} density="compact">
                        <Heading
                            level={3}
                            style={{ width: '50%', alignText: 'center', margin: 'auto' }}
                        >
                            Oops! Something went wrong. It looks like we&#39;re having an issue with
                            the appinspect service.
                        </Heading>
                    </SplunkThemeProvider>
                </>;
                setDefaultTabLayout('error');
            } else if (finalReport.summary.failure > 0) {
                setErrorSummary(
                    <>
                        <SplunkThemeProvider
                            family="enterprise"
                            colorScheme={theme}
                            density="compact"
                        >
                            <Heading
                                level={3}
                                style={{ width: '50%', alignText: 'center', margin: 'auto' }}
                            >
                                Great work so far on your app! There&#39;s a few more things
                                you&#39;ll need to sort out before you can submit this app to
                                Splunkbase or as a private app - check out the Failures tab below to
                                see what&#39;s left for you to do.
                            </Heading>
                        </SplunkThemeProvider>
                    </>
                );

                setDefaultTabLayout('failure');
            } else if (finalReport.summary.failure == 0 && finalReport.summary.manual_check > 0) {
                setErrorSummary(
                    <>
                        <SplunkThemeProvider
                            family="enterprise"
                            colorScheme={theme}
                            density="compact"
                        >
                            <Heading
                                level={3}
                                style={{ width: '50%', alignText: 'center', margin: 'auto' }}
                            >
                                Woah, great job on the app! All that&#39;s left are some items that
                                need to be manually checked. Check out the Manual Check&#39;s tab
                                below to see what will get reviewed.
                            </Heading>
                        </SplunkThemeProvider>
                    </>
                );
                setDefaultTabLayout('manual_check');
            } else {
                setErrorSummary(
                    <>
                        <SplunkThemeProvider
                            family="enterprise"
                            colorScheme={theme}
                            density="compact"
                        >
                            <Heading
                                level={3}
                                style={{ width: '50%', alignText: 'center', margin: 'auto' }}
                            >
                                Congratulations! This app looks great. Enjoy using your app.
                            </Heading>
                        </SplunkThemeProvider>
                    </>
                );
                setDefaultTabLayout('success');
            }
        }
    }, [finalReport]);

    const openLookupRequestModel = () => {
        setLookupRequestModalOpen(true);
        setPopoverOpen(false);
    };


    return (
       
        <NoSSR>
            <SplunkThemeProvider family="prisma" colorScheme={theme} density="comfortable">
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                        <td>
                            <div>
                                {fullName ? (
                                    <>
                                        <div style={{ float: 'left', width: '33%' }}>
                                            {' '}
                                            <span
                                                style={{
                                                    fontSize: '50px',
                                                    marginLeft: '20px',
                                                    verticalAlign: 'middle',
                                                    padding: '0px',
                                                }}
                                            >
                                                <Monogram
                                                    style={{
                                                        margin: '10px',
                                                    }}
                                                    backgroundColor="auto"
                                                    initials={"RO"}
                                                    onClick={() => setPopoverOpen(true)}
                                                    elementRef={monogramAnchorRef}
                                                />{' '}
                                                <Popover
                                                    open={popoverOpen}
                                                    anchor={monogramAnchor}
                                                    onRequestClose={() => setPopoverOpen(false)}
                                                >
                                                    <Menu style={{ width: 200 }}>
                                                        <Menu.Item disabled>{fullName}</Menu.Item>
                                                        <Menu.Divider />
                                                        <Menu.Item
                                                            onClick={() => openLookupRequestModel()}
                                                        >
                                                            Lookup by request ID
                                                        </Menu.Item>
                                                        <Menu.Item onClick={() => refreshPage()}>
                                                            Upload another app
                                                        </Menu.Item>
                                                        <Menu.Divider />
                                                        <Menu.Item onClick={() => logout()}>
                                                            Sign-out
                                                        </Menu.Item>
                                                    </Menu>
                                                </Popover>
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <></>
                                )}
                                <div
                                    style={
                                        fullName
                                            ? {
                                                  float: 'right',
                                                  width: '33%',
                                                  justifyContent: 'right',
                                                  alignText: 'right',
                                              }
                                            : {
                                                  float: 'center',
                                                  width: '100%',
                                                  justifyContent: 'center',
                                                  alignText: 'center',
                                              }
                                    }
                                >
                                    <Heading
                                        style={{
                                            paddingTop: '20px',
                                            marginTop: '0px',
                                            textAlign: 'center',
                                            clear: 'both',
                                            justifyContent: 'right',
                                            alignText: 'right',
                                        }}
                                        level={isMobile ? 3 : 1}
                                    >
                                        Splunk Appinspect
                                    </Heading>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {!token ? (
                                <>
                                    {!isMobile ? (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                justify: 'center',
                                                margin: 'auto',
                                                width: '25%',
                                            }}
                                        >
                                            <img
                                                src='wizard.svg'
                                                style={{
                                                    textAlign: 'center',
                                                    justify: 'center',
                                                    margin: 'auto',
                                                    width: '100%',
                                                }}
                                            ></img>
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                justify: 'center',
                                                margin: 'auto',
                                                width: '75%',
                                            }}
                                        >
                                            <img
                                                src='wizard.svg'
                                                style={{
                                                    textAlign: 'center',
                                                    justify: 'center',
                                                    margin: 'auto',
                                                    width: '100%',
                                                }}
                                            ></img>
                                        </div>
                                    )}
                                    <P style={{ padding: '10px', textAlign: 'center' }} level={2}>
                                        Are you ready to start validating your Splunk App for{' '}
                                        <Link target="_new" to="https://splunkbase.splunk.com">
                                            Splunkbase
                                        </Link>{' '}
                                        or{' '}
                                        <Link
                                            target="_new"
                                            to="https://www.splunk.com/en_us/products/splunk-cloud-platform.html"
                                        >
                                            Splunk Cloud Platform
                                        </Link>
                                        ? This is the place for you.
                                    </P>
                                </>
                            ) : (
                                <></>
                            )}
                            {!isValidating ? (
                                <>
                                    {!token ? (
                                        <div
                                            style={{
                                                width: '100%',
                                                display: 'block',
                                                padding: '10px',
                                            }}
                                        >
                                            <div style={{ margin: 'auto', textAlign: 'center' }}>
                                                <Heading
                                                    level={3}
                                                    style={{ margin: 'auto', textAlign: 'center' }}
                                                >
                                                    Enter Your Username and Password for Splunk.com
                                                </Heading>
                                                <br />
                                                {loginError ? (
                                                    <>
                                                        <SplunkThemeProvider
                                                            family="enterprise"
                                                            colorScheme={theme}
                                                            density="compact"
                                                        >
                                                            <Message
                                                                appearance="fill"
                                                                style={{
                                                                    margin: 'auto',
                                                                    width: '50%',
                                                                }}
                                                                type="error"
                                                            >
                                                                {loginError}
                                                            </Message>
                                                        </SplunkThemeProvider>
                                                        <br />
                                                    </>
                                                ) : (
                                                    <></>
                                                )}

                                                <form onSubmit={(e) => login(e)}>
                                                    <div>
                                                        <Text
                                                            value={username}
                                                            onChange={(e) => updateUsername(e)}
                                                            startAdornment={
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        padding: '0 8px',
                                                                    }}
                                                                >
                                                                    <User size={1} />
                                                                </div>
                                                            }
                                                            inline
                                                            placeholder="Username"
                                                        />
                                                        {isMobile ? <br /> : <></>}
                                                        <Text
                                                            inline
                                                            type="password"
                                                            value={password}
                                                            placeholder="Password"
                                                            onChange={(e) => updatePassword(e)}
                                                        />
                                                    </div>

                                                    <br />
                                                    <br />
                                                    <br />
                                                    {isLoggingIn ? (
                                                       <div style={{textAlign:'center', width:'100%'}}>
                                                            <WaitSpinner size="large" />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                inline={false}
                                                                style={{
                                                                    marginBottom: '10px',
                                                                    width: '25%',
                                                                    textAlign: 'center',
                                                                    margin: 'auto',
                                                                }}
                                                                appearance="primary"
                                                                label="Login"
                                                                type="submit"
                                                            />{' '}
                                                        </>
                                                    )}
                                                </form>
                                            </div>
                                        </div>
                                    ) : (
                                        <></>
                                    )}

                                    <>
                                        {token && finalReport.reports == undefined ? (
                                            <>
                                                <div>
                                                    <AppInspectTags
                                                        style={{
                                                            textAlign: 'center',
                                                            paddingTop: '10px',
                                                        }}
                                                        selector={handleSelectTags}
                                                        selectedTags={selectedTags}
                                                    ></AppInspectTags>
                                                </div>
                                                {uploadError ? (
                                                    <>
                                                        <SplunkThemeProvider
                                                            family="enterprise"
                                                            colorScheme={theme}
                                                            density="comfortable"
                                                        >
                                                            <Message
                                                                appearance="fill"
                                                                type="error"
                                                                style={{
                                                                    marginLeft: 'auto',
                                                                    marginRight: 'auto',
                                                                    padding: 'auto',
                                                                    textAlign: 'center',
                                                                    width: '30%',
                                                                }}
                                                            >
                                                                {uploadError}
                                                            </Message>
                                                        </SplunkThemeProvider>
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                                <div
                                                    style={{
                                                        width: '50%',
                                                        textAlign: 'center',
                                                        justifyContent: 'center',
                                                        margin: 'auto',
                                                    }}
                                                >
                                                    <div
                                                        style={{ width: '100%', display: 'block' }}
                                                    >
                                                      {/*}  <File
                                                            onRequestAdd={(files) => {
                                                                if (files.length > 0) {
                                                                    setFile(loadFile(files[0]));
                                                                    setUploadError(null);
                                                                }
                                                            }}
                                                            onRequestRemove={handleRemoveFile}
                                                            error={
                                                                uploadError !== null ? true : false
                                                            }
                                                            supportsMessage={
                                                                <>
                                                                    Supports the following Splunk
                                                                    App file types: .gz, .tgz, .zip,
                                                                    .spl, .tar
                                                                </>
                                                            }
                                                            style={{
                                                                width: '100%',
                                                                textAlign: 'center',
                                                                justifyContent: 'center',
                                                                margin: 'auto',
                                                            }}
                                                            help={
                                                                <>
                                                                    Learn more about{' '}
                                                                    <Link
                                                                        target="_new"
                                                                        to="https://dev.splunk.com/enterprise/reference/appinspect/appinspectapiepref#Splunk-AppInspect-API"
                                                                    >
                                                                        Splunk App File Types
                                                                    </Link>
                                                                </>
                                                            }
                                                            dropAnywhere
                                                            // allowMultiple
                                                        >
                                                            {file ? (
                                                                <File.Item
                                                                    name={file.name}
                                                                    error={
                                                                        uploadError !== null
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        justifyContent: 'center',
                                                                        margin: 'auto',
                                                                    }}
                                                                />
                                                            ) : (
                                                                <></>
                                                            )}
                                                            </File>*/}
                                                       

<input type="file"  onChange={e => 
            handleAddFiles(e.target.files[0])}
       id="splunkapp" name="splunkapp"
       accept=".gz, .tgz, .zip,
       .spl, .tar"/>
                                                    </div>
                                                </div>{' '}
                                                <div style={{ textAlign: 'center' }}>
                                                    <P style={{ textAlign: 'center' }}>
                                                        Learn more about{' '}
                                                        <Link
                                                            target="_new"
                                                            to="https://dev.splunk.com/enterprise/reference/appinspect/appinspectapiepref#Splunk-AppInspect-API"
                                                        >
                                                            Splunk App File Types
                                                        </Link>
                                                    </P>
                                                </div>
                                                <br />
                                                <Button
                                                    inline={false}
                                                    style={
                                                        isMobile
                                                            ? {
                                                                  marginBottom: '10px',
                                                                  width: '75%',
                                                                  textAlign: 'center',
                                                                  margin: 'auto',
                                                                  padding: '10px',
                                                              }
                                                            : {
                                                                  marginBottom: '10px',
                                                                  width: '25%',
                                                                  textAlign: 'center',
                                                                  margin: 'auto',
                                                              }
                                                    }
                                                    appearance="primary"
                                                    label="Validate App(s)"
                                                    type="submit"
                                                    disabled={file ? false : true}
                                                    onClick={validateApps}
                                                />
                                            </>
                                        ) : (
                                            <></>
                                        )}

                                        {finalReport.reports !== undefined ? (
                                            <div style={{ textAlign: 'center', margin: 'auto' }}>
                                                <Heading
                                                    style={{ textAlign: 'center', margin: 'auto' }}
                                                    level={2}
                                                >
                                                    App Validation Complete
                                                </Heading>
                                                <br />
                                                <div
                                                    style={{
                                                        textAlign: 'center',
                                                        margin: 'auto',
                                                        style: '25%',
                                                    }}
                                                >
                                                    {errorSummary}
                                                </div>
                                                <br />
                                                <P style={{ textAlign: 'center' }}>
                                                    Come back any time to view your report:
                                                </P>
                                                <Link
                                                    to={
                                                        'https://appinspect.vercel.app/?request_id=' +
                                                        requestId
                                                    }
                                                >
                                                    {'https://appinspect.vercel.app/?request_id=' +
                                                        requestId}
                                                </Link>
                                                <br />
                                                <br />

                                                <Button
                                                    appearance="destructive"
                                                    onClick={(e) => refreshPage(e)}
                                                    style={{ backgroundColor: '#63BE09' }}
                                                >
                                                    Ready to upload another app?
                                                </Button>
                                                <Button
                                                    appearance="primary"
                                                    onClick={(e) => downloadReport(e)}
                                                >
                                                    Download Report
                                                </Button>
                                                <Button
                                                    appearance="primary"
                                                    onClick={(e) => emailAppinspect(e)}
                                                >
                                                    Have other questions?
                                                </Button>

                                                <br />
                                                <div id="report" style={{ marginTop: 75 }}>
                                                    <Heading
                                                        style={{
                                                            textAlign: 'center',
                                                            margin: 'auto',
                                                        }}
                                                        level={1}
                                                    >
                                                        {finalReport.reports[0].app_name}
                                                    </Heading>
                                                    <Heading
                                                        style={{
                                                            textAlign: 'center',
                                                            margin: 'auto',
                                                        }}
                                                        level={2}
                                                    >
                                                        {finalReport.reports[0].app_description}
                                                    </Heading>
                                                    <TabLayout
                                                        style={{
                                                            width: '75%',
                                                            textAlign: 'center',
                                                            justify: 'center',
                                                            margin: 'auto',
                                                        }}
                                                        defaultActivePanelId={'error'}
                                                        activePanelId={defaultTabLayout}
                                                        onChange={changePanelID}
                                                    >
                                                        <AppinspectReportTab
                                                            icon={
                                                                <Error
                                                                    style={{ color: '#A80000' }}
                                                                />
                                                            }
                                                            disabled={
                                                                finalReport.summary.failure == 0
                                                                    ? true
                                                                    : false
                                                            }
                                                            count={finalReport.summary.failure}
                                                            label={
                                                                'Failures - ' +
                                                                String(finalReport.summary.failure)
                                                            }
                                                            panelId="failure"
                                                            check_result="failure"
                                                            finalreport_groups={
                                                                finalReport.reports[0].groups
                                                            }
                                                        ></AppinspectReportTab>

                                                        <AppinspectReportTab
                                                            icon={
                                                                <Warning
                                                                    style={{ color: '#A05F04' }}
                                                                />
                                                            }
                                                            disabled={
                                                                finalReport.summary.manual_check ==
                                                                0
                                                                    ? true
                                                                    : false
                                                            }
                                                            count={finalReport.summary.manual_check}
                                                            label={
                                                                'Manual Checks - ' +
                                                                String(
                                                                    finalReport.summary.manual_check
                                                                )
                                                            }
                                                            panelId="manual_check"
                                                            check_result="manual_check"
                                                            finalreport_groups={
                                                                finalReport.reports[0].groups
                                                            }
                                                        ></AppinspectReportTab>

                                                        <AppinspectReportTab
                                                            icon={
                                                                <Warning
                                                                    style={{ color: '#A05F04' }}
                                                                />
                                                            }
                                                            disabled={
                                                                finalReport.summary.warning == 0
                                                                    ? true
                                                                    : false
                                                            }
                                                            count={finalReport.summary.warning}
                                                            label={
                                                                'Warning - ' +
                                                                String(finalReport.summary.warning)
                                                            }
                                                            panelId="warning"
                                                            check_result="warning"
                                                            finalreport_groups={
                                                                finalReport.reports[0].groups
                                                            }
                                                        ></AppinspectReportTab>

                                                        <AppinspectReportTab
                                                            icon={
                                                                <InfoCircle
                                                                    style={{ color: '#004FA8' }}
                                                                />
                                                            }
                                                            disabled={
                                                                finalReport.summary
                                                                    .not_applicable == 0
                                                                    ? true
                                                                    : false
                                                            }
                                                            count={
                                                                finalReport.summary.not_applicable
                                                            }
                                                            label={
                                                                'Not Applicable - ' +
                                                                String(
                                                                    finalReport.summary
                                                                        .not_applicable
                                                                )
                                                            }
                                                            panelId="not_applicable"
                                                            check_result="not_applicable"
                                                            finalreport_groups={
                                                                finalReport.reports[0].groups
                                                            }
                                                        ></AppinspectReportTab>

                                                        <AppinspectReportTab
                                                            icon={
                                                                <InfoCircle
                                                                    style={{ color: '#004FA8' }}
                                                                />
                                                            }
                                                            disabled={
                                                                finalReport.summary.skipped == 0
                                                                    ? true
                                                                    : false
                                                            }
                                                            count={finalReport.summary.skipped}
                                                            label={
                                                                'Skipped - ' +
                                                                String(finalReport.summary.skipped)
                                                            }
                                                            panelId="skipped"
                                                            check_result="skipped"
                                                            finalreport_groups={
                                                                finalReport.reports[0].groups
                                                            }
                                                        ></AppinspectReportTab>

                                                        <AppinspectReportTab
                                                            icon={
                                                                <Success
                                                                    style={{ color: '#407A06' }}
                                                                />
                                                            }
                                                            disabled={
                                                                finalReport.summary.success == 0
                                                                    ? true
                                                                    : false
                                                            }
                                                            count={finalReport.summary.success}
                                                            label={
                                                                'Successes - ' +
                                                                String(finalReport.summary.success)
                                                            }
                                                            panelId="success"
                                                            check_result="success"
                                                            finalreport_groups={
                                                                finalReport.reports[0].groups
                                                            }
                                                        ></AppinspectReportTab>

                                                        <AppinspectReportTab
                                                            icon={
                                                                <Error
                                                                    style={{ color: '#A80000' }}
                                                                />
                                                            }
                                                            disabled={
                                                                finalReport.summary.error == 0
                                                                    ? true
                                                                    : false
                                                            }
                                                            count={finalReport.summary.error}
                                                            label={
                                                                'Errors - ' +
                                                                String(finalReport.summary.error)
                                                            }
                                                            panelId="error"
                                                            check_result="error"
                                                            finalreport_groups={
                                                                finalReport.reports[0].groups
                                                            }
                                                        ></AppinspectReportTab>

                                                        <TabLayout.Panel
                                                            label="App Info"
                                                            panelId="info"
                                                            style={{
                                                                textAlign: 'center',
                                                                justify: 'center',
                                                                margin: 'auto',
                                                            }}
                                                        >
                                                            <Card
                                                                minWidth="100%"
                                                                style={{
                                                                    textAlign: 'center',
                                                                    justify: 'center',
                                                                    margin: 'auto',
                                                                }}
                                                            >
                                                                <Heading
                                                                    level={3}
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        justify: 'center',
                                                                        margin: 'auto',
                                                                    }}
                                                                >
                                                                    Author
                                                                </Heading>
                                                                <p>
                                                                    {
                                                                        finalReport.reports[0]
                                                                            .app_author
                                                                    }
                                                                </p>

                                                                <Heading
                                                                    level={3}
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        justify: 'center',
                                                                        margin: 'auto',
                                                                    }}
                                                                >
                                                                    Version
                                                                </Heading>
                                                                <p>
                                                                    {
                                                                        finalReport.reports[0]
                                                                            .app_version
                                                                    }
                                                                </p>

                                                                <Heading
                                                                    level={3}
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        justify: 'center',
                                                                        margin: 'auto',
                                                                    }}
                                                                >
                                                                    Hash
                                                                </Heading>
                                                                <p>
                                                                    {
                                                                        finalReport.reports[0]
                                                                            .app_hash
                                                                    }
                                                                </p>

                                                                <Heading
                                                                    level={3}
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        justify: 'center',
                                                                        margin: 'auto',
                                                                    }}
                                                                >
                                                                    AppInspect Request ID
                                                                </Heading>
                                                                <p>
                                                                    {
                                                                        finalReport.reports[0]
                                                                            .request_id
                                                                    }
                                                                </p>

                                                                <Heading
                                                                    level={3}
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        justify: 'center',
                                                                        margin: 'auto',
                                                                    }}
                                                                >
                                                                    Run Time
                                                                </Heading>
                                                                <p>
                                                                    {
                                                                        finalReport.reports[0]
                                                                            .metrics.start_time
                                                                    }
                                                                </p>

                                                                <Heading
                                                                    level={3}
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        justify: 'center',
                                                                        margin: 'auto',
                                                                    }}
                                                                >
                                                                    Execution Time
                                                                </Heading>
                                                                <p>
                                                                    {Date(
                                                                        finalReport.reports[0]
                                                                            .metrics.execution_time
                                                                    )}
                                                                </p>

                                                                <Heading
                                                                    level={3}
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        justify: 'center',
                                                                        margin: 'auto',
                                                                    }}
                                                                >
                                                                    AppInspect Version
                                                                </Heading>
                                                                <p>
                                                                    {
                                                                        finalReport.run_parameters
                                                                            .appinspect_version
                                                                    }
                                                                </p>

                                                                <Heading
                                                                    level={3}
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        justify: 'center',
                                                                        margin: 'auto',
                                                                    }}
                                                                >
                                                                    Included Tags
                                                                </Heading>
                                                                <div>
                                                                    {finalReport.run_parameters.included_tags.map(
                                                                        (tag, key) => (
                                                                            <Chip key={key}>
                                                                                {tag}
                                                                            </Chip>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </Card>
                                                        </TabLayout.Panel>
                                                    </TabLayout>
                                                </div>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </>
                                </>
                            ) : (
                                <>
                                    <div style={{ textAlign: 'center', margin: 'auto' }}>
                                        <Heading
                                            style={{ textAlign: 'center', margin: 'auto' }}
                                            level={2}
                                        >
                                            Validating Splunk App
                                        </Heading>
                                        <br />
                                        <div style={{textAlign:'center', width:'100%', margin:'auto'}}>

                                        <WaitSpinner  style={{textAlign:'center', width:'100%', margin:'auto'}} size="large" />
                                        </div>
                                        <br />
                                        <P style={{ textAlign: 'center', margin: 'auto' }}>
                                            Elapsed Time: {elapsedTime} Seconds
                                        </P>
                                        <br />
                                        <P style={{ textAlign: 'center', margin: 'auto' }}>
                                            Don&#39;t feel like waiting? Save this link to come back
                                            any time while we process your app.
                                            <br />
                                            <Link
                                                to={
                                                    'https://appinspect.vercel.app/?request_id=' +
                                                    requestId
                                                }
                                            >
                                                {'https://appinspect.vercel.app/?request_id=' +
                                                    requestId}
                                            </Link>
                                        </P>
                                        <br />
                                    </div>
                                </>
                            )}
                            <br />
                            <Modal
                                onRequestClose={() => setLookupRequestModalOpen(false)}
                                open={lookupRequestModalOpen}
                                style={{ width: '600px' }}
                            >
                                <Modal.Header
                                    title="Lookup report by request ID"
                                    onRequestClose={() => closeLookupRequestModal()}
                                />
                                <Modal.Body>
                                    <P>
                                        Provide an AppInspect request ID to lookup a previously run
                                        report.
                                    </P>
                                    <P>
                                        <i>Note that you can only access your own requests!</i>
                                    </P>
                                    {lookupError ? (
                                        <>
                                            <SplunkThemeProvider
                                                family="enterprise"
                                                colorScheme={theme}
                                                density="comfortable"
                                            >
                                                <Message
                                                    appearance="fill"
                                                    type="error"
                                                    style={{
                                                        marginLeft: 'auto',
                                                        marginRight: 'auto',
                                                        padding: 'auto',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                    }}
                                                >
                                                    {lookupError}
                                                </Message>
                                            </SplunkThemeProvider>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                    <Text
                                        canClear
                                        value={requestId}
                                        onChange={(e) => setRequestId(e.target.value)}
                                    />
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button
                                        appearance="primary"
                                        onClick={() => lookupRequestById(requestId)}
                                        label="OK"
                                    />

                                    <Button
                                        onClick={() => closeLookupRequestModal()}
                                        label="Cancel"
                                    />
                                </Modal.Footer>
                            </Modal>
                            <div style={{ textAlign: 'center' }}>
                                <Link ref={modalToggle} onClick={() => handleRequestOpen()}>
                                    <ReportSearch size={1} /> More Splunk Developer Resources
                                </Link>
                            </div>
                            <Modal
                                onRequestClose={() => handleRequestClose()}
                                open={open}
                                style={{ width: '600px' }}
                            >
                                <Modal.Header
                                    title="More Developer Resources"
                                    onRequestClose={() => handleRequestClose(false)}
                                />
                                <Modal.Body>
                                    <List>
                                        <List.Item>
                                            <Link to="https://www.splunk.com/en_us/form/scde.html">
                                                Splunk Cloud Developer Edition
                                            </Link>
                                        </List.Item>
                                        <List.Item>
                                            <Link to="https://dev.splunk.com/">
                                                Splunk Developer Docs
                                            </Link>
                                        </List.Item>
                                    </List>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button
                                        appearance="primary"
                                        onClick={() => handleRequestClose(false)}
                                        label="OK"
                                    />
                                </Modal.Footer>
                            </Modal>{' '}
                            <br />
                            <P style={{ margin: 'auto', textAlign: 'center' }} level={4}>
                                © Copyright 2022 Splunk, Inc.
                            </P>
                            <P style={{ margin: 'auto', textAlign: 'center' }} level={4}>
                                Made with{' '}
                                <span style={{ fontSize: '16px', color: '#A80000' }}>
                                    <Heart />
                                </span>{' '}
                                using <Link to="https://splunkui.splunk.com">Splunk UI</Link>
                            </P>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </SplunkThemeProvider>
        </NoSSR> 
    );
  }
  
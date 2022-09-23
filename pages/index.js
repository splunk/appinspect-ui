import { getCookie, setCookie } from 'cookies-next';
import SplunkThemeProvider from '@splunk/themes/SplunkThemeProvider';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import User from '@splunk/react-icons/User';
import Monogram, { getInitials } from '@splunk/react-ui/Monogram';
import Error from '@splunk/react-icons/Error';
import Warning from '@splunk/react-icons/Warning';
import TabLayout from '@splunk/react-ui/TabLayout';
import InfoCircle from '@splunk/react-icons/InfoCircle';
import Success from '@splunk/react-icons/Success';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AppInspectTags from './components/AppInspectTags';
import AppinspectReportTab from './components/AppinspectReportTab';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';

// const List = dynamic(() => import("@splunk/react-ui/List"), {
//   ssr: false,
// });

const Heading = dynamic(() => import('@splunk/react-ui/Heading'), {
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

const File = dynamic(() => import('@splunk/react-ui/File'), {
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

// Returns a Promise that resolves after "ms" Milliseconds
const timer = (ms) => new Promise((response) => setTimeout(response, ms));

async function checkstatus(
    token,
    request_id,
    elapsed,
    setElapsed,
    setFinalReport,
    setIsValidating
) {
    var status = '';
    var elapsed = 0;
    var sleep_seconds = 1;
    while (true) {
        elapsed = elapsed + sleep_seconds;
        setElapsed(elapsed);

        //Now that we have a valid request ID, let's sleep and loop until our result is complete.
        status = await fetch('http://localhost:3000/api/getreportstatus', {
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
                return json;
            });

        if (status.status == 'PROCESSING') {
            await timer(2000);
        }
        if (status.status == 'SUCCESS') {
            console.log('Successfully processed App');
            fetch('/api/getreport', {
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
                });
            break;
        }
    }
    return status;
}

export default function Home() {
    //Authentication
    const [password, setPassword] = useState();
    const [username, setUsername] = useState();
    const [fullName, setFullName] = useState();
    const [loginError, setLoginError] = useState();
    const [token, setToken] = useState();

    //Get Final Report
    const [finalReport, setFinalReport] = useState({});

    //Process Status
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [selectedTags, setSelectedTags] = useState(['cloud']);
    const [filesArray, setFiles] = useState([]);

    // Dark mode detection
    const [theme, setMode] = useState('light');

    useEffect(() => {
        // setToken(getCookie("token"));

        // Add listener to update styles
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => setMode(e.matches ? 'dark' : 'light'));

        // Setup dark/light mode for the first time
        setMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        // Remove listener
        return () => {
            window
                .matchMedia('(prefers-color-scheme: dark)')
                .removeEventListener('change', () => {});
        };
    }, []);

    /* Authentication Functions */
    const updatePassword = (e) => {
        setPassword(e.target.value);
    };

    const updateUsername = (e) => {
        setUsername(e.target.value);
    };

    const login = (e) => {
        e.preventDefault();

        setIsLoggingIn(true);

        fetch('/api/authsplunkapi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setIsLoggingIn(false);

                if (data.data === undefined) {
                    setLoginError(data.msg);
                } else {
                    //setCookie('token', data.data.token);
                    setToken(data.data.token);
                    setFullName(data.data.user.name);

                    // if (username == "iamthemcmaster") {
                    //   setIsValidating(true);
                    //   checkstatus(
                    //     data.data.token,
                    //     "2abfb848-e888-43fe-a239-f7e0df60cdb2",
                    //     elapsedTime,
                    //     setElapsedTime,
                    //     setFinalReport,
                    //     setIsValidating
                    //   );
                    // }
                }
            });
    };

    /* File Reader Functions */
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
        const newItems = files.map(loadFile);

        setFiles([...filesArray, ...newItems]);
    };

    const handleRemoveFile = ({ index }) => {
        const files = filesArray.slice(0);
        files.splice(index, 1);
        setFiles(files);
    };

    const handleSelectTags = (e, { values }) => {
        setSelectedTags(values);
    };

    /* Validation Functions */
    const validateApps = (e) => {
        for (var item in filesArray) {
            fetch('http://localhost:3000/api/validateapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({
                    token: token,
                    value: filesArray[item].value,
                    filename: filesArray[item].name,
                    included_tags: selectedTags,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.request_id) {
                        setIsValidating(true);
                        checkstatus(
                            token,
                            data.request_id,
                            elapsedTime,
                            setElapsedTime,
                            setFinalReport,
                            setIsValidating
                        );
                    }
                });
        }
    };

    const refreshPage = (e) => {
        console.log('Refreshing');
        setElapsedTime(0);
        setIsLoggingIn(false);
        setIsValidating(false);
        setSelectedTags(['cloud']);
        setFiles([]);
        setFinalReport({});
    };

    const printDocument = (e) => {
        const input = document.getElementById('report');
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'JPEG', 0, 0);
            pdf.save('report.pdf');
        });
    };

    if (fullName) {
        var monogram = (
            <span
                style={{
                    fontSize: '50px',
                    marginLeft: '20px',
                    verticalAlign: 'middle',
                    display: 'inline-block',
                }}
            >
                <Monogram
                    style={{
                        margin: '10px',
                    }}
                    backgroundColor="auto"
                    initials={getInitials(fullName)}
                />{' '}
            </span>
        );
    } else {
        var monogram = null;
    }

    return (
        <SplunkThemeProvider family="prisma" colorScheme={theme} density="comfortable">
            {fullName ? (
                <div>
                    <Dropdown toggle={monogram}>
                        <Menu style={{ width: 200 }}>
                            <Menu.Item>{fullName}</Menu.Item>
                            <Menu.Item>
                                <Link to="/">Sign-out</Link>
                            </Menu.Item>
                        </Menu>
                    </Dropdown>
                </div>
            ) : (
                <></>
            )}
            <br />
            <div style={{ width: '100%' }}>
                <Heading
                    style={{
                        padding: '10px',
                        paddingTop: '0px',
                        marginTop: '0px',
                        textAlign: 'center',
                        clear: 'both',
                    }}
                    level={1}
                >
                    Splunk Appinspect
                </Heading>
            </div>
            {!token ? (
                <>
                    <div style={{ textAlign: 'center', justify: 'center', margin: 'auto' }}>
                        <img
                            src="/wizard.svg"
                            style={{ textAlign: 'center', justify: 'center', margin: 'auto' }}
                        ></img>
                    </div>
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
                        <div style={{ width: '100%', display: 'block' }}>
                            <div style={{ margin: 'auto', textAlign: 'center' }}>
                                <Heading level={2} style={{ margin: 'auto', textAlign: 'center' }}>
                                    Enter Your Username and Password for Splunk.com
                                </Heading>
                                <br />
                                {loginError ? (
                                    <>
                                        <Message
                                            appearance="fill"
                                            type="error"
                                            style={{
                                                margin: 'auto',
                                                textAlign: 'center',
                                                width: '50%',
                                            }}
                                        >
                                            {loginError}
                                        </Message>
                                        <br />
                                    </>
                                ) : (
                                    <></>
                                )}
                                <form onSubmit={(e) => login(e)}>
                                    <Text
                                        defaultValue=""
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
                                        value={username}
                                        onChange={(e) => updateUsername(e)}
                                        inline
                                        placeholder="Username"
                                    />
                                    <Text
                                        inline
                                        type="password"
                                        value={password}
                                        placeholder="Password"
                                        onChange={(e) => updatePassword(e)}
                                    />
                                    <br />
                                    <br />
                                    <br />
                                    {isLoggingIn ? (
                                        <>
                                            <WaitSpinner size="large" />
                                        </>
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
                        <br />
                        {token && finalReport.reports == undefined ? (
                            <>
                                <AppInspectTags
                                    style={{ textAlign: 'center' }}
                                    selector={handleSelectTags}
                                    selectedTags={selectedTags}
                                ></AppInspectTags>
                                <br />
                                <div
                                    style={{
                                        width: '50%',
                                        textAlign: 'center',
                                        justifyContent: 'center',
                                        margin: 'auto',
                                    }}
                                >
                                    <File
                                        onRequestAdd={handleAddFiles}
                                        onRequestRemove={handleRemoveFile}
                                        supportsMessage={
                                            <>
                                                Supports the following Splunk App file types: .gz,
                                                .tgz, .zip, .spl, .tar
                                            </>
                                        }
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

                                        // allowMultiple
                                    >
                                        {filesArray.map((key) => {
                                            return <p key={key}>{key.name}</p>;
                                        })}
                                    </File>
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
                                    style={{
                                        marginBottom: '10px',
                                        width: '25%',
                                        textAlign: 'center',
                                        margin: 'auto',
                                    }}
                                    appearance="primary"
                                    label="Validate App(s)"
                                    type="submit"
                                    onClick={validateApps}
                                />{' '}
                            </>
                        ) : (
                            <></>
                        )}

                        {finalReport.reports !== undefined ? (
                            <div style={{ textAlign: 'center', margin: 'auto' }}>
                                <Button onClick={(e) => refreshPage(e)}>
                                    Ready to upload another app?
                                </Button>

                                <Button onClick={(e) => printDocument(e)}>Save Report</Button>

                                <div id="report" style={{ 'margin-top': 75 }}>
                                    <Heading
                                        style={{ textAlign: 'center', margin: 'auto' }}
                                        level={1}
                                    >
                                        {finalReport.reports[0].app_name}
                                    </Heading>
                                    <Heading
                                        style={{ textAlign: 'center', margin: 'auto' }}
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
                                        defaultActivePanelId="info"
                                    >
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
                                                <p>{finalReport.reports[0].app_author}</p>

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
                                                <p>{finalReport.reports[0].app_author}</p>

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
                                                <p>{finalReport.reports[0].app_version}</p>

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
                                                <p>{finalReport.reports[0].app_hash}</p>

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
                                                <p>{finalReport.request_id}</p>

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
                                                        finalReport.reports[0].metrics.start_time
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
                                                    {finalReport.run_parameters.appinspect_version}
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
                                                <p>
                                                    {finalReport.run_parameters.included_tags.map(
                                                        (key, tag) => (
                                                            <Chip key={key}>{tag}</Chip>
                                                        )
                                                    )}
                                                </p>
                                            </Card>
                                        </TabLayout.Panel>

                                        <AppinspectReportTab
                                            icon={<Error style={{ color: '#A80000' }} />}
                                            disabled={finalReport.summary.error == 0 ? true : false}
                                            count={finalReport.summary.error}
                                            label={'Errors - ' + String(finalReport.summary.error)}
                                            panelId="error"
                                            check_result="error"
                                            finalreport_groups={finalReport.reports[0].groups}
                                        ></AppinspectReportTab>

                                        <AppinspectReportTab
                                            icon={<Error style={{ color: '#A80000' }} />}
                                            disabled={
                                                finalReport.summary.failure == 0 ? true : false
                                            }
                                            count={finalReport.summary.failure}
                                            label={
                                                'Failures - ' + String(finalReport.summary.failure)
                                            }
                                            panelId="failure"
                                            check_result="failure"
                                            finalreport_groups={finalReport.reports[0].groups}
                                        ></AppinspectReportTab>

                                        <AppinspectReportTab
                                            icon={<Warning style={{ color: '#A05F04' }} />}
                                            disabled={
                                                finalReport.summary.manual_check == 0 ? true : false
                                            }
                                            count={finalReport.summary.manual_check}
                                            label={
                                                'Manual Checks - ' +
                                                String(finalReport.summary.manual_check)
                                            }
                                            panelId="manual_check"
                                            check_result="manual_check"
                                            finalreport_groups={finalReport.reports[0].groups}
                                        ></AppinspectReportTab>

                                        <AppinspectReportTab
                                            icon={<Warning style={{ color: '#A05F04' }} />}
                                            disabled={
                                                finalReport.summary.warning == 0 ? true : false
                                            }
                                            count={finalReport.summary.warning}
                                            label={
                                                'Warning - ' + String(finalReport.summary.warning)
                                            }
                                            panelId="warning"
                                            check_result="warning"
                                            finalreport_groups={finalReport.reports[0].groups}
                                        ></AppinspectReportTab>

                                        <AppinspectReportTab
                                            icon={<InfoCircle style={{ color: '#004FA8' }} />}
                                            disabled={
                                                finalReport.summary.not_applicable == 0
                                                    ? true
                                                    : false
                                            }
                                            count={finalReport.summary.not_applicable}
                                            label={
                                                'Not Applicable - ' +
                                                String(finalReport.summary.not_applicable)
                                            }
                                            panelId="not_applicable"
                                            check_result="not_applicable"
                                            finalreport_groups={finalReport.reports[0].groups}
                                        ></AppinspectReportTab>

                                        <AppinspectReportTab
                                            icon={<InfoCircle style={{ color: '#004FA8' }} />}
                                            disabled={
                                                finalReport.summary.skipped == 0 ? true : false
                                            }
                                            count={finalReport.summary.skipped}
                                            label={
                                                'Skipped - ' + String(finalReport.summary.skipped)
                                            }
                                            panelId="skipped"
                                            check_result="skipped"
                                            finalreport_groups={finalReport.reports[0].groups}
                                        ></AppinspectReportTab>

                                        <AppinspectReportTab
                                            icon={<Success style={{ color: '#407A06' }} />}
                                            disabled={
                                                finalReport.summary.success == 0 ? true : false
                                            }
                                            count={finalReport.summary.success}
                                            label={
                                                'Successes - ' + String(finalReport.summary.success)
                                            }
                                            panelId="success"
                                            check_result="success"
                                            finalreport_groups={finalReport.reports[0].groups}
                                        ></AppinspectReportTab>
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
                        <Heading style={{ textAlign: 'center', margin: 'auto' }} level={2}>
                            Validating Splunk App
                        </Heading>
                        <p>Elapsed Time: {elapsedTime} Seconds</p>
                        <WaitSpinner size="large" />
                    </div>
                </>
            )}
            <br />
            <P style={{ margin: 'auto', textAlign: 'center' }} level={4}>
                © Copyright 2022 Splunk, Inc.
            </P>
        </SplunkThemeProvider>
    );
}

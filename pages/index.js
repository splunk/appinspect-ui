import SplunkThemeProvider from '@splunk/themes/SplunkThemeProvider';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Heading from '@splunk/react-ui/Heading';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import User from '@splunk/react-icons/User';

const File = dynamic(() => import('@splunk/react-ui/File'), {
    ssr: false,
});

const Button = dynamic(() => import('@splunk/react-ui/Button'), {
    ssr: false,
});

const Text = dynamic(() => import('@splunk/react-ui/Text'), {
    ssr: false,
});

const JSONTree = dynamic(() => import('@splunk/react-ui/JSONTree'), {
    ssr: false,
});

const WaitSpinner = dynamic(() => import('@splunk/react-ui/WaitSpinner'), {
    ssr: false,
});

const colStyle = {
    padding: 10,
    minHeight: 80,
};

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
    var sleep_seconds = 2;
    while (true) {
        elapsed = elapsed + sleep_seconds;
        setElapsed(elapsed);

        //Now that we have a valid request ID, let's sleep and loop until our result is complete.
        status = await fetch('/api/getreportstatus', {
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
            await timer(3000);
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
    const [filesArray, setFiles] = useState([]);

    //Authentication
    const [children, setChildren] = useState(<></>);
    const [password, setPassword] = useState();
    const [username, setUsername] = useState();
    const [token, setToken] = useState();

    //Request

    //Get Final Report
    const [finalReport, setFinalReport] = useState({});

    //Process Status
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isValidating, setIsValidating] = useState(false);

    /* Authentication Functions */
    const updatePassword = (e) => {
        setPassword(e.target.value);
    };

    const updateUsername = (e) => {
        setUsername(e.target.value);
    };

    const login = (e) => {
        e.preventDefault();

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
                setToken(data.data.token);
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

    /* Validation Functions */
    const validateApps = (e) => {
        for (var item in filesArray) {
            fetch('/api/validateapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({
                    token: token,
                    value: filesArray[item].value,
                    filename: filesArray[item].name,
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

    return (
        <SplunkThemeProvider family="prisma" colorScheme="dark" density="comfortable">
            <ColumnLayout>
                <ColumnLayout.Row>
                    <ColumnLayout.Column style={colStyle} span={4}>
                        <Heading level={1}>Splunk Appinspect</Heading>
                    </ColumnLayout.Column>

                    <ColumnLayout.Column style={colStyle} span={10}></ColumnLayout.Column>
                </ColumnLayout.Row>
            </ColumnLayout>
            {!isValidating ? (
                <>
                    {!token ? (
                        <div style={{ width: '100%', display: 'block' }}>
                            <div style={{ margin: 'auto', textAlign: 'center' }}>
                                <Heading level={2} style={{ margin: 'auto', textAlign: 'center' }}>
                                    Enter Your Username and Password for Splunk.com
                                </Heading>
                                <br />
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
                                        onChange={(e) => updatePassword(e)}
                                    />
                                    <br />
                                    <br />
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
                                        label="Login"
                                        type="submit"
                                    />{' '}
                                </form>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}

                    <>
                        <br />
                        {token ? (
                            <>
                                <File
                                    onRequestAdd={handleAddFiles}
                                    onRequestRemove={handleRemoveFile}
                                    allowMultiple
                                >
                                    {filesArray.map((key) => {
                                        return <p>{key.name}</p>;
                                    })}
                                </File>{' '}
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

                        <JSONTree json={finalReport}></JSONTree>
                    </>
                </>
            ) : (
                <>
                    <div style={{ textAlign: 'center', margin: 'auto' }}>
                        <p>Elapsed Time is {elapsedTime} Seconds</p>
                        <WaitSpinner size="large" />
                    </div>
                </>
            )}
        </SplunkThemeProvider>
    );
}

import SplunkThemeProvider from '@splunk/themes/SplunkThemeProvider';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Heading from '@splunk/react-ui/Heading';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import User from '@splunk/react-icons/User';

const File = dynamic(() => import('@splunk/react-ui/File'), {
    ssr: false,
});

const Text = dynamic(() => import('@splunk/react-ui/Text'), {
    ssr: false,
});

const colStyle = {
    padding: 10,
    minHeight: 80,
};

export default function Home() {
    const [filesArray, setFiles] = useState([]);
    const [children, setChildren] = useState(<></>);
    const [password, setPassword] = useState();
    const [username, setUsername] = useState();

    const updatePassword = (e) => {
        setPassword(e.target.value);
    };

    const updateUsername = (e) => {
        setUsername(e.target.value);
    };

    const submitForm = (e) => {
        e.preventDefault();
        console.log(e.target);
    };
    function loadFile(file) {
        const fileItem = { name: file.name };

        const fileReader = new FileReader();
        fileReader.onload = () => {
            fileItem.value = fileReader.result;
        };
        fileReader.readAsDataURL(file);

        const children_local = filesArray.map((item) => (
            <File.Item itemId={item.name} name={item.name} key={item.name} />
        ));

        setChildren(children_local);
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
            <div style={{ width: '100%', display: 'block' }}>
                <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <Heading level={2} style={{ margin: 'auto', textAlign: 'center' }}>
                        Enter Your Username and Password for Splunk.com
                    </Heading>
                    <br />
                    <form onsubmit={(e) => submitForm(e)}>
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
                        <input type="submit" />
                    </form>
                </div>
            </div>
            <br />
            <File onRequestAdd={handleAddFiles} onRequestRemove={handleRemoveFile} allowMultiple>
                {children}
            </File>{' '}
        </SplunkThemeProvider>
    );
}

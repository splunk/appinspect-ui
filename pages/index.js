import SplunkThemeProvider from '@splunk/themes/SplunkThemeProvider';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Heading from '@splunk/react-ui/Heading';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const File = dynamic(() => import('@splunk/react-ui/File'), {
    ssr: false,
});

const colStyle = {
    padding: 10,
    minHeight: 80,
};

export default function Home() {
    const [filesArray, setFiles] = useState([]);
    const [children, setChildren] = useState(<></>);

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
        console.log(files);
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
            <File onRequestAdd={handleAddFiles} onRequestRemove={handleRemoveFile} allowMultiple>
                {children}
            </File>{' '}
        </SplunkThemeProvider>
    );
}

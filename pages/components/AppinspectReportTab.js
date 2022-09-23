import React, { useCallback, useEffect, useState } from 'react';
import Accordion from '@splunk/react-ui/Accordion';
import TabLayout from '@splunk/react-ui/TabLayout';
import List from '@splunk/react-ui/List';

export default function AppinspectReportTab(props) {
    return (
        <TabLayout.Panel
            label={props.label + ' - ' + String(props.count)}
            panelId={props.panelId}
            icon={props.icon}
            disabled={props.disabled}
            count={props.count}
        >
            {props.count ? (
                <Accordion>
                    {props.finalreport_groups.map((key, group) => {
                        return group.checks.map((key, check) => {
                            if (check.result == props.check_result) {
                                return (
                                    <Accordion.Panel
                                        key={key}
                                        panelId={check.name}
                                        title={check.name}
                                    >
                                        <List>
                                            {check.messages.map((key, message) => {
                                                if (
                                                    message.message_line &&
                                                    message.message_filename
                                                ) {
                                                    return (
                                                        <List.Item key={key}>
                                                            <pre
                                                                style={{
                                                                    'white-space': 'pre-wrap',
                                                                }}
                                                            >
                                                                {message.message}
                                                            </pre>
                                                            <b>File:</b> {message.message_filename}
                                                            <br />
                                                            <b>Line Number:</b>{' '}
                                                            {message.message_line}
                                                        </List.Item>
                                                    );
                                                } else if (message.message_filename) {
                                                    return (
                                                        <List.Item key={key}>
                                                            <pre
                                                                style={{
                                                                    'white-space': 'pre-wrap',
                                                                }}
                                                            >
                                                                {message.message}
                                                            </pre>
                                                            <br />
                                                            <b>File:</b>
                                                            {message.message_filename}
                                                        </List.Item>
                                                    );
                                                } else {
                                                    return (
                                                        <List.Item key={key}>
                                                            <pre
                                                                style={{
                                                                    'white-space': 'pre-wrap',
                                                                }}
                                                            >
                                                                {message.message}
                                                            </pre>
                                                        </List.Item>
                                                    );
                                                }
                                            })}
                                        </List>
                                    </Accordion.Panel>
                                );
                            }
                        });
                    })}
                </Accordion>
            ) : (
                <></>
            )}
        </TabLayout.Panel>
    );
}

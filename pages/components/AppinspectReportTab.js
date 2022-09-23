import React from "react";
import dynamic from "next/dynamic";
import Accordion from "@splunk/react-ui/Accordion";
import TabLayout from "@splunk/react-ui/TabLayout";
import List from "@splunk/react-ui/List";
const P = dynamic(() => import("@splunk/react-ui/Paragraph"), {
  ssr: false,
});

const Heading = dynamic(() => import("@splunk/react-ui/Heading"), {
  ssr: false,
});

export default function AppinspectReportTab(props) {
  return (
    <TabLayout.Panel
      label={props.label + " - " + String(props.count)}
      panelId={props.panelId}
      icon={props.icon}
      disabled={props.disabled}
      count={props.count}
    >
      {props.count ? (
        <Accordion>
          {props.finalreport_groups.map((group) => {
            return group.checks.map((group_key, check) => {
              if (group_key.result == props.check_result) {
                return (
                  <Accordion.Panel
                    key={check}
                    panelId={group_key.name}
                    title={group_key.name}
                  >
                    <List>
                      {group_key.messages.length == 0 ? (
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          <List.Item>{group_key.description}</List.Item>
                        </pre>
                      ) : (
                        group_key.messages.map((message, key) => {
                          if (
                            message.message_line &&
                            message.message_filename
                          ) {
                            return (
                              <List.Item key={key}>
                                <pre
                                  style={{
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {message.message}
                                </pre>
                                <b>File:</b> {message.message_filename}
                                <br />
                                <b>Line Number:</b> {message.message_line}
                              </List.Item>
                            );
                          } else if (message.message_filename) {
                            return (
                              <List.Item key={key}>
                                <pre
                                  style={{
                                    whiteSpace: "pre-wrap",
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
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {message.message}
                                </pre>
                              </List.Item>
                            );
                          }
                        })
                      )}
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

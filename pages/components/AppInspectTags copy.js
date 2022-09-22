import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useState } from "react";
import { includes, without } from "lodash";
import Multiselect from "@splunk/react-ui/Multiselect";
const Heading = dynamic(() => import("@splunk/react-ui/Heading"), {
  ssr: false,
});
const Switch = dynamic(() => import("@splunk/react-ui/Switch"), {
  ssr: false,
});

const Link = dynamic(() => import("@splunk/react-ui/Link"), {
  ssr: false,
});

const P = dynamic(() => import("@splunk/react-ui/Paragraph"), {
  ssr: false,
});

export default function AppInspectTags(props) {
  return (
    <>
      <Heading level={3} style={{ textAlign: "center" }}>
        Select Appinspect Tags
      </Heading>
      <P style={{ textAlign: "center" }}>
        See{" "}
        <Link
          target="_new"
          to="https://dev.splunk.com/enterprise/reference/appinspect/appinspecttagreference/"
        >
          Appinspect Tag Reference
        </Link>{" "}
        for more information.
      </P>
      <br />
      <div
        style={{
          width: "100%",
          textAlign: "center",
          margin: "auto",
          justify: "center",
        }}
      >
        <Multiselect
          style={{
            width: "50%",
            textAlign: "center",
            margin: "auto",
            justify: "center",
          }}
          values={props.selectedTags}
          onChange={props.selector}
          inline
        >
          {[
            "advanced_xml",
            "alert_actions_conf",
            "appapproval",
            "cloud",
            "custom_search_commands_v2",
            "custom_search_commands",
            "custom_visualizations",
            "custom_workflow_actions",
            "deprecated_feature",
            "developer_guidance",
            "django_bindings",
            "future",
            "inputs_conf",
            "itsi",
            "jquery",
            "manual",
            "markdown",
            "malicious",
            "modular_input(s)",
            "offensive",
            "packaging_standards",
            "private_app",
            "private_classic",
            "private_victoria",
            "removed_feature",
            "restmap_config",
            "savedsearches",
            "security",
            "self-service",
            "splunk_5_0",
            "splunk_6_0",
            "splunk_6_1",
            "splunk_6_2",
            "splunk_6_3",
            "splunk_6_4",
            "splunk_6_5",
            "splunk_6_6",
            "splunk_7_0",
            "splunk_7_1",
            "splunk_7_2",
            "splunk_7_3",
            "splunk_8_0",
            "splunk_appinspect",
            "web_conf",
          ].map((value) => (
            <Multiselect.Option label={value} value={value} />
          ))}
        </Multiselect>
      </div>
      <br />
    </>
  );
}

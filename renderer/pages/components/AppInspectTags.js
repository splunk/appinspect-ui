import dynamic from 'next/dynamic';
import React from 'react';
import Multiselect from 'multiselect-react-dropdown';


/*const Multiselect = dynamic(() => import('@splunk/react-ui/Multiselect'), {
    ssr: false,
});

Multiselect.Option =import('@splunk/react-ui/Multiselect').then((mod) => mod.Option), {
    ssr: false,
}*/


const Heading = dynamic(() => import('@splunk/react-ui/Heading'), {
    ssr: false,
});

const Link = dynamic(() => import('@splunk/react-ui/Link'), {
    ssr: false,
});

const P = dynamic(() => import('@splunk/react-ui/Paragraph'), {
    ssr: false,
});

export default function AppInspectTags(props) {
    if (typeof window === 'undefined') {
        return <div></div>;
    } else {
        return (
            <>
                <Heading level={3} style={{ textAlign: 'center', position: 'bottom' }}>
                    Select Appinspect Tags
                </Heading>
                <P style={{ textAlign: 'center' }}>
                    See{' '}
                    <Link
                        target="_new"
                        to="https://dev.splunk.com/enterprise/reference/appinspect/appinspecttagreference/"
                    >
                        Appinspect Tag Reference
                    </Link>{' '}
                    for more information.
                </P>
                <br />
                <div
                    style={{
                        width: '100%',
                        textAlign: 'center',
                        margin: 'auto',
                        justify: 'center',
                    }}
                >
                {/*<Multiselect
                        style={{
                            width: '50%',
                            textAlign: 'center',
                            margin: 'auto',
                            justify: 'center',
                        }}
                        values={props.selectedTags}
                        onChange={props.selector}
                        inline
                    >
                        {[
                            'advanced_xml',
                            'alert_actions_conf',
                            'appapproval',
                            'cloud',
                            'custom_search_commands_v2',
                            'custom_search_commands',
                            'custom_visualizations',
                            'custom_workflow_actions',
                            'deprecated_feature',
                            'developer_guidance',
                            'django_bindings',
                            'future',
                            'inputs_conf',
                            'itsi',
                            'jquery',
                            'manual',
                            'markdown',
                            'malicious',
                            'modular_input(s)',
                            'offensive',
                            'packaging_standards',
                            'private_app',
                            'private_classic',
                            'private_victoria',
                            'removed_feature',
                            'restmap_config',
                            'savedsearches',
                            'security',
                            'self-service',
                            'splunk_5_0',
                            'splunk_6_0',
                            'splunk_6_1',
                            'splunk_6_2',
                            'splunk_6_3',
                            'splunk_6_4',
                            'splunk_6_5',
                            'splunk_6_6',
                            'splunk_7_0',
                            'splunk_7_1',
                            'splunk_7_2',
                            'splunk_7_3',
                            'splunk_8_0',
                            'splunk_appinspect',
                            'web_conf',
                        ].map((key, value) => (
                            <Multiselect.Option label={key} value={value} />
                        ))}
                        </Multiselect>*/}

<Multiselect
options={[
    {name: 'advanced_xml', id:1},
    {name: 'alert_actions_conf', id:2},
    {name: 'appapproval', id:3},
    {name: 'cloud', id:4},
    {name: 'custom_search_commands_v2', id:5},
    {name: 'custom_search_commands', id:6},
    {name: 'custom_visualizations', id:7},
    {name: 'custom_workflow_actions', id:8},
    {name: 'deprecated_feature', id:9},
    {name: 'developer_guidance', id:10},
    {name: 'django_bindings', id:11},
    {name: 'future', id:12},
    {name: 'inputs_conf', id:13},
    {name: 'itsi', id:14},
    {name: 'jquery', id:15},
    {name: 'manual', id:16},
    {name: 'markdown', id:17},
    {name: 'malicious', id:18},
    {name: 'modular_input(s)', id:19},
    {name: 'offensive', id:20},
    {name: 'packaging_standards', id:21},
    {name: 'private_app', id:22},
    {name: 'private_classic', id:23},
    {name: 'private_victoria', id:24},
    {name: 'removed_feature', id:25},
    {name: 'restmap_config', id:26},
    {name: 'savedsearches', id:27},
    {name: 'security', id:28},
    {name: 'self-service', id:29},
    {name: 'splunk_5_0', id:30},
    {name: 'splunk_6_0', id:31},
    {name: 'splunk_6_1', id:32},
    {name: 'splunk_6_2', id:33},
    {name: 'splunk_6_3', id:34},
    {name: 'splunk_6_4', id:35},
    {name: 'splunk_6_5', id:36},
    {name: 'splunk_6_6', id:37},
    {name: 'splunk_7_0', id:38},
    {name: 'splunk_7_1', id:39},
    {name: 'splunk_7_2', id:40},
    {name: 'splunk_7_3', id:41},
    {name: 'splunk_8_0', id:42},
    {name: 'splunk_appinspect', id:43},
    {name: 'web_conf', id:44}
    ]} // Options to display in the dropdown
selectedValues={props.selectedValue} // Preselected value to persist in dropdown
onSelect={props.selector} // Function will trigger on select event
onRemove={props.selector} // Function will trigger on remove event
displayValue="name" // Property name to display in the dropdown options
/>


                </div>
                <br />
            </>
        );
    }
}
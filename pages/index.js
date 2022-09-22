import SplunkThemeProvider from "@splunk/themes/SplunkThemeProvider";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useState } from "react";
import User from "@splunk/react-icons/User";
import Error from "@splunk/react-icons/Error";
import Warning from "@splunk/react-icons/Warning";
import InfoCircle from "@splunk/react-icons/InfoCircle";
import Success from "@splunk/react-icons/Success";
import TabBar from "@splunk/react-ui/TabBar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const List = dynamic(() => import("@splunk/react-ui/List"), {
  ssr: false,
});

const Heading = dynamic(() => import("@splunk/react-ui/Heading"), {
  ssr: false,
});

const P = dynamic(() => import("@splunk/react-ui/Paragraph"), {
  ssr: false,
});

const DL = dynamic(() => import("@splunk/react-ui/DefinitionList"), {
  ssr: false,
});

const Message = dynamic(() => import("@splunk/react-ui/Message"), {
  ssr: false,
});

const Card = dynamic(() => import("@splunk/react-ui/Card"), {
  ssr: false,
});

const CardLayout = dynamic(() => import("@splunk/react-ui/CardLayout"), {
  ssr: false,
});

const File = dynamic(() => import("@splunk/react-ui/File"), {
  ssr: false,
});

const Button = dynamic(() => import("@splunk/react-ui/Button"), {
  ssr: false,
});

const Text = dynamic(() => import("@splunk/react-ui/Text"), {
  ssr: false,
});

const JSONTree = dynamic(() => import("@splunk/react-ui/JSONTree"), {
  ssr: false,
});

const WaitSpinner = dynamic(() => import("@splunk/react-ui/WaitSpinner"), {
  ssr: false,
});

const Link = dynamic(() => import("@splunk/react-ui/Link"), {
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
  var status = "";
  var elapsed = 0;
  var sleep_seconds = 1;
  while (true) {
    elapsed = elapsed + sleep_seconds;
    setElapsed(elapsed);

    //Now that we have a valid request ID, let's sleep and loop until our result is complete.
    status = await fetch("/api/getreportstatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

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

    if (status.status == "PROCESSING") {
      await timer(2000);
    }
    if (status.status == "SUCCESS") {
      console.log("Successfully processed App");
      fetch("/api/getreport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

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

  // Tabs
  const [activeTabId, setActiveTabId] = useState("one");

  // Dark mode detection
  const [theme, setMode] = useState("light");

  useEffect(() => {
    // Add listener to update styles
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => setMode(e.matches ? "dark" : "light"));

    // Setup dark/light mode for the first time
    setMode(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );

    // Remove listener
    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", () => {});
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

    fetch("/api/authsplunkapi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

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
          setToken(data.data.token);
          setFullName(data.data.user.name);

          setIsValidating(true);

          if (username == "iamthemcmaster") {
            checkstatus(
              data.data.token,
              "2abfb848-e888-43fe-a239-f7e0df60cdb2",
              elapsedTime,
              setElapsedTime,
              setFinalReport,
              setIsValidating
            );
          }
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

  /* Validation Functions */
  const validateApps = (e) => {
    for (var item in filesArray) {
      fetch("/api/validateapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

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

  const printDocument = (e) => {
    const input = document.getElementById("report");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "JPEG", 0, 0);
      pdf.save("report.pdf");
    });
  };

  const handleChange = useCallback((e, { selectedTabId }) => {
    setActiveTabId(selectedTabId);
  }, []);
  return (
    <SplunkThemeProvider
      family="prisma"
      colorScheme={theme}
      density="comfortable"
    >
      <Heading style={{ padding: "10px" }} level={1}>
        Splunk Appinspect
      </Heading>

      <P
        style={{ padding: "10px", textAlign: "ceter", width: "50%" }}
        level={2}
      >
        Are you ready to start validating your Splunk App for{" "}
        <Link target="_new" to="https://splunkbase.splunk.com">
          Splunkbase
        </Link>
        ? If so
      </P>

      {fullName ? (
        <Heading style={{ padding: "10px" }} level={2}>
          Welcome, {fullName}
        </Heading>
      ) : (
        <></>
      )}

      {!isValidating ? (
        <>
          {!token ? (
            <div style={{ width: "100%", display: "block" }}>
              <div style={{ margin: "auto", textAlign: "center" }}>
                <Heading
                  level={2}
                  style={{ margin: "auto", textAlign: "center" }}
                >
                  Enter Your Username and Password for Splunk.com
                </Heading>
                <br />
                {loginError ? (
                  <>
                    <Message
                      appearance="fill"
                      type="error"
                      style={{
                        margin: "auto",
                        textAlign: "center",
                        width: "50%",
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
                          display: "flex",
                          alignItems: "center",
                          padding: "0 8px",
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
                          marginBottom: "10px",
                          width: "25%",
                          textAlign: "center",
                          margin: "auto",
                        }}
                        appearance="primary"
                        label="Login"
                        type="submit"
                      />{" "}
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
                <File
                  onRequestAdd={handleAddFiles}
                  onRequestRemove={handleRemoveFile}
                  supportsMessage={
                    <>
                      Supports the following Splunk App file types: .gz, .tgz,
                      .zip, .spl, .tar
                    </>
                  }
                  help={
                    <>
                      Learn more about{" "}
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
                    return <p>{key.name}</p>;
                  })}
                </File>{" "}
                <br />
                <Button
                  inline={false}
                  style={{
                    marginBottom: "10px",
                    width: "25%",
                    textAlign: "center",
                    margin: "auto",
                  }}
                  appearance="primary"
                  label="Validate App(s)"
                  type="submit"
                  onClick={validateApps}
                />{" "}
              </>
            ) : (
              <></>
            )}

            {finalReport.reports !== undefined ? (
              <div style={{ textAlign: "center", margin: "auto" }}>
                <Button onClick="window.location.reload();">
                  Ready to upload another app?
                </Button>

                <Button onClick={(e) => printDocument(e)}>Save Report</Button>

                <div class="report">
                  <Heading
                    style={{ textAlign: "center", margin: "auto" }}
                    level={1}
                  >
                    {finalReport.reports[0].app_name}
                  </Heading>
                  <Heading
                    style={{ textAlign: "center", margin: "auto" }}
                    level={2}
                  >
                    {finalReport.reports[0].app_description}
                  </Heading>

                  <CardLayout
                    cardMaxWidth="50%"
                    style={{ textAlign: "center", margin: "auto" }}
                  >
                    <Card
                      maxWidth="50%"
                      style={{ textAlign: "center", margin: "auto" }}
                    >
                      <DL termWidth={150}>
                        <DL.Term>Author</DL.Term>
                        <DL.Description>
                          {finalReport.reports[0].app_author}
                        </DL.Description>
                        <DL.Term>Version</DL.Term>
                        <DL.Description>
                          {finalReport.reports[0].app_version}
                        </DL.Description>
                        <DL.Term>Hash</DL.Term>
                        <DL.Description>
                          {finalReport.reports[0].app_hash}
                        </DL.Description>
                        <DL.Term>AppInspect Request ID</DL.Term>
                        <DL.Description>
                          {finalReport.request_id}
                        </DL.Description>
                        <DL.Term>Run Time</DL.Term>
                        <DL.Description>
                          {finalReport.reports[0].metrics.start_time}
                        </DL.Description>
                        <DL.Term>Execution Time</DL.Term>
                        <DL.Description>
                          {finalReport.reports[0].metrics.execution_time}
                        </DL.Description>
                        <DL.Term>AppInspect Version</DL.Term>
                        <DL.Description>
                          {finalReport.run_parameters.appinspect_version}
                        </DL.Description>
                      </DL>
                    </Card>
                  </CardLayout>

                  <CardLayout
                    cardMaxWidth="50%"
                    style={{ textAlign: "center", margin: "auto" }}
                  >
                    <Card
                      maxWidth="50%"
                      style={{ textAlign: "center", margin: "auto" }}
                    >
                      <DL termWidth={150}>
                        <DL.Term>
                          <Error style={{ color: "#A80000" }} /> Errors
                        </DL.Term>
                        <DL.Description>
                          {finalReport.summary.error}
                        </DL.Description>
                        <DL.Term>
                          <Error style={{ color: "#A80000" }} /> Failures
                        </DL.Term>
                        <DL.Description>
                          {finalReport.summary.failure}
                        </DL.Description>
                        <DL.Term>
                          {" "}
                          <Warning style={{ color: "#A05F04" }} /> Manual Checks
                        </DL.Term>
                        <DL.Description>
                          {finalReport.summary.manual_check}
                        </DL.Description>
                        <DL.Term>
                          <Warning style={{ color: "#A05F04" }} /> Warnings
                        </DL.Term>
                        <DL.Description>
                          {finalReport.summary.warning}
                        </DL.Description>
                        <DL.Term>
                          <InfoCircle style={{ color: "#004FA8" }} /> Not
                          Applicable
                        </DL.Term>
                        <DL.Description>
                          {finalReport.summary.not_applicable}
                        </DL.Description>
                        <DL.Term>
                          <InfoCircle style={{ color: "#004FA8" }} /> Skipped
                        </DL.Term>
                        <DL.Description>
                          {finalReport.summary.skipped}
                        </DL.Description>
                        <DL.Term>
                          {" "}
                          <Success style={{ color: "#407A06" }} /> Successes
                        </DL.Term>
                        <DL.Description>
                          {finalReport.summary.success}
                        </DL.Description>
                      </DL>
                    </Card>
                  </CardLayout>
                  <TabBar activeTabId={activeTabId} onChange={handleChange}>
                    <TabBar.Tab label="Tab One" tabId="one" count={1} />
                    <TabBar.Tab
                      disabled
                      label="Tab Two"
                      tabId="two"
                      count={13}
                    />
                    <TabBar.Tab label="Tab Three" tabId="three" count={0} />
                    <TabBar.Tab label="Tab Four" tabId="four" count={4} />
                    <TabBar.Tab label="Tab Five" tabId="five" count={908} />
                  </TabBar>
                </div>

                <JSONTree json={finalReport}></JSONTree>
              </div>
            ) : (
              <></>
            )}
          </>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", margin: "auto" }}>
            <Heading style={{ textAlign: "center", margin: "auto" }} level={2}>
              Validating Splunk App
            </Heading>
            <p>Elapsed Time is {elapsedTime} Seconds</p>
            <WaitSpinner size="large" />
          </div>
        </>
      )}
      <br />
      <Heading style={{ margin: "auto", textAlign: "center" }} level={4}>
        © Copyright 2022 Splunk, Inc.
      </Heading>
    </SplunkThemeProvider>
  );
}

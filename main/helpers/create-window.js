import { screen, BrowserWindow, ipcMain } from "electron";
import Store from "electron-store";
import axios from "axios";
import { FormData } from "formdata-node";
import { Readable } from "stream";
import { FormDataEncoder } from "form-data-encoder";
import { Blob } from "buffer";
import fetch from "node-fetch";

function dataURLtoBlob(dataURI) {
  var byteString = atob(dataURI.split(",")[1]);
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  try {
    return new Blob([ia], { type: mimeString });
  } catch (e) {}
}

ipcMain.handle("validateapp", async (event, ...args) => {
  var string = args[0].value;
  var regex = /^data:.+\/(.+);base64,(.*)$/;

  var matches = string.match(regex);
  var ext = matches[1];
  var data = matches[2];
  var buffer = Buffer.from(data, "base64");
  var blob = new Blob(buffer);

  const form = new FormData();
  form.append("app_package", dataURLtoBlob(args[0].value), args[0].filename);
  form.append("included_tags", "cloud");
  const encoder = new FormDataEncoder(form);

  var result = fetch("https://appinspect.splunk.com/v1/app/validate", {
    method: "POST",
    body: Readable.from(encoder),
    headers: {
      "content-type": encoder.contentType,
      Authorization: "Bearer " + args[0].token,
      "Cache-Control": "no-cache",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  })
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }

      var data;
      try {
        data = await response.json();
      } catch {
        data = await response.body();
      }
      throw { data: data, status: response.status };
    })
    .then((data) => {
      return data;
    })
    .catch((response) => {
      console.log(response);
    });

  return result;
});

ipcMain.handle("auth", async (event, ...args) => {
  const result = await axios.get(
    "https://api.splunk.com/2.0/rest/login/splunk",
    {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(args[0].username + ":" + args[0].password).toString(
            "base64"
          ),
      },
    }
  );

  return result.data;
});

ipcMain.handle("getreporthtml", async (event, ...args) => {
  var result = await fetch(
    "https://appinspect.splunk.com/v1/app/report/" + args[0].request_id,
    {
      method: "GET",
      headers: {
        Authorization: "bearer " + args[0].token,
        "Cache-Control": "no-cache",

        "Content-Type": "text/html",
      },
    }
  );
  var result = await result.text();
  return result;
});

ipcMain.handle("getreportstatus", async (event, ...args) => {
  var result = await fetch(
    "https://appinspect.splunk.com/v1/app/validate/status/" +
      args[0].request_id,
    {
      method: "GET",
      headers: {
        Authorization: "bearer " + args[0].token,
        "Content-Type": "application/json",
      },
    }
  );
  var result = await result.json();
  return result;
});

ipcMain.handle("getreport", async (event, ...args) => {
  var result = await fetch(
    "https://appinspect.splunk.com/v1/app/report/" + args[0].request_id,
    {
      method: "GET",
      headers: {
        Authorization: "bearer " + args[0].token,
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
    }
  )
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
      var data = await response.json();
      throw { data: data, status: response.status };
    })
    .then((data) => {
      return data;
    })
    .catch((response) => {
      return response;
    });

  return result;
});

export default function createWindow(windowName, options) {
  const key = "window-state";
  const name = `window-state-${windowName}`;
  const store = new Store({ name });
  const defaultSize = {
    width: options.width,
    height: options.height,
  };
  let state = {};
  let win;

  const restore = () => store.get(key, defaultSize);

  const getCurrentPosition = () => {
    const position = win.getPosition();
    const size = win.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  };

  const windowWithinBounds = (windowState, bounds) => {
    return (
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    );
  };

  const resetToDefaults = () => {
    const bounds = screen.getPrimaryDisplay().bounds;
    return Object.assign({}, defaultSize, {
      x: (bounds.width - defaultSize.width) / 2,
      y: (bounds.height - defaultSize.height) / 2,
    });
  };

  const ensureVisibleOnSomeDisplay = (windowState) => {
    const visible = screen.getAllDisplays().some((display) => {
      return windowWithinBounds(windowState, display.bounds);
    });
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults();
    }
    return windowState;
  };

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
    store.set(key, state);
  };

  state = ensureVisibleOnSomeDisplay(restore());

  win = new BrowserWindow({
    ...options,
    ...state,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      ...options.webPreferences,
    },
  });

  win.on("close", saveState);

  return win;
}

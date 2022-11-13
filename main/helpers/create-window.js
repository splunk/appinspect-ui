import { screen, BrowserWindow, ipcMain, nativeTheme } from "electron";
import Store from "electron-store";
import { FormData } from "formdata-node";
import { Readable } from "stream";
import { FormDataEncoder } from "form-data-encoder";
import fetch from "node-fetch";
import fs from "fs";
import { Blob } from "buffer";

ipcMain.handle("validateapp", async (event, ...args) => {
  let buffer = fs.readFileSync(args[0].path);
  let blob = new Blob([buffer], {
    type: args[0].contenttype,
  });

  const form = new FormData();
  form.append("app_package", blob, args[0].name);
  form.append("included_tags", args[0].included_tags);
  form.append("stack_id", "appinspect_ui");

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

      var responsedata;
      try {
        responsedata = await response.json();
      } catch {
        responsedata = await response.body();
      }
      throw { data: responsedata, status: response.status };
    })
    .then((finaldata) => {
      return finaldata;
    })
    .catch((response) => {
      console.log(response);
    });

  return result;
});

ipcMain.handle("auth", async (event, ...args) => {
  var result = await fetch("https://api.splunk.com/2.0/rest/login/splunk", {
    method: "GET",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(args[0].username + ":" + args[0].password).toString(
          "base64"
        ),
    },
  });
  var result = await result.json();
  return result;
});

ipcMain.handle("shouldusedark", async (event, ...args) => {
  return nativeTheme.shouldUseDarkColors;
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
      additionalArguments: ["--darkmode=" + nativeTheme.shouldUseDarkColors],
    },
  });

  if (nativeTheme.shouldUseDarkColors) {
    win.setBackgroundColor("#000");
  } else {
    win.setBackgroundColor("#FFF");
  }

  win.on("close", saveState);

  return win;
}

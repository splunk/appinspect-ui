import {app, protocol, 
  screen,
  BrowserWindow,ipcMain
} from 'electron';
import Store from 'electron-store';
import axios from 'axios'
import { FormData } from 'formdata-node';

import { Readable } from 'stream';
import { Blob } from 'buffer';
import formDataEncode from 'formdata-encode'


function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}



ipcMain.handle('validateapp', async (event, ...args) => {
   

  const form = new FormData();
  form.append('app_package', dataURLtoBlob(args[0].value), args[0].filename);
  form.append('included_tags', 'cloud');
  const blob = formDataEncode(form)
  console.log(args[0].token)

  blob.arrayBuffer().then((buffer) => {
    axios.post('https://appinspect.splunk.com/v1/app/validate', buffer, {
      headers: {
        'content-type': blob.type,
        'Authorization': 'Bearer ' + args[0].token,
        'Cache-Control': 'no-cache'
      },
    })
    .then(async (response) => {
      console.log(response)
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
    console.log(data)
      return data
  })
  .catch((response) => {
    console.log(response)
  });


  })

})




  ipcMain.handle('auth', async (event, ...args) => {
   

    const result = await axios.get(
      "https://api.splunk.com/2.0/rest/login/splunk", {
  method: "GET",
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(args[0].username + ":" + args[0].password).toString(
        "base64"
      ),
  },
}
    )  

    console.log(result)
    return result.data

  })


export default function createWindow(windowName, options) {
  const key = 'window-state';
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
      y: (bounds.height - defaultSize.height) / 2
    });
  };

  const ensureVisibleOnSomeDisplay = (windowState) => {
    const visible = screen.getAllDisplays().some(display => {
      return windowWithinBounds(windowState, display.bounds)
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

  win.on('close', saveState);

  return win;
};

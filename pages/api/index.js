const app = require('express')();
const { v4 } = require('uuid');

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    try {
        return new Blob([ia], { type: mimeString });
    } catch (e) {}
}

app.get('/api', (req, res) => {
    const path = `/api/item/${v4()}`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get('/api/validateapp', (req, res) => {
    const form = new FormData();
    form.append('app_package', dataURItoBlob(req.body.value), req.body.filename);
    form.append('included_tags', req.body.included_tags);
    const encoder = new FormDataEncoder(form);

    fetch('https://appinspect.splunk.com/v1/app/validate', {
        method: 'POST',
        body: Readable.from(encoder),
        headers: {
            Authorization: 'Bearer ' + req.body.token,
            'Cache-Control': 'no-cache',
            'content-type': encoder.contentType,
        },
    })
        .then(async (response) => {
            if (response.ok) {
                return response.json();
            }

            var data;
            try {
                data = await response.json();
                console.log(response);
            } catch {
                data = await response.body();
                console.log(response);
            }
            throw { data: data, status: response.status };
        })
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((response) => {
            res.status(response.status).json(response.data);
        });
});

app.get('/api/getreportstatus', (req, res) => {
    fetch('https://appinspect.splunk.com/v1/app/validate/status/' + req.body.request_id, {
        method: 'GET',
        headers: {
            Authorization: 'bearer ' + req.body.token,
        },
    })
        .then(async (response) => {
            if (response.ok) {
                return response.json();
            }
            var data = await response.json();
            throw { data: data, status: response.status };
        })
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((response) => {
            res.status(response.status).json(response.data);
        });
});

app.get('/api/getreporthtml', (req, res) => {
    fetch('https://appinspect.splunk.com/v1/app/report/' + req.body.request_id, {
        method: 'GET',
        headers: {
            Authorization: 'bearer ' + req.body.token,
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/html',
        },
    })
        .then((res) => {
            if (res.ok) {
                return res.text();
            }
            throw res;
        })
        .then((html) => {
            res.status(200);
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        })
        .catch((response) => {
            res.status(response.status).json(response.json());
        });
});

app.get('/api/getreport', (req, res) => {
    fetch('https://appinspect.splunk.com/v1/app/report/' + req.body.request_id, {
        method: 'GET',
        headers: {
            Authorization: 'bearer ' + req.body.token,
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
        },
    })
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            throw res;
        })
        .then((json) => {
            res.status(200).json(json);
        })
        .catch((response) => {
            res.status(response.status).json(response.json());
        });
});

app.get('/api/authsplunkapi', (req, res) => {
    fetch('https://api.splunk.com/2.0/rest/login/splunk', {
        method: 'GET',
        headers: {
            Authorization:
                'Basic ' +
                Buffer.from(req.body.username + ':' + req.body.password).toString('base64'),
        },
    })
        .then(async (response) => {
            if (response.ok) {
                return response.json();
            }

            var data = await response.json();
            throw { data: data, status: response.status };
        })
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((response) => {
            res.status(response.status).json(response.data);
        });
});

module.exports = app;

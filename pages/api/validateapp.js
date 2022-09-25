import { FormData } from 'formdata-node';
import { FormDataEncoder } from 'form-data-encoder';
import { Readable } from 'stream';
import { Blob } from 'buffer';

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

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    {
        const buf = await buffer(req);
        const rawBody = buf.toString('utf8');
        var jsonresult = { rawBody };

        var result = JSON.parse(jsonresult.rawBody);
        const form = new FormData();
        form.append('app_package', dataURItoBlob(result.value), result.filename);
        form.append('included_tags', result.included_tags);
        const encoder = new FormDataEncoder(form);

        fetch('https://appinspect.splunk.com/v1/app/validate', {
            method: 'POST',
            body: Readable.from(encoder),
            headers: {
                Authorization: 'Bearer ' + result.token,
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
                } catch {
                    data = await response.body();
                }
                throw { data: data, status: response.status };
            })
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((response) => {
                res.status(response.status).json(response.data);
            });
    }
}

export const config = {
    api: {
        responseLimit: false,
        bodyParser: false,
    },
};

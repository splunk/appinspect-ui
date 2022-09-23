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

export default function handler(req, res) {
    {
        const form = new FormData();
        form.append('app_package', dataURItoBlob(req.body.value), req.body.filename);
        form.append('included_tags', req.body.included_tags);

        // console.log(form);
        const encoder = new FormDataEncoder(form);

        console.log(encoder);

        fetch('https://appinspect.splunk.com/v1/app/validate', {
            method: 'POST',
            body: Readable.from(encoder),
            headers: {
                Authorization: 'Bearer ' + req.body.token,
                'Cache-Control': 'no-cache',
                'content-type': encoder.contentType,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                res.status(200).json(data);
            });
    }
}

export const config = {
    api: {
        responseLimit: false,
        bodyParser: { sizeLimit: '100mb' },
    },
};

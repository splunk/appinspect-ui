import FormData from 'form-data';

export default function handler(req, res) {
    const form = new FormData();

    var base64ToBuffer = function (base64) {
        var byteString = new Buffer(base64, 'base64').toString('binary');

        var ab = new Buffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return ab;
    };

    form.append('app_package', base64ToBuffer(req.body.value), req.body.filename);
    form.append('included_tags', 'cloud');

    fetch('https://appinspect.splunk.com/v1/app/validate', {
        method: 'POST',
        body: form,
        headers: {
            Authorization: 'Bearer ' + req.body.token,
            'Cache-Control': 'no-cache',
        },
    })
        .then((response) => response.json())
        .then((data) => {
            res.status(200).json(data);
        });
}

export const config = {
    api: {
        responseLimit: false,
        bodyParser: { sizeLimit: '100mb' },
    },
};

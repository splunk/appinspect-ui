export default function handler(req, res) {
    fetch('https://appinspect.splunk.com/v1/app/validate/status/' + req.body.request_id, {
        method: 'GET',
        headers: {
            Authorization: 'bearer ' + req.body.token,
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
        });
}

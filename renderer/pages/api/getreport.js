export default function handler(req, res) {
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
}
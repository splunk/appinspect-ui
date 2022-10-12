export default function handler(req, res) {
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
}
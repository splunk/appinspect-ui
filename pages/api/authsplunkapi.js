export default function handler(req, res) {
    fetch('https://api.splunk.com/2.0/rest/login/splunk', {
        method: 'GET',
        headers: {
            Authorization:
                'Basic ' +
                Buffer.from(req.body.username + ':' + req.body.password).toString('base64'),
        },
    })
        .then((response) => response.json())
        .then((data) => {
            res.status(200).json(data);
        });
}

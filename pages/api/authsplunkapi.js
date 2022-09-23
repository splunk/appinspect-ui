export default function handler(req, res) {
  fetch("https://api.splunk.com/2.0/rest/login/splunk", {
    method: "GET",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(req.body.username + ":" + req.body.password).toString(
          "base64"
        ),
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
}

export default function handler(req, res) {
  fetch(
    "https://appinspect.splunk.com/v1/app/validate/status/" +
      req.body.request_id,
    {
      method: "GET",
      headers: {
        Authorization: "bearer " + req.body.token,
      },
    }
  )
    .then(async (res) => {
      if (res.ok) {
        return res.json();
      }
      var data = await res.json();
      throw { data: data, status: response.status };
    })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((response) => {
      res.status(response.status).json(response.data);
    });
}

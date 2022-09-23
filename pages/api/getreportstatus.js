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
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
      var data = await response.json();
      throw { data: data, status: response.status };
    })
<<<<<<< Updated upstream
        .then(async (res) => {
            if (res.ok) {
                return res.json();
            }
            var data = await res.json();
            throw { data: data, status: res.status };
        })
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((response) => {
            res.status(response.status).json(response.data);
        });
=======
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((response) => {
      res.status(response.status).json(response.data);
    });
>>>>>>> Stashed changes
}

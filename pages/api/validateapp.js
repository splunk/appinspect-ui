import { FormData } from "formdata-node";
import { FormDataEncoder } from "form-data-encoder";
import { Readable } from "stream";

export default function handler(req, res) {
  fetch(req.body.value)
    .then((res) => res.blob())
    // .then((blob) => blob.arrayBuffer())
    .then((blob) => {
      const form = new FormData();
      form.append("app_package", blob, req.body.filename);
      form.append("included_tags", req.body.included_tags);

      // console.log(form);
      const encoder = new FormDataEncoder(form);

      fetch("https://appinspect.splunk.com/v1/app/validate", {
        method: "POST",
        body: Readable.from(encoder),
        headers: {
          Authorization: "Bearer " + req.body.token,
          "Cache-Control": "no-cache",
          "content-type": encoder.contentType,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          res.status(200).json(data);
        });
    });
}

export const config = {
  api: {
    responseLimit: false,
    bodyParser: { sizeLimit: "100mb" },
  },
};

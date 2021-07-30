const form = document.querySelector("#url-form");

const handleSubmit = async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const formDataObj = {};

  for (let pair of formData.entries()) {
    console.log(pair);
    if (pair[1] !== "") {
      formDataObj[pair[0]] = pair[1];
    }
  }

  const response = await fetch("/url", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formDataObj),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.created) {
        console.log(`${window.location.protocol}//${window.location.hostname}`);
      }
      console.log(data);
    });
};

form.addEventListener("submit", handleSubmit);

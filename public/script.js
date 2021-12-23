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
  });
  console.log(response);
  const data = await response.json();
  console.log(data);

  if (data.created) {
    console.log(`${window.location.protocol}//${window.location.hostname}`);
    const resultSection = document.getElementById("result");

    resultSection.innerText = null;

    const newLink = document.createElement("a");
    newLink.innerText = "hello";
    newLink.href = "https://www.google.com/";
    resultSection.appendChild(newLink);
  }
  console.log(data);
};

form.addEventListener("submit", handleSubmit);

const form = document.querySelector("#url-form");

const handleSubmit = async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const formDataObj = {};

  for (let pair of formData.entries()) {
    if (pair[1] !== "") {
      formDataObj[pair[0]] = pair[1];
    }
  }

  const resultSection = document.getElementById("result");
  resultSection.innerHTML = "";

  try {
    const response = await fetch("/url", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formDataObj),
    });

    const data = await response.json();

    if (!response.ok && data.error) {
      throw new Error(data.error.message);
    } else if (!response.ok) {
      throw new Error("Bad Response");
    } else if (data.created) {
      const shortURL = `${window.location}${data.created.slug}`;

      const newLink = document.createElement("a");
      newLink.innerText = shortURL;
      newLink.href = shortURL;
      resultSection.appendChild(newLink);
      resultSection.style.display = "block";
    } else {
      console.log(data);
    }
  } catch (e) {
    switch (e.message) {
      case "slug in use":
        resultSection.innerText = "🐌 Slug Already Taken";
        break;
      case "invalid url":
        resultSection.innerText = "Invalid URL";
        break;
      default:
        resultSection.innerText = "OOPs something went wrong";
    }
    resultSection.style.display = "block";
  }
};

form.addEventListener("submit", handleSubmit);

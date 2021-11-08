function loaderStripe() {
  const element = document.querySelector(".main");
  if (element) {
    element.classList.add("is-loading");

    let resolveFunction;
    new Promise((resolve) => {
      resolveFunction = resolve;
    }).then(() => {
      element.classList.remove("is-loading");
    });

    return resolveFunction;
  }
}

export default loaderStripe;

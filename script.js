const jumpButton = document.getElementById("jumpButton");
const cat = document.querySelector(".cat");
const shadow = document.querySelector(".shadow");

function triggerJump() {
  if (cat.classList.contains("cat--jump")) return;

  cat.classList.add("cat--jump");
  shadow.classList.add("shadow--jump");
  jumpButton.disabled = true;
}

cat.addEventListener("animationend", () => {
  cat.classList.remove("cat--jump");
  shadow.classList.remove("shadow--jump");
  jumpButton.disabled = false;
});

jumpButton.addEventListener("click", triggerJump);

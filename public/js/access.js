// Elements
$passwordInput = document.querySelector("#password-input");
$showHideIcon = document.querySelector("#show-hide");

function showHideToggle() {
  if ($passwordInput.type === "password") {
    $passwordInput.type = "text";
    $showHideIcon.src = "./img/show-pass-icon.svg";
  } else {
    $passwordInput.type = "password";
    $showHideIcon.src = "./img/hide-pass-icon.svg";
  }
}

//TODO: add show hide func in login.html

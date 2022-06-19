//fades all selected elements out, then in
function fade() {
  var elements = document.querySelectorAll(".fade");
  elements.forEach((e) => {
    console.log("an element with fade")
    e.classList.remove("fade");
    e.classList.add("fade-out");
    setTimeout(()=>{
      e.classList.add("fade");
      e.classList.remove("fade-out");
    },300);
  });
}
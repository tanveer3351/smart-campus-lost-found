const linkItems = document.querySelectorAll(".navlinks ul li");
const menuToggle = document.getElementById("menu-toggle");
const navbar = document.querySelector(".navbar");

linkItems.forEach((item) => {
  item.addEventListener("click", function () {
    document
      .querySelector(".navlinks ul li.active")
      ?.classList.remove("active");

    this.classList.add("active");
  });
});

menuToggle.addEventListener("click", function () {
  navbar.classList.toggle("menu-open");

  const isOpen = navbar.classList.contains("menu-open");

  menuToggle.setAttribute("aria-expanded", isOpen);
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

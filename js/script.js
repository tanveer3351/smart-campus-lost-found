const linkItems = document.querySelectorAll(".navlinks ul li");

linkItems.forEach(item => {
    item.addEventListener("click",function(){
        document.querySelector(".navlinks ul li.active")?.classList.remove("active");

        this.classList.add("active");
    });
});
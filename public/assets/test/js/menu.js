const menu = document.querySelector(".menu-block");
const menuMain = menu?.querySelector(".site-menu-main");
const submenuAll = menu?.querySelectorAll(".sub-menu");
const menuTrigger = document.querySelector(".mobile-menu-trigger");
const closeMenu = menu?.querySelector(".mobile-menu-close");
const body = document.querySelector("body");
const menuOverlay = document.querySelector(".menu-overlay");

let subMenu;
let subMenuArray = [];
let subMenuTextArray = [];

function last(array) {
  return array[array.length - 1];
}

function last2(array) {
  return array[array.length - 2];
}

menuMain?.addEventListener("click", (e) => {

  if (!menu.classList.contains("active")) {
    return;
  }
  if (e.target.closest(".nav-item-has-children")) {
    const hasChildren = e.target.closest(".nav-item-has-children");

    showSubMenu(hasChildren);
  }

});

function toggleMenu() {
  menu.classList.toggle("active");
  menuOverlay.classList.toggle("active");
  menu.classList.add("transition");
  menuOverlay.classList.add("transition");
}

menuTrigger?.addEventListener("click", () => {
  toggleMenu();
})

closeMenu?.addEventListener("click", () => {
  toggleMenu();
})

menuOverlay.addEventListener("click", () => {
  toggleMenu();
})

window.addEventListener("resize", function () {
  if (menu.classList.contains("transition")) {
    menu.classList.remove("transition");
  }
  if (menuOverlay.classList.contains("transition")) {
    menuOverlay.classList.remove("transition");
  }
})

function showSubMenu(hasChildren) {
  subMenu = hasChildren.querySelector(".sub-menu");
  subMenu.classList.toggle("active");
}

window.onresize = function () {
  if (this.innerWidth > 991) {
    if (menu.classList.contains("active")) {
      toggleMenu();
    }
  }
}

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 50 ||
    document.documentElement.scrollTop > 50
  ) {
    $(".site-header--sticky").addClass("scrolling");
  } else {
    $(".site-header--sticky").removeClass("scrolling");
  }
  if (
    document.body.scrollTop > 700 ||
    document.documentElement.scrollTop > 700
  ) {
    $(".site-header--sticky.scrolling").addClass("reveal-header");
  } else {
    $(".site-header--sticky.scrolling").removeClass("reveal-header");
  }
}
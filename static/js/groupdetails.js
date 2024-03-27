function submitForm(url) {
    document.getElementById('myForm').action = url;
    document.getElementById('myForm').submit();
  }
  
  const expand_btn = document.querySelector(".expand-btn");
  
  expand_btn.addEventListener("click", () => {
    document.body.classList.toggle("collapsed");
  });
  
  const current = window.location.href;
  
  const allLinks = document.querySelectorAll(".sidebar-links a");
  
  allLinks.forEach((elem) => {
    elem.addEventListener('click', function () {
      const hrefLinkClick = elem.href;
  
      allLinks.forEach((link) => {
        if (link.href == hrefLinkClick) {
          link.classList.add("active");
        } else {
          link.classList.remove('active');
        }
      });
    })
  });
  

  function filterUsers() {
    var input, filter, userList, userOptions, i, txtValue;
    input = document.getElementById("userSearch");
    filter = input.value.toUpperCase();
    userList = document.getElementById("userList");
    userOptions = userList.getElementsByClassName("userOption");

    // Toggle the display of the userList based on input
    userList.style.display = input.value.trim() ? "block" : "none";

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < userOptions.length; i++) {
        txtValue = userOptions[i].textContent || userOptions[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            userOptions[i].style.display = "";
        } else {
            userOptions[i].style.display = "none";
        }
    }
}

  
  
  
  
  
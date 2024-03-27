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
    var input, filter, userList, userOptions, label, i, txtValue;
    input = document.getElementById('userSearch');
    filter = input.value.toUpperCase();
    userList = document.getElementById('userList');
    userOptions = userList.getElementsByClassName('userOption');

    for (i = 0; i < userOptions.length; i++) {
        label = userOptions[i].getElementsByTagName('label')[0];
        txtValue = label.textContent || label.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            userOptions[i].style.display = "";
        } else {
            userOptions[i].style.display = "none";
        }
    }
}
  
  
  
  
  
const domContainer = document.querySelector('#search');
ReactDOM.render(e(SearchField, ))

let sideBarOpen = true;
let contentdiv = document.getElementsByClassName("content")[0];
let navbutton = document.getElementById("navbutton");

function toggleSideBar() {
    let pos = sideBarOpen? 300:0;
    let id = setInterval(frame, 5);
    function frame() {
        if (sideBarOpen == true) {
            if (pos <= 0.001) {
                sideBarOpen = false;
                navbutton.innerHTML = "&#x25B6;"
                clearInterval(id);
            } else {
                pos *= 0.75;
                contentdiv.style.left = pos + 'px';
                navbutton.style.left = (pos+4).toString() + 'px';
            }
        } else {
            if (pos >= 299.99) {
                sideBarOpen = true;
                navbutton.innerHTML = "&#x25C0";
                clearInterval(id);
            } else {
                pos += (300 - pos)/3
                contentdiv.style.left = pos + 'px';
                navbutton.style.left = (pos+4).toString() + 'px';                
            }
        }
    }
}

function dropdown(id) {
    $('#'+id).slideToggle(100);
}
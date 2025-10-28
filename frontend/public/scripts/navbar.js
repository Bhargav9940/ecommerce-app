async function loadNavbar() {
    try {
        const res = await fetch("/navbar.html");
        const html = await res.text();
        const navbarDiv = document.createElement("div");
        navbarDiv.innerHTML = html;

        document.body.insertBefore(navbarDiv, document.body.firstChild);
        //verifying user login status
        const verifyRes = await fetch(`${window.CONFIG.BACKEND_BASE_URL}/user/verify`, {
            credentials: "include"
        });

        const data = await verifyRes.json();

        const cartLink = document.getElementById("cart-link");
        const userDropdown = document.getElementById("user-dropdown");
        const navUsername = document.getElementById("nav-username");
        const loginLink = document.getElementById("login-link");
        const signupLink = document.getElementById("signup-link");

        if(data?.success && data?.user) {
            const user = data.user;
            cartLink.classList.remove("d-none");
            userDropdown.classList.remove("d-none");
            navUsername.innerText = user.name || "User";

            //hide login/signup
            loginLink.classList.add("d-none");
            signupLink.classList.add("d-none");
        }
        else {
            loginLink.classList.remove("d-none");
            signupLink.classList.remove("d-none");

            // hide cart and dropdown
            cartLink.classList.add("d-none");
            userDropdown.classList.add("d-none");
        }
    }
    catch(error) {
        console.error("Failed to load navbar: ", error);
    }
}

//Loading navbar
document.addEventListener("DOMContentLoaded", loadNavbar);
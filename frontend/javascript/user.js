
window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("chat_token");

  if (!token) {
    alert("You are not logged in!");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch user");
    }

    // Render user info
    document.getElementById("userFullName").textContent = `${data.firstName} ${data.lastName}`;
    document.getElementById("userEmail").textContent = data.email;
    document.getElementById("profileImage").src = `http://localhost:5000/uploads/${data.profile_image}`;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("chat_token");
        window.location.href = "login.html";
      });
    }

    // Load all users initially
    const allUsers = await loadUsers(token);

    // Add search functionality
    const searchBar = document.querySelector(".users .search input");
    const searchBtn = document.querySelector(".users .search button");

    searchBtn.onclick = () => {
      searchBar.classList.toggle("active");
      searchBar.focus();
      searchBtn.classList.toggle("active");
    };

    searchBar.addEventListener("input", () => {
      const keyword = searchBar.value.toLowerCase();
      const filteredUsers = allUsers.filter(user =>
        (user.firstName + " " + user.lastName).toLowerCase().includes(keyword)
      );
      renderUsers(filteredUsers);
    });

  } catch (err) {
    console.error("Error loading user:", err);
    alert("Session expired or failed to fetch user.");
    localStorage.removeItem("chat_token");
    window.location.href = "login.html";
  }
});

async function loadUsers(token) {
  try {
    const res = await fetch("http://localhost:5000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const users = await res.json();
    renderUsers(users);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

function renderUsers(users) {
  const usersList = document.getElementById("userList");
  usersList.innerHTML = "";

  if (users.length === 0) {
    usersList.innerHTML = "<p>No users found.</p>";
    return;
  }

  users.forEach((user) => {
    const userItem = document.createElement("a");
    userItem.href = `chat.html?id=${user.id}`;
    userItem.innerHTML = `
      <div class="content">
        <img src="http://localhost:5000/uploads/${user.profile_image}" alt="">
        <div class="details">
          <span>${user.firstName} ${user.lastName}</span>
          <p>Click to chat</p>
        </div>
      </div>
      <div class="status-dot"><i class="fa fa-circle"></i></div>
    `;
    usersList.appendChild(userItem);
  });
}

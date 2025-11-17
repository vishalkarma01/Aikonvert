document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.querySelector(".header .avatar");
  const modal = document.getElementById("account-modal");
  const accountInfo = document.getElementById("account-info");
  const form = document.getElementById("create-account-form");
  const titleEl = document.getElementById("account-modal-title");
  const subText = document.getElementById("account-subtext");

  if (!profileBtn) return;

  // When clicking avatar → Fetch account data
  profileBtn.addEventListener("click", () => {
    fetch("/user_info")
      .then(res => res.json())
      .then(data => {
        modal.style.display = "flex";

        if (!data.has_account) {
          // New user view
          titleEl.textContent = "Create Your Account";
          subText.textContent = "Get 10 free coupons to use our converter services.";

          accountInfo.innerHTML = `<p>You don't have an account yet. Create one to get 10 free coupons!</p>`;
          form.style.display = "block";
        } else {
          // Existing user view
          titleEl.textContent = "Profile Details";
          subText.textContent = "";

          form.style.display = "none";
          accountInfo.innerHTML = `
            <h3>Your Account</h3>
            <p><strong>Nickname:</strong> ${data.nickname}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Remaining Coupons:</strong> ${data.remaining_coupons}</p>
            <h4>Recent Conversions:</h4>
            <ul>
              ${data.conversions.map(c => `<li>${c.type} → ${c.converted_file}</li>`).join("")}
            </ul>
          `;
        }
      });
  });

  // Form Submit → Create Account
  form.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch("/users/create_account", {
      method: "POST",
      headers: {
        "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content
      },
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        titleEl.textContent = "Profile Details";
        subText.textContent = "";
        accountInfo.innerHTML = `<p>Account created successfully! You now have ${data.remaining_coupons} coupons.</p>`;
        form.style.display = "none";
      } else {
        accountInfo.innerHTML = `<p style="color:red">${data.errors.join(", ")}</p>`;
      }
    });
  });

  // Close modal when clicking background
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
  });
});

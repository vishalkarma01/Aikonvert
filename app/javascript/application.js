import "@hotwired/turbo-rails";
import "controllers";
import "controllers/account_modal";

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------------
  // 1️⃣ Intro Section Animation
  // -----------------------------
  const intro = document.getElementById("intro");
  const main = document.getElementById("main");

  setTimeout(() => {
    intro.style.transition = "opacity 0.5s";
    intro.style.opacity = 0;
    setTimeout(() => {
      intro.style.display = "none";
      main.classList.remove("hidden");
      main.style.opacity = 1;
    }, 500);
  }, 3000);

  // -----------------------------
  // 2️⃣ Fetch user from backend
  // -----------------------------
  async function fetchUser() {
    try {
      const res = await fetch("/users/ensure_session_user");
      const data = await res.json();

      window.currentUser = {
        session_token: data.session_token,
        remaining_coupons: data.remaining_coupons,
        has_account: data.has_account,
        guest: !data.has_account
      };
      localStorage.setItem("currentUser", JSON.stringify(window.currentUser));
      return window.currentUser;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      return window.currentUser || { remaining_coupons: 0, has_account: false, guest: true };
    }
  }

  // Initialize user session
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    window.currentUser = JSON.parse(storedUser);
  }
  fetchUser(); // Always refresh on page load

  // -----------------------------
  // 3️⃣ Conversion Modal Logic
  // -----------------------------
  const modal = document.getElementById("upload-section");
  const openBtns = document.querySelectorAll(".open-upload-modal");
  const cancelBtns = modal.querySelectorAll(".cancel-btn");
  const converterTypeField = document.getElementById("converter_type_field");
  const targetSelect = document.getElementById("target_format_select");
  const uploadForm = document.getElementById("upload-form");
  let loadingSection = document.getElementById("loading-section");
  const downloadSection = document.getElementById("download-section");

  if (!loadingSection) {
    loadingSection = document.createElement("div");
    loadingSection.id = "loading-section";
    loadingSection.style.display = "none";
    loadingSection.style.marginTop = "20px";
    loadingSection.style.textAlign = "center";
    loadingSection.innerHTML = `<div class="loader"></div><p>Converting your file, please wait...</p>`;
    modal.querySelector(".upload-container").appendChild(loadingSection);
  }

  const converterFormats = {
    jpeg_to_png: ["png"],
    png_to_jpeg: ["jpeg"],
    image_converter: ["jpeg", "png", "gif", "bmp", "tiff", "webp", "heic"],
    pdf_converter: ["pdf", "doc", "docx"],
    doc_converter: ["doc", "docx", "pdf"]
  };

  // -----------------------------
  // 4️⃣ Open Modal + Populate Formats
  // -----------------------------
  openBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      await fetchUser(); // Refresh before checking

      if (window.currentUser.remaining_coupons <= 0) {
        modal.style.display = "none";
        document.getElementById("upgrade-popup").style.display = "flex";
        return;
      }

      const type = btn.dataset.conversionType;
      converterTypeField.value = type;

      targetSelect.innerHTML = "";
      (converterFormats[type] || []).forEach(format => {
        const opt = document.createElement("option");
        opt.value = format;
        opt.textContent = format.toUpperCase();
        targetSelect.appendChild(opt);
      });

      uploadForm.reset();
      downloadSection.style.display = "none";
      loadingSection.style.display = "none";
      modal.style.display = "flex";
    });
  });

  // -----------------------------
  // 5️⃣ Close Modal
  // -----------------------------
  function closeModal() {
    modal.style.display = "none";
    uploadForm.reset();
    downloadSection.style.display = "none";
    loadingSection.style.display = "none";
    targetSelect.innerHTML = "";
  }
  cancelBtns.forEach(btn => btn.addEventListener("click", closeModal));
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

  // -----------------------------
  // 6️⃣ File Conversion Logic
  // -----------------------------
  if (uploadForm) {
    uploadForm.addEventListener("submit", async e => {
      e.preventDefault();
      await fetchUser();

      if (window.currentUser.remaining_coupons <= 0) {
        modal.style.display = "none";
        document.getElementById("upgrade-popup").style.display = "flex";
        return;
      }

      const formData = new FormData(uploadForm);
      loadingSection.style.display = "block";
      downloadSection.style.display = "none";

      try {
        const response = await fetch(uploadForm.action, {
          method: "POST",
          headers: { 'X-CSRF-Token': document.querySelector("meta[name='csrf-token']").content },
          body: formData
        });

        if (!response.ok) throw new Error("Conversion failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        let filename = "converted_file";
        const disposition = response.headers.get("Content-Disposition");
        if (disposition) {
          const match = disposition.match(/filename="([^"]+)"/);
          if (match && match[1]) filename = match[1];
        } else if (formData.get("file")) {
          const originalName = formData.get("file").name;
          const baseName = originalName.split(".")[0];
          const ext = targetSelect.value;
          filename = `${baseName}_converted.${ext}`;
        }

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        loadingSection.style.display = "none";

        // Update local count
        window.currentUser.remaining_coupons -= 1;
        localStorage.setItem("currentUser", JSON.stringify(window.currentUser));
      } catch (err) {
        loadingSection.style.display = "none";
        alert("Error converting file. Please try again.");
        console.error(err);
      }
    });
  }

  // -----------------------------
  // 7️⃣ Upgrade Popup Logic
  // -----------------------------
  const upgradePopup = document.getElementById("upgrade-popup");
  const closePopupBtn = document.getElementById("close-upgrade-popup");
  const upgradeBtn = document.getElementById("upgrade-btn");

  if (closePopupBtn) closePopupBtn.addEventListener("click", () => { upgradePopup.style.display = "none"; });
  if (upgradeBtn) upgradeBtn.addEventListener("click", () => { window.location.href = "/pricing"; });

  // -----------------------------
  // 8️⃣ Premium Plans Button
  // -----------------------------
  const premiumBtn = document.getElementById("open-premium-plans");
  const convertPopup = document.getElementById("upload-section");
  premiumBtn.addEventListener("click", e => {
    e.preventDefault();
    if (convertPopup) convertPopup.style.display = "none";
    if (upgradePopup) {
      upgradePopup.style.display = "flex";
      upgradePopup.style.zIndex = "999999";
      upgradePopup.style.opacity = "1";
      upgradePopup.style.visibility = "visible";
    }
  });

  // -----------------------------
  // 9️⃣ Profile Access (Guest Handling)
  // -----------------------------
  const profileBtn = document.getElementById("open-profile"); // profile button
  const profileModal = document.getElementById("profile-modal"); // profile modal
  const createAccountModal = document.getElementById("account-modal"); // create account modal

  if (profileBtn) {
    profileBtn.addEventListener("click", async e => {
      e.preventDefault();
      await fetchUser();

      if (!window.currentUser.has_account) {
        if (createAccountModal) {
          createAccountModal.style.display = "flex";
          createAccountModal.style.zIndex = "999999";
        }
        return;
      }

      if (profileModal) {
        profileModal.style.display = "flex";
        profileModal.style.zIndex = "999999";
      }
    });
  }

  // -----------------------------
  // 10️⃣ Navigation Scroll
  // -----------------------------
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks[0].addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("faq-section").scrollIntoView({ behavior: "smooth" });
  });
  navLinks[2].addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("how-section").scrollIntoView({ behavior: "smooth" });
  });

  // -----------------------------
  // 11️⃣ FAQ Expand
  // -----------------------------
  document.querySelectorAll(".faq-item").forEach(item => {
    item.addEventListener("click", () => {
      const ans = item.querySelector(".faq-a");
      ans.style.maxHeight = ans.style.maxHeight ? null : ans.scrollHeight + "px";
    });
  });

});

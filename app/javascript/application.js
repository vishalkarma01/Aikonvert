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
  // 2️⃣ User Session Initialization
  // -----------------------------
  fetch("/users/ensure_session_user")
    .then(res => res.json())
    .then(data => {
      console.log("✅ User session initialized:", data);
      window.currentUser = data;
    })
    .catch(err => console.error("Failed to initialize session:", err));

  // -----------------------------
  // 3️⃣ Conversion Modal Logic
  // -----------------------------
  const modal = document.getElementById("upload-section");
  const openBtns = document.querySelectorAll(".open-upload-modal");
  const cancelBtns = modal.querySelectorAll(".cancel-btn");
  const converterTypeField = document.getElementById("converter_type_field");
  const targetSelect = document.getElementById("target_format_select");
  const uploadForm = document.getElementById("upload-form");

  // Loader & download section
  let loadingSection = document.getElementById("loading-section");
  const downloadSection = document.getElementById("download-section");
  const downloadLink = document.getElementById("download-link");

  if (!loadingSection) {
    loadingSection = document.createElement("div");
    loadingSection.id = "loading-section";
    loadingSection.style.display = "none";
    loadingSection.style.marginTop = "20px";
    loadingSection.style.textAlign = "center";
    loadingSection.innerHTML = `<div class="loader"></div><p>Converting your file, please wait...</p>`;
    modal.querySelector(".upload-container").appendChild(loadingSection);
  }

  // Supported formats
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
    btn.addEventListener("click", () => {

      // If coupons are zero → close modal & show upgrade popup
      if (window.currentUser && window.currentUser.remaining_coupons <= 0) {
        modal.style.display = "none"; // close convert modal
        document.getElementById("upgrade-popup").style.display = "flex"; // show upgrade popup
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
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  // -----------------------------
  // 6️⃣ File Conversion Logic
  // -----------------------------
  if (uploadForm) {
    uploadForm.addEventListener("submit", async e => {
      e.preventDefault();

      // Coupons zero → close modal and show upgrade popup
      if (window.currentUser && window.currentUser.remaining_coupons <= 0) {
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

        // Filename extraction
        let filename = "converted_file";
        const disposition = response.headers.get("Content-Disposition");

        if (disposition) {
          const match = disposition.match(/filename="([^"]+)"/);
          if (match && match[1]) {
            filename = match[1];
          }
        } else if (formData.get("file")) {
          const originalName = formData.get("file").name;
          const baseName = originalName.split(".")[0];
          const ext = targetSelect.value;
          filename = `${baseName}_converted.${ext}`;
        }

        // Download file
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        loadingSection.style.display = "none";

        // Reduce coupon
        if (window.currentUser) window.currentUser.remaining_coupons -= 1;

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

  // Close upgrade popup
  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", () => {
      upgradePopup.style.display = "none";
    });
  }

  // Upgrade button
  if (upgradeBtn) {
    upgradeBtn.addEventListener("click", () => {
      window.location.href = "/pricing"; 
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const premiumBtn = document.getElementById("open-premium-plans");
  const upgradePopup = document.getElementById("upgrade-popup");
  const convertPopup = document.getElementById("upload-section");

  premiumBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // Close convert popup if visible
    if (convertPopup) convertPopup.style.display = "none";

    // Open the upgrade popup
    if (upgradePopup) {
      upgradePopup.style.display = "flex";
      upgradePopup.style.zIndex = "999999";      // bring on top
      upgradePopup.style.opacity = "1";
      upgradePopup.style.visibility = "visible";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {

  // Scroll
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks[0].addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("faq-section").scrollIntoView({ behavior: "smooth" });
  });

  navLinks[2].addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("how-section").scrollIntoView({ behavior: "smooth" });
  });

  // FAQ Expand
  document.querySelectorAll(".faq-item").forEach(item => {
    item.addEventListener("click", () => {
      const ans = item.querySelector(".faq-a");

      if (ans.style.maxHeight) ans.style.maxHeight = null;
      else ans.style.maxHeight = ans.scrollHeight + "px";
    });
  });

});

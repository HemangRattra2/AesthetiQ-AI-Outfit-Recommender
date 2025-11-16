document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const defaultPage = "home.html";

  const loginModal = document.getElementById("login-modal");
  const loginBtn = document.querySelector(".main-header .btn-login");
  const modalCloseBtn = document.querySelector(".modal-close-btn");
  const modalOkBtn = document.getElementById("modal-ok-btn");

  const contactModal = document.getElementById("contact-modal");
  const contactModalCloseBtn = document.getElementById(
    "contact-modal-close-btn"
  );
  const contactModalXBtn = contactModal.querySelector(".modal-close-btn");

  const openLoginModal = () => {
    loginModal.hidden = false;
  };
  const closeLoginModal = () => {
    loginModal.hidden = true;
  };

  const openContactModal = () => {
    contactModal.hidden = false;
  };
  const closeContactModal = () => {
    contactModal.hidden = true;
  };

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openLoginModal();
  });
  modalCloseBtn.addEventListener("click", closeLoginModal);
  modalOkBtn.addEventListener("click", closeLoginModal);
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      closeLoginModal();
    }
  });

  contactModalCloseBtn.addEventListener("click", closeContactModal);
  contactModalXBtn.addEventListener("click", closeContactModal);
  contactModal.addEventListener("click", (e) => {
    if (e.target === contactModal) {
      closeContactModal();
    }
  });

  const initializeRecommenderPage = () => {
    const manualBtn = document.getElementById("manual-skin-tone-btn");
    const pickerContainer = document.getElementById(
      "skin-tone-picker-container"
    );
    const fileInput = document.getElementById("skin-tone-upload");
    const fileNameDisplay = document.getElementById("file-name-display");
    const outfitForm = document.getElementById("outfit-form");
    const placeholderBox = document.querySelector(".placeholder-content");
    const resultBox = document.getElementById("recommendation-result");

    if (manualBtn) {
      manualBtn.addEventListener("click", () => {
        pickerContainer.hidden = !pickerContainer.hidden;
        fileInput.value = null;
        fileNameDisplay.textContent = "";
      });
    }

    // 2. Show the uploaded image preview
    const previewContainer = document.getElementById("image-preview-container");

    if (fileInput) {
      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const reader = new FileReader(); // Create a new file reader

          // When the file is read...
          reader.onload = function (e) {
            // ...set the HTML of the preview box to be an image
            previewContainer.innerHTML = `<img src="${e.target.result}" height="100px" alt="Image preview">`;
            previewContainer.style.display = "block"; // Make the preview box visible
          };

          // Read the file as a data URL
          reader.readAsDataURL(file);

          pickerContainer.hidden = true; // Hide color picker
        } else {
          previewContainer.innerHTML = ""; // Clear the preview
          previewContainer.style.display = "none"; // Hide the preview box
        }
      });
    }

    if (outfitForm) {
      outfitForm.addEventListener("submit", (e) => {
        e.preventDefault();
        placeholderBox.hidden = true;
        resultBox.hidden = false;
        resultBox.innerHTML = `
          <div class="loading-spinner"></div>
          <p>Analyzing your vibe...</p>
        `;
        setTimeout(() => {
          resultBox.innerHTML = `
            <img src="assets/images/formal_outfit.jpg" alt="Recommended Outfit" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">
            <h3>Your Vibe: Modern Chic</h3>
            <p>This minimalist black blazer and trouser combo is perfect for your 'Formal' occasion.</p>
          `;
        }, 2500);
      });
    }
  };

  const initializeContactPage = () => {
    const contactForm = document.querySelector(".contact-form");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        openContactModal();
        contactForm.reset();
      });
    }
  };

  const loadContent = async (page) => {
    try {
      const response = await fetch(`pages/${page}`);
      if (!response.ok) {
        throw new Error("Page not found");
      }
      const html = await response.text();
      content.innerHTML = html;

      if (page === "recommender.html") {
        initializeRecommenderPage();
      } else if (page === "contact.html") {
        initializeContactPage();
      }
    } catch (error) {
      console.error("Error loading page: ", error);
      content.innerHTML =
        "<h1>Page not found</h1><p>Sorry, that page doesn't exist.</p>";
    }
  };

  loadContent(defaultPage);

  document.body.addEventListener("click", (e) => {
    const targetLink = e.target.closest("[data-page]");

    if (targetLink) {
      e.preventDefault();
      const pageToLoad = targetLink.dataset.page;
      loadContent(pageToLoad);
      window.scrollTo(0, 0);
    }
  });
});
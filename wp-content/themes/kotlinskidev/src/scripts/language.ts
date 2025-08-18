(function () {
  document
    .querySelector(".language-selector-button")
    ?.addEventListener("click", function (event) {
    const modal: HTMLElement | null = document.querySelector(".language-modal");
    if (!modal) return;
      modal.style.display = modal.style.display === "block" ? "none" : "block";
      event.stopPropagation(); // Prevent the click from closing the modal immediately
    });

  // Close the modal when clicking outside
  document.addEventListener("click", function (event) {
    const modal : HTMLElement | null = document.querySelector(".language-modal");
      const button: HTMLElement | null = document.querySelector(".language-selector-button");
      if (!modal || !button) return;
    if (!button.contains(event.target as Node) && !modal.contains(event.target as Node)) {
      modal.style.display = "none";
    }
  });
})();
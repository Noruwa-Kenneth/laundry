document.addEventListener("DOMContentLoaded", () => {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((button) => {
    button.addEventListener("click", (e) => {
      // Target only the parent .faq-item of the clicked button
      const currentItem = e.currentTarget.closest(".faq-item");
      const currentAnswer = currentItem.querySelector(".faq-answer");
      const isActive = currentItem.classList.contains("active");

      // Close all FAQ items first
      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
        const answer = item.querySelector(".faq-answer");
        if (answer) {
          answer.style.maxHeight = "0px";
        }
      });

      // If the clicked item wasn't active, expand ONLY this item
      if (!isActive) {
        currentItem.classList.add("active");
        currentAnswer.style.maxHeight = currentAnswer.scrollHeight + "px";
      }
    });
  });
});
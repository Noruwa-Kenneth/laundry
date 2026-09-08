document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", function (e) {
      e.preventDefault(); // Stop native toggle behavior
      const isOpen = item.hasAttribute("open");

      // Close all active items with smooth collapse
      faqItems.forEach(function (faq) {
        const faqAnswer = faq.querySelector(".faq-answer");
        
        if (faq.hasAttribute("open")) {
          faq.classList.remove("active");
          faqAnswer.style.maxHeight = "0px";

          // Wait for CSS transition (350ms) before removing [open]
          setTimeout(function () {
            faq.removeAttribute("open");
          }, 350);
        }
      });

      // Open clicked item if it was previously closed
      if (!isOpen) {
        item.setAttribute("open", "");
        // Force reflow so transition starts from 0px
        answer.style.maxHeight = "0px";
        
        requestAnimationFrame(function () {
          item.classList.add("active");
          answer.style.maxHeight = answer.scrollHeight + "px";
        });
      }
    });
  });
});
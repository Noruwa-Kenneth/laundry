
const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(function (question) {

  question.addEventListener("click", function () {

    const faqItem = question.parentElement;

    const answer = faqItem.querySelector(".faq-answer");

    /*
     Close all other FAQ items
     */
    document.querySelectorAll(".faq-item").forEach(function (item) {

      if (item !== faqItem) {

        item.classList.remove("active");

        item.querySelector(".faq-answer").style.maxHeight = null;

      }

    });


    /*
      Open or close the clicked item
     */

    faqItem.classList.toggle("active");

    if (faqItem.classList.contains("active")) {

      answer.style.maxHeight = answer.scrollHeight + "px";

    } else {

      answer.style.maxHeight = null;

    }

  });

});


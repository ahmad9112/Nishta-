document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu-toggle"), links = document.querySelector(".nav-links");
  menu?.addEventListener("click", () => { const open = links.classList.toggle("show"); menu.setAttribute("aria-expanded", open) });
  links?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("show")));

  document.querySelectorAll(".course-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".course-card");
      card.classList.toggle("open");
      btn.querySelector("span").textContent = card.classList.contains("open") ? "⌃" : "⌄";
    });
  });

  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab)?.classList.add("active");
    });
  });

  document.querySelectorAll(".faq-item").forEach(item => {
    item.addEventListener("click", () => {
      item.classList.toggle("open");
      item.querySelector("b").textContent = item.classList.contains("open") ? "−" : "+";
    });
  });

  document.querySelectorAll("[data-course]").forEach(btn => {
    btn.addEventListener("click", () => {
      const select = document.getElementById("course");
      if (select) {
        const desired = btn.dataset.course;
        [...select.options].forEach(o => { if (o.textContent.startsWith(desired)) select.value = o.value });
      }
    });
  });

  const form = document.getElementById("leadForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("studentName").value.trim();
    const parent = document.getElementById("parentName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const cls = document.getElementById("classLevel").value;
    const course = document.getElementById("course").value;
    const msg = document.getElementById("message").value.trim();
    const text = `*Nishtha Institute - Admission Enquiry*%0A%0A*Student Name:* ${encodeURIComponent(name)}%0A*Parent/Guardian:* ${encodeURIComponent(parent)}%0A*Phone:* ${encodeURIComponent(phone)}%0A*Class/Status:* ${encodeURIComponent(cls)}%0A*Course:* ${encodeURIComponent(course)}%0A*Requirement:* ${encodeURIComponent(msg || "Not specified")}%0A%0APlease contact me regarding admission.`;
    window.open(`https://wa.me/916393279543?text=${text}`, "_blank", "noopener");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("reveal"); observer.unobserve(entry.target) } }), { threshold: .08 });
  document.querySelectorAll(".course-card,.about-card,.faculty-card,.testimonial-grid article,.social-box").forEach(el => observer.observe(el));
});

//
// =========================
// ADMISSION POPUP
// =========================

const admissionPopup = document.getElementById("admissionPopup");

function openPopup() {
  admissionPopup.classList.add("show");
}

function closePopup() {
  admissionPopup.classList.remove("show");
}

// Open popup every 5 minutes
setInterval(() => {
  openPopup();
}, 5 * 1000);


// WhatsApp Form
document.getElementById("popupLeadForm").addEventListener("submit", function (e) {

  e.preventDefault();

  const name = document.getElementById("popupStudentName").value;
  const parent = document.getElementById("popupParentName").value;
  const phone = document.getElementById("popupPhone").value;
  const studentClass = document.getElementById("popupClass").value;
  const course = document.getElementById("popupCourse").value;

  const message =
    `*Nishtha Institute - Admission Enquiry*

*Student Name:* ${name}
*Parent/Guardian:* ${parent}
*Phone:* ${phone}
*Class:* ${studentClass}
*Course:* ${course}

Please contact me regarding admission.`;

  const whatsappURL =
    "https://wa.me/918864070891?text=" +
    encodeURIComponent(message);

  window.open(whatsappURL, "_blank");

  closePopup();

});
"use client";

export default function DeleteConfirm() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener("DOMContentLoaded", function () {
            document.querySelectorAll("form[data-kid-name]").forEach(form => {
              form.addEventListener("submit", function (e) {
                const kidName = form.getAttribute("data-kid-name");
                const ok = confirm(
                  "Warning: All data related to " + kidName + " will be permanently deleted. Continue?"
                );
                if (!ok) {
                  e.preventDefault();
                }
              });
            });
          });
        `,
      }}
    />
  );
}

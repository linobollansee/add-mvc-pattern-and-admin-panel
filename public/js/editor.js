// Initialize Quill editor
const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  },
  placeholder: "Write your post content here...",
});

// Handle form submission
const form = document.getElementById("postForm");
form.addEventListener("submit", function (e) {
  // Get HTML content from Quill
  const content = quill.root.innerHTML;

  // Set it to hidden input
  document.getElementById("content").value = content;

  // Validate content is not empty
  if (quill.getText().trim().length === 0) {
    e.preventDefault();
    alert("Content cannot be empty");
    return false;
  }
});

document.getElementById("fetchBtn").addEventListener("click", () => {
  fetch("http://localhost:8080/api/data")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("output").textContent = data.message;
    })
    .catch((err) => {
      document.getElementById("output").textContent = "Không thể kết nối đến API!";
      console.error(err);
    });
});

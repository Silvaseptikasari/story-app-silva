import { el, $ } from "../components/dom.js";

export class RegisterView {
  constructor(controller) {
    this.controller = controller; // ✅ ganti presenter → controller
  }

  render() {
    const main = document.getElementById("main");
    main.innerHTML = "";
    main.append(
      el("section", {}, [
        el("h2", {}, "Daftar"),
        el("form", { class: "form", id: "regForm" }, [
          el("div", {}, [
            el("label", { for: "name" }, "Nama"),
            el("input", {
              id: "name",
              type: "text",
              required: true,
              autocomplete: "name",
              placeholder: "Nama lengkap Anda",
            }),
          ]),
          el("div", {}, [
            el("label", { for: "email" }, "Email"),
            el("input", {
              id: "email",
              type: "email",
              required: true,
              autocomplete: "email",
              placeholder: "nama@email.com",
            }),
          ]),
          el("div", {}, [
            el("label", { for: "password" }, "Kata Sandi"),
            el("input", {
              id: "password",
              type: "password",
              required: true,
              minlength: 8,
              autocomplete: "new-password",
              placeholder: "Minimal 8 karakter",
            }),
            el("p", { class: "helper" }, "Minimal 8 karakter untuk keamanan akun."),
          ]),
          el("div", { class: "kv" }, [
            el("button", { type: "submit", class: "button primary" }, "Buat Akun"),
            el("a", { href: "#/login", class: "button" }, "Sudah punya akun? Masuk"),
          ]),
          el("div", { id: "regStatus", "aria-live": "polite" }),
        ]),
      ])
    );

    // ✅ Event listener untuk proses submit form
    $("#regForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const password = $("#password").value.trim();

      // 🔹 panggil controller dengan fungsi terbaru
      this.controller.handleRegister(name, email, password);
    });
  }

  // ✅ Fungsi dipanggil oleh controller
  showLoading(text) {
    const status = $("#regStatus");
    status.textContent = text;
    status.style.color = "gray";
  }

  renderError(text) {
    const status = $("#regStatus");
    status.textContent = text;
    status.style.color = "red";
  }

  renderSuccess(text) {
    const status = $("#regStatus");
    status.textContent = text;
    status.style.color = "green";
  }

  // ✅ Arahkan user ke halaman login setelah register sukses
  onRegistered() {
    location.hash = "#/login";
  }
}

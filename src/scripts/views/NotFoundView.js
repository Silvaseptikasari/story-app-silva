export class NotFoundView {
  render() {
    const main = document.getElementById("main");
    main.innerHTML = "<p>Halaman tidak ditemukan.</p>";
  }
  destroy() {}
}

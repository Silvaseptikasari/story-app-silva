// src/scripts/main.js

// ===== Import Views =====
import { AppShellView } from "./views/AppShellView.js";
import { LoginView } from "./views/LoginView.js";
import { RegisterView } from "./views/RegisterView.js";
import { StoriesView } from "./views/StoriesView.js";
import { AddStoryView } from "./views/AddStoryView.js";
import { NotFoundView } from "./views/NotFoundView.js";

// ===== Import Core Modules =====
import { Router } from "./router.js";
import { StoryModel } from "./api/model.js";
import { Auth } from "./components/auth.js";

// ===== Import Controllers =====
import { AuthController } from "./controllers/authController.js";
import { StoryController } from "./controllers/storyController.js";

// ===== Inisialisasi Aplikasi =====
const appShell = new AppShellView();
appShell.init();

const model = new StoryModel(() => Auth.get());
const router = new Router();

// ==================================================
// =============== ROUTING DAN VIEW HANDLING =========
// ==================================================

// LOGIN
router.register("#/login", () => {
  let view;
  const controller = new AuthController(
    model,
    {
      showLoading: (msg) => view?.showLoading(msg),
      renderError: (err) => view?.renderError(err),
      renderSuccess: (msg) => view?.renderSuccess(msg),
      onLoggedIn: () => {
        location.hash = "#/stories";
      },
    },
    Auth
  );
  view = new LoginView(controller);

  appShell.renderNav("#/login");
  return view;
});

// REGISTER
router.register("#/register", () => {
  let view;
  const controller = new AuthController(
    model,
    {
      showLoading: (msg) => view?.showLoading(msg),
      renderError: (err) => view?.renderError(err),
      renderSuccess: (msg) => view?.renderSuccess(msg),
      onRegistered: () => {
        location.hash = "#/login";
      },
    },
    Auth
  );
  view = new RegisterView(controller);

  appShell.renderNav("#/register");
  return view;
});

// LOGOUT
router.register("#/logout", () => {
  const controller = new AuthController(
    model,
    {
      showLoading: () => {},
      renderError: () => {},
      renderSuccess: () => {},
      onLoggedOut: () => {
        location.hash = "#/login";
      },
    },
    Auth
  );

  controller.handleLogout();
  appShell.renderNav("#/login");

  // Tampilan dummy agar tidak error
  return new LoginView({});
});

// LIST STORIES
router.register("#/stories", () => {
  let view;
  const controller = new StoryController(model, {
    showLoading: (msg) => view?.showLoading(msg),
    renderError: (err) => view?.renderError(err),
    renderStories: (items) => view?.renderStories(items),
  });
  view = new StoriesView(controller);

  appShell.renderNav("#/stories");
  controller.fetchStories();
  return view;
});

// DETAIL STORY
router.register("#/detail", (id) => {
  let view;
  const controller = new StoryController(model, {
    showLoading: (msg) => view?.showLoading(msg),
    renderError: (err) => view?.renderError(err),
    renderDetail: (story) => {
      const main = document.getElementById("main");
      if (!main) return;
      main.innerHTML = `
        <section class="card">
          <img src="${story.photoUrl}" alt="Foto story oleh ${story.name}" />
          <div class="content">
            <h2>Detail Story</h2>
            <p><strong>Nama:</strong> ${story.name}</p>
            <p>${story.description || ""}</p>
            <p class="meta">Dibuat: ${new Date(story.createdAt).toLocaleString("id-ID")}</p>
            <a class="button" href="#/stories">Kembali</a>
          </div>
        </section>
      `;
    },
  });
  view = new StoriesView(controller);

  appShell.renderNav("#/stories");
  controller.fetchStoryDetail(id);
  return view;
});

// TAMBAH STORY
router.register("#/add", () => {
  let view;
  const controller = new StoryController(model, {
    showLoading: (msg) => view?.showLoading(msg),
    renderError: (err) => view?.renderError(err),
    renderSuccess: (msg) => view?.renderSuccess(msg),
    onStoryAdded: () => {
      location.hash = "#/stories";
    },
  });
  view = new AddStoryView(controller);

  appShell.renderNav("#/add");
  return view;
});

// HALAMAN TIDAK DITEMUKAN
router.register("*", () => new NotFoundView());

// ==================================================
// =============== NAVIGASI AWAL ====================
// ==================================================
router.navigate(location.hash || "#/stories");

// ==================================================
// =============== SERVICE WORKER ===================
// ==================================================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch((err) => {
    console.warn("Service Worker gagal didaftarkan:", err);
  });
}
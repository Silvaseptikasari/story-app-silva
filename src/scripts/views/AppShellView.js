import { el, $ } from "../components/dom.js";
import { Auth } from "../components/auth.js";

export class AppShellView {
  init() {
    const header = $("#app-header");

    // Offline indicator
    if (!header.querySelector('.offline-indicator')) {
      const offline = el('div', { class: 'offline-indicator', role: 'status', 'aria-live': 'polite' });
      offline.style.cssText = 'display:none;padding:6px 10px;background:#f6ad55;color:#3b2f0b;border-radius:6px;margin-bottom:8px;font-size:13px;';
      offline.textContent = '📡 Offline mode aktif — data akan tersimpan lokal.';
      header.insertBefore(offline, header.firstChild);

      // initialize network listener
      import('../utils/networkHelper.js').then(({ NetworkHelper }) => {
        NetworkHelper.init();
        NetworkHelper.subscribe((online) => {
          offline.style.display = online ? 'none' : 'block';
          if (online) {
            // try to sync local stories if any
            import('../components/syncHelper.js').then(({ syncLocalStories }) => {
              syncLocalStories((item) => console.log('Syncing', item)).then((res) => {
                if (res && res.length) console.log('Sync results', res);
              }).catch((e) => console.error(e));
            });
          }
        });
      });
    }


    // Push subscription toggle
    if (!header.querySelector('.push-toggle')) {
      const btn = el('button', { class: 'push-toggle', title: 'Toggle push notifications', 'aria-pressed': 'false' });
      btn.textContent = 'Enable Notifications';
      btn.addEventListener('click', async (e) => {
        try {
          const { PushManagerHelper } = await import('../components/pushManager.js');
          const subscribed = await PushManagerHelper.isSubscribed();
          if (subscribed) {
            await PushManagerHelper.unsubscribe();
            btn.textContent = 'Enable Notifications';
            btn.setAttribute('aria-pressed', 'false');
          } else {
            await PushManagerHelper.subscribe();
            btn.textContent = 'Disable Notifications';
            btn.setAttribute('aria-pressed', 'true');
            alert('Subscription successful — please send the subscription to your server to finish setup.');
          }
        } catch (err) {
          console.error(err);
          alert('Gagal mengubah langganan notifikasi: ' + err.message);
        }
      });
      header.appendChild(btn);
    }


   
    if (!header.querySelector(".app-title")) {
      const titleWrap = el("div", { class: "app-title" });

      titleWrap.append(
        el("img", {
          src: "/public/silva.png",
          alt: "Logo Projek Pertama",
          width: 32,
          height: 32,
        })
      );

      // Tambahkan aria-level 1 hanya sebagai dekoratif (h1 sudah di index.html)
      titleWrap.append(
        el("span", { role: "heading", "aria-level": "1" }, "Projek Pertama")
      );

      header.prepend(titleWrap);
    }

    this.renderNav();

    const footer = $("#app-footer");
    if (footer) {
      footer.textContent =
        "© " + new Date().getFullYear() + " — Aplikasi Story.";
    }
  }

  renderNav(active = location.hash || "#/stories") {
    const nav = $("#app-nav");
    const isLogin = Auth.isAuthed();

    nav.innerHTML = "";
    const links = [
      ["#/stories", "Stories"],
      ["#/add", "Tambah Story"],
      ...(isLogin
        ? [["#/logout", "Keluar"]]
        : [
            ["#/login", "Masuk"],
            ["#/register", "Daftar"],
          ]),
    ];

    const wrap = el("div", { class: "navbar", role: "menubar" });
    links.forEach(([href, label]) => {
      const a = el(
        "a",
        {
          href,
          role: "menuitem",
          "aria-current": active === href ? "page" : "false",
          title: label,
        },
        label
      );
      wrap.appendChild(a);
    });
    nav.appendChild(wrap);
  }
}

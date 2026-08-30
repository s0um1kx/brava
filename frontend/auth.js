// Single shared-secret gate. Good enough for a personal, single-user tool —
// not a real account system. The passcode is stored in this device's
// localStorage after the first successful check, so you only enter it once
// per device.
(function () {
  const STORAGE_KEY = "brava_passcode";

  function buildOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "brava-auth-overlay";
    overlay.innerHTML = `
      <div class="brava-auth-card">
        <p class="brava-auth-brand">brava</p>
        <p class="brava-auth-label">Enter passcode</p>
        <input type="password" id="brava-auth-input" class="brava-auth-input" autofocus />
        <button id="brava-auth-submit" class="brava-auth-submit">Unlock</button>
        <p id="brava-auth-error" class="brava-auth-error"></p>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #brava-auth-overlay {
        position: fixed;
        inset: 0;
        background: #0F1210;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .brava-auth-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        width: 240px;
      }
      .brava-auth-brand {
        font-size: 13px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: #8A9289;
        margin: 0 0 8px;
      }
      .brava-auth-label {
        font-size: 13px;
        color: #8A9289;
        margin: 0;
      }
      .brava-auth-input {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #2E4A3B;
        background: #171B18;
        color: #EDEFEC;
        font-size: 16px;
        text-align: center;
      }
      .brava-auth-submit {
        width: 100%;
        padding: 10px;
        border-radius: 8px;
        border: none;
        background: #6FCF97;
        color: #0F1210;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      .brava-auth-error {
        font-size: 12px;
        color: #E0664B;
        min-height: 14px;
        margin: 0;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);
    return overlay;
  }

  async function verify(passcode) {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      return response.ok;
    } catch (err) {
      console.error("Passcode check failed:", err);
      return false;
    }
  }

  function requireAuth() {
    return new Promise((resolve) => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        verify(stored).then((ok) => {
          if (ok) {
            resolve(stored);
          } else {
            localStorage.removeItem(STORAGE_KEY);
            showPrompt(resolve);
          }
        });
      } else {
        showPrompt(resolve);
      }
    });
  }

  function showPrompt(resolve) {
    const overlay = buildOverlay();
    const input = overlay.querySelector("#brava-auth-input");
    const submitBtn = overlay.querySelector("#brava-auth-submit");
    const errorEl = overlay.querySelector("#brava-auth-error");

    async function attempt() {
      const passcode = input.value.trim();
      if (!passcode) return;

      submitBtn.disabled = true;
      errorEl.textContent = "";

      const ok = await verify(passcode);

      if (ok) {
        localStorage.setItem(STORAGE_KEY, passcode);
        overlay.remove();
        resolve(passcode);
      } else {
        errorEl.textContent = "Incorrect passcode";
        submitBtn.disabled = false;
        input.value = "";
        input.focus();
      }
    }

    submitBtn.addEventListener("click", attempt);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") attempt();
    });
  }

  window.BravaAuth = {
    requireAuth,
    getPasscode: () => localStorage.getItem(STORAGE_KEY) || "",
  };
})();

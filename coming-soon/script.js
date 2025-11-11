const body = document.body;
const audio = document.getElementById("riffy-track");
const buttons = document.querySelectorAll(".dial");
const eject = document.querySelector('[data-action="open"]');
const intensity = document.getElementById("intensity");
const meters = document.querySelectorAll('[data-meter]');

if (audio) {
  audio.volume = 0.35;
}

const state = {
  bass: false,
  lights: false,
  scratch: false,
  open: false,
};

function setBodyState(key, value) {
  state[key] = value;
  Object.entries(state).forEach(([name, active]) => {
    if (active) {
      body.dataset[name] = "true";
    } else {
      delete body.dataset[name];
    }
  });
}

async function ensureAudioPlaying() {
  if (!audio) return;

  try {
    await audio.play();
  } catch (err) {
    console.warn("Autoplay blocked by browser. Will retry on first user gesture.");
    const resumeOnGesture = () => {
      audio.play().catch(() => {});
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    };
    window.addEventListener("pointerdown", resumeOnGesture, { once: true });
    window.addEventListener("keydown", resumeOnGesture, { once: true });
  }
}

function animateMeters(strength) {
  meters.forEach((bar, index) => {
    bar.style.animationDuration = `${Math.max(0.4, 1.2 - strength * 0.008 + index * 0.08)}s`;
  });
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const isActive = !state[action];
    setBodyState(action, isActive);

    if (isActive) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }

    if (action === "lights") {
      body.dataset.flare = isActive ? "true" : undefined;
    }

    if (audio && isActive) {
      audio.volume = Math.min(1, audio.volume + 0.05);
    }
  });
});

if (eject) {
  eject.addEventListener("click", () => {
    setBodyState("open", !state.open);
    eject.classList.toggle("active", state.open);
  });
}

if (intensity) {
  const updateIntensity = () => {
    const value = Number.parseInt(intensity.value, 10);
    const normalized = value / 100;
    animateMeters(value / 1.2);
    document.documentElement.style.setProperty(
      "--panel-gradient",
      `linear-gradient(135deg, rgba(255, 203, 113, ${0.15 + normalized * 0.45}), rgba(87, 230, 255, ${0.1 + normalized * 0.45}))`
    );
    document.documentElement.style.setProperty(
      "--panel-border",
      `rgba(255, 255, 255, ${0.3 + normalized * 0.4})`
    );
    audio.volume = Math.min(1, 0.2 + normalized * 0.6);
  };

  intensity.addEventListener("input", updateIntensity);
  updateIntensity();
}

window.addEventListener("pointermove", (event) => {
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;
  document.body.style.setProperty(
    "--bg-gradient",
    `linear-gradient(135deg, rgba(255, 126, 179, ${0.3 + x * 0.4}), rgba(108, 255, 217, ${0.35 + y * 0.35}), rgba(255, 230, 109, ${0.25 + (1 - y) * 0.3}))`
  );
});

window.addEventListener("DOMContentLoaded", () => {
  ensureAudioPlaying();
  body.classList.add("is-ready");
});

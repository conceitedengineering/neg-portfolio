const sfTimeNode = document.getElementById("sf-time");

function updateSFTime() {
  if (!sfTimeNode) return;

  const sfTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(new Date());

  sfTimeNode.textContent = `SF CA ${sfTime}`;
}

updateSFTime();
setInterval(updateSFTime, 1000);

const projectRows = Array.from(document.querySelectorAll(".project-row"));
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const filterCountNode = document.getElementById("filter-count");

let activeFilter = "all";
const totalProjectCount = projectRows.filter((row) => row.dataset.countExclude !== "true").length;

function applyFilter(filter) {
  projectRows.forEach((row) => {
    const categories = (row.dataset.categories || "").split(" ").filter(Boolean);
    const showOnlyFilter = row.dataset.showOnlyFilter;
    const matchesCategory = filter === "all" || categories.includes(filter);
    const matchesVisibilityRule = showOnlyFilter ? filter === showOnlyFilter : true;
    const shouldShow = filter === "all" ? !showOnlyFilter : matchesCategory && matchesVisibilityRule;

    row.classList.toggle("is-hidden", !shouldShow);
  });

  if (filterCountNode) {
    const visibleCount = projectRows.filter(
      (row) => !row.classList.contains("is-hidden") && row.dataset.countExclude !== "true"
    ).length;
    filterCountNode.textContent = `${visibleCount} of ${totalProjectCount}`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter || "all";
    const shouldReset = activeFilter === selectedFilter;

    activeFilter = shouldReset ? "all" : selectedFilter;

    filterButtons.forEach((entry) => entry.classList.remove("active"));
    if (!shouldReset) button.classList.add("active");

    applyFilter(activeFilter);
  });
});

applyFilter(activeFilter);

const lightbox = (() => {
  const root = document.createElement("div");
  root.className = "lightbox";
  root.setAttribute("aria-hidden", "true");

  const inner = document.createElement("div");
  inner.className = "lightbox-inner";

  const closeButton = document.createElement("button");
  closeButton.className = "lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close image");
  closeButton.textContent = "×";

  const image = document.createElement("img");
  image.className = "lightbox-image";
  image.alt = "";

  const caption = document.createElement("p");
  caption.className = "lightbox-caption";
  caption.textContent = "";

  inner.append(closeButton, image, caption);
  root.appendChild(inner);
  document.body.appendChild(root);

  const close = () => {
    root.classList.remove("open");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    image.src = "";
    image.alt = "";
  };

  const open = (src, altText, captionText) => {
    image.src = src;
    image.alt = altText || captionText || "Project image";
    caption.textContent = captionText || altText || "Project image";
    root.classList.add("open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  };

  closeButton.addEventListener("click", close);
  root.addEventListener("click", (event) => {
    if (event.target === root) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("open")) close();
  });

  return { open };
})();

function getSlideLabel(slide, index) {
  const caption = slide.querySelector("figcaption")?.textContent?.trim();
  if (caption) return caption;
  return `Image ${index + 1}`;
}

function setupCarousel(carousel) {
  const slides = Array.from(carousel.querySelectorAll(".slide"));
  if (!slides.length) return;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("active"));
  if (activeIndex < 0) activeIndex = 0;
  slides.forEach((slide, index) => {
    slide.classList.remove("entering", "leaving");
    if (index === activeIndex) slide.classList.add("active");
    else slide.classList.remove("active");
  });

  const canRotate = slides.length > 1;
  const interval = Number.parseInt(carousel.dataset.interval || "5000", 10);
  const transitionMs = Number.parseInt(carousel.dataset.transition || "760", 10);
  let timer = null;
  let isAnimating = false;

  const meta = document.createElement("div");
  meta.className = "carousel-meta";

  const captionNode = document.createElement("p");
  captionNode.className = "carousel-caption";
  meta.appendChild(captionNode);

  const dotsNode = document.createElement("div");
  dotsNode.className = "carousel-dots";
  meta.appendChild(dotsNode);
  carousel.insertAdjacentElement("afterend", meta);

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Go to image ${index + 1}`);
    dot.addEventListener("click", () => {
      if (!canRotate) return;
      showSlide(index);
      restartTimer();
    });
    dotsNode.appendChild(dot);
    return dot;
  });

  const syncMeta = () => {
    captionNode.textContent = getSlideLabel(slides[activeIndex], activeIndex);
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === activeIndex);
    });
  };

  const showSlide = (nextIndex) => {
    if (!canRotate || isAnimating || nextIndex === activeIndex) return;

    isAnimating = true;
    const currentSlide = slides[activeIndex];
    const nextSlide = slides[nextIndex];

    nextSlide.classList.add("entering");
    nextSlide.classList.add("active");

    // Force layout so the browser applies entering position before the animation starts.
    void nextSlide.offsetWidth;

    requestAnimationFrame(() => {
      currentSlide.classList.add("leaving");
      currentSlide.classList.remove("active");
      nextSlide.classList.remove("entering");
      activeIndex = nextIndex;
      syncMeta();
    });

    window.setTimeout(() => {
      currentSlide.classList.remove("leaving");
      isAnimating = false;
    }, transitionMs + 60);
  };

  const run = () => {
    const row = carousel.closest(".project-row");
    if (row && row.classList.contains("is-hidden")) return;

    const nextIndex = (activeIndex + 1) % slides.length;
    showSlide(nextIndex);
  };

  const restartTimer = () => {
    stop();
    start();
  };

  const start = () => {
    if (!canRotate) return;
    if (timer) return;
    timer = setInterval(run, interval);
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  slides.forEach((slide, index) => {
    const image = slide.querySelector("img");
    if (!image) return;

    image.addEventListener("click", () => {
      lightbox.open(image.getAttribute("src") || "", image.getAttribute("alt") || "", getSlideLabel(slide, index));
    });
  });

  syncMeta();
  start();
  carousel.addEventListener("mouseenter", () => {
    stop();
  });
  carousel.addEventListener("mouseleave", () => {
    start();
  });
}

document.querySelectorAll(".carousel").forEach(setupCarousel);

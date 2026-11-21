const linkItems = document.querySelectorAll(".navlinks ul li");
const menuToggle = document.getElementById("menu-toggle");
const navbar = document.querySelector(".navbar");

linkItems.forEach((item) => {
    item.addEventListener("click", function() {
        const activeItem = document.querySelector(".navlinks ul li.active");

        if (activeItem) {
            activeItem.classList.remove("active");
        }

        this.classList.add("active");
    });
});

menuToggle.addEventListener("click", function() {
    navbar.classList.toggle("menu-open");

    const isOpen = navbar.classList.contains("menu-open");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

/* ============================ PAGE ANIMATIONS & INTERACTIONS ============================ */

const statisticsSection = document.querySelector(".quick-summary");

if (statisticsSection) {
    const statisticNumbers = statisticsSection.querySelectorAll(".boxes h1");

    const animateStatistic = (numberElement) => {
        const originalText = numberElement.textContent.trim();
        const match = originalText.match(/^([^0-9]*)([\d,]+)(.*)$/);

        if (!match) {
            return;
        }

        const prefix = match[1];
        const target = Number(match[2].replace(/,/g, ""));
        const suffix = match[3];
        const startValue = prefix.indexOf("<") !== -1 ? 1 : 0;
        const duration = 1400;
        let startTime = null;

        if (!Number.isFinite(target)) {
            return;
        }

        const updateCount = (timestamp) => {
            if (startTime === null) {
                startTime = timestamp;
            }

            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (target - startValue) * easedProgress);

            numberElement.textContent = `${prefix}${currentValue.toLocaleString("en-US")}${suffix}`;

            if (progress < 1) {
                window.requestAnimationFrame(updateCount);
            } else {
                numberElement.textContent = originalText;
            }
        };

        window.requestAnimationFrame(updateCount);
    };

    const revealStatistics = () => {
        statisticsSection.classList.add("is-visible");

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            statisticNumbers.forEach(animateStatistic);
        }
    };

    if (typeof IntersectionObserver === "function") {
        const statisticsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    revealStatistics();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        statisticsObserver.observe(statisticsSection);
    } else {
        revealStatistics();
    }
}

const workingBoxesContainer = document.querySelector(".working-boxes-container");

if (
    workingBoxesContainer &&
    window.gsap &&
    window.ScrollTrigger &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
    const cards = Array.from(workingBoxesContainer.querySelectorAll(".working-boxes"));
    const stackScales = [1, 0.98, 0.96, 1];
    const stackRotations = [-4, 2, -2, 4];

    window.gsap.registerPlugin(window.ScrollTrigger);

    const getStackOffsets = () => {
        const centers = cards.map((card) => ({
            x: card.offsetLeft + card.offsetWidth / 2,
            y: card.offsetTop + card.offsetHeight / 2
        }));
        const center = centers.reduce((total, point) => ({
            x: total.x + point.x / centers.length,
            y: total.y + point.y / centers.length
        }), { x: 0, y: 0 });

        return centers.map((point, index) => ({
            x: center.x - point.x + (index - 1.5) * 4,
            y: center.y - point.y + (index - 1.5) * 6
        }));
    };

    const initialStackOffsets = getStackOffsets();

    window.gsap.set(cards, {
        "--stack-x": (index) => `${initialStackOffsets[index].x}px`,
        "--stack-y": (index) => `${initialStackOffsets[index].y}px`,
        "--stack-rotation": (index) => `${stackRotations[index]}deg`,
        "--stack-scale": (index) => stackScales[index]
    });

    const timeline = window.gsap.timeline({
        scrollTrigger: {
            trigger: workingBoxesContainer,
            start: () => `top ${Math.max(0, window.innerHeight - workingBoxesContainer.offsetHeight * 0.15)}px`,
            end: "top 50%",
            scrub: 0.35,
            invalidateOnRefresh: true,
            onUpdate: (trigger) => {
                cards.forEach((card, index) => {
                    card.style.zIndex = trigger.progress < 1 ? String(cards.length - index) : "";
                });
            }
        }
    });

    timeline.fromTo(cards, {
        "--stack-x": (index) => `${getStackOffsets()[index].x}px`,
        "--stack-y": (index) => `${getStackOffsets()[index].y}px`,
        "--stack-rotation": (index) => `${stackRotations[index]}deg`,
        "--stack-scale": (index) => stackScales[index]
    }, {
        "--stack-x": "0px",
        "--stack-y": "0px",
        "--stack-rotation": "0deg",
        "--stack-scale": 1,
        duration: 1,
        stagger: 0.06,
        ease: "none"
    });
}

if (
    workingBoxesContainer &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
    workingBoxesContainer.querySelectorAll(".working-boxes").forEach((card) => {
        let pointerX = 0;
        let pointerY = 0;
        let frameId = null;

        const updateTilt = () => {
            frameId = null;

            const bounds = card.getBoundingClientRect();
            const relativeX = Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width));
            const relativeY = Math.max(0, Math.min(1, (pointerY - bounds.top) / bounds.height));

            card.style.setProperty("--step-tilt-x", `${((0.5 - relativeY) * 6).toFixed(2)}deg`);
            card.style.setProperty("--step-tilt-y", `${((relativeX - 0.5) * 6).toFixed(2)}deg`);
            card.classList.add("is-tilting");
        };

        card.addEventListener("pointermove", (event) => {
            if (event.pointerType === "touch") {
                return;
            }

            pointerX = event.clientX;
            pointerY = event.clientY;

            if (frameId === null) {
                frameId = window.requestAnimationFrame(updateTilt);
            }
        });

        card.addEventListener("pointerleave", () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
                frameId = null;
            }

            card.classList.remove("is-tilting");
            card.style.removeProperty("--step-tilt-x");
            card.style.removeProperty("--step-tilt-y");
        });
    });
}

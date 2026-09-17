 /* =========================
    BUG HUNT
    ========================= */

document.addEventListener("DOMContentLoaded", () => {
    const bugWrapper = document.createElement("div");
    const bug = document.createElement("img");
    const message = document.createElement("div");

    bugWrapper.className = "hidden-bug";

    bug.src = "images/bug-sprite.png";
    bug.alt = "Hidden bug";
    bug.className = "bug-sprite";

    message.className = "bug-message";
    message.textContent = "BUG FOUND! GET TESTED.";

    bugWrapper.appendChild(bug);
    bugWrapper.appendChild(message);

    document.body.appendChild(bugWrapper);

    let moving = false;
    let messageTimeout;

    function getRandomPosition() {
        const padding = 50;

        const maxX = window.innerWidth - bugWrapper.offsetWidth - padding;
        const maxY = window.innerHeight - bugWrapper.offsetHeight - padding;

        return {
            x: Math.max(padding, Math.random() * maxX),
            y: Math.max(padding, Math.random() * maxY)
        };
    }

    function moveBug() {
        if (!moving) return;

        const currentX = parseFloat(bugWrapper.style.left) || 0;
        const currentY = parseFloat(bugWrapper.style.top) || 0;

        const target = getRandomPosition();

        const deltaX = target.x - currentX;
        const deltaY = target.y - currentY;

        // The bug starts facing upward.
        // Calculate the exact angle toward its destination.
        const angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);

        bugWrapper.style.transform = `rotate(${angle}deg)`;

        // Keep the message horizontal.
        message.style.transform =
            `translateX(-50%) rotate(${-angle}deg)`;

        bugWrapper.style.left = `${target.x}px`;
        bugWrapper.style.top = `${target.y}px`;

        setTimeout(moveBug, 3000);
    }

    function spawnBug() {
        const start = getRandomPosition();

        bugWrapper.style.transition = "none";
        bugWrapper.style.left = `${start.x}px`;
        bugWrapper.style.top = `${start.y}px`;
        bugWrapper.style.transform = "rotate(0deg)";

        message.style.transform = "translateX(-50%)";

        bugWrapper.classList.add("visible");
        moving = true;

        setTimeout(() => {
            bugWrapper.style.transition =
                "left 3s ease-in-out, top 3s ease-in-out, opacity 0.4s ease, transform 0.25s ease";

            moveBug();
        }, 500);
    }

 bugWrapper.addEventListener("click", () => {
    moving = false;

    const rect = bugWrapper.getBoundingClientRect();

    bugWrapper.style.transition = "none";
    bugWrapper.style.left = `${rect.left}px`;
    bugWrapper.style.top = `${rect.top}px`;

    message.classList.add("visible");

        clearTimeout(messageTimeout);

        messageTimeout = setTimeout(() => {
            message.classList.remove("visible");
        }, 1800);

        setTimeout(() => {
            bugWrapper.classList.remove("visible");
        }, 1800);

        // TESTING: 150 seconds before the next bug
        setTimeout(spawnBug, 150000);
    });

    // TESTING: first bug appears after 150 seconds
    setTimeout(spawnBug, 150000);
});
(() => {
    "use strict";

    const CONFIG = {
        moveSpeed: 3,
        gravity: 0.5,
        jumpForce: -7.6,
        pipeGap: 35,
        pipeSpawnInterval: 115,
        birdImages: {
            normal: "images/Bird.png",
            jumping: "images/Bird-2.png"
        },
        sounds: {
            point: "sounds effect/point.mp3",
            die: "sounds effect/die.mp3"
        }
    };

    const DOM = {
        bird: document.querySelector(".bird"),
        birdImg: document.getElementById("bird-1"),
        background: document.querySelector(".background"),
        scoreValue: document.querySelector(".score_val"),
        message: document.querySelector(".message"),
        scoreTitle: document.querySelector(".score_title")
    };

    const soundPoint = new Audio(CONFIG.sounds.point);
    const soundDie = new Audio(CONFIG.sounds.die);

    let gameState = "Start";
    let score = 0;
    let birdDy = 0;
    let pipeSeparation = 0;

    function init() {
        DOM.birdImg.style.display = "none";
        DOM.message.classList.add("messageStyle");
        setupEventListeners();
    }

    function isJumpKey(e) {
        return e.key === "ArrowUp" || e.key === " " || e.code === "Space" || e.code === "ArrowUp";
    }

    function setupEventListeners() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && gameState !== "Play") {
                startGame();
            } else if (isJumpKey(e) && gameState === "Play") {
                e.preventDefault();
                DOM.birdImg.src = CONFIG.birdImages.jumping;
                birdDy = CONFIG.jumpForce;
            }
        });

        document.addEventListener("keyup", (e) => {
            if (isJumpKey(e) && gameState === "Play") {
                DOM.birdImg.src = CONFIG.birdImages.normal;
            }
        });
    }

    function startGame() {
        document.querySelectorAll(".pipe_sprite").forEach((pipe) => pipe.remove());

        DOM.birdImg.style.display = "block";
        DOM.birdImg.src = CONFIG.birdImages.normal;
        DOM.bird.style.top = "40vh";

        gameState = "Play";
        score = 0;
        birdDy = 0;
        pipeSeparation = 0;

        DOM.message.innerHTML = "";
        DOM.scoreTitle.innerHTML = "Score : ";
        DOM.scoreValue.innerHTML = "0";
        DOM.message.classList.remove("messageStyle");

        requestAnimationFrame(gameLoop);
    }

    function gameLoop() {
        if (gameState !== "Play") return;

        updateBirdPhysics();
        updatePipes();
        spawnPipes();

        requestAnimationFrame(gameLoop);
    }

    function updateBirdPhysics() {
        const birdProps = DOM.bird.getBoundingClientRect();
        const bgProps = DOM.background
            ? DOM.background.getBoundingClientRect()
            : { bottom: window.innerHeight };

        birdDy += CONFIG.gravity;

        if (birdProps.top <= 0 || birdProps.bottom >= bgProps.bottom) {
            handleBoundaryCollision();
            return;
        }

        DOM.bird.style.top = `${birdProps.top + birdDy}px`;
    }

    function updatePipes() {
        const birdProps = DOM.bird.getBoundingClientRect();
        const pipes = document.querySelectorAll(".pipe_sprite");

        pipes.forEach((pipe) => {
            const pipeProps = pipe.getBoundingClientRect();

            if (pipeProps.right <= 0) {
                pipe.remove();
                return;
            }

            if (checkCollision(birdProps, pipeProps)) {
                handleObstacleCollision();
                return;
            }

            if (
                pipeProps.right < birdProps.left &&
                pipeProps.right + CONFIG.moveSpeed >= birdProps.left &&
                pipe.dataset.score === "true"
            ) {
                score += 1;
                DOM.scoreValue.innerHTML = score;
                soundPoint.play();
            }

            pipe.style.left = `${pipeProps.left - CONFIG.moveSpeed}px`;
        });
    }

    function spawnPipes() {
        if (pipeSeparation > CONFIG.pipeSpawnInterval) {
            pipeSeparation = 0;

            const pipePos = Math.floor(Math.random() * 43) + 8;

            const topPipe = document.createElement("div");
            topPipe.className = "pipe_sprite";
            topPipe.style.top = `${pipePos - 70}vh`;
            topPipe.style.left = "100vw";
            document.body.appendChild(topPipe);

            const bottomPipe = document.createElement("div");
            bottomPipe.className = "pipe_sprite";
            bottomPipe.style.top = `${pipePos + CONFIG.pipeGap}vh`;
            bottomPipe.style.left = "100vw";
            bottomPipe.dataset.score = "true";
            document.body.appendChild(bottomPipe);
        }
        pipeSeparation++;
    }

    function checkCollision(rect1, rect2) {
        return (
            rect1.left < rect2.left + rect2.width &&
            rect1.left + rect1.width > rect2.left &&
            rect1.top < rect2.top + rect2.height &&
            rect1.top + rect1.height > rect2.top
        );
    }

    function handleBoundaryCollision() {
        gameState = "End";
        DOM.message.style.left = "28vw";
        DOM.message.classList.remove("messageStyle");
        window.location.reload();
    }

    function handleObstacleCollision() {
        gameState = "End";
        DOM.message.innerHTML = `<span style="color: red;">Game Over</span><br>Press Enter To Restart`;
        DOM.message.classList.add("messageStyle");
        DOM.birdImg.style.display = "none";
        soundDie.play();
    }

    init();
})();
import { steps } from "../data/steps.js";

const app = document.querySelector("#app");
const helpModal = document.querySelector("#help-modal");
const summaryModal = document.querySelector("#summary-modal");
const summaryContent = document.querySelector("#summary-content");
const restartButton = document.querySelector("#restart-game");
const helpButton = document.querySelector("#open-help");
const themeButton = document.querySelector("#toggle-theme");

const state = {
    currentStepIndex: 0,
    score: 0,
    mistakes: 0,
    completed: false,
    autoFocusNext: false,
    timeline: steps.map((step, index) => ({
        id: step.id,
        title: step.title,
        status: index === 0 ? "current" : "pending",
    })),
};

function renderApp() {
    app.innerHTML = "";

    const timeline = renderTimeline();
    const stepView = renderStepView();
    const progressCard = renderProgressCard();

    app.appendChild(timeline);
    app.appendChild(stepView);
    app.appendChild(progressCard);
}

function renderTimeline() {
    const aside = document.createElement("aside");
    aside.className = "timeline";
    aside.setAttribute("aria-label", "Kurulum zaman çizelgesi");

    const title = document.createElement("h2");
    title.textContent = "Kurulum Aşamaları";
    aside.appendChild(title);

    const list = document.createElement("ol");

    state.timeline.forEach((entry, index) => {
        const item = document.createElement("li");
        item.textContent = steps[index].title;
        item.dataset.stepIndex = index + 1;
        if (entry.status === "current") {
            item.classList.add("is-current");
        }
        if (entry.status === "complete") {
            item.classList.add("is-complete");
        }
        list.appendChild(item);
    });

    aside.appendChild(list);
    return aside;
}

function renderStepView() {
    const step = steps[state.currentStepIndex];

    const container = document.createElement("section");
    container.className = "step-view";
    container.setAttribute("aria-labelledby", `step-title-${step.id}`);

    const header = document.createElement("header");
    header.className = "step-header";

    const title = document.createElement("div");
    title.innerHTML = `
        <h1 id="step-title-${step.id}">${step.title}</h1>
        <div class="step-meta">
            <span class="badge">${state.currentStepIndex + 1}/${steps.length}</span>
            <span>${step.context}</span>
        </div>
    `;

    header.appendChild(title);

    const hintButton = document.createElement("button");
    hintButton.className = "secondary";
    hintButton.type = "button";
    hintButton.textContent = "İpucu";
    hintButton.addEventListener("click", () => toggleHint(container));

    header.appendChild(hintButton);

    const stepContent = document.createElement("div");
    stepContent.className = "step-content";

    const illustration = document.createElement("figure");
    illustration.className = "step-illustration";
    illustration.innerHTML = `
        <img src="${step.illustration}" alt="${step.illustrationAlt}" loading="lazy" />
    `;

    const description = document.createElement("div");
    description.className = "step-description";
    description.innerHTML = `
        <p>${step.description}</p>
        <ul>${step.keyPoints.map((point) => `<li>${point}</li>`).join("")}</ul>
    `;

    stepContent.appendChild(illustration);
    stepContent.appendChild(description);

    const actionsPanel = document.createElement("div");
    actionsPanel.className = "actions-panel";
    actionsPanel.innerHTML = `
        <h2>${step.task}</h2>
        <p>${step.instructions}</p>
    `;

    const optionList = document.createElement("div");
    optionList.className = "option-list";
    optionList.setAttribute("role", "group");
    optionList.setAttribute("aria-label", "Kurulum seçenekleri");

    step.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-button";
        button.innerHTML = `
            <span>${option.label}</span>
            <small>${option.shortcut || ""}</small>
        `;

        button.addEventListener("click", () => handleOptionSelect(option, button, actionsPanel));
        optionList.appendChild(button);
    });

    actionsPanel.appendChild(optionList);

    if (step.feedback) {
        const feedback = document.createElement("div");
        feedback.className = "feedback";
        feedback.textContent = step.feedback.text;
        if (step.feedback.type === "correct") {
            feedback.classList.add("is-correct");
        }
        if (step.feedback.type === "wrong") {
            feedback.classList.add("is-wrong");
        }
        actionsPanel.appendChild(feedback);
    }

    const hint = document.createElement("div");
    hint.className = "hint";
    hint.innerHTML = `<strong>İpucu:</strong> ${step.hint}`;
    if (step.hintVisible) {
        hint.classList.add("is-visible");
    }
    actionsPanel.appendChild(hint);

    const footer = document.createElement("footer");
    footer.className = "panel-footer";

    const status = document.createElement("span");
    status.textContent = step.footerNote;

    const continueButton = document.createElement("button");
    continueButton.className = "primary";
    continueButton.type = "button";
    continueButton.textContent = state.currentStepIndex === steps.length - 1 ? "Simülasyonu Bitir" : "Sonraki Adım";
    continueButton.disabled = !step.completed;
    continueButton.addEventListener("click", () => goToNextStep());

    if (state.autoFocusNext && step.completed) {
        setTimeout(() => {
            continueButton.focus();
            state.autoFocusNext = false;
        }, 0);
    }

    footer.appendChild(status);
    footer.appendChild(continueButton);

    actionsPanel.appendChild(footer);

    container.appendChild(header);
    container.appendChild(stepContent);
    container.appendChild(actionsPanel);

    return container;
}

function renderProgressCard() {
    const card = document.createElement("aside");
    card.className = "progress-card";

    const step = steps[state.currentStepIndex];

    card.innerHTML = `
        <strong>İlerleme Durumu</strong>
        <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${state.currentStepIndex + (step.completed ? 1 : 0)}">
            <span style="width: ${((state.currentStepIndex + (step.completed ? 1 : 0)) / steps.length) * 100}%"></span>
        </div>
        <div class="progress-details">
            <span>Skor: ${state.score}</span>
            <span>Hata: ${state.mistakes}</span>
        </div>
        <p>${step.progressNote}</p>
    `;

    return card;
}

function handleOptionSelect(option, button, panel) {
    if (steps[state.currentStepIndex].completed) {
        return;
    }

    if (option.correct) {
        button.classList.add("is-correct");
        steps[state.currentStepIndex].completed = true;
        steps[state.currentStepIndex].feedback = { text: option.feedback, type: "correct" };
        state.score += option.points ?? 10;
        state.autoFocusNext = true;
        updateTimelineStatus("complete");
    } else {
        button.classList.add("is-wrong");
        state.mistakes += 1;
        steps[state.currentStepIndex].feedback = { text: option.feedback, type: "wrong" };
        shake(panel);
    }
    refresh();
}

function shake(element) {
    element.animate(
        [
            { transform: "translateX(0)" },
            { transform: "translateX(-6px)" },
            { transform: "translateX(6px)" },
            { transform: "translateX(-4px)" },
            { transform: "translateX(0)" },
        ],
        {
            duration: 320,
            easing: "ease-in-out",
        }
    );
}

function toggleHint(container) {
    const hint = container.querySelector(".hint");
    const step = steps[state.currentStepIndex];
    const isVisible = hint.classList.toggle("is-visible");
    step.hintVisible = isVisible;
}

function goToNextStep() {
    if (!steps[state.currentStepIndex].completed) {
        return;
    }

    if (state.currentStepIndex < steps.length - 1) {
        state.currentStepIndex += 1;
        updateTimelineStatus("current");
        refresh();
    } else {
        state.completed = true;
        openSummary();
    }
}

function updateTimelineStatus(status) {
    state.timeline = state.timeline.map((entry, index) => {
        if (index < state.currentStepIndex) {
            return { ...entry, status: "complete" };
        }
        if (index === state.currentStepIndex) {
            return { ...entry, status };
        }
        return { ...entry, status: "pending" };
    });
}

function openSummary() {
    const totalPoints = steps.reduce((sum, step) => sum + (step.points || 10), 0);

    summaryContent.innerHTML = `
        <p>Tebrikler! Windows kurulum simülasyonunu başarıyla tamamladınız.</p>
        <div class="summary-grid">
            <div class="card">
                <strong>Toplam Skor</strong>
                <div>${state.score} / ${totalPoints}</div>
            </div>
            <div class="card">
                <strong>Hata Sayısı</strong>
                <div>${state.mistakes}</div>
            </div>
            <div class="card">
                <strong>Süre</strong>
                <div>${estimateDuration()}</div>
            </div>
        </div>
        <section>
            <h3>Öğrendikleriniz</h3>
            <ul>
                ${steps
                    .map((step) => `<li><strong>${step.title}:</strong> ${step.learning}</li>`)
                    .join("")}
            </ul>
        </section>
    `;

    summaryModal.showModal();
}

function estimateDuration() {
    const averagePerStep = 2.5; // dakika
    const minutes = Math.round(steps.length * averagePerStep);
    return `${minutes} dakika (tahmini)`;
}

function refresh() {
    renderApp();
}

function resetGame() {
    state.currentStepIndex = 0;
    state.score = 0;
    state.mistakes = 0;
    state.completed = false;
    state.autoFocusNext = false;
    steps.forEach((step) => {
        step.completed = false;
        step.feedback = undefined;
        step.hintVisible = false;
    });
    state.timeline = state.timeline.map((entry, index) => ({
        ...entry,
        status: index === 0 ? "current" : "pending",
    }));
    refresh();
}

helpButton.addEventListener("click", () => helpModal.showModal());
restartButton.addEventListener("click", () => {
    resetGame();
    summaryModal.close();
});

themeButton.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", nextTheme);
    themeButton.querySelector(".material-icon").textContent = nextTheme === "dark" ? "dark_mode" : "light_mode";
});

renderApp();

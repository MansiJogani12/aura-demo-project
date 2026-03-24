"use strict";

const TOKEN_KEY = "auraAuthToken";
const USER_KEY = "auraAuthUser";

const dashboardData = {
    user: {
        name: "Mansi",
        role: "Product Engineer"
    },
    metrics: [
        {
            label: "Open Tasks",
            value: 18,
            delta: "+4 this week",
            trend: "up"
        },
        {
            label: "Completion Rate",
            value: "76%",
            delta: "+8% vs last sprint",
            trend: "up"
        },
        {
            label: "PRs Merged",
            value: 11,
            delta: "2 pending review",
            trend: "flat"
        },
        {
            label: "Build Health",
            value: "98%",
            delta: "Stable",
            trend: "up"
        }
    ],
    tasks: [
        {
            id: 1,
            title: "Finalize onboarding flow",
            owner: "UI Team",
            status: "In Progress",
            progress: 72
        },
        {
            id: 2,
            title: "Database migration checks",
            owner: "Backend",
            status: "Review",
            progress: 89
        },
        {
            id: 3,
            title: "Dashboard analytics widgets",
            owner: "Frontend",
            status: "In Progress",
            progress: 61
        },
        {
            id: 4,
            title: "Email reminder automation",
            owner: "AI Ops",
            status: "Blocked",
            progress: 31
        }
    ],
    activity: [
        {
            time: "09:12",
            text: "Task #38 moved to Review"
        },
        {
            time: "10:05",
            text: "New issue created: Token refresh edge case"
        },
        {
            time: "11:19",
            text: "Commit synced from GitHub: feat/dashboard-cards"
        },
        {
            time: "13:42",
            text: "Sprint note generated and shared"
        }
    ],
    commits: [
        {
            hash: "a92f8d4",
            message: "feat: add sprint analytics section",
            author: "Mansi"
        },
        {
            hash: "b17ce32",
            message: "fix: validate login payload on submit",
            author: "Aura Bot"
        },
        {
            hash: "c8ed1ac",
            message: "chore: update schema comments",
            author: "Mansi"
        }
    ]
};

function trendBadgeClass(trend) {
    if (trend === "up") {
        return "metric-delta positive";
    }

    if (trend === "down") {
        return "metric-delta negative";
    }

    return "metric-delta";
}

function statusClass(status) {
    return status.toLowerCase().replace(/\s+/g, "-");
}

function renderMetrics(container, metrics) {
    container.innerHTML = metrics
        .map(
            (metric) =>
                `<article class="metric-card">
                    <p class="metric-label">${metric.label}</p>
                    <p class="metric-value">${metric.value}</p>
                    <p class="${trendBadgeClass(metric.trend)}">${metric.delta}</p>
                </article>`
        )
        .join("");
}

function renderTaskRows(container, tasks) {
    container.innerHTML = tasks
        .map(
            (task) =>
                `<li class="task-item" data-task-id="${task.id}">
                    <div class="task-main">
                        <p class="task-title">${task.title}</p>
                        <p class="task-meta">${task.owner} • ${task.status}</p>
                    </div>
                    <div class="task-right">
                        <span class="status-pill ${statusClass(task.status)}">${task.status}</span>
                        <div class="progress-track" role="progressbar" aria-valuenow="${task.progress}" aria-valuemin="0" aria-valuemax="100">
                            <span class="progress-fill" style="width: ${task.progress}%"></span>
                        </div>
                        <button class="btn-complete" type="button">Mark done</button>
                    </div>
                </li>`
        )
        .join("");
}

function renderActivity(container, activity) {
    container.innerHTML = activity
        .map(
            (item) =>
                `<li class="activity-item">
                    <span class="activity-time">${item.time}</span>
                    <span class="activity-text">${item.text}</span>
                </li>`
        )
        .join("");
}

function renderCommits(container, commits) {
    container.innerHTML = commits
        .map(
            (commit) =>
                `<li class="commit-item">
                    <code class="commit-hash">${commit.hash}</code>
                    <span class="commit-message">${commit.message}</span>
                    <span class="commit-author">${commit.author}</span>
                </li>`
        )
        .join("");
}

function bindTaskActions(rootNode) {
    rootNode.addEventListener("click", (event) => {
        const actionButton = event.target.closest(".btn-complete");
        if (!actionButton) {
            return;
        }

        const taskItem = actionButton.closest(".task-item");
        if (!taskItem) {
            return;
        }

        const taskId = Number(taskItem.dataset.taskId);
        const task = dashboardData.tasks.find((item) => item.id === taskId);
        if (!task) {
            return;
        }

        task.status = "Done";
        task.progress = 100;
        renderTaskRows(rootNode.querySelector("#taskList"), dashboardData.tasks);
    });
}

function updateClock(clockNode) {
    if (!clockNode) {
        return;
    }

    const now = new Date();
    clockNode.textContent = now.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function loadDashboard(rootSelector = "#dashboardApp") {
    const authToken = localStorage.getItem(TOKEN_KEY);
    if (!authToken) {
        window.location.href = "p2.html";
        return;
    }

    const rootNode = document.querySelector(rootSelector);
    if (!rootNode) {
        return;
    }

    const headerName = rootNode.querySelector("#welcomeName");
    const headerRole = rootNode.querySelector("#welcomeRole");
    const metricGrid = rootNode.querySelector("#metricGrid");
    const taskList = rootNode.querySelector("#taskList");
    const activityList = rootNode.querySelector("#activityList");
    const commitList = rootNode.querySelector("#commitList");
    const clockNode = rootNode.querySelector("#dashboardClock");

    if (!metricGrid || !taskList || !activityList || !commitList) {
        return;
    }

    let activeUser = dashboardData.user;
    try {
        const rawUser = localStorage.getItem(USER_KEY);
        if (rawUser) {
            const parsedUser = JSON.parse(rawUser);
            if (parsedUser && parsedUser.name) {
                activeUser = parsedUser;
            }
        }
    } catch (error) {
        console.warn("Unable to parse auth user", error);
    }

    if (headerName) {
        headerName.textContent = activeUser.name || dashboardData.user.name;
    }

    if (headerRole) {
        headerRole.textContent = activeUser.role || dashboardData.user.role;
    }

    renderMetrics(metricGrid, dashboardData.metrics);
    renderTaskRows(taskList, dashboardData.tasks);
    renderActivity(activityList, dashboardData.activity);
    renderCommits(commitList, dashboardData.commits);

    bindTaskActions(rootNode);

    const logoutButton = rootNode.querySelector("#logoutBtn");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem("auraRememberSession");
            window.location.href = "p2.html";
        });
    }

    updateClock(clockNode);
    window.setInterval(() => updateClock(clockNode), 30000);
}

window.loadDashboard = loadDashboard;

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});
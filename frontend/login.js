"use strict";

const TOKEN_KEY = "auraAuthToken";
const USER_KEY = "auraAuthUser";
const REMEMBER_KEY = "auraRememberSession";
const DASHBOARD_PATH = "p3.html";

function validateLoginFields(email, password) {
    const trimmedEmail = (email || "").trim();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
        return "Email and password are required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
        return "Enter a valid email address.";
    }

    if (trimmedPassword.length < 4) {
        return "Password must have at least 4 characters.";
    }

    return "";
}

function setMessage(messageNode, text, type = "") {
    if (!messageNode) {
        return;
    }

    messageNode.textContent = text;
    messageNode.className = `status ${type}`.trim();
}

function persistAuthSession(payload, rememberMe) {
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    localStorage.setItem(REMEMBER_KEY, rememberMe ? "1" : "0");
}

function performLogin(email, password) {
    if (!window.AuthService || typeof window.AuthService.loginAPI !== "function") {
        return {
            ok: false,
            error: "Auth service is not available."
        };
    }

    return window.AuthService.loginAPI({ email, password });
}

function handlePasswordToggle(toggleButton, passwordInput) {
    if (!toggleButton || !passwordInput) {
        return;
    }

    toggleButton.addEventListener("click", () => {
        const reveal = passwordInput.type === "password";
        passwordInput.type = reveal ? "text" : "password";
        toggleButton.textContent = reveal ? "HIDE" : "SHOW";
    });
}

function bindLoginForm() {
    const form = document.querySelector("#loginForm");
    if (!form) {
        return;
    }

    const emailInput = form.querySelector("#email");
    const passwordInput = form.querySelector("#password");
    const rememberInput = form.querySelector("#rememberMe");
    const loginButton = form.querySelector("#loginButton");
    const messageNode = form.querySelector("#loginMessage");
    const toggleButton = form.querySelector("#passwordToggle");

    handlePasswordToggle(toggleButton, passwordInput);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = emailInput ? emailInput.value : "";
        const password = passwordInput ? passwordInput.value : "";
        const validationMessage = validateLoginFields(email, password);
        if (validationMessage) {
            setMessage(messageNode, validationMessage, "error");
            return;
        }

        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = "Signing in...";
        }

        window.setTimeout(() => {
            const result = performLogin(email, password);

            if (!result.ok) {
                setMessage(messageNode, result.error || "Unable to sign in.", "error");
                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = "Sign In";
                }
                return;
            }

            persistAuthSession(result, Boolean(rememberInput && rememberInput.checked));
            setMessage(messageNode, "Login successful. Redirecting...", "success");
            window.location.href = DASHBOARD_PATH;
        }, 260);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    bindLoginForm();
});
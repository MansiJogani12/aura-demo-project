// Login API (Demo)
const DEMO_USER = {
    id: 1,
    name: "Admin User",
    role: "Project Admin",
    email: "admin@test.com",
    password: "1234"
};

function createAuthToken(user) {
    return `demo-token-${user.id}-${Date.now()}`;
}

function buildAuthSuccess(user) {
    return {
        ok: true,
        token: createAuthToken(user),
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email
        }
    };
}

function buildAuthFailure(message = "Invalid credentials") {
    return {
        ok: false,
        error: message
    };
}

function loginAPI(req = {}, res) {
    const email = (req.email || "").trim().toLowerCase();
    const password = req.password || "";

    const payload =
        email === DEMO_USER.email && password === DEMO_USER.password
            ? buildAuthSuccess(DEMO_USER)
            : buildAuthFailure();

    if (res && typeof res.status === "function" && typeof res.json === "function") {
        const status = payload.ok ? 200 : 401;
        return res.status(status).json(payload);
    }

    return payload;
}

const AuthService = {
    loginAPI
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = AuthService;
}

if (typeof window !== "undefined") {
    window.AuthService = AuthService;
}
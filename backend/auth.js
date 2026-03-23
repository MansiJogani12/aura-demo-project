// Login API (Demo)
function loginAPI(req, res) {
    const { email, password } = req;

    if (email === "admin@test.com" && password === "1234") {
        return { token: "jwt-token-demo" };
    }

    return { error: "Invalid credentials" };
}
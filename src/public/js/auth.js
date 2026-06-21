document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleBtn = document.getElementById('toggle-form-btn');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const toggleText = document.getElementById('toggle-text');
    const errorAlert = document.getElementById('error-alert');

    let isLogin = true;

    // Toggle between Login and Register modes
    toggleBtn.addEventListener('click', () => {
        isLogin = !isLogin;
        errorAlert.classList.add('hidden');

        if (isLogin) {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            formTitle.textContent = 'Welcome back';
            formSubtitle.textContent = 'Enter your credentials to access your dashboard.';
            toggleText.textContent = "Don't have an account?";
            toggleBtn.textContent = 'Sign up';
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            formTitle.textContent = 'Create an account';
            formSubtitle.textContent = 'Start tracking your placement journey today.';
            toggleText.textContent = "Already have an account?";
            toggleBtn.textContent = 'Sign in';
        }
    });

    // Helper to display error messages clearly
    const showError = (message) => {
        errorAlert.textContent = message;
        errorAlert.classList.remove('hidden');
    };

    const handleAuth = async (e, endpoint, payload) => {
        e.preventDefault();
        errorAlert.classList.add('hidden');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            const response = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle express-validator array errors or standard errors
                const errorMessage = data.errors ? data.errors[0].msg : data.error;
                showError(errorMessage || 'Authentication failed.');
                submitBtn.disabled = false;
                submitBtn.textContent = isLogin ? 'Sign In' : 'Create Account';
                return;
            }

            // On success, redirect to the dashboard
            window.location.href = '/dashboard.html';

        } catch (error) {
            showError('Network error. Please ensure the server is running.');
            submitBtn.disabled = false;
            submitBtn.textContent = isLogin ? 'Sign In' : 'Create Account';
        }
    };

    loginForm.addEventListener('submit', (e) => {
        const payload = {
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-password').value
        };
        handleAuth(e, 'login', payload);
    });

    registerForm.addEventListener('submit', (e) => {
        const payload = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value
        };
        handleAuth(e, 'register', payload);
    });
});

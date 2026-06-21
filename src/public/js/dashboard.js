document.addEventListener('DOMContentLoaded', async () => {
    const appBody = document.getElementById('app-body');
    const userGreeting = document.getElementById('user-greeting');
    const userAvatar = document.getElementById('user-avatar');
    const logoutBtn = document.getElementById('logout-btn');

    const loadingState = document.getElementById('loading-state');
    const dashboardContent = document.getElementById('dashboard-content');

    // 1. Client-Side Authentication Check
    try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
            // If token is missing/invalid, kick user back to login page
            window.location.replace('/');
            return;
        }
        const authData = await authRes.json();
        const username = authData.user.username;

        // Update UI with user info
        userGreeting.textContent = username;
        userAvatar.textContent = username.charAt(0).toUpperCase();

        // Show the app body now that we verified the user
        appBody.classList.remove('hidden');

        // 2. Fetch Dashboard Analytics
        loadDashboardData();

    } catch (error) {
        console.error('Auth verification failed:', error);
        window.location.replace('/');
    }

    // 3. Logout Handler
    logoutBtn.addEventListener('click', async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.replace('/');
    });

    async function loadDashboardData() {
        try {
            const res = await fetch('/api/dashboard');
            const data = await res.json();

            // Populate Top Stats
            document.getElementById('stat-solved').textContent = data.problem_stats.solved;
            document.getElementById('stat-revisiting').textContent = data.problem_stats.revisiting;

            // Calculate active applications (excluding rejected/offers)
            const activeApps = (data.application_stats['applied'] || 0) +
                               (data.application_stats['OA pending'] || 0) +
                               (data.application_stats['interview scheduled'] || 0);
            document.getElementById('stat-applications').textContent = activeApps;

            // Populate Topic Progress
            const topicList = document.getElementById('topic-list');
            if (data.topic_progress.length === 0) {
                topicList.innerHTML = '<p class="text-sm text-gray-500">No topics tracked yet.</p>';
            } else {
                topicList.innerHTML = data.topic_progress.map(topic => {
                    // Prevent division by zero
                    const percentage = topic.total_tracked > 0
                        ? Math.round((topic.solved / topic.total_tracked) * 100)
                        : 0;

                    return `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="font-medium text-gray-700">${topic.topic}</span>
                                <span class="text-gray-500">${topic.solved}/${topic.total_tracked}</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-2">
                                <div class="bg-brand-500 h-2 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Populate Deadlines
            const deadlineList = document.getElementById('deadline-list');
            if (data.upcoming_deadlines.length === 0) {
                deadlineList.innerHTML = '<p class="text-sm text-gray-500">No upcoming deadlines.</p>';
            } else {
                deadlineList.innerHTML = data.upcoming_deadlines.map(app => {
                    const date = new Date(app.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    return `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <p class="text-sm font-semibold text-gray-900">${app.company}</p>
                                <p class="text-xs text-gray-500">${app.role}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-medium text-red-600">${date}</p>
                                <p class="text-xs text-gray-500">${app.status}</p>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            loadingState.classList.add('hidden');
            dashboardContent.classList.remove('hidden');

        } catch (error) {
            console.error('Failed to load dashboard:', error);
            loadingState.innerHTML = '<p class="text-red-500 text-sm">Failed to load analytics.</p>';
        }
    }
});

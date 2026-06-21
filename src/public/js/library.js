document.addEventListener('DOMContentLoaded', async () => {
    const appBody = document.getElementById('app-body');

    // Auth Check
    const authRes = await fetch('/api/auth/me');
    if (!authRes.ok) return window.location.replace('/');
    appBody.classList.remove('hidden');

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const topicFilter = document.getElementById('topic-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const problemsTbody = document.getElementById('problems-tbody');

    // Modal Elements
    const trackingModal = document.getElementById('tracking-modal');
    const trackingForm = document.getElementById('tracking-form');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // 1. Load Topics for Dropdown
    async function loadTopics() {
        try {
            const res = await fetch('/api/problems/topics');
            const data = await res.json();
            data.topics.forEach(t => {
                const option = document.createElement('option');
                option.value = t.name;
                option.textContent = t.name;
                topicFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load topics', error);
        }
    }

    // 2. Fetch and Render Problems
    async function loadProblems() {
        const query = new URLSearchParams({
            search: searchInput.value,
            topic: topicFilter.value,
            difficulty: difficultyFilter.value,
            limit: 50 // Fetch up to 50 for this view
        });

        problemsTbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">Loading...</td></tr>';

        try {
            const res = await fetch(`/api/problems?${query.toString()}`);
            const data = await res.json();

            if (data.problems.length === 0) {
                problemsTbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No problems match your filters.</td></tr>';
                return;
            }

            problemsTbody.innerHTML = data.problems.map(p => {
                // Determine difficulty badge color
                let diffColor = 'bg-green-100 text-green-700';
                if (p.difficulty === 'Medium') diffColor = 'bg-yellow-100 text-yellow-700';
                if (p.difficulty === 'Hard') diffColor = 'bg-red-100 text-red-700';

                return `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">
                            <a href="${p.url}" target="_blank" class="font-medium text-brand-600 hover:underline flex items-center gap-1">
                                ${p.title}
                                <span class="text-xs text-gray-400">↗</span>
                            </a>
                        </td>
                        <td class="px-6 py-4 text-gray-600">${p.topic || 'General'}</td>
                        <td class="px-6 py-4">
                            <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${diffColor}">${p.difficulty}</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <button class="update-status-btn px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded border border-brand-200 transition-colors"
                            data-id="${p.id}" data-title="${p.title.replace(/"/g, '&quot;')}">
                            Update Status
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            problemsTbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-red-500">Failed to load problems.</td></tr>';
        }
    }

    // 3. Modal & Tracking Logic
    problemsTbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.update-status-btn');
        if (!btn) return; // If they didn't click the button, ignore it

        document.getElementById('modal-problem-id').value = btn.dataset.id;
        document.getElementById('modal-problem-title').textContent = btn.dataset.title;
        document.getElementById('modal-status').value = 'solved';
        document.getElementById('modal-notes').value = '';

        trackingModal.classList.remove('hidden');
        trackingModal.classList.add('flex');
    });

    closeModalBtn.addEventListener('click', () => {
        trackingModal.classList.add('hidden');
        trackingModal.classList.remove('flex');
    });

    trackingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        const problemId = document.getElementById('modal-problem-id').value;
        const payload = {
            status: document.getElementById('modal-status').value,
            notes: document.getElementById('modal-notes').value
        };

        try {
            // Using the strictly requested /api/tracking endpoint
            const res = await fetch(`/api/tracking/${problemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                trackingModal.classList.add('hidden');
                trackingModal.classList.remove('flex');
            } else {
                alert('Failed to update status.');
            }
        } catch (error) {
            console.error(error);
            alert('Network error occurred.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });

    // Event Listeners for Filters
    searchInput.addEventListener('input', loadProblems);
    topicFilter.addEventListener('change', loadProblems);
    difficultyFilter.addEventListener('change', loadProblems);

    // Initialization
    loadTopics().then(loadProblems);
});

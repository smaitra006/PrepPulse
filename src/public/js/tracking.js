document.addEventListener('DOMContentLoaded', async () => {
    const appBody = document.getElementById('app-body');

    // Auth Check
    const authRes = await fetch('/api/auth/me');
    if (!authRes.ok) return window.location.replace('/');
    appBody.classList.remove('hidden');

    // DOM Elements
    const statusFilter = document.getElementById('status-filter');
    const trackingTbody = document.getElementById('tracking-tbody');

    // Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeEditBtn = document.getElementById('close-edit-btn');

    // Store global data state to easily populate the edit modal without re-fetching
    let currentData = [];

    // Fetch and Render Tracked Problems
    async function loadTrackedProblems() {
        const query = statusFilter.value ? `?status=${statusFilter.value}` : '';
        trackingTbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">Loading...</td></tr>';

        try {
            const res = await fetch(`/api/tracking${query}`);
            const data = await res.json();

            if (data.tracked_problems.length === 0) {
                trackingTbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No tracked problems found.</td></tr>';
                return;
            }

            currentData = data.tracked_problems; // Cache for the modal

            trackingTbody.innerHTML = currentData.map((p, index) => {
                // Style status badges
                let statusColor = 'bg-gray-100 text-gray-700';
                if (p.status === 'solved') statusColor = 'bg-green-100 text-green-700';
                if (p.status === 'revisiting') statusColor = 'bg-orange-100 text-orange-700';
                if (p.status === 'bookmarked') statusColor = 'bg-blue-100 text-blue-700';

                // Truncate notes for the table view
                const safeNotes = p.notes ? p.notes.replace(/</g, "&lt;").replace(/>/g, "&gt;") : '<span class="text-gray-400 italic">No notes</span>';
                const displayNotes = safeNotes.length > 50 ? safeNotes.substring(0, 50) + '...' : safeNotes;

                return `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">
                            <a href="${p.url}" target="_blank" class="font-medium text-brand-600 hover:underline">
                                ${p.title}
                            </a>
                        </td>
                        <td class="px-6 py-4">
                            <span class="px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusColor}">${p.status}</span>
                        </td>
                        <td class="px-6 py-4 text-gray-600 truncate max-w-xs">${displayNotes}</td>
                        <td class="px-6 py-4 text-right">
                            <button class="edit-tracking-btn px-3 py-1.5 text-sm font-medium      text-gray-600 bg-white hover:bg-gray-50 rounded border border-gray-300   transition-colors"
                              data-index="${index}">
                              Edit
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            trackingTbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-red-500">Failed to load tracking data.</td></tr>';
        }
    }

    // Modal Logic
    trackingTbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.edit-tracking-btn');
        if (!btn) return;

        const index = btn.dataset.index;
        const problem = currentData[index];

        document.getElementById('edit-problem-id').value = problem.problem_id;
        document.getElementById('edit-modal-title').textContent = problem.title;
        document.getElementById('edit-status').value = problem.status;
        document.getElementById('edit-notes').value = problem.notes || '';

        editModal.classList.remove('hidden');
        editModal.classList.add('flex');
    });

    closeEditBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
        editModal.classList.remove('flex');
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        const problemId = document.getElementById('edit-problem-id').value;
        const payload = {
            status: document.getElementById('edit-status').value,
            notes: document.getElementById('edit-notes').value
        };

        try {
            const res = await fetch(`/api/tracking/${problemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                editModal.classList.add('hidden');
                editModal.classList.remove('flex');
                loadTrackedProblems();
            } else {
                alert('Failed to update tracking.');
            }
        } catch (error) {
            console.error(error);
            alert('Network error occurred.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });

    // Event Listeners
    statusFilter.addEventListener('change', loadTrackedProblems);

    // Initialization
    loadTrackedProblems();
});

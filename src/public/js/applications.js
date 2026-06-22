document.addEventListener('DOMContentLoaded', async () => {
    const appBody = document.getElementById('app-body');

    // Auth Validation Step
    const authRes = await fetch('/api/auth/me');
    if (!authRes.ok) return window.location.replace('/');
    appBody.classList.remove('hidden');

    const applicationsTbody = document.getElementById('applications-tbody');
    const pipelineFilter = document.getElementById('pipeline-filter');

    // Modals
    const addModal = document.getElementById('add-modal');
    const updateModal = document.getElementById('update-modal');

    let localApplicationsCache = [];

    // 1. Fetch Global Corporate Entities to populate Creation UI Select dropdown
    async function loadCorporateDropdowns() {
        try {
            const res = await fetch('/api/applications/companies');
            const data = await res.json();
            const selectEl = document.getElementById('add-company-id');
            selectEl.innerHTML = data.companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        } catch (err) {
            console.error('Corporate seeding failure:', err);
        }
    }

    // 2. Fetch and render active pipelines
    async function loadApplicationsPipeline() {
        const urlParam = pipelineFilter.value ? `?status=${encodeURIComponent(pipelineFilter.value)}` : '';
        applicationsTbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">Parsing tracking pipeline...</td></tr>';

        try {
            const res = await fetch(`/api/applications${urlParam}`);
            const data = await res.json();
            localApplicationsCache = data.applications;

            if (localApplicationsCache.length === 0) {
                applicationsTbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">Pipeline segment empty.</td></tr>';
                return;
            }

            applicationsTbody.innerHTML = localApplicationsCache.map((app, index) => {
                let statusBadge = 'bg-gray-100 text-gray-700';
                if (app.status === 'applied') statusBadge = 'bg-blue-100 text-blue-700';
                if (app.status === 'OA pending') statusBadge = 'bg-yellow-100 text-yellow-700';
                if (app.status === 'interview scheduled') statusBadge = 'bg-purple-100 text-purple-700';
                if (app.status === 'offer received') statusBadge = 'bg-green-100 text-green-700';
                if (app.status === 'rejected') statusBadge = 'bg-red-100 text-red-700';

                let priorityBadge = 'text-gray-600';
                if (app.priority === 'High') priorityBadge = 'text-red-600 font-semibold';

                const deadlineDisplay = app.deadline
                    ? new Date(app.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : '<span class="text-gray-400">Undated</span>';

                return `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 font-semibold text-gray-900">${app.company_name}</td>
                        <td class="px-6 py-4 text-gray-600">${app.role}</td>
                        <td class="px-6 py-4 text-xs ${priorityBadge}">${app.priority}</td>
                        <td class="px-6 py-4">
                            <span class="px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusBadge}">${app.status}</span>
                        </td>
                        <td class="px-6 py-4 text-sm">${deadlineDisplay}</td>
                        <td class="px-6 py-4 text-right">
                            <button class="shift-pipeline-btn px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded border border-brand-200 transition-colors" data-index="${index}">
                                Advance
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            applicationsTbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-red-500">Pipeline retrieval failure.</td></tr>';
        }
    }

    // 3. Control UI Modals Lifecycle Toggle
    document.getElementById('open-add-modal-btn').addEventListener('click', () => {
        addModal.classList.remove('hidden');
        addModal.classList.add('flex');
    });
    document.getElementById('close-add-btn').addEventListener('click', () => {
        addModal.classList.add('hidden');
        addModal.classList.remove('flex');
    });
    document.getElementById('close-update-btn').addEventListener('click', () => {
        updateModal.classList.add('hidden');
        updateModal.classList.remove('flex');
    });

    // 4. Form submission for Tracking a New Role
    document.getElementById('add-application-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Map payload fields cleanly to match Phase 8 camelCase destructuring parameters
        const payload = {
            companyId: parseInt(document.getElementById('add-company-id').value),
            role: document.getElementById('add-role').value,
            status: document.getElementById('add-status').value,
            priority: document.getElementById('add-priority').value,
            appliedDate: document.getElementById('add-applied-date').value || null,
            deadline: document.getElementById('add-deadline').value || null,
            notes: document.getElementById('add-notes').value || null
        };

        const res = await fetch('/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            addModal.classList.add('hidden');
            addModal.classList.remove('flex');
            document.getElementById('add-application-form').reset();
            loadApplicationsPipeline();
        } else {
            const data = await res.json();
            alert(data.error || 'Pipeline creation rejected.');
        }
    });

    // 5. Event Delegation for Altering Existing Application Records
    applicationsTbody.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.shift-pipeline-btn');
        if (!targetBtn) return;

        const recordIndex = targetBtn.dataset.index;
        const appRecord = localApplicationsCache[recordIndex];

        // Hydrate configuration parameters onto Update Modal target references
        document.getElementById('update-app-id').value = appRecord.id;
        document.getElementById('update-modal-context').textContent = `${appRecord.company_name} — ${appRecord.role}`;
        document.getElementById('update-status').value = appRecord.status;
        document.getElementById('update-priority').value = appRecord.priority;

        // Format ISO Date references cleanly to bind HTML date fields safely
        document.getElementById('update-applied-date').value = appRecord.applied_date ? appRecord.applied_date.substring(0, 10) : '';
        document.getElementById('update-deadline').value = appRecord.deadline ? appRecord.deadline.substring(0, 10) : '';
        document.getElementById('update-notes').value = appRecord.notes || '';

        updateModal.classList.remove('hidden');
        updateModal.classList.add('flex');
    });

    // 6. Form Submission for Saving Application Changes
    document.getElementById('update-application-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const appId = document.getElementById('update-app-id').value;

        const payload = {
            status: document.getElementById('update-status').value,
            appliedDate: document.getElementById('update-applied-date').value || null,
            deadline: document.getElementById('update-deadline').value || null,
            priority: document.getElementById('update-priority').value,
            notes: document.getElementById('update-notes').value || null
        };

        const res = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            updateModal.classList.add('hidden');
            updateModal.classList.remove('flex');
            loadApplicationsPipeline();
        } else {
            alert('Pipeline state update failed.');
        }
    });

    pipelineFilter.addEventListener('change', loadApplicationsPipeline);

    loadCorporateDropdowns().then(loadApplicationsPipeline);
});

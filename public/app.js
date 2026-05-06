// ============================================
// CRUD App — Frontend JavaScript
// ============================================

const API_URL = '/api/items';

// DOM Elements
const form = document.getElementById('item-form');
const itemIdInput = document.getElementById('item-id');
const nameInput = document.getElementById('item-name');
const descInput = document.getElementById('item-description');
const priceInput = document.getElementById('item-price');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tbody = document.getElementById('items-tbody');
const itemCount = document.getElementById('item-count');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const tableWrapper = document.getElementById('table-wrapper');
const toastContainer = document.getElementById('toast-container');

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'success') {
    const icons = {
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `${icons[type] || ''}${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 3200);
}

// ============================================
// Render Items
// ============================================
function renderItems(items) {
    loading.style.display = 'none';

    if (items.length === 0) {
        emptyState.style.display = 'flex';
        tableWrapper.style.display = 'none';
        itemCount.textContent = '0';
        return;
    }

    emptyState.style.display = 'none';
    tableWrapper.style.display = 'block';
    itemCount.textContent = items.length;

    tbody.innerHTML = items
        .map(
            (item, i) => `
        <tr style="animation-delay: ${i * 0.04}s" data-id="${item.id}">
            <td class="item-name">${escapeHtml(item.name)}</td>
            <td class="item-desc" title="${escapeHtml(item.description)}">${escapeHtml(item.description || '—')}</td>
            <td class="item-price">$${parseFloat(item.price).toFixed(2)}</td>
            <td class="item-date">${formatDate(item.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon edit" onclick="editItem(${item.id})" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon delete" onclick="confirmDelete(${item.id}, '${escapeHtml(item.name)}')" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `
        )
        .join('');
}

// ============================================
// API Calls
// ============================================
async function fetchItems() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.success) {
            renderItems(data.data);
        }
    } catch (err) {
        showToast('Failed to load items', 'error');
        loading.style.display = 'none';
        emptyState.style.display = 'flex';
    }
}

async function createItem(item) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return res.json();
}

async function updateItem(id, item) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return res.json();
}

async function deleteItem(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    return res.json();
}

// ============================================
// Form Handling
// ============================================
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const item = {
        name: nameInput.value.trim(),
        description: descInput.value.trim(),
        price: parseFloat(priceInput.value),
    };

    if (!item.name || isNaN(item.price)) {
        showToast('Please fill in name and price', 'error');
        return;
    }

    try {
        const editId = itemIdInput.value;

        if (editId) {
            const data = await updateItem(editId, item);
            if (data.success) {
                showToast('Item updated successfully');
                cancelEdit();
            } else {
                showToast(data.message || 'Update failed', 'error');
            }
        } else {
            const data = await createItem(item);
            if (data.success) {
                showToast('Item created successfully');
            } else {
                showToast(data.message || 'Create failed', 'error');
            }
        }

        form.reset();
        itemIdInput.value = '';
        fetchItems();
    } catch (err) {
        showToast('Something went wrong', 'error');
    }
});

// ============================================
// Edit Item
// ============================================
async function editItem(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const data = await res.json();

        if (data.success) {
            const item = data.data;
            itemIdInput.value = item.id;
            nameInput.value = item.name;
            descInput.value = item.description || '';
            priceInput.value = item.price;

            formTitle.innerHTML = '<span class="dot dot-green"></span> Edit Item';
            submitBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Changes
            `;
            cancelBtn.style.display = 'inline-flex';
            nameInput.focus();

            document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (err) {
        showToast('Failed to load item', 'error');
    }
}

// ============================================
// Cancel Edit
// ============================================
function cancelEdit() {
    form.reset();
    itemIdInput.value = '';
    formTitle.innerHTML = '<span class="dot dot-green"></span> Add New Item';
    submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Item
    `;
    cancelBtn.style.display = 'none';
}

// ============================================
// Delete Confirmation
// ============================================
function confirmDelete(id, name) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-dialog">
            <h3>Delete Item</h3>
            <p>Are you sure you want to delete "<strong>${name}</strong>"? This action cannot be undone.</p>
            <div class="confirm-actions">
                <button class="btn btn-ghost" id="cancel-delete">Cancel</button>
                <button class="btn btn-danger" id="confirm-delete-btn">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#cancel-delete').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#confirm-delete-btn').addEventListener('click', async () => {
        try {
            const data = await deleteItem(id);
            if (data.success) {
                showToast('Item deleted successfully');
                fetchItems();
            } else {
                showToast(data.message || 'Delete failed', 'error');
            }
        } catch (err) {
            showToast('Failed to delete item', 'error');
        }
        overlay.remove();
    });
}

// ============================================
// Helpers
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================
// Initialize
// ============================================
fetchItems();

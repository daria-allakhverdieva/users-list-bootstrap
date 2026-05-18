const API = {
    users: '/api/admin/users',
    roles: '/api/roles',
    currentUser: '/api/users',
    addUser: '/api/admin/users',
    updateUser: '/api/admin/users',
    deleteUser: '/api/admin/users',
    logout: '/logout'
};

let currentUserId = null;

async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        return null;
    }
}

async function loadCurrentUser() {
    const user = await fetchData(API.currentUser);
    if (user) {
        currentUserId = user.id;
        const userInfo = document.getElementById('userInfo');
        const rolesString = user.roles ? user.roles.map(r => r.name).join(', ') : '';
        userInfo.innerHTML = `
            <strong>${user.username}</strong>
            <span class="ms-1">with roles: ${rolesString}</span>
        `;
    }
    return user;
}

async function loadAllData() {
    const [users, allRoles] = await Promise.all([
        fetchData(API.users),
        fetchData(API.roles)
    ]);

    if (users && allRoles) {
        renderUsersTable(users);
        renderSidebar(users);
        populateRoleSelects(allRoles);
    }
    return { users, allRoles };
}

async function refreshUI() {
    try {
        const [users, allRoles, currentUser] = await Promise.all([
            fetchData(API.users),
            fetchData(API.roles),
            fetchData(API.currentUser)
        ]);

        if (users && allRoles && currentUser) {
            currentUserId = currentUser.id;
            renderUsersTable(users);
            renderSidebar(users);
            populateRoleSelects(allRoles);
            updateUserInfo(currentUser);

            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            if (modal) modal.hide();
            document.getElementById('addUserForm').reset();
            showAlert('Данные успешно обновлены');
        }
    } catch (error) {
        showAlert('Ошибка при обновлении данных');
    }
}

function updateUserInfo(user) {
    const userInfo = document.getElementById('userInfo');
    const rolesString = user.roles ? user.roles.map(r => r.name).join(', ') : '';
    userInfo.innerHTML = `
        <strong>${user.username}</strong>
        <span class="ms-1">with roles: ${rolesString}</span>
    `;
}

function renderUsersTable(users) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = users.map(user => {
        const rolesString = user.roles ? user.roles.map(r => r.name).join(', ') : '';
        return `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.age}</td>
                <td>${rolesString}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary edit-btn"
                            data-bs-toggle="modal"
                            data-bs-target="#editUserModal"
                            data-id="${user.id}"
                            data-username="${user.username}"
                            data-age="${user.age}"
                            data-roles="${user.roles ? user.roles.map(r => r.name).join(',') : ''}">
                        Edit
                    </button>
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const username = this.dataset.username;
            const age = this.dataset.age;
            const roles = this.dataset.roles ? this.dataset.roles.split(',') : [];

            document.getElementById('editUserIdHidden').value = id;
            document.getElementById('editUserIdDisplay').value = id;
            document.getElementById('editUsername').value = username;
            document.getElementById('editAge').value = age;

            const editRolesSelect = document.getElementById('editRoles');
            Array.from(editRolesSelect.options).forEach(option => {
                option.selected = roles.includes(option.value);
            });
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const userId = this.dataset.id;
            if (confirm(`Вы уверены, что хотите удалить пользователя с ID ${userId}?`)) {
                await deleteUser(userId);
            }
        });
    });
}

function renderSidebar(users) {
    const sidebarList = document.getElementById('sidebarUserList');
    sidebarList.innerHTML = users.map(user => {
        const activeClass = (user.id === currentUserId) ? 'sidebar-user-active' : '';
        const textClass = (user.id === currentUserId) ? 'text-white' : 'text-dark';
        return `
            <li class="list-group-item ${activeClass}" style="cursor: pointer;">
                <a href="/user?id=${user.id}" class="text-decoration-none ${textClass} sidebar-link" data-id="${user.id}">
                    ${user.username}
                </a>
            </li>
        `;
    }).join('');
}

function populateRoleSelects(roles) {
    const roleSelects = ['role', 'editRoles'];
    roleSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = roles.map(role => `
                <option value="${role.name}">${role.name}</option>
            `).join('');
        }
    });
}

async function addUser(formData) {
    const data = {
        username: formData.get('username'),
        age: parseInt(formData.get('age')),
        password: formData.get('password'),
        roles: Array.from(formData.getAll('roles')).map(name => ({ name }))
    };

    try {
        const response = await fetch(API.addUser, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showAlert('Пользователь успешно создан');
            await refreshUI();
        } else {
            const errorData = await response.json();
            showAlert('Ошибка: ' + (errorData.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        showAlert('Ошибка при создании пользователя: ' + error.message);
    }
}

async function updateUser(formData) {
    const id = parseInt(formData.get('id'));
    const data = {
        username: formData.get('username'),
        age: parseInt(formData.get('age')),
        password: formData.get('password') || null,
        roles: Array.from(formData.getAll('roles')).map(name => ({ name }))
    };

    if (!data.password) {
        delete data.password;
    }

    try {
        const response = await fetch(`${API.updateUser}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showAlert('Пользователь успешно обновлен');
            await refreshUI();
        } else {
            const errorData = await response.json();
            showAlert('Ошибка: ' + (errorData.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        showAlert('Ошибка при обновлении пользователя: ' + error.message);
    }
}
async function deleteUser(userId) {
    try {
        const response = await fetch(`${API.deleteUser}/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Пользователь успешно удален');
            await refreshUI();
        } else {
            const errorData = await response.json();
            showAlert('Ошибка: ' + (errorData.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        showAlert('Ошибка при удалении пользователя: ' + error.message);
    }
}

function showAlert(message) {
    const alert = document.getElementById('adminAlert');
    if (alert) {
        alert.textContent = message;
        alert.classList.remove('d-none');
        setTimeout(() => {
            alert.classList.add('d-none');
        }, 3000);
    } else {
        console.log(message);
    }
}

document.getElementById('addUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    await addUser(formData);
});

document.getElementById('editUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    await updateUser(formData);
});

document.getElementById('logoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    fetch(API.logout, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(() => {
        window.location.href = '/login';
    });
});

document.addEventListener('DOMContentLoaded', async function() {
    await loadCurrentUser();
    await loadAllData();
});
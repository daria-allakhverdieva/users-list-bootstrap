// Инициализация переменных
const adminState = {
    users: [],
    roles: []
};

const adminAlert = document.getElementById('adminAlert');
const usersTableBody = document.getElementById('usersTableBody');
const newUserForm = document.getElementById('newUserForm');
const editUserForm = document.getElementById('editUserForm');
const editModal = new bootstrap.Modal(document.getElementById('editUserModal'));

// Основная загрузка данных
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadAdminPage();
        bindAdminEvents();
    } catch (error) {
        showAlert('Ошибка при загрузке данных: ' + error.message);
    }
});

// Загрузка всех данных
async function loadAdminPage() {
    try {
        hideAlert();

        // Загрузка списка пользователей
        const [users, roles] = await Promise.all([
            fetchUsers(),
            fetchRoles()
        ]);

        adminState.users = users;
        adminState.roles = roles;

        renderUsersTable(users);
        fillRolesSelect(roles);
    } catch (error) {
        showAlert('Ошибка загрузки данных: ' + error.message);
    }
}

// Получение пользователей
async function fetchUsers() {
    const response = await fetch('/api/admin/users');
    if (!response.ok) throw new Error('Ошибка получения пользователей');
    return await response.json();
}

// Получение ролей
async function fetchRoles() {
    const response = await fetch('/api/admin/roles');
    if (!response.ok) throw new Error('Ошибка получения ролей');
    return await response.json();
}

// Рендеринг таблицы пользователей
function renderUsersTable(users) {
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.age}</td>
            <td>${user.roles.map(r => r.name).join(', ')}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" 
                        data-id="${user.id}">
                    Редактировать
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-danger delete-btn" 
                        data-id="${user.id}">
                    Удалить
                </button>
            </td>
        </tr>
    `).join('');
}

// Заполнение селекта ролей
function fillRolesSelect(roles) {
    const rolesSelect = document.getElementById('rolesSelect');
    rolesSelect.innerHTML = '';
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.name;
        option.textContent = role.name;
        rolesSelect.appendChild(option);
    });
}

// Обработка событий
function bindAdminEvents() {
    // Обработка создания нового пользователя
    newUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(newUserForm);
        const userData = {
            username: formData.get('username'),
            age: parseInt(formData.get('age')),
            password: formData.get('password'),
            roles: Array.from(formData.getAll('roles'))
        };

        try {
            await createUser(userData);
            showAlert('Пользователь создан');
            newUserForm.reset();
            await loadAdminPage();
        } catch (error) {
            showAlert('Ошибка создания пользователя: ' + error.message);
        }
    });

    // Обработка кликов по таблице
    usersTableBody.addEventListener('click', (e) => {
        const target = e.target;

        if (target.classList.contains('edit-btn')) {
            const userId = target.dataset.id;
            openEditModal(userId);
        }

        if (target.classList.contains('delete-btn')) {
            const userId = target.dataset.id;
            deleteUser(userId);
        }
    });
}

// Создание пользователя
async function createUser(userData) {
    const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error('Ошибка создания пользователя');
}

// Обновление пользователя
async function updateUser(userData) {
    const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error('Ошибка обновления пользователя');
}

// Удаление пользователя
async function deleteUser(userId) {
    if (!confirm('Вы уверены, что хотите удалить пользователя?')) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Пользователь удален');
            await loadAdminPage();
        } else {
            throw new Error('Ошибка удаления пользователя');
        }
    } catch (error) {
        showAlert('Ошибка: ' + error.message);
    }
}

// Открытие модального окна редактирования
function openEditModal(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if (!user) return;

    // Заполняем форму данными пользователя
    editUserForm.elements.id.value = user.id;
    editUserForm.elements.username.value = user.username;
    editUserForm.elements.age.value = user.age;

    // Очищаем и заполняем роли
    const rolesSelect = document.getElementById('editRoles');
    rolesSelect.value = [];
    user.roles.forEach(role => {
        const option = rolesSelect.querySelector(`option[value="${role.name}"]`);
        if (option) option.selected = true;
    });

    editModal.show();
}

// Показ алерта
function showAlert(message) {
    adminAlert.textContent = message;
    adminAlert.classList.remove('d-none');
    setTimeout(() => {
        adminAlert.classList.add('d-none');
    }, 3000);
}

// Скрытие алерта
function hideAlert() {
    adminAlert.classList.add('d-none');
}
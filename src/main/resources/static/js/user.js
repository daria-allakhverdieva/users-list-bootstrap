
const API = {
    currentUser: '/api/users',
    allUsers: '/api/admin/users',
    logout: '/logout'
};

let currentUserId = null;
let isAdmin = false;
let allUsersList = [];

async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id ? parseInt(id) : null;
}

async function loadUserById(userId) {
    const response = await fetch(`/api/admin/users/${userId}`);
    if (!response.ok) throw new Error('Ошибка получения данных пользователя');
    return await response.json();
}

async function loadCurrentUser() {
    const user = await fetchData(API.currentUser);
    if (user) {
        currentUserId = user.id;
        isAdmin = user.roles.some(role => {
            const roleName = role.name || role;
            return roleName === 'ADMIN' || roleName === 'ROLE_ADMIN';
        });
        return user;
    }
    return null;
}

async function loadAllUsers() {
    const users = await fetchData(API.allUsers);
    if (users) {
        allUsersList = users;
        return users;
    }
    return [];
}

async function loadUserData() {
    try {
        const currentUser = await loadCurrentUser();
        if (!currentUser) {
            console.error('Не удалось загрузить текущего пользователя');
            return;
        }

        if (isAdmin) {
            await loadAllUsers();
        }

        const targetUserId = getUserIdFromUrl();
        let userToShow;

        if (targetUserId) {
            userToShow = await loadUserById(targetUserId);
        } else {
            userToShow = currentUser;
        }

        if (!userToShow) {
            console.error('Пользователь для отображения не найден');
            return;
        }

        updateUserInfo(userToShow);
        renderUserTable(userToShow);

        if (isAdmin) {
            renderSidebarForAdmin(allUsersList);
        } else {
            renderSidebarForUser(userToShow);
        }

    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

function updateUserInfo(user) {
    const userInfo = document.getElementById('userInfo');
    const rolesString = user.roles ? user.roles.map(r => r.name || r).join(', ') : '';
    userInfo.innerHTML = `
        <strong>${user.username}</strong>
        <span class="ms-1">with roles: ${rolesString}</span>
    `;
}

function renderUserTable(user) {
    const tableBody = document.getElementById('userTableBody');
    const rolesString = user.roles ? user.roles.map(r => r.name || r).join(', ') : '';
    tableBody.innerHTML = `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.age}</td>
            <td>${rolesString}</td>
        </tr>
    `;
}

// ====== Сайдбар для админа ======
function renderSidebarForAdmin(users) {
    const sidebarList = document.getElementById('sidebarUserList');
    sidebarList.innerHTML = users.map(user => {
        const activeClass = (user.id === currentUserId) ? 'sidebar-user-active' : '';
        const textClass = (user.id === currentUserId) ? 'text-white' : 'text-dark';
        return `
            <li class="list-group-item ${activeClass}" style="cursor: pointer;">
                <span class="text-decoration-none ${textClass} sidebar-link" data-id="${user.id}" style="display:block; width:100%; cursor:pointer;">
                    ${user.username}
                </span>
            </li>
        `;
    }).join('');

    sidebarList.removeEventListener('click', sidebarClickHandler);
    sidebarList.addEventListener('click', sidebarClickHandler);
}

async function sidebarClickHandler(e) {
    const link = e.target.closest('.sidebar-link');
    if (!link) return;

    const userId = parseInt(link.dataset.id);
    if (isNaN(userId)) return;

    if (userId === currentUserId) {
        location.assign('/admin');
        return;
    }

    await switchToUser(userId);
}

async function switchToUser(userId) {
    if (!isAdmin) return;

    try {
        window.history.pushState({ path: `/user?id=${userId}` }, '', `/user?id=${userId}`);

        const user = await loadUserById(userId);
        if (!user) {
            console.error('Пользователь не найден');
            return;
        }

        updateUserInfo(user);
        renderUserTable(user);
        currentUserId = userId;

        renderSidebarForAdmin(allUsersList);

    } catch (error) {
        console.error('Ошибка при переключении:', error);
    }
}

// ====== Сайдбар для обычного пользователя ======
function renderSidebarForUser(user) {
    const sidebarList = document.getElementById('sidebarUserList');
    sidebarList.innerHTML = `
        <li class="list-group-item sidebar-user-active">
            <span class="text-white">${user.username}</span>
        </li>
    `;
}

document.getElementById('logoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    fetch(API.logout, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(() => {
        window.location.href = '/login';
    });
});

window.addEventListener('popstate', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        const user = await loadUserById(parseInt(id));
        if (user) {
            updateUserInfo(user);
            renderUserTable(user);
            currentUserId = parseInt(id);
            if (isAdmin) {
                renderSidebarForAdmin(allUsersList);
            }
        }
    } else {
        const currentUser = await loadCurrentUser();
        if (currentUser) {
            updateUserInfo(currentUser);
            renderUserTable(currentUser);
            currentUserId = currentUser.id;
            if (isAdmin) {
                renderSidebarForAdmin(allUsersList);
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    await loadUserData();
});
// Конфигурация
const API_BASE = '/api';
const ADMIN_API = `${API_BASE}/admin`;
const USER_API = `${API_BASE}/user`;


// Глобальные переменные
let currentUser = null;
let allRoles = [];
let allUsers = [];

// Основная функция инициализации
$(document).ready(function() {
    console.log('Admin panel loading...');
    initializePage();
});


async function initializePage() {
    try {
        // 1. Загружаем текущего пользователя
        await loadCurrentUser();

        // 2. Загружаем роли и пользователей
        await Promise.all([
            loadRoles(),
            loadUsers()
        ]);

        // 3. Инициализируем вкладки
        initializeTabs();

        // 4. Настраиваем обработчики событий
        setupEventListeners();

        console.log('Page initialized successfully');

    } catch (error) {
        console.error('Error initializing page:', error);
    }
}


// Загрузка текущего пользователя
async function loadCurrentUser() {
    try {
        const response = await fetch(`${USER_API}/info`);

        if (response.ok) {
            currentUser = await response.json();
            updateUserInfoHeader();
            renderCurrentUserInfo();
        }
    } catch (error) {
        console.error('Error loading current user:', error);
    }
}

// Обновление информации в хедере
function updateUserInfoHeader() {
    if (currentUser) {
        const roles = currentUser.roles ?
            currentUser.roles.map(r => r.name).join(', ') :
            'Loading...';

        $('#currentUserInfo').html(`
            ${currentUser.email} with roles: ${roles}
        `);
    }
}

// Загрузка ролей
async function loadRoles() {
    try {
        const response = await fetch(`${ADMIN_API}/roles`);

        if (response.ok) {
            allRoles = await response.json();
            populateRoleSelects();
        }
    } catch (error) {
        console.error('Error loading roles:', error);
    }
}

// Загрузка пользователей
async function loadUsers() {
    try {
        const response = await fetch(`${ADMIN_API}/users`);

        if (response.ok) {
            const data = await response.json();
            allUsers = data.users || [];
            renderUsersTable();
        }
    } catch (error) {
        console.error('Error loading users:', error);
        $('#usersTableContainer').html(`
            <div class="alert alert-danger">
                Error loading users: ${error.message}
            </div>
        `);
    }
}

// Заполнение селектов с ролями
function populateRoleSelects() {
    if (allRoles.length === 0) return;

    const roleOptions = allRoles.map(role =>
        `<option value="${role.name}">${role.name}</option>`
    ).join('');

    $('#rolesSelectCreate').html(roleOptions);
    $('#rolesSelectEdit').html(roleOptions);
    $('#deleteUserRoles').html(roleOptions);
}

// Рендеринг таблицы пользователей с ОТДЕЛЬНЫМИ колонками для Edit и Delete
function renderUsersTable() {
    if (!allUsers || allUsers.length === 0) {
        $('#usersTableContainer').html(`
            <div class="alert alert-info">
                No users found. Create the first user.
            </div>
        `);
        return;
    }

    const tableHtml = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    ${allUsers.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.firstName}</td>
                            <td>${user.lastName}</td>
                            <td>${user.age}</td>
                            <td>${user.email}</td>
                            <td>${user.roles ? user.roles.map(r => r.name).join(', ') : ''}</td>
                            <td class="text-center">
                                <button class="btn btn-edit btn-sm edit-user-btn" 
                                        data-user-id="${user.id}">
                                    Edit
                                </button>
                            </td>
                            <td class="text-center">
                                <button class="btn btn-danger btn-sm delete-user-btn" 
                                        data-user-id="${user.id}"
                                        data-user-firstname="${user.firstName}"
                                        data-user-lastname="${user.lastName}"
                                        data-user-age="${user.age}"
                                        data-user-email="${user.email}"
                                        data-user-roles="${user.roles ? user.roles.map(r => r.name).join(',') : ''}">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    $('#usersTableContainer').html(tableHtml);
}
// Рендеринг информации о текущем пользователе для вкладки User
function renderCurrentUserInfo() {
    if (!currentUser) {
        $('#currentUserTableContainer').html(`
            <div class="alert alert-warning">
                User information not available
            </div>
        `);
        return;
    }

    const userInfoHtml = `
        <h3 class="h4 mb-3">About user</h3>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Email</th>
                        <th>Roles</th>
                    </tr>
                </thead>
                <tbody>
                    ${allUsers.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.firstName}</td>
                            <td>${user.lastName}</td>
                            <td>${user.age}</td>
                            <td>${user.email}</td>
                            <td>${user.roles ? user.roles.map(r => r.name).join(', ') : ''}</td>
                        
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    $('#currentUserTableContainer').html(userInfoHtml);
}

// Инициализация вкладок и навигации
function initializeTabs() {
    // Сначала устанавливаем начальное состояние
    $('#adminLink').addClass('active');
    $('#userLink').removeClass('active');
    $('#admin-content').show();
    $('#user-content').hide();

    // Вкладка "Users table"
    $('#users-tab').off('click').on('click', function(e) {
        e.preventDefault();
        activateTab('users-tab', 'usersTab');
    });

    // Вкладка "New User"
    $('#new-user-tab').off('click').on('click', function(e) {
        e.preventDefault();
        activateTab('new-user-tab', 'newUserTab');
    });

    // Ссылка "Admin" в сайдбаре
    $('#adminLink').off('click').on('click', function(e) {
        e.preventDefault();
        switchToAdminView();
    });

    // Ссылка "User" в сайдбаре
    $('#userLink').off('click').on('click', function(e) {
        e.preventDefault();
        switchToUserView();
    });

    // Активируем первую вкладку в админке
    activateTab('users-tab', 'usersTab');
}

// Активация вкладки
function activateTab(tabId, paneId) {
    // Деактивируем все табы
    $('#adminTabs .nav-link').removeClass('active');
    $('.tab-pane').removeClass('show active');

    // Активируем выбранную вкладку
    $(`#${tabId}`).addClass('active');
    $(`#${paneId}`).addClass('show active');
}

// Переключение на админ панель
function switchToAdminView() {
    // Обновляем навигацию в сайдбаре
    $('#adminLink').addClass('active');
    $('#userLink').removeClass('active');

    // Показываем админ контент, скрываем пользовательский
    $('#admin-content').show();
    $('#user-content').hide();

    // Активируем первую вкладку в админке
    activateTab('users-tab', 'usersTab');
}

// Переключение на пользовательскую информацию
function switchToUserView() {
    // Обновляем навигацию в сайдбаре
    $('#userLink').addClass('active');
    $('#adminLink').removeClass('active');

    // Показываем пользовательский контент, скрываем админ
    $('#user-content').show();
    $('#admin-content').hide();

    // Обновляем информацию о пользователе (на случай, если данные изменились)
    renderCurrentUserInfo();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Создание пользователя
    $('#createUserForm').off('submit').on('submit', async function(e) {
        e.preventDefault();

        const formData = {
            user: {
                firstName: $(this).find('[name="firstName"]').val(),
                lastName: $(this).find('[name="lastName"]').val(),
                age: parseInt($(this).find('[name="age"]').val()),
                email: $(this).find('[name="email"]').val(),
                password: $(this).find('[name="password"]').val()
            },
            selectedRoles: Array.from($(this).find('[name="selectedRoles"]').val() || [])
        };

        try {
            const response = await fetch(`${ADMIN_API}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showAlert('success', 'User created successfully');
                $(this)[0].reset();
                await loadUsers();
                activateTab('users-tab', 'usersTab');
            } else {
                const error = await response.text();
                showAlert('danger', error || 'Error creating user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            showAlert('danger', 'Error creating user');
        }
    });

    // Редактирование пользователя
    $(document).off('click', '.edit-user-btn').on('click', '.edit-user-btn', function() {
        const userId = $(this).data('user-id');
        openEditModal(userId);
    });

    // Удаление пользователя
    $(document).off('click', '.delete-user-btn').on('click', '.delete-user-btn', function() {
        const userId = $(this).data('user-id');
        const userFirstName = $(this).data('user-firstname');
        const userLastName = $(this).data('user-lastname');
        const userAge = $(this).data('user-age');
        const userEmail = $(this).data('user-email');
        const userRolesStr = $(this).data('user-roles');

        openDeleteModal(userId, userFirstName, userLastName, userAge, userEmail, userRolesStr);
    });

    // Редактирование пользователя (форма)
    $('#editUserForm').off('submit').on('submit', async function(e) {
        e.preventDefault();

        const userId = $(this).find('[name="id"]').val();
        const formData = {
            user: {
                firstName: $(this).find('[name="firstName"]').val(),
                lastName: $(this).find('[name="lastName"]').val(),
                age: parseInt($(this).find('[name="age"]').val()),
                email: $(this).find('[name="email"]').val()
            },
            selectedRoles: Array.from($(this).find('[name="selectedRoles"]').val() || [])
        };

        const password = $(this).find('[name="password"]').val();
        if (password && password.trim() !== '') {
            formData.user.password = password;
        }

        try {
            const response = await fetch(`${ADMIN_API}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showAlert('success', 'User updated successfully');
                $('#editUserModal').modal('hide');
                await loadUsers();
                // Обновляем информацию о текущем пользователе, если это он
                if (currentUser && currentUser.id === userId) {
                    await loadCurrentUser();
                }
            } else {
                const error = await response.text();
                showAlert('danger', error || 'Error updating user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showAlert('danger', 'Error updating user');
        }
    });

    // Подтверждение удаления
    $('#confirmDeleteBtn').off('click').on('click', async function() {
        const userId = $('#deleteUserIdField').val();

        try {
            const response = await fetch(`${ADMIN_API}/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('success', 'User deleted successfully');
                $('#deleteUserModal').modal('hide');
                await loadUsers();
            } else {
                const error = await response.text();
                showAlert('danger', error || 'Error deleting user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showAlert('danger', 'Error deleting user');
        }
    });

    // Выход из системы
    $('#logoutForm').off('submit').on('submit', function(e) {
        e.preventDefault();
        window.location.href = '/logout';
    });
}

// Открытие модального окна редактирования
async function openEditModal(userId) {
    try {
        const response = await fetch(`${ADMIN_API}/users/${userId}`);

        if (response.ok) {
            const user = await response.json();

            // Заполняем форму
            $('#editUserForm [name="id"]').val(user.id);
            $('#editUserForm [name="firstName"]').val(user.firstName);
            $('#editUserForm [name="lastName"]').val(user.lastName);
            $('#editUserForm [name="age"]').val(user.age);
            $('#editUserForm [name="email"]').val(user.email);
            $('#editUserForm [name="password"]').val('');

            // Устанавливаем выбранные роли
            const userRoles = user.roles ? user.roles.map(r => r.name) : [];
            $('#editUserForm [name="selectedRoles"]').val(userRoles);

            // Показываем модальное окно
            $('#editUserModal').modal('show');
        }
    } catch (error) {
        console.error('Error loading user for edit:', error);
    }
}

// Открытие модального окна удаления с ЗАПОЛНЕННЫМИ полями
function openDeleteModal(userId, firstName, lastName, age, email, rolesStr) {
    // Заполняем все поля
    $('#deleteUserIdField').val(userId);
    $('#deleteUserFirstName').val(firstName);
    $('#deleteUserLastName').val(lastName);
    $('#deleteUserAge').val(age);
    $('#deleteUserEmail').val(email);

    // Устанавливаем роли (разделенные запятой)
    const userRoles = rolesStr ? rolesStr.split(',') : [];
    $('#deleteUserRoles').val(userRoles);

    // Показываем модальное окно
    $('#deleteUserModal').modal('show');
}

class App {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.users = [];
        this.roles = [];

        this.setupTableEvents = this.setupTableEvents.bind(this);
        this.openEditModal = this.openEditModal.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.fillEditModal = this.fillEditModal.bind(this);
        this.fillDeleteModal = this.fillDeleteModal.bind(this);
    }

    async init() {
        console.log('App initializing...');
        try {
            await this.loadCurrentUser();
            console.log('Current user loaded, isAdmin:', this.isAdmin);

            const path = window.location.pathname;
            console.log('Current path:', path);

            if (path.includes('/admin')) {
                await this.initAdminPage();
            } else if (path.includes('/user')) {
                this.initUserPage();
            }
        } catch (error) {
            console.error('App init error:', error);
            this.showError('Application initialization failed');
        }
    }

    async loadCurrentUser() {
        try {
            console.log('Loading current user...');
            const response = await fetch('/api/user/info');
            if (response.ok) {
                this.currentUser = await response.json();
                this.isAdmin = this.currentUser.roles.some(role => role.name === 'ADMIN');
                this.updateUserInfo();
                this.updateNavigation();
            } else {
                console.error('Failed to load user, status:', response.status);
                if (response.status === 401 || response.status === 403) {
                    window.location.href = '/login';
                }
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            const roles = this.currentUser.roles.map(r => r.name).join(', ');
            const userInfoElement = document.getElementById('currentUserInfo');
            if (userInfoElement) {
                userInfoElement.innerHTML = `${this.currentUser.email} with roles: ${roles}`;
            }
        }
    }

    updateNavigation() {
        // Обновляем навигацию в зависимости от роли
        const adminLink = document.getElementById('adminLink');
        const userLink = document.getElementById('userLink');

        if (adminLink && userLink) {
            // Мы на странице админа - показываем обе кнопки
            const currentPath = window.location.pathname;

            if (currentPath.includes('/admin')) {
                adminLink.classList.add('active');
                userLink.classList.remove('active');
            } else if (currentPath.includes('/user')) {
                adminLink.classList.remove('active');
                userLink.classList.add('active');
            }

            // Показываем обе кнопки только если пользователь админ
            if (!this.isAdmin) {
                adminLink.style.display = 'none';
            }
        }
    }

    async initAdminPage() {
        console.log('Initializing admin page...');

        // Проверяем права доступа
        if (!this.isAdmin) {
            console.log('User is not admin, redirecting to user page...');
            window.location.href = '/user';
            return;
        }

        try {
            await this.loadRoles();
            await this.loadUsers();
            this.setupAdminEventListeners();
            this.renderAdminPage();
        } catch (error) {
            console.error('Admin page init error:', error);
            this.showError('Failed to initialize admin page');
        }
    }

    initUserPage() {
        console.log('Initializing user page...');
        this.renderUserPage();
        this.setupUserEventListeners();

        // Если админ на странице пользователя, показываем обе кнопки в навигации
        if (this.isAdmin) {
            this.showAdminNavigationOnUserPage();
        }
    }

    showAdminNavigationOnUserPage() {
        // Создаем навигацию для админа на странице пользователя
        const sidebar = document.querySelector('.sidebar .nav');
        if (sidebar) {
            // Проверяем, есть ли уже кнопка Admin
            let adminLinkExists = false;
            const links = sidebar.querySelectorAll('.nav-link');
            links.forEach(link => {
                if (link.textContent.includes('Admin')) {
                    adminLinkExists = true;
                }
            });

            // Если кнопки Admin нет, добавляем ее
            if (!adminLinkExists) {
                const adminLi = document.createElement('li');
                adminLi.className = 'nav-item';
                adminLi.innerHTML = `
                    <a class="nav-link" href="/admin" id="adminLinkOnUserPage">
                        <strong>Admin</strong>
                    </a>
                `;

                // Находим текущую кнопку User и вставляем перед ней
                const userLink = sidebar.querySelector('.nav-link[href="#"]');
                if (userLink && userLink.parentElement) {
                    sidebar.insertBefore(adminLi, userLink.parentElement);
                }

                // Делаем кнопку User активной
                const currentUserLink = document.querySelector('.nav-link[href="#"]');
                if (currentUserLink) {
                    currentUserLink.classList.add('active');
                }

                // Добавляем обработчик для новой кнопки
                $('#adminLinkOnUserPage').off('click').on('click', (e) => {
                    e.preventDefault();
                    window.location.href = '/admin';
                });
            }
        }
    }

    async loadRoles() {
        try {
            console.log('Loading roles...');
            const response = await fetch('/api/admin/roles');
            if (response.ok) {
                this.roles = await response.json();
                console.log('Roles loaded:', this.roles.length);
                this.populateRoleSelects();
            }
        } catch (error) {
            console.error('Failed to load roles:', error);
        }
    }

    async loadUsers() {
        try {
            console.log('Loading users...');
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                this.users = data.users || [];
                console.log('Users loaded:', this.users.length);
                this.renderUsersTable();
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            this.showError('Failed to load users: ' + error.message);
        }
    }

    populateRoleSelects() {
        if (this.roles.length === 0) return;

        const roleOptions = this.roles.map(role =>
            `<option value="${role.name}">${role.name}</option>`
        ).join('');

        const selects = ['rolesSelectCreate', 'rolesSelectEdit', 'deleteUserRoles'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.innerHTML = roleOptions;
            }
        });
    }

    renderUsersTable() {
        const container = document.getElementById('usersTableContainer');
        if (!container) return;

        if (this.users.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    No users found. Create the first user.
                </div>
            `;
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
                        ${this.users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.firstName}</td>
                                <td>${user.lastName}</td>
                                <td>${user.age}</td>
                                <td>${user.email}</td>
                                <td>${user.roles.map(r => r.name).join(', ')}</td>
                                <td class="text-center">
                                    <button class="btn btn-edit btn-sm edit-user-btn" 
                                            data-user-id="${user.id}">
                                        Edit
                                    </button>
                                </td>
                                <td class="text-center">
                                    <button class="btn btn-danger btn-sm delete-user-btn" 
                                            data-user-id="${user.id}">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHtml;
        this.setupTableEvents();

        // Скрываем спиннер загрузки
        const spinner = container.querySelector('.spinner-border');
        const loadingText = container.querySelector('.visually-hidden');
        if (spinner) spinner.style.display = 'none';
        if (loadingText) loadingText.style.display = 'none';
    }

    setupTableEvents() {
        console.log('Setting up table events...');

        // Удаляем старые обработчики и добавляем новые с правильным контекстом
        $(document).off('click', '.edit-user-btn').on('click', '.edit-user-btn', (e) => {
            console.log('Edit button clicked');
            const userId = $(e.currentTarget).data('user-id');
            console.log('User ID:', userId);
            this.openEditModal(userId);
        });

        $(document).off('click', '.delete-user-btn').on('click', '.delete-user-btn', (e) => {
            console.log('Delete button clicked');
            const userId = $(e.currentTarget).data('user-id');
            console.log('User ID:', userId);
            this.openDeleteModal(userId);
        });
    }

    setupAdminEventListeners() {
        console.log('Setting up admin event listeners...');

        // Создание пользователя
        $('#createUserForm').off('submit').on('submit', async (e) => {
            e.preventDefault();
            await this.createUser();
        });

        // Редактирование пользователя
        $('#editUserForm').off('submit').on('submit', async (e) => {
            e.preventDefault();
            await this.updateUser();
        });

        // Удаление пользователя
        $('#confirmDeleteBtn').off('click').on('click', async () => {
            await this.deleteUser();
        });

        // Табы
        $('#users-tab').off('click').on('click', (e) => {
            e.preventDefault();
            this.activateTab('users-tab', 'usersTab');
        });

        $('#new-user-tab').off('click').on('click', (e) => {
            e.preventDefault();
            this.activateTab('new-user-tab', 'newUserTab');
        });

        // Навигация между страницами
        $('#adminLink').off('click').on('click', (e) => {
            e.preventDefault();
            window.location.href = '/admin';
        });

        $('#userLink').off('click').on('click', (e) => {
            e.preventDefault();
            window.location.href = '/user';
        });

        // Выход
        $('#logoutForm').off('submit').on('submit', (e) => {
            e.preventDefault();
            window.location.href = '/logout';
        });
    }

    setupUserEventListeners() {
        console.log('Setting up user event listeners...');

        // Навигация для админа на странице пользователя
        if (this.isAdmin) {
            $(document).off('click', '#adminLinkOnUserPage').on('click', '#adminLinkOnUserPage', (e) => {
                e.preventDefault();
                window.location.href = '/admin';
            });
        }

        $('#logoutForm').off('submit').on('submit', (e) => {
            e.preventDefault();
            window.location.href = '/logout';
        });
    }
    async openEditModal(userId) {
        console.log('Opening edit modal for user:', userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            if (response.ok) {
                const user = await response.json();
                console.log('User data loaded for edit:', user);
                this.fillEditModal(user);
                $('#editUserModal').modal('show');
            } else {
                const errorData = await response.json();
                console.error('Failed to load user for edit:', errorData);
                this.showError(errorData.error || 'Failed to load user data');
            }
        } catch (error) {
            console.error('Failed to open edit modal:', error);
            this.showError('Failed to load user data: ' + error.message);
        }
    }

    fillEditModal(user) {
        console.log('Filling edit modal with user:', user);
        $('#editUserForm [name="id"]').val(user.id);
        $('#editUserForm [name="firstName"]').val(user.firstName);
        $('#editUserForm [name="lastName"]').val(user.lastName);
        $('#editUserForm [name="age"]').val(user.age);
        $('#editUserForm [name="email"]').val(user.email);
        $('#editUserForm [name="password"]').val('');

        const userRoles = user.roles ? user.roles.map(r => r.name) : [];
        console.log('User roles for select:', userRoles);
        $('#editUserForm [name="selectedRoles"]').val(userRoles);
    }

    async openDeleteModal(userId) {
        console.log('Opening delete modal for user:', userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            if (response.ok) {
                const user = await response.json();
                console.log('User data loaded for delete:', user);
                this.fillDeleteModal(user);
                $('#deleteUserModal').modal('show');
            } else {
                const errorData = await response.json();
                console.error('Failed to load user for delete:', errorData);
                this.showError(errorData.error || 'Failed to load user data');
            }
        } catch (error) {
            console.error('Failed to open delete modal:', error);
            this.showError('Failed to load user data: ' + error.message);
        }
    }

    fillDeleteModal(user) {
        console.log('Filling delete modal with user:', user);
        $('#deleteUserIdField').val(user.id);
        $('#deleteUserFirstName').val(user.firstName);
        $('#deleteUserLastName').val(user.lastName);
        $('#deleteUserAge').val(user.age);
        $('#deleteUserEmail').val(user.email);

        const userRoles = user.roles ? user.roles.map(r => r.name) : [];
        console.log('User roles for delete select:', userRoles);
        $('#deleteUserRoles').val(userRoles);
    }


    async createUser() {
        const formData = {
            firstName: $('#createUserForm [name="firstName"]').val(),
            lastName: $('#createUserForm [name="lastName"]').val(),
            age: $('#createUserForm [name="age"]').val(),
            email: $('#createUserForm [name="email"]').val(),
            password: $('#createUserForm [name="password"]').val(),
            roles: $('#createUserForm [name="selectedRoles"]').val()
        };

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                $('#createUserForm')[0].reset();
                await this.loadUsers();
                this.activateTab('users-tab', 'usersTab');
            } else {
                this.showError(result.error || 'Failed to create user');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async updateUser() {
        const userId = $('#editUserForm [name="id"]').val();
        const formData = {
            firstName: $('#editUserForm [name="firstName"]').val(),
            lastName: $('#editUserForm [name="lastName"]').val(),
            age: $('#editUserForm [name="age"]').val(),
            email: $('#editUserForm [name="email"]').val(),
            password: $('#editUserForm [name="password"]').val(),
            roles: $('#editUserForm [name="selectedRoles"]').val()
        };

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                $('#editUserModal').modal('hide');
                await this.loadUsers();

                if (this.currentUser && this.currentUser.id == userId) {
                    await this.loadCurrentUser();
                }

            } else {
                this.showError(result.error || 'Failed to update user');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async deleteUser() {
        const userId = $('#deleteUserIdField').val();

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                $('#deleteUserModal').modal('hide');
                await this.loadUsers();
            } else {
                this.showError(result.error || 'Failed to delete user');
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    activateTab(tabId, paneId) {
        $('#adminTabs .nav-link').removeClass('active');
        $('.tab-pane').removeClass('show active');
        $(`#${tabId}`).addClass('active');
        $(`#${paneId}`).addClass('show active');
    }

    renderAdminPage() {
        console.log('Rendering admin page...');
        this.renderUsersTable();
        this.activateTab('users-tab', 'usersTab');
        this.updateNavigation();

        // Скрываем спиннеры загрузки
        this.hideLoadingSpinners();
    }

    renderUserPage() {
        console.log('Rendering user page...');

        // Если мы на странице админа, но переключились на пользовательский контент
        const userContent = document.getElementById('user-content');
        const adminContent = document.getElementById('admin-content');
        const userInfoContainer = document.getElementById('userInfoContainer') ||
            document.getElementById('currentUserTableContainer');

        if (userInfoContainer && this.currentUser) {
            const userInfoHtml = `
                <div class="user-info-card">
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
                                <tr>
                                    <td>${this.currentUser.id}</td>
                                    <td>${this.currentUser.firstName}</td>
                                    <td>${this.currentUser.lastName}</td>
                                    <td>${this.currentUser.age}</td>
                                    <td>${this.currentUser.email}</td>
                                    <td>${this.currentUser.roles.map(r => r.name).join(', ')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            userInfoContainer.innerHTML = userInfoHtml;
        }

        // Скрываем спиннеры загрузки
        this.hideLoadingSpinners();
    }

    hideLoadingSpinners() {
        const spinners = document.querySelectorAll('.spinner-border');
        spinners.forEach(spinner => {
            spinner.style.display = 'none';
            const parent = spinner.parentElement;
            if (parent && parent.querySelector('p')) {
                parent.querySelector('p').style.display = 'none';
            }
        });
    }
}

// Инициализация при полной загрузке DOM
$(document).ready(function() {
    console.log('Document ready, initializing app...');
    window.app = new App();
    window.app.init().catch(error => {
        console.error('App initialization failed:', error);
    });
});
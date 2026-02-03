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
        const adminLink = document.getElementById('adminLink');
        const userLink = document.getElementById('userLink');

        if (adminLink && userLink) {
            const currentPath = window.location.pathname;

            if (currentPath.includes('/admin')) {
                adminLink.classList.add('active');
                userLink.classList.remove('active');
            } else if (currentPath.includes('/user')) {
                adminLink.classList.remove('active');
                userLink.classList.add('active');
            }

            if (!this.isAdmin) {
                adminLink.style.display = 'none';
            }
        }
    }

    async initAdminPage() {
        console.log('Initializing admin page...');

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
        }
    }

    initUserPage() {
        console.log('Initializing user page...');
        this.renderUserPage();
        this.setupUserEventListeners();

        if (this.isAdmin) {
            this.showAdminNavigationOnUserPage();
        }
    }

    showAdminNavigationOnUserPage() {
        const sidebar = document.querySelector('.sidebar .nav');
        if (sidebar) {
            let adminLinkExists = false;
            const links = sidebar.querySelectorAll('.nav-link');
            links.forEach(link => {
                if (link.textContent.includes('Admin')) {
                    adminLinkExists = true;
                }
            });

            if (!adminLinkExists) {
                const adminLi = document.createElement('li');
                adminLi.className = 'nav-item';
                adminLi.innerHTML = `
                    <a class="nav-link" href="/admin" id="adminLinkOnUserPage">
                        <strong>Admin</strong>
                    </a>
                `;

                const userLink = sidebar.querySelector('.nav-link[href="#"]');
                if (userLink && userLink.parentElement) {
                    sidebar.insertBefore(adminLi, userLink.parentElement);
                }

                const currentUserLink = document.querySelector('.nav-link[href="#"]');
                if (currentUserLink) {
                    currentUserLink.classList.add('active');
                }

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

        container.innerHTML = `
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
        this.setupTableEvents();

        const spinner = container.querySelector('.spinner-border');
        const loadingText = container.querySelector('.visually-hidden');
        if (spinner) spinner.style.display = 'none';
        if (loadingText) loadingText.style.display = 'none';
    }

    setupTableEvents() {
        console.log('Setting up table events...');

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

        $('#createUserForm').off('submit').on('submit', async (e) => {
            e.preventDefault();
            await this.createUser();
        });

        $('#editUserForm').off('submit').on('submit', async (e) => {
            e.preventDefault();
            await this.updateUser();
        });

        $('#confirmDeleteBtn').off('click').on('click', async () => {
            await this.deleteUser();
        });

        $('#users-tab').off('click').on('click', (e) => {
            e.preventDefault();
            this.activateTab('users-tab', 'usersTab');
        });

        $('#new-user-tab').off('click').on('click', (e) => {
            e.preventDefault();
            this.activateTab('new-user-tab', 'newUserTab');
        });

        $('#adminLink').off('click').on('click', (e) => {
            e.preventDefault();
            window.location.href = '/admin';
        });

        $('#userLink').off('click').on('click', (e) => {
            e.preventDefault();
            window.location.href = '/user';
        });

        $('#logoutForm').off('submit').on('submit', (e) => {
            e.preventDefault();
            window.location.href = '/logout';
        });
    }

    setupUserEventListeners() {
        console.log('Setting up user event listeners...');

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
            }
        } catch (error) {
            console.error('Failed to open edit modal:', error);
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
            }
        } catch (error) {
            console.error('Failed to open delete modal:', error);
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

            if (response.ok) {
                $('#createUserForm')[0].reset();
                await this.loadUsers();
                this.activateTab('users-tab', 'usersTab');
            } else {
                console.log('Failed to create user');
            }
        } catch (error) {
            console.log('Error');
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

            if (response.ok) {
                $('#editUserModal').modal('hide');
                await this.loadUsers();

                if (this.currentUser && this.currentUser.id === userId) {
                    await this.loadCurrentUser();
                }

            } else {
                console.log('Failed to update user');
            }
        } catch (error) {
            console.log('Error');
        }
    }

    async deleteUser() {
        const userId = $('#deleteUserIdField').val();

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                $('#deleteUserModal').modal('hide');
                await this.loadUsers();
            } else {
                console.log('Failed to delete user');
            }
        } catch (error) {
            console.log('Error');
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

        this.hideLoadingSpinners();
    }

    renderUserPage() {
        console.log('Rendering user page...');
        const userInfoContainer = document.getElementById('userInfoContainer') ||
            document.getElementById('currentUserTableContainer');

        if (userInfoContainer && this.currentUser) {
            userInfoContainer.innerHTML = `
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
        }

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

$(document).ready(function() {
    console.log('Document ready, initializing app...');
    window.app = new App();
    window.app.init().catch(error => {
        console.error('App initialization failed:', error);
    });
});
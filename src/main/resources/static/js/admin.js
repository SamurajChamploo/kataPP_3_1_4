const API_BASE = '/api';
const ADMIN_API = `${API_BASE}/admin`;
const USER_API = `${API_BASE}/user`;

let currentUser = null;
let allRoles = [];
let allUsers = [];

$(document).ready(function() {
    console.log('Admin panel loading...');
    initializePage();
});

async function initializePage() {
    try {
        await loadCurrentUser();

        await Promise.all([
            loadRoles(),
            loadUsers()
        ]);

        initializeTabs();

        setupEventListeners();

        console.log('Page initialized successfully');

    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

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

function populateRoleSelects() {
    if (allRoles.length === 0) return;

    const roleOptions = allRoles.map(role =>
        `<option value="${role.name}">${role.name}</option>`
    ).join('');

    $('#rolesSelectCreate').html(roleOptions);
    $('#rolesSelectEdit').html(roleOptions);
    $('#deleteUserRoles').html(roleOptions);
}

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

function initializeTabs() {
    $('#adminLink').addClass('active');
    $('#userLink').removeClass('active');
    $('#admin-content').show();
    $('#user-content').hide();

    $('#users-tab').off('click').on('click', function(e) {
        e.preventDefault();
        activateTab('users-tab', 'usersTab');
    });

    $('#new-user-tab').off('click').on('click', function(e) {
        e.preventDefault();
        activateTab('new-user-tab', 'newUserTab');
    });

    $('#adminLink').off('click').on('click', function(e) {
        e.preventDefault();
        switchToAdminView();
    });

    $('#userLink').off('click').on('click', function(e) {
        e.preventDefault();
        switchToUserView();
    });

    activateTab('users-tab', 'usersTab');
}

function activateTab(tabId, paneId) {
    $('#adminTabs .nav-link').removeClass('active');
    $('.tab-pane').removeClass('show active');
    $(`#${tabId}`).addClass('active');
    $(`#${paneId}`).addClass('show active');
}

function switchToAdminView() {
    $('#adminLink').addClass('active');
    $('#userLink').removeClass('active');
    $('#admin-content').show();
    $('#user-content').hide();
    activateTab('users-tab', 'usersTab');
}

function switchToUserView() {
    $('#userLink').addClass('active');
    $('#adminLink').removeClass('active');
    $('#user-content').show();
    $('#admin-content').hide();
    renderCurrentUserInfo();
}

function setupEventListeners() {
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
                $(this)[0].reset();
                await loadUsers();
                activateTab('users-tab', 'usersTab');
            } else {
                const error = await response.text();
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    });

    $(document).off('click', '.edit-user-btn').on('click', '.edit-user-btn', function() {
        const userId = $(this).data('user-id');
        openEditModal(userId);
    });

    $(document).off('click', '.delete-user-btn').on('click', '.delete-user-btn', function() {
        const userId = $(this).data('user-id');
        const userFirstName = $(this).data('user-firstname');
        const userLastName = $(this).data('user-lastname');
        const userAge = $(this).data('user-age');
        const userEmail = $(this).data('user-email');
        const userRolesStr = $(this).data('user-roles');

        openDeleteModal(userId, userFirstName, userLastName, userAge, userEmail, userRolesStr);
    });

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
                $('#editUserModal').modal('hide');
                await loadUsers();
                if (currentUser && currentUser.id === userId) {
                    await loadCurrentUser();
                }
            } else {
                const error = await response.text();
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    });

    $('#confirmDeleteBtn').off('click').on('click', async function() {
        const userId = $('#deleteUserIdField').val();

        try {
            const response = await fetch(`${ADMIN_API}/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                $('#deleteUserModal').modal('hide');
                await loadUsers();
            } else {
                const error = await response.text();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    });

    $('#logoutForm').off('submit').on('submit', function(e) {
        e.preventDefault();
        window.location.href = '/logout';
    });
}

async function openEditModal(userId) {
    try {
        const response = await fetch(`${ADMIN_API}/users/${userId}`);
        if (response.ok) {
            const user = await response.json();
            $('#editUserForm [name="id"]').val(user.id);
            $('#editUserForm [name="firstName"]').val(user.firstName);
            $('#editUserForm [name="lastName"]').val(user.lastName);
            $('#editUserForm [name="age"]').val(user.age);
            $('#editUserForm [name="email"]').val(user.email);
            $('#editUserForm [name="password"]').val('');
            const userRoles = user.roles ? user.roles.map(r => r.name) : [];
            $('#editUserForm [name="selectedRoles"]').val(userRoles);
            $('#editUserModal').modal('show');
        }
    } catch (error) {
        console.error('Error loading user for edit:', error);
    }
}

function openDeleteModal(userId, firstName, lastName, age, email, rolesStr) {
    $('#deleteUserIdField').val(userId);
    $('#deleteUserFirstName').val(firstName);
    $('#deleteUserLastName').val(lastName);
    $('#deleteUserAge').val(age);
    $('#deleteUserEmail').val(email);
    const userRoles = rolesStr ? rolesStr.split(',') : [];
    $('#deleteUserRoles').val(userRoles);
    $('#deleteUserModal').modal('show');
}

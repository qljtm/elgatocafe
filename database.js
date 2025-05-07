import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://ofdcklmpttvdlikioamj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZGNrbG1wdHR2ZGxpa2lvYW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTk3MjUyNSwiZXhwIjoyMDYxNTQ4NTI1fQ.qjZCNSDPaig7OLbzZjSzQtEjg-ZUpJiFNprsBS0UmSw'
const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const loginDiv = document.getElementById('loginDiv');  
    const greetingElement = document.getElementById('greetingMessage');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loggedInUser) {
        // Show greeting message
        greetingElement.textContent = `Hello, ${loggedInUser.firstName}`;
        greetingElement.classList.remove('d-none');

        // Show logout button
        logoutBtn.classList.remove('d-none');

        // Disable the entire div when logged in
        loginDiv.classList.add('disabled');  // Disable the div
    } else {
    
        loginDiv.classList.remove('disabled');  
    }
});

function logout() {
    localStorage.removeItem('loggedInUser');
    const greetingElement = document.getElementById('greetingMessage');
    greetingElement.classList.add('d-none');

  
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.classList.add('d-none');

    const loginDiv = document.getElementById('loginDiv');
    loginDiv.classList.remove('disabled');
}




document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    location.reload(); 
});



document.querySelector('#loginModal form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const logusername = document.getElementById('username').value.trim();
    const logpassword = document.getElementById('password').value.trim();
    
    if(logusername === '' || logpassword === '') {
        showLoginMessage('Username and password are required.');
        return;
    }

    login(logusername, logpassword);
});

async function login(logusername, logpassword) {
    const { data: adminData, error: adminError } = await supabase
        .from('admin_staff')
        .select('email, password, role')
        .eq('email', logusername);

    if (adminError) {
        showLoginMessage('Error retrieving user data. Please try again.');
        console.error(adminError);
    } else if (adminData.length > 0) {
        const user = adminData[0];

        if (user.password === logpassword) {
            if (user.role === 'admin') {
                showLoginMessage('Login successful. Redirecting to admin dashboard...', 'success');
                window.location.href = 'admin.html';
            } else if (user.role === 'staff') {
                showLoginMessage('Login successful. Redirecting to staff dashboard...', 'success');
                window.location.href = 'staff.html';
            } else {
                showLoginMessage('Login successful. Redirecting to customer page...', 'success');
                window.location.href = 'home.html';
            }
        } else {
            showLoginMessage('Invalid username or password.');
        }
    } else {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email, password, first_name')
            .eq('email', logusername);

        if (userError) {
            showLoginMessage('Error retrieving customer data. Please try again.');
            console.error(userError);
        } else if (userData.length > 0) {
            const user = userData[0];

            if (user.password === logpassword) {
                showLoginMessage('Login successful. Welcome back!', 'success');
                
                localStorage.setItem('loggedInUser', JSON.stringify({
                    email: user.email,
                    firstName: user.first_name,
                    role: 'user'
                }));
                
                const greetingElement = document.getElementById('greetingMessage');
                greetingElement.textContent = `Hello, ${user.first_name}`;
                greetingElement.classList.remove('d-none');
                
                location.reload();
            } else {
                showLoginMessage('Invalid username or password.');
            }
        } else {
            showLoginMessage('User not found.');
        }
    }
}

function showLoginMessage(message) {
    const msgDiv = document.getElementById('loginMessage');
    msgDiv.textContent = message;
    msgDiv.classList.remove('d-none');
}



document.querySelector('#registerModal form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const dob = document.getElementById('dateOfBirth').value;
    const contact = document.getElementById('contactNumber').value;
    const agreed = document.getElementById('agreeTerms').checked;

    if (!email || !password || !confirmPassword) {
        showRegisterMessage('Email and password fields are required.');
        return;
    }

    if (password !== confirmPassword) {
        showRegisterMessage('Passwords do not match.');
        return;
    }

    if (!agreed) {
        showRegisterMessage('You must agree to the terms and conditions.');
        return;
    }

    createAccount(email, password, firstName, lastName, dob, contact);
});

async function createAccount(email, password, firstName, lastName, dob, contact) {
    const { data, error } = await supabase
        .from('users')
        .insert([{
            email: email,
            password: password,
            first_name: firstName,
            last_name: lastName,
            birthday: dob,
            contact_no: contact,
            role: 'user'
        }]);

    if (error) {
        console.error('Error creating account:', error);
        showRegisterMessage(`Error creating account: ${error.message || error.details || 'Please try again.'}`);
    } else {
        alert('Account created successfully!');
        window.location.href = 'home.html';
    }
}

function showRegisterMessage(message, type = 'danger') {
    const msgDiv = document.getElementById('registerMessage');
    msgDiv.textContent = message;
    msgDiv.className = `alert alert-${type}`;
    msgDiv.classList.remove('d-none');
}

//orders :((

document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.getElementById('checkoutButton');
    const checkoutMessage = document.getElementById('checkoutMessage');

    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        checkoutButton.disabled = true;
        checkoutButton.classList.add('disabled'); // Optional: Add styling
        checkoutMessage.textContent = 'You must log in first in order to check out.';
        checkoutMessage.classList.remove('d-none');
    } else {
        checkoutButton.disabled = false;
        checkoutMessage.classList.add('d-none');
    }
});

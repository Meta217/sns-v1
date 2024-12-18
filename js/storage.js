// storage.js
function registerUser(username) {
    const users = getUsers();
    if (users[username]) {
        return false; // User already exists
    }
    users[username] = {
        posts: [],
        profile: {
            name: username,
            avatar: null,
            personality: 'supporter'
        }
    };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', username);
    return true;
}

function loginUser(username) {
    const users = getUsers();
    if (users[username]) {
        localStorage.setItem('currentUser', username);
        return true;
    }
    return false;
}

function logoutUser() {
    localStorage.removeItem('currentUser');
}

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || {};
}

function getPosts(username) {
    const users = getUsers();
    return users[username] ? users[username].posts : [];
}

function createPost(username, text, images) {
    const users = getUsers();
    const post = {
        id: Date.now(), // Simple unique ID
        text: text,
        images: images,
        timestamp: new Date().toISOString(),
        comments: [],
        commented: false
    };
    users[username].posts.push(post);
    localStorage.setItem('users', JSON.stringify(users));
}

function updatePost(username, updatedPost) {
    const users = getUsers();
    const postIndex = users[username].posts.findIndex(p => p.id === updatedPost.id);
    if (postIndex !== -1) {
        users[username].posts[postIndex] = updatedPost;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// ... (Previous code in storage.js) ...

function deletePost(username, postId) {
    const users = getUsers();
    const user = users[username];
    if (user) {
        user.posts = user.posts.filter(post => post.id !== postId);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function getUserProfile(username) {
    const users = getUsers();
    return users[username] ? users[username].profile : {};
}

function updateProfile(username, newName, newAvatar) {
    const users = getUsers();
    if (users[username]) {
        users[username].profile.name = newName;
        if (newAvatar) {
            users[username].profile.avatar = newAvatar;
        }
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function updatePersonality(username, personality) {
    const users = getUsers();
    if (users[username]) {
        users[username].profile.personality = personality;
        localStorage.setItem('users', JSON.stringify(users));
    }
}
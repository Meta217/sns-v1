// storage.js

// ... (include indexedDB.js code here or import it) ...
// indexedDB.js (or add to the top of storage.js)

const DB_NAME = 'ai-diary-db';
const DB_VERSION = 1;
const STORE_NAME = 'users';
let db;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'username' });
                objectStore.createIndex('posts', 'posts', { multiEntry: true });
                objectStore.createIndex('profile', 'profile');
            }
        };
    });
}

// Helper function to make transactions
function makeTransaction(storeName, mode) {
    const transaction = db.transaction(storeName, mode);
    transaction.onerror = (event) => {
        console.error('Transaction error:', event.target.error);
    };
    return transaction;
}


async function init() {
    await openDB();
}

init();

async function registerUser(username) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            if (request.result) {
                resolve(false); // User already exists
            } else {
                const newUser = {
                    username: username,
                    posts: [],
                    profile: {
                        name: username,
                        avatar: null,
                        personality: 'supporter',
                        wallpaper: null
                    }
                };
                store.add(newUser);
                localStorage.setItem('currentUser', username);
                resolve(true);
            }
        };

        transaction.oncomplete = () => {
            console.log("User registered successfully");
        }
    });
}

async function loginUser(username) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            if (request.result) {
                localStorage.setItem('currentUser', username);
                resolve(true);
            } else {
                resolve(false);
            }
        };
    });
}

function logoutUser() {
    localStorage.removeItem('currentUser');
}

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

async function getUsers() {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const users = {};
            request.result.forEach(user => {
                users[user.username] = user;
            });
            resolve(users);
        };
    });
}

async function getPosts(username) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            const posts = request.result ? request.result.posts : [];
            // Sort posts by id in descending order (newest to oldest)
            // posts.sort((a, b) => b.id - a.id);
            resolve(posts);
        };
    });
}

async function createPost(username, text, images) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            const user = request.result;
            const post = {
                id: Date.now(), // Simple unique ID
                text: text,
                images: images,
                timestamp: new Date().toISOString(),
                comments: [],
                commented: false
            };
            user.posts.push(post);
            store.put(user);
            resolve();
        };
    });
}

async function updatePost(username, updatedPost) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            const user = request.result;
            const postIndex = user.posts.findIndex(p => p.id === updatedPost.id);
            if (postIndex !== -1) {
                user.posts[postIndex] = updatedPost;
                store.put(user);
                resolve();
            }
        };
    });
}

async function deletePost(username, postId) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            const user = request.result;
            user.posts = user.posts.filter(post => post.id !== postId);
            store.put(user);
            resolve();
        };
    });
}

async function getUserProfile(username) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            resolve(request.result ? request.result.profile : {});
        };
    });
}

async function updateProfile(username, newName, newAvatar) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            const user = request.result;
            if (user) {
                user.profile.name = newName;
                if (newAvatar) {
                    user.profile.avatar = newAvatar;
                }
                store.put(user);
                resolve();
            }
        };
    });
}

async function updatePersonality(username, personality) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = () => {
            const user = request.result;
            if (user) {
                user.profile.personality = personality;
                store.put(user);
                resolve();
            }
        };
    });
}

async function updateWallpaper(username, wallpaper) {
    return new Promise(async (resolve, reject) => {
        await init();
        const transaction = makeTransaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(username);

        request.onsuccess = async () => {
            const user = request.result;
            if (user) {
                user.profile.wallpaper = wallpaper;
                store.put(user);
                resolve();
            }
        };
    });
}
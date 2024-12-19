// app.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginUsernameInput = document.getElementById('loginUsername');
    const registerUsernameInput = document.getElementById('registerUsername');
    const postText = document.getElementById('postText');
    const postImage = document.getElementById('postImage');
    const postBtn = document.getElementById('postBtn');
    const feed = document.getElementById('feed');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const avatarInput = document.getElementById('avatarInput');
    const nameInput = document.getElementById('nameInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const personalitySelect = document.getElementById('personalitySelect');
    const savePersonalityBtn = document.getElementById('savePersonalityBtn');
    const imagePreview = document.getElementById('imagePreview');
    const selectImagesBtn = document.getElementById('selectImagesBtn');

    // 用于存储所有选中的文件
    let selectedFiles = [];

    // Event Listeners for Login/Registration
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const username = loginUsernameInput.value;
            if (loginUser(username)) {
                window.location.href = 'home.html';
            } else {
                alert('User not found.');
            }
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const username = registerUsernameInput.value;
            if (registerUser(username)) {
                window.location.href = 'home.html';
            } else {
                alert('Username already exists.');
            }
        });
    }

    // Event Listener for Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutUser();
            window.location.href = 'index.html';
        });
    }

    // Load User Data and Posts (if logged in)
    const currentUser = getCurrentUser();
    if (currentUser) {
        if (feed) {
            loadPosts(currentUser);
        }
        if (profileAvatar) {
            loadProfile(currentUser);
        }
        loadSidebar(currentUser);
    } else if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
    }

    // Event Listener for Post Button
    if (postBtn) {
        postBtn.addEventListener('click', async () => {
            const text = postText.value;
            const images = [];

            if (selectedFiles.length > 0) {
                const readerPromises = [];

                for (let i = 0; i < Math.min(selectedFiles.length, 9); i++) {
                    const reader = new FileReader();
                    readerPromises.push(
                        new Promise((resolve) => {
                            reader.onload = (e) => {
                                images.push(e.target.result);
                                resolve();
                            };
                            reader.readAsDataURL(selectedFiles[i]);
                        })
                    );
                }

                await Promise.all(readerPromises);
            }

            // 现在使用 images 数组，其中包含了所有选定文件的 base64 数据
            createPost(currentUser, text, images);
            postText.value = '';
            postImage.value = '';
            selectedFiles = []; // 清空已选择的文件
            imagePreview.innerHTML = ''; // Clear preview after posting
            imagePreview.className = 'image-preview-grid';
            loadPosts(currentUser);
        });
    }

    // Event Listener for Profile Save Button
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const newName = nameInput.value;
            const newAvatar = avatarInput.files[0];

            if (newAvatar) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    updateProfile(currentUser, newName, e.target.result);
                    loadProfile(currentUser);
                }
                reader.readAsDataURL(newAvatar);
            } else {
                updateProfile(currentUser, newName, null);
                loadProfile(currentUser);
            }
        });
    }

    // Event Listener for Personality Save Button
    if (savePersonalityBtn) {
        savePersonalityBtn.addEventListener('click', () => {
            const selectedPersonality = personalitySelect.value;
            updatePersonality(currentUser, selectedPersonality);
        });
    }

    // Load Profile Data
    function loadProfile(username) {
        const userProfile = getUserProfile(username);
        if (profileName) {
            profileName.textContent = userProfile.name || username;
        }
        if (profileAvatar) {
            profileAvatar.src = userProfile.avatar || 'img/default-avatar.png';
        }
        if (nameInput) {
            nameInput.value = userProfile.name || '';
        }
        if (personalitySelect) {
            personalitySelect.value = userProfile.personality || 'supporter';
        }
    }

    // Handle image preview
    if (selectImagesBtn) {
        selectImagesBtn.addEventListener('click', () => {
            postImage.click(); // 触发隐藏的 input 元素的点击事件
        });
    }

    if (postImage) {
        postImage.addEventListener('change', () => {
            const newFiles = Array.from(postImage.files); // 获取新选择的文件
            selectedFiles = selectedFiles.concat(newFiles); // 将新文件追加到 selectedFiles 数组

            updateImagePreview(); // 更新图片预览

            // 清空 input 元素的值，以便下次可以选择相同的文件
            postImage.value = '';
        });
    }

    // 更新图片预览区域
    function updateImagePreview() {
        imagePreview.innerHTML = ''; // 清空预览
        const numFiles = Math.min(selectedFiles.length, 9);
        imagePreview.className = `image-preview-grid grid-${numFiles}`;

        for (let i = 0; i < numFiles; i++) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgContainer = document.createElement('div');
                const img = document.createElement('img');
                img.src = e.target.result;
                imgContainer.appendChild(img);
                imagePreview.appendChild(imgContainer);
            };
            reader.readAsDataURL(selectedFiles[i]);
        }
    }

    // Load Posts into Feed
    async function loadPosts(username) {
        const posts = getPosts(username);
        const robots = await loadPrompts(); // Load robot data
        if (feed) {
            feed.innerHTML = ''; // Clear existing posts

            posts.forEach(async (post) => {
                // ... (postElement creation) ...
                const postElement = document.createElement('div');
                postElement.classList.add('post');
    
                const postHeader = document.createElement('div');
                postHeader.classList.add('post-header');
                const avatarImg = document.createElement('img');
                const userProfile = getUserProfile(username);
                avatarImg.src = userProfile.avatar || 'img/default-avatar.png';
                avatarImg.alt = 'User Avatar';
                const usernameElement = document.createElement('span');
                usernameElement.textContent = userProfile.name || username;
                postHeader.appendChild(avatarImg);
                postHeader.appendChild(usernameElement);
    
                const postContent = document.createElement('div');
                postContent.classList.add('post-content');
                const postTextElement = document.createElement('p');
                postTextElement.textContent = post.text;
                postContent.appendChild(postTextElement);
    
                // Add images to the post
                if (post.images && post.images.length > 0) {
                    const imageGrid = document.createElement('div');
                    imageGrid.classList.add('image-preview-grid', `grid-${post.images.length}`);
    
                    post.images.forEach(image => {
                        const imgContainer = document.createElement('div');
                        const imgElement = document.createElement('img');
                        imgElement.src = image;
                        imgElement.alt = 'Post Image';
                        imgElement.addEventListener('click', () => {
                            showModal(image);
                        });
                        imgContainer.appendChild(imgElement);
                        imageGrid.appendChild(imgContainer);
                    });
    
                    postContent.appendChild(imageGrid);
                }
    
                const postFooter = document.createElement('div');
                postFooter.classList.add('post-footer');
                const postDate = document.createElement('span');
                postDate.textContent = formatDate(new Date(post.timestamp));
                postFooter.appendChild(postDate);
    
                postElement.appendChild(postHeader);
                postElement.appendChild(postContent);
                postElement.appendChild(postFooter); 
                // Add delete button to post
                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-post-btn');
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete this post?')) {
                        deletePost(username, post.id);
                        loadPosts(username); // Reload posts after deletion
                    }
                });
                postFooter.appendChild(deleteBtn);

                // Comments
                const commentsElement = document.createElement('div');
                commentsElement.classList.add('comments');

                // Generate AI comments only if the post hasn't been commented on
                if (!post.commented) {
                    const selectedRobots = []; // Array to store selected robots
                    while (selectedRobots.length < 3) {
                        const randomIndex = Math.floor(Math.random() * robots.robots.length);
                        const robot = robots.robots[randomIndex];

                        // Check if the robot is already selected
                        if (!selectedRobots.includes(robot)) {
                            selectedRobots.push(robot);
                        }
                    }

                    for (let i = 0; i < 3; i++) {
                        const robot = selectedRobots[i];
                        const commentText = await generateComment(post.text, robot.prompt, robot.name);

                        const comment = {
                            name: robot.name,
                            text: commentText,
                            avatar: robot.avatar
                        };
                        post.comments.push(comment);
                    }
                    // Mark the post as commented
                    post.commented = true;
                    updatePost(username, post);
                }

                // Display comments
                post.comments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.classList.add('comment');
                    const commentHeader = document.createElement('div');
                    commentHeader.classList.add('comment-header');
                    const commentAvatar = document.createElement('img');
                    commentAvatar.src = comment.avatar;
                    commentAvatar.alt = 'Commenter Avatar';
                    const commentName = document.createElement('span');
                    commentName.textContent = comment.name;
                    commentHeader.appendChild(commentAvatar);
                    commentHeader.appendChild(commentName);
                    const commentTextElement = document.createElement('p');
                    commentTextElement.textContent = comment.text;
                    commentElement.appendChild(commentHeader);
                    commentElement.appendChild(commentTextElement);
                    commentsElement.appendChild(commentElement);
                });

                postElement.appendChild(commentsElement);
                if (feed) {
                    feed.prepend(postElement); // Add new posts to the top
                }
            });
        }
    }    

    // Function to show large image modal
    function showModal(imageSrc) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        modal.style.display = 'block';
        modalImg.src = imageSrc;
    }

    // Function to close large image modal (Corrected)
    function closeModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
    }

    // Sidebar functionality
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.querySelector('.hamburger');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', (event) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && !hamburger.contains(event.target)) {
            sidebar.classList.remove('open');
        }
    });

    // Load sidebar data
    function loadSidebar(username) {
        const userProfile = getUserProfile(username);
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarUsername = document.getElementById('sidebarUsername');
        const sidebarWallpaper = document.getElementById('sidebarWallpaper');
        const wallpaperInput = document.getElementById('wallpaperInput');

        if (sidebarAvatar) {
            sidebarAvatar.src = userProfile.avatar || 'img/default-avatar.png';
        }
        if (sidebarUsername) {
            sidebarUsername.textContent = userProfile.name || username;
        }
        if (sidebarWallpaper) {
            sidebarWallpaper.src = userProfile.wallpaper || 'img/default-wallpaper.jpg';
            sidebarWallpaper.addEventListener('click', () => {
                wallpaperInput.click();
            });
        }

        if (wallpaperInput) {
            wallpaperInput.addEventListener('change', () => {
                const file = wallpaperInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        sidebarWallpaper.src = e.target.result;
                        updateWallpaper(username, e.target.result); // Function to update wallpaper in storage
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Update greeting based on time
        const greeting = document.getElementById('greeting');
        if (greeting) {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                greeting.textContent = '上午好, ' + (userProfile.name || username);
            } else if (hour >= 12 && hour < 18) {
                greeting.textContent = '下午好, ' + (userProfile.name || username);
            } else {
                greeting.textContent = '晚上好, ' + (userProfile.name || username);
            }
        }
    }

    // Function to update wallpaper in storage
    function updateWallpaper(username, wallpaper) {
        const users = getUsers();
        if (users[username]) {
            users[username].profile.wallpaper = wallpaper;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Calendar functionality (for calendar.html)
    if (window.location.pathname.endsWith('calendar.html')) {
        loadCalendar();
    }

    function loadCalendar() {
        const calendarElement = document.getElementById('calendar');
        const postListElement = document.getElementById('postList');
        const postsOnDateElement = document.getElementById('postsOnDate');
        const selectedDateElement = document.getElementById('selectedDate');

        if (calendarElement) {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            generateCalendar(currentYear, currentMonth, calendarElement);

            calendarElement.addEventListener('click', (event) => {
                if (event.target.classList.contains('has-posts')) {
                    const clickedDate = event.target.dataset.date;
                    selectedDateElement.textContent = clickedDate;
                    const userPosts = getPosts(currentUser);
                    const postsOnClickedDate = userPosts.filter(post => {
                        const postDate = new Date(post.timestamp);
                        const formattedPostDate = `${postDate.getFullYear()}-${(postDate.getMonth() + 1).toString().padStart(2, '0')}-${postDate.getDate().toString().padStart(2, '0')}`;
                        return formattedPostDate === clickedDate;
                    });
                    displayPosts(postsOnClickedDate, postsOnDateElement);
                    postListElement.style.display = 'block';
                }
            });
        }
    }

    function generateCalendar(year, month, calendarElement) {
        calendarElement.innerHTML = '';

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDayIndex = new Date(year, month, daysInMonth).getDay();

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = day;
            calendarElement.appendChild(dayElement);
        });

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-date');
            calendarElement.appendChild(emptyDay);
        }

        const userPosts = getPosts(currentUser);

        for (let i = 1; i <= daysInMonth; i++) {
            const dateElement = document.createElement('div');
            dateElement.classList.add('calendar-date');
            const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            dateElement.textContent = i;
            dateElement.dataset.date = formattedDate;

            const hasPosts = userPosts.some(post => {
                const postDate = new Date(post.timestamp);
                const formattedPostDate = `${postDate.getFullYear()}-${(postDate.getMonth() + 1).toString().padStart(2, '0')}-${postDate.getDate().toString().padStart(2, '0')}`;
                return formattedPostDate === formattedDate;
            });

            if (hasPosts) {
                dateElement.classList.add('has-posts');
            }

            calendarElement.appendChild(dateElement);
        }

        for (let i = lastDayIndex; i < 6; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-date');
            calendarElement.appendChild(emptyDay);
        }
    }

    function displayPosts(posts, postsContainer) {
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const listItem = document.createElement('li');
            listItem.textContent = post.text;
            // You can add more details like images, comments, etc. here
            postsContainer.appendChild(listItem);
        });
    }

    // Add event listener to close modal button
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }  

});
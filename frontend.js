const API = "http://localhost:5000/api";


// Get token
function getToken() {
    return localStorage.getItem("token");
}


// ============================
// LOAD POSTS
// ============================

async function loadPosts() {

    const container =
        document.getElementById("postsContainer");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(`${API}/posts`);

        const posts =
            await response.json();

        container.innerHTML = "";

        posts.forEach(post => {

            const card =
                document.createElement("div");

            card.className = "post-card";

            card.innerHTML = `
                <h2>${post.title}</h2>

                <p>
                    ${post.content.substring(0, 150)}
                    ...
                </p>

                <p>
                    By ${post.author?.name || "Unknown"}
                </p>

                <a href="post.html?id=${post._id}">
                    Read More
                </a>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Failed to load posts:",
            error
        );

    }
}


// ============================
// REGISTER
// ============================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const name =
                document.getElementById(
                    "registerName"
                ).value;

            const email =
                document.getElementById(
                    "registerEmail"
                ).value;

            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            try {

                const response =
                    await fetch(
                        `${API}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password
                            })
                        }
                    );

                const data =
                    await response.json();


                alert(data.message);


                if (response.ok) {

                    window.location.href =
                        "login.html";

                }

            } catch (error) {

                alert(
                    "Server connection failed."
                );

            }

        }
    );

}


// ============================
// LOGIN
// ============================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value;

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            try {

                const response =
                    await fetch(
                        `${API}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    localStorage.setItem(
                        "token",
                        data.token
                    );

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );

                    alert(
                        "Login successful!"
                    );

                    window.location.href =
                        "index.html";

                } else {

                    alert(data.message);

                }

            } catch (error) {

                alert(
                    "Server connection failed."
                );

            }

        }
    );

}


// ============================
// CREATE POST
// ============================

const postForm =
    document.getElementById("postForm");

if (postForm) {

    postForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const token =
                getToken();

            if (!token) {

                alert(
                    "Please login first."
                );

                window.location.href =
                    "login.html";

                return;
            }


            const title =
                document.getElementById(
                    "postTitle"
                ).value;

            const content =
                document.getElementById(
                    "postContent"
                ).value;

            const image =
                document.getElementById(
                    "postImage"
                ).value;


            try {

                const response =
                    await fetch(
                        `${API}/posts`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                title,
                                content,
                                image
                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    alert(
                        "Post created successfully!"
                    );

                    window.location.href =
                        "index.html";

                } else {

                    alert(data.message);

                }

            } catch (error) {

                alert(
                    "Server connection failed."
                );

            }

        }
    );

}


// ============================
// LOAD SINGLE POST
// ============================

async function loadSinglePost() {

    const postContainer =
        document.getElementById(
            "postContainer"
        );

    if (!postContainer) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );

    const postId =
        params.get("id");


    if (!postId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/posts/${postId}`
            );

        const post =
            await response.json();


        postContainer.innerHTML = `
            <h1>${post.title}</h1>

            <p>
                By ${post.author?.name || "Unknown"}
            </p>

            <br>

            <p>
                ${post.content}
            </p>
        `;


        loadComments(postId);

    } catch (error) {

        console.error(
            "Failed to load post:",
            error
        );

    }
}


// ============================
// LOAD COMMENTS
// ============================

async function loadComments(postId) {

    const container =
        document.getElementById(
            "commentsContainer"
        );

    if (!container) {
        return;
    }


    const response =
        await fetch(
            `${API}/comments/post/${postId}`
        );

    const comments =
        await response.json();


    container.innerHTML = "";


    comments.forEach(comment => {

        const div =
            document.createElement("div");

        div.className = "comment";

        div.innerHTML = `
            <strong>
                ${comment.author?.name || "User"}
            </strong>

            <p>
                ${comment.content}
            </p>
        `;

        container.appendChild(div);

    });

}


// ============================
// ADD COMMENT
// ============================

const commentForm =
    document.getElementById(
        "commentForm"
    );

if (commentForm) {

    commentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const token =
                getToken();

            if (!token) {

                alert(
                    "Please login to comment."
                );

                window.location.href =
                    "login.html";

                return;
            }


            const params =
                new URLSearchParams(
                    window.location.search
                );

            const postId =
                params.get("id");


            const content =
                document.getElementById(
                    "commentContent"
                ).value;


            try {

                const response =
                    await fetch(
                        `${API}/comments`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                post: postId,
                                content
                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    document.getElementById(
                        "commentContent"
                    ).value = "";

                    loadComments(postId);

                } else {

                    alert(data.message);

                }

            } catch (error) {

                alert(
                    "Failed to add comment."
                );

            }

        }
    );

}


loadPosts();
loadSinglePost();

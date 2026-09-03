const express = require("express");

const Post = require("../models/Post");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get all posts
router.get("/", async (req, res) => {

    try {

        const posts = await Post.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch posts"
        });

    }
});


// Get single post
router.get("/:id", async (req, res) => {

    try {

        const post = await Post.findById(
            req.params.id
        ).populate(
            "author",
            "name email"
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json(post);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch post"
        });

    }
});


// Create post
router.post(
    "/",
    protect,
    async (req, res) => {

        try {

            const post = new Post({
                title: req.body.title,
                content: req.body.content,
                image: req.body.image || "",
                author: req.user.id
            });

            const savedPost =
                await post.save();

            res.status(201).json(savedPost);

        } catch (error) {

            res.status(400).json({
                message: "Failed to create post",
                error: error.message
            });

        }

    }
);


// Update post
router.put(
    "/:id",
    protect,
    async (req, res) => {

        try {

            const post =
                await Post.findById(
                    req.params.id
                );

            if (!post) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }

            if (
                post.author.toString() !== req.user.id &&
                req.user.role !== "Admin"
            ) {
                return res.status(403).json({
                    message: "Not authorized"
                });
            }

            post.title =
                req.body.title ?? post.title;

            post.content =
                req.body.content ?? post.content;

            post.image =
                req.body.image ?? post.image;

            const updatedPost =
                await post.save();

            res.json(updatedPost);

        } catch (error) {

            res.status(400).json({
                message: "Failed to update post"
            });

        }

    }
);


// Delete post
router.delete(
    "/:id",
    protect,
    async (req, res) => {

        try {

            const post =
                await Post.findById(
                    req.params.id
                );

            if (!post) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }

            if (
                post.author.toString() !== req.user.id &&
                req.user.role !== "Admin"
            ) {
                return res.status(403).json({
                    message: "Not authorized"
                });
            }

            await Post.findByIdAndDelete(
                req.params.id
            );

            res.json({
                message: "Post deleted successfully"
            });

        } catch (error) {

            res.status(400).json({
                message: "Failed to delete post"
            });

        }

    }
);


module.exports = router;

const express = require("express");

const router = express.Router();

const {
    upload,
    createBlogByUserId,
    getBlogsByUserId,
    getBlogById,
    updateBlogByUserId,
    deleteBlogByUserId,
    getAllBlogs,
} = require("../controllers/blogController");

const { userProtect } = require("../middlewares/authMiddlewares");

router.post("/create-blog/:userId", userProtect, upload.single('image'), createBlogByUserId);
// router.post("/create-blog/:userId", userProtect, createBlogByUserId);

router.get("/get-blogs/:userId", userProtect, getBlogsByUserId);
router.get("/get-blog/:blogId", userProtect, getBlogById);
router.put('/update-blog/:userId/:blogId', userProtect, upload.single('image'), updateBlogByUserId);
router.delete('/delete-blog/:userId/:blogId', userProtect, deleteBlogByUserId);
router.get('/get-all-blogs', userProtect, getAllBlogs);

module.exports = router;
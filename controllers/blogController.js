const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const multer = require("multer");
dotenv = require("dotenv");
dotenv.config();
const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

// configure multer to store files in memory before uploading to S3
exports.upload = multer({ storage: multer.memoryStorage() });

// configure AWS SDK with your S3 credentials and region
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// ! Create a new blog

exports.createBlogByUserId = async (req, res) => {
    try {
        const { title, description } = req.body;
        const { userId } = req.params;
        const folderName = "blogs";
        const image = req.file;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Image is required",
                statusCode: 2,
            });
        }

        // Check if user exists
        const user = await User.findById(userId);  // Use userId from route parameters
        console.log(user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                statusCode: 2,
            });
        }

        // Prepare S3 upload parameters
        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folderName}/${Date.now()}-${image.originalname}`,
            Body: image.buffer,
            ContentType: image.mimetype,
            ACL: "public-read",
        };

        // Upload image to S3
        const putObjectCommand = new PutObjectCommand(s3Params);
        await s3.send(putObjectCommand);

        // Create a new blog instance
        const newBlog = new Blog({
            userId: userId,  // Use userId from route parameters
            title,
            description,
            image: {
                url: s3Params.Key,
                key: s3Params.Key,
            },
        });

        // Save the new blog
        await newBlog.save();

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            statusCode: 1,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
            statusCode: 0,
        });
    }
};

// ! Get Blogs By UserId

exports.getBlogsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                statusCode: 2,
            });
        }

        // Retrieve blogs created by the user
        const blogs = await Blog.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Blogs retrieved successfully",
            data: blogs.map(blog => {
                return {
                    id: blog._id,
                    title: blog.title,
                    description: blog.description,
                    image: `${process.env.DEFAULT_URL}${blog.image.url}`,
                };
            }),
            statusCode: 1,
        });
    } catch (error) {
        console.error('Error retrieving blogs:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
            statusCode: 0,
        });
    }
};

// ! Get Blog By Id

exports.getBlogById = async (req, res) => {
    try {
        const { blogId } = req.params;

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
                statusCode: 2,
            });
        }

        res.status(200).json({
            success: true,
            message: "Blog retrieved successfully",
            data: {
                id: blog._id,
                title: blog.title,
                description: blog.description,
                image: `${process.env.DEFAULT_URL}${blog.image.url}`,
            },
            statusCode: 1,
        });
    } catch (error) {
        console.error('Error retrieving blog:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
            statusCode: 0,
        });
    }
};

// ! Update Blog By Id

exports.updateBlogByUserId = async (req, res) => {
    try {
        const { title, description } = req.body;
        const { userId, blogId } = req.params;
        const folderName = "blogs";
        const image = req.file;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                statusCode: 2,
            });
        }

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
                statusCode: 2,
            });
        }

        // Check if the blog belongs to the user
        if (blog.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this blog",
                statusCode: 2,
            });
        }

        // If image is provided, upload to S3 and update the blog image
        if (image) {
            const s3Params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${folderName}/${Date.now()}-${image.originalname}`,
                Body: image.buffer,
                ContentType: image.mimetype,
                ACL: "public-read",
            };

            // Upload new image to S3
            const putObjectCommand = new PutObjectCommand(s3Params);
            await s3.send(putObjectCommand);

            // Optionally delete the old image from S3 if applicable
            const oldImageKey = blog.image.key;
            if (oldImageKey) {
                const deleteParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: oldImageKey,
                };
                const deleteObjectCommand = new DeleteObjectCommand(deleteParams);
                await s3.send(deleteObjectCommand);
            }

            blog.image = {
                url: s3Params.Key,
                key: s3Params.Key,
            };
        }

        // Update blog details
        if (title) blog.title = title;
        if (description) blog.description = description;

        // Save the updated blog
        await blog.save();

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            statusCode: 1,
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
            statusCode: 0,
        });
    }
};

// ! Delete Blog By Id

exports.deleteBlogByUserId = async (req, res) => {
    try {
        const { userId, blogId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                statusCode: 2,
            });
        }

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
                statusCode: 2,
            });
        }

        // Check if the blog belongs to the user
        if (blog.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this blog",
                statusCode: 2,
            });
        }

        // Delete the image from S3
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: blog.image.key,
        };
        const deleteObjectCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteObjectCommand);

        // Delete the blog from the database
        await blog.deleteOne();

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
            statusCode: 1,
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
            statusCode: 0,
        });
    }
};


// ! Get All Blogs

exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 }).populate('userId', 'name profilePicture');

        res.status(200).json({
            success: true,
            message: "Blogs retrieved successfully",
            data: blogs.map(blog => {
                return {
                    id: blog._id,
                    title: blog.title,
                    description: blog.description,
                    image: `${process.env.DEFAULT_URL}${blog.image.url}`,
                    user: {
                        id: blog.userId._id,
                        name: blog.userId.name,
                        profilePicture: blog.userId.profilePicture || null,
                    }
                };
            }),
            statusCode: 1,
        });
    } catch (error) {
        console.error('Error retrieving blogs:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
            statusCode: 0,
        });
    }
};


import Blog from "../models/Blog.js";

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    let query = {};

    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
        { tags: new RegExp(search, "i") },
      ];
    }

    const blogs = await Blog.find(query)
      .populate("author", "name email college avatar")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email college avatar")
      .populate("comments.user", "name email avatar");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create blog
export const createBlog = async (req, res) => {
  try {
    req.body.author = req.user.id;
    if (req.file) req.body.image = req.file.path;

    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update blog
export const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.file) req.body.image = req.file.path;

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Like/Unlike blog
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const isLiked = blog.likes.includes(req.user.id);
    if (isLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      blog.likes.push(req.user.id);
    }

    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add comment
export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const newComment = { user: req.user.id, comment };
    blog.comments.push(newComment);
    await blog.save();

    await blog.populate("comments.user", "name email avatar");

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete comment
export const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (
      comment.user.toString() !== req.user.id &&
      blog.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    blog.comments.pull(req.params.commentId);
    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's blogs
export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.userId })
      .populate("author", "name email college avatar")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

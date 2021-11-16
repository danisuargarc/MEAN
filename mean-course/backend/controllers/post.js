const Post = require("../models/post");

exports.createPost = (request, response, next) => {
  const url = request.protocol + "://" + request.get("host");

  const post = new Post({
    title: request.body.title,
    content: request.body.content,
    hero: url + "/images/" + request.file.filename,
    author: request.userData.userId,
  });

  post
    .save()
    .then((result) => {
      response.status(201).json({
        message: "Post added successfully",
        post: {
          ...result,
          id: result._id,
        },
      });
    })
    .catch((error) => {
      response.status(500).json({
        message: "Creating a post failed.",
      });
    });
};

exports.getPosts = (request, response, next) => {
  const count = +request.query.count;
  const currentPage = +request.query.page;
  const postQuery = Post.find();
  let fetchedPosts;

  if (count && currentPage) {
    postQuery.skip(count * (currentPage - 1)).limit(count);
  }

  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then((count) => {
      response.status(200).json({
        message: "Posts fetched successfully",
        posts: fetchedPosts,
        total: count,
      });
    })
    .catch((error) => {
      response.status(500).json({
        message: "Could not fetch posts.",
      });
    });
};

exports.getPost = (request, response, next) => {
  Post.findById(request.params.id)
    .then((post) => {
      if (post) {
        response.status(200).json(post);
      } else {
        response.status(404).json({
          message: "Post not found",
        });
      }
    })
    .catch((error) => {
      response.status(500).json({
        message: "Could not fetch post.",
      });
    });
};

exports.editPost = (request, response, next) => {
  let hero = request.body.hero;
  if (request.file) {
    const url = request.protocol + "://" + request.get("host");
    hero = url + "/images/" + request.file.filename;
  }
  const post = new Post({
    _id: request.body.id,
    title: request.body.title,
    content: request.body.content,
    hero: hero,
    author: request.userData.userId,
  });
  Post.updateOne(
    { _id: request.params.id, author: request.userData.userId },
    post
  )
    .then((result) => {
      if (result.matchedCount > 0) {
        response.status(200).json({
          message: "Post updated successfully",
          hero: hero,
        });
      }
      else {
        response.status(401).json({
          message: "Not authorized to update post.",
        });
      }
    })
    .catch((error) => {
      response.status(500).json({
        message: "Could not update post.",
      });
    });
};

exports.deletePost = (request, response, next) => {
  Post.deleteOne({
    _id: request.params.id,
    author: request.userData.userId,
  })
    .then((result) => {
      if (result.deletedCount > 0) {
        response.status(200).json({
          message: "Post deleted successfully",
        });
      } else {
        response.status(401).json({
          message: "Not authorized to delete post",
        });
      }
    })
    .catch((error) => {
      response.status(500).json({
        message: "Could not delete post.",
      });
    });
};

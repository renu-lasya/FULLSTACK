package com.example.cache_api.controller;

import com.example.cache_api.model.Post;
import com.example.cache_api.service.PostService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }


    // ==========================================
    // GET ALL POSTS
    // ==========================================

    @GetMapping
    public List<Post> getAllPosts() {

        return postService.getAllPosts();
    }


    // ==========================================
    // GET POST BY ID
    // ==========================================

    @GetMapping("/{id}")
    public Optional<Post> getPostById(@PathVariable Long id) {

        return postService.getPostById(id);
    }


    // ==========================================
    // CREATE POST
    // ==========================================

    @PostMapping
    public Post createPost(@RequestBody Post post) {

        return postService.createPost(post);
    }


    // ==========================================
    // UPDATE POST
    // ==========================================

    @PutMapping("/{id}")
    public Post updatePost(
            @PathVariable Long id,
            @RequestBody Post post) {

        return postService.updatePost(id, post);
    }


    // ==========================================
    // DELETE POST
    // ==========================================

    @DeleteMapping("/{id}")
    public String deletePost(@PathVariable Long id) {

        postService.deletePost(id);

        return "Post deleted successfully";
    }
}
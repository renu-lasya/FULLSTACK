package com.example.post_api.controller;
import com.example.post_api.dto.PostRequest;
import com.example.post_api.model.Post;
import com.example.post_api.service.PostService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // GET all posts
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    // GET post by ID
    @GetMapping("/{id}")
public ResponseEntity<Post> getPostById(@PathVariable Long id) {

    return ResponseEntity.ok(postService.getPostById(id));
}

    // POST - create a new post
    @PostMapping
    public ResponseEntity<Post> createPost(
            @Valid @RequestBody PostRequest request) {

        Post post = new Post();

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setScheduledDate(request.getScheduledDate());

        return ResponseEntity.ok(postService.createPost(post));
    }

    // PUT - update a post
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {

        Post post = new Post();

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setScheduledDate(request.getScheduledDate());

        return postService.updatePost(id, post)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE - delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable Long id) {

        if (postService.deletePost(id)) {
            return ResponseEntity.ok("Post deleted successfully");
        }

        return ResponseEntity.notFound().build();
    }
}
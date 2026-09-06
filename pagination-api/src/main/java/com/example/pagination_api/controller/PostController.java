package com.example.pagination_api.controller;

import com.example.pagination_api.model.Post;
import com.example.pagination_api.service.PostService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // GET posts with pagination and sorting
    @GetMapping
    public ResponseEntity<Page<Post>> getAllPosts(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "5") int size,

            @RequestParam(defaultValue = "id") String sortBy,

            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort;

        if (direction.equalsIgnoreCase("desc")) {
            sort = Sort.by(sortBy).descending();
        } else {
            sort = Sort.by(sortBy).ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
                postService.getAllPosts(pageable)
        );
    }

    // POST - create a new post
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {

        return ResponseEntity.ok(
                postService.createPost(post)
        );
    }
}
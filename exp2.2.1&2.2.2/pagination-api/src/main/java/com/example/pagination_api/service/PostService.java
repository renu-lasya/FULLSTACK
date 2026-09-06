package com.example.pagination_api.service;

import com.example.pagination_api.model.Post;
import com.example.pagination_api.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // Get posts with pagination and sorting
    public Page<Post> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    // Create a new post
    public Post createPost(Post post) {
        return postRepository.save(post);
    }
}
package com.example.post_api.service;

import com.example.post_api.model.Post;
import com.example.post_api.repository.PostRepository;
import com.example.post_api.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // Get all posts
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // Get post by ID
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Post not found with id: " + id
                        )
                );
    }

    // Create post
    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    // Update post
    public Optional<Post> updatePost(Long id, Post updatedPost) {
        return postRepository.findById(id).map(post -> {

            post.setTitle(updatedPost.getTitle());
            post.setContent(updatedPost.getContent());
            post.setScheduledDate(updatedPost.getScheduledDate());

            return postRepository.save(post);
        });
    }

    // Delete post
    public boolean deletePost(Long id) {

        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return true;
        }

        return false;
    }
}
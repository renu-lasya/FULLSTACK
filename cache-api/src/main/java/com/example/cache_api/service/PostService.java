package com.example.cache_api.service;

import com.example.cache_api.model.Post;
import com.example.cache_api.repository.PostRepository;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // ==========================================
    // GET ALL POSTS
    // JOIN FETCH + CACHE
    // ==========================================

    @Cacheable("posts")
    public List<Post> getAllPosts() {

        return postRepository.findPostsWithJoinFetch();
    }


    // ==========================================
    // GET POST BY ID
    // CACHE
    // ==========================================

    @Cacheable(value = "post", key = "#id")
    public Optional<Post> getPostById(Long id) {

        return postRepository.findById(id);
    }


    // ==========================================
    // CREATE POST
    // CLEAR POSTS CACHE
    // ==========================================

    @CacheEvict(value = "posts", allEntries = true)
    public Post createPost(Post post) {

        return postRepository.save(post);
    }


    // ==========================================
    // UPDATE POST
    // CLEAR ALL POST CACHES
    // ==========================================

    @CacheEvict(value = {"posts", "post"}, allEntries = true)
    public Post updatePost(Long id, Post post) {

        Optional<Post> existingPost = postRepository.findById(id);

        if (existingPost.isPresent()) {

            Post existing = existingPost.get();

            existing.setTitle(post.getTitle());
            existing.setContent(post.getContent());

            return postRepository.save(existing);
        }

        return null;
    }


    // ==========================================
    // DELETE POST
    // CLEAR ALL POST CACHES
    // ==========================================

    @CacheEvict(value = {"posts", "post"}, allEntries = true)
    public void deletePost(Long id) {

        postRepository.deleteById(id);
    }
}
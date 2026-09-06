package com.example.cache_api.repository;

import com.example.cache_api.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // N+1 demonstration - comments are loaded separately
    @Query("SELECT p FROM Post p")
    List<Post> findPostsWithoutJoinFetch();

    // N+1 solution - Posts and Comments loaded using one query
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.comments")
    List<Post> findPostsWithJoinFetch();
}
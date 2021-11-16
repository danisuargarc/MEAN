import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient, private router: Router) {}

  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], total: number }>();

  getPost(postId: string) {
    return this.http.get<{ _id: string, title: string, content: string, hero: string, author: string }>(BACKEND_URL + postId);
  }

  getPosts(count: number, page: number) {
    const queryParams = `?count=${count}&page=${page}`;
    this.http
      .get<{ message: string, posts: any, total: number }>(BACKEND_URL + queryParams)
      .pipe(
        map((data) => {
          return { posts: data.posts.map((post) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              hero: post.hero,
              author: post.author
            };
          }), total: data.total };
        })
      )
      .subscribe((newData) => {
        console.log(newData);
        this.posts = newData.posts;
        this.postsUpdated.next({ posts: [...this.posts], total: newData.total });
      });
  }

  getPostsUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(post: Post, image: File) {
    const postData = new FormData();
    postData.append("title", post.title);
    postData.append("content", post.content);
    postData.append("image", image, post.title);

    this.http
      .post<{ message: string, post: Post }>(BACKEND_URL, postData)
      .subscribe((data) => {
        this.router.navigate(['/']);
      });
  }

  editPost(postId: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append("id", postId);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    }
    else {
      postData = {
        id: postId,
        title: title,
        content: content,
        hero: image,
        author: null
      };
    }
    this.http
      .put<{ message: string, hero: string }>(BACKEND_URL + postId, postData)
      .subscribe((data) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http
      .delete<{ message: string }>(BACKEND_URL + postId);
  }
}

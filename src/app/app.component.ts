import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { PostsService } from "./posts.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  loadedPosts = [];
  isFetching = false;

  constructor(private http: HttpClient, private postsService: PostsService) {}

  ngOnInit() {
    this.fetchPosts();
  }

  onCreatePost(postData: { title: string; content: string }) {
    this.postsService.createAndStorePost(postData.title, postData.content);
  }

  /**
   * Store the fetch posts method so you can call it in the click listeners and also in ngOnInit when page loads.
   *
   * NOTE: the http verb method is a generic function that accepts the type of data returned in the response body (after being
   *       converted from JSON).
   *       This allows you to omit annotating the argument in operators or in the subscribe callback
   *
   *  Use the service to fetch the posts which returns a prepared observable (transforming response to an array) and subscribe
   *  to it.
   */
  private fetchPosts() {
    this.isFetching = true;
    this.postsService.fetchPosts().subscribe(posts => {
      this.isFetching = false;
      this.loadedPosts = posts;
    });
  }

  onFetchPosts() {
    this.fetchPosts();
  }

  onClearPosts() {}
}

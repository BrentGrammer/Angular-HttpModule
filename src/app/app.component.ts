import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Post } from "./post.model";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  loadedPosts = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Also fetch posts on init:
    this.fetchPosts();
  }

  onCreatePost(postData: { title: string; content: string }) {
    // Send Http request
    /**
     * Note: The Angular HttpClient takes a javascript object passed in as the body and converts it to JSON for you.
     * 
     * An http request sent with Angular returns an Observable that wraps the request.
       You need to subscribe to the http request to get the response (if the request has no subscriptions, it simply won't be called.)
       Note that Angular extracts the response data for you in the callback to the http request subscription.
     */
    this.http
      .post<{ name: string }>(
        "https://angular-recipes-app-584be.firebaseio.com/posts.json",
        postData
      )
      .subscribe(responseData => {
        console.log(responseData);
      });
  }

  /**
   * Store the fetch posts method so you can call it in the click listeners and also in ngOnInit when page loads.
   *
   * NOTE: the http verb method is a generic function that accepts the type of data returned in the response body (after being
   *       converted from JSON).
   *       This allows you to omit annotating the argument in operators or in the subscribe callback
   */
  fetchPosts() {
    this.http
      .get<{ [key: string]: Post }>(
        "https://angular-recipes-app-584be.firebaseio.com/posts.json"
      )
      .pipe(
        map(responseData => {
          // Transform the response data from an object to an array for storing in the component
          const postsArray: Post[] = [];
          for (const key in responseData) {
            // good practice: check that the key is the own property of the object and not of some prototype possibly.
            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ ...responseData[key], id: key });
            }
          }
          return postsArray;
        })
      )
      .subscribe(posts => {
        this.loadedPosts = posts;
      });
  }

  onFetchPosts() {
    this.fetchPosts();
  }

  onClearPosts() {
    // Send Http request
  }
}

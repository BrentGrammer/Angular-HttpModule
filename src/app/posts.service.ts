import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpEventType
} from "@angular/common/http";
import { Post } from "./post.model";
import { map, catchError, tap } from "rxjs/operators";
import { Subject, throwError } from "rxjs";

/**
 * The purpose of this service is to call the http methods and transform the data as needed to send to the view.
 * This keeps logic separate from the typescript component class file and is cleaner.
 */

// providedIn: 'root' is the modern approach to declaring the service app wide instead of having to put it in app.module.ts
@Injectable({ providedIn: "root" })
export class PostsService {
  // Create a subject if emitting errors to multiple interested components
  /**
   * -Useful when multiple components are interested in the error.

      1) Create an error property set to a new Subject used to emit the error to subscribers
      2) In the error callback to the subscribtion on the http request, emit the error calling .next(<errorMsg>) on the subject
      3) In the components that are interested, subscribe to the subject
   */
  error = new Subject<string>();

  // inject http client into service
  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title, content };
    /**
     * Note: The Angular HttpClient takes a javascript object passed in as the body and converts it to JSON for you.
     * 
     * An http request sent with Angular returns an Observable that wraps the request.
       You need to subscribe to the http request to get the response (if the request has no subscriptions, it simply won't be called.)
       Note that Angular extracts the response data for you in the callback to the http request subscription.

       Since the view of the component doesn't directly care about this post operation the subscription can happen here instead of in the
       component class.
     */
    this.http
      .post<{ name: string }>(
        "https://angular-recipes-app-584be.firebaseio.com/posts.json",
        postData,
        {
          observe: "response"
        }
      )
      .subscribe(
        responseData => {
          console.log(responseData);
        },
        error => {
          // emit the error to multiple interested components with the error Subject and subscribe to it in the interested components
          // (in the ngOnInit of the component for example)
          this.error.next(error.message);
        }
      );
  }

  fetchPosts() {
    /**
     * In the service, only return the prepared Observable from the fetch and subscribe to it in the component class.
     */
    // Params is immutable, so assign it to a let for adding multiple query params for the request:
    let myParams = new HttpParams();
    myParams = myParams.append("print", "pretty");
    myParams = myParams.append("another", "param");

    return this.http
      .get<{ [key: string]: Post }>(
        "https://angular-recipes-app-584be.firebaseio.com/posts.json",
        {
          headers: new HttpHeaders({ "Custom-Header": "Hello" }),
          params: myParams
        }
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
        }),
        catchError(errorRes => {
          // could send to analytics server - some generic error handling task, etc.
          // throwError wraps the error in an Observable to pass on to the subscribe function to listen to and use
          return throwError(errorRes);
        })
      );
  }

  /**
   * the tap operator allows you to "tap" into the data in the data flow to do something and then passes it right on to the
   * subscribe callback.
   * There is no need to return anything.
   */
  deletePosts() {
    // return the observable if you want to be informed of the deletion of all posts in the component
    return this.http
      .delete("https://angular-recipes-app-584be.firebaseio.com/posts.json", {
        observe: "events"
      })
      .pipe(
        tap(event => {
          // tap into the event being observed and passed through above
          /**
           * The data logged here will log a type of event (events are encoded with numbers) and a HttpResponse object
           * Ex: Uploading files you'd get a HttpEventType.uploadProgress event fired you can check.
           *
           * You can check the event type with an Enum from the angular/common/http module
           */
          // check for the event type of sent (0) where you can inform the user that the request was sent etc.
          if (HttpEventType.Sent) {
            //...
          }
          // check if you got back a response against the evgent type - if so, the event is the response object:
          if (event.type === HttpEventType.Response) console.log(event.body);
        })
      );
  }
}

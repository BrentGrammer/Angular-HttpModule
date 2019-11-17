import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler
} from "@angular/common/http";

/**
 * This is provided in the app.module.ts in the providers array
 */

export class AuthInterceptor implements HttpInterceptor {
  // intercept gets two arguments that are provided by Angular when the interceptor is applied`
  /**
   * the request argument is a generic type and you can pass in the type of request data the request will yield.
   * <any> is used here to accept any data
   *
   * next is an object with a `handle()` method that will forward the request and allow it to continue it's journey.
   * Pass the request object to it.  Make sure to return the request
   */
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // this will run right before the request leaves the application..

    // If you want to modify the request, you need to clone it since the request object is immutable
    const modifiedRequest = req.clone({
      //url: "new-url",
      headers: req.headers.append("Auth", "Bearer xyz")
    });
    // forward the modified request, not the original
    // handle returns an Observable, you can chain onto it to intercept the Response as well:
    // The observable returned is the request with the response wrapped into an Observable
    /**
     *      Note: The interceptor will always give you access to the event in the operator used in pipe on handle to allow granular access to 
            the response.  
     */
    return next.handle(modifiedRequest);
    // the logging interceptor logs and intercepts the Response
  }
}

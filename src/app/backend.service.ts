import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/index';
import {
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs'

export class Post
{
  public _id: string;
  public user: string;
  public text: string;
  public date: string;
  public comments: Post[];
}

export class Blog
{
  public name: string;
}

export class UserSettings
{
  public email: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    private http: HttpClient 
  ) {
    this.init();
  }

  private authToken: string;
  private loggedInAs: string;

  public changedUser: EventEmitter<string>
    = new EventEmitter<string>();

  private init(): void {
    this.authToken = localStorage.getItem("authToken");
    this.loggedInAs = localStorage.getItem("loggedInAs");
  }

  /* Returns the names of all blogs. */
  blogs(): Observable<Blog[]>
  {
    const query = `
    query blogs
    {
      blogs
      {
        name
      }
    }`;

    return this.http.post<any>(
      "/graphql",
      {
        query: query
      },
      {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      switchMap((result) => of(<Blog[]> result.data.blogs)));
  }

  /* Returns the settings for the current user. */
  userSettings(): Observable<UserSettings>
  {
    const query = `
    query UserSettings
    {
      userSettings
      {
        email
      }
    }`;

    return this.http.post<any>(
      "/graphql",
      {
        query: query
      },
      {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      switchMap((result) => of(<UserSettings> result.data.userSettings)));
  }

  /* Updates the settings for the current user. */
  updateUserSettings(settings: UserSettings): Observable<boolean>
  {
    const query = `
    mutation UpdateUserSettings($settings: UserSettingsInput)
    {
      updateUserSettings(settings: $settings)
    }`;

    return this.http.post<any>(
      "/graphql",
      {
        query,
        variables: {
          settings
        }
      },
      {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      switchMap((result) => of(<boolean> result.data.updateUserSettings)));
  }

  getPosts(user: string): Observable<Post[]>
  {
    const query = `
    fragment commentFields on PostAndComments
    {
      _id, user, text, date
    }
    query GetPosts($user: String)
    {
      getPosts(user: $user)
      {
        ...commentFields
        comments {
          ...commentFields
          comments {
            ...commentFields
            comments {
              ...commentFields
              comments {
                ...commentFields
              }
            }
          }
        }
      }
    }`;

    return this.http.post<any>(
      "/graphql",
      {
        query: query,
        variables: { user }
      },
      {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      switchMap((result) => of(<Post[]> result.data.getPosts)));
  }

  deletePost(post: string): Observable<boolean>
  {
    const query = `
    mutation DeletePost($post: ID)
    {
      deletePost(post: $post)
    }`;
    return this.http.post<any>(
      "/graphql",
      {
        query: query,
        variables: { post }
      },
      {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      switchMap((result) => of(<boolean> result.data.deletePost)));
  }

  createPost(responseTo: string, text: string): Observable<Post>
  {
    const query =
    `mutation CreatePost($responseTo: ID, $text: String)
    {
      createPost(responseTo: $responseTo, text: $text)
      {
        _id, date, user, text,
        comments
        {
          _id, date, user, text
        }
      }
    }`;

    return this.http.post<any>(
      "/graphql",
      {
        query: query,
        variables: { text, responseTo }
      },
      {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      switchMap((result) => of(<Post> result.data.createPost)));
  }

  editPost(postId: string, text: string): Observable<Post>
  {
    const query =
    `mutation EditPost($postId: ID, $text: String)
    {
      editPost(post: $postId, text: $text)
      {
        _id, date, user, text
      }
    }`;

    return this.http.post<any>(
      "/graphql",
      {
        query: query,
        variables: { text, postId }
      },
      {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      switchMap((result) => of(<Post> result.data.editPost)));
  }

  private getHttpHeaders()
  {
    return (this.authToken ?
      new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.authToken
      })
      : new HttpHeaders({
        'Content-Type': 'application/json'
      }));
  }

  authenticateUser(username: string, password: string): Observable<string>
  {
    const query =
    `query AuthenticateUser($username: String, $password: String)
    {
      authenticateUser(username: $username, password: $password)
    }`;

    return this.http.post<any>(
      "/graphql",
      {
        query: query,
        variables: { username, password }
      },
      {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      switchMap((result) => {
        /* Parse the JWT. */
        let token = result.data.authenticateUser;
        /* If we successfully logged in, return the new user. */
        if(token != null)
        {
          this.authToken = token;
          this.loggedInAs = username;

          /* Store the token to local storage. */
          localStorage.setItem("authToken", this.authToken);
          localStorage.setItem("loggedInAs", this.loggedInAs);

          /* Trigger the change user event. */
          this.changedUser.emit(username);
          return of(username);
        }
        /* Otherwise throw an error. */
        else
          throw new Error("Wrong username or password.");
      }));
  }

  createUser(
    username: string,
    password: string,
    email?: string): Observable<boolean>
  {
    const query =
    `mutation CreateUser(
      $username: String,
      $password: String,
      $email: String)
    {
      createUser(
        username: $username,
        password: $password,
        email: $email)
    }`;

    return this.http.post<any>(
      "/graphql",
      {
        query: query,
        variables: { username, password, email }
      },
      {
        headers: this.getHttpHeaders()
      }
    ).pipe(
      switchMap(
        (result) => of(<boolean> result.data.createUser)));
  }

  /* Returns the role of the user in the given post, or username. */
  getRole(post: Post | string): string
  {
    let user;
    if(typeof post == "object")
      user = post.user;
    else
      user = post;

    if(this.loggedInAs) {
      if(user == this.loggedInAs)
        return "owner";
      else
        return "user";
    } else {
      return "guest";
    }
  }

  logout(): void
  {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedInAs");
    this.authToken = null;
    this.loggedInAs = null;
    this.changedUser.emit(null);
  }

  getUsername(): string
  {
    return this.loggedInAs;
  }
}

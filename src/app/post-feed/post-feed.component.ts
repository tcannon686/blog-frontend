import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { BackendService, Post } from '../backend.service';
import { PostEditorComponent } from '../post-editor/post-editor.component';
import {
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { Observable } from 'rxjs/index';

@Component({
  selector: 'app-post-feed',
  templateUrl: './post-feed.component.html',
  styleUrls: ['./post-feed.component.css']
})
export class PostFeedComponent implements AfterViewInit, OnInit {

  public posts: Post[];
  public canPost: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: BackendService,
  ) {
  }

  ngOnInit(): void {
    this.canPost = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        of(this.service.getRole(params.get('user')) === 'owner')));

  }

  ngAfterViewInit(): void {
    /* If the user changes navigation, load the correct posts. */
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.service.getPosts(params.get('user'))))
      .subscribe(
        (result) => this.posts = result,
        (err) => console.error('error getting posts:', err),
        () => {});
  }

  onPostDeleted(post): void {
    const index = this.posts.indexOf(post);
    if (index >= 0) {
      this.posts.splice(index, 1);
    }
  }

  onPostPublished(post): void {
    this.posts.unshift(post);
  }
}

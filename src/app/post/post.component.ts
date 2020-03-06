import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { BackendService, Post } from '../backend.service';
import {
  switchMap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { Observable } from 'rxjs/index';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input() public post: Post;
  @Output() public postDeleted: EventEmitter<Post>
    = new EventEmitter<Post>();
  public isUserCommenting = false;
  public canUserComment = false;
  public canUserEdit = false;
  public isEditing = false;

  constructor(
    private service: BackendService
  ) { }

  ngOnInit(): void {
    const role = this.service.getRole(this.post);

    /* Determine which role the user is in and adjust the components
     * accordingly. */
    this.canUserComment = role === 'user' || role === 'owner';
    this.canUserEdit = role === 'owner';

    /* If the user account changes, adjust the permissions to the new role. */
    this.service.changedUser.subscribe(
      (username) => {
        const userRole = this.service.getRole(this.post);
        this.canUserComment = userRole === 'user' || userRole === 'owner';
        this.canUserEdit = userRole === 'owner';
      },
      () => {},
      () => {});
  }

  onCommentButtonClicked(): void {
    this.isUserCommenting = !this.isUserCommenting;
  }

  onDeleteButtonClicked(): void {
    this.service.deletePost(this.post._id)
      .subscribe(
        (result) => {
          if (result) {
            this.postDeleted.emit(this.post);
          }
        },
        (err) => console.error('error deleting post:', err),
        () => {});
  }

  onEditButtonClicked(): void {
    this.isEditing = !this.isEditing;
  }

  onPostDeleted(post): void {
    const index = this.post.comments.indexOf(post);
    if (index >= 0) {
      this.post.comments.splice(index, 1);
    }
  }

  onPostPublished(comment): void {
    this.post.comments.push(comment);
    this.isUserCommenting = false;
  }

  onPostEdited(post): void {
    this.isEditing = false;
  }
}

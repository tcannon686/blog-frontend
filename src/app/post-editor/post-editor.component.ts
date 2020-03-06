import {
  Component,
  AfterViewInit,
  Input,
  Output,
  ViewChild,
  ElementRef,
  EventEmitter
} from '@angular/core';
import { BackendService, Post } from '../backend.service';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.css']
})
export class PostEditorComponent implements AfterViewInit {

  @Input() public responseTo: Post;
  @Input() public postToEdit: Post;

  @Output() public postPublished: EventEmitter<Post>
    = new EventEmitter<Post>();

  @ViewChild('textArea') private textArea: ElementRef;

  constructor(
    private service: BackendService
  ) { }

  ngAfterViewInit(): void {
    if(this.postToEdit)
      this.textArea.nativeElement.value = this.postToEdit.text;
  }

  onPublishButtonClicked(): void {
    const text: string = this.textArea.nativeElement.value;
    this.textArea.nativeElement.value = "";
    /* If editing a post, update the post. */
    if(this.postToEdit)
      this.service.editPost(this.postToEdit._id, text)
        .subscribe(
          (post) => {
            /* Overwrite the post with the freshly edited post. */
            if(post) {
              Object.assign(this.postToEdit, post);
              this.postPublished.emit(post)
            }
          },
          (err) => console.error("Backend error:", err),
          () => {});
    /* If commenting on a post, create a post commenting to it. */
    else if(this.responseTo)
      this.service.createPost(this.responseTo._id, text)
        .subscribe(
          (post) => {
            if(post)
              this.postPublished.emit(post)
          },
          (err) => console.error("Backend error:", err),
          () => {});
    /* Otherwise we are just creating a regular post. */
    else
      this.service.createPost(null, text)
        .subscribe(
          (post) => {
            if(post)
              this.postPublished.emit(post)
          },
          (err) => console.error("Backend error:", err),
          () => {});
  }
}

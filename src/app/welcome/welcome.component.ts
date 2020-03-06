import { Component, OnInit } from '@angular/core';
import { Blog, BackendService } from '../backend.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  blogs: Observable<Blog[]>;

  constructor(
    private service: BackendService
  ) { }

  ngOnInit(): void {
    this.blogs = this.service.blogs();
  }

}

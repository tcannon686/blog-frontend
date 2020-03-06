import { Component, OnInit } from '@angular/core';
import { BackendService } from './backend.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Blogs!';
  username: string = null;

  constructor(
    private service: BackendService
  ) {}

  ngOnInit(): void {
    this.username = this.service.getUsername();
    this.service.changedUser.subscribe(
      (username) => this.username = username,
      () => {},
      () => {});
  }
}

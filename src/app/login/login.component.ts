import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { Router } from '@angular/router';

export class Login {
  constructor(
    public username: string,
    public password: string
  ) {}
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  model = new Login('', '');

  success = false;
  showMessage = false;
  message = null;

  constructor(
    private router: Router,
    private service: BackendService
  ) { }

  ngOnInit(): void {
  }

  onCreateAccountClicked(): void {
    this.service.createUser(this.model.username, this.model.password)
      .subscribe(
        (success) => {
          if (success) {
            this.success = true;
            this.message = 'Created account!';
            this.showMessage = true;
          } else {
            this.success = false;
            this.message = 'Failed to create account!';
            this.showMessage = true;
          }
        },
        (err) => {
          console.error(err);
          this.success = false;
          this.message = 'Failed to create account! ' + err;
          this.showMessage = true;
        },
        () => {});
  }

  onSubmit(): void {
    /* Sign in the user. */
    this.service.authenticateUser(this.model.username, this.model.password)
      .subscribe(
        (username) => this.router.navigate(['blogs', username]),
        (err) => {
          this.success = false;
          this.message = 'Failed to sign in! ' + err;
          this.showMessage = true;
        },
        () => {});
  }
}

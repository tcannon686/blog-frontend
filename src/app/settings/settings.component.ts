import { Component, OnInit } from '@angular/core';
import { BackendService, UserSettings } from '../backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  model = new UserSettings();

  success = false;
  showMessage = false;
  message = null;

  username = null;

  constructor(
    private router: Router,
    private service: BackendService
  ) { }

  ngOnInit(): void {
    this.username = this.service.getUsername();
    this.service.changedUser.subscribe(
      (username) => this.username = username,
      () => {},
      () => {});
    this.service.userSettings().subscribe(
      (settings: UserSettings) => {
        this.model = settings;
      },
      (error) => { console.error(error); },
      () => {});
  }

  onLogoutClicked(): void {
    /* Logout and navigate to the homepage. */
    this.service.logout();
    this.router.navigate(["/"]);
  }

  onSubmit(): void {
    this.service.updateUserSettings(this.model)
      .subscribe(
        (result) => {
          if(result) {
            this.success = true;
            this.message = "Updated settings!";
            this.showMessage = true;
          } else {
            this.success = false;
            this.message = "Failed to update settings!";
            this.showMessage = true;
          }
        },
        (err) => {
          this.success = false;
          this.message = "Failed to update settings!";
          this.showMessage = true;
          console.error(err);
        },
        () => {})
  }

}

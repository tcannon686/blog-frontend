import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { PostFeedComponent } from './post-feed/post-feed.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { BackendService } from './backend.service';

import { HttpClientModule } from '@angular/common/http';
import { PostComponent } from './post/post.component';
import { PostEditorComponent } from './post-editor/post-editor.component';
import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: "blogs/:user", component: PostFeedComponent },
  { path: "login", component: LoginComponent },
  { path: "settings", component: SettingsComponent },
  { path: "", component: WelcomeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    PostFeedComponent,
    WelcomeComponent,
    PostComponent,
    PostEditorComponent,
    LoginComponent,
    SettingsComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

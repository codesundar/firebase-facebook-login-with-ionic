import { Component } from '@angular/core';
import { ToastController, Platform } from 'ionic-angular';
import * as firebase from 'firebase';

import { Facebook } from '@ionic-native/facebook';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  isUserLoggedIn: any = false;
  userData: any = {};


  constructor(public toastCtrl: ToastController, public platform: Platform, public facebook: Facebook) {
    firebase.auth().onAuthStateChanged(authData => {
      if (authData != null) {
        this.isUserLoggedIn = true;
        this.userData = authData;
        console.log(authData);
      } else {
        this.userData = {};
      }
    });
  }

  logout() {
    firebase.auth().signOut();
  }

  displayToast(message) {
    this.toastCtrl.create({ message, duration: 3000 }).present();
  }


  facebookLogin() {
    // popup for browser
    if (this.platform.is('core')) {
      firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider()).then(fbRes => {
        this.displayToast('login success');
        this.userData = fbRes.additionalUserInfo.profile;
      }).catch(err => this.displayToast(err));
    }

    // pop as cordova plugin
    else {
      this.facebook.login(['public_profile', 'email']).then(res => {
        let credential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        firebase.auth().signInWithCredential(credential).then(() => {
          // fetching user data
          this.facebook.api("me/?fields=id,email,first_name,picture,gender", ["public_profile", "email"]).then(data => {
            console.log(data)
          }).catch(err => this.displayToast(err));

        }).catch((err) => this.displayToast(err));

      }).catch(err => this.displayToast(err));
    }

  }

}

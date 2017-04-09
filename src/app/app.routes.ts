import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RoomComponent } from './components/room/room.component';
//import { AboutComponent } from './about';
//import { NoContentComponent } from './no-content';

//import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'r', redirectTo:'/home', pathMatch:'full' },
    { path: 'r/:roomId', component: RoomComponent },
    { path: '**', component: HomeComponent },
];

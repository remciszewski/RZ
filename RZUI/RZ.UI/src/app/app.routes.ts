import { Routes } from '@angular/router';
import { TasksListComponent } from './components/tasks/tasks-list/tasks-list.component';

export const routes: Routes = [
    {
        path: '',
        component: TasksListComponent
    },
    {
        path: 'tasks',
        component: TasksListComponent
    }
];

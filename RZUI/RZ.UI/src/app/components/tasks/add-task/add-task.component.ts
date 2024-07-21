import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { task } from '../../../models/task.model';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent {
  
  baseApiUrl = environment.baseApiUrl;
  taskForm!: FormGroup;
  tasks$ = this.getAllTasks();
  constructor(private http: HttpClient, private router:Router)
  {
    this.taskForm = new FormGroup({
      zadanie: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      rodzaj: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      priorytet: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      opis: new FormControl<string | null>(null, { validators: Validators.maxLength(200) })
    });
  }

  onFormSubmit() {
    if (this.taskForm.valid) {
      const addTaskRequest = {
        zadanie: this.taskForm.value.zadanie!,
        rodzaj: this.taskForm.value.rodzaj!,
        priorytet: this.taskForm.value.priorytet!,
        opis: this.taskForm.value.opis ?? '',
        dataOd: this.formatDate(new Date()),
        dataDo: this.calculateDueDate(this.taskForm.value.rodzaj!),
        status: 'Nowe'
      };

      this.http.post(`${this.baseApiUrl}/api/tasks/$`, addTaskRequest).subscribe({
        next: (value) => {
          console.log('Pomyślnie dodano zadanie:', value);
          this.tasks$ = this.getAllTasks();
          this.router.navigate(['/tasks']);
        }
      });
    } else {
      console.error('Niepoprawnie wypełniony formularz.');
    }
  }

  getAllTasks(): Observable<task[]> {
    return this.http.get<task[]>(`${this.baseApiUrl}/api/tasks/$`);
  }

  calculateDueDate(rodzaj: string): string {
    const currentDate = new Date();
    switch (rodzaj) {
      case 'Rodzaj 1':
        currentDate.setDate(currentDate.getDate() + 30);
        break;
      case 'Rodzaj 2':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'Rodzaj 3':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
    }
    return this.formatDate(currentDate);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

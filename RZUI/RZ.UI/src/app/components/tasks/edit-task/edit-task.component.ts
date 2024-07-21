import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { task } from '../../../models/task.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent {
  baseApiUrl = environment.baseApiUrl;
  taskForm: FormGroup;
  taskDetails!: task;
  availableStatuses: string[] = [];
  originalDueDate!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      zadanie: ['', Validators.required],
      rodzaj: ['', Validators.required],
      priorytet: ['', Validators.required],
      opis: [''],
      dataDo: ['', Validators.required],
      status: [{ value: '', disabled: true }, Validators.required],
      newDueDate: [{ value: '', disabled: true }],
      powod: ['']
    });

    this.getTask();
    this.onStatusChanges();

    this.taskForm.get('powod')?.valueChanges.pipe().subscribe(() => {
      this.toggleNewDueDateField();
    });

    this.toggleNewDueDateField();
  }

  private getTask() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.getTaskById(id).subscribe(task => {
          this.taskDetails = task;
          this.originalDueDate = this.formatDateToISO(new Date(task.dataDo));
          this.taskForm.patchValue({
            zadanie: task.zadanie,
            rodzaj: task.rodzaj,
            priorytet: task.priorytet,
            opis: task.opis,
            dataDo: this.originalDueDate,
            status: task.status,
            newDueDate: '',
            powod: ''
          });
          this.setAvailableStatuses(task.status);
        });
      }
    });
  }

  private getTaskById(id: string): Observable<task> {
    return this.http.get<task>(`${this.baseApiUrl}/api/tasks/${id}`).pipe(
      tap(task => {
        this.taskDetails = task;
        this.originalDueDate = this.formatDateToISO(new Date(task.dataDo));
        this.taskForm.patchValue({
          zadanie: task.zadanie,
          rodzaj: task.rodzaj,
          priorytet: task.priorytet,
          opis: task.opis,
          dataDo: this.originalDueDate,
          status: task.status,
          newDueDate: '',
          powod: ''
        });
        this.setAvailableStatuses(task.status);
      })
    );
  }

  private updateTask(taskData: task): Observable<task> {
    const id = this.taskDetails.id;
    return this.http.put<task>(`${this.baseApiUrl}/api/tasks/${id}`, taskData);
  }

  deleteTask(id: string): void {
    if (confirm('Czy na pewno chcesz usunąć zadanie?')) {
      this.http.delete<task>(`${this.baseApiUrl}/api/tasks/${id}`).subscribe({
        next: () => {
          console.log('Zadanie zostało usunięte.');
          this.router.navigate(['/tasks']);
        },
        error: error => {
          console.error('Wystąpił błąd podczas usuwania zadania:', error);
          alert('Usuwanie zadania nie powiodło się.');
        }
      });
    }
  }

  private setAvailableStatuses(currentStatus: string) {
    if (currentStatus === 'Nowe') {
      this.availableStatuses = ['Zakończone'];
    } else if (currentStatus === 'Zakończone') {
      this.availableStatuses = ['Wznowione'];
    } else if (currentStatus === 'Wznowione') {
      this.availableStatuses = ['Zakończone'];
    }
    this.taskForm.get('status')!.enable();
  }

  private onStatusChanges() {
    this.taskForm.get('status')!.valueChanges.subscribe(status => {
      if (status === 'Zakończone') {
        this.disableFormExceptStatus();
      } else {
        this.enableForm();
      }
    });
  }

  private enableForm() {
    this.taskForm.enable();
  }

  private disableFormExceptStatus() {
    Object.keys(this.taskForm.controls).forEach(control => {
      if (control !== 'status') {
        this.taskForm.get(control)!.disable();
      }
    });
    this.taskForm.get('status')!.enable();
  }

  private toggleNewDueDateField() {
    if (this.taskForm.get('powod')?.value) {
      this.taskForm.get('newDueDate')?.enable();
    } else {
      this.taskForm.get('newDueDate')?.disable();
    }
  }

  onFormSubmit() {
    if (this.taskForm.valid) {
      const dataDoValue = this.taskForm.get('dataDo')?.value;
      const newDueDateValue = this.taskForm.get('newDueDate')?.value;

      let dueDate: Date | null = dataDoValue ? new Date(dataDoValue) : null;

      if (newDueDateValue && dueDate && !isNaN(dueDate.getTime())) {
        const daysToAdd = parseInt(newDueDateValue, 10);
        if (!isNaN(daysToAdd)) {
          dueDate.setDate(dueDate.getDate() + daysToAdd);
        }
      }

      if (dueDate && !isNaN(dueDate.getTime())) {
        const updatedTaskData: task = {
          ...this.taskDetails,
          ...this.taskForm.value,
          dataDo: this.formatDateToISO(dueDate)
        };

        this.updateTask(updatedTaskData).subscribe({
          next: response => {
            console.log('Zadanie zaktualizowano pomyślnie', response);
            this.router.navigate(['/tasks']);
          },
          error: error => {
            console.error('Wystąpił błąd podczas aktualizacji zadania:', error);
          }
        });
      } 
    } else {
      alert('Niepoprawnie uzupełniony formularz.');
    }
  }

  private formatDateToISO(date: Date): string {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
  }
}

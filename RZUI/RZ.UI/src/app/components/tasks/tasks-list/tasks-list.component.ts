import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Observable, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { task } from '../../../models/task.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, DatePipe, RouterLink, HttpClientModule, ReactiveFormsModule],
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.css']
})
export class TasksListComponent implements OnInit {
  tasks$: Observable<task[]>;
  filteredTasks$!: Observable<task[]>;
  searchForm: FormGroup;
  baseApiUrl = environment.baseApiUrl;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      priorytet: [''],
      rodzaj: [''],
      dataOd: [''],
      dataDo: ['']
    });
    this.tasks$ = this.getAllTasks();
  }

  ngOnInit() {
    this.filteredTasks$ = combineLatest([
      this.tasks$,
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value))
    ]).pipe(
      map(([tasks, searchValues]) => this.filterTasks(tasks, searchValues))
    );
  }

  getAllTasks(): Observable<task[]> {
    return this.http.get<task[]>(`${this.baseApiUrl}/api/tasks/$`);
  }

  private filterTasks(tasks: task[], searchValues: any): task[] {
    const { priorytet, rodzaj, dataOd, dataDo } = searchValues;
    return tasks.filter(task => {
      const matchesPriorytet = priorytet ? task.priorytet.toLowerCase().includes(priorytet.toLowerCase()) : true;
      const matchesRodzaj = rodzaj ? task.rodzaj.toLowerCase().includes(rodzaj.toLowerCase()) : true;
      const matchesDataOd = dataOd ? new Date(task.dataOd) >= new Date(dataOd) : true;
      const matchesDataDo = dataDo ? new Date(task.dataDo) <= new Date(dataDo) : true;
      return matchesPriorytet && matchesRodzaj && matchesDataOd && matchesDataDo;
    });
  }
}

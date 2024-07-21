import { Component } from '@angular/core';
import { task } from '../../../models/task.model';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css'
})
export class TasksListComponent {
  tasks: task[] = [
    {
      id: '1',
      zadanie: "Zadanie 1",
      rodzaj: 'Rodzaj 1',
      priorytet: 'Wysoki',
      opis: 'Testowy opis',
      dataOd: new Date(),
      dataDo: this.calculateDataDo(new Date())
    }
  ];

  private calculateDataDo(date: Date): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + 7);
    return result;
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

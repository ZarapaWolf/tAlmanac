import {Component, OnInit} from '@angular/core';
import 'moment/locale/ru'
import {MatDialog} from '@angular/material/dialog'
import {DialogComponent} from "../dialog/dialog.component";
import {CalendarDay, CalendarService} from "../../service/calendar.service";
import {MeasurementDay} from "../../model/MeasurementDay";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  checked = false;

  constructor(public calendarService: CalendarService,
              private dialog: MatDialog) { }

  ngOnInit(): void {

  }

  changeToggle() {
    this.checked = !this.checked
  }

  openDialog(disabled: boolean, day: CalendarDay) {
    if (!disabled) {
      let dialogRef = this.dialog.open(DialogComponent)
      let instance = dialogRef.componentInstance
      instance.clickedDay = this.calendarService.findMeasurementDay(day.value) ?? MeasurementDay.prototype
    }
  }

}

import { Component, OnInit } from '@angular/core';
import {CalendarService} from "../../service/calendar.service";
import {MeasurementDay} from "../../model/MeasurementDay";
import {OnlyAvailableDaysService} from "../../service/only-available-days.service";
import {DialogComponent} from "../dialog/dialog.component";
import {MatDialog} from "@angular/material/dialog";

//TODO move to model and maybe find better name
export interface Month {
  name: string
  days: MeasurementDay[]
}

export interface Year {
  name: string
  months: Month[]
}

@Component({
  selector: 'app-only-available-days',
  templateUrl: './only-available-days.component.html',
  styleUrls: ['./only-available-days.component.scss']
})
export class OnlyAvailableDaysComponent implements OnInit {

  currentYear: Year

  constructor(public calendarService: CalendarService,
              private availableDaysService: OnlyAvailableDaysService,
              private dialog: MatDialog) {
    availableDaysService.currentYear.subscribe(value => this.currentYear = value)
  }

  ngOnInit(): void {}

  openDialog(day: MeasurementDay) {
    let dialogRef = this.dialog.open(DialogComponent)
    let instance = dialogRef.componentInstance
    instance.clickedDay = day
  }

}

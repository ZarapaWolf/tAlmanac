import moment from "moment";
import Base = moment.unitOfTime.Base;
import {MeasurementDay} from "../model/MeasurementDay";
import {Temperature} from "../model/Temperature";
import {Pressure} from "../model/Pressure";
import {Humidity} from "../model/Humidity";
import {Coordinates} from "../model/coordinates.model";

export class TestData {

  static days: MeasurementDay[] = [
    new MeasurementDay(
      18,
      'апрель',
      2022,
      [
        new Temperature(-9, '03:24', {latitude: 62.52084968, longitude: 172.3650415}),
        new Temperature(-1, '10:30', {latitude: 6.466968332, longitude: -2.84971815}),
        new Temperature(8, '14:40', {latitude: -42.414464991, longitude: -124.12068037}),
        new Temperature(15, '15:52', {latitude: 2.50857943, longitude: -85.015141761}),
        new Temperature(10, '22:40', {latitude: 85.48177991, longitude: 99.177266776}),
        new Temperature(2, '23:59', {latitude: -8.796422837, longitude: 164.919311821})
      ] as Temperature[],
      [
        new Pressure(420, '03:24', {latitude: 62.52084968, longitude: 172.3650415}),
        new Pressure(720, '10:30', {latitude: 6.466968332, longitude: -2.84971815}),
        new Pressure(790, '14:40', {latitude: -42.414464991, longitude: -124.12068037}),
        new Pressure(615, '15:52', {latitude: 2.50857943, longitude: -85.015141761}),
        new Pressure(551, '22:40', {latitude: 85.48177991, longitude: 99.177266776}),
        new Pressure(722, '23:59', {latitude: -8.796422837, longitude: 164.919311821}),
      ] as Pressure[],
      [
        new Humidity(62, '03:24', {latitude: 62.52084968, longitude: 172.3650415}),
        new Humidity(65, '10:30', {latitude: 6.466968332, longitude: -2.84971815}),
        new Humidity(67, '14:40', {latitude: -42.414464991, longitude: -124.12068037}),
        new Humidity(77, '15:52', {latitude: 2.50857943, longitude: -85.015141761}),
        new Humidity(60, '22:40', {latitude: 85.48177991, longitude: 99.177266776}),
        new Humidity(24, '23:59', {latitude: -8.796422837, longitude: 164.919311821}),
      ] as Humidity[]
    ),
    new MeasurementDay(
      19,
      'май',
      2022,
      [
        new Temperature(-7, '06:12', {latitude: 67.043669757, longitude: -19.948693374}),
        new Temperature(2, '12:33', {latitude:19.53111973, longitude: 89.802604750}),
        new Temperature(17, '12:44', {latitude:-18.04723390, longitude: -88.273840316}),
        new Temperature(17, '15:59', {latitude:40.67810521, longitude: 20.527521135}),
        new Temperature(12, '20:22', {latitude:74.086845487, longitude: -125.356701468}),
        new Temperature(-12, '22:31', {latitude:-19.997442946, longitude: -36.62551822})
      ],
      [
        new Pressure(750, '06:12', {latitude: 67.043669757, longitude: -19.948693374}),
        new Pressure(793, '12:33', {latitude:19.53111973, longitude: 89.802604750}),
        new Pressure(477, '12:44', {latitude:-18.04723390, longitude: -88.273840316}),
        new Pressure(681, '15:59', {latitude:40.67810521, longitude: 20.527521135}),
        new Pressure(455, '20:22', {latitude:74.086845487, longitude: -125.356701468}),
        new Pressure(515, '22:31', {latitude:-19.997442946, longitude: -36.62551822}),
      ],
      [
        new Humidity(34, '06:12', {latitude: 67.043669757, longitude: -19.948693374}),
        new Humidity(30, '12:33', {latitude:19.53111973, longitude: 89.802604750}),
        new Humidity(34, '12:44', {latitude:-18.04723390, longitude: -88.273840316}),
        new Humidity(57, '15:59', {latitude:40.67810521, longitude: 20.527521135}),
        new Humidity(11, '20:22', {latitude:74.086845487, longitude: -125.356701468}),
        new Humidity(66, '22:31', {latitude:-19.997442946, longitude: -36.62551822})
      ]
    ),
  ]

  static generateRandomData(numberRandomDays: number, numberMeasurements: number): MeasurementDay[] {
    const randomData: MeasurementDay[] = []

    for (let i = 0; i < numberRandomDays; i++) {
      const temperatures: Temperature[] = []
      const pressures: Pressure[] = []
      const humidities: Humidity[] = []

      // [[50.61412751351062,99.36913671112116],[53.807963145401345,109.91601171112114]] irk obl
      const coordinates: Coordinates = this.getRandomCoordinates(
        50.61412751351062, 53.807963145401345,
        99.36913671112116, 109.91601171112114
      )

      let minTime = 5
      let maxTime = 7
      for (let j = 0; j < numberMeasurements; j++) {
        const time = this.getRandomTimeInBetween(minTime+=2, maxTime+=2)
        let startRange = 0.000000
        const rangeStep = 0.100000
        const nearlyRandomCoords = this.getRandomNearlyCoordinates(coordinates, startRange+=rangeStep)

        temperatures.push(new Temperature(this.getRandomInt(0, 30), time, nearlyRandomCoords))
        pressures.push(new Pressure(this.getRandomInt(600, 750), time, nearlyRandomCoords))
        humidities.push(new Humidity(this.getRandomInt(30, 80), time, nearlyRandomCoords))
      }

      randomData.push(
        new MeasurementDay(
          this.getRandomInt(1, 30),
          this.getRandomMomentInBetween(0, 1, 'month', 'MMMM'),
          +this.getRandomMomentInBetween(0, 0, 'year', 'YYYY'),
          temperatures,
          pressures,
          humidities
        )
      )
    }

    return randomData
  }

  private static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  private static getRandomNotRoundInt(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  private static getRandomTimeInBetween(start: number, end: number): string {
    const hour = start + Math.random() * (end - start) | 0
    const date = new Date()
    date.setHours(hour)
    date.setMinutes(this.getRandomInt(0, 60))
    return moment(date).format('HH:mm')
  }

  private static getRandomMomentInBetween(min: number, max: number, unit: Base,
                                          format: string): string {
    return moment().clone().add(this.getRandomInt(min, max), unit).format(format)
  }

  private static getRandomCoordinates(latFrom: number, latTo: number, longFrom: number, longTo: number): Coordinates {
    return {latitude: this.getRandomNotRoundInt(latFrom, latTo), longitude: this.getRandomNotRoundInt(longFrom, longTo)}
  }

  private static getRandomNearlyCoordinates(coordinates: Coordinates, range: number): Coordinates {
    return this.getRandomCoordinates(coordinates.latitude-range, coordinates.latitude+range,
      coordinates.longitude-range, coordinates.longitude+range)
  }
}




import {Component, OnInit} from '@angular/core';
import {YaEvent, YaReadyEvent} from "angular8-yandex-maps";
import {AnimationOptions} from "ngx-lottie";
import {YaMapService} from "./ya-map.service";
import {DayPlacemark, DayPlacemarkDataset, Feature, FeatureCollection, TimePlacemarkDataset} from "./ya-map.model";
import IGeoObject = ymaps.IGeoObject;
import {CustomCloseButtonManager} from "./CustomCloseButtonManager";
import {CustomDayPlacemarkBalloon} from "./CustomDayPlacemarkBalloon";
import {DateService} from "../../service/date.service";

type MapState = 'zoomIn' | 'zoomOut'

@Component({
  selector: 'app-ya-map',
  templateUrl: './ya-map.component.html',
  styleUrls: ['./ya-map.component.scss']
})

export class YaMapComponent implements OnInit {
  public options: AnimationOptions = {
    path: '/assets/lottie/map_loading_animation.json'
  }
  public clustererOptions: ymaps.IClustererOptions = {
    gridSize: 48,
    maxZoom: 8,
    clusterIconLayout: 'default#pieChart',
    clusterIconPieChartRadius: 25,
    clusterIconPieChartCoreRadius: 10,
    clusterIconPieChartStrokeWidth: 3,
    hasHint: true
  }
  public objectManagerOptions: ymaps.IObjectManagerOptions = {
    clusterize: false
  }
  public dayPlacemarks: DayPlacemark[] = []
  public featureCollections: FeatureCollection[] = []

  private mapClusterer?: ymaps.Clusterer = undefined
  private previousZoom: number = 7
  private mapState: MapState = "zoomOut"
  private dayPlacemarksMap: Map<ymaps.Placemark, DayPlacemark> = new Map<ymaps.Placemark, DayPlacemark>()
  private objectManagersMap: Map<ymaps.ObjectManager, DayPlacemark> = new Map<ymaps.ObjectManager, DayPlacemark>()
  private dayPlacemarkBalloonFactory = new CustomDayPlacemarkBalloon()

  constructor(private readonly yaMapService: YaMapService,
              private readonly dateService: DateService) {}

  public ngOnInit(): void {
    const dayPlacemarkDatasets: DayPlacemarkDataset[] = this.yaMapService.separateCoordinatesByDay()
    this.initDayPlacemarksArray(dayPlacemarkDatasets);
  }

  public onSizeChange(event: YaEvent<ymaps.Map>): void {
    const currentZoom: number = event.target.getZoom()
    if (currentZoom != this.previousZoom) {
      this.ifMapZoomChanged(currentZoom)
    }
  }

  public onBalloonOpen({target}: YaEvent<ymaps.Map>): void {
    if (CustomCloseButtonManager.balloonCloseElementIsExist()) {
      CustomCloseButtonManager.changeDefaultCloseButton()
    }
    CustomCloseButtonManager.attachCloseButtonEvent(target.balloon)
  }

  public onBalloonClose(): void {
    CustomCloseButtonManager.detachCloseButtonEvent()
  }

  public onClustererReady({target}: YaReadyEvent<ymaps.Clusterer>): void {
    this.mapClusterer = target
    this.setClustersHint(target?.getClusters())
  }

  public onPlacemarkReady(event: YaReadyEvent<ymaps.Placemark>, placemark: DayPlacemark): void {
    this.setDayPlacemarkBalloonLayout(event, placemark)
    this.dayPlacemarksMap.set(event.target, placemark)
  }

  public onObjectManagerReady({target}: YaReadyEvent<ymaps.ObjectManager>, placemark: DayPlacemark): void {
    this.objectManagersMap.set(target, placemark)
  }

  private initDayPlacemarksArray(dataset: DayPlacemarkDataset[]): void {
    this.dayPlacemarks = this.dayPlacemarks.concat(this.createAllGeoObjects(dataset))
  }

  private setDayPlacemarkBalloonLayout(event: YaReadyEvent<ymaps.Placemark>, placemark: DayPlacemark): void {
    const balloonContentLayout = this.dayPlacemarkBalloonFactory.create(event, placemark)
    event.target.options.set('balloonContentLayout', balloonContentLayout)
  }

  private createAllGeoObjects(dayDatasets: DayPlacemarkDataset[]): DayPlacemark[] {
    const dayPlacemarks: DayPlacemark[] = []
    dayDatasets.forEach(dayDataset => {
      dayPlacemarks.push(this.createDayPlacemark(dayDataset))
    })
    return dayPlacemarks
  }

  private createDayPlacemark(dayDataset: DayPlacemarkDataset): DayPlacemark {
    return {
      geometry: {type: 'Point', coordinates: dayDataset.coordinates},
      properties: {
        balloonContentHeader: this.dateService.declensionDate(dayDataset.date),
        balloonContent: this.getDayPlacemarkBalloonContent(dayDataset),
        iconCaption: this.dateService.declensionDate(dayDataset.date)
      },
      options: {
        preset: 'islands#circleDotIcon',
        iconColor: dayDataset.color,
        hasBalloon: true,
        balloonPanelMaxMapArea: 0,
        balloonCloseButton: false
      },
      timePlacemarks: this.createTimePlacemarksFromDataset(dayDataset)
    }
  }

  private createTimePlacemarksFromDataset(dayDataset: DayPlacemarkDataset): Feature[] {
    let index: number = 0
    const timePlacemarks: Feature[] = []
    dayDataset.timeDatasets.forEach(timeDataset => {
      timePlacemarks.push(this.createTimePlacemark(index++, timeDataset))
    })
    return timePlacemarks
  }

  private getDayPlacemarkBalloonContent(dayDataset: DayPlacemarkDataset): string {
    return  `
            Coordinates:
            <br>
            ${dayDataset.coordinates[0].toFixed(5)},
            ${dayDataset.coordinates[1].toFixed(5)}
            <br>
            <br>
            ${dayDataset.balloonContent}
            `
  }

  private createTimePlacemark(index: number, timeDataset: TimePlacemarkDataset): Feature {
    return {
      type: "Feature",
      id: index,
      geometry: {type: 'Point', coordinates: timeDataset.coordinates},
      properties: {
        balloonContentHeader: `${timeDataset.time} ${this.dateService.declensionDate(timeDataset.date)}`,
        balloonContent: this.getTimePlacemarkBalloonContent(timeDataset),
        hintContent: `${timeDataset.time} ${this.dateService.declensionDate(timeDataset.date)}`,
      },
      options: {
        preset: 'islands#dotIcon',
        iconColor: timeDataset.color,
      }
    }
  }

  private getTimePlacemarkBalloonContent(dataset: TimePlacemarkDataset): string {
    return  `
            Coordinates:
            <br>
            ${dataset.coordinates[0].toFixed(5)},
            ${dataset.coordinates[1].toFixed(5)}
            <br>
            <br>
            ${dataset.balloonContent}
            `
  }

  private ifMapZoomChanged(currentZoom: number): void {
    this.previousZoom = currentZoom
    this.setClustersHint(this.mapClusterer?.getClusters())

    if (currentZoom >= 9 && this.mapState == 'zoomOut') {
      this.changeMapPlacemarksToZoomInState()

    } else if (currentZoom < 9 && this.mapState == 'zoomIn') {
      this.changeMapPlacemarksToZoomOutState()
    }
  }

  private setClustersHint(clusters?: IGeoObject[]): void {
    clusters?.forEach(cluster => {
      const clusterObjects = this.sortGeoObjectsByCluster(cluster)
      const clusterHint: string = this.createClusterHint(clusterObjects)
      cluster.properties.set('hintContent', clusterHint)
    })
  }

  private sortGeoObjectsByCluster(cluster: IGeoObject<ymaps.IGeometry>): ymaps.IGeoObject<ymaps.IGeometry>[] {
    const clusterObjects: ymaps.IGeoObject<ymaps.IGeometry>[] = []
    this.mapClusterer?.getGeoObjects().forEach(value => {
      const objectState = this.mapClusterer?.getObjectState(value)
      if (objectState?.cluster === cluster) clusterObjects.push(value)
    })
    return clusterObjects
  }

  private createClusterHint(clusterObjects: ymaps.IGeoObject<ymaps.IGeometry>[]): string {
    return 'Contains:<br>' + clusterObjects.map(object => object.properties.get('iconCaption')).join('<br>')
  }

  private changeMapPlacemarksToZoomInState(): void {
    this.mapState = 'zoomIn'
    this.dayPlacemarksMap.forEach((value, key) => {
      key.options.set('visible', false)
      this.objectManagersMap.forEach((mark, manager) =>
        manager.add(mark.timePlacemarks))
    })
  }

  private changeMapPlacemarksToZoomOutState(): void {
    this.mapState = 'zoomOut'
    this.dayPlacemarksMap.forEach((value, key) => key.options.set('visible', true))
    this.objectManagersMap.forEach((mark, manager) => manager.removeAll())
  }
}



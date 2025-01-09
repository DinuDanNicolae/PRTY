import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import esriConfig from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;

  map!: __esri.WebMap;
  view!: __esri.MapView;
  graphicsLayer!: __esri.GraphicsLayer;

  userLocation!: Point;
  center = [26.1025, 44.4268];
  zoom = 15;
  basemap = 'streets-vector';
  loaded = false;
  eventsForLocation: { Titlu: string; Data: string }[] = [];
  selectedEvent: any = null;


  private alreadyAddedAddresses = new Set<string>();

  constructor() {}

  ngOnInit() {
    this.initializeMap().then(() => {
      this.loaded = this.view.ready;
      this.mapLoadedEvent.emit(true);

      this.centerOnUserLocation();
      this.addReturnToUserButton();
      this.loadEventsFromFirestore();
      this.setupClickHandler();
    });
  }

  async initializeMap() {
    esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurFqD00vY7bGuzgL7YVpcSL4oyGcwxAqV3Uu7xyCDF0EIydT6fSsCqOs3MDqSSwpLPHtCZWSJXGDVa6La0DaUc0zZJQ-_hEM7L7bbF0GLAYjdW5AOzKYgqgEfqhAQ4eKFLLbdyB_uzund6K7MHw-50z3EPmHemdjQ6Zh7OE4c7agS0pw-9AvEJoUXUOSPX8aKWCrdGhJtkOQfrdruoOhu-w4.AT1_vizk5X9t";


    this.map = new WebMap({
      basemap: this.basemap,
    });

    this.view = new MapView({
      container: this.mapViewEl.nativeElement,
      center: this.center as [number, number],
      zoom: this.zoom,
      map: this.map,
    });

    this.graphicsLayer = new GraphicsLayer();
    this.map.add(this.graphicsLayer);

    try {
      await this.view.when();
      console.log('Map loaded successfully.');
      return this.view;
    } catch (error) {
      console.error('Error loading map:', error);
      return null;
    }
  }

  setupClickHandler() {
    this.view.on('click', async (event: __esri.ViewClickEvent) => {
      const hitTestResponse = await this.view.hitTest(event);
  
      const graphicResult = hitTestResponse.results.find(
        (result) =>
          'graphic' in result &&
          (result.graphic as __esri.Graphic).layer === this.graphicsLayer
      );
  
      if (graphicResult && 'graphic' in graphicResult) {
        const graphic = graphicResult.graphic as __esri.Graphic;
        const events = graphic.attributes?.events || [];
        this.eventsForLocation = events.sort(
          (a: any, b: any) =>
            new Date(a.Data).getTime() - new Date(b.Data).getTime()
        );
      }
    });
  }
  
  
  closeTab() {
    this.eventsForLocation = [];
    this.selectedEvent = null;
  }
  showEventDetails(event: any) {
    this.selectedEvent = event;
  }
  backToList() {
    this.selectedEvent = null;
  }
    

  centerOnUserLocation() {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.userLocation = new Point({ longitude, latitude });
        this.view.goTo({ center: this.userLocation, zoom: this.zoom });
        this.addUserLocationMarker(latitude, longitude);
      },
      (error) => {
        console.error('Error getting user location:', error);
      }
    );
  }

  addUserLocationMarker(lat: number, lon: number) {
    const userPoint = new Point({ longitude: lon, latitude: lat });
    const markerSymbol = {
      type: 'simple-marker',
      style: 'circle',
      color: 'black',
      size: '12px',
      outline: { color: 'white', width: 2 },
    };
    const graphic = new Graphic({
      geometry: userPoint,
      symbol: markerSymbol,
    });
    this.graphicsLayer.add(graphic);
  }

  addReturnToUserButton() {
    const button = document.createElement('button');
    button.innerText = 'Recenter';
    button.className = 'locate-button';
    button.addEventListener('click', () => {
      this.recentreOnUser();
    });
    document.body.appendChild(button);
  }

  recentreOnUser() {
    if (this.userLocation) {
      this.view.goTo({ center: this.userLocation, zoom: this.zoom });
    } else {
      console.error('User location is not available.');
    }
  }

  async loadEventsFromFirestore() {
    const projectId = 'prty-2cc91';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/events`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const events = data.documents.map((doc: any) => ({
        Titlu: doc.fields.Titlu.stringValue,
        Ora: doc.fields.Ora.stringValue,
        Data: doc.fields.Data.stringValue,
        Adresa: doc.fields.Adresă.stringValue, 
        Locatie: doc.fields.Locație.stringValue,
        URLImagine: doc.fields['URL Imagine']?.stringValue || '',
      }));
      

      events.forEach((event: any) => {
        if (!this.alreadyAddedAddresses.has(event.Adresa)) {
          this.alreadyAddedAddresses.add(event.Adresa);

          this.geocodeAddressWithGoogle(event.Adresa).then((location) => {
            if (location) {
              const point = new Point({
                latitude: location.lat,
                longitude: location.lng,
              });
          
             
              const eventsAtLocation = events.filter((e: { Adresa: string }) => e.Adresa === event.Adresa);
          
              this.addEventMarker(point, eventsAtLocation);
            }
          });
          
        }
      });
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  geocodeAddressWithGoogle(address: string): Promise<{ lat: number; lng: number } | null> {
   
    const specificAddress = `${address}, București, România`.trim();
    console.log('Geocodăm adresa completată:', specificAddress);
  
    const googleApiKey = 'AIzaSyCovI73yXQQec4aitK4VerBAMRbIvPMe1Y';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      specificAddress
    )}&key=${googleApiKey}`;
  
    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log('Răspuns Google Geocoding API pentru:', specificAddress, data);
        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          console.log('Locație geocodată:', location);
          return { lat: location.lat, lng: location.lng };
        } else {
          console.warn('Geocodare eșuată pentru:', specificAddress, data);
          return null;
        }
      })
      .catch((error) => {
        console.error('Eroare la geocodare pentru:', specificAddress, error);
        return null;
      });
  }
  

  addEventMarker(point: Point, events: any[]) {
    const tearDropSymbol = {
      type: 'simple-marker',
      style: 'circle',
      color: 'orange',
      size: '16px',
      outline: { color: 'white', width: 2 },
    };

    const graphic = new Graphic({
      geometry: point,
      symbol: tearDropSymbol,
      attributes: { events },
    });

    this.graphicsLayer.add(graphic);
  }
}
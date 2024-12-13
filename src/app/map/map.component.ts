import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import esri = __esri;
import WebMap from '@arcgis/core/WebMap';
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import esriConfig from "@arcgis/core/config";
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

@Component({
  selector: "app-map",
  standalone: true,
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent implements OnInit {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  @ViewChild("mapViewNode", { static: true }) private mapViewEl!: ElementRef;

  map!: esri.Map;
  view!: esri.MapView;
  graphicsLayer!: esri.GraphicsLayer;

  center = [26.1025, 44.4268];
  zoom = 12;
  basemap = "streets-vector";
  loaded = false;
  directionsElement: any;

  overpassQuery = `[out:json][timeout:25];
  (
    node["amenity"="restaurant"](44.3,25.9,44.6,26.3);
    node["amenity"="bar"](44.3,25.9,44.6,26.3);
    node["amenity"="pub"](44.3,25.9,44.6,26.3);
  );
  out body;
  >;
  out skel qt;`;

  constructor() { }

  ngOnInit() {
    this.initializeMap().then(() => {
      this.loaded = this.view.ready;
      this.mapLoadedEvent.emit(true);

      // Once the map is ready, load data from Overpass and display it
      this.fetchOverpassData().then(geojson => {
        this.addGeoJSONLayer(geojson);
      }).catch(err => console.error("Error fetching Overpass data:", err));
    });
  }

  async initializeMap() {
      esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurFqD00vY7bGuzgL7YVpcSL4oyGcwxAqV3Uu7xyCDF0EIydT6fSsCqOs3MDqSSwpLPHtCZWSJXGDVa6La0DaUc0zZJQ-_hEM7L7bbF0GLAYjdW5AOzKYgqgEfqhAQ4eKFLLbdyB_uzund6K7MHw-50z3EPmHemdjQ6Zh7OE4c7agS0pw-9AvEJoUXUOSPX8aKWCrdGhJtkOQfrdruoOhu-w4.AT1_vizk5X9t";

      const mapProperties: esri.WebMapProperties = {
        basemap: this.basemap
      };
      this.map = new WebMap(mapProperties);

      this.addGraphicsLayer();

      const mapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this.center,
        zoom: this.zoom,
        map: this.map
      };
      this.view = new MapView(mapViewProperties);

      const restaurantsLayer = new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/US_Restaurants/FeatureServer/0",
        outFields: ["*"]
      });
  
      this.map.add(restaurantsLayer);

      await this.view.when();
      console.log("ArcGIS map loaded");
      return this.view;

    } catch (error: any) {
      console.error("Error loading the map: ", error);
      alert("Error loading the map");
    }

  addGraphicsLayer() {
    this.graphicsLayer = new GraphicsLayer();
    this.map.add(this.graphicsLayer);
  }

  async fetchOverpassData(): Promise<any> {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: this.overpassQuery })
    });

    const overpassData = await response.json();
    // Convert Overpass JSON to GeoJSON
    return this.convertOverpassToGeoJSON(overpassData);
  }

  convertOverpassToGeoJSON(overpassData: any) {
    // Overpass returns data in "elements" array.
    // Each element can be a node with lat/lon and tags.
    const features = overpassData.elements
      .filter((el: any) => el.type === 'node')
      .map((node: any) => {
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [node.lon, node.lat]
          },
          properties: node.tags
        };
      });

    return {
      type: "FeatureCollection",
      features: features
    };
  }

  addGeoJSONLayer(geojson: any) {
    const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

const geojsonLayer = new GeoJSONLayer({
  url: url,
  labelingInfo: [{
    symbol: {
      type: "text",
      color: "black",
      haloColor: "white",
      haloSize: "1px",
      font: {
        size: 10,
        family: "Arial Unicode MS"
      }
    },
    labelExpressionInfo: {
      expression: "$feature.name"
    },
    labelPlacement: "above-center"
  }]
});


    this.map.add(geojsonLayer);
    console.log("GeoJSON Layer added with Overpass POIs");
  }
}


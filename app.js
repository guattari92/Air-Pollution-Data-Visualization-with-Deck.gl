import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {GeoJsonLayer} from 'deck.gl';
import {scaleThreshold} from 'd3-scale';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken || 'pk.eyJ1IjoiZ3VhdHRhcmk5MiIsImEiOiJjam9ucHZoYXMxNHFmM3FvNHNyc3ljeWNzIn0.yVS1vm8GrZbJ0RKGnjk44g'; // eslint-disable-line
// Source data GeoJSON
const DATA_URL =
  'http://guattari92.github.io/airq_1.json'; // eslint-disable-line

  export const COLOR_SCALE = scaleThreshold()
    .domain([1, 2])
    .range([
      [255, 102, 178],
      [255, 102, 178],
      [102, 178, 255]
    ]);

const LIGHT_SETTINGS = {
  lightsPosition: [-125, 50.5, 5000, -122.8, 48.5, 8000],
  ambientRatio: 0.2,
  diffuseRatio: 0.5,
  specularRatio: 0.3,
  lightsStrength: [2.0, 0.0, 1.0, 0.0],
  numberOfLights: 2
};

export const INITIAL_VIEW_STATE = {
  latitude: 34.203,
  longitude: -118.25,
  zoom: 11,
  maxZoom: 16,
  pitch: 45,
  bearing: 0
};

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredObject: null
    };
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderLayers() {
    const {data = DATA_URL} = this.props;

    return [
      new GeoJsonLayer({
        id: 'geojson',
        data,
        opacity: 0.8,
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        fp64: true,
        getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 5000,
        getFillColor: f => COLOR_SCALE(f.properties.growth),
        getLineColor: [255, 255, 255],
        lightSettings: LIGHT_SETTINGS,
        pickable: true,
        onHover: this._onHover
      })
    ];
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    return (
      hoveredObject && (
        <div className="tooltip" style={{top: y, left: x}}>
          <div>
            <b>Average Property Value</b>
          </div>
          <div>
            <div>${hoveredObject.properties.valuePerParcel} / parcel</div>
            <div>
              ${hoveredObject.properties.valuePerSqm} / m<sup>2</sup>
            </div>
          </div>
          <div>
            <b>Growth</b>
          </div>
          <div>{Math.round(hoveredObject.properties.growth * 1)}%</div>
        </div>
      )
    );
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/light-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}

        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}

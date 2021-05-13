
import React, { PureComponent } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import Geocoder from 'react-mapbox-gl-geocoder';
import { Container, Col, Row, Button } from 'reactstrap';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapStyle = {
    width: '100%',
    height: 600
}

const mapboxApiKey = 'pk.eyJ1IjoibGF1cmVuY3VuIiwiYSI6ImNrb2Fjbzd3MDA4MGoybm4yZngyemY4ODQifQ.SJCVadPR08pwCg5xQ2yclw';

const params = {
  country: 'us'
}

const horses = [  
{id: 1, rescue_org: "Horse Rescue #1", place_name: 'Chicago, IL'},
{id: 2, rescue_org: "Horse Rescue #1", place_name: 'Indiana, IN'},
{id: 3, rescue_org: "Horse Rescue #2", place_name: 'Miami, FL'},
{id: 4, rescue_org: "Horse Rescue #2", place_name: 'Tampa, FL'},
{id: 5, rescue_org: "Horse Rescue 3", place_name: 'Austin, TX'},
{id: 6, rescue_org: "Horse Rescue 3", place_name: 'Houston, TX'},
]

const CustomMarker = ({index, marker, openPopup}) => {
  return (
    <Marker
      longitude={marker.longitude}
      latitude={marker.latitude}>
      <div className="marker" onClick={() => openPopup(index)}>
        <span><b>{index + 1}</b></span>
      </div>
    </Marker>
  )
};


const CustomPopup = ({index, marker, closePopup}) => {
  return (
    <Popup
      latitude={marker.latitude}
      longitude={marker.longitude}
      onClose={closePopup}
      closeButton={true}
      closeOnClick={false}
      offsetTop={-30}
     >
      <p>{marker.rescue_org}</p>
      <p>{marker.place_name}</p>
    </Popup>
  )};



class MapView extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 40,
        longitude: -100,
        zoom: 3.5
      },
      tempMarker: null,
      markers: [],
      selectedIndex: null
    };

  }
  

  componentDidMount() {
    horses.forEach (horse => {
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${horse.place_name}.json?limit=1&access_token=${mapboxApiKey}`)
      .then(res => res.json())
      .then(data => {
        let horse_data = {
          id: horse.id,
          index: horse.id,
          rescue_org: horse.rescue_org,
          place_name: horse.place_name,
          latitude: data.features[0].geometry.coordinates[1], 
          longitude: data.features[0].geometry.coordinates[0]
        }
        this.addHorseLocations(horse_data)
      })
    })
  }


  addHorseLocations = horse_data => {
    this.setState(prevState => ({
      markers: [...prevState.markers, horse_data]
      })
    )
  }


  onSelected = (viewport, item) => {
    this.setState({
      viewport,
      tempMarker: {
        name: item.place_name,
        longitude: item.center[0],
        latitude: item.center[1]
      }
    })
  }

  add = () => {
    var { tempMarker } = this.state

    this.setState(prevState => ({
        markers: [...prevState.markers, tempMarker],
        tempMarker: null
    }))
  }

  //set selected marker to show info on pop-up
  setSelectedMarker = (index) => {
    this.setState({ selectedIndex: index })
  }

  closePopup = () => {
      this.setSelectedMarker(null)
  };

  openPopup = (index) => {
    console.log(index)
      this.setSelectedMarker(index)
  }

  render() {

    const { viewport, tempMarker, markers } = this.state;
    return(
      <Container fluid={true}>
        <Row>
          <Col><h2>Mapbox Tutorial</h2></Col>
        </Row>

        <Row className="py-4">
          <Col xs={2}>
            <Geocoder
                mapboxApiAccessToken={mapboxApiKey}
                onSelected={this.onSelected}
                viewport={viewport}
                hideOnSelect={true}
                value=""
                queryParams={params}
            />
          </Col>
          <Col>
           <Button color="primary" onClick={this.add}>Add</Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <ReactMapGL
              mapboxApiAccessToken={mapboxApiKey}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              {...viewport}
              {...mapStyle}
              onViewportChange={(viewport) => this.setState({viewport})}
              >

              { tempMarker &&
                <Marker
                  longitude={tempMarker.longitude}
                  latitude={tempMarker.latitude}>
                  <div className="marker temporary-marker"><span></span></div>
                </Marker>
              }

              {
                this.state.markers.map((marker, index) => {
                  return(
                    <CustomMarker
                      key={`marker-${index}`}
                      index={index}
                      marker={marker}
                      openPopup = {this.openPopup}
                    />
                  )
                })
              },
              {                
                this.state.selectedIndex !== null &&
                  <CustomPopup
                    index={this.state.selectedIndex}
                    marker={markers[this.state.selectedIndex]}
                    closePopup={this.closePopup}
                  />
              }
            </ReactMapGL>
          </Col>
        </Row>
      </Container>
   );
  }
}

export default MapView;
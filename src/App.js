import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
// import {
//   BrowserRouter as Router,
//   Switch,
//   Route,
//   Link,
//   useHistory
// } from 'react-router-dom';
import {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardSubtitle,
  Button,
  FormGroup,
  Form,
  Input,
  Label,
  Navbar,

} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import './tempesttheme.css'
import './App.css';



function App() {

  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState();
  const [zip, setZip] = useState("");
  const [unit, setUnit] = useState("f");
  const [validated, setValidated] = useState();
  const [googleMapsReady, setGoogleMapsReady] = useState(false);


  useEffect(() => {
    const loadGoogleMaps = (callback) => {
      const existingScript = document.getElementById('googleMaps');

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyATEgAhkU0SLNGbmzp5td2pC-VL2cZBot0&libraries=places';
        script.id = 'googleMaps';
        document.body.appendChild(script);

        script.onload = () => {
          if (callback) callback();
        };
      }

      if (existingScript && callback) callback();
    };
    loadGoogleMaps(() => { setGoogleMapsReady(true) })
  }, [])

  const validate = (e) => {
    e.preventDefault();
    if (zip.length == 5) {
      retrieveLatLng();
      setValidated(true);
    } else { setValidated(false) }
  }

  const retrieveLatLng = async (props) => {
    await geocodeByAddress(zip)
      .then(results => getLatLng(results[0]))
      .then(latLng => phoneHome(latLng))
      .catch(error => console.error('Error', error));
  }

  const phoneHome = async (latLng) => {
    await axios.get("https://api.openweathermap.org/data/2.5/onecall?lat=" + latLng.lat + "&lon=" + latLng.lng + "&appid=b9cb3cec77c14b5037dec0def981f206")
      .then(response =>
        setWeather(response.data)
      )
      .catch(error => console.log(error))
  };

  const setWeather = async (response) => {
    console.log(response)
    await setData(response);
    await setLoaded(true);
    await console.log(data);
  }

  const setTemp = (temp) => {
    var displayTemp = unit == "f" ? Math.round((temp - 273.15) * 9 / 5 + 32) : Math.round(temp - 273.15);
    return (displayTemp);
  }


  const suns = (suntime) => {
    var stime = new Date(suntime * 1000)
    return (stime.toLocaleTimeString());

  }

  const reset = (e) => {
    e.preventDefault();
    setLoaded(false);
    setZip(null);
    setValidated();
  }

  return (



    <Container className="mt-3 mx-auto justify-content-center">
      <Row>
        <Col className="col-md-5 text-center mx-auto">
          <Card>
            <CardTitle className="mt-3"><h3>Tempest Prognosticator</h3></CardTitle>
            <CardSubtitle><h5>A Lightweight Weather App</h5></CardSubtitle>
            <CardBody>
              {loaded == false && googleMapsReady && (<Form onSubmit={(e) => { validate(e) }}>
                <FormGroup>
                  <Label for="zipField">Enter your zip code</Label>
                  <Col className="col-md-5 mx-auto">
                    <Input type="number" name="zipField" id="zipField" placeholder="40515" onChange={(e) => setZip(e.target.value)} value={zip} />
                  </Col>
                  {validated == false && <p className="text-danger">Please enter a valid zip code</p>}
                </FormGroup>
                <Button type="submit" >Get Weather</Button>
              </Form>)}
              {loaded == true && (<><Button type="button" onClick={(e) => { reset(e) }}>Search Again</Button><br/>
              <Button className="mt-2" type="button" onClick={() => { unit == "f" ? setUnit("c") : setUnit("f") }}>{unit == "f" ? <>&#8451;</> : (<>&#8457;</>)}</Button>
              </>)}
            </CardBody>
          </Card>
          {loaded == true && (
            <>
              <Card className="text-center">
                <CardTitle className="mt-2">
                  <Col>
                    
                  <h5 className="text-center">Current Temperature</h5>
                  </Col>
                </CardTitle>
                <CardBody><CardText>
                  <Row>
                    <Col className="text-center">
                      <h6>Real Temp</h6>
                      {setTemp(data.current.temp)}{unit == "f" ? <sup>&#8457;</sup> : <sup>&#8451;</sup>}
                    </Col>
                    <Col className="text-center">
                      <h6>Feels Like</h6>
                      {setTemp(data.current.feels_like)}{unit == "f" ? <sup>&#8457;</sup> : <sup>&#8451;</sup>}
                    </Col>
                    <Col className="text-center"><h6>Humidity</h6>
                      {data.current.humidity}%
                </Col>
                  </Row></CardText>
                </CardBody>
              </Card>
              <Card>
                <CardTitle className="mt-2" id="weatherTitle">
                  <h5 className="text-center">Current Weather</h5>
                </CardTitle>
                <CardBody id="weatherBody">
                  <CardText>
                    <Row>
                      <Col className="text-center">
                        <img src={"http://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png"} />
                        <p>{data.current.weather[0].description}</p>

                      </Col>
                    </Row>
                    <Row>
                      <Col className="text-center">
                        <h6>Cloud Cover</h6>
                        {data.current.clouds}%
                </Col>
                      <Col className="text-center">
                        <h6>Visibility</h6>
                        {Math.round(data.current.visibility * 0.000621371)} miles
                </Col>

                      <Col className="text-center">
                        <h6>Winds</h6>
                        {Math.round(data.current.wind_speed * 2.23694)} MPH
                </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col className="text-center">
                        <h6>Sunrise</h6>
                        {suns(data.current.sunrise)}
                      </Col>
                      <Col className="text-center">
                        <h6>Sunset</h6>
                        {suns(data.current.sunset)}
                      </Col>
                    </Row>
                  </CardText>
                </CardBody>
              </Card>
              </>
          )

          }
        </Col>
      </Row>
      <Navbar color="primary" className="fixed-bottom justify-content-center">
          <FontAwesomeIcon href="https://www.linkedin.com/in/armiller-lexky" icon={faLinkedinIn} className="ml-5 mr-3 text-light" />
          <FontAwesomeIcon href="https://github.com/AllisonRMiller/tempest-prognosticator" icon={faGithub} className="mr-3 text-light" />
          <FontAwesomeIcon href="" icon={faGlobe} className="text-light" />

      </Navbar>
    </Container>

  );
};

export default App;

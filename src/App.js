import { Wrapper } from "@googlemaps/react-wrapper";
import { useState, useEffect } from "react";
import { getPosition, options } from "./utils/getPosition";
import Map from "./Components/Map";
import Marker from "./Components/Marker";
import Form from "./Components/Form";

function App() {
  // Shows Loading or loads the map if it's ready
  const render = (status) => {
    return <h1>{status}</h1>;
  };

  const [clicks, setClicks] = useState([]);
  const [zoom, setZoom] = useState(10); // initial zoom
  const [center, setCenter] = useState({ lat: 0, lng: 0 }); // initial position

  const onClick = (e) => {
    setClicks([...clicks, e.latLng]);
  };

  const onIdle = (m) => {
    console.log("onIdle");
    setZoom(m.getZoom());
    setCenter(m.getCenter().toJSON());
  };

  useEffect(() => {
    getPosition(options)
      .then((pos) => {
        const crd = pos.coords;
        setCenter({ lat: crd.latitude, lng: crd.longitude }); // move the center to approximate position based on geolocation
        console.log("Your current position is:");
        console.log("Latitude : " + crd.latitude);
        console.log("Longitude: " + crd.longitude);
      })
      .catch((error) => {
        console.warn("ERROR(" + error.code + "): " + error.message);
      });
  }, []);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Wrapper apiKey={process.env.REACT_APP_MAPS_API_KEY} render={render}>
        <Map center={center} onClick={onClick} onIdle={onIdle} zoom={zoom}>
          {/* Draw each marker */}
          {clicks.map((latLng, i) => (
            <Marker key={i} position={latLng} />
          ))}
        </Map>
      </Wrapper>
      {/* Basic form for controlling center and zoom of map. */}
      <Form
        center={center}
        zoom={zoom}
        clicks={clicks}
        setCenter={setCenter}
        setZoom={setZoom}
        setClicks={setClicks}
      />
    </div>
  );
}
export default App;

import React, { useState } from "react";
import { placeData } from "./Data";

function App() {
  const [latitude, setLatitude] = useState(1.33);
  const [longitude, setLongitude] = useState(103.85);
  const [status, setStatus] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [cameraID, setCameraID] = useState("");

  const url = "https://api.data.gov.sg/v1/transport/traffic-images";

  const ImageComponent = (cameras, latitude, longitude) => {
    const location = cameras.map((item) => item.location);

    let dist = [];
    for (let i = 0; i < cameras.length; i++) {
      dist.push(
        (latitude - location[i].latitude) ** 2 +
          (longitude - location[i].longitude) ** 2
      );
    }

    let closestCameraIndex = dist.indexOf(Math.min.apply(Math, dist), 0);

    const imageURL = cameras[closestCameraIndex].image;
    setImageURL(imageURL);
    setTimestamp(
      `Capture time: ${new Date(cameras[closestCameraIndex].timestamp)}

Camera location: (${cameras[closestCameraIndex].location.latitude}, ${
        cameras[closestCameraIndex].location.longitude
      })`
    );

    const cameraID = cameras[closestCameraIndex].camera_id;
    setCameraID(`Camera output of ${cameraID}`);
  };

  const handleChange = (e) => {
    e.preventDefault();

    const place = e.target.value;
    if (place !== "None") {
      let placeIndex;

      for (let i = 0; i < placeData.length; i++) {
        if (placeData[i].place === place) {
          placeIndex = i;
        }
      }

      setLatitude(placeData[placeIndex].latitude);
      setLongitude(placeData[placeIndex].longitude);
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          const lastUpdated = new Date(data.items[0].timestamp);
          setStatus(
            `API status: ${data.api_info.status} | API last updated: ${lastUpdated}`
          );
          console.log(status);

          const cameras = data.items[0].cameras;
          const lat = placeData[placeIndex].latitude;
          const lon = placeData[placeIndex].longitude;

          ImageComponent(cameras, lat, lon);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (latitude && longitude) {
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          const lastUpdated = new Date(data.items[0].timestamp);
          setStatus(
            `API status: ${data.api_info.status} | API last updated: ${lastUpdated}`
          );
          console.log(status);

          const cameras = data.items[0].cameras;
          ImageComponent(cameras, latitude, longitude);
        });
    } else {
      console.log("Please enter valid latitude and longitude.");
    }
  };

  // not working in safari
  // const getLocation = () => {
  //   navigator.geolocation.getCurrentPosition(function (location) {
  //     setLatitude(location.coords.latitude);
  //     setLongitude(location.coords.longitude);
  //   });
  // };

  return (
    <div className="container">
      <h3>Singapore traffic camera</h3>
      <p>Monitor traffic around you in Singapore.</p>
      <form className="form" onChange={handleChange}>
        <label htmlFor="place">Choose a location form here: &nbsp;</label>
        <select id="place" name="place">
          <option value="None">None selected</option>
          {placeData.map((item, index) => (
            <option value={item.place} key={index}>
              {item.place}
            </option>
          ))}
        </select>
      </form>

      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="latitude">Or enter latitude: </label>
          <input
            type="number"
            step="0.0001"
            id="latitude"
            name="latitude"
            value={latitude}
            onChange={(e) => {
              setLatitude(e.target.value);
            }}
          ></input>
          <br />
          <br />
          <label htmlFor="longitude">and longitude: </label>
          <input
            type="number"
            step="0.0001"
            id="longitude"
            name="longitude"
            value={longitude}
            onChange={(e) => {
              setLongitude(e.target.value);
            }}
          ></input>
        </div>

        <button className="btn" type="submit" onClick={handleSubmit}>
          Submit
        </button>
        {/* <br />
          Or request your device location{" "}
          <button className="btn" type="submit" onClick={getLocation}>
            Get location
          </button> */}
      </form>

      <img className="image" src={imageURL} alt={cameraID} />
      <p></p>
      <br />
      <pre className="fineprint">
        <code>{timestamp}</code>
      </pre>
      <br />
      <br />
      <footer>
        Made with <span className="love">♥</span> by{" "}
        <a href="https://pranabdas.github.io/">Pranab</a>.
      </footer>
    </div>
  );
}

export default App;

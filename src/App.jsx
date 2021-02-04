import React from 'react';

const placeData = [
  {
    "place": "Buona Vista",
    "latitude": 1.3072937,
    "longitude": 103.7878576
  },
  {
    "place": "Changi",
    "latitude": 1.3519297,
    "longitude": 103.9638572
  },
  {
    "place": "MacRitchie", 
    "latitude": 1.344432,
    "longitude": 103.8132492
  },
  {
    "place": "Marymount",
    "latitude": 1.353926, 
    "longitude": 103.8368598
  },
  {
    "place": "Novena", 
    "latitude": 1.3261354, 
    "longitude": 103.8203441
  },
  {
    "place": "Toa Payoh", 
    "latitude": 1.3364408, 
    "longitude": 103.8449139
  },
  {
      "place": "West Coast",
      "latitude": 1.303632,
      "longitude": 103.7489425
  },
  {
      "place": "Woodlands", 
      "latitude": 1.4414269,
      "longitude": 103.7707968
  },
  {
    "place": "Queenstown",
    "latitude": 1.286899,
    "longitude": 103.7487583
  },
  {
    "place": "Yishun",
    "latitude": 1.4190688, 
    "longitude": 103.7999337
  }
];

function App() {

  const [latitude, setLatitude] = React.useState(1.3236);
  const [longitude, setLongitude] = React.useState(103.8587);
  const [status, setStatus] = React.useState('');
  const [imageURL, setImageURL] = React.useState('');
  const [timestamp, setTimestamp] = React.useState('');
  const [cameraID, setCameraID] = React.useState('');

  const url = "https://api.data.gov.sg/v1/transport/traffic-images"

  const ImageComponent = (cameras, latitude, longitude) => {
    const location = cameras.map((item) => item.location);

    let dist = [];
    for (let i=0; i<cameras.length; i++){
        dist.push((latitude - location[i].latitude)**2 
                + (longitude -location[i].longitude)**2);
    };

    let closestCameraIndex = dist.indexOf(Math.min.apply(Math, dist), 0);
    
    const imageURL = cameras[closestCameraIndex].image;
    setImageURL(imageURL);
    setTimestamp(`Captured at ${new 
        Date(cameras[closestCameraIndex].timestamp)}`);

    const cameraID = cameras[closestCameraIndex].camera_id;
    setCameraID(`Camera output of ${cameraID}`);
  };

  const handleChange = (e) => {
    e.preventDefault();

    const place = e.target.value;
    if (place !== "None"){
      let placeIndex;

      for (let i=0; i<placeData.length; i++){
        if (placeData[i].place === place) {
          placeIndex = i;
        }
      };

      setLatitude(placeData[placeIndex].latitude);
      setLongitude(placeData[placeIndex].longitude)
      fetch(url)
      .then((r) => r.json())
      .then((data)  => {
        const lastUpdated = new Date(data.items[0].timestamp);
        setStatus(`API status: ${data.api_info.status} | API last updated: ${lastUpdated}`);
        console.log(status);

        const cameras = data.items[0].cameras;
        const lat = placeData[placeIndex].latitude;
        const lon = placeData[placeIndex].longitude;

        ImageComponent(cameras, lat, lon);
      })
  }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (latitude && longitude) {
      fetch(url)
      .then((r) => r.json())
      .then((data)  => {
        const lastUpdated = new Date(data.items[0].timestamp);
        setStatus(`API status: ${data.api_info.status} | API last updated: ${lastUpdated}`);
        console.log(status);

        const cameras = data.items[0].cameras;
        ImageComponent(cameras, latitude, longitude);
      }) 
    } else {
      console.log('Please enter valid latitude and longitude.');
    }
  };

  return(
    <div className="container">
      <h3>Singapore traffic camera</h3>
      <p>Monitor traffic around you in Singapore.</p>
      <form className="form" onChange={handleChange}>
            <label htmlFor="place">Choose a location form here: &nbsp;</label>
            <select id="place" name="place">
                <option value="None">None selected</option>
                <option value="Buona Vista">Buona Vista</option>
                <option value="Changi">Changi</option>
                <option value="MacRitchie">MacRitchie</option>
                <option value="Marymount">Marymount</option>
                <option value="Novena">Novena</option>
                <option value="Toa Payoh">Toa Payoh</option>
                <option value="West Coast">West Coast</option>
                <option value="Woodlands">Woodlands</option>
                <option value="Queenstown">Queenstown</option>
                <option value="Yishun">Yishun</option>
            </select>
      </form>
      
      <form className='form' onSubmit={handleSubmit}>
        <div>
          <label htmlFor="latitude">Or enter latitude: </label>
          <input 
          type="number" 
          step="0.0001" 
          id="latitude" 
          name="latitude" 
          value={latitude}
          onChange={(e) => {setLatitude(e.target.value)}}
          ></input>
          <br/>
          <br/>
          <label htmlFor="longitude">and longitude: </label>
          <input 
          type="number" 
          step="0.0001" 
          id="longitude" 
          name="longitude" 
          value={longitude}
          onChange={(e) => {setLongitude(e.target.value)}}
          ></input>
        </div>
        
        <button className='btn' type="submit" onClick={handleSubmit}>Submit</button>
      </form>
 
      <img className="image" src={imageURL} alt={cameraID} />
      <p></p>
      <br/> 
      <pre className="fineprint">
          <code>{timestamp}</code>
      </pre>
      <br/>
      <br/>
      <footer>© Copyright {new Date().getFullYear().toString()} <a href=
      "https://pranabdas.github.io/">Pranab Das</a>. All rights reserved.</footer>
    </div>
  );
};

export default App

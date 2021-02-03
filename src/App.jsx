import React from 'react';

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
    setTimestamp(`Above image taken at ${new 
        Date(cameras[closestCameraIndex].timestamp)}`);

    const cameraID = cameras[closestCameraIndex].camera_id;
    setCameraID(`Camera output of ${cameraID}`);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (latitude && longitude) {
      fetch(url)
      .then((r) => r.json())
      .then((data)  => {
        const lastUpdated = new Date(data.items[0].timestamp);
        setStatus(`API status: ${data.api_info.status} | Last updated: ${lastUpdated}`);

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
      <form className="form">
            <label htmlFor="place">Choose a location form here: &nbsp;</label>
            <select id="place" name="place">
                <option value="None">None selected</option>
                <option value="Queenstown">Queenstown</option>
                <option value="Orchard">Orchard</option>
                <option value="West coast">West coast</option>
            </select>
            {/* <button type="submit" className="btn">Submit</button> */}
      </form>
      
      <form className='form' onSubmit={handleSubmit}>
        <div>
          <label htmlFor="latitude">Enter latitude: </label>
          <input 
          type="number" 
          step="0.0001" 
          id="latitude" 
          name="latitude" 
          value={latitude}
          onChange={(e) => {setLatitude(e.target.value)}}
          ></input>

          <label htmlFor="longitude">Enter longitude: </label>
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
 
      <img src={imageURL} alt={cameraID} />
      <p></p>
      <br/> 
      <pre>
          <code>{timestamp}</code>
      </pre>
      <pre>
          <code>{status}</code>
      </pre>

      <br/>
      <br/>
      <footer>© Copyright {new Date().getFullYear().toString()} <a href=
      "https://pranabdas.github.io/">Pranab Das</a>. All rights reserved.</footer>
    </div>
  );
};

export default App

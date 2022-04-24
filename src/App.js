import { useState } from "react";
import InputLabel from '@mui/material/InputLabel';
import Box from "@mui/material/Box";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Select from "@mui/material/Select";

import { placeData } from "./Data";

function App() {
    const [location, setLocation] = useState(null);
    const [latitude, setLatitude] = useState(1.33);
    const [longitude, setLongitude] = useState(103.85);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [sortedCameraData, setSortedCameraData] = useState([]);
    const [numberOfImages, setNumberOfImages] = useState(0);
    const api = "https://api.data.gov.sg/v1/transport/traffic-images";

    const HandleLocation = (e) => {
        const location = e.target.value;
        setLocation(location);
        setSortedCameraData([]);

        if (location) {
            let placeIndex;

            for (let i = 0; i < placeData.length; i++) {
                if (placeData[i].place === location) {
                    placeIndex = i;
                }
            }

            setLatitude(placeData[placeIndex].latitude);
            setLongitude(placeData[placeIndex].longitude);
        }
    }

    const FetchImage = () => {
        if (latitude && longitude) {
            fetch(api)
                .then((r) => r.json())
                .then((data) => {
                    const lastUpdated = new Date(data.items[0].timestamp);
                    setLastUpdated(`${lastUpdated}`);
                    let cameraData = data.items[0].cameras;

                    let dist = [];
                    for (let i = 0; i < cameraData.length; i++) {
                        dist.push(
                            (parseFloat(latitude) - parseFloat(cameraData[i].location.latitude)) ** 2 +
                            (parseFloat(longitude) - parseFloat(cameraData[i].location.longitude)) ** 2
                        );
                    }

                    let distSorted = [...dist];
                    distSorted.sort(function (a, b) {
                        return a - b;
                    });

                    let sortedCameraData = [];
                    for (let ii = 0; ii < dist.length; ii++) {
                        let index = dist.indexOf(distSorted[ii]);
                        sortedCameraData.push(cameraData[index]);
                    }

                    if (sortedCameraData.length > 0) {
                        setNumberOfImages(1);
                    }

                    setSortedCameraData(sortedCameraData);
                });
        } else {
            console.log("Please enter valid latitude and longitude.");
        }
    };

    const ImageComponent = ({ data, numberOfImages }) => {
        let images = [];

        for (let ii = 0; ii < numberOfImages; ii++) {
            images.push(data[ii])
        }

        return (
            images.map((item, key) => (
                <div key={key}>
                    <img className="image" src={item.image} alt={item.image} />
                    <p>Nearest camera {key + 1} ({item.location.latitude}, {item.location.longitude})</p>
                </div>
            ))
        )
    }

    return (
        <div className="container">
            <div className="wrapper">
                <h3>Singapore traffic camera</h3>
                <p><i>Monitor realtime traffic around you in Singapore expressways</i></p>
                <br />

                <p>Select location:</p>
                <Box sx={{ m: 1, minWidth: 120 }}>
                    <FormControl fullWidth>
                        <InputLabel id="location">Location</InputLabel>
                        <Select
                            labelId="location"
                            id="location"
                            value={location || ""}
                            label="location"
                            onChange={HandleLocation}
                        >
                            {placeData.map((item, key) => (
                                <MenuItem value={item.place} key={key}>
                                    {item.place}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <br />

                <p>Or enter GPS coordinates:</p>
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '25ch' },
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <div>
                        <TextField
                            id="latitude"
                            label="latitude"
                            value={latitude}
                            onChange={(e) => {
                                setLatitude(e.target.value);
                            }}
                        />
                        <TextField
                            id="longitude"
                            label="longitude"
                            value={longitude}
                            onChange={(e) => {
                                setLatitude(e.target.value);
                            }}
                        />
                    </div>
                </Box>

                <button className="btn" onClick={FetchImage}>
                    Fetch latest image
                </button>

                <br />
                <br />

                {sortedCameraData.length && numberOfImages ? (<>
                    <ImageComponent data={sortedCameraData} numberOfImages={numberOfImages} />

                    {lastUpdated ? <p>Camera snapshots last updated at {lastUpdated}</p> : null}

                    <button className="btn" onClick={() => setNumberOfImages(numberOfImages + 1)}>
                        Show next nearest camera
                    </button>
                </>
                ) : null}
            </div>
            <footer>
                Made with <span className="love">♥</span> by{" "}
                <a href="https://pranabdas.github.io/">Pranab</a>.
            </footer>
        </div>
    )
}

export default App;

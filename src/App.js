import { useState } from "react";
import InputLabel from '@mui/material/InputLabel';
import Box from "@mui/material/Box";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Select from "@mui/material/Select";
import Alert from "@mui/material/Alert";

import { placeData } from "./Data";

function App() {
    const [location, setLocation] = useState(null);
    const [latitude, setLatitude] = useState(1.33);
    const [longitude, setLongitude] = useState(103.85);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [sortedCameraData, setSortedCameraData] = useState([]);
    const [numberOfImages, setNumberOfImages] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
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

    async function FetchImage() {
        setLatitude(parseFloat(latitude));
        setLongitude(parseFloat(longitude));

        if ((parseFloat(latitude) >= -90 || parseFloat(latitude) <= 90) && (parseFloat(longitude) >= 0 || parseFloat(longitude) <= 360)) {
            await fetch(api)
                .then((r) => r.json())
                // .then((response) => {
                //     if (!response.ok) {
                //         setErrorMessage("Something went wrong.")
                //     } else {
                //     return response.json()}})
                .then((data) => {
                    const lastUpdated = new Date(data.items[0].timestamp);
                    setLastUpdated(`${lastUpdated}`);
                    let cameraData = data.items[0].cameras;

                    let dist = [];
                    let lat = (parseFloat(latitude) * Math.PI) / 180,
                        lon = (parseFloat(longitude) * Math.PI) / 180;
                    for (let i = 0; i < cameraData.length; i++) {
                        let lat_cam =
                            (parseFloat(cameraData[i].location.latitude) * Math.PI) / 180,
                            lon_cam =
                                (parseFloat(cameraData[i].location.longitude) * Math.PI) / 180;

                        // Haversine formula
                        let a =
                            Math.sin((lat - lat_cam) / 2) ** 2 +
                            Math.cos(lat) *
                            Math.cos(lat_cam) *
                            Math.sin((lon - lon_cam) / 2) ** 2;
                        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        let d = 6371e+3 * c;
                        dist.push(d);
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
                        setSortedCameraData(sortedCameraData);
                        setErrorMessage("");
                    } else {
                        setSortedCameraData([]);
                        setErrorMessage("No camera image to show.");
                    }
                })
                .catch((error) => (setErrorMessage(error)));
        } else {
            setErrorMessage("Please select a location or enter valid GPS coordinates.");
            setSortedCameraData([]);
        }
    };

    const ImageComponent = ({ data, numberOfImages }) => {
        let images = [];

        for (let ii = 0; ii < numberOfImages; ii++) {
            images.push(data[ii])
        }

        return (
            images.map((item, key) => (
                <div key={key} style={{ paddingTop: "1em" }}>
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
                                setLongitude(e.target.value);
                            }}
                        />
                    </div>
                </Box>

                <button className="btn" onClick={FetchImage}>
                    Fetch latest image
                </button>

                <br />
                <br />

                {sortedCameraData.length ? (<>
                    <ImageComponent data={sortedCameraData} numberOfImages={numberOfImages} />

                    {lastUpdated ? <p>Camera snapshots last updated at {lastUpdated}</p> : null}

                    {numberOfImages < sortedCameraData.length ? (
                        <button className="btn" onClick={() => setNumberOfImages(numberOfImages + 1)}>
                            Show next nearest camera
                        </button>
                    ) : null}

                </>
                ) : null}

                <br />
                <br />

                {errorMessage ? (
                    <Alert severity="error">
                        {errorMessage}
                    </Alert>
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

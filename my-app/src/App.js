import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import "../node_modules/react-vis/dist/style.css";
import CSVReader from "react-csv-reader";
import {
  Button,
  PageWithHeader,
  Box,
  Card,
  Flex,
  TopNav,
  Provider as BumbagProvider,
} from "bumbag";
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  LineSeries,
} from "react-vis";
import jstat from "jstat";
import smoothish from "smoothish";
const parserOptions = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: false,
};

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

function calcStat(inputData) {
  const rawArray = inputData.map((x) => x["y"]);
  return {
    mean: parseFloat(jstat.mean(rawArray)).toFixed(3),
    stdev: parseFloat(jstat.stdev(rawArray)).toFixed(3),
    mode: parseFloat(jstat.mode(rawArray)).toFixed(3),
    max: parseFloat(jstat.max(rawArray)).toFixed(3),
    min: parseFloat(jstat.min(rawArray)).toFixed(3),
    range: parseFloat(jstat.range(rawArray)).toFixed(3),
  };
}

function calcMovAvg(inputData, movAvg) {
  const rawArray = inputData.map((x) => x["y"]);
  const smoothArray = smoothish(rawArray, { radius: movAvg });
  return smoothArray.map((currElement, index) => {
    return { y: currElement, x: index }; //equivalent to list[index]
  });
}

function App() {
  const [referenceData, setReferenceData] = useState([]);
  const [exploratoryData, setExploratoryData] = useState([]);
  const [originalExploratoryData, setOriginalExploratoryData] = useState([]);
  const [refStats, setRefStats] = useState({});
  const [exploratoryStats, setExploratoryStats] = useState({});
  const [mse, setMSE] = useState(0);

  const [movAvg, setMovAvg] = useState(1);

  useEffect(() => {
    setRefStats(calcStat(referenceData));
  }, [referenceData]);
  useEffect(() => {
    setExploratoryStats(calcStat(exploratoryData));
  }, [exploratoryData]);
  useEffect(() => {
    const a = referenceData.map((x) => x["y"]);
    const b = exploratoryData.map((x) => x["y"]);
    const minLength = Math.min(a.length, b.length);
    if (a.length == b.length) {
      let error = 0;
      for (let i = 0; i < minLength; i++) {
        const x = isNaN(a[i]) ? 0 : a[i];
        const y = isNaN(b[i]) ? 0 : b[i];
        error += Math.pow(x - y, 2);
      }
      const mse = parseFloat(error / a.length).toFixed(3);
      setMSE(mse);
    }
  }, [exploratoryData]);
  useEffect(() => {
    setExploratoryData(calcMovAvg(originalExploratoryData, movAvg));
  }, [movAvg]);

  const [exploreStats, calculateExploreStats] = useState([]);
  const { height, width } = useWindowDimensions();
  const handleReferenceUpload = (data, fileInfo) => {
    const first_object_name = Object.keys(data[0])[0];
    const formatted_data = data.map((currElement, index) => {
      return { y: currElement[first_object_name], x: index }; //equivalent to list[index]
    });
    setReferenceData(formatted_data);
  };
  const handleSliderChange = (event) => setMovAvg(event.target.value);
  const handleExplorationUpload = (data, fileInfo) => {
    const first_object_name = Object.keys(data[0])[0];
    const formatted_data = data.map((currElement, index) => {
      return { y: currElement[first_object_name], x: index }; //equivalent to list[index]
    });
    setExploratoryData(formatted_data);
    setOriginalExploratoryData(formatted_data);
  };

  return (
    <BumbagProvider>
      <PageWithHeader
        header={
          <TopNav>
            <TopNav.Section>
              <TopNav.Item href="#">
                Team Alpha Hunter - Data Visualisation
              </TopNav.Item>
            </TopNav.Section>
          </TopNav>
        }
        border="default"
        style={{ backgroundColor: "#F2F6FF" }}
      >
        <Box padding="major-2" alignY="center" alignX="center">
          <Flex alignX="center" style={{ width: "100%" }}>
            <Card
              variant="shadowed"
              style={{ margin: "10px", backgroundColor: "#E3E8FF" }}
            >
              <CSVReader
                cssClass="react-csv-input"
                label="Upload a CSV for reference data"
                onFileLoaded={handleReferenceUpload}
                parserOptions={parserOptions}
              />
              <XYPlot height={height * 0.4} width={width * 0.4}>
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <LineSeries data={referenceData} />
              </XYPlot>
            </Card>
            <Card
              variant="shadowed"
              style={{ margin: "10px", backgroundColor: "#E3E8FF" }}
            >
              <CSVReader
                cssClass="react-csv-input"
                label="Upload your CSV for data exploration"
                onFileLoaded={handleExplorationUpload}
                parserOptions={parserOptions}
              />
              <XYPlot height={height * 0.4} width={width * 0.4}>
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis />
                <YAxis />
                <LineSeries data={exploratoryData} />
              </XYPlot>
            </Card>
          </Flex>
        </Box>
        <Flex padding="major-2" alignY="center" alignX="center">
          <Card
            variant="shadowed"
            width="400"
            height="400"
            style={{ margin: "10px", backgroundColor: "#E3E8FF" }}
          >
            <h3>Reference Data Statistics</h3>
            <p>Mean: {refStats.mean} </p>
            <p>Standard Deviation : {refStats.stdev} </p>
            <p>Mode: {refStats.mode} </p>
            <p>Max: {refStats.max} </p>
            <p>Min: {refStats.min} </p>
            <p>Range : {refStats.range} </p>
          </Card>
          <Card
            variant="shadowed"
            width="400"
            height="400"
            style={{ margin: "10px", backgroundColor: "#E3E8FF" }}
          >
            <h3>Exploratory Data Statistics </h3>
            <p>Mean: {exploratoryStats.mean} </p>
            <p>Standard Deviation : {exploratoryStats.stdev} </p>
            <p>Mode: {exploratoryStats.mode} </p>
            <p>Max: {exploratoryStats.max} </p>
            <p>Min: {exploratoryStats.min} </p>
            <p>Range : {exploratoryStats.range} </p>
          </Card>
          <Card
            variant="shadowed"
            width="400"
            height="400"
            style={{ margin: "10px", backgroundColor: "#E3E8FF" }}
          >
            <h3>MSE</h3>
            <h2>{mse}</h2>
          </Card>
          <Card
            variant="shadowed"
            width="400"
            height="400"
            style={{ margin: "10px", backgroundColor: "#E3E8FF" }}
          >
            <h3>Adjust smoothing factor: {movAvg} </h3>
            <input
              type="range"
              min="1"
              max="15"
              value={movAvg}
              onChange={handleSliderChange}
              class="slider"
            />
          </Card>
        </Flex>
      </PageWithHeader>
    </BumbagProvider>
  );
}

export default App;

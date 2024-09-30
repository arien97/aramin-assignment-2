import React, { useState, useEffect } from 'react';
import DropDown from './DropDown';
import Input from './Input';
import Options from './Options';
import axios from 'axios';
import styled from "styled-components";

const StyledTitle = styled.h1`
  color:  midnightblue;
  font-size: calc(2rem + 2rem);
  text-align: center;
`

const PlotContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`

const StyledButton = styled.button`
    background-color: #B2DBDD;
    padding: 0.5% 2%;
    border-radius: 8px;
    border-color: white;
    display: block;
    margin: 0 auto;
    color: white;

    &:hover {
        background-color: cadetblue;
    }
`

const KMeansPlot = () => {
    const [method, setMethod] = useState('Random');
    const [k, setK] = useState(3);
    const [image, setImage] = useState('');
    const [manualCenters, setManualCenters] = useState([]);
    const [isManualMode, setIsManualMode] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false); // New state variable

    useEffect(() => {
        generateNewDataset();
    }, []);

    useEffect(() => {
        setManualCenters([]);
        setIsManualMode(false);
        setIsInitialized(false); // Reset initialization state
    }, [method]);

    const generateNewDataset = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/generate_dataset');
            console.log('Generate Dataset Response:', response.data);
            setImage(response.data.image);
        } catch (error) {
            console.error('Error generating new dataset:', error);
        }
    };

    const initializeCenters = async () => {
        setManualCenters([]);
        setIsManualMode(false);
    
        if (method === 'Manual') {
            setIsManualMode(true);
            alert('Click on the plot to select centers manually.');
        } else {
            try {
                console.log(`Initializing centers with k=${k} and method=${method}`);
                const response = await axios.post('http://127.0.0.1:5000/initialize_centers', { k, method });
                console.log('Initialize Centers Response:', response.data);
                setImage(response.data.image);
                setIsInitialized(true); // Set initialization state
                console.log('Initialization state set to true');
            } catch (error) {
                console.error('Error initializing centers:', error);
            }
        }
    };

    const selectCenter = async (event, k) => {
        if (isManualMode && manualCenters.length < k) {
            const rect = event.target.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 20 - 10;
            const y = ((event.clientY - rect.top) / rect.height) * -20 + 10;
            const newCenters = [...manualCenters, { x, y }];
            setManualCenters(newCenters);
    
            console.log("k is: ", k, "newCenters.length = ", newCenters.length);
    
            try {
                const response = await axios.post('http://127.0.0.1:5000/update_plot_with_center', { centers: newCenters });
                setImage(response.data.image);
            } catch (error) {
                console.error('Error updating plot with center:', error);
            }
    
            if (parseInt(newCenters.length) === parseInt(k)) {
                console.log("We got here");
                setIsManualMode(false);
                setIsInitialized(true);
                try {
                    const response = await axios.post('http://127.0.0.1:5000/initialize_centers_manual', { centers: newCenters });
                    setImage(response.data.image);
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Error initializing manual centers:', error);
                }
            }
        }
    };
    
    

    const stepThroughKMeans = async () => {
        console.log('Step Through KMeans button clicked');
        if (!isInitialized) {
            alert('Initialization required');
            return;
        }
    
        try {
            const response = await axios.post('http://127.0.0.1:5000/step_kmeans');
            console.log('Step Through KMeans Response:', response.data);
            if (response.data.image) {
                setImage(response.data.image);
            } else if (response.data.message) {
                alert(response.data.message);
            } else {
                alert('Unexpected response from server.');
            }
        } catch (error) {
            console.error('Error stepping through KMeans:', error);
            alert('Error stepping through KMeans.');
        }
    };
    

    const runToConvergence = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/run_to_convergence');
            console.log('Run to Convergence Response:', response.data);
            if (response.data.image) {
                setImage(response.data.image);
            }
            if (response.data.message) {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error running to convergence:', error);
            alert('Error running to convergence.');
        }
    };

    const resetAlgorithm = async () => {
        setManualCenters([]);
        setIsManualMode(false);
        setIsInitialized(false); // Reset initialization state
        try {
            const response = await axios.post('http://127.0.0.1:5000/reset_algorithm');
            console.log('Reset Algorithm Response:', response.data);
            setImage(response.data.image);
        } catch (error) {
            console.error('Error resetting algorithm:', error);
        }
    };

    return (
        <div>
            <StyledTitle>K-Means Algorithm Visualization</StyledTitle>
            <Input k={k} setK={setK} />
            <DropDown method={method} setMethod={setMethod} />
            <StyledButton onClick={initializeCenters}>Initialize Centers</StyledButton>

            <Options
                onStep={stepThroughKMeans}
                onRun={runToConvergence}
                onGenerate={generateNewDataset}
                onReset={resetAlgorithm}
            />
            <PlotContainer>
                {image && <img src={`data:image/png;base64,${image}`} alt="K-Means Plot" onClick={(event) => selectCenter(event, k)} />
            }
            </PlotContainer>
        </div>
    );
};

export default KMeansPlot;

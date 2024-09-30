import React from 'react';
import styled from "styled-components";

const StyledButton = styled.button`
    background-color: cadetblue;
    padding: 1% 3%;
    border-radius: 8px;
    margin: 1% auto;
    color: white;
    border-color: white;

    &:hover {
        background-color: #4D7A7C;
    }
`

const StyledDiv = styled.div`
    margin: 0 14%;
    padding-top: 2%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

const Options = ({ onStep, onRun, onGenerate, onReset }) => {
    return (
        <StyledDiv>
            <StyledButton onClick={onStep}>Step Through KMeans</StyledButton>
            <StyledButton onClick={onRun}>Run to Convergence</StyledButton>
            <StyledButton onClick={onGenerate}>Generate New Dataset</StyledButton>
            <StyledButton onClick={onReset}>Reset Algorithm</StyledButton>
        </StyledDiv>
    );
};

export default Options;

import React from 'react';
import styled from "styled-components";

const StyledDiv = styled.div`
padding: 1%;
margin: 0 auto;
`
const StyledSelect = styled.select`
text-align: center;
display: block;
margin: 0 auto;
font-size: calc(0.75rem + 0.75rem);
`

const DropDown = ({ method, setMethod }) => {
    return (
        <StyledDiv>
            <StyledSelect value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="Random">Random</option>
                <option value="Farthest First">Farthest First</option>
                <option value="KMeans++">KMeans++</option>
                <option value="Manual">Manual</option>
            </StyledSelect>
        </StyledDiv>
    );
};

export default DropDown;

import React from 'react';
import styled from "styled-components";

const StyledDiv = styled.div`
padding: 1%;
margin: 0 auto;
text-align: center;
`

const StyledInput = styled.input`
    display: block;
    margin: 1% auto;
    
`

const Input = ({ k, setK }) => {
    return (
        <StyledDiv>
            <label>Enter a desired value for K: </label>
            <StyledInput
                type="number"
                value={k}
                onChange={(e) => setK(e.target.value)}
                placeholder="Enter the number of centers (k)"
            />
        </StyledDiv>
        
    );
};

export default Input;

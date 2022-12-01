import {Tooltip} from '../styles/LandingPopStyle';

export const LandingPop = (props) =>{
    return (
        <Tooltip className = {props.className}>
           <span className='tooltipText'> {props.text} </span>
        </Tooltip>
    )
}
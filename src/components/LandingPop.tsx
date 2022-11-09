import {Tooltip} from './LandingPopStyle';

export const LandingPop = (props) =>{
    return (
        <Tooltip className = {props.className}>
           <span className='tooltipText'> {props.text} </span>
        </Tooltip>
    )
}
import React from "react"
import styled from 'styled-components';
import webaMark from "../../public/ui/loading/webaMark.svg"

export const LoadingStyleBox = styled.div`
    position: absolute;
    z-index: 1000;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    display: flex;
    flex-direction :column;
    align-items: center;
    justify-content: center;
    user-select : none;
    overflow: hidden;
    background: ${props => props.backgroundActive && "black"};
    .loading-text {
        font-family: Proxima;
        font-style: normal;
        font-weight: 400;
        font-size: 18px;
        position: relative;
        top: -1em;
        line-height: 32px;
        text-align: center;
        color: #FFFFFF;
    }
    .vh-centered{
        position: absolute;        
        .cover-loadingbar{
            display: block;
            align-items: center;
            justify-content: start;
            width: 50vw;
            margin-left: auto;
            margin-right: auto;
            height: 14px;
            border: 2px solid  #645D8D;
            border-radius: 10px;
            
            .loading-bar{
                display: block;

                width : ${props => Math.round(props.loadedValue) + '%'};

                height: 7px;
                background-color: #FFFFFF;
                border-radius: 10px;
                transition:  width 1s;
                margin: 3.5px;
            }
        }
    }
    .logo-container {
        bottom: 0;
        position: absolute;

        .webamark {
            position : absolute;
            // center
            left: 50%;
            transform: translate(-50%, 0);
            width: 100px;
            
        }
        .logo-gradient {
            height: 20vh;
            width: 100vw;
            background:
              radial-gradient(49.5% 173.11% at 50.84% -79.89%, #95414E 30.36%, rgba(137, 61, 73, 0) 100%);
            display: flex;
            flex-direction: column;
            transform: rotate(-180deg);
            bottom: 0;
        }
    }

`

function CircularProgressWithLabel({background, value, title}) {
  return (
    <LoadingStyleBox
      className="loading-container"
      backgroundActive={background}
      loadedValue = {value}
    >
      <span className = "loading-text" >
        {title}
      </span>
        <div className="vh-centered">
          <div className="cover-loadingbar">
            <div className="loading-bar" >
            </div>
          </div>
        </div>
      <div className = "logo-container">
          <img className="webamark"
            src={webaMark}
          />
        <div className="logo-gradient"></div>
      </div>
    </LoadingStyleBox>
  )
}

export default function LoadingOverlayCircularStatic({
  loadingModelProgress,
  background = null,
  title = "Loading"
}) {
  return (
    <CircularProgressWithLabel
      value={loadingModelProgress}
      background={background}
      title = {title}
    />
  )
}

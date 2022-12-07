import styled from 'styled-components';

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
        line-height: 32px;
        text-align: center;
        color: #FFFFFF;
    }
    .vh-centered{
        position: relative;
        display: inline-flex;
        
        .cover-loadingbar{
            display: flex;
            align-items: center;
            justify-content: start;
            width: 237px;
            height: 14px;
            border: 2px solid  #645D8D;
            border-radius: 10px;
            
            .loading-bar{
                display: flex;
                align-items: center;
                justify-content: center;

                width : ${props => Math.round(props.loadedValue) + '%'};

                height: 6px;
                background-color: #FFFFFF;
                border-radius: 10px;
                transition:  width 1s;
                margin: 10px;
            }
        }
    }
    .logo-container {
        bottom: 0;
        position: absolute;

        .webamark {
            position : absolute;
            left : 50%;
            transform : translate(-50%, 30%);
            bottom : -10vh;
            height : 20vh;
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
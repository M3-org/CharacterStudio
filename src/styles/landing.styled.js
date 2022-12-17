import styled from "styled-components";

export const StyledLanding = styled.div `
    height: 100vh;
    background-size : cover;
    display : fixed;
    align-items : center;
    overflow : hidden;
    top:0;
    left:0;
    right:0;
    bottom:0;
    overflow: hidden;

    .topBanner {
        background : radial-gradient(49.5% 173.11% at 50.84% -79.89%, #95414E 30.36%, rgba(137, 61, 73, 0) 100%);
        width : 1377px;
        top : 0px;
        display : flex;
        flex-direction : column;
        animation: fadeIn 1s ease-in both;
        user-selector : none;
    
        .webaverse-text {
            width: calc(400vh * 0.118);
            height: calc(148.83vh * 0.118);
            display: inline-block;
            margin: 41px auto auto;
            userSelect : none
        }
    
        .studio { 
            color : #61E5F9;
            font-family : 'Proxima';
            font-style : normal; 
            font-weight : 800;
            font-size : calc(30vh * 0.118);
            line-height : calc(49vh * 0.118);
            text-align : center;
            margin-top : calc(12vh * 0.118);
        }
    }
    .subTitle{
        color : white;
        font-family : Proxima;
        font-style : normal;
        font-weight : 400;
        font-size : calc(30vh * 0.118);
        line-height : calc(49vh * 0.118);
        text-align : center;
        margin-top : calc(20vh * 0.118);
        animation: fadeIn 1s ease-in both;
        user-selector : none;
    
        .subTitle-text{
            font-weight : 1200;
            user-select : none;

            .subTitle-desc {
                font-size : calc(20vh * 0.118);
                line-height : calc(37vh * 0.118);
                font-style: normal;
                font-weight: 400;
            }
        }
    }

    .imgs{
        display : flex;
        user-select : none;                        
        margin-top: 30px;
        
        .characterGroup {
                animation-name : fadeleft;
                animation-duration: 0.5s;
                animation-timing-function: ease-in-out; 
                animation-fill-mode: both;
                user-selector : none;
                position: relative;
        }
    }
    
    @font-face {
        font-family: 'Proxima';
        src: url('./font/Proxima/Proxima.otf')  format("opentype");
      }
     
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate3d(0, -50%, 0);
        }
        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }
    
    @keyframes fadeleft {
        from {
            opacity: 0;
            transform: translate3d(-100%, 0, 0);
        }
        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }
    
    @keyframes fadeRight {
        from {
            opacity: 1;
            transform: skewX(-15deg);
            transform: translate3d(0%, 0, 0);
        }
        to {
            opacity: 0;
            transform: translate3d(1005, 0, 0);
            transform: skewX(-15deg);
        }
    }
`
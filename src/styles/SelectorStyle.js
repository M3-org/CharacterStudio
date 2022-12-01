import styled from 'styled-components';

export const SelectorContainerPos = styled.div`
    {   
        position: absolute;
        left: 215px;
        bottom: 93px;
        width: 528px;
        top: 164px;
    
        .selector-container{
            height: 614px;
            box-sizing: border-box;
            padding: 14px 0px 14px 32px !important;
            background: rgba(56; 64; 78; 0.1);
            backdrop-filter: blur(22.5px);
            border-bottom: 2px solid rgb(58; 116; 132);
            transform: perspective(400px) rotateY(5deg);
            border-radius : 10px;
            display: flex;
            flex-direction: column;
            user-select : none;

            .selector-container-header{
                height : 73px;
                border-bottom : 2px solid #3A7484;
                position : relative;
                display : flex;
                align-items: center;
                overflow : hidden;
                justify-content : space-between;

                .categoryTitle{
                    display : inline-block;
                    font-family: Proxima;
                    font-style: normal;
                    font-weight: 800;
                    font-size: 35px;
                    line-height: 91.3%;
                    color: #FFFFFF;
                    padding-left : 46px;
                    user-select : none;
                }

                .titleIcon{
                    width: 100px;
                    right : 0px;
                    top : 0px;
                }
            }
            
            .traitPanel{
                overflow-y : auto;
                flex : 1;
                height : 30%;
                top : 70%;
                Webkit-mask-image:-webkit-gradient(linear, 70% 80%, 70% 100%, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)));
                mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));

                .hair-sub-category{
                    display: flex;
                    gap: 20px;
                    padding : 24px 24px 24px;
                }
                .traits {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    padding: 24px;
                    .sub-category{

                        .sub-category-header{
                            display: flex;
                            gap: 20px;
                        }
                    }
                    .selectorButtonActive{
                        display: flex;
                        justify-content: center;
                        cursor: pointer;
                        width: 100%;
                        height: 134px;
                        background: rgba(81, 90, 116, 0.2);
                        backdrop-filter: blur(22.5px);
                        border-radius: 5px;
                        border-bottom  : 4px solid #61E5F9;
                        .icon{
                            max-width : auto;
                            height : 60%;
                            text-align: center;
                            margin:auto;
                        }
                    }
                    .selectorButton{
                        display: flex
                        justify-content: center;
                        cursor: pointer;
                        width: '100%',
                        height: 134px;
                        background: rgba(81, 90, 116, 0.2);
                        backdrop-filter: blur(22.5px);
                        border-radius: 5px;
                        .icon{
                            max-width : auto;
                            height : 60%;
                            text-align: center;
                            margin:auto;
                        }
                    }
                    .trait-icon{
                        max-width : auto;
                        height : 90%;
                        margin : auto;
                    }
                    .tickStyle{
                        width: 20%;
                        position: absolute;
                        right : -15px;
                        top : -15px;
                    }
                    .tickStyleInActive{
                        display : none;
                    }
                    .loading-trait{
                        height: 52px;
                        width: 52px;
                        text-align: center;
                        line-height: 52px;
                        background-color: rgba(16,16,16,0.6);
                        z-index: 2;
                        position: absolute;
                        color: #efefef;
                        left: 0;
                        top: 0;
                    }
                    .icon-hidden{
                        visibility: hidden;
                    }

                }
            }
            .loading-trait-overlay{
                position: fixed;
                left: 0;
                top: 0;
                width: 100%;
                height: 98%;
                backgroundColor: rgba(16,16,16,0.8);
                cursor: wait;
            }
            .loading-trait-overlay-show {
                display : none;
            }
        }
    }
`

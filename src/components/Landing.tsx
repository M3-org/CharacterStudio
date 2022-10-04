import { textAlign } from "@mui/system";

export default function Landing({
    onSetModel
    }){
    return <div style = {{
        background : `url("/background.png") no-repeat center center fixed`,
        height : "100vh",
        backgroundSize : 'cover',
        display : 'flex',
        flexDirection : 'column',
        alignItems : 'center'
    }
    }>
       <div style={{
        background : 'radial-gradient(49.5% 173.11% at 50.84% -79.89%, #95414E 30.36%, rgba(137, 61, 73, 0) 100%)',
        width : '1377px',
        top : '0px',
        display : 'flex',
        flexDirection : "column"
       }}>     
            <img 
                src={"/logo.png"} 
                style = {{
                    width: '505.7px',
                    height: '148.83px',
                    display: 'inline-block',
                    margin: '41px auto auto'
                }}
            />
            <div style={{
                color : "#61E5F9",
                fontFamily : 'Proxima',
                fontStyle : "normal",
                fontWeight : "800",
                fontSize : "40px",
                lineHeight : "49px",
                textAlign : "center",
                marginTop : '12px'
            }} >Character Studio</div>
        </div>
        <div style={{
            color : "white",
            fontFamily : 'Proxima',
            fontStyle : "normal",
            fontWeight : "400",
            fontSize : "32px",
            lineHeight : "39px",
            textAlign : "center",
            marginTop : '80px'
        }} >
            <div style={{
                lineHeight : "49px",
                fontWeight : '800',
                fontSize : '40px'
            }}>PICK A CLASS
                <div style={{
                    fontStyle: 'normal',
                    fontWeight: '400',
                    fontSize: '30px',
                    lineHeight: '37px'
                    }}> You'll be able to customzie in a moment 
                </div>
            </div>
        </div>
        <div 
            className="imgs"
            style={{
                display : 'flex',
                gap: '50px',
                marginTop: '30px',
            }}
        >
            <div style={{
                background: 'rgba(38, 38, 38, 0.25)',
                border: '2px solid #525073',
                backdropFilter: 'blur(22.5px)',
                width : '450px',
                height : '600px',
                display : 'flex',
                flexDirection : 'column',
                alignItems : 'center',
                boxSizing : 'borde-box',
                transform: 'skewX(-15deg)',
                borderRadius : '10px'
            }}>
                <span style={{
                  width : "238px",
                  height : "49px",
                  fontFamily : "Proxima",
                  fontStyle : "normal",
                  fontWeight : "800",
                  fontSize : "40px",
                  lineHeight : '49px',
                  color : "#61E5F9",
                  display : 'inline-block',
                  transform : 'skewX(15deg)',
                  marginTop: '40px'
                }}>Drophunter</span>
                <img
                    src={'/drophunter.png'}
                    style={{
                        position: 'absolute',
                        bottom: '0px',
                        transform : 'skewX(15deg)',
                    }}
                />
            </div>
            <div style={{
                background: 'rgba(38, 38, 38, 0.25)',
                border: '2px solid #525073',
                backdropFilter: 'blur(22.5px)',
                width : '450px',
                display : 'flex',
                flexDirection : 'column',
                alignItems : 'center',
                height : '600px',
                boxSizing : 'borde-box',
                transform: 'skewX(-15deg)',
                borderRadius : '10px',
                overflow : 'hidden'
            }}>
                <span style={{
                  width : "238px",
                  height : "49px",
                  fontFamily : "Proxima",
                  fontStyle : "normal",
                  fontWeight : "800",
                  fontSize : "40px",
                  lineHeight : '49px',
                  color : "#61E5F9",
                  display : 'inline-block',
                  transform : 'skewX(15deg)',
                  marginTop: '40px'
                }}>Neurohacker</span>
                <img
                    src={'/neurohacker.png'}
                    style={{
                        position: 'absolute',
                        bottom: '0px',
                        transform : 'skewX(15deg)',
                    }}
                />
            </div>
        </div>
    </div>
}
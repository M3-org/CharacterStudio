import React, { useState } from "react"

type PlugWalletProps = { onConnect?: (userPrincipal: string) => void, onFail?: (reason: string) => void, children?: React.ReactNode }

export function PlugWallet({ onConnect, onFail, children }: PlugWalletProps) {

  // The component will rerender whenever state variables change
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentBalance, setCurrentBalance] = useState();
  const [tokenName, setTokenName] = useState("");
  const [connected, setConnected] = useState(false);
  const [principal, setPrincipal] = useState();

  const getPlug = () => (window as any).ic?.plug;

  const grabBalance = async () => {
    const res = await getPlug().requestBalance();
    setCurrentBalance(res[0].amount);
    setTokenName(res[0].name);
  }

  const plugLogin = async () => {
    if (connected) return console.log("connected");
    const plug = getPlug();
    if (!plug) {
      const error = "Could not connect - Plug is not installed";
      return onFail ? onFail(error) : console.error(error);
    }
    const hasLoggedIn = await plug.isConnected();
    if (!hasLoggedIn) {
      await plug.requestConnect();
    } else {
      await plug.createAgent();
    }
    const userPrincipal = await plug.agent.getPrincipal();
    if (!userPrincipal) {
      const error = "Could not connect - User authentication failed";
      return onFail ? onFail(error) : console.error(error);
    }
    setPrincipal(userPrincipal.toString());
    setConnected(true);
    await grabBalance();
    if (onConnect) onConnect(userPrincipal)
  }

  const walletContainerStyle = {
    float: "left" as "left",
    margin: "10px",
    overflow: "hidden" as "hidden",
  }

  const plugMenu = {
    background: "none" as "none",
    border: "1px solid #ffcf40",
    borderRadius: "10px",
    fontSize: "14px",
    padding: "8px 10px",
    color: "lightgoldenrodyellow",
    cursor: "pointer" as "pointer",
    display: "flex" as "flex",
    flexDirection: "row" as "row",
    justifyContent: "center" as "center",
    alignItems: "center" as "center",
    hover: {
      backgroundColor: "rgba(255,255,255,0.1)"
    }
  }

  const plugSettings = {
    position: "absolute" as "absolute",
    backgroundColor: "#202020",
    minWidth: "160px",
    maxWidth: "180px",
    right: "10px",
    boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.6)",
    zIndex: "10"
  }

  const menuHeaderButton = {
    width: "80%",
    margin: "15px 10%",
    background: "none" as "none",
    border: "1px solid #ffcf40",
    borderRadius: "10px",
    fontSize: "12px",
    padding: "8px 10px",
    color: "lightgoldenrodyellow",
    cursor: "pointer" as "pointer",
    hover: {
      backgroundColor: "#303030",
    }
  }

  const menuHeaderButtonDisabled = {
    cursor: "default" as "default",
    background: "none" as "none",
    color: "silver",
    border: "1px solid rgba(255, 210, 67, 0.5)"
  }

  const menuHeaderH6 = {
    display: "block" as "block",
    padding: "0px 16px",
    height: "auto" as "auto",
    margin: "0px",
    color: "lightgoldenrodyellow"
  }

  const balance = {
    flexDirection: "row" as "row",
    alignItems: "center" as "center",
  }

  const menuDivider = {
    height: "1px",
    width: "100%",
    backgroundColor: "#353535"
  }

  const statusBubble = {
    height: "10px",
    width: "10px",
    border: "1px solid black",
    borderRadius: "360px",
    marginLeft: "6px",
    backgroundColor: "rgba(255,0,0,0.5)"
  }

  const statusBubbleConnected = {
    backgroundColor: "rgba(0,255,0,0.5)"
  }


  const menuBody = {
    float: "none" as "none",
    color: "#ffcf40",
    padding: "12px 16px",
    margin: "0px",
    textDecoration: "none" as "none",
    textAlign: "left" as "left",
    fontSize: "18px",
    display: "block" as "block",
    hover: {
      backgroundColor: "#303030",
      cursor: "pointer" as "pointer",
    }
  }

  const balanceText = {
      fontSize: "16px",
      color: "#e7e7e7",
      padding: "12px 16px",
      margin: "0px"
  }

  // HTML(UI) returns stay inside of the export function
  return (
    <>
      <div className="walletContainer" style={walletContainerStyle}>
        <button onClick={() => { console.log("Setting show dropdown"); setShowDropdown(!showDropdown) }} id='plugMenu' className='plugMenu' style={plugMenu}>
          Plug Menu
          <div className='statusBubble' id='statusBubble' style={connected ? { ...statusBubble, ...statusBubbleConnected } : statusBubble} ></div>
        </button>
        {showDropdown &&
          <div className='plugSettings' id='plugSettings' style={plugSettings}>
            <button onClick={() => { console.log("click"); plugLogin() }} id='connect' disabled={connected} style={connected ? menuHeaderButton : menuHeaderButtonDisabled}>{connected ? "Connected!" : "Connect"}</button>
            {connected && principal &&
              <>
                <div className='menuHeader' id='menuHeader'>
                  <h6 style={menuHeaderH6}>{principal ? "Logged In As:" + principal : "Not connected"}</h6>
                  <div className="balance" id='balance' style={balance}>
                    <p style={balanceText}>{currentBalance ? "Balance:" : "Getting current balance..."}</p>
                    {currentBalance && tokenName &&
                      <p style={{ color: 'rgba(0,255,0,0.5' }}>{currentBalance + " " + tokenName}</p>
                    }
                  </div>
                </div>
                <div className='menuBody' style={menuBody}>
                  {children}
                </div>
              </>
            }
          </div>
        }
      </div>
    </>
  )
}
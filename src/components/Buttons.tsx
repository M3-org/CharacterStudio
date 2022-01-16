/* eslint-disable no-prototype-builtins */
import React, { Component } from "react";
import ReactGA from "react-ga";
import PostForm from './PostForm';

// Loading Assets (SubComponents & CSS)
import "../css/buttons.css";

type State = any;

class Buttons extends Component<any, State> {
  constructor(props: any){
    super(props);
    this.state = {
      formVisible: false,
      accesstoken: ''
    }
  }

  updateVisible = (formVisible: any) => {
    this.setState({ formVisible });
  };

  componentDidMount() {
    // Google Analytics for the page
    ReactGA.initialize("UA-41837285-1");
  }

  render() {

    const redirectUri = (process.env.NODE_ENV==="development") ? 'http://localhost:3000' : 'https://www.myminifactory.com/character-creator/';
    const clientKey = (process.env.NODE_ENV==="development") ? 'customizerDev' : 'character-creator';

    const onSuccess = (response: any) => {
      console.log(response.access_token)
      this.setState({formVisible: true})
      this.setState({accesstoken: response.access_token})
    }
    const onFailure = (response: any) => console.error(response);


    return (
      <div>
        <div
          className="abs buttons"
          id="download"
          onClick={() => {
            //(window as any).export((this.props as any).characterName);
            (window as any).exportGLTF((this.props as any).characterName);

            for (const key in (this.props as any).loadedMeshes) {
              // check if the property/key is defined in the object itself, not in parent
              if ((this.props as any).loadedMeshes.hasOwnProperty(key)) {           
                  // console.log(key, this.props.loadedMeshes[key]);
              }
            }
          }}
        >
          Download gltf file
        </div>
        <PostForm
          visible={this.state.formVisible}
          updateVisible={this.updateVisible}
          accesstoken={this.state.accesstoken}
         />
      </div>
    );
  }
}

export default Buttons;

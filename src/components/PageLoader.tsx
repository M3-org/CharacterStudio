import React, { Component } from "react";
import "../css/loader.css";

type State = any;

class PageLoader extends Component<any, State> {
    check: any;

    constructor(props: any) {
        super(props);
        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        const element = document.querySelector<HTMLElement>(".graybackground")!;
        if (element !== null) {
            element.style.visibility = "hidden";
        }

        this.check = setInterval(() => {
            if ((window as any).loaded) {
                clearInterval(this.check)
                this.setState({ loading: false })
                return;
            }
        }, 1000);
    }


    render() {
        if (this.state.loading) {
            return (
                <div className="blackscreen abs top left">
                </div>
            );
        } else {
            return (
                <div />
            );
        }

    }
}
export default PageLoader;

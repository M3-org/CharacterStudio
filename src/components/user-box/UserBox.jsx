import React, {Fragment, useState, useEffect, useContext} from "react";
import classnames from "classnames";
import styles from "./UserBox.module.css";
import CustomButton from "../custom-button";

export const UserBox = ({className, setLoginFrom}) => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className={classnames(styles.userBoxWrap)}>
      <div className={styles.leftCorner} />
      <div className={styles.rightCorner} />
      <ul>
        <li>
          <CustomButton
            type="icon"
            theme="light"
            icon="backpack"
            size={32}
          />
        </li>
        <li>
          <CustomButton
            type="icon"
            theme="light"
            icon="tokens"
            size={32}
          />
        </li>
        <li>
          <CustomButton
            type="icon"
            theme="light"
            icon="map"
            size={32}
          />
        </li>
        <li>
          <CustomButton
            type="icon"
            theme="light"
            icon="settings"
            size={32}
          />
        </li>
        {!loggedIn && (
          <Fragment>
            <li>
              <div className={styles.loggedOutText}>
                Not
                <br />
                Logged In
              </div>
              <CustomButton
                type="login"
                theme="dark"
                icon="login"
                size={28}
                className={styles.loginButton}
              />
            </li>
          </Fragment>
        )}
        {loggedIn && (
          <Fragment>
            <li>
              <div className={styles.loggedInText}>
                <div className={styles.chainName}>Polygon</div>
                <div className={styles.walletAddress}>{ensName || address}</div>
              </div>
              <CustomButton
                type="login"
                theme="dark"
                icon="logout"
                size={28}
                className={styles.loginButton}
              />
            </li>
          </Fragment>
        )}
      </ul>
    </div>
  );
};
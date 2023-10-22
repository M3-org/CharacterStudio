import React from "react"
import styles from "./JsonAttributes.module.css"
import MenuTitle from "./MenuTitle"

export default function JsonAttributes({jsonSelection}){

    return (
        jsonSelection != null ? (
          <div className={styles["InformationContainerPos"]}>
            <MenuTitle title="TraitSelection" width={180} right={20} />
            <div className={styles["scrollContainer"]}>
              {jsonSelection.name && (
                <div style={{ textAlign: 'center'}}>
                  <div className={styles["traitInfoTitle"]}>
                    {jsonSelection.name}
                  </div>
                </div>
              )}
              {jsonSelection.thumb && (
                <img
                  src={jsonSelection.thumb}
                  alt="Selection Thumbnail"
                  style={{
                    width: '280px',
                    height: '460px',
                    display: 'block',
                    margin: '20px auto 20px',
                  }}
                />
              )}
              {jsonSelection.attributes.map((attribute) => (
                <div key={`json:${attribute.trait}_${attribute.name}`}>
                  <div className={styles["traitInfoText"]}>
                    {`${attribute.trait} : ${attribute.id}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (<></>)
      );
}
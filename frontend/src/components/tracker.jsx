import { useState } from 'react';
import QuadTimeline from '../assets/quad_timeline_narrow.svg';
import Checkmark from '../assets/checkmark_square.svg';
import "./tracker.css";

function Tracker() {

    const testData = [
        {
            id: 1,
            name: "Suggest",
            isChecked: 1
        }, 
        {
            id: 2,
            name: "Rank",
            isChecked: 1
        }, 
        {
            id: 3,
            name: "Vote",
            isChecked: 1
        }, 
        {
            id: 4,
            name: "Read",
            isChecked: 1
        }
    ]

    return (
        <div className="tracker-container">
            <img className="quad-timeline" src={QuadTimeline} />

            <div className="button-container">
            {Object.values(testData).map((value, index) => (
                <button name={value.name} 
                    key={index} 
                    className={`tracker-button`} 
                    onClick={() => alert(`${value.name} button clicked`)}
                ><div className="hover-text">{value.name}</div></button>
            ))}

            
                <div className="checkmark-holder">
                    {Object.values(testData.map((value, index) => (
                        <div className={`check display-${value.isChecked}`} key={index}>
                            <img className="checkmark" src={Checkmark} />
                        </div>
                    )))}

                </div>
            </div>
        </div>
    );


} export default Tracker;
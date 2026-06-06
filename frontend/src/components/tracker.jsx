import { useState, useEffect } from 'react';
import QuadTimeline from '../assets/quad_timeline_narrow.svg';
import Checkmark from '../assets/checkmark_square.svg';
import "./tracker.css";



function Tracker( {backendURL, trackerData, updateTracker} ) {


	const handleTrackerButton = async (name) => {


        const body = JSON.stringify({'name_to_check':name});
        console.log("button handler called for ", name);
		try {

			const response = await fetch(backendURL + 'tracker', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				'body': body
			});

			const output = await response.json();
			console.log(output['json_output']);

            updateTracker(output['json_output']);
            

			} catch (error) {
			console.log(error);
		}
	}

    console.log("trackerData", trackerData)
    console.log(trackerData.map((value) => (value.isChecked)));
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
            {Object.values(trackerData).map((value, index) => (
                <button name={value.name} 
                    key={value.id} 
                    className={`tracker-button`} 
                    onClick={() => handleTrackerButton(value.name)}
                ><div className="hover-text">{value.name}</div></button>
            ))}

            
                <div className="checkmark-holder">
                    {Object.values(trackerData.map((value, index) => (
                        <div className={`check display-${value.isChecked}`} key={value.id}>
                            <img className="checkmark" src={Checkmark} />
                        </div>
                    )))}

                </div>
            </div>
        </div>
    );


} export default Tracker;
import { useState, useEffect } from 'react';

import TableRow from '../components/TableRow';
import Help from '../components/help';

function Poll({backendURL}) {

    // declare variable to hold loading status
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isPollDataLoading, setIsPollDataLoading] = useState(true);

    // declare variable to hold data for poll
    const [ pollOptions, setPollOptions ] = useState([]);

    // declare variable to hold data post poll creation
    const [ pollData, setPollData ] = useState([]);

    const getData = async function () {
        console.log("Trying to load data...");
        if (pollOptions.length > 0) return;

        try {

            // call stored procedure to get popular books
            const response = await fetch(backendURL + 'poll', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });


            // convert response into JSON
            const rows = await response.json();
            const data_for_polls = await rows[0];
            // store data
            setPollOptions(data_for_polls);
            console.log(pollOptions);
            // flip isLoading
            setIsLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    const startNewPoll = async function () {
  
        console.log('Trying to call poll/create...');

        if (pollData.length > 0 ) return;
        

        try {

            // call stored procedure to get popular books
            const response = await fetch(backendURL + 'poll/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const rows = await response.json();
            await setPollData(rows['output']);
            await setIsPollDataLoading(false);


        } catch (error) {
            console.log(error);
        }
    }


    // load table on page load
    useEffect( () => {
        getData();
    }, []);

    
   //load poll
    useEffect( () => {
        startNewPoll();
    }, []);

    if (isLoading || !pollOptions || !pollData) {
        return (

            <>
                <div className="pageTitle">
                    <hr />
                    <h1>Vote for your favorite</h1>
                    <hr />
                </div>
                <div className="pollDescription">
                    <Help pageRole={"poll"} />

                    <div><h3>Loading...</h3></div>
                </div>

            </>
        )
    }

    return (
        <>
            <div className="pageTitle">
                <hr />
                <h1>Vote for your favorites</h1>
                <hr />
            </div>
            <div className="pollDescription">
                <Help pageRole={"poll"} />
                <div className="poll">
                   
                    <div className="PollItemsContainer">
                        {pollData.map((item, index) => (
                            <TableRow key={index} rowObject={item} backendURL={backendURL} />
                        ))}
                    </div>


                    {/* 3. Conditional rendering: Only add the element if post is not null */}
                    


                    <button onClick = {startNewPoll}>Start Poll</button>

                </div>
            </div>
        </>
    )

} export default Poll;
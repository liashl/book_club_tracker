import { useState, useEffect } from 'react';

import TableRow from '../components/TableRow';
import Help from '../components/help';

function Rank({ backendURL }) {

    // set up state variable to store backend response
    const [ suggs, setSuggs ] = useState([]);
    const [ data, setData ] = useState([]);

    const getData = async function () {
        console.log("trying to get data...");
        if (suggs.length > 0) return;
        try {
            // make a GET request to backend /rank route
            const response = await fetch(backendURL + 'rank');

            // convert response into JSON
            const rows = await response.json();

            setSuggs(rows[0]);


        } catch (error) {
            console.log(error);
        }

    };

    // load table on page load
    useEffect( () => {
        getData();
        console.log(suggs);

    }, []);

    return (
        <>
            <div className="pageTitle">
                <hr />
                <h1>Take a Look</h1>
                <hr />
            </div>
            <div className="rankDescription">
                <Help pageRole={"rank"} />
                
                    <table>


                    <tbody>
                    {suggs.map((sugg, index) => (
                        <TableRow key={index} rowObject={sugg} backendURL={backendURL} refreshPeople={getData}/>
                    ))}
                    </tbody>
                </table>





            </div>
        </>
    )
} export default Rank;
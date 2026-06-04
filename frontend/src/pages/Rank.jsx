import { useState, useEffect } from 'react';

import TableRow from '../components/TableRow';
import Help from '../components/help';
import DndTable from '../components/dndtable';
import SuggsList from '../components/suggs_list';


function Rank({ backendURL }) {

    // set up state variable to store backend response
    const [ suggs, setSuggs ] = useState([]);
    const [ data, setData ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ rowcount, setRowcount ] = useState();

    const getData = async function () {
        //console.log("trying to get data...");
        if (suggs.length > 0) return;

        try {
            // make a GET request to backend /rank route
            const response = await fetch(backendURL + 'rank');

            // convert response into JSON
            const rows = await response.json();

            setSuggs(rows[0]);
            setIsLoading(false);

            // to store original loaded order. This doesn't change after load
            setData(rows[0]);
            setRowcount(rows[0].length);

        } catch (error) {
            console.log(error);
        }
    };

    

    // load table on page load
    useEffect( () => {
        getData();

    }, []);

    if (isLoading || !suggs){
        return (
        <>
        
            <div className="pageTitle">
                <hr />
                <h1>Take a Look</h1>
                <hr />
            </div>
            <div className="rankDescription">
                <Help pageRole={"rank"} />

                <div><h3>Loading...</h3></div>

            </div>

        </>
        

    
    )
    }
    return (
        <>
            <div className="pageTitle">
                <hr />
                <h1>Take a Look</h1>
                <hr />
            </div>
            <div className="rankDescription">
                <Help pageRole={"rank"} />

                    <SuggsList suggs={suggs}/>

                <table>
                    <tbody>
                    {suggs.map((sugg, index) => (
                        <TableRow key={sugg.suggestionID} rowObject={sugg} backendURL={backendURL} refreshPeople={getData}/>
                    ))}
                    </tbody>
                </table>





            </div>
        </>
    )
} export default Rank;
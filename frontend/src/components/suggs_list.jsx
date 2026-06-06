import { useState, useEffect } from 'react';
import { DndContext, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import SuggsItem from './suggs_item.jsx';
import './suggs.css';





const dummyData = [
    {
        title: 'The Way of Kings', 
        author: 'Brandon Sanderson', 
        comment: 'Journey Before Destination', 
        id: "4", 
        map: "1"
    },
    {
        title: 'Words of Radiance',
        author: 'Brandon Sanderson',
        comment: 'I will protect those who cannot protect themselves',
        id: "3",
        map: "2"
    },
    {
        title: 'Oathbringer',
        author: 'Brandon Sanderson',
        comment: 'I will protect even those I hate, so long as it is right',
        id: "1",
        map: "3"
    },
    {
        title: 'Rhythm of War',
        author: 'Brandon Sanderson',
        comment: 'I accept that there are those I cannot protect',
        id: "5",
        map: "4"
    },
    {
        title: 'Wind and Truth',
        author: 'Brandon Sanderson',
        comment: 'I will protect myself so that I may continue to protect others',
        id: "2",
        map: "5"
    }

];

function SuggsList({suggs, backendURL}) {

    //console.log(suggs);
    // set data list with dummy data
    const [suggData, setSuggData] = useState(suggs); //dummyData
    //console.log(suggData);
    const listItems = suggData.map(sugg => <SuggsItem sugg={sugg} key={sugg.row} id={sugg.row}/>);

    // has data loaded to microservice yet? 
    const [rankerLoaded, setRankerLoaded] = useState(false); // begins false

    // load data into the ranker microservice
    const loadRanker = async (input_data) => {
        const response = await fetch(backendURL + 'ranker/create', { 
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(input_data)
        });

        const output = await response.json();
        return output;
    }

    /* fetch request: record item's new position */
    const moveRankings = async (oldIndex, newIndex) => {
        const response = await fetch(backendURL + 'ranker/move', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'start': oldIndex,
                'stop': newIndex,
            })
        });

        const output = await response;
        console.log(output);

    }

    const handleFinalOrder = async (e) => {
        e.preventDefault();

        // submit get request for changes
        const response = await fetch(backendURL + 'ranker/changes', {
            method: 'GET'
        });

        const changes = await response;
        const changes_json = await changes.json();
        console.log(changes_json);
    }

    useEffect( () => {
            if (!rankerLoaded) {
                setRankerLoaded(true);
                const checker = loadRanker(suggs);
            }
    
        }, []);

    const handleDragEnd = (event) => {
        const { active, over } = event;


        if (over && active.id != over.id) {
            setSuggData(items => {
                const oldIndex = items.findIndex(item => item.row === active.id); 
                const newIndex = items.findIndex(item => item.row === over.id); 

                moveRankings(oldIndex, newIndex);
                
                console.log(oldIndex);
                console.log(newIndex);
                return arrayMove(items, oldIndex, newIndex);
            })

        }
    }

    // citation: adapted from google search
    const sensors = useSensors(
    useSensor(TouchSensor, {
        activationConstraint: {
        delay: 250,
        tolerance: 5,
        },
    })
    );


    return (
        <div>
                <DndContext onDragEnd={handleDragEnd}>
                    <SortableContext items={suggData.map((item) => item.row) || []}>
                        <div className = "dnd_item" >{listItems}</div>
                    </SortableContext>
                    <div className="formItem">
                    <button onClick={handleFinalOrder}>Let My Opinion Be Known</button>
                    </div>
                </DndContext>

        </div>
    )

} export default SuggsList;
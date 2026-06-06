import { useState } from 'react';
import "./TableRow.css"

function TableRow({ rowObject, backendURL, refreshSuggestions }) {

    const [showVotes, setShowVotes] = useState(false);
    const [currentVotes, setCurrentVotes] = useState(rowObject['votes']);


    const overlayStyle = {
        width: "50%"
    }

    const hiddenStyle = {
        width: "0%"
    }

    const submitVote = async (answer) => {

        console.log('vote function called on frontend for', answer);
        const response = await fetch(backendURL + 'poll/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    myAnswer: answer
                })
            });

        const output = await response.json();
        console.log(output);
        setCurrentVotes(currentVotes+1);

    }

    return (
  
        <div className="pollItem">

                {Object.values(rowObject).map((value,index) => (
                    <span className={"suggestion".concat(index)} key={index}>{value}</span>
                ))}<span className="votes">{currentVotes}</span>

                <button name={rowObject['answer']} className={`voteButton voteButton-${rowObject['suggestionID']}`}
                        onClick={() => submitVote(rowObject['answer'])}></button>

                <div className="button-overlay" style={showVotes ? overlayStyle : hiddenStyle}></div>
        </div>
        
    );
}; 

export default TableRow;
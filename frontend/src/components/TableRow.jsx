import { useState } from 'react';
import "./TableRow.css"

function TableRow({ rowObject, backendURL, refreshSuggestions }) {

    const [showVotes, setShowVotes] = useState(true);

    const overlayStyle = {
        width: "40%"
    }

    const hiddenStyle = {
        width: "0%"
    }

    return (
  
        <div className="pollItem">

                {Object.values(rowObject).map((value,index) => (
                    <span className={"suggestion".concat(index)} key={index}>{value}</span>
                ))}

                <button name={rowObject['suggestionID']} className={`voteButton voteButton-${rowObject['suggestionID']}`}
                        onClick={() => alert(`${rowObject['suggestionID']} button clicked`)}></button>

                <div className="button-overlay" style={showVotes ? overlayStyle : hiddenStyle} ></div>
        </div>
        
    );
}; 

export default TableRow;
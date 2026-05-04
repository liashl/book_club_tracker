import "./TableRow.css"

function TableRow({ rowObject, backendURL, refreshSuggestions }) {


    return (

        <tr>
            {Object.values(rowObject).map((value,index) => (
                <td className={"suggestion".concat(index)} key={index}>{value}</td>
            ))}
        </tr>

    );
}; 

export default TableRow;
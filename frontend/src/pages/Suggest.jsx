import SuggestionForm from '../components/SuggestionForm';
import Help from '../components/help';
import Tracker from '../components/tracker';


function Suggest({backendURL} ) {




    return (
        <>
            <div className="pageTitle">
                <hr />
                <h1>Suggest a Book!</h1>
                <hr />
            </div>
            <div className="suggestDescription">
                <Help pageRole={"suggest"} />
                <SuggestionForm backendURL={backendURL} />
            </div>



        </>
    )
} export default Suggest;
import Help from '../components/help';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <>
            <div className="pageTitle">
                <hr />
                <h1>Dashboard</h1>
                <hr />
            </div>

            <div className="homepageDescription">
                <Help pageRole={"home"} />
                <div className="dashboardChunk">
                    <Link to="/suggest"><span>Suggest a Book!</span></Link>
                </div>
                <div className = "dashboardChunk">
                    <Link to="/rank"><span>See Suggestions</span></Link>
                </div>
            </div>
        </>
    )
} export default Home;
import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import './suggs.css';

function SuggsItem({sugg}) {

    // extract data members
    //console.log(sugg);


    const {title, author, blurb, suggestionID, row} = sugg;

    //console.log(title);
    //console.log(author);
    //console.log(blurb);
    //console.log(suggestionID);
    //console.log(row);

    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: row});

    // inline style for drag-and-drop
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className="sugg-wrapper"
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            >
            <div>
                <h5 className="title">{title}</h5>
                <h5 className="author">{author}</h5>
                <h5 className="comment">{blurb}</h5>
            </div>



        </div>
    );

} export default SuggsItem;
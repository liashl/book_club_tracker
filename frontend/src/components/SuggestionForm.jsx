import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./SuggestionForm.css";

function SuggestionForm({ backendURL} ) {

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        blurb: ''
    });

    let navigate= useNavigate();

    const [update, setUpdate] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        })); 

    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const confirm_checker = window.confirm("Are you sure you wan to submit?");

            if (! confirm_checker) {
                alert("No worries, take your time");
                return;
            }


            const response = await fetch(backendURL + 'suggest/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });


            if (response.ok) {
                alert("We received your suggestion!");
                setFormData({
                    title: '',
                    author: '',
                    blurb: '',
                });
                navigate('/rank');

            } else {
                console.error("Back end reports: Error creating suggestion")
            }
        } catch (error) {
            console.error('Error during form submission:', error);
        }
    };

    return (
        <form className='cuForm' onSubmit={handleSubmit}>
            <div className = "formContainer">

                <div className = "formItem">
                    <label htmlFor="title">
                        <div className="formLabel">Title</div>
                            <div className="formInput">
                            <textarea 
                                autoFocus="true"
                                placeholder="Suggest a title!"
                                name="title"
                                id="title"
                                type="text"
                                value={formData.tile}
                                rows={1}
                                maxLength={50}
                                onChange={handleChange}
                            />
                            </div>
                    </label>
                </div>
            
                <div className = "formItem">
                    <label htmlFor="author">
                        <div className="formLabel">Author</div>
                            <div className="formInput">
                            <textarea 
                                placeholder="Enter Author Name"
                                type="text"
                                name="author"
                                id="author"
                                value={formData.author}
                                rows={1}
                                maxLength={50}
                                onChange={handleChange}
                            />
                            </div>
                    </label>
                </div>

                <div className = "formItem">
                    <label htmlFor="blurb">
                        <div className="formLabel">Comment</div>
                            <div className="formInput">
                                <textarea
                                    placeholder="Share a few words"
                                    type="textarea"
                                    name="blurb"
                                    id="blurb"
                                    value={formData.blurb}
                                    rows={5}
                                    maxLength={255}
                                    minLength={10}
                                    onChange={handleChange}
                                />
                            </div>                            
                    </label>
                </div>

                <div className="formItem">

                    <button type="submit">I'm all finished</button>
                </div>

            </div>
        </form>
    );
} export default SuggestionForm;
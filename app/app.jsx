// app.jsx
// API URL to prepend to all AJAX calls

/*
    Person List Item
    Represents one item in the person list
    path - the shortest path from api call
    findExpert(person, subect) - finds the closest expert from that person to that subject
*/
class PersonListItem extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            path: []
        };
    }

    findExpert(person, subject, e) {
        var obj = {
            person: person._id,
            subject: subject._id
        };
        $.ajax({
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(obj),
            url: 'api/shortestPath',
            dataType: 'json',
            success: ((payload) => {
                this.setState({
                    path: payload
                });
            })
        })
    }

    render() {
        return (
            <li id={this.props.person._id} key={this.props.person._id}
                className="collection-item">
                 <span className="title teal-text text-darken-4">
                    <h5><strong>{this.props.person.name}</strong></h5>
                 </span>
                 <hr></hr>
                 <ul>
                     <li>
                        <h5 className="heading">Subjects</h5>
                     </li>
                 {
                    this.props.person.subjects.map((s) => {
                        return (<li key={s._id}>{ s.name }</li>)
                    })
                 }
                </ul>
                <ul>
                    <li>
                       <h5 className="heading">Friends</h5>
                    </li>
                {
                   this.props.person.friends.map((f) => {
                       return (<li key={f._id}>{ f.name }</li>)
                   })
                }
               </ul>
               <h5 className="heading">Find Expert</h5>
               <ul className='collection with-header'>
                   {
                        this.props.subjects.map((subject) => {
                            return (
                                <li className="collection-item" key={subject._id} >
                                    <div>{subject.name}
                                        <a onClick={this.findExpert.bind(this, this.props.person, subject)}
                                            href="javascript:;" className="secondary-content">
                                            <i className="material-icons right">search</i>
                                        </a>
                                    </div>
                                </li>
                           )
                       })
                   }
               </ul>
               <div class="col s12">
                   <div class="valign-wrapper">
                   {
                       this.state.path.map((person) => {
                           return (
                               <a key={person._id} href={"#" + person._id}
                                   className="breadcrumb teal-text text-darken-4">
                                   {person.name}
                               </a>
                           )
                       })
                   }
                   </div>
               </div>
            </li>
        )
    }
};

/*
    Person
    Represents the person list
*/
class Person extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                <ul className="collection with-header">
                {
                    this.props.data.map((person) => {
                        return (
                            <PersonListItem key={person._id}
                                subjects={this.props.subjects} person={person}/>
                        )
                    })
                }
                </ul>
            </div>
        )
    }
};

/*
    Subject
    Represents the subject list
*/
class Subject extends React.Component {
    render() {
        return (
            <div>
                <ul className="collection with-header">
                    {
                        this.props.subjects.map((subject) => {
                            return (
                                <li id={"#" + subject._id} key={subject._id}
                                    className="collection-item amber-text text-darken-4">
                                    {subject.name}
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        )
    }
};


class Modal extends React.Component {
    render() {
        return (
            <div id="modal" className="modal">
            <div className="modal-content">
              <h4>{this.props.title}</h4>
              <p>{this.props.message}</p>
            </div>
            <div className="modal-footer">
              <a href="javascript:;" className=" modal-action modal-close waves-effect waves-green btn">Got it!</a>
            </div>
        </div>
        )
    }
}
/*
    App
    Represents the app to render
    subjects - The list of subjects from API
    persons - The list of persons from API
    subjectName - The name of the NEW subect to add
    personName - The name of the NEW person to add
    addedUsers - The list of added friends for the NEW person
    addedSubjects - The list of added subjects for the NEW person
    error - The error message to show

    componentDidMount() - Initial calls to API
    componentWillUnmount() - In case calls don't go through

    submitPerson(event) - API call to add person
    submitSubject(event) - API call to add subject
    handleChange(event) - Handle input sanitizing for items

    addItem(item, event) - Add item to state
    removeITem(item, event) - Remove item from state

*/
class App extends React.Component {
    constructor() {
        super();
        this.state = {
            subjects: [],
            persons: [],
            subjectName: "",
            personName: "",
            addedUsers: [],
            addedSubjects: [],
            error: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.submitPerson = this.submitPerson.bind(this);
        this.submitSubject = this.submitSubject.bind(this);
    }

    componentDidMount() {
        this.serverRequest = $.get('/api/persons', ((payload1) => {
            this.setState({
                persons: payload1
            });
            this.serverRequest = $.get('/api/subjects', ((payload2) => {
                this.setState({
                    subjects: payload2
                });
            }).bind(this));
        }).bind(this));
    }

    componentWillUnmount() {
        this.serverRequest.abort();
    }

    submitPerson(e) {
        e.preventDefault();
        e.stopPropagation();
        var obj = {
            name: this.state.personName,
            friends: this.state.addedUsers,
            subjects: this.state.addedSubjects
        };
        if(this.state.personName.length > 0) {
            $.ajax({
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(obj),
                url: 'api/person',
                dataType: 'json',
                success: ((payload) => {
                    var arr = this.state.persons;
                    for (var x in this.state.addedUsers) {
                        for (var y in arr) {
                            if (this.state.persons[y]._id == this.state.addedUsers[x]._id) {
                                arr[y].friends.push(payload);
                            }
                        }
                    }
                    arr.push(payload);
                    this.setState({
                        personName: "",
                        persons: arr,
                        addedUsers: [],
                        addedSubjects: [],
                        error: ""
                    });
                    Materialize.toast('Added new person ' + payload.name, 4000)
                    $("#person").val("");
                }),
                error: ((payload) => {
                    this.setState({
                        error: payload.message
                    });
                    $('#modal').openModal();
                })
            })
        }
        else {
            this.setState({
                error: "Please enter a name for the person"
            });
            $('#modal').openModal();
        }
    }

    submitSubject(e) {
        e.preventDefault();
        e.stopPropagation();
        var obj = {
            name: this.state.subjectName
        };

        if(this.state.subjectName.length > 0) {
            $.ajax({
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(obj),
                url: 'api/subject',
                dataType: 'json',
                success: ((payload) => {
                    var arr = this.state.subjects;
                    arr.push(payload);
                    this.setState({
                        subjectName: "",
                        subjects: arr
                    });
                    Materialize.toast('Added new subject ' + payload.name, 4000)
                    $("#subject").val("");
                }),
                error: ((payload) => {
                    this.setState({
                        error: payload.message
                    });
                    $('#modal').openModal();
                })
            })
        }
        else {
            this.setState({
                error: "Please enter a name for the subject"
            });
            $('#modal').openModal();
        }
    }

    handleChange(e) {
        switch(e.target.id) {
            case "subject":
                this.setState({
                    subjectName: e.target.value.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"")
                });
                break;
            case "person":
                this.setState({
                    personName: e.target.value.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"")
                });
                break;
        }
    }

    addItem(item, event) {
        switch(event.target.id) {
            case "addPerson":
                if(this.state.addedUsers.indexOf(item) === -1) {
                    var arr = this.state.addedUsers;
                    arr.push(item);
                    this.setState({
                        addedUsers: arr
                    });
                }
                break;
            case "addSubject":
                if(this.state.addedSubjects.indexOf(item) === -1) {
                    var arr = this.state.addedSubjects;
                    arr.push(item);
                    this.setState({
                        addedSubjects: arr
                    });
                }
                break;
        }
    }

    removeItem(item, event) {
        switch(event.target.id) {
            case "removePerson":
                var arr = this.state.addedUsers;
                var i = arr.indexOf(item);
                if (i > -1) {
                    arr.splice(i, 1);
                    this.setState({
                        addedUsers: arr
                    });
                }
                break;
            case "removeSubject":
                var arr = this.state.addedSubjects;
                var i = arr.indexOf(item);
                if (i > -1) {
                    arr.splice(i, 1);
                    this.setState({
                        addedSubjects: arr
                    });
                }
                break;
        }
    }

    render() {
        return (
            <div className="container teal-text">
                <div className="row">
                    <div className="col m6">
                        <h6 className="valign-wrapper teal-text text-darken-4"><i className="material-icons pad-right">account_circle</i>Persons</h6>
                        <Person data={this.state.persons} subjects={this.state.subjects}/>
                        <div className="row collection-item" >
                            <form onSubmit={this.submitPerson} className="input-field col s12 ">
                                <input onChange={this.handleChange} placeholder="Add a new Person" id="person" type="text" class="validate"/>
                                <label for="first_name">Person Name</label>


                                <a className='dropdown-button btn margin-bottom' href="javascript:;" data-activates='dropdown1'><i className="material-icons left">add_circle</i>Add Friends</a>

                                <ul id='dropdown1' className='dropdown-content'>
                                    {
                                        this.state.persons.map((person) => {
                                            return (
                                                <li key={person._id} onClick={this.addItem.bind(this, person)}><a id="addPerson" href="javascript:;">{person.name}</a></li>
                                            )
                                        })
                                    }
                                </ul>
                                <br></br>
                                <div className="margin-bottom">
                                    {
                                        this.state.addedUsers.map((user) => {
                                            return (
                                                <div key={user._id} className="chip padding-right">
                                                    {user.name}
                                                    <i id="removePerson" onClick={this.removeItem.bind(this, user)} className="material-icons">close</i>
                                                </div>
                                            )
                                        })
                                    }
                                </div>

                                <a className='dropdown-button btn margin-bottom' href='#' data-activates='dropdown2'><i className="material-icons left">add_circle</i>Add Subjects</a>

                                <ul id='dropdown2' className='dropdown-content'>
                                    {
                                        this.state.subjects.map((subject) => {
                                            return (
                                                <li key={subject._id} onClick={this.addItem.bind(this, subject)}><a id="addSubject" href="javascript:;">{subject.name}</a></li>
                                            )
                                        })
                                    }
                                </ul>
                                <br></br>
                                <div className="margin-bottom">
                                    {
                                        this.state.addedSubjects.map((subject) => {
                                            return (
                                                <div key={subject._id} className="chip padding-right">
                                                    {subject.name}
                                                    <i id="removeSubject" onClick={this.removeItem.bind(this, subject)} className="material-icons">close</i>
                                                </div>
                                            )
                                        })
                                    }
                                </div>

                                <button type="submit" onClick={this.submitPerson} href="javascript:;" className="waves-effect waves-light btn teal ">Submit</button>
                            </form>
                        </div>
                    </div>
                    <div className="col m6">
                        <h6 className="valign-wrapper amber-text text-darken-4"><i className="material-icons pad-right">cloud_circle</i>Subjects</h6>
                        <Subject subjects={this.state.subjects}/>
                        <div className="collection-item" >
                            <form onSubmit={this.submitSubject} className="input-field col s12">
                                <input onChange={this.handleChange} placeholder="Add a new subject" id="subject" type="text" className="validate"/>
                                <label for="first_name">Subject Name</label>
                                <button type="submit" className="btn waves-effect waves-light amber darken-4" onClick={this.submitSubject}>
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
                <Modal title={'Error'} message={this.state.error}/>
            </div>
        )
    }
};

ReactDOM.render(
  <App/>,
  document.getElementById("main")
);
